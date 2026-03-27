import React from 'react';
import styles from './Plans.module.css';
import type { PlanFeature } from '../../types';

interface PlanFeaturesProps {
    features?: PlanFeature[];
    featuresString?: string;
}

const CheckIcon = () => (
    <svg
        className={`${styles.icon} ${styles.iconCheck}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CrossIcon = () => (
    <svg
        className={`${styles.icon} ${styles.iconCross}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const PlanFeatures: React.FC<PlanFeaturesProps> = ({ features, featuresString }) => {
    // 1. Prioritize featuresString if provided and valid
    if (typeof featuresString === 'string' && featuresString.trim() !== '') {
        const featureList = featuresString.split(',').map(f => f.trim()).filter(f => f !== '');
        return (
            <ul className={styles.features}>
                {featureList.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                        <CheckIcon />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        );
    }

    // 2. Handle 'features' prop which could be array of objects or array of strings (from backend)
    if (!features || (Array.isArray(features) && features.length === 0)) return null;

    // Handle case where features is passed as a comma-separated string (untyped)
    if (typeof features === 'string') {
        const featureList = (features as string).split(',').map(f => f.trim()).filter(f => f !== '');
        return (
            <ul className={styles.features}>
                {featureList.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                        <CheckIcon />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <ul className={styles.features}>
            {features.map((feature: any, index) => {
                // Determine if item is string or object
                const isObject = typeof feature === 'object' && feature !== null;
                const text = isObject ? feature.text : feature;
                const included = isObject ? feature.included !== false : true;

                if (!text) return null;

                return (
                    <li
                        key={index}
                        className={`${styles.featureItem} ${!included ? styles.disabled : ''}`}
                    >
                        {included ? <CheckIcon /> : <CrossIcon />}
                        <span>{text}</span>
                    </li>
                );
            })}
        </ul>
    );
};
