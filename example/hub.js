var straggler = require('../');
var st = straggler(require('./hub.json'));
var hub = st.createHub(require('./authorized.json'));

var http = require('http');
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});
server.listen(5000);
