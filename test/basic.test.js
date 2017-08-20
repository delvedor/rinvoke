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

test('should register a function and reply to the request', t => {
  t.plan(8)
  const server = Server()

  server.register('concat', (req, reply) => {
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

test('should register a function and reply to the request (multiple)', t => {
  t.plan(13)
  const server = Server()

  server.register('concat', (req, reply) => {
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
})

test('should register a function and reply to the request - error', t => {
  t.plan(5)
  const server = Server()

  server.register('concat', (req, reply) => {
    reply(new Error('some error'), null)
  })

  server.listen(port, err => {
    t.error(err)

    const client = Client({ port })

    client.invoke({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    }, (err, res) => {
      t.equal(err.message, 'some error')
      t.equal(res, null)
      client.close(t.error)
      server.close(t.error)
    })
  })
})

test('function not found', t => {
  t.plan(5)
  const server = Server()

  server.listen(port, err => {
    t.error(err)

    const client = Client({ port })

    client.invoke({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    }, (err, res) => {
      t.equal(err.message, '404')
      t.equal(res, null)
      client.close(t.error)
      server.close(t.error)
    })
  })
})

test('should register a function and reply to the request (promises - resolve)', t => {
  t.plan(5)
  const server = Server()

  server.register('concat', (req, reply) => {
    const p = new Promise((resolve, reject) => {
      resolve(req.a + req.b)
    })
    return p
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

test('should register a function and reply to the request (promises - reject)', t => {
  t.plan(5)
  const server = Server()

  server.register('concat', (req, reply) => {
    const p = new Promise((resolve, reject) => {
      reject(new Error('some error'))
    })
    return p
  })

  server.listen(port, err => {
    t.error(err)

    const client = Client({ port })

    client.invoke({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    }, (err, res) => {
      t.equal(err.message, 'some error')
      t.equal(res, null)
      client.close(t.error)
      server.close(t.error)
    })
  })
})

test('client should set timeout and keep alive', t => {
  t.plan(8)
  const server = Server()

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(null, req.a + req.b)
  })

  server.listen(port, err => {
    t.error(err)

    const client = Client({ port })

    client.timeout(500)
    client.keepAlive(true)

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

test('client should set timeout and keep alive / 2', t => {
  t.plan(8)
  const server = Server()

  server.register('concat', (req, reply) => {
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

      client.timeout(500)
      client.keepAlive(true)

      client.close(t.error)
      server.close(t.error)
    })
  })
})

test('async await support', t => {
  if (Number(process.versions.node[0]) >= 8) {
    require('./async-await')(t.test, port)
  } else {
    t.pass('Skip because Node version < 8')
  }
  t.end()
})

test('listen should work even without a callback', t => {
  t.plan(7)
  const server = Server()

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(null, req.a + req.b)
  })

  server.listen(port)

  server.on('listening', () => {
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

test('should accept a port and an address', t => {
  t.plan(7)
  const server = Server()

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(null, req.a + req.b)
  })

  server.listen(port, '127.0.0.1')

  server.on('listening', () => {
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

test('fire and forget', t => {
  t.plan(6)
  const server = Server()
  var client = null

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    client.close(t.error)
    server.close(t.error)
  })

  server.listen(port, err => {
    t.error(err)

    client = Client({ port })

    client.fire({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    })
  })
})

test('fire and forget (multiple)', t => {
  t.plan(9)
  const server = Server()
  var client = null
  var check = false

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    if (check) {
      client.close(t.error)
      server.close(t.error)
    } else {
      check = true
    }
  })

  server.listen(port, err => {
    t.error(err)

    client = Client({ port })

    client.fire({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    })

    setTimeout(() => {
      client.fire({
        procedure: 'concat',
        a: 'a',
        b: 'b'
      })
    }, 500)
  })
})

test('fire and forget with cb', t => {
  t.plan(7)
  const server = Server()
  var client = null

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    client.close(t.error)
    server.close(t.error)
  })

  server.listen(port, err => {
    t.error(err)

    client = Client({ port })

    client.fire({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    }, t.error)
  })
})

test('fire and forget with cb, should not care abotu reply', t => {
  t.plan(7)
  const server = Server()
  var client = null

  server.register('concat', (req, reply) => {
    t.equal(req.a, 'a')
    t.equal(req.b, 'b')
    t.is(typeof reply, 'function')
    reply(new Error('kaboom'))
    client.close(t.error)
    server.close(t.error)
  })

  server.listen(port, err => {
    t.error(err)

    client = Client({ port })

    client.fire({
      procedure: 'concat',
      a: 'a',
      b: 'b'
    }, t.error)
  })
})
