var lousy = require('../');
var ly = lousy(require('./keys.json'));
var hub = ly.createHub(require('./authorized.json'));

var http = require('http');
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});
server.listen(5000);
