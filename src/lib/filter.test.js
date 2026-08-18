import { describe, it, expect } from 'vitest';
import { filterParticipants } from './filter';

const list = [
  { id: 'a', nombre: 'Ana', rol: 'speaker', eje: 1 },
  { id: 'b', nombre: 'Beto', rol: 'poster', eje: 2 },
  { id: 'c', nombre: 'Ana Lucía', rol: 'poster', eje: 1 },
];

describe('filterParticipants', () => {
  it('filters by eje', () => {
    expect(filterParticipants(list, { eje: 1 }).map(p => p.id)).toEqual(['a', 'c']);
  });
  it('filters by rol', () => {
    expect(filterParticipants(list, { rol: 'poster' }).map(p => p.id)).toEqual(['b', 'c']);
  });
  it('searches name case-insensitively', () => {
    expect(filterParticipants(list, { query: 'ana' }).map(p => p.id)).toEqual(['a', 'c']);
  });
  it('returns all with no criteria', () => {
    expect(filterParticipants(list, {})).toHaveLength(3);
  });
});
