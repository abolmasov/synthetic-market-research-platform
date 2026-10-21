import { buildPaginatedResult } from './pagination';

describe('buildPaginatedResult', () => {
  it('should compute totalPages correctly', () => {
    const result = buildPaginatedResult(['a', 'b', 'c'], 10, 1, 3);
    expect(result).toEqual({
      data: ['a', 'b', 'c'],
      total: 10,
      page: 1,
      limit: 3,
      totalPages: 4, // ceil(10/3) = 4
    });
  });

  it('should return totalPages=1 for empty results', () => {
    const result = buildPaginatedResult([], 0, 1, 20);
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('should handle exact division', () => {
    const result = buildPaginatedResult([1, 2], 6, 3, 2);
    expect(result.totalPages).toBe(3);
  });

  it('should handle single item', () => {
    const result = buildPaginatedResult([42], 1, 1, 10);
    expect(result.totalPages).toBe(1);
  });
});
