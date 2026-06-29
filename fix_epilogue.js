const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Remove the if/else for epilogueImg - always show text only
const oldEpilogueImg = `                let contentHTML = '';
                if (msg.epilogueImg) {
                    // Show only image, no text
                    contentHTML += \`<img src="\${msg.epilogueImg}" style="max-height:80vh; max-width:90%; border-radius:15px; box-shadow:0 10px 20px rgba(0,0,0,0.5); object-fit:contain;">\`;
                } else {
                    // Fallback for endings without image
                    contentHTML += \`<h1 style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;margin:0;">\${msg.text}</h1>\`;
                }`;

const newEpilogueImg = `                let contentHTML = '';
                // Text only
                contentHTML += \`<h1 style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;margin:0;">\${msg.text}</h1>\`;`;

if (code.includes(oldEpilogueImg)) {
    code = code.replace(oldEpilogueImg, newEpilogueImg);
    console.log('Replaced epilogue image block');
} else {
    console.log('Pattern not found, trying manual approach...');
    // Find by lines
    const lines = code.split('\n');
    let startLine = -1, endLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('if (msg.epilogueImg)')) startLine = i;
        if (startLine !== -1 && lines[i].includes('} else {')) {}
        if (startLine !== -1 && lines[i].trim() === '}' && i > startLine + 3) {
            endLine = i;
            break;
        }
    }
    if (startLine !== -1 && endLine !== -1) {
        const before = lines.slice(0, startLine - 1).join('\n');
        const after = lines.slice(endLine + 1).join('\n');
        const replacement = `                let contentHTML = '';
                // Text only
                contentHTML += \`<h1 style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;margin:0;">\${msg.text}</h1>\`;`;
        code = before + '\n' + replacement + '\n' + after;
        console.log('Manual approach done, lines', startLine, '-', endLine);
    }
}

fs.writeFileSync('minigames.js', code);
