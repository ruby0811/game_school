// 미니게임 로직 모음

const MiniGames = {
    // 공통 유틸: 전체화면 오버레이 생성
    _createOverlay() {
        if (document.getElementById('minigame-fullscreen-overlay')) {
            document.getElementById('minigame-fullscreen-overlay').remove();
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'minigame-fullscreen-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.backdropFilter = 'blur(10px)'; // 배경 블러 처리
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        const gameContainer = document.createElement('div');
        gameContainer.style.position = 'relative';
        gameContainer.style.width = '800px';
        gameContainer.style.maxWidth = '90vw';
        gameContainer.style.height = '600px';
        gameContainer.style.maxHeight = '90vh';
        gameContainer.style.backgroundColor = '#1a1a2e';
        gameContainer.style.borderRadius = '20px';
        gameContainer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        gameContainer.style.overflow = 'hidden';

        overlay.appendChild(gameContainer);
        document.body.appendChild(overlay);

        return { overlay, gameContainer };
    },
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
        instBox.innerHTML = `<h3 style="color:#e94560;margin-top:0;font-size:24px;">🎮 플레이 방법</h3><p>${instText}</p>`;
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

    platformer: {
        overlay: null,
        container: null,
        canvas: null,
        ctx: null,
        animationId: null,
        isPlaying: false,
        
        player: { x: 50, y: 150, width: 40, height: 40, dy: 0, gravity: 0.6, jumpPower: -12, isGrounded: true },
        obstacles: [],
        frames: 0,
        score: 0,

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;
            
            // 캔버스 생성
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'minigame-canvas';
            this.canvas.width = this.container.clientWidth;
            this.canvas.height = this.container.clientHeight;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.backgroundColor = '#1a1a2e';
            
            this.ctx = this.canvas.getContext('2d');
            this.container.appendChild(this.canvas);

            // 초기 UI 컨테이너
            const uiDiv = document.createElement('div');
            uiDiv.id = 'minigame-ui';
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '0';
            uiDiv.style.left = '0';
            uiDiv.style.width = '100%';
            uiDiv.style.height = '100%';
            uiDiv.style.zIndex = '11';
            uiDiv.style.display = 'flex';
            uiDiv.style.flexDirection = 'column';
            uiDiv.style.alignItems = 'center';
            uiDiv.style.justifyContent = 'center';
            uiDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';

            const title = document.createElement('h2');
            title.innerText = '🏃‍♂️ 플랫포머 점프 게임';
            title.style.color = '#fff';
            title.style.fontSize = '2rem';
            title.style.marginBottom = '30px';

            const startBtn = document.createElement('button');
            startBtn.innerText = '게임 시작 (Space바)';
            startBtn.className = 'play-game-btn'; 
            startBtn.style.padding = '15px 30px';
            startBtn.style.fontSize = '1.2rem';
            startBtn.style.cursor = 'pointer';
            startBtn.style.marginBottom = '15px';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerText = '닫기';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '1px solid #fff';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '1rem';

            uiDiv.appendChild(title);
            uiDiv.appendChild(startBtn);
            uiDiv.appendChild(closeBtn);
            this.container.appendChild(uiDiv);

            // 이벤트 리스너 바인딩
            this.handleInput = this.handleInput.bind(this);
            document.addEventListener('keydown', this.handleInput);
            this.canvas.addEventListener('mousedown', this.handleInput);
            this.canvas.addEventListener('touchstart', this.handleInput);

            startBtn.onclick = () => {
                uiDiv.style.display = 'none';
                this.startGame();
            };

            closeBtn.onclick = () => {
                this.stopGame();
            };
        },

        startGame() {
            this.isPlaying = true;
            this.frames = 0;
            this.score = 0;
            this.obstacles = [];
            this.player.y = this.canvas.height - this.player.height - 40; // 바닥 기준
            this.player.dy = 0;
            this.player.isGrounded = true;
            
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.loop();
        },

        stopGame() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            document.removeEventListener('keydown', this.handleInput);
            if(this.overlay) {
                this.overlay.remove();
            }
        },

        handleInput(e) {
            if (!this.isPlaying) return;
            if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
            if (e.type === 'keydown') e.preventDefault(); // 스페이스바 스크롤 방지

            if (this.player.isGrounded) {
                this.player.dy = this.player.jumpPower;
                this.player.isGrounded = false;
            }
        },

        loop() {
            if (!this.isPlaying) return;
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(this.loop.bind(this));
        },

        update() {
            this.frames++;
            this.score += 1;

            this.player.dy += this.player.gravity;
            this.player.y += this.player.dy;

            const floor = this.canvas.height - 40;

            if (this.player.y + this.player.height >= floor) {
                this.player.y = floor - this.player.height;
                this.player.dy = 0;
                this.player.isGrounded = true;
            }

            let spawnRate = 120 - Math.floor(this.score / 100);
            if (spawnRate < 40) spawnRate = 40;

            if (this.frames % spawnRate === 0) {
                let obsHeight = 30 + Math.random() * 40;
                this.obstacles.push({
                    x: this.canvas.width,
                    y: floor - obsHeight,
                    width: 30,
                    height: obsHeight,
                    speed: 12 + (this.score / 300)
                });
            }

            for (let i = 0; i < this.obstacles.length; i++) {
                let obs = this.obstacles[i];
                obs.x -= obs.speed;

                if (
                    this.player.x < obs.x + obs.width &&
                    this.player.x + this.player.width > obs.x &&
                    this.player.y < obs.y + obs.height &&
                    this.player.y + this.player.height > obs.y
                ) {
                    this.gameOver();
                    return;
                }
            }

            this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);
        },

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const floor = this.canvas.height - 40;
            this.ctx.fillStyle = '#4a4e69';
            this.ctx.fillRect(0, floor, this.canvas.width, 40);

            this.ctx.fillStyle = '#e94560'; 
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(this.player.x + 25, this.player.y + 8, 8, 8);

            this.ctx.fillStyle = '#f9a826';
            for (let i = 0; i < this.obstacles.length; i++) {
                let obs = this.obstacles[i];
                this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px "Pretendard", sans-serif';
            this.ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, 30, 40);
        },

        gameOver() {
            this.isPlaying = false;
            
            const uiDiv = document.createElement('div');
            uiDiv.id = 'minigame-ui';
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '0';
            uiDiv.style.left = '0';
            uiDiv.style.width = '100%';
            uiDiv.style.height = '100%';
            uiDiv.style.zIndex = '11';
            uiDiv.style.display = 'flex';
            uiDiv.style.flexDirection = 'column';
            uiDiv.style.alignItems = 'center';
            uiDiv.style.justifyContent = 'center';
            uiDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

            const title = document.createElement('h2');
            title.innerText = 'Game Over!';
            title.style.color = '#e94560';
            title.style.fontSize = '3rem';
            title.style.marginBottom = '20px';

            const scoreText = document.createElement('p');
            scoreText.innerText = `최종 점수: ${Math.floor(this.score / 10)}`;
            scoreText.style.color = '#fff';
            scoreText.style.marginBottom = '30px';
            scoreText.style.fontSize = '1.5rem';

            const restartBtn = document.createElement('button');
            restartBtn.innerText = '다시 하기 (Space바)';
            restartBtn.className = 'play-game-btn'; 
            restartBtn.style.padding = '15px 30px';
            restartBtn.style.fontSize = '1.2rem';
            restartBtn.style.cursor = 'pointer';
            restartBtn.style.marginBottom = '15px';

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '닫기';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '1px solid #fff';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '1rem';

            uiDiv.appendChild(title);
            uiDiv.appendChild(scoreText);
            uiDiv.appendChild(restartBtn);
            uiDiv.appendChild(closeBtn);
            this.container.appendChild(uiDiv);

            restartBtn.onclick = () => {
                uiDiv.remove();
                this.startGame();
            };

            closeBtn.onclick = () => {
                this.stopGame();
            };
            
            const restartOnSpace = (e) => {
                if (e.code === 'Space') {
                    document.removeEventListener('keydown', restartOnSpace);
                    if(uiDiv) uiDiv.remove();
                    this.startGame();
                }
            };
            setTimeout(() => {
                document.addEventListener('keydown', restartOnSpace);
            }, 300);
        }
    },

    tetris: {
        overlay: null,
        container: null,
        canvas: null,
        ctx: null,
        blockSize: 30,
        cols: 10,
        rows: 20,
        board: [],
        current: null,
        next: null,
        intervalId: null,
        speed: 400,
        isPlaying: false,

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;

            // Make the game container taller for Tetris
            this.container.style.width = '400px'; // Tetris is vertical
            this.container.style.height = '800px';

            const containerHeight = this.container.clientHeight || 600;
            this.blockSize = Math.floor(containerHeight / this.rows);
            if (this.blockSize < 10) this.blockSize = 10;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'tetris-canvas';
            this.canvas.width = this.blockSize * this.cols;
            this.canvas.height = this.blockSize * this.rows;
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = '50%';
            this.canvas.style.transform = 'translateX(-50%)';
            this.canvas.style.top = '0';
            this.canvas.style.backgroundColor = '#1a1a2e';
            this.canvas.style.border = '2px solid #333';
            this.container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            this._resetBoard();
            this._spawnPiece();
            this.isPlaying = true;
            this.speed = 400;
            
            const uiDiv = document.createElement('div');
            uiDiv.id = 'tetris-start-ui';
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '0';
            uiDiv.style.left = '0';
            uiDiv.style.width = '100%';
            uiDiv.style.height = '100%';
            uiDiv.style.zIndex = '13';
            uiDiv.style.display = 'flex';
            uiDiv.style.flexDirection = 'column';
            uiDiv.style.alignItems = 'center';
            uiDiv.style.justifyContent = 'center';
            uiDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

            const title = document.createElement('h2');
            title.innerText = '🧩 테트리스';
            title.style.color = '#fff';
            title.style.fontSize = '2.5rem';
            title.style.marginBottom = '30px';

            const startBtn = document.createElement('button');
            startBtn.innerText = '게임 시작 (Space바)';
            startBtn.className = 'play-game-btn'; 
            startBtn.style.padding = '15px 30px';
            startBtn.style.fontSize = '1.2rem';
            startBtn.style.cursor = 'pointer';
            startBtn.style.marginBottom = '15px';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerText = '닫기';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '1px solid #fff';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.cursor = 'pointer';

            uiDiv.appendChild(title);
            uiDiv.appendChild(startBtn);
            uiDiv.appendChild(closeBtn);
            this.container.appendChild(uiDiv);

            this._keyHandler = this._keyHandler.bind(this);
            document.addEventListener('keydown', this._keyHandler);

            startBtn.onclick = () => {
                uiDiv.remove();
                this._loop();
            };

            closeBtn.onclick = () => {
                uiDiv.remove();
                this.close();
            };
        },

        _resetBoard() {
            this.board = Array.from({length: this.rows}, () => Array(this.cols).fill(0));
        },

        _pieces() {
            const colors = ['#00f0f0','#f0a000','#a000f0','#00f000','#f00000','#0000f0','#f0f000'];
            return [
                {shape:[[1,1,1,1]],          color:colors[0]}, // I
                {shape:[[1,1],[1,1]],        color:colors[1]}, // O
                {shape:[[0,1,0],[1,1,1]],    color:colors[2]}, // T
                {shape:[[0,1,1],[1,1,0]],    color:colors[3]}, // S
                {shape:[[1,1,0],[0,1,1]],    color:colors[4]}, // Z
                {shape:[[1,0,0],[1,1,1]],    color:colors[5]}, // J
                {shape:[[0,0,1],[1,1,1]],    color:colors[6]}, // L
            ];
        },

        _spawnPiece() {
            const pieces = this._pieces();
            const idx = Math.floor(Math.random()*pieces.length);
            const piece = pieces[idx];
            this.current = {
                shape: piece.shape,
                color: piece.color,
                x: Math.floor(this.cols/2) - Math.ceil(piece.shape[0].length/2),
                y: 0
            };
        },

        _rotate(shape) {
            const h = shape.length, w = shape[0].length;
            const rot = Array.from({length:w},()=>Array(h).fill(0));
            for(let y=0;y<h;y++){
                for(let x=0;x<w;x++){
                    rot[x][h-1-y]=shape[y][x];
                }
            }
            return rot;
        },

        _collides(piece) {
            const {shape,x,y}=piece;
            for(let r=0;r<shape.length;r++){
                for(let c=0;c<shape[r].length;c++){
                    if(shape[r][c]){
                        const nx=x+c, ny=y+r;
                        if(nx<0||nx>=this.cols||ny>=this.rows) return true;
                        if(this.board[ny][nx]) return true;
                    }
                }
            }
            return false;
        },

        _merge() {
            const {shape,x,y,color}=this.current;
            for(let r=0;r<shape.length;r++){
                for(let c=0;c<shape[r].length;c++){
                    if(shape[r][c]){
                        this.board[y+r][x+c]=color;
                    }
                }
            }
        },

        _clearLines() {
            let cleared=0;
            this.board = this.board.filter(row=> {
                if(row.every(v=>v)) { cleared++; return false; }
                return true;
            });
            while(this.board.length<this.rows){
                this.board.unshift(Array(this.cols).fill(0));
            }
            if(cleared) this.speed = Math.max(100, this.speed - 50);
        },

        _loop() {
            if(!this.isPlaying) return;
            this.current.y++;
            if(this._collides(this.current)){
                this.current.y--;
                this._merge();
                this._clearLines();
                this._spawnPiece();
                if(this._collides(this.current)){
                    this._gameOver();
                    return;
                }
            }
            this._draw();
            this.intervalId = setTimeout(()=>this._loop(), this.speed);
        },

        _draw() {
            if(!this.ctx) return;
            const ctx=this.ctx;
            ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            for(let y=0;y<this.rows;y++){
                for(let x=0;x<this.cols;x++){
                    const col=this.board[y][x];
                    if(col){
                        ctx.fillStyle=col;
                        ctx.fillRect(x*this.blockSize, y*this.blockSize,
                                     this.blockSize-1, this.blockSize-1);
                        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                        ctx.strokeRect(x*this.blockSize, y*this.blockSize,
                                     this.blockSize, this.blockSize);
                    }
                }
            }
            const {shape,x,y,color}=this.current;
            ctx.fillStyle=color;
            for(let r=0;r<shape.length;r++){
                for(let c=0;c<shape[r].length;c++){
                    if(shape[r][c]){
                        ctx.fillRect((x+c)*this.blockSize,
                                     (y+r)*this.blockSize,
                                     this.blockSize-1, this.blockSize-1);
                        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                        ctx.strokeRect((x+c)*this.blockSize, (y+r)*this.blockSize,
                                     this.blockSize, this.blockSize);
                    }
                }
            }
        },

        _keyHandler(e) {
            if(document.getElementById('tetris-start-ui')) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    document.getElementById('tetris-start-ui').remove();
                    this._loop();
                }
                return;
            }

            if(!this.isPlaying) return;
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            if(e.code==='ArrowLeft'){
                this.current.x--;
                if(this._collides(this.current)) this.current.x++;
            }
            else if(e.code==='ArrowRight'){
                this.current.x++;
                if(this._collides(this.current)) this.current.x--;
            }
            else if(e.code==='ArrowDown'){
                this.current.y++;
                if(this._collides(this.current)){
                    this.current.y--;
                }
            }
            else if(e.code==='ArrowUp'){
                const rot=this._rotate(this.current.shape);
                const saved=this.current.shape;
                this.current.shape=rot;
                if(this._collides(this.current)) this.current.shape=saved;
            }
            else if(e.code==='Space'){
                while(!this._collides(this.current)){
                    this.current.y++;
                }
                this.current.y--;
                this._merge();
                this._clearLines();
                this._spawnPiece();
                if(this._collides(this.current)){
                    this._draw();
                    this._gameOver();
                    return;
                }
                clearTimeout(this.intervalId);
                this.intervalId = setTimeout(()=>this._loop(), this.speed);
            }
            this._draw();
        },

        _gameOver(){
            this.isPlaying=false;
            clearTimeout(this.intervalId);
            document.removeEventListener('keydown', this._keyHandler);
            
            const uiDiv = document.createElement('div');
            uiDiv.id = 'tetris-over';
            uiDiv.style.position='absolute';
            uiDiv.style.top='0';
            uiDiv.style.left='0';
            uiDiv.style.width='100%';
            uiDiv.style.height='100%';
            uiDiv.style.background='rgba(0,0,0,0.85)';
            uiDiv.style.display='flex';
            uiDiv.style.flexDirection='column';
            uiDiv.style.alignItems='center';
            uiDiv.style.justifyContent='center';
            uiDiv.style.zIndex='15';

            const title = document.createElement('h2');
            title.innerText = 'Game Over';
            title.style.color = '#fff';
            title.style.fontSize = '3rem';
            title.style.marginBottom = '20px';

            const restartBtn = document.createElement('button');
            restartBtn.innerText = '다시 시작';
            restartBtn.className = 'play-game-btn'; 
            restartBtn.style.padding = '15px 30px';
            restartBtn.style.fontSize = '1.2rem';
            restartBtn.style.cursor = 'pointer';
            restartBtn.style.marginBottom = '15px';
            restartBtn.onclick = () => this.restart();

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '닫기';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '1px solid #fff';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();

            uiDiv.appendChild(title);
            uiDiv.appendChild(restartBtn);
            uiDiv.appendChild(closeBtn);
            this.container.appendChild(uiDiv);
        },

        restart(){
            const over=document.getElementById('tetris-over');
            if(over) over.remove();
            this._resetBoard();
            this._spawnPiece();
            this.speed=400;
            this.isPlaying=true;
            document.addEventListener('keydown', this._keyHandler);
            this._loop();
        },

        close(){
            const over=document.getElementById('tetris-over');
            if(over) over.remove();
            if(this.overlay) this.overlay.remove();
            this.isPlaying=false;
            clearTimeout(this.intervalId);
            document.removeEventListener('keydown', this._keyHandler);
        }
    },

    fps: {
        overlay: null,
        container: null,
        animationId: null,
        isPlaying: false,
        score: 0,
        timeLeft: 30, // 30 seconds for 3D version
        timerInterval: null,
        
        // Three.js specific
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        raycaster: null,
        targets: [],
        lastSpawnTime: 0,
        
        // Movement
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        velocity: null,
        direction: null,
        prevTime: performance.now(),

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;

            this.container.style.width = '100vw'; 
            this.container.style.height = '100vh';
            this.container.style.maxWidth = '100vw';
            this.container.style.maxHeight = '100vh';
            this.container.style.borderRadius = '0'; // Fullscreen immersion

            if (!window.THREE) {
                alert("Three.js 로딩 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.");
                this.close();
                return;
            }

            // Init Three.js Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color( 0x87ceeb ); // Sky blue
            this.scene.fog = new THREE.Fog( 0x87ceeb, 0, 750 );

            const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
            light.position.set( 0.5, 1, 0.75 );
            this.scene.add( light );

            this.camera = new THREE.PerspectiveCamera( 75, this.container.clientWidth / this.container.clientHeight, 1, 1000 );
            
            this.controls = new THREE.PointerLockControls( this.camera, this.container );

            // Floor
            const floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
            floorGeometry.rotateX( - Math.PI / 2 );
            const floorMaterial = new THREE.MeshBasicMaterial( { color: 0x556655, wireframe: true } );
            const floor = new THREE.Mesh( floorGeometry, floorMaterial );
            this.scene.add( floor );

            this.raycaster = new THREE.Raycaster();
            this.velocity = new THREE.Vector3();
            this.direction = new THREE.Vector3();

            this.renderer = new THREE.WebGLRenderer( { antialias: true } );
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
            this.container.appendChild( this.renderer.domElement );

            // UI
            const uiDiv = document.createElement('div');
            uiDiv.id = 'fps-start-ui';
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '0';
            uiDiv.style.left = '0';
            uiDiv.style.width = '100%';
            uiDiv.style.height = '100%';
            uiDiv.style.zIndex = '11';
            uiDiv.style.display = 'flex';
            uiDiv.style.flexDirection = 'column';
            uiDiv.style.alignItems = 'center';
            uiDiv.style.justifyContent = 'center';
            uiDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';

            const title = document.createElement('h2');
            title.innerText = '🎮 3D FPS 훈련장';
            title.style.color = '#fff';
            title.style.fontSize = '3rem';
            title.style.marginBottom = '20px';

            const desc = document.createElement('p');
            desc.innerText = 'WASD: 이동 | 마우스: 시선 변경 | 좌클릭: 사격\n화면을 클릭하면 마우스가 고정되며 게임이 시작됩니다.\n(마우스 고정을 해제하려면 ESC 키를 누르세요)\n제한시간: 30초';
            desc.style.color = '#ccc';
            desc.style.textAlign = 'center';
            desc.style.marginBottom = '40px';
            desc.style.lineHeight = '1.5';

            const startBtn = document.createElement('button');
            startBtn.innerText = '화면을 클릭하여 시작';
            startBtn.className = 'play-game-btn'; 
            startBtn.style.padding = '15px 30px';
            startBtn.style.fontSize = '1.2rem';
            startBtn.style.cursor = 'pointer';
            startBtn.style.marginBottom = '15px';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerText = '닫기';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '1px solid #fff';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();

            uiDiv.appendChild(title);
            uiDiv.appendChild(desc);
            uiDiv.appendChild(startBtn);
            uiDiv.appendChild(closeBtn);
            this.container.appendChild(uiDiv);

            // Crosshair
            const crosshair = document.createElement('div');
            crosshair.innerText = '+';
            crosshair.style.position = 'absolute';
            crosshair.style.top = '50%';
            crosshair.style.left = '50%';
            crosshair.style.transform = 'translate(-50%, -50%)';
            crosshair.style.color = 'lime';
            crosshair.style.fontSize = '30px';
            crosshair.style.pointerEvents = 'none';
            crosshair.style.zIndex = '10';
            this.container.appendChild(crosshair);

            // HUD
            const hud = document.createElement('div');
            hud.id = 'fps-hud';
            hud.style.position = 'absolute';
            hud.style.top = '20px';
            hud.style.left = '20px';
            hud.style.right = '20px';
            hud.style.display = 'flex';
            hud.style.justifyContent = 'space-between';
            hud.style.color = '#fff';
            hud.style.fontSize = '24px';
            hud.style.fontWeight = 'bold';
            hud.style.pointerEvents = 'none';
            hud.style.zIndex = '10';
            
            const scoreSpan = document.createElement('span');
            scoreSpan.id = 'fps-score';
            scoreSpan.innerText = '🎯 처치: 0';
            
            const timeSpan = document.createElement('span');
            timeSpan.id = 'fps-time';
            timeSpan.innerText = '⏱ 시간: 30초';

            hud.appendChild(scoreSpan);
            hud.appendChild(timeSpan);
            this.container.appendChild(hud);

            // Gun visual (simple HTML overlay)
            const gun = document.createElement('div');
            gun.id = 'fps-gun';
            gun.innerText = '🔫';
            gun.style.position = 'absolute';
            gun.style.bottom = '-20px';
            gun.style.right = '30%';
            gun.style.fontSize = '120px';
            gun.style.pointerEvents = 'none';
            gun.style.transition = 'transform 0.05s';
            gun.style.zIndex = '10';
            this.container.appendChild(gun);

            // Events
            this.onKeyDown = this.onKeyDown.bind(this);
            this.onKeyUp = this.onKeyUp.bind(this);
            this.onMouseClick = this.onMouseClick.bind(this);
            this.onWindowResize = this.onWindowResize.bind(this);

            document.addEventListener( 'keydown', this.onKeyDown );
            document.addEventListener( 'keyup', this.onKeyUp );
            window.addEventListener( 'resize', this.onWindowResize );

            uiDiv.addEventListener( 'click', () => {
                this.controls.lock();
            });

            this.controls.addEventListener( 'lock', () => {
                uiDiv.style.display = 'none';
                if (!this.isPlaying) this.startGame();
            });

            this.controls.addEventListener( 'unlock', () => {
                if (this.isPlaying) {
                    uiDiv.style.display = 'flex';
                    uiDiv.querySelector('h2').innerText = '일시 정지';
                    uiDiv.querySelector('p').innerText = '화면을 클릭하여 계속하기';
                }
            });

            document.addEventListener('mousedown', this.onMouseClick);
            
            this.animate = this.animate.bind(this);
        },

        startGame() {
            this.isPlaying = true;
            this.score = 0;
            this.timeLeft = 30;
            this.prevTime = performance.now();
            
            // Clear existing targets
            this.targets.forEach(t => this.scene.remove(t));
            this.targets = [];

            this.updateHUD();
            
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.timerInterval) clearInterval(this.timerInterval);

            this.timerInterval = setInterval(() => {
                if (this.controls.isLocked) {
                    this.timeLeft--;
                    this.updateHUD();
                    if (this.timeLeft <= 0) {
                        this.gameOver();
                    }
                }
            }, 1000);

            // Add initial targets
            for(let i=0; i<10; i++) this.spawnTarget();

            this.animate();
        },

        onKeyDown( event ) {
            switch ( event.code ) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        },

        onKeyUp( event ) {
            switch ( event.code ) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        },

        onMouseClick(event) {
            if (!this.controls.isLocked || !this.isPlaying) return;

            // Recoil animation
            const gun = document.getElementById('fps-gun');
            if(gun) {
                gun.style.transform = 'translateY(30px) rotate(-10deg)';
                setTimeout(() => {
                    gun.style.transform = 'translateY(0) rotate(0deg)';
                }, 100);
            }

            // Raycast
            this.raycaster.setFromCamera( new THREE.Vector2(0,0), this.camera ); // center of screen

            const intersects = this.raycaster.intersectObjects( this.targets );

            if ( intersects.length > 0 ) {
                const hitObj = intersects[ 0 ].object;
                this.score++;
                this.updateHUD();
                
                // Remove hit target
                this.scene.remove(hitObj);
                this.targets = this.targets.filter(t => t !== hitObj);
                
                // Spawn a new one
                this.spawnTarget();
            }
        },

        spawnTarget() {
            const geometry = new THREE.BoxGeometry( 10, 10, 10 );
            const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
            const cube = new THREE.Mesh( geometry, material );

            cube.position.x = ( Math.random() - 0.5 ) * 200;
            cube.position.y = Math.random() * 50 + 10;
            cube.position.z = ( Math.random() - 0.5 ) * 200;
            
            // Keep targets away from start position (0,0,0)
            if (cube.position.length() < 30) {
                cube.position.z -= 40;
            }

            this.scene.add( cube );
            this.targets.push( cube );
        },

        updateHUD() {
            const s = document.getElementById('fps-score');
            const t = document.getElementById('fps-time');
            if (s) s.innerText = `🎯 처치: ${this.score}`;
            if (t) {
                t.innerText = `⏱ 시간: ${this.timeLeft}초`;
                t.style.color = this.timeLeft <= 5 ? '#ff4757' : '#fff';
            }
        },

        animate() {
            if (!this.isPlaying) return;
            this.animationId = requestAnimationFrame( this.animate );

            const time = performance.now();

            if ( this.controls.isLocked === true ) {
                const delta = ( time - this.prevTime ) / 1000;

                this.velocity.x -= this.velocity.x * 10.0 * delta;
                this.velocity.z -= this.velocity.z * 10.0 * delta;

                this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
                this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
                this.direction.normalize(); // consistent movements

                const moveSpeed = 800.0;
                if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * moveSpeed * delta;
                if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * moveSpeed * delta;

                this.controls.moveRight( - this.velocity.x * delta );
                this.controls.moveForward( - this.velocity.z * delta );
                
                // Keep camera above ground
                if (this.controls.getObject().position.y < 10) {
                    this.controls.getObject().position.y = 10;
                }
            }

            // Slowly rotate targets
            for (let t of this.targets) {
                t.rotation.x += 0.01;
                t.rotation.y += 0.02;
            }

            this.prevTime = time;
            this.renderer.render( this.scene, this.camera );
        },

        onWindowResize() {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
        },

        gameOver() {
            this.isPlaying = false;
            this.controls.unlock();
            cancelAnimationFrame(this.animationId);
            clearInterval(this.timerInterval);
            
            const startUi = document.getElementById('fps-start-ui');
            if(startUi) startUi.remove();

            const uiDiv = document.createElement('div');
            uiDiv.id = 'fps-over';
            uiDiv.style.position='absolute';
            uiDiv.style.top='0';
            uiDiv.style.left='0';
            uiDiv.style.width='100%';
            uiDiv.style.height='100%';
            uiDiv.style.background='rgba(0,0,0,0.85)';
            uiDiv.style.display='flex';
            uiDiv.style.flexDirection='column';
            uiDiv.style.alignItems='center';
            uiDiv.style.justifyContent='center';
            uiDiv.style.zIndex='15';

            const title = document.createElement('h2');
            title.innerText = '미션 종료!';
            title.style.color = '#e94560';
            title.style.fontSize = '3rem';
            title.style.marginBottom = '20px';

            const scoreText = document.createElement('p');
            scoreText.innerText = `최종 처치: ${this.score}개의 타겟`;
            scoreText.style.color = '#fff';
            scoreText.style.marginBottom = '30px';
            scoreText.style.fontSize = '1.5rem';

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '나가기';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '1px solid #fff';
            closeBtn.style.borderRadius = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();

            uiDiv.appendChild(title);
            uiDiv.appendChild(scoreText);
            uiDiv.appendChild(closeBtn);
            this.container.appendChild(uiDiv);
        },

        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            clearInterval(this.timerInterval);
            
            document.removeEventListener( 'keydown', this.onKeyDown );
            document.removeEventListener( 'keyup', this.onKeyUp );
            window.removeEventListener( 'resize', this.onWindowResize );
            document.removeEventListener('mousedown', this.onMouseClick);
            
            if(this.controls) this.controls.unlock();
            if(this.overlay) this.overlay.remove();
        }
    },

    tps: {
        overlay: null,
        container: null,
        animationId: null,
        isPlaying: false,
        score: 0,
        timeLeft: 30,
        timerInterval: null,

        // Three.js
        scene: null,
        camera: null,
        renderer: null,
        raycaster: null,
        player: null,       // Group (block character)
        targets: [],

        // Camera orbit
        cameraAngleH: 0,      // horizontal angle around player
        cameraAngleV: 0.3,    // vertical angle
        cameraDist: 40,
        isPointerDown: false,
        lastPointerX: 0,
        lastPointerY: 0,

        // Movement
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        isShooting: false,
        shootCooldown: 0,

        // Bullet trail
        bullets: [],

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;

            this.container.style.width = '100vw';
            this.container.style.height = '100vh';
            this.container.style.maxWidth = '100vw';
            this.container.style.maxHeight = '100vh';
            this.container.style.borderRadius = '0';

            if (!window.THREE) {
                alert("Three.js 로딩 오류. 새로고침 후 다시 시도해주세요.");
                this.close(); return;
            }

            // ── Scene ──────────────────────────────────────────────
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x87ceeb);
            this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

            // Lights
            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambient);
            const dir = new THREE.DirectionalLight(0xffffff, 0.8);
            dir.position.set(50, 100, 50);
            this.scene.add(dir);

            // Floor (grass)
            const floorGeo = new THREE.PlaneGeometry(400, 400, 20, 20);
            floorGeo.rotateX(-Math.PI / 2);
            const floorMat = new THREE.MeshLambertMaterial({ color: 0x4a7c4e });
            this.scene.add(new THREE.Mesh(floorGeo, floorMat));

            // Floor grid lines
            const gridHelper = new THREE.GridHelper(400, 40, 0x2a5c2e, 0x2a5c2e);
            this.scene.add(gridHelper);

            // Some cover boxes for environment feel
            const wallMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const wallPositions = [
                [30, 0, -20], [-25, 0, 30], [50, 0, 50], [-50, 0, -40],
                [0, 0, 60], [-60, 0, 10], [70, 0, -50], [-10, 0, -70]
            ];
            wallPositions.forEach(([x, y, z]) => {
                const w = 8 + Math.random() * 8;
                const h = 8 + Math.random() * 10;
                const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), wallMat);
                box.position.set(x, h / 2, z);
                this.scene.add(box);
            });

            // ── Player (block character) ───────────────────────────
            this.player = this._buildBlockMan();
            this.player.position.set(0, 0, 0);
            this.scene.add(this.player);

            // ── Camera ────────────────────────────────────────────
            this.camera = new THREE.PerspectiveCamera(
                70, this.container.clientWidth / this.container.clientHeight, 0.1, 1000
            );

            // ── Renderer ──────────────────────────────────────────
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.shadowMap.enabled = true;
            this.container.appendChild(this.renderer.domElement);

            this.raycaster = new THREE.Raycaster();

            // ── Spawn enemies ──────────────────────────────────────
            for (let i = 0; i < 10; i++) this._spawnEnemy();

            // ── HUD ───────────────────────────────────────────────
            this._buildHUD();

            // ── Start Screen ──────────────────────────────────────
            const uiDiv = this._buildStartUI();
            this.container.appendChild(uiDiv);

            // ── Events ────────────────────────────────────────────
            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp   = this._onKeyUp.bind(this);
            this._onPD      = this._onPD.bind(this);
            this._onPM      = this._onPM.bind(this);
            this._onPU      = this._onPU.bind(this);
            this._onResize  = this._onResize.bind(this);
            this._onClick   = this._onClick.bind(this);

            document.addEventListener('keydown', this._onKeyDown);
            document.addEventListener('keyup',   this._onKeyUp);
            this.renderer.domElement.addEventListener('mousedown', this._onPD);
            this.renderer.domElement.addEventListener('mousemove', this._onPM);
            window.addEventListener('mouseup',  this._onPU);
            window.addEventListener('resize',   this._onResize);
            this.renderer.domElement.addEventListener('click', this._onClick);

            this._animate = this._animate.bind(this);
        },

        // ── Block Man Builder ─────────────────────────────────────
        _buildBlockMan() {
            const group = new THREE.Group();

            const skin  = new THREE.MeshLambertMaterial({ color: 0xffe0bd });
            const shirt = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
            const pants = new THREE.MeshLambertMaterial({ color: 0x37474f });
            const shoe  = new THREE.MeshLambertMaterial({ color: 0x212121 });
            const hair  = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
            const gunM  = new THREE.MeshLambertMaterial({ color: 0x333333 });

            const add = (geo, mat, x, y, z, parent) => {
                const m = new THREE.Mesh(geo, mat);
                m.position.set(x, y, z);
                (parent || group).add(m);
                return m;
            };

            // Head
            add(new THREE.BoxGeometry(4, 4, 4), skin,  0, 15.5, 0);
            add(new THREE.BoxGeometry(4.1, 1.2, 4.2), hair, 0, 17.4, 0); // hair top
            add(new THREE.BoxGeometry(4.2, 1, 0.3), hair, 0, 15.8, -2.1); // hair back

            // Body
            add(new THREE.BoxGeometry(5, 6, 3), shirt, 0, 10.5, 0);

            // Arms
            const leftArm  = add(new THREE.BoxGeometry(1.8, 5, 1.8), shirt, -3.4, 10.5, 0);
            const rightArm = add(new THREE.BoxGeometry(1.8, 5, 1.8), shirt,  3.4, 10.5, 0);

            // Gun in right hand
            add(new THREE.BoxGeometry(0.8, 0.8, 3.5), gunM, 0, -2.5, 1.8, rightArm);
            add(new THREE.BoxGeometry(0.6, 1.8, 0.6), gunM, 0, -1.8, 0.5, rightArm); // grip

            // Legs
            const leftLeg  = add(new THREE.BoxGeometry(2, 5.5, 2), pants, -1.2, 4.5, 0);
            const rightLeg = add(new THREE.BoxGeometry(2, 5.5, 2), pants,  1.2, 4.5, 0);

            // Shoes
            add(new THREE.BoxGeometry(2.2, 1, 3),   shoe, -1.2, 1.2, 0.4);
            add(new THREE.BoxGeometry(2.2, 1, 3),   shoe,  1.2, 1.2, 0.4);

            // Store limb refs for walk animation
            group.userData.leftArm  = leftArm;
            group.userData.rightArm = rightArm;
            group.userData.leftLeg  = leftLeg;
            group.userData.rightLeg = rightLeg;
            group.userData.walkTime = 0;

            return group;
        },

        // ── Enemy Builder ─────────────────────────────────────────
        _spawnEnemy() {
            const group = new THREE.Group();
            const mat = new THREE.MeshLambertMaterial({ color: 0xc62828 });
            const dark = new THREE.MeshLambertMaterial({ color: 0x7f0000 });

            const add = (geo, m, x, y, z) => {
                const mesh = new THREE.Mesh(geo, m);
                mesh.position.set(x, y, z);
                group.add(mesh);
            };

            add(new THREE.BoxGeometry(4, 4, 4), mat, 0, 15.5, 0);   // head
            add(new THREE.BoxGeometry(5, 6, 3), mat, 0, 10.5, 0);   // body
            add(new THREE.BoxGeometry(1.8, 5, 1.8), dark, -3.4, 10.5, 0); // left arm
            add(new THREE.BoxGeometry(1.8, 5, 1.8), dark,  3.4, 10.5, 0); // right arm
            add(new THREE.BoxGeometry(2, 5.5, 2), dark, -1.2, 4.5, 0);    // left leg
            add(new THREE.BoxGeometry(2, 5.5, 2), dark,  1.2, 4.5, 0);    // right leg

            // Place enemy randomly but away from player
            let ex, ez;
            do {
                ex = (Math.random() - 0.5) * 300;
                ez = (Math.random() - 0.5) * 300;
            } while (Math.hypot(ex, ez) < 40);

            group.position.set(ex, 0, ez);
            group.userData.isEnemy = true;
            group.userData.hp = 1;
            group.userData.walkTime = Math.random() * Math.PI * 2;

            this.scene.add(group);
            this.targets.push(group);
        },

        // ── HUD ───────────────────────────────────────────────────
        _buildHUD() {
            // Crosshair
            const ch = document.createElement('div');
            ch.id = 'tps-crosshair';
            ch.innerHTML = '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:lime;font-size:28px;font-weight:bold;pointer-events:none;z-index:10;">⊕</span>';
            ch.style.position = 'absolute';
            ch.style.top = '0'; ch.style.left = '0';
            ch.style.width = '100%'; ch.style.height = '100%';
            ch.style.pointerEvents = 'none';
            ch.style.zIndex = '10';
            this.container.appendChild(ch);

            // Stats bar
            const hud = document.createElement('div');
            hud.style.cssText = 'position:absolute;top:20px;left:20px;right:20px;display:flex;justify-content:space-between;color:#fff;font-size:22px;font-weight:bold;pointer-events:none;z-index:10;text-shadow:0 2px 4px #000;';
            hud.innerHTML = '<span id="tps-score">🎯 처치: 0</span><span id="tps-time">⏱ 시간: 30초</span>';
            this.container.appendChild(hud);

            // Controls guide
            const guide = document.createElement('div');
            guide.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:13px;text-align:center;pointer-events:none;z-index:10;text-shadow:0 1px 3px #000;background:rgba(0,0,0,0.4);padding:8px 18px;border-radius:12px;';
            guide.innerHTML = '🕹️ <b>WASD</b> 이동 &nbsp;|&nbsp; 🖱️ 마우스 드래그로 카메라 회전 &nbsp;|&nbsp; 🖱️ 클릭으로 사격';
            this.container.appendChild(guide);
        },

        _buildStartUI() {
            const ui = document.createElement('div');
            ui.id = 'tps-start-ui';
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);';

            ui.innerHTML = `
                <h2 style="color:#fff;font-size:3rem;margin-bottom:15px;">🎮 3인칭 슈팅 (TPS)</h2>
                <p style="color:#ccc;text-align:center;line-height:1.7;margin-bottom:30px;">
                    WASD: 이동 &nbsp;|&nbsp; 마우스 드래그: 카메라 회전<br>
                    클릭: 사격 (화면 중앙 기준 레이캐스트)<br>
                    30초 안에 최대한 많은 적을 처치하세요!
                </p>
            `;

            const startBtn = document.createElement('button');
            startBtn.innerText = '게임 시작';
            startBtn.className = 'play-game-btn';
            startBtn.style.cssText = 'padding:15px 35px;font-size:1.2rem;cursor:pointer;margin-bottom:12px;';
            startBtn.onclick = () => { ui.remove(); this._startGame(); };

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '닫기';
            closeBtn.style.cssText = 'padding:10px 22px;background:transparent;color:#fff;border:1px solid #fff;border-radius:20px;cursor:pointer;';
            closeBtn.onclick = () => this.close();

            ui.appendChild(startBtn);
            ui.appendChild(closeBtn);
            return ui;
        },

        // ── Game Flow ─────────────────────────────────────────────
        _startGame() {
            this.isPlaying = true;
            this.score = 0;
            this.timeLeft = 30;
            this._updateHUD();

            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this._updateHUD();
                if (this.timeLeft <= 0) this._gameOver();
            }, 1000);

            if (this.animationId) cancelAnimationFrame(this.animationId);
            this._animate();
        },

        _updateHUD() {
            const s = document.getElementById('tps-score');
            const t = document.getElementById('tps-time');
            if (s) s.innerText = `🎯 처치: ${this.score}`;
            if (t) {
                t.innerText = `⏱ 시간: ${this.timeLeft}초`;
                t.style.color = this.timeLeft <= 5 ? '#ff4757' : '#fff';
            }
        },

        // ── Input ─────────────────────────────────────────────────
        _onKeyDown(e) {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp':    this.moveForward  = true; break;
                case 'KeyS': case 'ArrowDown':  this.moveBackward = true; break;
                case 'KeyA': case 'ArrowLeft':  this.moveLeft     = true; break;
                case 'KeyD': case 'ArrowRight': this.moveRight    = true; break;
            }
        },
        _onKeyUp(e) {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp':    this.moveForward  = false; break;
                case 'KeyS': case 'ArrowDown':  this.moveBackward = false; break;
                case 'KeyA': case 'ArrowLeft':  this.moveLeft     = false; break;
                case 'KeyD': case 'ArrowRight': this.moveRight    = false; break;
            }
        },
        _onPD(e) { this.isPointerDown = true; this.lastPointerX = e.clientX; this.lastPointerY = e.clientY; },
        _onPU()  { this.isPointerDown = false; },
        _onPM(e) {
            if (!this.isPointerDown) return;
            const dx = e.clientX - this.lastPointerX;
            const dy = e.clientY - this.lastPointerY;
            this.cameraAngleH -= dx * 0.005;
            this.cameraAngleV  = Math.max(0.1, Math.min(1.0, this.cameraAngleV + dy * 0.004));
            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
        },
        _onClick() {
            if (!this.isPlaying) return;
            this._shoot();
        },
        _onResize() {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        },

        // ── Shooting ──────────────────────────────────────────────
        _shoot() {
            // Shoot from center screen (NDC 0,0) using camera direction
            this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

            // Use recursive intersect on all enemy groups (easier to hit)
            const hits = this.raycaster.intersectObjects(this.targets, true);
            if (hits.length > 0) {
                // Find parent group
                let obj = hits[0].object;
                while (obj.parent && !obj.parent.userData.isEnemy) obj = obj.parent;
                const group = obj.parent;
                if (group && group.userData.isEnemy) {
                    // Flash red then remove
                    group.traverse(c => { if (c.isMesh) c.material = new THREE.MeshLambertMaterial({ color: 0xff6600 }); });
                    setTimeout(() => {
                        this.scene.remove(group);
                        this.targets = this.targets.filter(t => t !== group);
                        this._spawnEnemy(); // replenish
                    }, 150);
                    this.score++;
                    this._updateHUD();
                }
            }

            // Muzzle flash effect (brief bright pulse)
            const flash = document.createElement('div');
            flash.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,200,50,0.15);pointer-events:none;z-index:9;';
            this.container.appendChild(flash);
            setTimeout(() => flash.remove(), 60);
        },

        // ── Animation Loop ────────────────────────────────────────
        _animate() {
            if (!this.isPlaying) return;
            this.animationId = requestAnimationFrame(this._animate);

            const speed = 1.30; // faster movement

            // Movement direction based on camera horizontal angle
            if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
                const fwd = new THREE.Vector3(
                    -Math.sin(this.cameraAngleH),
                    0,
                    -Math.cos(this.cameraAngleH)
                );
                const right = new THREE.Vector3(
                    Math.cos(this.cameraAngleH),
                    0,
                    -Math.sin(this.cameraAngleH)
                );

                let moveDir = new THREE.Vector3();
                if (this.moveForward)  moveDir.add(fwd);
                if (this.moveBackward) moveDir.sub(fwd);
                if (this.moveLeft)     moveDir.sub(right);
                if (this.moveRight)    moveDir.add(right);

                moveDir.normalize().multiplyScalar(speed);
                this.player.position.add(moveDir);

                // Clamp to arena
                this.player.position.x = Math.max(-190, Math.min(190, this.player.position.x));
                this.player.position.z = Math.max(-190, Math.min(190, this.player.position.z));

                // Rotate player to face movement direction
                if (moveDir.length() > 0.001) {
                    const angle = Math.atan2(moveDir.x, moveDir.z);
                    this.player.rotation.y = angle;
                }

                // Walk animation
                const ud = this.player.userData;
                ud.walkTime += 0.18;
                const sw = Math.sin(ud.walkTime) * 0.5;
                ud.leftArm.rotation.x  =  sw;
                ud.rightArm.rotation.x = -sw;
                ud.leftLeg.rotation.x  = -sw;
                ud.rightLeg.rotation.x =  sw;
            } else {
                // Idle – reset limbs
                const ud = this.player.userData;
                ud.leftArm.rotation.x  = 0;
                ud.rightArm.rotation.x = 0;
                ud.leftLeg.rotation.x  = 0;
                ud.rightLeg.rotation.x = 0;
            }

            // Enemy AI: walk toward player (slower & stop further away → easier to shoot)
            this.targets.forEach(g => {
                const toPlayer = new THREE.Vector3().subVectors(this.player.position, g.position);
                toPlayer.y = 0;
                const dist = toPlayer.length();
                if (dist > 20) {
                    toPlayer.normalize().multiplyScalar(0.04); // slower enemy
                    g.position.add(toPlayer);
                    g.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
                }
                // Gentle bob animation
                g.userData.walkTime += 0.06;
                g.position.y = Math.sin(g.userData.walkTime) * 0.3;
            });

            // Third-person camera: orbit around player
            const px = this.player.position.x;
            const py = this.player.position.y + 12; // target height
            const pz = this.player.position.z;

            const camX = px + this.cameraDist * Math.sin(this.cameraAngleH) * Math.cos(this.cameraAngleV);
            const camY = py + this.cameraDist * Math.sin(this.cameraAngleV);
            const camZ = pz + this.cameraDist * Math.cos(this.cameraAngleH) * Math.cos(this.cameraAngleV);

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(px, py, pz);

            this.renderer.render(this.scene, this.camera);
        },

        // ── Game Over ─────────────────────────────────────────────
        _gameOver() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            clearInterval(this.timerInterval);

            const ui = document.createElement('div');
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';

            ui.innerHTML = `
                <h2 style="color:#e94560;font-size:3.5rem;margin-bottom:15px;">미션 종료!</h2>
                <p style="color:#fff;font-size:1.8rem;margin-bottom:30px;">최종 처치: ${this.score}명의 적</p>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '나가기';
            closeBtn.style.cssText = 'padding:12px 26px;background:transparent;color:#fff;border:1px solid #fff;border-radius:22px;cursor:pointer;font-size:1rem;';
            closeBtn.onclick = () => this.close();
            ui.appendChild(closeBtn);

            this.container.appendChild(ui);
        },

        // ── Cleanup ───────────────────────────────────────────────
        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            clearInterval(this.timerInterval);

            document.removeEventListener('keydown', this._onKeyDown);
            document.removeEventListener('keyup',   this._onKeyUp);
            window.removeEventListener('mouseup',   this._onPU);
            window.removeEventListener('resize',    this._onResize);

            if (this.renderer) {
                this.renderer.domElement.removeEventListener('mousedown', this._onPD);
                this.renderer.domElement.removeEventListener('mousemove', this._onPM);
                this.renderer.domElement.removeEventListener('click',     this._onClick);
                this.renderer.dispose();
            }
            if (this.overlay) this.overlay.remove();
        }
    },

    fighting: {
        overlay: null,
        canvas: null,
        ctx: null,
        animationId: null,
        isPlaying: false,
        timeLeft: 60,
        timerInterval: null,
        keys: {},

        player: null,
        enemy: null,

        // Settings
        gravity: 0.7,
        floorY: 0,

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            
            gameContainer.style.background = 'url("https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1000") center/cover';
            gameContainer.style.position = 'relative';

            this.canvas = document.createElement('canvas');
            this.canvas.width = 800;
            this.canvas.height = 450;
            this.canvas.style.backgroundColor = 'rgba(0,0,0,0.5)';
            this.canvas.style.borderRadius = '10px';
            this.canvas.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
            gameContainer.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.floorY = this.canvas.height - 50;

            this._buildHUD(gameContainer);
            this._buildStartUI(gameContainer);

            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);
            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup', this._onKeyUp);
            
            this._animate = this._animate.bind(this);
        },

        _buildHUD(container) {
            const hud = document.createElement('div');
            hud.style.cssText = 'position:absolute;top:20px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;z-index:10;';
            
            const hpStyle = 'width:300px;height:30px;background:#333;border:3px solid #fff;border-radius:15px;overflow:hidden;position:relative;';
            const barStyle = 'height:100%;transition:width 0.1s;';

            hud.innerHTML = `
                <div style="text-align:left;">
                    <div style="color:#fff;font-size:20px;font-weight:bold;margin-bottom:5px;text-shadow:1px 1px 2px #000;">PLAYER (P1)</div>
                    <div style="${hpStyle}"><div id="fight-p1-hp" style="${barStyle}background:#00d2d3;width:100%;"></div></div>
                </div>
                <div id="fight-timer" style="color:#feca57;font-size:40px;font-weight:900;text-shadow:2px 2px 4px #000;margin:0 20px;">60</div>
                <div style="text-align:right;">
                    <div style="color:#fff;font-size:20px;font-weight:bold;margin-bottom:5px;text-shadow:1px 1px 2px #000;">CPU</div>
                    <div style="${hpStyle}"><div id="fight-p2-hp" style="${barStyle}background:#ff6b6b;width:100%;float:right;"></div></div>
                </div>
            `;

            const guide = document.createElement('div');
            guide.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:14px;background:rgba(0,0,0,0.6);padding:10px 20px;border-radius:20px;pointer-events:none;text-align:center;line-height:1.5;';
            guide.innerHTML = '<b>A/D</b>: 이동 &nbsp;|&nbsp; <b>W</b>: 점프<br><b>J</b>: 펀치 (약공격) &nbsp;|&nbsp; <b>K</b>: 킥 (강공격) &nbsp;|&nbsp; <b>S</b>: 가드';
            
            container.appendChild(hud);
            container.appendChild(guide);
        },

        _buildStartUI(container) {
            const ui = document.createElement('div');
            ui.id = 'fight-start-ui';
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            
            ui.innerHTML = `
                <h1 style="color:#ff4757;font-size:4rem;text-shadow:3px 3px 0 #fff;margin-bottom:20px;font-style:italic;">FIGHT!</h1>
                <p style="color:#ccc;font-size:1.2rem;text-align:center;margin-bottom:30px;line-height:1.6;">
                    상대방의 체력을 먼저 0으로 만드세요!<br>J(펀치)는 빠르고, K(킥)는 느리지만 데미지가 큽니다.
                </p>
                <button id="fight-start-btn" style="padding:15px 40px;font-size:1.5rem;font-weight:bold;background:#ff4757;color:#fff;border:none;border-radius:30px;cursor:pointer;box-shadow:0 5px 15px rgba(255,71,87,0.4);transition:transform 0.1s;">START</button>
            `;
            
            container.appendChild(ui);
            
            document.getElementById('fight-start-btn').onclick = () => {
                ui.remove();
                this._startGame();
            };
        },

        _startGame() {
            this.isPlaying = true;
            this.timeLeft = 60;
            
            // Create Fighter class inline
            class Fighter {
                constructor(x, y, color, isPlayer) {
                    this.x = x;
                    this.y = y;
                    this.width = 50;
                    this.height = 120;
                    this.color = color;
                    this.isPlayer = isPlayer;
                    
                    this.hp = 100;
                    this.speed = 9;
                    this.velY = 0;
                    
                    this.isJumping = false;
                    this.isAttacking = false;
                    this.isBlocking = false;
                    this.attackType = null; // 'punch' or 'kick'
                    this.attackTimer = 0;
                    this.attackDuration = 0;
                    this.attackCooldown = 0;
                    this.facingRight = isPlayer;
                    
                    this.hitbox = { x: 0, y: 0, w: 0, h: 0, active: false };
                }

                draw(ctx) {
                    ctx.save();
                    
                    // Body
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    
                    // Head
                    ctx.fillStyle = '#f1c40f'; // yellow head
                    ctx.beginPath();
                    ctx.arc(this.x + this.width/2, this.y - 15, 20, 0, Math.PI * 2);
                    ctx.fill();

                    // Block shield
                    if (this.isBlocking) {
                        ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
                        ctx.lineWidth = 5;
                        ctx.beginPath();
                        if (this.facingRight) {
                            ctx.moveTo(this.x + this.width + 10, this.y - 20);
                            ctx.lineTo(this.x + this.width + 10, this.y + this.height);
                        } else {
                            ctx.moveTo(this.x - 10, this.y - 20);
                            ctx.lineTo(this.x - 10, this.y + this.height);
                        }
                        ctx.stroke();
                    }

                    // Hitbox (Attack)
                    if (this.hitbox.active) {
                        ctx.fillStyle = this.attackType === 'kick' ? 'rgba(231, 76, 60, 0.7)' : 'rgba(241, 196, 15, 0.7)';
                        ctx.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
                    }

                    ctx.restore();
                }

                attack(type) {
                    if (this.isAttacking || this.attackCooldown > 0 || this.isBlocking) return;
                    
                    this.isAttacking = true;
                    this.attackType = type;
                    this.attackTimer = 0;
                    
                    if (type === 'punch') {
                        this.attackDuration = 15; // fast
                        this.attackCooldown = 10;
                        this.hitbox.w = 60;
                        this.hitbox.h = 20;
                    } else if (type === 'kick') {
                        this.attackDuration = 25; // slow
                        this.attackCooldown = 20;
                        this.hitbox.w = 80;
                        this.hitbox.h = 30;
                    }
                }

                update(gravity, floorY) {
                    // Physics
                    this.velY += gravity;
                    this.y += this.velY;
                    
                    if (this.y + this.height >= floorY) {
                        this.y = floorY - this.height;
                        this.velY = 0;
                        this.isJumping = false;
                    }

                    // Cooldowns
                    if (this.attackCooldown > 0 && !this.isAttacking) {
                        this.attackCooldown--;
                    }

                    // Attack logic
                    if (this.isAttacking) {
                        this.attackTimer++;
                        
                        // Activate hitbox in the middle of the animation
                        if (this.attackTimer > this.attackDuration * 0.2 && this.attackTimer < this.attackDuration * 0.8) {
                            this.hitbox.active = true;
                            if (this.attackType === 'punch') {
                                this.hitbox.x = this.facingRight ? this.x + this.width : this.x - this.hitbox.w;
                                this.hitbox.y = this.y + 20;
                            } else {
                                this.hitbox.x = this.facingRight ? this.x + this.width : this.x - this.hitbox.w;
                                this.hitbox.y = this.y + 60;
                            }
                        } else {
                            this.hitbox.active = false;
                        }

                        if (this.attackTimer >= this.attackDuration) {
                            this.isAttacking = false;
                            this.hitbox.active = false;
                        }
                    } else {
                        this.hitbox.active = false;
                    }

                    // Screen bounds
                    this.x = Math.max(0, Math.min(800 - this.width, this.x));
                }
            }

            this.player = new Fighter(150, 0, '#3498db', true);
            this.enemy = new Fighter(600, 0, '#e74c3c', false);

            this._updateHUD();

            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                document.getElementById('fight-timer').innerText = this.timeLeft;
                if (this.timeLeft <= 0) this._endGame(this.player.hp > this.enemy.hp ? 'player' : (this.player.hp < this.enemy.hp ? 'enemy' : 'draw'));
            }, 1000);

            if (this.animationId) cancelAnimationFrame(this.animationId);
            this._animate();
        },

        _onKeyDown(e) { this.keys[e.code] = true; },
        _onKeyUp(e) { this.keys[e.code] = false; },

        _animate() {
            if (!this.isPlaying) return;
            this.animationId = requestAnimationFrame(this._animate);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw floor line
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.floorY);
            this.ctx.lineTo(this.canvas.width, this.floorY);
            this.ctx.stroke();

            // Handle Input (Player)
            this.player.isBlocking = this.keys['KeyS'];
            
            if (!this.player.isAttacking && !this.player.isBlocking) {
                if (this.keys['KeyA']) this.player.x -= this.player.speed;
                if (this.keys['KeyD']) this.player.x += this.player.speed;
                if (this.keys['KeyW'] && !this.player.isJumping) {
                    this.player.velY = -20;
                    this.player.isJumping = true;
                }
            }
            if (this.keys['KeyJ']) this.player.attack('punch');
            if (this.keys['KeyK']) this.player.attack('kick');

            // Handle AI (Enemy)
            this._updateAI();

            // Update facing direction
            if (this.player.x < this.enemy.x) {
                this.player.facingRight = true;
                this.enemy.facingRight = false;
            } else {
                this.player.facingRight = false;
                this.enemy.facingRight = true;
            }

            // Update physics & attacks
            this.player.update(this.gravity, this.floorY);
            this.enemy.update(this.gravity, this.floorY);

            // Collision Detection (Hitboxes)
            this._checkHit(this.player, this.enemy);
            this._checkHit(this.enemy, this.player);

            // Draw
            this.player.draw(this.ctx);
            this.enemy.draw(this.ctx);
        },

        _updateAI() {
            const dist = this.enemy.x - this.player.x;
            const absDist = Math.abs(dist);

            this.enemy.isBlocking = false;

            if (this.enemy.isAttacking) return;

            // Simple state machine
            const r = Math.random();

            if (absDist > 100) {
                // Move towards player
                if (dist > 0) this.enemy.x -= this.enemy.speed * 0.8;
                else this.enemy.x += this.enemy.speed * 0.8;
            } else {
                // Close range: attack or block
                if (this.player.isAttacking && r < 0.3) {
                    this.enemy.isBlocking = true;
                } else if (r < 0.05) {
                    this.enemy.attack('punch');
                } else if (r < 0.08) {
                    this.enemy.attack('kick');
                } else {
                    // Slight retreat to maintain distance
                    if (dist > 0) this.enemy.x += this.enemy.speed * 0.4;
                    else this.enemy.x -= this.enemy.speed * 0.4;
                }
            }
        },

        _checkHit(attacker, defender) {
            if (!attacker.hitbox.active || defender.hp <= 0) return;

            // Simple AABB collision
            const r1 = attacker.hitbox;
            const r2 = { x: defender.x, y: defender.y, w: defender.width, h: defender.height };

            if (r1.x < r2.x + r2.w &&
                r1.x + r1.w > r2.x &&
                r1.y < r2.y + r2.h &&
                r1.y + r1.h > r2.y) {
                
                // Hit registered!
                attacker.hitbox.active = false; // Prevent multiple hits from one attack

                // Calculate damage
                let damage = attacker.attackType === 'punch' ? 5 : 12;
                
                if (defender.isBlocking) {
                    damage = Math.floor(damage / 4); // Block reduces damage significantly
                    
                    // Visual block effect
                    this.ctx.fillStyle = 'blue';
                    this.ctx.font = '20px Arial';
                    this.ctx.fillText('BLOCK', defender.x, defender.y - 40);
                } else {
                    // Knockback
                    defender.x += attacker.facingRight ? 30 : -30;
                    defender.y -= 10;
                    defender.isAttacking = false; // Interrupt attack
                    
                    // Visual hit effect
                    this.ctx.fillStyle = 'red';
                    this.ctx.font = '30px Arial';
                    this.ctx.fillText('HIT!', defender.x, defender.y - 40);
                }

                defender.hp = Math.max(0, defender.hp - damage);
                this._updateHUD();

                if (defender.hp <= 0) {
                    this._endGame(attacker.isPlayer ? 'player' : 'enemy');
                }
            }
        },

        _updateHUD() {
            const p1 = document.getElementById('fight-p1-hp');
            const p2 = document.getElementById('fight-p2-hp');
            if (p1 && this.player) p1.style.width = `${this.player.hp}%`;
            if (p2 && this.enemy) p2.style.width = `${this.enemy.hp}%`;
        },

        _endGame(winner) {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            clearInterval(this.timerInterval);

            const ui = document.createElement('div');
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            
            let resultText = winner === 'player' ? 'YOU WIN!' : (winner === 'enemy' ? 'YOU LOSE...' : 'DRAW');
            let resultColor = winner === 'player' ? '#00d2d3' : (winner === 'enemy' ? '#ff6b6b' : '#feca57');

            ui.innerHTML = `
                <h2 style="color:${resultColor};font-size:5rem;margin-bottom:15px;text-shadow:4px 4px 0 #000;">K.O.</h2>
                <h3 style="color:#fff;font-size:2.5rem;margin-bottom:40px;">${resultText}</h3>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '나가기';
            closeBtn.style.cssText = 'padding:12px 30px;background:transparent;color:#fff;border:2px solid #fff;border-radius:25px;cursor:pointer;font-size:1.2rem;transition:all 0.2s;';
            closeBtn.onmouseover = () => { closeBtn.style.background = '#fff'; closeBtn.style.color = '#000'; };
            closeBtn.onmouseout = () => { closeBtn.style.background = 'transparent'; closeBtn.style.color = '#fff'; };
            closeBtn.onclick = () => { ui.remove(); this.close(); };
            
            ui.appendChild(closeBtn);
            
            // Append to gameContainer (canvas.parentElement) instead of HUD to allow pointer events
            this.canvas.parentElement.appendChild(ui);
        },

        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            clearInterval(this.timerInterval);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup', this._onKeyUp);
            if (this.overlay) this.overlay.remove();
        }
    },

    horror: {
        overlay: null,
        container: null,
        animationId: null,
        isPlaying: false,

        // Three.js
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        raycaster: null,
        
        // Lighting
        flashlight: null,
        flickerTimer: 0,

        // Entities
        notes: [],
        collectedNotes: 0,
        totalNotes: 5,
        enemy: null,

        // Movement
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        velocity: null,
        direction: null,
        prevTime: 0,
        
        // Maze collision
        walls: [],

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;

            this.container.style.width = '100vw';
            this.container.style.height = '100vh';
            this.container.style.maxWidth = '100vw';
            this.container.style.maxHeight = '100vh';
            this.container.style.borderRadius = '0';
            this.container.style.backgroundColor = '#000';

            if (!window.THREE || !THREE.PointerLockControls) {
                alert("Three.js 로딩 오류. 새로고침 후 다시 시도해주세요.");
                this.close(); return;
            }

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x050505);
            this.scene.fog = new THREE.FogExp2(0x000000, 0.025); // Thinner fog so we can see a bit

            this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
            this.camera.position.y = 5;

            // Flashlight (PointLight is more reliable when attached to camera)
            this.flashlight = new THREE.PointLight(0xffeedd, 2.0, 50);
            this.camera.add(this.flashlight);
            this.scene.add(this.camera);

            // Ambient light
            this.scene.add(new THREE.AmbientLight(0x222222));

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.container.appendChild(this.renderer.domElement);

            this.controls = new THREE.PointerLockControls(this.camera, document.body);
            this.raycaster = new THREE.Raycaster();

            this.velocity = new THREE.Vector3();
            this.direction = new THREE.Vector3();

            this._buildMaze();
            this._spawnEnemy();
            this._buildHUD();

            const uiDiv = this._buildStartUI();
            this.container.appendChild(uiDiv);

            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);
            this._onClick = this._onClick.bind(this);
            this._onResize = this._onResize.bind(this);

            document.addEventListener('keydown', this._onKeyDown);
            document.addEventListener('keyup', this._onKeyUp);
            document.addEventListener('mousedown', this._onClick);
            window.addEventListener('resize', this._onResize);

            this._animate = this._animate.bind(this);
        },

        _buildMaze() {
            const floorGeo = new THREE.PlaneGeometry(200, 200);
            const floorMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            this.scene.add(floor);

            // Simple procedurally generated maze (grid based)
            const wallGeo = new THREE.BoxGeometry(10, 15, 10);
            const textureLoader = new THREE.TextureLoader();
            const wallTex = textureLoader.load('images/horror_wall.png');
            wallTex.wrapS = THREE.RepeatWrapping;
            wallTex.wrapT = THREE.RepeatWrapping;
            wallTex.repeat.set(1, 1);
            const wallMat = new THREE.MeshLambertMaterial({ map: wallTex, color: 0x555555 }); // Textured Dark walls
            
            const gridSize = 10;
            const mazeMap = [];
            
            // Random scatter walls
            for (let i = 0; i < 60; i++) {
                const x = (Math.floor(Math.random() * gridSize) - gridSize/2) * 10;
                const z = (Math.floor(Math.random() * gridSize) - gridSize/2) * 10;
                
                // Keep center clear for spawn
                if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
                
                const wall = new THREE.Mesh(wallGeo, wallMat);
                wall.position.set(x, 7.5, z);
                this.scene.add(wall);
                this.walls.push(wall);
                
                mazeMap.push({x, z});
            }

            // Spawn Notes (glowing floating cubes)
            const noteGeo = new THREE.BoxGeometry(1, 1, 1);
            const noteMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Glows in dark
            
            let notesSpawned = 0;
            while(notesSpawned < this.totalNotes) {
                const nx = (Math.floor(Math.random() * gridSize) - gridSize/2) * 10;
                const nz = (Math.floor(Math.random() * gridSize) - gridSize/2) * 10;
                
                // Avoid placing exactly inside a wall
                if (mazeMap.some(w => w.x === nx && w.z === nz)) continue;
                
                const note = new THREE.Mesh(noteGeo, noteMat);
                note.position.set(nx, 4, nz);
                note.userData.isNote = true;
                this.scene.add(note);
                this.notes.push(note);
                notesSpawned++;
            }
        },

        _spawnEnemy() {
            const enemyGroup = new THREE.Group();
            
            // Tall dark figure
            const bodyGeo = new THREE.CylinderGeometry(1.5, 1.5, 12, 8);
            const bodyMat = new THREE.MeshBasicMaterial({ color: 0x050505 }); // very dark, unaffected by light
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 6;
            enemyGroup.add(body);
            
            // Glowing red eyes
            const eyeGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            
            const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
            eye1.position.set(-0.5, 11, 1.4);
            enemyGroup.add(eye1);
            
            const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
            eye2.position.set(0.5, 11, 1.4);
            enemyGroup.add(eye2);

            // Spawn far away
            enemyGroup.position.set(60, 0, 60);
            this.scene.add(enemyGroup);
            this.enemy = enemyGroup;
        },

        _buildHUD() {
            const hud = document.createElement('div');
            hud.id = 'horror-hud';
            hud.style.cssText = 'position:absolute;top:20px;left:20px;color:#fff;font-size:24px;font-family:monospace;pointer-events:none;z-index:10;text-shadow:0 0 5px #fff;';
            hud.innerHTML = `쪽지: <span id="horror-score">0</span> / 5`;
            
            const crosshair = document.createElement('div');
            crosshair.style.cssText = 'position:absolute;top:50%;left:50%;width:4px;height:4px;background:rgba(255,255,255,0.5);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:10;';
            
            this.container.appendChild(hud);
            this.container.appendChild(crosshair);
        },

        _buildStartUI() {
            const ui = document.createElement('div');
            ui.id = 'horror-start-ui';
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            
            ui.innerHTML = `
                <h1 style="color:#aa0000;font-size:4rem;font-family:serif;letter-spacing:5px;margin-bottom:20px;">어둠 속에서</h1>
                <p style="color:#666;font-size:1.2rem;text-align:center;line-height:1.8;margin-bottom:40px;font-family:monospace;">
                    이곳을 빠져나가려면 빛나는 쪽지 5장이 필요하다.<br>
                    절대 뒤를 돌아보지 마라.<br><br>
                    WASD: 이동 | 마우스: 손전등 | 좌클릭: 쪽지 획득
                </p>
            `;

            const btnDiv = document.createElement('div');
            btnDiv.style.display = 'flex';
            btnDiv.style.gap = '20px';

            const startBtn = document.createElement('button');
            startBtn.innerText = '어둠 속으로';
            startBtn.style.cssText = 'padding:15px 30px;background:transparent;color:#aa0000;border:1px solid #aa0000;font-size:1.2rem;cursor:pointer;font-family:serif;';
            startBtn.onmouseover = () => { startBtn.style.background = '#aa0000'; startBtn.style.color = '#000'; };
            startBtn.onmouseout = () => { startBtn.style.background = 'transparent'; startBtn.style.color = '#aa0000'; };
            startBtn.onclick = () => {
                ui.remove();
                this.controls.lock();
            };

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '포기하기';
            closeBtn.style.cssText = 'padding:15px 30px;background:transparent;color:#444;border:1px solid #444;font-size:1.2rem;cursor:pointer;font-family:serif;';
            closeBtn.onclick = () => this.close();

            btnDiv.appendChild(startBtn);
            btnDiv.appendChild(closeBtn);
            ui.appendChild(btnDiv);

            // Pointer lock events
            this.controls.addEventListener('lock', () => {
                this.isPlaying = true;
                this.prevTime = performance.now();
                if (!this.animationId) this._animate();
            });

            this.controls.addEventListener('unlock', () => {
                this.isPlaying = false;
                if(this.collectedNotes < this.totalNotes) {
                    this.container.appendChild(ui); // Show pause/start screen again
                }
            });

            return ui;
        },

        _onKeyDown(e) {
            switch (e.code) {
                case 'ArrowUp': case 'KeyW': this.moveForward = true; break;
                case 'ArrowLeft': case 'KeyA': this.moveLeft = true; break;
                case 'ArrowDown': case 'KeyS': this.moveBackward = true; break;
                case 'ArrowRight': case 'KeyD': this.moveRight = true; break;
                case 'KeyE': this._onClick(); break;
            }
        },

        _onKeyUp(e) {
            switch (e.code) {
                case 'ArrowUp': case 'KeyW': this.moveForward = false; break;
                case 'ArrowLeft': case 'KeyA': this.moveLeft = false; break;
                case 'ArrowDown': case 'KeyS': this.moveBackward = false; break;
                case 'ArrowRight': case 'KeyD': this.moveRight = false; break;
            }
        },

        _onClick() {
            if (!this.isPlaying) return;
            
            // Collect note
            this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
            const intersects = this.raycaster.intersectObjects(this.notes);
            
            if (intersects.length > 0 && intersects[0].distance < 30) {
                const note = intersects[0].object;
                this.scene.remove(note);
                this.notes = this.notes.filter(n => n !== note);
                this.collectedNotes++;
                
                document.getElementById('horror-score').innerText = this.collectedNotes;
                
                if (this.collectedNotes >= this.totalNotes) {
                    this._winGame();
                }
            }
        },

        _onResize() {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        },

        _animate() {
            if (!this.isPlaying) return;
            this.animationId = requestAnimationFrame(this._animate);

            const time = performance.now();
            const delta = (time - this.prevTime) / 1000;
            this.prevTime = time;

            // Player Movement
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            const moveSpeed = 80.0; // Walk speed
            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * moveSpeed * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * moveSpeed * delta;

            // Simple wall collision check (Raycaster)
            const oldPos = this.camera.position.clone();
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            
            // If out of bounds or inside wall, revert (crude collision)
            let collided = false;
            for(let w of this.walls) {
                const box = new THREE.Box3().setFromObject(w);
                // expand box slightly for player radius
                box.min.x -= 2; box.min.z -= 2;
                box.max.x += 2; box.max.z += 2;
                
                if(box.containsPoint(new THREE.Vector3(this.camera.position.x, 7.5, this.camera.position.z))) {
                    collided = true;
                    break;
                }
            }
            if(collided) {
                this.camera.position.copy(oldPos);
            }

            // Note floating animation
            this.notes.forEach(note => {
                note.position.y = 4 + Math.sin(time * 0.003 + note.position.x) * 0.5;
                note.rotation.y += 0.02;
                note.rotation.x += 0.01;
            });

            // Flashlight flicker effect
            if (Math.random() < 0.02) {
                this.flashlight.intensity = Math.random() > 0.5 ? 0 : 1.5;
            } else {
                this.flashlight.intensity = 1.5;
            }

            // Enemy AI
            const dist = this.camera.position.distanceTo(this.enemy.position);
            if (dist < 40) {
                // Enemy moves towards player
                const toPlayer = new THREE.Vector3().subVectors(this.camera.position, this.enemy.position);
                toPlayer.y = 0;
                toPlayer.normalize();
                
                // Moves faster when player has more notes
                const enemySpeed = 5 + (this.collectedNotes * 4);
                this.enemy.position.addScaledVector(toPlayer, enemySpeed * delta);
                this.enemy.lookAt(this.camera.position);
                
                // Jump Scare
                if (dist < 3) {
                    this._jumpScare();
                    return; // stop animating
                }
            }

            this.renderer.render(this.scene, this.camera);
        },

        _jumpScare() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            this.controls.unlock();

            const ui = document.createElement('div');
            // Terrifying jump scare styling with screen shake
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;overflow:hidden;';
            
            // Generate a scary face with CSS and random bloody text
            ui.innerHTML = `
                <style>
                    @keyframes shake {
                        0% { transform: translate(20px, 20px) rotate(0deg); }
                        10% { transform: translate(-20px, -30px) rotate(-2deg); }
                        20% { transform: translate(-40px, 0px) rotate(2deg); }
                        30% { transform: translate(40px, 30px) rotate(0deg); }
                        40% { transform: translate(20px, -20px) rotate(2deg); }
                        50% { transform: translate(-20px, 30px) rotate(-2deg); }
                        60% { transform: translate(-40px, 20px) rotate(0deg); }
                        70% { transform: translate(40px, -20px) rotate(-2deg); }
                        80% { transform: translate(-20px, -20px) rotate(2deg); }
                        90% { transform: translate(20px, 30px) rotate(0deg); }
                        100% { transform: translate(0px, 0px) rotate(0deg); }
                    }
                    @keyframes flash {
                        0%, 50%, 100% { background-color: #8a0303; }
                        25%, 75% { background-color: #000; }
                    }
                    .scare-container {
                        animation: flash 0.1s infinite, shake 0.1s infinite;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background-color: #000;
                        background-image: url('images/horror_face.png');
                        background-size: cover;
                        background-position: center;
                        background-blend-mode: hard-light;
                    }
                </style>
                <div class="scare-container">
                    <h1 style="color:#fff;font-size:8rem;font-family:serif;margin-top:50px;text-shadow:0 0 20px #ff0000;background:rgba(0,0,0,0.5);padding:20px;">잡 혔 다</h1>
                </div>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '비명 지르며 나가기';
            closeBtn.style.cssText = 'position:absolute;bottom:50px;padding:20px 50px;background:#000;color:#ff0000;border:3px solid #ff0000;font-size:2rem;cursor:pointer;font-weight:bold;z-index:10000;';
            closeBtn.onmouseover = () => { closeBtn.style.background = '#ff0000'; closeBtn.style.color = '#000'; };
            closeBtn.onmouseout = () => { closeBtn.style.background = '#000'; closeBtn.style.color = '#ff0000'; };
            closeBtn.onclick = () => this.close();
            ui.appendChild(closeBtn);

            this.container.appendChild(ui);
        },

        _winGame() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            this.controls.unlock();

            const ui = document.createElement('div');
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:50;';
            
            ui.innerHTML = `
                <h1 style="color:#000;font-size:4rem;font-family:serif;margin-bottom:20px;">생존</h1>
                <p style="color:#333;font-size:1.5rem;">무사히 모든 쪽지를 찾아 탈출했습니다.</p>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '나가기';
            closeBtn.style.cssText = 'margin-top:50px;padding:15px 40px;background:#000;color:#fff;border:none;font-size:1.5rem;cursor:pointer;';
            closeBtn.onclick = () => this.close();
            ui.appendChild(closeBtn);

            this.container.appendChild(ui);
        },

        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            
            document.removeEventListener('keydown', this._onKeyDown);
            document.removeEventListener('keyup', this._onKeyUp);
            window.removeEventListener('resize', this._onResize);
            
            if (this.renderer) {
                document.removeEventListener('mousedown', this._onClick);
                this.renderer.dispose();
            }
            if (this.controls) this.controls.unlock();
            
            if (this.overlay) this.overlay.remove();
        }
    },

    rhythm: {
        overlay: null,
        container: null,
        canvas: null,
        ctx: null,
        animationId: null,
        isPlaying: false,

        audio: null,
        notes: [], // { lane: 0~3, y: float, hit: boolean }
        keys: { 'd': false, 'f': false, 'j': false, 'k': false },
        laneKeys: ['d', 'f', 'j', 'k'],
        
        score: 0,
        combo: 0,
        maxCombo: 0,
        
        hitLineY: 500,
        noteSpeed: 4,
        lastSpawnTime: 0,
        spawnInterval: 700,
        
        effects: [], // floating text like "PERFECT", "MISS"

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;

            this.canvas = document.createElement('canvas');
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.canvas.style.display = 'block';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            this.audio = new Audio('sounds/track.mp3');
            this.audio.loop = false;
            
            this.notes = [];
            this.effects = [];
            this.score = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.lastSpawnTime = 0;

            const uiDiv = this._buildStartUI();
            this.container.appendChild(uiDiv);

            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);
            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup', this._onKeyUp);

            this._loop = this._loop.bind(this);
        },

        _buildStartUI() {
            const ui = document.createElement('div');
            ui.id = 'rhythm-start-ui';
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,20,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            
            ui.innerHTML = `
                <h1 style="color:#00ffff;font-size:4rem;font-family:sans-serif;letter-spacing:3px;margin-bottom:20px;text-shadow:0 0 10px #00ffff;">NEON BEAT</h1>
                <p style="color:#fff;font-size:1.2rem;text-align:center;line-height:1.8;margin-bottom:40px;">
                    떨어지는 노트를 판정선에 맞춰 누르세요!<br><br>
                    <b style="color:#00ffff;font-size:1.5rem;">[ D ] [ F ] [ J ] [ K ]</b>
                </p>
            `;

            const btnDiv = document.createElement('div');
            btnDiv.style.display = 'flex';
            btnDiv.style.gap = '20px';

            const startBtn = document.createElement('button');
            startBtn.innerText = 'START';
            startBtn.style.cssText = 'padding:15px 40px;background:transparent;color:#00ffff;border:2px solid #00ffff;border-radius:25px;font-size:1.5rem;cursor:pointer;font-weight:bold;box-shadow:0 0 15px rgba(0,255,255,0.5);transition:all 0.2s;';
            startBtn.onmouseover = () => { startBtn.style.background = '#00ffff'; startBtn.style.color = '#000'; };
            startBtn.onmouseout = () => { startBtn.style.background = 'transparent'; startBtn.style.color = '#00ffff'; };
            startBtn.onclick = () => {
                ui.remove();
                this._startGame();
            };

            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'EXIT';
            closeBtn.style.cssText = 'padding:15px 40px;background:transparent;color:#fff;border:2px solid #fff;border-radius:25px;font-size:1.5rem;cursor:pointer;font-weight:bold;transition:all 0.2s;';
            closeBtn.onmouseover = () => { closeBtn.style.background = '#fff'; closeBtn.style.color = '#000'; };
            closeBtn.onmouseout = () => { closeBtn.style.background = 'transparent'; closeBtn.style.color = '#fff'; };
            closeBtn.onclick = () => this.close();

            btnDiv.appendChild(startBtn);
            btnDiv.appendChild(closeBtn);
            ui.appendChild(btnDiv);

            return ui;
        },

        _startGame() {
            this.isPlaying = true;
            this.audio.currentTime = 0;
            this.audio.play().catch(e => console.error("Audio play failed:", e));
            
            // Audio end listener
            this.audio.onended = () => {
                this._endGame();
            };

            this.lastSpawnTime = performance.now();
            this._loop();
        },

        _onKeyDown(e) {
            const key = e.key.toLowerCase();
            if (this.laneKeys.includes(key) && !this.keys[key]) {
                this.keys[key] = true;
                if (this.isPlaying) this._checkHit(this.laneKeys.indexOf(key));
            }
        },

        _onKeyUp(e) {
            const key = e.key.toLowerCase();
            if (this.laneKeys.includes(key)) {
                this.keys[key] = false;
            }
        },

        _checkHit(laneIndex) {
            // Find the lowest note in this lane that hasn't been hit yet
            let targetNote = null;
            let targetIdx = -1;
            
            for (let i = 0; i < this.notes.length; i++) {
                const note = this.notes[i];
                if (!note.hit && note.lane === laneIndex && note.y > this.hitLineY - 150) {
                    if (!targetNote || note.y > targetNote.y) {
                        targetNote = note;
                        targetIdx = i;
                    }
                }
            }

            if (targetNote) {
                const diff = Math.abs(targetNote.y + 10 - this.hitLineY); // 10 is half note height
                let result = '';
                let color = '';
                
                if (diff < 50) {
                    result = 'PERFECT'; color = '#ffff00';
                    this.score += 100;
                    this.combo++;
                } else if (diff < 100) {
                    result = 'GREAT'; color = '#00ff00';
                    this.score += 50;
                    this.combo++;
                } else if (diff < 180) {
                    result = 'GOOD'; color = '#00ffff';
                    this.score += 10;
                    this.combo = 0;
                } else {
                    result = 'MISS'; color = '#ff0000';
                    this.combo = 0;
                }
                
                targetNote.hit = true;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                
                // Add effect
                this.effects.push({ text: result, color: color, y: this.hitLineY - 50, life: 1.0 });
                if(this.combo >= 2) {
                    this.effects.push({ text: this.combo + ' COMBO', color: '#fff', y: this.hitLineY - 80, life: 1.0 });
                }
                
                // Remove note
                this.notes.splice(targetIdx, 1);
            }
        },

        _spawnNotes(time) {
            // Simple procedural generation based on time
            if (time - this.lastSpawnTime > this.spawnInterval) {
                this.lastSpawnTime = time;
                
                // Determine pattern
                const rand = Math.random();
                if (rand < 0.7) {
                    // Single note
                    const lane = Math.floor(Math.random() * 4);
                    this.notes.push({ lane, y: -20, hit: false });
                } else if (rand < 0.9) {
                    // Double note
                    let l1 = Math.floor(Math.random() * 4);
                    let l2 = (l1 + 1 + Math.floor(Math.random() * 3)) % 4;
                    this.notes.push({ lane: l1, y: -20, hit: false });
                    this.notes.push({ lane: l2, y: -20, hit: false });
                }
                // Vary interval slightly for rhythm feel
                this.spawnInterval = 600 + Math.random() * 400; 
            }
        },

        _loop(time) {
            if (!this.isPlaying) return;
            this.animationId = requestAnimationFrame(this._loop);

            if (time) this._spawnNotes(time);

            // Update Notes
            for (let i = this.notes.length - 1; i >= 0; i--) {
                const note = this.notes[i];
                note.y += this.noteSpeed;

                // Missed note
                if (note.y > this.hitLineY + 50) {
                    this.combo = 0;
                    this.effects.push({ text: 'MISS', color: '#ff0000', y: this.hitLineY, life: 1.0 });
                    this.notes.splice(i, 1);
                }
            }

            // Update Effects
            for (let i = this.effects.length - 1; i >= 0; i--) {
                this.effects[i].life -= 0.02;
                this.effects[i].y -= 1;
                if (this.effects[i].life <= 0) {
                    this.effects.splice(i, 1);
                }
            }

            this._draw();
        },

        _draw() {
            this.ctx.fillStyle = '#0a0a14';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const laneWidth = 80;
            const startX = (this.canvas.width - (laneWidth * 4)) / 2;

            // Draw lanes
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 2;
            for (let i = 0; i <= 4; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(startX + i * laneWidth, 0);
                this.ctx.lineTo(startX + i * laneWidth, this.canvas.height);
                this.ctx.stroke();
            }

            // Draw Hit Line
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(startX, this.hitLineY - 2, laneWidth * 4, 4);
            this.ctx.shadowBlur = 0;

            // Draw Key Presses
            const colors = ['#ff0055', '#00ffcc', '#00ffcc', '#ff0055'];
            for (let i = 0; i < 4; i++) {
                if (this.keys[this.laneKeys[i]]) {
                    const gradient = this.ctx.createLinearGradient(0, this.hitLineY, 0, this.canvas.height);
                    gradient.addColorStop(0, colors[i] + 'aa');
                    gradient.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(startX + i * laneWidth + 2, this.hitLineY, laneWidth - 4, this.canvas.height - this.hitLineY);
                    
                    // Pressed button effect
                    this.ctx.fillStyle = colors[i];
                    this.ctx.fillRect(startX + i * laneWidth + 2, this.hitLineY - 5, laneWidth - 4, 10);
                }
            }

            // Draw Notes
            for (const note of this.notes) {
                this.ctx.fillStyle = colors[note.lane];
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = colors[note.lane];
                // Note shape
                this.ctx.fillRect(startX + note.lane * laneWidth + 10, note.y, laneWidth - 20, 20);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(startX + note.lane * laneWidth + 25, note.y + 5, laneWidth - 50, 10);
                this.ctx.shadowBlur = 0;
            }

            // Draw UI (Score & Combo)
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`SCORE: ${this.score}`, 20, 40);
            
            // Draw Key Labels
            this.ctx.font = 'bold 20px sans-serif';
            this.ctx.textAlign = 'center';
            for (let i = 0; i < 4; i++) {
                this.ctx.fillStyle = this.keys[this.laneKeys[i]] ? '#fff' : '#666';
                this.ctx.fillText(this.laneKeys[i].toUpperCase(), startX + i * laneWidth + laneWidth/2, this.hitLineY + 40);
            }

            // Draw Effects
            for (const eff of this.effects) {
                this.ctx.fillStyle = eff.color;
                this.ctx.globalAlpha = eff.life;
                this.ctx.font = eff.text.includes('COMBO') ? 'italic bold 36px sans-serif' : 'bold 40px sans-serif';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = eff.color;
                this.ctx.fillText(eff.text, this.canvas.width / 2, eff.y);
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1.0;
            }
        },

        _endGame() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);

            const ui = document.createElement('div');
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:30;';
            
            ui.innerHTML = `
                <h1 style="color:#00ffff;font-size:5rem;margin-bottom:10px;text-shadow:0 0 20px #00ffff;">STAGE CLEAR</h1>
                <h2 style="color:#fff;font-size:3rem;margin-bottom:10px;">SCORE: ${this.score}</h2>
                <h3 style="color:#00ffcc;font-size:2rem;margin-bottom:50px;">MAX COMBO: ${this.maxCombo}</h3>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'FINISH';
            closeBtn.style.cssText = 'padding:15px 50px;background:#00ffff;color:#000;border:none;border-radius:30px;font-size:1.5rem;font-weight:bold;cursor:pointer;box-shadow:0 0 20px rgba(0,255,255,0.6);';
            closeBtn.onclick = () => this.close();
            ui.appendChild(closeBtn);

            this.container.appendChild(ui);
        },

        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            
            if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;
            }

            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup', this._onKeyUp);
            
            if (this.overlay) this.overlay.remove();
        }
    },

    bulletHell: {
        overlay: null,
        container: null,
        canvas: null,
        ctx: null,
        animationId: null,
        isPlaying: false,

        // Player
        player: null,
        playerBullets: [],
        shootCooldown: 0,

        // Enemies
        enemies: [],
        enemyBullets: [],
        wave: 0,
        waveTimer: 0,
        spawnTimer: 0,

        // State
        score: 0,
        lives: 3,
        invincible: 0,
        keys: {},
        bgY: 0,

        W: 480, H: 640,

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;
            this.container.style.width = '480px';
            this.container.style.maxWidth = '98vw';
            this.container.style.height = '640px';
            this.container.style.maxHeight = '98vh';
            this.container.style.backgroundColor = '#000';

            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.display = 'block';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            // Reset state
            this.playerBullets = [];
            this.enemies = [];
            this.enemyBullets = [];
            this.keys = {};
            this.score = 0;
            this.lives = 3;
            this.invincible = 0;
            this.wave = 0;
            this.waveTimer = 0;
            this.spawnTimer = 0;
            this.bgY = 0;
            this.shootCooldown = 0;

            this.player = { x: this.W/2, y: this.H - 80, w: 18, h: 18, speed: 4 };

            this._onKeyDown = (e) => { this.keys[e.code] = true; };
            this._onKeyUp   = (e) => { this.keys[e.code] = false; };
            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup',   this._onKeyUp);

            this._loop = this._loop.bind(this);

            const ui = this._buildStartUI();
            this.container.appendChild(ui);
        },

        _buildStartUI() {
            const ui = document.createElement('div');
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,15,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            ui.innerHTML = `
                <h1 style="color:#ff00ff;font-size:3rem;text-shadow:0 0 20px #ff00ff,0 0 40px #ff00ff;margin-bottom:10px;letter-spacing:3px;">탄막 슈팅</h1>
                <p style="color:#aaa;text-align:center;line-height:2;margin-bottom:30px;">
                    적의 탄막을 피하며 쓰러뜨리세요!<br>
                    <b style="color:#fff;">방향키</b> 이동 &nbsp;|&nbsp; <b style="color:#fff;">Z</b> 발사 &nbsp;|&nbsp; <b style="color:#fff;">Shift</b> 저속이동
                </p>
            `;
            const row = document.createElement('div');
            row.style.display = 'flex'; row.style.gap = '16px';

            const startBtn = document.createElement('button');
            startBtn.innerText = 'START';
            startBtn.style.cssText = 'padding:12px 36px;background:transparent;color:#ff00ff;border:2px solid #ff00ff;border-radius:25px;font-size:1.3rem;cursor:pointer;font-weight:bold;box-shadow:0 0 12px rgba(255,0,255,0.5);';
            startBtn.onmouseover = () => { startBtn.style.background='#ff00ff'; startBtn.style.color='#000'; };
            startBtn.onmouseout  = () => { startBtn.style.background='transparent'; startBtn.style.color='#ff00ff'; };
            startBtn.onclick = () => { ui.remove(); this._startGame(); };

            const exitBtn = document.createElement('button');
            exitBtn.innerText = 'EXIT';
            exitBtn.style.cssText = 'padding:12px 36px;background:transparent;color:#fff;border:2px solid #555;border-radius:25px;font-size:1.3rem;cursor:pointer;';
            exitBtn.onclick = () => this.close();

            row.appendChild(startBtn); row.appendChild(exitBtn);
            ui.appendChild(row);
            return ui;
        },

        _startGame() {
            this.isPlaying = true;
            this._loop();
        },

        _spawnWave() {
            this.wave++;
            const W = this.W;
            const count = 5 + this.wave * 2;

            if (this.wave % 5 === 0) {
                // BOSS
                this.enemies.push({
                    x: W/2, y: 80, w: 50, h: 40,
                    hp: 120 + this.wave * 30, maxHp: 120 + this.wave * 30,
                    isBoss: true, shootTimer: 0, shootInterval: 20,
                    vx: 1.5, vy: 0, patternTimer: 0,
                    color: `hsl(${Math.random()*360},100%,60%)`
                });
            } else {
                for (let i = 0; i < count; i++) {
                    const col = i % 5;
                    const row = Math.floor(i / 5);
                    this.enemies.push({
                        x: 60 + col * 80, y: -60 - row * 60,
                        w: 28, h: 22,
                        hp: 3 + this.wave, maxHp: 3 + this.wave,
                        isBoss: false,
                        shootTimer: Math.floor(Math.random() * 60),
                        shootInterval: Math.max(30, 80 - this.wave * 5),
                        vx: (Math.random()-0.5)*1.5, vy: 1 + this.wave*0.1,
                        color: `hsl(${Math.random()*360},100%,65%)`
                    });
                }
            }
        },

        _fireBullet(enemy) {
            const W = this.W;
            const px = this.player.x, py = this.player.y;
            const ex = enemy.x, ey = enemy.y;
            const baseAngle = Math.atan2(py - ey, px - ex);
            const speed = 3 + this.wave * 0.3;

            if (enemy.isBoss) {
                // Boss shoots radial bursts
                const count = 12 + this.wave * 2;
                for (let i = 0; i < count; i++) {
                    const a = (Math.PI * 2 / count) * i + enemy.patternTimer * 0.05;
                    this.enemyBullets.push({ x: ex, y: ey, vx: Math.cos(a)*speed, vy: Math.sin(a)*speed, r: 5, color: '#ff4444' });
                }
                // Also aimed burst
                for (let i = -2; i <= 2; i++) {
                    const a = baseAngle + i * 0.2;
                    this.enemyBullets.push({ x: ex, y: ey, vx: Math.cos(a)*speed, vy: Math.sin(a)*speed, r: 4, color: '#ffaa00' });
                }
            } else {
                // Normal: aimed + spread
                for (let i = -1; i <= 1; i++) {
                    const a = baseAngle + i * 0.25;
                    this.enemyBullets.push({ x: ex, y: ey, vx: Math.cos(a)*speed, vy: Math.sin(a)*speed, r: 4, color: enemy.color });
                }
            }
        },

        _loop() {
            if (!this.isPlaying) return;
            this.animationId = requestAnimationFrame(this._loop);

            const W = this.W, H = this.H;
            const p = this.player;

            // -- UPDATE PLAYER --
            const spd = this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? 2 : 4;
            if (this.keys['ArrowLeft'])  p.x = Math.max(p.w, p.x - spd);
            if (this.keys['ArrowRight']) p.x = Math.min(W - p.w, p.x + spd);
            if (this.keys['ArrowUp'])    p.y = Math.max(p.h, p.y - spd);
            if (this.keys['ArrowDown'])  p.y = Math.min(H - p.h, p.y + spd);

            // Shoot
            this.shootCooldown--;
            if ((this.keys['KeyZ'] || this.keys['Space']) && this.shootCooldown <= 0) {
                this.playerBullets.push({ x: p.x - 8, y: p.y, vy: -12 });
                this.playerBullets.push({ x: p.x + 8, y: p.y, vy: -12 });
                this.shootCooldown = 6;
            }

            if (this.invincible > 0) this.invincible--;

            // -- UPDATE PLAYER BULLETS --
            for (let i = this.playerBullets.length - 1; i >= 0; i--) {
                this.playerBullets[i].y += this.playerBullets[i].vy;
                if (this.playerBullets[i].y < -10) { this.playerBullets.splice(i, 1); }
            }

            // -- UPDATE ENEMIES --
            this.waveTimer++;
            if (this.enemies.length === 0 && this.waveTimer > 120) {
                this.waveTimer = 0;
                this._spawnWave();
            }

            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                e.patternTimer = (e.patternTimer || 0) + 1;

                if (e.isBoss) {
                    e.x += e.vx;
                    if (e.x < 50 || e.x > W - 50) e.vx *= -1;
                    e.y += Math.sin(e.patternTimer * 0.02) * 0.5;
                } else {
                    e.x += e.vx;
                    e.y += e.vy;
                    if (e.x < 20 || e.x > W - 20) e.vx *= -1;
                    if (e.y > H + 50) { this.enemies.splice(i, 1); continue; }
                }

                // Enemy shoot
                e.shootTimer++;
                if (e.shootTimer >= e.shootInterval) {
                    e.shootTimer = 0;
                    this._fireBullet(e);
                }

                // Player bullet hit enemy
                for (let j = this.playerBullets.length - 1; j >= 0; j--) {
                    const b = this.playerBullets[j];
                    if (Math.abs(b.x - e.x) < e.w && Math.abs(b.y - e.y) < e.h) {
                        e.hp--;
                        this.playerBullets.splice(j, 1);
                        this.score += 10;
                        if (e.hp <= 0) {
                            this.score += e.isBoss ? 500 : 50;
                            this.enemies.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            // -- UPDATE ENEMY BULLETS --
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                const b = this.enemyBullets[i];
                b.x += b.vx; b.y += b.vy;
                if (b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) {
                    this.enemyBullets.splice(i, 1); continue;
                }
                // Hit player
                if (this.invincible <= 0 && Math.abs(b.x - p.x) < 8 && Math.abs(b.y - p.y) < 8) {
                    this.enemyBullets.splice(i, 1);
                    this.lives--;
                    this.invincible = 120;
                    if (this.lives <= 0) { this._gameOver(); return; }
                }
            }

            // Scroll background
            this.bgY = (this.bgY + 1) % 40;

            this._draw();
        },

        _draw() {
            const ctx = this.ctx;
            const W = this.W, H = this.H;

            // Background - starfield
            ctx.fillStyle = '#00000f';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            for (let i = 0; i < 60; i++) {
                const sx = (i * 137 + 50) % W;
                const sy = (i * 97 + this.bgY * (1 + i%3)) % H;
                ctx.fillRect(sx, sy, 1.5, 1.5);
            }

            // Draw player
            const p = this.player;
            if (this.invincible <= 0 || Math.floor(this.invincible / 6) % 2 === 0) {
                ctx.save();
                ctx.translate(p.x, p.y);
                // Ship body
                ctx.fillStyle = '#00ccff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ccff';
                ctx.beginPath();
                ctx.moveTo(0, -18);
                ctx.lineTo(-12, 12);
                ctx.lineTo(0, 6);
                ctx.lineTo(12, 12);
                ctx.closePath();
                ctx.fill();
                // Engine glow
                ctx.fillStyle = '#ff9900';
                ctx.shadowColor = '#ff9900';
                ctx.beginPath();
                ctx.ellipse(0, 10, 5, 8, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
                // Hitbox indicator (tiny)
                ctx.fillStyle = 'rgba(0,200,255,0.8)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
                ctx.fill();
            }

            // Draw player bullets
            ctx.fillStyle = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffff00';
            for (const b of this.playerBullets) {
                ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
            }
            ctx.shadowBlur = 0;

            // Draw enemies
            for (const e of this.enemies) {
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.shadowBlur = 12;
                ctx.shadowColor = e.color;

                if (e.isBoss) {
                    // Boss diamond shape
                    ctx.fillStyle = e.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -e.h);
                    ctx.lineTo(e.w, 0);
                    ctx.lineTo(0, e.h);
                    ctx.lineTo(-e.w, 0);
                    ctx.closePath();
                    ctx.fill();
                    // HP bar above boss
                    ctx.fillStyle = '#333';
                    ctx.fillRect(-e.w, -e.h - 14, e.w*2, 8);
                    ctx.fillStyle = '#ff2222';
                    ctx.fillRect(-e.w, -e.h - 14, e.w*2 * (e.hp/e.maxHp), 8);
                } else {
                    // Normal enemy - inverted triangle
                    ctx.fillStyle = e.color;
                    ctx.beginPath();
                    ctx.moveTo(-e.w/2, -e.h/2);
                    ctx.lineTo(e.w/2, -e.h/2);
                    ctx.lineTo(0, e.h/2);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            }

            // Draw enemy bullets
            for (const b of this.enemyBullets) {
                ctx.fillStyle = b.color;
                ctx.shadowBlur = 6;
                ctx.shadowColor = b.color;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
                ctx.fill();
                // Inner bright core
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r * 0.4, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // HUD
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`SCORE: ${this.score}`, 10, 28);
            ctx.textAlign = 'right';
            ctx.fillText(`WAVE: ${this.wave}`, W - 10, 28);
            // Lives as hearts
            for (let i = 0; i < this.lives; i++) {
                ctx.fillStyle = '#ff2244';
                ctx.font = '20px sans-serif';
                ctx.fillText('♥', W - 10 - i * 24, 52);
            }
        },

        _gameOver() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);

            const ui = document.createElement('div');
            ui.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:30;';
            ui.innerHTML = `
                <h1 style="color:#ff2244;font-size:4rem;text-shadow:0 0 20px #ff2244;margin-bottom:10px;">GAME OVER</h1>
                <h2 style="color:#fff;font-size:2.5rem;margin-bottom:8px;">SCORE: ${this.score}</h2>
                <h3 style="color:#ff00ff;font-size:1.8rem;margin-bottom:40px;">WAVE: ${this.wave}</h3>
            `;
            const row = document.createElement('div');
            row.style.display = 'flex'; row.style.gap = '16px';

            const retryBtn = document.createElement('button');
            retryBtn.innerText = 'RETRY';
            retryBtn.style.cssText = 'padding:12px 36px;background:#ff2244;color:#fff;border:none;border-radius:25px;font-size:1.3rem;cursor:pointer;font-weight:bold;';
            retryBtn.onclick = () => { ui.remove(); this._resetAndStart(); };

            const exitBtn = document.createElement('button');
            exitBtn.innerText = 'EXIT';
            exitBtn.style.cssText = 'padding:12px 36px;background:transparent;color:#fff;border:2px solid #555;border-radius:25px;font-size:1.3rem;cursor:pointer;';
            exitBtn.onclick = () => this.close();

            row.appendChild(retryBtn); row.appendChild(exitBtn);
            ui.appendChild(row);
            this.container.appendChild(ui);
        },

        _resetAndStart() {
            this.playerBullets = [];
            this.enemies = [];
            this.enemyBullets = [];
            this.score = 0;
            this.lives = 3;
            this.invincible = 0;
            this.wave = 0;
            this.waveTimer = 0;
            this.shootCooldown = 0;
            this.player = { x: this.W/2, y: this.H - 80, w: 18, h: 18, speed: 4 };
            this.isPlaying = true;
            this._loop();
        },

        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup',   this._onKeyUp);
            if (this.overlay) this.overlay.remove();
        }
    },

    farming:{
        TW:48,TH:48,COLS:16,ROWS:12,W:768,H:576,
        CROPS:{
            corn:      {emoji:'🌽',name:'옥수수',seedCost:0,  sell:50, days:3},
            strawberry:{emoji:'🍓',name:'딸기',  seedCost:30, sell:150,days:5},
            pumpkin:   {emoji:'🎃',name:'호박',  seedCost:80, sell:400,days:8},
        },
        LAYOUT:[
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,4,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
            [0,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,3,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        ],
        tiles:null,player:null,day:1,season:'Spring',gold:100,
        inv:null,seeds:null,selectedSeed:'corn',
        keys:{},msg:'',msgTimer:0,uiMode:null,
        overlay:null,container:null,canvas:null,ctx:null,
        animId:null,isPlaying:false,

        init(){
            const{overlay,gameContainer}=MiniGames._createOverlay();
            this.overlay=overlay;this.container=gameContainer;
            this.container.style.backgroundColor='#2d5a27';
            this.canvas=document.createElement('canvas');
            this.canvas.width=this.W;this.canvas.height=this.H;
            this.canvas.style.cssText='display:block;width:100%;height:100%;';
            this.container.appendChild(this.canvas);
            
            const xBtn = document.createElement('button');
            xBtn.innerText = '✕';
            xBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:36px;height:36px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:18px;cursor:pointer;font-size:20px;z-index:100;display:flex;align-items:center;justify-content:center;font-weight:bold;';
            xBtn.onmouseover = () => xBtn.style.background = 'rgba(255,0,0,0.8)';
            xBtn.onmouseout = () => xBtn.style.background = 'rgba(0,0,0,0.6)';
            xBtn.onclick = () => this.close();
            this.container.appendChild(xBtn);

            this.ctx=this.canvas.getContext('2d');
            this.day=1;this.season='Spring';this.gold=100;
            this.inv={corn:0,strawberry:0,pumpkin:0};
            this.seeds={corn:5,strawberry:0,pumpkin:0};
            this.selectedSeed='corn';this.keys={};this.msg='';this.msgTimer=0;
            this.uiMode=null;this.isPlaying=false;
            this.tiles=this.LAYOUT.map(row=>row.map(t=>({type:t,state:t===2?'untilled':'',crop:null,days:0,watered:false})));
            this.player={x:300,y:350,w:20,h:28,speed:3,facing:'down'};
            this._onKeyDown=(e)=>{
                this.keys[e.code]=true;
                if(!this.isPlaying)return;
                if(e.code==='KeyE')this._interact();
                if(e.code==='KeyF')this._plant();
                if(e.code==='KeyR')this._water();
                if(e.code==='Digit1')this.selectedSeed='corn';
                if(e.code==='Digit2')this.selectedSeed='strawberry';
                if(e.code==='Digit3')this.selectedSeed='pumpkin';
                if(e.code==='Escape'){
                    if(this.uiMode){ this.uiMode=null;const s=this.container.querySelector('#farm-shop-ui');if(s)s.remove(); }
                    else { this.close(); }
                }
            };
            this._onKeyUp=(e)=>{this.keys[e.code]=false;};
            window.addEventListener('keydown',this._onKeyDown);
            window.addEventListener('keyup',this._onKeyUp);
            this._loop=this._loop.bind(this);
            this.container.appendChild(this._buildStartUI());
        },

        _buildStartUI(){
            const ui=document.createElement('div');
            ui.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(20,40,10,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            ui.innerHTML='<h1 style="color:#7ec850;font-size:3rem;text-shadow:2px 2px #000;margin-bottom:12px;">🌾 나만의 농장</h1><p style="color:#ccc;text-align:center;line-height:2.2;margin-bottom:28px;font-size:1rem;"><b style="color:#7ec850;">WASD/방향키</b>: 이동 &nbsp;|&nbsp; <b style="color:#7ec850;">E</b>: 경작/수확/상호작용<br><b style="color:#7ec850;">F</b>: 씨앗 심기 &nbsp;|&nbsp; <b style="color:#7ec850;">R</b>: 물주기 &nbsp;|&nbsp; <b style="color:#7ec850;">1/2/3</b>: 씨앗 선택<br><span style="color:#f4d03f;">침대(💤) 앞 E → 다음 날 &nbsp;|&nbsp; 상점(🏪) 앞 E → 구매/판매</span></p>';
            const row=document.createElement('div');row.style.cssText='display:flex;gap:16px;';
            const sb=document.createElement('button');
            sb.innerText='🌱 농사 시작!';
            sb.style.cssText='padding:14px 36px;background:#4caf50;color:#fff;border:none;border-radius:25px;font-size:1.4rem;cursor:pointer;font-weight:bold;';
            sb.onclick=()=>{ui.remove();this.isPlaying=true;this._loop();};
            const eb=document.createElement('button');
            eb.innerText='나가기';
            eb.style.cssText='padding:14px 36px;background:transparent;color:#fff;border:2px solid #555;border-radius:25px;font-size:1.4rem;cursor:pointer;';
            eb.onclick=()=>this.close();
            row.appendChild(sb);row.appendChild(eb);ui.appendChild(row);return ui;
        },

        _getTileAt(px,py){
            const col=Math.floor(px/this.TW),row=Math.floor(py/this.TH);
            if(col<0||col>=this.COLS||row<0||row>=this.ROWS)return null;
            return{col,row,tile:this.tiles[row][col]};
        },
        _getFacingTile(){
            const p=this.player,step=this.TW*0.9;
            let tx=p.x+p.w/2,ty=p.y+p.h/2;
            if(p.facing==='up')ty-=step;else if(p.facing==='down')ty+=step;
            else if(p.facing==='left')tx-=step;else tx+=step;
            return this._getTileAt(tx,ty);
        },
        _interact(){
            if(this.uiMode){this.uiMode=null;const s=this.container.querySelector('#farm-shop-ui');if(s)s.remove();return;}
            const r=this._getFacingTile();if(!r)return;
            const t=r.tile;
            if(t.type===3){this._sleep();return;}
            if(t.type===4){this.uiMode='shop';this._showShop();return;}
            if(t.type===2){
                if(t.state==='untilled'){t.state='dry';this._showMsg('⛏️ 밭을 갈았습니다!');}
                else if(t.state==='ready'){const c=t.crop;this.inv[c]++;t.state='dry';t.crop=null;t.days=0;t.watered=false;this._showMsg(this.CROPS[c].emoji+' '+this.CROPS[c].name+' 수확! (총 '+this.inv[c]+'개)');}
                else{this._showMsg('R: 물주기  F: 씨앗심기  성장 중이면 기다려주세요');}
            }
        },
        _plant(){
            if(this.uiMode)return;
            const r=this._getFacingTile();if(!r)return;
            const t=r.tile,s=this.selectedSeed;
            if(t.type===2&&(t.state==='dry'||t.state==='wet')&&!t.crop){
                if(this.seeds[s]<=0){this._showMsg('씨앗이 없습니다! 상점에서 구매하세요.');return;}
                this.seeds[s]--;t.crop=s;t.days=0;
                t.state=t.state==='wet'?'seeded_wet':'seeded_dry';
                this._showMsg(this.CROPS[s].emoji+' '+this.CROPS[s].name+' 심기 완료! (남은 '+this.seeds[s]+'개)');
            }else if(t.type===2&&t.state==='untilled'){this._showMsg('먼저 E키로 밭을 갈아야 합니다!');}
        },
        _water(){
            if(this.uiMode)return;
            const r=this._getFacingTile();if(!r)return;
            const t=r.tile;
            if(t.type===2&&t.state!=='untilled'){
                if(t.watered){this._showMsg('이미 오늘 물을 주었습니다.');return;}
                t.watered=true;
                const m={dry:'wet',seeded_dry:'seeded_wet',growing_dry:'growing_wet'};
                if(m[t.state])t.state=m[t.state];
                this._showMsg('💧 물을 주었습니다!');
            }
        },
        _sleep(){
            this.day++;let grew=0;
            for(let r=0;r<this.ROWS;r++)for(let c=0;c<this.COLS;c++){
                const t=this.tiles[r][c];
                if(t.type!==2||!t.crop)continue;
                if(t.watered){t.days++;grew++;}
                const prog=t.days/this.CROPS[t.crop].days;
                if(t.days>=this.CROPS[t.crop].days)t.state='ready';
                else if(prog>=0.4)t.state=t.watered?'growing_wet':'growing_dry';
                t.watered=false;
                const dm={wet:'dry',seeded_wet:'seeded_dry',growing_wet:'growing_dry'};
                if(dm[t.state]&&t.state!=='ready')t.state=dm[t.state];
            }
            this._showMsg('💤 Day '+this.day+'! '+grew+'개 작물 성장');
        },
        _showMsg(text){this.msg=text;this.msgTimer=200;},

        _showShop(){
            const ex=this.container.querySelector('#farm-shop-ui');if(ex)ex.remove();
            const shop=document.createElement('div');
            shop.id='farm-shop-ui';
            shop.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:420px;background:#1a0e05;border:3px solid #7a4e2d;border-radius:14px;padding:22px;z-index:30;color:#fff;font-family:sans-serif;max-height:92%;overflow-y:auto;';
            const build=()=>{
                shop.innerHTML='<h2 style="color:#f4d03f;text-align:center;margin:0 0 10px;">🏪 마을 상점</h2><p style="color:#aaa;text-align:center;margin:0 0 14px;">💰 소지금: <b style="color:#f4d03f;font-size:1.2rem;">'+this.gold+'G</b></p><h3 style="color:#7ec850;border-bottom:1px solid #333;padding-bottom:5px;margin:0 0 8px;">씨앗 구매 (3개)</h3>';
                Object.entries(this.CROPS).forEach(([key,c])=>{
                    const d=document.createElement('div');
                    d.style.cssText='display:flex;justify-content:space-between;align-items:center;background:#2a1a0a;padding:8px 12px;border-radius:8px;margin-bottom:6px;';
                    d.innerHTML='<span>'+c.emoji+' '+c.name+' <span style="color:#888;font-size:.85rem;">(보유 '+this.seeds[key]+')</span></span>';
                    const btn=document.createElement('button');
                    btn.innerText=c.seedCost===0?'무료':c.seedCost+'G';
                    btn.style.cssText='padding:5px 14px;background:'+(this.gold>=c.seedCost?'#4caf50':'#555')+';color:#fff;border:none;border-radius:20px;cursor:pointer;font-size:.9rem;';
                    btn.onclick=()=>{if(this.gold<c.seedCost){this._showMsg('돈이 부족합니다!');return;}this.gold-=c.seedCost;this.seeds[key]+=3;this._showMsg(c.emoji+' 씨앗 3개 구매!');build();};
                    d.appendChild(btn);shop.appendChild(d);
                });
                const h3=document.createElement('h3');h3.style.cssText='color:#e67e22;border-bottom:1px solid #333;padding-bottom:5px;margin:14px 0 8px;';h3.innerText='🌾 작물 판매 (전량)';shop.appendChild(h3);
                Object.entries(this.CROPS).forEach(([key,c])=>{
                    const qty=this.inv[key],total=qty*c.sell;
                    const d=document.createElement('div');
                    d.style.cssText='display:flex;justify-content:space-between;align-items:center;background:#2a1a0a;padding:8px 12px;border-radius:8px;margin-bottom:6px;';
                    d.innerHTML='<span>'+c.emoji+' '+c.name+' <span style="color:#888;font-size:.85rem;">x'+qty+'</span></span>';
                    const btn=document.createElement('button');
                    btn.innerText=qty>0?'+'+total+'G':'없음';
                    btn.style.cssText='padding:5px 14px;background:'+(qty>0?'#e67e22':'#555')+';color:#fff;border:none;border-radius:20px;cursor:'+(qty>0?'pointer':'default')+';font-size:.9rem;';
                    btn.onclick=()=>{if(!qty)return;this.gold+=total;this.inv[key]=0;this._showMsg('💰 '+total+'G 획득!');build();};
                    d.appendChild(btn);shop.appendChild(d);
                });
                const cb=document.createElement('button');cb.innerText='닫기 (ESC)';
                cb.style.cssText='width:100%;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1rem;margin-top:12px;';
                cb.onclick=()=>{shop.remove();this.uiMode=null;};shop.appendChild(cb);
            };
            build();this.container.appendChild(shop);
        },

        _loop(){
            if(!this.isPlaying)return;
            this.animId=requestAnimationFrame(this._loop);
            this._update();this._draw();
        },
        _update(){
            if(this.uiMode)return;
            const p=this.player;let dx=0,dy=0;
            if(this.keys['ArrowLeft']||this.keys['KeyA']){dx=-1;p.facing='left';}
            if(this.keys['ArrowRight']||this.keys['KeyD']){dx=1;p.facing='right';}
            if(this.keys['ArrowUp']||this.keys['KeyW']){dy=-1;p.facing='up';}
            if(this.keys['ArrowDown']||this.keys['KeyS']){dy=1;p.facing='down';}
            if(dx&&dy){dx*=0.707;dy*=0.707;}
            const sp=p.speed,nx=p.x+dx*sp,ny=p.y+dy*sp;
            if(this._canMove(nx,p.y))p.x=Math.max(0,Math.min(this.W-p.w,nx));
            if(this._canMove(p.x,ny))p.y=Math.max(0,Math.min(this.H-p.h,ny));
            if(this.msgTimer>0)this.msgTimer--;
        },
        _canMove(x,y){
            const p=this.player;
            for(const[cx,cy]of[[x,y],[x+p.w,y],[x,y+p.h],[x+p.w,y+p.h]]){
                const r=this._getTileAt(cx,cy);if(!r||r.tile.type===0)return false;
            }
            return true;
        },
        _draw(){
            const ctx=this.ctx;ctx.clearRect(0,0,this.W,this.H);
            for(let r=0;r<this.ROWS;r++)for(let c=0;c<this.COLS;c++)this._drawTile(ctx,this.tiles[r][c],c*this.TW,r*this.TH);
            this._drawPlayer(ctx);this._drawHUD(ctx);
            if(this.msgTimer>0){
                ctx.globalAlpha=Math.min(1,this.msgTimer/30);
                ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(40,this.H-72,this.W-80,42);
                ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
                ctx.fillText(this.msg,this.W/2,this.H-46);ctx.globalAlpha=1;
            }
        },
        _drawTile(ctx,tile,x,y){
            const TW=this.TW,TH=this.TH;
            if(tile.type===0){ctx.fillStyle='#5d4037';ctx.fillRect(x,y,TW,TH);ctx.fillStyle='#795548';ctx.fillRect(x+3,y+3,TW-6,TH-6);}
            else if(tile.type===1){ctx.fillStyle='#4caf50';ctx.fillRect(x,y,TW,TH);ctx.fillStyle='#388e3c';ctx.fillRect(x+8,y+5,4,4);ctx.fillRect(x+28,y+18,4,4);ctx.fillRect(x+18,y+32,4,4);}
            else if(tile.type===2){
                const wet=tile.state.includes('wet')||tile.state==='ready';
                ctx.fillStyle=wet?'#7a5230':tile.state==='untilled'?'#66bb6a':'#c8a86b';
                ctx.fillRect(x,y,TW,TH);
                if(tile.state!=='untilled'){ctx.fillStyle=wet?'#6a4220':'#b8986a';for(let i=0;i<3;i++)ctx.fillRect(x+4,y+8+i*14,TW-8,3);}
                else{ctx.fillStyle='#43a047';ctx.fillRect(x+6,y+7,3,3);ctx.fillRect(x+30,y+22,3,3);}
                if(tile.crop){
                    const c=this.CROPS[tile.crop];
                    ctx.save();ctx.translate(x+TW/2,y+TH/2);
                    if(tile.state==='ready'){ctx.font='28px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c.emoji,0,0);}
                    else if(tile.state.startsWith('growing')){ctx.fillStyle='#2e7d32';ctx.fillRect(-2,-16,5,20);ctx.fillStyle='#66bb6a';ctx.beginPath();ctx.ellipse(-8,-14,8,5,-0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(8,-10,8,5,0.3,0,Math.PI*2);ctx.fill();}
                    else{ctx.fillStyle='#33691e';ctx.fillRect(-1,-9,3,12);ctx.fillStyle='#aed581';ctx.beginPath();ctx.ellipse(4,-9,6,4,0.5,0,Math.PI*2);ctx.fill();}
                    ctx.restore();
                }
            }else if(tile.type===3){
                ctx.fillStyle='#4caf50';ctx.fillRect(x,y,TW,TH);
                ctx.fillStyle='#1565c0';ctx.fillRect(x+4,y+8,TW-8,TH-12);
                ctx.fillStyle='#fff';ctx.fillRect(x+6,y+10,TW-12,12);
                ctx.fillStyle='#e3f2fd';ctx.fillRect(x+6,y+22,TW-12,TH-28);
                ctx.fillStyle='#0d47a1';ctx.fillRect(x+4,y+8,TW-8,4);
                ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText('💤',x+TW/2,y+TH-5);
            }else if(tile.type===4){
                ctx.fillStyle='#4caf50';ctx.fillRect(x,y,TW,TH);
                ctx.fillStyle='#795548';ctx.fillRect(x+4,y+18,TW-8,TH-18);
                ctx.fillStyle='#bf360c';ctx.beginPath();ctx.moveTo(x,y+18);ctx.lineTo(x+TW/2,y+2);ctx.lineTo(x+TW,y+18);ctx.closePath();ctx.fill();
                ctx.fillStyle='#fffde7';ctx.fillRect(x+14,y+28,20,20);
                ctx.font='14px serif';ctx.textAlign='center';ctx.fillText('🏪',x+TW/2,y+16);
            }
        },
        _drawPlayer(ctx){
            const p=this.player;
            ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h+3,p.w/2,4,0,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#1565c0';ctx.fillRect(p.x+2,p.y+13,p.w-4,p.h-13);
            ctx.fillStyle='#ffcc80';ctx.fillRect(p.x+4,p.y+1,p.w-8,14);
            ctx.fillStyle='#333';
            if(p.facing==='down'){ctx.fillRect(p.x+6,p.y+6,3,3);ctx.fillRect(p.x+11,p.y+6,3,3);}
            else if(p.facing==='up'){ctx.fillStyle='#5d4037';ctx.fillRect(p.x+4,p.y+1,p.w-8,6);}
            else if(p.facing==='left')ctx.fillRect(p.x+5,p.y+6,3,3);
            else ctx.fillRect(p.x+12,p.y+6,3,3);
            ctx.fillStyle='#5d4037';ctx.fillRect(p.x+3,p.y-3,p.w-6,5);ctx.fillRect(p.x+6,p.y-8,p.w-12,6);
        },
        _drawHUD(ctx){
            const W=this.W,H=this.H;
            ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,38);
            ctx.font='bold 15px sans-serif';ctx.textAlign='left';ctx.fillStyle='#a5d6a7';ctx.fillText('🌸 '+this.season+' Day '+this.day,12,25);
            ctx.textAlign='center';ctx.fillStyle='#f4d03f';ctx.fillText('💰 '+this.gold+'G',W/2,25);
            const sl=['corn','strawberry','pumpkin'],em=['🌽','🍓','🎃'];
            sl.forEach((k,i)=>{
                const bx=W-150+i*48,by=4;
                ctx.fillStyle=this.selectedSeed===k?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.35)';ctx.fillRect(bx,by,42,30);
                if(this.selectedSeed===k){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(bx,by,42,30);}
                ctx.font='17px serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(em[i],bx+21,by+19);
                ctx.font='10px sans-serif';ctx.fillStyle='#ddd';ctx.fillText(this.seeds[k],bx+21,by+29);
            });
            ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,H-30,W,30);
            ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#bbb';
            ctx.fillText('E: 경작/수확/상호작용  F: 씨앗심기  R: 물주기  1/2/3: 씨앗선택  침대E: 다음날  상점E: 구매/판매',W/2,H-10);
            ctx.textAlign='left';ctx.fillStyle='#a5d6a7';ctx.font='bold 12px sans-serif';
            ctx.fillText('인벤: 🌽x'+this.inv.corn+' 🍓x'+this.inv.strawberry+' 🎃x'+this.inv.pumpkin,10,H-11);
        },
        close(){
            this.isPlaying=false;cancelAnimationFrame(this.animId);
            window.removeEventListener('keydown',this._onKeyDown);
            window.removeEventListener('keyup',this._onKeyUp);
            if(this.overlay)this.overlay.remove();
        }
    },
    rpg: {
        W: 800, H: 600,
        player: null,
        mobs: [],
        platforms: [],
        texts: [], // floating damage texts
        keys: {},
        ctx: null, canvas: null, overlay: null, container: null,
        animId: null, isPlaying: false,
        camera: { x: 0, y: 0 },
        
        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;
            this.container.style.backgroundColor = '#87CEEB'; // Sky blue background
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.cssText = 'display:block;width:100%;height:100%;';
            this.container.appendChild(this.canvas);
            
            const xBtn = document.createElement('button');
            xBtn.innerText = '✕';
            xBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:36px;height:36px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:18px;cursor:pointer;font-size:20px;z-index:100;display:flex;align-items:center;justify-content:center;font-weight:bold;';
            xBtn.onmouseover = () => xBtn.style.background = 'rgba(255,0,0,0.8)';
            xBtn.onmouseout = () => xBtn.style.background = 'rgba(0,0,0,0.6)';
            xBtn.onclick = () => this.close();
            this.container.appendChild(xBtn);

            this.ctx = this.canvas.getContext('2d');
            
            this.player = {
                x: 100, y: 300, w: 32, h: 48, vx: 0, vy: 0, speed: 4, jump: -12,
                hp: 100, maxHp: 100, exp: 0, maxExp: 50, level: 1, atk: 15,
                facing: 1, // 1 for right, -1 for left
                isGrounded: false,
                attackTimer: 0, invincibleTimer: 0
            };
            
            this.mobs = [];
            this.platforms = [
                { x: -500, y: 500, w: 2000, h: 100 }, // ground
                { x: 300, y: 400, w: 150, h: 20 },
                { x: 550, y: 320, w: 150, h: 20 },
                { x: 150, y: 250, w: 150, h: 20 }
            ];
            this.texts = [];
            this.keys = {};
            this.isPlaying = false;
            this.camera = { x: 0, y: 0 };
            
            // Initial mobs
            for(let i=0; i<5; i++) this.spawnMob();

            this._onKeyDown = (e) => {
                this.keys[e.code] = true;
                if (!this.isPlaying) return;
                if (e.code === 'Space' || e.code === 'AltLeft' || e.code === 'AltRight') {
                    if (this.player.isGrounded) {
                        this.player.vy = this.player.jump;
                        this.player.isGrounded = false;
                    }
                }
                if (e.code === 'KeyZ' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
                    this._attack();
                }
                if (e.code === 'Escape') this.close();
            };
            this._onKeyUp = (e) => { this.keys[e.code] = false; };
            
            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup', this._onKeyUp);
            this._loop = this._loop.bind(this);
            
            this.container.appendChild(this._buildStartUI());
        },
        
        spawnMob() {
            const types = [
                { color: '#8FBC8F', hp: 30, maxHp: 30, atk: 10, exp: 20, w: 30, h: 24 }, // Slime
                { color: '#FFA500', hp: 50, maxHp: 50, atk: 15, exp: 35, w: 36, h: 36 }  // Mushroom
            ];
            const t = types[Math.floor(Math.random() * types.length)];
            this.mobs.push({
                x: 200 + Math.random() * 800, y: 100, w: t.w, h: t.h, vx: (Math.random() > 0.5 ? 1 : -1) * 1.5, vy: 0,
                hp: t.hp, maxHp: t.maxHp, atk: t.atk, exp: t.exp, color: t.color,
                isGrounded: false, damageTimer: 0
            });
        },
        
        _buildStartUI() {
            const ui=document.createElement('div');
            ui.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;';
            ui.innerHTML='<h1 style="color:#ffcc00;font-size:3.5rem;text-shadow:3px 3px #000;margin-bottom:12px;">🍄 미니 롤플레잉</h1><p style="color:#eee;text-align:center;line-height:2.2;margin-bottom:28px;font-size:1.1rem;"><b style="color:#ffcc00;">←/→</b>: 이동 &nbsp;|&nbsp; <b style="color:#ffcc00;">Space/Alt</b>: 점프<br><b style="color:#ffcc00;">Z/Ctrl</b>: 공격<br><span style="color:#aaa;">몬스터를 처치하고 레벨업 하세요!</span></p>';
            const row=document.createElement('div');row.style.cssText='display:flex;gap:16px;';
            const sb=document.createElement('button');
            sb.innerText='게임 시작';
            sb.style.cssText='padding:14px 40px;background:#ff9900;color:#fff;border:none;border-radius:25px;font-size:1.5rem;cursor:pointer;font-weight:bold;box-shadow:0 4px 10px rgba(255,153,0,0.5);';
            sb.onclick=()=>{ui.remove();this.isPlaying=true;this._loop();};
            row.appendChild(sb);ui.appendChild(row);return ui;
        },
        
        _attack() {
            if (this.player.attackTimer > 0) return;
            this.player.attackTimer = 20; // 20 frames cooldown
            
            const p = this.player;
            const range = 60;
            const hitBox = {
                x: p.facing === 1 ? p.x + p.w : p.x - range,
                y: p.y,
                w: range,
                h: p.h
            };
            
            for (let i = this.mobs.length - 1; i >= 0; i--) {
                const m = this.mobs[i];
                if (this._checkAABB(hitBox, m)) {
                    // Hit!
                    const dmg = Math.floor(p.atk * (0.8 + Math.random() * 0.4));
                    m.hp -= dmg;
                    m.damageTimer = 10;
                    m.vx = -p.facing * 2; // knockback
                    m.vy = -4; // knockup
                    m.isGrounded = false;
                    
                    this.texts.push({ x: m.x + m.w/2, y: m.y, text: dmg, life: 40, dy: -2, color: '#fff' });
                    
                    if (m.hp <= 0) {
                        this.player.exp += m.exp;
                        this.texts.push({ x: p.x + p.w/2, y: p.y - 20, text: '+'+m.exp+' EXP', life: 50, dy: -1, color: '#ffcc00' });
                        this.mobs.splice(i, 1);
                        this._checkLevelUp();
                    }
                }
            }
        },
        
        _checkLevelUp() {
            while (this.player.exp >= this.player.maxExp) {
                this.player.exp -= this.player.maxExp;
                this.player.level++;
                this.player.maxExp = Math.floor(this.player.maxExp * 1.5);
                this.player.maxHp += 20;
                this.player.hp = this.player.maxHp;
                this.player.atk += 5;
                this.texts.push({ x: this.player.x + this.player.w/2, y: this.player.y - 40, text: 'LEVEL UP!', life: 80, dy: -1, color: '#00ffff' });
            }
        },
        
        _checkAABB(a, b) {
            return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        },
        
        _loop() {
            if (!this.isPlaying) return;
            this.animId = requestAnimationFrame(this._loop);
            this._update();
            this._draw();
        },
        
        _update() {
            const p = this.player;
            const GRAVITY = 0.6;
            const FRICTION = 0.8;
            
            // Player input
            if (this.keys['ArrowLeft']) { p.vx -= 1; p.facing = -1; }
            if (this.keys['ArrowRight']) { p.vx += 1; p.facing = 1; }
            
            p.vx *= FRICTION;
            p.vy += GRAVITY;
            
            // Player movement & collision
            p.x += p.vx;
            p.y += p.vy;
            p.isGrounded = false;
            
            for (const plat of this.platforms) {
                // simple top collision
                if (p.vy >= 0 && p.y + p.h - p.vy <= plat.y && p.y + p.h >= plat.y && p.x + p.w > plat.x && p.x < plat.x + plat.w) {
                    p.y = plat.y - p.h;
                    p.vy = 0;
                    p.isGrounded = true;
                }
            }
            
            // Player limits
            if (p.x < -400) p.x = -400;
            if (p.x > 1400) p.x = 1400;
            if (p.y > 1000) { p.y = 100; p.hp -= 20; } // Fall off map
            
            if (p.attackTimer > 0) p.attackTimer--;
            if (p.invincibleTimer > 0) p.invincibleTimer--;
            
            if (p.hp <= 0) {
                this.texts.push({ x: p.x + p.w/2, y: p.y, text: 'GAME OVER', life: 100, dy: -1, color: '#ff0000' });
                p.hp = p.maxHp; p.x = 100; p.y = 300; // revive
            }
            
            // Mobs
            if (Math.random() < 0.02 && this.mobs.length < 8) this.spawnMob();
            
            for (const m of this.mobs) {
                if (m.damageTimer > 0) m.damageTimer--;
                m.vy += GRAVITY;
                m.x += m.vx;
                m.y += m.vy;
                m.isGrounded = false;
                
                for (const plat of this.platforms) {
                    if (m.vy >= 0 && m.y + m.h - m.vy <= plat.y && m.y + m.h >= plat.y && m.x + m.w > plat.x && m.x < plat.x + plat.w) {
                        m.y = plat.y - m.h;
                        m.vy = 0;
                        m.isGrounded = true;
                        if (m.x < plat.x || m.x + m.w > plat.x + plat.w) m.vx *= -1; // turn around at edges
                    }
                }
                
                // Mob logic
                if (m.isGrounded && Math.random() < 0.01) m.vx *= -1;
                if (m.x < -400) m.vx = Math.abs(m.vx);
                if (m.x > 1400) m.vx = -Math.abs(m.vx);
                
                // Collision with player
                if (p.invincibleTimer === 0 && m.hp > 0 && this._checkAABB(p, m)) {
                    p.hp -= m.atk;
                    p.invincibleTimer = 60;
                    p.vx = (p.x < m.x ? -1 : 1) * 8;
                    p.vy = -5;
                    this.texts.push({ x: p.x + p.w/2, y: p.y, text: m.atk, life: 40, dy: -2, color: '#ff0000' });
                }
            }
            
            // Texts
            for (let i = this.texts.length - 1; i >= 0; i--) {
                const t = this.texts[i];
                t.y += t.dy;
                t.life--;
                if (t.life <= 0) this.texts.splice(i, 1);
            }
            
            // Camera follow
            this.camera.x += (p.x - this.W/2 - this.camera.x) * 0.1;
            this.camera.y += (p.y - this.H/2 - this.camera.y) * 0.1;
        },
        
        _draw() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.W, this.H);
            
            ctx.save();
            ctx.translate(-this.camera.x, -this.camera.y);
            
            // Draw background elements (parallax)
            ctx.fillStyle = '#E0F6FF';
            ctx.fillRect(this.camera.x, this.camera.y, this.W, this.H);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath(); ctx.arc(this.camera.x + 200, this.camera.y + 100, 50, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(this.camera.x + 250, this.camera.y + 120, 60, 0, Math.PI*2); ctx.fill();
            
            // Platforms
            ctx.fillStyle = '#654321'; // Dirt
            for (const plat of this.platforms) {
                ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
                ctx.fillStyle = '#228B22'; // Grass top
                ctx.fillRect(plat.x, plat.y, plat.w, 8);
                ctx.fillStyle = '#654321';
            }
            
            // Mobs
            for (const m of this.mobs) {
                ctx.fillStyle = m.damageTimer > 0 ? '#ff0000' : m.color;
                // Draw rounded rect or shape for mob
                ctx.beginPath();
                ctx.arc(m.x + m.w/2, m.y + m.h/2 + 4, m.w/2, Math.PI, 0); // top half
                ctx.lineTo(m.x + m.w, m.y + m.h); // right to bottom
                ctx.lineTo(m.x, m.y + m.h); // bottom to left
                ctx.closePath();
                ctx.fill();
                
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(m.x + (m.vx > 0 ? 20 : 6), m.y + m.h/2 - 2, 4, 4);
                
                // HP bar
                ctx.fillStyle = '#000'; ctx.fillRect(m.x, m.y - 10, m.w, 4);
                ctx.fillStyle = '#f00'; ctx.fillRect(m.x, m.y - 10, m.w * (m.hp/m.maxHp), 4);
            }
            
            // Player
            const p = this.player;
            if (p.invincibleTimer % 10 < 5) {
                // Body
                ctx.fillStyle = '#4169E1'; // Blue shirt
                ctx.fillRect(p.x + 4, p.y + 20, p.w - 8, 20);
                // Head
                ctx.fillStyle = '#FFE4C4'; // Skin
                ctx.fillRect(p.x, p.y, p.w, 20);
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(p.x + (p.facing > 0 ? 20 : 8), p.y + 8, 4, 4);
                // Weapon
                ctx.fillStyle = '#A9A9A9';
                if (p.attackTimer > 10) { // swinging
                    if (p.facing > 0) {
                        ctx.fillRect(p.x + p.w, p.y + 10, 30, 4);
                        ctx.fillStyle = 'rgba(255,255,0,0.5)'; // slash effect
                        ctx.beginPath(); ctx.arc(p.x + p.w, p.y + 20, 40, -Math.PI/2, 0); ctx.lineTo(p.x+p.w, p.y+20); ctx.fill();
                    } else {
                        ctx.fillRect(p.x - 30, p.y + 10, 30, 4);
                        ctx.fillStyle = 'rgba(255,255,0,0.5)';
                        ctx.beginPath(); ctx.arc(p.x, p.y + 20, 40, Math.PI, Math.PI*1.5); ctx.lineTo(p.x, p.y+20); ctx.fill();
                    }
                } else { // idle
                    if (p.facing > 0) ctx.fillRect(p.x + p.w - 10, p.y + 15, 4, 25);
                    else ctx.fillRect(p.x + 6, p.y + 15, 4, 25);
                }
            }
            
            // Texts
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px "Arial Black", sans-serif';
            for (const t of this.texts) {
                ctx.fillStyle = '#000';
                ctx.fillText(t.text, t.x + 2, t.y + 2); // shadow
                ctx.fillStyle = t.color;
                ctx.fillText(t.text, t.x, t.y);
            }
            
            ctx.restore();
            
            // UI
            // HP Bar
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(10, 10, 200, 20);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(12, 12, 196 * (Math.max(0, p.hp) / p.maxHp), 16);
            ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(`HP: ${p.hp} / ${p.maxHp}`, 110, 25);
            
            // EXP Bar
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(10, 35, 200, 10);
            ctx.fillStyle = '#ffcc00'; ctx.fillRect(12, 36, 196 * (p.exp / p.maxExp), 8);
            
            // Level & Stats
            ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = 'bold 16px sans-serif';
            ctx.fillText(`Lv. ${p.level}`, 10, 65);
            ctx.font = '14px sans-serif';
            ctx.fillText(`ATK: ${p.atk}`, 10, 85);
            
            // Controls
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(this.W - 220, 10, 210, 70);
            ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
            ctx.fillText('← → : Move', this.W - 20, 30);
            ctx.fillText('Space / Alt : Jump', this.W - 20, 50);
            ctx.fillText('Z / Ctrl : Attack', this.W - 20, 70);
        },
        
        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animId);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup', this._onKeyUp);
            if (this.overlay) this.overlay.remove();
        }
    }
,
visualNovel: {
        overlay: null, container: null, isPlaying: false,
        state: { aff: 0, fri: 0, bf: 0, scene: 0, msgIndex: 0, mode: 'dialogue' },
        cg: {
            protag: 'images/vn_char_protag.jpg',
            siwoo: 'images/vn_char_siwoo.png'
        },
        script: [
            // SCENE 0: 교실 (낮)
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: '', name: '나 (독백)', text: '수업이 끝난 교실. 늘 그렇듯 시우와 나, 단둘이 남았다.' },
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: '', name: '나 (독백)', text: '어릴 적부터 붙어 다닌 불알친구. 하지만 요즘 들어 이 녀석이 자꾸 신경 쓰인다.' },
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: 'siwoo', name: '시우', text: '야, 멍 때리지 말고 수학 노트나 빌려줘. 나 필기 하나도 안 했단 말이야.' },
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: 'protag', name: '나', text: '어휴, 넌 나 없으면 어쩌려고 그러냐?' },
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: 'siwoo', name: '시우', text: '그러니까 평생 내 옆에 딱 붙어있어야지. 딴 놈한테 가지 말고.' },
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: '', name: '나 (독백)', text: '심장이 쿵 내려앉았다. 쟤는 꼭 아무렇지 않게 저런 말을 한단 말이지.' },
            { bg: 'url(images/bg_classroom_1782693441002.png)', char: '', name: '나 (독백)', text: '어떻게 반응해야 할까?' },
            {
                bg: 'url(images/bg_classroom_1782693441002.png)', choices: [
                    { text: '뭐, 뭐래! 징그럽게...', nextScene: 1, aff: 0 },
                    { text: '그래, 평생 내가 책임져줄게.', nextScene: 1, aff: +20 }
                ]
            }
        ],
        dialogueScripts: {
            1: [
                // SCENE 1: 하굣길 거리 (노을)
                { bg: 'url(images/bg_street_1782693449320.png)', char: '', name: '나 (독백)', text: '하굣길. 해가 뉘엿뉘엿 지고 있다. 우리는 아이스크림을 하나씩 물고 길을 걷고 있다.' },
                { bg: 'url(images/bg_street_1782693449320.png)', char: 'siwoo', name: '시우', text: '아 맞다. 너 이번 주말에 약속 있어?' },
                { bg: 'url(images/bg_street_1782693449320.png)', char: 'protag', name: '나', text: '주말? 딱히 없는데. 왜?' },
                { bg: 'url(images/bg_street_1782693449320.png)', char: 'siwoo', name: '시우', text: '그럼 나랑 시내 새로 생긴 카페 가자. 거기 케이크가 그렇게 맛있다며.' },
                { bg: 'url(images/bg_street_1782693449320.png)', char: '', name: '나 (독백)', text: '시우가 내 입가에 묻은 아이스크림을 자연스럽게 손가락으로 닦아낸다.' },
                { bg: 'url(images/bg_street_1782693449320.png)', char: 'siwoo', name: '시우', text: '칠칠맞긴. 애기냐?' },
                { bg: 'url(images/bg_street_1782693449320.png)', char: '', name: '나 (독백)', text: '얼굴이 화끈거린다. 단둘이 주말에 카페라니... 이거 데이트 신청 아니야?' },
                {
                    bg: 'url(images/bg_street_1782693449320.png)', choices: [
                        { text: '어? 어, 그래... 같이 가자.', nextScene: 2, aff: +10 },
                        { text: '케이크 쏘는 거지? 당근 가야지!', nextScene: 2, aff: 0 }
                    ]
                }
            ],
            2: [
                // SCENE 2: 카페 (주말)
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: '', name: '나 (독백)', text: '주말 오후, 카페 앞. 평소 교복 차림만 보다가 사복을 입은 시우를 보니 왠지 낯설고 설렌다.' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: 'siwoo', name: '시우', text: '야! 늦어서 미안. 오래 기다렸어?' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: 'protag', name: '나', text: '아니, 방금 왔어. 근데 너... 오늘 좀 멀끔하다?' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: 'siwoo', name: '시우', text: '아 뭐래. 맨날 보던 얼굴인데. 가자, 내가 케이크 사줄게.' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: '', name: '나 (독백)', text: '카페에 마주 앉아 조각 케이크를 먹는다. 시우가 나를 빤히 쳐다보고 있다.' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: 'siwoo', name: '시우', text: '너 오늘... 좀 예쁘네.' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: 'protag', name: '나', text: '쿨럭! (먹던 커피를 뿜을 뻔했다)' },
                { bg: 'url(images/bg_cafe_1782693458325.png)', char: 'siwoo', name: '시우', text: '왜 놀라고 그래. 예쁜 걸 예쁘다고 한 건데.' },
                {
                    bg: 'url(images/bg_cafe_1782693458325.png)', choices: [
                        { text: '너, 너 뭐 잘못 먹었어?', nextScene: 3, aff: 0 },
                        { text: '(얼굴을 붉히며) ...고마워.', nextScene: 3, aff: +20 }
                    ]
                }
            ],
            3: [
                // SCENE 3: 공원 (고백)
                { bg: 'url(images/bg_park_1782693472786.png)', char: '', name: '나 (독백)', text: '카페에서 나와 근처 공원을 걷는다. 벚꽃이 흩날리는 벤치에 나란히 앉았다.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'siwoo', name: '시우', text: '있잖아. 나 너한테 할 말 있어.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'protag', name: '나', text: '무슨 말인데?' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'siwoo', name: '시우', text: '우리, 이제 소꿉친구 그만할까?' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: '', name: '나 (독백)', text: '순간 숨이 멎는 줄 알았다. 시우의 눈빛이 장난기 하나 없이 진지하다.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'siwoo', name: '시우', text: '나, 너 좋아해. 아주 오래 전부터.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: '', name: '나 (독백)', text: '드디어 올 것이 왔다. 내 마음을 전할 차례다.' },
                {
                    bg: 'url(images/bg_park_1782693472786.png)', 
                    choices: [
                        { text: '나도... 나도 너 좋아했어. 계속.', nextScene: 4 },
                        { text: '장난치지 마. 우린 그냥 친구잖아.', nextScene: 5 }
                    ]
                }
            ],
            4: [
                // 엔딩 1 (연인)
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'siwoo', name: '시우', text: '정말? 하아... 다행이다. 나 진짜 많이 떨었단 말이야.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: '', name: '시우', text: '이제 내 여자친구 맞지? 잘 부탁해. (손을 꽉 잡는다)' },
                { isEpilogue: true, cgColor: '#ffb6c1', text: '[엔딩 1: 그날부터 1일]\n오랜 소꿉친구였던 우리는, 이제 가장 가까운 연인이 되었습니다.' },
                { isEpilogue: true, cgColor: '#ffb6c1', text: '[True Ending: 영원한 약속]\n그리고 시간이 흘러, 두 사람은 많은 사람들의 축복 속에서 영원을 약속합니다.' }
            ],
            5: [
                // 엔딩 2 (절친)
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'protag', name: '나', text: '무슨 소리야. 우린 평생 절친이잖아. 그런 농담 재미없어.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: 'siwoo', name: '시우', text: '...그래. 하하, 넌 진짜 눈치 없다. 장난친 건데.' },
                { bg: 'url(images/bg_park_1782693472786.png)', char: '', name: '나 (독백)', text: '씁쓸하게 웃는 시우의 표정을 애써 모른 척했다. 나는 이 관계가 깨지는 게 너무나 두려웠으니까.' },
                { isEpilogue: true, cgColor: '#e8f5e9', text: '[엔딩 2: 평생의 소꿉친구]\n우리는 선을 넘지 않은 채, 영원히 곁을 지키는 가장 친한 친구로 남았습니다.' }
            ]
        },
        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay; this.container = gameContainer;
            
            this.container.innerHTML = `
                <div id="vn-bg" style="position:absolute;width:100%;height:100%;background-color:#ffe4e1;transition:background 0.5s;"></div>
                <div id="vn-char-container" style="position:absolute;width:100%;height:100%;display:flex;justify-content:center;align-items:flex-end;pointer-events:none;">
                    <img id="vn-char-protag" src="${this.cg.protag}" style="height:85%;display:none;position:absolute;bottom:140px;left:5%;object-fit:contain;filter:drop-shadow(2px 4px 8px rgba(0,0,0,0.5));mix-blend-mode:multiply;transition:opacity 0.3s;">
                    <img id="vn-char-siwoo" src="${this.cg.siwoo}" style="height:85%;display:none;position:absolute;bottom:140px;right:5%;object-fit:contain;filter:drop-shadow(2px 4px 8px rgba(0,0,0,0.5));mix-blend-mode:multiply;transition:opacity 0.3s;">
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
            this.charSiwoo = this.container.querySelector('#vn-char-siwoo');
            
            this.container.querySelector('#vn-x-btn').onclick = () => this.close();
            this.container.querySelector('#vn-close-btn').onclick = () => this.close();
            this.dialogueBox.onclick = () => this._nextMessage();
            
            this.state = { aff: 0, fri: 0, bf: 0, scene: 0, msgIndex: 0, mode: 'dialogue', currentScript: this.script };
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
                
                let contentHTML = '';
                // Text only
                contentHTML += `<h1 style="color:#fff;text-shadow:2px 2px 4px #000;font-size:24px;line-height:1.6;background:rgba(0,0,0,0.5);padding:20px;border-radius:15px;margin:0;">${msg.text}</h1>`;
                
                if (this.state.msgIndex === this.state.currentScript.length - 1) {
                    contentHTML += `<button id="vn-close-btn" style="margin-top:20px;padding:15px 30px;font-size:18px;background:#fff;color:#000;border:none;border-radius:25px;cursor:pointer;font-weight:bold;display:none;">게임 종료</button>`;
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

            if (msg.bg && msg.bg.startsWith('url(')) {
                this.bgEl.style.backgroundImage = msg.bg;
                this.bgEl.style.backgroundSize = 'cover';
                this.bgEl.style.backgroundPosition = 'center';
                this.bgEl.style.backgroundColor = 'transparent';
            } else {
                this.bgEl.style.backgroundImage = 'none';
                this.bgEl.style.backgroundColor = msg.bg || '#ffe4e1';
            }
            this.nameEl.innerText = msg.name || '';
            this.textEl.innerText = msg.text || '';
            
            // Character display logic
            if (this.charProtag) this.charProtag.style.display = (msg.char === 'protag' || msg.char === 'both') ? 'block' : 'none';
            if (this.charSiwoo) this.charSiwoo.style.display = (msg.char === 'siwoo' || msg.char === 'both') ? 'block' : 'none';
            if (msg.char === 'both') {
                this.charProtag.style.display = 'block';
                this.charSiwoo.style.display = 'block';
            }
        },

        _nextMessage() {
            // guard: if we're past the script, do nothing
            if (!this.state.currentScript || this.state.msgIndex >= this.state.currentScript.length - 1) {
                if (this.state.mode !== 'choice') return;
            }
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

,
looterShooter: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 800, H: 600, keys: {}, mouse: { x: 400, y: 300, down: false },
        lastTime: 0, spawnTimer: 0, shootTimer: 0, killCount: 0, wave: 1,

        weapons: [
            { name: "기본 권총 (Common)", color: "#bbbbbb", atk: 10, cd: 400, speed: 8, radius: 3, mult: 1 },
            { name: "기관단총 (Rare)", color: "#007acc", atk: 15, cd: 150, speed: 10, radius: 4, mult: 1 },
            { name: "돌격소총 (Epic)", color: "#a335ee", atk: 35, cd: 200, speed: 12, radius: 5, mult: 1 },
            { name: "산탄총 (Legendary)", color: "#ff8000", atk: 50, cd: 600, speed: 10, radius: 4, mult: 5 } // 5 spread shots
        ],

        player: { x: 400, y: 300, vx: 0, vy: 0, speed: 4, hp: 100, maxHp: 100, radius: 15, weaponTier: 0 },
        enemies: [], bullets: [], loots: [], dmgTexts: [],

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay; this.container = gameContainer;
            this.container.style.backgroundColor = '#111';
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W; this.canvas.height = this.H;
            this.canvas.style.cssText = 'background:#1a1a2e;border:4px solid #333;border-radius:10px;cursor:crosshair;';
            this.container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            const xBtn = document.createElement('button');
            xBtn.innerText = '✕';
            xBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:36px;height:36px;background:rgba(255,255,255,0.2);color:#fff;border:none;border-radius:18px;cursor:pointer;font-size:20px;z-index:10;';
            xBtn.onclick = () => this.close();
            this.container.appendChild(xBtn);

            this._bindEvents();
            this.isPlaying = true;
            this._reset();
            this.lastTime = performance.now();
            this.animId = requestAnimationFrame(t => this._loop(t));
        },

        _reset() {
            this.player = { x: this.W/2, y: this.H/2, speed: 4, hp: 100, maxHp: 100, radius: 15, weaponTier: 0 };
            this.enemies = []; this.bullets = []; this.loots = []; this.dmgTexts = [];
            this.killCount = 0; this.wave = 1; this.keys = {}; this.mouse.down = false;
        },

        _bindEvents() {
            this._onKeyDown = e => this.keys[e.key.toLowerCase()] = true;
            this._onKeyUp = e => this.keys[e.key.toLowerCase()] = false;
            
            this._onMouseMove = e => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
                this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
            };
            this._onMouseDown = () => this.mouse.down = true;
            this._onMouseUp = () => this.mouse.down = false;

            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup', this._onKeyUp);
            this.canvas.addEventListener('mousemove', this._onMouseMove);
            this.canvas.addEventListener('mousedown', this._onMouseDown);
            this.canvas.addEventListener('mouseup', this._onMouseUp);
        },

        _loop(timestamp) {
            if (!this.isPlaying) return;
            const dt = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this._update(dt);
            this._draw();
            this.animId = requestAnimationFrame(t => this._loop(t));
        },

        _update(dt) {
            if (this.player.hp <= 0) return; // Dead

            const wpn = this.weapons[this.player.weaponTier];

            // Player Movement
            let dx = 0, dy = 0;
            if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
            if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
            if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
            if (this.keys['d'] || this.keys['arrowright']) dx += 1;
            
            if (dx !== 0 || dy !== 0) {
                const len = Math.hypot(dx, dy);
                this.player.x += (dx / len) * this.player.speed;
                this.player.y += (dy / len) * this.player.speed;
                // Boundaries
                this.player.x = Math.max(this.player.radius, Math.min(this.W - this.player.radius, this.player.x));
                this.player.y = Math.max(this.player.radius, Math.min(this.H - this.player.radius, this.player.y));
            }

            // Shooting
            this.shootTimer += dt;
            if (this.mouse.down && this.shootTimer >= wpn.cd) {
                this.shootTimer = 0;
                const angle = Math.atan2(this.mouse.y - this.player.y, this.mouse.x - this.player.x);
                
                if (wpn.mult === 1) {
                    this.bullets.push({
                        x: this.player.x, y: this.player.y,
                        vx: Math.cos(angle) * wpn.speed, vy: Math.sin(angle) * wpn.speed,
                        radius: wpn.radius, dmg: wpn.atk, color: wpn.color, life: 100
                    });
                } else {
                    for(let i=0; i<wpn.mult; i++) {
                        const spread = angle - 0.3 + (0.6 * i / (wpn.mult-1)); // spread fan
                        this.bullets.push({
                            x: this.player.x, y: this.player.y,
                            vx: Math.cos(spread) * wpn.speed, vy: Math.sin(spread) * wpn.speed,
                            radius: wpn.radius, dmg: wpn.atk, color: wpn.color, life: 60
                        });
                    }
                }
            }

            // Spawning Enemies
            this.spawnTimer += dt;
            const spawnRate = Math.max(500, 2000 - this.killCount * 20); // Faster over time
            if (this.spawnTimer > spawnRate) {
                this.spawnTimer = 0;
                let ex, ey;
                if (Math.random() < 0.5) {
                    ex = Math.random() < 0.5 ? -30 : this.W + 30;
                    ey = Math.random() * this.H;
                } else {
                    ex = Math.random() * this.W;
                    ey = Math.random() < 0.5 ? -30 : this.H + 30;
                }
                const isElite = Math.random() < (0.05 + this.wave * 0.01);
                this.enemies.push({
                    x: ex, y: ey,
                    hp: isElite ? 100 + this.wave * 50 : 20 + this.wave * 5,
                    maxHp: isElite ? 100 + this.wave * 50 : 20 + this.wave * 5,
                    radius: isElite ? 20 : 12,
                    speed: isElite ? 1.5 : 2 + Math.random(),
                    isElite: isElite
                });
            }

            // Update Bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                b.x += b.vx; b.y += b.vy; b.life--;
                if (b.x < 0 || b.x > this.W || b.y < 0 || b.y > this.H || b.life <= 0) {
                    this.bullets.splice(i, 1);
                }
            }

            // Update Enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                e.x += Math.cos(angle) * e.speed;
                e.y += Math.sin(angle) * e.speed;

                // Player Collision
                const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < this.player.radius + e.radius) {
                    this.player.hp -= e.isElite ? 1 : 0.2;
                    // Bounce off
                    e.x -= Math.cos(angle) * 10;
                    e.y -= Math.sin(angle) * 10;
                }

                // Bullet Collision
                for (let j = this.bullets.length - 1; j >= 0; j--) {
                    const b = this.bullets[j];
                    const bDist = Math.hypot(b.x - e.x, b.y - e.y);
                    if (bDist < b.radius + e.radius) {
                        e.hp -= b.dmg;
                        this.bullets.splice(j, 1);
                        this.dmgTexts.push({ x: e.x, y: e.y - 10, text: b.dmg, life: 30, color: '#fff' });
                        if (e.hp <= 0) {
                            this.killCount++;
                            this.wave = Math.floor(this.killCount / 20) + 1;
                            
                            // Loot drop logic
                            let dropChance = e.isElite ? 1.0 : 0.05;
                            if (Math.random() < dropChance) {
                                let tier = 0;
                                const roll = Math.random();
                                if (roll < 0.05 || (e.isElite && roll < 0.3)) tier = 3; // Legendary
                                else if (roll < 0.2 || (e.isElite && roll < 0.8)) tier = 2; // Epic
                                else if (roll < 0.6) tier = 1; // Rare
                                
                                this.loots.push({ x: e.x, y: e.y, tier: tier, life: 600 });
                            }
                            this.enemies.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            // Update Loots
            for (let i = this.loots.length - 1; i >= 0; i--) {
                const l = this.loots[i];
                l.life--;
                if (l.life <= 0) { this.loots.splice(i, 1); continue; }
                
                const dist = Math.hypot(this.player.x - l.x, this.player.y - l.y);
                if (dist < this.player.radius + 15) { // Pick up
                    if (l.tier > this.player.weaponTier || (l.tier === this.player.weaponTier && this.player.hp < this.player.maxHp)) {
                        this.player.weaponTier = Math.max(this.player.weaponTier, l.tier);
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20); // Heal on pickup
                        this.dmgTexts.push({ x: this.player.x, y: this.player.y - 20, text: "WEAPON UP!", life: 60, color: this.weapons[l.tier].color });
                    }
                    this.loots.splice(i, 1);
                }
            }

            // Update Dmg Texts
            for (let i = this.dmgTexts.length - 1; i >= 0; i--) {
                this.dmgTexts[i].y -= 1;
                this.dmgTexts[i].life--;
                if (this.dmgTexts[i].life <= 0) this.dmgTexts.splice(i, 1);
            }
        },

        _draw() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.W, this.H);

            if (this.player.hp <= 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,this.W,this.H);
                ctx.fillStyle = '#ff3333'; ctx.textAlign = 'center'; ctx.font = 'bold 40px sans-serif';
                ctx.fillText('GAME OVER', this.W/2, this.H/2);
                ctx.font = '20px sans-serif'; ctx.fillStyle = '#fff';
                ctx.fillText(`Kills: ${this.killCount}  (Wave ${this.wave})`, this.W/2, this.H/2 + 40);
                
                // Draw restart button
                ctx.fillStyle = '#444'; ctx.fillRect(this.W/2 - 60, this.H/2 + 70, 120, 40);
                ctx.fillStyle = '#fff'; ctx.fillText('Restart', this.W/2, this.H/2 + 97);
                
                // Simple restart click handler via mouse
                if (this.mouse.down && this.mouse.x > this.W/2 - 60 && this.mouse.x < this.W/2 + 60 && this.mouse.y > this.H/2 + 70 && this.mouse.y < this.H/2 + 110) {
                    this._reset();
                }
                return;
            }

            // Grid Background
            ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
            for(let i=0; i<this.W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,this.H); ctx.stroke(); }
            for(let i=0; i<this.H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(this.W,i); ctx.stroke(); }

            // Loots
            this.loots.forEach(l => {
                const w = this.weapons[l.tier];
                ctx.shadowBlur = 10; ctx.shadowColor = w.color;
                ctx.fillStyle = w.color;
                ctx.beginPath(); ctx.arc(l.x, l.y, 8 + Math.sin(l.life/10)*2, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Enemies
            this.enemies.forEach(e => {
                ctx.fillStyle = e.isElite ? '#ff3366' : '#88ff88';
                ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
                
                // Enemy HP bar
                ctx.fillStyle = '#000'; ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, e.radius*2, 4);
                ctx.fillStyle = '#f00'; ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, (e.radius*2) * (e.hp/e.maxHp), 4);
            });

            // Bullets
            this.bullets.forEach(b => {
                ctx.fillStyle = b.color;
                ctx.shadowBlur = 5; ctx.shadowColor = b.color;
                ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Player
            ctx.fillStyle = '#00ccff';
            ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI*2); ctx.fill();
            
            // Aim line
            ctx.strokeStyle = 'rgba(0, 204, 255, 0.3)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(this.mouse.x, this.mouse.y); ctx.stroke();

            // Damage Texts
            ctx.textAlign = 'center'; ctx.font = 'bold 16px sans-serif';
            this.dmgTexts.forEach(d => {
                ctx.fillStyle = d.color;
                ctx.globalAlpha = d.life / 30;
                ctx.fillText(d.text, d.x, d.y);
                ctx.globalAlpha = 1.0;
            });

            // UI
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(10, 10, 250, 80);
            
            // HP Bar
            ctx.fillStyle = '#444'; ctx.fillRect(20, 20, 230, 15);
            ctx.fillStyle = '#00ffcc'; ctx.fillRect(22, 22, 226 * Math.max(0, this.player.hp / this.player.maxHp), 11);
            
            ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '14px sans-serif';
            ctx.fillText(`HP: ${Math.floor(this.player.hp)} / ${this.player.maxHp}`, 25, 33);
            ctx.fillText(`Wave: ${this.wave} | Kills: ${this.killCount}`, 20, 55);
            
            const curWpn = this.weapons[this.player.weaponTier];
            ctx.fillStyle = curWpn.color; ctx.font = 'bold 16px sans-serif';
            ctx.fillText(`장착: ${curWpn.name}`, 20, 78);
        },

        close() {
            this.isPlaying = false;
            cancelAnimationFrame(this.animId);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup', this._onKeyUp);
            this.canvas.removeEventListener('mousemove', this._onMouseMove);
            this.canvas.removeEventListener('mousedown', this._onMouseDown);
            this.canvas.removeEventListener('mouseup', this._onMouseUp);
            if (this.overlay) this.overlay.remove();
        }
    }

,
extractionShooter: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 900, H: 600,
        MAPW: 2000, MAPH: 2000,
        keys: {}, mouse: { x: 0, y: 0, down: false },
        lastTime: 0, animId: null,

        // Camera
        cam: { x: 0, y: 0 },

        // Game State
        state: 'playing', // 'playing', 'extracting', 'extracted', 'dead'
        extractTimer: 0,
        EXTRACT_TIME: 4000, // 4 seconds to extract
        stageTimer: 0, // how long in match
        STAGE_DURATION: 90000, // 90 seconds total

        // Player
        player: null,

        // Game Objects
        enemies: [], bullets: [], loot: [], walls: [],
        extractZone: null,

        LOOT_TYPES: [
            { name: "의약품", color: "#00ff88", value: 50, size: 10, icon: "+" },
            { name: "탄약", color: "#ffff00", value: 30, size: 8, icon: "•" },
            { name: "부품", color: "#aaaaff", value: 100, size: 10, icon: "⚙" },
            { name: "골드바", color: "#ffd700", value: 300, size: 12, icon: "$" },
            { name: "레어 유물", color: "#ff44ff", value: 500, size: 14, icon: "★" },
        ],

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            this.container = gameContainer;
            this.container.style.background = '#0a0a0a';

            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.cssText = 'display:block;cursor:crosshair;border-radius:8px;';
            this.container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            // Close button
            const xBtn = document.createElement('button');
            xBtn.innerText = '✕';
            xBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:36px;height:36px;background:rgba(255,80,80,0.8);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:18px;z-index:100;font-weight:bold;';
            xBtn.onclick = () => this.close();
            this.container.appendChild(xBtn);

            this._bindEvents();
            this._startRound();
        },

        _startRound() {
            this.state = 'playing';
            this.extractTimer = 0;
            this.stageTimer = 0;
            this.enemies = [];
            this.bullets = [];
            this.loot = [];
            this.walls = [];

            // Player
            this.player = {
                x: 200, y: 200,
                radius: 14, speed: 3.5,
                hp: 100, maxHp: 100,
                ammo: 30, maxAmmo: 30,
                bag: [], // collected loot
                shootCd: 0, SHOOT_CD: 250,
                angle: 0,
            };

            // Generate walls (obstacles)
            const wallDefs = [
                { x: 300, y: 100, w: 20, h: 200 },
                { x: 500, y: 300, w: 200, h: 20 },
                { x: 800, y: 150, w: 20, h: 300 },
                { x: 1000, y: 500, w: 300, h: 20 },
                { x: 200, y: 600, w: 20, h: 250 },
                { x: 400, y: 800, w: 200, h: 20 },
                { x: 700, y: 700, w: 20, h: 200 },
                { x: 900, y: 900, w: 250, h: 20 },
                { x: 1200, y: 200, w: 20, h: 300 },
                { x: 1400, y: 600, w: 200, h: 20 },
                { x: 1500, y: 300, w: 20, h: 200 },
                { x: 1700, y: 800, w: 20, h: 300 },
                { x: 600, y: 1200, w: 300, h: 20 },
                { x: 1000, y: 1300, w: 20, h: 250 },
                { x: 1300, y: 1000, w: 250, h: 20 },
                { x: 100, y: 1400, w: 200, h: 20 },
                { x: 1600, y: 1400, w: 20, h: 300 },
                { x: 400, y: 1600, w: 300, h: 20 },
                { x: 1800, y: 400, w: 20, h: 300 },
                { x: 800, y: 1700, w: 20, h: 200 },
            ];
            this.walls = wallDefs;

            // Scatter loot across map
            for (let i = 0; i < 40; i++) {
                const type = this.LOOT_TYPES[Math.floor(Math.random() * this.LOOT_TYPES.length)];
                this.loot.push({
                    x: 150 + Math.random() * (this.MAPW - 300),
                    y: 150 + Math.random() * (this.MAPH - 300),
                    ...type,
                    id: i,
                });
            }

            // Spawn enemy AI guards
            for (let i = 0; i < 15; i++) {
                this.enemies.push({
                    x: 400 + Math.random() * (this.MAPW - 500),
                    y: 400 + Math.random() * (this.MAPH - 500),
                    radius: 14, speed: 1.8,
                    hp: 60, maxHp: 60,
                    shootCd: 0, SHOOT_CD: 1500 + Math.random() * 1000,
                    alert: false, alertTimer: 0,
                    patrolAngle: Math.random() * Math.PI * 2,
                    angle: 0,
                });
            }

            // Extraction zone (far from spawn)
            this.extractZone = {
                x: this.MAPW - 250,
                y: this.MAPH - 250,
                radius: 60,
            };

            this.isPlaying = true;
            this.lastTime = performance.now();
            if (this.animId) cancelAnimationFrame(this.animId);
            this.animId = requestAnimationFrame(t => this._loop(t));
        },

        _bindEvents() {
            this._onKeyDown = e => { this.keys[e.key.toLowerCase()] = true; e.preventDefault(); };
            this._onKeyUp = e => { this.keys[e.key.toLowerCase()] = false; };
            this._onMouseMove = e => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
                this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
            };
            this._onMouseDown = e => { if (e.button === 0) this.mouse.down = true; };
            this._onMouseUp = e => { if (e.button === 0) this.mouse.down = false; };

            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup', this._onKeyUp);
            this.canvas.addEventListener('mousemove', this._onMouseMove);
            this.canvas.addEventListener('mousedown', this._onMouseDown);
            this.canvas.addEventListener('mouseup', this._onMouseUp);
        },

        _loop(timestamp) {
            if (!this.isPlaying) return;
            const dt = Math.min(timestamp - this.lastTime, 50);
            this.lastTime = timestamp;
            this._update(dt);
            this._draw();
            this.animId = requestAnimationFrame(t => this._loop(t));
        },

        _rectCircle(rx, ry, rw, rh, cx, cy, cr) {
            const nearX = Math.max(rx, Math.min(rx + rw, cx));
            const nearY = Math.max(ry, Math.min(ry + rh, cy));
            return Math.hypot(cx - nearX, cy - nearY) < cr;
        },

        _wallCollide(x, y, r) {
            // Map boundaries
            if (x < r || x > this.MAPW - r || y < r || y > this.MAPH - r) return true;
            for (const w of this.walls) {
                if (this._rectCircle(w.x, w.y, w.w, w.h, x, y, r)) return true;
            }
            return false;
        },

        _update(dt) {
            if (this.state === 'dead' || this.state === 'extracted') return;

            const p = this.player;
            this.stageTimer += dt;

            // Movement
            let dx = 0, dy = 0;
            if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
            if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
            if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
            if (this.keys['d'] || this.keys['arrowright']) dx += 1;

            if (dx !== 0 || dy !== 0) {
                const len = Math.hypot(dx, dy);
                const nx = p.x + (dx / len) * p.speed;
                const ny = p.y + (dy / len) * p.speed;
                if (!this._wallCollide(nx, p.y, p.radius)) p.x = nx;
                if (!this._wallCollide(p.x, ny, p.radius)) p.y = ny;
            }

            // Player aim angle
            const wx = p.x - this.cam.x;
            const wy = p.y - this.cam.y;
            p.angle = Math.atan2(this.mouse.y - wy, this.mouse.x - wx);

            // Camera follow
            this.cam.x = Math.max(0, Math.min(this.MAPW - this.W, p.x - this.W / 2));
            this.cam.y = Math.max(0, Math.min(this.MAPH - this.H, p.y - this.H / 2));

            // Shooting
            p.shootCd = Math.max(0, p.shootCd - dt);
            if (this.mouse.down && p.shootCd <= 0 && p.ammo > 0) {
                p.shootCd = p.SHOOT_CD;
                p.ammo--;
                const spd = 12;
                this.bullets.push({
                    x: p.x, y: p.y,
                    vx: Math.cos(p.angle) * spd,
                    vy: Math.sin(p.angle) * spd,
                    life: 80, fromPlayer: true, dmg: 35, radius: 4,
                });
            }
            // Reload with R
            if (this.keys['r'] && p.ammo < p.maxAmmo) {
                p.ammo = p.maxAmmo;
                this.keys['r'] = false;
            }

            // Loot pickup (auto when close)
            for (let i = this.loot.length - 1; i >= 0; i--) {
                const l = this.loot[i];
                if (Math.hypot(p.x - l.x, p.y - l.y) < p.radius + l.size + 5) {
                    p.bag.push(l);
                    this.loot.splice(i, 1);
                }
            }

            // Extraction zone check
            const distToExtract = Math.hypot(p.x - this.extractZone.x, p.y - this.extractZone.y);
            if (distToExtract < this.extractZone.radius) {
                this.state = 'extracting';
                this.extractTimer += dt;
                if (this.extractTimer >= this.EXTRACT_TIME) {
                    this.state = 'extracted';
                    return;
                }
            } else {
                if (this.state === 'extracting') this.state = 'playing';
                this.extractTimer = Math.max(0, this.extractTimer - dt * 2);
            }

            // Update bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                b.x += b.vx; b.y += b.vy; b.life--;
                if (b.life <= 0 || this._wallCollide(b.x, b.y, b.radius)) {
                    this.bullets.splice(i, 1); continue;
                }
                // Player hit by enemy bullet
                if (!b.fromPlayer) {
                    if (Math.hypot(b.x - p.x, b.y - p.y) < p.radius + b.radius) {
                        p.hp -= b.dmg;
                        this.bullets.splice(i, 1);
                        if (p.hp <= 0) { this.state = 'dead'; }
                    }
                }
            }

            // Update enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                const distToP = Math.hypot(p.x - e.x, p.y - e.y);
                const angleToP = Math.atan2(p.y - e.y, p.x - e.x);

                // Detection
                if (distToP < 250) { e.alert = true; e.alertTimer = 3000; }
                if (e.alertTimer > 0) { e.alertTimer -= dt; }
                else { e.alert = false; }

                if (e.alert) {
                    // Chase
                    e.angle = angleToP;
                    const nx = e.x + Math.cos(angleToP) * e.speed;
                    const ny = e.y + Math.sin(angleToP) * e.speed;
                    if (!this._wallCollide(nx, e.y, e.radius)) e.x = nx;
                    if (!this._wallCollide(e.x, ny, e.radius)) e.y = ny;

                    // Shoot at player
                    e.shootCd = Math.max(0, e.shootCd - dt);
                    if (e.shootCd <= 0 && distToP < 300) {
                        e.shootCd = e.SHOOT_CD;
                        const spread = (Math.random() - 0.5) * 0.3;
                        const spd = 8;
                        this.bullets.push({
                            x: e.x, y: e.y,
                            vx: Math.cos(angleToP + spread) * spd,
                            vy: Math.sin(angleToP + spread) * spd,
                            life: 70, fromPlayer: false, dmg: 15, radius: 4,
                        });
                    }
                } else {
                    // Patrol
                    e.patrolAngle += (Math.random() - 0.5) * 0.05;
                    const nx = e.x + Math.cos(e.patrolAngle) * 1.0;
                    const ny = e.y + Math.sin(e.patrolAngle) * 1.0;
                    if (this._wallCollide(nx, ny, e.radius)) e.patrolAngle += Math.PI * 0.5;
                    else { e.x = nx; e.y = ny; }
                }

                // Check player bullet hits
                for (let j = this.bullets.length - 1; j >= 0; j--) {
                    const b = this.bullets[j];
                    if (!b.fromPlayer) continue;
                    if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius) {
                        e.hp -= b.dmg;
                        this.bullets.splice(j, 1);
                        if (e.hp <= 0) { this.enemies.splice(i, 1); break; }
                    }
                }
            }
        },

        _draw() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.W, this.H);

            // Background
            ctx.fillStyle = '#1a1a0a';
            ctx.fillRect(0, 0, this.W, this.H);

            ctx.save();
            ctx.translate(-this.cam.x, -this.cam.y);

            // Ground grid
            ctx.strokeStyle = 'rgba(255,255,200,0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < this.MAPW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,this.MAPH); ctx.stroke(); }
            for (let y = 0; y < this.MAPH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(this.MAPW,y); ctx.stroke(); }

            // Walls
            ctx.fillStyle = '#445544';
            ctx.strokeStyle = '#667766';
            ctx.lineWidth = 2;
            for (const w of this.walls) {
                ctx.fillRect(w.x, w.y, w.w, w.h);
                ctx.strokeRect(w.x, w.y, w.w, w.h);
            }

            // Extraction Zone
            const ez = this.extractZone;
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(ez.x, ez.y, ez.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 100, ${0.15 * pulse})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(0, 255, 100, ${0.8 * pulse})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#00ff64';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🚁 탈출 구역', ez.x, ez.y - ez.radius - 10);

            // Loot items
            this.loot.forEach(l => {
                const bob = Math.sin(Date.now() / 400 + l.id) * 3;
                ctx.shadowBlur = 12; ctx.shadowColor = l.color;
                ctx.fillStyle = l.color;
                ctx.beginPath(); ctx.arc(l.x, l.y + bob, l.size, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                ctx.font = `bold ${l.size + 2}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(l.icon, l.x, l.y + bob + 4);
            });

            // Enemy bullets
            this.bullets.filter(b => !b.fromPlayer).forEach(b => {
                ctx.fillStyle = '#ff4444';
                ctx.shadowBlur = 6; ctx.shadowColor = '#ff0000';
                ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Player bullets
            this.bullets.filter(b => b.fromPlayer).forEach(b => {
                ctx.fillStyle = '#ffee00';
                ctx.shadowBlur = 6; ctx.shadowColor = '#ffaa00';
                ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Enemies
            this.enemies.forEach(e => {
                // Body
                ctx.fillStyle = e.alert ? '#cc2222' : '#886633';
                ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
                // Direction indicator
                ctx.strokeStyle = e.alert ? '#ff4444' : '#ccaa44';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(e.x, e.y);
                ctx.lineTo(e.x + Math.cos(e.angle) * (e.radius + 8), e.y + Math.sin(e.angle) * (e.radius + 8));
                ctx.stroke();
                // Alert indicator
                if (e.alert) {
                    ctx.fillStyle = '#ff4444';
                    ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('!', e.x, e.y - e.radius - 5);
                }
                // HP bar
                ctx.fillStyle = '#333'; ctx.fillRect(e.x - 15, e.y - e.radius - 10, 30, 5);
                ctx.fillStyle = '#ff3333'; ctx.fillRect(e.x - 15, e.y - e.radius - 10, 30 * (e.hp / e.maxHp), 5);
            });

            // Player
            const p = this.player;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 5, p.radius, p.radius * 0.5, 0, 0, Math.PI * 2); ctx.fill();
            // Body
            ctx.fillStyle = '#00aaff';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Gun barrel
            ctx.strokeStyle = '#88ddff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(p.angle) * (p.radius + 12), p.y + Math.sin(p.angle) * (p.radius + 12));
            ctx.stroke();

            ctx.restore();

            // ===== HUD =====
            // Top bar
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.W, 55);

            // HP bar
            ctx.fillStyle = '#222'; ctx.fillRect(15, 12, 180, 14);
            const hpFill = Math.max(0, p.hp / p.maxHp);
            ctx.fillStyle = hpFill > 0.5 ? '#00ff88' : hpFill > 0.25 ? '#ffaa00' : '#ff3333';
            ctx.fillRect(15, 12, 180 * hpFill, 14);
            ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(15, 12, 180, 14);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`HP  ${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}`, 18, 23);

            // Ammo
            ctx.fillStyle = p.ammo > 0 ? '#ffee00' : '#ff3333';
            ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`🔫 ${p.ammo} / ${p.maxAmmo}`, 15, 46);

            // Bag contents & value
            const bagValue = p.bag.reduce((sum, l) => sum + l.value, 0);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`💼 ${p.bag.length}개  |  ₩${bagValue.toLocaleString()}`, this.W / 2, 22);

            // Timer
            const timeLeft = Math.max(0, (this.STAGE_DURATION - this.stageTimer) / 1000).toFixed(0);
            ctx.fillStyle = timeLeft < 20 ? '#ff4444' : '#ffffff';
            ctx.font = `bold ${timeLeft < 20 ? '18' : '14'}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(`⏱ ${timeLeft}s`, this.W / 2, 44);

            // Enemies left
            ctx.fillStyle = '#ff7777';
            ctx.font = 'bold 14px monospace'; ctx.textAlign = 'right';
            ctx.fillText(`👾 ${this.enemies.length}명`, this.W - 15, 22);

            // Controls hint
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '11px monospace'; ctx.textAlign = 'right';
            ctx.fillText('WASD: 이동 | 마우스: 조준/사격 | R: 재장전', this.W - 15, 44);

            // Extraction bar
            if (this.state === 'extracting') {
                const prog = this.extractTimer / this.EXTRACT_TIME;
                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                ctx.fillRect(this.W / 2 - 150, this.H - 70, 300, 50);
                ctx.fillStyle = '#222'; ctx.fillRect(this.W / 2 - 130, this.H - 52, 260, 18);
                ctx.fillStyle = '#00ff88'; ctx.fillRect(this.W / 2 - 130, this.H - 52, 260 * prog, 18);
                ctx.fillStyle = '#00ff88'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
                ctx.fillText('🚁 탈출 중... 이동하면 중단됩니다!', this.W / 2, this.H - 57);
            }

            // Timer expired → force dead
            if (this.stageTimer >= this.STAGE_DURATION && this.state === 'playing') {
                this.state = 'dead';
            }

            // ===== MINIMAP =====
            const mm = { x: this.W - 155, y: this.H - 155, w: 140, h: 140 };
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(mm.x - 3, mm.y - 3, mm.w + 6, mm.h + 6);
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.strokeRect(mm.x - 3, mm.y - 3, mm.w + 6, mm.h + 6);

            // Walls on minimap
            ctx.fillStyle = '#445544';
            for (const w of this.walls) {
                ctx.fillRect(
                    mm.x + (w.x / this.MAPW) * mm.w,
                    mm.y + (w.y / this.MAPH) * mm.h,
                    Math.max(1, (w.w / this.MAPW) * mm.w),
                    Math.max(1, (w.h / this.MAPH) * mm.h)
                );
            }

            // Extraction zone on minimap
            const ezMx = mm.x + (this.extractZone.x / this.MAPW) * mm.w;
            const ezMy = mm.y + (this.extractZone.y / this.MAPH) * mm.h;
            ctx.beginPath();
            ctx.arc(ezMx, ezMy, 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,255,100,${0.5 + Math.sin(Date.now()/300)*0.4})`;
            ctx.fill();
            ctx.fillStyle = '#00ff64';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('탈출', ezMx, ezMy - 8);

            // Loot on minimap
            this.loot.forEach(l => {
                ctx.fillStyle = l.color;
                ctx.fillRect(
                    mm.x + (l.x / this.MAPW) * mm.w - 1,
                    mm.y + (l.y / this.MAPH) * mm.h - 1,
                    3, 3
                );
            });

            // Enemies on minimap
            this.enemies.forEach(e => {
                ctx.fillStyle = e.alert ? '#ff4444' : '#886633';
                ctx.beginPath();
                ctx.arc(
                    mm.x + (e.x / this.MAPW) * mm.w,
                    mm.y + (e.y / this.MAPH) * mm.h,
                    2, 0, Math.PI * 2
                );
                ctx.fill();
            });

            // Player on minimap
            const pmx = mm.x + (p.x / this.MAPW) * mm.w;
            const pmy = mm.y + (p.y / this.MAPH) * mm.h;
            ctx.fillStyle = '#00aaff';
            ctx.beginPath();
            ctx.arc(pmx, pmy, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#aaa';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('미니맵', mm.x + mm.w / 2, mm.y - 7);

            // ===== DIRECTION ARROW to extraction zone =====
            const angleToEz = Math.atan2(this.extractZone.y - p.y, this.extractZone.x - p.x);
            const distToEz = Math.hypot(this.extractZone.x - p.x, this.extractZone.y - p.y);
            // Only show arrow if outside extraction zone
            if (distToEz > this.extractZone.radius + 20) {
                const arrowX = this.W / 2 + Math.cos(angleToEz) * 60;
                const arrowY = 80 + Math.sin(angleToEz) * 30;
                const arrowLen = 22;

                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(angleToEz);
                ctx.fillStyle = `rgba(0,255,100,${0.7 + Math.sin(Date.now()/200)*0.3})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ff64';
                ctx.beginPath();
                ctx.moveTo(arrowLen, 0);
                ctx.lineTo(-arrowLen * 0.5, -8);
                ctx.lineTo(-arrowLen * 0.5, 8);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();

                ctx.fillStyle = '#00ff88';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`🚁 ${Math.floor(distToEz)}m`, this.W / 2, 100);
            }

            // Overlay screens
            if (this.state === 'extracted') this._drawEndScreen(true);
            if (this.state === 'dead') this._drawEndScreen(false);
        },

        _drawEndScreen(success) {
            const p = this.player;
            const bagValue = p.bag.reduce((s, l) => s + l.value, 0);

            this.ctx.fillStyle = success ? 'rgba(0,30,0,0.88)' : 'rgba(30,0,0,0.88)';
            this.ctx.fillRect(0, 0, this.W, this.H);

            this.ctx.textAlign = 'center';
            this.ctx.font = 'bold 48px monospace';
            this.ctx.fillStyle = success ? '#00ff88' : '#ff3333';
            this.ctx.fillText(success ? '🚁 탈출 성공!' : '💀 사망', this.W / 2, this.H / 2 - 100);

            if (success) {
                this.ctx.font = 'bold 22px monospace';
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillText(`총 수익: ₩${bagValue.toLocaleString()}`, this.W / 2, this.H / 2 - 50);
                this.ctx.font = '16px monospace'; this.ctx.fillStyle = '#aaa';
                p.bag.forEach((l, i) => {
                    this.ctx.fillStyle = l.color;
                    this.ctx.fillText(`• ${l.name} (₩${l.value})`, this.W / 2, this.H / 2 - 10 + i * 24);
                });
            } else {
                this.ctx.font = '20px monospace'; this.ctx.fillStyle = '#ff8888';
                this.ctx.fillText('탈출 실패 - 수집한 아이템 전부 손실', this.W / 2, this.H / 2 - 40);
                this.ctx.fillStyle = '#666';
                this.ctx.fillText(`(₩${bagValue.toLocaleString()} 손실)`, this.W / 2, this.H / 2 - 10);
            }

            // Restart button
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.W / 2 - 80, this.H / 2 + 80, 160, 45);
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 18px monospace';
            this.ctx.fillText('다시 시작', this.W / 2, this.H / 2 + 109);
        },

        close() {
            this.isPlaying = false;
            if (this.animId) cancelAnimationFrame(this.animId);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup', this._onKeyUp);
            if (this.canvas) {
                this.canvas.removeEventListener('mousemove', this._onMouseMove);
                this.canvas.removeEventListener('mousedown', this._onMouseDown);
                this.canvas.removeEventListener('mouseup', this._onMouseUp);
            }
            if (this.overlay) this.overlay.remove();
        }
    }


,
sports: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 800, H: 600, mouse: { x: 400, y: 300, down: false },
        score: 0, attempts: 0, maxAttempts: 5, state: 'aiming', // 'aiming', 'shooting', 'result', 'gameover'
        ball: { x: 400, y: 500, radius: 15, targetX: 400, targetY: 500, startX: 400, startY: 500, progress: 0 },
        goalie: { x: 400, y: 250, width: 60, height: 100, speed: 3, dir: 1, targetX: 400 },
        goalPost: { x: 200, y: 150, width: 400, height: 200 },
        message: '마우스로 조준하고 클릭하여 슛!', messageTimer: 0,

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.backgroundColor = '#4CAF50'; // Grass green
            this.canvas.style.cursor = 'crosshair';
            
            this.ctx = this.canvas.getContext('2d');
            gameContainer.appendChild(this.canvas);

            // Add UI container
            const uiDiv = document.createElement('div');
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '10px';
            uiDiv.style.left = '10px';
            uiDiv.style.right = '10px';
            uiDiv.style.display = 'flex';
            uiDiv.style.justifyContent = 'space-between';
            uiDiv.style.color = '#fff';
            uiDiv.style.fontFamily = 'sans-serif';
            uiDiv.style.fontSize = '24px';
            uiDiv.style.fontWeight = 'bold';
            uiDiv.style.textShadow = '2px 2px 4px #000';
            uiDiv.style.pointerEvents = 'none';

            this.scoreEl = document.createElement('div');
            this.scoreEl.innerText = `Goals: 0 / Attempts: 0 (Max 5)`;
            uiDiv.appendChild(this.scoreEl);

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '✕';
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.background = 'rgba(0,0,0,0.5)';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '40px';
            closeBtn.style.height = '40px';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();
            uiDiv.appendChild(closeBtn);

            gameContainer.appendChild(uiDiv);

            // Event Listeners
            this.handleMouseMove = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                this.mouse.x = (e.clientX - rect.left) * scaleX;
                this.mouse.y = (e.clientY - rect.top) * scaleY;
            };

            this.handleMouseDown = (e) => {
                if (e.button === 0 && this.state === 'aiming') {
                    this.shoot();
                } else if (e.button === 0 && this.state === 'gameover') {
                    this.resetGame();
                }
            };

            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mousedown', this.handleMouseDown);

            this.resetGame();
            this.isPlaying = true;
            this.gameLoop();
        },

        resetGame() {
            this.score = 0;
            this.attempts = 0;
            this.resetTurn();
            this.state = 'aiming';
            this.message = '페널티 킥! 마우스로 조준하고 클릭하세요.';
            this.messageTimer = 120;
        },

        resetTurn() {
            this.ball.x = 400;
            this.ball.y = 500;
            this.ball.progress = 0;
            this.goalie.x = 400;
            this.goalie.targetX = 400;
        },

        shoot() {
            this.state = 'shooting';
            this.ball.startX = this.ball.x;
            this.ball.startY = this.ball.y;
            this.ball.targetX = this.mouse.x;
            this.ball.targetY = this.mouse.y;
            this.ball.progress = 0;
            
            // Goalie decides where to dive
            const divePositions = [this.goalPost.x + 50, 400, this.goalPost.x + this.goalPost.width - 50];
            this.goalie.targetX = divePositions[Math.floor(Math.random() * divePositions.length)];
            
            this.attempts++;
            this.scoreEl.innerText = `Goals: ${this.score} / Attempts: ${this.attempts} (Max 5)`;
        },

        update() {
            if (!this.isPlaying) return;

            if (this.state === 'aiming') {
                // Goalie slight movement
                this.goalie.x += this.goalie.speed * this.goalie.dir;
                if (this.goalie.x < 350 || this.goalie.x > 450) {
                    this.goalie.dir *= -1;
                }
            } else if (this.state === 'shooting') {
                // Move ball
                this.ball.progress += 0.05;
                if (this.ball.progress > 1) this.ball.progress = 1;
                
                // Parabolic arc for y (simulate height)
                const arc = Math.sin(this.ball.progress * Math.PI) * -50;
                this.ball.x = this.ball.startX + (this.ball.targetX - this.ball.startX) * this.ball.progress;
                this.ball.y = this.ball.startY + (this.ball.targetY - this.ball.startY) * this.ball.progress + arc;

                // Move goalie towards target
                const dx = this.goalie.targetX - this.goalie.x;
                if (Math.abs(dx) > 5) {
                    this.goalie.x += (dx > 0 ? 1 : -1) * 8;
                }

                if (this.ball.progress === 1) {
                    this.checkResult();
                }
            } else if (this.state === 'result') {
                if (this.messageTimer > 0) {
                    this.messageTimer--;
                } else {
                    if (this.attempts >= this.maxAttempts) {
                        this.state = 'gameover';
                        this.message = `게임 종료! 최종 점수: ${this.score} / ${this.maxAttempts} \n다시 하려면 클릭하세요.`;
                    } else {
                        this.resetTurn();
                        this.state = 'aiming';
                    }
                }
            }
        },

        checkResult() {
            this.state = 'result';
            this.messageTimer = 120; // 2 seconds at 60fps
            
            // Check if ball is in goal bounds
            const inGoalX = this.ball.x > this.goalPost.x && this.ball.x < this.goalPost.x + this.goalPost.width;
            const inGoalY = this.ball.y > this.goalPost.y && this.ball.y < this.goalPost.y + this.goalPost.height;
            
            if (inGoalX && inGoalY) {
                // Check goalie collision
                const goalieHitbox = {
                    x: this.goalie.x - this.goalie.width/2,
                    y: this.goalie.y - this.goalie.height/2,
                    w: this.goalie.width,
                    h: this.goalie.height
                };
                
                if (this.ball.x > goalieHitbox.x && this.ball.x < goalieHitbox.x + goalieHitbox.w &&
                    this.ball.y > goalieHitbox.y && this.ball.y < goalieHitbox.y + goalieHitbox.h) {
                    this.message = '막혔습니다! (SAVE)';
                } else {
                    this.score++;
                    this.scoreEl.innerText = `Goals: ${this.score} / Attempts: ${this.attempts} (Max 5)`;
                    this.message = '골인!! (GOAL!)';
                }
            } else {
                this.message = '빗나갔습니다! (MISS)';
            }
        },

        draw() {
            this.ctx.clearRect(0, 0, this.W, this.H);

            // Draw Goal Post
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 10;
            this.ctx.beginPath();
            this.ctx.moveTo(this.goalPost.x, this.goalPost.y + this.goalPost.height);
            this.ctx.lineTo(this.goalPost.x, this.goalPost.y);
            this.ctx.lineTo(this.goalPost.x + this.goalPost.width, this.goalPost.y);
            this.ctx.lineTo(this.goalPost.x + this.goalPost.width, this.goalPost.y + this.goalPost.height);
            this.ctx.stroke();

            // Draw Net (simple grid)
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for(let i=1; i<20; i++) {
                this.ctx.moveTo(this.goalPost.x + i*20, this.goalPost.y);
                this.ctx.lineTo(this.goalPost.x + i*20, this.goalPost.y + this.goalPost.height);
            }
            for(let i=1; i<10; i++) {
                this.ctx.moveTo(this.goalPost.x, this.goalPost.y + i*20);
                this.ctx.lineTo(this.goalPost.x + this.goalPost.width, this.goalPost.y + i*20);
            }
            this.ctx.stroke();

            // Draw Goalie (simple rect)
            this.ctx.fillStyle = '#f44336'; // Red jersey
            this.ctx.fillRect(this.goalie.x - this.goalie.width/2, this.goalie.y - this.goalie.height/2, this.goalie.width, this.goalie.height);
            
            // Goalie head
            this.ctx.fillStyle = '#ffb6c1';
            this.ctx.beginPath();
            this.ctx.arc(this.goalie.x, this.goalie.y - this.goalie.height/2 - 15, 15, 0, Math.PI*2);
            this.ctx.fill();

            // Draw Ball (scaling based on progress)
            const currentRadius = this.ball.radius * (1 - this.ball.progress * 0.5);
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, currentRadius, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            // simple ball pattern
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, currentRadius*0.4, 0, Math.PI*2);
            this.ctx.fill();

            // Draw aiming crosshair
            if (this.state === 'aiming') {
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(this.mouse.x, this.mouse.y, 15, 0, Math.PI*2);
                this.ctx.moveTo(this.mouse.x - 20, this.mouse.y);
                this.ctx.lineTo(this.mouse.x + 20, this.mouse.y);
                this.ctx.moveTo(this.mouse.x, this.mouse.y - 20);
                this.ctx.lineTo(this.mouse.x, this.mouse.y + 20);
                this.ctx.stroke();
            }

            // Draw Message
            if (this.message && (this.messageTimer > 0 || this.state === 'gameover' || this.state === 'aiming')) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.fillRect(0, this.H/2 - 40, this.W, 80);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '30px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const lines = this.message.split('\n');
                lines.forEach((line, i) => {
                    this.ctx.fillText(line, this.W/2, this.H/2 + (i - (lines.length-1)/2)*35);
                });
            }
        },

        gameLoop() {
            if (!this.isPlaying) return;
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        },

        close() {
            this.isPlaying = false;
            if (this.overlay) this.overlay.remove();
        }
    }


,
racing: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 800, H: 600, keys: {},
        
        // Game State
        speed: 0, maxSpeed: 400, accel: 5, breaking: -6, decel: -1.5,
        offRoadDecel: -8, offRoadLimit: 80,
        position: 0, playerX: 0, steerSpeed: 5, 
        
        // Track
        segments: [], segmentLength: 200, trackLength: 0, drawDistance: 300,
        cameraDepth: 0.84, // FOV
        
        // Visuals
        roadWidth: 2000, rumbleLength: 3, lanes: 3,
        
        // Sprites/Items
        sprites: [], score: 0, lap: 1, maxLaps: 3, timer: 0, boostTimer: 0, spinTimer: 0,
        
        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            gameContainer.appendChild(this.canvas);

            // Add UI container
            const uiDiv = document.createElement('div');
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '10px';
            uiDiv.style.left = '10px';
            uiDiv.style.right = '10px';
            uiDiv.style.display = 'flex';
            uiDiv.style.justifyContent = 'space-between';
            uiDiv.style.color = '#fff';
            uiDiv.style.fontFamily = '"Press Start 2P", sans-serif';
            uiDiv.style.fontSize = '24px';
            uiDiv.style.fontWeight = 'bold';
            uiDiv.style.textShadow = '2px 2px 0px #000';
            uiDiv.style.pointerEvents = 'none';
            uiDiv.style.zIndex = '10';

            this.hudLeft = document.createElement('div');
            this.hudRight = document.createElement('div');
            this.hudRight.style.textAlign = 'right';
            
            uiDiv.appendChild(this.hudLeft);
            uiDiv.appendChild(this.hudRight);

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '✕';
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.background = 'rgba(0,0,0,0.5)';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '40px';
            closeBtn.style.height = '40px';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();
            
            const btnContainer = document.createElement('div');
            btnContainer.style.pointerEvents = 'auto';
            btnContainer.appendChild(closeBtn);
            uiDiv.appendChild(btnContainer);

            gameContainer.appendChild(uiDiv);

            // Input
            this.handleKeyDown = (e) => { this.keys[e.key] = true; };
            this.handleKeyUp = (e) => { this.keys[e.key] = false; };
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);

            this.resetTrack();
            this.resetGame();
            this.isPlaying = true;
            this.lastTime = performance.now();
            this.gameLoop();
        },

        resetGame() {
            this.speed = 0;
            this.position = 0;
            this.playerX = 0;
            this.score = 0;
            this.lap = 1;
            this.timer = 0;
            this.boostTimer = 0;
            this.spinTimer = 0;
            this.gameState = 'playing'; // 'playing', 'finished'
            this.message = '';
        },

        // Build pseudo-3D track
        resetTrack() {
            this.segments = [];
            const addSegment = (curve, y) => {
                this.segments.push({
                    index: this.segments.length,
                    p1: { world: { y: 0, z: this.segments.length * this.segmentLength }, camera: {}, screen: {} },
                    p2: { world: { y: 0, z: (this.segments.length + 1) * this.segmentLength }, camera: {}, screen: {} },
                    curve: curve,
                    sprites: [],
                    color: Math.floor(this.segments.length / this.rumbleLength) % 2 ? 
                           { road: '#6b6b6b', grass: '#10aa10', rumble: '#555', lane: '#6b6b6b' } : 
                           { road: '#6b6b6b', grass: '#009a00', rumble: '#eee', lane: '#fff' }
                });
            };

            const addRoad = (enter, hold, leave, curve) => {
                for(let i=0; i<enter; i++) addSegment(curve * (i/enter), 0);
                for(let i=0; i<hold;  i++) addSegment(curve, 0);
                for(let i=0; i<leave; i++) addSegment(curve * (1 - i/leave), 0);
            };

            // Straight, Curve Left, Straight, Curve Right, S-Curve
            addRoad(50, 50, 50, 0);
            addRoad(50, 100, 50, -2);
            addRoad(50, 50, 50, 0);
            addRoad(50, 100, 50, 3);
            addRoad(50, 50, 50, 0);
            addRoad(50, 50, 50, -4);
            addRoad(50, 50, 50, 4);
            addRoad(50, 100, 50, 0);

            // Add finish line
            this.segments[this.segments.length-1].color.road = '#fff';
            
            this.trackLength = this.segments.length * this.segmentLength;

            // Add Items (Mushrooms, Bananas)
            for(let i=100; i<this.segments.length; i+=Math.floor(Math.random()*40 + 20)) {
                const type = Math.random() > 0.4 ? 'mushroom' : 'banana';
                const offset = (Math.random() * 2) - 1; // -1 to 1
                this.segments[i].sprites.push({ source: type, offset: offset });
            }
        },

        update(dt) {
            if (this.gameState === 'finished') return;

            this.timer += dt;
            if (this.boostTimer > 0) this.boostTimer -= dt;
            if (this.spinTimer > 0) {
                this.spinTimer -= dt;
                this.speed += this.breaking * 2; // slow down during spin
                if (this.speed < 0) this.speed = 0;
            }

            const currentSegment = this.segments[Math.floor(this.position / this.segmentLength) % this.segments.length];

            let dx = dt * this.steerSpeed * (this.speed / this.maxSpeed);

            if (this.spinTimer <= 0) {
                if ((this.keys['ArrowLeft'] || this.keys['a']) && this.speed > 0) this.playerX -= dx;
                else if ((this.keys['ArrowRight'] || this.keys['d']) && this.speed > 0) this.playerX += dx;

                this.playerX -= (dx * this.speed/this.maxSpeed * currentSegment.curve * 0.02);

                let currentMaxSpeed = this.boostTimer > 0 ? this.maxSpeed * 1.5 : this.maxSpeed;

                if (this.keys['ArrowUp'] || this.keys['w']) {
                    this.speed += this.accel;
                } else if (this.keys['ArrowDown'] || this.keys['s']) {
                    this.speed += this.breaking;
                } else {
                    this.speed += this.decel;
                }

                // Off-road
                if ((this.playerX < -1 || this.playerX > 1) && this.speed > this.offRoadLimit) {
                    this.speed += this.offRoadDecel;
                }

                if (this.speed > currentMaxSpeed) this.speed = currentMaxSpeed;
                if (this.speed < 0) this.speed = 0;
            }

            this.position += this.speed;

            // Check item collision
            for(let i=0; i<currentSegment.sprites.length; i++) {
                const sprite = currentSegment.sprites[i];
                if (!sprite.collected) {
                    const spriteW = 0.3; // Hitbox width
                    if (this.playerX > sprite.offset - spriteW && this.playerX < sprite.offset + spriteW) {
                        sprite.collected = true;
                        if (sprite.source === 'mushroom') {
                            this.boostTimer = 2.0; // 2 seconds boost
                            this.score += 100;
                        } else if (sprite.source === 'banana') {
                            this.spinTimer = 1.0; // 1 second spin out
                            this.speed *= 0.5;
                        }
                    }
                }
            }

            // Lap logic
            while (this.position >= this.trackLength) {
                this.position -= this.trackLength;
                this.lap++;
                if (this.lap > this.maxLaps) {
                    this.gameState = 'finished';
                    this.lap = this.maxLaps;
                    this.message = '🏁 FINISH! 🏁';
                }
            }

            // Update HUD
            this.hudLeft.innerHTML = `LAP ${this.lap}/${this.maxLaps}<br>SCORE ${this.score}`;
            this.hudRight.innerHTML = `${Math.floor(this.speed)} KM/H<br>TIME ${this.timer.toFixed(1)}`;
        },

        project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
            p.camera.x = (p.world.x || 0) - cameraX;
            p.camera.y = (p.world.y || 0) - cameraY;
            p.camera.z = (p.world.z || 0) - cameraZ;
            const scale = cameraDepth / p.camera.z;
            p.screen.x = Math.round((width / 2) + (scale * p.camera.x * width / 2));
            p.screen.y = Math.round((height / 2) - (scale * p.camera.y * height / 2));
            p.screen.w = Math.round((scale * roadWidth * width / 2));
        },

        drawPolygon(ctx, x1, y1, w1, x2, y2, w2, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1 - w1, y1);
            ctx.lineTo(x2 - w2, y2);
            ctx.lineTo(x2 + w2, y2);
            ctx.lineTo(x1 + w1, y1);
            ctx.fill();
        },

        drawSprite(ctx, sprite, segment, camX, camY, camZ) {
            const scale = this.cameraDepth / (segment.p1.world.z - camZ);
            const destX = (this.W / 2) + (scale * (sprite.offset * this.roadWidth - camX) * this.W / 2);
            const destY = (this.H / 2) - (scale * (0 - camY) * this.H / 2);
            const destW = (scale * 1000 * this.W / 2); // Base sprite size
            const destH = destW;
            
            // Very simple drawing for items
            if (sprite.source === 'mushroom') {
                ctx.fillStyle = '#f00'; // Red mushroom cap
                ctx.beginPath();
                ctx.arc(destX, destY - destH/2, destW/2, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = '#fff'; // White spots & stem
                ctx.fillRect(destX - destW/6, destY - destH/2, destW/3, destH/2);
                ctx.beginPath();
                ctx.arc(destX - destW/4, destY - destH*0.7, destW/6, 0, Math.PI*2);
                ctx.fill();
            } else if (sprite.source === 'banana') {
                ctx.fillStyle = '#ff0'; // Yellow banana
                ctx.beginPath();
                ctx.moveTo(destX - destW/2, destY - destH);
                ctx.quadraticCurveTo(destX, destY, destX + destW/2, destY - destH);
                ctx.quadraticCurveTo(destX, destY - destH*0.5, destX - destW/2, destY - destH);
                ctx.fill();
            }
        },

        drawPlayer(ctx) {
            const scale = 1.5;
            const destX = this.W / 2;
            const destY = this.H - 50;
            const destW = 80 * scale;
            const destH = 60 * scale;
            
            ctx.save();
            ctx.translate(destX, destY);
            
            // Spin animation
            if (this.spinTimer > 0) {
                ctx.rotate((this.spinTimer * 10) % (Math.PI * 2));
            } else {
                // Steer rotation
                const steerAngle = (this.keys['ArrowLeft'] || this.keys['a']) ? -0.2 : ((this.keys['ArrowRight'] || this.keys['d']) ? 0.2 : 0);
                ctx.rotate(steerAngle);
            }

            // Draw Kart
            // Tires
            ctx.fillStyle = '#111';
            ctx.fillRect(-destW/2, -destH/2, 20, 30);
            ctx.fillRect(destW/2 - 20, -destH/2, 20, 30);
            ctx.fillRect(-destW/2, destH/2 - 30, 20, 30);
            ctx.fillRect(destW/2 - 20, destH/2 - 30, 20, 30);
            
            // Body
            ctx.fillStyle = '#e94560'; // Main color
            ctx.beginPath();
            ctx.roundRect(-destW/2 + 10, -destH/2, destW - 20, destH, 10);
            ctx.fill();

            // Driver Head
            ctx.fillStyle = '#ffb6c1';
            ctx.beginPath();
            ctx.arc(0, -5, 15, 0, Math.PI*2);
            ctx.fill();
            
            // Helmet / Hat
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(0, -10, 15, Math.PI, 0);
            ctx.fill();

            ctx.restore();
        },

        draw() {
            // Sky
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.W, this.H/2);
            // Ground
            this.ctx.fillStyle = '#10aa10';
            this.ctx.fillRect(0, this.H/2, this.W, this.H/2);

            const baseSegment = this.segments[Math.floor(this.position / this.segmentLength) % this.segments.length];
            const basePercent = (this.position % this.segmentLength) / this.segmentLength;

            let camY = 1000;
            let camZ = this.position;
            let camX = this.playerX * this.roadWidth;
            
            let maxy = this.H;
            
            let dx = - (baseSegment.curve * basePercent);
            let x = 0;

            // Render Road
            for (let n = 0; n < this.drawDistance; n++) {
                const segmentIndex = (baseSegment.index + n) % this.segments.length;
                const segment = this.segments[segmentIndex];
                
                segment.p1.world.z = (baseSegment.index + n) * this.segmentLength;
                segment.p2.world.z = (baseSegment.index + n + 1) * this.segmentLength;

                this.project(segment.p1, (this.playerX * this.roadWidth) - x, camY, camZ, this.cameraDepth, this.W, this.H, this.roadWidth);
                this.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, camY, camZ, this.cameraDepth, this.W, this.H, this.roadWidth);
                
                x += dx;
                dx += segment.curve;

                if (segment.p1.camera.z <= this.cameraDepth || segment.p2.screen.y >= maxy || segment.p2.screen.y >= segment.p1.screen.y) continue;

                // Grass
                this.ctx.fillStyle = segment.color.grass;
                this.ctx.fillRect(0, segment.p2.screen.y, this.W, segment.p1.screen.y - segment.p2.screen.y);

                // Rumble
                this.drawPolygon(this.ctx, 
                    segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w * 1.2,
                    segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w * 1.2,
                    segment.color.rumble
                );

                // Road
                this.drawPolygon(this.ctx, 
                    segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
                    segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
                    segment.color.road
                );

                // Lanes
                if (segment.color.lane) {
                    const lanew1 = segment.p1.screen.w * 2 / this.lanes;
                    const lanew2 = segment.p2.screen.w * 2 / this.lanes;
                    let lanex1 = segment.p1.screen.x - segment.p1.screen.w + lanew1;
                    let lanex2 = segment.p2.screen.x - segment.p2.screen.w + lanew2;
                    
                    for(let lane=1; lane<this.lanes; lane++) {
                        this.drawPolygon(this.ctx, 
                            lanex1, segment.p1.screen.y, segment.p1.screen.w * 0.02,
                            lanex2, segment.p2.screen.y, segment.p2.screen.w * 0.02,
                            segment.color.lane
                        );
                        lanex1 += lanew1;
                        lanex2 += lanew2;
                    }
                }

                maxy = segment.p1.screen.y;
            }

            // Render Items (Back to front)
            for (let n = this.drawDistance - 1; n > 0; n--) {
                const segmentIndex = (baseSegment.index + n) % this.segments.length;
                const segment = this.segments[segmentIndex];
                for(let i=0; i<segment.sprites.length; i++) {
                    const sprite = segment.sprites[i];
                    if (!sprite.collected) {
                        this.drawSprite(this.ctx, sprite, segment, camX, camY, camZ);
                    }
                }
            }

            this.drawPlayer(this.ctx);

            // Message Display
            if (this.message) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.fillRect(0, this.H/2 - 40, this.W, 80);
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = 'bold 40px "Press Start 2P", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.message, this.W/2, this.H/2);
            }
        },

        gameLoop() {
            if (!this.isPlaying) return;
            const now = performance.now();
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            this.update(dt);
            this.draw();
            
            requestAnimationFrame(() => this.gameLoop());
        },

        close() {
            this.isPlaying = false;
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            if (this.overlay) this.overlay.remove();
        }
    }


,
sandbox: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 800, H: 600, keys: {},
        
        blockSize: 40,
        cols: 100, rows: 40, // 4000x1600 world
        world: [],
        cam: { x: 0, y: 0 },
        
        player: { x: 2000, y: 0, w: 24, h: 48, vx: 0, vy: 0, speed: 250, jumpForce: 500, grounded: false },
        gravity: 1200,
        
        blocks: {
            0: { name: 'Air', color: null, solid: false },
            1: { name: 'Dirt', color: '#8B4513', solid: true },
            2: { name: 'Grass', color: '#4CAF50', solid: true },
            3: { name: 'Stone', color: '#9E9E9E', solid: true },
            4: { name: 'Wood', color: '#795548', solid: true },
            5: { name: 'Leaves', color: '#2E7D32', solid: true },
            6: { name: 'Glass', color: '#81D4FA', solid: true, transparent: true },
            7: { name: 'Brick', color: '#D32F2F', solid: true }
        },
        
        inventory: [1, 2, 3, 4, 5, 6, 7],
        selectedIdx: 0,
        mouse: { x: 0, y: 0 },
        
        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            // Prevent context menu for right click
            this.canvas.addEventListener('contextmenu', e => e.preventDefault());
            this.canvas.style.cursor = 'crosshair';
            
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            gameContainer.appendChild(this.canvas);

            // Add UI container
            const uiDiv = document.createElement('div');
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '10px';
            uiDiv.style.left = '10px';
            uiDiv.style.right = '10px';
            uiDiv.style.display = 'flex';
            uiDiv.style.justifyContent = 'space-between';
            uiDiv.style.pointerEvents = 'none';

            // Instructions
            const instr = document.createElement('div');
            instr.innerHTML = `<span style="color:#fff;text-shadow:1px 1px 2px #000;font-family:sans-serif;font-weight:bold;background:rgba(0,0,0,0.5);padding:5px 10px;border-radius:5px;">
                A/D: 이동 | W/Space: 점프 | 좌클릭: 부수기 | 우클릭: 설치 | 1~7: 블록 선택
            </span>`;
            uiDiv.appendChild(instr);

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '✕';
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.background = 'rgba(0,0,0,0.7)';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '2px solid #fff';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '40px';
            closeBtn.style.height = '40px';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();
            uiDiv.appendChild(closeBtn);

            gameContainer.appendChild(uiDiv);

            // Input
            this.handleKeyDown = (e) => { 
                this.keys[e.key] = true; 
                this.keys[e.code] = true;
                // Inventory selection
                if (e.key >= '1' && e.key <= '7') {
                    this.selectedIdx = parseInt(e.key) - 1;
                }
            };
            this.handleKeyUp = (e) => { 
                this.keys[e.key] = false; 
                this.keys[e.code] = false;
            };
            this.handleMouseMove = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                this.mouse.x = (e.clientX - rect.left) * scaleX;
                this.mouse.y = (e.clientY - rect.top) * scaleY;
            };
            this.handleMouseDown = (e) => {
                const worldX = this.mouse.x + this.cam.x;
                const worldY = this.mouse.y + this.cam.y;
                const col = Math.floor(worldX / this.blockSize);
                const row = Math.floor(worldY / this.blockSize);
                
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    if (e.button === 0) { // Left click (Break)
                        this.setBlock(col, row, 0);
                    } else if (e.button === 2) { // Right click (Place)
                        // Don't place inside player
                        const px = this.player.x, py = this.player.y, pw = this.player.w, ph = this.player.h;
                        const bx = col * this.blockSize, by = row * this.blockSize, bw = this.blockSize;
                        if (!(px < bx + bw && px + pw > bx && py < by + bw && py + ph > by)) {
                            if (this.getBlock(col, row) === 0) {
                                this.setBlock(col, row, this.inventory[this.selectedIdx]);
                            }
                        }
                    }
                }
            };

            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mousedown', this.handleMouseDown);

            this.generateWorld();
            
            // Find ground for player spawn
            for(let r=0; r<this.rows; r++) {
                if (this.getBlock(Math.floor(this.player.x/this.blockSize), r) !== 0) {
                    this.player.y = (r * this.blockSize) - this.player.h - 10;
                    break;
                }
            }

            this.isPlaying = true;
            this.lastTime = performance.now();
            this.gameLoop();
        },

        getBlock(c, r) {
            if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return 3; // Bedrock outside bounds
            return this.world[r * this.cols + c];
        },
        
        setBlock(c, r, val) {
            if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return;
            this.world[r * this.cols + c] = val;
        },

        generateWorld() {
            this.world = new Array(this.cols * this.rows).fill(0);
            
            let heights = [];
            let h = this.rows / 2;
            for(let c=0; c<this.cols; c++) {
                h += (Math.random() * 3) - 1.5;
                if (h < 5) h = 5;
                if (h > this.rows - 5) h = this.rows - 5;
                heights.push(Math.floor(h));
            }
            
            for(let c=0; c<this.cols; c++) {
                const surface = heights[c];
                for(let r=surface; r<this.rows; r++) {
                    if (r === surface) this.setBlock(c, r, 2); // Grass
                    else if (r < surface + 4) this.setBlock(c, r, 1); // Dirt
                    else this.setBlock(c, r, 3); // Stone
                }
                
                // Trees
                if (c > 2 && c < this.cols - 2 && Math.random() < 0.1 && this.getBlock(c, surface) === 2) {
                    const treeHeight = Math.floor(Math.random() * 3) + 3;
                    for(let i=1; i<=treeHeight; i++) {
                        this.setBlock(c, surface - i, 4); // Wood
                    }
                    // Leaves
                    for(let lx = -1; lx <= 1; lx++) {
                        for(let ly = -2; ly <= 0; ly++) {
                            if (lx === 0 && ly === 0) continue; // Wood
                            this.setBlock(c + lx, surface - treeHeight + ly, 5); // Leaves
                        }
                    }
                    this.setBlock(c, surface - treeHeight - 1, 5); // Top leaf
                }
            }
        },

        checkCollision(x, y, w, h) {
            const startCol = Math.floor(x / this.blockSize);
            const endCol = Math.floor((x + w - 0.1) / this.blockSize);
            const startRow = Math.floor(y / this.blockSize);
            const endRow = Math.floor((y + h - 0.1) / this.blockSize);

            for (let c = startCol; c <= endCol; c++) {
                for (let r = startRow; r <= endRow; r++) {
                    const b = this.getBlock(c, r);
                    if (this.blocks[b] && this.blocks[b].solid) {
                        return true;
                    }
                }
            }
            return false;
        },

        update(dt) {
            // Horizontal Movement
            if (this.keys['a'] || this.keys['ArrowLeft']) this.player.vx = -this.player.speed;
            else if (this.keys['d'] || this.keys['ArrowRight']) this.player.vx = this.player.speed;
            else this.player.vx = 0;

            this.player.x += this.player.vx * dt;
            
            // X Collision
            if (this.checkCollision(this.player.x, this.player.y, this.player.w, this.player.h)) {
                if (this.player.vx > 0) {
                    this.player.x = Math.floor((this.player.x + this.player.w) / this.blockSize) * this.blockSize - this.player.w;
                } else if (this.player.vx < 0) {
                    this.player.x = Math.floor(this.player.x / this.blockSize) * this.blockSize + this.blockSize;
                }
            }
            
            // World Bounds X
            if (this.player.x < 0) this.player.x = 0;
            if (this.player.x > this.cols * this.blockSize - this.player.w) this.player.x = this.cols * this.blockSize - this.player.w;

            // Vertical Movement
            this.player.vy += this.gravity * dt;
            if ((this.keys['w'] || this.keys['ArrowUp'] || this.keys['Space']) && this.player.grounded) {
                this.player.vy = -this.player.jumpForce;
                this.player.grounded = false;
            }

            this.player.y += this.player.vy * dt;
            this.player.grounded = false;
            
            // Y Collision
            if (this.checkCollision(this.player.x, this.player.y, this.player.w, this.player.h)) {
                if (this.player.vy > 0) { // Landing
                    this.player.y = Math.floor((this.player.y + this.player.h) / this.blockSize) * this.blockSize - this.player.h;
                    this.player.grounded = true;
                } else if (this.player.vy < 0) { // Hitting head
                    this.player.y = Math.floor(this.player.y / this.blockSize) * this.blockSize + this.blockSize;
                }
                this.player.vy = 0;
            }
            
            // World Bounds Y
            if (this.player.y > this.rows * this.blockSize) {
                // Respawn if fell out of world
                this.player.y = 0;
                this.player.vy = 0;
            }

            // Camera follow player
            this.cam.x = this.player.x + this.player.w/2 - this.W/2;
            this.cam.y = this.player.y + this.player.h/2 - this.H/2;
            
            // Clamp camera
            if (this.cam.x < 0) this.cam.x = 0;
            if (this.cam.x > this.cols * this.blockSize - this.W) this.cam.x = this.cols * this.blockSize - this.W;
            if (this.cam.y < 0) this.cam.y = 0;
            if (this.cam.y > this.rows * this.blockSize - this.H) this.cam.y = this.rows * this.blockSize - this.H;
        },

        draw() {
            // Sky
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.W, this.H);

            const startCol = Math.max(0, Math.floor(this.cam.x / this.blockSize));
            const endCol = Math.min(this.cols - 1, Math.floor((this.cam.x + this.W) / this.blockSize));
            const startRow = Math.max(0, Math.floor(this.cam.y / this.blockSize));
            const endRow = Math.min(this.rows - 1, Math.floor((this.cam.y + this.H) / this.blockSize));

            for(let c=startCol; c<=endCol; c++) {
                for(let r=startRow; r<=endRow; r++) {
                    const b = this.getBlock(c, r);
                    if (b > 0) {
                        const blockDef = this.blocks[b];
                        this.ctx.fillStyle = blockDef.color;
                        if (blockDef.transparent) this.ctx.globalAlpha = 0.6;
                        this.ctx.fillRect(Math.floor(c * this.blockSize - this.cam.x), Math.floor(r * this.blockSize - this.cam.y), this.blockSize + 1, this.blockSize + 1);
                        this.ctx.globalAlpha = 1.0;
                        
                        // Simple shading/border
                        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(Math.floor(c * this.blockSize - this.cam.x), Math.floor(r * this.blockSize - this.cam.y), this.blockSize, this.blockSize);
                    }
                }
            }

            // Draw Player
            this.ctx.fillStyle = '#3F51B5'; // Steve shirt color
            this.ctx.fillRect(Math.floor(this.player.x - this.cam.x), Math.floor(this.player.y - this.cam.y), this.player.w, this.player.h);
            this.ctx.fillStyle = '#FFC107'; // Skin color
            this.ctx.fillRect(Math.floor(this.player.x - this.cam.x), Math.floor(this.player.y - this.cam.y) - 16, this.player.w, 16); // Head

            // Draw Block Highlight
            const mx = this.mouse.x + this.cam.x;
            const my = this.mouse.y + this.cam.y;
            const mc = Math.floor(mx / this.blockSize);
            const mr = Math.floor(my / this.blockSize);
            
            if (mc >= 0 && mc < this.cols && mr >= 0 && mr < this.rows) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(Math.floor(mc * this.blockSize - this.cam.x), Math.floor(mr * this.blockSize - this.cam.y), this.blockSize, this.blockSize);
            }

            // Draw Inventory Hotbar
            const barW = this.inventory.length * 50;
            const barX = (this.W - barW) / 2;
            const barY = this.H - 60;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(barX, barY, barW, 50);
            
            for(let i=0; i<this.inventory.length; i++) {
                const bx = barX + i * 50;
                const b = this.inventory[i];
                this.ctx.fillStyle = this.blocks[b].color;
                this.ctx.fillRect(bx + 10, barY + 10, 30, 30);
                
                if (i === this.selectedIdx) {
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(bx, barY, 50, 50);
                } else {
                    this.ctx.strokeStyle = '#555';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(bx, barY, 50, 50);
                }
                
                // Number label
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText((i+1).toString(), bx + 3, barY + 3);
            }
        },

        gameLoop() {
            if (!this.isPlaying) return;
            const now = performance.now();
            const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Cap dt
            this.lastTime = now;

            this.update(dt);
            this.draw();
            
            requestAnimationFrame(() => this.gameLoop());
        },

        close() {
            this.isPlaying = false;
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            if (this.overlay) this.overlay.remove();
        }
    }


,
rts: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 800, H: 600,
        keys: {}, mouse: { x: 0, y: 0, down: false, startX: 0, startY: 0, rightDown: false },
        
        resources: 100, timer: 0, score: 0,
        gameState: 'playing', // playing, gameover
        
        base: { x: 400, y: 300, w: 80, h: 80, hp: 1000, maxHp: 1000 },
        units: [], enemies: [], bullets: [],
        
        marineImg: new Image(), alienImg: new Image(),
        imagesLoaded: 0,

        init() {
            const { overlay, gameContainer } = MiniGames._createOverlay();
            this.overlay = overlay;
            
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.W;
            this.canvas.height = this.H;
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.backgroundColor = '#1a1a2e'; // Dark ground
            this.canvas.addEventListener('contextmenu', e => e.preventDefault());
            this.canvas.style.cursor = 'crosshair';
            
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            gameContainer.appendChild(this.canvas);

            // Images
            this.marineImg.src = 'images/rts_marine.png?v=1';
            this.alienImg.src = 'images/rts_alien.png?v=1';

            // UI Container
            const uiDiv = document.createElement('div');
            uiDiv.style.position = 'absolute';
            uiDiv.style.top = '10px';
            uiDiv.style.left = '10px';
            uiDiv.style.right = '10px';
            uiDiv.style.pointerEvents = 'none';
            uiDiv.style.display = 'flex';
            uiDiv.style.justifyContent = 'space-between';
            uiDiv.style.alignItems = 'flex-start';

            // HUD
            this.hud = document.createElement('div');
            this.hud.style.color = '#fff';
            this.hud.style.fontFamily = 'monospace';
            this.hud.style.fontSize = '20px';
            this.hud.style.background = 'rgba(0,0,0,0.7)';
            this.hud.style.padding = '10px';
            this.hud.style.border = '2px solid #00f';
            this.hud.style.borderRadius = '5px';
            uiDiv.appendChild(this.hud);

            // Controls
            const controlsDiv = document.createElement('div');
            controlsDiv.style.pointerEvents = 'auto';
            controlsDiv.style.display = 'flex';
            controlsDiv.style.flexDirection = 'column';
            controlsDiv.style.gap = '10px';
            controlsDiv.style.alignItems = 'flex-end';

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '✕';
            closeBtn.style.background = 'rgba(0,0,0,0.7)';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = '2px solid #fff';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '40px';
            closeBtn.style.height = '40px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();
            controlsDiv.appendChild(closeBtn);

            const spawnBtn = document.createElement('button');
            spawnBtn.innerHTML = '🛡️ 마린 생산 (50 광물)';
            spawnBtn.style.background = '#0d47a1';
            spawnBtn.style.color = '#fff';
            spawnBtn.style.border = '1px solid #64b5f6';
            spawnBtn.style.padding = '10px 15px';
            spawnBtn.style.fontSize = '16px';
            spawnBtn.style.cursor = 'pointer';
            spawnBtn.style.boxShadow = '0 0 10px #0d47a1';
            spawnBtn.onclick = () => this.spawnMarine();
            controlsDiv.appendChild(spawnBtn);

            uiDiv.appendChild(controlsDiv);
            gameContainer.appendChild(uiDiv);

            // Input handling
            this.handleMouseMove = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                this.mouse.x = (e.clientX - rect.left) * scaleX;
                this.mouse.y = (e.clientY - rect.top) * scaleY;
            };

            this.handleMouseDown = (e) => {
                if (this.gameState === 'gameover') {
                    this.resetGame();
                    return;
                }
                if (e.button === 0) { // Left click
                    this.mouse.down = true;
                    this.mouse.startX = this.mouse.x;
                    this.mouse.startY = this.mouse.y;
                } else if (e.button === 2) { // Right click
                    // Move selected units
                    let row = 0;
                    let col = 0;
                    let numSelected = this.units.filter(u => u.selected).length;
                    let cols = Math.ceil(Math.sqrt(numSelected));
                    
                    this.units.forEach(u => {
                        if (u.selected) {
                            // Formation offsets
                            const offsetX = (col - cols/2) * 30;
                            const offsetY = (row - cols/2) * 30;
                            u.targetX = this.mouse.x + offsetX;
                            u.targetY = this.mouse.y + offsetY;
                            u.state = 'moving';
                            
                            col++;
                            if (col >= cols) {
                                col = 0;
                                row++;
                            }
                        }
                    });
                    
                    // Show click effect
                    this.bullets.push({ type: 'click', x: this.mouse.x, y: this.mouse.y, timer: 10 });
                }
            };

            this.handleMouseUp = (e) => {
                if (e.button === 0) {
                    this.mouse.down = false;
                    // Select units in box
                    const minX = Math.min(this.mouse.startX, this.mouse.x);
                    const maxX = Math.max(this.mouse.startX, this.mouse.x);
                    const minY = Math.min(this.mouse.startY, this.mouse.y);
                    const maxY = Math.max(this.mouse.startY, this.mouse.y);
                    
                    this.units.forEach(u => {
                        if (Math.abs(maxX - minX) < 5 && Math.abs(maxY - minY) < 5) {
                            // Point click
                            u.selected = (u.x > this.mouse.x - 15 && u.x < this.mouse.x + 15 && 
                                          u.y > this.mouse.y - 15 && u.y < this.mouse.y + 15);
                        } else {
                            // Box select
                            u.selected = (u.x > minX && u.x < maxX && u.y > minY && u.y < maxY);
                        }
                    });
                }
            };

            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('contextmenu', e => e.preventDefault());

            this.resetGame();
            this.isPlaying = true;
            this.lastTime = performance.now();
            this.gameLoop();
        },

        resetGame() {
            this.resources = 100;
            this.score = 0;
            this.timer = 0;
            this.base.hp = this.base.maxHp;
            this.units = [];
            this.enemies = [];
            this.bullets = [];
            this.gameState = 'playing';
            
            // Initial units
            this.units.push(this.createMarine(this.base.x - 60, this.base.y));
            this.units.push(this.createMarine(this.base.x + 60, this.base.y));
        },

        createMarine(x, y) {
            return {
                x: x, y: y, radius: 12, hp: 40, maxHp: 40,
                targetX: x, targetY: y, state: 'idle', // idle, moving, attacking
                speed: 100, range: 150, attackCooldown: 0, selected: false
            };
        },

        spawnMarine() {
            if (this.resources >= 50 && this.gameState === 'playing') {
                this.resources -= 50;
                const angle = Math.random() * Math.PI * 2;
                const r = 60;
                this.units.push(this.createMarine(this.base.x + Math.cos(angle)*r, this.base.y + Math.sin(angle)*r));
            }
        },

        spawnEnemy() {
            const side = Math.floor(Math.random() * 4);
            let ex = 0, ey = 0;
            if (side === 0) { ex = Math.random() * this.W; ey = -20; }
            if (side === 1) { ex = Math.random() * this.W; ey = this.H + 20; }
            if (side === 2) { ex = -20; ey = Math.random() * this.H; }
            if (side === 3) { ex = this.W + 20; ey = Math.random() * this.H; }
            
            this.enemies.push({
                x: ex, y: ey, radius: 12, hp: 30, maxHp: 30,
                speed: 70 + Math.random()*20, attackCooldown: 0, target: null
            });
        },

        update(dt) {
            if (this.gameState === 'gameover') return;

            this.timer += dt;
            
            // Resource generation
            this.resources += 10 * dt;

            // Enemy Spawning (gets faster over time)
            const spawnRate = Math.max(0.5, 3.0 - (this.timer / 60)); // 1 every 3s -> 1 every 0.5s
            if (Math.random() < dt / spawnRate) {
                this.spawnEnemy();
            }

            // Update Units (Marines)
            this.units.forEach(u => {
                if (u.attackCooldown > 0) u.attackCooldown -= dt;
                
                // Find closest enemy
                let closestEnemy = null;
                let minDist = u.range;
                this.enemies.forEach(e => {
                    const d = Math.hypot(e.x - u.x, e.y - u.y);
                    if (d < minDist) {
                        minDist = d;
                        closestEnemy = e;
                    }
                });

                if (closestEnemy) {
                    u.state = 'attacking';
                    if (u.attackCooldown <= 0) {
                        // Shoot
                        closestEnemy.hp -= 10;
                        u.attackCooldown = 0.5; // 0.5s attack speed
                        this.bullets.push({ x1: u.x, y1: u.y, x2: closestEnemy.x, y2: closestEnemy.y, timer: 0.1 });
                    }
                } else if (u.state === 'attacking') {
                    u.state = 'idle';
                }

                if (u.state === 'moving') {
                    const dx = u.targetX - u.x;
                    const dy = u.targetY - u.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 5) {
                        u.x += (dx / dist) * u.speed * dt;
                        u.y += (dy / dist) * u.speed * dt;
                    } else {
                        u.state = 'idle';
                    }
                }
            });

            // Update Enemies (Zerglings)
            this.enemies.forEach(e => {
                if (e.attackCooldown > 0) e.attackCooldown -= dt;

                // Target base or nearby marine
                let target = { x: this.base.x, y: this.base.y, type: 'base' };
                let minDist = Math.hypot(this.base.x - e.x, this.base.y - e.y);
                
                this.units.forEach(u => {
                    const d = Math.hypot(u.x - e.x, u.y - e.y);
                    if (d < minDist && d < 100) {
                        minDist = d;
                        target = { x: u.x, y: u.y, type: 'unit', ref: u };
                    }
                });

                const range = target.type === 'base' ? 50 : 20;

                if (minDist > range) {
                    const dx = target.x - e.x;
                    const dy = target.y - e.y;
                    e.x += (dx / minDist) * e.speed * dt;
                    e.y += (dy / minDist) * e.speed * dt;
                } else {
                    // Attack
                    if (e.attackCooldown <= 0) {
                        if (target.type === 'base') {
                            this.base.hp -= 10;
                        } else if (target.type === 'unit') {
                            target.ref.hp -= 10;
                        }
                        e.attackCooldown = 1.0; // 1s attack speed
                    }
                }
            });

            // Handle Deaths
            this.units = this.units.filter(u => u.hp > 0);
            this.enemies = this.enemies.filter(e => {
                if (e.hp <= 0) {
                    this.score += 10;
                    return false;
                }
                return true;
            });
            this.bullets = this.bullets.filter(b => {
                b.timer -= dt;
                return b.timer > 0;
            });

            if (this.base.hp <= 0) {
                this.gameState = 'gameover';
            }

            // Update HUD
            this.hud.innerHTML = `광물: ${Math.floor(this.resources)} | 킬수: ${this.score/10} | 기지 체력: ${this.base.hp}/${this.base.maxHp}`;
        },

        draw() {
            // Background
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(0, 0, this.W, this.H);
            
            // Grid
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for(let x=0; x<this.W; x+=40) { this.ctx.moveTo(x,0); this.ctx.lineTo(x,this.H); }
            for(let y=0; y<this.H; y+=40) { this.ctx.moveTo(0,y); this.ctx.lineTo(this.W,y); }
            this.ctx.stroke();

            // Base (Command Center)
            this.ctx.fillStyle = '#0d47a1';
            this.ctx.fillRect(this.base.x - this.base.w/2, this.base.y - this.base.h/2, this.base.w, this.base.h);
            this.ctx.strokeStyle = '#64b5f6';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.base.x - this.base.w/2, this.base.y - this.base.h/2, this.base.w, this.base.h);
            
            // Base HP Bar
            const hpPct = this.base.hp / this.base.maxHp;
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(this.base.x - this.base.w/2, this.base.y - this.base.h/2 - 15, this.base.w, 8);
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(this.base.x - this.base.w/2, this.base.y - this.base.h/2 - 15, this.base.w * hpPct, 8);

            // Marines
            this.units.forEach(u => {
                if (this.marineImg.complete && this.marineImg.width > 0) {
                    this.ctx.drawImage(this.marineImg, u.x - 15, u.y - 15, 30, 30);
                } else {
                    this.ctx.fillStyle = '#42a5f5';
                    this.ctx.beginPath();
                    this.ctx.arc(u.x, u.y, u.radius, 0, Math.PI*2);
                    this.ctx.fill();
                }
                
                // HP Bar
                const uHp = u.hp / u.maxHp;
                this.ctx.fillStyle = '#0f0';
                this.ctx.fillRect(u.x - 10, u.y - 20, 20 * uHp, 4);

                // Selection Ring
                if (u.selected) {
                    this.ctx.strokeStyle = '#0f0';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(u.x, u.y, u.radius + 4, 0, Math.PI*2);
                    this.ctx.stroke();
                }
            });

            // Enemies (Zerglings)
            this.enemies.forEach(e => {
                if (this.alienImg.complete && this.alienImg.width > 0) {
                    this.ctx.drawImage(this.alienImg, e.x - 15, e.y - 15, 30, 30);
                } else {
                    this.ctx.fillStyle = '#9c27b0';
                    this.ctx.beginPath();
                    this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2);
                    this.ctx.fill();
                }
                // HP Bar
                const eHp = e.hp / e.maxHp;
                this.ctx.fillStyle = '#f00';
                this.ctx.fillRect(e.x - 10, e.y - 20, 20 * eHp, 4);
            });

            // Bullets
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 2;
            this.bullets.forEach(b => {
                if (b.type === 'click') {
                    this.ctx.strokeStyle = '#0f0';
                    this.ctx.beginPath();
                    this.ctx.arc(b.x, b.y, b.timer * 20, 0, Math.PI*2);
                    this.ctx.stroke();
                } else {
                    this.ctx.beginPath();
                    this.ctx.moveTo(b.x1, b.y1);
                    this.ctx.lineTo(b.x2, b.y2);
                    this.ctx.stroke();
                }
            });

            // Selection Box
            if (this.mouse.down) {
                this.ctx.strokeStyle = '#0f0';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(this.mouse.startX, this.mouse.startY, this.mouse.x - this.mouse.startX, this.mouse.y - this.mouse.startY);
                this.ctx.setLineDash([]);
            }

            // Game Over Text
            if (this.gameState === 'gameover') {
                this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
                this.ctx.fillRect(0, 0, this.W, this.H);
                this.ctx.fillStyle = '#f00';
                this.ctx.font = 'bold 50px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('GAME OVER', this.W/2, this.H/2 - 20);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '24px sans-serif';
                this.ctx.fillText(`생존 시간: ${Math.floor(this.timer)}초 | 처치: ${this.score/10}`, this.W/2, this.H/2 + 30);
                this.ctx.font = '18px sans-serif';
                this.ctx.fillText('화면을 클릭하여 다시 시작', this.W/2, this.H/2 + 70);
            }
        },

        gameLoop() {
            if (!this.isPlaying) return;
            const now = performance.now();
            const dt = Math.min((now - this.lastTime) / 1000, 0.05);
            this.lastTime = now;

            this.update(dt);
            this.draw();
            
            requestAnimationFrame(() => this.gameLoop());
        },

        close() {
            this.isPlaying = false;
            if (this.overlay) this.overlay.remove();
        }
    }

};
