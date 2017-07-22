'use strict'

const test = require('tap').test
const Server = require('../lib/server')
const Client = require('../lib/client')
const msgpack = require('msgpack5')()

test('use msgpack5 as custom serializer/parser', t => {
  t.plan(5)
  const addr = 'tcp://127.0.0.1:3030'
  const payload = { hello: 'world' }
  const server = Server()

  server.serializer(msgpack.encode)
  server.parser(msgpack.decode)
  server.register('hello', function (data, reply) {
    t.same(data, payload)
    reply(null, data)
  })

  server.run(addr, err => {
    t.error(err)

    const client = Client()

    client.connect(addr)
    client.serializer(msgpack.encode)
    client.parser(msgpack.decode)

    client.invoke('hello', payload, (err, res) => {
      t.error(err)
      t.same(res, { hello: 'world' })
      client.close()
      server.close(t.error)
    })
  })
})

test('use JSON as custom serializer/parser', t => {
  t.plan(5)
  const addr = 'tcp://127.0.0.1:3030'
  const payload = { hello: 'world' }
  const server = Server()

  server.serializer(JSON.stringify)
  server.parser(JSON.parse)
  server.register('cmd:concat', (data, reply) => {
    t.same(data, payload)
    reply(null, data)
  })

  server.run(addr, err => {
    t.error(err)

    const client = Client()

    client.connect(addr)
    client.serializer(JSON.stringify)
    client.parser(JSON.parse)

    client.invoke('cmd:concat', payload, (err, res) => {
      t.error(err)
      t.same(res, payload)
      client.close()
      server.close(t.error)
    })
  })
})
