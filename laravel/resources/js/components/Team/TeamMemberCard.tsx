import { Linkedin, Globe } from 'lucide-react';
import type { TeamMember } from '@/types';

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
                        loading="lazy"
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
