import { z } from 'zod';

const I18nStr = z.object({ es: z.string(), en: z.string() });

const Evento = z.object({
  titulo: I18nStr,
  hora_inicio: z.string(),
  hora_fin: z.string().nullable().optional(),
  categoria: z.string(),
  nota: z.string().optional(),
  subeventos: z.array(z.object({ titulo: z.string(), hora: z.string() })).optional(),
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
}));
export const ParticipantsSchema = z.array(z.object({
  id: z.string(), nombre: z.string(), rol: z.string(), eje: z.number().nullable().optional(),
  foto: z.string().optional(), enlace: z.string().optional(), bio: I18nStr.optional(),
}));
export const SponsorsSchema = z.array(z.object({
  id: z.string(), nombre: z.string(),
  nivel: z.enum(['principal', 'colaborador', 'institucional']),
  logo: z.string().optional(), enlace: z.string().optional(),
}));
export const ConfigSchema = z.object({
  eventStart: z.string(),
  venue: I18nStr,
  forms: z.object({ attend: z.string(), poster: z.string(), ideaton: z.string() }),
  liveStatsSheetUrl: z.string(),
  social: z.object({ instagram: z.string(), email: z.string() }),
});

export type Evento = z.infer<typeof Evento>;
export type Dia = z.infer<typeof Dia>;
export type Eje = z.infer<typeof EjesSchema>[number];
export type Participant = z.infer<typeof ParticipantsSchema>[number];
export type Sponsor = z.infer<typeof SponsorsSchema>[number];
export type Config = z.infer<typeof ConfigSchema>;
