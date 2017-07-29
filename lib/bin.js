#! /usr/bin/env node

'use strict'

const path = require('path')
const minimist = require('minimist')
const Server = require('./server')
const version = require('../package.json').version

function start (opts, callback) {
  /* istanbul ignore if */
  if (opts.help) {
    console.log(`# Rinvoke v${version} #

--port       -p      # default 3000
--address    -a      # default 127.0.0.1
--path       -P      # path of the ipc web socket
--name       -n      # name of your exported function
`)
    return
  }

  var fn = null
  try {
    fn = require(path.resolve(process.cwd(), opts._[0]))
  } catch (e) {
    /* istanbul ignore next */
    console.log(`Cannot find the specified file: '${opts._[0]}'`)
    /* istanbul ignore next */
    process.exit(1)
  }

  const server = Server(opts)
  if (opts.name) {
    server.register(opts.name, fn)
  } else {
    server.use(fn)
  }

  server.listen(opts.port, err => {
    /* istanbul ignore if */
    if (err) throw err
    /* istanbul ignore else */
    if (callback) {
      callback(server)
    } else {
      console.log(`Function listening at ${opts.port}`)
    }
  })
}

/* istanbul ignore next */
function cli () {
  start(minimist(process.argv.slice(2), {
    integer: ['port'],
    alias: {
      port: 'p',
      help: 'h',
      address: 'a',
      path: 'P',
      name: 'n'
    },
    default: {
      port: 3000,
      host: '127.0.0.1'
    }
  }))
}

/* istanbul ignore if */
if (require.main === module) {
  cli()
}

module.exports = { start }
