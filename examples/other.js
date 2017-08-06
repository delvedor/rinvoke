'use strict'

const rinvoke = require('../server')()

rinvoke.register('sum', (req, reply) => reply(null, req.a + req.b))

rinvoke.listen(4040, err => {
  if (err) throw err
})
