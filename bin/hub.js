var http = require('http');
var through = require('through');
var JSONStream = require('JSONStream');

var auth = require('../lib/auth')(
    require('./keys.json'),
    require('./authorized.json')
);

var feed = through();
var writers = [];

var server = http.createServer(function (req, res) {
    if (req.url === '/read') {
        req.pipe(auth("r", function (stream) {
            var stringify = JSONStream.stringify();
            stringify.pipe(stream);
            stringify.write({ writers: writers });
            feed.pipe(stringify);
        })).pipe(res);
    }
    else if (req.url === '/write') {
        req.pipe(auth("w", function (stream) {
            stream.pipe(through(write)).pipe(feed);
            
            function write (msg) {
                var index = auth.keys.indexOf(stream.key);
                this.emit('data', [ index, msg.toString('base64') ]);
            }
        })).pipe(res);
    }
});
server.listen(5000);
