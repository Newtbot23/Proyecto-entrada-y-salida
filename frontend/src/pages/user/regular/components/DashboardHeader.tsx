import React from 'react';
import styles from '../UserDashboard.module.css';

interface DashboardHeaderProps {
    nombre: string;
    sessionInfo: { warning: boolean; horas_transcurridas?: number } | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ nombre, sessionInfo }) => {
    return (
        <>
            <h2 className={styles.title}>
                ¡Bienvenido, {nombre}!
            </h2>

            {sessionInfo?.warning && (
                <div className={styles.warningCard}>
                    <div className={styles.warningIcon}>⚠️</div>
                    <div className={styles.warningContent}>
                        <h4 className={styles.warningTitle}>¿Olvidaste registrar tu salida?</h4>
                        <p className={styles.warningText}>
                            Detectamos que ingresaste hace aproximadamente <strong>{sessionInfo.horas_transcurridas} horas</strong> y aún no has registrado tu salida.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
