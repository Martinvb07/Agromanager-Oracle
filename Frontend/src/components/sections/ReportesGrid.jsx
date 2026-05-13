import React, { useState } from 'react';
import { FileText, MapPin, Users, Truck, Bug, Droplets, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  fetchFinanzas, fetchResumenFinanciero,
  fetchCampanas,
  fetchTrabajadoresConHoras, fetchCostoNominaMes,
  fetchMaquinaria,
  fetchPlagas,
  fetchRiego, fetchParcelasRiegoVencido,
} from '../../services/api.js';
import {
  generarReporteFinanciero,
  generarReporteProduccion,
  generarReporteNomina,
  generarReporteMaquinaria,
  generarReporteFitosanitario,
  generarReporteRiego,
} from '../../services/reportGenerator.js';

const reportes = [
  {
    id: 'financiero',
    icon: FileText,
    titulo: 'Reporte Financiero',
    grad: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    desc: 'Ingresos, egresos, balance general y resumen mensual del período.',
  },
  {
    id: 'produccion',
    icon: MapPin,
    titulo: 'Reporte de Producción',
    grad: 'linear-gradient(135deg,#10b981,#059669)',
    desc: 'Campañas, rendimiento por hectárea, producción total e indicadores.',
  },
  {
    id: 'nomina',
    icon: Users,
    titulo: 'Reporte de Nómina',
    grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    desc: 'Trabajadores, horas laboradas, salarios y costo total de nómina.',
  },
  {
    id: 'maquinaria',
    icon: Truck,
    titulo: 'Reporte de Maquinaria',
    grad: 'linear-gradient(135deg,#f59e0b,#d97706)',
    desc: 'Estado de equipos, mantenimientos y operadores activos.',
  },
  {
    id: 'fitosanitario',
    icon: Bug,
    titulo: 'Reporte Fitosanitario',
    grad: 'linear-gradient(135deg,#ef4444,#dc2626)',
    desc: 'Incidentes de plagas, severidad, cultivos afectados y tratamientos.',
  },
  {
    id: 'riego',
    icon: Droplets,
    titulo: 'Reporte de Riego',
    grad: 'linear-gradient(135deg,#06b6d4,#0e7490)',
    desc: 'Programaciones de riego, consumo de agua y parcelas con riego vencido.',
  },
];

const ReportesGrid = () => {
  const [generando, setGenerando] = useState(null);

  const generar = async (id) => {
    setGenerando(id);
    try {
      switch (id) {
        case 'financiero': {
          const [finanzas, resumen] = await Promise.all([fetchFinanzas(), fetchResumenFinanciero()]);
          generarReporteFinanciero(finanzas, resumen);
          break;
        }
        case 'produccion': {
          const campanas = await fetchCampanas();
          generarReporteProduccion(campanas);
          break;
        }
        case 'nomina': {
          const now  = new Date();
          const [trabajadores, costoData] = await Promise.all([
            fetchTrabajadoresConHoras(),
            fetchCostoNominaMes(now.getMonth() + 1, now.getFullYear()),
          ]);
          generarReporteNomina(trabajadores, costoData?.costo ?? 0);
          break;
        }
        case 'maquinaria': {
          const maquinaria = await fetchMaquinaria();
          generarReporteMaquinaria(maquinaria);
          break;
        }
        case 'fitosanitario': {
          const plagas = await fetchPlagas();
          generarReporteFitosanitario(plagas);
          break;
        }
        case 'riego': {
          const [riego, vencidoData] = await Promise.all([
            fetchRiego(),
            fetchParcelasRiegoVencido(7),
          ]);
          generarReporteRiego(riego, vencidoData?.parcelas_vencidas ?? 0);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error al generar reporte', text: err.message });
    } finally {
      setGenerando(null);
    }
  };

  return (
    <div className="am-space-6">
      <h2 className="am-section-title mb-6">Centro de Reportes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
        {reportes.map(({ id, icon: Icon, titulo, grad, desc }) => {
          const cargando = generando === id;
          return (
            <div
              key={id}
              className="am-card"
              style={{
                background: grad,
                color: '#fff',
                padding: '1.25rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'transform .25s, box-shadow .25s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '0.85rem', background: 'rgba(255,255,255,0.23)', backdropFilter: 'blur(4px)' }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{titulo}</h3>
              </div>
              <p style={{ fontSize: '0.72rem', lineHeight: '1.1rem', opacity: 0.9, marginBottom: '0.85rem' }}>{desc}</p>
              <button
                onClick={() => generar(id)}
                disabled={!!generando}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.23)',
                  color: '#fff',
                  padding: '0.55rem 0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: generando ? 'not-allowed' : 'pointer',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: generando && !cargando ? 0.5 : 1,
                }}
              >
                {cargando
                  ? <><Loader size={13} className="spin" /> Generando PDF…</>
                  : <><FileText size={13} /> Generar Reporte</>
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportesGrid;
