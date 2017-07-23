'use strict'

const assert = require('assert')
const EE = require('events').EventEmitter
const inherits = require('util').inherits
const net = require('net')
const pump = require('pump')
const tentacoli = require('tentacoli')
const avvio = require('avvio')
const promisify = require('util.promisify')

function Client (opts) {
  if (!(this instanceof Client)) {
    return new Client(opts)
  }

  avvio(this)

  this._opts = opts || {}
  this._opts.host = this._opts.host || '127.0.0.1'
  this._opts.codec = this._opts.codec || {
    encode: JSON.stringify,
    decode: JSON.parse
  }

  this._socket = null
  this._client = null

  this.ready(runClient)
  this.isReady = false

  this.onClose(instance => {
    instance._socket.unref()
    instance._client.destroy()
  })
}

function runClient (err, context, done) {
  /* istanbul ignore if */
  if (err) throw err
  context._socket = net.connect(context._opts.port, context._opts.host)
  context._client = tentacoli(context._opts)
  pump(context._socket, context._client, context._socket)

  context._socket.on('connect', () => {
    context.isReady = true
    context.emit('connect')
    done()
  })
}

inherits(Client, EE)

Client.prototype.invoke = promisify(function invoke (opts, cb) {
  assert(typeof opts.procedure === 'string', 'Procedure must be a string')

  if (!this.isReady) {
    this.once('connect', () => {
      this._client.request(opts, cb)
    })
    return
  }

  this._client.request(opts, cb)
})

module.exports = Client
