'use strict';

const fs = require('fs');
const path = require('path');
const cssapi = require('./cssapi');
const jsapi = require('./jsapi');

const getApi = componentName => {
  const pkg = fs.existsSync('bower.json') ? require(path.join(process.cwd(), 'bower.json')) : {
    version: '',
    description: ''
  };

  let api = {
    version: pkg.version,
    description: pkg.description,
    properties: [],
    methods: [],
    events: [],
    cssapi: cssapi.getCSSApi(`${componentName}-styles.html`, componentName).map(item => item[0])
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

module.exports = {
  getApi,
  writeApi
};
