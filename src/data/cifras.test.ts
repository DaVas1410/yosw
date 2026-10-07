import { describe, it, expect } from 'vitest';
import cifras from './cifras.json';
import { CifrasSchema } from './schemas';

describe('cifras.json', () => {
  it('matches schema and every figure is bilingual', () => {
    for (const c of CifrasSchema.parse(cifras)) {
      expect(c.etiqueta.es && c.etiqueta.en).toBeTruthy();
      if (c.detalle) expect(c.detalle.es && c.detalle.en).toBeTruthy();
    }
  });

  it('talks + posters add up to accepted works', () => {
    const v = (es: string) => CifrasSchema.parse(cifras).find((c) => c.etiqueta.es === es)?.valor;
    expect(v('Ponencias orales')! + v('Pósters')!).toBe(v('Trabajos aceptados'));
  });
});
