var straggler = require('../');
var st = straggler(require('./viewer.json'));
var read = st.read('http://localhost:5000');
read('writer').pipe(process.stdout);
