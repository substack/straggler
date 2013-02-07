# lousy

aggregate stdout output across processes

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
