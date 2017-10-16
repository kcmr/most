#! /usr/bin/env node

const fs = require('fs');
const findUp = require('find-up');
const yargs = require('yargs');
const component = require('path').basename(process.cwd());
const configPath = findUp.sync('.mostrc');
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};

const argv = yargs
  .config(config['css-api'])
  .command('css-api', 'Prints a markdown table with the CSS API of the component', {
    file: {
      describe: 'File where the CSS properties will be searched',
      demand: true,
      alias: 'f'
    },
    docs: {
      describe: 'File where the CSS docs in markdown format will be searched',
      alias: 'd'
    }
  })
  .command('public-api', 'Writes a file (public-api.json) with the public API of the component')
  .demandCommand()
  .help()
  .argv;

const commands = {
  'css-api': () => require('../lib/cssapi').updateCSSDocs(component, argv.file.replace('{{component}}', component), argv.docs),
  'public-api': () => require('../lib/apidocs').writeApi(component)
};

if (commands[argv._[0]]) {
  commands[argv._[0]](argv);
} else {
  console.log('Unknown command. Run "most help" for a list of available commands.');
}

