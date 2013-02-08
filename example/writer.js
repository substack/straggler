var straggler = require('../');
var st = straggler(require('./config/writer.json'));
var w = st.write('http://localhost:5000');
//w.end('beep boop\n');
w.write('beep boop\n');
