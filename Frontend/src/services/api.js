// Servicio API para consumir el backend
// En desarrollo usa localhost, en producción usa el dominio oficial.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? '/api'
    : 'http://localhost:3001/api');

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchParcelas() {
  const json = await request('/parcelas');
  return json.data;
}

export async function crearParcela(payload) {
  const json = await request('/parcelas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarParcela(id, payload) {
  const json = await request(`/parcelas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarParcela(id) {
  await request(`/parcelas/${id}`, { method: 'DELETE' });
  return true;
}

// --- Trabajadores ---

export async function fetchTrabajadores() {
  const json = await request('/trabajadores');
  return json.data;
}

export async function crearTrabajador(payload) {
  const json = await request('/trabajadores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarTrabajador(id, payload) {
  const json = await request(`/trabajadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarTrabajador(id) {
  await request(`/trabajadores/${id}`, { method: 'DELETE' });
  return true;
}

// --- Finanzas (ingresos y egresos) ---

export async function fetchFinanzas() {
  const json = await request('/finanzas');
  return json.data; // { ingresos, egresos }
}

export async function crearIngreso(payload) {
  const json = await request('/finanzas/ingresos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function crearEgreso(payload) {
  const json = await request('/finanzas/egresos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

// --- Campanas (campañas agrícolas) ---

export async function fetchCampanas() {
  const json = await request('/campanas');
  return json.data;
}

export async function fetchCampana(id) {
  const json = await request(`/campanas/${id}`);
  return json.data;
}

export async function crearCampana(payload) {
  const json = await request('/campanas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarCampana(id, payload) {
  const json = await request(`/campanas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarCampana(id) {
  await request(`/campanas/${id}`, { method: 'DELETE' });
  return true;
}

export async function fetchCampanaDiario(campanaId, filters) {
  let path = `/campanas/${campanaId}/diario`;
  if (filters && (filters.desde || filters.hasta)) {
    const params = new URLSearchParams();
    if (filters.desde) params.append('desde', filters.desde);
    if (filters.hasta) params.append('hasta', filters.hasta);
    path += `?${params.toString()}`;
  }
  const json = await request(path);
  return json.data;
}

export async function crearCampanaDia(campanaId, payload) {
  const json = await request(`/campanas/${campanaId}/diario`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarCampanaDia(campanaId, entryId, payload) {
  const json = await request(`/campanas/${campanaId}/diario/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarCampanaDia(campanaId, entryId) {
  await request(`/campanas/${campanaId}/diario/${entryId}`, { method: 'DELETE' });
  return true;
}

// --- Remisiones (por campaña) ---

export async function fetchRemisiones(campanaId) {
  const json = await request(`/campanas/${campanaId}/remisiones`);
  return json.data;
}

export async function crearRemision(campanaId, payload) {
  const json = await request(`/campanas/${campanaId}/remisiones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarRemision(campanaId, remisionId, payload) {
  const json = await request(`/campanas/${campanaId}/remisiones/${remisionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarRemision(campanaId, remisionId) {
  await request(`/campanas/${campanaId}/remisiones/${remisionId}`, { method: 'DELETE' });
  return true;
}

// --- Cambios / Novedades ---

export async function fetchCambios(limit) {
  let path = '/cambios';
  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    path += `?${params.toString()}`;
  }

  const json = await request(path);
  return json.data;
}

export async function crearCambio(payload) {
  const json = await request('/cambios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

// --- Maquinaria ---

export async function fetchMaquinaria() {
  const json = await request('/maquinaria');
  return json.data;
}

export async function crearMaquinaria(payload) {
  const json = await request('/maquinaria', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarMaquinaria(id, payload) {
  const json = await request(`/maquinaria/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarMaquinaria(id) {
  await request(`/maquinaria/${id}`, { method: 'DELETE' });
  return true;
}

// --- Riego ---

export async function fetchRiego() {
  const json = await request('/riego');
  return json.data;
}

export async function crearRiego(payload) {
  const json = await request('/riego', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

// --- IA / Asistente ---

export async function pedirConsejoIA({ question, context } = {}) {
  const json = await request('/ai/advice', {
    method: 'POST',
    body: JSON.stringify({
      question: question || '',
      context: context || {},
    }),
  });
  return json.data; // { answer, provider }
}

export async function enviarMensajeChat({ messages } = {}) {
  const json = await request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: messages || [] }),
  });
  return json.data; // { answer, provider }
}

export async function actualizarRiego(id, payload) {
  const json = await request(`/riego/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarRiego(id) {
  await request(`/riego/${id}`, { method: 'DELETE' });
  return true;
}

// --- Plagas ---

export async function fetchPlagas() {
  const json = await request('/plagas');
  return json.data;
}

export async function crearPlaga(payload) {
  const json = await request('/plagas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarPlaga(id, payload) {
  const json = await request(`/plagas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarPlaga(id) {
  await request(`/plagas/${id}`, { method: 'DELETE' });
  return true;
}

// --- Semillas ---

export async function fetchSemillas() {
  const json = await request('/semillas');
  return json.data;
}

export async function crearSemilla(payload) {
  const json = await request('/semillas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarSemilla(id, payload) {
  const json = await request(`/semillas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarSemilla(id) {
  await request(`/semillas/${id}`, { method: 'DELETE' });
  return true;
}

export async function login(email, password) {
  const json = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return json;
}

// --- Gestión de usuarios (solo owner) ---

export async function fetchUsuarios() {
  const json = await request('/owner/users');
  return json.data;
}

export async function crearUsuario(payload) {
  const json = await request('/owner/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

// --- Fertilizantes ---

export async function fetchFertilizantes() {
  const json = await request('/fertilizantes');
  return json.data;
}

export async function crearFertilizante(payload) {
  const json = await request('/fertilizantes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarFertilizante(id, payload) {
  const json = await request(`/fertilizantes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarFertilizante(id) {
  await request(`/fertilizantes/${id}`, { method: 'DELETE' });
  return true;
}

export async function fetchStockBajo() {
  const json = await request('/fertilizantes/stock-bajo');
  return json.data;
}

export async function aplicarFertilizantesLote(parcelaId, items, fecha) {
  const json = await request('/fertilizantes/aplicar-lote', {
    method: 'POST',
    body: JSON.stringify({ parcela_id: parcelaId, items, fecha }),
  });
  return json.data;
}

export async function fetchUsosFertilizante(id) {
  const json = await request(`/fertilizantes/${id}/usos`);
  return json.data;
}

// --- Nuevas funciones PL/SQL conectadas ---

// sp_sincronizar_stock
export async function sincronizarStock() {
  const json = await request('/fertilizantes/sincronizar-stock', { method: 'POST' });
  return json.data;
}

// fn_fertilizante_mas_consumido
export async function fetchFertilizanteMasConsumido(desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  const query = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/fertilizantes/mas-consumido${query}`);
  return json.data;
}

// sp_cerrar_campana
export async function cerrarCampana(id) {
  const json = await request(`/campanas/${id}/cerrar`, { method: 'POST' });
  return json.data;
}

// fn_rendimiento_campana
export async function fetchRendimientoCampana(id) {
  const json = await request(`/campanas/${id}/rendimiento`);
  return json.data;
}

// Alertas activas del usuario (para badge del chatbot)
export async function fetchAlertas() {
  const json = await request('/ai/alerts');
  return json.data;
}

// sp_liquidar_nomina
export async function liquidarNomina(mes, anio) {
  const json = await request('/trabajadores/nomina/liquidar', {
    method: 'POST',
    body: JSON.stringify({ mes, anio }),
  });
  return json; // { data: [...], mes, anio }
}

// fn_costo_nomina_mes
export async function fetchCostoNominaMes(mes, anio) {
  const params = new URLSearchParams();
  if (mes)  params.append('mes',  mes);
  if (anio) params.append('anio', anio);
  const json = await request(`/trabajadores/nomina/costo?${params.toString()}`);
  return json.data;
}

// fn_balance_periodo
export async function fetchBalancePeriodo(desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  const query = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/finanzas/balance${query}`);
  return json.data;
}

// sp_registrar_inversiones
export async function registrarInversiones(siembraId, items) {
  const json = await request('/finanzas/inversiones', {
    method: 'POST',
    body: JSON.stringify({ siembra_id: siembraId, items }),
  });
  return json.data;
}

// fn_parcelas_riego_vencido
export async function fetchParcelasRiegoVencido(dias = 7) {
  const json = await request(`/riego/vencido?dias=${dias}`);
  return json.data;
}

// --- V_DASHBOARD y V_RESUMEN_FINANCIERO ---

export async function fetchDashboardStats() {
  const json = await request('/dashboard');
  return json.data;
}

export async function fetchResumenFinanciero() {
  const json = await request('/dashboard/financiero');
  return json.data;
}

// --- V_SIEMBRAS_RESUMEN ---

export async function fetchSiembras() {
  const json = await request('/siembras');
  return json.data;
}

// --- V_TRABAJADORES_HORAS ---

export async function fetchTrabajadoresConHoras() {
  const json = await request('/trabajadores/con-horas');
  return json.data;
}

// fn_horas_trabajador
export async function fetchHorasTrabajador(id, desde, hasta) {
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  const json = await request(`/trabajadores/${id}/horas?${params.toString()}`);
  return json.data;
}

// sp_registrar_jornadas
export async function registrarJornadas(trabajadorId, lista) {
  const json = await request(`/trabajadores/${trabajadorId}/jornadas`, {
    method: 'POST',
    body: JSON.stringify({ lista }),
  });
  return json.data;
}
