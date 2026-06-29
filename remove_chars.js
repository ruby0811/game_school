const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Remove the character container div from innerHTML
const charContainerStart = code.indexOf('<div id="vn-char-container"');
const charContainerEnd = code.indexOf('</div>', charContainerStart) + 6;
if (charContainerStart !== -1) {
    code = code.substring(0, charContainerStart) + code.substring(charContainerEnd);
    console.log('Removed char container');
}

// Nullify charProtag and charSiwoo assignments to prevent errors
code = code.replace(
    `this.charProtag = this.container.querySelector('#vn-char-protag');`,
    `this.charProtag = null;`
);
code = code.replace(
    `this.charSiwoo = this.container.querySelector('#vn-char-siwoo');`,
    `this.charSiwoo = null;`
);

// Guard char display code so it doesn't crash when elements are null
code = code.replace(
    `this.charProtag.style.display = (msg.char === 'protag') ? 'block' : 'none';`,
    `if (this.charProtag) this.charProtag.style.display = (msg.char === 'protag') ? 'block' : 'none';`
);
code = code.replace(
    `this.charSiwoo.style.display = (msg.char === 'siwoo') ? 'block' : 'none';`,
    `if (this.charSiwoo) this.charSiwoo.style.display = (msg.char === 'siwoo') ? 'block' : 'none';`
);
code = code.replace(
    `if (msg.char === 'both') {
                this.charProtag.style.display = 'block';
                this.charSiwoo.style.display = 'block';
            }`,
    `// chars removed`
);

fs.writeFileSync('minigames.js', code);
console.log('Character sprites removed from VN');
