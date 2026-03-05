import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanCard } from '../../components/Plans/PlanCard';
import type { PricingPlan } from '../../types/plans';
import { getPricingPlans } from '../../services/planService';
import { TopBar } from '../../layouts/TopBar';

export const PlansPage: React.FC = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getPricingPlans();
                setPlans(data);
            } catch (err) {
                setError('No se pudieron cargar los planes. Intenta de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handlePlanSelect = (planId: string) => {
        navigate('/register-entity', { state: { planId } });
    };

    const pageStyle: React.CSSProperties = {
        minHeight: '100vh',
        paddingTop: '70px', /* clear fixed navbar */
    };

    const contentStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1rem 4rem',
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 350px))',
        justifyContent: 'center',
        gap: '2rem',
        width: '100%',
        paddingTop: '16px',
        alignItems: 'stretch',
    };

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: '2rem',
    };

    const centerMessageStyle: React.CSSProperties = {
        textAlign: 'center',
        marginTop: '4rem',
        color: 'var(--color-text-muted)',
    };

    return (
        <div style={pageStyle}>
            <TopBar showBranding showLoginButton />

            <div style={contentStyle}>
                <div style={headerStyle}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                        Elige el plan ideal para ti
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>
                        Precios simples. Sin costos ocultos. Cancela cuando quieras.
                    </p>
                </div>

                {loading && (
                    <div style={centerMessageStyle}>
                        <p>Cargando planes...</p>
                    </div>
                )}

                {error && (
                    <div style={centerMessageStyle}>
                        <p style={{ color: 'red' }}>{error}</p>
                    </div>
                )}

                {!loading && !error && plans.length === 0 && (
                    <div style={centerMessageStyle}>
                        <p>No hay planes disponibles en este momento.</p>
                    </div>
                )}

                {!loading && !error && plans.length > 0 && (
                    <div style={gridStyle}>
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onSelect={handlePlanSelect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};