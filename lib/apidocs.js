const fs = require('fs');
const cssapi = require('./cssapi');
const jsapi = require('./jsapi');
const arrayToTable = require('array-to-table');
const componentName = require('path').basename(process.cwd());

const getApi = () => {
  let api = {
    version: '', // TODO: get version from bower.json
    properties: [],
    methods: [],
    events: [],
    cssapi: cssapi.getCSSApi(componentName)
  };

  return new Promise((resolve, reject) => {
    jsapi.getJsApi(componentName)
      .then(data => {
        resolve(Object.assign(api, data));
      })
      .catch(e => {
        throw new Error(e);
      });
  });
};

const writeApi = () => {
  getApi()
    .then(result => fs.writeFileSync('public-api.json', JSON.stringify(result, null, 2)));
};

const cssApiTable = () => {
  const cssProps = cssapi.getCSSApi();

  const array = [];
  cssProps.forEach(prop => {
    array.push({
      'Custom Property': prop,
      'Description': null,
      'Default': null
    });
  });

  return arrayToTable(array, null, 'left');
};

module.exports = {
  cssApiTable,
  getApi,
  writeApi
};