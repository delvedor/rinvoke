'use strict'

const rinvoke = require('../client')({
  port: 3030,
  host: '127.0.0.1'
})

rinvoke.invoke({
  procedure: 'concat',
  a: 'a',
  b: 'b'
}, (err, result) => {
  if (err) console.log(err)
  console.log(result)
})

rinvoke
  .invoke({
    procedure: 'concat',
    a: 'a',
    b: 'b'
  })
  .then(console.log)
  .catch(console.log)
