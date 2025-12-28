import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TeamMemberCard } from '@/components/Team/TeamMemberCard';
import { Button } from '@/components/ui/button';
import { Meteors } from '@/components/ui/meteors';
import { useForceTheme } from '@/hooks/use-force-theme';
import type { TeamMember } from '@/types';
import { preloadImages } from '@/utils/image-preloader';
import './landing.css';

// Team members - 7 engineers
const teamMembers: TeamMember[] = [
    {
        name: 'Mohamed Thabet',
        role: 'Software Engineer',
        image: '/images/team/mohamed-thabet.png',
        website: 'https://sirthabet.dev/',
        gender: 'male',
    },
    {
        name: 'Safinaz Ahmed',
        role: 'Data & AI Engineer',
        linkedin: 'https://www.linkedin.com/in/safinaz-ahmed/',
        gender: 'female',
    },
    {
        name: 'Kyrillos Nady',
        role: 'Penetration Tester',
        image: '/images/team/kyrillos.png',
        website: 'https://0xk3r0.github.io/',
        gender: 'male',
    },
    {
        name: 'Dina Mohamed',
        role: 'Software Engineer',
        linkedin: 'https://www.linkedin.com/in/dina-mohamed-8387aa267/',
        gender: 'female',
    },
    {
        name: 'Marwa Ayman',
        role: 'Software Engineer',
        linkedin: 'https://www.linkedin.com/in/marwa-ayman-5a66a7254/',
        gender: 'female',
    },
    {
        name: 'Mohamed Sayed',
        role: 'Software Engineer',
        image: '/images/team/mohamed-sayed.png',
        linkedin: 'https://www.linkedin.com/in/mohamed-sayed-10b892172/',
        gender: 'male',
    },
    {
        name: 'Mera Ashraf',
        role: 'Software Engineer',
        linkedin: 'https://www.linkedin.com/in/mera-ashraf-019438320/',
        gender: 'female',
    },
];

export default function Team() {
    useForceTheme('dark');
    const [isVisible, setIsVisible] = useState(false);

    // Preload team images when component mounts
    useEffect(() => {
        const imageSources = teamMembers.filter((member) => member.image).map((member) => member.image!);

        if (imageSources.length > 0) {
            preloadImages(imageSources, 'low');
        }
    }, []);

    // Simple entrance animation effect
    useEffect(() => {
        // Just trigger the state change on mount for the fade-in classes
        // Note: Using a timeout to ensure initial render is 0 opacity
        setTimeout(() => setIsVisible(true), 50);
    }, []);

    return (
        <>
            <Head title="Team - Sirius" />

            <div className="linear-landing dark min-h-screen bg-[#030303] text-foreground">
                <section className="relative min-h-screen overflow-hidden">
                    {/* Background */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)`,
                        }}
                    />
                    <Meteors number={10} minDuration={5} maxDuration={15} />

                    {/* Content */}
                    <div className="relative z-10 mx-auto max-w-5xl px-6 pt-4 pb-16">
                        {/* Back button */}
                        <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.6s ease' }}>
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-white/40 hover:bg-transparent hover:text-white/70">
                                    <ArrowLeft className="mr-1.5 h-5 w-5" />
                                    Home
                                </Button>
                            </Link>
                        </div>

                        {/* Header */}
                        <div
                            className="mb-12 text-center"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.8s ease',
                            }}
                        >
                            <h1 className="mb-3 text-3xl font-semibold text-white md:text-4xl">The People Behind Sirius</h1>
                            <p className="text-base text-white/50">7 Engineers · Building the future of project planning</p>
                        </div>

                        {/* Team Grid */}
                        <div
                            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                                transition: 'all 0.8s ease 0.15s',
                            }}
                        >
                            {teamMembers.map((member) => (
                                <TeamMemberCard key={member.name} member={member} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
