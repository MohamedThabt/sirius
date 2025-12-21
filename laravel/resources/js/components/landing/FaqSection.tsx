import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';

const faqs = [
    {
        id: 1,
        question: "How does Sirius AI generate PRDs?",
        answer: "Sirius AI analyzes your project brief using advanced language models to create comprehensive Product Requirements Documents, including goals, scope, functional requirements, and success metrics. The AI understands context from your description and generates structured documentation ready for development.",
    },
    {
        id: 2,
        question: "Can I export my specs to GitHub?",
        answer: "Yes! Sirius AI exports your complete specification to GitHub in a structured format. This includes PRD.md, module ERDs, feature specs, and wireframes. When you use AI coding tools like Cursor, Copilot, or Claude, they have full context of your architecture to generate accurate code.",
    },
    {
        id: 3,
        question: "What types of diagrams does Sirius generate?",
        answer: "Sirius automatically generates Entity-Relationship Diagrams (ERDs) for each module, sequence diagrams for feature workflows, and wireframe mockups for key user interfaces. All diagrams are created in Mermaid format and can be exported to your GitHub repository.",
    },
    {
        id: 4,
        question: "How does module discovery work?",
        answer: "Sirius uses Domain-Driven Design (DDD) principles to analyze your project and suggest 8-12 bounded context modules. The AI identifies logical domain boundaries, suggests module names and descriptions, and helps you organize features into cohesive units. You can select, customize, and enrich modules before generating detailed specs.",
    },
    {
        id: 5,
        question: "Is there a free trial?",
        answer: "Yes! Sirius offers 3 free projects with no credit card required. You can generate complete PRDs, ERDs, wireframes, and export to GitHub. This gives you a full experience of the platform before committing to a paid plan.",
    },
    {
        id: 6,
        question: "Can I edit the AI-generated content?",
        answer: "Absolutely. All AI-generated content is fully editable. You can modify PRDs, update feature descriptions, adjust ERDs, and refine wireframes. Sirius maintains version history so you can track changes and revert if needed.",
    },
];

const FaqSection = () => {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section id="faq" className="space-section relative py-24 md:py-32 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[hsl(var(--text-primary))]">
                        Frequently asked questions
                    </h2>
                </div>

                {/* Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className={`premium-card premium-card-accordion ${openId === faq.id ? 'is-open' : ''}`}
                            data-open={openId === faq.id}
                        >
                            {/* Question */}
                            <button
                                onClick={() => toggleFaq(faq.id)}
                                className="w-full text-left flex items-center justify-between gap-4"
                            >
                                <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                                    {faq.question}
                                </h3>
                                <ChevronDown
                                    className={`h-5 w-5 text-[hsl(var(--text-tertiary))] transition-transform duration-300 flex-shrink-0 ${
                                        openId === faq.id ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            
                            {/* Answer (collapsible) */}
                            <div
                                className={`grid transition-all duration-300 ${
                                    openId === faq.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default memo(FaqSection);
