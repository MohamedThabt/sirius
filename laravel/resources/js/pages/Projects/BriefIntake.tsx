import { Breadcrumbs } from '@/components/breadcrumbs';
import { BriefComposer } from '@/components/BriefIntake/BriefComposer';
import { ContextPanel } from '@/components/BriefIntake/ContextPanel';
import { MessageBubble } from '@/components/BriefIntake/MessageBubble';
import {
    type BriefContext,
    type BriefMessage,
    type ClarificationAnswer,
    createMockClarificationResponse,
    createMockContext,
    createMockReadyResponse,
} from '@/components/BriefIntake/mockData';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type Sections, type User } from '@/types';
import { getHealthStatus } from '@/utils/project-status';
import { Head, usePage } from '@inertiajs/react';
import { BotIcon, MenuIcon, MessageSquareIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    project: Project;
    sections?: Sections;
    hasModules?: boolean;
}

type IntakeStatus = 'draft' | 'clarifying' | 'processing' | 'ready';

export default function BriefIntake({
    project,
    sections = { overview: null, prd: null, data_modeling: null, non_functional_requirements: null },
    hasModules = false,
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;

    const [messages, setMessages] = useState<BriefMessage[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [intakeStatus, setIntakeStatus] = useState<IntakeStatus>('draft');
    const [context, setContext] = useState<BriefContext | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [submittedClarificationIds, setSubmittedClarificationIds] = useState<Set<string>>(new Set());

    const chatEndRef = useRef<HTMLDivElement>(null);
    const userBriefRef = useRef<string>('');

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPending]);

    const completionPercentage = useMemo(() => project?.progress ?? 0, [project]);
    const health = useMemo(() => getHealthStatus(completionPercentage), [completionPercentage]);

    const navGroups = useMemo(() => {
        if (!project) return [];
        return buildProjectNavGroups({ project, currentPage: 'brief', mode: 'full', sections, hasModules });
    }, [project, sections, hasModules]);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Brief Intake', href: `/projects/${project.id}/brief-intake` },
    ];

    const simulateAgentResponse = useCallback((responseFactory: () => BriefMessage, newStatus: IntakeStatus) => {
        setIsPending(true);
        setTimeout(() => {
            const agentMsg = responseFactory();
            setMessages((prev) => [...prev, agentMsg]);
            setIntakeStatus(newStatus);
            setIsPending(false);

            if (newStatus === 'ready' || newStatus === 'clarifying') {
                setContext(createMockContext(userBriefRef.current));
            }
        }, 1500);
    }, []);

    const handleSendMessage = useCallback(
        (message: { content: string; files: File[]; repoUrls: string[] }) => {
            const userMsg: BriefMessage = {
                id: crypto.randomUUID(),
                client_message_id: crypto.randomUUID(),
                role: 'user',
                kind: message.files.length > 0 || message.repoUrls.length > 0 ? 'attachments' : 'text',
                content: message.content,
                attachments: [
                    ...message.files.map((f) => ({
                        type: 'file' as const,
                        id: crypto.randomUUID(),
                        name: f.name,
                        status: 'processed' as const,
                    })),
                    ...message.repoUrls.map((url) => ({
                        type: 'repo' as const,
                        id: crypto.randomUUID(),
                        name: url.split('github.com/')[1] || url,
                        status: 'processed' as const,
                    })),
                ],
                status: 'completed',
                created_at: new Date().toISOString(),
            };

            userBriefRef.current = message.content || userBriefRef.current;
            setMessages((prev) => [...prev, userMsg]);
            setIntakeStatus('processing');

            simulateAgentResponse(
                () => createMockClarificationResponse(message.content),
                'clarifying',
            );
        },
        [simulateAgentResponse],
    );

    const handleClarificationSubmit = useCallback(
        (messageId: string, answers: ClarificationAnswer[]) => {
            setSubmittedClarificationIds((prev) => new Set(prev).add(messageId));

            const answerMsg: BriefMessage = {
                id: crypto.randomUUID(),
                client_message_id: crypto.randomUUID(),
                role: 'user',
                kind: 'clarification_answer',
                content: 'Answers submitted',
                answers,
                in_reply_to_message_id: messageId,
                status: 'completed',
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, answerMsg]);
            setIntakeStatus('processing');

            simulateAgentResponse(createMockReadyResponse, 'ready');
        },
        [simulateAgentResponse],
    );

    return (
        <>
            <Head title={`Brief Intake - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        completionPercentage={completionPercentage}
                        health={health}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="min-w-0 flex-1">
                        <div className="flex h-screen flex-col">
                            <div className="border-b border-border/50 bg-card/20 px-4 py-3 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between gap-2 sm:gap-3">
                                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 border border-border/50 bg-background p-0 hover:bg-muted lg:hidden"
                                                >
                                                    <MenuIcon className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="left" className="w-64 border-none bg-transparent p-0">
                                                <ProjectSidebarPanel
                                                    project={project}
                                                    navGroups={navGroups}
                                                    completionPercentage={completionPercentage}
                                                    health={health}
                                                    isCollapsed={false}
                                                    user={auth.user}
                                                    isMobileSheet={true}
                                                />
                                            </SheetContent>
                                        </Sheet>
                                        <SidebarToggle
                                            isCollapsed={isSidebarCollapsed}
                                            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                        />
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ContextPanel context={context} />
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card">
                                                <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <h2 className="mb-2 text-lg font-medium text-foreground">Start Your Project Brief</h2>
                                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                                                Describe your project idea, paste an existing brief, or upload documents.
                                                The AI will analyze your input and ask clarifying questions to build a complete project specification.
                                            </p>
                                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                                {['Paste a project brief', 'Upload a spec document', 'Link a GitHub repo'].map((hint) => (
                                                    <span
                                                        key={hint}
                                                        className="rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground"
                                                    >
                                                        {hint}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {messages.map((msg) => (
                                                <MessageBubble
                                                    key={msg.id}
                                                    message={msg}
                                                    projectId={project.id}
                                                    onClarificationSubmit={
                                                        msg.kind === 'clarification'
                                                            ? (answers) => handleClarificationSubmit(msg.id, answers)
                                                            : undefined
                                                    }
                                                    isClarificationSubmitted={submittedClarificationIds.has(msg.id)}
                                                    isPending={isPending}
                                                />
                                            ))}

                                            {isPending && (
                                                <div className="flex gap-3 py-1.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card">
                                                        <BotIcon className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                    <div className="inline-block rounded-2xl border border-border/70 bg-card px-3.5 py-2.5">
                                                        <TextShimmer className="text-[13px]">Analyzing your brief...</TextShimmer>
                                                    </div>
                                                </div>
                                            )}

                                            <div ref={chatEndRef} />
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {intakeStatus !== 'ready' && (
                                <div className="border-t border-border/50 bg-background">
                                    <div className="mx-auto max-w-3xl">
                                        <BriefComposer
                                            onSubmit={handleSendMessage}
                                            isPending={isPending}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
