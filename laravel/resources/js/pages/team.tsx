import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Linkedin, Globe, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Meteors } from '@/components/ui/meteors';
import './landing.css';

interface TeamMember {
    name: string;
    role: string;
    image?: string;
    linkedin?: string;
    website?: string;
    gender?: 'male' | 'female';
}

// Team members - 7 engineers
const teamMembers: TeamMember[] = [
    {
        name: 'Mohamed Thabet',
        role: 'Software Engineer',
        image: 'https://mohamedthabt.github.io/Portfolio/assets/jpg/profile-photo-CSddyIeT.jpg',
        website: 'https://mohamedthabt.github.io/Portfolio/',
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

// Generate DiceBear avatar URL (initials style - professional)
const getAvatarUrl = (name: string, gender?: 'male' | 'female') => {
    const seed = encodeURIComponent(name);
    // Using "initials" style - standard professional fallback
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=2d3748&textColor=ffffff`;
};

// Team member card
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const primaryLink = member.linkedin || member.website;
    const avatarUrl = member.image || getAvatarUrl(member.name, member.gender);
    
    return (
        <a
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
        >
            <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white/[0.03]">
                {/* Avatar */}
                <div 
                    className="relative mb-4 w-28 h-28 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105 border-4 border-white/5 shadow-xl shadow-black/20"
                >
                    <img 
                        src={avatarUrl} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Name */}
                <h3 className="text-lg font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {member.name}
                </h3>
                
                {/* Role */}
                <p className="text-sm text-white/50 mb-3">{member.role}</p>
                
                {/* Social icons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    {member.linkedin && <Linkedin className="h-4 w-4 text-white/50 hover:text-white transition-colors" />}
                    {member.website && <Globe className="h-4 w-4 text-white/50 hover:text-white transition-colors" />}
                </div>
            </div>
        </a>
    );
};

export default function Team() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
        setIsVisible(true);
    }, []);

    return (
        <>
            <Head title="Team - Sirius" />
            
            <div className="linear-landing dark min-h-screen bg-[#030303] text-foreground">
                <section className="relative overflow-hidden min-h-screen">
                    {/* Background */}
                    <div 
                        className="absolute inset-0 pointer-events-none"
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
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-white/40 hover:text-white/70 hover:bg-transparent -ml-3 mb-6"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                                    Home
                                </Button>
                            </Link>
                        </div>

                        {/* Header */}
                        <div 
                            className="text-center mb-12"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.8s ease',
                            }}
                        >
                            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
                                The People Behind Sirius
                            </h1>
                            <p className="text-base text-white/50">
                                7 Engineers · Building the future of project planning
                            </p>
                        </div>

                        {/* Team Grid */}
                        <div 
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
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
