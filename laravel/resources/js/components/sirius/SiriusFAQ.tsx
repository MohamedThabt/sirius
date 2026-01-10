import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusIcon } from "lucide-react";
import { faqItems } from "@/lib/sirius/content";

export const SiriusFAQ: React.FC = () => {
  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute top-0 bottom-0 left-[23px] w-px bg-border hidden md:block" />

      <Accordion type="single" collapsible className="space-y-4">
        {faqItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <AccordionItem
              value={`item-${index}`}
              className="group relative border-0"
            >
              <div className="absolute left-0 top-4 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all duration-300 group-data-[state=open]:border-primary/50 group-data-[state=open]:bg-primary/5">
                <PlusIcon className="h-5 w-5 text-muted-foreground transition-all duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-primary" />
              </div>

              <div className="md:pl-20">
                <AccordionTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-6 py-5 text-left transition-all duration-300 hover:no-underline hover:border-primary/30 hover:shadow-md group-data-[state=open]:border-primary/50 group-data-[state=open]:shadow-lg group-data-[state=open]:shadow-primary/5 [&>svg]:hidden">
                  <span className="font-sirius font-medium text-foreground text-base">
                    {item.question}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="mt-2 rounded-xl border border-border/50 bg-card/50 px-6 py-5">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </p>
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
