import { PlanBadge } from '@/components/plan-badge';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import SettingsLayout from '@/layouts/settings/layout';
import { type Credits, type GraphData, type PaginatedData, type SharedData, type Subscription, type UsageLog, type UsagePlan } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

// WHY: Extracted components keep this file focused on layout and data flow
import { CreditsOverview } from './usage/CreditsOverview';
import { UsageChart } from './usage/UsageChart';
import { UsageLogsTable } from './usage/UsageLogsTable';

// @ts-ignore - route helper is available globally via Ziggy
declare function route(name: string, params?: any): string;

interface Props {
    credits: Credits;
    plan: UsagePlan | null;
    subscription: Subscription | null;
    graphData: GraphData[];
    usageLogs: PaginatedData<UsageLog>;
    totalConsumedCredits: number;
}

function Usage({ credits, plan, subscription, graphData, usageLogs, totalConsumedCredits }: Props) {
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

    const { post, processing } = useForm({
        credits_package: '250',
    });

    // WHY: useCallback prevents function recreation on each render
    const handlePurchase = useCallback(() => {
        post(route('usage.purchase'), {
            preserveScroll: true,
            onSuccess: () => {
                setPurchaseDialogOpen(false);
            },
        });
    }, [post]);

    return (
        <>
            <Head title="Usage & Credits" />

            <header className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Usage & Credits</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Monitor your AI usage and credit consumption</p>
                    </div>
                    {auth.user.plan && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Current Plan:</span>
                            <PlanBadge plan={auth.user.plan} className="text-xs" />
                        </div>
                    )}
                </div>
            </header>

            <div className="space-y-4">
                <CreditsOverview
                    credits={credits}
                    plan={plan}
                    subscription={subscription}
                    purchaseDialogOpen={purchaseDialogOpen}
                    setPurchaseDialogOpen={setPurchaseDialogOpen}
                    onPurchase={handlePurchase}
                    processing={processing}
                />

                <UsageChart graphData={graphData} />

                <UsageLogsTable usageLogs={usageLogs} totalConsumedCredits={totalConsumedCredits} />
            </div>
        </>
    );
}

Usage.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Usage;
