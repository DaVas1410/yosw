import { CalendarioSchema } from '../data/schemas.ts';

export function countByCategory(raw) {
  const data = CalendarioSchema.parse(raw);
  const out = {};
  for (const dia of data.dias)
    for (const ev of dia.eventos)
      out[ev.categoria] = (out[ev.categoria] ?? 0) + 1;
  return out;
}
