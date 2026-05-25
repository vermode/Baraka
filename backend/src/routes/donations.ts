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
import { CreateDonationBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

const donationColumns = {
  id: donationsTable.id,
  donorId: donationsTable.donorId,
  donorName: usersTable.name,
  organizationId: donationsTable.organizationId,
  organizationName: organizationsTable.name,
  beneficiaryId: donationsTable.beneficiaryId,
  amount: donationsTable.amount,
  message: donationsTable.message,
  donationType: donationsTable.donationType,
  paymentMethod: donationsTable.paymentMethod,
  walletProvider: donationsTable.walletProvider,
  walletPhone: donationsTable.walletPhone,
  cardLast4: donationsTable.cardLast4,
  cardName: donationsTable.cardName,
  itemDetails: donationsTable.itemDetails,
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
        message: data.message ?? null,
        donationType: data.donationType,
        paymentMethod: data.paymentMethod ?? null,
        walletProvider: data.walletProvider ?? null,
        walletPhone: data.walletPhone ?? null,
        cardLast4: data.cardLast4 ?? null,
        cardName: data.cardName ?? null,
        itemDetails: data.itemDetails ?? null,
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
        ? `تم استلام تبرعك بمبلغ ${donation.amount} دينار${orgName ? ` لصالح ${orgName}` : ""}.`
        : `تم استلام تبرعك العيني${orgName ? ` لصالح ${orgName}` : ""}، سنتواصل معك قريباً.`;

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
    amount: donation.amount,
    message: donation.message,
    donationType: donation.donationType,
    paymentMethod: donation.paymentMethod,
    walletProvider: donation.walletProvider,
    walletPhone: donation.walletPhone,
    cardLast4: donation.cardLast4,
    cardName: donation.cardName,
    itemDetails: donation.itemDetails,
    createdAt: donation.createdAt,
  });
});

export default router;
