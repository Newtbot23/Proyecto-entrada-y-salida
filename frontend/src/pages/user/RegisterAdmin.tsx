import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import { getTiposDoc } from '../../services/userDashboardService';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import styles from './Registration.module.css';

const RegisterAdmin: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId, entidadId, entidadNombre } = (location.state as { planId?: string | number; entidadId?: string; entidadNombre?: string }) || {};

    const [formData, setFormData] = useState({
        doc: '',
        id_tip_doc: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
        confirm_contrasena: '',
    });

    interface TipoDoc {
        id_tip_doc: number;
        nombre: string;
    }

    const [tiposDoc, setTiposDoc] = useState<TipoDoc[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!entidadId) {
            navigate('/plans');
            return;
        }

        const fetchTiposDoc = async () => {
            try {
                const data = await getTiposDoc();
                setTiposDoc(data);
            } catch (err) {
                console.error('Error fetching doc types:', err);
                setTiposDoc([
                    { id_tip_doc: 1, nombre: 'CC - Cédula de Ciudadanía' },
                    { id_tip_doc: 2, nombre: 'TI - Tarjeta de Identidad' },
                    { id_tip_doc: 3, nombre: 'CE - Cédula de Extranjería' }
                ]);
            }
        };

        fetchTiposDoc();
    }, [planId, entidadId, navigate]);

    const REGEX = {
        NAME: /^[^0-9]+$/, // No numbers
        DOC: /^[0-9]{7,10}$/, // 7 to 10 digits
        PHONE: /^(3[0-9]{9}|60[0-9]{8})$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/ // Min 8, 1 uppercase, 1 lowercase, 1 special char
    };

    const validateField = (field: keyof typeof formData, value: string) => {
        let errorMsg: string | undefined;

        switch (field) {
            case 'doc':
                if (!value.trim()) errorMsg = 'El documento es obligatorio';
                else if (!REGEX.DOC.test(value)) errorMsg = 'El documento debe tener entre 7 y 10 dígitos numéricos';
                break;
            case 'primer_nombre':
            case 'primer_apellido':
                if (!value.trim()) errorMsg = 'Este campo es obligatorio';
                else if (!REGEX.NAME.test(value)) errorMsg = 'No puede contener números';
                break;
            case 'segundo_nombre':
            case 'segundo_apellido':
                if (value && !REGEX.NAME.test(value)) errorMsg = 'No puede contener números';
                break;
            case 'telefono':
                if (!value.trim()) errorMsg = 'El teléfono es obligatorio';
                else if (!REGEX.PHONE.test(value)) errorMsg = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
                break;
            case 'correo':
                if (!value.trim()) errorMsg = 'El correo es obligatorio';
                else if (!REGEX.EMAIL.test(value)) errorMsg = 'Formato de correo inválido';
                break;
            case 'contrasena':
                if (!value.trim()) errorMsg = 'La contraseña es obligatoria';
                else if (!REGEX.PASSWORD.test(value)) errorMsg = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial';
                break;
            case 'confirm_contrasena':
                if (value !== formData.contrasena) errorMsg = 'Las contraseñas no coinciden';
                break;
        }

        setFieldErrors(prev => {
            const next = { ...prev };
            if (errorMsg) next[field] = errorMsg;
            else delete next[field];
            return next;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const field = name as keyof typeof formData;

        setFormData(prev => ({ ...prev, [field]: value }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            validateField(field, value);
        }, 500);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!REGEX.DOC.test(formData.doc)) errors.doc = 'El documento debe tener entre 7 y 10 dígitos numéricos';
        if (!formData.id_tip_doc) errors.id_tip_doc = 'Seleccione un tipo de documento';
        if (!formData.primer_nombre.trim() || !REGEX.NAME.test(formData.primer_nombre)) errors.primer_nombre = 'Nombre inválido';
        if (!formData.primer_apellido.trim() || !REGEX.NAME.test(formData.primer_apellido)) errors.primer_apellido = 'Apellido inválido';
        if (!REGEX.PHONE.test(formData.telefono)) errors.telefono = 'Teléfono inválido';
        if (!REGEX.EMAIL.test(formData.correo)) errors.correo = 'Correo inválido';
        if (!REGEX.PASSWORD.test(formData.contrasena)) errors.contrasena = 'La contraseña no cumple los requisitos';
        if (formData.contrasena !== formData.confirm_contrasena) errors.confirm_contrasena = 'Las contraseñas no coinciden';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!planId || !entidadId) {
            setError('Faltan datos de la entidad o del plan. Por favor comience de nuevo.');
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const payload = {
                id_entidad: String(entidadId),
                id_plan_lic: Number(planId),
                doc: formData.doc,
                id_tip_doc: Number(formData.id_tip_doc),
                primer_nombre: formData.primer_nombre,
                segundo_nombre: formData.segundo_nombre || undefined,
                primer_apellido: formData.primer_apellido,
                segundo_apellido: formData.segundo_apellido || undefined,
                user_telefono: formData.telefono,
                user_correo: formData.correo,
                contrasena: formData.contrasena,
            };

            console.log("Payload a enviar al backend:", payload);

            await registrationService.completeEntityRegistration(payload);
            // If no error was thrown, registration succeeded
            setShowModal(true);
        } catch (err: any) {
            console.error('Final registration error:', err);

            // Handle ApiError from api.ts
            if (err.status === 422 && err.errors) {
                const formattedErrors: Record<string, string> = {};
                Object.keys(err.errors).forEach(key => {
                    // map "user_correo" to "correo", "user_telefono" to "telefono" for UI highlighting if needed
                    const fieldName = key === 'user_correo' ? 'correo' : (key === 'user_telefono' ? 'telefono' : key);
                    formattedErrors[fieldName] = err.errors[key][0];
                });
                setFieldErrors(formattedErrors);
                setError('Por favor corrija los errores resaltados.');
            } else {
                setError(err.message || 'Ocurrió un error durante el registro');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Registro de Administrador</h2>
                <p className={styles.subtitle}>Configurando Administrador para: {entidadNombre || 'Nueva Entidad'}</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Número de Documento</label>
                        <input type="text" inputMode="numeric" name="doc" value={formData.doc} onChange={handleChange} className={fieldErrors.doc ? styles.inputError : ''} required />
                        {fieldErrors.doc && <span className={styles.fieldError}>{fieldErrors.doc}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tipo de Documento</label>
                        <select name="id_tip_doc" value={formData.id_tip_doc} onChange={handleChange} className={fieldErrors.id_tip_doc ? styles.inputError : ''} required>
                            <option value="">Seleccione Tipo</option>
                            {tiposDoc.map(type => (
                                <option key={type.id_tip_doc} value={type.id_tip_doc}>
                                    {type.nombre}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.id_tip_doc && <span className={styles.fieldError}>{fieldErrors.id_tip_doc}</span>}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Primer Nombre</label>
                            <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} className={fieldErrors.primer_nombre ? styles.inputError : ''} required />
                            {fieldErrors.primer_nombre && <span className={styles.fieldError}>{fieldErrors.primer_nombre}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Segundo Nombre (Opcional)</label>
                            <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} className={fieldErrors.segundo_nombre ? styles.inputError : ''} />
                            {fieldErrors.segundo_nombre && <span className={styles.fieldError}>{fieldErrors.segundo_nombre}</span>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Primer Apellido</label>
                            <input type="text" name="primer_apellido" value={formData.primer_apellido} onChange={handleChange} className={fieldErrors.primer_apellido ? styles.inputError : ''} required />
                            {fieldErrors.primer_apellido && <span className={styles.fieldError}>{fieldErrors.primer_apellido}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Segundo Apellido (Opcional)</label>
                            <input type="text" name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange} className={fieldErrors.segundo_apellido ? styles.inputError : ''} />
                            {fieldErrors.segundo_apellido && <span className={styles.fieldError}>{fieldErrors.segundo_apellido}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Teléfono</label>
                        <input type="text" inputMode="numeric" name="telefono" value={formData.telefono} onChange={handleChange} className={fieldErrors.telefono ? styles.inputError : ''} required />
                        {fieldErrors.telefono && <span className={styles.fieldError}>{fieldErrors.telefono}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Correo Electrónico</label>
                        <input type="email" name="correo" value={formData.correo} onChange={handleChange} className={fieldErrors.correo ? styles.inputError : ''} required />
                        {fieldErrors.correo && <span className={styles.fieldError}>{fieldErrors.correo}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} className={fieldErrors.contrasena ? styles.inputError : ''} required />
                        {fieldErrors.contrasena && <span className={styles.fieldError}>{fieldErrors.contrasena}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirmar Contraseña</label>
                        <input type="password" name="confirm_contrasena" value={formData.confirm_contrasena} onChange={handleChange} className={fieldErrors.confirm_contrasena ? styles.inputError : ''} required />
                        {fieldErrors.confirm_contrasena && <span className={styles.fieldError}>{fieldErrors.confirm_contrasena}</span>}
                    </div>

                    <button type="submit" className={styles.button} disabled={loading || showModal}>
                        {loading ? 'Completando Registro...' : 'Finalizar Registro'}
                    </button>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showModal}
                onClose={() => navigate('/login')}
                onConfirm={() => navigate('/login')}
                title="Registro Completado"
                message={`¡Bienvenido ${formData.primer_nombre} ${formData.primer_apellido}! La entidad y tu cuenta de administrador han sido registradas correctamente.`}
                confirmText="Ir al Inicio de Sesión"
                variant="success"
                isSingleButton={true}
            />
        </div>
    );
};

export default RegisterAdmin;
