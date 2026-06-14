import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError, notifySuccess } from "@/lib/errors";
import { ArrowLeft, ArrowRight, HandCoins, Heart } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useCreateDonation,
  getListNotificationsQueryKey,
  getListMyDonationsQueryKey,
  getGetStatsQueryKey,
  type Organization,
} from "@workspace/api-client-react";

import { PaymentStep } from "./donate/PaymentStep";
import { DetailsStep } from "./donate/DetailsStep";
import { Stepper } from "./donate/Stepper";
import type {
  DonationType,
  PaymentMethod,
  WalletProvider,
} from "./donate/types";

interface Props {
  /** Donation target: an organization OR an approved help request. */
  org?: Organization;
  helpRequest?: { id: number; name: string };
  /** Custom trigger element. Falls back to a default "Donate" button. */
  trigger?: React.ReactNode;
}

/**
 * Two-step donation flow rendered inside a dialog.
 *   Step 1: pick payment method (card / wallet / cash).
 *   Step 2: pick donation type (money / food / clothes / other) and fill details.
 *
 * The step UIs live in `./donate/`; this component owns the form state and
 * the mutation that posts the donation to the API.
 */
export function DonateDialog({ org, helpRequest, trigger }: Props) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const qc = useQueryClient();
  const mutation = useCreateDonation();
  const targetName = org?.name ?? helpRequest?.name ?? "";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — payment method (only relevant when donation type is "money")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [walletProvider, setWalletProvider] = useState<WalletProvider>("zain");
  const [walletPhone, setWalletPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  // Step 2 — donation type + details
  const [donationType, setDonationType] = useState<DonationType>("money");
  const [amount, setAmount] = useState(20);
  const [itemDetails, setItemDetails] = useState("");
  const [message, setMessage] = useState("");

  function reset() {
    setStep(1);
    setPaymentMethod("card");
    setWalletProvider("zain");
    setWalletPhone("");
    setCardName("");
    setCardNumber("");
    setDonationType("money");
    setAmount(20);
    setItemDetails("");
    setMessage("");
  }

  /** Validates step 1 inputs. Returns a localised error message, or null when OK. */
  function validateStep1(): string | null {
    if (paymentMethod === "wallet" && walletPhone.trim().length < 7) {
      return isAr ? "أدخل رقم محفظة صحيح" : "Enter a valid wallet phone";
    }
    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length > 0 && digits.length < 12) {
        return isAr ? "رقم البطاقة غير صحيح" : "Card number is invalid";
      }
    }
    return null;
  }

  function handleNext() {
    const err = validateStep1();
    if (err) {
      toast.error(err);
      return;
    }
    setStep(2);
  }

  async function submit() {
    if (donationType === "money" && amount <= 0) {
      toast.error(isAr ? "أدخل مبلغاً صحيحاً" : "Enter a valid amount");
      return;
    }
    if (donationType !== "money" && itemDetails.trim().length < 3) {
      toast.error(
        isAr ? "اكتب تفاصيل التبرع العيني" : "Describe your in-kind donation",
      );
      return;
    }

    const isMoney = donationType === "money";
    const digits = cardNumber.replace(/\D/g, "");
    const cardLast4 =
      isMoney && paymentMethod === "card" && digits.length >= 4
        ? digits.slice(-4)
        : undefined;

    try {
      const result = await mutation.mutateAsync({
        data: {
          organizationId: org?.id,
          helpRequestId: helpRequest?.id,
          amount: isMoney ? amount : 0,
          message: message || undefined,
          donationType,
          paymentMethod: isMoney ? paymentMethod : undefined,
          walletProvider:
            isMoney && paymentMethod === "wallet" ? walletProvider : undefined,
          walletPhone:
            isMoney && paymentMethod === "wallet" ? walletPhone : undefined,
          cardLast4,
          cardName:
            isMoney && paymentMethod === "card" && cardName ? cardName : undefined,
          itemDetails: !isMoney ? itemDetails : undefined,
        },
      });

      const otpNote = result.otp
        ? isAr
          ? ` رمز التتبع: ${result.otp}`
          : ` Tracking code: ${result.otp}`
        : "";
      notifySuccess(
        (isMoney
          ? isAr
            ? `شكراً لتبرعك بمبلغ ${amount} دينار`
            : `Thanks for your ${amount} JOD donation`
          : isAr
            ? "شكراً لتبرعك العيني، سنتواصل معك قريباً"
            : "Thanks for your in-kind donation — we'll be in touch") + otpNote,
      );

      qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      qc.invalidateQueries({ queryKey: getListMyDonationsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      setOpen(false);
      reset();
    } catch (err) {
      notifyError(err, lang);
    }
  }

  const confirmLabel = mutation.isPending
    ? isAr
      ? "جارٍ..."
      : "Processing..."
    : donationType === "money"
      ? isAr
        ? `تأكيد ${amount} د.أ`
        : `Confirm ${amount} JOD`
      : isAr
        ? "تأكيد التبرع"
        : "Confirm donation";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            data-testid={`btn-donate-${org?.id ?? `req-${helpRequest?.id}`}`}
          >
            <Heart className="h-3.5 w-3.5" />
            {isAr ? "تبرّع" : "Donate"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-h-[85vh] overflow-y-auto"
        dir={isAr ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle>
            {isAr ? "التبرع لـ" : "Donate to"} {targetName}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? isAr
                ? "الخطوة ١ من ٢ — اختر طريقة الدفع"
                : "Step 1 of 2 — Choose payment method"
              : isAr
                ? "الخطوة ٢ من ٢ — حدّد نوع التبرع وتفاصيله"
                : "Step 2 of 2 — Pick donation type & details"}
          </DialogDescription>
        </DialogHeader>

        <Stepper step={step} />

        {step === 1 ? (
          <PaymentStep
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            walletProvider={walletProvider}
            onWalletProviderChange={setWalletProvider}
            walletPhone={walletPhone}
            onWalletPhoneChange={setWalletPhone}
            cardName={cardName}
            onCardNameChange={setCardName}
            cardNumber={cardNumber}
            onCardNumberChange={setCardNumber}
          />
        ) : (
          <DetailsStep
            donationType={donationType}
            onDonationTypeChange={setDonationType}
            amount={amount}
            onAmountChange={setAmount}
            itemDetails={itemDetails}
            onItemDetailsChange={setItemDetails}
            message={message}
            onMessageChange={setMessage}
          />
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              data-testid="btn-back"
            >
              {isAr ? (
                <ArrowRight className="h-4 w-4 me-1" />
              ) : (
                <ArrowLeft className="h-4 w-4 me-1" />
              )}
              {isAr ? "السابق" : "Back"}
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={handleNext}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="btn-next"
            >
              {isAr ? "التالي" : "Next"}
              {isAr ? (
                <ArrowLeft className="h-4 w-4 ms-1" />
              ) : (
                <ArrowRight className="h-4 w-4 ms-1" />
              )}
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={mutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="btn-confirm-donation"
            >
              <HandCoins className="h-4 w-4 me-1" />
              {confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
