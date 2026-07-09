import { CalendarioSchema } from '../../data/schemas';

export function countByCategory(raw: unknown): Record<string, number> {
  const data = CalendarioSchema.parse(raw);
  const out: Record<string, number> = {};
  for (const dia of data.dias)
    for (const ev of dia.eventos)
      out[ev.categoria] = (out[ev.categoria] ?? 0) + 1;
  return out;
}
