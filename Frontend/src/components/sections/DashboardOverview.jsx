import { MapPin, Users, TrendingUp, DollarSign, Truck, Sprout, Activity } from 'lucide-react';
import AiAssistantCard from './AiAssistantCard.jsx';

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const DashboardOverview = ({ stats, dbStats, resumenFinanciero = [], ingresos, egresos, alerts = [] }) => {
  // Prioriza V_DASHBOARD si está disponible, si no usa stats calculados localmente
  const s = dbStats || stats || {};

  const parcelas   = s.parcelas_activas  ?? s.parcelasActivas  ?? 0;
  const trabajadores = s.trabajadores_activos ?? s.trabajadores ?? 0;
  const ingresosMes  = Number(s.ingresos_mes  ?? s.ingresosMes  ?? 0);
  const egresosMes   = Number(s.egresos_mes   ?? s.gastosMes    ?? 0);
  const maquinas     = s.total_maquinaria ?? s.maquinariasOperativas ?? 0;
  const campanasAct  = s.campanas_activas ?? 0;
  const siembrasAct  = s.siembras_activas ?? 0;

  const alertCards = alerts.length ? alerts : [
    { id: 'default-ok', variant: 'info', title: 'Sistema operativo', description: 'Todos los módulos funcionando correctamente' },
  ];

  const getAlertStyles = (variant) => ({
    warning: { card: '#fef3c7', dot: '#f59e0b' },
    danger:  { card: '#fee2e2', dot: '#ef4444' },
    info:    { card: '#dbeafe', dot: '#3b82f6' },
    success: { card: '#dcfce7', dot: '#16a34a' },
  }[variant] || { card: '#dbeafe', dot: '#3b82f6' });

  // Agrupa resumen financiero por mes (últimos 4)
  const mesesFinancieros = (() => {
    if (!resumenFinanciero.length) return [];
    const porMes = {};
    resumenFinanciero.forEach(({ mes, tipo, total }) => {
      if (!porMes[mes]) porMes[mes] = { mes, ingreso: 0, egreso: 0 };
      if (tipo === 'Ingreso') porMes[mes].ingreso = Number(total);
      else                    porMes[mes].egreso  = Number(total);
    });
    return Object.values(porMes).sort((a, b) => b.mes.localeCompare(a.mes)).slice(0, 4);
  })();

  return (
    <div className="am-space-6">
      <h2 className="am-section-title mb-6">
        Panel de Control
        {dbStats && <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>(V_DASHBOARD)</span>}
      </h2>

      {/* KPIs principales — V_DASHBOARD */}
      <div className="am-grid am-grid-2-md am-grid-4-lg">
        <div className="am-stat am-grad-emerald">
          <MapPin className="am-icon-lg" />
          <p className="label">Parcelas Activas</p>
          <p className="value" style={{ fontSize: '28px' }}>{parcelas}</p>
        </div>
        <div className="am-stat am-grad-blue">
          <Users className="am-icon-lg" />
          <p className="label">Trabajadores</p>
          <p className="value" style={{ fontSize: '28px' }}>{trabajadores}</p>
        </div>
        <div className="am-stat am-grad-green">
          <TrendingUp className="am-icon-lg" />
          <p className="label">Ingresos (mes)</p>
          <p className="value" style={{ fontSize: '20px' }}>{COP.format(ingresosMes)}</p>
        </div>
        <div className="am-stat am-grad-red">
          <DollarSign className="am-icon-lg" />
          <p className="label">Egresos (mes)</p>
          <p className="value" style={{ fontSize: '20px' }}>{COP.format(egresosMes)}</p>
        </div>
      </div>

      {/* KPIs secundarios */}
      <div className="am-grid am-grid-3-md">
        <div className="am-stat am-grad-orange">
          <Truck className="am-icon-lg" />
          <p className="label">Maquinaria Total</p>
          <p className="value" style={{ fontSize: '28px' }}>{maquinas}</p>
        </div>
        <div className="am-stat am-grad-blue">
          <Activity className="am-icon-lg" />
          <p className="label">Campañas Activas</p>
          <p className="value" style={{ fontSize: '28px' }}>{campanasAct}</p>
        </div>
        <div className="am-stat am-grad-emerald">
          <Sprout className="am-icon-lg" />
          <p className="label">Siembras Activas</p>
          <p className="value" style={{ fontSize: '28px' }}>{siembrasAct}</p>
        </div>
      </div>

      <div className="am-grid am-grid-2-md" style={{ marginTop: '24px' }}>
        {/* Resumen financiero mensual — V_RESUMEN_FINANCIERO */}
        <div className="am-card am-p-6">
          <h3 className="am-card-header" style={{ marginBottom: '12px' }}>
            Resumen Financiero por Mes
            <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 400, marginLeft: '6px' }}>(V_RESUMEN_FINANCIERO)</span>
          </h3>
          {mesesFinancieros.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {mesesFinancieros.map((m) => {
                const balance = m.ingreso - m.egreso;
                return (
                  <div key={m.mes} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{m.mes}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: balance >= 0 ? '#16a34a' : '#dc2626' }}>
                        {COP.format(balance)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#6b7280' }}>
                      <span style={{ color: '#16a34a' }}>▲ {COP.format(m.ingreso)}</span>
                      <span style={{ color: '#dc2626' }}>▼ {COP.format(m.egreso)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {[...ingresos.slice(0, 2), ...egresos.slice(0, 2)].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{item.concepto}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{item.fecha}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                    {COP.format(Number(item.monto || 0))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="am-card am-p-6">
          <h3 className="am-card-header" style={{ marginBottom: '12px' }}>Alertas y Notificaciones</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {alertCards.map((alert) => {
              const styles = getAlertStyles(alert.variant);
              return (
                <div key={alert.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: styles.card, borderRadius: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '999px', background: styles.dot, marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{alert.title}</p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{alert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <AiAssistantCard />
      </div>
    </div>
  );
};

export default DashboardOverview;
