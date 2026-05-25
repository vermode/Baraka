import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import type { Organization } from "@workspace/api-client-react";

interface OrgFormProps {
  initial?: Partial<Organization>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
}

/**
 * Form used to create or edit an organization. The parent dialog decides which
 * mode we're in by passing (or not) an `initial` org.
 */
export function OrgForm({ initial, onSubmit, submitLabel }: OrgFormProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [v, setV] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "charity",
    governorate: initial?.governorate ?? "maan",
    description: initial?.description ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    lat: initial?.lat ?? null,
    lng: initial?.lng ?? null,
    verified: initial?.verified ?? false,
  });

  async function handleSubmit() {
    // Strip empty optional fields so the API doesn't receive empty strings
    // where it expects nullable values.
    const payload: Record<string, unknown> = { ...v };
    if (payload.lat == null) delete payload.lat;
    if (payload.lng == null) delete payload.lng;
    if (!payload.phone) delete payload.phone;
    if (!payload.email) delete payload.email;
    if (!payload.address) delete payload.address;
    await onSubmit(payload);
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>{isAr ? "الاسم" : "Name"}</Label>
        <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{isAr ? "الفئة" : "Category"}</Label>
          <Input value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} />
        </div>
        <div>
          <Label>{isAr ? "المحافظة" : "Governorate"}</Label>
          <Input value={v.governorate} onChange={(e) => setV({ ...v, governorate: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>{isAr ? "الوصف" : "Description"}</Label>
        <Textarea value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{isAr ? "الهاتف" : "Phone"}</Label>
          <Input value={v.phone ?? ""} onChange={(e) => setV({ ...v, phone: e.target.value })} />
        </div>
        <div>
          <Label>{isAr ? "البريد" : "Email"}</Label>
          <Input value={v.email ?? ""} onChange={(e) => setV({ ...v, email: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>{isAr ? "العنوان" : "Address"}</Label>
        <Input value={v.address ?? ""} onChange={(e) => setV({ ...v, address: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Lat</Label>
          <Input
            type="number"
            step="0.0001"
            value={v.lat ?? ""}
            onChange={(e) =>
              setV({ ...v, lat: e.target.value ? parseFloat(e.target.value) : null })
            }
          />
        </div>
        <div>
          <Label>Lng</Label>
          <Input
            type="number"
            step="0.0001"
            value={v.lng ?? ""}
            onChange={(e) =>
              setV({ ...v, lng: e.target.value ? parseFloat(e.target.value) : null })
            }
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.verified}
          onChange={(e) => setV({ ...v, verified: e.target.checked })}
        />
        {isAr ? "موثّقة" : "Verified"}
      </label>
      <DialogFooter>
        <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
