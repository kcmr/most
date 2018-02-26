#! /usr/bin/env node

'use strict';

const fs = require('fs');
const findUp = require('find-up');
const yargs = require('yargs');
const component = require('path').basename(process.cwd());
const configPath = findUp.sync('.mostrc');
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};
const cssApi = require('../lib/cssapi');
const publicApi = require('../lib/apidocs');
const commands = require('../commands/commands');
const [cssApiCommands, publicApiCommands] = Object.keys(commands);

const argv = yargs
  .config(config['css-api'])
  .command('css-api', cssApiCommands.description, cssApiCommands.params)
  .command('public-api', publicApiCommands.description)
  .demandCommand()
  .help()
  .argv;

const replacePlaceholder = (str, placeholder, replacement) => str.replace(placeholder, replacement);

// cssApi params
const {sort, docs, file} = argv;
const stylesFile = replacePlaceholder(file, '{{component}}', component);

const command = {
  'css-api': () => cssApi.updateCSSDocs(component, stylesFile, docs, sort),
  'public-api': () => publicApi.writeApi(component)
};

if (command[argv._[0]]) {
  command[argv._[0]](argv);
} else {
  console.log('Unknown command. Run "most help" for a list of available commands.');
}

