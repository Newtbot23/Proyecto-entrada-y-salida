import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Usuario } from '../../../types';
import { useUserDashboard } from '../../../hooks/useUserDashboard';
import { useOCR } from '../../../hooks/useOCR';

// Subcomponentes
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardCards } from './components/DashboardCards';
import { VehiculoContainer } from './components/VehiculoContainer';
import { EquipoContainer } from './components/EquipoContainer';

import styles from './UserDashboard.module.css';

const UserDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: Usuario }>();
    const [activeTab, setActiveTab] = useState<'vehiculos' | 'equipos'>('vehiculos');
    
    // Hooks de Lógica
    const {
        vehiculos,
        equipos,
        catalogos,
        loadingVehiculos,
        loadingEquipos,
        sessionInfo,
        isSubmitting,
        handleToggleStatus,
        handleSetDefault,
        createVehiculo,
        createEquipo
    } = useUserDashboard();

    const {
        isOcrLoading,
        isOcrEquipoLoading,
        performPlateOCR,
        performSerialOCR
    } = useOCR();

    return (
        <div className={styles.root}>
            <DashboardHeader 
                nombre={user.primer_nombre} 
                sessionInfo={sessionInfo} 
            />

            <DashboardCards 
                primerNombre={user.primer_nombre}
                primerApellido={user.primer_apellido}
                correo={user.correo}
            />

            {/* Selector de Pestañas */}
            <div className={styles.card}>
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tabButton} ${styles.tabButtonVehiculos} ${activeTab === 'vehiculos' ? styles.active : ''}`}
                        onClick={() => setActiveTab('vehiculos')}
                    >
                        Mis Vehículos
                    </button>
                    <button
                        className={`${styles.tabButton} ${styles.tabButtonEquipos} ${activeTab === 'equipos' ? styles.active : ''}`}
                        onClick={() => setActiveTab('equipos')}
                    >
                        Mis Equipos
                    </button>
                </div>

                {activeTab === 'vehiculos' ? (
                    <VehiculoContainer 
                        vehiculos={vehiculos}
                        loading={loadingVehiculos}
                        catalogos={catalogos}
                        isSubmitting={isSubmitting}
                        isOcrLoading={isOcrLoading}
                        onToggleStatus={handleToggleStatus}
                        onSetDefault={handleSetDefault}
                        onCreate={createVehiculo}
                        onPerformOCR={performPlateOCR}
                    />
                ) : (
                    <EquipoContainer 
                        equipos={equipos}
                        loading={loadingEquipos}
                        catalogos={catalogos}
                        isSubmitting={isSubmitting}
                        isOcrLoading={isOcrEquipoLoading}
                        onToggleStatus={handleToggleStatus}
                        onSetDefault={handleSetDefault}
                        onCreate={createEquipo}
                        onPerformOCR={performSerialOCR}
                    />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
