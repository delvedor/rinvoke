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
  t.plan(6)
  const addr = 'tcp://127.0.0.1:' + port
  const server = Server()

  server.use((instance, opts, next) => {
    t.ok(instance instanceof Server)
    instance.concat = (a, b) => a + b
    next()
  })

  server.register('cmd:concat', function (a, b, reply) {
    t.ok(this.concat)
    reply(null, this.concat(a, b))
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

test('close event', t => {
  t.plan(2)
  const server = Server()

  server
    .use((instance, opts, next) => {
      instance.on('close', i => {
        t.ok(i instanceof Server)
      })
      next()
    })
    .after(() => {
      server.close(t.error)
    })
})
