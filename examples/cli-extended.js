'use strict'

function sayHello (rinvoke, opts, next) {
  rinvoke.register('hello', (req, reply) => {
    reply(null, { hello: 'world' })
  })

  next()
}

module.exports = sayHello
