# rinvoke

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Build Status](https://travis-ci.org/delvedor/rinvoke.svg?branch=master)](https://travis-ci.org/delvedor/rinvoke)  [![Coverage Status](https://coveralls.io/repos/github/delvedor/rinvoke/badge.svg?branch=master)](https://coveralls.io/github/delvedor/rinvoke?branch=master)  ![stability](https://img.shields.io/badge/stability-experimental-orange.svg)


RPC library based on net sockets, can work both with **tcp sockets** and **ipc**.  
Internally uses [tentacoli](https://github.com/mcollina/tentacoli) to multiplex the requests and [avvio](https://github.com/mcollina/avvio) to guarantee the asynchronous bootstrap of the application.

## Install
```
npm i rinvoke --save
```

## Usage
Declare one or more function and run the server.
```js
const server = require('rinvoke/server')()
// register a new function
server.register('concat', (req, reply) => reply(null, req.a + req.b))
// run the listener
server.run(3030, err => {
  if (err) throw err
})
```
Then declare a client to call the function:
```js
const client = require('rinvoke/client')({
  port: 3030
})
// invoke the remote function
client.invoke({
  procedure: 'concat',
  a: 'a',
  b: 'b'
}, (err, result) => {
  console.log(err || result)
})
```

Async await is supported as well!
```js
const server = require('rinvoke/server')()
// register a new function
server.register('concat', async (req, reply) => {
  const val = await something()
  return req.a + req.b
})
// run the listener
server.run(3030, err => {
  if (err) throw err
})
```

Promises are also supported!
```js
const client = require('rinvoke/client')({
  port: 3030
})
// invoke the remote function
client
  .invoke({
    procedure: 'concat',
    a: 'a',
    b: 'b'
  })
  .then(console.log)
  .catch(console.log)
```

Checkout the [examples folder](https://github.com/delvedor/rinvoke/tree/master/examples) if you want to see more examples!

<a name="api"></a>
## API
### Server
- `.register`: declare a new function, the api takes two parameter, the procedure name and the function to execute.  
The function to execute will get two parameter, the `request` object and the reply function.

- `.listen`: run the server on the specified port or path.  
  - `port`: port where start the **tcp** server
  - `address`: custom address for the server (default to `127.0.0.1`)
  - `path`: path where start the **ipc** server

- `.close`: close the server

- `.use`: add an utility to the instance, it can be an object or a function, under the hood uses [avvio](https://github.com/mcollina/avvio).
```js
server.use((instance, opts, next) => {
    instance.concat = (a, b) => a + b
    next()
})
server.register('concat', function (req, reply) {
    reply(null, this.concat(a, b))
})
```
You can also use it to handle a connection with a database, and use the `onClose` api if you need to shutdown the connection.

#### Server option
- `codec`: object with two properties: `encode` and `decode`, defines which serializer/parser use, default to `JSON.stringify` and  `JSON.parse`

### Client
- `.invoke`: invoke a remote function, take two parameters, the `request` object and a callback.  
The request object **must** include the `procedure` field, which is the name of the function to call server side.

- `.close`: close the connection with the server

- `.onClose`: same as above

- `.use`: same as above

#### Client option
- `port`: port where start the **tcp** server
- `address`: custom address for the server (default to `127.0.0.1`)
- `path`: path where start the **ipc** server
- `codec`: object with two properties: `encode` and `decode`, defines which serializer/parser use, default to `JSON.stringify` and  `JSON.parse`

<a name="cli"></a>
## CLI
You can even run the server with the integrated cli!
In your `package.json` add:
```json
{
  "scripts": {
    "start": "rinvoke server.js"
  }
}
```
And then create your server file:
```js
module.exports = async () => 'hello!'
module.exports.key = 'hello'
```
`key` is the key of your function.
You can also use an extended version of the above example:
```js
function sayHello (rinvoke, opts, next) {
  rinvoke.register('hello', (req, reply) => {
    reply(null, { hello: 'world' })
  })

  next()
}

module.exports = sayHello
```
The options of the cli are:
```
--port       # default 3000
--address    # default 127.0.0.1
--path
```

<a name="todo"></a>
## TODO
- [ ] Rewrite the documentation
- [ ] More test

<a name="acknowledgements"></a>
## Acknowledgements

This project is kindly sponsored by [LetzDoIt](http://www.letzdoitapp.com/).

<a name="license"></a>
## License

[MIT](./LICENSE)

Copyright © 2017 Tomas Della Vedova
