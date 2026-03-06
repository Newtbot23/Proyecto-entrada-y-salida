import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

interface User {
    id: number;
    nombre: string;
    correo: string;
}

interface Vehiculo {
    id?: number;
    placa: string;
    tipo?: string; // from local/mock
    tipo_vehiculo?: string; // from join
    id_tipo_vehiculo?: string;
    marca: string;
    modelo: string;
    color: string;
    descripcion?: string;
}

interface Equipo {
    id?: number;
    serial: string;
    marca?: string; // from join
    id_marca?: string;
    modelo: string;
    tipo_equipo_desc?: string;
    caracteristicas?: string;
    so?: string; // from join
    id_sistema_operativo?: string;
}

interface CatalogType {
    id: number;
    name: string;
}

const UserDashboard: React.FC = () => {
    const { user } = useOutletContext<{ user: User }>();

    // Estados modales
    const [showVehiculoModal, setShowVehiculoModal] = useState(false);
    const [showEquipoModal, setShowEquipoModal] = useState(false);

    // Estado de Pestañas
    const [activeTab, setActiveTab] = useState<'vehiculos' | 'equipos'>('vehiculos');

    // Datos
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [equipos, setEquipos] = useState<Equipo[]>([]);

    // Catalogos
    const [tiposVehiculo, setTiposVehiculo] = useState<CatalogType[]>([]);
    const [marcasEquipo, setMarcasEquipo] = useState<CatalogType[]>([]);
    const [sistemasOperativos, setSistemasOperativos] = useState<CatalogType[]>([]);

    // Estados formularios
    const [formVehiculo, setFormVehiculo] = useState<Vehiculo>({ placa: '', id_tipo_vehiculo: '', marca: '', modelo: '', color: '', descripcion: '' });
    const [formEquipo, setFormEquipo] = useState<Equipo>({ serial: '', id_marca: '', modelo: '', tipo_equipo_desc: '', caracteristicas: '', id_sistema_operativo: '' });
    const [loading, setLoading] = useState(false);

    // Fetch initial data
    const fetchData = async () => {
        const token = sessionStorage.getItem('userToken');
        if (!token) {
            console.error("No token found in sessionStorage");
            return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        try {
            // Catalogs
            const catRes = await fetch(`${apiUrl}/user/catalogs`, { headers });
            if (!catRes.ok) throw new Error(`HTTP error! status: ${catRes.status}`);
            const catData = await catRes.json();
            if (catData.success) {
                setTiposVehiculo(catData.data.tipos_vehiculo.map((t: any) => ({ id: t.id, name: t.tipo_vehiculo })));
                setMarcasEquipo(catData.data.marcas_equipo.map((m: any) => ({ id: m.id, name: m.marca })));
                setSistemasOperativos(catData.data.sistemas_operativos.map((s: any) => ({ id: s.id, name: s.sistema_operativo })));
            }

            // Vehiculos & Equipos
            fetchUserRecords(headers);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const fetchUserRecords = async (headers?: any) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        if (!headers) {
            const token = sessionStorage.getItem('userToken');
            if (!token) return;
            headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        }

        try {
            const vehRes = await fetch(`${apiUrl}/user/vehiculos`, { headers });
            const vehData = await vehRes.json();
            if (vehData.success) setVehiculos(vehData.data);

            const eqRes = await fetch(`${apiUrl}/user/equipos`, { headers });
            const eqData = await eqRes.json();
            if (eqData.success) setEquipos(eqData.data);
        } catch (error) {
            console.error("Error fetching user records", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Manejadores Formularios ---
    const handleVehiculoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        if (!token) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const res = await fetch(`${apiUrl}/user/vehiculos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formVehiculo)
            });
            const data = await res.json();
            if (data.success) {
                alert('Vehículo registrado exitosamente');
                setShowVehiculoModal(false);
                setFormVehiculo({ placa: '', id_tipo_vehiculo: '', marca: '', modelo: '', color: '', descripcion: '' });
                fetchUserRecords();
            } else {
                alert(data.message || 'Error al registrar vehículo');
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor');
        }
        setLoading(false);
    };

    const handleEquipoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        if (!token) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        try {
            const res = await fetch(`${apiUrl}/user/equipos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formEquipo)
            });
            const data = await res.json();
            if (data.success) {
                alert('Equipo registrado exitosamente');
                setShowEquipoModal(false);
                setFormEquipo({ serial: '', id_marca: '', modelo: '', tipo_equipo_desc: '', caracteristicas: '', id_sistema_operativo: '' });
                fetchUserRecords();
            } else {
                alert(data.message || 'Error al registrar equipo');
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor');
        }
        setLoading(false);
    };

    // --- Estilos Base ---
    const cardStyle: React.CSSProperties = { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', color: '#4b5563', fontWeight: '500', marginBottom: '0.25rem', marginTop: '0.75rem' };
    const theadStyle: React.CSSProperties = { background: '#f9fafb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left' } as const;
    const thTdStyle: React.CSSProperties = { padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' };
    const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };

    return (
        <div style={{ marginTop: '1rem', paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                ¡Bienvenido, {user.nombre}!
            </h2>

            {/* Datos Personales */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Mis Datos Personales</h3>
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Nombre Completo</p>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', color: '#111827' }}>{user.nombre}</p>
                    </div>
                    <div>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Correo Electrónico</p>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', color: '#111827' }}>{user.correo}</p>
                    </div>
                </div>
            </div>

            {/* Nota del Sistema */}
            <div style={{ ...cardStyle, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h4 style={{ color: '#1e40af', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>ℹ️</span> Nota del Sistema
                </h4>
                <p style={{ color: '#1e3a8a', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                    Esta es tu área personal. Aquí podrás consultar tu información y realizar registros. Recuerda mantener tus datos de vehículos y equipos actualizados.
                </p>
            </div>

            {/* Sección de Acciones */}
            <div style={{ ...cardStyle, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setShowVehiculoModal(true)}
                    style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', flex: '1 1 auto', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', transition: 'background 0.2s', fontSize: '1rem' }}
                    onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                    onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                >
                    🚗 Registrar Vehículo
                </button>
                <button
                    onClick={() => setShowEquipoModal(true)}
                    style={{ background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', flex: '1 1 auto', boxShadow: '0 2px 4px rgba(16,185,129,0.2)', transition: 'background 0.2s', fontSize: '1rem' }}
                    onMouseOver={e => e.currentTarget.style.background = '#059669'}
                    onMouseOut={e => e.currentTarget.style.background = '#10b981'}
                >
                    💻 Registrar Equipo
                </button>
            </div>

            {/* Tablas de Registros */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setActiveTab('vehiculos')}
                        style={{ padding: '0.75rem 1.5rem', fontWeight: '600', fontSize: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: activeTab === 'vehiculos' ? '#2563eb' : '#6b7280', borderBottom: activeTab === 'vehiculos' ? '3px solid #2563eb' : '3px solid transparent', marginBottom: '-2px' }}
                    >
                        Mis Vehículos
                    </button>
                    <button
                        onClick={() => setActiveTab('equipos')}
                        style={{ padding: '0.75rem 1.5rem', fontWeight: '600', fontSize: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: activeTab === 'equipos' ? '#10b981' : '#6b7280', borderBottom: activeTab === 'equipos' ? '3px solid #10b981' : '3px solid transparent', marginBottom: '-2px' }}
                    >
                        Mis Equipos
                    </button>
                </div>

                {/* Tabla Vehiculos */}
                {activeTab === 'vehiculos' && (
                    <div style={{ overflowX: 'auto' }}>
                        {vehiculos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}>🚗</p>
                                <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>No hay vehículos registrados</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead style={theadStyle}>
                                    <tr>
                                        <th style={thTdStyle}>Placa</th>
                                        <th style={thTdStyle}>Tipo</th>
                                        <th style={thTdStyle}>Marca</th>
                                        <th style={thTdStyle}>Modelo</th>
                                        <th style={thTdStyle}>Color</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehiculos.map((v, idx) => (
                                        <tr key={v.placa || idx} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ ...thTdStyle, fontWeight: '600', color: '#111827' }}>{v.placa}</td>
                                            <td style={thTdStyle}>{v.tipo_vehiculo || v.tipo}</td>
                                            <td style={thTdStyle}>{v.marca}</td>
                                            <td style={thTdStyle}>{v.modelo}</td>
                                            <td style={thTdStyle}>{v.color}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Tabla Equipos */}
                {activeTab === 'equipos' && (
                    <div style={{ overflowX: 'auto' }}>
                        {equipos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}>💻</p>
                                <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>No hay equipos registrados</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead style={theadStyle}>
                                    <tr>
                                        <th style={thTdStyle}>Serial</th>
                                        <th style={thTdStyle}>Marca</th>
                                        <th style={thTdStyle}>Modelo</th>
                                        <th style={thTdStyle}>Sistema Op.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipos.map((e, idx) => (
                                        <tr key={e.serial || idx} style={{ transition: 'background 0.1s' }} onMouseOver={ev => ev.currentTarget.style.background = '#f9fafb'} onMouseOut={ev => ev.currentTarget.style.background = 'transparent'}>
                                            <td style={{ ...thTdStyle, fontWeight: '600', color: '#111827' }}>{e.serial}</td>
                                            <td style={thTdStyle}>{e.marca}</td>
                                            <td style={thTdStyle}>{e.modelo}</td>
                                            <td style={thTdStyle}>{e.so}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Registrar Vehiculo */}
            {showVehiculoModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>Registrar Vehículo</h3>
                        <form onSubmit={handleVehiculoSubmit}>
                            <label style={labelStyle}>Placa (máx 10)</label>
                            <input style={inputStyle} type="text" maxLength={10} required value={formVehiculo.placa} onChange={e => setFormVehiculo({ ...formVehiculo, placa: e.target.value })} placeholder="Ej: ABC123" />

                            <label style={labelStyle}>Tipo de Vehículo</label>
                            <select style={inputStyle} required value={formVehiculo.id_tipo_vehiculo} onChange={e => setFormVehiculo({ ...formVehiculo, id_tipo_vehiculo: e.target.value })}>
                                <option value="">Seleccione un tipo</option>
                                {tiposVehiculo.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', gap: '1rem' }}>
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

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowVehiculoModal(false)} disabled={loading} style={{ padding: '0.6rem 1.2rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>Cancelar</button>
                                <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', border: 'none', background: loading ? '#9ca3af' : '#2563eb', color: 'white', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>{loading ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Registrar Equipo */}
            {showEquipoModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>Registrar Equipo</h3>
                        <form onSubmit={handleEquipoSubmit}>
                            <label style={labelStyle}>Serial</label>
                            <input style={inputStyle} type="text" required value={formEquipo.serial} onChange={e => setFormEquipo({ ...formEquipo, serial: e.target.value })} placeholder="Obligatorio" />

                            <div style={{ display: 'flex', gap: '1rem' }}>
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

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
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
