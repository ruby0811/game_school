const fs = require('fs');
let code = fs.readFileSync('minigames.js', 'utf8');

// Add minimap and direction arrow to the HUD section
// Find the closing of the HUD section (before overlay screens)
const oldHUD = `            // Timer expired → force dead
            if (this.stageTimer >= this.STAGE_DURATION && this.state === 'playing') {
                this.state = 'dead';
            }`;

const newHUD = `            // Timer expired → force dead
            if (this.stageTimer >= this.STAGE_DURATION && this.state === 'playing') {
                this.state = 'dead';
            }

            // ===== MINIMAP =====
            const mm = { x: this.W - 155, y: this.H - 155, w: 140, h: 140 };
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(mm.x - 3, mm.y - 3, mm.w + 6, mm.h + 6);
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.strokeRect(mm.x - 3, mm.y - 3, mm.w + 6, mm.h + 6);

            // Walls on minimap
            ctx.fillStyle = '#445544';
            for (const w of this.walls) {
                ctx.fillRect(
                    mm.x + (w.x / this.MAPW) * mm.w,
                    mm.y + (w.y / this.MAPH) * mm.h,
                    Math.max(1, (w.w / this.MAPW) * mm.w),
                    Math.max(1, (w.h / this.MAPH) * mm.h)
                );
            }

            // Extraction zone on minimap
            const ezMx = mm.x + (this.extractZone.x / this.MAPW) * mm.w;
            const ezMy = mm.y + (this.extractZone.y / this.MAPH) * mm.h;
            ctx.beginPath();
            ctx.arc(ezMx, ezMy, 6, 0, Math.PI * 2);
            ctx.fillStyle = \`rgba(0,255,100,\${0.5 + Math.sin(Date.now()/300)*0.4})\`;
            ctx.fill();
            ctx.fillStyle = '#00ff64';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('탈출', ezMx, ezMy - 8);

            // Loot on minimap
            this.loot.forEach(l => {
                ctx.fillStyle = l.color;
                ctx.fillRect(
                    mm.x + (l.x / this.MAPW) * mm.w - 1,
                    mm.y + (l.y / this.MAPH) * mm.h - 1,
                    3, 3
                );
            });

            // Enemies on minimap
            this.enemies.forEach(e => {
                ctx.fillStyle = e.alert ? '#ff4444' : '#886633';
                ctx.beginPath();
                ctx.arc(
                    mm.x + (e.x / this.MAPW) * mm.w,
                    mm.y + (e.y / this.MAPH) * mm.h,
                    2, 0, Math.PI * 2
                );
                ctx.fill();
            });

            // Player on minimap
            const pmx = mm.x + (p.x / this.MAPW) * mm.w;
            const pmy = mm.y + (p.y / this.MAPH) * mm.h;
            ctx.fillStyle = '#00aaff';
            ctx.beginPath();
            ctx.arc(pmx, pmy, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#aaa';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('미니맵', mm.x + mm.w / 2, mm.y - 7);

            // ===== DIRECTION ARROW to extraction zone =====
            const angleToEz = Math.atan2(this.extractZone.y - p.y, this.extractZone.x - p.x);
            const distToEz = Math.hypot(this.extractZone.x - p.x, this.extractZone.y - p.y);
            // Only show arrow if outside extraction zone
            if (distToEz > this.extractZone.radius + 20) {
                const arrowX = this.W / 2 + Math.cos(angleToEz) * 60;
                const arrowY = 80 + Math.sin(angleToEz) * 30;
                const arrowLen = 22;

                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(angleToEz);
                ctx.fillStyle = \`rgba(0,255,100,\${0.7 + Math.sin(Date.now()/200)*0.3})\`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ff64';
                ctx.beginPath();
                ctx.moveTo(arrowLen, 0);
                ctx.lineTo(-arrowLen * 0.5, -8);
                ctx.lineTo(-arrowLen * 0.5, 8);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();

                ctx.fillStyle = '#00ff88';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(\`🚁 \${Math.floor(distToEz)}m\`, this.W / 2, 100);
            }`;

code = code.replace(oldHUD, newHUD);
fs.writeFileSync('minigames.js', code);
console.log('Done - added minimap and direction arrow');
