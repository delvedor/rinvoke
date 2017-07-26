'use strict'

const msgpack = require('msgpack5')()
const server = require('../lib/server')({
  codec: msgpack
})
const Client = require('../lib/client')

// register a new function
server.register('concat', (req, reply) => reply(null, req.a + req.b))

// run the listener
server.listen(3030, err => {
  if (err) throw err

  // connect to the listener
  const client = Client({
    port: 3030,
    codec: msgpack
  })
  // invoke the remote function
  client.invoke({
    procedure: 'concat',
    a: 'a',
    b: 'b'
  }, (err, res) => {
    if (err) console.log(err)
    console.log('concat:', res)
    // close the connections
    server.close(err => { if (err) throw err })
    client.close(err => { if (err) throw err })
  })
})
