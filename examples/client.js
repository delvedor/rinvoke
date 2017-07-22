'use strict'

const rinvoke = require('../index')()

rinvoke.invoke('cmd:concat', 'a', 'b', (err, result) => {
  if (err) console.log(err)
  console.log(result)
})
