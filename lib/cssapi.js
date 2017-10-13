const fs = require('fs');
const component = require('path').basename(process.cwd());


const getCSSApi = () => {
  // TODO: make configurable
  const styles = fs.readFileSync(`${component}-styles.html`);
  const found = styles.toString().match(new RegExp(`--${component}-*\\S*`, 'g'));

  let results = [];
  found.forEach(prop => results.push(prop.slice(0, -1)));

  return results.sort();
};

module.exports = {
  getCSSApi
};


