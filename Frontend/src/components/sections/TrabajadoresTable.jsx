import React, { useState } from 'react';
import { Briefcase, Plus, X, ClipboardList } from 'lucide-react';

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const jornadaVacia = () => ({ fecha: new Date().toISOString().slice(0, 10), horas: '', descripcion: '' });

const TrabajadoresTable = ({
  trabajadores,
  calcularLiquidacion,
  costoNomina,
  onAdd,
  onEdit,
  onDelete,
  onLiquidar,
  onLiquidarNomina,
  liquidandoNomina,
  onRegistrarJornadas,
}) => {
  const estadoClass = (estado) => (estado === 'Activo' ? 'am-success' : 'am-muted');

  const [jornadasModal, setJornadasModal] = useState(false);
  const [jornadasTrab, setJornadasTrab]   = useState(null);
  const [jornadasLista, setJornadasLista] = useState([jornadaVacia()]);
  const [guardandoJorn, setGuardandoJorn] = useState(false);

  const abrirJornadas = (t) => {
    setJornadasTrab(t);
    setJornadasLista([jornadaVacia()]);
    setJornadasModal(true);
  };

  const agregarFila    = () => setJornadasLista((p) => [...p, jornadaVacia()]);
  const eliminarFila   = (i) => setJornadasLista((p) => p.filter((_, idx) => idx !== i));
  const actualizarFila = (i, field, val) =>
    setJornadasLista((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const submitJornadas = async () => {
    const lista = jornadasLista
      .filter((r) => r.horas && Number(r.horas) > 0)
      .map((r) => ({ fecha: r.fecha, horas: Number(r.horas), descripcion: r.descripcion || null }));
    if (!lista.length) return window.alert('Ingresá al menos una jornada con horas válidas');
    setGuardandoJorn(true);
    try {
      await onRegistrarJornadas(jornadasTrab.id, lista);
      setJornadasModal(false);
    } finally {
      setGuardandoJorn(false);
    }
  };

  return (
    <div className="am-space-6">
      <div className="am-section-head mb-6">
        <h2 className="am-section-title">Gestión de Personal</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onLiquidarNomina && (
            <button
              className="am-badge am-info"
              style={{ cursor: liquidandoNomina ? 'not-allowed' : 'pointer', opacity: liquidandoNomina ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}
              onClick={onLiquidarNomina}
              disabled={liquidandoNomina}
            >
              <ClipboardList size={13} />
              {liquidandoNomina ? 'Procesando…' : 'Liquidar Nómina del Mes'}
            </button>
          )}
          <button className="am-badge am-success" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={onAdd}>
            <Plus size={13} />
            Agregar Trabajador
          </button>
        </div>
      </div>

      {costoNomina !== null && costoNomina !== undefined && (
        <div className="am-card am-p-4" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderLeft: '4px solid #2563eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Briefcase size={20} color="#1d4ed8" />
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Costo nómina — mes actual</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#1d4ed8' }}>{COP.format(costoNomina)}</p>
          </div>
        </div>
      )}

      <div className="am-card" style={{ overflow: 'hidden' }}>
        <div className="am-table-wrapper">
          <table className="am-table">
            <thead className="head-blue">
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Salario</th>
                <th>Horas (mes)</th>
                <th>Horas (total)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trabajadores.map((t) => {
                const liq = calcularLiquidacion ? calcularLiquidacion(t) : null;
                return (
                  <tr key={t.id}>
                    <td>{t.nombre}</td>
                    <td>{t.cargo}</td>
                    <td>{COP.format(t.salario)}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>
                        {t.horasMesActual ?? t.horasTrabajadas ?? '-'}h
                      </span>
                    </td>
                    <td>{t.horasTotales ?? '-'}h</td>
                    <td><span className={`am-badge ${estadoClass(t.estado)}`}>{t.estado}</span></td>
                    <td className="am-actions">
                      <button className="primary" onClick={() => onEdit && onEdit(t)}>Editar</button>
                      {onRegistrarJornadas && (
                        <button className="success" style={{ background: '#0891b2', color: '#fff' }} onClick={() => abrirJornadas(t)}>
                          + Jornadas
                        </button>
                      )}
                      {liq && (
                        <button className="success" onClick={() => onLiquidar ? onLiquidar(t, liq) : null}>
                          Liquidar
                        </button>
                      )}
                      <button className="danger" onClick={() => onDelete && onDelete(t.id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal registrar jornadas */}
      {jornadasModal && jornadasTrab && (
        <div className="am-modal-backdrop" style={{ alignItems: 'center', overflowY: 'auto', padding: '20px 0' }}>
          <div className="am-modal" style={{ maxWidth: '580px', width: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="am-modal-title" style={{ margin: 0 }}>Registrar Jornadas — {jornadasTrab.nombre}</h3>
              <button onClick={() => setJornadasModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            <div className="am-modal-body">
              <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                {jornadasLista.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr 36px', gap: '8px', alignItems: 'center' }}>
                    <input type="date" value={row.fecha}
                      onChange={(e) => actualizarFila(i, 'fecha', e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <input type="number" placeholder="Horas" min="0.5" max="24" step="0.5" value={row.horas}
                      onChange={(e) => actualizarFila(i, 'horas', e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <input type="text" placeholder="Descripción (opcional)" value={row.descripcion}
                      onChange={(e) => actualizarFila(i, 'descripcion', e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                    <button onClick={() => eliminarFila(i)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={agregarFila}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <Plus size={13} /> Agregar fila
              </button>
            </div>

            <div className="am-modal-actions">
              <button type="button" className="am-btn am-btn-ghost" onClick={() => setJornadasModal(false)}>Cancelar</button>
              <button type="button" className="am-btn am-btn-primary"
                style={{ opacity: guardandoJorn ? 0.6 : 1 }}
                onClick={submitJornadas} disabled={guardandoJorn}>
                {guardandoJorn ? 'Guardando…' : 'Guardar Jornadas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrabajadoresTable;
