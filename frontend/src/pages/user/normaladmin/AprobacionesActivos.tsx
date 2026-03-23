import React, { useState, useEffect } from 'react';
import styles from './AprobacionesActivos.module.css';
import { toast } from 'sonner';
import { getActivosPendientes, updateActivoEstado } from '../../../services/aprobacionesActivosService';
import type { ActivoPendiente } from '../../../services/aprobacionesActivosService';

const STORAGE_URL = import.meta.env.VITE_API_STORAGE || 'http://localhost:8000/storage';

const AprobacionesActivos: React.FC = () => {
    const [activos, setActivos] = useState<ActivoPendiente[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPendientes = async () => {
        try {
            setLoading(true);
            const data = await getActivosPendientes();
            setActivos(data);
        } catch (err: any) {
            setError(err.message || 'Error de conexión con el servidor.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    const handleUpdateEstado = async (tipo: string, id: string, estado: 'activo' | 'inactivo') => {
        if (!window.confirm(`¿Estás seguro de marcar este ${tipo} como ${estado}?`)) {
            return;
        }

        try {
            const data = await updateActivoEstado(tipo, id, estado);

            if (data.success) {
                toast.success(`Activo marcado como ${estado} exitosamente.`);
                fetchPendientes(); // Recargar la lista
            } else {
                toast.error(data.message || 'Error al actualizar el estado.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error de conexión con el servidor.');
            console.error(err);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Cargando activos pendientes...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Aprobaciones de Activos</h1>
                <p className={styles.subtitle}>
                    Revisión de vehículos y equipos propios registrados por los usuarios.
                </p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.tableContainer}>
                {activos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No hay activos pendientes de aprobación en este momento.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Foto Usuario</th>
                                <th>Usuario</th>
                                <th>Imagen</th>
                                <th>Tipo de Activo</th>
                                <th>Detalle</th>
                                <th>Identificador</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activos.map((activo) => (
                                <tr key={`${activo.tipo_activo}-${activo.id}`}>
                                    <td>
                                        {activo.foto_usuario ? (
                                            <img 
                                                src={`${STORAGE_URL}/${activo.foto_usuario}`} 
                                                alt="Usuario" 
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', border: '1px solid #e5e7eb' }} 
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.7rem' }}>
                                                N/A
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>{activo.usuario_nombres} {activo.usuario_apellidos}</span>
                                            <span className={styles.userDoc}>CC: {activo.usuario_doc}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {activo.imagen ? (
                                            <img 
                                                src={`${STORAGE_URL}/${activo.imagen.split('|')[0]}`} 
                                                alt="Activo" 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}
                                                onClick={() => window.open(`${STORAGE_URL}/${activo.imagen?.split('|')[0]}`, '_blank')}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sin foto</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${activo.tipo_activo === 'vehiculo' ? styles.badgeVehiculo : styles.badgeEquipo}`}>
                                            {activo.tipo_activo.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.activoInfo}>
                                            <span>{activo.descripcion_tipo}</span>
                                            <span className={styles.marca}>{activo.marca}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.placa}>{activo.placa}</span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button 
                                            className={`${styles.btn} ${styles.btnApprove}`}
                                            onClick={() => handleUpdateEstado(activo.tipo_activo, activo.id, 'activo')}
                                            title="Activar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                            </svg>
                                            Activar
                                        </button>
                                        <button 
                                            className={`${styles.btn} ${styles.btnReject}`}
                                            onClick={() => handleUpdateEstado(activo.tipo_activo, activo.id, 'inactivo')}
                                            title="Rechazar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                            </svg>
                                            Rechazar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AprobacionesActivos;
