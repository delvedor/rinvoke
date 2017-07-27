'use strict'

const debug = require('debug')('rinvoke-server')
const assert = require('assert')
const net = require('net')
const pump = require('pump')
const tentacoli = require('tentacoli')
const avvio = require('avvio')
const EE = require('events').EventEmitter
const inherits = require('util').inherits
const Ajv = require('ajv')
const ajv = new Ajv({ coerceTypes: true })

/* istanbul ignore next */
const noop = err => { if (err) throw err }

function Server (opts) {
  if (!(this instanceof Server)) {
    return new Server(opts)
  }

  avvio(this)

  this._functions = Object.create(null)
  this._validations = Object.create(null)
  this._server = net.createServer(create.bind(this))

  /* istanbul ignore next */
  this._server.on('error', err => {
    debug('error event', err)
    this.close()
    this.emit('error', err)
  })

  this._server.on('connection', () => {
    debug('new connection')
    this.emit('connection')
  })

  this._opts = opts || {}
  this._opts.codec = this._opts.codec || {
    encode: JSON.stringify,
    decode: JSON.parse
  }

  this.onClose((instance, done) => {
    debug('on close')
    instance._server.close(done)
  })
}

inherits(Server, EE)

function create (original) {
  const stream = tentacoli(this._opts)
  pump(stream, original, stream)
  stream.on('request', handle.bind(this))

  /* istanbul ignore next */
  stream.on('error', err => {
    debug('tentacoli error', err)
    this.close()
    this.emit('error', err)
  })
}

function handle (request, reply) {
  debug('incoming request', request)
  this.emit('request', request)
  var fn = this._functions[request.procedure]
  var validate = this._validations[request.procedure]

  if (fn) {
    debug('found procedure')

    if (validate) {
      debug('validate request')
      var valid = validate(request)
      if (valid !== true) {
        debug('request not valid')
        reply(new Error('400'), valid)
        return
      }
      debug('request valid')
    }

    var result = fn.call(this, request, reply)
  } else {
    debug('procedure not found')
    reply(new Error('404'), null)
    return
  }

  if (result && result.then) {
    result
      .then(res => {
        reply.call(this, null, res)
      })
      .catch(err => {
        reply.call(this, err, null)
      })
  }
}

Server.prototype.register = function (procedure, schema, fn) {
  if (!fn) {
    fn = schema
    schema = null
  }
  assert(typeof procedure === 'string', 'procedure must be a string')
  assert(typeof schema === 'object', 'schema must be an object')
  assert(typeof fn === 'function', 'fn must be a function')
  assert(!this._functions[procedure], `You have already registered procedure '${procedure}'`)
  debug('register new procedure:', procedure)

  if (schema) {
    schema.properties.procedure = { type: 'string' }
    schema.required = schema.required || []
    schema.required.push('procedure')
    this._validations[procedure] = ajv.compile(schema)
  }

  this._functions[procedure] = fn
  return this
}

Server.prototype.listen = function (portOrPath, cb) {
  assert(typeof portOrPath === 'number' || typeof portOrPath === 'string', 'portOrPath should be a number or a string')
  cb = cb || noop

  this.ready(err => {
    debug(`Run the ${typeof portOrPath === 'number' ? 'tcp' : 'ipc'} server`)
    /* istanbul ignore if */
    if (err) return cb(err)
    this._server.listen(portOrPath, err => {
      cb(err)
      this.emit('listening')
    })
  })
}

module.exports = Server
