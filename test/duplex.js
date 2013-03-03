var test = require('tap').test;
var http = require('http');
var straggler = require('../');

var config = {
    hub: require('./config/hub.json'),
    viewer: require('./config/viewer.json'),
    writer: require('./config/writer.json'),
    authorized: require('./config/duplex.json')
};

var hub = straggler(config.hub).createHub(config.authorized);
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});

test('duplex streams', function (t) {
    t.plan(1);
    
    server.listen(0, function () {
        viewer(t);
    });
    
    t.on('end', function () {
        server.close();
    });
});

function viewer (t) {
    var port = server.address().port;
    
    var st = straggler(config.viewer);
    var dup = st.createStream('http://localhost:' + port + '/rw');
    
    var data = '';
    dup.on('data', function (buf) { data += buf });
    dup.write('xyz');
    dup.on('open', writer.bind(null, t));
    
    setTimeout(function () {
        t.equal(data, 'xyz ABC');
        dup.end();
    }, 200);
}

function writer (t) {
    var st = straggler(config.writer);
    var port = server.address().port;
    var ws = st.createWriteStream('http://localhost:' + port + '/rw');
    ws.end(' ABC');
}
