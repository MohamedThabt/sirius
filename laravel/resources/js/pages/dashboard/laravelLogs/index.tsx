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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useIsClient } from '@/components/ClientDateTime';
import {
    AlertCircleIcon,
    AlertOctagonIcon,
    AlertTriangleIcon,
    BugIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
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
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

// Types
interface LogEntry {
    timestamp: string;
    environment: string;
    level: string;
    message: string;
    context: string;
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

interface LogFileInfo {
    name: string;
    size_bytes: number;
    size_human: string;
    line_count: number;
    last_modified: number;
    level_counts: {
        DEBUG: number;
        INFO: number;
        NOTICE: number;
        WARNING: number;
        ERROR: number;
        CRITICAL: number;
        ALERT: number;
        EMERGENCY: number;
    };
}

interface LogStats {
    log_files: LogFileInfo[];
    summary: {
        total_log_files: number;
        total_size_bytes: number;
        total_size_human: string;
        total_entries: number;
        total_errors: number;
        total_warnings: number;
        total_critical: number;
    };
}

interface LogsData {
    log_file: string;
    entries: LogEntry[];
    meta: LogPaginationMeta;
}

interface Filters {
    log_file?: string;
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
        title: 'Laravel Logs',
        href: '/admin/logs/laravel',
    },
];

// Log level configuration
const LOG_LEVELS = ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'] as const;

const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
        case 'DEBUG':
            return BugIcon;
        case 'INFO':
        case 'NOTICE':
            return InfoIcon;
        case 'WARNING':
            return AlertTriangleIcon;
        case 'ERROR':
        case 'ALERT':
            return AlertCircleIcon;
        case 'CRITICAL':
        case 'EMERGENCY':
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
        case 'NOTICE':
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        case 'WARNING':
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        case 'ERROR':
        case 'ALERT':
            return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        case 'CRITICAL':
        case 'EMERGENCY':
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        default:
            return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
};

function tryParseJson(raw: string): { isJson: true; formatted: string; raw: string; parsed: unknown } | { isJson: false; raw: string } {
    const trimmed = raw?.trim() ?? '';
    if (!trimmed) return { isJson: false, raw };
    try {
        const parsed = JSON.parse(trimmed);
        const formatted = JSON.stringify(parsed, null, 2);
        const minified = JSON.stringify(parsed);
        return { isJson: true, formatted, raw: minified, parsed };
    } catch {
        return { isJson: false, raw };
    }
}

/**
 * Extract embedded JSON from a log message string.
 * e.g. "Exception occurred {\"key\":\"value\"}" → { prefix: "Exception occurred", json: {...}, formatted: "..." }
 */
function extractJsonFromMessage(message: string): {
    prefix: string;
    json: Record<string, unknown> | null;
    formatted: string | null;
} {
    if (!message) return { prefix: message, json: null, formatted: null };
    const firstBrace = message.indexOf('{');
    if (firstBrace === -1) return { prefix: message, json: null, formatted: null };
    const prefix = message.substring(0, firstBrace).trim();
    const jsonPart = message.substring(firstBrace);
    try {
        const parsed = JSON.parse(jsonPart);
        if (typeof parsed === 'object' && parsed !== null) {
            return { prefix, json: parsed as Record<string, unknown>, formatted: JSON.stringify(parsed, null, 2) };
        }
        return { prefix: message, json: null, formatted: null };
    } catch {
        return { prefix: message, json: null, formatted: null };
    }
}

type JsonTokenType = 'key' | 'string' | 'number' | 'literal' | 'punctuation' | 'whitespace';
type JsonToken = { type: JsonTokenType; value: string };

function tokenizeJson(str: string): JsonToken[] {
    const tokens: JsonToken[] = [];
    let i = 0;
    const re = {
        ws: /^\s+/,
        key: /^("(?:[^"\\]|\\.)*")\s*:/,
        string: /^("(?:[^"\\]|\\.)*")/,
        number: /^(-?\d+\.?\d*)/,
        literal: /^(true|false|null)\b/,
        punct: /^([{}\[\]:,])/,
    };
    while (i < str.length) {
        const tail = str.slice(i);
        let m = tail.match(re.ws);
        if (m) {
            const v = m[0];
            tokens.push({ type: 'whitespace', value: v });
            i += v.length;
            continue;
        }
        m = tail.match(re.key);
        if (m) {
            tokens.push({ type: 'key', value: m[1] });
            tokens.push({ type: 'punctuation', value: m[0].slice(m[1].length) });
            i += m[0].length;
            continue;
        }
        m = tail.match(re.string);
        if (m) {
            tokens.push({ type: 'string', value: m[1] });
            i += m[1].length;
            continue;
        }
        m = tail.match(re.number);
        if (m) {
            tokens.push({ type: 'number', value: m[1] });
            i += m[1].length;
            continue;
        }
        m = tail.match(re.literal);
        if (m) {
            tokens.push({ type: 'literal', value: m[1] });
            i += m[1].length;
            continue;
        }
        m = tail.match(re.punct);
        if (m) {
            tokens.push({ type: 'punctuation', value: m[1] });
            i += m[1].length;
            continue;
        }
        tokens.push({ type: 'punctuation', value: str[i] ?? '' });
        i += 1;
    }
    return tokens;
}

function JsonSyntaxHighlight({ formatted }: { formatted: string }) {
    const tokens = tokenizeJson(formatted);
    const tokenClass: Record<JsonTokenType, string> = {
        key: 'text-sky-500 dark:text-sky-400',
        string: 'text-emerald-600 dark:text-emerald-400',
        number: 'text-amber-600 dark:text-amber-400',
        literal: 'text-violet-500 dark:text-violet-400',
        punctuation: 'text-muted-foreground/80',
        whitespace: '',
    };
    return (
        <code className="font-mono text-xs leading-relaxed">
            {tokens.map((t, idx) => (
                <span key={idx} className={tokenClass[t.type]}>
                    {t.value}
                </span>
            ))}
        </code>
    );
}

function JsonOrRawBlock({
    title,
    content,
    className,
    scrollHeight = 280,
}: {
    title: string;
    content: string;
    className?: string;
    scrollHeight?: number;
}) {
    const result = tryParseJson(content);
    const [view, setView] = useState<'formatted' | 'raw'>('formatted');
    const displayText = result.isJson
        ? view === 'formatted'
            ? result.formatted
            : result.raw
        : result.raw;
    const isEmpty = !displayText;
    const eventName = result.isJson && typeof result.parsed === 'object' && result.parsed !== null && 'event' in result.parsed
        ? String((result.parsed as { event?: unknown }).event)
        : null;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isEmpty) return;
        navigator.clipboard.writeText(displayText).then(
            () => toast.success('Copied to clipboard'),
            () => toast.error('Failed to copy'),
        );
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
                    {eventName && (
                        <Badge variant="secondary" className="font-mono text-xs">
                            {eventName}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {result.isJson && (
                        <div className="flex rounded-md border border-border/30 bg-muted/30 p-0.5">
                            <button
                                type="button"
                                onClick={() => setView('formatted')}
                                className={cn(
                                    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                                    view === 'formatted'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Formatted
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('raw')}
                                className={cn(
                                    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                                    view === 'raw'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Raw
                            </button>
                        </div>
                    )}
                    {!isEmpty && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            onClick={handleCopy}
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            Copy
                        </Button>
                    )}
                </div>
            </div>
            <ScrollArea
                className="w-full rounded-lg border border-border/30 bg-zinc-100 dark:bg-zinc-950/95"
                style={{ height: scrollHeight }}
            >
                <div className="p-4">
                    <pre className={cn(
                        'font-mono text-xs leading-relaxed',
                        result.isJson && view === 'formatted' ? 'whitespace-pre' : 'whitespace-pre-wrap break-words',
                    )}>
                        {isEmpty ? (
                            <span className="italic text-muted-foreground">(empty)</span>
                        ) : result.isJson && view === 'formatted' ? (
                            <JsonSyntaxHighlight formatted={result.formatted} />
                        ) : (
                            <span className="text-zinc-700 dark:text-zinc-300">{displayText}</span>
                        )}
                    </pre>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}

/**
 * Extract summary fields from log entry for display in table row
 */
function extractLogSummary(log: LogEntry): {
    mainMessage: string;
    userInfo: string | null;
    routeInfo: string | null;
    exceptionInfo: string | null;
    requestId: string | null;
} {
    // Try to parse context as JSON
    const contextResult = tryParseJson(log.context);
    let contextData: Record<string, unknown> | null = null;
    
    if (contextResult.isJson && typeof contextResult.parsed === 'object' && contextResult.parsed !== null) {
        contextData = contextResult.parsed as Record<string, unknown>;
    }
    
    // Try to extract embedded JSON from message
    const msgExtract = extractJsonFromMessage(log.message);
    let messageData: Record<string, unknown> | null = msgExtract.json;
    
    // Extract system context — check data.sys nesting (AppLogger format), then top-level sys, then top-level keys
    const msgDataSys = (messageData?.data && typeof messageData.data === 'object' && 'sys' in (messageData.data as any))
        ? (messageData.data as any).sys as Record<string, unknown>
        : {};
    const ctxDataSys = (contextData?.data && typeof contextData.data === 'object' && 'sys' in (contextData.data as any))
        ? (contextData.data as any).sys as Record<string, unknown>
        : {};
    const ctxSys = (contextData?.sys as Record<string, unknown>) || {};
    const msgSys = (messageData?.sys as Record<string, unknown>) || {};
    
    // Merge all sys sources (priority: ctxDataSys > ctxSys > msgDataSys > msgSys > top-level fields)
    const sys = { ...msgSys, ...msgDataSys, ...ctxSys, ...ctxDataSys };
    
    // Extract exception info (check multiple sources)
    const exceptionMessage = (contextData?.exception_message || messageData?.exception_message) as string | null;
    const exceptionType = (contextData?.exception_type || messageData?.exception_type) as string | null;
    const exceptionFile = (contextData?.exception_file || messageData?.exception_file) as string | null;
    const exceptionLine = (contextData?.exception_line || messageData?.exception_line) as number | null;
    
    // Extract user info
    const userName = (sys.user_name || contextData?.user_name || messageData?.user_name) as string | null;
    const userEmail = (sys.user_email || contextData?.user_email || messageData?.user_email) as string | null;
    const userId = (sys.user_id || contextData?.user_id || messageData?.user_id) as string | number | null;
    
    // Extract route info
    const route = (sys.route || contextData?.route_name || messageData?.route || sys.url || messageData?.url) as string | null;
    const method = (sys.method || contextData?.method || messageData?.method) as string | null;
    const action = (sys.action || contextData?.route_action || messageData?.action) as string | null;
    
    // Extract request ID
    const requestId = (sys.request_id || contextData?.request_id || messageData?.request_id) as string | null;
    
    // Build summary strings
    let userInfo: string | null = null;
    if (userName || userEmail) {
        const parts = [userName, userEmail].filter(Boolean);
        if (userId) parts.push(`#${userId}`);
        userInfo = parts.join(' • ');
    }
    
    let routeInfo: string | null = null;
    if (route) {
        routeInfo = method ? `${method} ${route}` : route;
    } else if (action) {
        routeInfo = method ? `${method} ${action}` : action;
    }
    
    let exceptionInfo: string | null = null;
    if (exceptionType || exceptionFile) {
        const parts: string[] = [];
        if (exceptionType) {
            // Handle PHP namespaces (App\\Exceptions\\Foo) and path separators
            const shortType = exceptionType.split(/[\\\\/]/).pop() || exceptionType;
            parts.push(shortType);
        }
        if (exceptionFile && exceptionLine) {
            const shortFile = exceptionFile.split(/[\\\\/]/).pop() || exceptionFile;
            parts.push(`${shortFile}:${exceptionLine}`);
        }
        exceptionInfo = parts.join(' @ ');
    }
    
    // Determine main message
    let mainMessage = log.message;
    if (msgExtract.prefix && msgExtract.json) {
        mainMessage = msgExtract.prefix || log.message;
    }
    if (exceptionMessage && exceptionMessage !== mainMessage) {
        mainMessage = exceptionMessage;
    }
    
    return {
        mainMessage,
        userInfo,
        routeInfo,
        exceptionInfo,
        requestId,
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
            const monthDay = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
            });
            return `${monthDay} at ${timeStr}`;
        } else {
            const fullDate = date.toLocaleDateString(undefined, {
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

export default function LaravelLogsIndex({ stats, logs, filters, error: serverError }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Local filter state
    const [search, setSearch] = useState(filters.search || '');
    const [levelFilter, setLevelFilter] = useState<string>(filters.level || 'all');
    const [selectedLogFile, setSelectedLogFile] = useState<string>(filters.log_file || 'laravel.log');

    // Get entries and meta from logs data
    const entries = logs?.entries || [];
    const meta = logs?.meta || null;

    // Format last refreshed time
    const formatLastRefreshed = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    // Navigate with Inertia
    const navigateWithFilters = (newFilters: Partial<Filters>) => {
        setIsLoading(true);
        const mergedFilters = {
            log_file: selectedLogFile,
            level: levelFilter !== 'all' ? levelFilter : undefined,
            search: search || undefined,
            page: 1,
            per_page: 50,
            ...newFilters,
        };

        // Remove undefined/empty values
        const cleanFilters = Object.fromEntries(Object.entries(mergedFilters).filter(([, v]) => v !== undefined && v !== '' && v !== 'all'));

        router.get('/admin/logs/laravel', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setIsLoading(false);
                setLastRefreshed(new Date());
            },
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

    const handleLogFileChange = (value: string) => {
        setSelectedLogFile(value);
        setSearch('');
        setLevelFilter('all');
        navigateWithFilters({ log_file: value, search: undefined, level: undefined, page: 1 });
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
    const handleClearLogs = (logFile?: string) => {
        const params = logFile ? { log_file: logFile } : {};
        router.delete('/admin/logs/laravel/clear', {
            data: params,
            preserveState: false,
            onFinish: () => setIsLoading(false),
        });
    };

    // Download logs
    const handleDownload = (logFile: string) => {
        window.location.href = `/admin/logs/laravel/download/${encodeURIComponent(logFile)}`;
    };

    const hasActiveFilters = search || levelFilter !== 'all';

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Laravel Logs" />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">Laravel Logs</h1>
                                <p className="text-sm text-muted-foreground/60">Monitor and analyze Laravel application logs</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground/60">
                                    Last refreshed: {formatLastRefreshed(lastRefreshed)}
                                </span>
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
                                    <div className="text-2xl font-semibold text-foreground/90">{stats.summary.total_size_human}</div>
                                    <p className="mt-1 text-xs text-muted-foreground/60">{stats.summary.total_log_files} log files</p>
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

                    {/* Log File Selector & Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Select value={selectedLogFile} onValueChange={handleLogFileChange}>
                                <SelectTrigger className="w-[250px] border-border/30 bg-background/50">
                                    <FileIcon className="mr-2 h-4 w-4 text-muted-foreground/60" />
                                    <SelectValue placeholder="Select log file" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stats?.log_files.map((file) => (
                                        <SelectItem key={file.name} value={file.name}>
                                            <div className="flex items-center justify-between gap-4">
                                                <span>{file.name}</span>
                                                <span className="text-xs text-muted-foreground">{file.size_human}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownload(selectedLogFile)}>
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
                                        <AlertDialogTitle>Clear {selectedLogFile}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to clear this log file? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleClearLogs(selectedLogFile)}>Clear</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="border border-border/30 bg-card/50">
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
                    <LogsTable
                        logs={entries}
                        isLoading={isLoading}
                        error={serverError}
                        meta={meta}
                        onPageChange={handlePageChange}
                        onSelectLog={(log) => setSelectedLog(log)}
                    />

                    {/* Log Detail Modal */}
                    <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
                        <DialogContent className="max-w-[95vw] w-full max-h-[92vh] overflow-hidden flex flex-col gap-0">
                            <DialogHeader className="pb-4">
                                <DialogTitle className="flex flex-wrap items-center gap-3">
                                    {selectedLog && (() => {
                                        const LevelIcon = getLevelIcon(selectedLog.level);
                                        return (
                                            <>
                                                <Badge variant="outline" className={cn('border text-xs font-medium', getLevelColor(selectedLog.level))}>
                                                    <LevelIcon className="mr-1 h-3 w-3" />
                                                    {selectedLog.level}
                                                </Badge>
                                                <span className="font-mono text-sm text-muted-foreground" title={selectedLog.timestamp}>
                                                    {formatTimestamp(selectedLog.timestamp)}
                                                </span>
                                                <span className="font-mono text-xs text-muted-foreground/60">
                                                    Line {selectedLog.line_number}
                                                </span>
                                            </>
                                        );
                                    })()}
                                </DialogTitle>
                            </DialogHeader>
                            {selectedLog && (() => {
                                // Parse context
                                const result = tryParseJson(selectedLog.context);
                                let businessContext: Record<string, unknown> | null = null;
                                let systemContext: Record<string, unknown> | null = null;
                                let exceptionObj: any = null;

                                if (result.isJson && typeof result.parsed === 'object' && result.parsed !== null) {
                                    const parsed = { ...(result.parsed as Record<string, unknown>) };
                                    
                                    // Extract exception
                                    if ('exception' in parsed) {
                                        exceptionObj = parsed.exception;
                                        delete parsed.exception;
                                    }

                                    // Extract system data
                                    if ('sys' in parsed && typeof parsed.sys === 'object') {
                                        systemContext = parsed.sys as Record<string, unknown>;
                                        delete parsed.sys;
                                    }

                                    // Check for legacy top-level system keys
                                    const legacySysKeys = ['url', 'method', 'ip', 'user_agent', 'request_id', 'request_body'];
                                    const foundLegacy = legacySysKeys.filter(k => k in parsed);
                                    if (foundLegacy.length > 0) {
                                        systemContext = systemContext || {};
                                        foundLegacy.forEach(k => {
                                            systemContext![k] = parsed[k];
                                            delete parsed[k];
                                        });
                                    }

                                    businessContext = parsed;
                                }

                                // Also try to extract embedded JSON from the message itself
                                const msgExtract = extractJsonFromMessage(selectedLog.message);
                                let messagePrefix = selectedLog.message;
                                let messageJson: Record<string, unknown> | null = null;
                                let messageFormatted: string | null = null;
                                let msgExceptionMessage: string | null = null;
                                let msgExceptionType: string | null = null;
                                let msgExceptionFile: string | null = null;
                                let msgExceptionLine: number | null = null;
                                let msgExceptionTrace: string | null = null;
                                let msgSystemContext: Record<string, unknown> | null = null;
                                let msgBusinessData: Record<string, unknown> | null = null;

                                if (msgExtract.json) {
                                    messagePrefix = msgExtract.prefix;
                                    const mj = { ...msgExtract.json };

                                    // Extract exception_* keys from message JSON
                                    if (mj.exception_message || mj.exception_type) {
                                        msgExceptionMessage = mj.exception_message as string || null;
                                        msgExceptionType = mj.exception_type as string || null;
                                        msgExceptionFile = mj.exception_file as string || null;
                                        msgExceptionLine = mj.exception_line as number || null;
                                        msgExceptionTrace = mj.exception_trace as string || null;
                                        delete mj.exception_message;
                                        delete mj.exception_type;
                                        delete mj.exception_file;
                                        delete mj.exception_line;
                                        delete mj.exception_trace;
                                    }

                                    // Keys that belong in system context (not business data)
                                    const sysKeys = ['url', 'method', 'ip', 'user_agent', 'request_id', 'request_body', 'route', 'action',
                                                      'user_id', 'user_name', 'user_email', 'route_name', 'route_action', 'referer',
                                                      'session_id', 'admin_id', 'admin_email'];

                                    // Extract data.sys if exists (AppLogger format: data -> { sys: {...}, ...businessKeys })
                                    if (mj.data && typeof mj.data === 'object') {
                                        const dataObj = mj.data as Record<string, unknown>;
                                        if ('sys' in dataObj && typeof dataObj.sys === 'object') {
                                            msgSystemContext = { ...(dataObj.sys as Record<string, unknown>) };
                                            delete dataObj.sys;
                                        }
                                        // Remaining data keys are business data
                                        const remaining = { ...dataObj };
                                        if (Object.keys(remaining).length > 0) {
                                            msgBusinessData = remaining;
                                        }
                                        delete mj.data;
                                    }

                                    // Also pull top-level sys-like keys into system context
                                    const topSys: Record<string, unknown> = {};
                                    sysKeys.forEach(k => {
                                        if (k in mj) {
                                            topSys[k] = mj[k];
                                            delete mj[k];
                                        }
                                    });
                                    if (Object.keys(topSys).length > 0) {
                                        msgSystemContext = { ...(msgSystemContext || {}), ...topSys };
                                    }

                                    // Remove metadata keys we display elsewhere
                                    const metaKeys = ['event', 'message', 'timestamp', 'environment', 'app_version',
                                                      'memory_usage_mb', 'peak_memory_mb'];
                                    metaKeys.forEach(k => delete mj[k]);

                                    if (Object.keys(mj).length > 0) {
                                        messageJson = mj;
                                        messageFormatted = JSON.stringify(mj, null, 2);
                                    }
                                }

                                // Merge message-derived contexts if context didn't already have them
                                if (!exceptionObj && msgExceptionMessage) {
                                    exceptionObj = {
                                        message: msgExceptionMessage,
                                        class: msgExceptionType,
                                        file: msgExceptionFile,
                                        line: msgExceptionLine,
                                        trace: msgExceptionTrace,
                                    };
                                }
                                if (!systemContext && msgSystemContext) {
                                    systemContext = msgSystemContext;
                                } else if (systemContext && msgSystemContext) {
                                    // Merge, msg system fields fill gaps
                                    Object.entries(msgSystemContext).forEach(([k, v]) => {
                                        if (!(k in systemContext!) || systemContext![k] === null || systemContext![k] === undefined) {
                                            systemContext![k] = v;
                                        }
                                    });
                                }
                                if (!businessContext && msgBusinessData) {
                                    businessContext = msgBusinessData;
                                } else if (businessContext && msgBusinessData) {
                                    Object.entries(msgBusinessData).forEach(([k, v]) => {
                                        if (!(k in businessContext!)) {
                                            businessContext![k] = v;
                                        }
                                    });
                                }

                                // Determine if this is an error-level log
                                const isError = ['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'].includes(selectedLog.level);

                                return (
                                    <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1 py-2">
                                        {/* Error Banner — prominent for errors */}
                                        {isError && exceptionObj && (
                                            <div className="rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-5">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircleIcon className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        {/* Exception type badge + title */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {exceptionObj.class && (
                                                                <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 font-mono text-xs">
                                                                    {String(exceptionObj.class).split('\\').pop()}
                                                                </Badge>
                                                            )}
                                                            <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                                                                {messagePrefix || 'Exception Occurred'}
                                                            </span>
                                                        </div>
                                                        {/* Exception message */}
                                                        <div className="rounded-md bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/40 p-4">
                                                            <p className="font-mono text-sm leading-relaxed text-red-900 dark:text-red-200 whitespace-pre-wrap break-words">
                                                                {exceptionObj.message || String(selectedLog.message)}
                                                            </p>
                                                        </div>
                                                        {/* File + Line */}
                                                        {exceptionObj.file && (
                                                            <div className="flex items-center gap-2 font-mono text-sm">
                                                                <span className="text-red-600/60 dark:text-red-400/50">📍</span>
                                                                <span className="text-red-700 dark:text-red-300">{String(exceptionObj.file)}</span>
                                                                {exceptionObj.line && (
                                                                    <Badge variant="secondary" className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                                                        Line {String(exceptionObj.line)}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Non-error exception display */}
                                        {!isError && exceptionObj && (
                                            <div className="rounded-lg border border-border/30 bg-muted/30 p-5 space-y-3">
                                                <div className="flex items-center gap-2 text-foreground">
                                                    <AlertCircleIcon className="h-5 w-5 text-muted-foreground" />
                                                    <span className="text-base font-semibold">{messagePrefix || 'Exception Occurred'}</span>
                                                    {exceptionObj.class && (
                                                        <Badge variant="outline" className="ml-2 font-mono text-xs">{exceptionObj.class}</Badge>
                                                    )}
                                                </div>
                                                <div className="rounded-md bg-background p-4 font-mono text-sm leading-relaxed border border-border/30 whitespace-pre-wrap break-words">
                                                    {exceptionObj.message || String(selectedLog.message)}
                                                </div>
                                                {exceptionObj.file && (
                                                    <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                                                        <span>📍</span>
                                                        <span>{String(exceptionObj.file)}</span>
                                                        {exceptionObj.line && <Badge variant="secondary" className="font-mono text-xs">Line {String(exceptionObj.line)}</Badge>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Non-exception message (when no exception) */}
                                        {!exceptionObj && (
                                            <div className="rounded-lg border border-border/30 bg-muted/30 p-5">
                                                <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">{selectedLog.message}</p>
                                            </div>
                                        )}

                                        {/* Request & User Context Info Grid */}
                                        {systemContext && Object.keys(systemContext).length > 0 && (
                                            <div className="rounded-lg border border-border/30 bg-muted/10">
                                                <div className="p-3 border-b border-border/20 bg-muted/20">
                                                    <h4 className="text-sm font-medium text-muted-foreground">Request Context</h4>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/20">
                                                    {(() => {
                                                        // Render system context as a clean grid
                                                        const displayOrder = [
                                                            { key: 'request_id', label: 'Request ID', icon: '🔖' },
                                                            { key: 'method', label: 'Method', icon: '📡' },
                                                            { key: 'url', label: 'URL', icon: '🔗' },
                                                            { key: 'route', label: 'Route', icon: '🛣️' },
                                                            { key: 'action', label: 'Action', icon: '⚡' },
                                                            { key: 'user_id', label: 'User ID', icon: '👤' },
                                                            { key: 'user_name', label: 'User', icon: '👤' },
                                                            { key: 'user_email', label: 'Email', icon: '📧' },
                                                            { key: 'ip', label: 'IP', icon: '🌐' },
                                                            { key: 'user_agent', label: 'User Agent', icon: '🖥️' },
                                                        ];
                                                        return displayOrder
                                                            .filter(({ key }) => systemContext![key] !== null && systemContext![key] !== undefined && systemContext![key] !== '')
                                                            .map(({ key, label, icon }) => {
                                                                const val = String(systemContext![key]);
                                                                // url/user_agent span full width
                                                                const isWide = key === 'url' || key === 'user_agent' || key === 'action';
                                                                return (
                                                                    <div key={key} className={cn('bg-background p-3', isWide && 'col-span-2 md:col-span-3 lg:col-span-4')}>
                                                                        <div className="text-xs text-muted-foreground/70 mb-1">{icon} {label}</div>
                                                                        <div className="font-mono text-xs text-foreground/90 break-all" title={val}>
                                                                            {val.length > 120 ? val.substring(0, 120) + '…' : val}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Stack Trace */}
                                        {exceptionObj?.trace && (
                                            <div className="rounded-lg border border-border/30">
                                                <div className="p-3 bg-muted/20 border-b border-border/30 font-medium text-sm flex items-center gap-2">
                                                    <FilterIcon className="h-4 w-4 text-muted-foreground" />
                                                    Stack Trace
                                                </div>
                                                <div className="max-h-[400px] overflow-auto p-0">
                                                    {Array.isArray(exceptionObj.trace) ? (
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-[50px] text-center">#</TableHead>
                                                                    <TableHead>File / Function</TableHead>
                                                                    <TableHead className="w-[80px] text-right">Line</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {exceptionObj.trace.map((item: any, idx: number) => (
                                                                    <TableRow key={idx} className="hover:bg-muted/10">
                                                                        <TableCell className="font-mono text-xs text-muted-foreground text-center">
                                                                            {idx + 1}
                                                                        </TableCell>
                                                                        <TableCell className="font-mono text-xs">
                                                                            <div className="font-medium text-foreground/80 mb-0.5 break-all">
                                                                                {item.file ? (item.file.split(/[\\/]/).slice(-3).join('/')) : 'internal'}
                                                                            </div>
                                                                            <div className="text-muted-foreground/60">
                                                                                {item.class ? `${item.class}${item.type}${item.function}` : item.function}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-mono text-xs text-orange-500/80">
                                                                            {item.line || '-'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <ScrollArea className="w-full" style={{ height: 350 }}>
                                                            <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-foreground/80">
                                                                {String(exceptionObj.trace)}
                                                            </pre>
                                                            <ScrollBar orientation="horizontal" />
                                                        </ScrollArea>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Business Context */}
                                        {businessContext && Object.keys(businessContext).length > 0 && (
                                            <JsonOrRawBlock 
                                                title="Business Context" 
                                                content={JSON.stringify(businessContext, null, 2)} 
                                                scrollHeight={240} 
                                            />
                                        )}

                                        {/* Remaining message JSON (non-exception, non-system keys) */}
                                        {messageJson && messageFormatted && (
                                            <JsonOrRawBlock
                                                title="Additional Data"
                                                content={messageFormatted}
                                                scrollHeight={260}
                                            />
                                        )}

                                        {/* Raw Context Fallback */}
                                        {!businessContext && !systemContext && !messageJson && selectedLog.context && (
                                            <JsonOrRawBlock
                                                title="Raw Context"
                                                content={selectedLog.context}
                                                scrollHeight={350}
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </DialogContent>
                    </Dialog>
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
                            const summary = extractLogSummary(log);
                            
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
                                            {(summary.userInfo || summary.routeInfo || summary.exceptionInfo) && (
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    {summary.userInfo && (
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                                                            <span className="text-muted-foreground/50">👤</span>
                                                            <span className="font-mono">{summary.userInfo}</span>
                                                        </span>
                                                    )}
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
