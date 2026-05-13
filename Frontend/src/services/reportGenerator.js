import jsPDF from 'jspdf';

const COP  = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
const HOY  = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

// ─── Helpers internos ────────────────────────────────────────────────────────

function addHeader(doc, titulo, subtitulo = '', colorRGB = [22, 163, 74]) {
  doc.setFillColor(...colorRGB);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('AgroManager Pro', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(titulo, 14, 21);

  const pw = doc.internal.pageSize.getWidth();
  doc.setFontSize(8);
  doc.text(HOY, pw - 14, 12, { align: 'right' });
  if (subtitulo) doc.text(subtitulo, pw - 14, 21, { align: 'right' });

  return 38;
}

function addCards(doc, cards, y) {
  const pw   = doc.internal.pageSize.getWidth();
  const gap  = 4;
  const w    = (pw - 28 - gap * (cards.length - 1)) / cards.length;
  let x = 14;

  cards.forEach(({ label, value, color = [22, 163, 74] }) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, 17, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(label.toUpperCase(), x + 3, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(value), x + 3, y + 14);
    x += w + gap;
  });
  return y + 23;
}

function drawTable(doc, headers, rows, y, colWidths, rowH = 7.5, headerColor = [22, 163, 74]) {
  const pw  = doc.internal.pageSize.getWidth();
  const mar = 14;
  const tw  = pw - mar * 2;
  const ww  = colWidths || headers.map(() => tw / headers.length);

  const checkPage = (curY) => {
    if (curY > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      return 15;
    }
    return curY;
  };

  y = checkPage(y);

  // Cabecera
  doc.setFillColor(...headerColor);
  doc.rect(mar, y, tw, rowH + 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  let x = mar;
  headers.forEach((h, i) => { doc.text(String(h), x + 2, y + rowH - 1); x += ww[i]; });
  y += rowH + 1;

  // Filas
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, ri) => {
    y = checkPage(y);
    if (ri % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(mar, y, tw, rowH, 'F'); }
    doc.setTextColor(31, 41, 55);
    x = mar;
    row.forEach((cell, ci) => {
      doc.text(String(cell ?? '-'), x + 2, y + rowH - 2, { maxWidth: ww[ci] - 4 });
      x += ww[ci];
    });
    doc.setDrawColor(229, 231, 235);
    doc.line(mar, y + rowH, mar + tw, y + rowH);
    y += rowH;
  });

  return y + 4;
}

function addFooter(doc) {
  const total = doc.getNumberOfPages();
  const pw    = doc.internal.pageSize.getWidth();
  const ph    = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(243, 244, 246);
    doc.rect(0, ph - 10, pw, 10, 'F');
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('AgroManager Pro — Sistema de Gestión Agrícola', 14, ph - 3);
    doc.text(`Pág. ${i} / ${total}`, pw - 14, ph - 3, { align: 'right' });
  }
}

function sectionTitle(doc, text, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(31, 41, 55);
  doc.text(text, 14, y);
  return y + 5;
}

// ─── Reportes públicos ───────────────────────────────────────────────────────

export function generarReporteFinanciero(finanzas, resumenMensual = []) {
  const { ingresos = [], egresos = [] } = finanzas;
  const totI = ingresos.reduce((s, i) => s + Number(i.monto || 0), 0);
  const totE = egresos.reduce((s, e)  => s + Number(e.monto || 0), 0);
  const bal  = totI - totE;

  const doc = new jsPDF();
  let y = addHeader(doc, 'Reporte Financiero', `Balance: ${COP.format(bal)}`);

  y = addCards(doc, [
    { label: 'Total Ingresos',  value: COP.format(totI), color: [22, 163, 74]  },
    { label: 'Total Egresos',   value: COP.format(totE), color: [220, 38, 38]  },
    { label: 'Balance General', value: COP.format(bal),  color: bal >= 0 ? [37, 99, 235] : [245, 158, 11] },
  ], y);

  // Resumen mensual
  if (resumenMensual.length) {
    y = sectionTitle(doc, 'Resumen por Mes', y);
    const porMes = {};
    resumenMensual.forEach(({ mes, tipo, total }) => {
      if (!porMes[mes]) porMes[mes] = { mes, i: 0, e: 0 };
      if (tipo === 'Ingreso') porMes[mes].i = Number(total);
      else                    porMes[mes].e = Number(total);
    });
    const mRows = Object.values(porMes)
      .sort((a, b) => b.mes.localeCompare(a.mes))
      .slice(0, 12)
      .map(m => [m.mes, COP.format(m.i), COP.format(m.e), COP.format(m.i - m.e)]);
    y = drawTable(doc, ['Mes', 'Ingresos', 'Egresos', 'Balance'], mRows, y, [50, 48, 48, 36]);
  }

  // Ingresos
  y = sectionTitle(doc, 'Detalle de Ingresos', y);
  y = drawTable(doc,
    ['Concepto', 'Monto', 'Fecha', 'Tipo'],
    ingresos.slice(0, 30).map(i => [
      String(i.concepto || '-').slice(0, 35),
      COP.format(Number(i.monto || 0)),
      String(i.fecha || '-').slice(0, 10),
      String(i.tipo || '-'),
    ]),
    y, [72, 44, 34, 32]
  );

  // Egresos
  y = sectionTitle(doc, 'Detalle de Egresos', y);
  drawTable(doc,
    ['Concepto', 'Monto', 'Fecha', 'Tipo'],
    egresos.slice(0, 30).map(e => [
      String(e.concepto || '-').slice(0, 35),
      COP.format(Number(e.monto || 0)),
      String(e.fecha || '-').slice(0, 10),
      String(e.tipo || '-'),
    ]),
    y, [72, 44, 34, 32]
  );

  addFooter(doc);
  doc.save(`Reporte_Financiero_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generarReporteProduccion(campanas) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const totProd = campanas.reduce((s, c) => s + Number(c.produccionTotal || 0), 0);
  const totHa   = campanas.reduce((s, c) => s + Number(c.hectareas || 0), 0);
  const totIng  = campanas.reduce((s, c) => s + Number(c.ingresoTotal || 0), 0);

  let y = addHeader(doc, 'Reporte de Producción', `${campanas.length} campañas registradas`, [16, 185, 129]);

  y = addCards(doc, [
    { label: 'Campañas',         value: campanas.length,          color: [16, 185, 129] },
    { label: 'Producción Total', value: `${totProd} bultos`,      color: [37, 99, 235]  },
    { label: 'Hectáreas',        value: `${totHa} ha`,            color: [245, 158, 11] },
    { label: 'Ingresos Totales', value: COP.format(totIng),       color: [22, 163, 74]  },
  ], y);

  y = drawTable(doc,
    ['Campaña', 'Inicio', 'Fin', 'Hectáreas', 'Lotes', 'Producción', 'Ha Cosech.', 'Rend./ha', 'Ingresos', 'Egresos'],
    campanas.map(c => [
      String(c.nombre || '-').slice(0, 22),
      String(c.fechaInicio || '-').slice(0, 10),
      String(c.fechaFin    || '-').slice(0, 10),
      `${c.hectareas ?? 0} ha`,
      c.lotes ?? 0,
      `${c.produccionTotal ?? 0} bul`,
      `${c.hectareasCosechadas ?? 0} ha`,
      `${c.rendimientoHa ?? 0}`,
      COP.format(Number(c.ingresoTotal || 0)),
      COP.format(Number(c.egresosTotal || 0)),
    ]),
    y, [38, 22, 22, 22, 14, 26, 22, 20, 34, 34], 7, [16, 185, 129]
  );

  addFooter(doc);
  doc.save(`Reporte_Produccion_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generarReporteNomina(trabajadores, costoTotal = 0) {
  const now       = new Date();
  const mesLabel  = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const totHoras  = trabajadores.reduce((s, t) => s + Number(t.horasMesActual || t.horasTrabajadas || 0), 0);
  const totSalar  = trabajadores.reduce((s, t) => s + Number(t.salario || 0), 0);

  const doc = new jsPDF();
  let y = addHeader(doc, `Reporte de Nómina — ${mesLabel}`, `${trabajadores.length} trabajadores`, [37, 99, 235]);

  y = addCards(doc, [
    { label: 'Trabajadores',      value: trabajadores.length,   color: [37, 99, 235]  },
    { label: 'Total Horas (mes)', value: `${totHoras}h`,        color: [22, 163, 74]  },
    { label: 'Costo Nómina Mes',  value: COP.format(costoTotal),color: [220, 38, 38]  },
    { label: 'Masa Salarial',     value: COP.format(totSalar),  color: [245, 158, 11] },
  ], y);

  drawTable(doc,
    ['Nombre', 'Cargo', 'Salario Base', 'Horas (mes)', 'Horas (total)', 'Estado'],
    trabajadores.map(t => [
      String(t.nombre  || '-'),
      String(t.cargo   || '-'),
      COP.format(Number(t.salario || 0)),
      `${t.horasMesActual ?? t.horasTrabajadas ?? 0}h`,
      `${t.horasTotales ?? 0}h`,
      String(t.estado  || '-'),
    ]),
    y, [46, 34, 38, 24, 24, 22], 7, [37, 99, 235]
  );

  addFooter(doc);
  doc.save(`Reporte_Nomina_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generarReporteMaquinaria(maquinaria) {
  const operativos = maquinaria.filter(m => m.estado === 'Operativo').length;
  const mantenim   = maquinaria.filter(m => m.estado === 'En mantenimiento').length;
  const fuera      = maquinaria.filter(m => m.estado === 'Fuera de servicio').length;

  const doc = new jsPDF();
  let y = addHeader(doc, 'Reporte de Maquinaria', `${maquinaria.length} equipos registrados`, [245, 158, 11]);

  y = addCards(doc, [
    { label: 'Total Equipos',      value: maquinaria.length, color: [245, 158, 11] },
    { label: 'Operativos',         value: operativos,        color: [22, 163, 74]  },
    { label: 'En Mantenimiento',   value: mantenim,          color: [220, 38, 38]  },
    { label: 'Fuera de Servicio',  value: fuera,             color: [107, 114, 128]},
  ], y);

  drawTable(doc,
    ['Equipo', 'Tipo', 'Estado', 'Últ. Mantenimiento', 'Próx. Mantenimiento', 'Operadores'],
    maquinaria.map(m => [
      String(m.nombre || '-'),
      String(m.tipo   || '-'),
      String(m.estado || '-'),
      String(m.ultimoMantenimiento    || '-').slice(0, 10),
      String(m.proximoMantenimiento   || '-').slice(0, 10),
      m.operadoresActivos ?? 0,
    ]),
    y, [46, 30, 28, 34, 34, 20], 7, [245, 158, 11]
  );

  addFooter(doc);
  doc.save(`Reporte_Maquinaria_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generarReporteFitosanitario(plagas) {
  const altas  = plagas.filter(p => p.severidad === 'Alta').length;
  const medias = plagas.filter(p => p.severidad === 'Media').length;
  const bajas  = plagas.filter(p => p.severidad === 'Baja').length;

  const doc = new jsPDF();
  let y = addHeader(doc, 'Reporte Fitosanitario', `${plagas.length} incidentes registrados`, [220, 38, 38]);

  y = addCards(doc, [
    { label: 'Total Incidentes', value: plagas.length, color: [220, 38, 38]  },
    { label: 'Severidad Alta',   value: altas,         color: [185, 28, 28]  },
    { label: 'Severidad Media',  value: medias,        color: [245, 158, 11] },
    { label: 'Severidad Baja',   value: bajas,         color: [22, 163, 74]  },
  ], y);

  drawTable(doc,
    ['Tipo de Plaga', 'Cultivo Afectado', 'Severidad', 'Tratamiento', 'Fecha Detección'],
    plagas.map(p => [
      String(p.tipo         || '-'),
      String(p.cultivo      || p.tipoSemilla || '-'),
      String(p.severidad    || '-'),
      String(p.tratamiento  || '-').slice(0, 35),
      String(p.fechaDetec   || p.fecha_detec || '-').slice(0, 10),
    ]),
    y, [38, 34, 24, 62, 28], 7, [220, 38, 38]
  );

  addFooter(doc);
  doc.save(`Reporte_Fitosanitario_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generarReporteRiego(riego, parcelasVencidas = 0) {
  const totConsumo = riego.reduce((s, r) => s + Number(r.consumoAgua || 0), 0);

  const doc = new jsPDF();
  let y = addHeader(doc, 'Reporte de Riego', `${riego.length} programaciones activas`, [6, 182, 212]);

  y = addCards(doc, [
    { label: 'Programaciones',     value: riego.length,          color: [6, 182, 212]  },
    { label: 'Consumo Total (m³)', value: `${totConsumo} m³`,    color: [37, 99, 235]  },
    { label: 'Parcelas Vencidas',  value: parcelasVencidas,
      color: parcelasVencidas > 0 ? [220, 38, 38] : [22, 163, 74] },
  ], y);

  drawTable(doc,
    ['Parcela', 'Tipo de Riego', 'Consumo (m³)', 'Último Riego', 'Próximo Riego'],
    riego.map(r => [
      String(r.parcela      || '-'),
      String(r.tipo         || '-'),
      String(r.consumoAgua  || 0),
      String(r.ultimoRiego  || '-').slice(0, 10),
      String(r.proximoRiego || '-').slice(0, 10),
    ]),
    y, [46, 36, 30, 38, 38], 7, [6, 182, 212]
  );

  addFooter(doc);
  doc.save(`Reporte_Riego_${new Date().toISOString().slice(0, 10)}.pdf`);
}
