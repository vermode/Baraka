import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  donationsTable,
  usersTable,
  organizationsTable,
  beneficiariesTable,
  notificationsTable,
} from "../db";
import {
  CreateDonationBody,
  LinkDonationHelpRequestBody,
  LinkDonationHelpRequestParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { generateOtp } from "../lib/otp";

const router: IRouter = Router();

const donationColumns = {
  id: donationsTable.id,
  donorId: donationsTable.donorId,
  donorName: usersTable.name,
  organizationId: donationsTable.organizationId,
  organizationName: organizationsTable.name,
  beneficiaryId: donationsTable.beneficiaryId,
  helpRequestId: donationsTable.helpRequestId,
  amount: donationsTable.amount,
  message: donationsTable.message,
  donationType: donationsTable.donationType,
  paymentMethod: donationsTable.paymentMethod,
  walletProvider: donationsTable.walletProvider,
  walletPhone: donationsTable.walletPhone,
  cardLast4: donationsTable.cardLast4,
  cardName: donationsTable.cardName,
  itemDetails: donationsTable.itemDetails,
  otp: donationsTable.otp,
  deliveredConfirmed: donationsTable.deliveredConfirmed,
  deliveredConfirmedAt: donationsTable.deliveredConfirmedAt,
  createdAt: donationsTable.createdAt,
};

router.get("/donations", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select(donationColumns)
    .from(donationsTable)
    .leftJoin(usersTable, eq(donationsTable.donorId, usersTable.id))
    .leftJoin(organizationsTable, eq(donationsTable.organizationId, organizationsTable.id))
    .orderBy(desc(donationsTable.createdAt));
  res.json(rows);
});

router.get("/donations/me", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select(donationColumns)
    .from(donationsTable)
    .leftJoin(usersTable, eq(donationsTable.donorId, usersTable.id))
    .leftJoin(organizationsTable, eq(donationsTable.organizationId, organizationsTable.id))
    .where(eq(donationsTable.donorId, req.user!.id))
    .orderBy(desc(donationsTable.createdAt));
  res.json(rows);
});

router.post("/donations", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  // Cross-field validation
  if (data.donationType === "money") {
    if (!data.paymentMethod) {
      res.status(400).json({ error: "paymentMethod is required for money donations" });
      return;
    }
    if (data.amount <= 0) {
      res.status(400).json({ error: "amount must be > 0 for money donations" });
      return;
    }
    if (data.paymentMethod === "wallet" && !data.walletProvider) {
      res.status(400).json({ error: "walletProvider is required for wallet payments" });
      return;
    }
  } else {
    // Non-monetary donation — require itemDetails
    if (!data.itemDetails || data.itemDetails.trim().length < 3) {
      res
        .status(400)
        .json({ error: "itemDetails is required for non-monetary donations" });
      return;
    }
  }

  const { donation, orgName } = await db.transaction(async (tx) => {
    const [{ id: newId }] = await tx
      .insert(donationsTable)
      .values({
        donorId: req.user!.id,
        amount: data.amount,
        organizationId: data.organizationId ?? null,
        beneficiaryId: data.beneficiaryId ?? null,
        helpRequestId: data.helpRequestId ?? null,
        message: data.message ?? null,
        donationType: data.donationType,
        paymentMethod: data.paymentMethod ?? null,
        walletProvider: data.walletProvider ?? null,
        walletPhone: data.walletPhone ?? null,
        cardLast4: data.cardLast4 ?? null,
        cardName: data.cardName ?? null,
        itemDetails: data.itemDetails ?? null,
        otp: generateOtp(),
      })
      .$returningId();
    const [donation] = await tx
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.id, newId));

    // Only money donations roll up to beneficiary raisedAmount
    if (donation.beneficiaryId != null && donation.donationType === "money") {
      await tx
        .update(beneficiariesTable)
        .set({
          raisedAmount: sql`${beneficiariesTable.raisedAmount} + ${donation.amount}`,
        })
        .where(eq(beneficiariesTable.id, donation.beneficiaryId));
    }

    let orgName: string | null = null;
    if (donation.organizationId != null) {
      const [org] = await tx
        .select({ name: organizationsTable.name })
        .from(organizationsTable)
        .where(eq(organizationsTable.id, donation.organizationId));
      orgName = org?.name ?? null;
    }

    const bodyText =
      donation.donationType === "money"
        ? `تم استلام تبرعك بمبلغ ${donation.amount} دينار${orgName ? ` لصالح ${orgName}` : ""}. رمز التتبع: ${donation.otp}`
        : `تم استلام تبرعك العيني${orgName ? ` لصالح ${orgName}` : ""}، سنتواصل معك قريباً. رمز التتبع: ${donation.otp}`;

    await tx.insert(notificationsTable).values({
      userId: req.user!.id,
      title: "شكراً لتبرعك",
      body: bodyText,
    });

    return { donation, orgName };
  });

  res.status(201).json({
    id: donation.id,
    donorId: donation.donorId,
    donorName: req.user!.name,
    organizationId: donation.organizationId,
    organizationName: orgName,
    beneficiaryId: donation.beneficiaryId,
    helpRequestId: donation.helpRequestId,
    amount: donation.amount,
    message: donation.message,
    donationType: donation.donationType,
    paymentMethod: donation.paymentMethod,
    walletProvider: donation.walletProvider,
    walletPhone: donation.walletPhone,
    cardLast4: donation.cardLast4,
    cardName: donation.cardName,
    itemDetails: donation.itemDetails,
    otp: donation.otp,
    deliveredConfirmed: donation.deliveredConfirmed,
    deliveredConfirmedAt: donation.deliveredConfirmedAt,
    createdAt: donation.createdAt,
  });
});

// Admin links an existing donation to a help request.
router.patch(
  "/donations/:id/link-help-request",
  requireAdmin,
  async (req, res): Promise<void> => {
    const p = LinkDonationHelpRequestParams.safeParse(req.params);
    const b = LinkDonationHelpRequestBody.safeParse(req.body);
    if (!p.success || !b.success) {
      res.status(400).json({ error: (p.success ? b : p).error!.message });
      return;
    }
    const [donation] = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.id, p.data.id));
    if (!donation) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }
    await db
      .update(donationsTable)
      .set({ helpRequestId: b.data.helpRequestId })
      .where(eq(donationsTable.id, p.data.id));
    const [row] = await db
      .select(donationColumns)
      .from(donationsTable)
      .leftJoin(usersTable, eq(donationsTable.donorId, usersTable.id))
      .leftJoin(
        organizationsTable,
        eq(donationsTable.organizationId, organizationsTable.id),
      )
      .where(eq(donationsTable.id, p.data.id));
    res.json(row);
  },
);

export default router;
