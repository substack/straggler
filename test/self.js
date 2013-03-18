var test = require('tap').test;
var http = require('http');
var straggler = require('../');

var st = {
    hub: straggler(require('./config/hub.json')),
    viewer: straggler(require('./config/viewer.json'))
};
var hub = st.hub.createHub(require('./config/aggregate.json'));
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});

test('hub can read and write to itself', function (t) {
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
    
    var rs = st.viewer.createReadStream('http://localhost:' + port + '/s');
    rs.on('open', function () { writer(t) });
    
    setTimeout(function () {
        t.equal(data, 'beep boop\n');
    }, 200);
    
    var data = '';
    rs.on('data', function (buf) { data += buf });
    
    t.on('end', function () { rs.end() });
}

function writer (t) {
    var port = server.address().port;
    var ws = st.hub.createWriteStream('http://localhost:' + port + '/s');
    
    ws.write('beep ');
    
    setTimeout(function () {
        ws.end('boop\n');
    }, 50);
}
