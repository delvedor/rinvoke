'use strict'

const assert = require('assert')
const zmq = require('zmq')
const Bloomrun = require('bloomrun')
const tinysonic = require('tinysonic')
const avvio = require('avvio')
const noop = err => { if (err) throw err }

function Server () {
  if (!(this instanceof Server)) {
    return new Server()
  }

  avvio(this)
  this._bloomrun = Bloomrun()
  this._socket = zmq.socket('rep')

  this._socket.on('message', this._onMessage.bind(this))

  this._serializer = payload => payload
  this._parser = payload => payload.toString()
}

Server.prototype.register = function (key, fn) {
  assert(typeof key === 'string', 'key must be a string')
  assert(typeof fn === 'function', 'fn must be a function')
  this._bloomrun.add(tinysonic(key) || key, fn)
  return this
}

Server.prototype.run = function (address, cb) {
  assert(typeof address === 'string', 'address should be a string')
  cb = cb || noop
  this.ready(() => {
    try {
      this._socket.bindSync(address)
      cb(null)
    } catch (err) {
      cb(err)
    }
  })
}

Server.prototype.parser = function (parser) {
  assert(typeof parser === 'function', 'parser must be a function')
  this._parser = parser
  return this
}

Server.prototype.serializer = function (serializer) {
  assert(typeof serializer === 'function', 'serializer must be a function')
  this._serializer = serializer
  return this
}

Server.prototype._onMessage = function () {
  const args = new Array(arguments.length - 1)
  const pattern = arguments[0].toString()
  for (var i = 1; i < args.length; i++) {
    args[i] = this._parser(arguments[i])
  }
  args.shift()
  args.push(reply.bind(this))
  const id = arguments[arguments.length - 1].toString()

  const fn = this._bloomrun.lookup(tinysonic(pattern) || pattern)
  fn.apply(this, args)

  function reply (payload, opts) {
    this._socket.send([this._serializer(payload, opts), id])
  }
}

Server.prototype.close = function () {
  this._socket.close()
}

module.exports = Server
