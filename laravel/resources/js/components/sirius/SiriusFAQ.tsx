import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faqItems } from '@/lib/sirius/content';
import { motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import React from 'react';

export const SiriusFAQ: React.FC = () => {
    return (
        <div className="relative mx-auto max-w-4xl">
            <div className="absolute top-0 bottom-0 left-[23px] hidden w-px bg-border md:block" />

            <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                        <AccordionItem value={`item-${index}`} className="group relative border-0">
                            <div className="absolute top-4 left-0 z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all duration-300 group-data-[state=open]:border-primary/50 group-data-[state=open]:bg-primary/5 md:flex">
                                <PlusIcon className="h-5 w-5 text-muted-foreground transition-all duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-primary" />
                            </div>

                            <div className="md:pl-20">
                                <AccordionTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-6 py-5 text-left transition-all duration-300 group-data-[state=open]:border-primary/50 group-data-[state=open]:shadow-lg group-data-[state=open]:shadow-primary/5 hover:border-primary/30 hover:no-underline hover:shadow-md [&>svg]:hidden">
                                    <span className="font-sirius text-base font-medium text-foreground">{item.question}</span>
                                </AccordionTrigger>

                                <AccordionContent className="mt-2 rounded-xl border border-border/50 bg-card/50 px-6 py-5">
                                    <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                                </AccordionContent>
                            </div>
                        </AccordionItem>
                    </motion.div>
                ))}
            </Accordion>
        </div>
    );
};

export default SiriusFAQ;
