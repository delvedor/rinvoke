'use strict'

const rinvoke = require('../server')()

rinvoke.register('concat', (req, reply) => reply(null, req.a + req.b))

rinvoke.listen(3030, err => {
  if (err) throw err
})
