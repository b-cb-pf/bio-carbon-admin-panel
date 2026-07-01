import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ total = 20 }: { total?: number }) {
  return <div className="pagination"><span>1 to 10 of {total}</span><button aria-label="Previous page" disabled><ChevronLeft size={15} /></button><button aria-label="Next page"><ChevronRight size={15} /></button></div>;
}
