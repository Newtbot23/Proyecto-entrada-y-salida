import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../../config/api';

interface Registro {
    fecha: string;
    hora_entrada: string;
    hora_salida?: string | null;
}

interface Aprendiz {
    doc: string;
    nombres: string;
    apellidos: string;
    foto_perfil: string | null;
    registros_del_mes: Registro[];
}

interface AsistenciaMensualData {
    success: boolean;
    ficha: {
        id: number;
        numero_ficha: number;
        hora_limite_llegada: string;
    };
    aprendices: Aprendiz[];
}

interface AsistenciaBaseData {
    id_ficha: number;
    numero_ficha: number;
    hora_limite_llegada: string;
}

const COLORS = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
    grayLight: '#f3f4f6',
    grayMedium: '#e5e7eb',
    grayDark: '#9ca3af',
    textMain: '#1f2937',
    textMuted: '#6b7280',
    white: '#ffffff',
    bgApp: '#f9fafb'
};

const AsistenciaFicha: React.FC = () => {
    const [idFicha, setIdFicha] = useState<number | null>(null);
    const [horaLimite, setHoraLimite] = useState('07:15');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingBase, setIsLoadingBase] = useState(true);

    const now = new Date();
    const [mes, setMes] = useState(now.getMonth() + 1);
    const [anio, setAnio] = useState(now.getFullYear());
    const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
    const [isLoadingAsistencia, setIsLoadingAsistencia] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const data = await apiClient.get<AsistenciaBaseData>('/instructor/asistencia-base');
                if (data) {
                    setIdFicha(data.id_ficha);
                    if (data.hora_limite_llegada) {
                        setHoraLimite(data.hora_limite_llegada.substring(0, 5));
                    }
                }
            } catch (error) {
                toast.error("No se pudieron cargar los datos.");
            } finally {
                setIsLoadingBase(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchAsistencia = async () => {
            setIsLoadingAsistencia(true);
            try {
                const response = await apiClient.get<AsistenciaMensualData>(
                    `/instructor/asistencia-mensual?mes=${mes}&anio=${anio}`
                );
                if (response.success) {
                    setAprendices(response.aprendices);
                    if (response.ficha.hora_limite_llegada) {
                        setHoraLimite(response.ficha.hora_limite_llegada.substring(0, 5));
                    }
                }
            } catch (error) {
                toast.error("Error al cargar asistencia.");
            } finally {
                setIsLoadingAsistencia(false);
            }
        };

        if (!isLoadingBase) {
            fetchAsistencia();
        }
    }, [mes, anio, isLoadingBase]);

    const handleSaveConfig = async () => {
        if (!idFicha) return;
        setIsSaving(true);
        try {
            await apiClient.patch(`/fichas/${idFicha}/hora-limite`, { 
                hora_limite_llegada: horaLimite 
            });
            toast.success("Configuración guardada.");
        } catch (error) {
            toast.error("Error al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleMonth = (dir: number) => {
        let newMes = mes + dir;
        let newAnio = anio;
        if (newMes > 12) { newMes = 1; newAnio++; }
        if (newMes < 1) { newMes = 12; newAnio--; }
        setMes(newMes);
        setAnio(newAnio);
    };

    const renderCalendar = (aprendiz: Aprendiz) => {
        const daysInMonth = new Date(anio, mes, 0).getDate();
        const firstDayOfMonth = new Date(anio, mes - 1, 1).getDay();
        const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginTop: '15px', maxWidth: '350px' }}>
                {['D','L','M','M','J','V','S'].map((d, i) => (
                    <div key={i} style={{ fontSize: '10px', color: COLORS.grayDark, fontWeight: 'bold', textAlign: 'center' }}>{d}</div>
                ))}
                {blanks.map(b => <div key={`b-${b}`} style={{ width: '30px', height: '30px' }}></div>)}
                {days.map(day => {
                    const dateStr = `${anio}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayOfWeek = new Date(anio, mes - 1, day).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const registro = aprendiz.registros_del_mes.find(r => r.fecha === dateStr);
                    
                    let bg = COLORS.grayLight;
                    let text = COLORS.textMain;

                    if (isWeekend) {
                        bg = '#f9fafb';
                        text = '#ccc';
                    } else if (!registro) {
                        const today = new Date();
                        const currentDayDate = new Date(anio, mes - 1, day);
                        bg = currentDayDate < today ? COLORS.red : COLORS.grayLight;
                        text = currentDayDate < today ? '#fff' : COLORS.textMain;
                    } else {
                        const entry = registro.hora_entrada.substring(0, 5);
                        bg = entry <= horaLimite ? COLORS.green : COLORS.yellow;
                        text = '#fff';
                    }

                    return (
                        <div key={day} style={{ 
                            width: '32px', height: '32px', backgroundColor: bg, color: text,
                            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 'bold'
                        }}>
                            {day}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (isLoadingBase) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Cargando...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: COLORS.bgApp }}>
            <div style={{ display: 'flex', justifyContent: 'base-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '24px', color: COLORS.textMain }}>Asistencia de Instructores</h1>
                    <p style={{ color: COLORS.textMuted, fontSize: '14px', marginTop: '5px' }}>Ficha: <strong>{idFicha}</strong></p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px 15px', borderRadius: '10px', border: `1px solid ${COLORS.grayMedium}` }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: COLORS.textMuted }}>LÍMITE ENTRADA:</span>
                    <input type="time" value={horaLimite} onChange={e => setHoraLimite(e.target.value)} style={{ padding: '5px', borderRadius: '5px', border: `1px solid ${COLORS.grayLight}` }} />
                    <button onClick={handleSaveConfig} style={{ padding: '6px 15px', backgroundColor: COLORS.green, color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isSaving ? '...' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '18px', color: COLORS.textMain }}>Aprendices ({aprendices.length})</h2>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: `1px solid ${COLORS.grayMedium}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <button onClick={() => toggleMonth(-1)} style={{ padding: '8px 15px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>❮</button>
                    <div style={{ padding: '8px 20px', fontWeight: 'bold', fontSize: '14px', borderLeft: `1px solid ${COLORS.grayLight}`, borderRight: `1px solid ${COLORS.grayLight}`, minWidth: '150px', textAlign: 'center', textTransform: 'capitalize' }}>
                        {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(anio, mes - 1))}
                    </div>
                    <button onClick={() => toggleMonth(1)} style={{ padding: '8px 15px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>❯</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isLoadingAsistencia ? <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Actualizando calendario...</div> : 
                 aprendices.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No hay aprendices.</div> :
                 aprendices.map(ap => (
                    <div key={ap.doc} style={{ backgroundColor: '#fff', border: `1px solid ${COLORS.grayMedium}`, borderRadius: '10px', overflow: 'hidden' }}>
                        <div onClick={() => setExpandedId(expandedId === ap.doc ? null : ap.doc)} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', 
                            cursor: 'pointer', backgroundColor: expandedId === ap.doc ? '#f0fdf4' : '#fff', transition: '0.2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: COLORS.grayLight, overflow: 'hidden', border: '1px solid #ddd' }}>
                                    {ap.foto_perfil ? <img src={ap.foto_perfil} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: 'bold', color: '#999' }}>{ap.nombres[0]}</div>}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 'bold', color: COLORS.textMain }}>{ap.nombres} {ap.apellidos}</div>
                                    <div style={{ fontSize: '11px', color: COLORS.textMuted }}>CC: {ap.doc}</div>
                                </div>
                            </div>
                            <svg style={{ width: '20px', height: '20px', color: '#ccc', transform: expandedId === ap.doc ? 'rotate(180deg)' : 'none', transition: '0.3s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        
                        {expandedId === ap.doc && (
                            <div style={{ padding: '20px', backgroundColor: '#fafafa', borderTop: `1px solid ${COLORS.grayLight}`, display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                                <div style={{ flex: '1 1 200px', textAlign: 'center' }}>
                                    <div style={{ width: '120px', height: '120px', margin: '0 auto 15px', borderRadius: '20px', backgroundColor: '#fff', border: '3px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                        {ap.foto_perfil ? <img src={ap.foto_perfil} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                                         <div style={{ height: '100%', fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eee' }}>{ap.nombres[0]}</div>}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>{ap.nombres}</h3>
                                    <div style={{ fontSize: '12px', color: COLORS.green, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' }}>{ap.apellidos}</div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                                        <div><span style={{ fontSize: '10px', color: '#999', display: 'block' }}>ASISTENCIAS</span> <strong style={{ color: COLORS.green }}>{ap.registros_del_mes.length}</strong></div>
                                        <div><span style={{ fontSize: '10px', color: '#999', display: 'block' }}>TARDANZAS</span> <strong style={{ color: COLORS.yellow }}>{ap.registros_del_mes.filter(r => r.hora_entrada.substring(0, 5) > horaLimite).length}</strong></div>
                                    </div>
                                </div>
                                <div style={{ flex: '2 1 400px' }}>
                                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: `1px solid ${COLORS.grayMedium}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: COLORS.grayDark, textTransform: 'uppercase' }}>HISTORIAL MENSUAL</span>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#999' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS.green }}></div>OK</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#999' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS.yellow }}></div>LATE</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#999' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS.red }}></div>FAIL</div>
                                            </div>
                                        </div>
                                        {renderCalendar(ap)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 ))
                }
            </div>

            <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#111827', borderRadius: '20px', color: '#fff' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '3px', height: '20px', backgroundColor: COLORS.green }}></div> Guía de Colores
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS.green }}></div> <strong style={{ fontSize: '14px' }}>Puntual</strong></div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Llegó a tiempo (antes de {horaLimite}).</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS.yellow }}></div> <strong style={{ fontSize: '14px' }}>Retraso</strong></div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Llegó después de la hora límite permitida.</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS.red }}></div> <strong style={{ fontSize: '14px' }}>Falta</strong></div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Día laboral pasado sin registro de entrada.</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f9fafb' }}></div> <strong style={{ fontSize: '14px' }}>Libre</strong></div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Fines de semana o días sin actividad requerida.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsistenciaFicha;
