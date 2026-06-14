import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  donationsTable,
  helpRequestsTable,
  organizationsTable,
  usersTable,
} from "../db";
import { ConfirmDonationReceivedBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Tracking codes are numeric capability tokens carried in the URL. Validate the
// shape before hitting the DB so malformed codes are cheaply rejected.
const OTP_RE = /^[0-9]{4,8}$/;

/** Build the public tracking view for a help request and its linked donations. */
async function loadHelpRequestTracking(otp: string) {
  const [hr] = await db
    .select()
    .from(helpRequestsTable)
    .where(eq(helpRequestsTable.otp, otp));
  if (!hr) return null;

  const donations = await db
    .select({
      id: donationsTable.id,
      donorName: usersTable.name,
      amount: donationsTable.amount,
      donationType: donationsTable.donationType,
      message: donationsTable.message,
      deliveredConfirmed: donationsTable.deliveredConfirmed,
      deliveredConfirmedAt: donationsTable.deliveredConfirmedAt,
      createdAt: donationsTable.createdAt,
    })
    .from(donationsTable)
    .leftJoin(usersTable, eq(donationsTable.donorId, usersTable.id))
    .where(eq(donationsTable.helpRequestId, hr.id))
    .orderBy(desc(donationsTable.createdAt));

  return {
    id: hr.id,
    name: hr.name,
    governorate: hr.governorate,
    aidType: hr.aidType,
    description: hr.description,
    status: hr.status,
    createdAt: hr.createdAt,
    donations,
  };
}

// Donor read-only view: status of a single donation by its tracking code.
router.get("/track/donations/:otp", async (req, res): Promise<void> => {
  const otp = String(req.params.otp ?? "");
  if (!OTP_RE.test(otp)) {
    res.status(400).json({ error: "Invalid tracking code" });
    return;
  }
  const [row] = await db
    .select({
      id: donationsTable.id,
      amount: donationsTable.amount,
      donationType: donationsTable.donationType,
      message: donationsTable.message,
      organizationName: organizationsTable.name,
      helpRequestId: donationsTable.helpRequestId,
      helpRequestName: helpRequestsTable.name,
      deliveredConfirmed: donationsTable.deliveredConfirmed,
      deliveredConfirmedAt: donationsTable.deliveredConfirmedAt,
      createdAt: donationsTable.createdAt,
    })
    .from(donationsTable)
    .leftJoin(
      organizationsTable,
      eq(donationsTable.organizationId, organizationsTable.id),
    )
    .leftJoin(
      helpRequestsTable,
      eq(donationsTable.helpRequestId, helpRequestsTable.id),
    )
    .where(eq(donationsTable.otp, otp));

  if (!row) {
    res.status(404).json({ error: "No donation found for that code" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(row);
});

// Receiver view: a help request plus every donation made toward it.
router.get("/track/help-requests/:otp", async (req, res): Promise<void> => {
  const otp = String(req.params.otp ?? "");
  if (!OTP_RE.test(otp)) {
    res.status(400).json({ error: "Invalid tracking code" });
    return;
  }
  const tracking = await loadHelpRequestTracking(otp);
  if (!tracking) {
    res.status(404).json({ error: "No request found for that code" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(tracking);
});

// Receiver confirms (via their request OTP) that a specific donation arrived.
router.post(
  "/track/help-requests/:otp/confirm-delivery",
  async (req, res): Promise<void> => {
    const otp = String(req.params.otp ?? "");
    const b = ConfirmDonationReceivedBody.safeParse(req.body);
    if (!OTP_RE.test(otp) || !b.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [hr] = await db
      .select()
      .from(helpRequestsTable)
      .where(eq(helpRequestsTable.otp, otp));
    if (!hr) {
      res.status(404).json({ error: "No request found for that code" });
      return;
    }
    // The donation must belong to this request before it can be confirmed.
    const [donation] = await db
      .select()
      .from(donationsTable)
      .where(
        and(
          eq(donationsTable.id, b.data.donationId),
          eq(donationsTable.helpRequestId, hr.id),
        ),
      );
    if (!donation) {
      res.status(404).json({ error: "Donation is not linked to this request" });
      return;
    }
    await db
      .update(donationsTable)
      .set({ deliveredConfirmed: true, deliveredConfirmedAt: new Date() })
      .where(eq(donationsTable.id, donation.id));

    const tracking = await loadHelpRequestTracking(otp);
    res.setHeader("Cache-Control", "no-store");
    res.json(tracking);
  },
);

export default router;
