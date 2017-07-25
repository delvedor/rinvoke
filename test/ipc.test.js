'use strict'

const fs = require('fs')
const t = require('tap')
const beforeEach = t.beforeEach
const test = t.test
const Server = require('../lib/server')
const Client = require('../lib/client')

const socket = '/tmp/ipc-test.sock'

beforeEach(done => {
  fs.unlink(socket, () => done())
})

test('Should communicate via ipc', t => {
  t.plan(8)
  const server = Server()

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(null, req.a + req.b)
  })

  server.listen(socket, err => {
    t.error(err)

    const client = Client({ path: socket })

    client.invoke({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    }, (err, res) => {
      t.error(err)
      t.equal(res, 'ab')
      client.close(t.error)
      server.close(t.error)
    })
  })
})
