const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Bug 1: currentScript is set to this.script[0] (first message object) instead of this.script (full array)
code = code.replace(
    `currentScript: this.script[0] };`,
    `currentScript: this.script };`
);

// Bug 2: _renderMessage - condition-based choices need to be simplified
// Find and remove the doubled condition blocks, keep just one choices block
code = code.replace(
    `                {\n                    bg: 'url(images/bg_park_1782693472786.png)', condition: (state) => state.aff >= 40,\n                    choices: [\n                        { text: '나도... 나도 너 좋아했어. 계속.', nextScene: 4 },\n                        { text: '장난치지 마. 우린 그냥 친구잖아.', nextScene: 5 }\n                    ]\n                },\n                {\n                    bg: 'url(images/bg_park_1782693472786.png)', condition: (state) => state.aff < 40,\n                    choices: [\n                        { text: '나도... 나도 너 좋아했어. 계속.', nextScene: 4 },\n                        { text: '장난치지 마. 우린 그냥 친구잖아.', nextScene: 5 }\n                    ]\n                }`,
    `                {\n                    bg: 'url(images/bg_park_1782693472786.png)',\n                    choices: [\n                        { text: '나도... 나도 너 좋아했어. 계속.', nextScene: 4 },\n                        { text: '장난치지 마. 우린 그냥 친구잖아.', nextScene: 5 }\n                    ]\n                }`
);

// Bug 3: _renderMessage needs to also handle condition field gracefully (skip it if condition returns false)
// Also need to handle skipping choices blocks that have 'condition' property that evaluates false
// Let's patch _renderMessage to skip condition-false blocks:
const oldChoiceRender = `            if (msg.choices) {
                this.state.mode = 'choice';
                this.choicesBox.innerHTML = '';
                this.choicesBox.style.display = 'flex';`;

const newChoiceRender = `            if (msg.choices) {
                // Skip if condition not met
                if (msg.condition && !msg.condition(this.state)) {
                    this.state.msgIndex++;
                    this._renderMessage();
                    return;
                }
                this.state.mode = 'choice';
                this.choicesBox.innerHTML = '';
                this.choicesBox.style.display = 'flex';`;

code = code.replace(oldChoiceRender, newChoiceRender);

// Bug 4: Also fix _nextMessage to handle end of script without error
const oldNextMsg = `        _nextMessage() {`;
const newNextMsg = `        _nextMessage() {
            // guard: if we're past the script, do nothing
            if (!this.state.currentScript || this.state.msgIndex >= this.state.currentScript.length - 1) {
                if (this.state.mode !== 'choice') return;
            }`;
// Only patch once
if (!code.includes('guard: if we\'re past the script')) {
    code = code.replace(oldNextMsg, newNextMsg);
}

fs.writeFileSync('minigames.js', code);
console.log('VN engine bugs fixed');
