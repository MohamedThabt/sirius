import { ClientDateTime } from '@/components/ClientDateTime';
import { Button } from '@/components/ui/button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader } from '@/components/ui/futuristic';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, UserIcon } from 'lucide-react';

interface UserQuestionAnswer {
    id: number;
    user_id: number;
    question: string;
    answer: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface ShowProps {
    question: UserQuestionAnswer;
}

export default function Show({ question }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Questionnaires', href: '/admin/questionnaires' },
        { title: 'Answer Details' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Answer Details - ${question.user.name}`} />

            <PageHeader
                title="Answer Details"
                description={`View specific questionnaire details for ${question.user.name}`}
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
                <EnhancedCard variant="glass">
                    <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-blue-500" />
                            User Details
                        </EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent>
                        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 md:flex-row md:items-center">
                            <div>
                                <h3 className="text-lg font-medium">
                                    <Link href={`/admin/users/${question.user.id}`} className="text-primary/90 hover:underline">
                                        {question.user.name}
                                    </Link>
                                </h3>
                                <p className="text-muted-foreground">{question.user.email}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                Submitted on <ClientDateTime value={question.created_at} dateStyle="medium" timeStyle="short" />
                            </div>
                        </div>
                    </EnhancedCardContent>
                </EnhancedCard>

                <EnhancedCard variant="glass">
                    <EnhancedCardHeader>
                        <EnhancedCardTitle className="flex items-center gap-2">
                            <FileTextIcon className="h-5 w-5 text-purple-500" />
                            Question & Answer
                        </EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent className="space-y-6">
                        <div className="space-y-2 rounded-xl border border-border/40 bg-card/50 p-4">
                            <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Question</h4>
                            <p className="text-lg leading-relaxed font-medium">{question.question}</p>
                        </div>

                        <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                            <h4 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Answer</h4>
                            <p className="text-base leading-relaxed whitespace-pre-wrap text-card-foreground">{question.answer}</p>
                        </div>
                    </EnhancedCardContent>
                </EnhancedCard>
            </div>
        </AppLayout>
    );
}
