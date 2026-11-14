// --- PIXIJS CANVAS, 6-CONSTRUCT FOUNDRY RENDERING & SPECIALIZED VFX ENGINE (v0.9.0) ---
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
      if (playerContainer.baseX !== undefined && !playerContainer.isLunging) {
        playerContainer.x += (playerContainer.baseX - playerContainer.x) * 0.18;
      }
      if (playerShieldVisual && playerShieldVisual.visible) {
        playerShieldVisual.alpha = 0.38 + Math.sin(battleTime * 1.8) * 0.12;
        playerShieldVisual.rotation += 0.012;
      }
    }
    if (turretGroup && turretGroup.children) {
      turretGroup.children.forEach((drone, idx) => {
        drone.y = drone.baseY + Math.sin(battleTime * 1.3 + idx * 1.4) * 3.5;
        if (drone.spinRing) {
          drone.spinRing.rotation += 0.045;
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
        if (ent.baseX !== undefined && !ent.isRecoiling) {
          ent.container.x += (ent.baseX - ent.container.x) * 0.18;
        }
        if (ent.cosmicRing) {
          ent.cosmicRing.rotation += 0.025;
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
    bodyG.lineStyle(2, 0x38bdf8, 0.95);
    bodyG.beginFill(0x0f172a, 0.95);
    bodyG.drawRoundedRect(-16, -12, 26, 24, 5);
    bodyG.endFill();
    bodyG.beginFill(0x38bdf8, 0.9);
    bodyG.drawRect(8, -8, 18, 4);
    bodyG.drawRect(8, 4, 18, 4);
    bodyG.endFill();
    bodyG.beginFill(0xffffff, 1);
    bodyG.drawCircle(-2, 0, 5);
    bodyG.endFill();
  } else if (cType === 'inferno_flame') {
    bodyG.lineStyle(2, 0xf97316, 0.95);
    bodyG.beginFill(0x450a0a, 0.95);
    bodyG.drawCircle(-4, 0, 14);
    bodyG.endFill();
    bodyG.beginFill(0xfb923c, 0.95);
    bodyG.drawPolygon([6, -8, 22, -11, 22, 11, 6, 8]);
    bodyG.endFill();
    bodyG.beginFill(0xfef08a, 1);
    bodyG.drawCircle(0, 0, 5);
    bodyG.endFill();
  } else if (cType === 'aegis_barrier') {
    bodyG.lineStyle(2, 0x06b6d4, 0.95);
    bodyG.beginFill(0x083344, 0.95);
    bodyG.drawPolygon([0, -15, 13, -7, 13, 7, 0, 15, -13, 7, -13, -7]);
    bodyG.endFill();

    const dome = new PIXI.Graphics();
    dome.lineStyle(2, 0x67e8f9, 0.85);
    dome.beginFill(0x22d3ee, 0.16);
    dome.drawCircle(0, 0, 22);
    dome.endFill();
    drone.addChild(dome);
    drone.spinRing = dome;

    bodyG.beginFill(0x67e8f9, 1);
    bodyG.drawCircle(0, 0, 5);
    bodyG.endFill();
  } else if (cType === 'arc_tesla') {
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
    bodyG.lineStyle(2.5, 0xeab308, 0.98);
    bodyG.beginFill(0x1f2937, 0.96);
    bodyG.drawRoundedRect(-17, -18, 34, 28, 6);
    bodyG.drawRect(-21, -22, 10, 10);
    bodyG.drawRect(11, -22, 10, 10);
    bodyG.drawRect(-13, 10, 9, 10);
    bodyG.drawRect(4, 10, 9, 10);
    bodyG.endFill();
    bodyG.beginFill(0xef4444, 1);
    bodyG.drawRect(-10, -10, 20, 5);
    bodyG.endFill();
  } else {
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

  // Upgraded hexagonal energy shield visual
  playerShieldVisual = new PIXI.Graphics();
  playerShieldVisual.lineStyle(3, 0x38bdf8, 0.95);
  playerShieldVisual.beginFill(0x38bdf8, 0.18);
  playerShieldVisual.drawCircle(0, 0, 48);
  playerShieldVisual.endFill();
  playerShieldVisual.lineStyle(1.5, 0xa5f3fc, 0.7);
  playerShieldVisual.drawPolygon([0, -54, 47, -27, 47, 27, 0, 54, -47, 27, -47, -27]);
  playerShieldVisual.visible = gameState.player.shield > 0;
  playerContainer.addChild(playerShieldVisual);

  playerSprite = new PIXI.Graphics();
  playerSprite.lineStyle(2.5, 0xffffff, 0.75);
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
    const size = isAstralBoss ? 50 : (isBoss ? 44 : (gameState.enemies.length > 1 ? 28 : 34));
    const fillHex = isAstralBoss ? 0x7e22ce : (isBoss ? 0x991b1b : (enemyData.colorHex || 0xdc2626));
    const strokeHex = isAstralBoss ? 0x38bdf8 : (isBoss ? 0xfacc15 : 0xfca5a5);

    if (isAstralBoss) {
      const cosmicRing = new PIXI.Graphics();
      cosmicRing.lineStyle(3, 0x38bdf8, 0.85);
      cosmicRing.drawPolygon([0, -62, 54, -31, 54, 31, 0, 62, -54, 31, -54, -31]);
      eCont.addChild(cosmicRing);
      eCont.cosmicRing = cosmicRing;
    }

    eSprite.lineStyle(isBoss ? 3.5 : 2.5, strokeHex, 0.9);
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
    enemyEntities.push({ data: enemyData, container: eCont, sprite: eSprite, baseX: 0, baseY: 0, cosmicRing: eCont.cosmicRing || null });
  });

  repositionCombatUnits();
  renderArtificerTurrets();
  renderMobEnforcers();
}

function renderArtificerTurrets() {
  if (!turretGroup) return;
  turretGroup.removeChildren().forEach(c => c.destroy({ children: true }));

  const baseX = playerContainer ? (playerContainer.baseX || playerContainer.x) : 180;
  const baseY = playerContainer ? playerContainer.baseY : 130;

  const offsets = [
    { x: 54, y: -50 },
    { x: 54, y: 50 },
    { x: 86, y: 0 },
    { x: 20, y: -66 }
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

  const baseX = playerContainer ? (playerContainer.baseX || playerContainer.x) : 180;
  const baseY = playerContainer ? playerContainer.baseY : 130;

  const offsets = [
    { x: 60, y: -40 },
    { x: 60, y: 40 },
    { x: 88, y: 0 }
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

  playerContainer.baseX = w * 0.23;
  playerContainer.x = playerContainer.baseX;
  playerContainer.baseY = h * 0.50;
  playerContainer.y = playerContainer.baseY;

  const count = enemyEntities.length;
  enemyEntities.forEach((ent, idx) => {
    if (count === 1) {
      ent.baseX = w * 0.74;
      ent.baseY = h * 0.50;
    } else {
      ent.baseX = w * (idx === 0 ? 0.68 : 0.82);
      ent.baseY = h * (idx === 0 ? 0.34 : 0.66);
    }
    ent.container.x = ent.baseX;
    ent.container.y = ent.baseY;
  });

  renderArtificerTurrets();
  renderMobEnforcers();
}

function setEntityShieldVisual(hasShield) {
  if (playerShieldVisual) {
    const wasHidden = !playerShieldVisual.visible;
    playerShieldVisual.visible = hasShield;
    if (hasShield && wasHidden && playerContainer) {
      spawnShieldHexVFX(playerContainer.x, playerContainer.y, 0x38bdf8);
    }
  }
}

function triggerShake(frames, intensity) {
  shakeFrames = Math.max(shakeFrames, frames);
  shakeIntensity = Math.max(shakeIntensity, intensity);
}

function flashEntity(sprite, hexColor) {
  if (!sprite) return;
  sprite.tint = hexColor;
  const parent = sprite.parent;
  if (parent) {
    parent.scale.set(1.14);
    setTimeout(() => {
      if (parent && !parent.destroyed) parent.scale.set(1);
    }, 130);
  }
  setTimeout(() => {
    if (sprite && !sprite.destroyed) sprite.tint = 0xffffff;
  }, 160);
}

// --- PHYSICAL MOTION & CORE VFX PRIMITIVES ---
function animateUnitLunge(dx = 34) {
  if (!pixiApp || !playerContainer) return;
  playerContainer.isLunging = true;
  const startX = playerContainer.baseX || playerContainer.x;
  let life = 0;
  const maxLife = 14;
  const tick = () => {
    life++;
    const p = life / maxLife;
    const curve = Math.sin(p * Math.PI);
    playerContainer.x = startX + dx * curve;
    if (life >= maxLife) {
      playerContainer.x = startX;
      playerContainer.isLunging = false;
      pixiApp.ticker.remove(tick);
    }
  };
  pixiApp.ticker.add(tick);
}

function animateEnemyRecoil(targetEnemy, dx = 22) {
  if (!pixiApp || !targetEnemy) return;
  const ent = enemyEntities.find(e => e.data === targetEnemy || e.container === targetEnemy.container);
  if (!ent || !ent.container) return;
  ent.isRecoiling = true;
  const startX = ent.baseX || ent.container.x;
  let life = 0;
  const maxLife = 12;
  const tick = () => {
    life++;
    const p = life / maxLife;
    ent.container.x = startX + dx * Math.sin(p * Math.PI);
    if (life >= maxLife) {
      ent.container.x = startX;
      ent.isRecoiling = false;
      pixiApp.ticker.remove(tick);
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnShockwaveRing(x, y, colorHex, startRadius = 12, endScale = 3.4, duration = 18, lineWidth = 4) {
  if (!pixiApp || !vfxContainer) return;
  const ring = new PIXI.Graphics();
  ring.blendMode = PIXI.BLEND_MODES.ADD;
  ring.lineStyle(lineWidth + 4, colorHex, 0.35);
  ring.drawCircle(0, 0, startRadius);
  ring.lineStyle(lineWidth, 0xffffff, 0.9);
  ring.drawCircle(0, 0, startRadius);
  ring.x = x;
  ring.y = y;
  vfxContainer.addChild(ring);

  let life = 0;
  const tick = () => {
    life++;
    const t = life / duration;
    const ease = 1 - Math.pow(1 - t, 3);
    ring.scale.set(1 + (endScale - 1) * ease);
    ring.alpha = 1 - t;
    if (life >= duration) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(ring);
      ring.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnImpactBurst(x, y, colorHex, radius = 34) {
  if (!pixiApp || !vfxContainer) return;
  const flash = new PIXI.Graphics();
  flash.blendMode = PIXI.BLEND_MODES.ADD;
  flash.beginFill(colorHex, 0.55);
  flash.drawCircle(0, 0, radius);
  flash.endFill();
  flash.beginFill(0xffffff, 0.95);
  flash.drawCircle(0, 0, radius * 0.48);
  flash.endFill();
  flash.x = x;
  flash.y = y;
  vfxContainer.addChild(flash);

  let life = 0;
  const maxLife = 10;
  const tick = () => {
    life++;
    const t = life / maxLife;
    flash.scale.set(1 + t * 0.65);
    flash.alpha = 1 - t;
    if (life >= maxLife) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(flash);
      flash.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

// --- SPECIALIZED ABILITY & CONSTRUCT VFX ---
function spawnFireballVFX(sx, sy, tx, ty, isOverload = false) {
  if (!pixiApp || !vfxContainer) return;
  const orb = new PIXI.Container();
  orb.x = sx;
  orb.y = sy;

  const glow = new PIXI.Graphics();
  glow.blendMode = PIXI.BLEND_MODES.ADD;
  glow.beginFill(isOverload ? 0xc084fc : 0xf97316, 0.5);
  glow.drawCircle(0, 0, isOverload ? 30 : 24);
  glow.beginFill(0xfacc15, 0.85);
  glow.drawCircle(0, 0, isOverload ? 17 : 13);
  glow.beginFill(0xffffff, 1);
  glow.drawCircle(0, 0, isOverload ? 9 : 7);
  glow.endFill();
  orb.addChild(glow);
  vfxContainer.addChild(orb);

  let life = 0;
  const travelFrames = 14;
  const tick = () => {
    life++;
    const t = Math.min(1, life / travelFrames);
    const ease = t * t * (3 - 2 * t);
    const arcY = -Math.sin(t * Math.PI) * 26;
    orb.x = sx + (tx - sx) * ease;
    orb.y = sy + (ty - sy) * ease + arcY;
    orb.scale.set(1 + Math.sin(life * 0.9) * 0.15);

    // Trailing flame puffs
    const trail = new PIXI.Graphics();
    trail.blendMode = PIXI.BLEND_MODES.ADD;
    trail.beginFill(isOverload ? 0xa855f7 : 0xf97316, 0.75);
    trail.drawCircle(0, 0, 7 + Math.random() * 6);
    trail.endFill();
    trail.x = orb.x + (Math.random() - 0.5) * 8;
    trail.y = orb.y + (Math.random() - 0.5) * 8;
    vfxContainer.addChild(trail);
    let tLife = 0;
    const trailTick = () => {
      tLife++;
      trail.alpha = 1 - tLife / 12;
      trail.scale.set(1 - tLife / 14);
      trail.y -= 0.7;
      if (tLife >= 12) {
        pixiApp.ticker.remove(trailTick);
        vfxContainer.removeChild(trail);
        trail.destroy();
      }
    };
    pixiApp.ticker.add(trailTick);

    if (life >= travelFrames) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(orb);
      orb.destroy({ children: true });

      // Massive detonation on target
      spawnImpactBurst(tx, ty, isOverload ? 0xc084fc : 0xf97316, isOverload ? 56 : 46);
      spawnShockwaveRing(tx, ty, isOverload ? 0xc084fc : 0xfacc15, 16, 4.2, 20, 5);
      spawnShockwaveRing(tx, ty, 0xef4444, 10, 3.0, 16, 3);
      spawnVFXParticles(tx, ty, isOverload ? 0xc084fc : 0xf97316, 34, 8.5);
      spawnVFXParticles(tx, ty, 0xfacc15, 22, 6.5);
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnArcaneBeamVFX(sx, sy, tx, ty, colorHex = 0xc084fc) {
  if (!pixiApp || !vfxContainer) return;
  const g = new PIXI.Graphics();
  g.blendMode = PIXI.BLEND_MODES.ADD;

  // Wide outer aura beam
  g.lineStyle(18, colorHex, 0.32);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);

  // Spiraling energy ribbons
  const steps = 18;
  g.lineStyle(3.5, 0xe879f9, 0.85);
  g.moveTo(sx, sy);
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const wave = Math.sin(t * Math.PI * 4) * 16 * Math.sin(t * Math.PI);
    g.lineTo(sx + dx * t + nx * wave, sy + dy * t + ny * wave);
  }

  // White-hot core beam
  g.lineStyle(4.5, 0xffffff, 1);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);
  vfxContainer.addChild(g);

  spawnImpactBurst(sx, sy, colorHex, 24);
  spawnImpactBurst(tx, ty, colorHex, 38);
  spawnShockwaveRing(tx, ty, colorHex, 14, 3.2, 16, 4);
  spawnVFXParticles(tx, ty, colorHex, 24, 6.5);

  let life = 0;
  const tick = () => {
    life++;
    g.alpha = 1 - life / 16;
    if (life >= 16) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(g);
      g.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnSlashArcVFX(tx, ty, colorHex = 0xef4444, scale = 1.15, doubleSlash = false) {
  if (!pixiApp || !vfxContainer) return;

  const drawOneSlash = (angleRad, delayFrames) => {
    setTimeout(() => {
      if (!pixiApp || !vfxContainer) return;
      const slash = new PIXI.Graphics();
      slash.blendMode = PIXI.BLEND_MODES.ADD;
      slash.x = tx;
      slash.y = ty;
      slash.rotation = angleRad;
      slash.scale.set(scale);

      // Crescent blade arc
      slash.beginFill(colorHex, 0.45);
      slash.moveTo(-48, -36);
      slash.quadraticCurveTo(26, 0, -48, 36);
      slash.quadraticCurveTo(8, 0, -48, -36);
      slash.endFill();

      slash.beginFill(0xffffff, 0.95);
      slash.moveTo(-36, -28);
      slash.quadraticCurveTo(22, 0, -36, 28);
      slash.quadraticCurveTo(6, 0, -36, -28);
      slash.endFill();

      vfxContainer.addChild(slash);
      spawnImpactBurst(tx, ty, colorHex, 32 * scale);
      spawnShockwaveRing(tx, ty, colorHex, 14, 3.0 * scale, 15, 4);
      spawnVFXParticles(tx, ty, colorHex, 22, 7);

      let life = 0;
      const maxLife = 14;
      const tick = () => {
        life++;
        const t = life / maxLife;
        slash.x += Math.cos(angleRad) * 2.5;
        slash.y += Math.sin(angleRad) * 2.5;
        slash.alpha = 1 - t;
        slash.scale.set(scale * (1 + t * 0.25));
        if (life >= maxLife) {
          pixiApp.ticker.remove(tick);
          vfxContainer.removeChild(slash);
          slash.destroy();
        }
      };
      pixiApp.ticker.add(tick);
    }, delayFrames * 16);
  };

  drawOneSlash(-0.45, 0);
  if (doubleSlash) {
    drawOneSlash(0.55, 5);
  }
}

function spawnChronoRiftVFX(sx, sy, tx, ty) {
  if (!pixiApp || !vfxContainer) return;

  // Spinning clockwork dial at target
  const dial = new PIXI.Graphics();
  dial.blendMode = PIXI.BLEND_MODES.ADD;
  dial.lineStyle(3.5, 0x2dd4bf, 0.95);
  dial.drawCircle(0, 0, 44);
  dial.lineStyle(2, 0x99f6e4, 0.8);
  dial.drawCircle(0, 0, 30);
  // Clock hands & ticks
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;
    dial.moveTo(Math.cos(a) * 36, Math.sin(a) * 36);
    dial.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
  }
  dial.lineStyle(3, 0xffffff, 1);
  dial.moveTo(0, 0);
  dial.lineTo(0, -28);
  dial.moveTo(0, 0);
  dial.lineTo(20, 10);
  dial.x = tx;
  dial.y = ty;
  vfxContainer.addChild(dial);

  spawnSlashArcVFX(tx, ty, 0x2dd4bf, 1.2, true);
  spawnShockwaveRing(sx, sy, 0x2dd4bf, 14, 2.6, 16, 3);
  spawnVFXParticles(tx, ty, 0x2dd4bf, 28, 7);

  let life = 0;
  const maxLife = 22;
  const tick = () => {
    life++;
    dial.rotation += 0.16;
    dial.scale.set(1 + (life / maxLife) * 0.35);
    dial.alpha = 1 - life / maxLife;
    if (life >= maxLife) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(dial);
      dial.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnBloodSiphonVFX(sx, sy, tx, ty, heavy = false) {
  if (!pixiApp || !vfxContainer) return;
  spawnSlashArcVFX(tx, ty, 0xe11d48, heavy ? 1.45 : 1.15, heavy);
  spawnVFXParticles(tx, ty, 0xbe123c, heavy ? 32 : 22, 7.5);

  // Lifesteal blood orbs curving from enemy back to player
  const orbCount = heavy ? 12 : 7;
  for (let i = 0; i < orbCount; i++) {
    const orb = new PIXI.Graphics();
    orb.blendMode = PIXI.BLEND_MODES.ADD;
    orb.beginFill(0xe11d48, 0.85);
    orb.drawCircle(0, 0, 6.5);
    orb.beginFill(0xfda4af, 1);
    orb.drawCircle(0, 0, 3);
    orb.endFill();
    orb.x = tx + (Math.random() - 0.5) * 30;
    orb.y = ty + (Math.random() - 0.5) * 30;
    vfxContainer.addChild(orb);

    const curveOffset = (Math.random() - 0.5) * 130;
    const delay = i * 2;
    let life = -delay;
    const travel = 20;

    const tick = () => {
      life++;
      if (life < 0) return;
      const t = Math.min(1, life / travel);
      const ease = t * t;
      const midX = (tx + sx) * 0.5;
      const midY = (ty + sy) * 0.5 + curveOffset;
      const inv = 1 - ease;
      orb.x = inv * inv * tx + 2 * inv * ease * midX + ease * ease * sx;
      orb.y = inv * inv * ty + 2 * inv * ease * midY + ease * ease * sy;
      orb.scale.set(1.15 - t * 0.35);

      if (life >= travel) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(orb);
        orb.destroy();
        if (i === 0) {
          spawnImpactBurst(sx, sy, 0xfb7185, 28);
          spawnShockwaveRing(sx, sy, 0xe11d48, 12, 2.5, 14, 3);
        }
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnToxicVolleyVFX(sx, sy, tx, ty) {
  if (!pixiApp || !vfxContainer) return;
  const needles = 6;
  for (let i = 0; i < needles; i++) {
    setTimeout(() => {
      if (!pixiApp || !vfxContainer) return;
      const dart = new PIXI.Graphics();
      dart.blendMode = PIXI.BLEND_MODES.ADD;
      dart.beginFill(0x22c55e, 0.85);
      dart.drawPolygon([16, 0, -12, -5, -8, 0, -12, 5]);
      dart.beginFill(0xbbf7d0, 1);
      dart.drawPolygon([12, 0, -6, -2, -6, 2]);
      dart.endFill();

      const startY = sy + (Math.random() - 0.5) * 28;
      const endY = ty + (Math.random() - 0.5) * 26;
      dart.x = sx + 15;
      dart.y = startY;
      dart.rotation = Math.atan2(endY - startY, tx - sx);
      vfxContainer.addChild(dart);

      let life = 0;
      const maxLife = 10;
      const tick = () => {
        life++;
        const t = life / maxLife;
        dart.x = sx + 15 + (tx - sx - 15) * t;
        dart.y = startY + (endY - startY) * t;
        if (life >= maxLife) {
          pixiApp.ticker.remove(tick);
          vfxContainer.removeChild(dart);
          dart.destroy();
          if (i === needles - 1) {
            spawnImpactBurst(tx, ty, 0x22c55e, 38);
            spawnShockwaveRing(tx, ty, 0x4ade80, 14, 3.0, 16, 3.5);
            spawnPoisonBubbles(tx, ty);
            spawnPoisonBubbles(tx, ty);
            spawnVFXParticles(tx, ty, 0x22c55e, 26, 6);
          }
        }
      };
      pixiApp.ticker.add(tick);
    }, i * 35);
  }
}

function spawnScrapCannonVFX(sx, sy, tx, ty) {
  if (!pixiApp || !vfxContainer) return;
  spawnImpactBurst(sx + 22, sy, 0xf59e0b, 26);

  for (let i = 0; i < 4; i++) {
    const bolt = new PIXI.Graphics();
    bolt.blendMode = PIXI.BLEND_MODES.ADD;
    bolt.lineStyle(3, 0xfef08a, 1);
    bolt.beginFill(0xf59e0b, 0.95);
    bolt.drawPolygon([0, -9, 8, -4, 8, 4, 0, 9, -8, 4, -8, -4]);
    bolt.endFill();

    const startY = sy + (i - 1.5) * 14;
    const endY = ty + (Math.random() - 0.5) * 24;
    bolt.x = sx + 20;
    bolt.y = startY;
    vfxContainer.addChild(bolt);

    let life = 0;
    const maxLife = 12;
    const tick = () => {
      life++;
      const t = life / maxLife;
      bolt.x = sx + 20 + (tx - sx - 20) * t;
      bolt.y = startY + (endY - startY) * t;
      bolt.rotation += 0.45;
      if (life >= maxLife) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(bolt);
        bolt.destroy();
        if (i === 0) {
          spawnImpactBurst(tx, ty, 0xf59e0b, 42);
          spawnShockwaveRing(tx, ty, 0xfacc15, 14, 3.4, 18, 4.5);
          spawnVFXParticles(tx, ty, 0xf59e0b, 28, 7.5);
          spawnVFXParticles(tx, ty, 0xfef08a, 16, 6);
        }
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnShieldHexVFX(cx, cy, colorHex = 0x38bdf8) {
  if (!pixiApp || !vfxContainer) return;
  const hex = new PIXI.Graphics();
  hex.blendMode = PIXI.BLEND_MODES.ADD;
  hex.lineStyle(4, colorHex, 0.95);
  hex.beginFill(colorHex, 0.22);
  const r = 46;
  hex.drawPolygon([0, -r, r * 0.86, -r * 0.5, r * 0.86, r * 0.5, 0, r, -r * 0.86, r * 0.5, -r * 0.86, -r * 0.5]);
  hex.endFill();
  hex.x = cx;
  hex.y = cy;
  vfxContainer.addChild(hex);

  spawnShockwaveRing(cx, cy, colorHex, 24, 2.5, 18, 4);
  spawnVFXParticles(cx, cy, colorHex, 22, 5);

  let life = 0;
  const maxLife = 20;
  const tick = () => {
    life++;
    const t = life / maxLife;
    hex.scale.set(0.85 + t * 0.55);
    hex.alpha = 1 - t;
    if (life >= maxLife) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(hex);
      hex.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnHealAuraVFX(cx, cy, colorHex = 0x4ade80) {
  if (!pixiApp || !vfxContainer) return;
  spawnShockwaveRing(cx, cy, colorHex, 18, 2.7, 20, 4);

  for (let i = 0; i < 14; i++) {
    const plus = new PIXI.Graphics();
    plus.blendMode = PIXI.BLEND_MODES.ADD;
    plus.beginFill(colorHex, 0.95);
    plus.drawRect(-2, -7, 4, 14);
    plus.drawRect(-7, -2, 14, 4);
    plus.endFill();
    plus.x = cx + (Math.random() - 0.5) * 64;
    plus.y = cy + 22 + Math.random() * 18;
    vfxContainer.addChild(plus);

    let life = 0;
    const maxLife = 24 + Math.floor(Math.random() * 10);
    const vy = 1.6 + Math.random() * 1.4;
    const tick = () => {
      life++;
      plus.y -= vy;
      plus.alpha = 1 - life / maxLife;
      plus.scale.set(0.8 + Math.sin((life / maxLife) * Math.PI) * 0.45);
      if (life >= maxLife) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(plus);
        plus.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnAstralSingularityVFX(tx, ty) {
  if (!pixiApp || !vfxContainer) return;
  const core = new PIXI.Graphics();
  core.beginFill(0x09090b, 0.95);
  core.lineStyle(4, 0xc084fc, 0.95);
  core.drawCircle(0, 0, 36);
  core.endFill();
  core.x = tx;
  core.y = ty;
  vfxContainer.addChild(core);

  spawnShockwaveRing(tx, ty, 0xc084fc, 64, 0.25, 14, 5);
  spawnShockwaveRing(tx, ty, 0x38bdf8, 16, 4.5, 24, 5);
  spawnVFXParticles(tx, ty, 0xc084fc, 38, 8.5);
  spawnVFXParticles(tx, ty, 0x38bdf8, 28, 7);

  let life = 0;
  const maxLife = 22;
  const tick = () => {
    life++;
    const t = life / maxLife;
    core.scale.set(t < 0.5 ? 1 - t * 0.8 : 0.6 + (t - 0.5) * 3.2);
    core.alpha = 1 - t;
    if (life >= maxLife) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(core);
      core.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

// --- CONSTRUCT & PROJECTILE VFX ---
function spawnRailgunBeamVFX(sx, sy, tx, ty) {
  if (!pixiApp || !vfxContainer) return;
  const g = new PIXI.Graphics();
  g.blendMode = PIXI.BLEND_MODES.ADD;
  g.lineStyle(22, 0x0284c7, 0.3);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);
  g.lineStyle(10, 0x38bdf8, 0.65);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);
  g.lineStyle(4, 0xffffff, 1);
  g.moveTo(sx, sy);
  g.lineTo(tx, ty);
  vfxContainer.addChild(g);

  spawnImpactBurst(sx, sy, 0x38bdf8, 22);
  spawnImpactBurst(tx, ty, 0x38bdf8, 42);
  spawnShockwaveRing(tx, ty, 0x38bdf8, 14, 3.6, 18, 4.5);
  spawnVFXParticles(tx, ty, 0x38bdf8, 24, 7);
  triggerShake(8, 6);

  let life = 0;
  const tick = () => {
    life++;
    g.alpha = 1 - life / 16;
    if (life >= 16) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(g);
      g.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

function spawnFlameJetVFX(sx, sy, tx, ty) {
  if (!pixiApp || !vfxContainer) return;
  const colors = [0xfef08a, 0xf97316, 0xef4444, 0xfb923c];
  for (let i = 0; i < 34; i++) {
    const p = new PIXI.Graphics();
    p.blendMode = PIXI.BLEND_MODES.ADD;
    const progress = 0.15 + Math.random() * 0.9;
    const col = progress < 0.35 ? 0xfef08a : colors[i % colors.length];
    p.beginFill(col, 0.85);
    p.drawCircle(0, 0, 5 + Math.random() * 7);
    p.endFill();
    p.x = sx + (Math.random() - 0.5) * 12;
    p.y = sy + (Math.random() - 0.5) * 12;
    const spread = 16 + progress * 36;
    const destX = sx + (tx - sx) * progress + (Math.random() - 0.5) * spread;
    const destY = sy + (ty - sy) * progress + (Math.random() - 0.5) * spread;
    vfxContainer.addChild(p);

    let life = 0;
    const maxLife = 18 + Math.floor(Math.random() * 8);
    const tick = () => {
      life++;
      p.x += (destX - p.x) * 0.24;
      p.y += (destY - p.y) * 0.24 - 0.4;
      p.alpha = 1 - life / maxLife;
      p.scale.set(1 + life * 0.065);
      if (life >= maxLife) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
  spawnImpactBurst(tx, ty, 0xf97316, 32);
}

function spawnChainLightningVFX(sx, sy, tx, ty, colorHex = 0x818cf8) {
  if (!pixiApp || !vfxContainer) return;
  const g = new PIXI.Graphics();
  g.blendMode = PIXI.BLEND_MODES.ADD;

  // Dual jagged electric arcs + wide glow
  for (let strand = 0; strand < 2; strand++) {
    const pts = [{ x: sx, y: sy }];
    const segs = 8;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const jitter = strand === 0 ? 34 : 22;
      pts.push({
        x: sx + (tx - sx) * t + (Math.random() - 0.5) * jitter,
        y: sy + (ty - sy) * t + (Math.random() - 0.5) * jitter
      });
    }
    pts.push({ x: tx, y: ty });

    g.lineStyle(strand === 0 ? 10 : 6, colorHex, 0.45);
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);

    g.lineStyle(strand === 0 ? 3 : 2, 0xffffff, 0.98);
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  }
  vfxContainer.addChild(g);

  spawnImpactBurst(tx, ty, colorHex, 34);
  spawnShockwaveRing(tx, ty, colorHex, 12, 3.0, 15, 3.5);
  spawnVFXParticles(tx, ty, colorHex, 20, 6.5);

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

function spawnBarrierPulseVFX(cx, cy) {
  spawnShieldHexVFX(cx, cy, 0x22d3ee);
}

function spawnMechSalvoVFX(sx, sy, tx, ty) {
  spawnGunfireTracer(sx, sy - 10, tx, ty - 8, 0xeab308);
  spawnGunfireTracer(sx, sy + 10, tx, ty + 8, 0xef4444);
  spawnImpactBurst(tx, ty, 0xf97316, 36);
  spawnShockwaveRing(tx, ty, 0xeab308, 14, 3.1, 16, 4);
  spawnVFXParticles(tx, ty, 0xf97316, 22, 6.5);
}

function spawnGunfireTracer(sx, sy, tx, ty, colorHex = 0xfef08a) {
  if (!pixiApp || !vfxContainer) return;
  const endX = tx + (Math.random() - 0.5) * 20;
  const endY = ty + (Math.random() - 0.5) * 20;

  const tracer = new PIXI.Graphics();
  tracer.blendMode = PIXI.BLEND_MODES.ADD;
  tracer.lineStyle(8, colorHex, 0.35);
  tracer.moveTo(sx, sy);
  tracer.lineTo(endX, endY);
  tracer.lineStyle(3.5, 0xffffff, 0.98);
  tracer.moveTo(sx, sy);
  tracer.lineTo(endX, endY);
  vfxContainer.addChild(tracer);

  const flash = new PIXI.Graphics();
  flash.blendMode = PIXI.BLEND_MODES.ADD;
  flash.beginFill(0xfde047, 0.95);
  flash.drawCircle(sx + 12, sy, 13);
  flash.beginFill(0xffffff, 1);
  flash.drawCircle(sx + 12, sy, 6);
  flash.endFill();
  vfxContainer.addChild(flash);

  spawnImpactBurst(endX, endY, colorHex, 20);
  spawnVFXParticles(endX, endY, colorHex, 8, 5);

  let life = 0;
  const tick = () => {
    life++;
    tracer.alpha = 1 - life / 9;
    flash.alpha = 1 - life / 6;
    if (life >= 9) {
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
  if (!pixiApp || !vfxContainer) return;
  for (let i = 0; i < count; i++) {
    const casing = new PIXI.Graphics();
    casing.beginFill(0xfacc15, 1);
    casing.lineStyle(1, 0xfef08a, 0.9);
    casing.drawRect(-3.5, -1.8, 7, 3.6);
    casing.endFill();
    casing.x = x + (Math.random() - 0.5) * 14;
    casing.y = y - 12;
    vfxContainer.addChild(casing);

    let vx = -2.0 - Math.random() * 3.0;
    let vy = -4.2 - Math.random() * 3.0;
    let vRot = (Math.random() - 0.5) * 0.45;
    let life = 0;

    const tick = () => {
      life++;
      vy += 0.3;
      casing.x += vx;
      casing.y += vy;
      casing.rotation += vRot;
      casing.alpha = 1 - life / 30;
      if (life >= 30) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(casing);
        casing.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnCashParticles(x, y, count = 14, isGold = false) {
  if (!pixiApp || !vfxContainer) return;
  for (let i = 0; i < count; i++) {
    const p = new PIXI.Graphics();
    if (isGold) {
      p.beginFill(0xfacc15, 1);
      p.lineStyle(1.5, 0xfef08a, 1);
      p.drawCircle(0, 0, 6.5);
      p.endFill();
    } else {
      p.beginFill(0x22c55e, 0.95);
      p.lineStyle(1.5, 0xbbf7d0, 0.9);
      p.drawRect(-8, -4.5, 16, 9);
      p.endFill();
    }
    p.x = x + (Math.random() - 0.5) * 26;
    p.y = y + (Math.random() - 0.5) * 24;
    vfxContainer.addChild(p);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.0;
    const speed = 2.8 + Math.random() * 4.5;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let vRot = (Math.random() - 0.5) * 0.25;
    let life = 0;

    const tick = () => {
      life++;
      vy += 0.15;
      p.x += vx;
      p.y += vy;
      p.rotation += vRot;
      p.alpha = 1 - life / 38;
      if (life >= 38) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnBlackFlashVFX(x, y, isTier3 = false) {
  if (!pixiApp || !vfxContainer) return;
  const flashG = new PIXI.Graphics();

  const coreRadius = isTier3 ? 64 : 44;
  flashG.beginFill(0x050508, 0.96);
  flashG.drawCircle(x, y, coreRadius);
  flashG.endFill();

  flashG.lineStyle(isTier3 ? 8 : 5, 0xdc2626, 0.95);
  flashG.drawCircle(x, y, coreRadius + 8);

  const bolts = isTier3 ? 14 : 9;
  for (let i = 0; i < bolts; i++) {
    const angle = (Math.PI * 2 * i) / bolts + (Math.random() - 0.5) * 0.4;
    const len = (isTier3 ? 120 : 80) + Math.random() * 30;
    const midX = x + Math.cos(angle + 0.22) * (len * 0.5);
    const midY = y + Math.sin(angle + 0.22) * (len * 0.5);
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;

    flashG.lineStyle(isTier3 ? 7 : 5, 0x09090b, 1);
    flashG.moveTo(x, y);
    flashG.lineTo(midX, midY);
    flashG.lineTo(endX, endY);

    flashG.lineStyle(isTier3 ? 3.5 : 2, 0xef4444, 1);
    flashG.moveTo(x, y);
    flashG.lineTo(midX, midY);
    flashG.lineTo(endX, endY);
  }

  vfxContainer.addChild(flashG);
  spawnShockwaveRing(x, y, 0xdc2626, coreRadius, isTier3 ? 3.2 : 2.6, 22, 6);
  spawnVFXParticles(x, y, 0xdc2626, isTier3 ? 36 : 22, isTier3 ? 8.5 : 6.5);
  spawnVFXParticles(x, y, 0x09090b, isTier3 ? 26 : 16, isTier3 ? 7 : 5.5);

  let life = 0;
  const maxLife = isTier3 ? 26 : 18;
  const tick = () => {
    life++;
    flashG.alpha = 1 - (life / maxLife);
    flashG.scale.set(1 + life * 0.018);
    if (life >= maxLife) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(flashG);
      flashG.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}

// --- MASTER CARD & ABILITY VFX ROUTER ---
function playCardVFX(cardId, targetEnemy) {
  if (!pixiApp || !playerContainer) return;
  const px = playerContainer.x;
  const py = playerContainer.y;
  const tx = targetEnemy && targetEnemy.container ? targetEnemy.container.x : px + 340;
  const ty = targetEnemy && targetEnemy.container ? targetEnemy.container.y : py;

  if (['tommy_gun_spray', 'drive_by_ambush', 'tommy_drum_extortion', 'chicago_typewriter', 'syndicate_hit_squad'].includes(cardId)) {
    const shots = cardId === 'tommy_drum_extortion' ? 6 : (cardId === 'chicago_typewriter' ? 5 : 4);
    animateUnitLunge(16);
    for (let s = 0; s < shots; s++) {
      setTimeout(() => {
        spawnGunfireTracer(px + 20, py - 4, tx, ty, 0xfef08a);
        spawnShellCasings(px + 10, py, 2);
      }, s * 50);
    }
    triggerShake(11, 7);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xfef08a);
      animateEnemyRecoil(targetEnemy, 18);
    }
  } else if (['protection_racket', 'money_laundering', 'syndicate_ledger', 'black_market_voucher', 'offers_you_cant_refuse'].includes(cardId)) {
    spawnCashParticles(px, py - 20, 18, false);
    spawnShockwaveRing(px, py, 0x22c55e, 16, 2.6, 18, 3.5);
    if (cardId === 'protection_racket' || cardId === 'money_laundering' || cardId === 'offers_you_cant_refuse') {
      spawnShieldHexVFX(px, py, 0x38bdf8);
    }
  } else if (['kingpins_ultimatum', 'golden_peacemaker', 'royal_flush'].includes(cardId)) {
    animateUnitLunge(24);
    spawnGunfireTracer(px + 20, py, tx, ty, 0xfacc15);
    spawnImpactBurst(tx, ty, 0xfacc15, 44);
    spawnShockwaveRing(tx, ty, 0xfacc15, 16, 3.6, 20, 5);
    spawnCashParticles(tx, ty, 24, true);
    spawnCashParticles(px, py - 20, 16, false);
    triggerShake(14, 10);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xfacc15);
      animateEnemyRecoil(targetEnemy, 26);
    }
  } else if (['hired_goon_contract', 'mercenary_contract', 'armored_limousine'].includes(cardId)) {
    spawnShieldHexVFX(px + 48, py, 0xeab308);
    spawnVFXParticles(px + 48, py, 0xeab308, 24, 5.5);
    spawnCashParticles(px + 48, py - 16, 10, true);
  } else if (['tesla_arc_pylon', 'arc_tesla_coil'].includes(cardId)) {
    spawnChainLightningVFX(px + 30, py - 10, tx, ty, 0x38bdf8);
    triggerShake(10, 6);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0x38bdf8);
      animateEnemyRecoil(targetEnemy, 16);
    }
  } else if (['astral_cataclysm', 'astral_singularity'].includes(cardId)) {
    spawnAstralSingularityVFX(tx, ty);
    triggerShake(16, 11);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xc084fc);
      animateEnemyRecoil(targetEnemy, 28);
    }
  } else if (cardId === 'titans_cleave') {
    animateUnitLunge(42);
    spawnSlashArcVFX(tx, ty, 0x38bdf8, 1.45, true);
    spawnShockwaveRing(tx, ty, 0xef4444, 18, 3.8, 20, 5);
    triggerShake(14, 9);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0x38bdf8);
      animateEnemyRecoil(targetEnemy, 28);
    }
  } else if (cardId === 'shadow_step_mirage') {
    animateUnitLunge(36);
    spawnShieldHexVFX(px, py, 0x4ade80);
    spawnVFXParticles(px, py, 0x4ade80, 26, 6);
    spawnVFXParticles(px, py, 0x38bdf8, 18, 5);
  } else if (cardId === 'temporal_paradox') {
    spawnChronoRiftVFX(px, py, px, py);
    spawnVFXParticles(px, py, 0x2dd4bf, 30, 6.5);
  } else if (cardId === 'sanguine_eclipse') {
    animateUnitLunge(30);
    spawnBloodSiphonVFX(px, py, tx, ty, true);
    triggerShake(14, 9);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xe11d48);
      animateEnemyRecoil(targetEnemy, 24);
    }
  } else if (cardId === 'astral_compass') {
    spawnShockwaveRing(px, py, 0x38bdf8, 16, 3.0, 20, 4);
    spawnVFXParticles(px, py, 0x38bdf8, 24, 5.5);
    spawnCashParticles(px, py - 24, 14, true);
  } else if (['fireball', 'mana_overload'].includes(cardId)) {
    animateUnitLunge(20);
    spawnFireballVFX(px + 20, py, tx, ty, cardId === 'mana_overload');
    triggerShake(13, 9);
    if (targetEnemy) {
      setTimeout(() => {
        flashEntity(targetEnemy.sprite, 0xf97316);
        animateEnemyRecoil(targetEnemy, 24);
      }, 210);
    }
  } else if (['arcane_strike', 'spark', 'volatile_reserve', 'overcharge_conduit', 'spellweaver_prism'].includes(cardId)) {
    animateUnitLunge(18);
    spawnArcaneBeamVFX(px + 20, py, tx, ty, 0xc084fc);
    triggerShake(9, 6);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xc084fc);
      animateEnemyRecoil(targetEnemy, 18);
    }
  } else if (['chrono_slash', 'rift_strike', 'stasis_surge', 'entropy_bolt', 'stasis_condenser', 'temporal_fracture'].includes(cardId)) {
    animateUnitLunge(32);
    spawnChronoRiftVFX(px, py, tx, ty);
    triggerShake(10, 6);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0x2dd4bf);
      animateEnemyRecoil(targetEnemy, 20);
    }
  } else if (['wrench_toss', 'capacitor_discharge', 'thermite_rivets', 'scrap_cannon', 'scrap_salvage', 'overload_capacitor'].includes(cardId)) {
    animateUnitLunge(20);
    if (cardId === 'capacitor_discharge' || cardId === 'overload_capacitor') {
      spawnChainLightningVFX(px + 20, py, tx, ty, 0xf59e0b);
    } else {
      spawnScrapCannonVFX(px, py, tx, ty);
    }
    triggerShake(10, 7);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xf59e0b);
      animateEnemyRecoil(targetEnemy, 20);
    }
  } else if (['siphon_slash', 'serrated_cleave', 'blood_boil', 'blood_suck', 'flurry_of_fangs', 'hemorrhagic_rupture', 'crimson_frenzy'].includes(cardId)) {
    animateUnitLunge(34);
    const isHeavyBlood = ['hemorrhagic_rupture', 'crimson_frenzy', 'flurry_of_fangs'].includes(cardId);
    spawnBloodSiphonVFX(px, py, tx, ty, isHeavyBlood);
    triggerShake(11, 7);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xe11d48);
      animateEnemyRecoil(targetEnemy, 22);
    }
  } else if (['heavy_slash', 'shield_slam', 'patience_fury', 'battering_rampart', 'cleaving_execution'].includes(cardId)) {
    animateUnitLunge(40);
    const isMega = ['cleaving_execution', 'patience_fury'].includes(cardId);
    spawnSlashArcVFX(tx, ty, 0xef4444, isMega ? 1.4 : 1.15, isMega);
    triggerShake(12, 8);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0xef4444);
      animateEnemyRecoil(targetEnemy, 25);
    }
  } else if (['toxic_needle', 'venom_spreader', 'venom_surge', 'catalytic_rupture', 'vial_stash', 'shadow_prep', 'phantom_ambush'].includes(cardId)) {
    animateUnitLunge(26);
    spawnToxicVolleyVFX(px, py, tx, ty);
    triggerShake(8, 5);
    if (targetEnemy) {
      flashEntity(targetEnemy.sprite, 0x22c55e);
      animateEnemyRecoil(targetEnemy, 16);
    }
  } else if (['barrier', 'iron_defense', 'fortify', 'smoke_screen', 'bastion_scrap', 'juggernaut_stance', 'shadow_step', 'stasis_bubble', 'reinforced_plating', 'weld_and_patch', 'reactive_armor', 'deja_vu', 'chrono_rewind', 'unbreakable_phalanx', 'smokebomb_barrage', 'velvet_kevlar'].includes(cardId)) {
    const isSmoke = ['smoke_screen', 'smokebomb_barrage', 'shadow_step'].includes(cardId);
    spawnShieldHexVFX(px, py, isSmoke ? 0x94a3b8 : 0x38bdf8);
  } else if (['restoration', 'coagulate', 'sanguine_ward', 'bootleg_tonic', 'adrenaline_syringe'].includes(cardId)) {
    spawnHealAuraVFX(px, py, cardId === 'sanguine_ward' || cardId === 'coagulate' ? 0xfb7185 : 0x4ade80);
  } else if (targetEnemy && targetEnemy.container) {
    animateUnitLunge(24);
    spawnArcaneBeamVFX(px + 20, py, tx, ty, 0xfacc15);
    flashEntity(targetEnemy.sprite, 0xfacc15);
    animateEnemyRecoil(targetEnemy, 16);
  } else {
    spawnShockwaveRing(px, py, 0xfacc15, 16, 2.8, 18, 4);
    spawnVFXParticles(px, py, 0xfacc15, 22, 5.5);
  }
}

function spawnPoisonBubbles(x, y) {
  if (!pixiApp || !vfxContainer) return;
  for (let i = 0; i < 12; i++) {
    const p = new PIXI.Graphics();
    p.blendMode = PIXI.BLEND_MODES.ADD;
    const r = 4.5 + Math.random() * 5.5;
    p.lineStyle(2, 0xbbf7d0, 0.95);
    p.beginFill(0x22c55e, 0.72);
    p.drawCircle(0, 0, r);
    p.endFill();
    p.beginFill(0xffffff, 0.85);
    p.drawCircle(-r * 0.3, -r * 0.3, r * 0.25);
    p.endFill();
    p.x = x + (Math.random() - 0.5) * 48;
    p.y = y + (Math.random() - 0.5) * 32;
    vfxContainer.addChild(p);

    let life = 0;
    const maxLife = 32 + Math.floor(Math.random() * 10);
    const tick = () => {
      life++;
      p.y -= 1.45;
      p.x += Math.sin(life * 0.2 + i) * 0.45;
      p.alpha = 1 - (life / maxLife);
      p.scale.set(1 + (life / maxLife) * 0.35);
      if (life >= maxLife) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnVFXParticles(x, y, colorHex, count = 22, speedMult = 5.5) {
  if (!pixiApp || !vfxContainer) return;
  const total = Math.max(count, 18);
  for (let i = 0; i < total; i++) {
    const p = new PIXI.Graphics();
    p.blendMode = PIXI.BLEND_MODES.ADD;
    const isStreak = i % 2 === 0;
    const size = 4 + Math.random() * 5.5;

    if (isStreak) {
      p.beginFill(colorHex, 0.9);
      p.drawEllipse(0, 0, size * 1.9, size * 0.55);
      p.beginFill(0xffffff, 0.95);
      p.drawEllipse(0, 0, size * 0.9, size * 0.25);
      p.endFill();
    } else {
      p.beginFill(colorHex, 0.85);
      p.drawCircle(0, 0, size);
      p.beginFill(0xffffff, 0.9);
      p.drawCircle(0, 0, size * 0.42);
      p.endFill();
    }

    p.x = x;
    p.y = y;
    vfxContainer.addChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = (2.2 + Math.random() * 3.4) * (speedMult / 4.5);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    p.rotation = angle;
    let life = 0;
    const maxLife = 24 + Math.floor(Math.random() * 8);

    const tick = () => {
      life++;
      p.x += vx * (1 - life / (maxLife * 1.6));
      p.y += vy * (1 - life / (maxLife * 1.6));
      p.alpha = 1 - (life / maxLife);
      p.scale.set(1.15 - (life / (maxLife * 1.15)));
      if (life >= maxLife) {
        pixiApp.ticker.remove(tick);
        vfxContainer.removeChild(p);
        p.destroy();
      }
    };
    pixiApp.ticker.add(tick);
  }
}

function spawnFloatingText(text, x, y, colorStr = '#ffffff') {
  if (!pixiApp || !vfxContainer) return;
  const style = new PIXI.TextStyle({
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    fill: colorStr,
    stroke: '#000000',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowDistance: 3
  });
  const txt = new PIXI.Text(text, style);
  txt.anchor.set(0.5);
  txt.x = x + (Math.random() - 0.5) * 22;
  txt.y = y - 20;
  txt.scale.set(1.38);
  vfxContainer.addChild(txt);

  let life = 0;
  const tick = () => {
    life++;
    txt.y -= 1.35;
    if (life <= 8) {
      txt.scale.set(1.38 - (life / 8) * 0.38);
    }
    txt.alpha = life > 26 ? 1 - ((life - 26) / 14) : 1;
    if (life >= 40) {
      pixiApp.ticker.remove(tick);
      vfxContainer.removeChild(txt);
      txt.destroy();
    }
  };
  pixiApp.ticker.add(tick);
}
