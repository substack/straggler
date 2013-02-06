var secure = require('secure-peer');

module.exports = function (keys, authorized) {
    var peer = secure(keys);
    authorized.forEach(function (r) {
        r.key = normalizeKey(r.key);
    });
    
    var auth = function (flags, cb) {
        var sec = peer(function (stream) {
            stream.key = normalizeKey(stream.id.key.public);
            cb(stream);
        });
        sec.on('identify', function (id) {
            if (flags === '*') return id.accept();
            
            var key = normalizeKey(id.key.public);
            for (var i = 0; i < authorized.length; i++) {
                var r = authorized[i];
                if (r.key !== key) continue;
                if (/r/.test(flags) && !r.read) return id.reject();
                if (/w/.test(flags) && !r.write) return id.reject();
                return id.accept();
            }
            
            id.reject();
        });
        return sec;
    };
    auth.keys = authorized.map(function (r) { return r.key });
    return auth;
};

function normalizeKey (key) {
    return key
        .split('\n')
        .filter(function (line) { return !/^-----/.test(line) })
        .map(function (line) { return line.replace(/\s+/g, '') })
        .join('')
    ;
}
