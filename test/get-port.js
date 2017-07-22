'use strict'

const net = require('net')

function getPort (cb) {
  const server = net.createServer()

  server.unref()
  server.on('error', err => {
    cb(err, null)
  })

  server.listen(0, () => {
    const port = server.address().port
    server.close(() => {
      cb(null, port)
    })
  })
}

module.exports = getPort
