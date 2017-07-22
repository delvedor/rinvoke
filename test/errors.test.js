'use strict'

const t = require('tap')
const beforeEach = t.beforeEach
const test = t.test
const Server = require('../lib/server')
const Client = require('../lib/client')
const getPort = require('./get-port')

var port = 0

beforeEach(done => {
  getPort((err, p) => {
    if (err) throw err
    port = p
    done()
  })
})

test('reply should send errors', t => {
  t.plan(4)
  const addr = 'tcp://127.0.0.1:' + port
  const server = Server()

  server.register('cmd:concat', function (a, b, reply) {
    reply(new Error('argh!'), null)
  })

  server.run(addr, err => {
    t.error(err)

    const client = Client()

    client.connect(addr)
    client.invoke('cmd:concat', 'a', 'b', (err, res) => {
      t.ok(err)
      t.equal(res, 'null')
      client.close()
      server.close(t.error)
    })
  })
})

test('server assertions', t => {
  t.plan(7)
  const server = Server()

  try {
    server.register(null, () => {})
    t.fail()
  } catch (e) {
    t.is(e.message, 'key must be a string')
  }

  try {
    server.register('', null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'fn must be a function')
  }

  try {
    server.run(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'address should be a string')
  }

  try {
    server.parser(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'parser must be a function')
  }

  try {
    server.serializer(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'serializer must be a function')
  }

  try {
    server.errorSerializer(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'serializer must be a function')
  }

  server.close(t.error)
})

test('client assertions', t => {
  t.plan(4)
  const client = Client()

  try {
    client.connect(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'address should be a string')
  }

  try {
    client.parser(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'parser must be a function')
  }

  try {
    client.serializer(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'serializer must be a function')
  }

  try {
    client.errorParser(null)
    t.fail()
  } catch (e) {
    t.is(e.message, 'parser must be a function')
  }

  client.close()
})
