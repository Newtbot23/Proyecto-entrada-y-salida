import React from 'react';
import styles from '../InstitutionsPage.module.css';
import { PlusIcon } from '../../../components/common/Icons';

export const InstitutionsHeader: React.FC = () => {
    return (
        <div className={styles.pageHeader}>
            <div>
                <h2 className={styles.pageTitle}>Instituciones Registradas</h2>
                <p className={styles.pageSubtitle}>Administra todas las entidades que usan el sistema</p>
            </div>
            <button className={styles.createButton} onClick={() => window.location.href = '/register-entity'}>
                <PlusIcon width={20} height={20} />
                <span>Agregar Institución</span>
            </button>
        </div>
    );
};
