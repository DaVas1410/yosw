import { CalendarioSchema, type Dia } from '../../data/schemas';
import type { Locale } from '../../i18n';

export interface CalEvent {
  titulo: string;
  categoria: string;
  color: string;
  nota?: string;
  start: string;
  end: string | null;
  startMin: number;
  endMin: number;   // effective end (defaults applied) used for layout
  col: number;      // column index within its overlap cluster
  cols: number;     // total columns in its cluster
}

export interface CalDay {
  fecha: string;
  dia_semana: string;
  events: CalEvent[];
}

export interface Calendar {
  days: CalDay[];
  startMin: number; // grid window start (minutes, floored to hour)
  endMin: number;   // grid window end (minutes, ceiled to hour)
}

const DEFAULT_DURATION = 60; // minutes, for events without an end time

export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Assigns each event a column index + cluster column-count so overlapping
 *  events render side by side (Google-Calendar style). Mutates in place. */
export function layoutDay(events: CalEvent[]): void {
  const sorted = events.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  let cluster: CalEvent[] = [];
  let columns: number[] = []; // end time of the last event in each column
  let clusterEnd = -1;

  const flush = () => {
    for (const ev of cluster) ev.cols = columns.length;
    cluster = [];
    columns = [];
    clusterEnd = -1;
  };

  for (const ev of sorted) {
    if (clusterEnd !== -1 && ev.startMin >= clusterEnd) flush();
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i] <= ev.startMin) {
        columns[i] = ev.endMin;
        ev.col = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      ev.col = columns.length;
      columns.push(ev.endMin);
    }
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMin);
  }
  flush();
}

export function toCalendar(raw: unknown, lang: Locale): Calendar {
  const data = CalendarioSchema.parse(raw);
  let minStart = Infinity;
  let maxEnd = -Infinity;

  const days: CalDay[] = data.dias.map((dia: Dia) => ({
    fecha: dia.fecha,
    dia_semana: dia.dia_semana,
    events: dia.eventos.map((ev) => {
      const startMin = parseMinutes(ev.hora_inicio);
      const endMin = ev.hora_fin ? parseMinutes(ev.hora_fin) : startMin + DEFAULT_DURATION;
      minStart = Math.min(minStart, startMin);
      maxEnd = Math.max(maxEnd, endMin);
      return {
        titulo: ev.titulo[lang],
        categoria: ev.categoria,
        color: `var(--cat-${ev.categoria})`,
        nota: ev.nota,
        start: ev.hora_inicio,
        end: ev.hora_fin ?? null,
        startMin,
        endMin,
        col: 0,
        cols: 1,
      };
    }),
  }));

  for (const day of days) layoutDay(day.events);

  const startMin = Math.floor(minStart / 60) * 60;
  const endMin = Math.ceil(maxEnd / 60) * 60;
  return { days, startMin, endMin };
}
