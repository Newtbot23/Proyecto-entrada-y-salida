import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCatalogs, getUserVehiculos, getUserEquipos, toggleAssetStatus, checkActiveSession, setDefaultAsset } from '../../../services/userDashboardService';

const STORAGE_URL = import.meta.env.VITE_API_STORAGE || 'http://localhost:8000/storage';
import type { Vehiculo, Equipo } from '../../../services/userDashboardService';

interface User {
    id: number;
    nombre: string;
    correo: string;
}

const UserDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();
    const queryClient = useQueryClient();

    // Estados modales
    const [showVehiculoModal, setShowVehiculoModal] = useState(false);
    const [showEquipoModal, setShowEquipoModal] = useState(false);

    // Estado de Pestañas
    const [activeTab, setActiveTab] = useState<'vehiculos' | 'equipos'>('vehiculos');

    // Query para Catálogos
    const { data: catalogs } = useQuery({
        queryKey: ['catalogs'],
        queryFn: getCatalogs,
    });

    const tiposVehiculo = catalogs?.tipos_vehiculo.map((t: any) => ({ id: t.id, name: t.tipo_vehiculo })) || [];
    const marcasEquipo = catalogs?.marcas_equipo.map((m: any) => ({ id: m.id, name: m.marca })) || [];
    const sistemasOperativos = catalogs?.sistemas_operativos.map((s: any) => ({ id: s.id, name: s.sistema_operativo })) || [];

    // Query para Vehículos
    const { data: vehiculos = [], isLoading: loadingVehiculos } = useQuery({
        queryKey: ['userVehiculos'],
        queryFn: getUserVehiculos,
    });

    // Query para Equipos
    const { data: equipos = [], isLoading: loadingEquipos } = useQuery({
        queryKey: ['userEquipos'],
        queryFn: getUserEquipos,
    });

    // Query para Aviso de Salida Pendiente
    const { data: sessionInfo } = useQuery({
        queryKey: ['activeSession'],
        queryFn: checkActiveSession,
        refetchInterval: 60000 * 5, // Re-verificar cada 5 minutos
    });

    // Estados formularioss
    const [formVehiculo, setFormVehiculo] = useState<Vehiculo & { foto_general?: File | null, foto_detalle?: File | null }>({ placa: '', id_tipo_vehiculo: '', marca: '', modelo: '', color: '', descripcion: '', foto_general: null, foto_detalle: null });
    const [formEquipo, setFormEquipo] = useState<Equipo & { foto_general?: File | null, foto_detalle?: File | null }>({ serial: '', id_marca: '', modelo: '', tipo_equipo_desc: '', caracteristicas: '', id_sistema_operativo: '', foto_general: null, foto_detalle: null });
    const [loading, setLoading] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isOcrEquipoLoading, setIsOcrEquipoLoading] = useState(false);
    const [placaError, setPlacaError] = useState<string>('');

    // --- Efecto de Validación en Tiempo Real ---
    React.useEffect(() => {
        const selectedId = (formVehiculo.id_tipo_vehiculo || '').toString();
        const tipoObj = tiposVehiculo.find(t => t.id.toString() === selectedId);
        const tipoNombre = tipoObj?.name || '';

        if (tipoNombre.toLowerCase() !== 'bicicleta' && formVehiculo.placa) {
            const plateUpper = formVehiculo.placa.toUpperCase().replace(/\s+/g, '');
            if (tipoNombre.toLowerCase() === 'carro' || tipoNombre.toLowerCase() === 'camión' || tipoNombre.toLowerCase() === 'camion') {
                const carroRegex = /^[A-Z]{3}[0-9]{3}$/;
                if (!carroRegex.test(plateUpper)) {
                    setPlacaError('Formato inválido para Carro/Camión: 3 letras y 3 números (Ej: ABC123)');
                } else {
                    setPlacaError('');
                }
            } else if (tipoNombre.toLowerCase() === 'moto') {
                const motoRegex = /^[A-Z]{3}[0-9]{2}[A-Z]?$/;
                if (!motoRegex.test(plateUpper)) {
                    setPlacaError('Formato inválido para Moto: 3 letras, 2 números y let. opcional (Ej: ABC12 o ABC12D)');
                } else {
                    setPlacaError('');
                }
            } else {
                setPlacaError('');
            }
        } else {
            setPlacaError('');
        }
    }, [formVehiculo.placa, formVehiculo.id_tipo_vehiculo, tiposVehiculo]);



    // --- Manejadores Formularios ---
    const handleVehiculoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (placaError) {
            alert('Por favor, corrige los errores en el formulario antes de guardar.');
            return;
        }

        // Obtener el nombre del tipo seleccionado (ID -> Nombre)
        const selectedId = (formVehiculo.id_tipo_vehiculo || '').toString();
        const tipoObj = tiposVehiculo.find(t => t.id.toString() === selectedId);
        const tipoNombre = tipoObj?.name || '';

        console.log('Enviando vehículo:', { id: selectedId, nombre: tipoNombre, placa: formVehiculo.placa });

        if (tipoNombre.toLowerCase() !== 'bicicleta') {
            if (!formVehiculo.placa) {
                alert('La placa es obligatoria para este tipo de vehículo');
                return;
            }
        }

        setLoading(true);
        const token = sessionStorage.getItem('authToken');
        if (!token) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const formData = new FormData();
            formData.append('placa', formVehiculo.placa.toUpperCase().replace(/\s+/g, ''));
            if (formVehiculo.id_tipo_vehiculo) formData.append('id_tipo_vehiculo', formVehiculo.id_tipo_vehiculo.toString());
            formData.append('marca', formVehiculo.marca);
            formData.append('modelo', formVehiculo.modelo);
            formData.append('color', formVehiculo.color);
            if (formVehiculo.descripcion) formData.append('descripcion', formVehiculo.descripcion);
            if (formVehiculo.foto_general) {
                formData.append('foto_general', formVehiculo.foto_general);
            }
            if (formVehiculo.foto_detalle) {
                formData.append('foto_detalle', formVehiculo.foto_detalle);
            }

            const res = await fetch(`${apiUrl}/user/vehiculos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert('Vehículo registrado exitosamente');
                setShowVehiculoModal(false);
                setFormVehiculo({ placa: '', id_tipo_vehiculo: '', marca: '', modelo: '', color: '', descripcion: '', foto_general: null, foto_detalle: null });
                queryClient.invalidateQueries({ queryKey: ['userVehiculos'] });
            } else {
                alert(data.message || 'Error al registrar vehículo');
            }
        } catch (error) {
            console.error(error);
            alert((error as Error).message || 'Error al registrar vehículo');
        }
        setLoading(false);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'general' | 'detalle') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'general') {
            setFormVehiculo(prev => ({ ...prev, foto_general: file }));
            return;
        }

        setFormVehiculo(prev => ({ ...prev, foto_detalle: file }));
        setIsOcrLoading(true);

        const token = sessionStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${apiUrl}/ocr/read-plate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await res.json();

            if (data.success && data.placa) {
                setFormVehiculo(prev => {
                    const currentPlaca = prev.placa;
                    if (!currentPlaca) {
                        return { ...prev, placa: data.placa };
                    } else if (currentPlaca.replace(/\s+/g, '').toUpperCase() !== data.placa) {
                        alert(`La placa detectada en la imagen (${data.placa}) no coincide con la ingresada (${currentPlaca}).`);
                        return prev;
                    }
                    return prev;
                });
            } else {
                alert(data.message || 'No se pudo detectar la placa en la imagen');
            }
        } catch (error) {
            console.error('Error in OCR:', error);
        } finally {
            setIsOcrLoading(false);
        }
    };

    const handleEquipoImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'general' | 'detalle') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'general') {
            setFormEquipo(prev => ({ ...prev, foto_general: file }));
            return;
        }

        setFormEquipo(prev => ({ ...prev, foto_detalle: file }));
        setIsOcrEquipoLoading(true);


        const token = sessionStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${apiUrl}/ocr/read-serial`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await res.json();

            if (data.success && data.raw_text) {
                setFormEquipo(prev => {
                    const currentSerial = prev.serial;
                    if (!currentSerial && data.extracted_serial) {
                        return { ...prev, serial: data.extracted_serial };
                    } else if (currentSerial) {
                        // Valida si el texto ingresado está en la lectura
                        const normalizedCurrent = currentSerial.replace(/\s+/g, '').toUpperCase();
                        const normalizedRaw = data.raw_text.replace(/\s+/g, '').toUpperCase();
                        if (!normalizedRaw.includes(normalizedCurrent)) {
                            alert(`Advertencia: El serial ingresado (${currentSerial}) no parece estar en la foto de la etiqueta.`);
                        }
                    } else if (!data.extracted_serial) {
                        alert('No detectamos un serial claro en la imagen. Revisa la foto o digítalo manualmente.');
                    }
                    return prev;
                });
            } else {
                alert(data.message || 'No se pudo extraer texto de la imagen');
            }
        } catch (error) {
            console.error('Error in OCR:', error);
        } finally {
            setIsOcrEquipoLoading(false);
        }
    };

    const handleEquipoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = sessionStorage.getItem('authToken');
        if (!token) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const formData = new FormData();
            formData.append('serial', formEquipo.serial);
            if (formEquipo.id_marca) formData.append('id_marca', formEquipo.id_marca);
            formData.append('modelo', formEquipo.modelo);
            formData.append('tipo_equipo_desc', formEquipo.tipo_equipo_desc || '');
            if (formEquipo.caracteristicas) formData.append('caracteristicas', formEquipo.caracteristicas);
            if (formEquipo.id_sistema_operativo) formData.append('id_sistema_operativo', formEquipo.id_sistema_operativo);
            if (formEquipo.foto_general) {
                formData.append('foto_general', formEquipo.foto_general);
            }
            if (formEquipo.foto_detalle) {
                formData.append('foto_detalle', formEquipo.foto_detalle);
            }

            const res = await fetch(`${apiUrl}/user/equipos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert('Equipo registrado exitosamente');
                setShowEquipoModal(false);
                setFormEquipo({ serial: '', id_marca: '', modelo: '', tipo_equipo_desc: '', caracteristicas: '', id_sistema_operativo: '', foto_general: null, foto_detalle: null });
                queryClient.invalidateQueries({ queryKey: ['userEquipos'] });
            } else {
                alert(data.message || 'Error al registrar equipo');
            }
        } catch (error) {
            console.error(error);
            alert((error as Error).message || 'Error al registrar equipo');
        }
        setLoading(false);
    };

    const handleToggleStatus = async (tipo: 'vehiculo' | 'equipo', id: string, estadoActual: string) => {
        const confirmMsg = estadoActual === 'activo'
            ? '¿Estás seguro de inhabilitar este activo? No aparecerá en los controles de acceso.'
            : '¿Deseas solicitar la reactivación de este activo?';

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const res = await toggleAssetStatus(tipo, id);
            if (res.success) {
                alert(res.message);
                queryClient.invalidateQueries({ queryKey: tipo === 'vehiculo' ? ['userVehiculos'] : ['userEquipos'] });
            } else {
                alert(res.message || 'Error al cambiar el estado');
            }
        } catch (error) {
            alert('Error en el servidor al intentar cambiar el estado');
        }
        setLoading(false);
    };

    const handleSetDefault = async (tipo: 'vehiculo' | 'equipo', id: string) => {
        const queryKey = tipo === 'vehiculo' ? ['userVehiculos'] : ['userEquipos'];

        // Paso 1 (Respaldo): Guardar copia del estado actual
        const previousData = queryClient.getQueryData(queryKey);

        // Paso 2 (Actualización Inmediata): Actualizar el estado local de React inmediatamente
        queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
            if (!old) return [];
            return old.map((item: any) => {
                const itemId = tipo === 'vehiculo' ? item.placa : item.serial;
                return {
                    ...item,
                    es_predeterminado: itemId === id ? 1 : 0
                };
            });
        });

        // Paso 3 (Petición Asíncrona): Llamada a la API en segundo plano
        try {
            const res = await setDefaultAsset(tipo, id);
            if (!res.success) {
                throw new Error(res.message || 'Error al actualizar el servidor');
            }
            // Opcional: invalidar para sincronizar con el estado real del servidor si es necesario
            // queryClient.invalidateQueries({ queryKey });
        } catch (error) {
            // Paso 4 (Manejo de Errores - Rollback): Alerta y reversión
            alert((error as any)?.message || 'No se pudo establecer el activo como predeterminado');
            queryClient.setQueryData(queryKey, previousData);
        }
    };

    // --- Estilos Base ---
    const cardStyle: React.CSSProperties = { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', color: '#4b5563', fontWeight: '500', marginBottom: '0.25rem', marginTop: '0.75rem' };
    const theadStyle: React.CSSProperties = { background: '#f9fafb', color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left' } as const;
    const thTdStyle: React.CSSProperties = { padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' };
    const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };

    return (
        <div className="dashboard-root" style={{ marginTop: '1rem', paddingBottom: '3rem', width: '100%', flex: 1 }}>
            <style>{`
                @media (max-width: 768px) {
                    .user-data-container { flex-direction: column !important; gap: 1rem !important; }
                    .action-buttons-container { flex-direction: column !important; }
                    .action-buttons-container button { width: 100% !important; margin-bottom: 0.5rem !important; }
                    .tabs-container { flex-direction: column !important; border-bottom: none !important; border-left: 2px solid #e5e7eb; }
                    .tabs-container button { width: 100% !important; text-align: left !important; }
                    .form-row { flex-direction: column !important; gap: 1rem !important; }
                    .modal-content { padding: 1rem !important; width: 95% !important; max-height: 85vh !important; }
                    .modal-footer { flex-direction: column-reverse !important; margin-top: 1rem !important; gap: 0.5rem !important; }
                    .modal-footer button { width: 100% !important; margin: 0 !important; }
                    .table-responsive { overflow-x: auto !important; }
                }
            `}</style>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                ¡Bienvenido, {user.nombre}!
            </h2>

            {/* Aviso de Salida Olvidada */}
            {sessionInfo?.warning && (
                <div style={{
                    background: '#fff7ed',
                    border: '1px solid #fdba74',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ fontSize: '1.75rem' }}></div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#9a3412', fontWeight: '700', fontSize: '1.05rem' }}>¿Olvidaste registrar tu salida?</h4>
                        <p style={{ margin: '0.25rem 0 0', color: '#c2410c', fontSize: '0.9rem' }}>
                            Detectamos que ingresaste hace aproximadamente <strong>{sessionInfo.horas_transcurridas} horas</strong> y aún no has registrado tu salida.
                        </p>
                    </div>
                </div>
            )}

            {/* Datos Personales */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Mis Datos Personales</h3>
                <div className="user-data-container" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: '#374151', fontSize: '0.85rem' }}>Nombre Completo</p>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', color: '#111827' }}>{user.nombre}</p>
                    </div>
                    <div>
                        <p style={{ color: '#374151', fontSize: '0.85rem' }}>Correo Electrónico</p>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', color: '#111827' }}>{user.correo}</p>
                    </div>
                </div>
            </div>

            {/* Nota del Sistema */}
            <div style={{ ...cardStyle, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h4 style={{ color: '#1e40af', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Nota del Sistema
                </h4>
                <p style={{ color: '#1e3a8a', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                    Esta es tu área personal. Aquí podrás consultar tu información y realizar registros. Recuerda mantener tus datos de vehículos y equipos actualizados.
                </p>
            </div>

            {/* Sección de Acciones */}
            <div className="action-buttons-container" style={{ ...cardStyle, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setShowVehiculoModal(true)}
                    style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', flex: '1 1 auto', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', transition: 'background 0.2s', fontSize: '1rem' }}
                    onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                    onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                >
                    Registrar Vehículo
                </button>
                <button
                    onClick={() => setShowEquipoModal(true)}
                    style={{ background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', flex: '1 1 auto', boxShadow: '0 2px 4px rgba(16,185,129,0.2)', transition: 'background 0.2s', fontSize: '1rem' }}
                    onMouseOver={e => e.currentTarget.style.background = '#059669'}
                    onMouseOut={e => e.currentTarget.style.background = '#10b981'}
                >
                    Registrar Equipo
                </button>
            </div>

            {/* Tablas de Registros */}
            <div style={cardStyle}>
                <div className="tabs-container" style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setActiveTab('vehiculos')}
                        style={{ padding: '0.75rem 1.5rem', fontWeight: '600', fontSize: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: activeTab === 'vehiculos' ? '#2563eb' : '#374151', borderBottom: activeTab === 'vehiculos' ? '3px solid #2563eb' : '3px solid transparent', marginBottom: '-2px' }}
                    >
                        Mis Vehículos
                    </button>
                    <button
                        onClick={() => setActiveTab('equipos')}
                        style={{ padding: '0.75rem 1.5rem', fontWeight: '600', fontSize: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: activeTab === 'equipos' ? '#10b981' : '#374151', borderBottom: activeTab === 'equipos' ? '3px solid #10b981' : '3px solid transparent', marginBottom: '-2px' }}
                    >
                        Mis Equipos
                    </button>
                </div>

                {/* Tabla Vehiculos */}
                {activeTab === 'vehiculos' && (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        {loadingVehiculos ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>Cargando vehículos...</div>
                        ) : vehiculos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}></p>
                                <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>No hay vehículos registrados</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead style={theadStyle}>
                                    <tr>
                                        <th style={thTdStyle}>Activo</th>
                                        <th style={thTdStyle}>Estado</th>
                                        <th style={thTdStyle}>Placa</th>
                                        <th style={thTdStyle}>Tipo</th>
                                        <th style={thTdStyle}>Marca</th>
                                        <th style={thTdStyle}>Modelo</th>
                                        <th style={thTdStyle}>Color</th>
                                        <th style={thTdStyle}>Predeterminado</th>
                                        <th style={thTdStyle}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehiculos.map((v, idx) => {
                                        const images = v.img_vehiculo ? v.img_vehiculo.split('|') : [];
                                        return (
                                            <tr key={v.placa || idx} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={thTdStyle}>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {images.map((img: string, i: number) => (
                                                            <img
                                                                key={i}
                                                                src={`${STORAGE_URL}/${img}`}
                                                                alt={`Vehículo ${i}`}
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}
                                                                onClick={() => window.open(`${STORAGE_URL}/${img}`, '_blank')}
                                                            />
                                                        ))}
                                                        {images.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin foto</span>}
                                                    </div>
                                                </td>
                                                <td style={thTdStyle}>
                                                    {v.estado_aprobacion === 'activo' && <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Activo</span>}
                                                    {v.estado_aprobacion === 'pendiente' && <span style={{ background: '#fef9c3', color: '#854d0e', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Pendiente</span>}
                                                    {v.estado_aprobacion === 'inactivo' && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Inactivo</span>}
                                                    {!v.estado_aprobacion && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>-</span>}
                                                </td>
                                                <td style={{ ...thTdStyle, fontWeight: '600', color: '#111827' }}>{v.placa}</td>
                                                <td style={thTdStyle}>{v.tipo_vehiculo || v.tipo}</td>
                                                <td style={thTdStyle}>{v.marca}</td>
                                                <td style={thTdStyle}>{v.modelo}</td>
                                                <td style={thTdStyle}>{v.color}</td>
                                                <td style={{ ...thTdStyle, textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => !v.es_predeterminado && handleSetDefault('vehiculo', v.placa)}
                                                        style={{ background: 'none', border: 'none', cursor: v.es_predeterminado ? 'default' : 'pointer', fontSize: '1.5rem', color: v.es_predeterminado ? '#f59e0b' : '#d1d5db' }}
                                                        title={v.es_predeterminado ? 'Vehículo predeterminado' : 'Marcar como predeterminado'}
                                                    >
                                                        {v.es_predeterminado ? '★' : '☆'}
                                                    </button>
                                                </td>
                                                <td style={thTdStyle}>
                                                    {v.estado_aprobacion === 'activo' && (
                                                        <button
                                                            onClick={() => handleToggleStatus('vehiculo', v.placa, 'activo')}
                                                            disabled={loading}
                                                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                        >
                                                            Inhabilitar
                                                        </button>
                                                    )}
                                                    {v.estado_aprobacion === 'inactivo' && (
                                                        <button
                                                            onClick={() => handleToggleStatus('vehiculo', v.placa, 'inactivo')}
                                                            disabled={loading}
                                                            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                        >
                                                            Reactivar
                                                        </button>
                                                    )}
                                                    {v.estado_aprobacion === 'pendiente' && (
                                                        <span style={{ fontSize: '0.75rem', color: '#374151', fontStyle: 'italic' }}>En revisión...</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Tabla Equipos */}
                {activeTab === 'equipos' && (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        {loadingEquipos ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>Cargando equipos...</div>
                        ) : equipos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}></p>
                                <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>No hay equipos registrados</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead style={theadStyle}>
                                    <tr>
                                        <th style={thTdStyle}>Activo</th>
                                        <th style={thTdStyle}>Estado</th>
                                        <th style={thTdStyle}>Serial</th>
                                        <th style={thTdStyle}>Marca</th>
                                        <th style={thTdStyle}>Modelo</th>
                                        <th style={thTdStyle}>Sistema Op.</th>
                                        <th style={thTdStyle}>Predeterminado</th>
                                        <th style={thTdStyle}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipos.map((e, idx) => {
                                        const images = e.img_serial ? e.img_serial.split('|') : [];
                                        return (
                                            <tr key={e.serial || idx} style={{ transition: 'background 0.1s' }} onMouseOver={ev => ev.currentTarget.style.background = '#f9fafb'} onMouseOut={ev => ev.currentTarget.style.background = 'transparent'}>
                                                <td style={thTdStyle}>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {images.map((img: string, i: number) => (
                                                            <img
                                                                key={i}
                                                                src={`${STORAGE_URL}/${img}`}
                                                                alt={`Equipo ${i}`}
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}
                                                                onClick={() => window.open(`${STORAGE_URL}/${img}`, '_blank')}
                                                            />
                                                        ))}
                                                        {images.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin foto</span>}
                                                    </div>
                                                </td>
                                                <td style={thTdStyle}>
                                                    {e.estado_aprobacion === 'activo' && <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Activo</span>}
                                                    {e.estado_aprobacion === 'pendiente' && <span style={{ background: '#fef9c3', color: '#854d0e', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Pendiente</span>}
                                                    {e.estado_aprobacion === 'inactivo' && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Inactivo</span>}
                                                    {!e.estado_aprobacion && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>-</span>}
                                                </td>
                                                <td style={{ ...thTdStyle, fontWeight: '600', color: '#111827' }}>{e.serial}</td>
                                                <td style={thTdStyle}>{e.marca}</td>
                                                <td style={thTdStyle}>{e.modelo}</td>
                                                <td style={thTdStyle}>{e.so}</td>
                                                <td style={{ ...thTdStyle, textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => !e.es_predeterminado && handleSetDefault('equipo', e.serial)}
                                                        style={{ background: 'none', border: 'none', cursor: e.es_predeterminado ? 'default' : 'pointer', fontSize: '1.5rem', color: e.es_predeterminado ? '#10b981' : '#d1d5db' }}
                                                        title={e.es_predeterminado ? 'Equipo predeterminado' : 'Marcar como predeterminado'}
                                                    >
                                                        {e.es_predeterminado ? '★' : '☆'}
                                                    </button>
                                                </td>
                                                <td style={thTdStyle}>
                                                    {e.estado_aprobacion === 'activo' && (
                                                        <button
                                                            onClick={() => handleToggleStatus('equipo', e.serial, 'activo')}
                                                            disabled={loading}
                                                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                        >
                                                            Inhabilitar
                                                        </button>
                                                    )}
                                                    {e.estado_aprobacion === 'inactivo' && (
                                                        <button
                                                            onClick={() => handleToggleStatus('equipo', e.serial, 'inactivo')}
                                                            disabled={loading}
                                                            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                        >
                                                            Reactivar
                                                        </button>
                                                    )}
                                                    {e.estado_aprobacion === 'pendiente' && (
                                                        <span style={{ fontSize: '0.75rem', color: '#374151', fontStyle: 'italic' }}>En revisión...</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Registrar Vehiculo */}
            {showVehiculoModal && (
                <div style={modalOverlayStyle}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>Registrar Vehículo</h3>
                        <form onSubmit={handleVehiculoSubmit}>
                            <label style={labelStyle}>Placa (máx 10)</label>
                            <input
                                style={{
                                    ...inputStyle,
                                    borderColor: placaError ? '#ef4444' : '#d1d5db',
                                    outline: placaError ? 'none' : undefined,
                                    boxShadow: placaError ? '0 0 0 1px #ef4444' : undefined
                                }}
                                type="text"
                                maxLength={10}
                                required={tiposVehiculo.find(t => t.id.toString() === (formVehiculo.id_tipo_vehiculo || '').toString())?.name?.toLowerCase() !== 'bicicleta'}
                                value={formVehiculo.placa}
                                onChange={e => setFormVehiculo({ ...formVehiculo, placa: e.target.value.toUpperCase() })}
                                placeholder={tiposVehiculo.find(t => t.id.toString() === (formVehiculo.id_tipo_vehiculo || '').toString())?.name?.toLowerCase() === 'bicicleta' ? "Opcional" : "Ej: ABC123"}
                            />
                            {placaError && (
                                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{placaError}</p>
                            )}

                            <label style={labelStyle}>Foto General del Vehículo</label>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ ...inputStyle, padding: '0.4rem' }}
                                onChange={(e) => handleImageSelect(e, 'general')}
                            />

                            <label style={labelStyle}>Foto de la Placa (OCR)</label>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ ...inputStyle, padding: '0.4rem' }}
                                onChange={(e) => handleImageSelect(e, 'detalle')}
                            />
                            {isOcrLoading && <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>Leyendo placa...</span>}

                            <label style={labelStyle}>Tipo de Vehículo</label>
                            <select style={inputStyle} required value={formVehiculo.id_tipo_vehiculo} onChange={e => setFormVehiculo({ ...formVehiculo, id_tipo_vehiculo: e.target.value })}>
                                <option value="">Seleccione un tipo</option>
                                {tiposVehiculo.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Marca</label>
                                    <input style={inputStyle} type="text" required value={formVehiculo.marca} onChange={e => setFormVehiculo({ ...formVehiculo, marca: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Modelo</label>
                                    <input style={inputStyle} type="text" required value={formVehiculo.modelo} onChange={e => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })} />
                                </div>
                            </div>

                            <label style={labelStyle}>Color</label>
                            <input style={inputStyle} type="text" required value={formVehiculo.color} onChange={e => setFormVehiculo({ ...formVehiculo, color: e.target.value })} />

                            <label style={labelStyle}>Descripción (Opcional)</label>
                            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={formVehiculo.descripcion} onChange={e => setFormVehiculo({ ...formVehiculo, descripcion: e.target.value })} placeholder="Detalles adicionales..." />

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowVehiculoModal(false)} disabled={loading} style={{ padding: '0.6rem 1.2rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>Cancelar</button>
                                <button type="submit" disabled={loading || !!placaError} style={{ padding: '0.6rem 1.2rem', border: 'none', background: loading || !!placaError ? '#9ca3af' : '#2563eb', color: 'white', borderRadius: '0.375rem', cursor: loading || !!placaError ? 'not-allowed' : 'pointer', fontWeight: '600' }}>{loading ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Registrar Equipo */}
            {showEquipoModal && (
                <div style={modalOverlayStyle}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>Registrar Equipo</h3>
                        <form onSubmit={handleEquipoSubmit}>
                            <label style={labelStyle}>Serial</label>
                            <input style={inputStyle} type="text" required value={formEquipo.serial} onChange={e => setFormEquipo({ ...formEquipo, serial: e.target.value })} placeholder="Obligatorio" />

                            <label style={labelStyle}>Foto General del Equipo</label>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ ...inputStyle, padding: '0.4rem' }}
                                onChange={(e) => handleEquipoImageSelect(e, 'general')}
                            />

                            <label style={labelStyle}>Foto del Serial (OCR)</label>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ ...inputStyle, padding: '0.4rem' }}
                                onChange={(e) => handleEquipoImageSelect(e, 'detalle')}
                            />
                            {isOcrEquipoLoading && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Leyendo etiqueta...</span>}

                            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Marca del Equipo</label>
                                    <select style={inputStyle} required value={formEquipo.id_marca} onChange={e => setFormEquipo({ ...formEquipo, id_marca: e.target.value })}>
                                        <option value="">Seleccione</option>
                                        {marcasEquipo.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Modelo</label>
                                    <input style={inputStyle} type="text" required value={formEquipo.modelo} onChange={e => setFormEquipo({ ...formEquipo, modelo: e.target.value })} />
                                </div>
                            </div>

                            <label style={labelStyle}>Descripción (Tipo de Equipo)</label>
                            <input style={inputStyle} type="text" required value={formEquipo.tipo_equipo_desc} onChange={e => setFormEquipo({ ...formEquipo, tipo_equipo_desc: e.target.value })} placeholder="Ej: Portátil, Monitor, Teclado..." />

                            <label style={labelStyle}>Sistema Operativo</label>
                            <select style={inputStyle} required value={formEquipo.id_sistema_operativo} onChange={e => setFormEquipo({ ...formEquipo, id_sistema_operativo: e.target.value })}>
                                <option value="">Seleccione SO</option>
                                {sistemasOperativos.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>

                            <label style={labelStyle}>Características</label>
                            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={formEquipo.caracteristicas} onChange={e => setFormEquipo({ ...formEquipo, caracteristicas: e.target.value })} placeholder="Color, RAM, Disco Duro, etc..." />

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowEquipoModal(false)} disabled={loading} style={{ padding: '0.6rem 1.2rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>Cancelar</button>
                                <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', border: 'none', background: loading ? '#9ca3af' : '#10b981', color: 'white', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>{loading ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
