import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { EquiposService } from '../../../../services/equiposService';
import type { IEquipo } from '../../../../services/equiposService';
import styles from './RegistrarEquipos.module.css';

const RegistrarEquipos: React.FC = () => {
    // 1. Catálogos
    const { data: catalogs, isLoading: loadingCatalogs } = useQuery({
        queryKey: ['equipos-catalogs'],
        queryFn: () => EquiposService.getCatalogs()
    });

    // 2. Estado del Formulario
    const [formData, setFormData] = useState<IEquipo>({
        categoria_equipo: 'Computo',
        tipo_equipo: 'sena',
        estado: 'no_asignado',
        modelo: '',
        tipo_equipo_desc: '',
        caracteristicas: '',
        serial: ''
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 3. Lógica Reactiva
    useEffect(() => {
        // Ajustar estado por defecto según tipo_equipo
        if (formData.tipo_equipo === 'sena') {
            setFormData(prev => ({ ...prev, estado: 'no_asignado' }));
        } else {
            setFormData(prev => ({ ...prev, estado: 'asignado' }));
        }
    }, [formData.tipo_equipo]);

    // 4. Mutación para Guardar
    const mutation = useMutation({
        mutationFn: (data: IEquipo) => EquiposService.create(data),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Equipo registrado exitosamente.' });
            setFormData({
                categoria_equipo: 'Computo',
                tipo_equipo: 'sena',
                estado: 'no_asignado',
                modelo: '',
                tipo_equipo_desc: '',
                caracteristicas: '',
                serial: ''
            });
            // Ocultar mensaje después de unos segundos
            setTimeout(() => setMessage(null), 5000);
        },
        onError: (error: any) => {
            setMessage({ type: 'error', text: error.message || 'Error al registrar el equipo.' });
        }
    });

    // 5. Estado de Importación CSV
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parseStatus, setParseStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchName, setBatchName] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParseStatus('loading');
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim());
                const rows = lines.slice(1, 6).map(line => {
                    const values = line.split(',');
                    const obj: any = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index]?.trim();
                    });
                    return obj;
                });
                setPreviewData(rows);
            }
            setParseStatus('success');
        };
        reader.readAsText(file);
    };

    const handleSubmitCsv = () => {
        if (!selectedFile) {
            console.error("Error: No hay selectedFile en el estado de React");
            return;
        }
        setIsBatchModalOpen(true);
    };

    const handleConfirmImport = () => {
        if (!selectedFile || !batchName.trim()) return;
        importMutation.mutate({ file: selectedFile, batchName: batchName.trim() });
    };

    const importMutation = useMutation({
        mutationFn: ({ file, batchName }: { file: File, batchName: string }) => EquiposService.importCsv(file, batchName),
        onSuccess: (response) => {
            setMessage({ type: 'success', text: response.message });
            setParseStatus('idle');
            setSelectedFile(null);
            setBatchName('');
            setPreviewData([]);
            setIsPreviewOpen(false);
            setIsBatchModalOpen(false);
            const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        },
        onError: (error: any) => {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al importar el archivo.' });
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        mutation.mutate(formData);
    };

    const isHardware = formData.categoria_equipo === 'Computo' || formData.categoria_equipo === 'Electronica';

    const handleDownloadTemplate = () => {
        const headers = 'serial,categoria_equipo,placa_sena,marca,modelo,sistema_operativo,descripcion_tipo,caracteristicas';
        const example = 'SN-987654321,Computo,123456,HP,ProBook 450,Windows 10,Portátil,Carcasa en buen estado';
        const csvContent = `${headers}\n${example}`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'plantilla_carga_equipos.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1>Registrar Equipos</h1>
                        <p>Ingresa los detalles técnicos del nuevo equipo o herramienta.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button 
                            type="button" 
                            className={styles.btnOutline}
                            onClick={handleDownloadTemplate}
                        >
                            <span>Descargar Plantilla CSV</span>
                        </button>
                        
                        <div className={styles.uploadZone}>
                            <input 
                                type="file" 
                                id="csv-upload"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <button 
                                type="button" 
                                className={styles.btnImport}
                                onClick={() => document.getElementById('csv-upload')?.click()}
                            >
                                {parseStatus === 'loading' ? 'Analizando...' : (selectedFile ? 'Cambiar CSV' : 'Seleccionar CSV')}
                                {parseStatus === 'success' && <span className={styles.successBadge}></span>}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.card}>
                {message && (
                    <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                        {message.text}
                    </div>
                )}

                {parseStatus === 'success' && selectedFile && (
                    <div className={styles.csvPreviewPanel}>
                        <div className={styles.previewHeader}>
                            <div className={styles.fileInfo}>
                                <span className={styles.fileName}>Archivo: <strong>{selectedFile.name}</strong></span>
                                <button 
                                    className={styles.btnTogglePreview}
                                    onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                                >
                                    {isPreviewOpen ? 'Ocultar previsualización' : 'Ver previsualización de datos'}
                                </button>
                            </div>
                            <button 
                                className={styles.btnConfirmUpload}
                                onClick={handleSubmitCsv}
                                disabled={importMutation.isPending}
                            >
                                {importMutation.isPending ? 'Subiendo...' : 'Confirmar y Subir CSV'}
                            </button>
                        </div>

                        {isPreviewOpen && (
                            <div className={styles.tableWrapper}>
                                <table className={styles.previewTable}>
                                    <thead>
                                        <tr>
                                            {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                                                <th key={key}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, idx) => (
                                            <tr key={idx}>
                                                {Object.values(row).map((val: any, i) => (
                                                    <td key={i}>{val}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    {/* Categoría */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Categoría de Equipo</label>
                        <select
                            name="categoria_equipo"
                            className={styles.select}
                            value={formData.categoria_equipo}
                            onChange={handleChange}
                            required
                        >
                            <option value="Computo">Cómputo</option>
                            <option value="Electronica">Electrónica</option>
                            <option value="Herramientas">Herramientas</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    {/* Serial */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Serial / Placa {!isHardware && <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(Opcional)</span>}
                        </label>
                        <input
                            type="text"
                            name="serial"
                            placeholder={isHardware ? "Escribe el serial único" : "Dejar vacío para autogenerar"}
                            className={styles.input}
                            value={formData.serial}
                            onChange={handleChange}
                            required={isHardware}
                        />
                    </div>

                    {/* Tipo (SENA / Propio) */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Origen / Tipo</label>
                        <select
                            name="tipo_equipo"
                            className={styles.select}
                            value={formData.tipo_equipo}
                            onChange={handleChange}
                            required
                        >
                            <option value="sena">SENA (Institucional)</option>
                            <option value="propio">Propio (Usuario)</option>
                        </select>
                    </div>

                    {/* Placa SENA (Solo si es SENA) */}
                    {formData.tipo_equipo === 'sena' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Placa SENA</label>
                            <input
                                type="text"
                                name="placa_sena"
                                placeholder="Ej: 123456"
                                className={styles.input}
                                value={formData.placa_sena || ''}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    {/* Marca (Solo para Hardware) */}
                    {isHardware && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Marca</label>
                            <select
                                name="id_marca"
                                className={styles.select}
                                value={formData.id_marca || ''}
                                onChange={handleChange}
                                required={isHardware}
                            >
                                <option value="">Selecciona una marca</option>
                                {catalogs?.marcas.map(m => (
                                    <option key={m.id} value={m.id}>{m.marca}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sistema Operativo (Solo para Hardware) */}
                    {isHardware && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Sistema Operativo</label>
                            <select
                                name="id_sistema_operativo"
                                className={styles.select}
                                value={formData.id_sistema_operativo || ''}
                                onChange={handleChange}
                                required={isHardware}
                            >
                                <option value="">Selecciona S.O.</option>
                                {catalogs?.sistemas_operativos.map(so => (
                                    <option key={so.id} value={so.id}>{so.sistema_operativo}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Modelo */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Modelo</label>
                        <input
                            type="text"
                            name="modelo"
                            placeholder="Ej: Latitude 5420"
                            className={`${styles.input} ${styles.inputLarge}`}
                            value={formData.modelo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Estado */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Estado Inicial</label>
                        <select
                            name="estado"
                            className={styles.select}
                            value={formData.estado}
                            onChange={handleChange}
                            required
                        >
                            <option value="asignado">Asignado</option>
                            <option value="no_asignado">No Asignado (Libre)</option>
                            <option value="inhabilitado">Inhabilitado</option>
                        </select>
                    </div>

                    {/* Descripción Corta */}
                    <div className={styles.formGroupFull}>
                        <label className={styles.label}>Descripción del Tipo (Resumen)</label>
                        <input
                            type="text"
                            name="tipo_equipo_desc"
                            placeholder="Ej: Portátil de alto rendimiento"
                            className={`${styles.input} ${styles.inputLarge}`}
                            value={formData.tipo_equipo_desc}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Características / Observaciones */}
                    <div className={styles.formGroupFull}>
                        <label className={styles.label}>Características / Observaciones Físicas</label>
                        <textarea
                            name="caracteristicas"
                            placeholder="Describe el estado físico o componentes..."
                            className={styles.textarea}
                            value={formData.caracteristicas}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={mutation.isPending || loadingCatalogs}
                        >
                            {mutation.isPending ? 'Registrando...' : 'Registrar Equipo'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Nombre de Lote */}
            {isBatchModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Nombrar Lote de Importación</h2>
                        <p className={styles.modalDescription}>
                            Asigna un nombre descriptivo para identificar este grupo de equipos (ej: "Computadores HP Sala 301").
                        </p>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nombre del Lote</label>
                            <input 
                                type="text"
                                className={styles.input}
                                placeholder="Escribe el nombre del lote..."
                                value={batchName}
                                onChange={(e) => setBatchName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button 
                                className={styles.btnSecondary}
                                onClick={() => setIsBatchModalOpen(false)}
                                disabled={importMutation.isPending}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.btnPrimary}
                                onClick={handleConfirmImport}
                                disabled={!batchName.trim() || importMutation.isPending}
                            >
                                {importMutation.isPending ? 'Subiendo...' : 'Subir Definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrarEquipos;
