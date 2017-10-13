const cssapi = require('./cssapi');
const arrayToTable = require('array-to-table');

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
  cssApiTable
};