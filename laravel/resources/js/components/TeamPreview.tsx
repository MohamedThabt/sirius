import { router } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface TeamPreviewProps {
    projectId: number;
    members: TeamMember[];
    totalCount: number;
}

export function TeamPreview({ projectId, members, totalCount }: TeamPreviewProps) {
    const getInitials = useInitials();
    const displayMembers = members.slice(0, 4);
    const remainingCount = totalCount - displayMembers.length;

    return (
        <div
            className="group cursor-pointer rounded border p-4 transition-colors hover:bg-muted/40"
            onClick={() => router.visit(`/projects/${projectId}/team`)}
        >
            <div className="mb-1 text-xs font-medium text-muted-foreground">Team</div>
            <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                    {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
                </span>
            </div>
            
            {displayMembers.length > 0 ? (
                <div className="flex items-center">
                    <div className="flex -space-x-2">
                        {displayMembers.map((member, index) => (
                            <Avatar
                                key={member.id}
                                className="h-8 w-8 border-2 border-background ring-0 transition-transform group-hover:translate-y-[-2px]"
                                style={{ zIndex: displayMembers.length - index }}
                                title={member.name}
                            >
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="text-xs bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    {remainingCount > 0 && (
                        <div className="ml-2 text-xs text-muted-foreground">
                            +{remainingCount} more
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-xs text-muted-foreground">No team members yet</div>
            )}
            
            <div className="mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Click to manage team →
            </div>
        </div>
    );
}
