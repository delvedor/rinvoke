'use strict'

const server = require('./lib/server')()
const client = require('./lib/client')()

// register a new function
server.register('cmd:concat', (a, b, reply) => reply(a + b))

// run the listener
server.run('tcp://127.0.0.1:3030', err => {
  if (err) throw err

  // connect to the listener
  client.connect('tcp://127.0.0.1:3030')
  // invoke the remote function
  client.invoke('cmd:concat', 'a', 'b', res => {
    console.log('concat:', res)
    // close the connections
    server.close()
    client.close()
  })
})
