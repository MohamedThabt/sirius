import { Head } from '@inertiajs/react';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { Footer } from '@/components/footer';
import PricingSection from '@/components/sirius/PricingSection';

export default function Pricing() {
    return (
        <>
            <Head title="Pricing - Sirius" />

            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <SiriusNavbar />

                <main className="flex-1">
                    <PricingSection />
                </main>

                <Footer />
            </div>
        </>
    );
}
