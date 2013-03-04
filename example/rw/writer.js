var straggler = require('../../');
var st = straggler(require('./config/writer.json'));
var w = st.createWriteStream('http://localhost:5000/beep');
w.end('beep boop\n');
