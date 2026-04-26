import { ClientDateTime } from '@/components/ClientDateTime';
import { Button } from '@/components/ui/button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, PageHeader } from '@/components/ui/futuristic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { EyeIcon, FileTextIcon, MessageSquareIcon, UserIcon } from 'lucide-react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    questionnaire_answers_count: number;
    questionnaire_answers_max_created_at: string;
}

interface QuestionnairesProps {
    users: {
        data: UserRow[];
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

export default function Index({ users }: QuestionnairesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Questionnaire Answers" />

            <PageHeader
                title="Questionnaire Answers"
                description="Users who completed the onboarding questionnaire"
                icon={<FileTextIcon className="h-6 w-6 text-primary" />}
            />

            <div className="container mx-auto space-y-6 p-4">
                <EnhancedCard variant="glass">
                    <EnhancedCardHeader>
                        <div className="flex items-center justify-between">
                            <EnhancedCardTitle>Respondents</EnhancedCardTitle>
                            <span className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground">
                                {users.total} user{users.total !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </EnhancedCardHeader>
                    <EnhancedCardContent>
                        {users.data.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-border/30">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/40 bg-muted/20">
                                            <TableHead>User</TableHead>
                                            <TableHead className="text-center">Answers</TableHead>
                                            <TableHead>Last Submitted</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id} className="border-border/30 hover:bg-primary/[0.02]">
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted/30">
                                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/admin/users/${user.id}`}
                                                                className="font-medium text-primary/80 hover:underline"
                                                            >
                                                                {user.name}
                                                            </Link>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/20 px-2 py-0.5 text-xs font-medium">
                                                        <MessageSquareIcon className="h-3 w-3" />
                                                        {user.questionnaire_answers_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                    <ClientDateTime
                                                        value={user.questionnaire_answers_max_created_at}
                                                        dateStyle="medium"
                                                        timeStyle="short"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/admin/questionnaires/${user.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                                                            <EyeIcon className="h-3.5 w-3.5" />
                                                            View answers
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
