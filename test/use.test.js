'use strict'

const test = require('tap').test
const Server = require('../lib/server')
const Client = require('../lib/client')

test('use can add methods to the instance', t => {
  t.plan(5)
  const addr = 'tcp://127.0.0.1:3030'
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
      server.close()
    })
  })
})

test('close event', t => {
  t.plan(1)
  const server = Server()

  server
    .use((instance, opts, next) => {
      instance.on('close', i => {
        t.ok(i instanceof Server)
      })
      next()
    })
    .after(() => {
      server.close()
    })
})
