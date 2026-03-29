export function toDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseOrderDateFromForm(raw: string): Date {
  const t = raw?.trim();
  if (!t) return new Date();
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
