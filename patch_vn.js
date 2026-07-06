const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// 1. Fix init(): charYujin -> charSiwoo
code = code.replace(/id="vn-char-yujin"/g, 'id="vn-char-siwoo"');
code = code.replace(/\$\{this\.cg\.yujin\}/g, '${this.cg.siwoo}');
code = code.replace(/this\.charYujin = this\.container\.querySelector\('#vn-char-yujin'\);/g, `this.charSiwoo = this.container.querySelector('#vn-char-siwoo');`);

// 2. Fix _renderMessage(): handle siwoo display
code = code.replace(/this\.charYujin\.style\.display = \(msg\.char === 'yujin'\) \? 'block' : 'none';/g, `this.charSiwoo.style.display = (msg.char === 'siwoo') ? 'block' : 'none';`);
code = code.replace(/this\.charYujin\.style\.display = 'block';/g, `this.charSiwoo.style.display = 'block';`);
code = code.replace(/this\.charYujin\.style\.display = 'none';/g, `this.charSiwoo.style.display = 'none';`);

// 3. Fix _selectChoice to support choice.nextScene and choice.aff
const selectChoiceOld = `        _selectChoice(choice) {
            if (choice.effect) {
                if (choice.effect.aff) this.state.aff += choice.effect.aff;
                if (choice.effect.fri) this.state.fri += choice.effect.fri;
                if (choice.effect.bf) this.state.bf += choice.effect.bf;
                if (choice.effect.final) this.state.finalChoice = choice.effect.final;
            }
            this.choicesBox.style.display = 'none';
            this.state.mode = 'dialogue';
            this.state.msgIndex = choice.next;
            this._renderMessage();
        },`;

const selectChoiceNew = `        _selectChoice(choice) {
            if (choice.effect) {
                if (choice.effect.aff) this.state.aff += choice.effect.aff;
                if (choice.effect.fri) this.state.fri += choice.effect.fri;
                if (choice.effect.bf) this.state.bf += choice.effect.bf;
                if (choice.effect.final) this.state.finalChoice = choice.effect.final;
            }
            if (choice.aff) this.state.aff += choice.aff; // support direct aff
            
            this.choicesBox.style.display = 'none';
            this.state.mode = 'dialogue';
            
            if (choice.nextScene !== undefined) {
                this.state.scene = choice.nextScene;
                this.state.currentScript = this.dialogueScripts[this.state.scene];
                this.state.msgIndex = 0;
            } else {
                this.state.msgIndex = choice.next;
            }
            this._renderMessage();
        },`;
if (code.includes(selectChoiceOld)) {
    code = code.replace(selectChoiceOld, selectChoiceNew);
} else {
    // maybe it has different formatting? let's do a more robust replace for _selectChoice
    console.log("Could not find exact _selectChoice text to replace, attempting regex...");
    code = code.replace(/_selectChoice\(choice\) \{[\s\S]*?this\._renderMessage\(\);\s*\}/, selectChoiceNew.trim());
}

// 4. Update the script to use choice.nextScene instead of next: 1, and remove condition
const scriptOld = `                bg: 'url(images/bg_park_1782693472786.png)', condition: (state) => state.aff >= 40,
                    choices: [
                        { text: '나도... 나도 너 좋아했어. 계속.', next: 4 },
                        { text: '장난치지 마. 우린 그냥 친구잖아.', next: 5 }
                    ]
                },
                {
                    bg: 'url(images/bg_park_1782693472786.png)', condition: (state) => state.aff < 40,
                    choices: [
                        { text: '나도... 나도 너 좋아했어. 계속.', next: 4 },
                        { text: '장난치지 마. 우린 그냥 친구잖아.', next: 5 }
                    ]
                }`;

const scriptNew = `                bg: 'url(images/bg_park_1782693472786.png)', 
                    choices: [
                        { text: '나도... 나도 너 좋아했어. 계속.', nextScene: 4 },
                        { text: '장난치지 마. 우린 그냥 친구잖아.', nextScene: 5 }
                    ]
                }`;

// Also fix the previous scenes to use nextScene instead of next
code = code.replace(/\{ text: '뭐, 뭐래! 징그럽게...', next: 1, aff: 0 \}/g, `{ text: '뭐, 뭐래! 징그럽게...', nextScene: 1, aff: 0 }`);
code = code.replace(/\{ text: '그래, 평생 내가 책임져줄게.', next: 1, aff: \+20 \}/g, `{ text: '그래, 평생 내가 책임져줄게.', nextScene: 1, aff: +20 }`);

code = code.replace(/\{ text: '어\? 어, 그래... 같이 가자.', next: 2, aff: \+10 \}/g, `{ text: '어? 어, 그래... 같이 가자.', nextScene: 2, aff: +10 }`);
code = code.replace(/\{ text: '케이크 쏘는 거지\? 당근 가야지!', next: 2, aff: 0 \}/g, `{ text: '케이크 쏘는 거지? 당근 가야지!', nextScene: 2, aff: 0 }`);

code = code.replace(/\{ text: '너, 너 뭐 잘못 먹었어\?', next: 3, aff: 0 \}/g, `{ text: '너, 너 뭐 잘못 먹었어?', nextScene: 3, aff: 0 }`);
code = code.replace(/\{ text: '\(얼굴을 붉히며\) ...고마워.', next: 3, aff: \+20 \}/g, `{ text: '(얼굴을 붉히며) ...고마워.', nextScene: 3, aff: +20 }`);

code = code.replace(scriptOld, scriptNew);

fs.writeFileSync('minigames.js', code);
console.log('Engine patched successfully');
