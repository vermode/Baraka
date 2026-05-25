import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  paymentOptions,
  walletOptions,
  type PaymentMethod,
  type WalletProvider,
} from "./types";

interface PaymentStepProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;

  walletProvider: WalletProvider;
  onWalletProviderChange: (w: WalletProvider) => void;

  walletPhone: string;
  onWalletPhoneChange: (v: string) => void;

  cardName: string;
  onCardNameChange: (v: string) => void;

  cardNumber: string;
  onCardNumberChange: (v: string) => void;
}

/** Step 1 of the donate flow — pick a payment method and fill its details. */
export function PaymentStep(props: PaymentStepProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const methods = paymentOptions(isAr);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {methods.map((opt) => {
          const Icon = opt.icon;
          const active = props.paymentMethod === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => props.onPaymentMethodChange(opt.id)}
              data-testid={`pay-${opt.id}`}
              className={`rounded-xl border p-3 text-start transition-all ${
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-1.5 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      {props.paymentMethod === "card" && <CardFields {...props} />}
      {props.paymentMethod === "wallet" && <WalletFields {...props} />}
      {props.paymentMethod === "cash" && <CashNotice />}
    </div>
  );
}

/** Credit-card name + number inputs. We only ever store the last 4 digits. */
function CardFields({
  cardName,
  onCardNameChange,
  cardNumber,
  onCardNumberChange,
}: Pick<
  PaymentStepProps,
  "cardName" | "onCardNameChange" | "cardNumber" | "onCardNumberChange"
>) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <Label className="text-xs">{isAr ? "الاسم على البطاقة" : "Name on card"}</Label>
        <Input
          value={cardName}
          onChange={(e) => onCardNameChange(e.target.value)}
          placeholder={isAr ? "الاسم الكامل" : "Full name"}
          data-testid="input-card-name"
        />
      </div>
      <div>
        <Label className="text-xs">{isAr ? "رقم البطاقة" : "Card number"}</Label>
        <Input
          value={cardNumber}
          onChange={(e) => onCardNumberChange(e.target.value)}
          placeholder="•••• •••• •••• 1234"
          inputMode="numeric"
          maxLength={19}
          className="font-en text-left dir-ltr"
          data-testid="input-card-number"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          {isAr
            ? "نحفظ آخر ٤ أرقام فقط لإظهارها في الإيصال — لا يتم تخزين الرقم الكامل."
            : "We only store the last 4 digits for your receipt — the full number is never saved."}
        </p>
      </div>
    </div>
  );
}

/** Wallet provider picker + phone number input. */
function WalletFields({
  walletProvider,
  onWalletProviderChange,
  walletPhone,
  onWalletPhoneChange,
}: Pick<
  PaymentStepProps,
  | "walletProvider"
  | "onWalletProviderChange"
  | "walletPhone"
  | "onWalletPhoneChange"
>) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const wallets = walletOptions(isAr);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <Label className="text-xs mb-2 block">
          {isAr ? "اختر المحفظة" : "Choose provider"}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {wallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onWalletProviderChange(w.id)}
              data-testid={`wallet-${w.id}`}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                walletProvider === w.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs">{isAr ? "رقم المحفظة" : "Wallet phone"}</Label>
        <Input
          type="tel"
          value={walletPhone}
          onChange={(e) => onWalletPhoneChange(e.target.value)}
          placeholder="07XXXXXXXX"
          className="font-en text-left dir-ltr"
          data-testid="input-wallet-phone"
        />
      </div>
    </div>
  );
}

/** Informational notice shown when the donor picks cash-on-pickup. */
function CashNotice() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="rounded-xl border border-amber-300/50 bg-amber-50/40 dark:bg-amber-500/5 p-4 text-sm">
      <p className="font-semibold mb-1">
        {isAr ? "الدفع نقداً عند الاستلام" : "Cash on pickup"}
      </p>
      <p className="text-xs text-muted-foreground">
        {isAr
          ? "سيتواصل معك مندوب الجمعية خلال ٤٨ ساعة لتنسيق موعد ومكان الاستلام."
          : "A representative will reach out within 48 hours to arrange a pickup time and location."}
      </p>
    </div>
  );
}
