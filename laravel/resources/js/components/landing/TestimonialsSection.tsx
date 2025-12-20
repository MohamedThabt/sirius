import { IconQuote } from './LandingIcons';

const testimonials = [
    {
        id: 1,
        quote: "Sirius AI has transformed how we plan projects. From brief to complete PRD in minutes, not weeks. The auto-generated ERDs and wireframes save us countless hours.",
        name: "Alex Chen",
        role: "CTO, TechCorp",
        initials: "AC",
    },
    {
        id: 2,
        quote: "The GitHub export feature is a game-changer. Our AI coding tools now have full context of our architecture, generating accurate code from day one.",
        name: "Sarah Martinez",
        role: "Lead Engineer, DevFlow",
        initials: "SM",
    },
    {
        id: 3,
        quote: "We used to spend days writing specs manually. Sirius generates everything we need—PRD, features, diagrams—in one workflow. It's like having a senior architect on demand.",
        name: "James Wilson",
        role: "Product Manager, StartupXYZ",
        initials: "JW",
    },
    {
        id: 4,
        quote: "The module discovery feature using DDD principles is brilliant. It helped us identify bounded contexts we hadn't considered, making our architecture much cleaner.",
        name: "Maria Rodriguez",
        role: "Software Architect, CloudScale",
        initials: "MR",
    },
];

const TestimonialsSection = () => {
    return (
        <section id="testimonials" className="space-section relative py-24 md:py-32 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Trusted by engineers who ship
                    </h2>
                </div>

                {/* Testimonial Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="premium-card premium-card-testimonial group"
                        >
                            {/* Quote Icon */}
                            <IconQuote className="h-8 w-8 text-amber-500 mb-6 opacity-80" />
                            
                            {/* Quote */}
                            <p className="text-lg text-white mb-6 leading-relaxed">
                                "{testimonial.quote}"
                            </p>
                            
                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                                    <span className="text-white font-semibold text-sm">
                                        {testimonial.initials}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-white font-semibold">{testimonial.name}</div>
                                    <div className="text-sm text-[hsl(var(--text-tertiary))]">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
