export function parseSheetRows(rows) {
  if (!Array.isArray(rows)) return {};
  const out = {};
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    const metric = r.metric;
    const value = Number(r.value);
    if (typeof metric !== 'string' || Number.isNaN(value)) continue;
    out[metric] = (out[metric] ?? 0) + value;
  }
  return out;
}
