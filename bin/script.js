#!/usr/bin/env node
var straggler = require('../');
var argv = require('optimist').argv;
var loadConfig = require('../lib/config');
var commands = require('../lib/commands');

var cmd = argv._.shift();
if (cmd === 'hub') {
    console.error('not yet implemented');
    return;
}

function showUsage (code) {
    var s = fs.createReadStream(__dirname + '/usage.txt');
    s.pipe(process.stdout);
    process.stdout.on('close', function () {
        process.exit(code);
    });
}

loadConfig(argv, function (err, config) {
    if (err) {
        console.error(err);
        return process.exit(1);
    }
    if (!config.hubs) config.hubs = {};
    
    var hub = /:/.test(config.hub)
        ? config.hub
        : config.hubs && config.hubs[config.hub]
    ;
    if (!hub) hub = process.env.STRAGGLER_HUB || config.hubs.default;
    if (!hub) {
        console.error('--hub not specified and no default hub configured.');
        return process.exit(1);
    }
    
    var fn = commands[cmd];
    if (!fn) return showUsage(1);
    
    var st = straggler(config.keys);
    fn(st, hub, argv);
});
