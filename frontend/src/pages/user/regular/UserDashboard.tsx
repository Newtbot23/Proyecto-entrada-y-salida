import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Usuario } from '../../../types';
import { 
    getCatalogs, 
    getUserVehiculos, 
    getUserEquipos, 
    toggleAssetStatus, 
    checkActiveSession, 
    setDefaultAsset,
    storeVehiculo,
    storeEquipo
} from '../../../services/userDashboardService';
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
    const queryClient = useQueryClient();
    
    // Queries
    const { data: catalogos } = useQuery({
        queryKey: ['usuario', 'catalogosDashboard'],
        queryFn: getCatalogs,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery({
        queryKey: ['usuario', 'vehiculos'],
        queryFn: getUserVehiculos,
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });

    const { data: equipos = [], isLoading: loadingEquipos } = useQuery({
        queryKey: ['usuario', 'equipos'],
        queryFn: getUserEquipos,
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });

    const { data: sessionInfo } = useQuery({
        queryKey: ['usuario', 'check-session'],
        queryFn: checkActiveSession,
        refetchInterval: 1000 * 60 * 5, // Re-check every 5 mins
    });

    // Mutations
    const mutationSetDefault = useMutation({
        mutationFn: ({ tipo, id }: { tipo: 'vehiculo' | 'equipo', id: string }) => setDefaultAsset(tipo, id),
        onMutate: async ({ tipo, id }) => {
            const queryKey = ['usuario', tipo === 'vehiculo' ? 'vehiculos' : 'equipos'];
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;
                return old.map((item: any) => ({
                    ...item,
                    es_predeterminado: (tipo === 'vehiculo' ? item.placa === id : item.serial === id) ? 1 : 0
                }));
            });
            
            return { previousData, queryKey };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },
        onSettled: (_data, _err, variables) => {
            queryClient.invalidateQueries({ queryKey: ['usuario', variables.tipo === 'vehiculo' ? 'vehiculos' : 'equipos'] });
        }
    });

    const mutationToggleStatus = useMutation({
        mutationFn: ({ tipo, id }: { tipo: 'vehiculo' | 'equipo', id: string }) => toggleAssetStatus(tipo, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuario', 'vehiculos'] });
            queryClient.invalidateQueries({ queryKey: ['usuario', 'equipos'] });
        }
    });

    const mutationCreateVehiculo = useMutation({
        mutationFn: storeVehiculo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuario', 'vehiculos'] });
        }
    });

    const mutationCreateEquipo = useMutation({
        mutationFn: storeEquipo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuario', 'equipos'] });
        }
    });

    const {
        isOcrLoading,
        isOcrEquipoLoading,
        performPlateOCR,
        performSerialOCR
    } = useOCR();

    const handleToggleStatus = (id: string, currentStatus: string, tipo: 'vehiculo' | 'equipo') => {
        const confirmMsg = currentStatus === 'activo' 
            ? `¿Estás seguro de inhabilitar este ${tipo}? No podrás usarlo para ingresar hasta que lo reactives.`
            : `¿Deseas reactivar este ${tipo}?`;
            
        if (!window.confirm(confirmMsg)) return;
        mutationToggleStatus.mutate({ tipo, id });
    };

    const handleSetDefault = (id: string, tipo: 'vehiculo' | 'equipo') => {
        mutationSetDefault.mutate({ tipo, id });
    };

    const handleCreateVehiculo = async (formData: FormData) => {
        try {
            await mutationCreateVehiculo.mutateAsync(formData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || "Error al registrar vehículo" };
        }
    };

    const handleCreateEquipo = async (formData: FormData) => {
        try {
            await mutationCreateEquipo.mutateAsync(formData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || "Error al registrar equipo" };
        }
    };

    return (
        <div className={styles.root}>
            <DashboardHeader 
                nombre={user.primer_nombre || user.nombre || 'Usuario'} 
                sessionInfo={sessionInfo || null} 
            />

            <DashboardCards 
                primerNombre={user.primer_nombre || user.nombre || 'Usuario'}
                primerApellido={user.primer_apellido || ''}
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
                        catalogos={catalogos || null}
                        isOcrLoading={isOcrLoading}
                        onToggleStatus={handleToggleStatus}
                        onSetDefault={handleSetDefault}
                        onCreate={handleCreateVehiculo}
                        onPerformOCR={performPlateOCR}
                    />
                ) : (
                    <EquipoContainer 
                        equipos={equipos}
                        loading={loadingEquipos}
                        catalogos={catalogos || null}
                        isOcrLoading={isOcrEquipoLoading}
                        onToggleStatus={handleToggleStatus}
                        onSetDefault={handleSetDefault}
                        onCreate={handleCreateEquipo}
                        onPerformOCR={performSerialOCR}
                    />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
