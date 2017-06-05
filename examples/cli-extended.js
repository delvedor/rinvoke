'use strict'

function sayHello (rinvoke, opts, next) {
  rinvoke
    .serializer(JSON.stringify)
    .parser(JSON.parse)

  rinvoke.register('hello', reply => {
    reply(null, { hello: 'world' })
  })

  next()
}

module.exports = sayHello
