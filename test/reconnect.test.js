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

test('the client should try to reconnect before emit an error', t => {
  t.plan(7)

  setTimeout(() => {
    const server = Server()
    server.register('concat', (req, reply) => {
      t.equal(req.a, 'a')
      t.equal(req.b, 'b')
      t.is(typeof reply, 'function')
      reply(null, req.a + req.b)
    })

    server.listen(port, t.error)
    server.on('connection', server.close)
  }, 1000)

  const client = Client({
    port: port,
    reconnect: {
      timeout: 1500
    }
  })

  client.on('error', () => {
    t.fail('should not error')
  })

  client.invoke({
    procedure: 'concat',
    a: 'a',
    b: 'b'
  }, (err, res) => {
    t.error(err)
    t.equal(res, 'ab')
    client.close(t.error)
  })
})

test('client reconnect fail', t => {
  t.plan(1)

  const client = Client({
    port: port,
    reconnect: {
      timeout: 100
    }
  })

  client.on('error', () => {
    t.pass('should error')
  })
})

test('client without reconnect', t => {
  t.plan(1)

  const client = Client({
    port: port
  })

  client.on('error', () => {
    t.pass('should error')
  })
})
