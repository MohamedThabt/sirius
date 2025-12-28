import { OptimizedImage } from '@/components/OptimizedImage';
import type { TeamMember } from '@/types';
import { Globe, Linkedin } from 'lucide-react';

interface TeamMemberCardProps {
    member: TeamMember;
}

// Generate DiceBear avatar URL (initials style - professional)
const getAvatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=2d3748&textColor=ffffff`;
};

export const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
    const primaryLink = member.linkedin || member.website;
    const avatarUrl = member.image || getAvatarUrl(member.name);

    return (
        <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="flex flex-col items-center rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white/[0.03]">
                {/* Avatar */}
                <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-white/5 shadow-xl shadow-black/20 transition-transform duration-300 group-hover:scale-105">
                    <OptimizedImage src={avatarUrl} alt={member.name} width={112} height={112} className="h-full w-full object-cover" />
                </div>

                {/* Name */}
                <h3 className="mb-1 text-lg font-medium text-white transition-colors group-hover:text-indigo-300">{member.name}</h3>

                {/* Role */}
                <p className="mb-3 text-sm text-white/50">{member.role}</p>

                {/* Social icons */}
                <div className="flex translate-y-2 items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {member.linkedin && <Linkedin className="h-4 w-4 text-white/50 transition-colors hover:text-white" />}
                    {member.website && <Globe className="h-4 w-4 text-white/50 transition-colors hover:text-white" />}
                </div>
            </div>
        </a>
    );
};
