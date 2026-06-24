    ,
    visualNovel: {
        overlay: null, container: null, isPlaying: false,
        state: { aff: 0, fri: 0, bf: 0, scene: 0, msgIndex: 0, mode: 'dialogue' },
        cg: {
            protag: 'file:///C:/Users/%EB%B0%95%EC%88%98%EC%98%81/.gemini/antigravity/brain/8971a263-9353-45fd-86b2-3d973211f977/protagonist_concept_1782267074338.png',
            yujin: 'file:///C:/Users/%EB%B0%95%EC%88%98%EC%98%81/.gemini/antigravity/brain/8971a263-9353-45fd-86b2-3d973211f977/yujin_vn_sprite_1782268131676.png'
        },
        script: [
            // Scene 0: Introduction
            [
                { bg: '#ffe4e1', char: '', name: '나 (독백)', text: '유진이와 나는 벌써 10년 지기 소꿉친구다. 유치원 때부터 지금까지, 우리는 매일 아침을 함께 시작했다.' },
                { bg: '#ffe4e1', char: '', name: '나 (독백)', text: '그저 편한 친구라고만 생각했는데... 요즘 들어 내 마음이 조금 이상하다.' },
                { bg: '#ffe4e1', char: 'yujin', name: '유진', text: '여어~ 늦잠꾸러기! 오늘도 내가 5분 먼저 나왔네?' },
                { bg: '#ffe4e1', char: 'protag', name: '나', text: '아씨, 알람을 못 들었어. 미안미안!' },
                { bg: '#ffe4e1', char: '', name: '나 (독백)', text: '(유진이 자연스럽게 내 팔짱을 낀다. 거리가 확 좁혀진다.)' },
                { bg: '#ffe4e1', char: '', name: '나 (독백)', text: '유진이의 온기가 팔을 타고 전해진다. 그리고 코끝을 스치는 낯설고 달콤한 냄새.' },
                { bg: '#ffe4e1', char: 'protag', name: '나', text: '어? 야, 너...' },
                {
                    choices: [
                        { text: '(얼굴을 붉히며) "너 샴푸 바꿨어? 냄새 좋다..."', effect: { aff: 1 }, next: 8 },
                        { text: '(장난치며) "안 씻고 나왔냐? 좀 떨어져라~"', effect: { fri: 1 }, next: 10 }
                    ]
                },
                // Branch 1 (Affection)
                { bg: '#ffe4e1', char: 'yujin', name: '유진', text: '진짜? 나 어제 새로 산 벚꽃 향 샴푸 썼는데! 역시 네가 제일 먼저 알아줄 줄 알았어. (환하게 웃음)', nextScene: 1 },
                { bg: '#ffe4e1', char: '', name: '나 (독백)', text: '심장이 쿵, 하고 내려앉는 기분이다. 쟤가 원래 저렇게 예쁘게 웃었나?', nextScene: 1 },
                // Branch 2 (Friendship)
                { bg: '#ffe4e1', char: 'yujin', name: '유진', text: '뭐래~ 아침에 머리 감고 왔거든? 확 정수리 냄새 맡게 해버린다! (내 목에 헤드락을 건다)', nextScene: 1 },
                { bg: '#ffe4e1', char: 'protag', name: '나', text: '아악! 항복, 항복! 알았으니까 좀 놔!', nextScene: 1 }
            ],
            // Scene 1: Gym Changing Room
            [
                { bg: '#e0f7fa', char: '', name: '나 (독백)', text: '체육 시간이 끝난 후의 텅 빈 여자 탈의실. 다른 애들은 매점으로 달려가고, 탈의실에는 유진이와 나뿐이다.' },
                { bg: '#e0f7fa', char: 'yujin', name: '유진', text: '아~ 땀 흘렸더니 찝찝해. 야, 나 교복 블라우스 등 쪽 지퍼 좀 올려주라. 손이 안 닿아.' },
                { bg: '#e0f7fa', char: '', name: '나 (독백)', text: '(유진이 훌렁 체육복 상의를 벗고 맨 등을 내민다. 브래지어 끈과 하얀 등이 훤히 보인다.)' },
                { bg: '#e0f7fa', char: '', name: '나 (독백)', text: '헉. 아무리 여자끼리라지만... 이렇게 무방비해도 되는 거야?! 얼굴이 화끈거린다.' },
                {
                    choices: [
                        { text: '시선을 피하며 조심스럽게 지퍼를 올려준다.', effect: { aff: 1 }, next: 5 },
                        { text: '"아 진짜, 살 좀 빼라!" 라며 등을 찰싹 때리고 올려준다.', effect: { fri: 1 }, next: 8 }
                    ]
                },
                // Branch 1
                { bg: '#e0f7fa', char: 'protag', name: '나', text: '으, 응... 가만히 있어봐. (손끝이 유진의 등에 살짝 닿는다)' },
                { bg: '#e0f7fa', char: 'yujin', name: '유진', text: '앗, 차가워! 네 손 왤케 차갑냐. 근데... 너 얼굴이 왜 이렇게 빨개? 감기 걸렸어? (가까이 다가와 이마를 짚는다)' },
                { bg: '#e0f7fa', char: 'protag', name: '나', text: '아, 아무것도 아니야!! 덥네, 더워!', nextScene: 2 },
                // Branch 2
                { bg: '#e0f7fa', char: 'protag', name: '나', text: '찰싹! 야, 등에 살붙은 거 보소! 지퍼가 안 올라가잖아!' },
                { bg: '#e0f7fa', char: 'yujin', name: '유진', text: '아! 아프잖아! 살 아니거든?! 뼈대가 굵은 거거든?!' },
                { bg: '#e0f7fa', char: 'protag', name: '나', text: '핑계는~ 다 올렸다.', nextScene: 2 }
            ],
            // Scene 2: Sleepover
            [
                { bg: '#1a237e', char: '', name: '나 (독백)', text: '주말 밤, 내 방. 치킨을 시켜 먹고 팩도 하다 보니 어느새 자정이다.' },
                { bg: '#1a237e', char: '', name: '나 (독백)', text: '나란히 누워 천장을 보는데, 유진이가 스르륵 눈을 감더니 내 쪽으로 파고든다.' },
                { bg: '#1a237e', char: 'yujin', name: '유진', text: '으음... 따뜻하다...' },
                { bg: '#1a237e', char: '', name: '나 (독백)', text: '(유진이가 잠결에 내 허리에 팔을 두르고 다리를 턱 얹는다. 완전히 죽부인 취급이다.)' },
                { bg: '#1a237e', char: '', name: '나 (독백)', text: '유진이의 숨결이 목덜미에 닿는다. 미치겠다. 심장 소리가 들리면 어떡하지?' },
                {
                    choices: [
                        { text: '밀어내지 않고 나도 모르게 유진의 등을 마주 안는다.', effect: { aff: 2 }, next: 6 },
                        { text: '"아 덥다고! 저리 가!" 라며 발로 뻥 차버린다.', effect: { fri: 1 }, next: 8 }
                    ]
                },
                // Branch 1
                { bg: '#1a237e', char: 'protag', name: '나', text: '...진짜, 너 깰까 봐 가만히 있는 거야. (유진의 등허리를 안아주며 토닥인다)' },
                { bg: '#1a237e', char: '', name: '나 (독백)', text: '평생 이대로 시간이 멈췄으면 좋겠다.', nextScene: 3 },
                // Branch 2
                { bg: '#1a237e', char: 'protag', name: '나', text: '야! 덥다고! 무겁다고! (이불로 유진이를 둥글게 말아버린다)' },
                { bg: '#1a237e', char: 'yujin', name: '유진', text: '으어어... 치사한 기지배... 나 혼자 잘 거다... (돌아눕는다)', nextScene: 3 }
            ],
            // Scene 3: Shopping
            [
                { bg: '#f3e5f5', char: '', name: '나 (독백)', text: '다음 날 오후. 시내로 옷을 사러 나왔다. 유진이가 화장품을 고르는 사이, 키 큰 남자가 유진이에게 다가간다.' },
                { bg: '#f3e5f5', char: '', name: '남자', text: '저기요, 아까부터 지켜봤는데요. 너무 제 이상형이셔서... 번호 좀 주실 수 있나요?' },
                { bg: '#f3e5f5', char: 'yujin', name: '유진', text: '아... 네? 저기, 그게... (당황하며 나를 쳐다본다)' },
                { bg: '#f3e5f5', char: '', name: '나 (독백)', text: '묘한 불쾌감이 치밀어 오른다. 저 남자가 작업 거는 게 싫다.' },
                {
                    choices: [
                        { text: '다가가서 허리를 감싸며 "자기야, 이 사람 누구야?" 애인 행세를 한다.', effect: { aff: 1 }, next: 5 },
                        { text: '"얘 남자친구 있어요!" 대충 둘러대준다.', effect: { fri: 1 }, next: 8 },
                        { text: '팝콘 먹는 표정으로 지켜본다.', effect: { bf: 1 }, next: 11 }
                    ]
                },
                // Branch 1
                { bg: '#f3e5f5', char: 'protag', name: '나', text: '자기야~ 나 화장실 다녀왔는데, 이 분은 누구셔? (유진의 허리를 꽉 끌어안는다)' },
                { bg: '#f3e5f5', char: '', name: '남자', text: '아... 헉, 죄, 죄송합니다!! (놀라서 도망친다)' },
                { bg: '#f3e5f5', char: 'yujin', name: '유진', text: '야!! 너 방금 자기야가 뭐야, 징그럽게! (얼굴이 붉어져 있다)', nextScene: 4 },
                // Branch 2
                { bg: '#f3e5f5', char: 'protag', name: '나', text: '저기요, 얘 남자친구 있거든요? 건드리지 마시죠!' },
                { bg: '#f3e5f5', char: '', name: '남자', text: '아... 죄송합니다. (머쓱하게 돌아간다)' },
                { bg: '#f3e5f5', char: 'yujin', name: '유진', text: '휴, 살았다. 고마워! 네가 안 구해줬으면 곤란할 뻔했어.', nextScene: 4 },
                // Branch 3
                { bg: '#f3e5f5', char: 'protag', name: '나', text: '(멀리서 핸드폰을 하는 척 구경한다.)' },
                { bg: '#f3e5f5', char: 'yujin', name: '유진', text: '죄, 죄송해요. 저 핸드폰이 없어서... (헐레벌떡 내 쪽으로 뛰어온다)' },
                { bg: '#f3e5f5', char: 'yujin', name: '유진', text: '야! 넌 친구가 곤란한데 도와주지도 않냐?!', nextScene: 4 }
            ],
            // Scene 4: Climax
            [
                { bg: '#fff3e0', char: '', name: '나 (독백)', text: '조용한 카페. 유진이가 창밖을 보더니 진지한 표정으로 입을 뗀다.' },
                { bg: '#fff3e0', char: 'yujin', name: '유진', text: '있잖아... 나 고민이 하나 있어.' },
                { bg: '#fff3e0', char: 'yujin', name: '유진', text: '사실... 나 며칠 전에 옆반 선배한테 고백받았어. 나한테 엄청 잘해주고 좋은 사람 같긴 한데...' },
                { bg: '#fff3e0', char: 'yujin', name: '유진', text: '한 번 만나볼까? 너 생각은 어때?' },
                { bg: '#fff3e0', char: '', name: '나 (독백)', text: '유진이가 다른 사람의 연인이 된다고? 지금 말하지 않으면 영영 유진이를 잃을지도 모른다.' },
                {
                    choices: [
                        { text: '"만나지 마. 나랑 만나면 안 돼?" (직진 고백)', effect: { final: 'A' }, next: 6 },
                        { text: '"연애는 무슨! 우리끼리 평생 늙어 죽자!" (우정 유지)', effect: { final: 'B' }, next: 6 },
                        { text: '"네가 좋으면 한 번 만나봐." (마음 숨김)', effect: { final: 'C' }, next: 6 }
                    ]
                },
                // Evaluate Ending here in code
                { text: '엔딩 계산 중...', executeEnding: true }
            ]
        ],
        endings: {
            trueEnding: [
                { bg: '#fce4ec', char: 'protag', name: '나', text: '만나지 마... 딴 사람 옆에서 웃는 거 보기 싫어. 나랑 만나. 친구 말고, 애인으로.' },
                { bg: '#fce4ec', char: 'yujin', name: '유진', text: '너... 너, 진심이야...? 하아... 진짜 치사하다 너.' },
                { bg: '#fce4ec', char: 'yujin', name: '유진', text: '사실 고백받은 거 뻥이야. 네가 질투해줬으면 해서 거짓말한 건데... 다행이다. 나 혼자만 이런 마음인 줄 알았는데.' },
                { bg: '#fce4ec', char: '', name: '유진', text: '잘 부탁해, 내 여자친구. (내 손을 꽉 잡는다)' },
                { isEpilogue: true, cgColor: '#ffb6c1', text: '[엔딩 1: 그날부터 1일]\n두 사람은 연인이 되어 다정하게 카페 데이트를 즐깁니다.' }
            ],
            normalEnding: [
                { bg: '#e8f5e9', char: 'protag', name: '나', text: '연애는 무슨! 우리끼리 엽떡이나 먹으면서 평생 늙어 죽자!' },
                { bg: '#e8f5e9', char: '', name: '나 (독백)', text: '차마 나를 좋아해 달라고 말할 용기가 나지 않았다. 이대로 친구로라도 네 곁에 남고 싶어.' },
                { bg: '#e8f5e9', char: 'yujin', name: '유진', text: '푸하하! 그래, 남자가 다 뭐냐! 당장 짐 싸라, 떡볶이 제일 매운맛으로 쏜다!' },
                { bg: '#e8f5e9', char: '', name: '나 (독백)', text: '마음 한구석이 욱신거리지만, 내 옆에서 환하게 웃는 유진이를 보니 이것도 나쁘지 않다는 생각이 든다.' },
                { isEpilogue: true, cgColor: '#a5d6a7', text: '[엔딩 2: 평생의 소울메이트]\n두 사람은 오락실에서 게임을 하며 세상 제일가는 베프로 영원히 함께합니다.' }
            ],
            badEnding: [
                { bg: '#eceff1', char: 'protag', name: '나', text: '네가 좋으면 한 번 만나봐. 잘 어울릴 것 같네.' },
                { bg: '#eceff1', char: 'yujin', name: '유진', text: '...그래? 네가 그렇게 말하면 한 번 생각해 봐야겠다.' },
                { bg: '#eceff1', char: '', name: '나 (독백)', text: '거짓말이었다. 가지 말라고 바짓가랑이라도 붙잡고 싶었지만, 나는 비겁하게 내 마음을 숨겼다.' },
                { bg: '#eceff1', char: '', name: '나 (독백)', text: '며칠 뒤, 유진이는 정말로 그 선배와 연애를 시작했다. 카톡 프사는 언제나 그 남자와 찍은 사진뿐이다.' },
                { isEpilogue: true, cgColor: '#90a4ae', text: '[엔딩 3: 엇갈린 마음과 그림자]\n유진이가 다른 사람과 다정하게 걸어가는 모습을 뒤에서 훔쳐보며 씁쓸하게 후회합니다.' }
            ]
        },

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay; this.container = gameContainer;
            
            this.container.innerHTML = `
                <div id="vn-bg" style="position:absolute;width:100%;height:100%;background-color:#ffe4e1;transition:background 0.5s;"></div>
                <div id="vn-char-container" style="position:absolute;width:100%;height:100%;display:flex;justify-content:center;align-items:flex-end;">
                    <img id="vn-char-protag" src="\${this.cg.protag}" style="height:80%;display:none;margin-right:-50px;z-index:2;filter:drop-shadow(0 0 10px rgba(0,0,0,0.3));">
                    <img id="vn-char-yujin" src="\${this.cg.yujin}" style="height:90%;display:none;z-index:1;filter:drop-shadow(0 0 10px rgba(0,0,0,0.3));">
                </div>
                <div id="vn-dialogue-box" style="position:absolute;bottom:20px;left:5%;width:90%;height:150px;background:rgba(0,0,0,0.75);border:2px solid #fff;border-radius:10px;padding:20px;box-sizing:border-box;color:#fff;font-family:sans-serif;cursor:pointer;z-index:10;">
                    <div id="vn-name" style="font-weight:bold;font-size:22px;color:#ffb6c1;margin-bottom:10px;"></div>
                    <div id="vn-text" style="font-size:18px;line-height:1.5;"></div>
                </div>
                <div id="vn-choices" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;flex-direction:column;justify-content:center;align-items:center;z-index:20;"></div>
                <div id="vn-epilogue" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none;flex-direction:column;justify-content:center;align-items:center;z-index:30;padding:40px;box-sizing:border-box;text-align:center;">
                    <h1 id="vn-epilogue-text" style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;"></h1>
                    <button id="vn-close-btn" style="margin-top:40px;padding:15px 30px;font-size:18px;background:#fff;color:#000;border:none;border-radius:25px;cursor:pointer;font-weight:bold;">게임 종료</button>
                </div>
                <button id="vn-x-btn" style="position:absolute;top:10px;right:10px;width:36px;height:36px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:18px;cursor:pointer;font-size:20px;z-index:100;font-weight:bold;">✕</button>
            `;
            
            this.bgEl = this.container.querySelector('#vn-bg');
            this.nameEl = this.container.querySelector('#vn-name');
            this.textEl = this.container.querySelector('#vn-text');
            this.dialogueBox = this.container.querySelector('#vn-dialogue-box');
            this.choicesBox = this.container.querySelector('#vn-choices');
            this.epilogueBox = this.container.querySelector('#vn-epilogue');
            this.epilogueText = this.container.querySelector('#vn-epilogue-text');
            this.charProtag = this.container.querySelector('#vn-char-protag');
            this.charYujin = this.container.querySelector('#vn-char-yujin');
            
            this.container.querySelector('#vn-x-btn').onclick = () => this.close();
            this.container.querySelector('#vn-close-btn').onclick = () => this.close();
            this.dialogueBox.onclick = () => this._nextMessage();
            
            this.state = { aff: 0, fri: 0, bf: 0, scene: 0, msgIndex: 0, mode: 'dialogue', currentScript: this.script[0] };
            this.isPlaying = true;
            this._renderMessage();
        },

        _renderMessage() {
            if (!this.isPlaying) return;
            const msg = this.state.currentScript[this.state.msgIndex];
            
            if (msg.executeEnding) {
                this._determineEnding();
                return;
            }

            if (msg.isEpilogue) {
                this.epilogueBox.style.display = 'flex';
                this.epilogueBox.style.backgroundColor = msg.cgColor;
                this.epilogueText.innerText = msg.text;
                this.dialogueBox.style.display = 'none';
                return;
            }

            if (msg.choices) {
                this.state.mode = 'choice';
                this.choicesBox.innerHTML = '';
                this.choicesBox.style.display = 'flex';
                msg.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.innerText = choice.text;
                    btn.style.cssText = 'width:80%;padding:15px;margin:10px;background:#fff;color:#333;border:2px solid #ffb6c1;border-radius:10px;font-size:18px;cursor:pointer;font-weight:bold;transition:0.2s;';
                    btn.onmouseover = () => btn.style.background = '#ffe4e1';
                    btn.onmouseout = () => btn.style.background = '#fff';
                    btn.onclick = () => this._selectChoice(choice);
                    this.choicesBox.appendChild(btn);
                });
                return;
            }

            this.bgEl.style.backgroundColor = msg.bg || '#ffe4e1';
            this.nameEl.innerText = msg.name || '';
            this.textEl.innerText = msg.text || '';
            
            // Character display logic
            this.charProtag.style.display = (msg.char === 'protag') ? 'block' : 'none';
            this.charYujin.style.display = (msg.char === 'yujin') ? 'block' : 'none';
            if (msg.char === 'both') {
                this.charProtag.style.display = 'block';
                this.charYujin.style.display = 'block';
            }
        },

        _nextMessage() {
            if (this.state.mode !== 'dialogue') return;
            const msg = this.state.currentScript[this.state.msgIndex];
            
            if (msg.nextScene !== undefined) {
                this.state.scene = msg.nextScene;
                this.state.currentScript = this.script[this.state.scene];
                this.state.msgIndex = 0;
            } else if (msg.next !== undefined) {
                this.state.msgIndex = msg.next;
            } else {
                this.state.msgIndex++;
            }
            this._renderMessage();
        },

        _selectChoice(choice) {
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
        },

        _determineEnding() {
            let endingScript;
            if (this.state.finalChoice === 'A') {
                if (this.state.aff >= 3) {
                    endingScript = this.endings.trueEnding;
                } else {
                    endingScript = this.endings.normalEnding; // Not enough affection for true ending
                }
            } else if (this.state.finalChoice === 'B') {
                endingScript = this.endings.normalEnding;
            } else {
                endingScript = this.endings.badEnding;
            }
            
            this.state.currentScript = endingScript;
            this.state.msgIndex = 0;
            this._renderMessage();
        },

        close() {
            this.isPlaying = false;
            if (this.overlay) this.overlay.remove();
        }
    }
