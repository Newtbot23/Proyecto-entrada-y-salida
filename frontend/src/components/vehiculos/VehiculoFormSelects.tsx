/**
 * VehiculoFormSelects.tsx
 *
 * Ejemplo de selects dependientes para el registro de vehículos.
 * Al seleccionar un "Tipo de Vehículo", el select de "Marca" se filtra
 * automáticamente con las marcas que pertenecen a ese tipo.
 *
 * Uso dentro de cualquier formulario:
 *   <VehiculoFormSelects
 *     catalogs={catalogs}          // UserDashboardCatalog desde /api/user/catalogs
 *     idTipoVehiculo={form.id_tipo_vehiculo}
 *     idMarca={form.id_marca}
 *     onTipoChange={(id) => setForm(f => ({ ...f, id_tipo_vehiculo: id, id_marca: 0 }))}
 *     onMarcaChange={(id) => setForm(f => ({ ...f, id_marca: id }))}
 *   />
 */

import React, { useMemo } from 'react';
import type { UserDashboardCatalog } from '../../types';

interface VehiculoFormSelectsProps {
    /** Catálogo completo devuelto por GET /api/user/catalogs */
    catalogs: UserDashboardCatalog;
    /** Valor actual del tipo seleccionado (0 = sin selección) */
    idTipoVehiculo: number;
    /** Valor actual de la marca seleccionada (0 = sin selección) */
    idMarca: number;
    /** Callback cuando cambia el tipo */
    onTipoChange: (id: number) => void;
    /** Callback cuando cambia la marca */
    onMarcaChange: (id: number) => void;
    /** Estilos opcionales */
    className?: string;
}

const VehiculoFormSelects: React.FC<VehiculoFormSelectsProps> = ({
    catalogs,
    idTipoVehiculo,
    idMarca,
    onTipoChange,
    onMarcaChange,
    className = '',
}) => {
    /**
     * Filtra las marcas del catálogo según el tipo seleccionado.
     * Se recalcula sólo cuando cambia idTipoVehiculo o el catálogo.
     */
    const marcasFiltradas = useMemo(() => {
        if (!idTipoVehiculo) return [];
        return catalogs.marcas_vehiculo.filter(
            (m) => m.id_tipo_vehiculo === idTipoVehiculo
        );
    }, [idTipoVehiculo, catalogs.marcas_vehiculo]);

    const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoTipo = Number(e.target.value);
        // Al cambiar el tipo, resetear la marca para forzar una nueva selección
        onTipoChange(nuevoTipo);
    };

    const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onMarcaChange(Number(e.target.value));
    };

    return (
        <div className={`vehiculo-selects ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── SELECT 1: Tipo de Vehículo ── */}
            <div className="form-group">
                <label htmlFor="sel-tipo-vehiculo" style={labelStyle}>
                    Tipo de Vehículo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                    id="sel-tipo-vehiculo"
                    value={idTipoVehiculo || ''}
                    onChange={handleTipoChange}
                    style={selectStyle}
                    required
                >
                    <option value="">— Seleccione un tipo —</option>
                    {catalogs.tipos_vehiculo.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.tipo_vehiculo}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── SELECT 2: Marca (dependiente del tipo) ── */}
            <div className="form-group">
                <label htmlFor="sel-marca-vehiculo" style={labelStyle}>
                    Marca <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                    id="sel-marca-vehiculo"
                    value={idMarca || ''}
                    onChange={handleMarcaChange}
                    disabled={!idTipoVehiculo}
                    style={{
                        ...selectStyle,
                        opacity: !idTipoVehiculo ? 0.5 : 1,
                        cursor: !idTipoVehiculo ? 'not-allowed' : 'pointer',
                    }}
                    required
                >
                    <option value="">
                        {idTipoVehiculo
                            ? marcasFiltradas.length === 0
                                ? '— Sin marcas disponibles —'
                                : '— Seleccione una marca —'
                            : '— Primero seleccione el tipo —'}
                    </option>
                    {marcasFiltradas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                            {marca.nombre}
                        </option>
                    ))}
                </select>
                {idTipoVehiculo && marcasFiltradas.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                        No hay marcas registradas para este tipo de vehículo.
                    </p>
                )}
            </div>
        </div>
    );
};

/* ── Estilos inline base (adaptar a los módulos CSS del proyecto) ── */
const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.375rem',
};

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    fontSize: '0.95rem',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s ease',
};

export default VehiculoFormSelects;


/* ═══════════════════════════════════════════════════════════════════════════════
 * EJEMPLO DE INTEGRACIÓN en un formulario de registro de vehículo
 * (fragmento ilustrativo — adaptar al componente real del proyecto)
 * ───────────────────────────────────────────────────────────────────────────── *

import React, { useState, useEffect } from 'react';
import { getCatalogs } from '../../services/userDashboardService';
import type { UserDashboardCatalog } from '../../types';
import VehiculoFormSelects from './VehiculoFormSelects';

interface FormState {
    placa: string;
    id_tipo_vehiculo: number;
    id_marca: number;           // ← ahora es FK, ya no texto libre
    modelo: string;
    color: string;
    descripcion: string;
}

const initialForm: FormState = {
    placa: '',
    id_tipo_vehiculo: 0,
    id_marca: 0,
    modelo: '',
    color: '',
    descripcion: '',
};

const RegistrarVehiculoForm: React.FC = () => {
    const [catalogs, setCatalogs] = useState<UserDashboardCatalog | null>(null);
    const [form, setForm] = useState<FormState>(initialForm);

    useEffect(() => {
        getCatalogs().then(setCatalogs);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // POST /api/user/vehiculos
        // Body: { placa, id_tipo_vehiculo, id_marca, modelo, color, descripcion, ... }
        console.log('Enviar formulario:', form);
    };

    if (!catalogs) return <p>Cargando catálogos...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Placa"
                value={form.placa}
                onChange={e => setForm(f => ({ ...f, placa: e.target.value }))}
                required
            />

            // ── Selects dependientes ──
            <VehiculoFormSelects
                catalogs={catalogs}
                idTipoVehiculo={form.id_tipo_vehiculo}
                idMarca={form.id_marca}
                onTipoChange={(id) => setForm(f => ({ ...f, id_tipo_vehiculo: id, id_marca: 0 }))}
                onMarcaChange={(id) => setForm(f => ({ ...f, id_marca: id }))}
            />

            <input
                placeholder="Modelo"
                value={form.modelo}
                onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                required
            />
            <input
                placeholder="Color"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                required
            />
            <button type="submit" disabled={!form.id_tipo_vehiculo || !form.id_marca}>
                Registrar Vehículo
            </button>
        </form>
    );
};

export default RegistrarVehiculoForm;

* ═══════════════════════════════════════════════════════════════════════════════
*/
