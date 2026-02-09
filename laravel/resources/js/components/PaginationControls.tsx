import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

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
    router.get(baseUrl, { ...preserveFilters, page }, { preserveState: true, preserveScroll: true });
  };

  const hasPrevious = current_page > 1;
  const hasNext = current_page < last_page;

  return (
    <div className="flex items-center justify-center rounded-lg border border-border/30 bg-card/30 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current_page - 1)}
          disabled={!hasPrevious}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm text-muted-foreground/80">
            Page {current_page} of {last_page}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current_page + 1)}
          disabled={!hasNext}
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
