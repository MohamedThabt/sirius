import { motion } from 'framer-motion';
import { Database, FileCode, GitBranch } from 'lucide-react';
import React from 'react';

export const SiriusDatabaseFlowCard: React.FC = () => {
    const nodes = [
        { icon: Database, label: 'ERDs', x: 0, y: 50 },
        { icon: FileCode, label: 'Specs', x: 45, y: 0 },
        { icon: GitBranch, label: 'GitHub', x: 90, y: 50 },
    ];

    return (
        <div className="relative mx-auto h-[200px] w-full max-w-lg">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                    d="M 12 55 Q 30 30 48 25"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.5"
                    strokeDasharray="4 2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                />
                <motion.path
                    d="M 52 25 Q 70 30 88 55"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.5"
                    strokeDasharray="4 2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
            </svg>

            {nodes.map((node, index) => (
                <motion.div
                    key={node.label}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transform"
                    style={{ left: `${node.x + 5}%`, top: `${node.y + 25}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                >
                    <motion.div
                        className="sirius-card flex cursor-pointer flex-col items-center gap-2 p-4"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <node.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap text-foreground">{node.label}</span>
                    </motion.div>
                </motion.div>
            ))}

            <motion.div
                className="absolute top-[40%] left-[25%] h-1.5 w-1.5 rounded-full bg-primary"
                animate={{
                    x: [0, 100, 200],
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div
                className="absolute top-[30%] left-[60%] h-1 w-1 rounded-full bg-muted-foreground"
                animate={{
                    x: [0, 50, 100],
                    y: [0, 20, 0],
                    opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.5 }}
            />
        </div>
    );
};

export default SiriusDatabaseFlowCard;
