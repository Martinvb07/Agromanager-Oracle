import React, { useState } from 'react';

const estadoClass = (estado) => ({
  Disponible: 'am-success',
  Agotado:    'am-danger',
  Aplicado:   'am-info',
}[estado] || 'am-muted');

const filaVacia = () => ({ fertilizante_id: '', cantidad_kg: '' });

const FertilizantesTable = ({
  fertilizantes,
  stockBajo = [],
  masConsumido,
  parcelas = [],
  onAdd,
  onEdit,
  onDelete,
  onSincronizar,
  sincronizando,
  onAplicarLote,
}) => {
  const [loteModal, setLoteModal]     = useState(false);
  const [parcelaId, setParcelaId]     = useState('');
  const [fecha, setFecha]             = useState(new Date().toISOString().slice(0, 10));
  const [filas, setFilas]             = useState([filaVacia()]);
  const [aplicando, setAplicando]     = useState(false);

  const agregarFila = () => setFilas((p) => [...p, filaVacia()]);
  const eliminarFila = (i) => setFilas((p) => p.filter((_, idx) => idx !== i));
  const actualizarFila = (i, field, val) =>
    setFilas((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const submitLote = async () => {
    if (!parcelaId) return window.alert('Seleccioná una parcela');
    const items = filas.filter((r) => r.fertilizante_id && Number(r.cantidad_kg) > 0)
      .map((r) => ({ fertilizante_id: Number(r.fertilizante_id), cantidad_kg: Number(r.cantidad_kg) }));
    if (!items.length) return window.alert('Agregá al menos un fertilizante con cantidad válida');
    setAplicando(true);
    try {
      await onAplicarLote(Number(parcelaId), items, fecha);
      setLoteModal(false);
      setFilas([filaVacia()]);
    } finally {
      setAplicando(false);
    }
  };

  return (
    <div className="am-space-6">
      <div className="am-section-head mb-6">
        <h2 className="am-section-title">Fertilizantes</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="am-badge am-warning"
            style={{ cursor: sincronizando ? 'not-allowed' : 'pointer', opacity: sincronizando ? 0.6 : 1 }}
            onClick={onSincronizar}
            disabled={sincronizando}
            title="sp_sincronizar_stock"
          >
            {sincronizando ? '⏳ Sincronizando…' : '🔄 Sincronizar Stock'}
          </button>
          <button
            className="am-badge am-info"
            style={{ cursor: 'pointer' }}
            onClick={() => { setParcelaId(''); setFilas([filaVacia()]); setLoteModal(true); }}
            title="sp_aplicar_fertilizantes"
          >
            🌿 Aplicar en Lote
          </button>
          <button className="am-badge am-success" style={{ cursor: 'pointer' }} onClick={onAdd}>
            + Nuevo
          </button>
        </div>
      </div>

      {/* V_STOCK_BAJO */}
      {stockBajo.length > 0 && (
        <div className="am-card am-p-4" style={{ background: 'linear-gradient(135deg,#fef2f2,#fee2e2)', borderLeft: '4px solid #dc2626' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>
            ⚠️ {stockBajo.length} fertilizante{stockBajo.length > 1 ? 's' : ''} bajo el mínimo
            <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 400, marginLeft: '6px' }}>(V_STOCK_BAJO)</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {stockBajo.map((f) => (
              <span key={f.id} style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', color: '#7f1d1d' }}>
                {f.nombre}: {f.stock_kg} kg (mín. {f.stock_minimo} kg)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* fn_fertilizante_mas_consumido */}
      {masConsumido && (
        <div className="am-card am-p-4" style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderLeft: '4px solid #16a34a', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>🏆</span>
          <div>
            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
              Más consumido (últimos 30 días) <span style={{ fontWeight: 400 }}>(fn_fertilizante_mas_consumido)</span>
            </p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>
              {masConsumido.fertilizante || masConsumido.nombre}
              {masConsumido.stock_kg !== undefined && (
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#374151', marginLeft: '8px' }}>
                  — Stock: {masConsumido.stock_kg} kg
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="am-card" style={{ overflow: 'hidden' }}>
        <div className="am-table-wrapper">
          <table className="am-table">
            <thead className="head-green">
              <tr>
                <th>Fertilizante</th>
                <th>Stock (kg)</th>
                <th>Stock Mínimo</th>
                <th>Costo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fertilizantes.map((item) => (
                <tr key={item.id}>
                  <td>{item.fertilizante || item.nombre}</td>
                  <td>
                    <span style={{ color: item.stock_kg <= item.stock_minimo ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                      {item.stock_kg ?? '-'} kg
                    </span>
                  </td>
                  <td>{item.stock_minimo ?? '-'} kg</td>
                  <td>${Number(item.costo || 0).toLocaleString()}</td>
                  <td>
                    <span className={`am-badge ${estadoClass(item.estado)}`}>{item.estado || 'Disponible'}</span>
                  </td>
                  <td className="am-actions">
                    <button className="success" onClick={() => onEdit && onEdit(item)}>Editar</button>
                    <button className="danger" onClick={() => onDelete && onDelete(item.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal aplicar en lote — sp_aplicar_fertilizantes */}
      {loteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="am-card am-p-6" style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto' }}>
            <h3 className="am-card-header" style={{ marginBottom: '16px' }}>
              🌿 Aplicar Fertilizantes en Lote
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 400, marginLeft: '6px' }}>(sp_aplicar_fertilizantes)</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Parcela *</label>
                <select
                  value={parcelaId}
                  onChange={(e) => setParcelaId(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
                >
                  <option value="">Seleccionar parcela…</option>
                  {parcelas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Fecha de aplicación</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>FERTILIZANTE</span>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>CANTIDAD (kg)</span>
                <span />
              </div>
              {filas.map((fila, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={fila.fertilizante_id}
                    onChange={(e) => actualizarFila(i, 'fertilizante_id', e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                  >
                    <option value="">Seleccionar…</option>
                    {fertilizantes.filter((f) => f.estado !== 'Agotado').map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fertilizante || f.nombre} ({f.stock_kg} kg disp.)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="kg"
                    value={fila.cantidad_kg}
                    onChange={(e) => actualizarFila(i, 'cantidad_kg', e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                  />
                  <button
                    onClick={() => eliminarFila(i)}
                    style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >✕</button>
                </div>
              ))}
            </div>

            <button
              onClick={agregarFila}
              style={{ marginBottom: '16px', padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              + Agregar fertilizante
            </button>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="am-badge am-muted" style={{ cursor: 'pointer' }} onClick={() => setLoteModal(false)}>
                Cancelar
              </button>
              <button
                className="am-badge am-success"
                style={{ cursor: aplicando ? 'not-allowed' : 'pointer', opacity: aplicando ? 0.6 : 1 }}
                onClick={submitLote}
                disabled={aplicando}
              >
                {aplicando ? '⏳ Aplicando…' : 'Aplicar en Lote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizantesTable;
