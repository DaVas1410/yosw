export function parseSheetRows(rows: unknown): Record<string, number> {
  if (!Array.isArray(rows)) return {};
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    const metric = (r as any).metric;
    const value = Number((r as any).value);
    if (typeof metric !== 'string' || Number.isNaN(value)) continue;
    out[metric] = (out[metric] ?? 0) + value;
  }
  return out;
}
