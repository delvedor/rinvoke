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

test('should validate the request object - valid', t => {
  t.plan(8)
  const server = Server()

  server.register('concat', {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string' }
    },
    required: ['a', 'b']
  }, (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(null, req.a + req.b)
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

test('should validate the request object (without required) - valid', t => {
  t.plan(8)
  const server = Server()

  server.register('concat', {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string' }
    }
  }, (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(null, req.a + req.b)
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

test('should validate the request object - not valid', t => {
  t.plan(5)
  const server = Server()

  server.register('concat', {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string' }
    },
    required: ['a', 'b']
  }, (req, reply) => {
    t.fail('this should not be called')
  })

  server.listen(port, err => {
    t.error(err)

    const client = Client({ port })

    client.invoke({
      procedure: 'concat',
      a: 'a'
    }, (err, res) => {
      t.equal(err.message, '400')
      t.is(typeof res, 'object')
      client.close(t.error)
      server.close(t.error)
    })
  })
})
