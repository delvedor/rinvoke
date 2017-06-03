'use strict'

const test = require('tap').test
const Server = require('../lib/server')
const Client = require('../lib/client')

test('server methods', t => {
  t.plan(5)
  const server = Server()
  t.ok(server.run)
  t.ok(server.register)
  t.ok(server.close)
  t.ok(server.parser)
  t.ok(server.serializer)
  server.close()
})

test('client methods', t => {
  t.plan(5)
  const client = Client()
  t.ok(client.connect)
  t.ok(client.invoke)
  t.ok(client.close)
  t.ok(client.parser)
  t.ok(client.serializer)
  client.close()
})

test('should register a function and reply to the request', t => {
  t.plan(5)
  const addr = 'tcp://127.0.0.1:3030'
  const server = Server()

  server.register('cmd:concat', (a, b, reply) => {
    t.equal(a, 'a')
    t.equal(b, 'b')
    t.is(typeof reply, 'function')
    reply(a + b)
  })

  server.run(addr, err => {
    t.error(err)

    const client = Client()

    client.connect(addr)
    client.invoke('cmd:concat', 'a', 'b', res => {
      t.equal(res, 'ab')
      client.close()
      server.close()
    })
  })
})

test('custom serializer and parser', t => {
  t.plan(3)
  const addr = 'tcp://127.0.0.1:3030'
  const payload = { hello: 'world' }
  const server = Server()

  server.serializer(JSON.stringify)
  server.parser(JSON.parse)
  server.register('cmd:concat', (data, reply) => {
    t.same(data, payload)
    reply(data)
  })

  server.run(addr, err => {
    t.error(err)

    const client = Client()
    client.serializer(JSON.stringify)
    client.parser(JSON.parse)

    client.connect(addr)
    client.invoke('cmd:concat', payload, res => {
      t.same(res, payload)
      client.close()
      server.close()
    })
  })
})
