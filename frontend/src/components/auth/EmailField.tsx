import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { emailSuggestions, suggestEmailCorrection } from "@/lib/email";

interface EmailFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isAr: boolean;
  placeholder?: string;
  hasError?: boolean;
}

/**
 * Email input with provider autocomplete (on "@") and a non-blocking
 * "did you mean …@gmail.com" typo hint. Validation/blocking is owned by the form.
 */
export function EmailField({
  id,
  value,
  onChange,
  onBlur,
  isAr,
  placeholder = "example@email.com",
  hasError,
}: EmailFieldProps) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => emailSuggestions(value), [value]);
  const correction = useMemo(() => suggestEmailCorrection(value), [value]);
  const showList = focused && value.includes("@") && suggestions.length > 0;

  return (
    <div className="relative">
      <Input
        id={id}
        type="email"
        dir="ltr"
        autoComplete="email"
        placeholder={placeholder}
        className={`text-start ${hasError ? "border-destructive" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay so a suggestion click registers before the list unmounts.
          setTimeout(() => setFocused(false), 120);
          onBlur?.();
        }}
      />

      {showList && (
        <ul
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
          dir="ltr"
        >
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-start text-sm hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      {correction && (
        <button
          type="button"
          className="mt-1 text-xs text-primary hover:underline text-start"
          onClick={() => onChange(correction)}
          dir="ltr"
        >
          {isAr ? "هل تقصد" : "Did you mean"} {correction}؟
        </button>
      )}
    </div>
  );
}
