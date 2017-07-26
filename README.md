# rinvoke

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Build Status](https://travis-ci.org/delvedor/rinvoke.svg?branch=master)](https://travis-ci.org/delvedor/rinvoke)  [![Coverage Status](https://coveralls.io/repos/github/delvedor/rinvoke/badge.svg?branch=master)](https://coveralls.io/github/delvedor/rinvoke?branch=master)  ![stability](https://img.shields.io/badge/stability-experimental-orange.svg)


RPC library based on net sockets, can work both with **tcp sockets** and **ipc**.  
It has built in reconnect logic and supports multiple parser/serializers, such as [msgpack](http://msgpack.org/) or [protbuf](https://developers.google.com/protocol-buffers/).  
Internally uses [tentacoli](https://github.com/mcollina/tentacoli) to multiplex the requests and [avvio](https://github.com/mcollina/avvio) to guarantee the asynchronous bootstrap of the application.

<a name="install"></a>
## Install
```
npm i rinvoke --save
```

<a name="usage"></a>
## Usage
Rinvoke could be used as a server or client, so when your require it you must specify it.  
Let's see an example for the server:
```js
const rinvoke = require('rinvoke/server')()

rinvoke.register('concat', (req, reply) => {
  reply(null, req.a + req.b)
})

rinvoke.listen(3000, err => {
  if (err) throw err
})
```
And now for the client:
```js
const rinvoke = require('rinvoke/client')({
  port: 3000
})

rinvoke.invoke({
  procedure: 'concat',
  a: 'hello ',
  b: 'world'
}, (err, result) => {
  if (err) {
    console.log(err)
    return
  }
  console.log(result)
})
```
The client could seem synchronous but internally everything is handled asynchronously with events.  
Checkout the [examples folder](https://github.com/delvedor/rinvoke/tree/master/examples) if you want to see more examples!

<a name="api"></a>
## API

<a name="server"></a>
### Server
#### `server([opts])`
Instance a new server, the options object can accept a custom parser/serializer via the `codec` field.
```js
const rinvoke = require('rinvoke/server')({
  codec: {
    encode: JSON.stringify,
    decode: JSON.parse
  }
})
```
The default codec is *JSON*.  
**Events**:
- `'connection'`
- `'error'`

#### `register(procedureName, procedureFunction)`
Registers a new procedure, the name of the procedure must be a string, the function has the following signature: `(request, reply)` where `request` is the request object and `reply` a function t send the response back to the client.
```js
rinvoke.register('concat', (req, reply) => {
  reply(null, req.a + req.b)
})
```
*Promises* and *async/await* are supported as well!
```js
rinvoke.register('concat', async req => {
  return req.a + req.b
})
```

#### `listen(portOrPath, [address], callback)`
Run the server over the specified `port` (and `address`, default to `127.0.0.1`), if you specify a path (as a string)
 it will use the system socket to perform ipc.
 ```js
 rinvoke.listen(3000, err => {
   if (err) throw err
 })

 rinvoke.listen(3000, '127.0.0.1', err => {
   if (err) throw err
 })

 rinvoke.listen('/tmp/socket.sock', err => {
   if (err) throw err
 })
 ```

<a name="client"></a>
### Client

#### `client(options)`
Instance a new client, the options object must contain a `port` or `path` field, furthermore can accept a custom parser/serializer via the `codec` field. If you want to activate the automatic reconnection handling pass `reconnect: true` (3 attempts with 1s timeout), if you want to configure the timeout handling pass an object like the following:
```js
const rinvoke = require('rinvoke/client')({
  port: 3000,
  reconnect: {
    attempts: 5,
    timeout: 2000
  },
  codec: {
    encode: JSON.stringify,
    decode: JSON.parse
  }
})
```
The default codec is *JSON*.  
**Events**:
- `'connect'`
- `'error'`
- `'close'`
- `'timeout'`

#### `invoke(request, callback)`
Invoke a procedure on the server, the request object **must** contain the key `procedure` with the name of the function to call.  
The callback is a function with the following signature: `(error, response)`.
```js
rinvoke.invoke({
  procedure: 'concat',
  a: 'hello ',
  b: 'world'
}, (err, result) => {
  if (err) {
    console.log(err)
    return
  }
  console.log(result)
})
```
*Promises* are supported as well!
```js
rinvoke
  .invoke({
    procedure: 'concat',
    a: 'a',
    b: 'b'
  })
  .then(console.log)
  .catch(console.log)
```

#### `timeout(time)`
Sets the timeout of the socket.
#### `keepAlive(bool)`
Sets the `keep-alive` property.

<a name="shared"></a>
### Method for both client and server
#### `use(callback)`
The callback is a function witb the following signature: `instance, options, next`.  
Where `instance` is the client instance, options, is an options object and  `next` a function you must call when your code is ready.  
This api is useful if you need to load an utility, a database connection for example. `use` will guarantee the load order an that your client/server will boot up once every `use` has completed.
```js
rinvoke.use((instance, opts, next) => {
  dbClient.connect(opts.url, (err, conn) => {
    rinvoke.db = conn // now you can access in your function the database connection with `this.db`
    next()
  })
})
```
#### `onClose(callback)`
Hook that will be called once you fire the `close` callback.
```js
instance.onClose((instance, done) => {
  // do something
  done()
})
```

#### `close(callback)`
Once you call this function the socket server and client will close and all the registered functions with `onClose` will be called.
```js
instance.close((err, instance, done) => {
  // do something
  done()
})
```
<a name="cli"></a>
### CLI
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
- [ ] `request` event
- [ ] Validation of `request` object

<a name="acknowledgements"></a>
## Acknowledgements

This project is kindly sponsored by [LetzDoIt](http://www.letzdoitapp.com/).

<a name="license"></a>
## License

[MIT](./LICENSE)

Copyright © 2017 Tomas Della Vedova
