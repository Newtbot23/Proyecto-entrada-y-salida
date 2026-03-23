import { useState, useEffect } from 'react';
import { 
    getCatalogs, 
    getUserVehiculos, 
    getUserEquipos, 
    toggleAssetStatus, 
    checkActiveSession, 
    setDefaultAsset,
    storeVehiculo,
    storeEquipo
} from '../services/userDashboardService';
import type { 
    Vehiculo, 
    Equipo, 
    UserDashboardCatalog 
} from '../types';

export const useUserDashboard = () => {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [catalogos, setCatalogos] = useState<UserDashboardCatalog | null>(null);
    const [loadingVehiculos, setLoadingVehiculos] = useState(true);
    const [loadingEquipos, setLoadingEquipos] = useState(true);
    const [sessionInfo, setSessionInfo] = useState<{ warning: boolean; horas_transcurridas?: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
        loadCatalogos();
        checkSession();
    }, []);

    const loadData = async () => {
        setLoadingVehiculos(true);
        setLoadingEquipos(true);
        try {
            const [vData, eData] = await Promise.all([getUserVehiculos(), getUserEquipos()]);
            setVehiculos(vData);
            setEquipos(eData);
        } catch (error) {
            console.error("Error cargando activos", error);
        } finally {
            setLoadingVehiculos(false);
            setLoadingEquipos(false);
        }
    };

    const loadCatalogos = async () => {
        try {
            const data = await getCatalogs();
            setCatalogos(data);
        } catch (error) {
            console.error("Error cargando catálogos", error);
        }
    };

    const checkSession = async () => {
        const info = await checkActiveSession();
        setSessionInfo(info);
    };

    const handleToggleStatus = async (id: number, currentStatus: string, tipo: 'vehiculo' | 'equipo') => {
        const confirmMsg = currentStatus === 'activo' 
            ? `¿Estás seguro de inhabilitar este ${tipo}? No podrás usarlo para ingresar hasta que lo reactives.`
            : `¿Deseas reactivar este ${tipo}?`;
            
        if (!window.confirm(confirmMsg)) return;

        try {
            await toggleAssetStatus(tipo, id.toString());
            await loadData();
        } catch (error) {
            alert("No se pudo cambiar el estado");
        }
    };

    const handleSetDefault = async (id: number, tipo: 'vehiculo' | 'equipo') => {
        try {
            await setDefaultAsset(tipo, id.toString());
            await loadData();
        } catch (error) {
            alert("No se pudo establecer como predeterminado");
        }
    };

    const createVehiculo = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await storeVehiculo(formData);
            await loadData();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.errors?.placa?.[0] || "Error al registrar vehículo" };
        } finally {
            setIsSubmitting(false);
        }
    };

    const createEquipo = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await storeEquipo(formData);
            await loadData();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: "Error al registrar equipo" };
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
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
        createEquipo,
        refreshData: loadData
    };
};
