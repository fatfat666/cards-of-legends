// --- PIXIJS COMBAT ENGINE & VFX SYSTEM ---
let pixiApp = null;
let playerSprite = null;
let turretGroup = null;
let enforcerGroup = null;
let enemySprites = [];
let vfxLayer = null;
let animTicker = 0;

function safeDestroyDisplayObject(obj) {
 if (!obj) return;
 try {
 if (obj.parent) obj.parent.removeChild(obj);
 if (!obj.destroyed) obj.destroy({ children: true });
 } catch (e) {}
}

function setupPixiApp() {
 const wrapper = document.getElementById('canvas-wrapper');
 if (!wrapper) return;
 const tooltip = document.getElementById('enemy-tooltip');

 if (pixiApp) {
 try {
 pixiApp.destroy(true, { children: true });
 } catch (e) {}
 pixiApp = null;
 }

 wrapper.innerHTML = '';
 if (tooltip) wrapper.appendChild(tooltip);

 pixiApp = new PIXI.Application({
 width: wrapper.clientWidth || 960,
 height: 255,
 backgroundColor: 0x050811,
 backgroundAlpha: 0,
 antialias: true
 });
 wrapper.appendChild(pixiApp.view);

 const theme = CLASS_THEMES[gameState.classType] || CLASS_THEMES.Rogue;

 const pG = new PIXI.Graphics();
 pG.beginFill(theme.primaryHex);
 pG.drawPolygon([-25, 25, 25, 25, 0, -25]);
 pG.endFill();
 if (gameState.classType === 'Mob Boss') {
 pG.beginFill(0x0f172a);
 pG.drawRect(-22, -23, 44, 5);
 pG.drawRect(-13, -33, 26, 10);
 pG.endFill();
 pG.beginFill(0x22c55e);
 pG.drawCircle(0, 2, 7);
 pG.endFill();
 } else {
 pG.beginFill(0xf59e0b);
 pG.drawCircle(0, -5, 8);
 pG.endFill();
 }

 playerSprite = new PIXI.Container();
 playerSprite.addChild(pG);
 playerSprite.x = 200;
 playerSprite.y = 132;
 pixiApp.stage.addChild(playerSprite);

 turretGroup = new PIXI.Container();
 pixiApp.stage.addChild(turretGroup);

 enforcerGroup = new PIXI.Container();
 pixiApp.stage.addChild(enforcerGroup);

 enemySprites = [];
 gameState.enemies.forEach((enemy, idx) => {
 const eG = new PIXI.Graphics();
 eG.beginFill(0xef4444);
 eG.drawPolygon([-25, 25, 25, 25, 0, -25]);
 eG.endFill();
 eG.lineStyle(2, 0x000000);
 eG.drawCircle(0, 0, 10);

 const lockRing = new PIXI.Graphics();
 lockRing.lineStyle(2.5, 0xef4444, 0.95);
 lockRing.drawCircle(0, 0, 32);
 lockRing.lineStyle(2, 0xeab308, 1);
 lockRing.drawCircle(0, 0, 22);
 lockRing.moveTo(-38, 0); lockRing.lineTo(-14, 0);
 lockRing.moveTo(14, 0); lockRing.lineTo(38, 0);
 lockRing.moveTo(0, -38); lockRing.lineTo(0, -14);
 lockRing.moveTo(0, 14); lockRing.lineTo(0, 38);
 lockRing.visible = false;

 const enemyContainer = new PIXI.Container();
 enemyContainer.addChild(eG);
 enemyContainer.addChild(lockRing);
 enemyContainer.lockRing = lockRing;
 enemyContainer.x = gameState.enemies.length === 1 ? 750 : 700 + (idx * 90);
 enemyContainer.y = gameState.enemies.length === 1 ? 132 : 80 + (idx * 94);
 enemyContainer.eventMode = 'static';
 enemyContainer.cursor = 'pointer';

 enemyContainer.on('pointerover', () => {
 if (tooltip) {
 tooltip.style.display = 'block';
 tooltip.style.left = `${enemyContainer.x - 45}px`;
 tooltip.style.top = `${enemyContainer.y - 82}px`;
 tooltip.innerHTML = `<strong>${enemy.name}</strong>${enemy.hasBountyLock ? ' 🎯' : ''}<br>HP: ${enemy.hp}/${enemy.maxHp}<br>Poison: ${enemy.poison || 0} | Bleed: ${enemy.hemorrhage || 0} | Burn: ${enemy.burn || 0}`;
 }
 });
 enemyContainer.on('pointerout', () => {
 if (tooltip) tooltip.style.display = 'none';
 });

 pixiApp.stage.addChild(enemyContainer);
 enemySprites.push(enemyContainer);
 });

 vfxLayer = new PIXI.Container();
 pixiApp.stage.addChild(vfxLayer);

 pixiApp.ticker.add(() => {
 animTicker += 0.05;
 if (playerSprite && !playerSprite.destroyed) {
 playerSprite.y = 132 + Math.sin(animTicker) * 6;
 }
 if (turretGroup && !turretGroup.destroyed) {
 const turrets = gameState.turrets || [];
 const count = turrets.length;
 while (turretGroup.children.length > count) {
 const rem = turretGroup.children[turretGroup.children.length - 1];
 safeDestroyDisplayObject(rem);
 }
 for (let t = 0; t < count; t++) {
 const tData = turrets[t];
 const cType = (tData && tData.type) || 'auto_turret';
 let drone = turretGroup.children[t];
 if (!drone || drone.constructType !== cType) {
 if (drone) safeDestroyDisplayObject(drone);
 drone = new PIXI.Container();
 drone.constructType = cType;
 const dG = new PIXI.Graphics();
 if (cType === 'rail_turret') {
 dG.lineStyle(2, 0x38bdf8, 1);
 dG.beginFill(0x1e293b, 1);
 dG.drawRect(-12, -8, 20, 16);
 dG.endFill();
 dG.beginFill(0x38bdf8, 1);
 dG.drawRect(4, -3, 14, 6);
 dG.endFill();
 } else if (cType === 'flamethrower_turret') {
 dG.lineStyle(2, 0xf97316, 1);
 dG.beginFill(0x7c2d12, 1);
 dG.drawRoundedRect(-11, -9, 20, 18, 4);
 dG.endFill();
 dG.beginFill(0xfef08a, 1);
 dG.drawPolygon([8, -5, 16, -2, 16, 2, 8, 5]);
 dG.endFill();
 } else if (cType === 'aegis_barrier') {
 dG.lineStyle(2.5, 0x38bdf8, 1);
 dG.beginFill(0x0284c7, 0.45);
 dG.drawPolygon([-6, -15, 8, -10, 11, 0, 8, 10, -6, 15]);
 dG.endFill();
 } else if (cType === 'tesla_coil') {
 dG.lineStyle(2, 0xc084fc, 1);
 dG.beginFill(0x312e81, 1);
 dG.drawPolygon([-9, 11, 9, 11, 3, -11, -3, -11]);
 dG.endFill();
 dG.beginFill(0x38bdf8, 1);
 dG.drawCircle(0, -13, 5);
 dG.endFill();
 } else if (cType === 'goliath_mech') {
 dG.lineStyle(2.2, 0xfef08a, 1);
 dG.beginFill(0xd97706, 1);
 dG.drawRoundedRect(-14, -13, 26, 26, 5);
 dG.endFill();
 dG.beginFill(0x0f172a, 1);
 dG.drawRect(2, -7, 10, 5);
 dG.endFill();
 dG.beginFill(0x94a3b8, 1);
 dG.drawRect(8, 2, 12, 5);
 dG.endFill();
 } else {
 dG.lineStyle(2, 0xfef08a, 1);
 dG.beginFill(0xf59e0b, 1);
 dG.drawPolygon([0, -10, 11, 0, 0, 10, -11, 0]);
 dG.endFill();
 dG.beginFill(0x38bdf8, 1);
 dG.drawCircle(4, 0, 3);
 dG.endFill();
 }

 const hpBarG = new PIXI.Graphics();
 hpBarG.y = -20;
 drone.addChild(dG);
 drone.addChild(hpBarG);
 drone.hpBarG = hpBarG;
 drone.lastHp = -1;
 if (t < turretGroup.children.length) {
 turretGroup.addChildAt(drone, t);
 } else {
 turretGroup.addChild(drone);
 }
 }
 drone.x = 248 + (t % 2) * 18;
 drone.y = 82 + t * 44 + Math.sin(animTicker * 1.6 + t * 1.4) * 5;

 if (tData && drone.lastHp !== tData.hp && drone.hpBarG) {
 drone.lastHp = tData.hp;
 const ratio = Math.max(0, Math.min(1, tData.hp / (tData.maxHp || 10)));
 drone.hpBarG.clear();
 drone.hpBarG.beginFill(0x0f172a, 0.9);
 drone.hpBarG.drawRect(-15, 0, 30, 4.5);
 drone.hpBarG.endFill();
 drone.hpBarG.beginFill(ratio > 0.5 ? 0x4ade80 : 0xf87171, 1);
 drone.hpBarG.drawRect(-14, 0.75, 28 * ratio, 3);
 drone.hpBarG.endFill();
 }
 }
 }

 // Render Mob Boss Frontline Hired Enforcers
 if (enforcerGroup && !enforcerGroup.destroyed) {
 const enforcers = gameState.enforcers || [];
 const count = enforcers.length;
 while (enforcerGroup.children.length < count) {
 const enfWrap = new PIXI.Container();
 const eBody = new PIXI.Graphics();
 eBody.lineStyle(1.6, 0xeab308, 0.95);
 eBody.beginFill(0x0f172a, 1);
 eBody.drawPolygon([-12, 13, 12, 13, 0, -11]);
 eBody.endFill();
 eBody.beginFill(0xeab308, 1);
 eBody.drawRect(-11, -12, 22, 3);
 eBody.drawRect(-6, -17, 12, 5);
 eBody.endFill();
 eBody.beginFill(0x94a3b8, 1);
 eBody.drawRect(4, 1, 13, 3.5);
 eBody.endFill();

 const hpBarG = new PIXI.Graphics();
 hpBarG.y = -24;

 enfWrap.addChild(eBody);
 enfWrap.addChild(hpBarG);
 enfWrap.hpBarG = hpBarG;
 enfWrap.lastHp = -1;
 enforcerGroup.addChild(enfWrap);
 }
 while (enforcerGroup.children.length > count) {
 const rem = enforcerGroup.children[enforcerGroup.children.length - 1];
 safeDestroyDisplayObject(rem);
 }
 for (let e = 0; e < count; e++) {
 const enfObj = enforcerGroup.children[e];
 const eData = enforcers[e];
 enfObj.x = 254 + (e % 2) * 18;
 enfObj.y = 84 + e * 44 + Math.sin(animTicker * 1.4 + e * 1.2) * 4;

 if (eData && enfObj.lastHp !== eData.hp && enfObj.hpBarG) {
 enfObj.lastHp = eData.hp;
 const ratio = Math.max(0, Math.min(1, eData.hp / (eData.maxHp || 12)));
 enfObj.hpBarG.clear();
 enfObj.hpBarG.beginFill(0x0f172a, 0.9);
 enfObj.hpBarG.drawRect(-15, 0, 30, 4.5);
 enfObj.hpBarG.endFill();
 enfObj.hpBarG.beginFill(ratio > 0.5 ? 0xeab308 : 0xf87171, 1);
 enfObj.hpBarG.drawRect(-14, 0.75, 28 * ratio, 3);
 enfObj.hpBarG.endFill();
 }
 }
 }

 enemySprites.forEach((eS, i) => {
 const enemy = gameState.enemies[i];
 if (!enemy || !eS || eS.destroyed) return;
 eS.alpha = enemy.hp > 0 ? 1 : 0.22;
 eS.y = (gameState.enemies.length === 1 ? 132 : 80 + (i * 94)) + Math.cos(animTicker + i) * 6;
 if (eS.lockRing) {
 eS.lockRing.visible = enemy.hp > 0 && enemy.hasBountyLock === true;
 if (eS.lockRing.visible) {
 eS.lockRing.rotation += 0.04;
 const pulse = 1 + Math.sin(animTicker * 3) * 0.06;
 eS.lockRing.scale.set(pulse);
 }
 }
 if (enemy.hp > 0 && (enemy.poison || 0) > 0 && Math.random() < 0.08) {
 spawnPoisonBubbles(eS.x + (Math.random() - 0.5) * 32, eS.y + 10, 1);
 }
 if (enemy.hp > 0 && (enemy.hemorrhage || 0) > 0 && Math.random() < 0.08) {
 spawnParticles(eS.x + (Math.random() - 0.5) * 28, eS.y + 6, 1, { colors: [0xdc2626, 0xfb7185], speed: 1.2, gravity: 0.14, life: 16, sizeMax: 3.5 });
 }
 });
 });
}

function getVfxTarget() {
 if (!pixiApp || !pixiApp.stage || pixiApp.stage.destroyed) return null;
 if (vfxLayer && !vfxLayer.destroyed) return vfxLayer;
 return pixiApp.stage;
}

function triggerScreenShake(intensity = 6, frames = 12) {
 if (!pixiApp || !pixiApp.ticker || !pixiApp.stage) return;
 const appRef = pixiApp;
 let elapsed = 0;
 const shakeFn = (delta) => {
 if (!appRef || !appRef.stage || appRef.stage.destroyed) {
 if (appRef && appRef.ticker) appRef.ticker.remove(shakeFn);
 return;
 }
 elapsed += delta;
 if (elapsed >= frames) {
 appRef.stage.x = 0;
 appRef.stage.y = 0;
 appRef.ticker.remove(shakeFn);
 } else {
 const decay = 1 - (elapsed / frames);
 appRef.stage.x = (Math.random() - 0.5) * 2 * intensity * decay;
 appRef.stage.y = (Math.random() - 0.5) * 2 * intensity * decay;
 }
 };
 appRef.ticker.add(shakeFn);
}

function spawnParticles(x, y, count = 14, opts = {}) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;
 const colors = opts.colors || [0x38bdf8, 0xc084fc];
 const speed = opts.speed || 4;
 const gravity = opts.gravity || 0.08;
 const life = opts.life || 26;
 const sizeMin = opts.sizeMin || 2.5;
 const sizeMax = opts.sizeMax || 6;
 const shape = opts.shape || 'circle';

 for (let i = 0; i < count; i++) {
 const g = new PIXI.Graphics();
 const color = colors[Math.floor(Math.random() * colors.length)];
 const sz = sizeMin + Math.random() * (sizeMax - sizeMin);
 if (opts.strokeColor !== undefined) {
 g.lineStyle(1.5, opts.strokeColor, 0.95);
 }
 g.beginFill(color, 0.95);
 if (shape === 'shard') {
 g.drawPolygon([-sz, -sz * 0.6, sz, 0, -sz * 0.3, sz * 1.1]);
 } else if (shape === 'plus') {
 g.drawRect(-sz * 0.3, -sz, sz * 0.6, sz * 2);
 g.drawRect(-sz, -sz * 0.3, sz * 2, sz * 0.6);
 } else {
 g.drawCircle(0, 0, sz);
 }
 g.endFill();
 g.x = x + (Math.random() - 0.5) * (opts.spread || 12);
 g.y = y + (Math.random() - 0.5) * (opts.spread || 12);
 stage.addChild(g);

 const angle = opts.angle !== undefined
 ? opts.angle + (Math.random() - 0.5) * (opts.arcSpread || 1.2)
 : Math.random() * Math.PI * 2;
 const spd = (0.35 + Math.random() * 0.85) * speed;
 let vx = Math.cos(angle) * spd;
 let vy = (opts.vyBias || 0) + Math.sin(angle) * spd;
 const vRot = (Math.random() - 0.5) * 0.25;
 let t = 0;

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || g.destroyed || !g.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 g.x += vx * step;
 g.y += vy * step;
 vy += gravity * step;
 g.rotation += vRot * step;
 const progress = t / life;
 g.alpha = Math.max(0, 1 - progress);
 const sc = Math.max(0.1, 1 - progress * 0.5);
 g.scale.x = sc;
 g.scale.y = sc;
 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(g);
 }
 };
 appRef.ticker.add(tick);
 }
}

function spawnShockwave(x, y, maxRadius = 85, color = 0x38bdf8, lineWidth = 4, life = 24) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;
 const ring = new PIXI.Graphics();
 ring.x = x;
 ring.y = y;
 stage.addChild(ring);

 let t = 0;
 const tick = (delta) => {
 if (!appRef || !appRef.ticker || ring.destroyed || !ring.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 const p = Math.min(1, t / life);
 const r = 8 + (maxRadius - 8) * (1 - Math.pow(1 - p, 2));
 ring.clear();
 ring.lineStyle(lineWidth * (1 - p * 0.6), color, 1 - p);
 ring.drawCircle(0, 0, r);
 if (p >= 1) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(ring);
 }
 };
 appRef.ticker.add(tick);
}

// --- MOB BOSS CUSTOM PIXIJS VFX: BOUNTY CROSSHAIR, GUNFIRE TRACERS, BRASS SHELL CASINGS & COIN/BILL EXPLOSION ---
function spawnBountyCrosshairVFX(x, y) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;

 const crosshair = new PIXI.Graphics();
 crosshair.x = x;
 crosshair.y = y;
 stage.addChild(crosshair);

 let t = 0;
 const life = 30;
 const tick = (delta) => {
 if (!appRef || !appRef.ticker || crosshair.destroyed || !crosshair.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 const p = Math.min(1, t / life);
 const sc = 2.1 - 1.1 * (1 - Math.pow(1 - p, 3));
 crosshair.scale.set(sc);
 crosshair.rotation += 0.14 * step;
 crosshair.clear();
 crosshair.lineStyle(4, 0xdc2626, 1 - p * 0.35);
 crosshair.drawCircle(0, 0, 38);
 crosshair.lineStyle(2.5, 0xeab308, 1);
 crosshair.drawCircle(0, 0, 24);
 crosshair.moveTo(-48, 0); crosshair.lineTo(-14, 0);
 crosshair.moveTo(14, 0); crosshair.lineTo(48, 0);
 crosshair.moveTo(0, -48); crosshair.lineTo(0, -14);
 crosshair.moveTo(0, 14); crosshair.lineTo(0, 48);

 if (p >= 1) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(crosshair);
 }
 };
 appRef.ticker.add(tick);
}

function spawnShellCasings(x, y, count = 3) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;

 for (let i = 0; i < count; i++) {
 const casing = new PIXI.Graphics();
 casing.beginFill(0xfacc15, 1);
 casing.lineStyle(1, 0xb45309, 1);
 casing.drawRoundedRect(-3.5, -1.5, 7, 3, 1);
 casing.endFill();
 casing.x = x + (Math.random() - 0.5) * 8;
 casing.y = y + (Math.random() - 0.5) * 6;
 stage.addChild(casing);

 let vx = -1.2 - Math.random() * 2.2;
 let vy = -3.4 - Math.random() * 2.0;
 const vRot = (Math.random() > 0.5 ? 1 : -1) * (0.28 + Math.random() * 0.25);
 let t = 0;
 const life = 34;

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || casing.destroyed || !casing.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 casing.x += vx * step;
 casing.y += vy * step;
 vy += 0.28 * step;
 casing.rotation += vRot * step;

 if (casing.y > y + 68 && vy > 0) {
 vy = -vy * 0.45;
 vx *= 0.7;
 }
 casing.alpha = t < 22 ? 1 : Math.max(0, 1 - (t - 22) / 12);
 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(casing);
 }
 };
 appRef.ticker.add(tick);
 }
}

function spawnGunfireVolleyVFX(srcX, srcY, tgtX, tgtY, rounds = 3) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;

 spawnShellCasings(srcX + 12, srcY - 8, rounds);

 for (let r = 0; r < rounds; r++) {
 setTimeout(() => {
 if (!appRef || !appRef.ticker || !stage || stage.destroyed) return;

 const muzzleX = srcX + 22;
 const muzzleY = srcY + (Math.random() - 0.5) * 8;
 const hitX = tgtX + (Math.random() - 0.5) * 18;
 const hitY = tgtY + (Math.random() - 0.5) * 22;

 const flash = new PIXI.Graphics();
 flash.x = muzzleX;
 flash.y = muzzleY;
 flash.beginFill(0xfef08a, 0.95);
 flash.drawPolygon([0, 0, 22, -7, 14, 0, 22, 7]);
 flash.drawCircle(4, 0, 7);
 flash.endFill();
 stage.addChild(flash);

 const tracer = new PIXI.Graphics();
 const angle = Math.atan2(hitY - muzzleY, hitX - muzzleX);
 tracer.rotation = angle;
 tracer.x = muzzleX;
 tracer.y = muzzleY;
 tracer.beginFill(0xf59e0b, 0.95);
 tracer.drawRoundedRect(-18, -2.5, 36, 5, 2.5);
 tracer.endFill();
 tracer.beginFill(0xffffff, 1);
 tracer.drawRoundedRect(-10, -1.2, 22, 2.4, 1.2);
 tracer.endFill();
 stage.addChild(tracer);

 let t = 0;
 const travelLife = 8;
 const tick = (delta) => {
 if (!appRef || !appRef.ticker || tracer.destroyed || !tracer.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 safeDestroyDisplayObject(flash);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 const p = Math.min(1, t / travelLife);
 tracer.x = muzzleX + (hitX - muzzleX) * p;
 tracer.y = muzzleY + (hitY - muzzleY) * p;
 if (!flash.destroyed) {
 flash.alpha = Math.max(0, 1 - p * 2.5);
 }

 if (p >= 1) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(tracer);
 safeDestroyDisplayObject(flash);
 spawnParticles(hitX, hitY, 7, {
 colors: [0xfef08a, 0xf59e0b, 0xef4444],
 speed: 4.5, life: 15, sizeMin: 2, sizeMax: 4.5, shape: 'shard'
 });
 }
 };
 appRef.ticker.add(tick);
 }, r * 75 * gameState.speedMultiplier);
 }
}

function spawnCashExplosionVFX(x, y, intensity = 1.0) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;

 spawnShockwave(x, y, Math.round(78 * intensity), 0xeab308, 4, 24);
 spawnShockwave(x, y, Math.round(54 * intensity), 0x22c55e, 3, 20);

 // 1. Spinning Gold Bullion Coins
 const coinCount = Math.round(14 * intensity);
 for (let i = 0; i < coinCount; i++) {
 const coin = new PIXI.Graphics();
 const r = 5 + Math.random() * 3.5;
 coin.lineStyle(1.5, 0xfef08a, 1);
 coin.beginFill(0xeab308, 1);
 coin.drawCircle(0, 0, r);
 coin.endFill();
 coin.beginFill(0xb45309, 0.85);
 coin.drawRect(-1.2, -r * 0.55, 2.4, r * 1.1);
 coin.endFill();

 coin.x = x + (Math.random() - 0.5) * 16;
 coin.y = y + (Math.random() - 0.5) * 16;
 stage.addChild(coin);

 const ang = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.4;
 const spd = (3.2 + Math.random() * 4.5) * Math.min(1.4, intensity);
 let vx = Math.cos(ang) * spd;
 let vy = Math.sin(ang) * spd - 1.2;
 const spinPhase = Math.random() * Math.PI * 2;
 let t = 0;
 const life = 34 + Math.random() * 10;

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || coin.destroyed || !coin.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 coin.x += vx * step;
 coin.y += vy * step;
 vy += 0.22 * step;
 coin.scale.x = Math.cos(t * 0.35 + spinPhase);
 coin.alpha = t < life * 0.7 ? 1 : Math.max(0, 1 - (t - life * 0.7) / (life * 0.3));
 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(coin);
 }
 };
 appRef.ticker.add(tick);
 }

 // 2. Fluttering Emerald Dollar Bills
 const billCount = Math.round(10 * intensity);
 for (let b = 0; b < billCount; b++) {
 const bill = new PIXI.Graphics();
 bill.lineStyle(1.2, 0xbbf7d0, 0.95);
 bill.beginFill(0x16a34a, 0.95);
 bill.drawRoundedRect(-8, -4.5, 16, 9, 2);
 bill.endFill();
 bill.beginFill(0x4ade80, 0.9);
 bill.drawCircle(0, 0, 2.5);
 bill.endFill();

 bill.x = x + (Math.random() - 0.5) * 20;
 bill.y = y + (Math.random() - 0.5) * 14;
 stage.addChild(bill);

 let vx = (Math.random() - 0.5) * 5.2;
 let vy = -2.2 - Math.random() * 3.0;
 const swayOffset = Math.random() * Math.PI * 2;
 let t = 0;
 const life = 40 + Math.random() * 12;

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || bill.destroyed || !bill.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 bill.x += (vx + Math.sin(t * 0.22 + swayOffset) * 1.4) * step;
 bill.y += vy * step;
 vy = Math.min(1.4, vy + 0.11 * step);
 vx *= 0.97;
 bill.rotation = Math.sin(t * 0.2 + swayOffset) * 0.55;
 bill.alpha = t < life * 0.72 ? 0.95 : Math.max(0, 1 - (t - life * 0.72) / (life * 0.28));
 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(bill);
 }
 };
 appRef.ticker.add(tick);
 }
}

// --- MULTI-LAYERED FORKED RED & BLACK LIGHTNING GENERATOR ---
function buildJaggedPath(x1, y1, x2, y2, segments = 8, jitter = 28) {
 const pts = [{ x: x1, y: y1 }];
 for (let i = 1; i < segments; i++) {
 const frac = i / segments;
 pts.push({
 x: x1 + (x2 - x1) * frac + (Math.random() - 0.5) * jitter,
 y: y1 + (y2 - y1) * frac + (Math.random() - 0.5) * jitter
 });
 }
 pts.push({ x: x2, y: y2 });
 return pts;
}

function spawnRedBlackLightning(x1, y1, x2, y2, opts = {}) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;

 const bolt = new PIXI.Graphics();
 stage.addChild(bolt);

 const segments = opts.segments || 8;
 const jitter = opts.jitter || 30;
 const thickness = opts.thickness || 1.0;
 const life = opts.life || 24;
 const forkCount = opts.forks !== undefined ? opts.forks : 2;

 const generateGeometry = () => {
 const main = buildJaggedPath(x1, y1, x2, y2, segments, jitter);
 const forks = [];
 for (let f = 0; f < forkCount; f++) {
 const anchorIdx = 1 + Math.floor(Math.random() * Math.max(1, main.length - 2));
 const anchor = main[anchorIdx];
 const baseAngle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() > 0.5 ? 0.65 : -0.65) + (Math.random() - 0.5) * 0.4;
 const forkLen = 35 + Math.random() * 45;
 const fx = anchor.x + Math.cos(baseAngle) * forkLen;
 const fy = anchor.y + Math.sin(baseAngle) * forkLen;
 forks.push(buildJaggedPath(anchor.x, anchor.y, fx, fy, 4, 16));
 }
 return { main, forks };
 };

 let geom = generateGeometry();
 let t = 0;
 let reJitterTimer = 0;

 const drawStrokeLayer = (pts, width, color, alpha) => {
 bolt.lineStyle(width, color, alpha);
 bolt.moveTo(pts[0].x, pts[0].y);
 for (let i = 1; i < pts.length; i++) bolt.lineTo(pts[i].x, pts[i].y);
 };

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || bolt.destroyed || !bolt.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 reJitterTimer += step;

 if (reJitterTimer >= 4) {
 reJitterTimer = 0;
 geom = generateGeometry();
 }

 const p = Math.min(1, t / life);
 const alpha = p < 0.6 ? 1.0 : Math.max(0, 1 - (p - 0.6) / 0.4);
 const wScale = thickness * (1 - p * 0.35);

 bolt.clear();
 drawStrokeLayer(geom.main, 15 * wScale, 0xdc2626, alpha * 0.42);
 geom.forks.forEach(fk => drawStrokeLayer(fk, 9 * wScale, 0xdc2626, alpha * 0.38));
 drawStrokeLayer(geom.main, 8.5 * wScale, 0xff1e42, alpha * 0.95);
 geom.forks.forEach(fk => drawStrokeLayer(fk, 5 * wScale, 0xff1e42, alpha * 0.9));
 drawStrokeLayer(geom.main, 4.2 * wScale, 0x020204, alpha);
 geom.forks.forEach(fk => drawStrokeLayer(fk, 2.4 * wScale, 0x020204, alpha));

 if (p >= 1) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(bolt);
 }
 };
 appRef.ticker.add(tick);
}

function spawnBlackFlashVFX(x, y, tier = 1) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;

 const core = new PIXI.Graphics();
 core.x = x;
 core.y = y;
 stage.addChild(core);

 let ct = 0;
 const coreLife = 24;
 const coreTick = (delta) => {
 if (!appRef || !appRef.ticker || core.destroyed || !core.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(coreTick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 ct += step;
 const p = Math.min(1, ct / coreLife);
 const r = (1 - Math.pow(1 - p, 3)) * (58 + tier * 14);
 core.clear();
 core.lineStyle(7 * (1 - p * 0.5), 0xff1e42, 1 - p);
 core.beginFill(0x030305, (1 - p) * 0.95);
 core.drawCircle(0, 0, r);
 core.endFill();
 if (p >= 1) {
 appRef.ticker.remove(coreTick);
 safeDestroyDisplayObject(core);
 }
 };
 appRef.ticker.add(coreTick);

 spawnRedBlackLightning(x - 45, 0, x, y, { segments: 9, jitter: 34, thickness: 1.35, forks: 3, life: 28 });
 spawnRedBlackLightning(x + 55, 0, x, y, { segments: 9, jitter: 34, thickness: 1.25, forks: 3, life: 28 });

 const boltCount = 10 + tier * 2;
 for (let b = 0; b < boltCount; b++) {
 const angle = (Math.PI * 2 * b) / boltCount + (Math.random() - 0.5) * 0.35;
 const dist = 75 + Math.random() * (55 + tier * 15);
 spawnRedBlackLightning(x, y, x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, {
 segments: 7, jitter: 24, thickness: 0.95 + tier * 0.1, forks: 2, life: 24
 });
 }

 const shockCount = tier >= 3 ? 5 : 2;
 for (let s = 0; s < shockCount; s++) {
 setTimeout(() => {
 const isCrimson = s % 2 === 0;
 spawnShockwave(x, y, 88 + s * 22, isCrimson ? 0xff1e42 : 0x050508, isCrimson ? 6 : 8, 24 + s * 3);
 }, s * 55 * gameState.speedMultiplier);
 }

 spawnParticles(x, y, 28 + tier * 6, {
 colors: [0x050508, 0xdc2626, 0xff1e42, 0xfca5a5],
 strokeColor: 0xff1e42,
 speed: 6.5, gravity: 0.04, life: 30, sizeMin: 3, sizeMax: 7, shape: 'shard'
 });

 triggerScreenShake(12 + tier * 2, 18);
}

function spawnBlackFlashBanner(x, y) {
 if (!pixiApp || !pixiApp.ticker) return;
 const stage = getVfxTarget() || pixiApp.stage;
 if (!stage || stage.destroyed) return;
 const appRef = pixiApp;

 const banner = new PIXI.Text('BLACK FLASH!!!', {
 fontFamily: 'Teko', fontSize: 46, fontStyle: 'italic', fontWeight: '700',
 fill: ['#ffffff', '#ff2a55', '#991b1b'], stroke: '#000000', strokeThickness: 7,
 dropShadow: true, dropShadowColor: '#ff1e42', dropShadowBlur: 14, dropShadowDistance: 0, letterSpacing: 2
 });
 banner.anchor.set(0.5);
 banner.x = Math.min(Math.max(x, 140), (appRef.screen.width || 960) - 140);
 banner.y = Math.max(48, y);
 banner.scale.x = 2.3;
 banner.scale.y = 2.3;
 stage.addChild(banner);

 let t = 0;
 const life = 54;
 const baseX = banner.x;
 const baseY = banner.y;

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || banner.destroyed || !banner.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 if (t < 8) {
 const sc = 2.3 - 1.3 * (t / 8);
 banner.scale.x = sc;
 banner.scale.y = sc;
 } else if (t < 36) {
 const sc = 1.0 + Math.sin(t * 1.4) * 0.04;
 banner.scale.x = sc;
 banner.scale.y = sc;
 banner.x = baseX + (Math.random() - 0.5) * 3;
 banner.y = baseY + (Math.random() - 0.5) * 3;
 } else {
 const fadeP = (t - 36) / (life - 36);
 banner.x = baseX;
 banner.y = baseY - fadeP * 24;
 banner.alpha = Math.max(0, 1 - fadeP);
 }

 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(banner);
 }
 };
 appRef.ticker.add(tick);
}

function spawnSlashArc(x, y, rotation = -0.5, radius = 64, color = 0xf87171, innerColor = 0xffffff) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;
 const slash = new PIXI.Graphics();
 slash.x = x;
 slash.y = y;
 slash.rotation = rotation;
 stage.addChild(slash);

 let t = 0;
 const life = 18;
 const tick = (delta) => {
 if (!appRef || !appRef.ticker || slash.destroyed || !slash.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 const p = Math.min(1, t / life);
 slash.clear();
 slash.lineStyle(12 * (1 - p * 0.7), color, (1 - p) * 0.9);
 slash.arc(0, 0, radius * (0.8 + p * 0.35), -1.1, 1.1);
 slash.lineStyle(5 * (1 - p * 0.8), innerColor, 1 - p);
 slash.arc(0, 0, radius * (0.8 + p * 0.35), -0.9, 0.9);
 const sc = 1 + p * 0.2;
 slash.scale.x = sc;
 slash.scale.y = sc;
 if (p >= 1) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(slash);
 }
 };
 appRef.ticker.add(tick);
}

function spawnPoisonBubbles(x, y, count = 12) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;
 for (let i = 0; i < count; i++) {
 const b = new PIXI.Graphics();
 const r = 3 + Math.random() * 6;
 const isBright = Math.random() > 0.4;
 b.lineStyle(1.5, isBright ? 0x86efac : 0x4ade80, 0.95);
 b.beginFill(isBright ? 0x4ade80 : 0x16a34a, 0.45);
 b.drawCircle(0, 0, r);
 b.endFill();
 b.beginFill(0xffffff, 0.7);
 b.drawCircle(-r * 0.3, -r * 0.3, r * 0.25);
 b.endFill();

 const startX = x + (Math.random() - 0.5) * 44;
 b.x = startX;
 b.y = y + (Math.random() - 0.5) * 26;
 stage.addChild(b);

 let t = 0;
 const life = 28 + Math.random() * 16;
 const riseSpeed = 1.2 + Math.random() * 1.4;
 const wobblePhase = Math.random() * Math.PI * 2;

 const tick = (delta) => {
 if (!appRef || !appRef.ticker || b.destroyed || !b.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 b.y -= riseSpeed * step;
 b.x = startX + Math.sin(t * 0.22 + wobblePhase) * 6;
 const p = t / life;
 const sc = 1 + p * 0.35;
 b.scale.x = sc;
 b.scale.y = sc;
 b.alpha = p < 0.75 ? 0.95 : Math.max(0, (1 - p) * 4);
 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(b);
 }
 };
 appRef.ticker.add(tick);
 }
}

function spawnLightningBolt(x1, y1, x2, y2, color = 0xc084fc, coreColor = 0xe0f2fe) {
 const stage = getVfxTarget();
 if (!stage || !pixiApp || !pixiApp.ticker) return;
 const appRef = pixiApp;
 const bolt = new PIXI.Graphics();
 stage.addChild(bolt);

 const segments = 7;
 const pts = [{ x: x1, y: y1 }];
 for (let i = 1; i < segments; i++) {
 const frac = i / segments;
 pts.push({
 x: x1 + (x2 - x1) * frac + (Math.random() - 0.5) * 34,
 y: y1 + (y2 - y1) * frac + (Math.random() - 0.5) * 34
 });
 }
 pts.push({ x: x2, y: y2 });

 let t = 0;
 const life = 16;
 const tick = (delta) => {
 if (!appRef || !appRef.ticker || bolt.destroyed || !bolt.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 t += step;
 const alpha = Math.max(0, 1 - (t / life));
 bolt.clear();
 bolt.lineStyle(8 * alpha, color, alpha * 0.55);
 bolt.moveTo(pts[0].x, pts[0].y);
 for (let i = 1; i < pts.length; i++) bolt.lineTo(pts[i].x, pts[i].y);
 bolt.lineStyle(3 * alpha, coreColor, alpha);
 bolt.moveTo(pts[0].x, pts[0].y);
 for (let i = 1; i < pts.length; i++) bolt.lineTo(pts[i].x, pts[i].y);

 if (t >= life) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(bolt);
 }
 };
 appRef.ticker.add(tick);
}

function playCardVFX(cardId, src, tgt) {
 if (!pixiApp || !pixiApp.stage) return;
 const sx = src ? src.x : 200;
 const sy = src ? src.y : 138;
 const tx = tgt ? tgt.x : 750;
 const ty = tgt ? tgt.y : 138;

 switch (cardId) {
 // MOB BOSS & CONTRABAND VFX
 case 'tommy_gun_spray':
 spawnGunfireVolleyVFX(sx, sy, tx, ty, 3);
 triggerScreenShake(5, 10);
 break;
 case 'chicago_typewriter':
 spawnGunfireVolleyVFX(sx, sy, tx, ty, 4);
 triggerScreenShake(7, 12);
 break;
 case 'tommy_drum_extortion':
 spawnGunfireVolleyVFX(sx, sy, tx, ty, 5);
 triggerScreenShake(8, 14);
 break;
 case 'protection_racket':
 case 'money_laundering':
 case 'velvet_kevlar':
 case 'armored_limousine':
 case 'family_consigliere':
 spawnShockwave(sx, sy, 68, 0xeab308, 4, 22);
 spawnCashExplosionVFX(sx, sy - 10, 0.7);
 break;
 case 'shakedown':
 case 'concrete_shoes':
 case 'golden_peacemaker':
 spawnSlashArc(tx, ty, -0.45, 68, 0xeab308, 0xfef08a);
 spawnShockwave(tx, ty, 74, 0xf59e0b, 4, 22);
 spawnCashExplosionVFX(tx, ty, 0.75);
 triggerScreenShake(7, 12);
 break;
 case 'drive_by_ambush':
 spawnGunfireVolleyVFX(sx, sy, tx, ty, 4);
 spawnShockwave(tx, ty, 95, 0xeab308, 5, 24);
 triggerScreenShake(9, 14);
 break;
 case 'syndicate_ledger':
 case 'hired_goon_contract':
 case 'black_market_voucher':
 case 'mercenary_contract':
 case 'loaded_dice':
 case 'syndicate_bribe':
 case 'offers_you_cant_refuse':
 spawnCashExplosionVFX(sx, sy - 8, 0.9);
 break;
 case 'kingpins_ultimatum':
 case 'godfathers_decree':
 case 'royal_flush':
 spawnGunfireVolleyVFX(sx, sy, tx, ty, 4);
 spawnCashExplosionVFX(tx, ty, 1.55);
 triggerScreenShake(12, 16);
 break;
 case 'bootleg_tonic':
 case 'adrenaline_syringe':
 spawnParticles(sx, sy, 18, { colors: [0x4ade80, 0xeab308, 0xfef08a], speed: 2.8, vyBias: -1.6, shape: 'plus', life: 26 });
 spawnShockwave(sx, sy, 62, 0x22c55e, 4, 22);
 break;
 case 'hollow_point_mag':
 spawnShellCasings(sx + 10, sy - 6, 3);
 spawnShockwave(sx, sy, 58, 0xdc2626, 4, 20);
 break;

 // CHRONOMANCER VFX
 case 'chrono_slash':
 case 'rift_strike':
 spawnSlashArc(tx, ty, -0.45, 66, 0x2dd4bf, 0xfef08a);
 spawnShockwave(tx, ty, 72, 0x2dd4bf, 4, 20);
 spawnParticles(tx, ty, 16, { colors: [0x2dd4bf, 0x38bdf8, 0xf59e0b], speed: 4.5, life: 22 });
 triggerScreenShake(5, 9);
 break;
 case 'stasis_bubble':
 case 'deja_vu':
 case 'chrono_rewind':
 spawnShockwave(sx, sy, 68, 0x2dd4bf, 5, 24);
 spawnParticles(sx, sy, 16, { colors: [0x2dd4bf, 0x38bdf8, 0xffffff], speed: 2.5, life: 24 });
 break;
 case 'stasis_surge':
 case 'entropy_bolt':
 case 'stasis_condenser':
 spawnLightningBolt(sx + 20, sy, tx, ty, 0x2dd4bf, 0xfef08a);
 spawnShockwave(tx, ty, 78, 0x38bdf8, 4, 22);
 break;
 case 'temporal_fracture':
 spawnShockwave(tx, ty, 125, 0x2dd4bf, 7, 28);
 spawnShockwave(tx, ty, 90, 0xf59e0b, 5, 22);
 spawnParticles(tx, ty, 28, { colors: [0x2dd4bf, 0xf59e0b, 0x38bdf8], speed: 6.0, life: 26, shape: 'shard' });
 triggerScreenShake(10, 14);
 break;

 // ARTIFICER VFX
 case 'wrench_toss':
 case 'scrap_cannon':
 spawnSlashArc(tx, ty, -0.35, 62, 0xf59e0b, 0xfef08a);
 spawnParticles(tx, ty, 18, { colors: [0xf59e0b, 0x94a3b8, 0xfef08a], speed: 5.2, life: 22, shape: 'shard' });
 triggerScreenShake(7, 11);
 break;
 case 'thermite_rivets':
 spawnParticles(tx, ty, 22, { colors: [0xf97316, 0xef4444, 0xfef08a], speed: 5.0, life: 24, shape: 'shard' });
 spawnShockwave(tx, ty, 65, 0xf97316, 4, 20);
 break;
 case 'rail_turret_blueprint':
 case 'inferno_turret_blueprint':
 case 'aegis_barrier_blueprint':
 case 'tesla_coil_blueprint':
 case 'goliath_mech_blueprint':
 case 'overdrive_core':
 spawnShockwave(sx + 20, sy - 10, 74, 0xf59e0b, 4, 24);
 spawnParticles(sx + 20, sy - 10, 18, { colors: [0xf59e0b, 0x38bdf8, 0xfef08a], speed: 3.6, shape: 'shard', life: 22 });
 break;
 case 'scrap_recycler':
 case 'salvage_magnet':
 spawnParticles(sx, sy, 14, { colors: [0xf59e0b, 0x94a3b8], speed: 3.0, shape: 'shard', life: 20 });
 break;
 case 'capacitor_discharge':
 spawnLightningBolt(sx + 20, sy, tx, ty, 0xf59e0b, 0x38bdf8);
 spawnLightningBolt(sx + 20, sy - 8, tx, ty + 6, 0x38bdf8, 0xffffff);
 spawnShockwave(tx, ty, 88, 0xf59e0b, 5, 22);
 triggerScreenShake(8, 12);
 break;
 case 'reinforced_plating':
 case 'weld_and_patch':
 case 'reactive_armor':
 case 'overclock_blueprint':
 case 'assembly_blueprint':
 spawnShockwave(sx, sy, 66, 0xf59e0b, 4, 22);
 spawnParticles(sx, sy, 14, { colors: [0xf59e0b, 0x38bdf8], speed: 2.8, life: 22, shape: 'shard' });
 break;

 // BLOOD REAVER VFX
 case 'siphon_slash':
 case 'serrated_cleave':
 case 'flurry_of_fangs':
 spawnSlashArc(tx, ty, -0.5, 68, 0xdc2626, 0xfb7185);
 spawnParticles(tx, ty, 18, { colors: [0xdc2626, 0xfb7185, 0x991b1b], speed: 4.8, gravity: 0.14, life: 22 });
 triggerScreenShake(6, 10);
 break;
 case 'blood_boil':
 case 'hemorrhagic_rupture':
 case 'crimson_frenzy':
 spawnShockwave(tx, ty, 92, 0xdc2626, 6, 24);
 spawnParticles(tx, ty, 26, { colors: [0xdc2626, 0xfb7185, 0x450a0a], speed: 5.8, gravity: 0.12, life: 26 });
 triggerScreenShake(9, 13);
 break;
 case 'blood_suck':
 spawnLightningBolt(tx, ty, sx, sy, 0xdc2626, 0xfb7185);
 spawnParticles(tx, ty, 16, { colors: [0xdc2626, 0xfb7185], speed: 3.5, life: 22 });
 break;
 case 'coagulate':
 case 'sanguine_ward':
 spawnShockwave(sx, sy, 68, 0xfb7185, 5, 24);
 spawnParticles(sx, sy, 16, { colors: [0xfb7185, 0xdc2626], speed: 2.5, vyBias: -1.5, shape: 'plus', life: 24 });
 break;

 // MAGE, WARRIOR, ROGUE, NEUTRAL VFX
 case 'arcane_strike':
 spawnLightningBolt(sx + 20, sy, tx, ty, 0xc084fc, 0x38bdf8);
 spawnShockwave(tx, ty, 65, 0xc084fc, 4, 20);
 spawnParticles(tx, ty, 16, { colors: [0xc084fc, 0x38bdf8, 0xffffff], speed: 4.5, life: 22 });
 break;
 case 'spark':
 case 'overcharge_conduit':
 spawnLightningBolt(sx + 20, sy - 6, tx, ty, 0x38bdf8, 0xfef08a);
 spawnLightningBolt(sx + 20, sy + 6, tx, ty, 0xc084fc, 0xffffff);
 spawnParticles(tx, ty, 18, { colors: [0x38bdf8, 0xfef08a, 0xc084fc], speed: 5, life: 20 });
 break;
 case 'fireball':
 case 'mana_overload':
 case 'volatile_reserve':
 case 'astral_singularity':
 spawnShockwave(tx, ty, 105, 0xf97316, 6, 26);
 spawnShockwave(tx, ty, 70, 0xfef08a, 4, 20);
 spawnParticles(tx, ty, 28, { colors: [0xef4444, 0xf97316, 0xfacc15, 0xffffff], speed: 6.2, gravity: -0.04, life: 28 });
 triggerScreenShake(9, 14);
 break;
 case 'barrier':
 case 'chrono_echo':
 case 'arcane_battery':
 case 'prismatic_catalyst':
 case 'spellweaver_prism':
 spawnShockwave(sx, sy, 68, 0xc084fc, 4, 24);
 spawnParticles(sx, sy, 14, { colors: [0xc084fc, 0x38bdf8], speed: 2.5, life: 24 });
 break;
 case 'heavy_slash':
 case 'battering_rampart':
 case 'patience_fury':
 case 'cleaving_execution':
 spawnSlashArc(tx, ty, -0.45, 76, 0xef4444, 0xfef08a);
 spawnSlashArc(tx, ty, 0.35, 62, 0xf97316, 0xffffff);
 spawnParticles(tx, ty, 20, { colors: [0xef4444, 0xf97316, 0xfef08a], speed: 5.5, life: 22, shape: 'shard' });
 triggerScreenShake(7, 11);
 break;
 case 'shield_slam':
 spawnShockwave(tx, ty, 110, 0x38bdf8, 7, 25);
 spawnSlashArc(tx, ty, 0, 82, 0x38bdf8, 0xffffff);
 spawnParticles(tx, ty, 26, { colors: [0x38bdf8, 0x93c5fd, 0xffffff], speed: 6.5, life: 24, shape: 'shard' });
 triggerScreenShake(10, 14);
 break;
 case 'iron_defense':
 case 'fortify':
 case 'bastion_scrap':
 case 'juggernaut_stance':
 case 'unbreakable_phalanx':
 spawnShockwave(sx, sy, 64, 0x38bdf8, 5, 22);
 spawnParticles(sx, sy, 14, { colors: [0x38bdf8, 0x60a5fa, 0xffffff], speed: 2.6, life: 22, shape: 'shard' });
 break;
 case 'restoration':
 spawnParticles(sx, sy, 18, { colors: [0x4ade80, 0x86efac, 0xffffff], speed: 2.4, vyBias: -1.8, life: 28, shape: 'plus' });
 spawnShockwave(sx, sy, 60, 0x4ade80, 3, 24);
 break;
 case 'quick_dagger':
 case 'phantom_ambush':
 spawnSlashArc(tx, ty, -0.6, 56, 0x4ade80, 0xffffff);
 spawnSlashArc(tx, ty, 0.6, 56, 0x38bdf8, 0xffffff);
 spawnParticles(tx, ty, 14, { colors: [0x4ade80, 0xffffff], speed: 4.8, life: 18, shape: 'shard' });
 break;
 case 'toxic_needle':
 case 'venom_spreader':
 case 'venom_surge':
 case 'vial_stash':
 case 'shadow_prep':
 spawnSlashArc(tx, ty, -0.3, 52, 0x22c55e, 0x86efac);
 spawnPoisonBubbles(tx, ty, 18);
 break;
 case 'catalytic_rupture':
 spawnShockwave(tx, ty, 115, 0x22c55e, 7, 26);
 spawnShockwave(tx, ty, 80, 0xa855f7, 5, 22);
 spawnPoisonBubbles(tx, ty, 26);
 spawnParticles(tx, ty, 24, { colors: [0x22c55e, 0x4ade80, 0xc084fc], speed: 6, life: 26 });
 triggerScreenShake(10, 14);
 break;
 case 'smoke_screen':
 case 'shadow_step':
 case 'smokebomb_barrage':
 spawnParticles(sx, sy, 22, { colors: [0x64748b, 0x94a3b8, 0x4ade80], speed: 2.8, life: 28, sizeMin: 5, sizeMax: 11 });
 spawnShockwave(sx, sy, 66, 0x4ade80, 3, 22);
 break;
 default:
 spawnSlashArc(tx, ty, -0.4, 58, 0x38bdf8, 0xffffff);
 spawnParticles(tx, ty, 12, { colors: [0x38bdf8, 0xf59e0b], speed: 4, life: 20 });
 break;
 }
}

function spawnFloatingText(x, y, text, color) {
 if (!pixiApp || !pixiApp.stage || !pixiApp.ticker) return;
 const stage = getVfxTarget() || pixiApp.stage;
 if (!stage || stage.destroyed) return;
 const appRef = pixiApp;
 const txt = new PIXI.Text(text, {
 fontFamily: 'Teko', fontSize: 24, fill: color, fontWeight: 'bold', stroke: '#000000', strokeThickness: 4
 });
 txt.anchor.set(0.5);
 txt.x = x;
 txt.y = y;
 stage.addChild(txt);
 let t = 0;
 const tick = (delta) => {
 if (!appRef || !appRef.ticker || txt.destroyed || !txt.parent) {
 if (appRef && appRef.ticker) appRef.ticker.remove(tick);
 return;
 }
 const step = delta / gameState.speedMultiplier;
 txt.y -= 1.25 * step;
 t += step;
 txt.alpha = Math.max(0, 1 - (t / 46));
 if (t > 46) {
 appRef.ticker.remove(tick);
 safeDestroyDisplayObject(txt);
 }
 };
 appRef.ticker.add(tick);
}
