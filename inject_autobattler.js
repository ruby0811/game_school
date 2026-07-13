const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const autoBattlerStr = `
,
autoBattler: {
    overlay: null, canvas: null, ctx: null, isPlaying: false,
    W: 1000, H: 700,
    mouse: { x: 0, y: 0, down: false },
    lastTime: 0,
    
    // Core states
    gameState: 'prep', // start, prep, combat, result, gameover, win
    round: 1, maxRound: 7,
    prepTimer: 30,
    playerHp: 100,
    gold: 5,
    level: 1, xp: 0,
    
    // Grid (Board + Bench)
    // Board is 8x8 (0-7, 0-7). Player: y=4~7. Enemy: y=0~3.
    // Bench is y=8, x=0~7
    cellSize: 60,
    gridStartX: 0, gridStartY: 0,
    
    units: [], // all active units (player + enemy) in combat or prep
    shop: [], // 5 units
    draggedUnit: null,
    projectiles: [],
    particles: [],
    
    UNIT_DEFS: {
        garen: { name: '가렌', job: 'knight', cost: 1, hp: 600, atk: 50, range: 1, aspd: 1.0, color: '#3498db' },
        darius: { name: '다리우스', job: 'knight', cost: 2, hp: 700, atk: 60, range: 1, aspd: 0.9, color: '#2980b9' },
        vayne: { name: '베인', job: 'ranger', cost: 1, hp: 350, atk: 40, range: 4, aspd: 1.5, color: '#2ecc71' },
        ashe: { name: '애쉬', job: 'ranger', cost: 3, hp: 450, atk: 55, range: 5, aspd: 1.4, color: '#27ae60' },
        ahri: { name: '아리', job: 'mage', cost: 2, hp: 400, atk: 80, range: 3, aspd: 0.8, color: '#9b59b6' },
        lulu: { name: '룰루', job: 'mage', cost: 3, hp: 500, atk: 70, range: 4, aspd: 0.9, color: '#8e44ad' },
        pyke: { name: '파이크', job: 'assassin', cost: 2, hp: 450, atk: 90, range: 1, aspd: 1.2, color: '#e74c3c' },
        rengar: { name: '렝가', job: 'assassin', cost: 3, hp: 500, atk: 110, range: 1, aspd: 1.1, color: '#c0392b' }
    },
    
    AI_WAVES: [
        null,
        [{x:3, y:2, type:'garen', star:1}, {x:4, y:2, type:'vayne', star:1}], // R1
        [{x:3, y:2, type:'garen', star:1}, {x:4, y:2, type:'darius', star:1}, {x:3, y:1, type:'vayne', star:1}], // R2
        [{x:2, y:2, type:'darius', star:1}, {x:5, y:2, type:'darius', star:1}, {x:3, y:1, type:'ahri', star:1}, {x:4, y:1, type:'ashe', star:1}], // R3
        [{x:3, y:2, type:'garen', star:2}, {x:4, y:2, type:'darius', star:2}, {x:2, y:1, type:'ashe', star:1}], // R4
        [{x:2, y:2, type:'garen', star:2}, {x:5, y:2, type:'darius', star:2}, {x:3, y:1, type:'ahri', star:2}, {x:4, y:1, type:'ashe', star:2}], // R5
        [{x:2, y:2, type:'garen', star:2}, {x:5, y:2, type:'darius', star:2}, {x:1, y:1, type:'lulu', star:2}, {x:6, y:1, type:'pyke', star:2}, {x:3, y:1, type:'ahri', star:2}], // R6
        [{x:3, y:2, type:'garen', star:3}, {x:4, y:2, type:'darius', star:3}, {x:3, y:1, type:'ashe', star:3}, {x:4, y:1, type:'lulu', star:3}, {x:2, y:1, type:'rengar', star:3}] // R7
    ],

    init() {
        const { overlay, gameContainer } = MiniGames._createOverlay();
        this.overlay = overlay;
        gameContainer.style.backgroundColor = '#1a1a2e';
        gameContainer.style.width = '1000px';
        gameContainer.style.maxWidth = '95vw';
        gameContainer.style.height = '700px';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.style.cssText = \`position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.6);color:#fff;border:2px solid #fff;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;z-index:9999;font-weight:bold;transition:all 0.2s;\`;
        closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(231, 76, 60, 0.8)'; };
        closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(0,0,0,0.6)'; };
        closeBtn.onclick = () => this.close();
        gameContainer.appendChild(closeBtn);
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.canvas.style.cssText = 'background:#2c3e50; display:block; margin:auto; cursor:default;';
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        gameContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.gridStartX = this.W/2 - (8*this.cellSize)/2;
        this.gridStartY = 80;
        
        this.reset();
        this.bindEvents();
        this.isPlaying = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    reset() {
        this.gameState = 'start';
        this.round = 1;
        this.playerHp = 100;
        this.gold = 5;
        this.level = 1;
        this.xp = 0;
        this.units = [];
        this.projectiles = [];
        this.particles = [];
        this.refreshShop();
    },

    refreshShop() {
        this.shop = [];
        let keys = Object.keys(this.UNIT_DEFS);
        for(let i=0; i<5; i++) {
            let k = keys[Math.floor(Math.random()*keys.length)];
            this.shop.push(k);
        }
    },

    buyXP() {
        if (this.gold >= 4 && this.level < 5) {
            this.gold -= 4;
            this.xp += 4;
            let req = [0, 4, 8, 14, 24][this.level-1];
            if (this.xp >= req) {
                this.xp -= req;
                this.level++;
            }
        }
    },

    getBoardCount() {
        return this.units.filter(u => u.owner === 1 && u.gridY < 8).length;
    },

    buyUnit(index) {
        if (!this.shop[index]) return;
        let type = this.shop[index];
        let def = this.UNIT_DEFS[type];
        if (this.gold >= def.cost) {
            // Find empty bench slot
            let benchUnits = this.units.filter(u => u.owner === 1 && u.gridY === 8);
            let emptyX = -1;
            for(let x=0; x<8; x++) {
                if(!benchUnits.some(u => u.gridX === x)) { emptyX = x; break; }
            }
            
            if (emptyX !== -1) {
                this.gold -= def.cost;
                this.shop[index] = null;
                
                let u = {
                    id: Math.random(), type, star: 1, owner: 1,
                    gridX: emptyX, gridY: 8,
                    x: this.gridStartX + emptyX*this.cellSize + this.cellSize/2,
                    y: this.gridStartY + 8*this.cellSize + this.cellSize/2,
                    ...def
                };
                this.units.push(u);
                this.checkCombine(type);
            }
        }
    },

    checkCombine(type) {
        // combine 1 stars
        let ones = this.units.filter(u => u.owner === 1 && u.type === type && u.star === 1);
        if (ones.length >= 3) {
            ones[0].star = 2;
            this.units = this.units.filter(u => u !== ones[1] && u !== ones[2]);
            this.spawnParticle(ones[0].x, ones[0].y, '#f1c40f', 30);
            
            // combine 2 stars
            let twos = this.units.filter(u => u.owner === 1 && u.type === type && u.star === 2);
            if (twos.length >= 3) {
                twos[0].star = 3;
                this.units = this.units.filter(u => u !== twos[1] && u !== twos[2]);
                this.spawnParticle(twos[0].x, twos[0].y, '#e74c3c', 50);
            }
        }
    },
    
    startCombat() {
        this.gameState = 'combat';
        this.projectiles = [];
        this.particles = [];
        
        // Spawn AI wave
        let wave = this.AI_WAVES[this.round];
        if(wave) {
            wave.forEach(w => {
                let def = this.UNIT_DEFS[w.type];
                this.units.push({
                    id: Math.random(), type: w.type, star: w.star, owner: 2,
                    gridX: w.x, gridY: w.y,
                    x: this.gridStartX + w.x*this.cellSize + this.cellSize/2,
                    y: this.gridStartY + w.y*this.cellSize + this.cellSize/2,
                    ...def
                });
            });
        }
        
        // Setup stats for combat
        this.units.forEach(u => {
            u.maxHp = u.hp * Math.pow(2, u.star-1);
            u.currentHp = u.maxHp;
            u.currentAtk = u.atk * Math.pow(1.5, u.star-1);
            u.atkCd = 0;
            u.startGridX = u.gridX; u.startGridY = u.gridY;
            u.action = 'idle'; u.target = null;
        });

        // Apply Synergies (Player only for simplicity)
        let boardUnits = this.units.filter(u => u.owner === 1 && u.gridY < 8);
        let jobs = {};
        boardUnits.forEach(u => { jobs[u.job] = (jobs[u.job] || 0) + 1; });
        
        boardUnits.forEach(u => {
            if (jobs['knight'] >= 2) u.dmgReduction = 0.3; else u.dmgReduction = 0;
            if (jobs['ranger'] >= 2 && u.job === 'ranger') u.aspd *= 1.5;
            if (jobs['mage'] >= 2) u.currentAtk *= 1.4;
            if (jobs['assassin'] >= 2 && u.job === 'assassin') u.critChance = 0.5; else u.critChance = 0;
            
            // Assassin jump
            if (u.job === 'assassin') {
                u.y = this.gridStartY + 0*this.cellSize + this.cellSize/2; // Jump to enemy backline visually
                u.gridY = 0;
            }
        });
        
        // Also setup enemy assassins
        this.units.filter(u => u.owner === 2).forEach(u => {
            if (u.job === 'assassin') {
                u.y = this.gridStartY + 7*this.cellSize + this.cellSize/2;
                u.gridY = 7;
            }
        });
    },

    bindEvents() {
        this._mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
            
            if (this.draggedUnit) {
                this.draggedUnit.x = this.mouse.x;
                this.draggedUnit.y = this.mouse.y;
            }
        };
        this._mousedown = (e) => {
            if (this.gameState === 'start') {
                this.gameState = 'prep';
                this.prepTimer = 30;
                return;
            }
            if (this.gameState === 'win' || this.gameState === 'gameover') {
                this.reset();
                this.gameState = 'prep';
                this.prepTimer = 30;
                return;
            }
            
            this.mouse.down = true;
            
            if (this.gameState === 'prep') {
                // Shop interaction
                let shopY = this.H - 120;
                if (this.mouse.y >= shopY && this.mouse.y <= shopY + 100) {
                    // Reroll
                    if(this.mouse.x >= 20 && this.mouse.x <= 120) {
                        if(this.gold >= 2) { this.gold-=2; this.refreshShop(); }
                        return;
                    }
                    // Buy XP
                    if(this.mouse.x >= 130 && this.mouse.x <= 230) {
                        this.buyXP();
                        return;
                    }
                    // Buy Units
                    for(let i=0; i<5; i++) {
                        let sx = 250 + i*140;
                        if(this.mouse.x >= sx && this.mouse.x <= sx+130 && this.shop[i]) {
                            this.buyUnit(i);
                            return;
                        }
                    }
                }
                
                // Pick up unit
                let gx = Math.floor((this.mouse.x - this.gridStartX) / this.cellSize);
                let gy = Math.floor((this.mouse.y - this.gridStartY) / this.cellSize);
                
                let clicked = this.units.find(u => u.owner === 1 && u.gridX === gx && u.gridY === gy);
                if (clicked) {
                    this.draggedUnit = clicked;
                }
            }
        };
        this._mouseup = (e) => {
            this.mouse.down = false;
            
            if (this.draggedUnit) {
                let gx = Math.floor((this.mouse.x - this.gridStartX) / this.cellSize);
                let gy = Math.floor((this.mouse.y - this.gridStartY) / this.cellSize);
                
                // Sell unit if dropped in shop area
                if (this.mouse.y > this.H - 120) {
                    this.gold += this.draggedUnit.cost * Math.pow(2, this.draggedUnit.star-1);
                    this.units = this.units.filter(u => u !== this.draggedUnit);
                    this.spawnParticle(this.draggedUnit.x, this.draggedUnit.y, '#f1c40f', 15);
                    this.draggedUnit = null;
                    return;
                }
                
                // Validate drop zone (y=4~7 for board, y=8 for bench)
                if (gx >= 0 && gx < 8 && ((gy >= 4 && gy <= 7) || gy === 8)) {
                    // Check if max units reached on board
                    let isBoard = (gy < 8);
                    let wasBoard = (this.draggedUnit.startGridY < 8); // simplified check using old pos
                    
                    if (isBoard && !wasBoard && this.getBoardCount() >= this.level) {
                        // Return to bench
                    } else {
                        // Swap or place
                        let existing = this.units.find(u => u.gridX === gx && u.gridY === gy && u !== this.draggedUnit);
                        if (existing) {
                            existing.gridX = this.draggedUnit.gridX;
                            existing.gridY = this.draggedUnit.gridY;
                            existing.x = this.gridStartX + existing.gridX*this.cellSize + this.cellSize/2;
                            existing.y = this.gridStartY + existing.gridY*this.cellSize + this.cellSize/2;
                        }
                        this.draggedUnit.gridX = gx;
                        this.draggedUnit.gridY = gy;
                    }
                }
                
                // Snap to grid
                this.draggedUnit.x = this.gridStartX + this.draggedUnit.gridX*this.cellSize + this.cellSize/2;
                this.draggedUnit.y = this.gridStartY + this.draggedUnit.gridY*this.cellSize + this.cellSize/2;
                this.draggedUnit.startGridY = this.draggedUnit.gridY;
                this.draggedUnit = null;
            }
        };
        
        this.canvas.addEventListener('mousemove', this._mousemove);
        this.canvas.addEventListener('mousedown', this._mousedown);
        this.canvas.addEventListener('mouseup', this._mouseup);
    },

    spawnParticle(x, y, color, count) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random()-0.5)*100, vy: (Math.random()-0.5)*100,
                color, age: 0, life: 0.3 + Math.random()*0.3, radius: 2+Math.random()*3
            });
        }
    },

    update(dt) {
        if (this.gameState === 'prep') {
            this.prepTimer -= dt;
            if (this.prepTimer <= 0) {
                // Auto place units if over capacity (not implemented for brevity)
                // Remove excess units from board if needed
                while(this.getBoardCount() > this.level) {
                    let boardUnits = this.units.filter(u => u.owner === 1 && u.gridY < 8);
                    boardUnits[0].gridY = 8; // shove to bench loosely
                    // update vis
                    boardUnits[0].y = this.gridStartY + 8*this.cellSize + this.cellSize/2;
                }
                
                this.startCombat();
            }
        } 
        else if (this.gameState === 'combat') {
            let pAlive = 0, eAlive = 0;
            
            // Combat logic
            let combatUnits = this.units.filter(u => u.gridY < 8 && u.currentHp > 0);
            
            combatUnits.forEach(u => {
                if (u.owner === 1) pAlive++; else eAlive++;
                
                if (u.atkCd > 0) u.atkCd -= dt;
                
                // Find target
                if (!u.target || u.target.currentHp <= 0) {
                    let enemies = combatUnits.filter(e => e.owner !== u.owner);
                    let minDist = Infinity;
                    u.target = null;
                    enemies.forEach(e => {
                        let d = Math.hypot(e.x - u.x, e.y - u.y);
                        if (d < minDist) { minDist = d; u.target = e; }
                    });
                }
                
                if (u.target) {
                    let dist = Math.hypot(u.target.x - u.x, u.target.y - u.y);
                    let rangePx = u.range * this.cellSize;
                    
                    if (dist > rangePx) {
                        // Move
                        let dx = u.target.x - u.x, dy = u.target.y - u.y;
                        u.x += (dx/dist) * 100 * dt;
                        u.y += (dy/dist) * 100 * dt;
                    } else {
                        // Attack
                        if (u.atkCd <= 0) {
                            u.atkCd = 1 / u.aspd;
                            
                            let dmg = u.currentAtk;
                            if (u.critChance && Math.random() < u.critChance) dmg *= 2;
                            if (u.target.dmgReduction) dmg *= (1 - u.target.dmgReduction);
                            
                            if (u.range > 1.5) {
                                // Projectile
                                let angle = Math.atan2(u.target.y - u.y, u.target.x - u.x);
                                this.projectiles.push({
                                    x: u.x, y: u.y,
                                    vx: Math.cos(angle)*400, vy: Math.sin(angle)*400,
                                    dmg: dmg, target: u.target, life: 1
                                });
                            } else {
                                // Melee
                                u.target.currentHp -= dmg;
                                this.spawnParticle(u.target.x, u.target.y, '#e74c3c', 5);
                            }
                        }
                    }
                }
            });
            
            // Projectiles
            for(let i=this.projectiles.length-1; i>=0; i--) {
                let p = this.projectiles[i];
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.life -= dt;
                
                if (p.target.currentHp > 0 && Math.hypot(p.x - p.target.x, p.y - p.target.y) < 20) {
                    p.target.currentHp -= p.dmg;
                    this.spawnParticle(p.target.x, p.target.y, '#e74c3c', 5);
                    this.projectiles.splice(i, 1);
                } else if (p.life <= 0) {
                    this.projectiles.splice(i, 1);
                }
            }
            
            // Check end combat
            if (pAlive === 0 || eAlive === 0) {
                this.gameState = 'result';
                this.prepTimer = 3; // show result for 3 sec
                
                if (pAlive === 0) {
                    this.playerHp -= eAlive * 2; // take damage
                } else {
                    this.gold += 1; // Win bonus
                }
                
                this.gold += 5; // Base income
            }
        }
        else if (this.gameState === 'result') {
            this.prepTimer -= dt;
            if (this.prepTimer <= 0) {
                if (this.playerHp <= 0) {
                    this.gameState = 'gameover';
                } else if (this.round === this.maxRound) {
                    this.gameState = 'win';
                } else {
                    this.round++;
                    // Cleanup enemy, reset player to bench/board
                    this.units = this.units.filter(u => u.owner === 1);
                    this.units.forEach(u => {
                        u.gridX = u.startGridX; u.gridY = u.startGridY;
                        u.x = this.gridStartX + u.gridX*this.cellSize + this.cellSize/2;
                        u.y = this.gridStartY + u.gridY*this.cellSize + this.cellSize/2;
                    });
                    this.gameState = 'prep';
                    this.prepTimer = 30;
                }
            }
        }
        
        // Particles
        for(let i=this.particles.length-1; i>=0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.age += dt;
            if (p.age > p.life) this.particles.splice(i, 1);
        }
    },

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);
        
        if (this.gameState === 'start') {
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 50px Arial'; ctx.textAlign = 'center';
            ctx.fillText('♟️ 오토 배틀러 (Auto Battler)', this.W/2, 120);
            
            ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.textAlign = 'left';
            let sx = this.W/2 - 250;
            ctx.fillText('• 목표: 골드를 모아 상점에서 유닛을 사고, 7라운드까지 몬스터를 처치하세요.', sx, 200);
            ctx.fillText('• 3성 합성: 같은 유닛 3개를 모으면 더 강해집니다 (자동 융합).', sx, 240);
            ctx.fillText('• 시너지: 기사, 정찰대 등 같은 직업을 배치하면 강력한 버프를 받습니다.', sx, 280);
            ctx.fillText('• 조작: 마우스로 대기석의 유닛을 체스판으로 드래그 앤 드롭!', sx, 320);
            ctx.fillText('• 레벨: XP를 구매하여 최대 배치 가능 유닛 수를 늘리세요.', sx, 360);
            
            ctx.fillStyle = '#3498db'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
            ctx.fillText('화면을 클릭하여 시작하세요!', this.W/2, 450);
            return;
        }

        // Draw Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        for(let y=0; y<8; y++) {
            for(let x=0; x<8; x++) {
                ctx.fillStyle = (x+y)%2===0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
                if (y < 4) ctx.fillStyle = (x+y)%2===0 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(231, 76, 60, 0.05)';
                ctx.fillRect(this.gridStartX + x*this.cellSize, this.gridStartY + y*this.cellSize, this.cellSize, this.cellSize);
                ctx.strokeRect(this.gridStartX + x*this.cellSize, this.gridStartY + y*this.cellSize, this.cellSize, this.cellSize);
            }
        }
        
        // Draw Bench
        for(let x=0; x<8; x++) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
            ctx.fillRect(this.gridStartX + x*this.cellSize, this.gridStartY + 8*this.cellSize + 10, this.cellSize, this.cellSize);
            ctx.strokeRect(this.gridStartX + x*this.cellSize, this.gridStartY + 8*this.cellSize + 10, this.cellSize, this.cellSize);
        }

        // Draw Units
        this.units.forEach(u => {
            if (u === this.draggedUnit) return; // draw dragged last
            
            let drawX = u.x, drawY = u.y;
            // slightly shift bench visually
            if (this.gameState === 'prep' && u.gridY === 8) drawY += 10;
            
            // Body
            ctx.fillStyle = u.color;
            ctx.beginPath(); ctx.arc(drawX, drawY, 20 + u.star*2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = u.owner === 1 ? '#3498db' : '#e74c3c';
            ctx.lineWidth = 3; ctx.stroke();
            
            // Star
            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
            ctx.fillText('★'.repeat(u.star), drawX, drawY - 25);
            
            // Job
            ctx.fillStyle = '#fff'; ctx.font = '10px Arial';
            ctx.fillText(u.job, drawX, drawY + 4);
            
            // HP in combat
            if (this.gameState === 'combat' && u.gridY < 8) {
                ctx.fillStyle = '#000'; ctx.fillRect(drawX - 15, drawY + 20, 30, 4);
                ctx.fillStyle = '#2ecc71'; ctx.fillRect(drawX - 15, drawY + 20, 30 * (u.currentHp/u.maxHp), 4);
            }
        });

        // Draw Dragged Unit
        if (this.draggedUnit) {
            let u = this.draggedUnit;
            ctx.fillStyle = u.color;
            ctx.beginPath(); ctx.arc(u.x, u.y, 25, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 4; ctx.stroke();
        }

        // Projectiles
        this.projectiles.forEach(p => {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
        });
        
        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = 1 - (p.age/p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        // UI Header
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, this.W, 60);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'left';
        ctx.fillText(\`라운드: \${this.round} / \${this.maxRound}\`, 20, 35);
        ctx.fillText(\`♥️ HP: \${this.playerHp}\`, 180, 35);
        
        ctx.textAlign = 'center';
        if (this.gameState === 'prep') {
            ctx.fillStyle = '#f1c40f'; ctx.fillText(\`준비 단계 (\${Math.ceil(this.prepTimer)}초)\`, this.W/2, 35);
        } else if (this.gameState === 'combat') {
            ctx.fillStyle = '#e74c3c'; ctx.fillText('전투 진행 중!', this.W/2, 35);
        }
        
        // Synergies tracker
        let boardUnits = this.units.filter(u => u.owner === 1 && u.gridY < 8);
        let jobs = {};
        boardUnits.forEach(u => { jobs[u.job] = (jobs[u.job] || 0) + 1; });
        ctx.textAlign = 'right'; ctx.fillStyle = '#3498db'; ctx.font = '16px Arial';
        let syY = 25;
        for(let j in jobs) {
            ctx.fillText(\`\${j}: \${jobs[j]}\`, this.W - 20, syY);
            syY += 20;
        }

        // Shop UI
        if (this.gameState === 'prep' || this.gameState === 'result') {
            let shopY = this.H - 120;
            ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, shopY, this.W, 120);
            
            // Gold & Level
            ctx.fillStyle = '#f1c40f'; ctx.textAlign = 'left'; ctx.font = 'bold 24px Arial';
            ctx.fillText(\`💰 \${this.gold}\`, 20, shopY - 10);
            ctx.fillStyle = '#3498db';
            let req = [0, 4, 8, 14, 24][this.level-1] || 'Max';
            ctx.fillText(\`Lv.\${this.level} (\${this.xp}/\${req})\`, 150, shopY - 10);
            ctx.fillText(\`유닛 \${this.getBoardCount()} / \${this.level}\`, 350, shopY - 10);
            
            // Buttons
            ctx.fillStyle = '#34495e'; ctx.fillRect(20, shopY + 20, 100, 60);
            ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
            ctx.fillText('리롤 (2)', 70, shopY + 55);
            
            ctx.fillStyle = '#2980b9'; ctx.fillRect(130, shopY + 20, 100, 60);
            ctx.fillStyle = '#fff'; ctx.fillText('XP 구매 (4)', 180, shopY + 55);
            
            // Shop Slots
            for(let i=0; i<5; i++) {
                let sx = 250 + i*140;
                ctx.fillStyle = '#2c3e50'; ctx.fillRect(sx, shopY + 10, 130, 90);
                if (this.shop[i]) {
                    let def = this.UNIT_DEFS[this.shop[i]];
                    ctx.fillStyle = def.color; ctx.fillRect(sx+5, shopY+15, 120, 40);
                    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial'; ctx.fillText(def.name, sx+65, shopY+40);
                    ctx.fillStyle = '#f1c40f'; ctx.fillText(\`💰 \${def.cost}\`, sx+65, shopY+80);
                    ctx.fillStyle = '#bdc3c7'; ctx.font = '12px Arial'; ctx.fillText(def.job, sx+65, shopY+95);
                }
            }
        }

        // Overlay states
        if (this.gameState === 'win') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center';
            ctx.fillText('🏆 승리! 모든 웨이브 방어 완료!', this.W/2, this.H/2);
        } else if (this.gameState === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center';
            ctx.fillText('💥 게임 오버', this.W/2, this.H/2);
        }
    },

    loop(time) {
        if(!this.isPlaying) return;
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame((t) => this.loop(t));
    },

    close() {
        this.isPlaying = false;
        window.removeEventListener('keydown', this._keydown);
        window.removeEventListener('keyup', this._keyup);
        if(this.overlay) this.overlay.remove();
    }
}
`;

minigames = minigames.replace(/}\s*;\s*$/, autoBattlerStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
console.log('Auto Battler game injected!');
