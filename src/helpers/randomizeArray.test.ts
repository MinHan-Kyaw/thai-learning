import { randomizeArray } from './randomizeArray';

describe('randomizeArray', () => {
  it('returns a new array containing the same items', () => {
    const items = [1, 2, 3, 4, 5];

    const result = randomizeArray(items);

    expect(result).not.toBe(items);
    expect([...result].sort()).toEqual(items);
  });

  it('does not mutate the original array', () => {
    const items = Object.freeze([1, 2, 3, 4, 5]);

    expect(() => randomizeArray(items)).not.toThrow();
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('uses the random source to reorder items', () => {
    const alwaysFirst = () => 0;

    expect(randomizeArray([1, 2, 3, 4], alwaysFirst)).toEqual([2, 3, 4, 1]);
  });

  it('produces different orders across runs', () => {
    const items = Array.from({ length: 10 }, (_, index) => index);
    const orders = new Set(Array.from({ length: 20 }, () => randomizeArray(items).join(',')));

    expect(orders.size).toBeGreaterThan(1);
  });

  describe('given an empty array', () => {
    it('returns an empty array', () => {
      expect(randomizeArray([])).toEqual([]);
    });
  });
});
