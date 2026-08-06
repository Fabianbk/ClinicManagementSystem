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
    <nav className="pagination" aria-label="Pagination">
      {prevDisabled ? (
        <span className="pagination__btn pagination__btn--disabled">ก่อนหน้า</span>
      ) : (
        <Link href={`${basePath}?page=${currentPage - 1}`} className="pagination__btn">
          ก่อนหน้า
        </Link>
      )}

      <span className="pagination__status">
        หน้า {currentPage + 1} จาก {totalPages}
      </span>

      {nextDisabled ? (
        <span className="pagination__btn pagination__btn--disabled">ถัดไป</span>
      ) : (
        <Link href={`${basePath}?page=${currentPage + 1}`} className="pagination__btn">
          ถัดไป
        </Link>
      )}
    </nav>
  );
}