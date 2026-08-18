import { CalendarioSchema } from '../data/schemas';

export function toTimeline(raw, lang) {
  const data = CalendarioSchema.parse(raw);
  return data.dias.map((dia) => ({
    fecha: dia.fecha,
    dia_semana: dia.dia_semana,
    events: dia.eventos.map((ev) => ({
      titulo: ev.titulo[lang],
      start: ev.hora_inicio,
      end: ev.hora_fin ?? null,
      categoria: ev.categoria,
      color: `var(--cat-${ev.categoria})`,
      nota: ev.nota,
    })),
  }));
}
