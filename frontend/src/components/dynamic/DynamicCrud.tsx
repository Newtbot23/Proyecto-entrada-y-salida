import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DynamicTableService, type TableColumn } from '../../services/dynamicTableService';
import DynamicForm from './DynamicForm';
import DynamicTable from './DynamicTable';
import EditModal from './EditModal';

const DynamicCrud: React.FC = () => {
    const { tableName } = useParams<{ tableName: string }>();
    const [schema, setSchema] = useState<TableColumn[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (tableName) {
            fetchTableData(tableName);
        }
    }, [tableName]);

    const fetchTableData = async (table: string) => {
        setLoading(true);
        setError(null);
        try {
            const [fetchedSchema, fetchedData] = await Promise.all([
                DynamicTableService.getTableSchema(table),
                DynamicTableService.getTableData(table)
            ]);
            setSchema(fetchedSchema);
            setData(fetchedData);
        } catch (err) {
            console.error("Error loading table data", err);
            setError("No se pudo cargar la información de la tabla.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (newData: any) => {
        if (!tableName) return;
        setLoading(true);
        try {
            await DynamicTableService.createRecord(tableName, newData);
            // Refresh data
            const updatedData = await DynamicTableService.getTableData(tableName);
            setData(updatedData);
            alert('Registro creado exitosamente');
        } catch (err) {
            console.error("Error creating record", err);
            alert('Error al crear el registro');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (updatedData: any) => {
        if (!tableName || !editingRecord) return;
        setLoading(true);
        try {
            await DynamicTableService.updateRecord(tableName, editingRecord.id, updatedData);
            // Refresh data
            const updatedTableData = await DynamicTableService.getTableData(tableName);
            setData(updatedTableData);
            setIsEditModalOpen(false);
            setEditingRecord(null);
            alert('Registro actualizado exitosamente');
        } catch (err) {
            console.error("Error updating record", err);
            alert('Error al actualizar el registro');
        } finally {
            setLoading(false);
        }
    };

    if (!tableName) return <div>Seleccione una tabla del menú lateral.</div>;

    return (
        <div style={{ padding: '0' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>
                    Gestión de {tableName}
                </h2>
                {loading && <span style={{ color: '#008f39' }}>Cargando...</span>}
            </div>

            {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}

            {!loading && schema.length > 0 && (
                <>
                    <DynamicForm schema={schema} onSubmit={handleCreate} isLoading={loading} />
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.25rem' }}>Registros Actuales</h3>
                        <DynamicTable schema={schema} data={data} onEdit={handleEdit} />
                    </div>

                    <EditModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        schema={schema}
                        initialData={editingRecord}
                        onSubmit={handleUpdate}
                        isLoading={loading}
                    />
                </>
            )}
        </div>
    );
};

export default DynamicCrud;
