const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const stellarisGameStr = `
,
stellaris: {
    overlay: null, canvas: null, ctx: null, isPlaying: false,
    W: 1000, H: 600,
    mouse: { x: 0, y: 0, down: false, startNode: null },
    lastTime: 0,
    state: 'start', // start, playing, gameover
    winner: null,
    
    nodes: [],
    links: [],
    fleets: [],
    particles: [],
    
    player: { minerals: 100, atk: 10, shield: 50, eco: 1 },
    ai: { minerals: 100, atk: 10, shield: 50, eco: 1, timer: 0 },
    
    selectedNode: null,

    init() {
        const { overlay, gameContainer } = MiniGames._createOverlay();
        this.overlay = overlay;
        gameContainer.style.backgroundColor = '#0b0c10';
        gameContainer.style.width = '1000px';
        gameContainer.style.maxWidth = '95vw';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.style.cssText = \`position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.1);color:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;z-index:9999;font-weight:bold;transition:all 0.2s;\`;
        closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(231, 76, 60, 0.8)'; closeBtn.style.borderColor = '#e74c3c'; };
        closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(255,255,255,0.1)'; closeBtn.style.borderColor = 'rgba(255,255,255,0.5)'; };
        closeBtn.onclick = () => this.close();
        gameContainer.appendChild(closeBtn);
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.canvas.style.cssText = 'background:radial-gradient(circle at center, #1f2833 0%, #0b0c10 100%); display:block; margin:auto; box-shadow:0 0 30px #45a29e inset; user-select:none; cursor:default;';
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
        this.nodes = [];
        this.links = [];
        this.fleets = [];
        this.particles = [];
        this.player = { minerals: 100, atk: 10, shield: 50, eco: 1, upgAtkLevel: 0, upgDefLevel: 0, upgEcoLevel: 0 };
        this.ai = { minerals: 100, atk: 10, shield: 50, eco: 1, timer: 0, state: 'build' };
        this.selectedNode = null;
        this.mouse.startNode = null;
    },

    generateGalaxy() {
        const numNodes = 15;
        this.nodes = [];
        this.links = [];
        const padding = 100;
        
        for(let i=0; i<numNodes; i++) {
            let valid = false, x, y;
            while(!valid) {
                x = padding + Math.random()*(this.W - padding*2);
                y = padding + Math.random()*(this.H - padding*2);
                valid = true;
                for(let n of this.nodes) {
                    if(Math.hypot(n.x - x, n.y - y) < 80) { valid = false; break; }
                }
            }
            this.nodes.push({
                id: i, x, y, owner: 0, // 0: neutral, 1: player, 2: ai
                ships: i===0||i===1 ? 10 : 0, // Start with some ships
                maxHp: 200, hp: 200, radius: 25,
                producing: 0, name: 'System ' + String.fromCharCode(65+i)
            });
        }
        
        // Assign owners
        this.nodes[0].owner = 1; this.nodes[0].name = 'Sol (Home)';
        this.nodes[0].x = 100; this.nodes[0].y = this.H/2;
        
        this.nodes[1].owner = 2; this.nodes[1].name = 'Zarqlan (AI)';
        this.nodes[1].x = this.W - 100; this.nodes[1].y = this.H/2;
        
        // Connect nodes
        for(let i=0; i<numNodes; i++) {
            let n1 = this.nodes[i];
            let distances = this.nodes.map((n, idx) => ({ idx, d: Math.hypot(n.x - n1.x, n.y - n1.y) })).filter(d => d.idx !== i).sort((a,b)=>a.d - b.d);
            
            // connect to 2-3 closest
            for(let k=0; k<2; k++) {
                if(distances[k]) {
                    let n2 = this.nodes[distances[k].idx];
                    if(!this.links.some(l => (l.n1===n1 && l.n2===n2) || (l.n1===n2 && l.n2===n1))) {
                        this.links.push({ n1, n2 });
                    }
                }
            }
        }
        
        // Add one central blackhole
        let bh = this.nodes[Math.floor(numNodes/2)];
        if(bh.owner === 0) {
            bh.name = 'Gargantua (Blackhole)';
            bh.maxHp = 500; bh.hp = 500; bh.radius = 35;
        }
    },

    bindEvents() {
        this._mousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
        };
        this._mousedown = (e) => {
            if (this.state === 'start') {
                this.generateGalaxy();
                this.state = 'playing';
                return;
            }
            if (this.state === 'gameover') {
                this.reset();
                return;
            }
            
            this.mouse.down = true;
            
            // Check UI buttons
            if (this.selectedNode && this.selectedNode.owner === 1) {
                // Build ship
                if (this.mouse.x > 20 && this.mouse.x < 120 && this.mouse.y > this.H - 50 && this.mouse.y < this.H - 20) {
                    if (this.player.minerals >= 10) {
                        this.player.minerals -= 10;
                        this.selectedNode.ships += 1;
                        this.spawnParticle(this.selectedNode.x, this.selectedNode.y, '#66fcf1', 5);
                    }
                    return;
                }
            }
            
            // Check Upgrades
            let upgY = this.H - 60;
            if(this.mouse.x > this.W - 140 && this.mouse.x < this.W - 20) {
                // ATK
                if(this.mouse.y > upgY - 90 && this.mouse.y < upgY - 60) {
                    let cost = 50 + this.player.upgAtkLevel*50;
                    if(this.player.minerals >= cost) { this.player.minerals -= cost; this.player.atk += 5; this.player.upgAtkLevel++; }
                    return;
                }
                // DEF
                if(this.mouse.y > upgY - 50 && this.mouse.y < upgY - 20) {
                    let cost = 50 + this.player.upgDefLevel*50;
                    if(this.player.minerals >= cost) { this.player.minerals -= cost; this.player.shield += 20; this.player.upgDefLevel++; }
                    return;
                }
                // ECO
                if(this.mouse.y > upgY - 10 && this.mouse.y < upgY + 20) {
                    let cost = 50 + this.player.upgEcoLevel*50;
                    if(this.player.minerals >= cost) { this.player.minerals -= cost; this.player.eco += 0.5; this.player.upgEcoLevel++; }
                    return;
                }
            }
            
            // Check Node click
            this.mouse.startNode = null;
            for(let n of this.nodes) {
                if(Math.hypot(n.x - this.mouse.x, n.y - this.mouse.y) < n.radius + 10) {
                    this.selectedNode = n;
                    if(n.owner === 1 && n.ships > 0) this.mouse.startNode = n;
                    break;
                }
            }
            
        };
        this._mouseup = (e) => {
            this.mouse.down = false;
            
            if (this.mouse.startNode) {
                for(let n of this.nodes) {
                    if(Math.hypot(n.x - this.mouse.x, n.y - this.mouse.y) < n.radius + 10 && n !== this.mouse.startNode) {
                        // Check if linked
                        let linked = this.links.some(l => (l.n1===this.mouse.startNode && l.n2===n) || (l.n1===n && l.n2===this.mouse.startNode));
                        if(linked) {
                            // Send half ships
                            let sendCount = Math.floor(this.mouse.startNode.ships / 2) || 1;
                            this.mouse.startNode.ships -= sendCount;
                            this.fleets.push({
                                owner: 1,
                                count: sendCount,
                                from: this.mouse.startNode,
                                to: n,
                                progress: 0,
                                speed: 0.2
                            });
                        }
                        break;
                    }
                }
            }
            this.mouse.startNode = null;
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
                color, age: 0, life: 0.5 + Math.random()*0.5, radius: 2+Math.random()*2
            });
        }
    },

    updateAI(dt) {
        let ai = this.ai;
        ai.timer -= dt;
        if(ai.timer <= 0) {
            ai.timer = 1.0;
            // Income handled globally, AI decisions here
            let myNodes = this.nodes.filter(n => n.owner === 2);
            if(myNodes.length === 0) return;
            
            // Build ships if minerals > 15
            if (ai.minerals >= 15) {
                ai.minerals -= 15;
                // build at random node, preference to border nodes
                let n = myNodes[Math.floor(Math.random()*myNodes.length)];
                n.ships += 1;
            }
            
            // Upgrade if wealthy
            if (ai.minerals >= 100) {
                let r = Math.random();
                if(r < 0.3) { ai.atk += 5; ai.minerals -= 100; }
                else if(r < 0.6) { ai.shield += 20; ai.minerals -= 100; }
                else { ai.eco += 0.5; ai.minerals -= 100; }
            }
            
            // Send fleets
            myNodes.forEach(n => {
                if (n.ships >= 5 && Math.random() < 0.3) {
                    // find adjacent
                    let adjs = this.nodes.filter(n2 => this.links.some(l => (l.n1===n && l.n2===n2) || (l.n1===n2 && l.n2===n)));
                    // prioritize enemies or neutral
                    let targets = adjs.filter(n2 => n2.owner !== 2);
                    if(targets.length === 0) targets = adjs; // move around
                    
                    let target = targets[Math.floor(Math.random()*targets.length)];
                    let sendCount = Math.floor(n.ships / 2);
                    n.ships -= sendCount;
                    this.fleets.push({
                        owner: 2,
                        count: sendCount,
                        from: n,
                        to: target,
                        progress: 0,
                        speed: 0.2
                    });
                }
            });
        }
    },

    update(dt) {
        if (this.state !== 'playing') return;

        // Resource generation
        let pNodes = 0, aNodes = 0;
        this.nodes.forEach(n => {
            if(n.owner === 1) pNodes++;
            if(n.owner === 2) aNodes++;
        });
        
        this.player.minerals += pNodes * this.player.eco * dt * 2;
        this.ai.minerals += aNodes * this.ai.eco * dt * 2;
        
        this.updateAI(dt);

        // Update Fleets
        for(let i=this.fleets.length-1; i>=0; i--) {
            let f = this.fleets[i];
            f.progress += f.speed * dt;
            if (f.progress >= 1.0) {
                // Arrived
                let n = f.to;
                if (n.owner === f.owner) {
                    n.ships += f.count;
                } else {
                    // Combat
                    let attackerStats = f.owner === 1 ? this.player : this.ai;
                    let defenderStats = n.owner === 1 ? this.player : (n.owner === 2 ? this.ai : {atk:5, shield:20}); // neutral
                    
                    // Simple combat: total atk vs total hp
                    let atkPower = f.count * attackerStats.atk;
                    
                    // Kill defending ships first
                    if (n.ships > 0) {
                        let shipHp = defenderStats.shield;
                        let killed = Math.floor(atkPower / shipHp);
                        if (killed >= n.ships) {
                            atkPower -= n.ships * shipHp;
                            n.ships = 0;
                        } else {
                            n.ships -= killed;
                            atkPower = 0;
                            f.count = 0; // Attacker wiped
                        }
                    }
                    
                    // Damage base if ships dead and still have attack power
                    if (n.ships === 0 && atkPower > 0) {
                        n.hp -= atkPower;
                        if (n.hp <= 0) {
                            // Conquer
                            n.owner = f.owner;
                            n.hp = n.maxHp;
                            n.ships = f.count;
                            this.spawnParticle(n.x, n.y, f.owner === 1 ? '#66fcf1' : '#ff003c', 20);
                        } else {
                            f.count = 0; // attackers died trying to take base
                        }
                    }
                }
                this.fleets.splice(i, 1);
            }
        }

        // Base healing
        this.nodes.forEach(n => {
            if(n.owner !== 0 && n.hp < n.maxHp) {
                n.hp = Math.min(n.maxHp, n.hp + 5 * dt);
            }
        });

        // Particles
        for(let i=this.particles.length-1; i>=0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.age += dt;
            if (p.age > p.life) this.particles.splice(i, 1);
        }

        // Win/Loss
        if (pNodes === 0) {
            this.state = 'gameover';
            this.winner = 'AI';
        } else if (aNodes === 0) {
            this.state = 'gameover';
            this.winner = 'Player';
        }
    },

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);
        
        if (this.state === 'start') {
            ctx.fillStyle = '#66fcf1';
            ctx.font = 'bold 50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🌌 스텔라리스: 은하 정복', this.W/2, 100);
            
            ctx.fillStyle = '#c5c6c7';
            ctx.font = '18px Arial';
            ctx.textAlign = 'left';
            let startX = this.W/2 - 350;
            
            ctx.fillText('🎮 게임 목표:', startX, 180);
            ctx.fillText('• 나만의 우주 제국을 이끌어 맵 상의 모든 성계를 점령하세요.', startX + 20, 210);
            ctx.fillText('• 붉은색 세력(AI)을 멸망시키면 승리합니다.', startX + 20, 240);
            
            ctx.fillText('🕹️ 플레이 방법:', startX, 300);
            ctx.fillText('1. 파란색(아군) 성계를 클릭하면 광물 10을 소비하여 전투함을 생산합니다.', startX + 20, 330);
            ctx.fillText('2. 파란색 성계에서 드래그하여 연결된 다른 성계로 함대를 출진시키세요. (전체 함선의 절반 이동)', startX + 20, 360);
            ctx.fillText('3. 광물은 점령한 성계의 수에 비례하여 초당 자동으로 차오릅니다.', startX + 20, 390);
            ctx.fillText('4. 우측 하단의 [연구] 버튼들을 클릭해 공격력, 쉴드, 자원 생산량을 업그레이드하세요.', startX + 20, 420);
            
            ctx.fillStyle = '#45a29e';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('화면을 클릭하여 제국을 건설하세요!', this.W/2, 520);
            return;
        }

        // Draw Links
        ctx.lineWidth = 2;
        this.links.forEach(l => {
            ctx.beginPath();
            ctx.moveTo(l.n1.x, l.n1.y);
            ctx.lineTo(l.n2.x, l.n2.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();
        });

        // Draw Fleets
        this.fleets.forEach(f => {
            let fx = f.from.x + (f.to.x - f.from.x) * f.progress;
            let fy = f.from.y + (f.to.y - f.from.y) * f.progress;
            
            ctx.fillStyle = f.owner === 1 ? '#66fcf1' : '#ff003c';
            ctx.beginPath(); ctx.arc(fx, fy, 4 + Math.min(f.count, 10), 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
            ctx.fillText(f.count, fx, fy - 10);
        });

        // Draw Nodes
        this.nodes.forEach(n => {
            if(n === this.selectedNode) {
                ctx.beginPath(); ctx.arc(n.x, n.y, n.radius + 10, 0, Math.PI*2);
                ctx.strokeStyle = 'rgba(102, 252, 241, 0.5)'; ctx.lineWidth = 3; ctx.stroke();
            }
            
            ctx.fillStyle = n.owner === 0 ? '#95a5a6' : (n.owner === 1 ? '#45a29e' : '#c0392b');
            ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI*2); ctx.fill();
            
            // Name
            ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
            ctx.fillText(n.name, n.x, n.y - n.radius - 15);
            
            // Ships
            if(n.owner !== 0) {
                ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial';
                ctx.fillText(n.ships, n.x, n.y + 6);
            }
            
            // HP Bar (if not full)
            if(n.hp < n.maxHp) {
                ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(n.x - 15, n.y + n.radius + 5, 30, 4);
                ctx.fillStyle = '#2ecc71'; ctx.fillRect(n.x - 15, n.y + n.radius + 5, 30 * (n.hp/n.maxHp), 4);
            }
        });

        // Drag Line
        if (this.mouse.startNode && this.mouse.down) {
            ctx.beginPath();
            ctx.moveTo(this.mouse.startNode.x, this.mouse.startNode.y);
            ctx.lineTo(this.mouse.x, this.mouse.y);
            ctx.strokeStyle = 'rgba(102, 252, 241, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = 1 - (p.age/p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        // UI Header
        ctx.fillStyle = 'rgba(11, 12, 16, 0.8)';
        ctx.fillRect(0, 0, this.W, 40);
        ctx.fillStyle = '#66fcf1'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'left';
        ctx.fillText(\`💎 광물: \${Math.floor(this.player.minerals)} (+ \${(this.nodes.filter(n=>n.owner===1).length * this.player.eco * 2).toFixed(1)}/s)\`, 20, 26);
        
        let pTotal = 0, aTotal = 0;
        this.nodes.forEach(n => { if(n.owner===1) pTotal+=n.ships; if(n.owner===2) aTotal+=n.ships; });
        this.fleets.forEach(f => { if(f.owner===1) pTotal+=f.count; if(f.owner===2) aTotal+=f.count; });
        
        ctx.fillStyle = '#45a29e'; ctx.textAlign = 'right';
        ctx.fillText(\`아군 함대: \${pTotal}대\`, this.W/2 - 20, 26);
        ctx.fillStyle = '#e74c3c'; ctx.textAlign = 'left';
        ctx.fillText(\`적군 함대: \${aTotal}대\`, this.W/2 + 20, 26);

        // UI Footer / Build
        if (this.selectedNode) {
            ctx.fillStyle = 'rgba(11, 12, 16, 0.8)';
            ctx.fillRect(0, this.H - 60, this.W, 60);
            
            ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
            ctx.fillText(\`선택 성계: \${this.selectedNode.name}\`, 150, this.H - 25);
            
            if (this.selectedNode.owner === 1) {
                // Build button
                ctx.fillStyle = this.player.minerals >= 10 ? '#45a29e' : '#555';
                ctx.fillRect(20, this.H - 50, 100, 40);
                ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
                ctx.fillText('함선 건조 (10)', 70, this.H - 25);
            }
        }
        
        // Upgrades UI
        let upgY = this.H - 60;
        ctx.fillStyle = 'rgba(11, 12, 16, 0.8)';
        ctx.fillRect(this.W - 160, upgY - 100, 160, 160);
        
        ctx.fillStyle = '#66fcf1'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText('연구 (업그레이드)', this.W - 80, upgY - 110);
        
        let atkCost = 50 + this.player.upgAtkLevel*50;
        ctx.fillStyle = this.player.minerals >= atkCost ? '#45a29e' : '#555';
        ctx.fillRect(this.W - 140, upgY - 90, 120, 30);
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.fillText(\`공격력 Lv\${this.player.upgAtkLevel+1} (\${atkCost})\`, this.W - 80, upgY - 70);
        
        let defCost = 50 + this.player.upgDefLevel*50;
        ctx.fillStyle = this.player.minerals >= defCost ? '#2980b9' : '#555';
        ctx.fillRect(this.W - 140, upgY - 50, 120, 30);
        ctx.fillStyle = '#fff'; ctx.fillText(\`쉴드 Lv\${this.player.upgDefLevel+1} (\${defCost})\`, this.W - 80, upgY - 30);
        
        let ecoCost = 50 + this.player.upgEcoLevel*50;
        ctx.fillStyle = this.player.minerals >= ecoCost ? '#f1c40f' : '#555';
        ctx.fillRect(this.W - 140, upgY - 10, 120, 30);
        ctx.fillStyle = '#000'; ctx.fillText(\`채굴량 Lv\${this.player.upgEcoLevel+1} (\${ecoCost})\`, this.W - 80, upgY + 10);

        if (this.state === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,this.W,this.H);
            ctx.textAlign = 'center';
            if (this.winner === 'Player') {
                ctx.fillStyle = '#66fcf1'; ctx.font = 'bold 60px Arial';
                ctx.fillText('✨ 은하 정복 완료! ✨', this.W/2, this.H/2);
            } else {
                ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 60px Arial';
                ctx.fillText('💥 제국 멸망 💥', this.W/2, this.H/2 - 20);
            }
            ctx.fillStyle = '#fff'; ctx.font = '20px Arial';
            ctx.fillText('화면을 클릭하여 다시 시작하세요', this.W/2, this.H/2 + 50);
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

minigames = minigames.replace(/}\s*;\s*$/, stellarisGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
console.log('Stellaris game injected!');
