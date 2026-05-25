/**
 * Tiny CSV download helper used by the admin export buttons.
 *
 * Why this exists separately: every admin tab that lets you export data should
 * call this exact function, so the CSV escaping and formula-injection guard
 * lives in one place.
 */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ].join("\n");

  // Prepend a BOM so Excel opens the UTF-8 file correctly (Arabic text otherwise mojibakes).
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // CSV formula-injection guard: if a cell starts with =, +, -, @, tab, or CR,
  // spreadsheets will try to evaluate it as a formula. Prefix with a single
  // quote so it's treated as plain text.
  if (/^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s;
  // Quote any cell containing a comma, quote, or newline; double up internal quotes.
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
