var straggler = require('../');
var fs = require('fs');
var st = straggler(require('./config/hub.json'));

var authFile = process.argv[2] || __dirname + '/config/authorized.json';
var hub = st.createHub(JSON.parse(fs.readFileSync(authFile)));

var http = require('http');
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});
server.listen(5000);
