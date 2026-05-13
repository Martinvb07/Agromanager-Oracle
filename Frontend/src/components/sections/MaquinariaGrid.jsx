import { Truck, Users } from 'lucide-react';

const estadoClass = (estado) => ({
  'Operativo':         'am-success',
  'En mantenimiento':  'am-warning',
  'Fuera de servicio': 'am-danger',
}[estado] || 'am-muted');

const MaquinariaGrid = ({ maquinaria, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div className="am-section-head mb-6">
      <h2 className="am-section-title">
        Gestión de Maquinaria
        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>(V_MAQUINARIA_DETALLE)</span>
      </h2>
      <button className="am-badge am-warning" style={{ cursor: 'pointer' }} onClick={onAdd}>
        + Registrar Maquinaria
      </button>
    </div>
    <div className="am-grid am-grid-2-md" style={{ gap: '16px' }}>
      {maquinaria.map((maq) => (
        <div key={maq.id} className="am-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div className="am-badge am-muted" style={{ background: '#ffedd5', color: '#9a3412' }}>
              <Truck className="am-icon-lg" />
            </div>
            <span className={`am-badge ${estadoClass(maq.estado)}`}>{maq.estado}</span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{maq.nombre}</h3>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '12px' }}>{maq.tipo}</p>

          <div style={{ display: 'grid', gap: '6px', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '8px' }}>
            <p><span style={{ fontWeight: 600 }}>Último mantenimiento:</span> {maq.ultimoMantenimiento ?? '-'}</p>
            <p><span style={{ fontWeight: 600 }}>Próximo mantenimiento:</span> {maq.proximoMantenimiento ?? '-'}</p>
          </div>

          {maq.operadoresActivos !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', background: '#eff6ff', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px' }}>
              <Users size={13} />
              <span>
                <strong>{maq.operadoresActivos}</strong> operador{maq.operadoresActivos !== 1 ? 'es' : ''} activo{maq.operadoresActivos !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="am-actions primary" onClick={() => onEdit && onEdit(maq)}>Editar</button>
            <button className="am-actions danger" style={{ color: '#dc2626' }} onClick={() => onDelete && onDelete(maq.id)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MaquinariaGrid;
