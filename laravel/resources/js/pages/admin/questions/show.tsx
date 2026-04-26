import { ClientDateTime } from '@/components/ClientDateTime';
import { Button } from '@/components/ui/button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, MessageSquareIcon, UserIcon } from 'lucide-react';

interface Answer {
    id: number;
    question: string;
    answer: string;
    created_at: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
}

interface ShowProps {
    user: UserInfo;
    answers: Answer[];
}

export default function Show({ user, answers }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Questionnaires', href: '/admin/questionnaires' },
        { title: user.name },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Questionnaire — ${user.name}`} />

            <PageHeader
                title="Questionnaire Answers"
                description={`All onboarding answers for ${user.name}`}
                icon={<FileTextIcon className="h-6 w-6 text-primary" />}
                action={
                    <Link href="/admin/questionnaires">
                        <Button variant="outline" className="border-border/40 bg-card/30 backdrop-blur-sm">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                }
            />

            <div className="container mx-auto space-y-6 p-4">
                {/* User card */}
                <EnhancedCard variant="glass">
                    <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-blue-500" />
                            User
                        </EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent>
                        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 md:flex-row md:items-center">
                            <div>
                                <h3 className="text-lg font-medium">
                                    <Link href={`/admin/users/${user.id}`} className="text-primary/90 hover:underline">
                                        {user.name}
                                    </Link>
                                </h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-3 py-1 text-sm text-muted-foreground">
                                <MessageSquareIcon className="h-3.5 w-3.5" />
                                {answers.length} answer{answers.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </EnhancedCardContent>
                </EnhancedCard>

                {/* Q&A pairs */}
                <EnhancedCard variant="glass">
                    <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                            <FileTextIcon className="h-5 w-5 text-purple-500" />
                            Answers
                        </EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent className="space-y-4">
                        {answers.length > 0 ? (
                            answers.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-border/30 bg-card/40 overflow-hidden"
                                >
                                    {/* Question row */}
                                    <div className="flex items-start justify-between gap-3 border-b border-border/20 bg-muted/10 px-4 py-3">
                                        <div className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary/70">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm font-semibold text-foreground">{item.question}</p>
                                        </div>
                                        <div className="flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarIcon className="h-3 w-3" />
                                            <ClientDateTime value={item.created_at} dateStyle="short" timeStyle="short" />
                                        </div>
                                    </div>
                                    {/* Answer row */}
                                    <div className="px-4 py-3">
                                        <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                <MessageSquareIcon className="mx-auto mb-3 h-8 w-8 opacity-20" />
                                <p className="text-sm">No answers recorded.</p>
                            </div>
                        )}
                    </EnhancedCardContent>
                </EnhancedCard>
            </div>
        </AppLayout>
    );
}
