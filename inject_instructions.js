const fs = require('fs');

// 1. Update minigames.js
let minigames = fs.readFileSync('minigames.js', 'utf8');

const launchCode = `
    instructions: {
        shooter: "방향키(←↑→↓): 이동<br>스페이스바: 레이저 발사<br>적을 파괴하고 점수를 획득하세요!",
        rpg: "화면을 클릭하여 몬스터를 공격하세요.<br>돈을 모아 우측 하단 상점에서 데미지를 업그레이드할 수 있습니다.",
        strategy: "빈 칸을 클릭하고 키보드로 1~9 사이의 숫자를 입력하세요.<br>가로, 세로, 3x3 박스에 중복된 숫자가 없어야 합니다.",
        adventure: "방향키(←↑→↓)로 미로를 탐험하세요.<br>탈출구(초록색)를 찾으면 다음 단계로 넘어갑니다.",
        simSports: "빈 밭을 클릭하여 씨앗을 심고, 작물이 다 자라면 클릭하여 수확하세요.<br>수확한 돈으로 새 씨앗을 구매해 농장을 키우세요.",
        platformer: "좌우 방향키(←→) 또는 A/D: 이동<br>위 방향키(↑) 또는 W/Space: 점프<br>발판을 밟고 목표 지점에 도달하세요.",
        extraction: "W, A, S, D: 이동 | 마우스 클릭: 총 발사<br>좀비를 피해 아이템을 파밍하고, 녹색 탈출 구역으로 무사히 빠져나가세요.",
        visualNovel: "마우스를 클릭하면 대사가 진행됩니다.<br>중간중간 나오는 선택지에 따라 히로인과의 엔딩이 달라집니다.",
        sports: "마우스 커서로 조준하고 클릭하여 슛을 쏘세요!<br>좌우로 움직이는 골키퍼를 피해 5번의 기회 안에 최대한 많은 골을 넣으세요.",
        racing: "방향키(또는 W/A/S/D)로 카트를 운전하세요.<br>버섯(🍄)을 먹으면 부스터 발동!<br>바나나(🍌)를 밟으면 미끄러집니다.<br>총 3바퀴를 빠르게 완주하세요.",
        sandbox: "A, D: 이동 | W, Space: 점프<br>좌클릭: 블록 부수기 | 우클릭: 블록 설치하기<br>숫자 1~7: 핫바에서 설치할 블록 종류 선택",
        rts: "마우스 드래그로 마린 부대를 선택(초록색 네모)하세요.<br>우클릭으로 부대를 이동시킬 수 있습니다.<br>광물을 모아 [마린 생산] 버튼을 누르고 외계 괴물로부터 기지를 방어하세요!"
    },

    launch: function(gameKey, gameName) {
        if (!this[gameKey]) return;
        
        const { overlay, gameContainer } = this._createOverlay();
        
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
        gameContainer.style.justifyContent = 'center';
        gameContainer.style.alignItems = 'center';
        gameContainer.style.backgroundColor = '#1a1a2e'; // Dark background
        
        const title = document.createElement('h1');
        title.innerHTML = gameName || "미니게임";
        title.style.color = '#fff';
        title.style.marginBottom = '30px';
        title.style.fontSize = '32px';
        title.style.textShadow = '2px 2px 4px #000';
        gameContainer.appendChild(title);
        
        const instBox = document.createElement('div');
        instBox.style.background = 'rgba(255,255,255,0.1)';
        instBox.style.padding = '30px';
        instBox.style.borderRadius = '15px';
        instBox.style.color = '#eee';
        instBox.style.fontSize = '18px';
        instBox.style.lineHeight = '1.8';
        instBox.style.textAlign = 'center';
        instBox.style.maxWidth = '600px';
        instBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        
        const instText = this.instructions[gameKey] || "게임을 시작합니다.";
        instBox.innerHTML = \`<h3 style="color:#e94560;margin-top:0;font-size:24px;">🎮 플레이 방법</h3><p>\${instText}</p>\`;
        gameContainer.appendChild(instBox);
        
        const startBtn = document.createElement('button');
        startBtn.innerText = '게임 시작!';
        startBtn.style.marginTop = '40px';
        startBtn.style.padding = '15px 50px';
        startBtn.style.fontSize = '22px';
        startBtn.style.fontWeight = 'bold';
        startBtn.style.background = '#e94560';
        startBtn.style.color = '#fff';
        startBtn.style.border = 'none';
        startBtn.style.borderRadius = '30px';
        startBtn.style.cursor = 'pointer';
        startBtn.style.boxShadow = '0 5px 15px rgba(233, 69, 96, 0.4)';
        startBtn.style.transition = 'transform 0.2s, background 0.2s';
        
        startBtn.onmouseover = () => { startBtn.style.background = '#ff5c77'; startBtn.style.transform = 'scale(1.05)'; };
        startBtn.onmouseout = () => { startBtn.style.background = '#e94560'; startBtn.style.transform = 'scale(1)'; };
        
        startBtn.onclick = () => {
            this[gameKey].init(); // init() internally calls _createOverlay which removes this screen
        };
        gameContainer.appendChild(startBtn);
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.background = 'rgba(0,0,0,0.5)';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = '2px solid #fff';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.width = '40px';
        closeBtn.style.height = '40px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '20px';
        closeBtn.onclick = () => overlay.remove();
        gameContainer.appendChild(closeBtn);
    },
`;

// Insert launch function right after _createOverlay() ends.
const insertPos = minigames.indexOf('    _createOverlay() {');
// find the closing brace of _createOverlay
let openBraces = 0;
let endOverlayIdx = -1;
for (let i = insertPos; i < minigames.length; i++) {
    if (minigames[i] === '{') openBraces++;
    else if (minigames[i] === '}') {
        openBraces--;
        if (openBraces === 0) {
            endOverlayIdx = i + 1;
            break;
        }
    }
}

if (endOverlayIdx !== -1) {
    minigames = minigames.substring(0, endOverlayIdx) + '\\n\\n' + launchCode + minigames.substring(endOverlayIdx);
    fs.writeFileSync('minigames.js', minigames);
    console.log('minigames.js patched with launch function.');
} else {
    console.error('Could not find end of _createOverlay()');
}

// 2. Update script.js
let script = fs.readFileSync('script.js', 'utf8');
script = script.replace('MiniGames[sub.hasGame].init(imgContainer);', 'MiniGames.launch(sub.hasGame, sub.name);');
fs.writeFileSync('script.js', script);
console.log('script.js patched to call MiniGames.launch().');
