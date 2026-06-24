const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

const regex = /\\\`/g;
code = code.replace(regex, '`');

const regex2 = /\\\$/g;
code = code.replace(regex2, '$');

fs.writeFileSync('minigames.js', code);
