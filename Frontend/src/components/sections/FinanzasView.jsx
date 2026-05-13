import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const toNumber = (value) => (typeof value === 'number' ? value : Number(value) || 0);

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const hoy = new Date().toISOString().slice(0, 10);
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .slice(0, 10);

const FinanzasView = ({ ingresos, egresos, balancePeriodo, onAddIngreso, onAddEgreso, onFetchBalance }) => {
  const [desde, setDesde] = useState(inicioMes);
  const [hasta, setHasta] = useState(hoy);

  const totalIngresos = ingresos.reduce((s, i) => s + toNumber(i.monto), 0);
  const totalEgresos  = egresos.reduce((s, e)  => s + toNumber(e.monto), 0);
  const balanceLocal  = totalIngresos - totalEgresos;

  const handleConsultar = () => {
    if (onFetchBalance) onFetchBalance(desde, hasta);
  };

  return (
    <div className="am-space-6">
      <h2 className="am-section-title mb-6">Control Financiero</h2>

      {/* KPIs del período cargado */}
      <div className="am-grid am-grid-3-md">
        <div className="am-stat am-grad-green">
          <p className="label">Total Ingresos</p>
          <p className="value" style={{ fontSize: '28px' }}>{COP.format(totalIngresos)}</p>
        </div>
        <div className="am-stat am-grad-red">
          <p className="label">Total Egresos</p>
          <p className="value" style={{ fontSize: '28px' }}>{COP.format(totalEgresos)}</p>
        </div>
        <div className={`am-stat ${balanceLocal >= 0 ? 'am-grad-blue' : 'am-grad-orange'}`}>
          <p className="label">Balance General</p>
          <p className="value" style={{ fontSize: '28px' }}>{COP.format(balanceLocal)}</p>
        </div>
      </div>

      {/* Panel de balance por período — fn_balance_periodo */}
      <div
        className="am-card am-p-6"
        style={{ borderLeft: '4px solid #6366f1' }}
      >
        <h3 className="am-card-header" style={{ marginBottom: '14px' }}>Balance por Período</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
          </div>
          <button
            className="am-badge am-info"
            style={{ cursor: 'pointer', height: '34px' }}
            onClick={handleConsultar}
          >
            Consultar
          </button>
        </div>

        {balancePeriodo !== null && balancePeriodo !== undefined && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '10px',
              background: balancePeriodo.balance >= 0 ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${balancePeriodo.balance >= 0 ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <TrendingUp size={22} color={balancePeriodo.balance >= 0 ? '#15803d' : '#dc2626'} />
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Balance del {balancePeriodo.desde} al {balancePeriodo.hasta}
              </p>
              <p style={{
                fontSize: '22px',
                fontWeight: 800,
                color: balancePeriodo.balance >= 0 ? '#15803d' : '#dc2626',
              }}>
                {COP.format(balancePeriodo.balance)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Listados */}
      <div className="am-grid am-grid-2-md">
        <div className="am-card am-p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="am-card-header">Ingresos</h3>
            <button className="am-badge am-success" style={{ cursor: 'pointer' }} onClick={onAddIngreso}>
              + Registrar
            </button>
          </div>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '380px', overflow: 'auto' }}>
            {ingresos.map((ingreso) => (
              <div key={ingreso.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '12px', background: '#ecfdf5', borderRadius: '10px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{ingreso.concepto}</p>
                  <p style={{ fontSize: '12px', color: '#475569' }}>{ingreso.fecha} • {ingreso.parcela}</p>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>{COP.format(toNumber(ingreso.monto))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="am-card am-p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="am-card-header">Egresos</h3>
            <button className="am-badge am-danger" style={{ cursor: 'pointer' }} onClick={onAddEgreso}>
              + Registrar
            </button>
          </div>
          <div style={{ display: 'grid', gap: '12px', maxHeight: '380px', overflow: 'auto' }}>
            {egresos.map((egreso) => (
              <div key={egreso.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '12px', background: '#fee2e2', borderRadius: '10px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{egreso.concepto}</p>
                  <p style={{ fontSize: '12px', color: '#475569' }}>{egreso.fecha} • {egreso.categoria}</p>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>- {COP.format(toNumber(egreso.monto))}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanzasView;
