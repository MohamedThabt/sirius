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
		<section id="faq" className="sirius-section bg-muted/20">
			<div className="sirius-container">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
					<div className="pt-4 pb-6">
						<div className="mb-10 md:mb-12">
							<span className="text-kicker mb-2 block">Support</span>
							<h2 className="text-section-title text-foreground mb-4">
								Frequently Asked Questions
							</h2>
							<p className="text-body text-muted-foreground">
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
				</div>
			</div>
		</section>
	);
}
