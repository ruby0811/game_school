const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const brGameStr = `
,
battleRoyale: {
    overlay: null, canvas: null, ctx: null, isPlaying: false,
    W: 1000, H: 600,
    MAP_SIZE: 3000,
    camera: { x: 0, y: 0 },
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, down: false },
    keys: {},
    lastTime: 0,
    state: 'start', // start, playing, gameover
    rank: 0,

    entities: [],
    projectiles: [],
    particles: [],
    obstacles: [],
    items: [],
    logMsg: [],
    
    player: null,
    aliveCount: 20,
    
    zone: {
        x: 1500, y: 1500, radius: 2500,
        targetX: 1500, targetY: 1500, targetRadius: 2500,
        phase: 0, timer: 10, state: 'wait', dmg: 2
    },

    WEAPONS: {
        fist: { name: '주먹', type: 'fist', dmg: 10, speed: 0, cd: 0.5, range: 40, color: '#fff', spread: 0, ammo: 0 },
        pistol: { name: '권총 (Pistol)', type: 'pistol', dmg: 15, speed: 800, cd: 0.4, range: 400, color: '#bdc3c7', spread: 0.05, maxAmmo: 15 },
        ar: { name: '돌격소총 (AR)', type: 'ar', dmg: 25, speed: 1200, cd: 0.1, range: 600, color: '#e67e22', spread: 0.08, maxAmmo: 30 },
        sniper: { name: '저격총 (Sniper)', type: 'sniper', dmg: 90, speed: 2000, cd: 1.5, range: 1000, color: '#8e44ad', spread: 0.01, maxAmmo: 5 }
    },

    init() {
        const { overlay, gameContainer } = MiniGames._createOverlay();
        this.overlay = overlay;
        gameContainer.style.backgroundColor = '#111';
        gameContainer.style.width = '1000px';
        gameContainer.style.maxWidth = '95vw';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.style.cssText = \`position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.6);color:#fff;border:2px solid #fff;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;z-index:9999;font-weight:bold;transition:background 0.2s;\`;
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(231, 76, 60, 0.8)';
        closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(0,0,0,0.6)';
        closeBtn.onclick = () => this.close();
        gameContainer.appendChild(closeBtn);
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.canvas.style.cssText = 'background:#4b6584; display:block; margin:auto; box-shadow:0 0 20px #000; cursor:crosshair;';
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        gameContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.reset();
        this.bindEvents();
        this.isPlaying = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    reset() {
        this.state = 'start';
        this.entities = [];
        this.projectiles = [];
        this.particles = [];
        this.obstacles = [];
        this.items = [];
        this.logMsg = [];
        this.player = null;
        this.aliveCount = 20;
        this.rank = 0;
        
        this.zone = { x: 1500, y: 1500, radius: 2500, targetX: 1500, targetY: 1500, targetRadius: 2500, phase: 0, timer: 3, state: 'wait', dmg: 2 };
        this.camera = { x: 0, y: 0 };
    },

    bindEvents() {
        this._mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
            this.mouse.worldX = this.mouse.x + this.camera.x;
            this.mouse.worldY = this.mouse.y + this.camera.y;
        };
        this._mousedown = (e) => {
            if (this.state === 'start') {
                this.startGame();
                return;
            }
            if (e.button === 0) this.mouse.down = true;
        };
        this._mouseup = (e) => {
            if (e.button === 0) this.mouse.down = false;
        };
        this._keydown = (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (this.state === 'playing' && this.player && this.player.hp > 0) {
                if (e.key === '1') this.player.weaponIdx = 0;
                if (e.key === '2' && this.player.weapons.length > 1) this.player.weaponIdx = 1;
                if (e.key.toLowerCase() === 'q') this.useItem('medkit');
                if (e.key.toLowerCase() === 'e') this.useItem('drink');
                if (e.key.toLowerCase() === 'f') this.lootItem();
            }
        };
        this._keyup = (e) => { this.keys[e.key.toLowerCase()] = false; };
        
        this.canvas.addEventListener('mousemove', this._mousemove);
        this.canvas.addEventListener('mousedown', this._mousedown);
        this.canvas.addEventListener('mouseup', this._mouseup);
        window.addEventListener('keydown', this._keydown);
        window.addEventListener('keyup', this._keyup);
    },

    startGame() {
        this.state = 'playing';
        this.setupMap();
        
        // Spawn Player
        this.player = this.spawnEntity(true, 'Player');
        
        // Spawn AI
        for(let i=1; i<20; i++) {
            this.spawnEntity(false, \`Bot_\${i}\`);
        }
        
        this.addLog('배틀로얄이 시작되었습니다! 최후의 1인이 되세요.');
    },

    setupMap() {
        this.obstacles = [];
        this.items = [];
        
        // Generate obstacles (Trees, Rocks, Boxes)
        for(let i=0; i<400; i++) {
            const isTree = Math.random() > 0.3;
            this.obstacles.push({
                x: Math.random() * this.MAP_SIZE,
                y: Math.random() * this.MAP_SIZE,
                radius: isTree ? 25 : 40,
                type: isTree ? 'tree' : 'rock',
                color: isTree ? '#27ae60' : '#7f8c8d'
            });
        }
        
        // Generate initial items
        for(let i=0; i<300; i++) {
            const x = Math.random() * this.MAP_SIZE;
            const y = Math.random() * this.MAP_SIZE;
            const r = Math.random();
            let type = 'pistol';
            if(r > 0.9) type = 'sniper';
            else if(r > 0.6) type = 'ar';
            else if(r > 0.4) type = 'medkit';
            else if(r > 0.2) type = 'drink';
            
            this.items.push({
                id: Math.random(),
                x, y, type, radius: 10
            });
        }
    },

    spawnEntity(isPlayer, name) {
        const x = Math.random() * (this.MAP_SIZE - 200) + 100;
        const y = Math.random() * (this.MAP_SIZE - 200) + 100;
        const ent = {
            id: Math.random().toString(),
            isPlayer, name, x, y, radius: 15,
            hp: 100, maxHp: 100, speed: 120, baseSpeed: 120,
            angle: 0,
            weapons: [{ ...this.WEAPONS.fist, ammo: 0 }],
            weaponIdx: 0, atkCd: 0,
            inventory: { medkit: 0, drink: 0 },
            boostTime: 0,
            // AI states
            targetPos: null, targetEnt: null, state: 'wander', stateTimer: 0
        };
        this.entities.push(ent);
        return ent;
    },
    
    useItem(type) {
        if(this.player.inventory[type] > 0) {
            if(type === 'medkit' && this.player.hp < this.player.maxHp) {
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
                this.player.inventory[type]--;
                this.spawnParticle(this.player.x, this.player.y, '#2ecc71', 20);
                this.addLog('구급상자 사용');
            } else if (type === 'drink') {
                this.player.boostTime = 15; // 15 seconds
                this.player.inventory[type]--;
                this.spawnParticle(this.player.x, this.player.y, '#f1c40f', 20);
                this.addLog('에너지 드링크 사용');
            }
        }
    },

    lootItem() {
        const p = this.player;
        for(let i=this.items.length-1; i>=0; i--) {
            let item = this.items[i];
            if(Math.hypot(p.x - item.x, p.y - item.y) < 50) {
                if (['pistol', 'ar', 'sniper'].includes(item.type)) {
                    if (p.weapons.length < 2) {
                        p.weapons.push({ ...this.WEAPONS[item.type], ammo: this.WEAPONS[item.type].maxAmmo });
                        p.weaponIdx = p.weapons.length - 1;
                    } else {
                        // replace current if not fist
                        if (p.weapons[p.weaponIdx].type !== 'fist') {
                            p.weapons[p.weaponIdx] = { ...this.WEAPONS[item.type], ammo: this.WEAPONS[item.type].maxAmmo };
                        } else {
                            p.weapons[1] = { ...this.WEAPONS[item.type], ammo: this.WEAPONS[item.type].maxAmmo };
                            p.weaponIdx = 1;
                        }
                    }
                    this.addLog(\`\${this.WEAPONS[item.type].name} 획득\`);
                } else {
                    p.inventory[item.type]++;
                    this.addLog(\`\${item.type === 'medkit' ? '구급상자' : '에너지 드링크'} 획득\`);
                }
                this.items.splice(i, 1);
                return; // 1번 누를때 1개만
            }
        }
    },

    spawnParticle(x, y, color, count) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random()-0.5)*200, vy: (Math.random()-0.5)*200,
                color, age: 0, life: 0.3 + Math.random()*0.3, radius: 2+Math.random()*3
            });
        }
    },

    spawnProjectile(x, y, angle, weapon, ownerId) {
        const spread = (Math.random() - 0.5) * weapon.spread;
        const finalAngle = angle + spread;
        this.projectiles.push({
            x, y,
            vx: Math.cos(finalAngle) * weapon.speed,
            vy: Math.sin(finalAngle) * weapon.speed,
            dmg: weapon.dmg, range: weapon.range, traveled: 0,
            ownerId, life: 2
        });
        
        // Muzzle flash
        this.particles.push({
            x: x + Math.cos(angle)*15, y: y + Math.sin(angle)*15,
            vx: 0, vy: 0, color: '#f1c40f', age: 0, life: 0.1, radius: 5
        });
    },

    addLog(msg) {
        this.logMsg.unshift({ text: msg, age: 0 });
        if(this.logMsg.length > 5) this.logMsg.pop();
    },

    updateZone(dt) {
        const z = this.zone;
        if (z.state === 'wait') {
            z.timer -= dt;
            if (z.timer <= 0) {
                z.state = 'shrink';
                z.phase++;
                z.timer = 30; // Shrink duration
                
                // Set new target circle
                z.targetRadius = z.radius * 0.5;
                const maxOffset = z.radius - z.targetRadius;
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * maxOffset;
                z.targetX = z.x + Math.cos(angle) * dist;
                z.targetY = z.y + Math.sin(angle) * dist;
                
                z.dmg = z.phase * 2;
                this.addLog(\`자기장이 줄어들기 시작합니다! (페이즈 \${z.phase})\`);
            }
        } else if (z.state === 'shrink') {
            z.timer -= dt;
            
            // Interpolate
            const t = 1 - (z.timer / 30); // 0 to 1
            z.x += (z.targetX - z.x) * dt / Math.max(0.1, z.timer);
            z.y += (z.targetY - z.y) * dt / Math.max(0.1, z.timer);
            z.radius += (z.targetRadius - z.radius) * dt / Math.max(0.1, z.timer);
            
            if (z.timer <= 0) {
                z.state = 'wait';
                z.timer = 20; // Wait duration before next shrink
                z.x = z.targetX; z.y = z.targetY; z.radius = z.targetRadius;
                this.addLog('자기장이 멈췄습니다. 다음 자기장을 대비하세요.');
            }
        }
    },

    update(dt) {
        if (this.state !== 'playing') return;
        
        this.updateZone(dt);

        // Movement & Logic
        for(let i=this.entities.length-1; i>=0; i--) {
            let e = this.entities[i];
            
            if (e.hp <= 0) {
                this.spawnParticle(e.x, e.y, '#e74c3c', 30);
                // Drop items
                e.weapons.forEach(w => {
                    if(w.type !== 'fist') this.items.push({ id:Math.random(), x: e.x+(Math.random()*40-20), y: e.y+(Math.random()*40-20), type: w.type, radius:10 });
                });
                if(e.inventory.medkit > 0) this.items.push({ id:Math.random(), x: e.x+20, y: e.y, type: 'medkit', radius:10 });
                
                this.aliveCount--;
                this.addLog(\`\${e.name} 사망 (생존자: \${this.aliveCount}명)\`);
                
                if (e.isPlayer) {
                    this.state = 'gameover';
                    this.rank = this.aliveCount + 1;
                } else if (this.aliveCount === 1 && this.player && this.player.hp > 0) {
                    this.state = 'gameover';
                    this.rank = 1;
                }
                
                this.entities.splice(i, 1);
                continue;
            }

            // Blue zone damage
            const distToZone = Math.hypot(e.x - this.zone.x, e.y - this.zone.y);
            if (distToZone > this.zone.radius) {
                e.hp -= this.zone.dmg * dt;
            }

            // Boost effect
            if (e.boostTime > 0) {
                e.boostTime -= dt;
                e.speed = e.baseSpeed * 1.2;
                if(Math.random() < 0.1) this.spawnParticle(e.x, e.y, '#f1c40f', 1);
            } else {
                e.speed = e.baseSpeed;
            }

            e.atkCd -= dt;
            let dx = 0, dy = 0;

            if (e.isPlayer) {
                if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
                if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
                if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
                if (this.keys['d'] || this.keys['arrowright']) dx += 1;
                
                e.angle = Math.atan2(this.mouse.worldY - e.y, this.mouse.worldX - e.x);
                
                // Shoot
                if (this.mouse.down && e.atkCd <= 0) {
                    let w = e.weapons[e.weaponIdx];
                    if (w.type === 'fist') {
                        e.atkCd = w.cd;
                        // Melee attack
                        this.entities.forEach(en => {
                            if(en !== e && Math.hypot(en.x - e.x, en.y - e.y) < w.range + en.radius) en.hp -= w.dmg;
                        });
                        this.spawnParticle(e.x + Math.cos(e.angle)*20, e.y + Math.sin(e.angle)*20, '#fff', 5);
                    } else if (w.ammo > 0) {
                        w.ammo--;
                        e.atkCd = w.cd;
                        this.spawnProjectile(e.x, e.y, e.angle, w, e.id);
                    } else {
                        // Reload or out of ammo visually (just tick sound or swap)
                    }
                }
                
                // Pick up items (auto pick up ammo? let's just make weapons replenish ammo if picked up again)
                
            } else {
                // AI Logic
                e.stateTimer -= dt;
                
                // See if enemy in sight
                e.targetEnt = null;
                let minDist = 800;
                this.entities.forEach(en => {
                    if (en !== e) {
                        let d = Math.hypot(en.x - e.x, en.y - e.y);
                        if (d < minDist) { minDist = d; e.targetEnt = en; }
                    }
                });
                
                if (e.targetEnt) {
                    e.state = 'combat';
                    e.targetPos = null;
                } else if (distToZone > this.zone.radius - 100) {
                    e.state = 'run_zone';
                    e.targetPos = { x: this.zone.x, y: this.zone.y };
                } else if (e.stateTimer <= 0) {
                    // Wander or find loot
                    e.stateTimer = 2 + Math.random()*3;
                    let closestItem = null, minIDist = 400;
                    this.items.forEach(it => {
                        let d = Math.hypot(it.x - e.x, it.y - e.y);
                        if(d < minIDist) { minIDist=d; closestItem=it; }
                    });
                    
                    if(closestItem && e.weapons.length < 2) {
                        e.state = 'loot';
                        e.targetPos = { x: closestItem.x, y: closestItem.y };
                    } else {
                        e.state = 'wander';
                        e.targetPos = { x: e.x + (Math.random()-0.5)*500, y: e.y + (Math.random()-0.5)*500 };
                    }
                }
                
                // Execute state
                if (e.state === 'combat' && e.targetEnt) {
                    e.angle = Math.atan2(e.targetEnt.y - e.y, e.targetEnt.x - e.x);
                    let w = e.weapons[e.weaponIdx];
                    // Swap to best weapon if has AR/Sniper
                    if (e.weapons.length > 1 && w.type === 'fist') e.weaponIdx = 1;
                    w = e.weapons[e.weaponIdx];
                    
                    if (minDist > w.range * 0.8) {
                        dx = Math.cos(e.angle); dy = Math.sin(e.angle);
                    } else if (minDist < w.range * 0.4) { // retreat a bit
                        dx = -Math.cos(e.angle); dy = -Math.sin(e.angle);
                    }
                    
                    if (e.atkCd <= 0) {
                        if(w.type === 'fist' && minDist < w.range + e.radius) {
                            e.targetEnt.hp -= w.dmg; e.atkCd = w.cd;
                        } else if (w.type !== 'fist' && w.ammo > 0) {
                            w.ammo--; e.atkCd = w.cd;
                            this.spawnProjectile(e.x, e.y, e.angle, w, e.id);
                        }
                    }
                } else if (e.targetPos) {
                    let a = Math.atan2(e.targetPos.y - e.y, e.targetPos.x - e.x);
                    e.angle = a;
                    dx = Math.cos(a); dy = Math.sin(a);
                    if(Math.hypot(e.targetPos.x - e.x, e.targetPos.y - e.y) < 10) e.targetPos = null;
                }
                
                // AI loot
                this.items.forEach((it, idx) => {
                    if(Math.hypot(it.x - e.x, it.y - e.y) < 20) {
                        if(['pistol', 'ar', 'sniper'].includes(it.type) && e.weapons.length < 2) {
                            e.weapons.push({ ...this.WEAPONS[it.type], ammo: this.WEAPONS[it.type].maxAmmo });
                            e.weaponIdx = e.weapons.length - 1;
                            this.items.splice(idx, 1);
                        }
                    }
                });
                
                // AI Heal
                if(e.hp < e.maxHp * 0.4 && e.inventory && e.inventory.medkit > 0) {
                    e.hp = Math.min(e.maxHp, e.hp + 50);
                    e.inventory.medkit--;
                }
            }

            // Normalize & Move
            const mag = Math.hypot(dx, dy);
            if (mag > 0) {
                const nx = e.x + (dx/mag) * e.speed * dt;
                const ny = e.y + (dy/mag) * e.speed * dt;
                
                // Map Bounds
                let validX = Math.max(0, Math.min(this.MAP_SIZE, nx));
                let validY = Math.max(0, Math.min(this.MAP_SIZE, ny));
                
                // Obstacle collision
                this.obstacles.forEach(ob => {
                    let d = Math.hypot(validX - ob.x, validY - ob.y);
                    if (d < e.radius + ob.radius) {
                        let a = Math.atan2(validY - ob.y, validX - ob.x);
                        validX = ob.x + Math.cos(a) * (e.radius + ob.radius);
                        validY = ob.y + Math.sin(a) * (e.radius + ob.radius);
                    }
                });
                
                e.x = validX; e.y = validY;
            }
        }

        // Projectiles
        for(let i=this.projectiles.length-1; i>=0; i--) {
            let p = this.projectiles[i];
            let mx = p.vx * dt;
            let my = p.vy * dt;
            p.x += mx; p.y += my;
            p.traveled += Math.hypot(mx, my);
            p.life -= dt;
            
            let hit = false;
            // Hit obstacle
            for(let ob of this.obstacles) {
                if(Math.hypot(p.x - ob.x, p.y - ob.y) < ob.radius) { hit = true; this.spawnParticle(p.x, p.y, '#95a5a6', 3); break; }
            }
            // Hit entity
            if(!hit) {
                for(let e of this.entities) {
                    if(e.id !== p.ownerId && e.hp > 0 && Math.hypot(p.x - e.x, p.y - e.y) < e.radius + 5) {
                        e.hp -= p.dmg;
                        this.spawnParticle(p.x, p.y, '#e74c3c', 5);
                        hit = true; break;
                    }
                }
            }
            
            if (hit || p.life <= 0 || p.traveled > p.range) this.projectiles.splice(i, 1);
        }

        // Particles
        for(let i=this.particles.length-1; i>=0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.age += dt;
            if (p.age > p.life) this.particles.splice(i, 1);
        }
        
        // Log
        this.logMsg.forEach(l => l.age += dt);
        this.logMsg = this.logMsg.filter(l => l.age < 5);

        // Camera
        if (this.player) {
            this.camera.x = this.player.x - this.W/2;
            this.camera.y = this.player.y - this.H/2;
            this.camera.x = Math.max(0, Math.min(this.MAP_SIZE - this.W, this.camera.x));
            this.camera.y = Math.max(0, Math.min(this.MAP_SIZE - this.H, this.camera.y));
        }
    },

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.W, this.H);
        
        if (this.state === 'start') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 50px Arial';
            ctx.fillText('🪂 BATTLE ROYALE', this.W/2, this.H/2 - 50);
            ctx.font = '24px Arial';
            ctx.fillStyle = '#f1c40f';
            ctx.fillText('화면을 클릭하여 낙하하세요!', this.W/2, this.H/2 + 20);
            return;
        }
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Map Grid / Grass
        ctx.fillStyle = '#a1c4fd'; // water outside map
        ctx.fillRect(this.camera.x, this.camera.y, this.W, this.H);
        
        ctx.fillStyle = '#55efc4'; // grass
        ctx.fillRect(0, 0, this.MAP_SIZE, this.MAP_SIZE);
        
        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x<=this.MAP_SIZE; x+=100) { ctx.moveTo(x,0); ctx.lineTo(x,this.MAP_SIZE); }
        for(let y=0; y<=this.MAP_SIZE; y+=100) { ctx.moveTo(0,y); ctx.lineTo(this.MAP_SIZE,y); }
        ctx.stroke();

        // Safe Zone (Blue zone outside)
        ctx.fillStyle = 'rgba(9, 132, 227, 0.3)'; // blue tint outside
        ctx.beginPath();
        ctx.rect(0, 0, this.MAP_SIZE, this.MAP_SIZE);
        ctx.arc(this.zone.x, this.zone.y, this.zone.radius, 0, Math.PI*2, true);
        ctx.fill();
        
        // Safe Zone border
        ctx.strokeStyle = '#0984e3'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(this.zone.x, this.zone.y, this.zone.radius, 0, Math.PI*2); ctx.stroke();
        
        // Next Safe Zone
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.arc(this.zone.targetX, this.zone.targetY, this.zone.targetRadius, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);

        // Items
        this.items.forEach(it => {
            if(it.type === 'medkit') ctx.fillStyle = '#ff7675';
            else if(it.type === 'drink') ctx.fillStyle = '#74b9ff';
            else ctx.fillStyle = '#2d3436'; // weapons
            
            ctx.beginPath(); ctx.arc(it.x, it.y, it.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke();
            
            if(it.type === 'medkit') {
                ctx.fillStyle='#fff'; ctx.fillRect(it.x-4, it.y-1, 8, 2); ctx.fillRect(it.x-1, it.y-4, 2, 8);
            }
        });

        // Entities
        this.entities.forEach(e => {
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate(e.angle);
            
            // Body
            ctx.fillStyle = e.isPlayer ? '#0984e3' : '#d63031';
            ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 3; ctx.stroke();
            
            // Hands / Weapon
            ctx.fillStyle = '#ffeaa7';
            ctx.beginPath(); ctx.arc(10, 10, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(10, -10, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            
            let w = e.weapons[e.weaponIdx];
            if (w.type !== 'fist') {
                ctx.fillStyle = w.color;
                let length = w.type==='sniper' ? 30 : (w.type==='ar' ? 25 : 15);
                ctx.fillRect(5, 5, length, 6);
            }
            
            ctx.restore();
            
            // Name tag & HP
            if (e.isPlayer || Math.hypot(e.x - this.player.x, e.y - this.player.y) < 400) {
                ctx.fillStyle = '#c0392b'; ctx.fillRect(e.x - 15, e.y - e.radius - 12, 30, 4);
                ctx.fillStyle = '#2ecc71'; ctx.fillRect(e.x - 15, e.y - e.radius - 12, 30 * (e.hp/e.maxHp), 4);
            }
        });

        // Obstacles
        this.obstacles.forEach(ob => {
            ctx.fillStyle = ob.color;
            ctx.beginPath(); ctx.arc(ob.x, ob.y, ob.radius, 0, Math.PI*2); ctx.fill();
            if(ob.type === 'tree') {
                ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(ob.x+5, ob.y-5, ob.radius*0.6, 0, Math.PI*2); ctx.fill();
            }
            ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth=2; ctx.stroke();
        });

        // Projectiles
        ctx.fillStyle = '#f1c40f';
        this.projectiles.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
        });
        
        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = 1 - (p.age/p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1.0;
        });
        
        ctx.restore();

        // UI / HUD
        if (this.state === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.textAlign = 'center';
            if (this.rank === 1) {
                ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 60px Arial';
                ctx.fillText('🏆 WINNER WINNER CHICKEN DINNER! 🏆', this.W/2, this.H/2);
            } else {
                ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 60px Arial';
                ctx.fillText(\`#\${this.rank} 등\`, this.W/2, this.H/2 - 20);
                ctx.fillStyle = '#fff'; ctx.font = '24px Arial';
                ctx.fillText('조금만 더 버티면 이길 수 있었는데!', this.W/2, this.H/2 + 30);
            }
            return;
        }

        // Alive Count
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(this.W - 120, 10, 110, 40);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
        ctx.fillText(\`Alive: \${this.aliveCount}\`, this.W - 65, 38);
        
        // Minimap
        const mmSize = 150, padding = 20;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(this.W - mmSize - padding, this.H - mmSize - padding, mmSize, mmSize);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(this.W - mmSize - padding, this.H - mmSize - padding, mmSize, mmSize);
        const scale = mmSize / this.MAP_SIZE;
        
        // Minimap Zone
        ctx.fillStyle = 'rgba(9, 132, 227, 0.4)';
        ctx.beginPath();
        ctx.rect(this.W - mmSize - padding, this.H - mmSize - padding, mmSize, mmSize);
        ctx.arc(this.W - mmSize - padding + this.zone.x * scale, this.H - mmSize - padding + this.zone.y * scale, this.zone.radius * scale, 0, Math.PI*2, true);
        ctx.fill();
        ctx.strokeStyle = '#0984e3'; ctx.beginPath(); ctx.arc(this.W - mmSize - padding + this.zone.x * scale, this.H - mmSize - padding + this.zone.y * scale, this.zone.radius * scale, 0, Math.PI*2); ctx.stroke();
        
        // Minimap Player
        if(this.player) {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(this.W - mmSize - padding + this.player.x * scale, this.H - mmSize - padding + this.player.y * scale, 3, 0, Math.PI*2); ctx.fill();
        }

        // Weapon & Items
        if (this.player) {
            // HP
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(this.W/2 - 150, this.H - 50, 300, 20);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(this.W/2 - 150, this.H - 50, 300 * (this.player.hp/this.player.maxHp), 20);
            ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.fillText(\`HP: \${Math.floor(this.player.hp)}\`, this.W/2, this.H - 35);
            
            // Weapons
            ctx.textAlign = 'left';
            this.player.weapons.forEach((w, idx) => {
                ctx.fillStyle = idx === this.player.weaponIdx ? 'rgba(46, 204, 113, 0.8)' : 'rgba(0,0,0,0.5)';
                ctx.fillRect(padding, this.H - 120 + idx*50, 180, 40);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
                ctx.fillText(\`[\${idx+1}] \${w.name} (\${w.ammo})\`, padding + 10, this.H - 95 + idx*50);
            });
            
            // Inventory
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(padding + 200, this.H - 120, 120, 40);
            ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
            ctx.fillText(\`[Q] 구급상자: \${this.player.inventory.medkit}\`, padding + 210, this.H - 95);
            
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(padding + 200, this.H - 70, 120, 40);
            ctx.fillStyle = '#fff';
            ctx.fillText(\`[E] 드링크: \${this.player.inventory.drink}\`, padding + 210, this.H - 45);
            
            // Interact prompt
            let canLoot = false;
            this.items.forEach(it => { if(Math.hypot(this.player.x - it.x, this.player.y - it.y) < 50) canLoot = true; });
            if(canLoot) {
                ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
                ctx.fillText('[F] 줍기', this.W/2, this.H/2 + 50);
            }
        }
        
        // Logs
        ctx.textAlign = 'right'; ctx.font = '14px Arial';
        this.logMsg.forEach((l, i) => {
            ctx.fillStyle = \`rgba(255, 255, 255, \${1 - l.age/5})\`;
            ctx.fillText(l.text, this.W - 20, 70 + i*20);
        });
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

minigames = minigames.replace(/}\s*;\s*$/, brGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
console.log('Battle Royale game injected!');
