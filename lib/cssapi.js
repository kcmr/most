'use strict';

const fs = require('fs');
const chalk = require('chalk');

const getCSSApi = (component, file) => {
  // TODO: check if file exists
  const styles = fs.readFileSync(file);
  const found = styles.toString().match(new RegExp(`--${component}-*\\S*`, 'g'));

  const results = [];
  found.forEach(prop => results.push(prop.slice(0, -1)));

  return results.sort();
};

const getCSSApiFromHtml = (component) => {
  const results = [];

  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(`${component}.html`)
  });

  return new Promise(resolve => {
    lineReader.on('line', line => {
      if (line.match(new RegExp(`--${component}-*\\S*`, 'g'))) {
        let cssPropDescription = line.split('|').filter(item => item.length > 0);
        results.push({
          'Custom property': cssPropDescription[0].trim(),
          'Description': cssPropDescription[1].trim(),
          'Default': cssPropDescription[2].trim()
        });
      }
    });

    lineReader.on('close', () => {
      if (results.length) {
        resolve(results);
      } else {
        throw new Error('CSS API not found in component HTML.');
      }
    });
  });
};

const mergeResult = (cssProps, cssDocs) => {
  const result = [];
  const added = [];
  const removed = [];

  cssProps.forEach(prop => {
    let found = cssDocs.find(item => item['Custom property'].trim() === prop);
    if (found) {
      result.push(found);
    } else {
      added.push(prop);
      result.push({
        'Custom property': prop.trim(),
        'Description': '',
        'Default': ''
      });
    }
  });

  cssDocs.forEach(prop => {
    if (cssProps.indexOf(prop['Custom property'].trim()) === -1) {
      removed.push(prop['Custom property']);
    }
  });

  return {result, added, removed};
};

const printResult = (result) => {
  console.log(chalk.yellow.inverse('\n Your CSS API formatted as a markdown table: \n'));
  console.log(require('array-to-table')(result.result, null, 'left'));

  if (result.added.length || result.removed.length) {
    console.log(chalk.yellow.inverse(' API changes: \n'));
  }

  if (result.added.length) {
    console.log('New CSS properties:');
    console.log(chalk.green(result.added.join('\n')));
  }

  if (result.removed.length) {
    console.log('\nWARNING! Removed CSS properties:');
    console.log(chalk.red(result.removed.join('\n')));
  }

  console.log('');
};

const updateCSSDocs = (component) => {
  getCSSApiFromHtml(component)
    .then(result => mergeResult(getCSSApi(component, `${component}-styles.html`), result))
    .then(result => printResult(result))
    .catch(error => console.log(error));
};

module.exports = {
  getCSSApi,
  getCSSApiFromHtml,
  updateCSSDocs
};
