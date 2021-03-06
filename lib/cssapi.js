'use strict';

const fs = require('fs');
const chalk = require('chalk');
const markdownTable = require('markdown-table');

const getCSSPropertiesArray = (arr) => {
  return Object.entries(arr.reduce((obj, curr) => {
    const [property, value] = curr.split(/,(.+)/); // split by first match of ','
    const cleanedValue = (value || '').trim().replace(/\)$/, ''); // remove last ')'
    if (!obj[property]) {
      obj[property] = cleanedValue;
    }
    return obj;
  }, {})).map(([property, value]) => [property, value]);
};

/**
 * Returns an array with the CSS custom properties and mixins found in a file.
 *
 * @param  {String}  file      File where the CSS properties will be found.
 * @param  {String}  namespace CSS namespace. Eg.: `some-component` will find vars starting with `--some-component`.
 * @param  {Boolean} sort      Sets whether the result should be alphabetically sorted or not.
 * @return {Array}             List of CSS properties. Properties are sorted alphabetically if sort param is set to true.
 */
const getCSSApi = (file, namespace) => {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} not found in component`);
  }

  const styles = fs.readFileSync(file);
  namespace = namespace || file.slice(file.lastIndexOf('/') + 1).replace(/\.\w*/, '');
  // match the CSS var or mixin and its default value including the last bracket ')'
  const cssPropertyWithValuePattern = new RegExp(`--${namespace}(-*\\w*)*(,(\\s|[^;}!])*)*`, 'g');
  const matchesInStyles = styles.toString().match(cssPropertyWithValuePattern);

  if (matchesInStyles) {
    return getCSSPropertiesArray(matchesInStyles);
  }

  throw new Error(`Style properties not found in ${file}.`);
};

const sortResults = (sort) => {
  return results => sort ? results.sort() : results;
};

/**
 * Returns an array with the CSS properties and its description and default value found in the component's HTML (markdown table).
 *
 * @param  {String} component Component's name
 * @param  {String} file      File where the docs will be searched. Default: <component>.html
 * @return {Array}            List of objects with the CSS property name ('Custom property'), the description ('Description') and default value ('Default')
 */
const getCSSApiFromMarkdownInFile = (component, file = `${component}.html`) => {
  const results = [];

  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(file)
  });

  return new Promise((resolve) => {
    lineReader
      .on('line', (line) => {
        if (line.match(new RegExp(`--${component}(-*\\w*)*`, 'g'))) {
          const cssPropDescription = line.split('|').filter(item => item.length > 0);
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
 *
 * @param  {Array} cssProps List of CSS properties.
 * @param  {Array} cssDocs  List of CSS properties and its descriptions found in the HTML markdown.
 * @return {Object}         Object with the updated list of properties to be written in a markdown table (result), removed properties (removed) and new properties (added).
 */
const mergeResult = (cssProps, cssDocs) => {
  const NON_WORDS_EXCEPT_DASHES = /(?!-)\W/g;
  const vars = cssProps.map(item => item[0]);
  const cleanedPropertyName = str => str.replace(NON_WORDS_EXCEPT_DASHES, '');
  const propertyInDocs = (prop) => {
    return cssDocs.find((item) => {
      return cleanedPropertyName(item[0]) === prop;
    });
  };

  const result = vars.reduce((arr, prop, index) => {
    const found = propertyInDocs(prop);
    arr.push(found || [prop.trim(), '', cssProps[index][1].trim()]);
    return arr;
  }, []);

  const added = vars.filter(prop => !propertyInDocs(prop) && cssDocs.length);

  const removed = cssDocs
    .filter(prop => vars.indexOf(cleanedPropertyName(prop[0])) === -1)
    .map(item => item[0]);

  return {result, added, removed};
};

/**
 * Logs the updated CSS API in a markdown table as well as new and removed properties.
 *
 * @param  {Array}   result List of CSS properties with descriptions and default values (markdown), removed and added properties.
 * @param  {Boolean} unformattedMdTable Sets whether the markdown table should be rendered without format (cells not aligned). Defaults to false.
 */
const printResult = (result, unformattedMdTable = false) => {
  console.log(chalk.yellow.inverse('\n Your CSS API formatted as a markdown table: \n'));
  const tableData = [...result.result];
  tableData.unshift(['Custom Property', 'Description', 'Default']);
  const mdTable = markdownTable(tableData, {
    align: ['l', 'l', 'l'],
    pad: !unformattedMdTable
  });

  mdTable.split('\n').forEach((line) => {
    if (result.added.indexOf(line.split('|')[1].trim()) > -1) {
      console.log(chalk.green(line));
    } else {
      console.log(line);
    }
  });

  if (result.added.length || result.removed.length) {
    console.log(chalk.yellow.inverse('\n API changes: \n'));
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
 *
 * @param  {String}  options.component     Component's name
 * @param  {String}  options.stylesFile    File where the CSS properties will be searched
 * @param  {String}  options.docs          File where the CSS docs will be searched. Default: <component>.html
 * @param  {Boolean} options.sort          Sets whether the resulting markdown table should be alphabetically sorted or not. Defaults to false.
 * @param  {Boolean} options.unformatted   Sets whether the markdown table should be rendered without format (cells not aligned). Defaults to false.
 */
const updateCSSDocs = ({component, stylesFile, docs, sort, unformatted}) => {
  const sortedResults = sortResults(sort);

  getCSSApiFromMarkdownInFile(component, docs)
    .then(result => mergeResult(sortedResults(getCSSApi(stylesFile, component)), result))
    .then(result => printResult(result, unformatted))
    .catch(error => console.log(chalk.red(error)));
};

module.exports = {
  getCSSApi,
  getCSSApiFromMarkdownInFile,
  updateCSSDocs
};
