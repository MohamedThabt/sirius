import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircleIcon,
    AlertOctagonIcon,
    AlertTriangleIcon,
    BugIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    FileIcon,
    FileTextIcon,
    FilterIcon,
    HardDriveIcon,
    InfoIcon,
    RefreshCwIcon,
    SearchIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

// Types
interface LogEntry {
    timestamp: string;
    level: string;
    logger: string;
    message: string;
    line_number: number;
}

interface LogPaginationMeta {
    current_page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

interface LogFileStats {
    exists: boolean;
    size_bytes: number;
    size_human: string;
    line_count: number;
    last_modified: string | null;
    path?: string;
    level_counts?: {
        DEBUG: number;
        INFO: number;
        WARNING: number;
        ERROR: number;
        CRITICAL: number;
        UNKNOWN: number;
    };
}

interface LogStats {
    app_log: LogFileStats;
    error_log: LogFileStats;
    summary: {
        total_log_files: number;
        total_size_bytes: number;
        total_entries: number;
        total_errors: number;
        total_warnings: number;
        total_critical: number;
    };
}

interface LogsData {
    log_type: string;
    entries: LogEntry[];
    meta: LogPaginationMeta;
}

interface Filters {
    log_type?: string;
    level?: string;
    search?: string;
    page?: number;
    per_page?: number;
}

interface Props {
    stats: LogStats | null;
    logs: LogsData | null;
    filters: Filters;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'FastAPI Logs',
        href: '/admin/logs/fastapi',
    },
];

// Log level configuration
const LOG_LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const;

const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
        case 'DEBUG':
            return BugIcon;
        case 'INFO':
            return InfoIcon;
        case 'WARNING':
            return AlertTriangleIcon;
        case 'ERROR':
            return AlertCircleIcon;
        case 'CRITICAL':
            return AlertOctagonIcon;
        default:
            return FileTextIcon;
    }
};

const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
        case 'DEBUG':
            return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        case 'INFO':
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        case 'WARNING':
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        case 'ERROR':
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        case 'CRITICAL':
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        default:
            return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
};

/**
 * Try to parse a string as JSON
 */
function tryParseJson(raw: string): { isJson: true; parsed: unknown } | { isJson: false } {
    const trimmed = raw?.trim() ?? '';
    if (!trimmed) return { isJson: false };
    try {
        const parsed = JSON.parse(trimmed);
        return { isJson: true, parsed };
    } catch {
        return { isJson: false };
    }
}

/**
 * Extract summary fields from FastAPI log entry for display in table row
 */
function extractFastApiLogSummary(log: LogEntry): {
    mainMessage: string;
    routeInfo: string | null;
    exceptionInfo: string | null;
    requestId: string | null;
} {
    // Try to parse message as JSON (our structured logs)
    const result = tryParseJson(log.message);
    
    if (result.isJson && typeof result.parsed === 'object' && result.parsed !== null) {
        const data = result.parsed as Record<string, unknown>;
        
        // Extract fields from structured log
        const event = data.event as string | null;
        const route = data.route as string | null;
        const method = data.method as string | null;
        const exceptionType = data.exception_type as string | null;
        const exceptionMessage = data.exception_message as string | null;
        const exceptionFile = data.exception_file as string | null;
        const exceptionLine = data.exception_line as number | null;
        const requestId = data.request_id as string | null;
        
        // Build summary strings
        let routeInfo: string | null = null;
        if (route) {
            routeInfo = method ? `${method} ${route}` : route;
        }
        
        let exceptionInfo: string | null = null;
        if (exceptionType || exceptionFile) {
            const parts: string[] = [];
            if (exceptionType) {
                parts.push(exceptionType);
            }
            if (exceptionFile && exceptionLine) {
                const shortFile = exceptionFile.split('/').pop()?.split('\\').pop() || exceptionFile;
                parts.push(`${shortFile}:${exceptionLine}`);
            }
            exceptionInfo = parts.join(' @ ');
        }
        
        // Main message is the event or exception message
        const mainMessage = exceptionMessage || event || log.message;
        
        return {
            mainMessage,
            routeInfo,
            exceptionInfo,
            requestId,
        };
    }
    
    // Fallback: parse from non-JSON message (e.g., "Request completed: GET /api/v1/...")
    const requestMatch = log.message.match(/Request completed: (\w+)\s+([^|]+)/);
    if (requestMatch) {
        return {
            mainMessage: 'Request completed',
            routeInfo: `${requestMatch[1]} ${requestMatch[2].trim()}`,
            exceptionInfo: null,
            requestId: null,
        };
    }
    
    // Check for exception patterns in the message
    const exceptionMatch = log.message.match(/\[(\w+Error|\w+Exception)\]:/);
    const exceptionInfo = exceptionMatch ? exceptionMatch[1] : null;
    
    return {
        mainMessage: log.message,
        routeInfo: null,
        exceptionInfo,
        requestId: null,
    };
}

/**
 * Format timestamp to human-readable format.
 * Examples: "Today at 2:30 PM", "Yesterday at 10:15 AM", "Jan 5 at 3:45 PM", "Jan 5, 2024 at 3:45 PM"
 */
const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return '-';

    try {
        const date = new Date(timestamp.replace(' ', 'T'));
        if (isNaN(date.getTime())) return timestamp;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        if (logDate.getTime() === today.getTime()) {
            return `Today at ${timeStr}`;
        } else if (logDate.getTime() === yesterday.getTime()) {
            return `Yesterday at ${timeStr}`;
        } else if (date.getFullYear() === now.getFullYear()) {
            const monthDay = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
            return `${monthDay} at ${timeStr}`;
        } else {
            const fullDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
            return `${fullDate} at ${timeStr}`;
        }
    } catch {
        return timestamp;
    }
};

export default function LogsIndex({ stats, logs, filters, error: serverError }: Props) {
    const [activeTab, setActiveTab] = useState<'app' | 'error'>((filters.log_type as 'app' | 'error') || 'app');
    const [isLoading, setIsLoading] = useState(false);

    // Local filter state
    const [search, setSearch] = useState(filters.search || '');
    const [levelFilter, setLevelFilter] = useState<string>(filters.level || 'all');

    // Get entries and meta from logs data
    const entries = logs?.entries || [];
    const meta = logs?.meta || null;

    // Navigate with Inertia
    const navigateWithFilters = (newFilters: Partial<Filters>) => {
        setIsLoading(true);
        const mergedFilters = {
            log_type: activeTab,
            level: levelFilter !== 'all' ? levelFilter : undefined,
            search: search || undefined,
            page: 1,
            per_page: 50,
            ...newFilters,
        };

        // Remove undefined/empty values
        const cleanFilters = Object.fromEntries(Object.entries(mergedFilters).filter(([, v]) => v !== undefined && v !== '' && v !== 'all'));

        router.get('/admin/logs/fastapi', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // Debounced search
    const debouncedSearch = useDebouncedCallback((value: string) => {
        navigateWithFilters({ search: value, page: 1 });
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleLevelChange = (value: string) => {
        setLevelFilter(value);
        navigateWithFilters({ level: value !== 'all' ? value : undefined, page: 1 });
    };

    const handleTabChange = (value: string) => {
        const newTab = value as 'app' | 'error';
        setActiveTab(newTab);
        setSearch('');
        setLevelFilter('all');
        navigateWithFilters({ log_type: newTab, search: undefined, level: undefined, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        navigateWithFilters({ page: newPage });
    };

    const handleRefresh = () => {
        navigateWithFilters({});
    };

    const clearFilters = () => {
        setSearch('');
        setLevelFilter('all');
        navigateWithFilters({ search: undefined, level: undefined, page: 1 });
    };

    // Clear logs
    const handleClearLogs = (logType?: string) => {
        const params = logType ? { log_type: logType } : {};
        router.delete('/admin/logs/fastapi/clear', {
            data: params,
            preserveState: false,
            onFinish: () => setIsLoading(false),
        });
    };

    // Download logs
    const handleDownload = (logType: 'app' | 'error') => {
        window.location.href = `/admin/logs/fastapi/download/${logType}`;
    };

    const hasActiveFilters = search || levelFilter !== 'all';

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="FastAPI Logs" />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">FastAPI Logs</h1>
                                <p className="text-sm text-muted-foreground/60">Monitor and analyze FastAPI service logs</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                                    <RefreshCwIcon className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                                    Refresh
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <TrashIcon className="mr-2 h-4 w-4" />
                                            Clear All
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Clear All Logs</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to clear all log files? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleClearLogs()}>Clear All</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="border border-border/30 bg-card/50">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground/80">Total Entries</CardTitle>
                                    <FileTextIcon className="h-4 w-4 text-muted-foreground/60" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold text-foreground/90 tabular-nums">
                                        {stats.summary.total_entries.toLocaleString()}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground/60">Across {stats.summary.total_log_files} files</p>
                                </CardContent>
                            </Card>

                            <Card className="border border-border/30 bg-card/50">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground/80">Total Size</CardTitle>
                                    <HardDriveIcon className="h-4 w-4 text-muted-foreground/60" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold text-foreground/90">{stats.app_log.size_human}</div>
                                    <p className="mt-1 text-xs text-muted-foreground/60">
                                        App: {stats.app_log.size_human} • Errors: {stats.error_log.size_human}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border border-red-500/20 bg-red-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-red-600/80 dark:text-red-400/80">Errors</CardTitle>
                                    <AlertCircleIcon className="h-4 w-4 text-red-500/60" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold text-red-600 tabular-nums dark:text-red-400">
                                        {stats.summary.total_errors.toLocaleString()}
                                    </div>
                                    <p className="mt-1 text-xs text-red-600/60 dark:text-red-400/60">+ {stats.summary.total_critical} critical</p>
                                </CardContent>
                            </Card>

                            <Card className="border border-amber-500/20 bg-amber-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-amber-600/80 dark:text-amber-400/80">Warnings</CardTitle>
                                    <AlertTriangleIcon className="h-4 w-4 text-amber-500/60" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                                        {stats.summary.total_warnings.toLocaleString()}
                                    </div>
                                    <p className="mt-1 text-xs text-amber-600/60 dark:text-amber-400/60">Across all log files</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Log Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-1 flex-col">
                        <div className="flex items-center justify-between">
                            <TabsList className="bg-muted/50">
                                <TabsTrigger value="app" className="gap-2">
                                    <FileTextIcon className="h-4 w-4" />
                                    App Logs
                                    {stats?.app_log.line_count && (
                                        <Badge variant="secondary" className="ml-1 bg-muted/80 text-xs">
                                            {stats.app_log.line_count.toLocaleString()}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="error" className="gap-2">
                                    <AlertCircleIcon className="h-4 w-4" />
                                    Error Logs
                                    {stats?.error_log.line_count && stats.error_log.line_count > 0 && (
                                        <Badge variant="destructive" className="ml-1 text-xs">
                                            {stats.error_log.line_count.toLocaleString()}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleDownload(activeTab)}>
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                            <TrashIcon className="mr-2 h-4 w-4" />
                                            Clear
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Clear {activeTab === 'app' ? 'App' : 'Error'} Logs</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to clear the {activeTab} log file? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleClearLogs(activeTab)}>Clear</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card className="mt-4 border border-border/30 bg-card/50">
                            <CardContent className="pt-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="relative min-w-[200px] flex-1">
                                        <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                        <Input
                                            placeholder="Search logs..."
                                            value={search}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            className="border-border/30 bg-background/50 pl-9"
                                        />
                                    </div>
                                    <Select value={levelFilter} onValueChange={handleLevelChange}>
                                        <SelectTrigger className="w-[160px] border-border/30 bg-background/50">
                                            <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground/60" />
                                            <SelectValue placeholder="Filter by level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Levels</SelectItem>
                                            {LOG_LEVELS.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <XIcon className="mr-2 h-4 w-4" />
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logs Table */}
                        <TabsContent value="app" className="mt-4 flex-1">
                            <LogsTable 
                                logs={entries} 
                                isLoading={isLoading} 
                                error={serverError} 
                                meta={meta} 
                                onPageChange={handlePageChange} 
                                onSelectLog={(log) => {
                                    // Navigate to detail page
                                    const queryParams = new URLSearchParams();
                                    queryParams.set('log_type', activeTab);
                                    if (levelFilter !== 'all') queryParams.set('level', levelFilter);
                                    if (search) queryParams.set('search', search);
                                    if (meta?.current_page) queryParams.set('page', meta.current_page.toString());
                                    
                                    router.visit(`/admin/logs/fastapi/show/${activeTab}/${log.line_number}?${queryParams.toString()}`);
                                }} 
                            />
                        </TabsContent>
                        <TabsContent value="error" className="mt-4 flex-1">
                            <LogsTable 
                                logs={entries} 
                                isLoading={isLoading} 
                                error={serverError} 
                                meta={meta} 
                                onPageChange={handlePageChange} 
                                onSelectLog={(log) => {
                                    // Navigate to detail page
                                    const queryParams = new URLSearchParams();
                                    queryParams.set('log_type', activeTab);
                                    if (levelFilter !== 'all') queryParams.set('level', levelFilter);
                                    if (search) queryParams.set('search', search);
                                    if (meta?.current_page) queryParams.set('page', meta.current_page.toString());
                                    
                                    router.visit(`/admin/logs/fastapi/show/${activeTab}/${log.line_number}?${queryParams.toString()}`);
                                }} 
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </AppLayout>
        </>
    );
}

// Logs Table Component
function LogsTable({
    logs,
    isLoading,
    error,
    meta,
    onPageChange,
    onSelectLog,
}: {
    logs: LogEntry[];
    isLoading: boolean;
    error?: string;
    meta: LogPaginationMeta | null;
    onPageChange: (page: number) => void;
    onSelectLog: (log: LogEntry) => void;
}) {
    if (error) {
        return (
            <Card className="border border-red-500/20 bg-red-500/5">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircleIcon className="mb-4 h-12 w-12 text-red-500/60" />
                    <p className="font-medium text-red-600 dark:text-red-400">Failed to load logs</p>
                    <p className="mt-1 text-sm text-red-600/60 dark:text-red-400/60">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className="border border-border/30 bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCwIcon className="mb-4 h-8 w-8 animate-spin text-muted-foreground/60" />
                    <p className="text-muted-foreground/80">Loading logs...</p>
                </CardContent>
            </Card>
        );
    }

    if (logs.length === 0) {
        return (
            <Card className="border border-border/30 bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground/80">No log entries found</p>
                    <p className="mt-1 text-sm text-muted-foreground/60">Try adjusting your filters or check back later</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col border border-border/30 bg-card/50">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/30 hover:bg-transparent">
                            <TableHead className="w-[160px]">Timestamp</TableHead>
                            <TableHead className="w-[90px]">Level</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-[70px] text-right">Line</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log, index) => {
                            const LevelIcon = getLevelIcon(log.level);
                            const summary = extractFastApiLogSummary(log);
                            
                            return (
                                <TableRow
                                    key={`${log.line_number}-${index}`}
                                    className="border-border/20 cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => onSelectLog(log)}
                                >
                                    <TableCell className="align-top font-mono text-xs text-muted-foreground/80" title={log.timestamp}>
                                        {formatTimestamp(log.timestamp)}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Badge variant="outline" className={cn('border text-xs font-medium', getLevelColor(log.level))}>
                                            <LevelIcon className="mr-1 h-3 w-3" />
                                            {log.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[600px]">
                                        <div className="flex flex-col gap-1.5">
                                            {/* Main message */}
                                            <div className="font-mono text-xs text-foreground/90 line-clamp-2" title={summary.mainMessage}>
                                                {summary.mainMessage}
                                            </div>
                                            
                                            {/* Structured summary line */}
                                            {(summary.routeInfo || summary.exceptionInfo || summary.requestId) && (
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    {summary.routeInfo && (
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                                                            <span className="text-muted-foreground/50">🛣️</span>
                                                            <span className="font-mono">{summary.routeInfo}</span>
                                                        </span>
                                                    )}
                                                    {summary.exceptionInfo && (
                                                        <span className="inline-flex items-center gap-1 text-amber-600/80 dark:text-amber-500/70">
                                                            <span>📍</span>
                                                            <span className="font-mono text-xs">{summary.exceptionInfo}</span>
                                                        </span>
                                                    )}
                                                    {summary.requestId && (
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                                                            <span className="text-muted-foreground/40">🔖</span>
                                                            <span className="font-mono text-[10px]">{summary.requestId.substring(0, 8)}</span>
                                                        </span>
                                                    )}
                                                    {log.logger && (
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground/50">
                                                            <span className="text-muted-foreground/30">📦</span>
                                                            <span className="font-mono text-[10px]">{log.logger}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top text-right font-mono text-xs text-muted-foreground/60">
                                        {log.line_number}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
                <div className="flex items-center justify-between border-t border-border/30 px-4 py-3">
                    <p className="text-sm text-muted-foreground/70">
                        Showing {(meta.current_page - 1) * meta.per_page + 1} to {Math.min(meta.current_page * meta.per_page, meta.total_entries)} of{' '}
                        {meta.total_entries.toLocaleString()} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onPageChange(meta.current_page - 1)} disabled={!meta.has_previous}>
                            <ChevronLeftIcon className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1 px-2">
                            <span className="text-sm text-muted-foreground/80">
                                Page {meta.current_page} of {meta.total_pages}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onPageChange(meta.current_page + 1)} disabled={!meta.has_next}>
                            Next
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
