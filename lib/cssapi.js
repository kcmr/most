'use strict';

const fs = require('fs');
const chalk = require('chalk');
const markdownTable = require('markdown-table');

/**
 * Returns an array with the CSS custom properties and mixins found in a file.
 * @param  {String} file      File where the CSS properties will be found.
 * @param  {String} namespace CSS namespace. Eg.: `some-component` will find vars starting with `--some-component`.
 * @return {Array}            List of CSS properties sorted alphabetically.
 */

const getCSSApi = (file, namespace) => {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} not found in component`);
  }

  if (!namespace) {
    // Use the file name without extension if namespace is not specified.
    // This is the most common pattern in Web Components.
    namespace = file.slice(file.lastIndexOf('/') + 1).replace(/\.\w*/, '');
  }

  const styles = fs.readFileSync(file);
  const found = styles.toString().match(new RegExp(`--${namespace}(-*\\w*)*`, 'g'));

  if (!found) {
    throw new Error(`Style properties not found in ${file}.`);
  }

  const results = found.filter((prop, index) => found.indexOf(prop) === index).sort();
  return results;
};

/**
 * Returns an array with the CSS properties and its description and default value found in the component's HTML (markdown table).
 * @param  {String} component Component's name
 * @param  {String} file      File where the docs will be searched. Default: <component>.html
 * @return {Array}            List of objects with the CSS property name ('Custom property'), the description ('Description') and default value ('Default')
 */
const getCSSApiFromMarkdownInFile = (component, file = `${component}.html`) => {
  const results = [];

  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(file)
  });

  return new Promise(resolve => {
    lineReader
      .on('line', line => {
        if (line.match(new RegExp(`--${component}(-*\\w*)*`, 'g'))) {
          let cssPropDescription = line.split('|').filter(item => item.length > 0);
          if (cssPropDescription.length > 2) {
            results.push([
              cssPropDescription[0].trim(),
              cssPropDescription[1].trim(),
              cssPropDescription[2].trim()
            ]);
          }
        }
      })
      .on('close', () => {
        if (!results.length) {
          // TODO: the second part of the message should not be there (CLI responsibility).
          console.log(chalk.yellow(`\nWarning: CSS docs not found in ${file}. Did you forget --docs option?`));
        }

        resolve(results);
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
    let found = cssDocs.find(item => item[0].trim().replace(/(?!-)\W/g, '') === prop);
    if (found) {
      result.push(found);
    } else {
      if (cssDocs.length) {
        added.push(prop);
      }
      result.push([prop.trim()]);
    }
  });

  cssDocs.forEach(prop => {
    if (cssProps.indexOf(prop[0].trim().replace(/(?!-)\W/g, '')) === -1) {
      removed.push(prop[0]);
    }
  });

  return {result, added, removed};
};

/**
 * Logs the updated CSS API in a markdown table as well as new and removed properties.
 * @param  {Array} result List of CSS properties with descriptions and default values (markdown), removed and added properties.
 */
const printResult = result => {
  console.log(chalk.yellow.inverse('\n Your CSS API formatted as a markdown table: \n'));
  const tableData = [...result.result];
  tableData.unshift(['Custom Property', 'Description', 'Default']);
  const mdTable = markdownTable(tableData);

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
 * @param  {String} stylesFile      File where the CSS properties will be searched
 * @param  {String} docsFile        File where the CSS docs will be searched. Default: <component>.html
 */
const updateCSSDocs = (component, stylesFile, docsFile) => {
  getCSSApiFromMarkdownInFile(component, docsFile)
    .then(result => mergeResult(getCSSApi(stylesFile, component), result))
    .then(result => printResult(result))
    .catch(error => console.log(chalk.red(error)));
};

module.exports = {
  getCSSApi,
  getCSSApiFromMarkdownInFile,
  updateCSSDocs
};
