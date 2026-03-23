import React from 'react';
import styles from '../UserDashboard.module.css';

interface DashboardCardsProps {
    primerNombre: string;
    primerApellido: string;
    correo: string;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ primerNombre, primerApellido, correo }) => {
    return (
        <>
            {/* Datos Personales */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Mis Datos Personales</h3>
                <div className={styles.userDataContainer}>
                    <div>
                        <p className={styles.userDataItemLabel}>Nombre Completo</p>
                        <p className={styles.userDataItemValue}>{primerNombre} {primerApellido}</p>
                    </div>
                    <div>
                        <p className={styles.userDataItemLabel}>Correo Electrónico</p>
                        <p className={styles.userDataItemValue}>{correo}</p>
                    </div>
                </div>
            </div>

            {/* Nota del Sistema */}
            <div className={`${styles.card} ${styles.systemNote}`}>
                <h4 className={styles.systemNoteTitle}>
                    ℹ️ Nota del Sistema
                </h4>
                <p className={styles.systemNoteText}>
                    Esta es tu área personal. Aquí podrás consultar tu información y realizar registros. Recuerda mantener tus datos de vehículos y equipos actualizados.
                </p>
            </div>
        </>
    );
};
