import { router } from '@inertiajs/react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationData {
  current_page: number;
  last_page: number;
  from?: number;
  to?: number;
  total: number;
  per_page?: number;
}

interface PaginationControlsProps {
  data: PaginationData;
  baseUrl: string;
  preserveFilters?: Record<string, any>;
}

export function PaginationControls({ data, baseUrl, preserveFilters = {} }: PaginationControlsProps) {
  const { current_page, last_page, from, to, total } = data;

  // Don't render if there's only one page
  if (last_page <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    router.get(baseUrl, { ...preserveFilters, page }, { preserveState: true });
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxPagesToShow = 7;

    if (last_page <= maxPagesToShow) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current_page > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, current_page - 1);
      const end = Math.min(last_page - 1, current_page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current_page < last_page - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(last_page);
    }

    return pages;
  };

  return (
    <div className="space-y-3">
      {/* Summary Info */}
      {from !== undefined && to !== undefined && (
        <div className="flex justify-center">
          <p className="rounded-lg border border-border/30 bg-card/30 px-4 py-2 text-sm text-muted-foreground/60 backdrop-blur-sm">
            Showing <span className="font-medium text-foreground/80">{from}</span> to{' '}
            <span className="font-medium text-foreground/80">{to}</span> of{' '}
            <span className="font-medium text-foreground/80">{total}</span> results
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination className="border-border/30 bg-card/30 backdrop-blur-sm py-2 rounded-lg">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => current_page > 1 && handlePageChange(current_page - 1)}
              className={current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === current_page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => current_page < last_page && handlePageChange(current_page + 1)}
              className={current_page === last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
