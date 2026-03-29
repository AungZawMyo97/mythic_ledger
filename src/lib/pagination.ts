export const DEFAULT_PAGE_SIZE = 10;

export function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(String(v ?? "1"), 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function getPaginationMeta(total: number, page: number, pageSize: number) {
  const totalPages =
    total === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const skip = (currentPage - 1) * pageSize;
  return { total, totalPages, currentPage, pageSize, skip };
}


export function buildPageUrl(
  pathname: string,
  page: number,
  extra: Record<string, string | undefined> = {},
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  for (const [k, v] of Object.entries(extra)) {
    if (v) params.set(k, v);
  }
  return `${pathname}?${params.toString()}`;
}
