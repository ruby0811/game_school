const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

const oldRenderMsg = `            if (msg.isEpilogue) {
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

const newRenderMsg = `            if (msg.isEpilogue) {
                this.epilogueBox.style.display = 'flex';
                this.epilogueBox.style.backgroundColor = msg.cgColor;
                
                let contentHTML = '';
                if (msg.epilogueImg) {
                    // Show only image, no text
                    contentHTML += \`<img src="\${msg.epilogueImg}" style="max-height:80vh; max-width:90%; border-radius:15px; box-shadow:0 10px 20px rgba(0,0,0,0.5); object-fit:contain;">\`;
                } else {
                    // Fallback for endings without image
                    contentHTML += \`<h1 style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;margin:0;">\${msg.text}</h1>\`;
                }
                
                if (this.state.msgIndex === this.state.currentScript.length - 1) {
                    contentHTML += \`<button id="vn-close-btn" style="margin-top:20px;padding:15px 30px;font-size:18px;background:#fff;color:#000;border:none;border-radius:25px;cursor:pointer;font-weight:bold;display:none;">게임 종료</button>\`;
                }

                this.epilogueBox.innerHTML = contentHTML;
                this.dialogueBox.style.display = 'none';

                if (this.state.msgIndex < this.state.currentScript.length - 1) {
                    // Auto transition after 3.5 seconds
                    setTimeout(() => {
                        if (this.isPlaying) this._nextMessage();
                    }, 3500);
                } else {
                    // Last image: wait 3 seconds before showing close button
                    setTimeout(() => {
                        let closeBtn = this.epilogueBox.querySelector('#vn-close-btn');
                        if (closeBtn) {
                            closeBtn.style.display = 'block';
                            closeBtn.onclick = () => this.close();
                        }
                    }, 3000);
                }
                return;
            }`;

code = code.replace(oldRenderMsg, newRenderMsg);
fs.writeFileSync('minigames.js', code);
console.log('Fixed VN render message');
