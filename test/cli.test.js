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
  t.plan(3)

  cli.start({
    protocol: 'tcp',
    address: '127.0.0.1',
    port: port,
    _: ['./examples/cli-single-function.js']
  }, server => {
    const client = Client()

    client.connect('tcp://127.0.0.1:' + port)
    client.invoke('hello', (err, res) => {
      t.error(err)
      t.equal(res, 'hello!')
      client.close()
      server.close(t.error)
    })
  })
})

test('cli extended', t => {
  t.plan(3)

  cli.start({
    protocol: 'tcp',
    address: '127.0.0.1',
    port: port,
    _: ['./examples/cli-extended.js']
  }, server => {
    const client = Client()

    client.connect('tcp://127.0.0.1:' + port)
    client.invoke('hello', (err, res) => {
      t.error(err)
      t.equal(res, JSON.stringify({ hello: 'world' }))
      client.close()
      server.close(t.error)
    })
  })
})
