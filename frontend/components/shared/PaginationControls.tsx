import Link from "next/link";

interface PaginationControlsProps {
  currentPage: number; // 0-indexed, matching PageResponse.pageNumber
  totalPages: number;
  basePath: string;
}

export function PaginationControls({ currentPage, totalPages, basePath }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = currentPage <= 0;
  const nextDisabled = currentPage >= totalPages - 1;

  return (
    <nav className="flex items-center justify-center gap-5 mt-6" aria-label="Pagination">
      {prevDisabled ? (
        <span className="px-3.5 py-1.5 border border-clinic-line rounded-control text-clinic-ink/40 text-sm cursor-not-allowed bg-clinic-bg select-none">
          ก่อนหน้า
        </span>
      ) : (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-3.5 py-1.5 border border-clinic-line rounded-control text-clinic-ink hover:border-clinic-primary hover:text-clinic-primary-deep text-sm font-medium transition-colors bg-white shadow-xs"
        >
          ก่อนหน้า
        </Link>
      )}

      <span className="text-sm font-medium text-clinic-ink-soft">
        หน้า {currentPage + 1} จาก {totalPages}
      </span>

      {nextDisabled ? (
        <span className="px-3.5 py-1.5 border border-clinic-line rounded-control text-clinic-ink/40 text-sm cursor-not-allowed bg-clinic-bg select-none">
          ถัดไป
        </span>
      ) : (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3.5 py-1.5 border border-clinic-line rounded-control text-clinic-ink hover:border-clinic-primary hover:text-clinic-primary-deep text-sm font-medium transition-colors bg-white shadow-xs"
        >
          ถัดไป
        </Link>
      )}
    </nav>
  );
}