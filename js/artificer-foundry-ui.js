// --- TOGGLEABLE CYBER-GEOMETRIC VECTOR THEME (v0.8.5) ---
(function () {
  const STORAGE_KEY = 'col_cyber_geo_theme';
  let isGeoEnabled = localStorage.getItem(STORAGE_KEY) !== 'false';

  let geoBgLayer = null;
  let geoStreamLayer = null;
  let lastBgW = 0;
  let lastBgH = 0;
  let lastHeroClass = '';

  const bgShards = [];
  const streamParticles = [];
  let hoveredCardEl = null;

  // =========================================================================
  // 1. SCOPED CSS OVERRIDES (ONLY ACTIVE WHEN body.theme-cyber-geo IS SET)
  // =========================================================================
  if (!document.getElementById('cyber-geo-theme-css')) {
    const style = document.createElement('style');
    style.id = 'cyber-geo-theme-css';
    style.textContent = `
      .btn-geo-toggle {
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.55);
        color: #7dd3fc;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.15s ease;
        z-index: 30;
      }
      .btn-geo-toggle:hover {
        border-color: #38bdf8;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.45);
      }
      .btn-geo-toggle.active {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.28), rgba(14, 116, 144, 0.42));
        border-color: #22d3ee;
        color: #ecfeff;
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.4);
      }
      .geo-floating-toggle {
        position: fixed;
        top: 10px;
        right: 12px;
        z-index: 95;
      }
      #screen-battle.active ~ .geo-floating-toggle,
      body.in-battle-screen .geo-floating-toggle {
        display: none;
      }

      body.theme-cyber-geo {
        background-color: #05070c !important;
        color: #f8fafc;
      }
      body.theme-cyber-geo #screen-battle.screen.active {
        background: radial-gradient(circle at 55% 15%, #161b26 0%, #05070c 68%) !important;
      }
      body.theme-cyber-geo .battle-hud-top,
      body.theme-cyber-geo .board-hud-top {
        background: rgba(7, 10, 17, 0.88) !important;
        border: 1px solid rgba(148, 163, 184, 0.25) !important;
        border-radius: 4px !important;
        backdrop-filter: blur(6px);
      }
      body.theme-cyber-geo .battle-stage-wrapper {
        border: 1px solid rgba(148, 163, 184, 0.28) !important;
        border-radius: 4px !important;
        background: #05070c !important;
        box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.85);
      }
      body.theme-cyber-geo .sequence-vault-row {
        background: rgba(8, 11, 18, 0.85) !important;
        border: 1px solid rgba(148, 163, 184, 0.22) !important;
        border-radius: 4px !important;
        padding: 4px 8px;
      }
      body.theme-cyber-geo .sequence-slot,
      body.theme-cyber-geo .vault-slot {
        background: rgba(13, 18, 28, 0.92) !important;
        border: 1px solid rgba(100, 116, 139, 0.45) !important;
        border-radius: 3px !important;
      }
      body.theme-cyber-geo .sequence-slot.active,
      body.theme-cyber-geo .sequence-slot.executing {
        border-color: #22d3ee !important;
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.5) !important;
      }
      body.theme-cyber-geo .hand-card {
        background: linear-gradient(180deg, #111622 0%, #070a10 100%) !important;
        border: 1.5px solid rgba(148, 163, 184, 0.45) !important;
        border-radius: 4px !important;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.75) !important;
        transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.16s ease, box-shadow 0.16s ease !important;
      }
      body.theme-cyber-geo .hand-card[data-type*="Attack"],
      body.theme-cyber-geo .hand-card.type-attack {
        border-color: rgba(244, 63, 94, 0.65) !important;
      }
      body.theme-cyber-geo .hand-card[data-type*="Defend"],
      body.theme-cyber-geo .hand-card[data-type*="Skill"],
      body.theme-cyber-geo .hand-card.type-defend {
        border-color: rgba(56, 189, 248, 0.65) !important;
      }
      body.theme-cyber-geo .hand-card[data-type*="Power"],
      body.theme-cyber-geo .hand-card[data-type*="Construct"],
      body.theme-cyber-geo .hand-card.type-power {
        border-color: rgba(245, 158, 11, 0.65) !important;
      }
      body.theme-cyber-geo .hand-card:hover {
        transform: translateY(-14px) scale(1.04) !important;
        border-color: #22d3ee !important;
        box-shadow: 0 0 22px rgba(34, 211, 238, 0.55), inset 0 0 14px rgba(34, 211, 238, 0.22) !important;
        z-index: 20;
      }
      body.theme-cyber-geo #btn-execute-sequence,
      body.theme-cyber-geo #btn-end-turn,
      body.theme-cyber-geo .btn-execute {
        background: linear-gradient(135deg, #f97316, #dc2626) !important;
        border: 1.5px solid #fdba74 !important;
        border-radius: 4px !important;
        color: #ffffff !important;
        font-weight: 900 !important;
        letter-spacing: 0.05em;
        box-shadow: 0 0 18px rgba(234, 88, 12, 0.55) !important;
      }
      body.theme-cyber-geo #btn-execute-sequence:hover,
      body.theme-cyber-geo #btn-end-turn:hover,
      body.theme-cyber-geo .btn-execute:hover {
        box-shadow: 0 0 26px rgba(249, 115, 22, 0.85) !important;
      }
      body.theme-cyber-geo .enemy-intent,
      body.theme-cyber-geo .intent-badge,
      body.theme-cyber-geo [class*="intent"] {
        background: rgba(45, 10, 14, 0.9) !important;
        border: 1.5px solid #ef4444 !important;
        border-radius: 3px !important;
        color: #fecaca !important;
        box-shadow: 0 0 12px rgba(239, 68, 68, 0.38) !important;
      }
      body.theme-cyber-geo .hp-bar-container,
      body.theme-cyber-geo .health-bar {
        border-radius: 2px !important;
        border: 1px solid rgba(148, 163, 184, 0.35) !important;
        background: #090d16 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // 2. TOGGLE BUTTON UI & STATE SYNC
  // =========================================================================
  function updateToggleButtonsUI() {
    document.body.classList.toggle('theme-cyber-geo', isGeoEnabled);
    const battleEl = document.getElementById('screen-battle');
    document.body.classList.toggle('in-battle-screen', Boolean(battleEl && battleEl.classList.contains('active')));

    document.querySelectorAll('.btn-geo-toggle').forEach(btn => {
      btn.classList.toggle('active', isGeoEnabled);
      btn.innerHTML = isGeoEnabled ? '◈ Vector: ON' : '◇ Vector: OFF';
      btn.title = 'Toggle Cyber-Geometric Art Style';
    });
  }

  function setGeoThemeEnabled(nextState) {
    isGeoEnabled = Boolean(nextState);
    localStorage.setItem(STORAGE_KEY, String(isGeoEnabled));
    updateToggleButtonsUI();
    syncPixiGeoTheme(true);
    if (typeof window.renderArtificerTurrets === 'function') window.renderArtificerTurrets();
  }

  window.toggleCyberGeoTheme = function () {
    setGeoThemeEnabled(!isGeoEnabled);
  };

  function ensureToggleButtons() {
    const battleHud = document.querySelector('#screen-battle .battle-hud-top');
    if (battleHud && !document.getElementById('btn-battle-geo-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'btn-battle-geo-toggle';
      btn.type = 'button';
      btn.className = 'btn-geo-toggle';
      btn.addEventListener('click', window.toggleCyberGeoTheme);

      const sfxBtn = battleHud.querySelector('#btn-toggle-sfx, [id*="sfx"], button:last-child');
      if (sfxBtn && sfxBtn.parentElement) {
        sfxBtn.parentElement.insertBefore(btn, sfxBtn.nextSibling);
      } else {
        battleHud.appendChild(btn);
      }
    }

    if (!document.getElementById('btn-global-geo-toggle')) {
      const floatBtn = document.createElement('button');
      floatBtn.id = 'btn-global-geo-toggle';
      floatBtn.type = 'button';
      floatBtn.className = 'btn-geo-toggle geo-floating-toggle';
      floatBtn.addEventListener('click', window.toggleCyberGeoTheme);
      document.body.appendChild(floatBtn);
    }

    updateToggleButtonsUI();
  }

  // =========================================================================
  // 3. PIXIJS DIAGONAL SPLIT BACKGROUND + SHATTERED GEOMETRIC SHARDS
  // =========================================================================
  function getLogicalStageSize() {
    const c = document.getElementById('pixi-container');
    const w = (c && c.clientWidth) || (typeof pixiApp !== 'undefined' && pixiApp ? pixiApp.screen.width : 860);
    const h = (c && c.clientHeight) || (typeof pixiApp !== 'undefined' && pixiApp ? pixiApp.screen.height : 220);
    return { w, h };
  }

  function rebuildDiagonalArena(w, h) {
    if (!geoBgLayer || geoBgLayer.destroyed) return;
    geoBgLayer.removeChildren().forEach(c => c.destroy({ children: true }));
    bgShards.length = 0;

    const base = new PIXI.Graphics();
    base.beginFill(0x05070c, 1);
    base.drawRect(0, 0, w, h);
    base.endFill();

    const leftHorizonY = Math.round(h * 0.42);
    const rightHorizonY = Math.round(h * 0.64);

    base.beginFill(0xf1f5f9, 0.96);
    base.drawPolygon([0, 0, w, 0, w, rightHorizonY, 0, leftHorizonY]);
    base.endFill();

    base.beginFill(0xffffff, 0.65);
    base.drawPolygon([Math.round(w * 0.25), 0, Math.round(w * 0.62), 0, Math.round(w * 0.48), Math.round(h * 0.52)]);
    base.endFill();

    base.beginFill(0xcbd5e1, 0.55);
    base.drawPolygon([Math.round(w * 0.62), 0, w, 0, w, Math.round(h * 0.35), Math.round(w * 0.52), Math.round(h * 0.53)]);
    base.endFill();

    base.lineStyle(2, 0xe2e8f0, 0.9);
    base.moveTo(0, leftHorizonY);
    base.lineTo(w, rightHorizonY);

    geoBgLayer.addChild(base);

    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
      const inUpperLight = i < 9;
      const shard = new PIXI.Graphics();
      const size = 4 + (i % 4) * 3.5;

      if (inUpperLight) {
        shard.beginFill(i % 2 === 0 ? 0x0f172a : 0x334155, 0.85);
      } else {
        shard.beginFill(0x94a3b8, 0.28);
      }

      if (i % 3 === 0) {
        shard.drawPolygon([0, -size, size, 0, 0, size, -size, 0]);
      } else if (i % 3 === 1) {
        shard.drawRect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
      } else {
        shard.drawPolygon([0, -size, size * 0.9, size * 0.8, -size * 0.9, size * 0.6]);
      }
      shard.endFill();

      shard.x = Math.random() * w;
      shard.y = inUpperLight
        ? Math.random() * (leftHorizonY - 12)
        : (rightHorizonY + 10) + Math.random() * Math.max(12, h - rightHorizonY - 14);

      geoBgLayer.addChild(shard);
      bgShards.push({
        sprite: shard,
        baseY: shard.y,
        speedX: (inUpperLight ? 0.12 : -0.1) * (0.5 + Math.random()),
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015
      });
    }
  }

  // =========================================================================
  // 4. WIREFRAME HERO & OBSIDIAN MONOLITH ENEMY RIGS
  // =========================================================================
  function getClassPalette() {
    const cls = (typeof gameState !== 'undefined' && gameState && gameState.classType)
      ? String(gameState.classType).toLowerCase()
      : 'chronomancer';

    if (cls.includes('blood')) {
      return { key: 'blood', primary: 0xf43f5e, secondary: 0xfda4af, fill: 0x4c0519 };
    }
    if (cls.includes('artificer')) {
      return { key: 'artificer', primary: 0x38bdf8, secondary: 0xf59e0b, fill: 0x082f49 };
    }
    if (cls.includes('mob')) {
      return { key: 'mob', primary: 0xc084fc, secondary: 0xfacc15, fill: 0x2e1065 };
    }
    return { key: 'chrono', primary: 0x22d3ee, secondary: 0xa5f3fc, fill: 0x083344 };
  }

  function buildWireframeHeroRig() {
    const pal = getClassPalette();
    const rig = new PIXI.Container();
    rig.__isGeoRig = true;

    const shadow = new PIXI.Graphics();
    shadow.beginFill(pal.primary, 0.22);
    shadow.drawEllipse(0, 24, 24, 6);
    shadow.endFill();
    rig.addChild(shadow);

    const wire = new PIXI.Graphics();
    wire.beginFill(pal.fill, 0.55);
    wire.lineStyle(2, pal.primary, 1);
    wire.drawPolygon([0, -14, 12, -4, 7, 10, -7, 10, -12, -4]);
    wire.endFill();

    wire.beginFill(pal.fill, 0.7);
    wire.lineStyle(1.8, pal.secondary, 1);
    wire.drawPolygon([0, -30, 8, -23, 5, -15, -5, -15, -8, -23]);
    wire.endFill();

    wire.lineStyle(1.2, pal.secondary, 0.75);
    wire.moveTo(-8, -23); wire.lineTo(8, -23);
    wire.moveTo(0, -30);  wire.lineTo(0, -15);
    wire.moveTo(-12, -4); wire.lineTo(12, -4);
    wire.moveTo(0, -14);  wire.lineTo(0, 10);

    wire.lineStyle(2.2, pal.primary, 1);
    wire.moveTo(-5, 10); wire.lineTo(-11, 23);
    wire.moveTo(5, 10);  wire.lineTo(11, 23);
    wire.moveTo(-12, -4); wire.lineTo(-18, 6);
    wire.moveTo(12, -4);  wire.lineTo(22, 1);

    wire.beginFill(0xffffff, 1);
    [
      [0, -30], [8, -23], [-8, -23], [0, -14],
      [12, -4], [-12, -4], [22, 1], [-11, 23], [11, 23]
    ].forEach(([vx, vy]) => wire.drawCircle(vx, vy, 2));
    wire.endFill();

    if (pal.key === 'blood') {
      wire.lineStyle(2, 0xf43f5e, 1);
      wire.moveTo(22, 1);
      wire.lineTo(32, -12);
      wire.lineTo(26, 8);
    } else if (pal.key === 'artificer') {
      wire.lineStyle(1.6, 0xf59e0b, 1);
      wire.drawPolygon([-18, -18, -13, -23, -8, -18, -13, -13]);
    } else if (pal.key === 'mob') {
      wire.lineStyle(2, 0xfacc15, 1);
      wire.moveTo(-12, -26);
      wire.lineTo(12, -26);
    }

    rig.addChild(wire);

    const core = new PIXI.Graphics();
    core.beginFill(pal.secondary, 0.95);
    core.drawCircle(22, 1, 3.5);
    core.endFill();
    rig.addChild(core);
    rig.__core = core;

    return rig;
  }

  function buildObsidianMonolithRig(isBossOrElite = false) {
    const rig = new PIXI.Container();
    rig.__isGeoRig = true;
    const s = isBossOrElite ? 1.28 : 1.0;

    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.55);
    shadow.drawEllipse(0, 28 * s, 26 * s, 7 * s);
    shadow.endFill();
    rig.addChild(shadow);

    const cube = new PIXI.Graphics();
    const r = 22 * s;

    cube.beginFill(0x312e4b, 0.98);
    cube.lineStyle(1.5, 0x64748b, 0.8);
    cube.drawPolygon([0, -r * 1.15, r, -r * 0.55, 0, 0, -r, -r * 0.55]);
    cube.endFill();

    cube.beginFill(0x232038, 0.98);
    cube.drawPolygon([-r, -r * 0.55, 0, 0, 0, r * 1.1, -r, r * 0.5]);
    cube.endFill();

    cube.beginFill(0x141221, 0.98);
    cube.drawPolygon([0, 0, r, -r * 0.55, r, r * 0.5, 0, r * 1.1]);
    cube.endFill();

    cube.lineStyle(1.4, 0x090812, 0.95);
    cube.moveTo(-r * 0.65, -r * 0.1);
    cube.lineTo(-r * 0.25, r * 0.15);
    cube.lineTo(-r * 0.25, r * 0.65);

    cube.moveTo(r * 0.65, -r * 0.1);
    cube.lineTo(r * 0.25, r * 0.15);
    cube.lineTo(r * 0.25, r * 0.65);

    rig.addChild(cube);

    const eyeCore = new PIXI.Graphics();
    eyeCore.beginFill(0xef4444, 0.35);
    eyeCore.drawCircle(0, 0, 11 * s);
    eyeCore.beginFill(0xef4444, 0.95);
    eyeCore.drawCircle(0, 0, 6 * s);
    eyeCore.beginFill(0xfecaca, 1);
    eyeCore.drawCircle(0, 0, 2.6 * s);
    eyeCore.endFill();
    rig.addChild(eyeCore);
    rig.__eyeCore = eyeCore;

    return rig;
  }

  function applyRigSwap(container, rigBuilderFn, shouldEnable) {
    if (!container || container.destroyed) return;

    if (shouldEnable) {
      container.children.forEach(child => {
        if (!child.__isGeoRig) {
          if (typeof child.__origGeoVis === 'undefined') {
            child.__origGeoVis = child.visible;
          }
          child.visible = false;
        }
      });

      if (!container.__geoRig || container.__geoRig.destroyed) {
        const rig = rigBuilderFn();
        container.addChild(rig);
        container.__geoRig = rig;
      }
      container.__geoRig.visible = true;
    } else {
      if (container.__geoRig && !container.__geoRig.destroyed) {
        container.__geoRig.visible = false;
      }
      container.children.forEach(child => {
        if (!child.__isGeoRig && typeof child.__origGeoVis !== 'undefined') {
          child.visible = child.__origGeoVis;
          delete child.__origGeoVis;
        }
      });
    }
  }

  // =========================================================================
  // 5. PIXI LAYER SYNC & 60FPS ANIMATION TICKER
  // =========================================================================
  function syncPixiGeoTheme(forceRebuild = false) {
    if (typeof pixiApp === 'undefined' || !pixiApp || !pixiApp.stage) return;

    const { w, h } = getLogicalStageSize();
    pixiApp.stage.sortableChildren = true;

    // Safely attach or re-attach background layer at index 0
    if (!geoBgLayer || geoBgLayer.destroyed) {
      geoBgLayer = new PIXI.Container();
    }
    geoBgLayer.zIndex = -10;
    if (geoBgLayer.parent !== pixiApp.stage) {
      pixiApp.stage.addChildAt(geoBgLayer, 0);
    } else if (pixiApp.stage.getChildIndex(geoBgLayer) !== 0) {
      pixiApp.stage.setChildIndex(geoBgLayer, 0);
    }

    // Safely attach or re-attach card-hover stream layer
    if (!geoStreamLayer || geoStreamLayer.destroyed) {
      geoStreamLayer = new PIXI.Container();
    }
    geoStreamLayer.zIndex = 22;
    if (geoStreamLayer.parent !== pixiApp.stage) {
      pixiApp.stage.addChild(geoStreamLayer);
    }

    geoBgLayer.visible = isGeoEnabled;
    geoStreamLayer.visible = isGeoEnabled;

    if (isGeoEnabled && (forceRebuild || w !== lastBgW || h !== lastBgH || geoBgLayer.children.length === 0) && w > 0 && h > 0) {
      lastBgW = w;
      lastBgH = h;
      rebuildDiagonalArena(w, h);
    }

    const heroObj = (typeof playerContainer !== 'undefined' && playerContainer)
      ? playerContainer
      : ((typeof playerSprite !== 'undefined' && playerSprite) ? playerSprite : null);

    const currCls = getClassPalette().key;
    if (heroObj) {
      if (currCls !== lastHeroClass && heroObj.__geoRig) {
        heroObj.removeChild(heroObj.__geoRig);
        heroObj.__geoRig.destroy({ children: true });
        heroObj.__geoRig = null;
      }
      lastHeroClass = currCls;
      applyRigSwap(heroObj, buildWireframeHeroRig, isGeoEnabled);
    }

    if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
      enemyEntities.forEach(ent => {
        if (ent && ent.container) {
          const isBoss = Boolean(ent.data && (ent.data.isBoss || ent.data.isElite || (ent.data.maxHp && ent.data.maxHp >= 65)));
          applyRigSwap(ent.container, () => buildObsidianMonolithRig(isBoss), isGeoEnabled);
        }
      });
    }

    ensureGeoTicker();
  }

  function spawnHeroToCardParticle() {
    if (!isGeoEnabled || !hoveredCardEl || !geoStreamLayer || geoStreamLayer.destroyed) return;
    const pixiContainer = document.getElementById('pixi-container');
    if (!pixiContainer) return;

    const stageRect = pixiContainer.getBoundingClientRect();
    const cardRect = hoveredCardEl.getBoundingClientRect();
    if (!stageRect.width || !cardRect.width) return;

    const heroObj = (typeof playerContainer !== 'undefined' && playerContainer) ? playerContainer : null;
    const startX = heroObj ? (heroObj.x + 22) : stageRect.width * 0.24;
    const startY = heroObj ? (heroObj.y + 1) : stageRect.height * 0.62;

    const targetX = (cardRect.left + cardRect.width * 0.5) - stageRect.left;
    const targetY = Math.min(stageRect.height + 16, (cardRect.top + 14) - stageRect.top);

    const pal = getClassPalette();
    const dot = new PIXI.Graphics();
    dot.beginFill(Math.random() > 0.35 ? pal.primary : 0xffffff, 0.95);
    dot.drawCircle(0, 0, 2.2 + Math.random() * 2);
    dot.endFill();
    dot.x = startX + (Math.random() - 0.5) * 8;
    dot.y = startY + (Math.random() - 0.5) * 8;
    geoStreamLayer.addChild(dot);

    const curve = (Math.random() - 0.5) * 28;
    streamParticles.push({
      obj: dot,
      startX: dot.x,
      startY: dot.y,
      targetX,
      targetY,
      curve,
      life: 0,
      maxLife: 24
    });
  }

  function ensureGeoTicker() {
    if (typeof pixiApp === 'undefined' || !pixiApp || pixiApp.__cyberGeoTicker) return;
    pixiApp.__cyberGeoTicker = true;

    let streamAccum = 0;

    pixiApp.ticker.add((delta) => {
      if (!isGeoEnabled) return;
      const t = performance.now() * 0.003;

      const { w } = getLogicalStageSize();
      for (let i = 0; i < bgShards.length; i++) {
        const s = bgShards[i];
        s.sprite.x += s.speedX * delta;
        s.sprite.y = s.baseY + Math.sin(t + s.phase) * 3.5;
        s.sprite.rotation += s.rotSpeed * delta;
        if (s.sprite.x > w + 20) s.sprite.x = -20;
        if (s.sprite.x < -20) s.sprite.x = w + 20;
      }

      if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
        enemyEntities.forEach((ent, idx) => {
          const rig = ent && ent.container && ent.container.__geoRig;
          if (rig && rig.visible && rig.__eyeCore) {
            const pulse = 0.92 + Math.sin(t * 2.2 + idx) * 0.16;
            rig.__eyeCore.scale.set(pulse);
          }
        });
      }

      if (hoveredCardEl && document.body.contains(hoveredCardEl)) {
        streamAccum += delta;
        if (streamAccum >= 1.5) {
          streamAccum = 0;
          spawnHeroToCardParticle();
        }
      }

      for (let i = streamParticles.length - 1; i >= 0; i--) {
        const p = streamParticles[i];
        p.life += delta;
        const prog = Math.min(1, p.life / p.maxLife);
        p.obj.x = p.startX + (p.targetX - p.startX) * prog;
        p.obj.y = p.startY + (p.targetY - p.startY) * prog + Math.sin(prog * Math.PI) * p.curve;
        p.obj.alpha = prog < 0.2 ? (prog / 0.2) : (1 - (prog - 0.65) / 0.35);

        if (prog >= 1) {
          if (p.obj.parent) p.obj.parent.removeChild(p.obj);
          p.obj.destroy();
          streamParticles.splice(i, 1);
        }
      }
    });
  }

  // =========================================================================
  // 6. DOM HOVER LISTENERS & LIFECYCLE HOOKS
  // =========================================================================
  function bindCardHoverStream() {
    const handContainer = document.getElementById('hand-cards-container');
    if (!handContainer || handContainer.__geoHoverBound) return;
    handContainer.__geoHoverBound = true;

    handContainer.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.hand-card');
      if (card) hoveredCardEl = card;
    });
    handContainer.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.hand-card');
      if (card && hoveredCardEl === card && !card.contains(e.relatedTarget)) {
        hoveredCardEl = null;
      }
    });
  }

  function initCyberGeoTheme() {
    ensureToggleButtons();
    bindCardHoverStream();
    syncPixiGeoTheme(true);

    ['initPixi', 'renderCombatUnits', 'updateBattleUI', 'navigateTo'].forEach(fnName => {
      if (typeof window[fnName] === 'function' && !window[fnName].__geoWrapped) {
        const orig = window[fnName];
        const wrapped = function (...args) {
          const res = orig.apply(this, args);
          ensureToggleButtons();
          bindCardHoverStream();
          syncPixiGeoTheme(fnName === 'initPixi');
          if (typeof window.renderArtificerTurrets === 'function') window.renderArtificerTurrets();
          return res;
        };
        wrapped.__geoWrapped = true;
        window[fnName] = wrapped;
      }
    });
  }

  setInterval(() => {
    ensureToggleButtons();
    if (typeof gameState !== 'undefined' && gameState && gameState.screen === 'BATTLE') {
      syncPixiGeoTheme(false);
    }
  }, 250);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCyberGeoTheme);
  } else {
    initCyberGeoTheme();
  }
})();
