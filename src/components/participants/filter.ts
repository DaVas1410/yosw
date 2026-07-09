import type { Participant } from '../../data/schemas';

export interface FilterCriteria {
  eje?: number;
  rol?: string;
  query?: string;
}

export function filterParticipants(list: Participant[], c: FilterCriteria): Participant[] {
  const q = c.query?.trim().toLowerCase();
  return list.filter((p) =>
    (c.eje == null || p.eje === c.eje) &&
    (c.rol == null || p.rol === c.rol) &&
    (!q || p.nombre.toLowerCase().includes(q))
  );
}
