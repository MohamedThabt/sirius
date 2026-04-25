import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ActivityIcon, ArrowLeftIcon, ClockIcon, CoinsIcon, CpuIcon, DollarSignIcon, UserIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface UsageLog {
    id: number;
    user_id: number;
    action_type: string;
    model: string | null;
    input_tokens: number;
    output_tokens: number;
    credits_used: number;
    cost: string | null;
    created_at: string;
    user: User;
}

interface Props {
    log: UsageLog;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Usage Logs',
        href: '/admin/usage-logs',
    },
    {
        title: 'Log Details',
        href: '#',
    },
];

export default function UsageLogShow({ log }: Props) {
    const formatActionType = (actionType: string) => {
        return actionType
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getActionTypeColor = (actionType: string) => {
        if (actionType.includes('generation')) {
            return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
        }
        if (actionType.includes('edit')) {
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        }
        if (actionType.includes('sync')) {
            return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
        }
        if (actionType.includes('enrichment') || actionType.includes('suggestion')) {
            return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
        }
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usage Log #${log.id}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/usage-logs">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Usage Log Details</h1>
                    <Badge variant="outline" className="ml-auto">
                        #{log.id}
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                <CpuIcon className="h-4 w-4" />
                                Input Tokens
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{log.input_tokens.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                <CpuIcon className="h-4 w-4" />
                                Output Tokens
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{log.output_tokens.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                <CoinsIcon className="h-4 w-4" />
                                Credits Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{log.credits_used.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                <DollarSignIcon className="h-4 w-4" />
                                Cost
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{log.cost ? `$${parseFloat(log.cost).toFixed(4)}` : '-'}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* User Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <UserIcon className="h-4 w-4" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {log.user?.avatar ? (
                                    <img src={log.user.avatar} alt={log.user.name} className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-medium">
                                        {log.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium">{log.user?.name || 'Unknown User'}</h3>
                                    <p className="text-sm text-muted-foreground">{log.user?.email || '-'}</p>
                                </div>
                            </div>
                            {log.user && (
                                <Link href={`/admin/users/${log.user.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        View User Profile
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Log Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <ActivityIcon className="h-4 w-4" />
                                Log Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Action Type</span>
                                <Badge variant="outline" className={getActionTypeColor(log.action_type)}>
                                    {formatActionType(log.action_type)}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">AI Model</span>
                                {log.model ? <Badge variant="outline">{log.model}</Badge> : <span className="text-sm">-</span>}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Tokens</span>
                                <span className="font-mono font-medium">{(log.input_tokens + log.output_tokens).toLocaleString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* View User's Usage Logs */}
                {log.user && (
                    <Link href={`/admin/usage-logs?user_id=${log.user.id}`}>
                        <Button variant="outline" className="w-full">
                            View All Logs for {log.user.name}
                        </Button>
                    </Link>
                )}
            </div>
        </AppLayout>
    );
}
