'use strict'

const debug = require('debug')('rinvoke-client')
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

  assert(opts, 'Missing client options')
  this._opts = opts
  this._opts.host = this._opts.host || '127.0.0.1'
  this._opts.codec = this._opts.codec || {
    encode: JSON.stringify,
    decode: JSON.parse
  }

  this._reconnect = !!this._opts.reconnect
  if (typeof this._opts.reconnect !== 'object') {
    this._opts.reconnect = {}
  }
  this._reconnectAttempts = this._opts.reconnect.attempts || 3
  this._reconnectTimeout = this._opts.reconnect.timeout || 1000
  this._reconnectAttemptsCount = 0

  this._socket = null
  this._client = null

  this.ready(runClient)
  this.isReady = false
  this.isClosing = false

  this.onClose(instance => {
    debug('on close')
    instance.isClosing = true
    instance._socket.end()
    instance._client.destroy()
  })
}

function runClient (err, context, done) {
  /* istanbul ignore if */
  if (err) throw err
  if (context._opts.path) {
    debug('run the ipc client')
    context._socket = net.connect(context._opts.path)
  } else {
    debug('run the tcp client')
    context._socket = net.connect(context._opts.port, context._opts.host)
  }
  context._client = tentacoli(context._opts)
  pump(context._socket, context._client, context._socket)

  context._socket.on('connect', handleConnect)
  function handleConnect () {
    debug('connected to the server')
    context.isReady = true
    context._reconnectAttemptsCount = 0
    context.emit('connect')
    done()
  }

  context._socket.on('timeout', handleTimeout)
  /* istanbul ignore next */
  function handleTimeout () {
    debug('socket timeout event')
    handleReconnect(() => {
      context.close()
      context.emit('timeout')
    })
  }

  context._socket.on('error', handleError)
  /* istanbul ignore next */
  function handleError (err) {
    debug('socket error event', err)
    handleReconnect(() => {
      context.close()
      context.emit('error', err)
    })
  }

  context._socket.on('close', handleClose)
  /* istanbul ignore next */
  function handleClose () {
    debug('socket close event')
    if (context.isClosing) return
    handleReconnect(() => {
      context.close()
      context.emit('close')
    })
  }

  context._client.on('error', handleTError)
  /* istanbul ignore next */
  function handleTError (err) {
    debug('tentacoli error event', err)
    handleReconnect(() => {
      context.close()
      context.emit('error', err)
    })
  }

  function handleReconnect (cb) {
    if (!context._reconnect) {
      cb()
    } else if (context._reconnectAttemptsCount++ >= context._reconnectAttempts) {
      cb()
    } else {
      debug('remove listeners before try reconnect')
      context._socket.removeListener('connect', handleConnect)
      context._socket.removeListener('timeout', handleTimeout)
      context._socket.removeListener('error', handleError)
      context._socket.removeListener('close', handleClose)
      context._client.removeListener('error', handleTError)

      context._socket.destroy()
      context._client.destroy()
      context._socket = null
      context._client = null
      context.isReady = false

      setTimeout(() => {
        debug('try reconnect')
        runClient(null, context, () => {})
      }, context._reconnectTimeout)
    }
  }
}

inherits(Client, EE)

Client.prototype.invoke = promisify(function invoke (opts, cb) {
  assert(typeof opts.procedure === 'string', 'Procedure must be a string')

  if (!this.isReady) {
    debug('client not ready yet, wait for connect')
    this.once('connect', () => {
      debug('invoke', opts)
      this._client.request(opts, cb)
    })
    return
  }

  debug('invoke', opts)
  this._client.request(opts, cb)
})

Client.prototype.timeout = function timeout (t) {
  assert(typeof t === 'number', 'timeout must be a number')
  debug('set timeout', t)

  if (!this.isReady) {
    this.once('connect', () => {
      this._socket.setTimeout(t)
    })
    return
  }

  this._socket.setTimeout(t)
}

Client.prototype.keepAlive = function timeout (bool) {
  assert(typeof bool === 'boolean', 'keepAlive must be a boolean')
  debug('set keep alive', bool)

  if (!this.isReady) {
    this.once('connect', () => {
      this._socket.setKeepAlive(bool)
    })
    return
  }

  this._socket.setKeepAlive(bool)
}

module.exports = Client
