import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar base de conocimiento una sola vez al iniciar
let knowledge = {};
try {
  const raw = readFileSync(join(__dirname, '..', 'data', 'knowledge.json'), 'utf-8');
  knowledge = JSON.parse(raw);
} catch (e) {
  console.error('Error cargando knowledge.json:', e.message);
}

function formatCurrency(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('es-ES')}`;
}

function buildHeuristicAdvice({ question, context }) {
  const stats = context?.stats || {};
  const alerts = Array.isArray(context?.alerts) ? context.alerts : [];

  const ingresosMes = Number(stats.ingresosMes) || 0;
  const gastosMes = Number(stats.gastosMes) || 0;
  const balance = ingresosMes - gastosMes;

  const lines = [];
  lines.push('Recomendaciones (modo heurístico):');

  if (alerts.length) {
    lines.push('');
    lines.push('Alertas detectadas:');
    for (const a of alerts.slice(0, 5)) {
      const title = a?.title || 'Alerta';
      const desc = a?.description || '';
      lines.push(`- ${title}${desc ? `: ${desc}` : ''}`);
    }
  }

  lines.push('');
  lines.push('Acciones sugeridas para esta semana:');

  if (balance < 0) {
    lines.push(
      `1) Finanzas: estás en negativo este mes (${formatCurrency(balance)}). Revisa egresos (insumos/operativos) y prioriza compras críticas.`
    );
  } else {
    lines.push(
      `1) Finanzas: balance positivo este mes (${formatCurrency(balance)}). Define un % para mantenimiento preventivo e insumos clave.`
    );
  }

  const plaga = alerts.find((a) => (a?.title || '').toLowerCase().includes('plaga'));
  if (plaga) {
    lines.push(
      '2) Sanidad: valida severidad y foco en campo (muestreo). Registra tratamiento aplicado y programa una revisión en 48–72h.'
    );
  } else {
    lines.push('2) Sanidad: programa monitoreo de plagas (2 recorridos/semana) y registra hallazgos por parcela.');
  }

  const riego = alerts.find((a) => (a?.title || '').toLowerCase().includes('riego'));
  if (riego) {
    lines.push('3) Riego: confirma disponibilidad de agua/equipo y ajusta turnos para evitar riegos fuera de horario.');
  } else {
    lines.push('3) Riego: revisa calendario de riegos y evita intervalos largos en etapas sensibles del cultivo.');
  }

  if (question && question.trim()) {
    lines.push('');
    lines.push('Respuesta a tu pregunta:');
    lines.push(`- ${question.trim()}`);
    lines.push('  (Si configuras un proveedor LLM, esta sección responderá con lenguaje natural.)');
  }

  return lines.join('\n');
}

/**
 * Consulta Oracle y devuelve un resumen completo del usuario para pasar como
 * contexto al modelo de IA.
 */
async function fetchUserContext(userId) {
  const queries = {
    parcelas: `
      SELECT nombre AS "nombre", hectareas AS "hectareas", cultivo AS "cultivo",
             estado AS "estado", inversion AS "inversion"
        FROM parcelas
       WHERE usuario_id = :userId
       ORDER BY id DESC
       FETCH FIRST 20 ROWS ONLY`,
    plagas: `
      SELECT cultivo AS "cultivo", tipo AS "tipo", severidad AS "severidad",
             tratamiento AS "tratamiento", fecha_detec AS "fechaDeteccion"
        FROM plagas
       WHERE usuario_id = :userId
       ORDER BY fecha_detec DESC NULLS LAST
       FETCH FIRST 15 ROWS ONLY`,
    riego: `
      SELECT r.tipo AS "tipo", p.nombre AS "parcela",
             r.consumo_agua AS "consumoAgua",
             r.ultimo_riego AS "ultimoRiego",
             r.proximo_riego AS "proximoRiego"
        FROM riego r
        LEFT JOIN parcelas p ON r.parcela_id = p.id
       WHERE r.usuario_id = :userId
       ORDER BY r.proximo_riego DESC NULLS LAST
       FETCH FIRST 15 ROWS ONLY`,
    maquinaria: `
      SELECT nombre AS "nombre", tipo AS "tipo", estado AS "estado",
             ultimo_mantenimiento  AS "ultimoMantenimiento",
             proximo_mantenimiento AS "proximoMantenimiento"
        FROM maquinaria
       WHERE usuario_id = :userId
       ORDER BY id DESC
       FETCH FIRST 15 ROWS ONLY`,
    campanas: `
      SELECT nombre AS "nombre",
             fecha_inicio       AS "fechaInicio",
             fecha_fin          AS "fechaFin",
             hectareas          AS "hectareas",
             lotes              AS "lotes",
             inversion_total    AS "inversionTotal",
             gastos_operativos  AS "gastosOperativos",
             ingreso_total      AS "ingresoTotal",
             rendimiento_ha     AS "rendimientoHa",
             produccion_total   AS "produccionTotal"
        FROM campanas
       WHERE usuario_id = :userId
       ORDER BY fecha_inicio DESC
       FETCH FIRST 10 ROWS ONLY`,
    ingresos: `
      SELECT concepto AS "concepto", monto AS "monto", fecha AS "fecha", tipo AS "tipo"
        FROM ingresos
       WHERE usuario_id = :userId
       ORDER BY fecha DESC
       FETCH FIRST 15 ROWS ONLY`,
    egresos: `
      SELECT concepto AS "concepto", monto AS "monto", fecha AS "fecha",
             tipo AS "tipo", categoria AS "categoria"
        FROM egresos
       WHERE usuario_id = :userId
       ORDER BY fecha DESC
       FETCH FIRST 15 ROWS ONLY`,
    semillas: `
      SELECT tipo AS "tipo", cantidad AS "cantidad", proveedor AS "proveedor", costo AS "costo"
        FROM semillas
       WHERE usuario_id = :userId
       ORDER BY id DESC
       FETCH FIRST 15 ROWS ONLY`,
    trabajadores: `
      SELECT nombre AS "nombre", cargo AS "cargo", salario AS "salario",
             horas_trabajadas AS "horasTrabajadas", estado AS "estado"
        FROM trabajadores
       WHERE usuario_id = :userId
       ORDER BY id DESC
       FETCH FIRST 15 ROWS ONLY`,
    fertilizantes: `
      SELECT f.nombre AS "nombre", f.cantidad AS "cantidad",
             f.fecha_aplicacion AS "fechaAplicacion",
             p.nombre AS "parcela",
             f.costo AS "costo"
        FROM fertilizantes f
        LEFT JOIN parcelas p ON f.parcela_id = p.id
       WHERE f.usuario_id = :userId
       ORDER BY f.fecha_aplicacion DESC NULLS LAST
       FETCH FIRST 15 ROWS ONLY`,
  };

  const context = {};

  const results = await Promise.allSettled(
    Object.entries(queries).map(async ([key, sql]) => {
      const r = await query(sql, { userId });
      return { key, rows: r.rows };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      context[result.value.key] = result.value.rows;
    }
  }

  // Resumen financiero del mes actual (con TO_CHAR sobre la columna DATE)
  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  try {
    const ing = await query(
      `SELECT NVL(SUM(monto), 0) AS "total"
         FROM ingresos
        WHERE usuario_id = :userId
          AND TO_CHAR(fecha, 'YYYY-MM') = :mes`,
      { userId, mes: mesActual }
    );
    const eg = await query(
      `SELECT NVL(SUM(monto), 0) AS "total"
         FROM egresos
        WHERE usuario_id = :userId
          AND TO_CHAR(fecha, 'YYYY-MM') = :mes`,
      { userId, mes: mesActual }
    );
    const ingTotal = Number(ing.rows?.[0]?.total) || 0;
    const egTotal = Number(eg.rows?.[0]?.total) || 0;
    context.resumenMes = {
      mes: mesActual,
      ingresosMes: ingTotal,
      egresosMes: egTotal,
      balance: ingTotal - egTotal,
    };
  } catch (_) {
    /* no bloqueamos el chat si falla el resumen */
  }

  return context;
}

const AGROMANAGER_SYSTEM_PROMPT = `Eres AgroBot, el asistente virtual inteligente de AgroManager — un sistema integral de gestión agrícola.

Tu rol es ayudar a los usuarios de la plataforma con dudas sobre:

PARCELAS: Gestión de terrenos agrícolas (nombre, hectáreas, cultivo, estado: Activa/En preparación/Cosechada, inversión). Puedes orientar sobre rotación de cultivos, preparación de suelos y planificación de siembras.

PLAGAS Y SANIDAD: Registro y control de plagas (tipo, severidad: Bajo/Medio/Alto, cultivo afectado, tratamiento, fecha de detección). Puedes recomendar métodos de control integrado de plagas (MIP), identificación de síntomas, tratamientos orgánicos y químicos, frecuencia de monitoreo y acciones preventivas.

RIEGO: Programación de riego (tipo de riego, consumo de agua, último riego, próximo riego). Puedes asesorar sobre frecuencias óptimas según cultivo y clima, tipos de riego (goteo, aspersión, surco, inundación), ahorro de agua y señales de estrés hídrico.

MAQUINARIA: Inventario y mantenimiento de equipos (nombre, tipo, estado: Operativo/Mantenimiento/Fuera de servicio, fechas de mantenimiento). Puedes orientar sobre mantenimiento preventivo, vida útil y buenas prácticas de uso.

CAMPAÑAS AGRÍCOLAS: Seguimiento de ciclos completos de producción (nombre, fechas, hectáreas, lotes, inversión, gastos operativos, ingresos, rendimiento por ha, producción total). Incluye diario de cosecha (hectáreas cortadas, bultos, notas) y remisiones de transporte.

FINANZAS: Ingresos (ventas) y egresos (insumos, operación, personal). Puedes ayudar a analizar rentabilidad, control de costos y planificación financiera agrícola.

SEMILLAS: Inventario de semillas (tipo, cantidad, proveedor, costo). Puedes orientar sobre selección de variedades, almacenamiento y proveedores.

FERTILIZANTES: Aplicaciones de fertilizantes (parcela, producto, dosis, fecha, estado). Puedes recomendar planes de fertilización, dosis según cultivo y etapa fenológica.

TRABAJADORES: Gestión de personal (nombre, cargo, salario, horas trabajadas, estado). Incluye cálculo de liquidaciones.

REPORTES: La plataforma genera reportes y estadísticas con exportación a PDF.

Reglas de comportamiento:
- Responde SIEMPRE en español.
- Sé conciso pero completo. Usa listas cuando sea útil.
- Si la pregunta es sobre la plataforma, explica cómo usar la función en AgroManager.
- Si la pregunta es técnica-agrícola (plagas, riego, fertilización, etc.), da consejos prácticos basados en buenas prácticas agrícolas.
- Si no tienes suficiente información, pide los datos mínimos necesarios.
- No inventes datos del usuario. Si necesitas contexto específico (ej: qué cultivo tiene), pregunta.
- Mantén un tono amigable y profesional.
- Si la pregunta no tiene relación con agricultura o la plataforma, indica amablemente que estás especializado en temas agrícolas y de AgroManager.`;

async function openAiChat({ messages, context }) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY no configurada');
    err.status = 400;
    throw err;
  }

  const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemContent = AGROMANAGER_SYSTEM_PROMPT +
    (context ? `\n\nContexto actual del usuario en la plataforma:\n${JSON.stringify(context)}` : '');

  const apiMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 1024,
      messages: apiMessages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Error OpenAI ${res.status}: ${text}`);
    err.status = 502;
    throw err;
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return 'No se recibió respuesta del modelo.';
  return content;
}

async function searchWikipedia(query) {
  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&utf8=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    const pageTitle = results[0].title;

    const extractUrl = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=1&explaintext=1&exchars=800&format=json&utf8=1`;
    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) return null;

    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    const extract = page?.extract;
    if (!extract || extract.length < 40) return null;

    let text = extract.replace(/\n{3,}/g, '\n\n').trim();

    if (text.length > 600) {
      const cut = text.lastIndexOf('.', 600);
      text = cut > 200 ? text.slice(0, cut + 1) : text.slice(0, 600) + '...';
    }

    return { title: pageTitle, text };
  } catch (_) {
    return null;
  }
}

function buildSearchQuery(question) {
  const stopWords = ['que', 'qué', 'como', 'cómo', 'cual', 'cuál', 'para', 'por', 'los', 'las', 'del', 'de', 'el', 'la', 'un', 'una', 'me', 'mi', 'mis', 'te', 'tu', 'tus', 'es', 'son', 'hay', 'hago', 'hacer', 'puedo', 'debo', 'debería', 'necesito', 'tengo', 'recomiendas', 'recomendaciones', 'cuánto', 'cuánta', 'cuántos', 'cuántas', 'con', 'sin', 'más', 'muy', 'algo', 'sobre', 'cuando', 'donde', 'favor', 'gracias', 'por favor'];
  const q = question.toLowerCase().replace(/[¿?¡!.,;:]/g, '');
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !stopWords.includes(w));

  const crops = ['arroz', 'maíz', 'maiz', 'soja', 'trigo', 'café', 'cafe', 'caña', 'cana', 'tomate', 'papa', 'frijol', 'algodón', 'algodon', 'sorgo', 'yuca', 'plátano', 'platano', 'cacao', 'palma'];
  const topics = ['fertilizante', 'fertilización', 'fertilizacion', 'abono', 'plaga', 'insecticida', 'fungicida', 'herbicida', 'riego', 'tratamiento', 'enfermedad', 'hongo', 'control', 'manejo', 'cosecha', 'siembra', 'semilla', 'nutriente', 'npk', 'nitrógeno', 'fósforo', 'potasio'];

  const foundCrop = crops.find((c) => q.includes(c));
  const foundTopic = topics.find((t) => q.includes(t));

  if (foundTopic && foundCrop) {
    return `${foundTopic} ${foundCrop} agricultura`;
  }
  if (foundCrop) {
    return `cultivo ${foundCrop} agricultura ${words.filter(w => w !== foundCrop).join(' ')}`.trim();
  }

  return words.join(' ') + ' agricultura';
}

function findKnowledge(question) {
  const q = question.toLowerCase();
  const matches = [];

  const topicMap = {
    fertilizante: ['fertiliz', 'abono', 'nutriente', 'npk', 'urea', 'dap'],
    plaga: ['plaga', 'insecto', 'enfermedad', 'hongo', 'virus', 'control', 'tratamiento'],
    riego: ['riego', 'agua', 'humedad'],
  };
  const cropMap = ['arroz', 'maíz', 'maiz', 'soja', 'soya', 'café', 'cafe', 'tomate', 'papa'];

  const detectedTopic = Object.entries(topicMap).find(([, kws]) => kws.some((kw) => q.includes(kw)));
  const detectedCrop = cropMap.find((c) => q.includes(c));

  if (detectedTopic && detectedCrop) {
    const cropKey = detectedCrop.replace('á', 'a').replace('é', 'e');
    const cropData = knowledge[cropKey] || knowledge[detectedCrop];
    if (cropData?.specific) {
      const combos = [
        `${detectedTopic[0]} ${detectedCrop}`,
        `${detectedTopic[0]} ${cropKey}`,
      ];
      for (const combo of combos) {
        if (cropData.specific[combo]) {
          return [{ category: cropKey, score: 10, specific: cropData.specific[combo] }];
        }
      }
    }
    if (cropData) {
      return [{ category: cropKey, score: 5, general: cropData.general }];
    }
  }

  for (const [category, data] of Object.entries(knowledge)) {
    if (!data.keywords) continue;

    const matchedKeywords = data.keywords.filter((kw) => q.includes(kw.toLowerCase()));
    if (matchedKeywords.length === 0) continue;

    const entry = { category, score: matchedKeywords.length, general: data.general || '' };

    if (data.specific) {
      for (const [key, text] of Object.entries(data.specific)) {
        if (q.includes(key.toLowerCase())) {
          entry.specific = text;
          entry.score += 3;
          break;
        }
      }
    }

    if (data.by_crop) {
      for (const [crop, text] of Object.entries(data.by_crop)) {
        if (q.includes(crop.toLowerCase())) {
          entry.byCrop = text;
          entry.score += 3;
          break;
        }
      }
    }

    matches.push(entry);
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}

function getRelevantUserData(q, dbContext) {
  if (!dbContext || typeof dbContext !== 'object') return '';

  const parts = [];
  const fmt = (n) => `$${Number(n || 0).toLocaleString('es-ES')}`;

  if (q.includes('parcela') || q.includes('terreno') || q.includes('lote') || q.includes('hectárea') || q.includes('cuánta') || q.includes('cultivo') || q.includes('sembr')) {
    const d = dbContext.parcelas;
    if (Array.isArray(d) && d.length) {
      if (q.includes('cultivo') || q.includes('sembr')) {
        parts.push(`Tus cultivos:`);
        for (const p of d) parts.push(`- ${p.nombre}: ${p.cultivo || 'sin cultivo definido'} (${p.hectareas} ha, ${p.estado})`);
      } else {
        parts.push(`Tienes ${d.length} parcela(s):`);
        for (const p of d) parts.push(`- ${p.nombre}: ${p.hectareas} ha, cultivo: ${p.cultivo || 'sin definir'}, estado: ${p.estado}`);
      }
    } else parts.push('No tienes parcelas ni cultivos registrados.');
  }

  if (q.includes('plaga') || q.includes('insecto') || q.includes('enfermedad') || q.includes('hongo')) {
    const d = dbContext.plagas;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} plaga(s) registrada(s):`);
      for (const p of d.slice(0, 5)) {
        parts.push(`- ${p.tipo || '?'} en ${p.cultivo || '?'} (${p.severidad})${p.tratamiento ? ' — tratamiento: ' + p.tratamiento : ''}`);
      }
    } else parts.push('No tienes plagas registradas.');
  }

  if (q.includes('riego') || q.includes('agua')) {
    const d = dbContext.riego;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} programación(es) de riego:`);
      for (const r of d.slice(0, 5)) {
        parts.push(`- ${r.parcela || '?'}: ${r.tipo || '?'}, último: ${String(r.ultimoRiego || '?').slice(0, 10)}, próximo: ${String(r.proximoRiego || '?').slice(0, 10)}`);
      }
    } else parts.push('No tienes riego programado.');
  }

  if (q.includes('maquinaria') || q.includes('tractor') || q.includes('equipo') || q.includes('mantenimiento')) {
    const d = dbContext.maquinaria;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} equipo(s):`);
      for (const m of d.slice(0, 5)) {
        const prox = m.proximoMantenimiento ? `, próx. mant: ${String(m.proximoMantenimiento).slice(0, 10)}` : '';
        parts.push(`- ${m.nombre} (${m.tipo || '?'}): ${m.estado}${prox}`);
      }
    } else parts.push('No tienes maquinaria registrada.');
  }

  if (q.includes('finanza') || q.includes('ingreso') || q.includes('egreso') || q.includes('gasto') || q.includes('dinero') || q.includes('balance') || q.includes('costo')) {
    const r = dbContext.resumenMes;
    if (r) {
      parts.push(`Finanzas del mes (${r.mes}): Ingresos ${fmt(r.ingresosMes)}, Egresos ${fmt(r.egresosMes)}, Balance ${fmt(r.balance)}.`);
    }
  }

  if (q.includes('campaña') || q.includes('cosecha') || q.includes('producción') || q.includes('rendimiento')) {
    const d = dbContext.campanas;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} campaña(s):`);
      for (const c of d.slice(0, 3)) {
        parts.push(`- ${c.nombre}: ${c.hectareas || '?'} ha, inversión: ${fmt(c.inversionTotal)}, ingreso: ${fmt(c.ingresoTotal)}`);
      }
    } else parts.push('No tienes campañas registradas.');
  }

  if (q.includes('trabajador') || q.includes('personal') || q.includes('empleado') || q.includes('salario')) {
    const d = dbContext.trabajadores;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} trabajador(es):`);
      for (const t of d.slice(0, 5)) parts.push(`- ${t.nombre}: ${t.cargo || '?'}, ${t.estado}`);
    } else parts.push('No tienes trabajadores registrados.');
  }

  if (q.includes('semilla') || q.includes('siembra')) {
    const d = dbContext.semillas;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} tipo(s) de semilla:`);
      for (const s of d.slice(0, 5)) parts.push(`- ${s.tipo}: ${s.cantidad} und, proveedor: ${s.proveedor || '?'}`);
    } else parts.push('No tienes semillas registradas.');
  }

  return parts.join('\n');
}

function buildFullSummary(dbContext) {
  if (!dbContext || typeof dbContext !== 'object') return 'No tienes datos registrados aún.';
  const fmt = (n) => `$${Number(n || 0).toLocaleString('es-ES')}`;
  const parts = [];
  const p = dbContext.parcelas; if (Array.isArray(p) && p.length) parts.push(`Parcelas: ${p.length} (${p.map(x => x.nombre).join(', ')})`);
  const pl = dbContext.plagas; if (Array.isArray(pl) && pl.length) parts.push(`Plagas activas: ${pl.length}`);
  const r = dbContext.riego; if (Array.isArray(r) && r.length) parts.push(`Riegos programados: ${r.length}`);
  const m = dbContext.maquinaria; if (Array.isArray(m) && m.length) parts.push(`Equipos: ${m.length}`);
  const c = dbContext.campanas; if (Array.isArray(c) && c.length) parts.push(`Campañas: ${c.length}`);
  const t = dbContext.trabajadores; if (Array.isArray(t) && t.length) parts.push(`Trabajadores: ${t.length}`);
  const rm = dbContext.resumenMes; if (rm) parts.push(`Balance del mes: ${fmt(rm.balance)}`);
  return parts.length ? parts.join('\n') : 'No tienes datos registrados aún.';
}

async function buildHeuristicChat({ messages, dbContext }) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const q = lastMsg.toLowerCase();

  const askingAboutData = q.includes('mis ') || q.includes('mi ') || q.includes('tengo') ||
    q.includes('cuánto') || q.includes('cuánta') || q.includes('cuántos') ||
    q.includes('cómo está') || q.includes('cómo van');

  const askingFullSummary = q.includes('resumen') || q.includes('todo') || q.includes('general') || q.includes('panorama');

  if (/^(hola|hey|buenas?|buenos?\s|qué tal|saludos)/i.test(q.trim())) {
    return '¡Hola! Soy AgroBot. ¿En qué te puedo ayudar hoy?';
  }

  if (askingAboutData && dbContext) {
    const data = getRelevantUserData(q, dbContext);
    if (data) return data;
    if (askingFullSummary) return buildFullSummary(dbContext);
    return buildFullSummary(dbContext);
  }

  const matches = findKnowledge(q);
  const searchQuery = buildSearchQuery(lastMsg);

  if (matches.length > 0) {
    const best = matches[0];

    if (best.specific) return best.specific;
    if (best.byCrop) return best.byCrop;

    if (searchQuery.length > 3) {
      const wiki = await searchWikipedia(searchQuery);
      if (wiki) return wiki.text;
    }

    return best.general;
  }

  if (searchQuery.length > 3) {
    const wiki = await searchWikipedia(searchQuery);
    if (wiki) return wiki.text;
  }

  return 'No encontré información sobre eso. Puedo ayudarte con temas agrícolas como plagas, riego, fertilización, maquinaria, campañas o finanzas.';
}

async function anthropicChat({ messages, context }) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY no configurada');
    err.status = 400;
    throw err;
  }

  const model = env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  const systemContent = AGROMANAGER_SYSTEM_PROMPT +
    (context ? `\n\nContexto actual del usuario en la plataforma:\n${JSON.stringify(context)}` : '');

  const apiMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));

  if (apiMessages.length && apiMessages[0].role !== 'user') {
    apiMessages.shift();
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemContent,
      messages: apiMessages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Error Anthropic ${res.status}: ${text}`);
    err.status = 502;
    throw err;
  }

  const json = await res.json();
  const content = json?.content?.[0]?.text;
  if (!content) return 'No se recibió respuesta del modelo.';
  return content;
}

async function openAiAdvice({ question, context }) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY no configurada');
    err.status = 400;
    throw err;
  }

  const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const user = {
    question: question || 'Dame 3 acciones prioritarias para esta semana.',
    context: context || {},
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: AGROMANAGER_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(user) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Error OpenAI ${res.status}: ${text}`);
    err.status = 502;
    throw err;
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return 'No se recibió respuesta del modelo.';
  return content;
}

export const aiService = {
  async getAdvice({ user, question, context }) {
    const provider = (env.AI_PROVIDER || 'heuristic').toLowerCase();

    if (provider === 'anthropic') {
      const msgs = [{ role: 'user', content: question || 'Dame 3 acciones prioritarias para esta semana.' }];
      const answer = await anthropicChat({ messages: msgs, context });
      return { answer, provider: 'anthropic' };
    }

    if (provider === 'openai') {
      const answer = await openAiAdvice({ question, context });
      return { answer, provider: 'openai' };
    }

    const answer = buildHeuristicAdvice({ question, context });
    return { answer, provider: 'heuristic' };
  },

  async chat({ userId, messages }) {
    const provider = (env.AI_PROVIDER || 'heuristic').toLowerCase();

    let dbContext = {};
    if (userId) {
      try {
        dbContext = await fetchUserContext(userId);
      } catch (e) {
        console.error('Error obteniendo contexto del usuario para chat:', e.message);
      }
    }

    if (provider === 'anthropic') {
      const answer = await anthropicChat({ messages, context: dbContext });
      return { answer, provider: 'anthropic' };
    }

    if (provider === 'openai') {
      const answer = await openAiChat({ messages, context: dbContext });
      return { answer, provider: 'openai' };
    }

    const answer = await buildHeuristicChat({ messages, dbContext });
    return { answer, provider: 'heuristic' };
  },
};
