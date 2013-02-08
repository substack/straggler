var straggler = require('../');
var st = straggler(require('./config/hub.json'));
var hub = st.createHub(require('./config/authorized.json'));

var http = require('http');
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});
server.listen(5000);
