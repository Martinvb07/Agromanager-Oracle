/** Formatea una fecha ISO a dd/mm/aaaa. Devuelve '—' si es nula o inválida. */
export function fmtDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Formatea un número como moneda. */
export function fmtCurrency(n) {
  return `$${Number(n || 0).toLocaleString('es-ES')}`;
}
