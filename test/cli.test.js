'use strict'

const t = require('tap')
const beforeEach = t.beforeEach
const test = t.test
const Client = require('../lib/client')
const cli = require('../lib/bin')
const getPort = require('./get-port')

var port = 0

beforeEach(done => {
  getPort((err, p) => {
    if (err) throw err
    port = p
    done()
  })
})

test('cli single function', t => {
  t.plan(4)

  cli.start({
    host: '127.0.0.1',
    port: port,
    _: ['./examples/cli-single-function.js']
  }, server => {
    const client = Client({ port })

    client.invoke({ procedure: 'hello' }, (err, res) => {
      t.error(err)
      t.equal(res, 'hello!')
      client.close(t.error)
      server.close(t.error)
    })
  })
})

test('cli extended', t => {
  t.plan(4)

  cli.start({
    host: '127.0.0.1',
    port: port,
    _: ['./examples/cli-extended.js']
  }, server => {
    const client = Client({ port })

    client.invoke({ procedure: 'hello' }, (err, res) => {
      t.error(err)
      t.deepEqual(res, { hello: 'world' })
      client.close(t.error)
      server.close(t.error)
    })
  })
})
