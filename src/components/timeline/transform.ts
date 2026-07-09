import { CalendarioSchema, type Dia } from '../../data/schemas';
import type { Locale } from '../../i18n';

export interface TimelineEvent {
  titulo: string; start: string; end: string | null;
  categoria: string; color: string; nota?: string;
}
export interface TimelineDay {
  fecha: string; dia_semana: string; events: TimelineEvent[];
}

export function toTimeline(raw: unknown, lang: Locale): TimelineDay[] {
  const data = CalendarioSchema.parse(raw);
  return data.dias.map((dia: Dia) => ({
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
