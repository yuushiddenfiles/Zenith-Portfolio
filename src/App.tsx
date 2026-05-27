import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
    Layers,
    Zap,
    ArrowRight,
    Code2,
    Palette,
    Rocket,
    Monitor,
    Smartphone,
    Globe,
    Star,
    ChevronRight,
    ChevronLeft,
    Check,
    Menu,
    X,
    ExternalLink,
    MessageCircle,
    Sparkles,
    ArrowUpRight,
} from 'lucide-react';

interface RevealOnScrollProps {
    children: ReactNode;
    className?: string;
    stagger?: boolean;
    delay?: number; // delay in ms before transition starts after becoming visible
}

function RevealOnScroll({ children, className = '', stagger = false, delay = 0 }: RevealOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${stagger ? 'stagger-children' : 'reveal-on-scroll'} ${isVisible ? 'is-visible' : ''} ${className}`}
            style={delay ? { transitionDelay: isVisible ? `${delay}ms` : '0ms' } : undefined}
        >
            {children}
        </div>
    );
}

// --- Cinematic character stagger reveal ---
function FadeRevealText({ text, className = '' }: { text: string; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const characters = text.split('');

    return (
        <span ref={ref} className={`inline-block ${className}`}>
            {characters.map((char, index) => (
                <span
                    key={index}
                    className="inline-block transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        filter: isVisible ? 'blur(0px)' : 'blur(4px)',
                        transform: isVisible ? 'translateY(0px)' : 'translateY(8px)',
                        transitionDelay: isVisible ? `${index * 30}ms` : '0ms',
                        whiteSpace: char === ' ' ? 'pre' : 'normal',
                    }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
}

// --- Custom neon cursor (desktop/mouse only) ---
function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: -100, y: -100 });
    const hovering = useRef(false);
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        // Detect touch device — hide cursor entirely on touch screens
        const checkTouch = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches);
        checkTouch();
        window.matchMedia('(pointer: coarse)').addEventListener('change', checkTouch);

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
                const targetScale = hovering.current ? 2.5 : 1;
                currentScale = lerp(currentScale, targetScale, 0.15);
                dot.style.transform = `translate(${x - 3}px, ${y - 3}px) scale(${currentScale})`;
                if (hovering.current) {
                    dot.style.boxShadow = '0 0 12px 3px rgba(0, 240, 255, 0.95), 0 0 4px 1px rgba(255, 255, 255, 0.8)';
                    dot.style.backgroundColor = '#ffffff';
                } else {
                    dot.style.boxShadow = '0 0 8px 2px rgba(0, 240, 255, 0.8)';
                    dot.style.backgroundColor = '#67e8f9';
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
            className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-cyan-300 pointer-events-none z-[9999]"
            style={{ willChange: 'transform, box-shadow, background-color' }} 
        />
    );
}

// --- Animated counter ---
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
                const duration = 1800;
                const step = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
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



// --- 3D Tilt card wrapper ---
function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = ref.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -7;
        const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 7;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        card.style.transition = 'transform 0.08s ease';
    };

    const onLeave = () => {
        const card = ref.current;
        if (!card) return;
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        card.style.transition = 'transform 0.7s cubic-bezier(0.22,1,0.36,1)';
    };

    return (
        <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave}
            style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}>
            {children}
        </div>
    );
}

// --- Magnetic hover alignment component ---
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
                // Quadratic falloff prevents sudden jumps at the boundary
                const falloff = Math.pow(1 - distance / range, 2);
                setPosition({ x: x * strength * falloff, y: y * strength * falloff });
            } else {
                setPosition({ x: 0, y: 0 });
            }
        };

        const handleMouseLeave = () => {
            setPosition({ x: 0, y: 0 });
        };

        window.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (el) el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return (
        <div
            ref={ref}
            className="transition-transform duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    );
}

function AmbientBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {/* Deep atmosphere layers */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-[#05070f] via-[#081022] to-[#04050a]"
            />

            {/* Cyber-Grid Tech Blueprint Dotted Background */}
            <div 
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                }}
            />

            {/* Aurora-like glowing bands */}
            <div
                className="absolute top-0 left-0 w-[200%] h-[300px] opacity-35"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.25), rgba(78, 205, 196, 0.2), rgba(0, 240, 255, 0.25), transparent)',
                    filter: 'blur(60px)',
                    animation: 'wave-trail 25s ease-in-out infinite',
                }}
            />
            <div
                className="absolute top-[20%] left-0 w-[200%] h-[250px] opacity-25"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 140, 255, 0.2), rgba(0, 240, 255, 0.18), transparent)',
                    filter: 'blur(80px)',
                    animation: 'wave-trail 30s ease-in-out infinite',
                    animationDelay: '-10s',
                }}
            />
            <div
                className="absolute top-[50%] left-0 w-[200%] h-[400px] opacity-20"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(78, 205, 196, 0.15), rgba(0, 240, 255, 0.2), rgba(78, 205, 196, 0.15), transparent)',
                    filter: 'blur(100px)',
                    animation: 'wave-trail 35s ease-in-out infinite',
                    animationDelay: '-20s',
                }}
            />

            {/* Floating orbs with cyan/blue tones */}
            <div
                className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 60%)',
                    filter: 'blur(80px)',
                    animation: 'drift 25s ease-in-out infinite',
                }}
            />
            <div
                className="absolute top-[30%] -right-48 w-[500px] h-[500px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 140, 255, 0.12) 0%, transparent 60%)',
                    filter: 'blur(100px)',
                    animation: 'drift 30s ease-in-out infinite reverse',
                }}
            />
            <div
                className="absolute -bottom-32 left-[20%] w-[550px] h-[550px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, transparent 60%)',
                    filter: 'blur(90px)',
                    animation: 'drift 22s ease-in-out infinite',
                    animationDelay: '5s',
                }}
            />

            {/* Subtle blue accent */}
            <div
                className="absolute top-[60%] right-[10%] w-[400px] h-[400px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
                    filter: 'blur(80px)',
                    animation: 'breathe 15s ease-in-out infinite',
                }}
            />
        </div>
    );
}

function MouseGlow() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    
    // Shared position tracking refs to bypass React rendering cycle
    const posRef = useRef({ x: -500, y: -500 });
    const smoothPosRef = useRef({ x: -500, y: -500 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            posRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    // Integrated Lerping & Canvas Rendering Loop (Runs entirely on refs at solid 120fps)
    useEffect(() => {
        const canvas = canvasRef.current;
        const glow = glowRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let animationFrameId: number;
        let lastX = -500;
        let lastY = -500;

        const drawLightningArc = (
            x1: number, y1: number, 
            x2: number, y2: number, 
            displace: number
        ) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            
            const steps = 6;
            let cx = x1;
            let cy = y1;
            
            for (let i = 1; i <= steps; i++) {
                const p = i / steps;
                const tx = x1 + (x2 - x1) * p;
                const ty = y1 + (y2 - y1) * p;
                
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = -dy / len;
                const ny = dx / len;
                
                const offset = (Math.random() - 0.5) * displace * (1 - p * 0.5);
                
                cx = tx + nx * offset;
                cy = ty + ny * offset;
                ctx.lineTo(cx, cy);
            }
            ctx.stroke();
        };

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const renderLoop = () => {
            // Smoothly interpolate position coordinates
            const targetX = posRef.current.x;
            const targetY = posRef.current.y;
            const currentX = smoothPosRef.current.x;
            const currentY = smoothPosRef.current.y;

            const nextX = lerp(currentX, targetX, 0.08);
            const nextY = lerp(currentY, targetY, 0.08);
            smoothPosRef.current = { x: nextX, y: nextY };

            // Update ambient background light directly in DOM (transform is composite-only, bypassing layout)
            if (glow) {
                glow.style.transform = `translate(${nextX - 250}px, ${nextY - 250}px)`;
            }

            // Alpha fade wipes old frames smoothly to create persistent glowing trail
            ctx.fillStyle = 'rgba(5, 7, 15, 0.28)';
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const dx = nextX - lastX;
            const dy = nextY - lastY;
            const speed = Math.sqrt(dx * dx + dy * dy);

            lastX = nextX;
            lastY = nextY;

            if (speed > 1.5 && nextX > 0 && nextY > 0) {
                ctx.globalCompositeOperation = 'screen';
                
                const sparkCount = Math.random() > 0.6 ? 2 : 1;
                
                for (let i = 0; i < sparkCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = 20 + Math.random() * Math.min(80, speed * 2.5);
                    const tx = nextX + Math.cos(angle) * length;
                    const ty = nextY + Math.sin(angle) * length;

                    // Neon outline (emulated glow using a wider, transparent line instead of slow shadowBlur)
                    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
                    ctx.lineWidth = 8;
                    drawLightningArc(nextX, nextY, tx, ty, length * 0.26);
                    
                    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
                    ctx.lineWidth = 3.5;
                    drawLightningArc(nextX, nextY, tx, ty, length * 0.26);

                    // Core bright filament
                    ctx.strokeStyle = '#e0f7fa';
                    ctx.lineWidth = 1.2;
                    drawLightningArc(nextX, nextY, tx, ty, length * 0.26);
                }
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            {/* The base mouse glow radial light (GPU composition via transform) */}
            <div
                ref={glowRef}
                className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(78, 205, 196, 0.03) 30%, transparent 60%)',
                    willChange: 'transform',
                }}
                aria-hidden
            />

            {/* Premium Fullscreen Procedural Lightning Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
                style={{ mixBlendMode: 'screen' }}
            />
        </>
    );
}

function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                setProgress((window.scrollY / totalHeight) * 100);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-cyan-500 via-cyan-300 to-blue-500 z-[100] transition-all duration-100 ease-out" 
            style={{ 
                width: `${progress}%`, 
                boxShadow: '0 0 8px rgba(0, 240, 255, 0.8), 0 0 16px rgba(0, 240, 255, 0.4)' 
            }}
        />
    );
}


function GlassNav({ visible }: { visible: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const sections = ['work', 'services', 'pricing', 'process'];
        const handleScroll = () => {
            const scrollPos = window.scrollY;
            const viewportHeight = window.innerHeight;
            const offset = 220; // Trigger when top of section is 220px from screen top

            let currentActive = '';

            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    const bottom = top + height;

                    if (scrollPos + offset >= top && scrollPos + offset < bottom) {
                        currentActive = sectionId;
                        break;
                    }
                }
            }
            setActiveSection(currentActive);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'py-3' : 'py-5'} ${
                visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
            }`}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div
                    className={`liquid-glass-strong specular-highlight rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'rounded-xl !py-2.5' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="relative w-10 h-10 rounded-xl overflow-hidden logo-glow flex-shrink-0"
                            style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}
                        >
                            <video src="/logo.mp4" autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }} />
                        </div>
                        <span className="lightning-text text-[16px] tracking-tight">-4 Zenith</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        {['Work', 'Services', 'Pricing', 'Process'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className={`liquid-glass glass-pill !py-2 !px-5 !text-sm cursor-pointer no-underline transition-all duration-300 ${
                                    item.toLowerCase() === activeSection
                                        ? 'logo-glow !text-white !bg-cyan-500/10 !border-cyan-400/50'
                                        : 'hover:!text-white'
                                }`}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="#contact"
                            className="hidden md:flex liquid-glass-strong glass-pill !py-2.5 !px-6 !text-sm cursor-pointer no-underline !font-semibold logo-glow hover:!text-white"
                        >
                            Start a project
                        </a>
                        <button
                            className="md:hidden liquid-glass glass-icon-box w-10 h-10 !rounded-xl cursor-pointer flex items-center justify-center"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="md:hidden mt-3 liquid-glass-strong rounded-2xl p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-4">
                        {['Work', 'Services', 'Pricing', 'Process'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                onClick={() => setMenuOpen(false)}
                                className={`liquid-glass glass-pill text-center cursor-pointer no-underline transition-all duration-300 ${
                                    item.toLowerCase() === activeSection
                                        ? 'logo-glow !text-white !bg-cyan-500/10 !border-cyan-400/50'
                                        : ''
                                }`}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}

// --- Iris wipe intro (logo + scroll indicator only — iris/rings drawn on canvas by App RAF loop) ---
interface IntroSectionProps {
    logoRef: React.RefObject<HTMLDivElement>;
    scrollRef: React.RefObject<HTMLDivElement>;
}

function IntroSection({ logoRef, scrollRef }: IntroSectionProps) {
    return (
        <div className="fixed inset-0 z-[21] pointer-events-none">

            {/* ── Center Logo ── */}
            <div
                ref={logoRef}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ 
                    opacity: 1, 
                    transform: 'scale(1)',
                    willChange: 'opacity, transform' 
                }}
            >
                <Magnetic strength={0.15}>
                    <div className="relative group cursor-pointer pointer-events-auto">
                        <div className="absolute inset-[-8px] rounded-full bg-cyan-400/20 blur-xl opacity-50 group-hover:opacity-85 transition-opacity duration-700" />
                        <div
                            className="animate-glitch-shake relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors duration-700 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(0,240,255,0.25),inset_0_0_30px_rgba(0,240,255,0.1)]"
                            style={{ willChange: 'transform' }}
                        >
                            <video src="/logo.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ display: 'block' }} />
                            <div className="glitch-ghost-red absolute inset-0 overflow-hidden" style={{ willChange: 'transform, clip-path' }}>
                                <video src="/logo.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ display: 'block', filter: 'saturate(4) hue-rotate(320deg) brightness(1.2)', mixBlendMode: 'screen' }} />
                            </div>
                            <div className="glitch-ghost-cyan absolute inset-0 overflow-hidden" style={{ willChange: 'transform, clip-path' }}>
                                <video src="/logo.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ display: 'block', filter: 'saturate(4) hue-rotate(170deg) brightness(1.2)', mixBlendMode: 'screen' }} />
                            </div>
                            <div className="glitch-ghost-bw absolute inset-0 overflow-hidden" style={{ willChange: 'transform, clip-path', opacity: 0 }}>
                                <video src="/logo.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ display: 'block', filter: 'grayscale(1) contrast(2.5) brightness(1.4)', mixBlendMode: 'luminosity' }} />
                            </div>
                            <div className="scanner-beam" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20 opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                    </div>
                </Magnetic>
            </div>

            {/* Scroll indicator */}
            <div
                ref={scrollRef}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto"
                style={{ opacity: 1 }}
            >
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-cyan-400/60 animate-pulse">scroll</span>
                <div className="animate-bounce flex flex-col items-center gap-1">
                    <div className="w-[1px] h-5 bg-gradient-to-b from-transparent to-cyan-400/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
            </div>
        </div>
    );
}

function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 sm:pt-40 pb-12">
            <div className="max-w-4xl mx-auto text-center">

                <RevealOnScroll delay={300}>
                    <div
                        className="section-label inline-flex justify-center mx-auto mb-12"
                        style={{ animation: 'float 8s ease-in-out infinite' }}
                    >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Now accepting new projects for 2026</span>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll delay={600}>
                    <h1 className="glow-heading text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-[-0.03em] leading-[1.05] mb-8">
                        <FadeRevealText text="Websites that" />
                        <br />
                        <FadeRevealText text="work beautifully" className="gradient-text" />
                    </h1>
                </RevealOnScroll>

                <RevealOnScroll delay={850}>
                    <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        High-performance websites crafted to convert visitors into customers.
                        Custom design, clean code, no templates.
                    </p>
                </RevealOnScroll>

                <RevealOnScroll delay={1100}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Magnetic strength={0.25}>
                            <a
                                href="#contact"
                                className="liquid-glass-strong specular-highlight glass-pill !px-10 !py-4 !text-[15px] !font-semibold logo-glow cursor-pointer flex items-center gap-3 group no-underline hover:!text-white"
                            >
                                Start your project
                                <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5" />
                            </a>
                        </Magnetic>
                        <Magnetic strength={0.25}>
                            <a
                                href="#work"
                                className="liquid-glass-subtle glass-pill !px-10 !py-4 !text-[15px] cursor-pointer no-underline hover:!text-white"
                            >
                                View portfolio
                            </a>
                        </Magnetic>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll stagger>
                    <div className="flex items-center justify-center gap-10 sm:gap-16">
                        {[
                            { to: 50, suffix: '+', label: 'Projects delivered' },
                            { to: 99, suffix: '%', label: 'Client satisfaction' },
                            { to: 1, suffix: 's', prefix: '<', label: 'Avg load time' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                    {stat.prefix}<AnimatedCounter to={stat.to} suffix={stat.suffix} />
                                </div>
                                <div className="text-white/35 text-xs mt-2 font-light tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

const projects = [
    {
        title: 'Meridian Studio',
        category: 'Creative Agency',
        description: 'Bold portfolio with immersive animations and custom CMS.',
        image: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['React', 'Animation', 'CMS'],
    },
    {
        title: 'Harvest & Co.',
        category: 'E-Commerce',
        description: 'High-converting storefront with seamless checkout.',
        image: 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['Next.js', 'Stripe', 'Shopify'],
    },
    {
        title: 'NovaPay',
        category: 'Fintech SaaS',
        description: 'Clean dashboard with real-time visualization.',
        image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['TypeScript', 'Charts', 'Auth'],
    },
    {
        title: 'Wanderlust',
        category: 'Travel Platform',
        description: 'Destination discovery with integrated booking.',
        image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['Maps', 'Booking', 'Mobile'],
    },
];

function WorkSection() {
    return (
        <section id="work" className="relative px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <RevealOnScroll>
                    <div className="text-center mb-20">
                        <div className="section-label">
                            <Monitor className="w-4 h-4 text-cyan-400" />
                            <span>Selected Work</span>
                        </div>
                        <h2 className="glow-heading text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em] mb-5 mt-8">
                            <FadeRevealText text="Crafted with care" />
                        </h2>
                        <p className="text-white/45 text-lg max-w-lg mx-auto font-light">
                            Every project designed from scratch, built for speed, optimized to convert.
                        </p>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll stagger>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {projects.map((project) => (
                            <TiltCard
                                key={project.title}
                                className="liquid-glass glass-card card-shine group cursor-pointer !p-0 overflow-hidden relative"
                            >
                                <div className="relative h-64 sm:h-72 overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a15]/90 via-[#0a0a15]/20 to-transparent" />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                                    <div className="absolute top-5 right-5 liquid-glass glass-pill !py-1.5 !px-4 !text-[10px] uppercase tracking-wider">
                                        {project.category}
                                    </div>
                                </div>
                                <div className="p-7">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white font-semibold text-lg tracking-tight">{project.title}</h3>
                                        <ArrowUpRight className="w-5 h-5 text-white/25 group-hover:text-white/70 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </div>
                                    <p className="text-white/45 text-sm leading-relaxed mb-5 font-light">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="liquid-glass-subtle glass-pill !py-1.5 !px-4 !text-[11px] !font-normal hover:bg-white/10 transition-all duration-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

const services = [
    {
        icon: Palette,
        title: 'Custom Design',
        description: 'Every pixel designed from scratch for your brand. No templates, no shortcuts.',
        color: 'from-cyan-500/20 to-blue-400/10',
    },
    {
        icon: Code2,
        title: 'Clean Development',
        description: 'Modern frameworks, semantic HTML, optimized CSS. Fast and maintainable.',
        color: 'from-blue-500/20 to-teal-400/10',
    },
    {
        icon: Smartphone,
        title: 'Responsive First',
        description: 'Flawless on every device. Mobile-first with zero layout shifts.',
        color: 'from-teal-500/20 to-cyan-400/10',
    },
    {
        icon: Zap,
        title: 'Blazing Performance',
        description: 'Sub-second load times, perfect Lighthouse scores. Speed is a feature.',
        color: 'from-cyan-500/20 to-teal-400/10',
    },
    {
        icon: Globe,
        title: 'SEO & Analytics',
        description: 'Structured data, meta optimization, analytics setup for growth.',
        color: 'from-blue-500/20 to-cyan-400/10',
    },
    {
        icon: Rocket,
        title: 'Launch & Support',
        description: 'Deployment, domain setup, 30 days post-launch support included.',
        color: 'from-teal-500/20 to-blue-500/10',
    },
];

function ServicesSection() {
    return (
        <section id="services" className="relative px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <RevealOnScroll>
                    <div className="text-center mb-20">
                        <div className="section-label">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span>What We Do</span>
                        </div>
                        <h2 className="glow-heading text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em] mb-5 mt-8">
                            <FadeRevealText text="Full-stack craft" />
                        </h2>
                        <p className="text-white/45 text-lg max-w-lg mx-auto font-light">
                            Design, development, deployment -- everything your site needs.
                        </p>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll stagger>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, idx) => (
                            <div
                                key={service.title}
                                className="liquid-glass glass-card card-shine group cursor-default relative overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(135deg, ${service.color.includes('cyan') ? 'rgba(0,240,255,0.1)' : 'rgba(0,140,255,0.1)'}, transparent)`,
                                    }}
                                />
                                <div className={`liquid-glass-subtle glass-icon-box mb-6 bg-gradient-to-br ${service.color} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                                    <service.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-[17px] mb-3 tracking-tight group-hover:text-amber-200 transition-colors duration-300">{service.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors duration-300">{service.description}</p>
                                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

const plans = [
    {
        name: 'Landing Page',
        price: '$2,500',
        description: 'Single high-converting page, perfect for product launches.',
        features: ['Custom design', 'Responsive', 'Contact form', 'SEO setup', '1 revision round', '5-day delivery'],
        popular: false,
    },
    {
        name: 'Business Site',
        price: '$5,000',
        description: 'Full multi-page website for professional online presence.',
        features: ['Everything in Landing', 'Up to 7 pages', 'CMS integration', 'Analytics setup', '3 revision rounds', '14-day delivery', '30-day support'],
        popular: true,
    },
    {
        name: 'Web Application',
        price: '$10,000+',
        description: 'Custom web app with auth, databases, complex interactions.',
        features: ['Everything in Business', 'Unlimited pages', 'User auth', 'Database & API', 'Custom interactions', '60-day support', 'Ongoing maintenance'],
        popular: false,
    },
];

function PricingSection() {
    return (
        <section id="pricing" className="relative px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <RevealOnScroll>
                    <div className="text-center mb-20">
                        <div className="section-label">
                            <Star className="w-4 h-4 text-cyan-400" />
                            <span>Pricing</span>
                        </div>
                        <h2 className="glow-heading text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em] mb-5 mt-8">
                            <FadeRevealText text="Simple, transparent" />
                        </h2>
                        <p className="text-white/45 text-lg max-w-lg mx-auto font-light">
                            No hidden fees. No hourly billing. You know the cost upfront.
                        </p>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll stagger>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`${
                                    plan.popular ? 'liquid-glass-strong border border-cyan-400/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] overflow-visible' : 'liquid-glass card-shine overflow-hidden'
                                } glass-card relative group ${
                                    plan.popular ? '!rounded-3xl scale-[1.02] !pt-10 md:!pt-12' : ''
                                }`}
                            >
                                {plan.popular && (
                                    <div className="popular-badge">
                                        MOST POPULAR
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-white font-semibold text-lg tracking-tight">{plan.name}</h3>
                                    <p className="text-white/35 text-sm mt-2 font-light">{plan.description}</p>
                                </div>
                                <div className="mb-8">
                                    <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
                                    {plan.price !== '$10,000+' && <span className="text-white/35 text-sm ml-2 font-light">flat fee</span>}
                                </div>
                                <div className="space-y-3.5 mb-10">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className="liquid-glass-subtle w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-white/50 text-sm font-light">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <a
                                    href="#contact"
                                    className={`block text-center no-underline transition-all duration-300 ${
                                        plan.popular
                                            ? 'liquid-glass-strong border border-cyan-400/40 hover:border-cyan-400/70 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                            : 'liquid-glass'
                                    } glass-pill !py-3.5 !text-[14px] !font-semibold cursor-pointer hover:!text-white`}
                                >
                                    Get started
                                </a>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

const steps = [
    { num: '01', title: 'Discovery', description: 'We discuss your goals, audience, and vision. We learn your business.' },
    { num: '02', title: 'Design', description: 'Custom design in Figma. You review, give feedback, we iterate.' },
    { num: '03', title: 'Develop', description: 'Built with modern code. Progress updates and preview links.' },
    { num: '04', title: 'Launch', description: 'Deploy, connect domain, hand over. You go live.' },
];

function ProcessSection() {
    return (
        <section id="process" className="relative px-6 py-32">
            <div className="max-w-4xl mx-auto">
                <RevealOnScroll>
                    <div className="text-center mb-20">
                        <div className="liquid-glass glass-pill inline-flex items-center gap-2.5 mb-8 specular-highlight">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span className="text-[13px]">Process</span>
                        </div>
                        <h2 className="glow-heading text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em] mb-5">
                            <FadeRevealText text="Four steps to launch" />
                        </h2>
                        <p className="text-white/45 text-lg max-w-lg mx-auto font-light">
                            Streamlined process that keeps things moving, eliminates surprises.
                        </p>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll stagger>
                    <div className="space-y-6">
                        {steps.map((step, i) => (
                            <div
                                key={step.num}
                                className="liquid-glass glass-card specular-highlight card-shine !rounded-2xl !p-7 flex items-start gap-7 group cursor-default"
                            >
                                <div className="liquid-glass-subtle glass-icon-box !w-14 !h-14 !rounded-2xl flex-shrink-0 text-white font-bold bg-gradient-to-br from-cyan-500/15 to-blue-400/10">
                                    {step.num}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-[18px] mb-2 tracking-tight flex items-center gap-2">
                                        {step.title}
                                        <ChevronRight className="w-5 h-5 text-white/15 group-hover:text-white/40 transition-colors duration-500 group-hover:translate-x-0.5 transition-transform" />
                                    </h3>
                                    <p className="text-white/45 text-sm leading-relaxed font-light">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

const testimonials = [
    {
        quote: "Working with -4 Zenith was a game-changer. Our conversion rate doubled within the first month.",
        name: 'Sarah Chen',
        role: 'Founder, Meridian Studio',
    },
    {
        quote: "The site is fast, beautiful, and works on every device. Best investment we made.",
        name: 'Marcus Webb',
        role: 'CEO, Harvest & Co.',
    },
    {
        quote: "From first call to launch, everything was seamless. They just get it.",
        name: 'Priya Sharma',
        role: 'CTO, NovaPay',
    },
];

function TestimonialsSection() {
    return (
        <section className="relative px-6 py-32">
            <div className="max-w-6xl mx-auto">
                <RevealOnScroll>
                    <div className="text-center mb-20">
                        <div className="liquid-glass glass-pill inline-flex items-center gap-2.5 mb-8 specular-highlight">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-[13px]">Testimonials</span>
                        </div>
                        <h2 className="glow-heading text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em]">
                            <FadeRevealText text="Client love" />
                        </h2>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll stagger>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t) => (
                            <div key={t.name} className="liquid-glass glass-card specular-highlight card-shine">
                                <div className="flex gap-1.5 mb-5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                                    ))}
                                </div>
                                <p className="text-white/65 text-sm leading-relaxed mb-7 font-light italic">"{t.quote}"</p>
                                <div>
                                    <div className="text-white text-sm font-medium">{t.name}</div>
                                    <div className="text-white/35 text-xs font-light">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

function ContactSection() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section id="contact" className="relative px-6 py-32">
            <div className="max-w-2xl mx-auto">
                <RevealOnScroll>
                    <div className="text-center mb-14">
                        <div className="liquid-glass glass-pill inline-flex items-center gap-2.5 mb-8 specular-highlight">
                            <Rocket className="w-4 h-4 text-cyan-400" />
                            <span className="text-[13px]">Let's Talk</span>
                        </div>
                        <h2 className="glow-heading text-4xl sm:text-6xl font-bold text-white tracking-[-0.03em] mb-5">
                            <FadeRevealText text="Ready to build?" />
                        </h2>
                        <p className="text-white/45 text-lg max-w-md mx-auto font-light">
                            Tell us about your project. We'll get back to you within 24 hours.
                        </p>
                    </div>
                </RevealOnScroll>

                <RevealOnScroll>
                    <div className="liquid-glass-strong specular-highlight card-shine rounded-3xl p-10 sm:p-12">
                        {submitted ? (
                            <div className="text-center py-10">
                                <div className="liquid-glass glass-icon-box !w-20 !h-20 !rounded-2xl mx-auto mb-6 logo-glow">
                                    <Check className="w-9 h-9 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-2xl mb-3">Message sent</h3>
                                <p className="text-white/45 font-light">We'll be in touch within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-white/40 text-xs font-medium mb-2.5 block uppercase tracking-wider">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full liquid-glass-subtle rounded-xl px-5 py-4 text-white text-sm bg-transparent outline-none focus:border-white/30 transition-colors duration-500 placeholder:text-white/15"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-xs font-medium mb-2.5 block uppercase tracking-wider">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full liquid-glass-subtle rounded-xl px-5 py-4 text-white text-sm bg-transparent outline-none focus:border-white/30 transition-colors duration-500 placeholder:text-white/15"
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs font-medium mb-2.5 block uppercase tracking-wider">Project type</label>
                                    <select className="w-full liquid-glass-subtle rounded-xl px-5 py-4 text-white text-sm bg-transparent outline-none focus:border-white/30 transition-colors duration-500 appearance-none cursor-pointer">
                                        <option value="" className="bg-[#0a0a15]">Select a package</option>
                                        <option value="landing" className="bg-[#0a0a15]">Landing Page -- $2,500</option>
                                        <option value="business" className="bg-[#0a0a15]">Business Site -- $5,000</option>
                                        <option value="webapp" className="bg-[#0a0a15]">Web Application -- $10,000+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-white/40 text-xs font-medium mb-2.5 block uppercase tracking-wider">Project details</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full liquid-glass-subtle rounded-xl px-5 py-4 text-white text-sm bg-transparent outline-none focus:border-white/30 transition-colors duration-500 resize-none placeholder:text-white/15"
                                        placeholder="What are you building? Who is it for? Any timeline or budget?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full liquid-glass-strong specular-highlight logo-glow glass-pill !py-4 !text-[15px] !font-semibold cursor-pointer flex items-center justify-center gap-3 group hover:!text-white"
                                >
                                    Send message
                                    <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5" />
                                </button>
                            </form>
                        )}
                    </div>
                </RevealOnScroll>
            </div>
        </section>
    );
}

// --- High-tech Matrix rain & CRT interactive terminal drawer ---
interface MatrixRainProps {
    onClick?: () => void;
}

function MatrixRain({ onClick }: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        canvas.width = canvas.parentElement?.clientWidth || 400;
        canvas.height = canvas.parentElement?.clientHeight || 600;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*+=?><';
        const columns = canvas.width / 14;
        const drops: number[] = Array(Math.floor(columns)).fill(1);

        let rafId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(5, 7, 15, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(0, 240, 255, 0.7)'; // Cyan rain to match Zenith System branding
            ctx.font = '12px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * 14, drops[i] * 14);

                if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            rafId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div className="relative w-full h-full min-h-[384px] cursor-pointer" onClick={onClick}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            <div className="absolute top-4 right-4 bg-black/70 border border-cyan-400/30 rounded px-2.5 py-1 text-xs text-cyan-400 font-mono select-none animate-pulse pointer-events-none">
                [MATRIX_MODE: ACTIVE]
            </div>
            <div className="absolute bottom-4 left-4 bg-black/70 border border-cyan-400/30 rounded px-2.5 py-1 text-xs text-cyan-400 font-mono select-none pointer-events-none">
                click to focus / type "clear" to exit
            </div>
        </div>
    );
}

// --- High-fidelity Terminal Response with AI Stream-Typing & Scroll Tracking ---
interface ShellResponseProps {
    cmd: string;
    result: string | ReactNode;
    isLatest: boolean;
    onComplete: () => void;
    terminalEndRef: React.RefObject<HTMLDivElement>;
}

function ShellResponse({ cmd, result, isLatest, onComplete, terminalEndRef }: ShellResponseProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isThinking, setIsThinking] = useState(isLatest);
    const [isFinished, setIsFinished] = useState(!isLatest);

    useEffect(() => {
        if (!isLatest) {
            setIsFinished(true);
            setIsThinking(false);
            return;
        }

        if (isThinking) {
            const thinkingTimer = setTimeout(() => {
                setIsThinking(false);
            }, 550); // Simulated 550ms neural latency
            return () => clearTimeout(thinkingTimer);
        }

        if (typeof result === 'string') {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(prev => prev + result.charAt(i));
                i++;
                
                // Force container to scroll bottom on every character paint
                const container = terminalEndRef.current?.parentElement;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }

                if (i >= result.length) {
                    clearInterval(interval);
                    setIsFinished(true);
                    onComplete();
                }
            }, 6);
            return () => clearInterval(interval);
        } else {
            // Simulated render delay for nested ReactNodes
            const delay = setTimeout(() => {
                setIsFinished(true);
                onComplete();
            }, 450);
            return () => clearTimeout(delay);
        }
    }, [result, isLatest, isThinking, onComplete, terminalEndRef]);

    return (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Command Prompt Header */}
            <div className="flex items-center gap-2 text-cyan-400/60 font-semibold select-none text-xs">
                <span>zenith-shell:~#</span>
                <span className="text-white/80 font-mono">{cmd}</span>
            </div>

            {/* Neural output block */}
            <div className="text-cyan-100/90 whitespace-pre-wrap leading-relaxed pl-3 font-mono border-l border-cyan-500/10 py-0.5 relative">
                {isThinking ? (
                    <div className="flex items-center gap-2 py-1 text-cyan-400/50 text-[10px] select-none uppercase tracking-wider">
                        <span className="animate-pulse">Neural Frame AI calculating...</span>
                        <div className="flex gap-1">
                            <span className="w-1 h-1.5 bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1.5 bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1.5 bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                ) : typeof result === 'string' ? (
                    <>
                        <span>{isLatest ? displayedText : result}</span>
                        {!isFinished && (
                            <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-0.5" style={{ verticalAlign: 'middle' }} />
                        )}
                    </>
                ) : (
                    isFinished ? (
                        <div className="animate-in fade-in slide-in-from-bottom-1 duration-400">
                            {result}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-1 text-cyan-400/50 text-[10px] select-none uppercase tracking-wider">
                            <span className="animate-pulse">Rendering visual components...</span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping" />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

interface TerminalDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

function TerminalDrawer({ isOpen, onClose }: TerminalDrawerProps) {
    const [history, setHistory] = useState<{ cmd: string; result: string | ReactNode }[]>([
        { cmd: 'system', result: 'Initializing Zenith OS v1.0.4...\nSystem status: ONLINE\nWelcome to our engineering mainframe.\nType "help" to see available commands.' }
    ]);
    const [input, setInput] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [cmdHistory, setCmdHistory] = useState<string[]>(['system']);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen && !isGenerating) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, isGenerating]);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const handleComplete = useCallback(() => {
        setIsGenerating(false);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const trimmedCmd = input.trim().toLowerCase();
            if (!trimmedCmd) return;

            const newCmdHistory = [...cmdHistory, input];
            setCmdHistory(newCmdHistory);
            setHistoryIndex(-1);

            let result: string | ReactNode = '';

            switch (trimmedCmd) {
                case 'help':
                    result = `Available commands:
  about    - Who are the builders?
  skills   - Our specialized technology stack
  projects - Our core engineering deployments
  system   - Display live mainframe telemetry
  matrix   - Trigger terminal digital rain protocol
  clear    - Wipe terminal logs`;
                    break;
                case 'about':
                    result = 'Zenith System is engineered by an elite two-person team (systems architect and low-level software engineer) specializing in ultra-high performance web structures, GPU-accelerated pipelines, and bespoke design systems. Zero templates. Raw code. Built by two, engineered for millions.';
                    break;
                case 'skills':
                    result = `TEAM TECHNICAL SPECIFICATIONS:
  Systems: React, TypeScript, Next.js, WebGL [██████████████████] 100%
  Low-Level: C/C++, Rust, Assembly, WASM [████████████████░░] 88%
  Pipelines: GPU Renderers, Shaders, Canvas [█████████████████░] 94%
  Security: Memory Protections, Sandboxing  [██████████████░░░░] 78%`;
                    break;
                case 'projects':
                    result = `ACTIVE TEAM DEPLOYMENTS:
  • Meridian Studio - Immersive digital agency with custom rendering pipelines.
  • Harvest & Co.  - Headless commerce integration with instant Stripe checkout.
  • NovaPay        - High-throughput SaaS dashboard with zero latency charts.
  • Wanderlust     - Geolocation Discovery Portal with spatial indexes.`;
                    break;
                case 'system':
                    const mem = Math.floor(Math.random() * 150) + 120;
                    const cpu = Math.floor(Math.random() * 25) + 5;
                    result = `ZENITH TEAM STATUS:
  OS: Zenith Kernel v1.0.4-LTS (x86_64)
  CPU Load: ${cpu}% [GPU accelerated hardware composite]
  Mainframe Uptime: 432h 12m (Stable)
  Memory Usage: ${mem}MB / 1024MB
  Pipeline Status: locked 120 FPS / compositor thread IDLE`;
                    break;
                case 'matrix':
                    result = 'MATRIX INTRUSION MODE ACTIVATED. Digital Rain system sequence initiated... type "clear" to return to normal console.';
                    break;
                case 'clear':
                    setHistory([
                        { cmd: 'system', result: 'Initializing Zenith OS v1.0.4...\nSystem status: ONLINE\nWelcome to our engineering mainframe.\nType "help" to see available commands.' }
                    ]);
                    setInput('');
                    setIsGenerating(false);
                    return;
                case 'cook45':
                    result = 'COOK45 DETECTED: "clack, is that you? The low-level hooking vectors are set up. Memory is mapped. AV has been completely bypassed. Keep grinding."';
                    break;
                case 'clack':
                    result = 'CLACK ACCESS: "Partner, the trainers and custom injection hooks are compile-ready. We run this system now."';
                    break;
                default:
                    result = `Unknown instruction: "${trimmedCmd}". Type "help" for a list of system capabilities.`;
                    break;
            }

            const isInstant = trimmedCmd === 'matrix' || trimmedCmd === 'clear';
            setHistory(prev => [...prev, { cmd: input, result }]);
            setInput('');
            setIsGenerating(!isInstant);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length === 0) return;
            const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setInput(cmdHistory[newIndex]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex === -1) return;
            if (historyIndex === cmdHistory.length - 1) {
                setHistoryIndex(-1);
                setInput('');
            } else {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(cmdHistory[newIndex]);
            }
        }
    };

    const isMatrix = history.length > 0 && history[history.length - 1].cmd.toLowerCase().trim() === 'matrix';

    return (
        <div
            className={`fixed inset-0 z-[999] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Full-screen backdrop — click to close */}
            <div
                className="absolute inset-0 bg-black/70"
                style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                onClick={onClose}
            />

            {/* Centered floating HUD panel */}
            <div
                className={`relative w-full max-w-3xl mx-4 flex flex-col terminal-text font-mono text-sm overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'translate-y-0 scale-100' : 'translate-y-6 scale-[0.97]'
                }`}
                style={{
                    height: 'clamp(480px, 65vh, 720px)',
                    background: 'linear-gradient(160deg, rgba(4, 8, 20, 0.97) 0%, rgba(2, 6, 16, 0.99) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.18)',
                    borderRadius: '16px',
                    boxShadow: '0 0 0 1px rgba(0,240,255,0.05) inset, 0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(0,240,255,0.08)',
                }}
                onClick={focusInput}
            >
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-[16px] overflow-hidden" style={{ zIndex: 1 }}>
                    <div className="scanner-beam opacity-30" />
                </div>

                {/* Dot-matrix background */}
                <div className="absolute inset-0 pointer-events-none rounded-[16px]" style={{
                    backgroundImage: 'radial-gradient(rgba(0,240,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                    zIndex: 0,
                }} />

                {/* Corner bracket decorations */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-cyan-400/60 pointer-events-none" style={{ zIndex: 2 }} />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-cyan-400/60 pointer-events-none" style={{ zIndex: 2 }} />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-cyan-400/60 pointer-events-none" style={{ zIndex: 2 }} />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-cyan-400/60 pointer-events-none" style={{ zIndex: 2 }} />

                {/* Top edge glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), transparent)', zIndex: 2 }} />

                {/* Inner content wrapper */}
                <div className="relative flex flex-col h-full p-6" style={{ zIndex: 3 }}>

                {/* Header */}
                <div className="flex flex-col gap-2 pb-4 border-b border-cyan-500/15 mb-5 select-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-cyan-300">
                            <span className="text-cyan-400 font-bold tracking-wider text-[11px]">[◣ ZENITH_SHELL_v1.0.4 ◢]</span>
                            <span className="text-cyan-500/30">//</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-cyan-400/60 uppercase tracking-widest text-[9px]">SIG:</span>
                                <div className="flex gap-0.5 items-end h-3">
                                    {[1, 2, 1.5, 2.5, 0.8].map((h, i) => (
                                        <span key={i} className="w-[2px] bg-cyan-400 animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms`, display: 'block' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-cyan-500/50 hover:text-cyan-300 transition-colors duration-200 font-mono text-[10px] border border-cyan-500/20 hover:border-cyan-400/50 px-3 py-1 rounded hover:shadow-[0_0_10px_rgba(0,240,255,0.15)] active:scale-95"
                        >
                            [ESC // EXIT]
                        </button>
                    </div>
                    <div className="flex gap-4 text-cyan-500/30 text-[9px] uppercase tracking-wider">
                        <span>MEM: 120/1024MB</span>
                        <span>PORT: 5173</span>
                        <span>STATUS: <span className="text-cyan-400/60">ONLINE</span></span>
                        <span>UPTIME: 432h</span>
                    </div>
                </div>

                {/* Body / Scrollable logs */}
                <div
                    onClick={focusInput}
                    className="flex-1 overflow-y-auto mb-4 custom-scrollbar space-y-5 pr-1 select-text cursor-pointer"
                >
                    {isMatrix ? (
                        <MatrixRain onClick={focusInput} />
                    ) : (
                        history.map((item, idx) => (
                            <ShellResponse 
                                key={idx}
                                cmd={item.cmd}
                                result={item.result}
                                isLatest={idx === history.length - 1 && history.length > 1}
                                onComplete={handleComplete}
                                terminalEndRef={terminalEndRef}
                            />
                        ))
                    )}
                    <div ref={terminalEndRef} />
                </div>

                {/* Footer hint */}
                <div className="text-cyan-400/25 text-[9px] mb-2.5 select-none uppercase tracking-widest pl-0">
                    type <span className="text-cyan-400/50">"help"</span> for command list
                </div>

                {/* Footer input prompt */}
                <div className="flex items-center gap-2 select-none border-t border-cyan-500/15 pt-4">
                    <span className="text-cyan-400/80 font-semibold text-xs">zenith-shell:~#</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isGenerating}
                        className="bg-transparent text-white border-none outline-none font-mono flex-1 caret-cyan-400 p-0 m-0 focus:ring-0 text-sm focus:placeholder:opacity-0 placeholder:transition-opacity duration-300 disabled:opacity-50"
                        placeholder={isGenerating ? 'Analyzing prompt...' : 'Type "help"...'}
                        style={{ textShadow: '0 0 4px rgba(255, 255, 255, 0.2)' }}
                    />
                </div>
                </div>
            </div>
        </div>
    );
}

function FooterSection() {
    return (
        <footer className="relative px-6 py-24 pb-36">
            <div className="max-w-4xl mx-auto text-center">
                <div className="liquid-glass rounded-3xl p-14 specular-highlight card-shine">
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden logo-glow flex-shrink-0">
                            <video src="/logo.mp4" autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }} />
                        </div>
                        <span className="text-white font-semibold text-[16px] tracking-tight">-4 Zenith</span>
                    </div>
                    <p className="text-white/35 text-sm font-light mb-8">Custom websites that convert. No templates. No bloat.</p>
                    <div className="flex items-center justify-center gap-4">
                        {['Twitter', 'GitHub', 'LinkedIn', 'Dribbble'].map((link) => (
                            <button key={link} className="liquid-glass-subtle glass-pill !py-2 !px-5 !text-xs cursor-pointer hover:!text-white">
                                {link}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-white/20 text-xs mt-10 font-light">
                    &copy; {new Date().getFullYear()} -4 Zenith. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

function App() {
    const scrollYRef    = useRef(0);
    const easedScrollYRef = useRef(0);
    const irisCanvasRef = useRef<HTMLCanvasElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const scrollIndicatorRef = useRef<HTMLDivElement>(null);
    const [showNav, setShowNav]     = useState(false);
    const [introDone, setIntroDone] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(false);

    useEffect(() => {
        let animId:   number | null = null;
        let timeoutId: number | null = null;
        // Keep RAF alive while rings are spinning (ringOpacity > 0) even if scroll stopped
        let keepAlive = true;

        // closure cache for window size to avoid style invalidation (layout thrashing) on every frame
        let vw = window.innerWidth;
        let vh = window.innerHeight;

        const draw = () => {
            const target = scrollYRef.current;
            const prev   = easedScrollYRef.current;
            const diff   = target - prev;
            const next   = Math.abs(diff) < 0.05 ? target : prev + diff * 0.18;
            easedScrollYRef.current = next;

            const introScrollH = vh * 0.45;
            const progress     = Math.min(next / introScrollH, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 2.5);

            // Let circle grow all the way to 100% of maxRadius to prevent visible corners on scroll
            const cappedProgress  = Math.min(easedProgress, 1.0);
            const maxRadius       = Math.hypot(vw / 2, vh / 2) * 1.05;
            const ringPx          = cappedProgress * maxRadius;
            const ringOpacity     = easedProgress < 0.04
                ? 0
                : Math.max(0, 1 - Math.max(0, (easedProgress - 0.82) / 0.18));
            const curtainOpacity  = easedProgress < 0.82
                ? 1
                : Math.max(0, 1 - (easedProgress - 0.82) / 0.18);

            // ── Canvas draw (iris + spinning rings) ──────────────────────────────
            const canvas = irisCanvasRef.current;
            if (canvas) {
                if (canvas.width !== vw || canvas.height !== vh) {
                    canvas.width  = vw;
                    canvas.height = vh;
                }
                const ctx = canvas.getContext('2d')!;
                const cx  = vw / 2;
                const cy  = vh / 2;
                ctx.clearRect(0, 0, vw, vh);

                if (curtainOpacity > 0) {
                    // Dark background with iris hole
                    ctx.globalAlpha = curtainOpacity;
                    ctx.fillStyle   = '#070b19';
                    ctx.fillRect(0, 0, vw, vh);

                    if (ringPx > 0) {
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.beginPath();
                        ctx.arc(cx, cy, ringPx, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalCompositeOperation = 'source-over';
                    }
                    ctx.globalAlpha = 1;
                }

                // Disable pointer-events as soon as curtain is invisible so clicks pass through
                canvas.style.pointerEvents = curtainOpacity > 0 ? 'auto' : 'none';

                // Spinning neon rings
                if (ringOpacity > 0 && ringPx > 2) {
                    const now     = Date.now();
                    const spinCw  = ((now % 12000) / 12000) * Math.PI * 2;
                    const spinCcw = -((now % 16000) / 16000) * Math.PI * 2;

                    // Layer 1 — solid glow (Highly Optimized: Multi-stroke stacking instead of CPU-heavy shadowBlur filter)
                    ctx.beginPath();
                    ctx.arc(cx, cy, ringPx, 0, Math.PI * 2);
                    
                    // Outer diffuse glow layer
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * ringOpacity})`;
                    ctx.lineWidth   = 12;
                    ctx.stroke();

                    // Medium glow layer
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.35 * ringOpacity})`;
                    ctx.lineWidth   = 5;
                    ctx.stroke();

                    // Inner bright core
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.95 * ringOpacity})`;
                    ctx.lineWidth   = 1.5;
                    ctx.stroke();

                    // Layer 2 — dashed CW
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate(spinCw);
                    ctx.setLineDash([10, 10]);
                    ctx.beginPath();
                    ctx.arc(0, 0, ringPx * 1.012, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.75 * ringOpacity})`;
                    ctx.lineWidth   = 2;
                    ctx.stroke();
                    ctx.restore();

                    // Layer 3 — dotted CCW
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate(spinCcw);
                    ctx.setLineDash([3, 8]);
                    ctx.beginPath();
                    ctx.arc(0, 0, ringPx * 0.988, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.6 * ringOpacity})`;
                    ctx.lineWidth   = 2.5;
                    ctx.stroke();
                    ctx.restore();
                    ctx.setLineDash([]);
                }
            }

            // ── Direct style updates to logo/scroll refs (avoiding expensive full-DOM documentElement property recalculation) ──
            const logoOpacity           = Math.max(0, 1 - Math.max(0, (easedProgress - 0.82) / 0.18));
            const logoScale             = Math.pow(1 - Math.min(easedProgress / 0.85, 1), 2.5);
            const scrollIndicatorOpacity = Math.max(0, 1 - progress / 0.3);
            
            const logoEl = logoRef.current;
            if (logoEl) {
                logoEl.style.opacity = logoOpacity.toString();
                logoEl.style.transform = `scale(${logoScale})`;
            }
            
            const scrollEl = scrollIndicatorRef.current;
            if (scrollEl) {
                scrollEl.style.opacity = scrollIndicatorOpacity.toString();
            }

            // ── Gated React state updates (only on threshold crossings) ───────────
            const currentShowNav = next > introScrollH * 0.70;
            setShowNav(prev => {
                // Auto-close terminal if user scrolls back into curtain zone
                if (prev && !currentShowNav) {
                    setTerminalOpen(false);
                }
                return prev !== currentShowNav ? currentShowNav : prev;
            });

            if (progress >= 1) {
                if (timeoutId === null) {
                    timeoutId = window.setTimeout(() => setIntroDone(true), 900);
                }
            } else {
                if (timeoutId !== null) { window.clearTimeout(timeoutId); timeoutId = null; }
                setIntroDone(false);
            }

            // Keep alive while rings spin; sleep when fully stable and invisible
            keepAlive = ringOpacity > 0 || Math.abs(diff) > 0.05;
            animId = keepAlive ? requestAnimationFrame(draw) : null;
        };

        const handleScroll = () => {
            scrollYRef.current = window.scrollY;
            if (animId === null) { animId = requestAnimationFrame(draw); }
        };

        const handleResize = () => {
            vw = window.innerWidth;
            vh = window.innerHeight;
            const canvas = irisCanvasRef.current;
            if (canvas) {
                canvas.width  = vw;
                canvas.height = vh;
            }
            if (animId === null) { animId = requestAnimationFrame(draw); }
        };

        const handleKeyDownGlobal = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setTerminalOpen(false);
            }
        };

        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('keydown', handleKeyDownGlobal);
        animId = requestAnimationFrame(draw); // seed

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDownGlobal);
            if (animId !== null) cancelAnimationFrame(animId);
            if (timeoutId !== null) window.clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="min-h-screen relative" style={{ cursor: 'none' }}>
            <CustomCursor />
            <ScrollProgressBar />
            <AmbientBackground />
            <MouseGlow />

            {/* Canvas iris overlay — always mounted, draws itself; pointer-events blocks clicks on dark area */}
            {!introDone && (
                <canvas
                    ref={irisCanvasRef}
                    className="fixed inset-0 z-20 pointer-events-auto"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* Logo + scroll indicator — above canvas (z-[21] > z-20) */}
            {!introDone && <IntroSection logoRef={logoRef} scrollRef={scrollIndicatorRef} />}

            <div className="relative z-10">
                <GlassNav visible={showNav} />

                {/* Spacer — 45vh to match intro scroll distance */}
                <div className="h-[45vh] pointer-events-none" />

                {/* Hero content — locked until curtain is open */}
                <div
                    style={{
                        opacity: showNav ? 1 : 0,
                        transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1)',
                        transitionDelay: showNav ? '150ms' : '0ms',
                        pointerEvents: showNav ? 'auto' : 'none',
                    }}
                >
                    <HeroSection />
                </div>

                <WorkSection />
                <ServicesSection />
                <PricingSection />
                <ProcessSection />
                <TestimonialsSection />
                <ContactSection />
                <FooterSection />
            </div>

            {/* Slim aesthetic terminal pull tab */}
            <button
                onClick={() => setTerminalOpen(true)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-[1000] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer group ${
                    showNav && !terminalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                    width: '28px',
                    height: '72px',
                    borderRadius: '10px 0 0 10px',
                    background: 'linear-gradient(180deg, rgba(0,240,255,0.06) 0%, rgba(0,140,255,0.04) 100%)',
                    border: '1px solid rgba(0,240,255,0.2)',
                    borderRight: 'none',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '-4px 0 20px rgba(0,240,255,0.06)',
                }}
                title="Open Terminal"
            >
                <ChevronLeft
                    className="w-3.5 h-3.5 text-cyan-400/70 group-hover:text-cyan-300 transition-colors duration-200"
                    style={{ transform: 'translateX(1px)' }}
                />
            </button>

            {/* Pull-out HUD System Console Drawer */}
            <TerminalDrawer isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
        </div>
    );
}

export default App;
