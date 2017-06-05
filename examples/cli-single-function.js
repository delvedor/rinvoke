'use strict'

function sayHello (reply) {
  reply(null, 'hello!')
}

module.exports = sayHello
module.exports.key = 'hello'
