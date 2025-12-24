import { type UsageLog, type PaginatedData } from '@/types';
import { formatNumber, formatRelativeDate, formatActionType } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useCallback } from 'react';

// @ts-ignore - route helper is available globally via Ziggy
declare function route(name: string, params?: any): string;

interface UsageLogsTableProps {
    usageLogs: PaginatedData<UsageLog>;
    totalConsumedCredits: number;
}

/**
 * Usage logs table with pagination.
 * WHY: Extracted from usage.tsx to reduce component size and improve maintainability.
 */
export function UsageLogsTable({ usageLogs, totalConsumedCredits }: UsageLogsTableProps) {
    // WHY: useCallback prevents function recreation on each render when passed to Button onClick
    const handlePrevPage = useCallback(() => {
        router.get(route('usage.index'), { page: usageLogs.current_page - 1 });
    }, [usageLogs.current_page]);

    const handleNextPage = useCallback(() => {
        router.get(route('usage.index'), { page: usageLogs.current_page + 1 });
    }, [usageLogs.current_page]);

    return (
        <div className="rounded-lg border border-border p-4">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">Usage Logs</h2>
                <p className="text-xs text-muted-foreground">Detailed log of all AI operations</p>
            </div>

            <div>
                {usageLogs.data.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No usage logs found</p>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-md border border-border">
                            <table 
                                className="w-full text-sm" 
                                role="grid" 
                                aria-label="Usage logs"
                            >
                                <caption className="sr-only">Detailed log of all AI operations</caption>
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Action
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground w-32">
                                            Credits
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground w-40">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {usageLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-foreground">
                                                {formatActionType(log.action_type)}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {log.credits_used < 0 ? (
                                                    <span className="text-emerald-600">
                                                        +{formatNumber(Math.abs(log.credits_used))}
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground">{formatNumber(log.credits_used)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">
                                                {formatRelativeDate(log.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {usageLogs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {usageLogs.data.length} of {usageLogs.total} logs
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={usageLogs.current_page === 1}
                                        onClick={handlePrevPage}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={usageLogs.current_page === usageLogs.last_page}
                                        onClick={handleNextPage}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Total Consumed Credits */}
                        <div className="rounded-lg border bg-muted/50 p-4 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    Total Consumed Credits
                                </span>
                                <span className="text-lg font-semibold text-foreground">
                                    {formatNumber(totalConsumedCredits)}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
