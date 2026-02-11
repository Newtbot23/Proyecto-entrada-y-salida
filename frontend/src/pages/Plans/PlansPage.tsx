import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
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
                setError('Failed to load pricing plans. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handlePlanSelect = (planId: string) => {
        // Redirigir al formulario de registro de entidad, pasando el plan seleccionado
        navigate('/register-entity', { state: { planId } });
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%',
        marginTop: '3rem',
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
        <MainLayout>
            <TopBar />
            <div style={headerStyle}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                    Choose the Right Plan for You
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>
                    Simple pricing. No hidden fees. Cancel anytime.
                </p>
            </div>

            {loading && (
                <div style={centerMessageStyle}>
                    <p>Loading plans...</p>
                </div>
            )}

            {error && (
                <div style={centerMessageStyle}>
                    <p style={{ color: 'red' }}>{error}</p>
                </div>
            )}

            {!loading && !error && plans.length === 0 && (
                <div style={centerMessageStyle}>
                    <p>No plans available at the moment.</p>
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
        </MainLayout>
    );
};