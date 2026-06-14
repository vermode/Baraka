import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  HandCoins,
  LifeBuoy,
  KeyRound,
  CheckCircle2,
  Clock,
  Search,
  PackageCheck,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifyError, notifySuccess } from "@/lib/errors";
import {
  useTrackDonation,
  useTrackHelpRequest,
  useConfirmDonationReceived,
  getTrackHelpRequestQueryKey,
} from "@workspace/api-client-react";

type Mode = "donation" | "request";

const OTP_RE = /^[0-9]{4,8}$/;

export default function Track() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const search = useSearch();
  const qc = useQueryClient();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialMode: Mode = params.get("type") === "request" ? "request" : "donation";
  const initialOtp = params.get("otp") ?? "";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [input, setInput] = useState(initialOtp);
  // The OTP actually being tracked (set on submit), per mode.
  const [donationOtp, setDonationOtp] = useState(initialMode === "donation" ? initialOtp : "");
  const [requestOtp, setRequestOtp] = useState(initialMode === "request" ? initialOtp : "");

  const activeOtp = mode === "donation" ? donationOtp : requestOtp;
  const enabled = OTP_RE.test(activeOtp);

  const donation = useTrackDonation(donationOtp, {
    query: {
      enabled: mode === "donation" && OTP_RE.test(donationOtp),
      refetchInterval: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
    } as never,
  });
  const request = useTrackHelpRequest(requestOtp, {
    query: {
      enabled: mode === "request" && OTP_RE.test(requestOtp),
      refetchInterval: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
    } as never,
  });
  const confirm = useConfirmDonationReceived();

  function submit() {
    const otp = input.trim();
    if (!OTP_RE.test(otp)) {
      notifyError(
        new Error(isAr ? "أدخل رمز تتبع صحيحاً" : "Enter a valid tracking code"),
        lang,
      );
      return;
    }
    if (mode === "donation") setDonationOtp(otp);
    else setRequestOtp(otp);
  }

  async function confirmReceived(donationId: number) {
    try {
      const updated = await confirm.mutateAsync({
        otp: requestOtp,
        data: { donationId },
      });
      qc.setQueryData(getTrackHelpRequestQueryKey(requestOtp), updated);
      notifySuccess(isAr ? "تم تأكيد الاستلام" : "Receipt confirmed");
    } catch (err) {
      notifyError(err, lang);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setInput(next === "donation" ? donationOtp : requestOtp);
  }

  const isLoading = mode === "donation" ? donation.isFetching : request.isFetching;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex w-14 h-14 rounded-full bg-primary/10 text-primary items-center justify-center mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            {isAr ? "تتبع عبر الرمز" : "Track with your code"}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {isAr
              ? "أدخل رمز التتبع لمتابعة حالة تبرعك أو تأكيد استلام المساعدة."
              : "Enter your tracking code to follow your donation, or to confirm you received help."}
          </p>
        </motion.div>

        {/* Mode switch */}
        <div className="flex gap-2 p-1 rounded-full bg-muted/50 w-fit mx-auto mb-6">
          <button
            onClick={() => switchMode("donation")}
            data-testid="track-tab-donation"
            className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${mode === "donation" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <HandCoins className="h-4 w-4" />
            {isAr ? "تتبع تبرعي" : "Track my donation"}
          </button>
          <button
            onClick={() => switchMode("request")}
            data-testid="track-tab-request"
            className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${mode === "request" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LifeBuoy className="h-4 w-4" />
            {isAr ? "تتبع طلبي" : "Track my request"}
          </button>
        </div>

        {/* OTP input */}
        <div className="flex gap-2 max-w-md mx-auto mb-8">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 8))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            inputMode="numeric"
            placeholder={isAr ? "رمز التتبع" : "Tracking code"}
            className="h-12 text-center font-mono tracking-widest text-lg"
            data-testid="track-otp-input"
            aria-label={isAr ? "رمز التتبع" : "Tracking code"}
          />
          <Button onClick={submit} className="h-12 px-5 gap-1.5" data-testid="track-submit">
            <Search className="h-4 w-4" />
            {isAr ? "تتبع" : "Track"}
          </Button>
        </div>

        {/* Results */}
        {enabled && isLoading && (
          <div className="text-center text-muted-foreground text-sm py-8">
            {isAr ? "جارٍ التحميل..." : "Loading..."}
          </div>
        )}

        {mode === "donation" && donation.isError && (
          <ErrorCard text={isAr ? "لا يوجد تبرع بهذا الرمز" : "No donation found for that code"} />
        )}
        {mode === "request" && request.isError && (
          <ErrorCard text={isAr ? "لا يوجد طلب بهذا الرمز" : "No request found for that code"} />
        )}

        {/* Donor read-only donation status */}
        {mode === "donation" && donation.data && (
          <div className="rounded-2xl border border-border bg-card p-6 max-w-md mx-auto" data-testid="donation-status">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">{isAr ? "المستفيد" : "Recipient"}</div>
                <div className="font-bold">
                  {donation.data.organizationName ?? donation.data.helpRequestName ?? (isAr ? "تبرع عام" : "General donation")}
                </div>
              </div>
              <div className="text-end">
                <div className="text-sm text-muted-foreground">{isAr ? "المبلغ" : "Amount"}</div>
                <div className="font-bold text-primary">
                  {donation.data.donationType === "money"
                    ? `${donation.data.amount} ${isAr ? "د.أ" : "JOD"}`
                    : (isAr ? "تبرع عيني" : "In-kind")}
                </div>
              </div>
            </div>
            <StatusPill confirmed={donation.data.deliveredConfirmed} isAr={isAr} />
            <p className="text-xs text-muted-foreground mt-4">
              {donation.data.deliveredConfirmed
                ? isAr
                  ? `أكّد المستفيد الاستلام في ${donation.data.deliveredConfirmedAt ? new Date(donation.data.deliveredConfirmedAt).toLocaleDateString("ar") : ""}`
                  : `The recipient confirmed receipt${donation.data.deliveredConfirmedAt ? ` on ${new Date(donation.data.deliveredConfirmedAt).toLocaleDateString("en")}` : ""}.`
                : isAr
                  ? "بانتظار تأكيد المستفيد لاستلام تبرعك."
                  : "Waiting for the recipient to confirm they received your donation."}
            </p>
          </div>
        )}

        {/* Receiver request view + confirm */}
        {mode === "request" && request.data && (
          <div className="space-y-4 max-w-xl mx-auto" data-testid="request-status">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg mb-1">{request.data.name}</h2>
              <p className="text-sm text-muted-foreground">{request.data.description}</p>
            </div>
            <h3 className="font-bold text-sm px-1">
              {isAr ? "التبرعات لطلبك" : "Donations to your request"}
            </h3>
            {request.data.donations.length === 0 && (
              <ErrorCard text={isAr ? "لا توجد تبرعات بعد" : "No donations yet"} muted />
            )}
            {request.data.donations.map((d) => (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3" data-testid={`tracked-donation-${d.id}`}>
                <div className="min-w-0">
                  <div className="font-semibold">
                    {d.donationType === "money" ? `${d.amount} ${isAr ? "د.أ" : "JOD"}` : (isAr ? "تبرع عيني" : "In-kind donation")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.donorName ?? (isAr ? "متبرع" : "Donor")} · {new Date(d.createdAt).toLocaleDateString(isAr ? "ar" : "en")}
                  </div>
                </div>
                {d.deliveredConfirmed ? (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    {isAr ? "تم الاستلام" : "Received"}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="shrink-0 gap-1.5"
                    disabled={confirm.isPending}
                    onClick={() => confirmReceived(d.id)}
                    data-testid={`btn-confirm-received-${d.id}`}
                  >
                    <PackageCheck className="h-4 w-4" />
                    {isAr ? "تأكيد الاستلام" : "Confirm receipt"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function StatusPill({ confirmed, isAr }: { confirmed: boolean; isAr: boolean }) {
  return confirmed ? (
    <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 text-green-600 px-4 py-2 font-semibold text-sm">
      <CheckCircle2 className="h-5 w-5" />
      {isAr ? "تم تأكيد الاستلام" : "Delivery confirmed"}
    </div>
  ) : (
    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 text-amber-600 px-4 py-2 font-semibold text-sm">
      <Clock className="h-5 w-5" />
      {isAr ? "قيد التوصيل" : "Pending delivery"}
    </div>
  );
}

function ErrorCard({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div className={`rounded-2xl border ${muted ? "border-border" : "border-destructive/30"} bg-card p-6 text-center text-sm ${muted ? "text-muted-foreground" : "text-destructive"} max-w-md mx-auto`}>
      {text}
    </div>
  );
}
