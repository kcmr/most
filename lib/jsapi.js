const fs = require('fs');
const {Analyzer, FSUrlLoader} = require('polymer-analyzer');


let analyzer = new Analyzer({
  urlLoader: new FSUrlLoader('.'),
});

const parseValue = (value) => {
  let parsed;
  try {
    parsed = value === '{}' ? JSON.parse(value) : eval(value);
  } catch (e) {
    parsed = JSON.parse(value);
  };

  return parsed;
};

const getJsApi = (component) => {
  return new Promise((resolve, reject) => {
    analyzer.analyze([`./${component}.html`]).then(analysis => {
      const [componentAnalysis] = analysis.getFeatures({
        kind: 'element',
        id: component,
        externalPackages: false
      });
  
      const results = {
        properties: [],
        methods: [],
        events: []
      };
  
      if (componentAnalysis) {
        for (const [name, property] of componentAnalysis.properties) {
          if (!property.inheritedFrom && property.privacy === 'public') {
            results.properties.push({
              name: name,
              description: property.description,
              value: parseValue(property.default),
              type: property.type
            });
          }
        }

        for (const [name, property] of componentAnalysis.methods) {
          if (!property.inheritedFrom && property.privacy === 'public') {
            results.methods.push({
              name: name,
              description: property.description,
              params: property.params
            });
          }
        }

        for (const [name, property] of componentAnalysis.events) {
          results.events.push({
            name: name,
            params: property.params
          });
        }
      } else {
        throw new Error('The component does not seem to have any propety, method or event.');
      }

      resolve(results);
    });
  });
};

module.exports = {
  getJsApi
};