'use strict'

const t = require('tap')
const beforeEach = t.beforeEach
const test = t.test
const Server = require('../lib/server')
const Client = require('../lib/client')
const msgpack = require('msgpack5')()
const getPort = require('./get-port')

var port = 0

beforeEach(done => {
  getPort((err, p) => {
    if (err) throw err
    port = p
    done()
  })
})

test('use msgpack5 as custom serializer/parser', t => {
  t.plan(6)
  const payload = { procedure: 'hello', hello: 'world' }
  const server = Server({
    codec: msgpack
  })

  server.register('hello', function (req, reply) {
    t.deepEqual(req, payload)
    reply(null, req)
  })

  server.listen(port, err => {
    t.error(err)

    const client = Client({
      port: port,
      codec: msgpack
    })

    client.invoke(payload, (err, res) => {
      t.error(err)
      t.deepEqual(res, payload)
      client.close(t.error)
      server.close(t.error)
    })
  })
})
