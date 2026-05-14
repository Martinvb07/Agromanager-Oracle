import { Truck, Users, Pencil, Trash2 } from 'lucide-react';
import { fmtDate } from '../../utils/fmt.js';

const estadoClass = (estado) => ({
  'Operativo':         'am-success',
  'En mantenimiento':  'am-warning',
  'Fuera de servicio': 'am-danger',
}[estado] || 'am-muted');

const btnBase = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '7px 14px', borderRadius: '8px', border: 'none',
  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  transition: 'opacity 0.15s',
};

const MaquinariaGrid = ({ maquinaria, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div className="am-section-head mb-6">
      <h2 className="am-section-title">Gestión de Maquinaria</h2>
      <button className="am-badge am-warning" style={{ cursor: 'pointer' }} onClick={onAdd}>
        + Registrar Maquinaria
      </button>
    </div>

    <div className="am-grid am-grid-2-md" style={{ gap: '16px' }}>
      {maquinaria.map((maq) => (
        <div key={maq.id} className="am-card" style={{ padding: '20px' }}>

          {/* Ícono + estado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div className="am-badge am-muted" style={{ background: '#ffedd5', color: '#9a3412' }}>
              <Truck className="am-icon-lg" />
            </div>
            <span className={`am-badge ${estadoClass(maq.estado)}`}>{maq.estado}</span>
          </div>

          {/* Nombre y tipo */}
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{maq.nombre}</h3>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '12px' }}>{maq.tipo}</p>

          {/* Fechas */}
          <div style={{ display: 'grid', gap: '6px', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '8px' }}>
            <p><span style={{ fontWeight: 600 }}>Último mantenimiento:</span> {fmtDate(maq.ultimoMantenimiento)}</p>
            <p><span style={{ fontWeight: 600 }}>Próximo mantenimiento:</span> {fmtDate(maq.proximoMantenimiento)}</p>
          </div>

          {/* Operadores */}
          {maq.operadoresActivos !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', background: '#eff6ff', padding: '6px 10px', borderRadius: '8px', marginBottom: '12px' }}>
              <Users size={13} />
              <span><strong>{maq.operadoresActivos}</strong> operador{maq.operadoresActivos !== 1 ? 'es' : ''} activo{maq.operadoresActivos !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...btnBase, background: '#eff6ff', color: '#1d4ed8' }}
              onClick={() => onEdit && onEdit(maq)}
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              style={{ ...btnBase, background: '#fef2f2', color: '#dc2626' }}
              onClick={() => onDelete && onDelete(maq.id)}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>

        </div>
      ))}
    </div>
  </div>
);

export default MaquinariaGrid;
