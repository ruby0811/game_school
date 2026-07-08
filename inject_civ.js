const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const civGameStr = `
,
civilization: {
    overlay: null, canvas: null, ctx: null, isPlaying: false,
    W: 900, H: 640,

    TILE_W: 52, TILE_H: 52,
    COLS: 22, ROWS: 14,

    TERRAIN: {
        ocean: { color: '#1565C0', label: '바다', move: false },
        plains: { color: '#8BC34A', label: '평원', move: true, food: 2, prod: 1 },
        forest: { color: '#2E7D32', label: '숲', move: true, food: 1, prod: 2 },
        hills:  { color: '#A1887F', label: '구릉', move: true, food: 1, prod: 2 },
        desert: { color: '#FDD835', label: '사막', move: true, food: 0, prod: 1 },
        mountain:{ color: '#757575', label: '산', move: false }
    },

    UNIT_TYPES: {
        settler: { name: '개척자', icon: '🏕️', hp: 1, atk: 0, def: 0, move: 2, cost: 0, canFound: true },
        warrior: { name: '전사', icon: '⚔️', hp: 3, atk: 2, def: 1, move: 2, cost: 15 },
        archer:  { name: '궁수', icon: '🏹', hp: 2, atk: 3, def: 0, move: 2, cost: 20 },
        knight:  { name: '기사', icon: '🛡️', hp: 5, atk: 4, def: 2, move: 3, cost: 35 }
    },

    map: [], cities: [], units: [], turn: 1,
    selected: null, // {type:'unit'|'city', ref}
    phase: 'player', // 'player', 'ai', 'gameover'
    winner: null,
    log: [], maxLog: 5,
    camera: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    hoveredTile: null,
    movePath: [],

    init() {
        const { overlay, gameContainer } = MiniGames._createOverlay();
        this.overlay = overlay;
        gameContainer.style.backgroundColor = '#111';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.ctx = this.canvas.getContext('2d');
        gameContainer.appendChild(this.canvas);

        // Reset game state
        this.map = []; this.cities = []; this.units = [];
        this.turn = 1; this.selected = null; this.log = [];
        this.phase = 'player'; this.winner = null;
        this.camera = { x: 0, y: 0 };

        this.generateMap();
        this.setupStartPositions();

        this.handleClick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.W / rect.width);
            const my = (e.clientY - rect.top) * (this.H / rect.height);
            this.onClick(mx, my, e.button);
        };
        this.canvas.addEventListener('mousedown', this.handleClick);
        this.handleMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (this.W / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (this.H / rect.height);
            const tx = Math.floor((this.mouse.x + this.camera.x) / this.TILE_W);
            const ty = Math.floor((this.mouse.y + this.camera.y) / this.TILE_H);
            if (tx >= 0 && tx < this.COLS && ty >= 0 && ty < this.ROWS) {
                this.hoveredTile = { x: tx, y: ty };
            }
        };
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        this.isPlaying = true;
        this.gameLoop();
    },

    generateMap() {
        const terrainList = ['plains','plains','plains','forest','forest','hills','desert','ocean','ocean','mountain'];
        for (let y = 0; y < this.ROWS; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.COLS; x++) {
                // Border is ocean
                if (x === 0 || x === this.COLS-1 || y === 0 || y === this.ROWS-1) {
                    this.map[y][x] = { type: 'ocean', visible: false };
                } else {
                    const t = terrainList[Math.floor(Math.random() * terrainList.length)];
                    this.map[y][x] = { type: t, visible: false };
                }
            }
        }
        // Make some rivers (continuous plains)
        for (let i = 0; i < 3; i++) {
            let rx = Math.floor(Math.random() * (this.COLS - 4)) + 2;
            for (let ry = 1; ry < this.ROWS - 1; ry++) {
                this.map[ry][rx].type = 'plains';
                rx += Math.floor(Math.random()*3) - 1;
                rx = Math.max(1, Math.min(this.COLS-2, rx));
            }
        }
    },

    setupStartPositions() {
        // Player start: left side
        const px = 3, py = Math.floor(this.ROWS / 2);
        this.map[py][px].type = 'plains';
        this.foundCity(px, py, 'player', '서울');
        this.spawnUnit(px+1, py, 'player', 'warrior');
        this.spawnUnit(px, py+1, 'player', 'archer');

        // AI start: right side
        const ax = this.COLS - 4, ay = Math.floor(this.ROWS / 2);
        this.map[ay][ax].type = 'plains';
        this.foundCity(ax, ay, 'ai', '로마');
        this.spawnUnit(ax-1, ay, 'ai', 'warrior');
        this.spawnUnit(ax, ay-1, 'ai', 'warrior');

        this.updateVisibility();
    },

    foundCity(x, y, owner, name) {
        const baseCity = { x, y, owner, name, hp: 20, maxHp: 20, pop: 1,
            food: 0, prod: 0, gold: 5, prodQueue: null, prodProgress: 0,
            buildings: [], prodPerTurn: 3, foodPerTurn: 2, goldPerTurn: 2 };
        this.cities.push(baseCity);
        this.map[y][x].city = baseCity;
        return baseCity;
    },

    spawnUnit(x, y, owner, type) {
        const def = this.UNIT_TYPES[type];
        const unit = { x, y, owner, type,
            hp: def.hp, maxHp: def.hp, atk: def.atk, def: def.def,
            movesLeft: def.move, maxMoves: def.move, moved: false, attacked: false };
        this.units.push(unit);
        return unit;
    },

    updateVisibility() {
        // Reset
        for (let y = 0; y < this.ROWS; y++)
            for (let x = 0; x < this.COLS; x++)
                this.map[y][x].visible = false;
        // Reveal around player units and cities
        const playerEntities = [
            ...this.units.filter(u => u.owner === 'player'),
            ...this.cities.filter(c => c.owner === 'player')
        ];
        playerEntities.forEach(e => {
            const r = e.type && this.UNIT_TYPES[e.type] ? 2 : 3;
            for (let dy = -r; dy <= r; dy++)
                for (let dx = -r; dx <= r; dx++) {
                    const nx = e.x + dx, ny = e.y + dy;
                    if (nx >= 0 && nx < this.COLS && ny >= 0 && ny < this.ROWS)
                        this.map[ny][nx].visible = true;
                }
        });
    },

    getTile(x, y) {
        if (x < 0 || x >= this.COLS || y < 0 || y >= this.ROWS) return null;
        return this.map[y][x];
    },

    getUnitAt(x, y) { return this.units.find(u => u.x === x && u.y === y); },
    getCityAt(x, y) { return this.cities.find(c => c.x === x && c.y === y); },

    tileToScreen(tx, ty) {
        return { x: tx * this.TILE_W - this.camera.x, y: ty * this.TILE_H - this.camera.y };
    },
    screenToTile(sx, sy) {
        return { x: Math.floor((sx + this.camera.x) / this.TILE_W), y: Math.floor((sy + this.camera.y) / this.TILE_H) };
    },

    // BFS move range
    getMoveRange(unit) {
        if (unit.moved) return [];
        const visited = new Map();
        const queue = [{ x: unit.x, y: unit.y, moves: unit.movesLeft }];
        visited.set(\`\${unit.x},\${unit.y}\`, true);
        const result = [];
        while (queue.length) {
            const cur = queue.shift();
            const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
            dirs.forEach(({dx,dy}) => {
                const nx = cur.x + dx, ny = cur.y + dy;
                const key = \`\${nx},\${ny}\`;
                const tile = this.getTile(nx, ny);
                if (!tile || !this.TERRAIN[tile.type].move || visited.has(key)) return;
                const eo = this.getUnitAt(nx, ny);
                if (eo && eo.owner !== unit.owner) {
                    // Can attack
                    result.push({ x: nx, y: ny, attack: true });
                    visited.set(key, true);
                    return;
                }
                if (eo) return; // Friendly blocked
                const cost = 1;
                if (cur.moves - cost >= 0) {
                    visited.set(key, true);
                    result.push({ x: nx, y: ny, attack: false });
                    queue.push({ x: nx, y: ny, moves: cur.moves - cost });
                }
            });
        }
        return result;
    },

    onClick(mx, my, btn) {
        if (this.phase !== 'player') return;
        const { x: tx, y: ty } = this.screenToTile(mx, my);
        if (tx < 0 || tx >= this.COLS || ty < 0 || ty >= this.ROWS) return;

        // Right click deselects
        if (btn === 2) { this.selected = null; return; }

        const clickedUnit = this.getUnitAt(tx, ty);
        const clickedCity = this.getCityAt(tx, ty);

        if (this.selected?.type === 'unit') {
            const selUnit = this.selected.ref;
            const range = this.getMoveRange(selUnit);
            const target = range.find(r => r.x === tx && r.y === ty);

            if (target) {
                if (target.attack) {
                    this.combat(selUnit, this.getUnitAt(tx, ty));
                    selUnit.moved = true; selUnit.movesLeft = 0;
                    this.selected = null;
                } else {
                    selUnit.x = tx; selUnit.y = ty;
                    selUnit.movesLeft--;
                    selUnit.moved = true;
                    // Found city if settler
                    if (selUnit.type === 'settler') {
                        const c = this.cities.length;
                        const names = ['부산','인천','대구','광주','대전','울산','제주','평양','개성','금강산'];
                        this.foundCity(tx, ty, 'player', names[c % names.length]);
                        this.units = this.units.filter(u => u !== selUnit);
                        this.addLog(\`🏙️ 새 도시 건설!\`);
                    }
                    this.selected = null;
                }
                this.updateVisibility();
                return;
            }

            // Deselect and reselect
            this.selected = null;
        }

        // Select
        if (clickedUnit && clickedUnit.owner === 'player') {
            this.selected = { type: 'unit', ref: clickedUnit };
        } else if (clickedCity && clickedCity.owner === 'player') {
            this.selected = { type: 'city', ref: clickedCity };
            this.openCityMenu(clickedCity);
        }
    },

    openCityMenu(city) {
        // Show production options in log area
        this.log = [
            \`🏙️ \${city.name} | 인구 \${city.pop} | 생산력 \${city.prodPerTurn}/턴\`,
            \`💰 클릭하여 생산 선택:\`,
        ];
        Object.entries(this.UNIT_TYPES).forEach(([key, u]) => {
            if (!u.canFound) this.log.push(\`  [생산] \${u.icon} \${u.name} - \${u.cost}생산력\`);
        });
    },

    buildUnit(city, type) {
        if (city.prod < this.UNIT_TYPES[type].cost) return;
        city.prod -= this.UNIT_TYPES[type].cost;
        // Find empty tile near city
        const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1},{dx:1,dy:1}];
        for (const {dx, dy} of dirs) {
            const nx = city.x + dx, ny = city.y + dy;
            const tile = this.getTile(nx, ny);
            if (tile && this.TERRAIN[tile.type].move && !this.getUnitAt(nx, ny)) {
                this.spawnUnit(nx, ny, city.owner, type);
                this.addLog(\`\${this.UNIT_TYPES[type].icon} \${this.UNIT_TYPES[type].name} 생산 완료!\`);
                return;
            }
        }
    },

    combat(attacker, defender) {
        const atkRoll = attacker.atk + Math.floor(Math.random() * 3);
        const defRoll = defender.def + Math.floor(Math.random() * 2);
        const dmg = Math.max(1, atkRoll - defRoll);
        defender.hp -= dmg;
        const defCity = this.getCityAt(defender.x, defender.y);
        if (defCity) defCity.hp -= dmg * 2;

        if (defender.hp <= 0) {
            this.units = this.units.filter(u => u !== defender);
            this.addLog(\`\${this.UNIT_TYPES[attacker.type].icon} 전투 승리! \${this.UNIT_TYPES[defender.type].name} 격파\`);
        } else {
            this.addLog(\`⚔️ 전투: 적 \${dmg} 피해\`);
        }
        this.checkWinCondition();
    },

    checkWinCondition() {
        const playerCities = this.cities.filter(c => c.owner === 'player');
        const aiCities = this.cities.filter(c => c.owner === 'ai');
        if (aiCities.length === 0) { this.winner = 'player'; this.phase = 'gameover'; }
        if (playerCities.length === 0) { this.winner = 'ai'; this.phase = 'gameover'; }
    },

    endPlayerTurn() {
        // Process player cities
        this.cities.filter(c => c.owner === 'player').forEach(city => {
            city.prod += city.prodPerTurn;
            city.food += city.foodPerTurn;
            city.gold += city.goldPerTurn;
            if (city.food >= 10 * city.pop) {
                city.food = 0; city.pop++;
                city.prodPerTurn = Math.min(city.prodPerTurn + 1, 8);
                this.addLog(\`👶 \${city.name} 인구 증가! (\${city.pop}명)\`);
            }
        });
        // Reset player units
        this.units.filter(u => u.owner === 'player').forEach(u => {
            u.moved = false; u.movesLeft = u.maxMoves; u.attacked = false;
        });
        this.selected = null;
        this.phase = 'ai';
        this.turn++;
        this.addLog(\`--- 턴 \${this.turn} ---\`);
        setTimeout(() => this.aiTurn(), 500);
    },

    aiTurn() {
        // Process AI cities
        this.cities.filter(c => c.owner === 'ai').forEach(city => {
            city.prod += city.prodPerTurn;
            city.food += city.foodPerTurn;
            city.gold += city.goldPerTurn;
            if (city.prod >= 15 && this.units.filter(u => u.owner === 'ai').length < 5) {
                const types = ['warrior','warrior','archer','knight'];
                const t = types[Math.floor(Math.random()*types.length)];
                this.buildUnit(city, t);
            }
        });

        // Move AI units toward player
        this.units.filter(u => u.owner === 'ai').forEach(unit => {
            const playerCity = this.cities.find(c => c.owner === 'player');
            const playerUnit = this.units.find(u => u.owner === 'player');
            const target = playerUnit || playerCity;
            if (!target) return;
            // Simple pathfinding: move toward target
            for (let step = 0; step < unit.maxMoves; step++) {
                const dx = Math.sign(target.x - unit.x);
                const dy = Math.sign(target.y - unit.y);
                const options = [{dx, dy: 0},{dx: 0, dy},{dx, dy}];
                let moved = false;
                for (const opt of options) {
                    const nx = unit.x + opt.dx, ny = unit.y + opt.dy;
                    const tile = this.getTile(nx, ny);
                    if (!tile || !this.TERRAIN[tile.type].move) continue;
                    const eo = this.getUnitAt(nx, ny);
                    if (eo && eo.owner === 'player') {
                        this.combat(unit, eo);
                        moved = true; break;
                    }
                    if (eo) continue;
                    unit.x = nx; unit.y = ny; moved = true; break;
                }
                if (!moved) break;
            }
        });

        this.updateVisibility();
        this.checkWinCondition();
        this.phase = 'player';
    },

    addLog(msg) {
        this.log.unshift(msg);
        if (this.log.length > this.maxLog) this.log.pop();
    },

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.W, this.H);

        // Sidebar width
        const SB = 200;
        const mapW = this.W - SB;

        // === MAP ===
        ctx.save();
        ctx.rect(0, 0, mapW, this.H);
        ctx.clip();

        const startCol = Math.max(0, Math.floor(this.camera.x / this.TILE_W));
        const endCol = Math.min(this.COLS, startCol + Math.ceil(mapW / this.TILE_W) + 1);
        const startRow = Math.max(0, Math.floor(this.camera.y / this.TILE_H));
        const endRow = Math.min(this.ROWS, startRow + Math.ceil(this.H / this.TILE_H) + 1);

        // Move range highlight
        let moveRange = [];
        if (this.selected?.type === 'unit') {
            moveRange = this.getMoveRange(this.selected.ref);
        }

        for (let ty = startRow; ty < endRow; ty++) {
            for (let tx = startCol; tx < endCol; tx++) {
                const tile = this.map[ty][tx];
                const sx = tx * this.TILE_W - this.camera.x;
                const sy = ty * this.TILE_H - this.camera.y;
                const T = this.TERRAIN[tile.type];

                // Fog of war
                if (!tile.visible) {
                    ctx.fillStyle = '#111';
                    ctx.fillRect(sx, sy, this.TILE_W, this.TILE_H);
                    ctx.strokeStyle = '#222';
                    ctx.strokeRect(sx+0.5, sy+0.5, this.TILE_W-1, this.TILE_H-1);
                    continue;
                }

                ctx.fillStyle = T.color;
                ctx.fillRect(sx, sy, this.TILE_W, this.TILE_H);
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.strokeRect(sx+0.5, sy+0.5, this.TILE_W-1, this.TILE_H-1);

                // Grid coord text (small)
                // Move range
                const inRange = moveRange.find(r => r.x === tx && r.y === ty);
                if (inRange) {
                    ctx.fillStyle = inRange.attack ? 'rgba(255,0,0,0.4)' : 'rgba(0,200,255,0.35)';
                    ctx.fillRect(sx, sy, this.TILE_W, this.TILE_H);
                    ctx.strokeStyle = inRange.attack ? 'rgba(255,100,100,0.8)' : 'rgba(0,200,255,0.8)';
                    ctx.strokeRect(sx+1, sy+1, this.TILE_W-2, this.TILE_H-2);
                }

                // Terrain icon
                const icons = { forest: '🌲', mountain: '⛰️', desert: '🏜️', hills: '🏔️', ocean: '🌊', plains: '' };
                if (icons[tile.type]) {
                    ctx.font = '20px serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(icons[tile.type], sx + this.TILE_W/2, sy + this.TILE_H/2);
                }
            }
        }

        // Cities
        this.cities.forEach(city => {
            if (!this.map[city.y]?.[city.x]?.visible && city.owner === 'ai') return;
            const sx = city.x * this.TILE_W - this.camera.x;
            const sy = city.y * this.TILE_H - this.camera.y;
            if (sx < -this.TILE_W || sx > mapW || sy < -this.TILE_H || sy > this.H) return;

            // City base
            ctx.fillStyle = city.owner === 'player' ? '#1565C0' : '#B71C1C';
            ctx.fillRect(sx + 5, sy + 5, this.TILE_W - 10, this.TILE_H - 10);
            ctx.font = 'bold 22px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏙️', sx + this.TILE_W/2, sy + this.TILE_H/2);

            // Name
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
            ctx.fillText(city.name, sx + this.TILE_W/2, sy - 6);
            ctx.shadowBlur = 0;

            // HP bar
            const hp = city.hp / city.maxHp;
            ctx.fillStyle = '#f00'; ctx.fillRect(sx+4, sy+this.TILE_H-8, this.TILE_W-8, 5);
            ctx.fillStyle = '#0f0'; ctx.fillRect(sx+4, sy+this.TILE_H-8, (this.TILE_W-8)*hp, 5);

            // Selection
            if (this.selected?.type === 'city' && this.selected.ref === city) {
                ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
                ctx.strokeRect(sx+2, sy+2, this.TILE_W-4, this.TILE_H-4);
                ctx.lineWidth = 1;
            }
        });

        // Units
        this.units.forEach(unit => {
            if (!this.map[unit.y]?.[unit.x]?.visible && unit.owner === 'ai') return;
            const sx = unit.x * this.TILE_W - this.camera.x;
            const sy = unit.y * this.TILE_H - this.camera.y;
            if (sx < -this.TILE_W || sx > mapW || sy < -this.TILE_H || sy > this.H) return;

            const def = this.UNIT_TYPES[unit.type];
            // Background circle
            ctx.fillStyle = unit.owner === 'player' ? 'rgba(21,101,192,0.85)' : 'rgba(183,28,28,0.85)';
            ctx.beginPath(); ctx.arc(sx+this.TILE_W/2, sy+this.TILE_H/2, 18, 0, Math.PI*2); ctx.fill();

            // Icon
            ctx.font = '22px serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.globalAlpha = unit.moved ? 0.5 : 1.0;
            ctx.fillText(def.icon, sx + this.TILE_W/2, sy + this.TILE_H/2);
            ctx.globalAlpha = 1.0;

            // HP bar
            const hp = unit.hp / unit.maxHp;
            ctx.fillStyle = '#f00'; ctx.fillRect(sx+4, sy+this.TILE_H-8, this.TILE_W-8, 4);
            ctx.fillStyle = '#0f0'; ctx.fillRect(sx+4, sy+this.TILE_H-8, (this.TILE_W-8)*hp, 4);

            // Selection ring
            if (this.selected?.type === 'unit' && this.selected.ref === unit) {
                ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(sx+this.TILE_W/2, sy+this.TILE_H/2, 22, 0, Math.PI*2); ctx.stroke();
                ctx.lineWidth = 1;
            }
        });

        // Hovered tile tooltip
        if (this.hoveredTile) {
            const { x: hx, y: hy } = this.hoveredTile;
            const tile = this.getTile(hx, hy);
            if (tile && tile.visible) {
                const sx = hx * this.TILE_W - this.camera.x;
                const sy = hy * this.TILE_H - this.camera.y;
                ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
                ctx.strokeRect(sx+1, sy+1, this.TILE_W-2, this.TILE_H-2);
            }
        }

        ctx.restore();

        // === SIDEBAR ===
        const sbX = mapW;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(sbX, 0, SB, this.H);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(sbX, 0, SB, this.H);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🗺️ 문명 전략', sbX + SB/2, 24);

        // Turn info
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText(\`턴 \${this.turn} | \${this.phase === 'player' ? '내 차례' : 'AI 진행중...'}\`, sbX + SB/2, 44);

        // Player stats
        const pCity = this.cities.find(c => c.owner === 'player');
        if (pCity) {
            ctx.fillStyle = '#64B5F6';
            ctx.fillText('내 도시: ' + this.cities.filter(c=>c.owner==='player').map(c=>c.name).join(', '), sbX + SB/2, 65);
            ctx.fillStyle = '#A5D6A7';
            ctx.fillText(\`⚙️ 생산력: \${Math.floor(pCity.prod)}  🍞 식량: \${Math.floor(pCity.food)}\`, sbX + SB/2, 82);
            ctx.fillStyle = '#FFD54F';
            ctx.fillText(\`💰 금: \${Math.floor(pCity.gold)}\`, sbX + SB/2, 99);
        }

        // Selected unit info
        if (this.selected?.type === 'unit') {
            const u = this.selected.ref;
            const def = this.UNIT_TYPES[u.type];
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(\`선택: \${def.icon} \${def.name}\`, sbX + SB/2, 125);
            ctx.fillStyle = '#ddd';
            ctx.font = '12px sans-serif';
            ctx.fillText(\`HP: \${u.hp}/\${u.maxHp}  공격: \${u.atk}  방어: \${u.def}\`, sbX + SB/2, 142);
            ctx.fillText(\`이동력: \${u.movesLeft}/\${u.maxMoves}  상태: \${u.moved?'행동 완료':'대기중'}\`, sbX + SB/2, 158);
            // Build unit button if city selected nearby
        }

        // City production buttons
        if (this.selected?.type === 'city') {
            const city = this.selected.ref;
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(\`🏙️ \${city.name}\`, sbX + SB/2, 125);
            ctx.fillStyle = '#ddd';
            ctx.font = '12px sans-serif';
            ctx.fillText(\`인구: \${city.pop} | 생산력: \${Math.floor(city.prod)}\`, sbX + SB/2, 142);

            const btns = [
                { key: 'warrior', label: '⚔️ 전사 (15)', y: 162 },
                { key: 'archer',  label: '🏹 궁수 (20)', y: 188 },
                { key: 'knight',  label: '🛡️ 기사 (35)', y: 214 },
                { key: 'settler', label: '🏕️ 개척자 (0)', y: 240 }
            ];

            btns.forEach(b => {
                const cost = this.UNIT_TYPES[b.key].cost;
                const canAfford = city.prod >= cost;
                ctx.fillStyle = canAfford ? '#1565C0' : '#444';
                ctx.fillRect(sbX + 10, b.y - 14, SB - 20, 22);
                ctx.fillStyle = canAfford ? '#fff' : '#888';
                ctx.font = '12px sans-serif';
                ctx.fillText(b.label, sbX + SB/2, b.y);
            });

            // Click handler for production
            if (!this._cityBtnHandler) {
                this._cityBtnHandler = (e) => {
                    if (this.selected?.type !== 'city') return;
                    const rect = this.canvas.getBoundingClientRect();
                    const my = (e.clientY - rect.top) * (this.H / rect.height);
                    const mx = (e.clientX - rect.left) * (this.W / rect.width);
                    if (mx < mapW) return;
                    const city = this.selected.ref;
                    const btns2 = [
                        { key: 'warrior', y: 162 }, { key: 'archer', y: 188 },
                        { key: 'knight', y: 214 }, { key: 'settler', y: 240 }
                    ];
                    btns2.forEach(b => {
                        if (my >= b.y - 14 && my <= b.y + 8) {
                            this.buildUnit(city, b.key);
                        }
                    });
                };
                this.canvas.addEventListener('mousedown', this._cityBtnHandler);
            }
        }

        // Log
        ctx.fillStyle = '#333';
        ctx.fillRect(sbX + 5, 270, SB - 10, 200);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(sbX + 5, 270, SB - 10, 200);
        ctx.fillStyle = '#64FFDA';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📋 전투 로그', sbX + SB/2, 286);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.textAlign = 'left';
        this.log.slice(0, 8).forEach((msg, i) => {
            ctx.fillText(msg, sbX + 10, 302 + i * 18);
        });

        // End Turn button
        if (this.phase === 'player') {
            ctx.fillStyle = '#e94560';
            ctx.beginPath();
            ctx.roundRect(sbX + 15, this.H - 80, SB - 30, 40, 8);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⏭️ 턴 종료', sbX + SB/2, this.H - 54);
        }

        // Camera controls help
        ctx.fillStyle = '#555';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WASD / 화살표: 화면 이동', sbX + SB/2, this.H - 20);

        // Minimap
        const mmW = SB - 10, mmH = 70;
        const mmX = sbX + 5, mmY = 480;
        ctx.fillStyle = '#111';
        ctx.fillRect(mmX, mmY, mmW, mmH);
        const mTW = mmW / this.COLS, mTH = mmH / this.ROWS;
        for (let ty = 0; ty < this.ROWS; ty++) {
            for (let tx = 0; tx < this.COLS; tx++) {
                const tile = this.map[ty][tx];
                if (!tile.visible) { ctx.fillStyle = '#1a1a1a'; }
                else { ctx.fillStyle = this.TERRAIN[tile.type].color; }
                ctx.fillRect(mmX + tx*mTW, mmY + ty*mTH, mTW, mTH);
            }
        }
        // Dot for player units
        this.units.filter(u=>u.owner==='player').forEach(u => {
            ctx.fillStyle = '#4FC3F7';
            ctx.fillRect(mmX + u.x*mTW - 1, mmY + u.y*mTH - 1, 4, 4);
        });
        this.cities.filter(c=>c.owner==='player').forEach(c => {
            ctx.fillStyle = '#fff';
            ctx.fillRect(mmX + c.x*mTW - 1, mmY + c.y*mTH - 1, 5, 5);
        });

        // End turn click handler
        if (!this._endTurnHandler) {
            this._endTurnHandler = (e) => {
                if (this.phase !== 'player') return;
                const rect = this.canvas.getBoundingClientRect();
                const mx = (e.clientX - rect.left) * (this.W / rect.width);
                const my = (e.clientY - rect.top) * (this.H / rect.height);
                if (mx >= sbX + 15 && mx <= this.W - 15 && my >= this.H - 80 && my <= this.H - 40) {
                    this.endPlayerTurn();
                }
            };
            this.canvas.addEventListener('mousedown', this._endTurnHandler);
        }

        // Close button
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.arc(this.W - 22, 22, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✕', this.W - 22, 26);

        // Close handler
        if (!this._closeHandler) {
            this._closeHandler = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const mx = (e.clientX - rect.left) * (this.W / rect.width);
                const my = (e.clientY - rect.top) * (this.H / rect.height);
                if (Math.hypot(mx - (this.W-22), my - 22) < 18) this.close();
            };
            this.canvas.addEventListener('mousedown', this._closeHandler);
        }

        // Camera WASD
        if (!this._keyHandler) {
            this._keyHandler = (e) => {
                const spd = 40;
                if (e.key === 'ArrowLeft' || e.key === 'a') this.camera.x = Math.max(0, this.camera.x - spd);
                if (e.key === 'ArrowRight'|| e.key === 'd') this.camera.x = Math.min(this.COLS*this.TILE_W - mapW, this.camera.x + spd);
                if (e.key === 'ArrowUp'  || e.key === 'w') this.camera.y = Math.max(0, this.camera.y - spd);
                if (e.key === 'ArrowDown' || e.key === 's') this.camera.y = Math.min(this.ROWS*this.TILE_H - this.H, this.camera.y + spd);
            };
            document.addEventListener('keydown', this._keyHandler);
        }

        // Game Over screen
        if (this.phase === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, this.W, this.H);
            ctx.font = 'bold 48px sans-serif';
            ctx.textAlign = 'center';
            if (this.winner === 'player') {
                ctx.fillStyle = '#FFD700';
                ctx.fillText('🏆 승리!', this.W/2, this.H/2 - 30);
                ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif';
                ctx.fillText('적 도시를 모두 정복했습니다!', this.W/2, this.H/2 + 20);
            } else {
                ctx.fillStyle = '#f44336';
                ctx.fillText('💀 패배...', this.W/2, this.H/2 - 30);
                ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif';
                ctx.fillText('도시를 잃었습니다. 다시 도전!', this.W/2, this.H/2 + 20);
            }
            ctx.font = '16px sans-serif'; ctx.fillStyle = '#aaa';
            ctx.fillText(\`생존 턴: \${this.turn}\`, this.W/2, this.H/2 + 60);
        }
    },

    gameLoop() {
        if (!this.isPlaying) return;
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    },

    close() {
        this.isPlaying = false;
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = null; this._endTurnHandler = null;
        this._closeHandler = null; this._cityBtnHandler = null;
        if (this.overlay) this.overlay.remove();
    }
}
`;

minigames = minigames.replace(/}\s*;\s*$/, civGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
console.log('Civilization game injected!');
