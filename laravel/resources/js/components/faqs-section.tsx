import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusIcon } from "lucide-react";
import { faqItems } from "@/lib/sirius/content";

export function FaqsSection() {
	return (
		<section className="mx-auto grid min-h-screen w-[95%] max-w-screen-2xl grid-cols-1 bg-muted/20 md:grid-cols-2 lg:border-x">
			<div className="px-4 pt-12 pb-6">
				<div className="space-y-5">
					<h2 className="text-balance font-bold text-4xl md:text-6xl lg:font-black">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground">
						Quick answers to common questions about Sirius. Open any question to
						learn more.
					</p>

				</div>
			</div>
			<div className="relative place-content-center">
				{/* vertical guide line */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 left-3 h-full w-px bg-border"
				/>

				<Accordion collapsible type="single">
					{faqItems.map((item, index) => (
						<AccordionItem
							className="group relative border-b pl-5 first:border-t last:border-b"
							key={`faq-${index}`}
							value={`faq-${index}`}
						>
							{/*  plus */}
							<PlusIcon
								aria-hidden="true"
								className="-bottom-[5.5px] -translate-x-1/2 pointer-events-none absolute left-[12.5px] size-2.5 text-muted-foreground group-last:hidden"
							/>

							<AccordionTrigger className="px-4 py-4 text-[15px] leading-6 hover:no-underline">
								{item.question}
							</AccordionTrigger>

							<AccordionContent className="px-4 pb-4 text-muted-foreground">
								{item.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
