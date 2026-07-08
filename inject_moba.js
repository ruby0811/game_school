const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const mobaGameStr = `
,
moba: {
    overlay: null, canvas: null, ctx: null, isPlaying: false,
    W: 1000, H: 600,
    MAP_W: 2400, MAP_H: 1600,
    camera: { x: 0, y: 0, locked: true },
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0 },
    keys: {},
    lastTime: 0,
    state: 'select', // select, playing, gameover

    gold: 0,
    level: 1,
    exp: 0,
    maxExp: 100,
    
    entities: [],
    projectiles: [],
    particles: [],
    buildings: [],
    logMsg: [],
    
    // Wave timer
    waveTimer: 0,
    
    CHAMP_DEFS: {
        gaia: { name: '가이아', icon: '⚔️', hp: 900, atk: 60, range: 60, speed: 180, color: '#e74c3c', role: 'fighter', maxHp: 900 },
        aria: { name: '아리아', icon: '🔮', hp: 550, atk: 75, range: 250, speed: 150, color: '#9b59b6', role: 'mage', maxHp: 550 },
        tang: { name: '탱', icon: '🛡️', hp: 1300, atk: 40, range: 70, speed: 130, color: '#3498db', role: 'tank', maxHp: 1300 }
    },

    LANES: {
        top: [ {x:200,y:1400}, {x:200,y:200}, {x:2200,y:200} ],
        mid: [ {x:200,y:1400}, {x:1200,y:800}, {x:2200,y:200} ],
        bot: [ {x:200,y:1400}, {x:2200,y:1400}, {x:2200,y:200} ]
    },

    init() {
        const { overlay, gameContainer } = MiniGames._createOverlay();
        this.overlay = overlay;
        gameContainer.style.backgroundColor = '#111';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.canvas.style.cssText = 'background:#2c3e50; display:block; margin:auto; box-shadow:0 0 20px #000;';
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
        this.state = 'select';
        this.entities = [];
        this.projectiles = [];
        this.particles = [];
        this.buildings = [];
        this.logMsg = [];
        this.gold = 0;
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;
        this.waveTimer = 20;
        this.player = null;
        this.camera = { x: 0, y: 0, locked: true };
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
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.W / rect.width);
            const my = (e.clientY - rect.top) * (this.H / rect.height);
            
            if (this.state === 'select') {
                const cardW = 200, cardH = 300, gap = 50;
                const startX = this.W/2 - (cardW*3 + gap*2)/2;
                let i = 0;
                for (let k in this.CHAMP_DEFS) {
                    const cx = startX + i*(cardW+gap);
                    const cy = this.H/2 - cardH/2;
                    if (mx >= cx && mx <= cx+cardW && my >= cy && my <= cy+cardH) {
                        this.startGame(k);
                        break;
                    }
                    i++;
                }
                return;
            }
            
            if (this.state === 'playing' && this.player) {
                // Right click move/attack
                if (e.button === 2) {
                    this.player.targetPos = { x: this.mouse.worldX, y: this.mouse.worldY };
                    this.player.targetEnt = this.findEntityAt(this.mouse.worldX, this.mouse.worldY);
                    this.spawnParticle(this.mouse.worldX, this.mouse.worldY, '#2ecc71', 'ping');
                }
                // Left click attack
                if (e.button === 0) {
                    this.player.targetEnt = this.findEntityAt(this.mouse.worldX, this.mouse.worldY);
                    if(this.player.targetEnt && this.player.targetEnt.team !== this.player.team) {
                        this.spawnParticle(this.mouse.worldX, this.mouse.worldY, '#e74c3c', 'ping');
                    }
                }
            }
        };
        this._keydown = (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' && this.player) {
                this.camera.locked = !this.camera.locked;
            }
            if (this.state === 'playing' && this.player) {
                if (e.key.toLowerCase() === 'q') this.useSkill('q');
                if (e.key.toLowerCase() === 'w') this.useSkill('w');
                if (e.key.toLowerCase() === 'e') this.useSkill('e');
                if (e.key.toLowerCase() === 'r') this.useSkill('r');
            }
        };
        this._keyup = (e) => { this.keys[e.key.toLowerCase()] = false; };
        
        this.canvas.addEventListener('mousemove', this._mousemove);
        this.canvas.addEventListener('mousedown', this._mousedown);
        window.addEventListener('keydown', this._keydown);
        window.addEventListener('keyup', this._keyup);
    },
    
    startGame(champKey) {
        this.state = 'playing';
        this.setupMap();
        
        // Spawn Player
        this.player = this.spawnEntity(champKey, 'blue', 'player', 200, 1400);
        this.player.isPlayer = true;
        
        // Spawn Allies (4)
        const roles = ['gaia', 'aria', 'tang', 'aria'];
        const lanes = ['top', 'mid', 'bot', 'bot'];
        for(let i=0; i<4; i++) {
            let ally = this.spawnEntity(roles[i], 'blue', 'ai', 200+Math.random()*50, 1400-Math.random()*50);
            ally.lane = lanes[i];
        }
        
        // Spawn Enemies (5)
        const eRoles = ['gaia', 'aria', 'tang', 'aria', 'gaia'];
        const eLanes = ['top', 'mid', 'bot', 'bot', 'top']; // Example
        for(let i=0; i<5; i++) {
            let enemy = this.spawnEntity(eRoles[i], 'red', 'ai', 2200-Math.random()*50, 200+Math.random()*50);
            enemy.lane = eLanes[i];
        }
        
        this.addLog('Welcome to Summoner\\'s Rift!');
    },
    
    setupMap() {
        // Blue Turrets
        this.spawnBuilding('turret', 'blue', 200, 1000); // Top
        this.spawnBuilding('turret', 'blue', 1000, 200); // Top
        
        this.spawnBuilding('turret', 'blue', 600, 1000); // Mid
        this.spawnBuilding('turret', 'blue', 1600, 1000); // Bot
        this.spawnBuilding('nexus', 'blue', 100, 1500);
        
        // Red Turrets
        this.spawnBuilding('turret', 'red', 1400, 200); // Top? no wait, lane coords
        // Let's use lane coords
        this.spawnBuilding('turret', 'blue', this.LANES.top[0].x, this.LANES.top[0].y - 400); // Top T1
        this.spawnBuilding('turret', 'blue', this.LANES.mid[0].x + 400, this.LANES.mid[0].y - 400); // Mid T1
        this.spawnBuilding('turret', 'blue', this.LANES.bot[0].x + 400, this.LANES.bot[0].y); // Bot T1
        
        this.spawnBuilding('turret', 'red', this.LANES.top[2].x - 400, this.LANES.top[2].y); // Top T1
        this.spawnBuilding('turret', 'red', this.LANES.mid[2].x - 400, this.LANES.mid[2].y + 400); // Mid T1
        this.spawnBuilding('turret', 'red', this.LANES.bot[2].x, this.LANES.bot[2].y + 400); // Bot T1
        
        this.spawnBuilding('nexus', 'red', 2300, 100);
    },
    
    spawnBuilding(type, team, x, y) {
        this.buildings.push({
            type, team, x, y,
            hp: type === 'nexus' ? 4000 : 1500,
            maxHp: type === 'nexus' ? 4000 : 1500,
            range: 180,
            atk: type === 'turret' ? 80 : 0,
            atkCd: 0,
            radius: type === 'nexus' ? 60 : 30
        });
    },
    
    spawnEntity(champKey, team, type, x, y) {
        const def = this.CHAMP_DEFS[champKey];
        const ent = {
            id: Math.random().toString(),
            champ: champKey,
            team, type, x, y,
            hp: def.hp, maxHp: def.maxHp,
            atk: def.atk, range: def.range, speed: def.speed, color: def.color,
            radius: 15,
            targetPos: null, targetEnt: null,
            atkCd: 0,
            skills: { q:0, w:0, e:0, r:0 },
            state: 'idle',
            laneIndex: 0
        };
        this.entities.push(ent);
        return ent;
    },
    
    spawnMinion(team, laneKey) {
        const path = this.LANES[laneKey];
        const startIdx = team === 'blue' ? 0 : path.length-1;
        const start = path[startIdx];
        
        this.entities.push({
            id: Math.random().toString(),
            champ: 'minion', team, type: 'minion',
            x: start.x + (Math.random()*40-20), y: start.y + (Math.random()*40-20),
            hp: 120, maxHp: 120, atk: 15, range: 40, speed: 70, color: team==='blue'?'#2980b9':'#c0392b',
            radius: 8,
            lane: laneKey,
            laneIndex: team === 'blue' ? 1 : path.length-2,
            targetPos: null, targetEnt: null, atkCd: 0
        });
    },
    
    spawnParticle(x, y, color, type) {
        this.particles.push({ x, y, color, type, age: 0, life: 0.5, radius: type==='ping'?2:5 });
    },
    
    spawnProjectile(x, y, tx, ty, speed, dmg, team, targetId) {
        const dx = tx-x, dy = ty-y;
        const dist = Math.hypot(dx, dy);
        this.projectiles.push({
            x, y, vx: (dx/dist)*speed, vy: (dy/dist)*speed,
            dmg, team, targetId, life: 2
        });
    },

    findEntityAt(x, y) {
        // Check buildings first
        for(let b of this.buildings) {
            if (b.hp > 0 && Math.hypot(b.x - x, b.y - y) < b.radius + 10) return b;
        }
        // Then entities
        for(let e of this.entities) {
            if (e.hp > 0 && Math.hypot(e.x - x, e.y - y) < e.radius + 10) return e;
        }
        return null;
    },
    
    getDistance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    },
    
    getClosestEnemy(ent, maxDist) {
        let closest = null, minDist = maxDist;
        for(let e of this.entities) {
            if (e.team !== ent.team && e.hp > 0) {
                let d = this.getDistance(ent, e);
                if (d < minDist) { minDist = d; closest = e; }
            }
        }
        for(let b of this.buildings) {
            if (b.team !== ent.team && b.hp > 0) {
                let d = this.getDistance(ent, b);
                if (d < minDist) { minDist = d; closest = b; }
            }
        }
        return closest;
    },

    useSkill(key) {
        const p = this.player;
        if (p.skills[key] > 0) return; // on cooldown
        
        let cd = 0;
        if (key === 'q') {
            cd = 5;
            // Q skill logic
            if (p.champ === 'gaia') { // Dash
                if(p.targetPos) {
                    const d = this.getDistance(p, p.targetPos);
                    p.x += (p.targetPos.x - p.x)/d * 100;
                    p.y += (p.targetPos.y - p.y)/d * 100;
                    this.spawnParticle(p.x, p.y, p.color, 'explosion');
                }
            } else if (p.champ === 'aria') { // Magic Missle
                let t = this.getClosestEnemy(p, 300);
                if(t) this.spawnProjectile(p.x, p.y, t.x, t.y, 300, p.atk*1.5, p.team, t.id);
            } else if (p.champ === 'tang') { // Stomp
                this.spawnParticle(p.x, p.y, '#ccc', 'explosion');
                this.entities.forEach(e => {
                    if(e.team !== p.team && this.getDistance(p,e) < 100) e.hp -= p.atk*1.2;
                });
            }
        } else if (key === 'w') {
            cd = 20;
            if (p.champ === 'tang') {
                p.hp = Math.min(p.maxHp, p.hp + 200); // Shield effect (heal for now)
            } else {
                p.hp = Math.min(p.maxHp, p.hp + p.maxHp*0.15); // Heal 15%
            }
            this.spawnParticle(p.x, p.y, '#2ecc71', 'explosion');
        } else if (key === 'e') {
            cd = 8;
            p.atkCd = 0; // reset attack cd
            this.spawnParticle(p.x, p.y, '#f1c40f', 'explosion');
        } else if (key === 'r') {
            cd = 60;
            this.spawnParticle(p.x, p.y, '#e74c3c', 'explosion');
            this.entities.forEach(e => {
                if(e.team !== p.team && this.getDistance(p,e) < 200) e.hp -= p.atk*3;
            });
        }
        p.skills[key] = cd;
    },

    addLog(msg) {
        this.logMsg.unshift({ text: msg, age: 0 });
        if(this.logMsg.length > 5) this.logMsg.pop();
    },

    gainExp(amt) {
        this.exp += amt;
        if (this.exp >= this.maxExp && this.level < 18) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp *= 1.2;
            this.player.maxHp += 50;
            this.player.hp += 50;
            this.player.atk += 5;
            this.addLog(\`Level Up! (Lv.\${this.level})\`);
            this.spawnParticle(this.player.x, this.player.y, '#f1c40f', 'explosion');
        }
    },

    update(dt) {
        if (this.state !== 'playing') return;
        
        // Spawn Minions
        this.waveTimer -= dt;
        if (this.waveTimer <= 0) {
            this.waveTimer = 20;
            ['top', 'mid', 'bot'].forEach(lane => {
                for(let i=0; i<3; i++) {
                    setTimeout(() => this.spawnMinion('blue', lane), i*1000);
                    setTimeout(() => this.spawnMinion('red', lane), i*1000);
                }
            });
            this.addLog('미니언 생성됨');
        }

        // Camera Logic
        if (this.camera.locked && this.player) {
            this.camera.x = this.player.x - this.W/2;
            this.camera.y = this.player.y - this.H/2;
        } else {
            const camSpeed = 500 * dt;
            if (this.keys['arrowleft'] || this.keys['a']) this.camera.x -= camSpeed;
            if (this.keys['arrowright'] || this.keys['d']) this.camera.x += camSpeed;
            if (this.keys['arrowup'] || this.keys['w']) this.camera.y -= camSpeed;
            if (this.keys['arrowdown'] || this.keys['s']) this.camera.y += camSpeed;
        }
        
        // Clamp camera
        this.camera.x = Math.max(0, Math.min(this.MAP_W - this.W, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.MAP_H - this.H, this.camera.y));

        // Update Projectiles
        for(let i=this.projectiles.length-1; i>=0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            
            // Hit check
            let hit = false;
            let targetEnt = this.entities.find(e => e.id === p.targetId) || this.buildings.find(b => b.id === p.targetId); // buildings don't have id usually, hacky
            if(targetEnt && this.getDistance(p, targetEnt) < targetEnt.radius + 10) {
                targetEnt.hp -= p.dmg;
                this.spawnParticle(p.x, p.y, '#e74c3c', 'hit');
                hit = true;
            }
            
            if (hit || p.life <= 0) this.projectiles.splice(i, 1);
        }

        // Update Buildings
        for(let b of this.buildings) {
            if(b.hp <= 0) continue;
            if(b.atk > 0) {
                b.atkCd -= dt;
                if(b.atkCd <= 0) {
                    let t = this.getClosestEnemy(b, b.range);
                    if(t) {
                        this.spawnProjectile(b.x, b.y, t.x, t.y, 400, b.atk, b.team, t.id);
                        b.atkCd = 1.5;
                    }
                }
            }
        }

        // Update Entities
        for(let i=this.entities.length-1; i>=0; i--) {
            let e = this.entities[i];
            if (e.hp <= 0) {
                if(e.type === 'minion') {
                    if(e.team !== 'blue' && this.player && this.getDistance(e, this.player) < 500) {
                        this.gold += 20;
                        this.gainExp(10);
                    }
                } else if (e.type === 'ai') {
                    if(e.team !== 'blue') {
                        this.gold += 300;
                        this.gainExp(50);
                        this.addLog(\`적 \${this.CHAMP_DEFS[e.champ].name} 처치!\`);
                    }
                } else if (e.isPlayer) {
                    this.state = 'gameover';
                }
                this.entities.splice(i, 1);
                continue;
            }

            // Skill CDs
            for(let k in e.skills) {
                if(e.skills[k] > 0) e.skills[k] -= dt;
            }
            if(e.atkCd > 0) e.atkCd -= dt;

            // AI Logic
            if (!e.isPlayer) {
                // Find target
                if (!e.targetEnt || e.targetEnt.hp <= 0) {
                    e.targetEnt = this.getClosestEnemy(e, e.type === 'minion' ? 200 : 300);
                }
                
                // If minion and no target, follow lane
                if (!e.targetEnt && e.type === 'minion') {
                    const path = this.LANES[e.lane];
                    if (path && path[e.laneIndex]) {
                        e.targetPos = { x: path[e.laneIndex].x, y: path[e.laneIndex].y };
                        if (this.getDistance(e, e.targetPos) < 50) {
                            if (e.team === 'blue') e.laneIndex++; else e.laneIndex--;
                        }
                    }
                }
                
                // If AI champ and no target, follow lane vaguely
                if (!e.targetEnt && e.type === 'ai') {
                    const path = this.LANES[e.lane];
                    if(path) {
                        e.targetPos = { x: path[1].x + (Math.random()*100-50), y: path[1].y + (Math.random()*100-50) };
                    }
                }
            }

            // Attack or Move
            if (e.targetEnt && e.targetEnt.hp > 0) {
                const dist = this.getDistance(e, e.targetEnt);
                if (dist <= e.range) {
                    e.targetPos = null; // stop moving
                    if (e.atkCd <= 0) {
                        if (e.range > 100) {
                            this.spawnProjectile(e.x, e.y, e.targetEnt.x, e.targetEnt.y, 400, e.atk, e.team, e.targetEnt.id);
                        } else {
                            e.targetEnt.hp -= e.atk;
                            this.spawnParticle(e.targetEnt.x, e.targetEnt.y, '#e74c3c', 'hit');
                        }
                        e.atkCd = 1.0;
                    }
                } else {
                    e.targetPos = { x: e.targetEnt.x, y: e.targetEnt.y }; // chase
                }
            }

            // Move
            if (e.targetPos) {
                const dx = e.targetPos.x - e.x;
                const dy = e.targetPos.y - e.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 5) {
                    e.x += (dx/dist) * e.speed * dt;
                    e.y += (dy/dist) * e.speed * dt;
                } else {
                    e.targetPos = null;
                }
            }
        }
        
        // Update Particles
        for(let i=this.particles.length-1; i>=0; i--) {
            let p = this.particles[i];
            p.age += dt;
            if(p.type === 'ping') p.radius += dt*20;
            if(p.age > p.life) this.particles.splice(i, 1);
        }
        
        // Update Log
        this.logMsg.forEach(l => l.age += dt);
        this.logMsg = this.logMsg.filter(l => l.age < 5);
        
        // Win/Loss
        const blueNexus = this.buildings.find(b => b.type === 'nexus' && b.team === 'blue');
        const redNexus = this.buildings.find(b => b.type === 'nexus' && b.team === 'red');
        if(!blueNexus || blueNexus.hp <= 0) { this.state = 'gameover'; this.winner = 'red'; }
        if(!redNexus || redNexus.hp <= 0) { this.state = 'gameover'; this.winner = 'blue'; }
    },

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(0, 0, this.W, this.H);

        if (this.state === 'select') {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('챔피언 선택', this.W/2, 100);
            
            const cardW = 200, cardH = 300, gap = 50;
            const startX = this.W/2 - (cardW*3 + gap*2)/2;
            let i = 0;
            for (let k in this.CHAMP_DEFS) {
                const def = this.CHAMP_DEFS[k];
                const cx = startX + i*(cardW+gap);
                const cy = this.H/2 - cardH/2;
                
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(cx, cy, cardW, cardH);
                ctx.strokeStyle = def.color;
                ctx.lineWidth = 4;
                ctx.strokeRect(cx, cy, cardW, cardH);
                
                ctx.fillStyle = '#fff';
                ctx.font = '60px Arial';
                ctx.fillText(def.icon, cx + cardW/2, cy + 100);
                
                ctx.font = 'bold 24px Arial';
                ctx.fillText(def.name, cx + cardW/2, cy + 160);
                
                ctx.font = '16px Arial';
                ctx.fillStyle = '#bdc3c7';
                ctx.fillText('HP: ' + def.hp, cx + cardW/2, cy + 200);
                ctx.fillText('ATK: ' + def.atk, cx + cardW/2, cy + 230);
                ctx.fillText('Role: ' + def.role, cx + cardW/2, cy + 260);
                
                i++;
            }
            return;
        }

        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // Draw Map Background
        ctx.fillStyle = '#27ae60'; // Grass
        ctx.fillRect(0, 0, this.MAP_W, this.MAP_H);
        
        // Draw Lanes
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 40;
        ctx.beginPath(); this.LANES.top.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
        ctx.strokeStyle = '#f39c12';
        ctx.beginPath(); this.LANES.mid.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
        ctx.strokeStyle = '#2980b9';
        ctx.beginPath(); this.LANES.bot.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();

        // Draw Bases
        ctx.fillStyle = 'rgba(41, 128, 185, 0.3)';
        ctx.beginPath(); ctx.arc(200, 1400, 400, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(192, 57, 43, 0.3)';
        ctx.beginPath(); ctx.arc(2200, 200, 400, 0, Math.PI*2); ctx.fill();

        // Draw Buildings
        this.buildings.forEach(b => {
            if(b.hp <= 0) return;
            ctx.fillStyle = b.team === 'blue' ? '#3498db' : '#e74c3c';
            ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
            
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(b.x - 20, b.y - b.radius - 10, 40 * (b.hp/b.maxHp), 5);
        });

        // Draw Entities
        this.entities.forEach(e => {
            // Body
            ctx.fillStyle = e.color;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = e.team === 'blue' ? '#2980b9' : '#c0392b';
            ctx.lineWidth = e.isPlayer ? 4 : 2;
            ctx.stroke();
            
            // Icon
            if(e.type !== 'minion') {
                ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText(this.CHAMP_DEFS[e.champ].icon, e.x, e.y);
            }
            
            // HP Bar
            ctx.fillStyle = '#c0392b'; ctx.fillRect(e.x - 15, e.y - e.radius - 12, 30, 4);
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(e.x - 15, e.y - e.radius - 12, 30 * (e.hp/e.maxHp), 4);
            
            // Selection ring
            if(this.player && this.player.targetEnt === e) {
                ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(e.x, e.y, e.radius+5, 0, Math.PI*2); ctx.stroke();
            }
        });

        // Draw Projectiles
        this.projectiles.forEach(p => {
            ctx.fillStyle = p.team === 'blue' ? '#3498db' : '#e74c3c';
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
        });
        
        // Draw Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = 1 - (p.age/p.life);
            if(p.type === 'ping') {
                ctx.strokeStyle = p.color; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.stroke();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        });

        ctx.restore();

        if(this.state === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.fillStyle = this.winner === 'blue' ? '#3498db' : '#e74c3c';
            ctx.font = 'bold 60px Arial'; ctx.textAlign='center';
            ctx.fillText(this.winner === 'blue' ? 'VICTORY' : 'DEFEAT', this.W/2, this.H/2);
            return;
        }

        // HUD
        if(this.player) {
            // Bottom Bar
            ctx.fillStyle = 'rgba(44, 62, 80, 0.9)';
            ctx.fillRect(0, this.H - 80, this.W, 80);
            
            // Minimap (Bottom Left)
            const mmSize = 120;
            ctx.fillStyle = '#000'; ctx.fillRect(10, this.H - mmSize - 10, mmSize, mmSize);
            ctx.strokeStyle = '#fff'; ctx.strokeRect(10, this.H - mmSize - 10, mmSize, mmSize);
            const scaleX = mmSize / this.MAP_W;
            const scaleY = mmSize / this.MAP_H;
            
            this.buildings.forEach(b => {
                ctx.fillStyle = b.team === 'blue' ? '#3498db' : '#e74c3c';
                ctx.fillRect(10 + b.x*scaleX - 2, this.H - mmSize - 10 + b.y*scaleY - 2, 4, 4);
            });
            this.entities.forEach(e => {
                ctx.fillStyle = e.team === 'blue' ? '#3498db' : '#e74c3c';
                ctx.fillRect(10 + e.x*scaleX - 1, this.H - mmSize - 10 + e.y*scaleY - 1, 2, 2);
            });
            // Camera rect
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.strokeRect(10 + this.camera.x*scaleX, this.H - mmSize - 10 + this.camera.y*scaleY, this.W*scaleX, this.H*scaleY);

            // Stats
            ctx.fillStyle = '#fff'; ctx.font = '20px Arial'; ctx.textAlign='left';
            ctx.fillText(\`Lv. \${this.level}\`, 150, this.H - 50);
            ctx.fillText(\`💰 \${this.gold}\`, 150, this.H - 20);
            
            // HP Bar
            ctx.fillStyle = '#c0392b'; ctx.fillRect(230, this.H - 60, 200, 20);
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(230, this.H - 60, 200 * (this.player.hp/this.player.maxHp), 20);
            ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.textAlign='center';
            ctx.fillText(\`\${Math.floor(this.player.hp)} / \${this.player.maxHp}\`, 330, this.H - 45);
            
            // EXP Bar
            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(230, this.H - 35, 200, 10);
            ctx.fillStyle = '#f1c40f'; ctx.fillRect(230, this.H - 35, 200 * (this.exp/this.maxExp), 10);

            // Skills
            const skills = ['Q', 'W', 'E', 'R'];
            const skillKeys = ['q', 'w', 'e', 'r'];
            for(let i=0; i<4; i++) {
                const sx = 470 + i*60;
                const sy = this.H - 65;
                ctx.fillStyle = '#34495e';
                ctx.fillRect(sx, sy, 50, 50);
                ctx.strokeStyle = '#7f8c8d';
                ctx.strokeRect(sx, sy, 50, 50);
                
                ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign='center';
                ctx.fillText(skills[i], sx+25, sy+30);
                
                const cd = this.player.skills[skillKeys[i]];
                if(cd > 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(sx, sy, 50, 50);
                    ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
                    ctx.fillText(cd.toFixed(1), sx+25, sy+30);
                }
            }
            
            // Logs
            ctx.textAlign = 'right'; ctx.font = '14px Arial';
            this.logMsg.forEach((l, i) => {
                ctx.fillStyle = \`rgba(255, 255, 255, \${1 - l.age/5})\`;
                ctx.fillText(l.text, this.W - 20, 30 + i*20);
            });
            
            // Camera lock status
            ctx.textAlign = 'center'; ctx.fillStyle = '#bdc3c7';
            ctx.fillText(this.camera.locked ? '카메라: 고정 (Space로 해제)' : '카메라: 자유 (Space로 고정)', this.W/2, 20);
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

minigames = minigames.replace(/}\s*;\s*$/, mobaGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
console.log('MOBA game injected!');
