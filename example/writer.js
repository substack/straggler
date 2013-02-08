var straggler = require('../');
var st = straggler(require('./writer.json'));
var w = st.write('http://localhost:5000');
w.end('beep boop\n');
