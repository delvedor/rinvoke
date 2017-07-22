'use strict'

const Server = require('../lib/server')
const Client = require('../lib/client')
const sleep = require('then-sleep')

function asyncTest (test) {
  test('should support async await', t => {
    t.plan(6)
    const addr = 'tcp://127.0.0.1:3030'
    const server = Server()

    server.register('cmd:concat', async (a, b) => {
      t.equal(a, 'a')
      t.equal(b, 'b')
      await sleep(200)
      return a + b
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
}

module.exports = asyncTest
