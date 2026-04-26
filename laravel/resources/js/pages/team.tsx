import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

import { Footer } from '@/components/footer';
import { OptimizedImage } from '@/components/OptimizedImage';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { Card } from '@/components/ui/card';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import type { TeamMember } from '@/types';
import { preloadImages } from '@/utils/image-preloader';
import { Globe, Linkedin } from 'lucide-react';

// Generate DiceBear avatar URL
const getAvatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=2d3748&textColor=ffffff`;
};

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
        image: '/images/team/safi.png',
        linkedin: 'https://www.linkedin.com/in/safinaz-ahmed/',
        gender: 'female',
    },
    {
        name: 'Kyrillos Nady',
        role: 'QA & Security Engineer',
        image: '/images/team/kyrillos.png',
        website: 'https://0xk3r0.github.io/',
        gender: 'male',
    },
    {
        name: 'Dina Mohamed',
        role: 'Software Engineer',
        image: '/images/team/dina.png',
        linkedin: 'https://www.linkedin.com/in/dina-mohamed-8387aa267/',
        gender: 'female',
    },
    {
        name: 'Marwa Ayman',
        role: 'Software Engineer',
        image: '/images/team/marwa.png',
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
        image: '/images/team/mera.png',
        linkedin: 'https://www.linkedin.com/in/mera-ashraf-019438320/',
        gender: 'female',
    },
];

export default function Team() {
    // Preload team images when component mounts
    useEffect(() => {
        const imageSources = teamMembers.filter((member) => member.image).map((member) => member.image!);

        if (imageSources.length > 0) {
            preloadImages(imageSources, 'low');
        }
    }, []);

    return (
        <>
            <Head title="Team - Sirius" />

            <div className="min-h-screen bg-background text-foreground">
                <SiriusNavbar />

                <main>
                    <section className="sirius-section relative min-h-screen overflow-hidden">
                        {/* Grid Pattern Background */}
                        <GridPattern
                            width={40}
                            height={40}
                            x={-1}
                            y={-1}
                            className="absolute inset-0 h-full w-full [mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-primary/[0.02] stroke-border/40"
                            squares={[
                                [2, 3],
                                [5, 1],
                                [8, 4],
                                [12, 2],
                                [15, 5],
                                [3, 8],
                                [7, 6],
                                [10, 9],
                                [14, 7],
                                [18, 3],
                                [1, 12],
                                [6, 10],
                                [11, 13],
                                [16, 11],
                                [20, 8],
                                [4, 15],
                                [9, 14],
                                [13, 16],
                                [17, 12],
                                [21, 6],
                            ]}
                        />

                        {/* Subtle radial accent */}
                        <div className="absolute top-0 left-1/2 z-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

                        {/* Content */}
                        <div className="sirius-container relative z-10">
                            {/* Header */}
                            <div className="mb-12 flex flex-col items-center justify-center">
                                <div className="flex max-w-2xl flex-col gap-4">
                                    <span className="text-kicker text-center">Our Team</span>
                                    <h1 className="text-section-title text-center text-foreground">The People Behind Sirius</h1>
                                    <p className="text-body text-center text-muted-foreground">
                                        7 Engineers · Building the future of project planning
                                    </p>
                                </div>
                            </div>

                            {/* Team Cards Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                                {teamMembers.map((member, index) => {
                                    const primaryLink = member.linkedin || member.website;
                                    const avatarUrl = member.image || getAvatarUrl(member.name);

                                    return (
                                        <a key={index} href={primaryLink} target="_blank" rel="noopener noreferrer" className="block">
                                            <Card className="group relative h-auto w-full cursor-pointer border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                                                {/* Avatar & Info */}
                                                <div className="flex items-center">
                                                    <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-border shadow-md transition-transform duration-300 group-hover:scale-105">
                                                        <OptimizedImage
                                                            src={avatarUrl}
                                                            alt={member.name}
                                                            width={56}
                                                            height={56}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col pl-4">
                                                        <span className="text-base font-semibold text-foreground">{member.name}</span>
                                                        <span className="text-sm text-muted-foreground">{member.role}</span>
                                                    </div>
                                                </div>

                                                {/* Social Icon */}
                                                {primaryLink && (
                                                    <div className="absolute top-5 right-5 rounded-full bg-accent/50 p-2 transition-colors group-hover:bg-accent">
                                                        {member.linkedin ? (
                                                            <Linkedin className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                                        ) : (
                                                            <Globe className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
