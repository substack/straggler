var http = require('http');
var shoe = require('shoe');

var server = http.createServer(function (req, res) {
});
server.listen(8080);

var sock = shoe(function (stream) {
    
});

sock.install('/shoe', server);
