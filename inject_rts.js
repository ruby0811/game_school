const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const rtsGameStr = `
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
            this.hud.innerHTML = \`광물: \${Math.floor(this.resources)} | 킬수: \${this.score/10} | 기지 체력: \${this.base.hp}/\${this.base.maxHp}\`;
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
                this.ctx.fillText(\`생존 시간: \${Math.floor(this.timer)}초 | 처치: \${this.score/10}\`, this.W/2, this.H/2 + 30);
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
`;

// Inject into minigames.js before the final closing brace.
minigames = minigames.replace(/}\s*;\s*$/, rtsGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
