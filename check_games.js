const fs = require('fs');
const c = fs.readFileSync('script.js', 'utf8');
const matches = [...c.matchAll(/hasGame:\s*['"](\w+)['"]/g)];
matches.forEach(m => console.log(m[1]));
