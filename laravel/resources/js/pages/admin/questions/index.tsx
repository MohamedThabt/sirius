import { ClientDateTime } from '@/components/ClientDateTime';
import { Button } from '@/components/ui/button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader } from '@/components/ui/futuristic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { EyeIcon, FileTextIcon } from 'lucide-react';

interface QuestionnaireAnswer {
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

interface QuestionnairesProps {
    answers: {
        data: QuestionnaireAnswer[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Questionnaires', href: '/admin/questionnaires' },
];

export default function Index({ answers }: QuestionnairesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Questionnaire Answers" />

            <PageHeader
                title="Questionnaire Answers"
                description="View onboarding answers provided by users"
                icon={<FileTextIcon className="h-6 w-6 text-primary" />}
            />

            <div className="container mx-auto space-y-6 p-4">
                <EnhancedCard variant="glass">
                    <EnhancedCardHeader>
                        <EnhancedCardTitle>Recent Answers</EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent>
                        {answers.data.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-border/30">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/40 bg-muted/20">
                                            <TableHead>User</TableHead>
                                            <TableHead>Question</TableHead>
                                            <TableHead>Answer</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {answers.data.map((answer) => (
                                            <TableRow key={answer.id} className="border-border/30 hover:bg-primary/[0.02]">
                                                <TableCell className="font-medium">
                                                    <Link href={`/admin/users/${answer.user_id}`} className="text-primary/80 hover:underline">
                                                        {answer.user.name}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">{answer.user.email}</div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">{answer.question}</TableCell>
                                                <TableCell className="max-w-[300px] truncate">{answer.answer}</TableCell>
                                                <TableCell className="whitespace-nowrap text-muted-foreground">
                                                    <ClientDateTime value={answer.created_at} dateStyle="short" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/admin/questionnaires/${answer.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <EyeIcon className="h-4 w-4" />
                                                            <span className="sr-only">View</span>
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <FileTextIcon className="mb-4 h-12 w-12 opacity-20" />
                                <h3 className="text-lg font-medium">No answers yet</h3>
                                <p className="mt-2 max-w-sm text-sm">
                                    When users complete the onboarding questionnaire, their answers will appear here.
                                </p>
                            </div>
                        )}
                    </EnhancedCardContent>
                </EnhancedCard>
            </div>
        </AppLayout>
    );
}
