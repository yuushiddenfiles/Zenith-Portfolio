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
    Star,
    Sparkles,
    Monitor,
} from 'lucide-react';

// Types
interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    stagger?: boolean;
}

// Character-by-character reveal
function TextReveal({ text, className = '' }: { text: string; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <span ref={ref} className={`inline-block ${className}`}>
            {text.split('').map((char, i) => (
                <span
                    key={i}
                    className="inline-block transition-all duration-500"
                    style={{
                        opacity: visible ? 1 : 0,
                        filter: visible ? 'blur(0px)' : 'blur(4px)',
                        transform: visible ? 'translateY(0)' : 'translateY(8px)',
                        transitionDelay: visible ? `${i * 25}ms` : '0ms',
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
}

// Scroll reveal
function Reveal({ children, className = '', delay = 0, stagger = false }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${stagger ? 'stagger-children' : 'reveal'} ${visible ? 'visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// Animated counter
function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const triggered = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !triggered.current) {
                triggered.current = true;
                const start = performance.now();
                const duration = 2000;
                const step = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 4);
                    setCount(Math.floor(ease * to));
                    if (progress < 1) requestAnimationFrame(step);
                    else setCount(to);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [to]);

    return <span ref={ref}>{count}{suffix}</span>;
}

// Custom cursor
function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: -100, y: -100 });
    const hovering = useRef(false);
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const checkTouch = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches);
        checkTouch();

        const move = (e: MouseEvent) => { posRef.current = { x: e.clientX, y: e.clientY }; };
        const over = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            hovering.current = !!(t.closest('a, button, [class*="cursor-pointer"]'));
        };

        window.addEventListener('mousemove', move, { passive: true });
        window.addEventListener('mouseover', over, { passive: true });

        let raf: number;
        let currentScale = 1;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const loop = () => {
            const dot = dotRef.current;
            if (dot) {
                const { x, y } = posRef.current;
                const targetScale = hovering.current ? 2.2 : 1;
                currentScale = lerp(currentScale, targetScale, 0.15);
                dot.style.transform = `translate(${x - 3}px, ${y - 3}px) scale(${currentScale})`;

                if (hovering.current) {
                    dot.style.boxShadow = '0 0 12px 3px rgba(59, 130, 246, 0.9), 0 0 4px 1px rgba(255, 255, 255, 0.7)';
                    dot.style.backgroundColor = '#ffffff';
                } else {
                    dot.style.boxShadow = '0 0 8px 2px rgba(59, 130, 246, 0.7)';
                    dot.style.backgroundColor = '#60a5fa';
                }
            }
            raf = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseover', over);
        };
    }, []);

    if (isTouch) return null;

    return (
        <div
            ref={dotRef}
            className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[9999]"
            style={{ willChange: 'transform, box-shadow, background-color' }}
        />
    );
}

// Mouse position
function useMousePosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMove = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);
    return position;
}

// Lightning canvas effect
function LightningCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const posRef = useRef({ x: -500, y: -500 });
    const smoothRef = useRef({ x: -500, y: -500 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => { posRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let lastX = -500, lastY = -500;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const drawArc = (x1: number, y1: number, x2: number, y2: number, displace: number) => {
            ctx!.beginPath();
            ctx!.moveTo(x1, y1);
            const steps = 6;
            let cx = x1, cy = y1;
            for (let i = 1; i <= steps; i++) {
                const p = i / steps;
                const tx = x1 + (x2 - x1) * p;
                const ty = y1 + (y2 - y1) * p;
                const dx = x2 - x1, dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = -dy / len, ny = dx / len;
                const offset = (Math.random() - 0.5) * displace * (1 - p * 0.5);
                cx = tx + nx * offset;
                cy = ty + ny * offset;
                ctx!.lineTo(cx, cy);
            }
            ctx!.stroke();
        };

        let animId: number;
        const render = () => {
            const targetX = posRef.current.x;
            const targetY = posRef.current.y;
            smoothRef.current = {
                x: lerp(smoothRef.current.x, targetX, 0.1),
                y: lerp(smoothRef.current.y, targetY, 0.1),
            };

            const nextX = smoothRef.current.x;
            const nextY = smoothRef.current.y;

            ctx.fillStyle = 'rgba(9, 9, 11, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const dx = nextX - lastX;
            const dy = nextY - lastY;
            const speed = Math.sqrt(dx * dx + dy * dy);
            lastX = nextX;
            lastY = nextY;

            if (speed > 2 && nextX > 0 && nextY > 0) {
                ctx.globalCompositeOperation = 'screen';
                const sparkCount = Math.random() > 0.5 ? 2 : 1;
                for (let i = 0; i < sparkCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = 20 + Math.random() * Math.min(100, speed * 2.5);
                    const tx = nextX + Math.cos(angle) * length;
                    const ty = nextY + Math.sin(angle) * length;

                    ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
                    ctx.lineWidth = 10;
                    drawArc(nextX, nextY, tx, ty, length * 0.28);

                    ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
                    ctx.lineWidth = 4;
                    drawArc(nextX, nextY, tx, ty, length * 0.28);

                    ctx.strokeStyle = 'rgba(147, 197, 253, 1)';
                    ctx.lineWidth = 1.5;
                    drawArc(nextX, nextY, tx, ty, length * 0.28);
                }
                ctx.globalCompositeOperation = 'source-over';
            }

            animId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}

// Magnetic effect
function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            const distance = Math.hypot(x, y);
            const range = Math.max(rect.width, rect.height) * 0.9;
            if (distance < range) {
                const falloff = Math.pow(1 - distance / range, 2);
                setPosition({ x: x * strength * falloff, y: y * strength * falloff });
            } else {
                setPosition({ x: 0, y: 0 });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [strength]);

    return (
        <div
            ref={ref}
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        >
            {children}
        </div>
    );
}

// Tilt card
function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: React.MouseEvent) => {
        const card = ref.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
        const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        card.style.transition = 'transform 0.08s ease';
    };

    const onLeave = () => {
        const card = ref.current;
        if (!card) return;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    return (
        <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
            {children}
        </div>
    );
}

// Ambient background with subtle effects
function AmbientBackground() {
    const mousePos = useMousePosition();

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="absolute inset-0 bg-[#09090b]" />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Mouse following gradient */}
            <div
                className="absolute w-[800px] h-[800px] opacity-[0.03] transition-transform duration-1000"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 60%)',
                    transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`,
                }}
            />

            {/* Floating orbs */}
            <div
                className="absolute top-[10%] right-[20%] w-[500px] h-[500px] rounded-full opacity-[0.02]"
                style={{
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 60%)',
                    animation: 'float 20s ease-in-out infinite',
                }}
            />
            <div
                className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.015]"
                style={{
                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 60%)',
                    animation: 'float 25s ease-in-out infinite reverse',
                    animationDelay: '-5s',
                }}
            />
        </div>
    );
}

// Scroll progress
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
        <div
            className="fixed top-0 left-0 h-[2px] z-50 transition-all duration-100"
            style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            }}
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
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
                scrolled ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]' : ''
            }`}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <Magnetic strength={0.2}>
                        <a href="#" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                <span className="text-blue-400 font-bold text-sm">-4</span>
                            </div>
                            <span className="font-semibold text-sm tracking-tight">Zenith</span>
                        </a>
                    </Magnetic>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <Magnetic strength={0.2}>
                            <a
                                href="#contact"
                                className="glass-button glass-button-primary text-sm inline-flex"
                            >
                                Start Project
                            </a>
                        </Magnetic>
                    </div>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

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
            <div className="max-w-5xl mx-auto text-center">
                <Reveal delay={0}>
                    <div className="section-label mb-10 inline-flex animate-float">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Design & Development Studio</span>
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <h1 className="display-heading text-white mb-8">
                        <TextReveal text="We build digital" />
                        <br />
                        <TextReveal text="products that matter" className="gradient-text" />
                    </h1>
                </Reveal>

                <Reveal delay={300}>
                    <p className="body-large max-w-2xl mx-auto mb-14">
                        Two-person team crafting websites and web apps with obsessive attention to detail.
                        We partner with ambitious teams building something worth building.
                    </p>
                </Reveal>

                <Reveal delay={400}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                        <Magnetic strength={0.25}>
                            <a
                                href="#contact"
                                className="glass-button glass-button-primary flex items-center gap-2 group"
                            >
                                Tell us about your project
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </a>
                        </Magnetic>
                        <Magnetic strength={0.2}>
                            <a href="#work" className="glass-button flex items-center gap-2">
                                View recent work
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Magnetic>
                    </div>
                </Reveal>

                <Reveal delay={500}>
                    <div className="flex items-center justify-center gap-16 pt-12 border-t border-white/[0.06]">
                        {[
                            { to: 47, suffix: '', label: 'Projects Shipped' },
                            { to: 12, suffix: '', label: 'Countries Worked' },
                            { to: 100, suffix: '%', label: 'Referral Rate' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-1">
                                    <AnimatedCounter to={stat.to} suffix={stat.suffix} />
                                </div>
                                <div className="label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
                    <ChevronDown className="w-5 h-5 text-white/30" />
                </div>
            </div>
        </section>
    );
}

// Portfolio
const projects = [
    {
        title: 'Basis',
        category: 'Fintech Dashboard',
        description: 'Real-time portfolio tracking for crypto investors. WebGL visualizations with sub-100ms data streaming.',
        image: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['12K MAU', '340ms load'],
        tags: ['React', 'WebGL', 'WebSockets'],
        year: '2024',
    },
    {
        title: 'Rodeo',
        category: 'Social Platform',
        description: 'Creator economy platform connecting podcasters with sponsors. Native mobile with shared web dashboard.',
        image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['$2.4M GMV', '89% retention'],
        tags: ['Next.js', 'Stripe', 'Postgres'],
        year: '2024',
    },
    {
        title: 'Ember Health',
        category: 'Healthcare SaaS',
        description: 'HIPAA-compliant patient intake system. Reduced check-in time from 12 to 3 minutes.',
        image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['340 clinics', '4.8 star'],
        tags: ['TypeScript', 'PostgreSQL', 'HL7 FHIR'],
        year: '2023',
    },
    {
        title: 'Northwind',
        category: 'E-Commerce',
        description: 'Headless storefront for outdoor gear brand. 47% conversion lift vs legacy Shopify theme.',
        image: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
        metrics: ['47% lift', '$1.2M revenue'],
        tags: ['Next.js', 'Shopify', 'Sanity'],
        year: '2023',
    },
];

function WorkSection() {
    return (
        <section id="work" className="relative px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <div className="text-center mb-16">
                        <div className="section-label mb-4">
                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                            Selected Work
                        </div>
                        <h2 className="headline-large text-white">
                            <TextReveal text="Projects we're proud of" />
                        </h2>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, i) => (
                        <Reveal key={project.title} delay={i * 100}>
                            <TiltCard className="glass-card overflow-hidden group">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
                                    <div className="absolute top-4 right-4 flex items-center gap-3">
                                        <span className="text-xs text-white/40 font-mono">{project.year}</span>
                                        <span className="section-label !py-1 !px-3 !text-[10px]">{project.category}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                                        <ArrowUpRight className="w-5 h-5 text-white/15 group-hover:text-blue-400 transition-colors duration-300" />
                                    </div>

                                    <p className="body-medium mb-4">{project.description}</p>

                                    <div className="flex items-center gap-4 mb-4">
                                        {project.metrics.map(metric => (
                                            <span key={metric} className="text-sm text-white/70 font-medium">{metric}</span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-xs text-white/40 bg-white/[0.05] px-2.5 py-1 rounded border border-white/[0.08]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Services
const services = [
    {
        icon: Layers,
        title: 'Product Design',
        description: 'End-to-end design from research to high-fidelity prototypes. We obsess over every interaction.',
        capabilities: ['User Research', 'UI/UX Design', 'Prototyping', 'Design Systems'],
    },
    {
        icon: Code2,
        title: 'Development',
        description: 'Production-grade code with accessibility and performance baked in. No technical debt.',
        capabilities: ['React/Next.js', 'TypeScript', 'API Development', 'Database Design'],
    },
    {
        icon: Globe,
        title: 'Web Strategy',
        description: 'SEO, analytics, and conversion optimization. Built for growth, not just aesthetics.',
        capabilities: ['SEO', 'Analytics', 'A/B Testing', 'Performance Audit'],
    },
];

function ServicesSection() {
    return (
        <section id="services" className="relative px-6 py-32 bg-white/[0.005]">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <div className="text-center mb-16">
                        <div className="section-label mb-4">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            What We Do
                        </div>
                        <h2 className="headline-large text-white mb-4">
                            <TextReveal text="Full-stack craft" />
                        </h2>
                        <p className="body-large max-w-2xl mx-auto">
                            Design, development, deployment. Two people, end-to-end ownership.
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((service, i) => (
                        <Reveal key={service.title} delay={i * 100}>
                            <div className="glass-card p-8 h-full group">
                                <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/15 group-hover:border-blue-500/40 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                                    <service.icon className="w-6 h-6 text-blue-400" />
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                                <p className="body-medium mb-6">{service.description}</p>

                                <div className="space-y-2.5">
                                    {service.capabilities.map(cap => (
                                        <div key={cap} className="flex items-center gap-2.5 text-sm text-white/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
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
        description: 'Deep dive into your business and users. We analyze competitors, interview stakeholders, map the journey.',
    },
    {
        num: '02',
        title: 'Design',
        duration: '2-4 weeks',
        description: 'Rapid prototyping in Figma. Weekly reviews keep you involved. Iterate until it feels right.',
    },
    {
        num: '03',
        title: 'Develop',
        duration: '4-8 weeks',
        description: 'Production-grade code. Real-time progress updates. Shared Slack channel for quick decisions.',
    },
    {
        num: '04',
        title: 'Launch',
        duration: '1 week',
        description: 'Staged rollout with monitoring. Deployment, domains, training. You go live with confidence.',
    },
];

function ProcessSection() {
    return (
        <section id="process" className="relative px-6 py-32">
            <div className="max-w-4xl mx-auto">
                <Reveal>
                    <div className="text-center mb-16">
                        <div className="section-label mb-4">
                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                            How We Work
                        </div>
                        <h2 className="headline-large text-white mb-4">
                            <TextReveal text="Four steps to launch" />
                        </h2>
                        <p className="body-large max-w-2xl mx-auto">
                            No surprises. Weekly check-ins keep everything on track.
                        </p>
                    </div>
                </Reveal>

                <div className="space-y-4">
                    {processSteps.map((step, i) => (
                        <Reveal key={step.num} delay={i * 80}>
                            <TiltCard className="glass-card p-6 flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center flex-shrink-0 font-mono text-base text-white/40 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all duration-300">
                                    {step.num}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                        <span className="text-xs text-white/35 font-mono">{step.duration}</span>
                                    </div>
                                    <p className="body-medium">{step.description}</p>
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// About
function AboutSection() {
    return (
        <section id="about" className="relative px-6 py-32 bg-white/[0.005]">
            <div className="max-w-4xl mx-auto">
                <Reveal>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="section-label mb-4">About</div>
                            <h2 className="headline-large text-white mb-8">
                                <TextReveal text="Two people, hands-on" />
                            </h2>
                            <div className="space-y-5 body-medium">
                                <p>
                                    We started Zenith after years at agencies that prioritized quantity over quality.
                                    We wanted something different: take fewer projects, deliver exceptional work on every one.
                                </p>
                                <p>
                                    Two of us now — designer and engineer. Small enough to stay hands-on, experienced enough
                                    to handle complex products. We don't outsource. Every line of code, every pixel comes from us.
                                </p>
                                <p>
                                    Based in San Francisco. Worked with teams in 12 countries.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <TiltCard className="glass-card p-6">
                                <div className="text-4xl font-semibold text-white mb-2">
                                    <AnimatedCounter to={47} />
                                </div>
                                <div className="label">Projects Shipped</div>
                            </TiltCard>
                            <TiltCard className="glass-card p-6">
                                <div className="text-4xl font-semibold text-white mb-2">2</div>
                                <div className="label">Team Members</div>
                            </TiltCard>
                            <TiltCard className="glass-card p-6">
                                <div className="text-4xl font-semibold text-white mb-2">
                                    <AnimatedCounter to={12} />
                                </div>
                                <div className="label">Countries Worked</div>
                            </TiltCard>
                            <TiltCard className="glass-card p-6">
                                <div className="text-4xl font-semibold text-white mb-2">100%</div>
                                <div className="label">Referral Rate</div>
                            </TiltCard>
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
                        <div className="section-label mb-4">
                            <Star className="w-3.5 h-3.5 text-blue-400" />
                            Start a Project
                        </div>
                        <h2 className="headline-large text-white mb-4">
                            <TextReveal text="Let's talk about it" />
                        </h2>
                        <p className="body-large">
                            Tell us about your project. We respond within one business day.
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <div className="glass-card p-8 subtle-glow">
                        {submitted ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                                    <Zap className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">Message received</h3>
                                <p className="body-medium">We'll be in touch within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                                <div>
                                    <label className="label block mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/15"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="label block mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/15"
                                        placeholder="you@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="label block mb-2">Project Type</label>
                                    <select
                                        required
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
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
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-white/15"
                                        placeholder="What are you building? Who is it for? Timeline?"
                                    />
                                </div>

                                <Magnetic strength={0.15}>
                                    <button type="submit" className="w-full glass-button glass-button-primary flex items-center justify-center gap-2 group">
                                        Send Message
                                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>
                                </Magnetic>
                            </form>
                        )}
                    </div>
                </Reveal>

                <Reveal delay={200}>
                    <div className="text-center mt-8">
                        <p className="body-medium">
                            Or email us at{' '}
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
                    <Magnetic strength={0.2}>
                        <a href="#" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <span className="text-blue-400 font-bold text-sm">-4</span>
                            </div>
                            <span className="font-semibold text-sm tracking-tight">Zenith Studio</span>
                        </a>
                    </Magnetic>

                    <div className="flex items-center gap-6 text-sm text-white/40">
                        {['Twitter', 'GitHub', 'Dribbble', 'LinkedIn'].map(link => (
                            <Magnetic key={link} strength={0.15}>
                                <a href="#" className="hover:text-white transition-colors">{link}</a>
                            </Magnetic>
                        ))}
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
        <div className="min-h-screen" style={{ cursor: 'none' }}>
            <CustomCursor />
            <AmbientBackground />
            <LightningCanvas />
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
