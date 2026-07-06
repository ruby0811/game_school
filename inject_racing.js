const fs = require('fs');
let minigames = fs.readFileSync('minigames.js', 'utf8');

const racingGameStr = `
,
racing: {
        overlay: null, canvas: null, ctx: null, isPlaying: false,
        W: 800, H: 600, keys: {},
        
        // Game State
        speed: 0, maxSpeed: 200, accel: 2, breaking: -4, decel: -1,
        offRoadDecel: -5, offRoadLimit: 50,
        position: 0, playerX: 0, steerSpeed: 3, 
        
        // Track
        segments: [], segmentLength: 200, trackLength: 0, drawDistance: 300,
        cameraDepth: 0.84, // FOV
        
        // Visuals
        roadWidth: 2000, rumbleLength: 3, lanes: 3,
        
        // Sprites/Items
        sprites: [], score: 0, lap: 1, maxLaps: 3, timer: 0, boostTimer: 0, spinTimer: 0,
        
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
            uiDiv.style.color = '#fff';
            uiDiv.style.fontFamily = '"Press Start 2P", sans-serif';
            uiDiv.style.fontSize = '24px';
            uiDiv.style.fontWeight = 'bold';
            uiDiv.style.textShadow = '2px 2px 0px #000';
            uiDiv.style.pointerEvents = 'none';
            uiDiv.style.zIndex = '10';

            this.hudLeft = document.createElement('div');
            this.hudRight = document.createElement('div');
            this.hudRight.style.textAlign = 'right';
            
            uiDiv.appendChild(this.hudLeft);
            uiDiv.appendChild(this.hudRight);

            const closeBtn = document.createElement('button');
            closeBtn.innerText = '✕';
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.background = 'rgba(0,0,0,0.5)';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '40px';
            closeBtn.style.height = '40px';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => this.close();
            
            const btnContainer = document.createElement('div');
            btnContainer.style.pointerEvents = 'auto';
            btnContainer.appendChild(closeBtn);
            uiDiv.appendChild(btnContainer);

            gameContainer.appendChild(uiDiv);

            // Input
            this.handleKeyDown = (e) => { this.keys[e.key] = true; };
            this.handleKeyUp = (e) => { this.keys[e.key] = false; };
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);

            this.resetTrack();
            this.resetGame();
            this.isPlaying = true;
            this.lastTime = performance.now();
            this.gameLoop();
        },

        resetGame() {
            this.speed = 0;
            this.position = 0;
            this.playerX = 0;
            this.score = 0;
            this.lap = 1;
            this.timer = 0;
            this.boostTimer = 0;
            this.spinTimer = 0;
            this.gameState = 'playing'; // 'playing', 'finished'
            this.message = '';
        },

        // Build pseudo-3D track
        resetTrack() {
            this.segments = [];
            const addSegment = (curve, y) => {
                this.segments.push({
                    index: this.segments.length,
                    p1: { world: { y: this.segments.length * this.segmentLength, z: 0 }, camera: {}, screen: {} },
                    p2: { world: { y: (this.segments.length + 1) * this.segmentLength, z: 0 }, camera: {}, screen: {} },
                    curve: curve,
                    sprites: [],
                    color: Math.floor(this.segments.length / this.rumbleLength) % 2 ? 
                           { road: '#6b6b6b', grass: '#10aa10', rumble: '#555', lane: '#6b6b6b' } : 
                           { road: '#6b6b6b', grass: '#009a00', rumble: '#eee', lane: '#fff' }
                });
            };

            const addRoad = (enter, hold, leave, curve) => {
                for(let i=0; i<enter; i++) addSegment(curve * (i/enter), 0);
                for(let i=0; i<hold;  i++) addSegment(curve, 0);
                for(let i=0; i<leave; i++) addSegment(curve * (1 - i/leave), 0);
            };

            // Straight, Curve Left, Straight, Curve Right, S-Curve
            addRoad(50, 50, 50, 0);
            addRoad(50, 100, 50, -2);
            addRoad(50, 50, 50, 0);
            addRoad(50, 100, 50, 3);
            addRoad(50, 50, 50, 0);
            addRoad(50, 50, 50, -4);
            addRoad(50, 50, 50, 4);
            addRoad(50, 100, 50, 0);

            // Add finish line
            this.segments[this.segments.length-1].color.road = '#fff';
            
            this.trackLength = this.segments.length * this.segmentLength;

            // Add Items (Mushrooms, Bananas)
            for(let i=100; i<this.segments.length; i+=Math.floor(Math.random()*40 + 20)) {
                const type = Math.random() > 0.4 ? 'mushroom' : 'banana';
                const offset = (Math.random() * 2) - 1; // -1 to 1
                this.segments[i].sprites.push({ source: type, offset: offset });
            }
        },

        update(dt) {
            if (this.gameState === 'finished') return;

            this.timer += dt;
            if (this.boostTimer > 0) this.boostTimer -= dt;
            if (this.spinTimer > 0) {
                this.spinTimer -= dt;
                this.speed += this.breaking * 2; // slow down during spin
                if (this.speed < 0) this.speed = 0;
            }

            const currentSegment = this.segments[Math.floor(this.position / this.segmentLength) % this.segments.length];

            let dx = dt * this.steerSpeed * (this.speed / this.maxSpeed);

            if (this.spinTimer <= 0) {
                if ((this.keys['ArrowLeft'] || this.keys['a']) && this.speed > 0) this.playerX -= dx;
                else if ((this.keys['ArrowRight'] || this.keys['d']) && this.speed > 0) this.playerX += dx;

                this.playerX -= (dx * this.speed/this.maxSpeed * currentSegment.curve * 0.02);

                let currentMaxSpeed = this.boostTimer > 0 ? this.maxSpeed * 1.5 : this.maxSpeed;

                if (this.keys['ArrowUp'] || this.keys['w']) {
                    this.speed += this.accel;
                } else if (this.keys['ArrowDown'] || this.keys['s']) {
                    this.speed += this.breaking;
                } else {
                    this.speed += this.decel;
                }

                // Off-road
                if ((this.playerX < -1 || this.playerX > 1) && this.speed > this.offRoadLimit) {
                    this.speed += this.offRoadDecel;
                }

                if (this.speed > currentMaxSpeed) this.speed = currentMaxSpeed;
                if (this.speed < 0) this.speed = 0;
            }

            this.position += this.speed;

            // Check item collision
            for(let i=0; i<currentSegment.sprites.length; i++) {
                const sprite = currentSegment.sprites[i];
                if (!sprite.collected) {
                    const spriteW = 0.3; // Hitbox width
                    if (this.playerX > sprite.offset - spriteW && this.playerX < sprite.offset + spriteW) {
                        sprite.collected = true;
                        if (sprite.source === 'mushroom') {
                            this.boostTimer = 2.0; // 2 seconds boost
                            this.score += 100;
                        } else if (sprite.source === 'banana') {
                            this.spinTimer = 1.0; // 1 second spin out
                            this.speed *= 0.5;
                        }
                    }
                }
            }

            // Lap logic
            while (this.position >= this.trackLength) {
                this.position -= this.trackLength;
                this.lap++;
                if (this.lap > this.maxLaps) {
                    this.gameState = 'finished';
                    this.lap = this.maxLaps;
                    this.message = '🏁 FINISH! 🏁';
                }
            }

            // Update HUD
            this.hudLeft.innerHTML = \`LAP \${this.lap}/\${this.maxLaps}<br>SCORE \${this.score}\`;
            this.hudRight.innerHTML = \`\${Math.floor(this.speed)} KM/H<br>TIME \${this.timer.toFixed(1)}\`;
        },

        project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
            p.camera.x = (p.world.x || 0) - cameraX;
            p.camera.y = (p.world.y || 0) - cameraY;
            p.camera.z = (p.world.z || 0) - cameraZ;
            const scale = cameraDepth / p.camera.z;
            p.screen.x = Math.round((width / 2) + (scale * p.camera.x * width / 2));
            p.screen.y = Math.round((height / 2) - (scale * p.camera.y * height / 2));
            p.screen.w = Math.round((scale * roadWidth * width / 2));
        },

        drawPolygon(ctx, x1, y1, w1, x2, y2, w2, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1 - w1, y1);
            ctx.lineTo(x2 - w2, y2);
            ctx.lineTo(x2 + w2, y2);
            ctx.lineTo(x1 + w1, y1);
            ctx.fill();
        },

        drawSprite(ctx, sprite, segment, camX, camY, camZ) {
            const scale = this.cameraDepth / (segment.p1.world.z - camZ);
            const destX = (this.W / 2) + (scale * (sprite.offset * this.roadWidth - camX) * this.W / 2);
            const destY = (this.H / 2) - (scale * (0 - camY) * this.H / 2);
            const destW = (scale * 1000 * this.W / 2); // Base sprite size
            const destH = destW;
            
            // Very simple drawing for items
            if (sprite.source === 'mushroom') {
                ctx.fillStyle = '#f00'; // Red mushroom cap
                ctx.beginPath();
                ctx.arc(destX, destY - destH/2, destW/2, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = '#fff'; // White spots & stem
                ctx.fillRect(destX - destW/6, destY - destH/2, destW/3, destH/2);
                ctx.beginPath();
                ctx.arc(destX - destW/4, destY - destH*0.7, destW/6, 0, Math.PI*2);
                ctx.fill();
            } else if (sprite.source === 'banana') {
                ctx.fillStyle = '#ff0'; // Yellow banana
                ctx.beginPath();
                ctx.moveTo(destX - destW/2, destY - destH);
                ctx.quadraticCurveTo(destX, destY, destX + destW/2, destY - destH);
                ctx.quadraticCurveTo(destX, destY - destH*0.5, destX - destW/2, destY - destH);
                ctx.fill();
            }
        },

        drawPlayer(ctx) {
            const scale = 1.5;
            const destX = this.W / 2;
            const destY = this.H - 50;
            const destW = 80 * scale;
            const destH = 60 * scale;
            
            ctx.save();
            ctx.translate(destX, destY);
            
            // Spin animation
            if (this.spinTimer > 0) {
                ctx.rotate((this.spinTimer * 10) % (Math.PI * 2));
            } else {
                // Steer rotation
                const steerAngle = (this.keys['ArrowLeft'] || this.keys['a']) ? -0.2 : ((this.keys['ArrowRight'] || this.keys['d']) ? 0.2 : 0);
                ctx.rotate(steerAngle);
            }

            // Draw Kart
            // Tires
            ctx.fillStyle = '#111';
            ctx.fillRect(-destW/2, -destH/2, 20, 30);
            ctx.fillRect(destW/2 - 20, -destH/2, 20, 30);
            ctx.fillRect(-destW/2, destH/2 - 30, 20, 30);
            ctx.fillRect(destW/2 - 20, destH/2 - 30, 20, 30);
            
            // Body
            ctx.fillStyle = '#e94560'; // Main color
            ctx.beginPath();
            ctx.roundRect(-destW/2 + 10, -destH/2, destW - 20, destH, 10);
            ctx.fill();

            // Driver Head
            ctx.fillStyle = '#ffb6c1';
            ctx.beginPath();
            ctx.arc(0, -5, 15, 0, Math.PI*2);
            ctx.fill();
            
            // Helmet / Hat
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(0, -10, 15, Math.PI, 0);
            ctx.fill();

            ctx.restore();
        },

        draw() {
            // Sky
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.W, this.H/2);
            // Ground
            this.ctx.fillStyle = '#10aa10';
            this.ctx.fillRect(0, this.H/2, this.W, this.H/2);

            const baseSegment = this.segments[Math.floor(this.position / this.segmentLength) % this.segments.length];
            const basePercent = (this.position % this.segmentLength) / this.segmentLength;

            let camY = 1000;
            let camZ = this.position;
            let camX = this.playerX * this.roadWidth;
            
            let maxy = this.H;
            
            let dx = - (baseSegment.curve * basePercent);
            let x = 0;

            // Render Road
            for (let n = 0; n < this.drawDistance; n++) {
                const segmentIndex = (baseSegment.index + n) % this.segments.length;
                const segment = this.segments[segmentIndex];
                
                segment.p1.world.z = (baseSegment.index + n) * this.segmentLength;
                segment.p2.world.z = (baseSegment.index + n + 1) * this.segmentLength;

                this.project(segment.p1, (this.playerX * this.roadWidth) - x, camY, camZ, this.cameraDepth, this.W, this.H, this.roadWidth);
                this.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, camY, camZ, this.cameraDepth, this.W, this.H, this.roadWidth);
                
                x += dx;
                dx += segment.curve;

                if (segment.p1.camera.z <= this.cameraDepth || segment.p2.screen.y >= maxy || segment.p2.screen.y >= segment.p1.screen.y) continue;

                // Grass
                this.ctx.fillStyle = segment.color.grass;
                this.ctx.fillRect(0, segment.p2.screen.y, this.W, segment.p1.screen.y - segment.p2.screen.y);

                // Rumble
                this.drawPolygon(this.ctx, 
                    segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w * 1.2,
                    segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w * 1.2,
                    segment.color.rumble
                );

                // Road
                this.drawPolygon(this.ctx, 
                    segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
                    segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
                    segment.color.road
                );

                // Lanes
                if (segment.color.lane) {
                    const lanew1 = segment.p1.screen.w * 2 / this.lanes;
                    const lanew2 = segment.p2.screen.w * 2 / this.lanes;
                    let lanex1 = segment.p1.screen.x - segment.p1.screen.w + lanew1;
                    let lanex2 = segment.p2.screen.x - segment.p2.screen.w + lanew2;
                    
                    for(let lane=1; lane<this.lanes; lane++) {
                        this.drawPolygon(this.ctx, 
                            lanex1, segment.p1.screen.y, segment.p1.screen.w * 0.02,
                            lanex2, segment.p2.screen.y, segment.p2.screen.w * 0.02,
                            segment.color.lane
                        );
                        lanex1 += lanew1;
                        lanex2 += lanew2;
                    }
                }

                maxy = segment.p1.screen.y;
            }

            // Render Items (Back to front)
            for (let n = this.drawDistance - 1; n > 0; n--) {
                const segmentIndex = (baseSegment.index + n) % this.segments.length;
                const segment = this.segments[segmentIndex];
                for(let i=0; i<segment.sprites.length; i++) {
                    const sprite = segment.sprites[i];
                    if (!sprite.collected) {
                        this.drawSprite(this.ctx, sprite, segment, camX, camY, camZ);
                    }
                }
            }

            this.drawPlayer(this.ctx);

            // Message Display
            if (this.message) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.fillRect(0, this.H/2 - 40, this.W, 80);
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = 'bold 40px "Press Start 2P", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.message, this.W/2, this.H/2);
            }
        },

        gameLoop() {
            if (!this.isPlaying) return;
            const now = performance.now();
            const dt = (now - this.lastTime) / 1000;
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
minigames = minigames.replace(/}\s*;\s*$/, racingGameStr + '\n};\n');
fs.writeFileSync('minigames.js', minigames);
