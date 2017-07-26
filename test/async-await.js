'use strict'

const Server = require('../lib/server')
const Client = require('../lib/client')
const sleep = require('then-sleep')

function asyncTest (test, port) {
  test('should support async await', t => {
    t.plan(7)
    const server = Server()

    server.register('concat', async req => {
      t.equal(req.a, 'a')
      t.equal(req.b, 'b')
      await sleep(200)
      return req.a + req.b
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
}

module.exports = asyncTest
