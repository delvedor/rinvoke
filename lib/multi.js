'use strict'

const debug = require('debug')('rinvoke-multi')
const Client = require('./client')
const EE = require('events').EventEmitter
const inherits = require('util').inherits

function Multi (opts) {
  if (!Array.isArray(opts)) {
    return new Client(opts)
  }

  if (!(this instanceof Multi)) {
    return new Multi(opts)
  }

  this._procedures = {}
  this._clients = []

  opts.forEach((opt, index) => {
    debug(`Connecting to server ${opt.host || '127.0.0.1'}:${opt.port}`)
    this._clients.push(Client(opt))
    this._clients[index].invoke({ procedure: '__procedures__' }, (err, res) => {
      if (err) {
        debug(`Something went wrong with client ${opt.host || '127.0.0.1'}:${opt.port}`)
        return
      }
      debug(`Connected to server ${opt.host || '127.0.0.1'}:${opt.port}`)
      for (var j = 0; j < res.length; j++) {
        debug(`Registering '${res[j]}' procedure on server ${opt.host || '127.0.0.1'}:${opt.port}`)
        this._procedures[res[j]] = index
        this.emit(`procedure-${res[j]}`)
      }
    })
  })
}

inherits(Multi, EE)

Multi.prototype.invoke = function (req, cb) {
  var client = this.getClient(req.procedure)
  if (!client) {
    this.once(`procedure-${req.procedure}`, () => {
      client = this.getClient(req.procedure)
      debug(`Invoking procedure '${req.procedure}'`)
      client.invoke(req, cb)
    })
    return
  }

  debug(`Invoking procedure '${req.procedure}'`)
  client.invoke(req, cb)
}

Multi.prototype.getClient = function (procedure) {
  var index = this._procedures[procedure]
  if (index === undefined) {
    debug(`Procedure '${procedure}' not found`)
    return null
  }

  debug(`Procedure '${procedure}' found`)
  return this._clients[index]
}

module.exports = Multi
