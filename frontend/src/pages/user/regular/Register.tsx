import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { registrationService } from '../../../services/registrationService';
import { ConfirmationModal } from '../../../components/modals/ConfirmationModal';
import styles from '../Registration.module.css';

const REGEX = {
    NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    DOC: /^[0-9]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/
};

const RegisterUser: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const qrToken = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        doc: '',
        id_tip_doc: '1',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
        // Predeterminados según el requerimiento
        nit_entidad: '', // Will be resolved by backend via token
        id_rol: 2,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (qrToken) {
            // Provide a visual cue or just let the user know they are registering via an invitation link
            console.log("Registering via QR Invitation token.");
        }
    }, [qrToken]);

    const validateField = (name: string, value: string) => {
        let error = '';

        switch (name) {
            case 'doc':
                if (!value.trim()) error = 'El número de documento es obligatorio';
                else if (!REGEX.DOC.test(value)) error = 'El documento solo debe contener números';
                else if (value.length < 7 || value.length > 10) error = 'Debe tener entre 7 y 10 dígitos';
                break;
            case 'primer_nombre':
            case 'segundo_nombre':
            case 'primer_apellido':
            case 'segundo_apellido':
                if (['primer_nombre', 'primer_apellido'].includes(name) && !value.trim()) {
                    error = 'Este campo es obligatorio';
                } else if (value.trim() && !REGEX.NAME.test(value)) {
                    error = 'Solo debe contener letras y espacios';
                } else if (value.length > 50) {
                    error = 'No debe exceder los 50 caracteres';
                }
                break;
            case 'correo':
                if (!value.trim()) error = 'El correo es obligatorio';
                else if (!REGEX.EMAIL.test(value)) error = 'Formato de correo inválido';
                break;
            case 'telefono':
                if (!value.trim()) error = 'El teléfono es obligatorio';
                else if (value.startsWith('+')) error = 'No incluya prefijos como +57';
                else if (!/^(3[0-9]{9}|60[0-9]{8})$/.test(value)) error = 'Número inválido (10 dígitos, inicia en 3 o 60)';
                break;
            case 'contrasena':
                if (!value.trim()) error = 'La contraseña es obligatoria';
                else if (!REGEX.PASSWORD.test(value)) error = 'Mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial';
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            validateField(name, value);
        }, 500);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validation
        let isValid = true;
        
        Object.entries(formData).forEach(([key, value]) => {
            if (!validateField(key, value as string)) {
                isValid = false;
            }
        });

        if (!imageFile) {
            setError('La foto de rostro es obligatoria');
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        setError(null);

        try {
            if (qrToken) {
                // Build FormData
                const submitData = new FormData();
                
                // Append text fields (excluding nit_entidad as requested before)
                Object.entries(formData).forEach(([key, value]) => {
                    if (key !== 'nit_entidad') {
                        submitData.append(key, value.toString());
                    }
                });

                // Append file if exists
                if (imageFile) {
                    submitData.append('imagen', imageFile);
                }

                await registrationService.registerUserWithQr(submitData, qrToken);
            } else {
                await registrationService.registerUser(formData);
            }
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error al registrar el usuario. Por favor verifica los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${styles.cardLarge}`}>
                <h2 className={styles.title}>Registro de Usuario</h2>
                <p className={styles.subtitle}>Crea una cuenta completando la siguiente información.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Tipo de Documento *</label>
                            <select
                                name="id_tip_doc"
                                value={formData.id_tip_doc}
                                onChange={handleChange}
                                required
                            >
                                <option value="1">Cédula de Ciudadanía</option>
                                <option value="2">Tarjeta de Identidad</option>
                                <option value="3">Cédula de Extranjería</option>
                                <option value="4">Pasaporte</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Número de Documento *</label>
                            <input
                                type="text"
                                name="doc"
                                value={formData.doc}
                                onChange={handleChange}
                                required
                                className={errors.doc ? styles.inputError : ''}
                            />
                            {errors.doc && <span className={styles.fieldError}>{errors.doc}</span>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Primer Nombre *</label>
                            <input
                                type="text"
                                name="primer_nombre"
                                value={formData.primer_nombre}
                                onChange={handleChange}
                                required
                                className={errors.primer_nombre ? styles.inputError : ''}
                            />
                            {errors.primer_nombre && <span className={styles.fieldError}>{errors.primer_nombre}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Segundo Nombre</label>
                            <input
                                type="text"
                                name="segundo_nombre"
                                value={formData.segundo_nombre}
                                onChange={handleChange}
                                className={errors.segundo_nombre ? styles.inputError : ''}
                            />
                            {errors.segundo_nombre && <span className={styles.fieldError}>{errors.segundo_nombre}</span>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Primer Apellido *</label>
                            <input
                                type="text"
                                name="primer_apellido"
                                value={formData.primer_apellido}
                                onChange={handleChange}
                                required
                                className={errors.primer_apellido ? styles.inputError : ''}
                            />
                            {errors.primer_apellido && <span className={styles.fieldError}>{errors.primer_apellido}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Segundo Apellido</label>
                            <input
                                type="text"
                                name="segundo_apellido"
                                value={formData.segundo_apellido}
                                onChange={handleChange}
                                className={errors.segundo_apellido ? styles.inputError : ''}
                            />
                            {errors.segundo_apellido && <span className={styles.fieldError}>{errors.segundo_apellido}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Teléfono *</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                            className={errors.telefono ? styles.inputError : ''}
                        />
                        {errors.telefono && <span className={styles.fieldError}>{errors.telefono}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Correo Electrónico *</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                            className={errors.correo ? styles.inputError : ''}
                        />
                        {errors.correo && <span className={styles.fieldError}>{errors.correo}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contraseña *</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                            className={errors.contrasena ? styles.inputError : ''}
                        />
                        {errors.contrasena && <span className={styles.fieldError}>{errors.contrasena}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Foto de Rostro * (Para verificación y acceso)</label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleFileChange}
                            required
                        />
                        <small className={styles.infoNote}>
                            Asegúrate de que tu rostro se vea claramente en la foto.
                        </small>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <div className={styles.loginSection}>
                        <span className={styles.loginText}>¿Ya tienes una cuenta? </span>
                        <a href="/login" className={styles.loginLink}>
                            Iniciar Sesión
                        </a>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showSuccessModal}
                onClose={() => navigate('/login')}
                onConfirm={() => navigate('/login')}
                title="Registro Exitoso"
                message="¡Tu cuenta ha sido creada correctamente! Ahora puedes iniciar sesión para acceder a la plataforma."
                confirmText="Continuar al Login"
                variant="success"
                isSingleButton={true}
            />
        </div>
    );
};

export default RegisterUser;
