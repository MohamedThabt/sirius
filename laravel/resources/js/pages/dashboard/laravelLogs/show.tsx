import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircleIcon,
    AlertOctagonIcon,
    AlertTriangleIcon,
    ArrowLeftIcon,
    BugIcon,
    CopyIcon,
    FilterIcon,
    InfoIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Types
interface LogEntry {
    timestamp: string;
    environment: string;
    level: string;
    message: string;
    context: string;
    line_number: number;
}

interface Props {
    log: LogEntry;
    log_file: string;
    filters?: {
        log_file?: string;
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
            return InfoIcon;
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
        punct: /^([{}[\]:,])/,
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

/**
 * Enhanced message formatter that highlights file paths, exceptions, and line numbers
 */
function FormattedMessage({ message }: { message: string }) {
    // Check if message contains exception patterns
    const hasExceptionPattern = /\[object\]|\(TypeError|\(Error|Exception:/i.test(message);
    
    if (!hasExceptionPattern) {
        return <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">{message}</p>;
    }

    // Split message into parts and highlight appropriately
    const parts: React.ReactElement[] = [];
    let lastIndex = 0;

    // Pattern to match file paths with line numbers
    const filePathPattern = /([A-Z]:\\[^:\s]+\.php|\/[^:\s]+\.php)(?::(\d+))?/g;
    // Pattern to match exception types
    const exceptionPattern = /(\w+Exception|\w+Error)\(code:\s*\d+\)/g;
    // Pattern to match function calls
    const functionPattern = /(\w+(?:::|->)\w+\(\))/g;

    let match;
    const patterns = [
        { regex: new RegExp(filePathPattern.source, 'g'), type: 'file' as const },
        { regex: new RegExp(exceptionPattern.source, 'g'), type: 'exception' as const },
        { regex: new RegExp(functionPattern.source, 'g'), type: 'function' as const },
    ];

    // Collect all matches with their positions
    const allMatches: Array<{ start: number; end: number; text: string; type: string; lineNum?: string }> = [];
    
    patterns.forEach(({ regex, type }) => {
        regex.lastIndex = 0;
        while ((match = regex.exec(message)) !== null) {
            allMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                type,
                lineNum: type === 'file' ? match[2] : undefined,
            });
        }
    });

    // Sort by position
    allMatches.sort((a, b) => a.start - b.start);

    // Build the formatted output
    let key = 0;
    allMatches.forEach((match) => {
        // Add text before this match
        if (lastIndex < match.start) {
            const text = message.substring(lastIndex, match.start);
            parts.push(<span key={key++} className="text-foreground/80">{text}</span>);
        }

        // Add the highlighted match
        if (match.type === 'file') {
            const pathWithoutLine = match.lineNum ? match.text.replace(`:${match.lineNum}`, '') : match.text;
            parts.push(
                <span key={key++} className="inline-flex items-baseline gap-1 bg-blue-500/10 px-1 rounded">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {pathWithoutLine}
                    </span>
                    {match.lineNum && (
                        <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-orange-500/20 text-orange-600 dark:text-orange-400 font-mono">
                            :{match.lineNum}
                        </Badge>
                    )}
                </span>
            );
        } else if (match.type === 'exception') {
            parts.push(
                <span key={key++} className="text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-1 rounded">
                    {match.text}
                </span>
            );
        } else if (match.type === 'function') {
            parts.push(
                <span key={key++} className="text-purple-600 dark:text-purple-400 font-medium">
                    {match.text}
                </span>
            );
        }

        lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < message.length) {
        parts.push(<span key={key++} className="text-foreground/80">{message.substring(lastIndex)}</span>);
    }

    return (
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
            {parts}
        </div>
    );
}

export default function LaravelLogShow({ log, log_file, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Laravel Logs',
            href: '/admin/logs/laravel',
        },
        {
            title: 'Log Details',
            href: '',
        },
    ];

    const handleBackClick = () => {
        const queryParams = new URLSearchParams();
        if (filters?.log_file) queryParams.set('log_file', filters.log_file);
        if (filters?.level) queryParams.set('level', filters.level);
        if (filters?.search) queryParams.set('search', filters.search);
        if (filters?.page) queryParams.set('page', filters.page.toString());

        const query = queryParams.toString();
        router.visit(`/admin/logs/laravel${query ? '?' + query : ''}`);
    };

    // Parse context
    const result = tryParseJson(log.context);
    let businessContext: Record<string, unknown> | null = null;
    let systemContext: Record<string, unknown> | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const msgExtract = extractJsonFromMessage(log.message);
    let messagePrefix = log.message;
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
    const isError = ['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'].includes(log.level);
    const LevelIcon = getLevelIcon(log.level);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Laravel Log Details - Line ${log.line_number}`} />

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">Log Details</h1>
                            <p className="text-sm text-muted-foreground/60">{log_file} • {log.environment}</p>
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
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Environment:</span>
                                    <Badge variant="secondary">{log.environment}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Banner — prominent for errors */}
                    {isError && exceptionObj && (
                        <Card className="border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
                            <CardContent className="pt-6">
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
                                            <div className="font-mono text-sm leading-relaxed text-red-900 dark:text-red-200">
                                                <FormattedMessage message={exceptionObj.message || String(log.message)} />
                                            </div>
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
                            </CardContent>
                        </Card>
                    )}

                    {/* Non-error exception display */}
                    {!isError && exceptionObj && (
                        <Card className="border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center gap-2 text-foreground">
                                    <AlertCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                    <span className="text-base font-semibold">{messagePrefix || 'Exception Occurred'}</span>
                                    {exceptionObj.class && (
                                        <Badge variant="outline" className="ml-2 font-mono text-xs border-amber-500/30">{exceptionObj.class}</Badge>
                                    )}
                                </div>
                                <div className="rounded-md bg-background p-4 font-mono text-sm leading-relaxed border border-border/30">
                                    <FormattedMessage message={exceptionObj.message || String(log.message)} />
                                </div>
                                {exceptionObj.file && (
                                    <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                                        <span>📍</span>
                                        <span>{String(exceptionObj.file)}</span>
                                        {exceptionObj.line && <Badge variant="secondary" className="font-mono text-xs">Line {String(exceptionObj.line)}</Badge>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Non-exception message (when no exception) */}
                    {!exceptionObj && (
                        <Card className="border border-border/30 bg-card/50">
                            <div className="p-4 border-b border-border/30 bg-muted/20">
                                <h3 className="text-sm font-semibold text-foreground">Message</h3>
                            </div>
                            <CardContent className="pt-6">
                                <div className="rounded-lg border border-border/20 bg-muted/10 p-4">
                                    <FormattedMessage message={log.message} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Request & User Context Info Grid */}
                    {systemContext && Object.keys(systemContext).length > 0 && (
                        <Card className="border border-border/30 bg-muted/10">
                            <div className="p-4 border-b border-border/30 bg-muted/20">
                                <h3 className="text-sm font-semibold text-foreground">Request Context</h3>
                            </div>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                                    <div key={key} className={cn(isWide && 'col-span-2 md:col-span-3 lg:col-span-4')}>
                                                        <div className="text-xs text-muted-foreground/70 mb-1">{icon} {label}</div>
                                                        <div className="font-mono text-sm text-foreground/90 break-all" title={val}>
                                                            {val.length > 120 ? val.substring(0, 120) + '…' : val}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stack Trace */}
                    {exceptionObj?.trace && (
                        <Card className="border border-border/30 bg-card/50">
                            <div className="p-4 bg-muted/20 border-b border-border/30 font-medium text-sm flex items-center gap-2">
                                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                                Stack Trace
                            </div>
                            <div className="max-h-[500px] overflow-auto p-0">
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
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                        </Card>
                    )}

                    {/* Business Context */}
                    {businessContext && Object.keys(businessContext).length > 0 && (
                        <JsonOrRawBlock 
                            title="Business Context" 
                            content={JSON.stringify(businessContext, null, 2)} 
                            scrollHeight={300} 
                        />
                    )}

                    {/* Remaining message JSON (non-exception, non-system keys) */}
                    {messageJson && messageFormatted && (
                        <JsonOrRawBlock
                            title="Additional Data"
                            content={messageFormatted}
                            scrollHeight={300}
                        />
                    )}

                    {/* Raw Context Fallback */}
                    {!businessContext && !systemContext && !messageJson && log.context && (
                        <JsonOrRawBlock
                            title="Raw Context"
                            content={log.context}
                            scrollHeight={350}
                        />
                    )}
                </div>
            </AppLayout>
        </>
    );
}
