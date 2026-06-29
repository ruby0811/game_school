const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Restore the character container in the innerHTML
const insertAfter = `<div id="vn-bg" style="position:absolute;width:100%;height:100%;background-color:#ffe4e1;transition:background 0.5s;"></div>`;
const charContainer = `
                <div id="vn-char-container" style="position:absolute;width:100%;height:100%;display:flex;justify-content:center;align-items:flex-end;pointer-events:none;">
                    <img id="vn-char-protag" src="${'${this.cg.protag}'}" style="height:85%;display:none;position:absolute;bottom:140px;left:5%;object-fit:contain;filter:drop-shadow(2px 4px 8px rgba(0,0,0,0.5));mix-blend-mode:multiply;transition:opacity 0.3s;">
                    <img id="vn-char-siwoo" src="${'${this.cg.siwoo}'}" style="height:85%;display:none;position:absolute;bottom:140px;right:5%;object-fit:contain;filter:drop-shadow(2px 4px 8px rgba(0,0,0,0.5));mix-blend-mode:multiply;transition:opacity 0.3s;">
                </div>`;

code = code.replace(insertAfter, insertAfter + charContainer);

// Restore charProtag and charSiwoo element references
code = code.replace(
    `this.charProtag = null;`,
    `this.charProtag = this.container.querySelector('#vn-char-protag');`
);
code = code.replace(
    `this.charSiwoo = null;`,
    `this.charSiwoo = this.container.querySelector('#vn-char-siwoo');`
);

// Restore character display logic
code = code.replace(
    `if (this.charProtag) this.charProtag.style.display = (msg.char === 'protag') ? 'block' : 'none';`,
    `if (this.charProtag) this.charProtag.style.display = (msg.char === 'protag' || msg.char === 'both') ? 'block' : 'none';`
);
code = code.replace(
    `if (this.charSiwoo) this.charSiwoo.style.display = (msg.char === 'siwoo') ? 'block' : 'none';`,
    `if (this.charSiwoo) this.charSiwoo.style.display = (msg.char === 'siwoo' || msg.char === 'both') ? 'block' : 'none';`
);

// Remove the placeholder comment
code = code.replace(`// chars removed`, ``);

fs.writeFileSync('minigames.js', code);
console.log('Character sprites restored!');
