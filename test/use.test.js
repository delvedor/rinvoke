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

test('use can add methods to the instance', t => {
  t.plan(7)
  const server = Server()

  server.use((instance, opts, next) => {
    t.ok(instance instanceof Server)
    instance.concat = (a, b) => a + b
    next()
  })

  server.register('concat', function (req, reply) {
    t.ok(this.concat)
    reply(null, this.concat(req.a, req.b))
  })

  server.listen(port, err => {
    t.error(err)

    const client = Client({ port })

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

test('close event', t => {
  t.plan(1)
  const server = Server()

  server
    .use((instance, opts, next) => {
      instance.onClose(i => {
        t.ok(i instanceof Server)
      })
      next()
    })
    .after(() => {
      server.close()
    })
})
