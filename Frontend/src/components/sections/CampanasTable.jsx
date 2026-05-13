import React from 'react';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const CampanasTable = ({ campanas, onAdd, onEdit, onDelete, onCerrar, cerrando }) => (
  <div className="am-space-6">
    <div className="am-section-head mb-6">
      <h2 className="am-section-title">Campañas Agrícolas</h2>
      <button className="am-badge am-success" style={{ cursor: 'pointer' }} onClick={onAdd}>
        + Nueva Campaña
      </button>
    </div>
    <div className="am-card" style={{ overflow: 'hidden' }}>
      <div className="am-table-wrapper">
        <table className="am-table">
          <thead className="head-violet">
            <tr>
              <th>Nombre</th>
              <th>Periodo</th>
              <th>Hectáreas</th>
              <th>Lotes</th>
              <th>Egresos</th>
              <th>Ingresos</th>
              <th>Rend. / ha</th>
              <th>Producción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campanas.map((c) => {
              const isActive = new Date() <= new Date(c.fechaFin);
              const isCerrando = cerrando === c.id;
              return (
                <tr key={c.id}>
                  <td>
                    <span>{c.nombre}</span>
                    {isActive && (
                      <span
                        className="am-badge am-success"
                        style={{ marginLeft: '6px', fontSize: '10px', padding: '2px 6px' }}
                      >
                        Activa
                      </span>
                    )}
                  </td>
                  <td>
                    {formatDate(c.fechaInicio)} → {formatDate(c.fechaFin)}
                  </td>
                  <td>{c.hectareas ?? '-'} ha</td>
                  <td>{c.lotes ?? '-'}</td>
                  <td>${Number(c.egresosTotal || 0).toLocaleString()}</td>
                  <td>${Number(c.ingresoTotal || 0).toLocaleString()}</td>
                  <td>{c.rendimientoHa ?? '-'} t/ha</td>
                  <td>{c.produccionTotal ?? '-'} t</td>
                  <td className="am-actions">
                    <button className="primary" onClick={() => onEdit(c)}>
                      Ver
                    </button>
                    {isActive && onCerrar && (
                      <button
                        className="warning"
                        style={{ background: '#f59e0b', color: '#fff', opacity: isCerrando ? 0.6 : 1 }}
                        disabled={isCerrando}
                        onClick={() => onCerrar(c.id)}
                        title="Ejecuta sp_cerrar_campana en Oracle"
                      >
                        {isCerrando ? '⏳' : 'Cerrar'}
                      </button>
                    )}
                    <button className="danger" onClick={() => onDelete(c.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default CampanasTable;
