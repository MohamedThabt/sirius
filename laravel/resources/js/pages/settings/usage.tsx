import { type Credits, type UsagePlan, type GraphData, type UsageLog, type PaginatedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useState, useCallback } from 'react';
import SettingsLayout from '@/layouts/settings/layout';

// WHY: Extracted components keep this file focused on layout and data flow
import { CreditsOverview } from './usage/CreditsOverview';
import { UsageChart } from './usage/UsageChart';
import { UsageLogsTable } from './usage/UsageLogsTable';

// @ts-ignore - route helper is available globally via Ziggy
declare function route(name: string, params?: any): string;

interface Props {
    credits: Credits;
    plan: UsagePlan | null;
    graphData: GraphData[];
    usageLogs: PaginatedData<UsageLog>;
    totalConsumedCredits: number;
}

function Usage({ credits, plan, graphData, usageLogs, totalConsumedCredits }: Props) {
    useFlashToasts();
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

            <header className="mb-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Usage & Credits</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">Monitor your AI usage and credit consumption</p>
                </div>
            </header>

            <div className="space-y-4">
                <CreditsOverview
                    credits={credits}
                    plan={plan}
                    purchaseDialogOpen={purchaseDialogOpen}
                    setPurchaseDialogOpen={setPurchaseDialogOpen}
                    onPurchase={handlePurchase}
                    processing={processing}
                />

                <UsageChart graphData={graphData} />

                <UsageLogsTable
                    usageLogs={usageLogs}
                    totalConsumedCredits={totalConsumedCredits}
                />
            </div>
        </>
    );
}

Usage.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Usage;
