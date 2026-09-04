import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  from?: number;
  to?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function Pagination({ from = 1, to, total = 20, page = 1, totalPages, onPrevious, onNext }: PaginationProps) {
  const lastItem = to ?? Math.min(10, total);
  const pageCount = totalPages ?? Math.max(1, Math.ceil(total / 10));

  return (
    <div className="pagination">
      <span>{total === 0 ? "0 to 0" : `${from} to ${lastItem}`} of {total}</span>
      <button type="button" aria-label="Previous page" onClick={onPrevious} disabled={page <= 1 || !onPrevious}><ChevronLeft size={15} /></button>
      <button type="button" aria-label="Next page" onClick={onNext} disabled={page >= pageCount || !onNext}><ChevronRight size={15} /></button>
    </div>
  );
}
