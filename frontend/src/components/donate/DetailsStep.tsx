import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package } from "lucide-react";

import { typeOptions, type DonationType } from "./types";

interface DetailsStepProps {
  donationType: DonationType;
  onDonationTypeChange: (t: DonationType) => void;

  amount: number;
  onAmountChange: (v: number) => void;

  itemDetails: string;
  onItemDetailsChange: (v: string) => void;

  message: string;
  onMessageChange: (v: string) => void;
}

const PRESET_AMOUNTS = [10, 20, 50, 100];

/** Step 2 of the donate flow — pick donation type and fill amount / item details. */
export function DetailsStep(props: DetailsStepProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const types = typeOptions(isAr);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs mb-2 block">
          {isAr ? "نوع التبرع" : "Donation type"}
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {types.map((opt) => {
            const Icon = opt.icon;
            const active = props.donationType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => props.onDonationTypeChange(opt.id)}
                data-testid={`type-${opt.id}`}
                className={`rounded-xl border p-3 transition-all flex flex-col items-center gap-1 ${
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {props.donationType === "money" ? (
        <AmountField amount={props.amount} onChange={props.onAmountChange} />
      ) : (
        <ItemDetailsField
          donationType={props.donationType}
          itemDetails={props.itemDetails}
          onChange={props.onItemDetailsChange}
        />
      )}

      <div>
        <Label>{isAr ? "رسالة (اختياري)" : "Message (optional)"}</Label>
        <Textarea
          value={props.message}
          onChange={(e) => props.onMessageChange(e.target.value)}
          placeholder={isAr ? "كلمة تشجيع..." : "A note of support..."}
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}

/** Quick-pick buttons + free-form amount input. */
function AmountField({
  amount,
  onChange,
}: {
  amount: number;
  onChange: (v: number) => void;
}) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div>
      <Label>{isAr ? "المبلغ (دينار)" : "Amount (JOD)"}</Label>
      <div className="flex gap-2 mt-2 flex-wrap">
        {PRESET_AMOUNTS.map((v) => (
          <Button
            key={v}
            type="button"
            variant={amount === v ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(v)}
          >
            {v}
          </Button>
        ))}
        <Input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value || "0", 10)))}
          className="w-24"
          data-testid="input-amount"
        />
      </div>
    </div>
  );
}

/** Textarea for describing in-kind donations (food / clothes / other). */
function ItemDetailsField({
  donationType,
  itemDetails,
  onChange,
}: {
  donationType: DonationType;
  itemDetails: string;
  onChange: (v: string) => void;
}) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const placeholder =
    donationType === "food"
      ? isAr
        ? "مثال: ١٠ طرود غذائية، أرز، سكر، زيت..."
        : "e.g. 10 food parcels: rice, sugar, oil..."
      : donationType === "clothes"
        ? isAr
          ? "مثال: ٢٠ قطعة ملابس شتوية مقاس متوسط، نظيفة..."
          : "e.g. 20 winter clothing items, medium size, clean..."
        : isAr
          ? "صف التبرع، الكمية، الحالة، وعنوان الاستلام إن وُجد."
          : "Describe the items, quantity, condition, and pickup address if any.";

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        {isAr ? "تفاصيل التبرع العيني" : "In-kind donation details"}
      </Label>
      <Textarea
        value={itemDetails}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px]"
        data-testid="input-item-details"
      />
      <p className="text-[11px] text-muted-foreground">
        {isAr
          ? "سنتواصل معك خلال ٤٨ ساعة لتنسيق الاستلام أو التوصيل."
          : "We'll contact you within 48 hours to arrange pickup or delivery."}
      </p>
    </div>
  );
}
