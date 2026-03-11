import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlanCard } from '../../components/Plans/PlanCard';
import { getPricingPlans } from '../../services/planService';
import { TopBar } from '../../layouts/TopBar';

export const PlansPage: React.FC = () => {
    const navigate = useNavigate();

    const { data: plans = [], isLoading: loading, error } = useQuery({
        queryKey: ['plans'],
        queryFn: getPricingPlans,
    });

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
                        <p style={{ color: 'red' }}>{String(error)}</p>
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