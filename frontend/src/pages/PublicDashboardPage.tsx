import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../layouts/TopBar';
import { PlanCard } from '../components/Plans/PlanCard';
import type { PricingPlan } from '../types';
import { getPricingPlans } from '../services/planService';
import styles from './PublicDashboard.module.css';

/* ─── Inline SVG icons for benefits cards ─── */
const NoDocIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="4" y1="2" x2="20" y2="22" />
    </svg>
);

const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const QrIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="3" height="3" />
        <line x1="21" y1="14" x2="21" y2="21" />
        <line x1="14" y1="21" x2="21" y2="21" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

/* ─── Benefits data ─── */
const BENEFITS = [
    {
        icon: <NoDocIcon />,
        title: 'Eliminación de registros en papel',
        description: 'Digitaliza completamente el proceso de registro de ingreso y salida en tus instalaciones.',
    },
    {
        icon: <ClockIcon />,
        title: 'Reducción de tiempos de ingreso',
        description: 'Agiliza la entrada de visitantes con identificación previa y procesos automatizados.',
    },
    {
        icon: <QrIcon />,
        title: 'Identificación rápida por QR o credencial',
        description: 'Usa códigos QR, tarjetas o credenciales para una identificación instantánea y segura.',
    },
    {
        icon: <ShieldIcon />,
        title: 'Control de visitantes, vehículos y equipos',
        description: 'Gestiona de forma integral todos los accesos a tus instalaciones desde una sola plataforma.',
    },
];

/* ─── Main Component ─── */
const PublicDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carousel state
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const offsetRef = useRef(0);
    const [needsCarousel, setNeedsCarousel] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getPricingPlans();
                setPlans(data);
                setNeedsCarousel(data.length > 3);
            } catch (err) {
                setError('No se pudieron cargar los planes. Intenta de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Auto-scrolling carousel
    const animate = useCallback(() => {
        if (!trackRef.current) return;
        const track = trackRef.current;
        const slideWidth = track.firstElementChild
            ? (track.firstElementChild as HTMLElement).offsetWidth + 32 // 32 = gap (2rem)
            : 320;
        const totalWidth = slideWidth * plans.length;

        offsetRef.current += 0.5; // speed: 0.5px per frame
        if (offsetRef.current >= totalWidth / 2) {
            offsetRef.current = 0;
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`;
        animationRef.current = requestAnimationFrame(animate);
    }, [plans.length]);

    useEffect(() => {
        if (needsCarousel && plans.length > 0) {
            animationRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [needsCarousel, plans.length, animate]);

    const handlePlanSelect = (planId: string) => {
        navigate('/register-entity', { state: { planId } });
    };

    // For carousel: duplicate plans for seamless loop
    const carouselPlans = needsCarousel ? [...plans, ...plans] : plans;

    return (
        <div className={styles.pageWrapper}>
            {/* ─── NAVBAR ─── */}
            <TopBar showBranding showPlansButton showLoginButton />

            {/* ─── HERO ─── */}
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    Control Inteligente: Acceso a tus instalaciones
                </h1>
                <p className={styles.heroDescription}>
                    Digitaliza el registro de visitantes, vehículos y equipos en tus instalaciones.
                    Elimina los procesos en papel y reduce significativamente los tiempos de ingreso
                    mediante identificación previa como códigos QR, tarjetas o credenciales.
                    Una solución moderna para el control eficiente y seguro de accesos.
                </p>
                <button className={styles.heroCta} onClick={() => navigate('/plans')}>
                    Ver planes
                </button>
            </section>

            {/* ─── BENEFITS ─── */}
            <section className={styles.benefitsSection}>
                <h2 className={styles.sectionTitle}>¿Por qué elegirnos?</h2>
                <div className={styles.benefitsGrid}>
                    {BENEFITS.map((b, i) => (
                        <div key={i} className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>{b.icon}</div>
                            <h3 className={styles.benefitTitle}>{b.title}</h3>
                            <p className={styles.benefitDescription}>{b.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PLANS PREVIEW ─── */}
            <section className={styles.plansSection}>
                <h2 className={styles.sectionTitle}>Planes disponibles</h2>

                {loading && (
                    <div className={styles.centerMessage}>
                        <p>Cargando planes...</p>
                    </div>
                )}

                {error && (
                    <div className={styles.centerMessage}>
                        <p style={{ color: 'red' }}>{error}</p>
                    </div>
                )}

                {!loading && !error && plans.length === 0 && (
                    <div className={styles.centerMessage}>
                        <p>No hay planes disponibles en este momento.</p>
                    </div>
                )}

                {!loading && !error && plans.length > 0 && (
                    <>
                        {needsCarousel ? (
                            <div className={styles.plansCarouselWrapper}>
                                <div className={styles.plansCarouselTrack} ref={trackRef}>
                                    {carouselPlans.map((plan, i) => (
                                        <div key={`${plan.id}-${i}`} className={styles.planSlide}>
                                            <PlanCard plan={plan} onSelect={handlePlanSelect} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.plansGrid}>
                                {plans.slice(0, 3).map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        onSelect={handlePlanSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className={styles.plansCtaContainer}>
                    <button className={styles.plansCtaButton} onClick={() => navigate('/plans')}>
                        Ver todos los planes
                    </button>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <nav>
                        <ul className={styles.footerLinks}>
                            <li>
                                <button className={styles.footerLink} onClick={() => navigate('/')}>
                                    Inicio
                                </button>
                            </li>
                            <li>
                                <button className={styles.footerLink} onClick={() => navigate('/plans')}>
                                    Planes
                                </button>
                            </li>
                            <li>
                                <button className={styles.footerLink} onClick={() => navigate('/login')}>
                                    Iniciar Sesión
                                </button>
                            </li>
                        </ul>
                    </nav>
                    <div className={styles.footerContact}>
                        <div>contacto@controlinteligente.com</div>
                        <div>+57 300 000 0000</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicDashboardPage;
