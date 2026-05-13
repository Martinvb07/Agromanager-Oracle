import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const RiegoTable = ({ riego, parcelasVencidas = 0, diasLimite = 7, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div className="am-section-head mb-6">
      <h2 className="am-section-title">Programación de Riego</h2>
      <button className="am-badge am-info" style={{ cursor: 'pointer' }} onClick={onAdd}>
        + Programar Riego
      </button>
    </div>

    {parcelasVencidas > 0 && (
      <div
        className="am-card am-p-4"
        style={{
          background: 'linear-gradient(135deg, #fef9c3, #fef08a)',
          borderLeft: '4px solid #ca8a04',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <AlertTriangle size={18} color="#92400e" />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
            {parcelasVencidas} parcela{parcelasVencidas > 1 ? 's' : ''} con riego vencido
          </p>
          <p style={{ fontSize: '12px', color: '#78350f' }}>
            Sin riego hace más de {diasLimite} días — revisá el próximo riego programado.
          </p>
        </div>
      </div>
    )}

    {parcelasVencidas === 0 && riego.length > 0 && (
      <div
        className="am-card am-p-4"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderLeft: '4px solid #16a34a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <CheckCircle size={18} color="#15803d" />
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
          Todas las parcelas tienen riego al día.
        </p>
      </div>
    )}

    <div className="am-card" style={{ overflow: 'hidden' }}>
      <div className="am-table-wrapper">
        <table className="am-table">
          <thead className="head-cyan">
            <tr>
              <th>Parcela</th>
              <th>Tipo de Riego</th>
              <th>Consumo Agua</th>
              <th>Último Riego</th>
              <th>Próximo Riego</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {riego.map((item) => (
              <tr key={item.id}>
                <td>{item.parcela}</td>
                <td>{item.tipo}</td>
                <td>{item.consumoAgua}</td>
                <td>{item.ultimoRiego}</td>
                <td>{item.proximoRiego}</td>
                <td className="am-actions">
                  <button className="primary" onClick={() => onEdit(item)}>Editar</button>
                  <button className="danger" onClick={() => onDelete(item.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default RiegoTable;
