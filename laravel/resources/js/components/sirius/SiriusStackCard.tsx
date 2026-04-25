import { motion } from 'framer-motion';
import { Brain, Code, FileText, Layers } from 'lucide-react';
import React from 'react';

export const SiriusStackCard: React.FC = () => {
    const layers = [
        { icon: FileText, label: 'Brief Input', color: 'from-primary/10 to-primary/20' },
        { icon: Layers, label: 'PRD / SRS / ERD', color: 'from-muted/30 to-muted/40' },
        { icon: Brain, label: 'AI Processing', color: 'from-accent/20 to-accent/30' },
        { icon: Code, label: 'Code Prompts', color: 'from-primary/15 to-primary/25' },
    ];

    return (
        <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative space-y-3">
                {layers.map((layer, index) => (
                    <motion.div
                        key={layer.label}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ x: 8, scale: 1.02 }}
                        className={`relative flex items-center gap-4 rounded-lg bg-gradient-to-r p-4 ${layer.color} cursor-pointer border border-border/50 backdrop-blur-sm transition-all duration-300`}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                            <layer.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-sirius font-medium text-foreground">{layer.label}</span>

                        {index < layers.length - 1 && (
                            <motion.div
                                className="absolute -bottom-3 left-7 h-3 w-px bg-gradient-to-b from-primary/50 to-primary/20"
                                initial={{ scaleY: 0 }}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="absolute top-1/2 -right-4 h-2 w-2 rounded-full bg-primary"
                animate={{ y: [-20, 20, -20], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute top-1/3 -left-4 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                animate={{ y: [20, -20, 20], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
};

export default SiriusStackCard;
