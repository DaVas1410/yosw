// Case- and accent-insensitive: "mendez" matches "Méndez".
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function filterParticipants(list, c) {
  const q = c.query ? fold(c.query.trim()) : '';
  return list.filter((p) =>
    (c.eje == null || p.eje === c.eje) &&
    (c.rol == null || p.rol === c.rol) &&
    (!q || fold(p.nombre).includes(q))
  );
}
