import { assetUrl } from './assetUrl';

describe('assetUrl', () => {
  describe('given the app is served from the domain root', () => {
    it('keeps the path absolute', () => {
      expect(assetUrl('/images/words/kai.svg', '/')).toBe('/images/words/kai.svg');
    });
  });

  describe('given the app is served from a sub-path', () => {
    it('prefixes the base path', () => {
      expect(assetUrl('/images/words/kai.svg', '/thai-learning/')).toBe('/thai-learning/images/words/kai.svg');
    });
  });

  describe('given the asset path has no leading slash', () => {
    it('adds exactly one separator', () => {
      expect(assetUrl('audio/words/kai.m4a', '/thai-learning/')).toBe('/thai-learning/audio/words/kai.m4a');
    });
  });
});
