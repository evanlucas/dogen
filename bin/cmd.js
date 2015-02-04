#!/usr/bin/env node

var dogen = require('../')
  , args = process.argv.splice(2)
  , fs = require('fs')
  , cwd = process.cwd()
  , path = require('path')
  , fp

if (args.length) {
  fp = path.resolve(args.shift())
} else {
  fp = path.resolve('.')
}

var stats

try {
  stats = fs.statSync(fp)
}
catch (err) {
  console.error('ERR: cannot stat %s', fp)
  usage()
  process.exit(1)
}

if (stats.isDirectory()) {
  // read dir and parse each file
} else {
  // only parse fp
}

function usage() {
  console.log('usage: dogen [file|dir]')
}
