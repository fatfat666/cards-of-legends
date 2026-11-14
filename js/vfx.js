// --- PIXIJS CANVAS, 6-CONSTRUCT FOUNDRY RENDERING & SPECIALIZED VFX ENGINE (v0.8.0) ---
let pixiApp = null;
let vfxContainer = null;
let playerContainer = null;
let playerSprite = null;
let playerShieldVisual = null;
let turretGroup = null;
let enforcerGroup = null;
let enemyEntities = [];
let shakeFrames = 0;
let shakeIntensity = 0;
let battleTime = 0;

function initPixi() {
  const container = document.getElementById('pixi-container');
  container.innerHTML = '';

  pixiApp = new PIXI.Application({
    width: container.clientWidth || 800,
    height: container.clientHeight || 255,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });
  container.appendChild(pixiApp.view);

  vfxContainer = new PIXI.Container();
  turretGroup = new PIXI.Container();
  enforcerGroup = new PIXI.Container();
  pixiApp.stage.addChild(turretGroup);
  pixiApp.stage.addChild(enforcerGroup);
  pixiApp.stage.addChild(vfxContainer);

  pixiApp.ticker.add(() => {
    battleTime += 0.045;
    if (playerContainer && !gameState.combatOver) {
      playerContainer.y = playerContainer.baseY + Math.sin(battleTime) * 4.5;
      if (playerShieldVisual && playerShieldVisual.visible) {
        playerShieldVisual.alpha = 0.25 + Math.sin(battleTime * 1.5) * 0.08;
      }
    }
    if (turretGroup && turretGroup.children) {
      turretGroup.children.forEach((drone, idx) => {
        drone.y = drone.baseY + Math.sin(battleTime * 1.3 + idx * 1.4) * 3.5;
        if (drone.spinRing) {
          drone.spinRing.rotation += 0.035;
        }
      });
    }
    if (enforcerGroup && enforcerGroup.children) {
      enforcerGroup.children.forEach((goon, idx) => {
        goon.y = goon.baseY + Math.sin(battleTime * 1.1 + idx * 1.8) * 3;
      });
    }
    enemyEntities.forEach((ent, idx) => {
      if (ent.container && ent.data.hp > 0) {
        ent.container.y = ent.baseY + Math.sin(battleTime * 0.9 + idx * 1.5) * 5;
        if (ent.cosmicRing) {
          ent.cosmicRing.rotation += 0.02;
        }
      }
    });
    if (shakeFrames > 0) {
      pixiApp.stage.x = (Math.random() - 0.5) * shakeIntensity;
      pixiApp.stage.y = (Math.random() - 0.5) * shakeIntensity;
      shakeFrames--;
      if (shakeFrames <= 0) {
        pixiApp.stage.x = 0;
        pixiApp.stage.y = 0;
      }
    }
  });

  window.addEventListener('resize', () => {
    if (pixiApp && container.clientWidth > 0 && container.clientHeight > 0) {
      pixiApp.renderer.resize(container.clientWidth, container.clientHeight);
      repositionCombatUnits();
    }
  });
}

function buildConstructSprite(cData) {
  const drone = new PIXI.Container();
  const bodyG = new PIXI.Graphics();
  const cType = cData.type || 'auto_turret';

  if (cType === 'heavy_rail') {
    // 2. Heavy Rail-Turret: sleek dual-rail electromagnetic cannon
    bodyG.lineStyle(2, 0x38bdf8, 0.95);
    bodyG.beginFill(0x0f172a, 0.95);
    bodyG.drawRoundedRect(-16, -12, 26, 24, 5);
    bodyG.endFill();
    // Twin extended rails
    bodyG.beginFill(0x38bdf8, 0.9);
    bodyG.drawRect(8, -8, 18, 4);
    bodyG.drawRect(8, 4, 18, 4);
    bodyG.endFill();
    // Plasma core
    bodyG.beginFill(0xffffff, 1);
    bodyG.drawCircle(-2, 0, 5);
    bodyG.endFill();
  } else if (cType === 'inferno_flame') {
    // 3. Inferno Flamethrower: pressurized fuel tanks + wide flame nozzle
    bodyG.lineStyle(2, 0xf97316, 0.95);
    bodyG.beginFill(0x450a0a, 0.95);
    bodyG.drawCircle(-4, 0, 14);
    bodyG.endFill();
    // Wide nozzle
    bodyG.beginFill(0xfb923c, 0.95);
    bodyG.drawPolygon([6, -8, 22, -11, 22, 11, 6, 8]);
    bodyG.endFill();
    // Pilot flame core
    bodyG.beginFill(0xfef08a, 1);
    bodyG.drawCircle(0, 0, 5);
    bodyG.endFill();
  } else if (cType === 'aegis_barrier') {
    // 4. Aegis Force-Barrier: hexagonal projector with translucent energy dome
    bodyG.lineStyle(2, 0x06b6d4, 0.95);
    bodyG.beginFill(0x083344, 0.95);
    bodyG.drawPolygon([0, -15, 13, -7, 13, 7, 0, 15, -13, 7, -13, -7]);
    bodyG.endFill();

    const dome = new PIXI.Graphics();
    dome.lineStyle(2, 0x67e8f9, 0.75);
    dome.beginFill(0x22d3ee, 0.14);
    dome.drawCircle(0, 0, 21);
    dome.endFill();
    drone.addChild(dome);
    drone.spinRing = dome;

    bodyG.beginFill(0x67e8f9, 1);
    bodyG.drawCircle(0, 0, 5);
    bodyG.endFill();
  } else if (cType === 'arc_tesla') {
    // 5. Arc Tesla Coil: high-voltage spire with orbiting induction ring
    bodyG.lineStyle(2, 0x818cf8, 0.95);
    bodyG.beginFill(0x1e1b4b, 0.95);
    bodyG.drawPolygon([-12, 14, 12, 14, 5, -14, -5, -14]);
    bodyG.endFill();

    const coilRing = new PIXI.Graphics();
    coilRing.lineStyle(2, 0x38bdf8, 0.85);
    coilRing.drawEllipse(0, -6, 17, 6);
    drone.addChild(coilRing);
    drone.spinRing = coilRing;

    bodyG.beginFill(0xc7d2fe, 1);
    bodyG.drawCircle(0, -15, 6);
    bodyG.endFill();
  } else if (cType === 'goliath_mech') {
    // 6. Goliath Battle Mech: heavy armored walker with shoulder pods & visor
    bodyG.lineStyle(2.5, 0xeab308, 0.98);
    bodyG.beginFill(0x1f2937, 0.96);
    // Torso
    bodyG.drawRoundedRect(-17, -18, 34, 28, 6);
    // Shoulder missile pods
    bodyG.drawRect(-21, -22, 10, 10);
    bodyG.drawRect(11, -22, 10, 10);
    // Legs
    bodyG.drawRect(-13, 10, 9, 10);
    bodyG.drawRect(4, 10, 9, 10);
    bodyG.endFill();
    // Glowing red visor
    bodyG.beginFill(0xef4444, 1);
    bodyG.drawRect(-10, -10, 20, 5);
    bodyG.endFill();
  } else {
    // 1. Auto-Turret Drone (Default): twin-barrel hex drone
    bodyG.lineStyle(2, 0xf59e0b, 0.95);
    bodyG.beginFill(0x1e293b, 0.95);
    bodyG.drawPolygon([0, -14, 14, 0, 0, 14, -14, 0]);
    bodyG.endFill();
    bodyG.beginFill(0xd97706, 0.95);
    bodyG.drawRect(8, -6, 11, 4);
    bodyG.drawRect(8, 2, 11, 4);
    bodyG.endFill();
    bodyG.beginFill(0x38bdf8, 1);
    bodyG.drawCircle(0, 0, 5);
    bodyG.endFill();
  }

  drone.addChild(bodyG);

  // Individual Construct HP Bar (drone.hpBarG)
  const hpBarG = new PIXI.Graphics();
  const maxHp = Math.max(1, cData.maxHp || 10);
  const ratio = Math.max(0, Math.min(1, cData.hp / maxHp));
  hpBarG.beginFill(0x0f172a, 0.9);
  hpBarG.drawRect(-16, -27, 32, 4.5);
  hpBarG.endFill();
  const barColor = cType === 'aegis_barrier' ? 0x22d3ee : (cType === 'goliath_mech' ? 0xeab308 : 0xf59e0b);
  hpBarG.beginFill(barColor, 1);
  hpBarG.drawRect(-16, -27, 32 * ratio, 4.5);
  hpBarG.endFill();
  drone.addChild(hpBarG);
  drone.hpBarG = hpBarG;

  return drone;
}

function renderCombatUnits() {
  if (!pixiApp) return;

  if (playerContainer) {
    pixiApp.stage.removeChild(playerContainer);
    playerContainer.destroy({ children: true });
  }
  enemyEntities.forEach(e => {
    if (e.container) {
      pixiApp.stage.removeChild(e.container);
      e.container.destroy({ children: true });
    }
  });
  enemyEntities = [];

  const theme = CLASS_THEMES[gameState.classType] || CLASS_THEMES.Mage;
  playerContainer = new PIXI.Container();

  playerShieldVisual = new PIXI.Graphics();
  playerShieldVisual.lineStyle(2.5, 0x38bdf8, 0.9);
  playerShieldVisual.beginFill(0x38bdf8, 0.22);
  playerShieldVisual.drawCircle(0, 0, 44);
  playerShieldVisual.endFill();
  playerShieldVisual.visible = gameState.player.shield > 0;
  playerContainer.addChild(playerShieldVisual);

  playerSprite = new PIXI.Graphics();
  playerSprite.lineStyle(2.5, 0xffffff, 0.7);
  playerSprite.beginFill(theme.primaryHex);

  if (gameState.classType === 'Warrior') {
    playerSprite.drawRoundedRect(-26, -26, 52, 52, 8);
  } else if (gameState.classType === 'Rogue') {
    playerSprite.drawPolygon([0, -34, 28, 0, 0, 34, -28, 0]);
  } else if (gameState.classType === 'Chronomancer') {
    playerSprite.drawPolygon([-26, -30, 26, -30, 0, 0, 26, 30, -26, 30, 0, 0]);
  } else if (gameState.classType === 'Artificer') {
    playerSprite.drawPolygon([0, -32, 28, -16, 28, 16, 0, 32, -28, 16, -28, -16]);
  } else if (gameState.classType === 'Blood Reaver') {
    playerSprite.drawPolygon([0, -36, 24, -8, 16, 32, -16, 32, -24, -8]);
  } else if (gameState.classType === 'Mob Boss') {
    playerSprite.drawRoundedRect(-24, -28, 48, 56, 6);
    playerSprite.endFill();
    playerSprite.beginFill(0x111827, 0.95);
    playerSprite.drawRect(-28, -22, 56, 7);
    playerSprite.drawRect(-18, -34, 36, 12);
    playerSprite.endFill();
    playerSprite.beginFill(0xeab308, 1);
    playerSprite.drawRect(-18, -25, 36, 3);
  } else {
    playerSprite.drawCircle(0, 0, 28);
  }
  playerSprite.endFill();
  playerContainer.addChild(playerSprite);
  pixiApp.stage.addChild(playerContainer);

  gameState.enemies.forEach(enemyData => {
    const eCont = new PIXI.Container();
    const eSprite = new PIXI.Graphics();
    const isBoss = enemyData.isBoss;
    const isAstralBoss = enemyData.isAstralBoss;
    const size = isAstralBoss ? 48 : (isBoss ? 42 : (gameState.enemies.length > 1 ? 26 : 32));
    const fillHex = isAstralBoss ? 0x7e22ce : (isBoss ? 0x991b1b : (enemyData.colorHex || 0xdc2626));
    const strokeHex = isAstralBoss ? 0x38bdf8 : (isBoss ? 0xfacc15 : 0xfca5a5);

    if (isAstralBoss) {
      const cosmicRing = new PIXI.Graphics();
      cosmicRing.lineStyle(2.5, 0x38bdf8, 0.75);
      cosmicRing.drawPolygon([0, -58, 50, -29, 50, 29, 0, 58, -50, 29, -50, -29]);
      eCont.addChild(cosmicRing);
      eCont.cosmicRing = cosmicRing;
    }

    eSprite.lineStyle(isBoss ? 3.5 : 2.5, strokeHex, 0.85);
    eSprite.beginFill(fillHex);

    if (isAstralBoss) {
      eSprite.drawPolygon([0, -size, size * 0.85, -size * 0.4, size * 0.85, size * 0.4, 0, size, -size * 0.85, size * 0.4, -size * 0.85, -size * 0.4]);
    } else if (isBoss) {
      eSprite.drawPolygon([0, -size, size, -size * 0.3, size * 0.65, size, -size * 0.65, size, -size, -size * 0.3]);
    } else if (enemyData.shape === 'diamond') {
      eSprite.drawPolygon([0, -size, size, 0, 0, size, -size, 0]);
    } else {
      eSprite.drawPolygon([0, -size, size, size * 0.8, -size, size * 0.8]);
    }
    eSprite.endFill();
    eCont.addChild(eSprite);
    pixiApp.stage.addChild(eCont);

    enemyData.container = eCont;
    enemyData.sprite = eSprite;
    enemyEntities.push({ data: enemyData, container: eCont, sprite: eSprite, baseY: 0, cosmicRing: eCont.cosmicRing || null });
  });

  repositionCombatUnits();
  renderArtificerTurrets();
  renderMobEnforcers();
}

function renderArtificerTurrets() {
  if (!turretGroup) return;
  turretGroup.removeChildren().forEach(c => c.destroy({ children: true }));

  const baseX = playerContainer ? playerContainer.x : 180;
  const baseY = playerContainer ? playerContainer.baseY : 130;

  // Support up to 4 Constructs in a clean arc around the Artificer
  const offsets = [
    { x: 52, y: -48 },
    { x: 52, y: 48 },
    { x: 82, y: 0 },
    { x: 20, y: -64 }
  ];

  gameState.turrets.forEach((tData, idx) => {
    const drone = buildConstructSprite(tData);
    const off = offsets[idx] || { x: 45 + idx * 14, y: -40 + idx * 24 };
    drone.x = baseX + off.x;
    drone.baseY = baseY + off.y;
    drone.y = drone.baseY;
    turretGroup.addChild(drone);
  });
}

function renderMobEnforcers() {
  if (!enforcerGroup) return;
  enforcerGroup.removeChildren().forEach(c => c.destroy({ children: true }));

  const baseX = playerContainer ? playerContainer.x : 180;
  const baseY = playerContainer ? playerContainer.baseY : 130;

  const offsets = [
    { x: 58, y: -38 },
    { x: 58, y: 38 },
    { x: 86, y: 0 }
  ];

  gameState.mobEnforcers.forEach((mData, idx) => {
    const goon = new PIXI.Container();

    const bodyG = new PIXI.Graphics();
    bodyG.lineStyle(2, 0xeab308, 0.95);
    bodyG.beginFill(0x1f2937, 0.95);
    bodyG.drawRoundedRect(-12, -14, 24, 28, 5);
    bodyG.endFill();
    bodyG.beginFill(0x111827, 1);
    bodyG.drawRect(-15, -13, 30, 4);
    bodyG.endFill();
    bodyG.beginFill(0xfacc15, 1);
    bodyG.drawRect(8, -3, 12, 4);
    bodyG.endFill();
    goon.addChild(bodyG);

    const hpBarG = new PIXI.Graphics();
    const ratio = Math.max(0, mData.hp / mData.maxHp);
    hpBarG.beginFill(0x0f172a, 0.9);
    hpBarG.drawRect(-14, -22, 28, 4);
    hpBarG.endFill();
    hpBarG.beginFill(0xeab308, 1);
    hpBarG.drawRect(-14, -22, 28 * ratio, 4);
    hpBarG.endFill();
    goon.addChild(hpBarG);

    const off = offsets[idx] || { x: 58, y: 0 };
    goon.x = baseX + off.x;
    goon.baseY = baseY + off.y;
    goon.y = goon.baseY;
    enforcerGroup.addChild(goon);
  });
}

function repositionCombatUnits() {
  if (!pixiApp || !playerContainer) return;
  const w = pixiApp.renderer.width;
  const h = pixiApp.renderer.height;

  playerContainer.x = w * 0.23;
  playerContainer.baseY = h * 0.50;
  playerContainer.y = playerContainer.baseY;

  const count = enemyEntities.length;
  enemyEntities.forEach((ent, idx) => {
    if (count === 1) {
      ent.container.x = w * 0.74;
      ent.baseY = h * 0.50;
    } else {
      ent.container.x = w * (idx === 0 ? 0.68 : 0.82);
      ent.baseY = h * (idx === 0 ? 0.34 : 0.66);
    }
    ent.container.y = ent.baseY;
  });

  renderArtificerTurrets();
  renderMobEnforcers();
}

function setEntityShieldVisual(hasShield) {
  if (playerShieldVisual) {
    playerShieldVisual.visible = hasShield;
  }
}

function triggerShake(frames, intensity) {
  shakeFrames = Math.max(shakeFrames, frames);
  shakeIntensity = Math.max(shakeIntensity, intensity);
}

function flashEntity(sprite, hexColor) {
  if (!sprite) return;
  sprite.tint = hexColor;
  setTimeout(() => {
    if (sprite && !sprite.destroyed) sprite.tint = 0xffffff;
  }, 140);
}

// --- SPECIALIZED CONSTRUCT & COMBAT PROJECTILE VFX ---
function spawnRailgunBeamVFX(sx, sy, tx, ty) {
  if (!vfxContainer) return;
  const g = new PIXI.Graphics();
  g.lineStyle(7, 0x38bdf8, 0.35);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);
  g.lineStyle(2.5, 0xffffff, 1);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);
  vfxContainer.addChild(g);
  spawnVFXParticles(tx, ty, 0x38bdf8, 10, 4.5);

  let life = 0;
  const tick = () => {
    life++;
    g.alpha = 1 - life / 14;
    if (life >= 14) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(g);
      g.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnFlameJetVFX(sx, sy, tx, ty) {
  if (!vfxContainer) return;
  const colors = [0xf97316, 0xef4444, 0xfacc15];
  for (let i = 0; i < 16; i++) {
    const p = new PIXI.Graphics();
    const col = colors[i % colors.length];
    p.beginFill(col, 0.9);
    p.drawCircle(0, 0, 3 + Math.random() * 4);
    p.endFill();
    p.x = sx + (Math.random() - 0.5) * 10;
    p.y = sy + (Math.random() - 0.5) * 10;
    const progress = 0.35 + Math.random() * 0.75;
    const destX = sx + (tx - sx) * progress + (Math.random() - 0.5) * 28;
    const destY = sy + (ty - sy) * progress + (Math.random() - 0.5) * 28;
    vfxContainer.addChild(p);

    let life = 0;
    const maxLife = 16 + Math.floor(Math.random() * 8);
    const tick = () => {
      life++;
      p.x += (destX - p.x) * 0.22;
      p.y += (destY - p.y) * 0.22;
      p.alpha = 1 - life / maxLife;
      p.scale.set(1 + life * 0.04);
      if (life >= maxLife) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnChainLightningVFX(sx, sy, tx, ty, colorHex = 0x818cf8) {
  if (!vfxContainer) return;
  const g = new PIXI.Graphics();
  g.lineStyle(3, colorHex, 0.95);
  g.moveTo(sx, sy);
  const segs = 6;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const mx = sx + (tx - sx) * t + (Math.random() - 0.5) * 26;
    const my = sy + (ty - sy) * t + (Math.random() - 0.5) * 26;
    g.lineTo(mx, my);
  }
  g.lineTo(tx, ty);

  g.lineStyle(1.5, 0xffffff, 0.9);
  g.moveTo(sx, sy);
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    g.lineTo(sx + (tx - sx) * t + (Math.random() - 0.5) * 16, sy + (ty - sy) * t + (Math.random() - 0.5) * 16);
  }
  g.lineTo(tx, ty);
  vfxContainer.addChild(g);

  let life = 0;
  const tick = () => {
    life++;
    g.alpha = 1 - life / 12;
    if (life >= 12) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(g);
      g.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnBarrierPulseVFX(cx, cy) {
  if (!vfxContainer) return;
  const ring = new PIXI.Graphics();
  ring.lineStyle(3, 0x22d3ee, 0.9);
  ring.drawCircle(cx, cy, 18);
  vfxContainer.addChild(ring);

  let life = 0;
  const tick = () => {
    life++;
    ring.scale.set(1 + life * 0.14);
    ring.alpha = 1 - life / 16;
    if (life >= 16) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(ring);
      ring.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnMechSalvoVFX(sx, sy, tx, ty) {
  spawnGunfireTracer(sx, sy - 8, tx, ty - 6, 0xeab308);
  spawnGunfireTracer(sx, sy + 8, tx, ty + 6, 0xef4444);
  spawnVFXParticles(tx, ty, 0xf97316, 12, 5);
}

function spawnGunfireTracer(sx, sy, tx, ty, colorHex = 0xfef08a) {
  if (!vfxContainer) return;
  const tracer = new PIXI.Graphics();
  tracer.lineStyle(3, colorHex, 0.95);
  tracer.moveTo(sx, sy);
  tracer.lineTo(tx + (Math.random() - 0.5) * 16, ty + (Math.random() - 0.5) * 16);
  vfxContainer.addChild(tracer);

  const flash = new PIXI.Graphics();
  flash.beginFill(0xfde047, 0.95);
  flash.drawCircle(sx + 10, sy, 7);
  flash.endFill();
  vfxContainer.addChild(flash);

  let life = 0;
  const tick = () => {
    life++;
    tracer.alpha = 1 - life / 8;
    flash.alpha = 1 - life / 5;
    if (life >= 8) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(tracer);
      vfxContainer.removeChild(flash);
      tracer.destroy();
      flash.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnShellCasings(x, y, count = 4) {
  if (!vfxContainer) return;
  for (let i = 0; i < count; i++) {
    const casing = new PIXI.Graphics();
    casing.beginFill(0xfacc15, 0.95);
    casing.drawRect(-2, -1, 4, 2.5);
    casing.endFill();
    casing.x = x + (Math.random() - 0.5) * 12;
    casing.y = y - 10;
    vfxContainer.addChild(casing);

    let vx = -1.5 - Math.random() * 2.5;
    let vy = -3.5 - Math.random() * 2.5;
    let vRot = (Math.random() - 0.5) * 0.4;
    let life = 0;

    const tick = () => {
      life++;
      vy += 0.28;
      casing.x += vx;
      casing.y += vy;
      casing.rotation += vRot;
      casing.alpha = 1 - life / 26;
      if (life >= 26) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(casing);
        casing.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnCashParticles(x, y, count = 12, isGold = false) {
  if (!vfxContainer) return;
  for (let i = 0; i < count; i++) {
    const p = new PIXI.Graphics();
    if (isGold) {
      p.beginFill(0xfacc15, 1);
      p.lineStyle(1, 0xa16207, 1);
      p.drawCircle(0, 0, 4.5);
      p.endFill();
    } else {
      p.beginFill(0x22c55e, 0.95);
      p.lineStyle(1, 0xfef08a, 0.8);
      p.drawRect(-5, -3, 10, 6);
      p.endFill();
    }
    p.x = x + (Math.random() - 0.5) * 20;
    p.y = y + (Math.random() - 0.5) * 20;
    vfxContainer.addChild(p);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
    const speed = 2.2 + Math.random() * 3.8;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let vRot = (Math.random() - 0.5) * 0.22;
    let life = 0;

    const tick = () => {
      life++;
      vy += 0.14;
      p.x += vx;
      p.y += vy;
      p.rotation += vRot;
      p.alpha = 1 - life / 34;
      if (life >= 34) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnBlackFlashVFX(x, y, isTier3 = false) {
  if (!vfxContainer) return;
  const flashG = new PIXI.Graphics();

  const coreRadius = isTier3 ? 52 : 34;
  flashG.beginFill(0x050508, 0.95);
  flashG.drawCircle(x, y, coreRadius);
  flashG.endFill();

  flashG.lineStyle(isTier3 ? 6 : 4, 0xdc2626, 0.95);
  flashG.drawCircle(x, y, coreRadius + 6);

  const bolts = isTier3 ? 12 : 7;
  for (let i = 0; i < bolts; i++) {
    const angle = (Math.PI * 2 * i) / bolts + (Math.random() - 0.5) * 0.4;
    const len = (isTier3 ? 95 : 62) + Math.random() * 25;
    const midX = x + Math.cos(angle + 0.2) * (len * 0.5);
    const midY = y + Math.sin(angle + 0.2) * (len * 0.5);
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;

    flashG.lineStyle(isTier3 ? 5 : 3.5, 0x09090b, 1);
    flashG.moveTo(x, y);
    flashG.lineTo(midX, midY);
    flashG.lineTo(endX, endY);

    flashG.lineStyle(isTier3 ? 2.5 : 1.5, 0xef4444, 1);
    flashG.moveTo(x, y);
    flashG.lineTo(midX, midY);
    flashG.lineTo(endX, endY);
  }

  vfxContainer.addChild(flashG);
  spawnVFXParticles(x, y, 0xdc2626, isTier3 ? 28 : 16, isTier3 ? 7 : 5);
  spawnVFXParticles(x, y, 0x09090b, isTier3 ? 20 : 12, isTier3 ? 6 : 4);

  let life = 0;
  const maxLife = isTier3 ? 24 : 16;
  const tick = () => {
    life++;
    flashG.alpha = 1 - (life / maxLife);
    flashG.scale.set(1 + life * 0.015);
    if (life >= maxLife) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(flashG);
      flashG.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function playCardVFX(cardId, targetEnemy) {
  if (!pixiApp || !playerContainer) return;
  const px = playerContainer.x;
  const py = playerContainer.y;
  const tx = targetEnemy && targetEnemy.container ? targetEnemy.container.x : px + 340;
  const ty = targetEnemy && targetEnemy.container ? targetEnemy.container.y : py;

  if (['tommy_gun_spray', 'drive_by_ambush', 'tommy_drum_extortion', 'chicago_typewriter', 'syndicate_hit_squad'].includes(cardId)) {
    const shots = cardId === 'tommy_drum_extortion' ? 5 : (cardId === 'chicago_typewriter' ? 4 : 3);
    for (let s = 0; s < shots; s++) {
      setTimeout(() => {
        spawnGunfireTracer(px + 20, py - 4, tx, ty, 0xfef08a);
        spawnShellCasings(px + 10, py, 2);
      }, s * 55);
    }
    triggerShake(9, 6);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xfef08a);
  } else if (['protection_racket', 'money_laundering', 'syndicate_ledger', 'black_market_voucher', 'offers_you_cant_refuse'].includes(cardId)) {
    spawnCashParticles(px, py - 20, 14, false);
    if (cardId === 'protection_racket' || cardId === 'money_laundering' || cardId === 'offers_you_cant_refuse') {
      spawnVFXParticles(px, py, 0x38bdf8, 12, 3);
    }
  } else if (['kingpins_ultimatum', 'golden_peacemaker', 'royal_flush'].includes(cardId)) {
    spawnGunfireTracer(px + 20, py, tx, ty, 0xfacc15);
    spawnCashParticles(tx, ty, 20, true);
    spawnCashParticles(px, py - 20, 14, false);
    triggerShake(13, 9);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xfacc15);
  } else if (['hired_goon_contract', 'mercenary_contract', 'armored_limousine'].includes(cardId)) {
    spawnVFXParticles(px + 50, py, 0xeab308, 16, 4);
  } else if (['tesla_arc_pylon', 'arc_tesla_coil'].includes(cardId)) {
    spawnChainLightningVFX(px + 30, py - 10, tx, ty, 0x38bdf8);
    triggerShake(8, 5);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0x38bdf8);
  } else if (['astral_cataclysm', 'astral_singularity'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0xc084fc, 28, 7);
    spawnVFXParticles(tx, ty, 0x38bdf8, 18, 5);
    triggerShake(14, 10);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xc084fc);
  } else if (cardId === 'titans_cleave') {
    spawnVFXParticles(tx, ty, 0x38bdf8, 20, 6);
    spawnVFXParticles(tx, ty, 0xef4444, 16, 5);
    triggerShake(12, 8);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0x38bdf8);
  } else if (cardId === 'shadow_step_mirage') {
    spawnVFXParticles(px, py, 0x4ade80, 18, 4.5);
    spawnVFXParticles(px, py, 0x38bdf8, 12, 3.5);
  } else if (cardId === 'temporal_paradox') {
    spawnVFXParticles(px, py, 0x2dd4bf, 22, 5.5);
  } else if (cardId === 'sanguine_eclipse') {
    spawnVFXParticles(tx, ty, 0xe11d48, 24, 6);
    spawnVFXParticles(px, py, 0xfb7185, 16, 4);
    triggerShake(12, 8);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xe11d48);
  } else if (cardId === 'astral_compass') {
    spawnVFXParticles(px, py, 0x38bdf8, 16, 4.5);
    spawnCashParticles(px, py - 24, 10, true);
  } else if (['fireball', 'mana_overload'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0xf97316, 26, 6);
    triggerShake(12, 9);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xf97316);
  } else if (['arcane_strike', 'spark', 'volatile_reserve', 'overcharge_conduit', 'spellweaver_prism'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0xc084fc, 16, 4.5);
    triggerShake(7, 5);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xc084fc);
  } else if (['chrono_slash', 'rift_strike', 'stasis_surge', 'entropy_bolt', 'stasis_condenser', 'temporal_fracture'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0x2dd4bf, 18, 5);
    triggerShake(8, 5);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0x2dd4bf);
  } else if (['wrench_toss', 'capacitor_discharge', 'thermite_rivets', 'scrap_cannon', 'scrap_salvage', 'overload_capacitor'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0xf59e0b, 18, 5);
    triggerShake(9, 6);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xf59e0b);
  } else if (['siphon_slash', 'serrated_cleave', 'blood_boil', 'blood_suck', 'flurry_of_fangs', 'hemorrhagic_rupture', 'crimson_frenzy'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0xe11d48, 20, 5.5);
    spawnVFXParticles(px, py, 0xfb7185, 10, 3);
    triggerShake(9, 6);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xe11d48);
  } else if (['heavy_slash', 'shield_slam', 'patience_fury', 'battering_rampart', 'cleaving_execution'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0xef4444, 18, 5);
    triggerShake(10, 7);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0xef4444);
  } else if (['toxic_needle', 'venom_spreader', 'venom_surge', 'catalytic_rupture', 'vial_stash', 'shadow_prep', 'phantom_ambush'].includes(cardId)) {
    spawnVFXParticles(tx, ty, 0x22c55e, 18, 4.5);
    triggerShake(6, 4);
    if (targetEnemy) flashEntity(targetEnemy.sprite, 0x22c55e);
  } else if (['barrier', 'iron_defense', 'fortify', 'smoke_screen', 'bastion_scrap', 'juggernaut_stance', 'shadow_step', 'stasis_bubble', 'reinforced_plating', 'weld_and_patch', 'reactive_armor', 'deja_vu', 'chrono_rewind', 'unbreakable_phalanx', 'smokebomb_barrage', 'velvet_kevlar'].includes(cardId)) {
    spawnVFXParticles(px, py, 0x38bdf8, 16, 3.5);
  } else if (['restoration', 'coagulate', 'sanguine_ward', 'bootleg_tonic', 'adrenaline_syringe'].includes(cardId)) {
    spawnVFXParticles(px, py, 0x4ade80, 16, 3.5);
  } else {
    spawnVFXParticles(px, py, 0xfacc15, 14, 3.5);
  }
}

function spawnPoisonBubbles(x, y) {
  if (!vfxContainer) return;
  for (let i = 0; i < 6; i++) {
    const p = new PIXI.Graphics();
    p.lineStyle(1.5, 0x86efac);
    p.beginFill(0x22c55e, 0.65);
    p.drawCircle(0, 0, 3 + Math.random() * 3.5);
    p.endFill();
    p.x = x + (Math.random() - 0.5) * 32;
    p.y = y + (Math.random() - 0.5) * 20;
    vfxContainer.addChild(p);

    let life = 0;
    const tick = () => {
      life++;
      p.y -= 1.2;
      p.alpha = 1 - (life / 28);
      if (life >= 28) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnVFXParticles(x, y, colorHex, count = 14, speedMult = 4) {
  if (!vfxContainer) return;
  for (let i = 0; i < count; i++) {
    const p = new PIXI.Graphics();
    p.beginFill(colorHex);
    p.drawCircle(0, 0, 2.5 + Math.random() * 3.5);
    p.endFill();
    p.x = x;
    p.y = y;
    vfxContainer.addChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = (1.5 + Math.random() * 2.5) * (speedMult / 4);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    let life = 0;

    const tick = () => {
      life++;
      p.x += vx;
      p.y += vy;
      p.alpha = 1 - (life / 22);
      p.scale.set(1 - (life / 26));
      if (life >= 22) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnFloatingText(text, x, y, colorStr = '#ffffff') {
  if (!vfxContainer) return;
  const style = new PIXI.TextStyle({
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: 16,
    fontWeight: '900',
    fill: colorStr,
    stroke: '#000000',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowDistance: 2
  });
  const txt = new PIXI.Text(text, style);
  txt.anchor.set(0.5);
  txt.x = x + (Math.random() - 0.5) * 18;
  txt.y = y - 16;
  vfxContainer.addChild(txt);

  let life = 0;
  const tick = () => {
    life++;
    txt.y -= 1.25;
    txt.alpha = 1 - (life / 36);
    if (life >= 36) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(txt);
      txt.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}
