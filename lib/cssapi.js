'use strict';

const fs = require('fs');
const chalk = require('chalk');

/**
 * Returns an array with the CSS custom properties and mixins found in a file.
 * @param  {String} component Component's name. Used to find CSS properties that starts with --component-name.
 * @param  {String} file      File where the CSS properties will be found.
 * @return {Array}            List of CSS properties sorted alphabetically.
 */
const getCSSApi = (component, file) => {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} not found in component`);
  }

  const styles = fs.readFileSync(file);
  const found = styles.toString().match(new RegExp(`--${component}-*\\S*`, 'g'));

  const results = [];
  found.forEach(item => {
    let prop = item.slice(0, -1);
    if (results.indexOf(prop) === -1) {
      results.push(prop);
    }
  });

  return results.sort();
};

/**
 * Returns an array with the CSS properties and its description and default value found in the component's HTML (markdown table).
 * @param  {String} component Component's name
 * @return {Array}            List of objects with the CSS property name ('Custom property'), the description ('Description') and default value ('Default')
 */
const getCSSApiFromHtml = (component) => {
  const results = [];

  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(`${component}.html`)
  });

  return new Promise(resolve => {
    lineReader.on('line', line => {
      if (line.match(new RegExp(`--${component}-*\\S*`, 'g'))) {
        let cssPropDescription = line.split('|').filter(item => item.length > 0);
        if (cssPropDescription.length > 2) {
          results.push({
            'Custom property': cssPropDescription[0].trim(),
            'Description': cssPropDescription[1].trim(),
            'Default': cssPropDescription[2].trim()
          });
        }
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

/**
 * Returns an object with the updated list of CSS properties (result), removed properties (removed) and new ones (added).
 * @param  {Array} cssProps List of CSS properties.
 * @param  {Array} cssDocs  List of CSS properties and its descriptions found in the HTML markdown.
 * @return {Object}         Object with the updated list of properties to be written in a markdown table (result), removed properties (removed) and new properties (added).
 */
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

/**
 * Logs the updated CSS API in a markdown table as well as new and removed properties.
 * @param  {Array} result List of CSS properties with descriptions and default values (markdown), removed and added properties.
 */
const printResult = (result) => {
  console.log(chalk.yellow.inverse('\n Your CSS API formatted as a markdown table: \n'));
  const mdTable = require('array-to-table')(result.result, null, 'left');
  mdTable.split('\n').forEach(line => {
    if (result.added.indexOf(line.split('|')[0].trim()) > -1) {
      console.log(chalk.green(line));
    } else {
      console.log(line);
    }
  });

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

/**
 * Prints a markdown table with the component CSS properties.
 * @param  {String} component Component's name
 */
const updateCSSDocs = (component) => {
  getCSSApiFromHtml(component)
    .then(result => mergeResult(getCSSApi(component, `${component}-styles.html`), result))
    .then(result => printResult(result))
    .catch(error => console.log(chalk.red(error)));
};

module.exports = {
  getCSSApi,
  getCSSApiFromHtml,
  updateCSSDocs
};
