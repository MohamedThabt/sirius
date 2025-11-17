import { Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { CreditCardIcon } from 'lucide-react';
import SettingsLayout from '@/layouts/settings/layout';

function Billing() {
    return (
        <>
            <Head title="Billing Settings" />

            <header className="mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and billing information</p>
                </div>
            </header>

            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Current Plan */}
                    <div className="rounded border p-6">
                        <div className="mb-6">
                            <h2 className="text-base font-semibold text-foreground">Current Plan</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Your active subscription details</p>
                        </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Pro Plan</h3>
                                    <p className="text-sm text-muted-foreground">$29/month</p>
                                </div>
                                <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-500/10 dark:text-green-300">
                                    Active
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-muted-foreground">Unlimited projects</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-muted-foreground">Advanced AI features</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-muted-foreground">Priority support</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-muted-foreground">Export capabilities</span>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" className="w-full">
                                    Change Plan
                                </Button>
                            </div>
                    </div>

                    {/* Payment Method */}
                    <div className="rounded border p-6">
                        <div className="mb-6">
                            <h2 className="text-base font-semibold text-foreground">Payment Method</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Manage your payment information</p>
                        </div>
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <div className="flex h-10 w-16 items-center justify-center rounded bg-blue-600 text-white">
                                    <CreditCardIcon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                    Edit
                                </Button>
                            </div>
                            <Button variant="outline" className="w-full">
                                Add New Payment Method
                            </Button>
                    </div>
                </div>

                {/* Billing History */}
                <div className="rounded border p-6">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Billing History</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Your recent invoices and payments</p>
                    </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Pro Plan - Monthly</p>
                                        <p className="text-sm text-muted-foreground">December 2024</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-foreground">$29.00</p>
                                    <p className="text-sm text-green-600">Paid</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Pro Plan - Monthly</p>
                                        <p className="text-sm text-muted-foreground">November 2024</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-foreground">$29.00</p>
                                    <p className="text-sm text-green-600">Paid</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Pro Plan - Monthly</p>
                                        <p className="text-sm text-muted-foreground">October 2024</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-foreground">$29.00</p>
                                    <p className="text-sm text-green-600">Paid</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button variant="outline" className="w-full">
                                View All Invoices
                            </Button>
                        </div>
                </div>
            </div>
        </>
    );
}

Billing.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Billing;
