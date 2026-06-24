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
