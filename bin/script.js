#!/usr/bin/env node
var straggler = require('../');
var http = require('http');
var fs = require('fs');
var createKeys = require('rsa-json');

var normalizeKey = require('../lib/normalize_key');
var VERSION = require('../package.json').version;

var optimist = require('optimist');
var argv = optimist
    .boolean('h', 'help', 'g', 'generate', 'r', 'w', 'rw')
    .argv
;

if (argv.h || argv.help || process.argv.length <= 2) return showUsage(0);

if (argv.g || argv.generate) {
    return createKeys(function (err, pair) {
        if (err) return showError(err);
        console.log(JSON.stringify(pair, null, 2));
    });
}

if (argv.e && !argv.entry) {
    var unarg = optimist.argv;
    var keys = JSON.parse(fs.readFileSync(argv.e || argv.entry));
    var doc = { key: keys.public };
    
    var read = [].concat(unarg.r).concat(unarg.rw).filter(Boolean);
    var write = [].concat(unarg.w).concat(unarg.rw).filter(Boolean);
    
    var args = process.argv.slice(2);
    args.forEach(function (arg, i) {
        if (arg === '-rw') {
            var j = read.indexOf(true);
            if (j >= 0) read[j] = args[i+1];
        }
        else if (arg === '-wr') {
            var j = write.indexOf(true);
            if (j >= 0) write[j] = args[i+1];
        }
    });
    
    if (unarg.r || unarg.rw) doc.read = read;
    if (unarg.w || unarg.rw) doc.write = write;
    
    console.log(JSON.stringify(doc, null, 2));
    return;
}

if (!argv.k && !argv.keys) {
    return showError([
        'Specify a keypair file with -k',
        'Generate a keypair file with -g.'
    ].join('\n'));
}

var keys = JSON.parse(fs.readFileSync(argv.k || argv.keys));
var st = straggler(keys);
var uri = argv._[0];

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

if (argv.w && !argv.r) {
    var ws = st.createWriteStream(uri);
    process.stdin.pipe(ws);
    process.stdin.resume();
    return;
}

if (argv.r && !argv.w) {
    var rs = st.createReadStream(uri);
    rs.pipe(process.stdout);
    return;
}

if ((argv.r && argv.w) || argv.rw || true) {
    var ds = st.createStream(uri);
    ds.pipe(process.stdout);
    process.stdin.pipe(ds);
    process.stdin.resume();
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
