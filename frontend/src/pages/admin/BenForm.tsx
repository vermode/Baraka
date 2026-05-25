import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import type { Organization, Beneficiary } from "@workspace/api-client-react";

interface BenFormProps {
  initial?: Partial<Beneficiary>;
  orgs: Organization[];
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
}

/** Form used to create or edit a beneficiary (person needing help). */
export function BenForm({ initial, orgs, onSubmit, submitLabel }: BenFormProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [v, setV] = useState({
    name: initial?.name ?? "",
    story: initial?.story ?? "",
    organizationId: initial?.organizationId ?? null,
    needAmount: initial?.needAmount ?? 0,
    urgent: initial?.urgent ?? false,
  });

  async function handleSubmit() {
    const payload: Record<string, unknown> = { ...v };
    if (payload.organizationId == null) delete payload.organizationId;
    await onSubmit(payload);
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>{isAr ? "الاسم" : "Name"}</Label>
        <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </div>
      <div>
        <Label>{isAr ? "القصة" : "Story"}</Label>
        <Textarea value={v.story} onChange={(e) => setV({ ...v, story: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{isAr ? "الجمعية" : "Organization"}</Label>
          <select
            className="w-full rounded-md border border-border bg-background p-2 text-sm"
            value={v.organizationId ?? ""}
            onChange={(e) =>
              setV({
                ...v,
                organizationId: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          >
            <option value="">—</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>{isAr ? "المبلغ المطلوب" : "Need amount"}</Label>
          <Input
            type="number"
            value={v.needAmount}
            onChange={(e) =>
              setV({ ...v, needAmount: parseInt(e.target.value || "0", 10) })
            }
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.urgent}
          onChange={(e) => setV({ ...v, urgent: e.target.checked })}
        />
        {isAr ? "عاجل" : "Urgent"}
      </label>
      <DialogFooter>
        <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
