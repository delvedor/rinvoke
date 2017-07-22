'use strict'

const test = require('tap').test
const Server = require('../lib/server')
const Client = require('../lib/client')

test('server methods', t => {
  t.plan(10)
  const server = Server()
  t.ok(server.run)
  t.ok(server.register)
  t.ok(server.close)
  t.ok(server.parser)
  t.ok(server.serializer)
  t.ok(server.errorSerializer)
  t.ok(server.use)
  t.ok(server.ready)
  t.ok(server.after)
  server.close(t.error)
})

test('client methods', t => {
  t.plan(7)
  const client = Client()
  t.ok(client.connect)
  t.ok(client.invoke)
  t.ok(client.close)
  t.ok(client.disconnect)
  t.ok(client.parser)
  t.ok(client.errorParser)
  t.ok(client.serializer)
  client.close()
})

test('should register a function and reply to the request', t => {
  t.plan(7)
  const addr = 'tcp://127.0.0.1:3030'
  const server = Server()

  server.register('cmd:concat', (a, b, reply) => {
    t.equal(a, 'a')
    t.equal(b, 'b')
    t.is(typeof reply, 'function')
    reply(null, a + b)
  })

  server.run(addr, err => {
    t.error(err)

    const client = Client()

    client.connect(addr)
    client.invoke('cmd:concat', 'a', 'b', (err, res) => {
      t.error(err)
      t.equal(res, 'ab')
      client.close()
      server.close(t.error)
    })
  })
})

test('async await support', t => {
  if (Number(process.versions.node[0]) >= 8) {
    require('./async-await')(t.test)
  } else {
    t.pass('Skip because Node version < 8')
  }
  t.end()
})
