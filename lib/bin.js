#! /usr/bin/env node

'use strict'

const path = require('path')
const minimist = require('minimist')
const Server = require('./server')

function start (opts, callback) {
  if (opts.help) {
    return
  }

  var fn = null
  try {
    fn = require(path.resolve(process.cwd(), opts._[0]))
  } catch (e) {
    console.log(`Cannot find the specified file: '${opts._[0]}'`)
    process.exit(1)
  }

  const server = Server()
  if (fn.key) {
    server.register(fn.key, fn)
  } else {
    server.use(fn)
  }

  server.run(`${opts.protocol}://${opts.address}:${opts.port}`, err => {
    if (err) throw err
    if (callback) {
      callback(server)
    } else {
      console.log(`Function listening at ${opts.protocol}://${opts.address}:${opts.port}`)
    }
  })
}

function cli () {
  start(minimist(process.argv.slice(2), {
    integer: ['port'],
    alias: {
      port: 'p',
      help: 'h',
      address: 'a',
      protocol: 'P'
    },
    default: {
      port: 3000,
      address: '127.0.0.1',
      protocol: 'tcp'
    }
  }))
}

if (require.main === module) {
  cli()
}

module.exports = { start }
