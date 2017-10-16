'use strict';

const cssapi = require('../lib/cssapi');

describe('css-api', () => {
  describe('getCSSApi()', () => {
    beforeAll(() => {
      process.chdir('__tests__/test-components/paper-toast');
    });

    it('throws an error if the CSS file is not found in component', () => {
      expect(() => {
        cssapi.getCSSApi('paper-toast', 'file-not-found');
      }).toThrow('file-not-found not found in component');
    });

    it('throws an error if the CSS file does not have CSS properties', () => {
      expect(() => {
        cssapi.getCSSApi('paper-toast', 'file-without-css.html');
      }).toThrow('Style properties not found in file-without-css.html. Did you forget --file option?');
    });

    it('returns CSS properties sorted alphabetically', () => {
      const result = cssapi.getCSSApi('paper-toast');
      const expected = ['--paper-toast-background-color', '--paper-toast-color'];
      expect(result).toEqual(expected);
    });
  });
});
