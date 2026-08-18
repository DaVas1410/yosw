export function filterParticipants(list, c) {
  const q = c.query?.trim().toLowerCase();
  return list.filter((p) =>
    (c.eje == null || p.eje === c.eje) &&
    (c.rol == null || p.rol === c.rol) &&
    (!q || p.nombre.toLowerCase().includes(q))
  );
}
