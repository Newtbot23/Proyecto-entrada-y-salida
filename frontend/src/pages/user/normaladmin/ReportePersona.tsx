import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiClient } from '../../../config/api';

interface Registro {
    id: number;
    doc: string;
    fecha: string;
    hora_entrada: string;
    hora_salida: string | null;
    placa?: string;
    serial_equipo?: string;
    vehiculo_placa?: string;
    tipo_vehiculo?: string;
    equipo_serial?: string;
    tipo_equipo?: string;
    equipo_marca?: string;
    equipos?: any[];
}

interface Usuario {
    doc: string;
    nombre: string;
    correo: string;
    telefono: string;
}

const ReportePersona: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [includeExtras, setIncludeExtras] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<Registro[]>([]);
    const [user, setUser] = useState<Usuario | null>(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError('Por favor ingresa un documento o nombre para buscar.');
            return;
        }

        setLoading(true);
        setError(null);
        setRecords([]);
        setUser(null);

        try {
            const response = await apiClient.get<any>(`/reports/person?query=${encodeURIComponent(searchTerm)}&include_extras=${includeExtras}`);
            if (response && response.usuario) {
                setUser(response.usuario);
                setRecords(response.registros || []);
            } else {
                setError('No se encontraron resultados.');
            }
        } catch (err: any) {
            console.error('Error fetching report:', err);
            setError(err.message || 'Ocurrió un error al buscar los registros.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        if (!user || records.length === 0) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('Reporte de Entradas y Salidas por Persona', 14, 22);

        // User Info
        doc.setFontSize(11);
        doc.text(`Nombre: ${user.nombre}`, 14, 32);
        doc.text(`Documento: ${user.doc}`, 14, 38);
        doc.text(`Correo: ${user.correo || 'N/A'}`, 14, 44);
        doc.text(`Teléfono: ${user.telefono || 'N/A'}`, 14, 50);
        doc.text(`Incluye Vehículos/Equipos: ${includeExtras ? 'Sí' : 'No'}`, 14, 56);

        // Table Data
        const tableColumn = includeExtras
            ? ["Fecha", "Ingreso", "Salida", "Vehículo (Placa)", "Equipos"]
            : ["Fecha", "Hora Ingreso", "Hora Salida"];

        const tableRows = records.map(record => {
            const baseData = [
                record.fecha,
                record.hora_entrada,
                record.hora_salida || 'Aún adentro'
            ];

            if (includeExtras) {
                const placaVal = record.placa || record.vehiculo_placa;
                const vehiculo = placaVal ? `${placaVal} ${record.tipo_vehiculo ? '(' + record.tipo_vehiculo + ')' : ''}`.trim() : 'N/A';
                
                const equiposInfo = record.equipos && record.equipos.length > 0 
                    ? record.equipos.map(e => `${e.serial} (${e.marca})`).join(', ')
                    : 'N/A';
                    
                return [...baseData, vehiculo, equiposInfo];
            }

            return baseData;
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 65,
            theme: 'grid',
            headStyles: { fillColor: [0, 143, 57] }, // Green color to match app theme
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        doc.save(`reporte_${user.doc}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                Consultar Historial de Persona
            </h2>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Buscar por Documento o Nombre
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ej. 12345678 o Juan Perez"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                </div>

                <div style={{ minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Tipo de Reporte
                    </label>
                    <select
                        value={includeExtras ? 'all' : 'basic'}
                        onChange={(e) => setIncludeExtras(e.target.value === 'all')}
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white' }}
                    >
                        <option value="basic">Solo Entradas y Salidas</option>
                        <option value="all">Incluir Vehículos y Equipos</option>
                    </select>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{ padding: '0.625rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>

                {records.length > 0 && (
                    <button
                        onClick={handleExportPDF}
                        style={{ padding: '0.625rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.249 0 .45.05.603.151.154.1.265.236.334.408.068.173.102.383.102.63 0 .25-.034.463-.102.64-.069.176-.18.312-.334.413-.153.1-.354.152-.603.152h-.563v-2.394Zm2.592-.645v3.999h.791v-1.55h.885v-2.449H6.745Zm.791.645h.557c.21 0 .37.045.482.135.112.09.168.23.168.42 0 .193-.056.335-.168.428-.112.093-.272.139-.482.139h-.557v-1.122Z" />
                        </svg>
                        Exportar a PDF
                    </button>
                )}
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            {user && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Datos de la Persona</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div><span style={{ color: '#374151', display: 'block', fontSize: '0.875rem' }}>Nombre</span><strong style={{ fontSize: '1.125rem' }}>{user.nombre}</strong></div>
                        <div><span style={{ color: '#374151', display: 'block', fontSize: '0.875rem' }}>Documento</span><strong style={{ fontSize: '1.125rem' }}>{user.doc}</strong></div>
                        <div><span style={{ color: '#374151', display: 'block', fontSize: '0.875rem' }}>Correo</span><strong style={{ fontSize: '1.125rem' }}>{user.correo || '-'}</strong></div>
                        <div><span style={{ color: '#374151', display: 'block', fontSize: '0.875rem' }}>Teléfono</span><strong style={{ fontSize: '1.125rem' }}>{user.telefono || '-'}</strong></div>
                    </div>
                </div>
            )}

            {records.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '0.75rem 1rem', color: '#111827' }}>Fecha</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#111827' }}>Hora Ingreso</th>
                                <th style={{ padding: '0.75rem 1rem', color: '#111827' }}>Hora Salida</th>
                                {includeExtras && (
                                    <>
                                        <th style={{ padding: '0.75rem 1rem', color: '#111827' }}>Vehículo</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#111827' }}>Equipo</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={record.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{record.fecha}</td>
                                    <td style={{ padding: '1rem', color: '#059669', fontWeight: '500' }}>{record.hora_entrada}</td>
                                    <td style={{ padding: '1rem', color: record.hora_salida ? '#dc2626' : '#d97706', fontWeight: '500' }}>
                                        {record.hora_salida || 'Adentro'}
                                    </td>
                                    {includeExtras && (
                                        <>
                                            <td style={{ padding: '1rem' }}>
                                                {record.placa || record.vehiculo_placa ? (
                                                    <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                                                        {record.placa || record.vehiculo_placa} {record.tipo_vehiculo ? `(${record.tipo_vehiculo})` : ''}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {record.equipos && record.equipos.length > 0 ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                        {record.equipos.map((eq: any, idx: number) => (
                                                            <span key={idx} style={{ backgroundColor: '#fdf6e3', color: '#b45309', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                                                                {eq.serial} ({eq.marca})
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && user && (
                    <p style={{ textAlign: 'center', color: '#374151', padding: '2rem 0' }}>
                        Esta persona no tiene registros en el sistema.
                    </p>
                )
            )}
        </div>
    );
};

export default ReportePersona;
