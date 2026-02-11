import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Registration.module.css';

const RegisterEntity: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planId } = (location.state as { planId?: string }) || {};

    const [formData, setFormData] = useState({
        nombre_entidad: '',
        correo: '',
        direccion: '',
        nombre_titular: '',
        telefono: '',
        nit: '',
    });

    useEffect(() => {
        if (!planId) {
            // If no plan is selected, redirect back to plans
            navigate('/plans');
        }
    }, [planId, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // In the new unified flow (Phase 14), we collect data and only 
        // submit it at the final step to ensure transactional integrity.
        navigate('/register-admin', {
            state: {
                planId,
                entityData: formData
            }
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Entity Registration</h2>
                <p className={styles.subtitle}>Selected Plan ID: {planId}</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Entity Name</label>
                        <input
                            type="text"
                            name="nombre_entidad"
                            value={formData.nombre_entidad}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Address</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Legal Representative Name</label>
                        <input
                            type="text"
                            name="nombre_titular"
                            value={formData.nombre_titular}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input
                            type="number"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>NIT</label>
                        <input
                            type="number"
                            name="nit"
                            value={formData.nit}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        {'Next: Register Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterEntity;