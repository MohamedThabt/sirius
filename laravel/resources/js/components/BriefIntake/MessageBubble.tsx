import { ClarificationCard } from '@/components/BriefIntake/ClarificationCard';
import type { BriefMessage, ClarificationAnswer } from '@/components/BriefIntake/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ArrowRightIcon, BotIcon, FileIcon, GitBranchIcon, UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
    message: BriefMessage;
    projectId: number;
    onClarificationSubmit?: (answers: ClarificationAnswer[]) => void;
    isClarificationSubmitted?: boolean;
    isPending?: boolean;
}

export function MessageBubble({
    message,
    projectId,
    onClarificationSubmit,
    isClarificationSubmitted = false,
    isPending = false,
}: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`group flex gap-3 py-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div
                className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                    isUser
                        ? 'border-primary/30 bg-primary text-primary-foreground'
                        : 'border-border/70 bg-card',
                )}
            >
                {isUser ? (
                    <UserIcon className="h-3 w-3" />
                ) : (
                    <BotIcon className="h-3 w-3 text-muted-foreground" />
                )}
            </div>

            <div className={cn('max-w-[94%] space-y-1.5 sm:max-w-[88%]', isUser && 'text-right')}>
                <div
                    className={cn(
                        'inline-block rounded-2xl border px-3.5 py-2.5 text-[13px] leading-relaxed',
                        isUser
                            ? 'border-primary/50 bg-primary text-primary-foreground shadow-sm'
                            : 'border-border/70 bg-card text-foreground',
                    )}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="m-0 whitespace-pre-wrap">{children}</p>,
                            ul: ({ children }) => <ul className="my-1 list-inside list-disc text-left">{children}</ul>,
                            ol: ({ children }) => <ol className="my-1 list-inside list-decimal text-left">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn('underline underline-offset-2', isUser ? 'text-primary-foreground/90' : 'text-primary')}
                                >
                                    {children}
                                </a>
                            ),
                            code: ({ className, children, ...props }) => {
                                const isInline = !className?.includes('language-');
                                if (isInline) {
                                    return (
                                        <code
                                            className={cn(
                                                'rounded px-1 py-0.5 font-mono text-[12px]',
                                                isUser ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-foreground',
                                            )}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                }
                                return <code className={className} {...props}>{children}</code>;
                            },
                            pre: ({ children }) => (
                                <pre
                                    className={cn(
                                        'my-2 overflow-x-auto rounded-md border px-2 py-1.5 text-left text-xs',
                                        isUser ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-border/70 bg-muted/40',
                                    )}
                                >
                                    {children}
                                </pre>
                            ),
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>

                    {message.kind === 'clarification' && message.clarification && onClarificationSubmit && (
                        <ClarificationCard
                            questions={message.clarification.questions}
                            onSubmit={onClarificationSubmit}
                            isSubmitted={isClarificationSubmitted}
                            isPending={isPending}
                        />
                    )}

                    {message.kind === 'ready' && (
                        <div className="mt-4 border-t border-border/30 pt-3">
                            <Button
                                size="sm"
                                variant="sirius"
                                className="w-full gap-2"
                                onClick={() => router.visit(`/projects/${projectId}/system-overview`)}
                            >
                                Continue to System Overview
                                <ArrowRightIcon className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>

                {message.attachments && message.attachments.length > 0 && (
                    <div className={cn('flex flex-wrap gap-1.5', isUser ? 'justify-end' : 'justify-start')}>
                        {message.attachments.map((att) => (
                            <span
                                key={att.id}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/80 px-2 py-1 text-[11px] text-muted-foreground"
                            >
                                {att.type === 'file' ? (
                                    <FileIcon className="h-3 w-3" />
                                ) : (
                                    <GitBranchIcon className="h-3 w-3" />
                                )}
                                {att.name}
                                <span
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        att.status === 'processed' ? 'bg-emerald-500' : att.status === 'pending' ? 'bg-amber-500' : 'bg-red-500',
                                    )}
                                />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
