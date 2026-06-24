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
                ctx.fillText(\`Kills: \${this.killCount}  (Wave \${this.wave})\`, this.W/2, this.H/2 + 40);
                
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
            ctx.fillText(\`HP: \${Math.floor(this.player.hp)} / \${this.player.maxHp}\`, 25, 33);
            ctx.fillText(\`Wave: \${this.wave} | Kills: \${this.killCount}\`, 20, 55);
            
            const curWpn = this.weapons[this.player.weaponTier];
            ctx.fillStyle = curWpn.color; ctx.font = 'bold 16px sans-serif';
            ctx.fillText(\`장착: \${curWpn.name}\`, 20, 78);
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
