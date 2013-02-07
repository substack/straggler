var http = require('http');
var lousy = require('../');

var hub = lousy.createHub({
    keys: require('./keys.json'),
    authorized: require('./authorized.json')
});

var server = http.createServer(hub.handle.bind(hub));
server.listen(5000);
