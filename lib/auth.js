var secure = require('secure-peer');
var normalizeKey = require('./normalize_key');

module.exports = function (keys, authorized) {
    var peer = secure(keys);
    
    var auth = function (flags, cb) {
        var sec = peer(function (stream) {
            var key = stream.key = normalizeKey(stream.id.key.public);
            
            auth.keys[key].connections ++;
            sec.once('close', function () {
                auth.keys[key].connections --;
            });
            
            cb(stream);
        });
        
        sec.on('identify', function (id) {
            if (flags === '*') return id.accept();
            
            var key = normalizeKey(id.key.public);
            var r = auth.keys[key];
            
            if (!r) return id.reject();
            if (/r/.test(flags) && !r.read) return id.reject();
            if (/w/.test(flags) && !r.write) return id.reject();
            return id.accept();
        });
        return sec;
    };
    auth.keys = authorized.reduce(function (acc, r, ix) {
        r.index = ix;
        r.key = normalizeKey(r.key);
        r.connections = 0;
        acc[r.key] = r;
        return acc;
    }, {});
    return auth;
};
