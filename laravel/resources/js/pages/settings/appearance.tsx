import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import SettingsLayout from '@/layouts/settings/layout';

function Appearance() {
    return (
        <>
            <Head title="Appearance Settings" />

            <header className="mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Appearance Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Customize your application's appearance</p>
                </div>
            </header>

            <div className="space-y-6">
                <div className="rounded border p-6">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-foreground">Theme</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Select your preferred theme</p>
                    </div>
                    <AppearanceTabs />
                </div>
            </div>
        </>
    );
}

Appearance.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Appearance;
