import { z } from 'zod';

const I18nStr = z.object({ es: z.string(), en: z.string() });

const Talk = z.object({
  hora: z.string().optional(),
  speaker: z.string(),
  tema: z.string().optional(),
});
// One room of a block of simultaneous talks (e.g. Wednesday's charlas).
// `sala` is the room name ("TBD" renders as "por confirmar"); `eje` is an
// optional thematic-axis id from ejes.json used to colour/label the track.
const Paralela = z.object({
  sala: z.string(),
  eje: z.number().optional(),
  talks: z.array(Talk),
});
const Evento = z.object({
  titulo: I18nStr,
  hora_inicio: z.string(),
  hora_fin: z.string().nullable().optional(),
  categoria: z.string(),
  pic: z.string().optional(),
  nota: z.string().optional(),
  detalle: I18nStr.optional(),
  talks: z.array(Talk).optional(),
  panelists: z.array(z.string()).optional(),
  lugar: z.string().optional(),
  paralelas: z.array(Paralela).optional(),
});
const Dia = z.object({
  fecha: z.string(), dia_semana: z.string(), eventos: z.array(Evento),
});
export const CalendarioSchema = z.object({
  evento: z.string(),
  leyenda_categorias: z.record(z.string(), z.string()),
  dias: z.array(Dia),
});
export const EjesSchema = z.array(z.object({
  id: z.number(), nombre: I18nStr, descripcion: I18nStr, color: z.string(),
  // Filenames inside src/assets/ejes/.
  logos: z.array(z.string()).optional(),
}));
// Headline numbers for the "cifras" band (src/render/cifras.js).
export const CifrasSchema = z.array(z.object({
  valor: z.number(),
  prefijo: z.string().optional(),
  sufijo: z.string().optional(),
  etiqueta: I18nStr,
  detalle: I18nStr.optional(),
}));
export const IdeathonSchema = z.object({
  retos: z.array(z.object({
    id: z.string(),
    titulo: I18nStr,
    resumen: I18nStr,
    problema: I18nStr,
    porque: I18nStr,
    entregables: z.array(I18nStr),
    perfiles: I18nStr,
  })),
});
export const ParticipantsSchema = z.array(z.object({
  id: z.string(), nombre: z.string(), rol: z.string(), eje: z.number().nullable().optional(),
  foto: z.string().optional(), enlace: z.string().optional(), bio: I18nStr.optional(),
}));
// Optional metadata for the logos in src/assets/sponsors/{patrocinadores,colaboradores}/,
// keyed by "<carpeta>/<archivo>". The logo files themselves drive the walls.
export const SponsorsMetaSchema = z.record(z.string(), z.object({
  nombre: z.string().optional(), enlace: z.string().optional(),
}));
export const SponsorsSchema = z.array(z.object({
  id: z.string(), nombre: z.string(),
  // 'sponsor' = Patrocinadores, 'colaborador' = Colaboradores.
  tipo: z.enum(['sponsor', 'colaborador']).optional(),
  logo: z.string().optional(), enlace: z.string().optional(),
}));
export const ConfigSchema = z.object({
  eventStart: z.string(),
  venue: I18nStr,
  forms: z.object({ register: z.string(), ideathon: z.string().optional() }),
  social: z.object({
    instagram: z.string(),
    email: z.string(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  sponsorshipProposalUrl: z.string(),
});

export type Evento = z.infer<typeof Evento>;
export type Dia = z.infer<typeof Dia>;
export type Eje = z.infer<typeof EjesSchema>[number];
export type Participant = z.infer<typeof ParticipantsSchema>[number];
export type Sponsor = z.infer<typeof SponsorsSchema>[number];
export type Paralela = z.infer<typeof Paralela>;
export type Reto = z.infer<typeof IdeathonSchema>['retos'][number];
export type Config = z.infer<typeof ConfigSchema>;
