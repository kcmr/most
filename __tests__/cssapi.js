'use strict';

const cssapi = require('../lib/cssapi');

describe('css-api', () => {
  describe('getCSSApi()', () => {
    let component;
    const namespace = 'paper-toast';

    beforeAll(() => {
      component = '__tests__/test-components/paper-toast';
    });

    it('throws an error if the CSS file is not found in component', () => {
      expect(() => {
        cssapi.getCSSApi(`${component}/file-not-found`, namespace);
      }).toThrow('file-not-found not found in component');
    });

    it('throws an error if the CSS file does not have CSS properties', () => {
      expect(() => {
        cssapi.getCSSApi(`${component}/file-without-css.html`, namespace);
      }).toThrow(`Style properties not found in ${component}/file-without-css.html.`);
    });

    it('uses the CSS file name without extension as namespace if not specified', () => {
      const result = cssapi.getCSSApi(`${component}/paper-toast.html`);
      const expected = [['--paper-toast-background-color', ''], ['--paper-toast-color', '']];
      expect(result).toEqual(expected);
    });
  });
});
