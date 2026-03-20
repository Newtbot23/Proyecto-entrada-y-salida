import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../config/api';
import styles from './EquiposAsignados.module.css';

interface EquipoAsignado {
    usuario_doc: string;
    nombre_completo: string;
    serial: string;
    tipo_equipo: string;
    placa_sena: string;
    modelo: string;
    tipo_equipo_desc: string;
}

interface InstructorEquiposResponse {
    ficha: {
        id: number;
        numero_ficha: number;
    };
    equipos: EquipoAsignado[];
}

const fetchEquiposFiltrados = async (): Promise<InstructorEquiposResponse> => {
    // apiClient.get automatically unwraps { data: ... }
    return await apiClient.get<InstructorEquiposResponse>('/instructor/equipos-asignados');
};

const EquiposAsignados: React.FC = () => {
    const { data: responseData, isLoading, error } = useQuery({
        queryKey: ['instructorEquiposAsignados'],
        queryFn: fetchEquiposFiltrados,
    });

    if (isLoading) {
        return <div className={styles.loading}>Cargando información de equipos...</div>;
    }

    if (error || !responseData) {
        return (
            <div className={styles.noResults}>
                <h2>Atención</h2>
                <p>{(error as any)?.response?.data?.message || 'Hubo un error al cargar la información. Probablemente no tienes una ficha asignada como instructor.'}</p>
            </div>
        );
    }

    const { equipos, ficha } = responseData;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Equipos Asignados - Ficha {ficha.numero_ficha}</h1>
                <p>Lista de todos los equipos asociados a los aprendices de tu ficha.</p>
            </header>

            <div className={styles.infoCard}>
                <span>📘</span>
                <span>Ficha Activa:</span> {ficha.numero_ficha}
            </div>

            <div className={styles.tableContainer}>
                {equipos.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Aprendiz</th>
                                <th>Tipo de Equipo</th>
                                <th>Detalle Placa/Serial</th>
                                <th>Modelo</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos.map((equipo, index) => (
                                <tr key={index}>
                                    <td>
                                        <strong>{equipo.nombre_completo}</strong>
                                        <br />
                                        <small style={{ color: '#6b7280' }}>CC: {equipo.usuario_doc}</small>
                                    </td>
                                    <td>
                                        <span className={`${styles.typeBadge} ${equipo.tipo_equipo === 'sena' ? styles.typeSena : styles.typePropio}`}>
                                            {equipo.tipo_equipo === 'sena' ? 'SENA' : 'PROPIO'}
                                        </span>
                                    </td>
                                    <td>
                                        {equipo.tipo_equipo === 'sena' ? (
                                            <>
                                                <strong>Placa:</strong> {equipo.placa_sena} <br />
                                            </>
                                        ) : null}
                                        <strong>Serial:</strong> {equipo.serial}
                                    </td>
                                    <td>{equipo.modelo || 'N/A'}</td>
                                    <td>{equipo.tipo_equipo_desc || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.noResults}>
                        <p>No se encontraron equipos asignados a los aprendices de esta ficha.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquiposAsignados;
