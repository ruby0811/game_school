const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const soulslikeStr = `
,
soulslike: {
    overlay: null, canvas: null, ctx: null, isPlaying: false,
    W: 1000, H: 700,
    keys: { w:false, a:false, s:false, d:false, space:false, q:false },
    mouse: { x: 0, y: 0, left: false },
    lastTime: 0,
    
    gameState: 'start', // start, playing, gameover, win
    
    player: {
        x: 500, y: 550, radius: 15,
        hp: 100, maxHp: 100,
        stamina: 100, maxStamina: 100,
        speed: 150,
        
        flasks: 3, maxFlasks: 3,
        isHealing: false, healTimer: 0,
        
        isRolling: false, rollTimer: 0, rollDir: {x:0, y:0}, iFrame: 0,
        
        isAttacking: false, attackTimer: 0, combo: 0,
        
        color: '#3498db'
    },
    
    boss: {
        x: 500, y: 250, radius: 40,
        hp: 2000, maxHp: 2000,
        speed: 80,
        state: 'idle', // idle, move, sweep, smash, shoot
        stateTimer: 2.0,
        color: '#e74c3c',
        name: '용철 데몬의 환영'
    },
    
    projectiles: [],
    dangerZones: [],
    particles: [],

    init() {
        const { overlay, gameContainer } = MiniGames._createOverlay();
        this.overlay = overlay;
        gameContainer.style.backgroundColor = '#111';
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
        this.canvas.style.cssText = 'background:#222; display:block; margin:auto; cursor:crosshair;';
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
        this.gameState = 'start';
        this.player = {
            x: 500, y: 550, radius: 15,
            hp: 100, maxHp: 100,
            stamina: 100, maxStamina: 100,
            speed: 150,
            flasks: 3, maxFlasks: 3,
            isHealing: false, healTimer: 0,
            isRolling: false, rollTimer: 0, rollDir: {x:0, y:0}, iFrame: 0,
            isAttacking: false, attackTimer: 0, combo: 0,
            color: '#3498db'
        };
        this.boss = {
            x: 500, y: 250, radius: 40,
            hp: 2000, maxHp: 2000,
            speed: 80,
            state: 'idle', stateTimer: 2.0,
            color: '#e74c3c', name: '용철 데몬의 환영',
            patternCooldown: 0
        };
        this.projectiles = [];
        this.dangerZones = [];
        this.particles = [];
        this.keys = { w:false, a:false, s:false, d:false, space:false, q:false };
    },

    bindEvents() {
        this._keydown = (e) => {
            if(e.key === 'w' || e.key === 'W') this.keys.w = true;
            if(e.key === 'a' || e.key === 'A') this.keys.a = true;
            if(e.key === 's' || e.key === 'S') this.keys.s = true;
            if(e.key === 'd' || e.key === 'D') this.keys.d = true;
            if(e.code === 'Space') {
                this.keys.space = true;
                e.preventDefault();
                this.doRoll();
            }
            if(e.key === 'q' || e.key === 'Q') {
                this.keys.q = true;
                this.doHeal();
            }
        };
        this._keyup = (e) => {
            if(e.key === 'w' || e.key === 'W') this.keys.w = false;
            if(e.key === 'a' || e.key === 'A') this.keys.a = false;
            if(e.key === 's' || e.key === 'S') this.keys.s = false;
            if(e.key === 'd' || e.key === 'D') this.keys.d = false;
            if(e.code === 'Space') this.keys.space = false;
            if(e.key === 'q' || e.key === 'Q') this.keys.q = false;
        };
        this._mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
        };
        this._mousedown = (e) => {
            if (this.gameState === 'start') {
                this.gameState = 'playing';
                return;
            }
            if (this.gameState === 'win' || this.gameState === 'gameover') {
                this.reset();
                return;
            }
            this.mouse.left = true;
            this.doAttack();
        };
        this._mouseup = (e) => {
            this.mouse.left = false;
        };
        
        window.addEventListener('keydown', this._keydown);
        window.addEventListener('keyup', this._keyup);
        this.canvas.addEventListener('mousemove', this._mousemove);
        this.canvas.addEventListener('mousedown', this._mousedown);
        this.canvas.addEventListener('mouseup', this._mouseup);
    },

    doRoll() {
        if (this.gameState !== 'playing') return;
        let p = this.player;
        if (p.isRolling || p.isHealing || p.isAttacking || p.stamina < 30) return;
        
        let dx = this.mouse.x - p.x, dy = this.mouse.y - p.y;
        let dist = Math.hypot(dx, dy);
        if (dist === 0) { dx = 1; dy = 0; dist = 1; }
        
        p.stamina -= 30;
        p.isRolling = true;
        p.rollTimer = 0.4; // 0.4s roll duration
        p.iFrame = 0.4;    // invincible for 0.4s
        p.rollDir = { x: dx/dist, y: dy/dist };
        
        this.spawnParticle(p.x, p.y, '#ccc', 10);
    },

    doHeal() {
        if (this.gameState !== 'playing') return;
        let p = this.player;
        if (p.isRolling || p.isHealing || p.isAttacking || p.flasks <= 0 || p.hp === p.maxHp) return;
        
        p.isHealing = true;
        p.healTimer = 1.2; // takes 1.2s to heal
        p.flasks--;
    },

    doAttack() {
        if (this.gameState !== 'playing') return;
        let p = this.player;
        if (p.isRolling || p.isHealing || p.isAttacking || p.stamina < 20) return;
        
        p.stamina -= 20;
        p.isAttacking = true;
        p.attackTimer = 0.3; // fast attack
        
        let dx = this.mouse.x - p.x, dy = this.mouse.y - p.y;
        let dist = Math.hypot(dx, dy);
        let dirX = dx/dist, dirY = dy/dist;
        
        // Attack hitbox
        let reach = 50;
        let hitX = p.x + dirX * reach, hitY = p.y + dirY * reach;
        let hitRadius = 30;
        
        // Visual
        this.dangerZones.push({ type: 'player_atk', x: hitX, y: hitY, radius: hitRadius, life: 0.1 });
        
        // Check boss hit
        let b = this.boss;
        if (Math.hypot(b.x - hitX, b.y - hitY) < b.radius + hitRadius) {
            b.hp -= 45; // Dmg
            this.spawnParticle(b.x, b.y, '#fff', 5);
            if (b.hp <= 0) {
                this.gameState = 'win';
            }
        }
    },

    damagePlayer(amt) {
        if (this.player.iFrame > 0) {
            // Dodged!
            this.spawnParticle(this.player.x, this.player.y, '#f1c40f', 5); // dodge spark
            return;
        }
        this.player.hp -= amt;
        this.spawnParticle(this.player.x, this.player.y, '#c0392b', 15);
        if (this.player.hp <= 0) {
            this.player.hp = 0;
            this.gameState = 'gameover';
        }
    },

    spawnParticle(x, y, color, count) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random()-0.5)*300, vy: (Math.random()-0.5)*300,
                color, age: 0, life: 0.2 + Math.random()*0.3, radius: 2+Math.random()*3
            });
        }
    },

    update(dt) {
        if (this.gameState !== 'playing') return;
        
        let p = this.player;
        let b = this.boss;

        // ---- Player Update ----
        if (p.iFrame > 0) p.iFrame -= dt;
        
        if (p.isRolling) {
            p.rollTimer -= dt;
            p.x += p.rollDir.x * p.speed * 2.5 * dt; // Fast roll
            p.y += p.rollDir.y * p.speed * 2.5 * dt;
            if (p.rollTimer <= 0) p.isRolling = false;
        } else if (p.isHealing) {
            p.healTimer -= dt;
            if (p.healTimer <= 0) {
                p.isHealing = false;
                p.hp = Math.min(p.maxHp, p.hp + 50);
                this.spawnParticle(p.x, p.y, '#2ecc71', 20); // heal effect
            }
            // Cannot move while healing (classic souls)
        } else if (p.isAttacking) {
            p.attackTimer -= dt;
            if (p.attackTimer <= 0) p.isAttacking = false;
            // Slow movement while attacking
            let vx = 0, vy = 0;
            if(this.keys.w) vy -= 1; if(this.keys.s) vy += 1;
            if(this.keys.a) vx -= 1; if(this.keys.d) vx += 1;
            if (vx!==0 || vy!==0) {
                let dist = Math.hypot(vx, vy);
                p.x += (vx/dist) * p.speed * 0.3 * dt;
                p.y += (vy/dist) * p.speed * 0.3 * dt;
            }
        } else {
            // Normal move
            let vx = 0, vy = 0;
            if(this.keys.w) vy -= 1; if(this.keys.s) vy += 1;
            if(this.keys.a) vx -= 1; if(this.keys.d) vx += 1;
            if (vx!==0 || vy!==0) {
                let dist = Math.hypot(vx, vy);
                p.x += (vx/dist) * p.speed * dt;
                p.y += (vy/dist) * p.speed * dt;
            }
            // Stamina regen
            p.stamina = Math.min(p.maxStamina, p.stamina + 20 * dt);
        }
        
        // Bounds
        p.x = Math.max(p.radius, Math.min(this.W - p.radius, p.x));
        p.y = Math.max(p.radius, Math.min(this.H - p.radius, p.y));


        // ---- Boss Update ----
        let bx = p.x - b.x, by = p.y - b.y;
        let distToPlayer = Math.hypot(bx, by);
        
        if (b.stateTimer > 0) b.stateTimer -= dt;
        
        if (b.state === 'idle') {
            if (b.stateTimer <= 0) {
                // Decide next pattern
                let r = Math.random();
                if (distToPlayer < 150) {
                    if(r < 0.6) { b.state = 'sweep'; b.stateTimer = 1.0; } // 1s telegraph
                    else { b.state = 'smash'; b.stateTimer = 1.5; }
                } else {
                    if(r < 0.5) { b.state = 'move'; b.stateTimer = 1 + Math.random()*2; }
                    else if (r < 0.8) { b.state = 'shoot'; b.stateTimer = 1.0; }
                    else { b.state = 'smash'; b.stateTimer = 1.5; } // Leap smash
                }
            }
        } else if (b.state === 'move') {
            b.x += (bx/distToPlayer) * b.speed * dt;
            b.y += (by/distToPlayer) * b.speed * dt;
            if (b.stateTimer <= 0 || distToPlayer < 100) {
                b.state = 'idle'; b.stateTimer = 0.5;
            }
        } else if (b.state === 'sweep') {
            // Telegraphing sweep
            if (b.stateTimer <= 0) {
                // Execute sweep
                let sweepReach = 180;
                let dirX = bx/distToPlayer, dirY = by/distToPlayer;
                // Add danger zone for visual
                this.dangerZones.push({ type: 'boss_sweep', x: b.x, y: b.y, dirX, dirY, radius: sweepReach, life: 0.2 });
                
                // Hit check (approximate semi-circle)
                if (distToPlayer < sweepReach) {
                    let dot = (p.x - b.x)*dirX + (p.y - b.y)*dirY;
                    if (dot > 0) { // in front
                        this.damagePlayer(30);
                    }
                }
                b.state = 'idle'; b.stateTimer = 1.5;
            }
        } else if (b.state === 'smash') {
            // Telegraphing smash at player's location when pattern started
            if (!b.targetPos) b.targetPos = { x: p.x, y: p.y }; // lock target
            
            if (b.stateTimer <= 0) {
                // Execute smash
                let smashRadius = 120;
                this.dangerZones.push({ type: 'boss_smash', x: b.targetPos.x, y: b.targetPos.y, radius: smashRadius, life: 0.2 });
                
                if (Math.hypot(p.x - b.targetPos.x, p.y - b.targetPos.y) < smashRadius) {
                    this.damagePlayer(60); // Big dmg
                }
                
                // Boss jumps to location
                b.x = b.targetPos.x; b.y = b.targetPos.y;
                
                b.targetPos = null;
                b.state = 'idle'; b.stateTimer = 2.0;
                
                // Screen shake effect could be added here
            } else {
                // Draw telegraph (handled in draw via dangerZones? better explicit here)
                this.dangerZones.push({ type: 'telegraph_circle', x: b.targetPos.x, y: b.targetPos.y, radius: 120, life: dt });
            }
        } else if (b.state === 'shoot') {
            if (b.stateTimer <= 0) {
                // Execute shoot (3 fireballs)
                let angle = Math.atan2(by, bx);
                for(let i=-1; i<=1; i++) {
                    let a = angle + i*0.3;
                    this.projectiles.push({
                        x: b.x, y: b.y,
                        vx: Math.cos(a)*250, vy: Math.sin(a)*250,
                        radius: 12, life: 3.0, dmg: 25
                    });
                }
                b.state = 'idle'; b.stateTimer = 1.0;
            }
        }


        // ---- Projectiles ----
        for(let i=this.projectiles.length-1; i>=0; i--) {
            let pr = this.projectiles[i];
            pr.x += pr.vx * dt; pr.y += pr.vy * dt;
            pr.life -= dt;
            
            if (Math.hypot(pr.x - p.x, pr.y - p.y) < pr.radius + p.radius) {
                this.damagePlayer(pr.dmg);
                this.projectiles.splice(i, 1);
            } else if (pr.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // ---- Danger Zones (Visual only) ----
        for(let i=this.dangerZones.length-1; i>=0; i--) {
            this.dangerZones[i].life -= dt;
            if(this.dangerZones[i].life <= 0) this.dangerZones.splice(i, 1);
        }

        // ---- Particles ----
        for(let i=this.particles.length-1; i>=0; i--) {
            let pt = this.particles[i];
            pt.x += pt.vx * dt; pt.y += pt.vy * dt;
            pt.age += dt;
            if (pt.age > pt.life) this.particles.splice(i, 1);
        }
    },

    draw() {
        const ctx = this.ctx;
        // Background
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.W, this.H);
        
        // Grid lines for perspective
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
        for(let x=0; x<this.W; x+=50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,this.H); ctx.stroke(); }
        for(let y=0; y<this.H; y+=50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(this.W,y); ctx.stroke(); }

        if (this.gameState === 'start') {
            ctx.fillStyle = '#c0392b'; ctx.font = 'bold 50px serif'; ctx.textAlign = 'center';
            ctx.fillText('⚔️ 소울라이크: 용철 데몬', this.W/2, 120);
            
            ctx.fillStyle = '#ccc'; ctx.font = '18px sans-serif'; ctx.textAlign = 'left';
            let sx = this.W/2 - 250;
            ctx.fillText('• 목표: 무자비한 보스의 패턴을 파악하고 쓰러뜨리세요.', sx, 200);
            ctx.fillText('• 이동: W, A, S, D', sx, 240);
            ctx.fillText('• 공격: 마우스 좌클릭 (스태미나 20 소모)', sx, 270);
            ctx.fillText('• 구르기: Space (마우스 방향으로 무적 회피, 스태미나 30 소모)', sx, 300);
            ctx.fillText('• 회복: Q (에스트 병 3회 제한, 시전 시간 존재)', sx, 330);
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('주의: 무지성 공격은 죽음뿐입니다. 스태미나를 관리하며 틈을 노리세요.', sx, 380);
            
            ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('화면을 클릭하여 도전을 시작하세요', this.W/2, 500);
            return;
        }

        // Draw Danger Zones
        this.dangerZones.forEach(d => {
            if (d.type === 'telegraph_circle') {
                ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
                ctx.beginPath(); ctx.arc(d.x, d.y, d.radius, 0, Math.PI*2); ctx.fill();
            } else if (d.type === 'boss_smash') {
                ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
                ctx.beginPath(); ctx.arc(d.x, d.y, d.radius, 0, Math.PI*2); ctx.fill();
            } else if (d.type === 'boss_sweep') {
                ctx.fillStyle = 'rgba(231, 76, 60, 0.6)';
                ctx.beginPath(); ctx.arc(d.x, d.y, d.radius, 0, Math.PI*2); ctx.fill();
            } else if (d.type === 'player_atk') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath(); ctx.arc(d.x, d.y, d.radius, 0, Math.PI*2); ctx.fill();
            }
        });

        // Draw Projectiles
        this.projectiles.forEach(p => {
            ctx.fillStyle = '#e67e22';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius/2, 0, Math.PI*2); ctx.fill();
        });
        
        // Draw Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = 1 - (p.age/p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        // Draw Boss
        let b = this.boss;
        ctx.fillStyle = b.state === 'sweep' || b.state === 'smash' ? '#c0392b' : b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.stroke();
        
        // Boss Eyes/Direction indicator
        let bx = this.player.x - b.x, by = this.player.y - b.y;
        let bDist = Math.hypot(bx, by) || 1;
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(b.x + (bx/bDist)*20, b.y + (by/bDist)*20, 8, 0, Math.PI*2); ctx.fill();

        // Draw Player
        let p = this.player;
        ctx.fillStyle = p.iFrame > 0 ? '#bdc3c7' : p.color; // turn gray during i-frame
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        
        // Player direction (mouse)
        let mx = this.mouse.x - p.x, my = this.mouse.y - p.y;
        let mDist = Math.hypot(mx, my) || 1;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (mx/mDist)*25, p.y + (my/mDist)*25); ctx.stroke();
        
        if (p.isHealing) {
            ctx.fillStyle = '#f1c40f'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('마시는 중...', p.x, p.y - 25);
        }

        // ---- UI ----
        
        // Player Status (Top Left)
        ctx.fillStyle = '#000'; ctx.fillRect(20, 20, 200, 20); // HP Bg
        ctx.fillStyle = '#c0392b'; ctx.fillRect(20, 20, 200 * (p.hp/p.maxHp), 20); // HP
        
        ctx.fillStyle = '#000'; ctx.fillRect(20, 45, 150, 15); // Stamina Bg
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(20, 45, 150 * (p.stamina/p.maxStamina), 15); // Stamina
        
        ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(\`에스트 병: \${p.flasks} / \${p.maxFlasks}\`, 20, 85);
        
        // Boss HP Bar (Bottom)
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(100, this.H - 50, this.W - 200, 30);
        ctx.fillStyle = '#8e44ad'; ctx.fillRect(100, this.H - 50, (this.W - 200) * (b.hp/b.maxHp), 30);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(100, this.H - 50, this.W - 200, 30);
        
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px serif'; ctx.textAlign = 'center';
        ctx.fillText(b.name, this.W/2, this.H - 28);

        // Overlay states
        if (this.gameState === 'win') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 80px serif'; ctx.textAlign = 'center';
            ctx.fillText('BOSS SLAIN', this.W/2, this.H/2);
            ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
            ctx.fillText('화면을 클릭하여 다시 도전', this.W/2, this.H/2 + 60);
        } else if (this.gameState === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.fillStyle = '#c0392b'; ctx.font = 'bold 100px serif'; ctx.textAlign = 'center';
            ctx.fillText('YOU DIED', this.W/2, this.H/2);
            ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
            ctx.fillText('화면을 클릭하여 재시도', this.W/2, this.H/2 + 60);
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

minigames = minigames.replace(/}\s*;\s*$/, soulslikeStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
console.log('Soulslike game injected!');
