const fs = require('fs');
const cssapi = require('./cssapi');
const jsapi = require('./jsapi');
const arrayToTable = require('array-to-table');

const getApi = componentName => {
  let api = {
    version: '', // TODO: get version from bower.json
    properties: [],
    methods: [],
    events: [],
    cssapi: cssapi.getCSSApi(`${componentName}-styles.html`, componentName)
  };

  return new Promise(resolve => {
    jsapi.getJsApi(componentName)
      .then(data => {
        resolve(Object.assign(api, data));
      })
      .catch(e => {
        throw new Error(e);
      });
  });
};

const writeApi = componentName => {
  getApi(componentName)
    .then(result => fs.writeFileSync('public-api.json', JSON.stringify(result, null, 2)));
};

const cssApiTable = componentName => {
  const cssProps = cssapi.getCSSApi(componentName, `${componentName}-styles.html`);

  const array = [];
  cssProps.forEach(prop => {
    array.push({
      'Custom Property': prop,
      Description: null,
      Default: null
    });
  });

  return arrayToTable(array, null, 'left');
};

module.exports = {
  cssApiTable,
  getApi,
  writeApi
};
