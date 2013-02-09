#!/usr/bin/env node
var straggler = require('../');
var fs = require('fs');
var argv = require('optimist').argv;

var config = require('./config')(argv);
var commands = require('./commands');

function showUsage (code) {
    var s = fs.createReadStream(__dirname + '/usage.txt');
    s.pipe(process.stdout);
    process.stdout.on('close', function () {
        process.exit(code);
    });
}

var cmd = argv._.shift() || '';
if (cmd === 'help' || argv.help || argv.h) return showUsage(0);

config.load(function (err, cfg) {
    if (err) {
        console.error(String(err));
        return process.exit(1);
    }
    if (!cfg.hubs) cfg.hubs = {};
    
    var hub = /:/.test(cfg.hub)
        ? cfg.hub
        : cfg.hubs && cfg.hubs[cfg.hub]
    ;
    if (!hub) hub = process.env.STRAGGLER_HUB || cfg.hubs.default;
    if (!hub && cmd !== 'config' && cmd !== 'hub') {
        console.error('--hub not specified and no default hub configured.');
        return process.exit(1);
    }
    
    var fn = commands[cmd];
    if (!fn) return showUsage(1);
    
    var st = straggler(cfg.keys);
    fn(st, hub, argv);
});
