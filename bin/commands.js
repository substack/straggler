var http = require('http');
var fs = require('fs');
var path = require('path');
var normalizeKey = require('../lib/normalize_key');

var VERSION = require('../package.json').version;

exports.duplex = exports[''] = function (st, hub, argv) {
    var ds = st.createStream(hub);
    process.stdin.pipe(ds);
    process.stdin.pipe(process.stdout);
    process.stdin.resume();
};

exports.write = function (st, hub, argv) {
    var ws = st.createWriteStream(hub);
    process.stdin.pipe(ws);
    process.stdin.pipe(process.stdout);
    process.stdin.resume();
};

exports.read = function (st, hub, argv) {
    var name = argv._[0];
    var rs = st.createReadStream(hub);
    rs.pipe(process.stdout);
};

exports.hub = function (st, hub, argv) {
    var file = argv.authorized || argv._[0];
    if (!file) return showError('usage: straggler hub authorized.json');
    
    var src = fs.readFileSync(file);
    var authorized = JSON.parse(src);
    
    var port = argv.port === undefined ? 9600 : argv.port;
    var hub = st.createHub(authorized);
    var server = http.createServer(function (req, res) {
        if (hub.test(req.url)) return hub.handle(req, res);
        res.end('straggler version ' + VERSION);
    });
    server.listen(port);
    
    server.on('listening', function () {
        if (!argv.silent) {
            console.log('straggler listening on port ' + port);
        }
    });
};

function showError (err) {
    console.error(String(err));
    process.exit(1);
}
