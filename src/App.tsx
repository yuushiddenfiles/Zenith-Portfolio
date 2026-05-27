import { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import {
    ArrowRight,
    ExternalLink,
    ChevronDown,
    X,
    ArrowUpRight,
    Play,
    Menu,
    Layers,
    Code2,
    Zap,
    Globe,
} from 'lucide-react';

// Types
interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

// Scroll reveal component
function Reveal({ children, className = '', delay = 0 }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal ${visible ? 'visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// Mouse position tracking for interactive cards
function useMousePosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return position;
}

// Interactive card with tilt effect
function InteractiveCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setTilt({
            x: (y - centerY) / 20,
            y: (centerX - x) / 20,
        });
    };

    const handleLeave = () => setTilt({ x: 0, y: 0 });

    return (
        <div
            ref={cardRef}
            className={`cursor-highlight ${className}`}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            {children}
        </div>
    );
}

// Ambient gradient background
function AmbientBackground() {
    const mousePos = useMousePosition();

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
            {/* Base gradient */}
            <div className="absolute inset-0 bg-[#09090b]" />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }}
            />

            {/* Mouse-following gradient */}
            <div
                className="absolute w-[600px] h-[600px] opacity-[0.03]"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
                    transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            />

            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04]"
                style={{ background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.4) 0%, transparent 60%)' }}
            />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.03]"
                style={{ background: 'radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.3) 0%, transparent 60%)' }}
            />
        </div>
    );
}

// Scroll progress indicator
function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-blue-400 z-50"
            style={{ width: `${progress}%` }}
        />
    );
}

// Navigation
function Navigation() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Work', href: '#work' },
        { label: 'Services', href: '#services' },
        { label: 'Process', href: '#process' },
        { label: 'About', href: '#about' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                scrolled ? 'bg-[#09090b]/90 backdrop-blur-lg border-b border-white/[0.06]' : ''
            }`}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <span className="text-blue-400 font-bold text-sm">-4</span>
                        </div>
                        <span className="font-semibold text-sm tracking-tight">Zenith</span>
                    </a>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm text-white/60 hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="#contact"
                            className="glass-button glass-button-primary text-sm"
                        >
                            Start Project
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/[0.06]">
                        {navLinks.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="block py-3 text-white/60 hover:text-white transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="#contact"
                            className="block mt-4 glass-button glass-button-primary text-center text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Start Project
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
}

// Hero Section
function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
            <div className="max-w-4xl mx-auto text-center">
                <Reveal delay={0}>
                    <div className="section-label mb-8">
                        Design Studio
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <h1 className="display-heading text-white mb-6">
                        We build digital
                        <br />
                        <span className="gradient-text">products that matter</span>
                    </h1>
                </Reveal>

                <Reveal delay={200}>
                    <p className="body-large max-w-2xl mx-auto mb-12">
                        A small team of designers and developers crafting websites and web apps
                        with obsessive attention to detail. We partner with ambitious teams
                        building something worth building.
                    </p>
                </Reveal>

                <Reveal delay={300}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#contact" className="glass-button glass-button-primary flex items-center gap-2">
                            Tell us about your project
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#work" className="glass-button flex items-center gap-2">
                            View recent work
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </Reveal>

                {/* Stats */}
                <Reveal delay={400}>
                    <div className="flex items-center justify-center gap-12 mt-20 pt-12 border-t border-white/[0.06]">
                        <div className="text-center">
                            <div className="text-3xl font-semibold text-white mb-1">47</div>
                            <div className="label">Projects Shipped</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-semibold text-white mb-1">23</div>
                            <div className="label">Happy Clients</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-semibold text-white mb-1">4</div>
                            <div className="label">Team Members</div>
                        </div>
                    </div>
                </Reveal>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
                    <ChevronDown className="w-5 h-5 text-white/40" />
                </div>
            </div>
        </section>
    );
}

// Portfolio data - specific, believable projects
const projects = [
    {
        title: 'Basis',
        category: 'Fintech Dashboard',
        description: 'Real-time portfolio tracking for crypto-native investors. Built with WebGL visualizations and sub-100ms data streaming.',
        image: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['12K MAU', '340ms avg. load'],
        tags: ['React', 'WebGL', 'WebSockets'],
        year: '2024',
    },
    {
        title: 'Rodeo',
        category: 'Social Platform',
        description: 'Creator economy platform connecting podcasters with sponsors. Native iOS/Android with shared web dashboard.',
        image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['$2.4M GMV', '89% retention'],
        tags: ['Next.js', 'Stripe', 'Postgres'],
        year: '2024',
    },
    {
        title: 'Ember Health',
        category: 'Healthcare SaaS',
        description: 'HIPAA-compliant patient intake system replacing paper forms. Reduced check-in time from 12 to 3 minutes.',
        image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['340 clinics', '4.8 star reviews'],
        tags: ['TypeScript', 'PostgreSQL', 'HL7 FHIR'],
        year: '2023',
    },
    {
        title: 'Northwind',
        category: 'E-Commerce',
        description: 'Headless storefront for outdoor gear brand. 47% conversion lift vs legacy Shopify theme.',
        image: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['47% conv. lift', '$1.2M revenue'],
        tags: ['Next.js', 'Shopify', 'Sanity'],
        year: '2023',
    },
];

function WorkSection() {
    return (
        <section id="work" className="relative px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <div className="flex items-end justify-between mb-16">
                        <div>
                            <div className="section-label mb-4">Selected Work</div>
                            <h2 className="headline-large text-white">
                                Recent projects we're proud of
                            </h2>
                        </div>
                        <a href="#" className="hidden md:flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            View all projects
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, i) => (
                        <Reveal key={project.title} delay={i * 100}>
                            <InteractiveCard className="glass-card overflow-hidden group">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
                                    <div className="absolute top-4 right-4 flex items-center gap-3">
                                        <span className="text-xs text-white/50 font-mono">{project.year}</span>
                                        <span className="section-label !py-1 !px-3 !text-[10px]">{project.category}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="headline-medium text-white">{project.title}</h3>
                                        <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                                    </div>

                                    <p className="body-medium mb-4">{project.description}</p>

                                    <div className="flex items-center gap-4 mb-4">
                                        {project.metrics.map(metric => (
                                            <span key={metric} className="text-sm text-white/70 font-medium">{metric}</span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-xs text-white/40 bg-white/[0.05] px-2.5 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </InteractiveCard>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={400}>
                    <div className="text-center mt-12 md:hidden">
                        <a href="#" className="glass-button text-sm">
                            View all projects
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// Services
const services = [
    {
        icon: Layers,
        title: 'Product Design',
        description: 'End-to-end design from research to high-fidelity prototypes. We obsess over the details that matter.',
        capabilities: ['User Research', 'UI/UX Design', 'Prototyping', 'Design Systems'],
    },
    {
        icon: Code2,
        title: 'Development',
        description: 'Production-grade code with accessibility and performance baked in. No technical debt, no shortcuts.',
        capabilities: ['React/Next.js', 'TypeScript', 'API Development', 'Database Design'],
    },
    {
        icon: Globe,
        title: 'Web Strategy',
        description: 'SEO, analytics, and conversion optimization. We build for growth, not just aesthetics.',
        capabilities: ['SEO', 'Analytics', 'A/B Testing', 'Performance Audit'],
    },
];

function ServicesSection() {
    return (
        <section id="services" className="relative px-6 py-32 bg-white/[0.01]">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <div className="text-center mb-16">
                        <div className="section-label mb-4">What We Do</div>
                        <h2 className="headline-large text-white mb-4">
                            Capabilities
                        </h2>
                        <p className="body-large max-w-2xl mx-auto">
                            We're a full-stack studio. Design, development, and everything in between.
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((service, i) => (
                        <Reveal key={service.title} delay={i * 100}>
                            <div className="glass-card p-8 h-full group">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/15 transition-colors">
                                    <service.icon className="w-6 h-6 text-blue-400" />
                                </div>

                                <h3 className="headline-medium text-white mb-3">{service.title}</h3>
                                <p className="body-medium mb-6">{service.description}</p>

                                <div className="space-y-2">
                                    {service.capabilities.map(cap => (
                                        <div key={cap} className="flex items-center gap-2 text-sm text-white/50">
                                            <div className="w-1 h-1 rounded-full bg-blue-400/50" />
                                            {cap}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Process
const processSteps = [
    {
        num: '01',
        title: 'Discovery',
        duration: '1-2 weeks',
        description: 'Deep dive into your business, users, and goals. We analyze competitors, interview stakeholders, and map the user journey.',
    },
    {
        num: '02',
        title: 'Design',
        duration: '2-4 weeks',
        description: 'Rapid prototyping in Figma. Weekly reviews keep you involved. We iterate until every interaction feels right.',
    },
    {
        num: '03',
        title: 'Development',
        duration: '4-8 weeks',
        description: 'Production-grade code written for maintainability. Real-time progress updates in a shared Slack channel.',
    },
    {
        num: '04',
        title: 'Launch',
        duration: '1 week',
        description: 'Staged rollout with monitoring. We handle deployment, domains, and teach your team to manage content.',
    },
];

function ProcessSection() {
    return (
        <section id="process" className="relative px-6 py-32">
            <div className="max-w-4xl mx-auto">
                <Reveal>
                    <div className="text-center mb-16">
                        <div className="section-label mb-4">How We Work</div>
                        <h2 className="headline-large text-white mb-4">
                            A process that respects your time
                        </h2>
                        <p className="body-large max-w-2xl mx-auto">
                            No surprises. No scope creep. Weekly check-ins keep everything on track.
                        </p>
                    </div>
                </Reveal>

                <div className="space-y-4">
                    {processSteps.map((step, i) => (
                        <Reveal key={step.num} delay={i * 100}>
                            <div className="glass-card p-6 flex items-start gap-6 group">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 font-mono text-sm text-white/40 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:text-blue-400 transition-colors">
                                    {step.num}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                        <span className="text-xs text-white/40 font-mono">{step.duration}</span>
                                    </div>
                                    <p className="body-medium">{step.description}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// About section
function AboutSection() {
    return (
        <section id="about" className="relative px-6 py-32 bg-white/[0.01]">
            <div className="max-w-4xl mx-auto">
                <Reveal>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="section-label mb-4">About</div>
                            <h2 className="headline-large text-white mb-6">
                                Small team, big ambitions
                            </h2>
                            <div className="space-y-4 body-medium">
                                <p>
                                    We started Zenith in 2021 after years of working at agencies that prioritized
                                    quantity over quality. We wanted to build something different: a studio that
                                    takes on fewer projects but delivers exceptional work on every single one.
                                </p>
                                <p>
                                    Four of us now — two designers, two engineers. Small enough to stay hands-on,
                                    experienced enough to handle complex products. We don't outsource. Every line
                                    of code, every pixel comes from our team.
                                </p>
                                <p>
                                    Based in San Francisco, but we've worked with teams in 12 countries.
                                    Remote-first since day one.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-6">
                                <div className="text-3xl font-semibold text-white mb-2">47</div>
                                <div className="label">Projects Delivered</div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="text-3xl font-semibold text-white mb-2">4</div>
                                <div className="label">Core Team</div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="text-3xl font-semibold text-white mb-2">12</div>
                                <div className="label">Countries Worked</div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="text-3xl font-semibold text-white mb-2">100%</div>
                                <div className="label">Referral Rate</div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// Contact
function ContactSection() {
    const [submitted, setSubmitted] = useState(false);

    return (
        <section id="contact" className="relative px-6 py-32">
            <div className="max-w-xl mx-auto">
                <Reveal>
                    <div className="text-center mb-12">
                        <div className="section-label mb-4">Start a Project</div>
                        <h2 className="headline-large text-white mb-4">
                            Let's talk about what you're building
                        </h2>
                        <p className="body-large">
                            Tell us about your project and we'll get back to you within one business day.
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <div className="glass-card p-8">
                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Message received</h3>
                                <p className="body-medium">We'll be in touch within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                                <div>
                                    <label className="label block mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="label block mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
                                        placeholder="you@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="label block mb-2">Project Type</label>
                                    <select
                                        required
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#09090b]">Select a package</option>
                                        <option value="landing" className="bg-[#09090b]">Landing Page — $5,000</option>
                                        <option value="marketing" className="bg-[#09090b]">Marketing Site — $12,000</option>
                                        <option value="app" className="bg-[#09090b]">Web Application — $25,000+</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label block mb-2">Tell us about the project</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white outline-none focus:border-white/20 transition-colors resize-none placeholder:text-white/20"
                                        placeholder="What are you building? Who is it for? Timeline?"
                                    />
                                </div>

                                <button type="submit" className="w-full glass-button glass-button-primary flex items-center justify-center gap-2">
                                    Send Message
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </Reveal>

                <Reveal delay={200}>
                    <div className="text-center mt-8">
                        <p className="body-medium">
                            Or email us directly at{' '}
                            <a href="mailto:hello@zenith.studio" className="text-blue-400 hover:text-blue-300 transition-colors">
                                hello@zenith.studio
                            </a>
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="relative px-6 py-16 border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-bold text-sm">-4</span>
                        </div>
                        <span className="font-semibold text-sm tracking-tight">Zenith Studio</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Dribbble</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    </div>

                    <div className="text-sm text-white/40">
                        © {new Date().getFullYear()} Zenith Studio LLC
                    </div>
                </div>
            </div>
        </footer>
    );
}

// App
function App() {
    return (
        <div className="min-h-screen">
            <AmbientBackground />
            <div className="noise-overlay" />
            <ScrollProgress />
            <Navigation />
            <main>
                <HeroSection />
                <WorkSection />
                <ServicesSection />
                <ProcessSection />
                <AboutSection />
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}

export default App;
