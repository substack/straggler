#!/usr/bin/env node
var straggler = require('../');
var http = require('http');
var fs = require('fs');
var createKeys = require('rsa-json');

var normalizeKey = require('../lib/normalize_key');
var VERSION = require('../package.json').version;

var argv = require('optimist')
    .boolean('h', 'help', 'g', 'generate')
    .argv
;

if (argv.h || argv.help) return showUsage(0);

if (argv.g || argv.generate) {
    return createKeys(function (err, pair) {
        if (err) return showError(err);
        console.log(JSON.stringify(pair, null, 2));
    });
}

if (!argv.k && !argv.keys) {
    return showError([
        'Specify a keypair file with -k',
        'Generate a keypair file with -g.'
    ].join('\n'));
}

var keys = JSON.parse(fs.readFileSync(argv.k || argv.keys));
var st = straggler(keys);

if ((argv.r && argv.w) || argv.rw) {
    var ds = st.createStream(argv.r || argv.w || argv.rw);
    ds.pipe(process.stdout);
    process.stdin.pipe(ds);
    process.stdin.resume();
    return;
}

if (argv.w) {
    var ws = st.createWriteStream(argv.w);
    process.stdin.pipe(ws);
    process.stdin.resume();
    return;
}

if (argv.r) {
    var rs = st.createReadStream(argv.r);
    rs.pipe(process.stdout);
    return;
}

if (argv.l || argv.listen) {
    var port = argv.l || argv.listen;
    var file = argv.a || argv.authorized;
    
    if (!file) {
        return showError([
            'usage: straggler -l PORT',
            '-k keys.json -a authorized.json'
        ].join(' '));
    }
    
    var authorized = JSON.parse(fs.readFileSync(file));
    var hub = st.createHub(authorized);
    
    var server = http.createServer(function (req, res) {
        if (hub.test(req.url)) return hub.handle(req, res);
        res.end('straggler version ' + VERSION);
    });
    server.listen(port);
    return;
}

return showUsage(1);

function showError (err) {
    console.error(String(err));
    process.exit(1);
}

function showUsage (code) {
    var s = fs.createReadStream(__dirname + '/usage.txt');
    s.pipe(process.stdout);
    process.stdout.on('close', function () {
        process.exit(code);
    });
}
