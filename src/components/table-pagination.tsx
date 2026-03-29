import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { buildPageUrl } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type Props = {
  pathname: string;
  page: number;
  totalPages: number;
  total: number;
  extra?: Record<string, string | undefined>;
};

export function TablePagination({ pathname, page, totalPages, total, extra = {} }: Props) {
  if (total === 0 || totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-border",
      )}
    >
      <p className="text-sm text-muted-foreground tabular-nums">
        Showing page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex items-center gap-2">
        {prev !== null ? (
          <Link
            href={buildPageUrl(pathname, prev, extra)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Previous
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-40",
            )}
          >
            Previous
          </span>
        )}
        {next !== null ? (
          <Link
            href={buildPageUrl(pathname, next, extra)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-40",
            )}
          >
            Next
          </span>
        )}
      </div>
    </div>
  );
}
