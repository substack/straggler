# lousy

aggregate text streams

# api example

First generate keypairs for your hub, viewer, and writer
[rsa-json](https://github.com/substack/rsa-json):

```
$ rsa-json > hub.json
$ rsa-json > viewer.json
$ rsa-json > writer.json
```

Create a hub and bind it to an http server:

``` js
var lousy = require('lousy');
var ly = lousy(require('./hub.json'));
var hub = ly.createHub(require('./authorized.json'));

var http = require('http');
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});
server.listen(5000);
```

Write a `viewer.js` program to read messages from the writer:

``` js
var lousy = require('lousy');
var ly = lousy(require('./viewer.json'));
var read = ly.read('http://localhost:5000');
read('writer').pipe(process.stdout);
```

Write a `writer.js` program to write messages to the hub:

``` js
var lousy = require('lousy');
var ly = lousy(require('./writer.json'));
var w = ly.write('http://localhost:5000');
w.end('beep boop\n');
```

Run the hub, the viewer, and the writer programs:

```
$ node hub.js &
[1] 18835
$ node viewer.js &
[2] 18840
$ node writer.js
beep boop
$ 
```

# methods

``` js
var lousy = require('lousy')
```

## var ly = lousy(keys)

Create a new lousy instance `ly` from `keys`, a public/private keypair generated
by [rsa-json](https://github.com/substack/rsa-json).

## var hub = ly.createHub(authorized)

###  hub.handle(req, res)

Handle a request from a `(req, res)` pair from an http server.

### hub.test(url)

Test a `req.url` string, returning the handler that should fire or `undefined`
if the route doesn't match anything.

## var reader = ly.read(uri, cb)

Return a function `reader` to create named streams.

`cb(err, keys)` fires with `keys`, and object that maps public key strings to
the user objects set up by `createHub()`.

### reader(name)

Return a readable stream of data from the writer given by `name`.

## ly.write(uri)

Return a writable stream of data from the writer given by `name`.

# attributes

## reader.keys

populated with the authorized key data from `createHub(authorized)` after the
connection is established

# install

With [npm](https://npmjs.org) do:

```
npm install lousy
```

# license

MIT
