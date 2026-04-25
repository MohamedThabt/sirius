import { Footer } from '@/components/footer';
import PricingSection from '@/components/sirius/PricingSection';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { Head } from '@inertiajs/react';

export default function Pricing() {
    return (
        <>
            <Head title="Pricing - Sirius" />

            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <SiriusNavbar />

                <main className="flex-1">
                    <PricingSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
