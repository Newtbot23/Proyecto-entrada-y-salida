import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FichasService } from '../../../../services/fichasService';
import styles from './FichasCreate.module.css';

const FichasCreate: React.FC = () => {
    const [formData, setFormData] = useState({
        numero_ficha: '',
        id_programa: '',
        numero_ambiente: '',
        id_jornada: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorDetails, setErrorDetails] = useState<any>(null);

    // Fetch catalogs
    const { data: catalogs, isLoading: isLoadingCatalogs, error: catalogsError } = useQuery({
        queryKey: ['fichaCatalogs'],
        queryFn: FichasService.getCatalogs
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: FichasService.createFicha,
        onSuccess: () => {
            setSuccessMessage('Ficha creada correctamente');
            setFormData({
                numero_ficha: '',
                id_programa: '',
                numero_ambiente: '',
                id_jornada: ''
            });
            setErrorDetails(null);
        },
        onError: (error: any) => {
            setErrorDetails(error.message || 'Error en la solicitud');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorDetails(null);
        createMutation.mutate({
            ...formData,
            id_jornada: Number(formData.id_jornada)
        } as any);
    };

    if (isLoadingCatalogs) return <div className={styles.loading}>Cargando catálogos...</div>;
    if (catalogsError) return <div className={styles.error}>Error al cargar catálogos.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Crear Nueva Ficha</h1>
                <p>Ingresa los detalles para registrar una nueva ficha de formación.</p>
            </header>

            {successMessage && <div className={styles.success}>{successMessage}</div>}
            {errorDetails && (
                <div className={styles.error}>
                    <strong>Error:</strong> {typeof errorDetails === 'string' ? errorDetails : 'Verifica los campos.'}
                </div>
            )}

            <div className={styles.card}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Número de Ficha</label>
                        <input
                            type="number"
                            name="numero_ficha"
                            value={formData.numero_ficha}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej. 2560123"
                            required
                        />
                    </div>

                    {/* Combobox Autocomplete para Programa */}
                    <ProgramaCombobox
                        programas={catalogs?.programas ?? []}
                        value={formData.id_programa}
                        onChange={(id) => setFormData(prev => ({ ...prev, id_programa: id }))}
                    />

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ambiente</label>
                        <select
                            name="numero_ambiente"
                            value={formData.numero_ambiente}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Selecciona un ambiente</option>
                            {catalogs?.ambientes.map((amb: any) => (
                                <option key={amb.numero_ambiente} value={amb.numero_ambiente}>
                                    {amb.numero_ambiente} - {amb.ambiente}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Jornada</label>
                        <select
                            name="id_jornada"
                            value={formData.id_jornada}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Selecciona una jornada</option>
                            {catalogs?.jornadas.map((jor: any) => (
                                <option key={jor.id} value={jor.id}>
                                    {jor.jornada}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Creando...' : 'Crear Ficha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Combobox Component ───────────────────────────────────────────────────────

interface ProgramaComboboxProps {
    programas: { id: string; programa: string }[];
    value: string;
    onChange: (id: string) => void;
}

const ProgramaCombobox: React.FC<ProgramaComboboxProps> = ({ programas, value, onChange }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Cuando el formulario se resetea (value pasa a ''), limpiar el label visible
    React.useEffect(() => {
        if (!value) {
            setSearchTerm('');
        }
    }, [value]);

    // Cerrar dropdown al hacer click fuera
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const programasFiltrados = programas.filter(p =>
        p.programa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (prog: { id: string; programa: string }) => {
        setSearchTerm(prog.programa);
        onChange(prog.id);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Limpiar el ID real mientras el usuario escribe (selección aún no confirmada)
        onChange('');
        setIsOpen(true);
    };

    return (
        <div className={styles.formGroup} ref={containerRef}>
            <label className={styles.label}>Programa de Formación</label>
            <div className={styles.comboboxWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Escribe para buscar un programa..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    autoComplete="off"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    // Campo requerido solo si no hay un ID seleccionado
                    required={!value}
                />
                {/* Input oculto que lleva el ID real al submit del formulario */}
                <input type="hidden" name="id_programa" value={value} />

                {isOpen && programasFiltrados.length > 0 && (
                    <ul className={styles.comboboxDropdown} role="listbox">
                        {programasFiltrados.map(prog => (
                            <li
                                key={prog.id}
                                className={`${styles.comboboxItem} ${prog.id === value ? styles.comboboxItemSelected : ''}`}
                                role="option"
                                aria-selected={prog.id === value}
                                // onMouseDown dispara ANTES de que el input pierda el foco (onBlur)
                                onMouseDown={() => handleSelect(prog)}
                            >
                                <span className={styles.programCode}>{prog.id}</span>
                                <span> - {prog.programa}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {isOpen && programasFiltrados.length === 0 && searchTerm.length > 0 && (
                    <div className={styles.comboboxEmpty}>
                        Sin resultados para "<strong>{searchTerm}</strong>"
                    </div>
                )}
            </div>
        </div>
    );
};

export default FichasCreate;
