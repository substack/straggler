var straggler = require('../../');
var st = straggler(require('./config/viewer.json'));
var r = st.createReadStream('http://localhost:5000/beep');
r.pipe(process.stdout);
