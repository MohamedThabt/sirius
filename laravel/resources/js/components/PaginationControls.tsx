import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onPerPageChange?: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function PaginationControls({ data, baseUrl, preserveFilters = {}, onPerPageChange }: PaginationControlsProps) {
  const { current_page, last_page, from, to, total, per_page } = data;

  const handlePageChange = (page: number) => {
    router.get(baseUrl, { ...preserveFilters, page, per_page: per_page || 10 }, { preserveState: true, preserveScroll: true });
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value, 10);
    if (onPerPageChange) {
      onPerPageChange(newPerPage);
    }
    router.get(baseUrl, { ...preserveFilters, page: 1, per_page: newPerPage }, { preserveState: true, preserveScroll: true });
  };

  const hasPrevious = current_page > 1;
  const hasNext = current_page < last_page;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/30 bg-card/30 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground/70">Rows per page</span>
        <Select value={String(per_page || 10)} onValueChange={handlePerPageChange}>
          <SelectTrigger className="h-8 w-[70px] border-border/40 bg-card/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {from != null && to != null && (
          <span className="ml-2 text-sm text-muted-foreground/60">
            {from}–{to} of {total}
          </span>
        )}
      </div>
      {last_page > 1 && (
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
      )}
    </div>
  );
}
