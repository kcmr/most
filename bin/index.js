#! /usr/bin/env node

const cssapi = require('../lib/cssapi');

cssapi.updateCSSDocs(require('path').basename(process.cwd()));
