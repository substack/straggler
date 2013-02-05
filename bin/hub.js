var net = require('net');
var secure = require('secure-peer');
var peer = secure(require('./keys.json'));
var authorized = require('./authorized.json').map(normalizeKey);
var through = require('through');

var server = net.createServer(function (cipherStream) {
    var sec = peer(function (stream) {
        stream.pipe(process.stdout);
    });
    sec.on('identify', function (id) {
        if (authorized.indexOf(normalizeKey(id.key.public)) < 0) {
            id.reject();
        }
        else id.accept();
    });
    sec.pipe(cipherStream).pipe(sec);
});
server.listen(5000);

function normalizeKey (key) {
    return key
        .split('\n')
        .filter(function (line) { return !/^-----/.test(line) })
        .map(function (line) { return line.replace(/\s+/g, '') })
        .join('')
    ;
}
