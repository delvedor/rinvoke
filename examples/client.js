'use strict'

const Multi = require('../lib/multi')

const multi = Multi([{
  port: 3030,
  host: '127.0.0.1'
}, {
  port: 4040,
  host: '127.0.0.1'
}])

multi.invoke({
  procedure: 'concat',
  a: 'a',
  b: 'b'
}, (err, result) => {
  if (err) console.log(err)
  console.log(result)
})

multi.invoke({
  procedure: 'sum',
  a: 1,
  b: 1
}, (err, result) => {
  if (err) console.log(err)
  console.log(result)
})

setTimeout(() => {
  multi.invoke({
    procedure: 'concat',
    a: 'a',
    b: 'b'
  }, (err, result) => {
    if (err) console.log(err)
    console.log(result)
  })

  multi.invoke({
    procedure: 'sum',
    a: 1,
    b: 1
  }, (err, result) => {
    if (err) console.log(err)
    console.log(result)
  })
}, 5000)

/* const rinvoke = require('../client')({
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
  .catch(console.log) */
