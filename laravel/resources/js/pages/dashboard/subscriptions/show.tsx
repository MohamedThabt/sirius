import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, Receipt, UserIcon, CreditCard, CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
}

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: string;
    credits_per_cycle: number;
    billing_cycle: string;
}

interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    status: string;
    started_at: string;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    plan: Plan;
}

interface Props {
    subscription: Subscription;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
    },
    {
        title: 'Subscription Details',
        href: '#',
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge variant="default" className="bg-green-500/10 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
        case 'cancelled':
            return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
        case 'expired':
            return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function SubscriptionShow({ subscription }: Props) {
    const formatPrice = (price: string | number): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(numPrice);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subscription Details - ${subscription.user.name}`} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/subscriptions">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Subscription Details</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Subscription Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Receipt className="h-4 w-4" />
                                Subscription Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Subscription #{subscription.id}</h3>
                                <p className="text-sm text-muted-foreground">Subscription Details</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Status</span>
                                    </div>
                                    {getStatusBadge(subscription.status)}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Started At</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {new Date(subscription.started_at).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Ends At</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {subscription.ends_at ? new Date(subscription.ends_at).toLocaleString() : 'No end date'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Created {new Date(subscription.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plan Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <CreditCard className="h-4 w-4" />
                                Plan Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">{subscription.plan.name}</h3>
                                <p className="text-sm text-muted-foreground">Subscription Plan</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Price</span>
                                    </div>
                                    <Badge variant="outline" className="text-lg font-semibold">
                                        {formatPrice(subscription.plan.price)}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Credits per Cycle</span>
                                    </div>
                                    <Badge variant="outline" className="text-lg font-semibold">
                                        {subscription.plan.credits_per_cycle} credits
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Billing Cycle</span>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {subscription.plan.billing_cycle}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <UserIcon className="h-4 w-4" />
                            User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            {subscription.user.avatar ? (
                                <img src={subscription.user.avatar} alt={subscription.user.name} className="h-16 w-16 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-medium">
                                    {subscription.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-medium">{subscription.user.name}</h3>
                                <p className="text-sm text-muted-foreground">{subscription.user.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Joined {new Date(subscription.user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="ml-auto">
                                <Button
                                    onClick={() => router.visit(`/admin/users/${subscription.user.id}`)}
                                    variant="outline"
                                >
                                    View User Profile
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
