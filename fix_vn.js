const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Add images to true ending
code = code.replace(
    "{ isEpilogue: true, cgColor: '#ffb6c1', text: '[엔딩 1: 그날부터 1일]\\n두 사람은 연인이 되어 다정하게 카페 데이트를 즐깁니다.' }",
    "{ isEpilogue: true, cgColor: '#ffb6c1', epilogueImg: 'images/vn_ending1_cafe.jpg', text: '[엔딩 1: 그날부터 1일]\\n두 사람은 연인이 되어 다정하게 카페 데이트를 즐깁니다.' },\n                { isEpilogue: true, cgColor: '#ffb6c1', epilogueImg: 'images/vn_ending1_wedding.jpg', text: '[True Ending: 영원한 약속]\\n그리고 시간이 흘러, 두 사람은 많은 사람들의 축복 속에서 영원을 약속합니다.' }"
);

// Update _renderMessage to handle epilogueImg
const oldRenderMsg = `            if (msg.isEpilogue) {
                this.epilogueBox.style.display = 'flex';
                this.epilogueBox.style.backgroundColor = msg.cgColor;
                this.epilogueText.innerText = msg.text;
                this.dialogueBox.style.display = 'none';
                return;
            }`;

const newRenderMsg = `            if (msg.isEpilogue) {
                this.epilogueBox.style.display = 'flex';
                this.epilogueBox.style.backgroundColor = msg.cgColor;
                
                let contentHTML = '';
                if (msg.epilogueImg) {
                    contentHTML += \`<img src="\${msg.epilogueImg}" style="max-height:60vh; max-width:90%; border-radius:15px; box-shadow:0 10px 20px rgba(0,0,0,0.5); margin-bottom:20px;">\`;
                }
                contentHTML += \`<h1 style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;margin:0;">\${msg.text}</h1>\`;
                
                if (this.state.msgIndex === this.state.currentScript.length - 1) {
                    contentHTML += \`<button id="vn-close-btn" style="margin-top:40px;padding:15px 30px;font-size:18px;background:#fff;color:#000;border:none;border-radius:25px;cursor:pointer;font-weight:bold;">게임 종료</button>\`;
                } else {
                    contentHTML += \`<button id="vn-next-epilogue-btn" style="margin-top:40px;padding:15px 30px;font-size:18px;background:#ffb6c1;color:#000;border:none;border-radius:25px;cursor:pointer;font-weight:bold;">다음</button>\`;
                }

                this.epilogueBox.innerHTML = contentHTML;
                
                let closeBtn = this.epilogueBox.querySelector('#vn-close-btn');
                if (closeBtn) closeBtn.onclick = () => this.close();
                
                let nextBtn = this.epilogueBox.querySelector('#vn-next-epilogue-btn');
                if (nextBtn) nextBtn.onclick = () => this._nextMessage();

                this.dialogueBox.style.display = 'none';
                return;
            }`;

code = code.replace(oldRenderMsg, newRenderMsg);

fs.writeFileSync('minigames.js', code);
console.log('Fixed minigames.js');
