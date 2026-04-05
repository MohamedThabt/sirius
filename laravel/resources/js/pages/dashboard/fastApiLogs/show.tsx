import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { getLogLevelColor } from '@/utils/semantic-colors';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircleIcon,
    AlertOctagonIcon,
    AlertTriangleIcon,
    ArrowLeftIcon,
    BugIcon,
    InfoIcon,
} from 'lucide-react';

// Types
interface LogEntry {
    timestamp: string;
    level: string;
    logger: string;
    message: string;
    line_number: number;
}

interface Props {
    log: LogEntry;
    log_type: string;
    filters?: {
        log_type?: string;
        level?: string;
        search?: string;
        page?: number;
    };
}

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
            return InfoIcon;
    }
};

const getLevelColor = getLogLevelColor;

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

export default function FastApiLogShow({ log, log_type, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'FastAPI Logs',
            href: '/admin/logs/fastapi',
        },
        {
            title: 'Log Details',
            href: '',
        },
    ];

    const handleBackClick = () => {
        const queryParams = new URLSearchParams();
        if (filters?.log_type) queryParams.set('log_type', filters.log_type);
        if (filters?.level) queryParams.set('level', filters.level);
        if (filters?.search) queryParams.set('search', filters.search);
        if (filters?.page) queryParams.set('page', filters.page.toString());

        const query = queryParams.toString();
        router.visit(`/admin/logs/fastapi${query ? '?' + query : ''}`);
    };

    // Parse structured data
    const msgResult = tryParseJson(log.message);
    let structuredData: Record<string, unknown> | null = null;
    
    if (msgResult.isJson && typeof msgResult.parsed === 'object' && msgResult.parsed !== null) {
        structuredData = msgResult.parsed as Record<string, unknown>;
    }

    // Extract structured fields
    const event = structuredData?.event as string || null;
    const route = structuredData?.route as string || null;
    const method = structuredData?.method as string || null;
    const requestId = structuredData?.request_id as string || null;
    const exceptionType = structuredData?.exception_type as string || null;
    const exceptionMessage = structuredData?.exception_message as string || null;
    const exceptionFile = structuredData?.exception_file as string || null;
    const exceptionLine = structuredData?.exception_line as number || null;

    // Detect Python Traceback
    const isTraceback = log.message.includes('Traceback (most recent call last):');
    let errorMessage = log.message;
    let tracebackLines: string[] = [];

    if (isTraceback) {
        const parts = log.message.split('Traceback (most recent call last):');
        const prefix = parts[0].trim();
        const traceContent = 'Traceback (most recent call last):' + parts.slice(1).join('Traceback (most recent call last):');
        const lines = traceContent.split('\n');
        const errorLine = lines[lines.length - 1].trim();
        if (errorLine) {
            errorMessage = `${prefix ? prefix + '\n' : ''}${errorLine}`;
        }
        tracebackLines = lines;
    }

    const isError = log.level === 'ERROR' || log.level === 'CRITICAL';
    const LevelIcon = getLevelIcon(log.level);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`FastAPI Log Details - Line ${log.line_number}`} />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">Log Details</h1>
                            <p className="text-sm text-muted-foreground/60">FastAPI {log_type} log entry</p>
                        </div>
                        <Button onClick={handleBackClick} variant="outline">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Logs
                        </Button>
                    </div>

                    {/* Log Metadata */}
                    <Card className="border border-border/30 bg-card/50">
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <Badge variant="outline" className={cn('border text-sm font-medium', getLevelColor(log.level))}>
                                    <LevelIcon className="mr-1.5 h-4 w-4" />
                                    {log.level}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Timestamp:</span>
                                    <span className="font-mono text-sm text-foreground" title={log.timestamp}>
                                        {formatTimestamp(log.timestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Line:</span>
                                    <span className="font-mono text-sm text-foreground">{log.line_number}</span>
                                </div>
                                {log.logger && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Logger:</span>
                                        <Badge variant="secondary" className="font-mono">{log.logger}</Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Banner for structured errors */}
                    {isError && (exceptionMessage || exceptionType) && (
                        <Card className="border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircleIcon className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {exceptionType && (
                                                <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 font-mono text-xs">
                                                    {exceptionType}
                                                </Badge>
                                            )}
                                            <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                                                {event || 'Error'}
                                            </span>
                                        </div>
                                        {exceptionMessage && (
                                            <div className="rounded-md bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/40 p-4">
                                                <p className="font-mono text-sm leading-relaxed text-red-900 dark:text-red-200 whitespace-pre-wrap break-words">
                                                    {exceptionMessage}
                                                </p>
                                            </div>
                                        )}
                                        {exceptionFile && (
                                            <div className="flex items-center gap-2 font-mono text-sm">
                                                <span className="text-red-600/60 dark:text-red-400/50">📍</span>
                                                <span className="text-red-700 dark:text-red-300">{exceptionFile}</span>
                                                {exceptionLine && (
                                                    <Badge variant="secondary" className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                                        Line {exceptionLine}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Non-structured error (traceback or plain) */}
                    {!structuredData && isError && !isTraceback && (
                        <Card className="border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-red-900 dark:text-red-200">Error Details</h4>
                                        <p className="font-mono text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap break-words">
                                            {errorMessage}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Request Context Grid (for structured logs) */}
                    {structuredData && (route || method || requestId) && (
                        <Card className="border border-border/30 bg-card/50">
                            <div className="p-4 border-b border-border/30 bg-muted/20">
                                <h3 className="text-sm font-semibold text-foreground">Request Context</h3>
                            </div>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {method && (
                                        <div>
                                            <div className="text-xs text-muted-foreground/70 mb-1">📡 Method</div>
                                            <div className="font-mono text-sm text-foreground/90">{method}</div>
                                        </div>
                                    )}
                                    {route && (
                                        <div className="col-span-2">
                                            <div className="text-xs text-muted-foreground/70 mb-1">🛣️ Route</div>
                                            <div className="font-mono text-sm text-foreground/90">{route}</div>
                                        </div>
                                    )}
                                    {requestId && (
                                        <div>
                                            <div className="text-xs text-muted-foreground/70 mb-1">🔖 Request ID</div>
                                            <div className="font-mono text-sm text-foreground/90">{requestId}</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Traceback */}
                    {isTraceback && (
                        <>
                            {!isError && (
                                <Card className="border-red-500/30 bg-red-500/5">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-3">
                                            <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                                            <div className="space-y-1">
                                                <h4 className="font-medium text-red-900 dark:text-red-200">Error Details</h4>
                                                <p className="font-mono text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap break-words">
                                                    {errorMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            <Card className="border border-border/30 bg-card/50">
                                <div className="p-4 bg-muted/20 border-b border-border/30 font-medium text-sm flex items-center gap-2">
                                    <BugIcon className="h-4 w-4 text-muted-foreground" />
                                    Python Traceback
                                </div>
                                <div className="max-h-[500px] overflow-auto bg-slate-950 p-4 text-xs font-mono text-slate-300">
                                    {tracebackLines.map((line, i) => {
                                        if (line.trim().startsWith('File "')) {
                                            return <div key={i} className="pl-2 text-blue-400">{line}</div>;
                                        }
                                        if (i === tracebackLines.length - 1 && line.trim()) {
                                            return <div key={i} className="font-bold text-red-400 mt-2">{line}</div>;
                                        }
                                        return <div key={i} className="pl-4 border-l-2 border-slate-800 ml-1">{line}</div>;
                                    })}
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Plain Message (non-traceback, non-error, non-structured) */}
                    {!isTraceback && !structuredData && !isError && (
                        <Card className="border border-border/30 bg-card/50">
                            <div className="p-4 border-b border-border/30 bg-muted/20">
                                <h3 className="text-sm font-semibold text-foreground">Message</h3>
                            </div>
                            <CardContent className="pt-6">
                                <p className="font-mono text-sm whitespace-pre-wrap break-words">{log.message}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Full Structured Log Data */}
                    {structuredData && (
                        <Card className="border border-border/30 bg-card/50">
                            <div className="p-4 border-b border-border/30 bg-muted/20">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {event && !exceptionMessage ? `Event: ${event}` : 'Full Log Data'}
                                </h3>
                            </div>
                            <CardContent className="pt-6">
                                <div className="rounded-md border border-border/30 bg-zinc-100 dark:bg-zinc-950/95 p-4 max-h-[500px] overflow-auto">
                                    <pre className="font-mono text-xs leading-relaxed whitespace-pre text-foreground/90">
                                        {JSON.stringify(structuredData, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
