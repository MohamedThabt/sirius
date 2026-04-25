import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import React from 'react';

interface SiriusStakeholderCardProps {
    role: string;
    description: string;
    responsibilities: string[];
    className?: string;
    delay?: number;
}

export const SiriusStakeholderCard: React.FC<SiriusStakeholderCardProps> = ({ role, description, responsibilities, className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay }}
            className={cn('sirius-card-hover p-6 md:p-8', className)}
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-sirius text-lg font-semibold text-foreground">{role}</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
            <ul className="space-y-2">
                {responsibilities.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-card-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default SiriusStakeholderCard;
