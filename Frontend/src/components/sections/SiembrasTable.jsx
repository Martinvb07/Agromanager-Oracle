import React from 'react';

const estadoClass = (estado) => ({
  Activa:    'am-success',
  Cosechada: 'am-info',
  Perdida:   'am-danger',
}[estado] || 'am-muted');

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const SiembrasTable = ({ siembras = [], onRegistrarInversiones }) => (
  <div className="am-space-6">
    <div className="am-section-head mb-6">
      <h2 className="am-section-title">
        Siembras
        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>(V_SIEMBRAS_RESUMEN)</span>
      </h2>
    </div>

    {siembras.length === 0 ? (
      <div className="am-card am-p-6" style={{ textAlign: 'center', color: '#6b7280' }}>
        No hay siembras registradas.
      </div>
    ) : (
      <div className="am-card" style={{ overflow: 'hidden' }}>
        <div className="am-table-wrapper">
          <table className="am-table">
            <thead className="head-green">
              <tr>
                <th>Parcela</th>
                <th>Tipo Semilla</th>
                <th>Fecha Siembra</th>
                <th>Cantidad (kg)</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Inversión Total</th>
                <th>Fertilizante (kg)</th>
                {onRegistrarInversiones && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {siembras.map((s) => (
                <tr key={s.id}>
                  <td>{s.parcela ?? '-'}</td>
                  <td>{s.tipoSemilla ?? '-'}</td>
                  <td>{s.fechaSiembra ? String(s.fechaSiembra).slice(0, 10) : '-'}</td>
                  <td>{s.cantidadKg ?? '-'} kg</td>
                  <td>{s.proveedor ?? '-'}</td>
                  <td>
                    <span className={`am-badge ${estadoClass(s.estado)}`}>{s.estado ?? '-'}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1d4ed8' }}>
                    {COP.format(Number(s.inversionTotal ?? 0))}
                  </td>
                  <td>{s.fertilizanteKg ?? 0} kg</td>
                  {onRegistrarInversiones && (
                    <td className="am-actions">
                      <button
                        className="primary"
                        title="sp_registrar_inversiones"
                        onClick={() => onRegistrarInversiones(s)}
                      >
                        + Inversión
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

export default SiembrasTable;
