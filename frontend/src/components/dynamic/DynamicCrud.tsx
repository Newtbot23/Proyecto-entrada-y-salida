import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DynamicTableService, type TableColumn } from '../../services/dynamicTableService';
import { registrationService } from '../../services/registrationService';
import DynamicForm from './DynamicForm';
import { Modal } from '../common/Modal';


interface DynamicCrudProps {
    tableName?: string; // Optional prop to override URL param
    immutableFields?: string[];
    overrideTitle?: string;
    hideCreateForm?: boolean;
    hiddenColumns?: string[];
}

const DynamicCrud: React.FC<DynamicCrudProps> = ({
    tableName: propTableName,
    immutableFields = [],
    overrideTitle,
    hideCreateForm = false,
    hiddenColumns = []
}) => {
    const { tableName: urlTableName } = useParams<{ tableName: string }>();
    const tableName = propTableName || urlTableName;

    const [schema, setSchema] = useState<TableColumn[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New states for search, pagination and edit
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const [editingRecord, setEditingRecord] = useState<any | null>(null);

    // QR State
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    const loadData = async () => {
        if (!tableName) return;
        setLoading(true);
        setError(null);
        try {
            const columns = await DynamicTableService.getTableSchema(tableName);
            setSchema(columns);
            let records = await DynamicTableService.getTableData(tableName);

            // --- INICIO LÓGICA CORREGIDA ---
            const userDataStr = sessionStorage.getItem('userData') || sessionStorage.getItem('adminUser');
            if (userDataStr) {
                try {
                    const user = JSON.parse(userDataStr);

                    // Verificamos si la tabla actual realmente tiene la columna 'nit_entidad'
                    const hasNitColumn = columns.some(col => col.name === 'nit_entidad');

                    // Si el usuario tiene un NIT y la tabla también soporta ese campo, filtramos.
                    // (Opcional: puedes volver a agregar la validación del rol aquí si ES ESTRICTAMENTE necesario)
                    if (user.nit_entidad && hasNitColumn) {
                        records = records.filter((r: any) => String(r.nit_entidad) === String(user.nit_entidad));
                    }
                } catch (e) {
                    console.error('Error parsing user data for filtering', e);
                }
            }
            // --- FIN LÓGICA CORREGIDA ---

            setData(records);
        } catch (err: any) {
            console.error("Error loading dynamic table", err);
            setError(err.message || 'Error cargando la tabla');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        setSearchTerm('');
        setCurrentPage(1);
        setEditingRecord(null);
    }, [tableName]);

    const handleFormSubmit = async (formData: any) => {
        if (!tableName) return;
        setActionLoading(true);
        setError(null);
        try {
            if (editingRecord) {
                // Find primary key
                const pkColumn = schema.find(col => col.key === 'PRI')?.name || 'id';
                await DynamicTableService.updateRecord(tableName, editingRecord[pkColumn], formData);
                alert('Registro actualizado exitosamente');
            } else {
                await DynamicTableService.createRecord(tableName, formData);
                alert('Registro creado exitosamente');
            }
            setEditingRecord(null);
            await loadData();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al procesar registro');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
    };

    const handleGenerateQr = async () => {
        setIsQrModalOpen(true);
        setQrLoading(true);
        setQrError(null);
        try {
            const token = sessionStorage.getItem('userToken');
            if (!token) throw new Error('No estás autenticado.');

            const response = await registrationService.getRegistrationQr(token);
            if (response.success && response.qr_code) {
                // Return value is base64 encoded PNG string
                const mimeType = response.content_type || 'image/png';
                setQrCodeSvg(`data:${mimeType};base64,${response.qr_code}`);
            } else {
                throw new Error(response.message || 'Error al generar QR');
            }
        } catch (err: any) {
            console.error(err);
            setQrError(err.message || 'Error al obtener el código QR.');
        } finally {
            setQrLoading(false);
        }
    };

    if (loading) return <div>Cargando la tabla...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const displayColumns = schema.filter(col =>
        col.name !== 'created_at' &&
        col.name !== 'updated_at' &&
        col.name !== 'password' &&
        !hiddenColumns.includes(col.name)
    );

    // Search Logic
    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredData.length / recordsPerPage);

    const resolvedTitle = overrideTitle || `Gestión de ${tableName?.replace(/_/g, ' ')}`;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'capitalize' }}>
                {resolvedTitle}
            </h2>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: hideCreateForm ? '1rem' : '0' }}>
                {!hideCreateForm && (
                    <DynamicForm
                        schema={schema}
                        onSubmit={handleFormSubmit}
                        isLoading={actionLoading}
                        initialData={null} // Only for creation
                        title={`Agregar a ${resolvedTitle}`}
                        onCancel={undefined}
                        immutableFields={immutableFields}
                    />
                )}
                {tableName === 'usuarios' && (
                    <button
                        onClick={handleGenerateQr}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', height: 'fit-content', fontWeight: 'bold' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}>
                            <path d="M2 2h2v2H2V2Z" />
                            <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z" />
                            <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z" />
                            <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z" />
                            <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z" />
                        </svg>
                        Generar/Mostrar QR de Registro
                    </button>
                )}
            </div>

            <Modal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                title="Código QR de Registro"
            >
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                        Muestra este QR para que los empleados se registren y queden asociados automáticamente a tu empresa.
                    </p>
                    {qrLoading && <p>Cargando código QR...</p>}
                    {qrError && <p style={{ color: 'red' }}>{qrError}</p>}
                    {qrCodeSvg && !qrLoading && !qrError && (
                        <div>
                            <img src={qrCodeSvg} alt="QR Registro" style={{ width: '300px', height: '300px', margin: '0 auto', display: 'block' }} />
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={!!editingRecord}
                onClose={handleCancelEdit}
                title={`Editar en ${resolvedTitle}`}
            >
                <DynamicForm
                    schema={schema}
                    onSubmit={handleFormSubmit}
                    isLoading={actionLoading}
                    initialData={editingRecord}
                    title="" // Title is handled by the Modal
                    onCancel={handleCancelEdit}
                    immutableFields={immutableFields}
                />
            </Modal>

            <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 'bold' }}>Registros Actuales ({filteredData.length})</h3>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', width: '250px' }}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {displayColumns.map(col => (
                                    <th key={col.name} style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600', textTransform: 'capitalize' }}>
                                        {col.name.replace(/_/g, ' ')}
                                    </th>
                                ))}
                                <th style={{ padding: '0.75rem 1rem', color: '#4b5563', fontWeight: '600' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((row, i) => (
                                <tr key={row.id || i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    {displayColumns.map(col => (
                                        <td key={col.name} style={{ padding: '1rem' }}>
                                            {typeof row[col.name] === 'object' && row[col.name] !== null
                                                ? JSON.stringify(row[col.name])
                                                : String(row[col.name] || '')}
                                        </td>
                                    ))}
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleEdit(row)}
                                            style={{ padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentRecords.length === 0 && (
                                <tr>
                                    <td colSpan={displayColumns.length + 1} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                                        No hay registros disponibles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                        >
                            Anterior
                        </button>
                        <span style={{ alignSelf: 'center', color: '#4b5563' }}>
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DynamicCrud;
