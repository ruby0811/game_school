const fs = require('fs');

let minigames = fs.readFileSync('minigames.js', 'utf8');

const sportsGameStr = `
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
            this.scoreEl.innerText = \`Goals: 0 / Attempts: 0 (Max 5)\`;
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
            this.scoreEl.innerText = \`Goals: \${this.score} / Attempts: \${this.attempts} (Max 5)\`;
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
                        this.message = \`게임 종료! 최종 점수: \${this.score} / \${this.maxAttempts} \\n다시 하려면 클릭하세요.\`;
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
                    this.scoreEl.innerText = \`Goals: \${this.score} / Attempts: \${this.attempts} (Max 5)\`;
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
                
                const lines = this.message.split('\\n');
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
`;

// Inject into minigames.js before the final closing brace.
minigames = minigames.replace(/}\s*;\s*$/, sportsGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
