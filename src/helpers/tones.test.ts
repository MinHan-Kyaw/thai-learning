import { getMarkedTone, getUnmarkedTone } from './tones';

describe('getUnmarkedTone', () => {
  describe('given a live syllable', () => {
    it('is mid for middle and low class and rising for high class', () => {
      expect(getUnmarkedTone('middle', 'live')).toBe('mid');
      expect(getUnmarkedTone('high', 'live')).toBe('rising');
      expect(getUnmarkedTone('low', 'live')).toBe('mid');
    });
  });

  describe('given a dead syllable', () => {
    it('is low for middle and high class and high for low class', () => {
      expect(getUnmarkedTone('middle', 'dead')).toBe('low');
      expect(getUnmarkedTone('high', 'dead')).toBe('low');
      expect(getUnmarkedTone('low', 'dead')).toBe('high');
    });
  });
});

describe('getMarkedTone', () => {
  it('follows the mark for middle class', () => {
    expect(['่', '้', '๊', '๋'].map((mark) => getMarkedTone('middle', mark))).toEqual(['low', 'falling', 'high', 'rising']);
  });

  it('shifts ่ and ้ one tone up for low class', () => {
    expect(getMarkedTone('low', '่')).toBe('falling');
    expect(getMarkedTone('low', '้')).toBe('high');
  });

  describe('given a mark the class does not take', () => {
    it('returns undefined', () => {
      expect(getMarkedTone('high', '๊')).toBeUndefined();
      expect(getMarkedTone('low', '๋')).toBeUndefined();
    });
  });
});
