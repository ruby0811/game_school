const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const sandboxGameStr = `
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
            instr.innerHTML = \`<span style="color:#fff;text-shadow:1px 1px 2px #000;font-family:sans-serif;font-weight:bold;background:rgba(0,0,0,0.5);padding:5px 10px;border-radius:5px;">
                A/D: 이동 | W/Space: 점프 | 좌클릭: 부수기 | 우클릭: 설치 | 1~7: 블록 선택
            </span>\`;
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
`;

// Inject into minigames.js before the final closing brace.
minigames = minigames.replace(/}\s*;\s*$/, sandboxGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
