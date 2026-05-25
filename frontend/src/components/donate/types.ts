import {
  Apple,
  CreditCard,
  HandCoins,
  MoreHorizontal,
  Shirt,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type DonationType = "money" | "food" | "clothes" | "other";
export type PaymentMethod = "card" | "wallet" | "cash";
export type WalletProvider = "zain" | "orange" | "umniah";

interface PaymentOption {
  id: PaymentMethod;
  icon: LucideIcon;
  label: string;
  desc: string;
}

interface TypeOption {
  id: DonationType;
  icon: LucideIcon;
  label: string;
}

interface WalletOption {
  id: WalletProvider;
  label: string;
}

/** Localised list of the three payment methods shown on step 1. */
export function paymentOptions(isAr: boolean): PaymentOption[] {
  return [
    {
      id: "card",
      icon: CreditCard,
      label: isAr ? "بطاقة ائتمان" : "Credit card",
      desc: isAr ? "فيزا · ماستركارد" : "Visa · Mastercard",
    },
    {
      id: "wallet",
      icon: Smartphone,
      label: isAr ? "محفظة إلكترونية" : "Mobile wallet",
      desc: isAr ? "زين كاش · أورانج · أمنية" : "Zain · Orange · Umniah",
    },
    {
      id: "cash",
      icon: Wallet,
      label: isAr ? "نقدي عند الاستلام" : "Cash on pickup",
      desc: isAr ? "يتواصل معك المندوب" : "A rep will contact you",
    },
  ];
}

/** Localised list of the four donation-type tiles shown on step 2. */
export function typeOptions(isAr: boolean): TypeOption[] {
  return [
    { id: "money", icon: HandCoins, label: isAr ? "مالي" : "Money" },
    { id: "food", icon: Apple, label: isAr ? "طعام" : "Food" },
    { id: "clothes", icon: Shirt, label: isAr ? "ملابس" : "Clothes" },
    { id: "other", icon: MoreHorizontal, label: isAr ? "غير ذلك" : "Other" },
  ];
}

/** Localised list of supported mobile wallet providers. */
export function walletOptions(isAr: boolean): WalletOption[] {
  return [
    { id: "zain", label: isAr ? "زين كاش" : "Zain Cash" },
    { id: "orange", label: isAr ? "أورانج موني" : "Orange Money" },
    { id: "umniah", label: isAr ? "أمنية كاش" : "Umniah Cash" },
  ];
}
