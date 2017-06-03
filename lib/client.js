'use strict'

const assert = require('assert')
const zmq = require('zmq')
const Hyperid = require('hyperid')
const Bloomrun = require('bloomrun')

function Client () {
  if (!(this instanceof Client)) {
    return new Client()
  }

  this._socket = zmq.socket('req')
  this._bloomrun = Bloomrun()
  this._hyperid = Hyperid()
  this._serializer = payload => payload
  this._parser = payload => payload.toString()
  this._socket.on('message', this._onMessage.bind(this))
}

Client.prototype.invoke = function () {
  const args = new Array(arguments.length - 1)
  const cb = arguments[arguments.length - 1]
  const cmd = arguments[0]
  for (var i = 1; i < args.length; i++) {
    args[i] = this._serializer(arguments[i])
  }
  const id = this._hyperid()
  this._bloomrun.add(id, cb)
  args[0] = cmd
  args.push(id)
  this._socket.send(args)
}

Client.prototype.connect = function (address) {
  assert(typeof address === 'string', 'address should be a string')
  this._socket.connect(address)
}

Client.prototype.parser = function (parser) {
  assert(typeof parser === 'function', 'parser must be a function')
  this._parser = parser
  return this
}

Client.prototype.serializer = function (serializer) {
  assert(typeof serializer === 'function', 'serializer must be a function')
  this._serializer = serializer
  return this
}

Client.prototype._onMessage = function () {
  const args = new Array(arguments.length - 1)
  for (var i = 0; i < args.length; i++) {
    args[i] = this._parser(arguments[i])
  }
  const id = arguments[arguments.length - 1].toString()
  const fn = this._bloomrun.lookup(id)
  this._bloomrun.remove(id)
  fn.apply(null, args)
}

Client.prototype.close = function () {
  this._socket.close()
}

module.exports = Client
