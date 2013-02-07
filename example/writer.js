var lousy = require('lousy');
var ly = lousy(require('./writer.json'));
var w = ly.write('http://localhost:5000');
w.end('beep boop\n');
