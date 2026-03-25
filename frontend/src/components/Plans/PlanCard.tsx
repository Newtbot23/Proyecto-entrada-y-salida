import React from 'react';
import styles from './Plans.module.css';
import type { PricingPlan } from '../../types';
import { PlanBadge } from './PlanBadge';
import { PlanFeatures } from './PlanFeatures';

interface PlanCardProps {
    plan: PricingPlan;
    onSelect: (planId: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => {
    const isPopular = plan.is_popular;

    return (
        <div className={`${styles.card} ${isPopular ? styles.cardPopular : ''}`}>
            {isPopular && <PlanBadge text="Most Popular" />}

            <div className={styles.header}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.priceContainer}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                </div>
                <p className={styles.description}>{plan.description}</p>
            </div>

            <PlanFeatures
                features={plan.features as any}
                featuresString={plan.caracteristicas}
            />

            <button
                className={`${styles.button} ${isPopular ? styles.buttonPrimary : styles.buttonOutline}`}
                onClick={() => onSelect(plan.id)}
            >
                {plan.button_text}
            </button>
        </div>
    );
};
