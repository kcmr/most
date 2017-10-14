#! /usr/bin/env node

const yargs = require('yargs');
const component = require('path').basename(process.cwd());

const commands = {
  'css-api': () => require('../lib/cssapi').updateCSSDocs(component),
  'public-api': () => require('../lib/apidocs').writeApi(component)
};

const argv = yargs
  .command('css-api', 'Prints a markdown table with the CSS API of the component')
  .command('public-api', 'Writes a file (public-api.json) with the public API of the component')
  .demandCommand()
  .help()
  .argv;

if (commands[argv._[0]]) {
  commands[argv._[0]]();
} else {
  console.log('Unknown command. Run "most help" for a list of available commands.');
}

