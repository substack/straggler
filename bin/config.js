var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var createKeys = require('rsa-json');
var env = process.env;

module.exports = Config;

function Config (argv) {
    if (!(this instanceof Config)) return new Config(argv);
    this.argv = argv;
}

Config.prototype.load = function (cb) {
    var self = this;
    var configFile = self.getFile();
    
    mkdirp(path.dirname(configFile), function (err) {
        if (err) return cb(err);
        fs.exists(configFile, function (ex) {
            if (ex) return loadFile(cb);
            
            createKeys(function (err, pair) {
                if (err) cb(err)
                else savePair(pair, cb)
            });
        });
    });
    
    function savePair (pair, cb) {
        var name = self.getProfile();
        if (name === 'default') name = process.env.USER;
        
        var cfg = {
          keys: pair,
          name: name,
          hubs: {}
        };
        self.save(cfg, function (err) {
            if (err) return cb(err);
            loadFile(cb);
        });
    }
    
    function loadFile (cb) {
        self.loadFile(function (err, config) {
            if (err) return cb(err);
            
            var merged = Object.keys(self.argv)
                .reduce(function (acc, key) {
                    acc[key] = self.argv[key];
                    return acc;
                }, config)
            ;
            cb(null, merged);
        });
    }
};

Config.prototype.get = function (key, cb) {
    this.load(function (err, config) {
        if (err) return cb(err)
        
        var parts = key.split('.');
        var last = parts[parts.length - 1];
        var cursor = config;
        
        parts.slice(0, -1).forEach(function (p) {
            cursor = cursor[p];
        });
        cb(null, cursor[last]);
    });
};

Config.prototype.remove = function (key, cb) {
    var self = this;
    self.loadFile(function (err, config) {
        if (err) return cb(err)
        
        var parts = key.split('.');
        var last = parts[parts.length - 1];
        var cursor = config;
        
        parts.slice(0, -1).forEach(function (p) {
            cursor = cursor[p];
        });
        delete cursor[last];
        
        self.save(config, cb);
    });
};

Config.prototype.set = function (key, value, cb) {
    var self = this;
    self.loadFile(function (err, config) {
        if (err) return cb(err)
        
        var parts = key.split('.');
        var last = parts[parts.length - 1];
        var cursor = config;
        
        parts.slice(0, -1).forEach(function (p) {
            cursor = cursor[p];
        });
        cursor[last] = value;
        
        self.save(config, cb);
    });
};

Config.prototype.loadFile = function (cb) {
    var configFile = this.getFile();
    fs.readFile(configFile, function (err, src) {
        if (err) cb(err)
        else cb(null, JSON.parse(src))
    });
};

Config.prototype.getProfile = function () {
    return this.argv.profile || this.argv.p
        || env.STRAGGLER_PROFILE || 'default'
    ;
};

Config.prototype.getFile = function () {
    var profile = this.getProfile();
    return this.argv.config || env.STRAGGLER_CONFIG
        || path.join(env.HOME, '.config', 'straggler', profile + '.json')
    ;
};

Config.prototype.save = function (config, cb) {
    var src = JSON.stringify(config, null, 2);
    var configFile = this.getFile(this.argv);
    fs.writeFile(configFile, src, cb);
};
