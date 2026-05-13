import React, { useState } from 'react';

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

  const [jornadasModal, setJornadasModal]   = useState(false);
  const [jornadasTrab, setJornadasTrab]     = useState(null);
  const [jornadasLista, setJornadasLista]   = useState([jornadaVacia()]);
  const [guardandoJorn, setGuardandoJorn]   = useState(false);

  const abrirJornadas = (t) => {
    setJornadasTrab(t);
    setJornadasLista([jornadaVacia()]);
    setJornadasModal(true);
  };

  const agregarFila = () => setJornadasLista((p) => [...p, jornadaVacia()]);

  const actualizarFila = (i, field, val) =>
    setJornadasLista((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const eliminarFila = (i) =>
    setJornadasLista((prev) => prev.filter((_, idx) => idx !== i));

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
        <h2 className="am-section-title">
          Gestión de Personal
          <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>(V_TRABAJADORES_HORAS)</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onLiquidarNomina && (
            <button
              className="am-badge am-info"
              style={{ cursor: liquidandoNomina ? 'not-allowed' : 'pointer', opacity: liquidandoNomina ? 0.6 : 1 }}
              onClick={onLiquidarNomina}
              disabled={liquidandoNomina}
              title="sp_liquidar_nomina"
            >
              {liquidandoNomina ? '⏳ Procesando…' : '💰 Liquidar Nómina del Mes'}
            </button>
          )}
          <button className="am-badge am-success" style={{ cursor: 'pointer' }} onClick={onAdd}>
            + Agregar Trabajador
          </button>
        </div>
      </div>

      {costoNomina !== null && costoNomina !== undefined && (
        <div className="am-card am-p-4" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderLeft: '4px solid #2563eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>💼</span>
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Costo nómina — mes actual (fn_costo_nomina_mes)</p>
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
                        <button
                          className="success"
                          style={{ background: '#0891b2', color: '#fff' }}
                          onClick={() => abrirJornadas(t)}
                          title="sp_registrar_jornadas"
                        >
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

      {/* Modal registrar jornadas — sp_registrar_jornadas */}
      {jornadasModal && jornadasTrab && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="am-card am-p-6" style={{ width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 className="am-card-header" style={{ marginBottom: '16px' }}>
              📋 Registrar Jornadas — {jornadasTrab.nombre}
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 400, marginLeft: '6px' }}>(sp_registrar_jornadas)</span>
            </h3>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
              {jornadasLista.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <input type="date" value={row.fecha} onChange={(e) => actualizarFila(i, 'fecha', e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                  <input type="number" placeholder="Horas" min="0.5" max="24" step="0.5" value={row.horas}
                    onChange={(e) => actualizarFila(i, 'horas', e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                  <input type="text" placeholder="Descripción (opcional)" value={row.descripcion}
                    onChange={(e) => actualizarFila(i, 'descripcion', e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                  <button onClick={() => eliminarFila(i)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>

            <button onClick={agregarFila} style={{ marginBottom: '16px', padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              + Agregar fila
            </button>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="am-badge am-muted" style={{ cursor: 'pointer' }} onClick={() => setJornadasModal(false)}>Cancelar</button>
              <button
                className="am-badge am-success"
                style={{ cursor: guardandoJorn ? 'not-allowed' : 'pointer', opacity: guardandoJorn ? 0.6 : 1 }}
                onClick={submitJornadas}
                disabled={guardandoJorn}
              >
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
