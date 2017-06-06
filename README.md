# rinvoke

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Build Status](https://travis-ci.org/delvedor/rinvoke.svg?branch=master)](https://travis-ci.org/delvedor/rinvoke)  ![stability](https://img.shields.io/badge/stability-experimental-orange.svg)


  RPC library based on [ZeroMQ](http://zeromq.org/).

## Install
```
npm i rinvoke --save
```

## Usage
Declare one or more function and run the server.
```js
const server = require('rinvoke/server')()
// register a new function
server.register('cmd:concat', (a, b, reply) => reply(null, a + b))

// run the listener
server.run('tcp://127.0.0.1:3030', err => {
  if (err) throw err
})
```
Then declare a client to call the function:
```js
const client = require('rinvoke/client')()
// connect to the remote server
client.connect('tcp://127.0.0.1:3030')
// invoke the remote function
client.invoke('cmd:concat', 'a', 'b', (err, res) => {
  if (err) console.log(err)
  console.log('concat:', res)
})
```

Async await is supported as well!
```js
const server = require('rinvoke/server')()
// register a new function
server.register('cmd:concat', async (a, b) => {
  const val = await something()
  return a + b
})

// run the listener
server.run('tcp://127.0.0.1:3030', err => {
  if (err) throw err
})
```

<a name="api"></a>
## API
### Server
- `.register`: declare a new function, the internal routing is done by [bloomrun](https://github.com/mcollina/bloomrun), you can use the [tinysonic](https://github.com/mcollina/tinysonic) syntax to declare new routes.

- `.run`: run the server on the specified url

- `.parser`: use a custom parser, by default only strings are handled:
```js
server.parser(JSON.parse)
```
- `.serializer`: use a custom serializer, by default only strings are handled:
```js
server.serializer(JSON.stringify)
```
- `.errorSerializer`: use a custom serializer for errors, by default is handled with JSON

- `.close`: close the server

- `.use`: add an utility to the instance, it can be an object or a function, under the hood uses [avvio](https://github.com/mcollina/avvio).
```js
server.use((instance, opts, next) => {
    instance.concat = (a, b) => a + b
    next()
})
server.register('cmd:concat', function (a, b, reply) {
    reply(null, this.concat(a, b))
})
```
You can also use it to handle a connection with a database, listen for the `'close'` event if you need to shutdown the connection.


### Client
- `.invoke`: invoke a remote function, pass the parameters as single values and a callback at the end.

- `.connect`: connect to a remote server

- `.parser`: use a custom parser, by default only strings are handled:
```js
server.parser(JSON.parse)
```
- `.serializer`: use a custom serializer, by default only strings are handled:
```js
server.serializer(JSON.stringify)
```
- `.errorSerializer`: use a custom serializer for errors, by default is handled with JSON

- `.close`: close the connection with the server

- `.disconnect`: disconnect from the server

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
  rinvoke
    .serializer(JSON.stringify)
    .parser(JSON.parse)

  rinvoke.register('hello', reply => {
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
--protocol   # default tcp
```

<a name="acknowledgements"></a>
## Acknowledgements

This project is kindly sponsored by [LetzDoIt](http://www.letzdoitapp.com/).

<a name="license"></a>
## License

*The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.*

Copyright © 2017 Tomas Della Vedova
