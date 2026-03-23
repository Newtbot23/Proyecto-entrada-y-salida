import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DynamicTableService, type TableColumn } from '../../services/dynamicTableService';
import { registrationService } from '../../services/registrationService';
import DynamicForm from './DynamicForm';
import { Modal } from '../common/Modal';
import { API_BASE_URL } from '../../config/api';


interface DynamicCrudProps {
    tableName?: string; // Optional prop to override URL param
    immutableFields?: string[];
    overrideTitle?: string;
    hideCreateForm?: boolean;
    hiddenColumns?: string[];
    hiddenFormFields?: string[];
}

const DynamicCrud: React.FC<DynamicCrudProps> = ({
    tableName: propTableName,
    immutableFields = [],
    overrideTitle,
    hideCreateForm = false,
    hiddenColumns = [],
    hiddenFormFields = []
}) => {
    const { tableName: urlTableName } = useParams<{ tableName: string }>();
    const tableName = propTableName || urlTableName;

    const [serverValidationErrors, setServerValidationErrors] = useState<Record<string, string[]>>({});

    // New states for search, pagination and edit
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // QR State
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    // Query for Schema
    const { data: schema = [], isLoading: schemaLoading } = useQuery<TableColumn[]>({
        queryKey: ['tablaSchema', tableName],
        queryFn: () => DynamicTableService.getTableSchema(tableName!),
        enabled: !!tableName
    });

    // Query for Data
    const { data: rawData = [], isLoading: dataLoading, error: dataError } = useQuery({
        queryKey: ['tablaDinamica', tableName],
        queryFn: () => DynamicTableService.getTableData(tableName!),
        enabled: !!tableName
    });

    // Mutation for Create/Update
    const crudMutation = useMutation({
        mutationFn: async (formData: any) => {
            if (editingRecord) {
                const pkColumn = schema.find(col => col.key === 'PRI')?.name || 'id';
                return await DynamicTableService.updateRecord(tableName!, editingRecord[pkColumn], formData);
            } else {
                return await DynamicTableService.createRecord(tableName!, formData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tablaDinamica', tableName] });
            toast.success(editingRecord ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente');
            setEditingRecord(null);
            setIsCreateModalOpen(false);
            setServerValidationErrors({});
        },
        onError: (err: any) => {
            console.error(err);
            if (err.errors) {
                setServerValidationErrors(err.errors);
            } else {
                toast.error(err.message || 'Error al procesar registro');
            }
        }
    });

    // Final data filtering
    const data = useMemo(() => {
        let records = rawData;
        const userDataStr = sessionStorage.getItem('authUser');
        if (userDataStr) {
            try {
                const user = JSON.parse(userDataStr);
                const hasNitColumn = schema.some(col => col.name === 'nit_entidad');
                if (user.nit_entidad && hasNitColumn) {
                    records = records.filter((r: any) => String(r.nit_entidad) === String(user.nit_entidad));
                }
            } catch (e) {
                console.error('Error parsing user data for filtering', e);
            }
        }
        return records;
    }, [rawData, schema]);

    const handleFormSubmit = async (formData: any) => {
        setServerValidationErrors({});
        crudMutation.mutate(formData);
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
            const response = await registrationService.getRegistrationQr();
            if (response.qr_code) {
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

    const loading = schemaLoading || dataLoading;
    const error = dataError ? (dataError as any).message || 'Error cargando la tabla' : null;

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
                        isLoading={crudMutation.isPending}
                        initialData={null} // Only for creation
                        title={`Agregar a ${resolvedTitle}`}
                        onCancel={undefined}
                        immutableFields={immutableFields}
                        serverErrors={serverValidationErrors}
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
                {tableName === 'usuarios' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', height: 'fit-content', fontWeight: 'bold' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}>
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        Crear Usuario
                    </button>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={`Crear Usuario`}
            >
                <DynamicForm
                    schema={schema}
                    onSubmit={handleFormSubmit}
                    isLoading={crudMutation.isPending}
                    initialData={null}
                    title=""
                    onCancel={() => setIsCreateModalOpen(false)}
                    immutableFields={[]}
                    hiddenFields={[...(hiddenFormFields || []), 'nit_entidad']}
                    serverErrors={serverValidationErrors}
                    {...(tableName === 'usuarios' && {
                        fieldOrder: [
                            'id_tip_doc', 'doc',
                            'primer_nombre', 'segundo_nombre',
                            'primer_apellido', 'segundo_apellido',
                            'correo', 'telefono',
                            'id_rol', 'contrasena',
                            'imagen',
                        ],
                        fieldLabels: {
                            id_tip_doc: 'Tipo de Documento',
                            doc: 'Número de Documento',
                            primer_nombre: 'Primer Nombre',
                            segundo_nombre: 'Segundo Nombre',
                            primer_apellido: 'Primer Apellido',
                            segundo_apellido: 'Segundo Apellido',
                            correo: 'Correo Electrónico',
                            telefono: 'Teléfono',
                            id_rol: 'Rol',
                            contrasena: 'Contraseña',
                            imagen: 'Foto de Perfil',
                        },
                        hiddenWithDefault: { estado: 'activo' },
                    })}
                />
            </Modal>

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
                    isLoading={crudMutation.isPending}
                    initialData={editingRecord}
                    title="" // Title is handled by the Modal
                    onCancel={handleCancelEdit}
                    immutableFields={immutableFields}
                    hiddenFields={hiddenFormFields}
                    serverErrors={serverValidationErrors}
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
                                            {col.name === 'imagen' && row[col.name] ? (
                                                <img 
                                                    src={`${API_BASE_URL.replace('/api', '')}/storage/${row[col.name]}`} 
                                                    alt="Imagen" 
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem' }} 
                                                />
                                            ) : col.foreign?.options?.length ? (
                                                // Resolve FK id → human-readable label
                                                (() => {
                                                    const match = col.foreign!.options.find(
                                                        opt => String(opt.value) === String(row[col.name])
                                                    );
                                                    return match ? String(match.label) : String(row[col.name] ?? '');
                                                })()
                                            ) : typeof row[col.name] === 'object' && row[col.name] !== null
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
