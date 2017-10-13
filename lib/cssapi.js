const fs = require('fs');

const getCSSApi = (component) => {
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


