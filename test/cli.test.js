'use strict'

const test = require('tap').test
const Client = require('../lib/client')
const cli = require('../lib/bin')

test('cli single function', t => {
  t.plan(2)

  cli.start({
    protocol: 'tcp',
    address: '127.0.0.1',
    port: 3030,
    _: ['./examples/cli-single-function.js']
  }, server => {
    const client = Client()

    client.connect('tcp://127.0.0.1:3030')
    client.invoke('hello', (err, res) => {
      t.error(err)
      t.equal(res, 'hello!')
      client.close()
      server.close()
    })
  })
})

test('cli extended', t => {
  t.plan(2)

  cli.start({
    protocol: 'tcp',
    address: '127.0.0.1',
    port: 3030,
    _: ['./examples/cli-extended.js']
  }, server => {
    const client = Client()

    client.connect('tcp://127.0.0.1:3030')
    client.invoke('hello', (err, res) => {
      t.error(err)
      t.equal(res, JSON.stringify({ hello: 'world' }))
      client.close()
      server.close()
    })
  })
})
