'use strict'

const server = require('../lib/server')()
const Client = require('../lib/client')

server.use((instance, opts, next) => {
  instance.concat = (a, b) => a + b
  next()
})
// register a new function
server.register('concat', (req, reply) => {
  reply(null, server.concat(req.a, req.b))
})

// run the listener
server.listen(3030, err => {
  if (err) throw err

  // connect to the listener
  const client = Client({ port: 3030 })
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
