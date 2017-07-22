'use strict'

const rinvoke = require('../index')()

rinvoke.register('cmd:concat', (a, b, reply) => reply(null, a + b))
