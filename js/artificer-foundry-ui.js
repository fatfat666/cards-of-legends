// --- ARTIFICER FOUNDRY UI: GUARANTEED STAGE OVERLAY MODELS & SCHEMATICS ---
(function () {
  if (!document.getElementById('artificer-foundry-css')) {
    const style = document.createElement('style');
    style.id = 'artificer-foundry-css';
    style.textContent = `
      #artificer-constructs-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 12;
      }
      #artificer-stage-rack {
        position: absolute;
        top: 10px;
        left: 12px;
        z-index: 24;
        display: none;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        max-width: 64%;
        pointer-events: auto;
      }
      #artificer-stage-rack.visible {
        display: flex;
      }
      .af-btn-schematics {
        background: linear-gradient(135deg, rgba(14, 116, 144, 0.92), rgba(30, 58, 138, 0.92));
        border: 1px solid #38bdf8;
        color: #e0f2fe;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);
      }
      .af-construct-chip {
        background: rgba(15, 23, 42, 0.92);
        border-radius: 8px;
        padding: 3px 8px;
        font-size: 0.70rem;
        font-weight: 700;
        color: #f8fafc;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .af-construct-chip.type-turret { border: 1px solid #38bdf8; }
      .af-construct-chip.type-mech { border: 1px solid #f59e0b; }
      .af-construct-chip.type-building { border: 1px solid #10b981; }
      .af-chip-stat {
        font-size: 0.66rem;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.08);
        color: #7dd3fc;
      }
      #modal-artificer-schematics {
        position: fixed;
        inset: 0;
        z-index: 120;
        background: rgba(2, 6, 23, 0.82);
        backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 14px;
      }
      #modal-artificer-schematics.open { display: flex; }
      .af-blueprint-panel {
        width: 100%;
        max-width: 840px;
        max-height: 88dvh;
        overflow-y: auto;
        background-color: #091326;
        background-image:
          linear-gradient(rgba(56, 189, 248, 0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56, 189, 248, 0.07) 1px, transparent 1px);
        background-size: 20px 20px;
        border: 1.5px solid #38bdf8;
        border-radius: 14px;
        padding: 16px 18px;
        color: #f1f5f9;
      }
      .af-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(56, 189, 248, 0.25);
        padding-bottom: 10px;
        margin-bottom: 8px;
        gap: 8px;
      }
      .af-panel-title { font-size: 1.02rem; font-weight: 900; color: #38bdf8; }
      .af-panel-subtitle { font-size: 0.74rem; color: #94a3b8; margin-bottom: 10px; }
      .af-parts-pill {
        background: rgba(245, 158, 11, 0.16);
        border: 1px solid #f59e0b;
        color: #fde68a;
        font-size: 0.78rem;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 999px;
      }
      .af-close-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(148, 163, 184, 0.35);
        color: #e2e8f0;
        border-radius: 8px;
        padding: 4px 10px;
        font-weight: 800;
        cursor: pointer;
      }
      .af-filter-tabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
      .af-tab {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.3);
        color: #cbd5e1;
        font-size: 0.74rem;
        font-weight: 800;
        padding: 4px 11px;
        border-radius: 999px;
        cursor: pointer;
      }
      .af-tab.active { background: #0284c7; border-color: #7dd3fc; color: #ffffff; }
      .af-schematics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 10px;
      }
      .af-bp-card {
        background: rgba(15, 23, 42, 0.94);
        border: 1px solid rgba(56, 189, 248, 0.45);
        border-radius: 10px;
        padding: 11px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 7px;
      }
      .af-bp-card.locked { border-color: rgba(100, 116, 139, 0.45); opacity: 0.78; }
      .af-bp-top { display: flex; align-items: center; justify-content: space-between; }
      .af-bp-badge {
        font-size: 0.62rem;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        background: rgba(56, 189, 248, 0.18);
        color: #7dd3fc;
      }
      .af-bp-cost { font-size: 0.72rem; font-weight: 800; color: #fde047; }
      .af-bp-name { font-size: 0.88rem; font-weight: 900; color: #f8fafc; margin-top: 3px; }
      .af-card-req {
        font-size: 0.69rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
      }
      .af-card-req.req-locked {
        background: rgba(239, 68, 68, 0.12);
        border: 1px dashed rgba(248, 113, 113, 0.45);
        color: #fca5a5;
      }
      .af-card-req.req-unlocked {
        background: rgba(34, 197, 94, 0.14);
        border: 1px solid rgba(74, 222, 128, 0.45);
        color: #86efac;
      }
      .af-bp-desc { font-size: 0.75rem; color: #cbd5e1; line-height: 1.38; }
      .af-bp-overcharge {
        font-size: 0.70rem;
        color: #fde047;
        background: rgba(250, 204, 21, 0.09);
        border-left: 2px solid #facc15;
        padding: 4px 7px;
      }
      .af-bp-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 2px; }
      .af-bp-status { font-size: 0.68rem; font-weight: 800; color: #94a3b8; }
      .af-bp-status.deployed { color: #4ade80; }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // 1. SCHEMATICS DATA & MULTI-SOURCE CONSTRUCT / DRONE DETECTOR
  // =========================================================================
  const DEFAULT_FOUNDRY_SCHEMATICS = [
    {
      id: 'auto_turret',
      name: 'Auto-Turret Drone',
      cardForm: 'Auto-Turret / Sentry Card',
      keywords: ['auto-turret', 'auto turret', 'drone', 'sentry', 'gatling', 'turret'],
      archetype: 'turret',
      icon: '🔫',
      cost: 2,
      desc: 'End of Turn: Fires high-velocity rounds for 6 DMG to front enemy.',
      overcharge: 'Overcharge: Fires twice (2x 6 DMG) & applies 1 Vulnerable.'
    },
    {
      id: 'tesla_coil',
      name: 'Arc Tesla Coil',
      cardForm: 'Arc Tesla / Shock Coil Card',
      keywords: ['tesla', 'arc coil', 'shock turret', 'volt turret', 'lightning'],
      archetype: 'turret',
      icon: '⚡',
      cost: 3,
      desc: 'End of Turn: Zaps ALL enemies for 5 Shock DMG (ignores 50% Shield).',
      overcharge: 'Overcharge: Chain lightning hits for 9 DMG & grants +1 Energy next turn.'
    },
    {
      id: 'aegis_mech',
      name: 'Aegis Vanguard Mech',
      cardForm: 'Aegis / Vanguard Mech Card',
      keywords: ['aegis mech', 'vanguard', 'guard mech', 'shield mech', 'exo'],
      archetype: 'mech',
      icon: '🤖',
      cost: 3,
      hp: 24,
      desc: 'Frontline Mech (24 HP): Intercepts 50% incoming attack DMG & slams for 5 DMG.',
      overcharge: 'Overcharge: Gains +12 Armor Plating & retaliates for 10 DMG when hit.'
    },
    {
      id: 'siege_walker',
      name: 'Hellfire Siege Walker',
      cardForm: 'Siege Walker / Hellfire Mech Card',
      keywords: ['siege', 'walker', 'hellfire', 'mortar', 'juggernaut', 'titan'],
      archetype: 'mech',
      icon: '🦾',
      cost: 4,
      hp: 30,
      desc: 'Heavy Mech (30 HP): Launches twin mortar shells for 11 AoE DMG each turn.',
      overcharge: 'Overcharge: Triggers Siege Barrage immediately (18 DMG).'
    },
    {
      id: 'scrap_foundry',
      name: 'Automated Scrap Foundry',
      cardForm: 'Scrap Foundry / Fabricator Card',
      keywords: ['scrap foundry', 'foundry', 'fabricator', 'salvage bay', 'generator'],
      archetype: 'building',
      icon: '🏭',
      cost: 2,
      desc: 'Building: Generates +1 ⚙️ Part & +4 Armor Shield at the start of every turn.',
      overcharge: 'Overcharge: Immediately fabricates +2 ⚙️ Parts & draws 1 card.'
    },
    {
      id: 'aegis_pylon',
      name: 'Chrono-Shield Pylon',
      cardForm: 'Shield Pylon / Barrier Tower Card',
      keywords: ['pylon', 'chrono-shield', 'barrier tower', 'shield tower', 'bunker'],
      archetype: 'building',
      icon: '🗼',
      cost: 3,
      desc: 'Building: Projects a barrier granting +8 Shield & 25% Retaliation Thorns.',
      overcharge: 'Overcharge: Pulses +16 Shield to Hero & repairs all Mechs for +8 HP.'
    }
  ];

  let domObservedDrones = [];

  function classifyConstruct(item) {
    if (!item) return 'turret';
    const raw = `${item.archetype || ''} ${item.category || ''} ${item.type || ''} ${item.name || ''}`.toLowerCase();
    if (/mech|walker|golem|titan|exo|suit|vanguard|juggernaut|dreadnought/.test(raw)) return 'mech';
    if (/building|foundry|pylon|generator|reactor|bay|forge|bunker|tower|wall/.test(raw)) return 'building';
    return 'turret';
  }

  function isInBattleScreen() {
    const battleEl = document.getElementById('screen-battle');
    if (battleEl && battleEl.classList.contains('active')) return true;
    return typeof gameState !== 'undefined' && gameState && gameState.screen === 'BATTLE';
  }

  function isArtificerActive() {
    if (typeof gameState !== 'undefined' && gameState) {
      const clsStr = `${gameState.classType || ''} ${gameState.heroClass || ''} ${gameState.class || ''} ${gameState.selectedClass || ''} ${(gameState.player && gameState.player.classType) || ''}`.toLowerCase();
      if (clsStr.includes('artificer')) return true;
    }
    if (document.getElementById('ui-parts') || document.getElementById('ui-parts-badge')) return true;
    const btns = Array.from(document.querySelectorAll('button'));
    if (btns.some(b => /scrap\s+drone|deploy/i.test(b.textContent || ''))) return true;
    return getActiveConstructs().length > 0;
  }

  function getActiveConstructs() {
    // 1. Check array pools on gameState / window
    const arrayCandidates = [];
    if (typeof gameState !== 'undefined' && gameState) {
      arrayCandidates.push(
        gameState.drones,
        gameState.activeDrones,
        gameState.turrets,
        gameState.activeTurrets,
        gameState.constructs,
        gameState.activeConstructs,
        gameState.summons,
        gameState.artificerTurrets,
        gameState.player && gameState.player.drones,
        gameState.player && gameState.player.turrets,
        gameState.player && gameState.player.constructs
      );
    }
    ['drones', 'activeDrones', 'turrets', 'activeTurrets', 'constructs'].forEach(k => {
      if (Array.isArray(window[k])) arrayCandidates.push(window[k]);
    });

    for (const list of arrayCandidates) {
      if (Array.isArray(list) && list.length > 0) {
        return list.filter(item => item && (typeof item.hp !== 'number' || item.hp > 0));
      }
    }

    // 2. Check numeric counters (e.g., gameState.drones = 2 or gameState.droneCount = 2)
    if (typeof gameState !== 'undefined' && gameState) {
      const numKeys = ['drones', 'droneCount', 'activeDrones', 'turrets', 'turretCount', 'constructCount'];
      for (const nk of numKeys) {
        const val = gameState[nk] ?? (gameState.player && gameState.player[nk]);
        if (typeof val === 'number' && val > 0) {
          return Array.from({ length: Math.min(val, 8) }, (_, i) => ({
            id: `auto_turret_${i}`,
            name: `Auto-Turret Drone #${i + 1}`,
            archetype: 'turret',
            dmg: 6
          }));
        }
      }
    }

    // 3. Read live count directly from "Scrap Drone (2/3)" button in the DOM
    const scrapBtn = Array.from(document.querySelectorAll('#screen-battle button, button')).find(b =>
      /scrap\s+(?:drone|turret|construct)/i.test(b.textContent || '')
    );
    if (scrapBtn) {
      const match = (scrapBtn.textContent || '').match(/\((\d+)(?:\s*\/\s*\d+)?\)/);
      if (match) {
        const count = parseInt(match[1], 10) || 0;
        if (count > 0) {
          return Array.from({ length: Math.min(count, 8) }, (_, i) => (
            domObservedDrones[i] || {
              id: `auto_turret_${i}`,
              name: `Auto-Turret Drone #${i + 1}`,
              archetype: 'turret',
              dmg: 6
            }
          ));
        } else {
          domObservedDrones = [];
        }
      }
    }

    // 4. Fallback to toast-tracked constructs
    if (domObservedDrones.length > 0) {
      return domObservedDrones;
    }

    return [];
  }

  window.__getArtificerConstructs = getActiveConstructs;

  // =========================================================================
  // 2. DEDICATED HIGH-DPI 2D CANVAS STAGE RENDERER (WORKS IN ALL THEMES)
  // =========================================================================
  let overlayCanvas = null;
  let overlayCtx = null;
  let tracerBolts = [];
  window.__artificerStageCoords = [];

  function findBattleStageHost() {
    const canvas = document.querySelector('#screen-battle canvas') || document.querySelector('canvas');
    if (canvas && canvas.parentElement) {
      const host = canvas.parentElement;
      if (getComputedStyle(host).position === 'static') {
        host.style.position = 'relative';
      }
      return host;
    }
    return document.querySelector('#screen-battle .battle-stage-wrapper') || document.getElementById('pixi-container');
  }

  function ensureOverlayCanvas() {
    const host = findBattleStageHost();
    if (!host) return null;

    if (!overlayCanvas || !document.body.contains(overlayCanvas)) {
      overlayCanvas = document.createElement('canvas');
      overlayCanvas.id = 'artificer-constructs-canvas';
      host.appendChild(overlayCanvas);
      overlayCtx = overlayCanvas.getContext('2d');
    }

    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.round(rect.width * dpr));
    const targetH = Math.max(1, Math.round(rect.height * dpr));

    if (overlayCanvas.width !== targetW || overlayCanvas.height !== targetH) {
      overlayCanvas.width = targetW;
      overlayCanvas.height = targetH;
    }

    return { ctx: overlayCtx, w: rect.width, h: rect.height, dpr };
  }

  function drawDrone2D(ctx, x, y, index, isOvercharged, t) {
    const primary = isOvercharged ? '#facc15' : '#38bdf8';
    const glow = isOvercharged ? 'rgba(250, 204, 21, 0.45)' : 'rgba(56, 189, 248, 0.45)';

    ctx.save();
    ctx.translate(x, y);

    // Subtle energy tether arc down toward hero
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-22, 34);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotor arms
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-15, -8);
    ctx.lineTo(15, -8);
    ctx.stroke();

    // Spinning rotor blades
    const bladeW = 7 + Math.sin(t * 18 + index) * 3.5;
    ctx.fillStyle = 'rgba(186, 230, 253, 0.72)';
    ctx.beginPath();
    ctx.ellipse(-15, -10, Math.abs(bladeW), 2.2, 0, 0, Math.PI * 2);
    ctx.ellipse(15, -10, Math.abs(bladeW), 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armored hexagonal chassis
    ctx.shadowColor = glow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-7, -8);
    ctx.lineTo(7, -8);
    ctx.lineTo(12, -2);
    ctx.lineTo(8, 6);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Twin underslung auto-cannon barrels
    ctx.fillStyle = primary;
    ctx.fillRect(6, 1, 14, 3);
    ctx.fillRect(6, 5, 11, 2.5);

    // Glowing cyan sensor core
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(2, -1.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Compact label pill above drone
    ctx.font = '800 9.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#020617';
    ctx.fillText(`DRONE #${index + 1}`, 1, -17);
    ctx.fillStyle = primary;
    ctx.fillText(`DRONE #${index + 1}`, 0, -18);

    ctx.restore();
  }

  function drawMech2D(ctx, x, y, item, isOvercharged) {
    const primary = isOvercharged ? '#facc15' : '#f59e0b';
    ctx.save();
    ctx.translate(x, y);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mechanical legs
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-7, 6); ctx.lineTo(-9, 20);
    ctx.moveTo(7, 6);  ctx.lineTo(9, 20);
    ctx.stroke();

    // Armored torso
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-14, -14, 26, 22, 5);
    ctx.fill();
    ctx.stroke();

    // Glowing visor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-5, -9, 12, 4);

    // Front Aegis energy shield
    ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(11, -14, 7, 26, 3);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 9.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText((item.name || 'MECH').split(' ')[0].toUpperCase(), 0, -21);

    ctx.restore();
  }

  function drawBuilding2D(ctx, x, y, item, isOvercharged) {
    const primary = isOvercharged ? '#facc15' : '#10b981';
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-15, -10, 30, 26);
    ctx.fill();
    ctx.stroke();

    // Smokestack / crystal spire
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(6, -12);
    ctx.lineTo(-6, -12);
    ctx.closePath();
    ctx.fill();

    ctx.font = '800 9.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText((item.name || 'FOUNDRY').split(' ')[0].toUpperCase(), 0, -29);

    ctx.restore();
  }

  function spawnDroneVolleyTracers(w, h) {
    const coords = window.__artificerStageCoords || [];
    if (!coords.length) return;
    const targetX = w * 0.78;
    const targetY = h * 0.56;

    coords.forEach((c, idx) => {
      for (let b = 0; b < 2; b++) {
        tracerBolts.push({
          x: c.x + 16,
          y: c.y + 2,
          tx: targetX + (Math.random() - 0.5) * 18,
          ty: targetY + (Math.random() - 0.5) * 18,
          progress: -(idx * 0.18 + b * 0.14),
          color: c.archetype === 'mech' ? '#f59e0b' : '#38bdf8'
        });
      }
    });
  }

  function renderConstructsFrame() {
    requestAnimationFrame(renderConstructsFrame);

    if (!isInBattleScreen()) {
      if (overlayCtx && overlayCanvas) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      }
      return;
    }

    const setup = ensureOverlayCanvas();
    if (!setup || !setup.ctx) return;

    const { ctx, w, h, dpr } = setup;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const constructs = getActiveConstructs();
    window.__artificerStageCoords = [];

    if (constructs.length > 0) {
      const t = performance.now() * 0.004;
      const heroX = (typeof playerContainer !== 'undefined' && playerContainer && playerContainer.x > 0)
        ? playerContainer.x
        : Math.round(w * 0.21);
      const heroY = (typeof playerContainer !== 'undefined' && playerContainer && playerContainer.y > 0)
        ? playerContainer.y
        : Math.round(h * 0.58);

      let turretIdx = 0;
      let mechIdx = 0;
      let buildingIdx = 0;

      constructs.forEach((item, idx) => {
        const kind = classifyConstruct(item);
        const isOvercharged = Boolean(item && (item.overcharged || item.upgraded || (item.level && item.level > 1)));
        let drawX = heroX;
        let drawY = heroY;

        if (kind === 'mech') {
          drawX = Math.min(w * 0.48, heroX + 64 + mechIdx * 44);
          drawY = Math.min(h - 28, heroY + 6 - mechIdx * 18) + Math.sin(t + idx) * 1.5;
          drawMech2D(ctx, drawX, drawY, item, isOvercharged);
          mechIdx++;
        } else if (kind === 'building') {
          drawX = Math.max(30, heroX - 54 - buildingIdx * 36);
          drawY = Math.min(h - 28, heroY + 4 - buildingIdx * 24);
          drawBuilding2D(ctx, drawX, drawY, item, isOvercharged);
          buildingIdx++;
        } else {
          // Hover in an arc above and in front of the hero
          drawX = Math.min(w * 0.48, heroX + 46 + (turretIdx % 3) * 48);
          drawY = Math.max(34, heroY - 46 - Math.floor(turretIdx / 3) * 34) + Math.sin(t + idx * 1.1) * 3.2;
          drawDrone2D(ctx, drawX, drawY, turretIdx, isOvercharged, t);
          turretIdx++;
        }

        window.__artificerStageCoords.push({
          index: idx,
          name: (item && item.name) || kind,
          archetype: kind,
          x: drawX,
          y: drawY
        });
      });
    }

    // Animate laser/bullet tracers when drones fire
    for (let i = tracerBolts.length - 1; i >= 0; i--) {
      const bolt = tracerBolts[i];
      bolt.progress += 0.085;
      if (bolt.progress < 0) continue;
      if (bolt.progress >= 1) {
        tracerBolts.splice(i, 1);
        continue;
      }
      const bx = bolt.x + (bolt.tx - bolt.x) * bolt.progress;
      const by = bolt.y + (bolt.ty - bolt.y) * bolt.progress;
      ctx.strokeStyle = bolt.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx - 12, by);
      ctx.lineTo(bx + 4, by);
      ctx.stroke();
    }

    ctx.restore();
  }

  window.renderArtificerTurrets = function () {
    ensureOverlayCanvas();
  };

  // =========================================================================
  // 3. SCHEMATICS MODAL & HUD RACK
  // =========================================================================
  let currentFilter = 'all';

  function getPartsInfo() {
    if (typeof gameState !== 'undefined' && gameState) {
      if (typeof gameState.parts === 'number') return { current: gameState.parts, max: gameState.maxParts || 6 };
      if (typeof gameState.scrapParts === 'number') return { current: gameState.scrapParts, max: gameState.maxScrapParts || 6 };
    }
    const el = document.getElementById('ui-parts');
    if (el && el.textContent.includes('/')) {
      const [c, m] = el.textContent.split('/').map(n => parseInt(n, 10) || 0);
      return { current: c, max: m || 6 };
    }
    return { current: 0, max: 6 };
  }

  function ensureFoundryDOM() {
    const host = findBattleStageHost();
    if (host && !document.getElementById('artificer-stage-rack')) {
      const rack = document.createElement('div');
      rack.id = 'artificer-stage-rack';
      host.appendChild(rack);
    }

    if (!document.getElementById('modal-artificer-schematics')) {
      const modal = document.createElement('div');
      modal.id = 'modal-artificer-schematics';
      modal.innerHTML = `
        <div class="af-blueprint-panel" role="dialog" aria-label="Artificer Foundry Schematics">
          <div class="af-panel-header">
            <div class="af-panel-title">📐 ARTIFICER FOUNDRY — 6-CONSTRUCT SCHEMATICS</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="af-parts-pill" id="af-modal-parts">⚙️ Parts: 0/6</span>
              <button class="af-close-btn" id="af-close-modal">✕ Close</button>
            </div>
          </div>
          <div class="af-panel-subtitle">
            Obtain a construct's <strong>Card Form</strong> (via Starter Deck, Card Rewards, or Shop) to unlock its Foundry Schematic.
          </div>
          <div class="af-filter-tabs" id="af-filter-tabs">
            <button class="af-tab active" data-filter="all">All Blueprints (6)</button>
            <button class="af-tab" data-filter="turret">🔫 Turrets / Drones</button>
            <button class="af-tab" data-filter="mech">🤖 Mechs</button>
            <button class="af-tab" data-filter="building">🏭 Buildings</button>
          </div>
          <div class="af-schematics-grid" id="af-schematics-grid"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
      document.getElementById('af-close-modal').addEventListener('click', () => {
        modal.classList.remove('open');
      });
      document.getElementById('af-filter-tabs').addEventListener('click', (e) => {
        const btn = e.target.closest('.af-tab');
        if (!btn) return;
        currentFilter = btn.dataset.filter || 'all';
        document.querySelectorAll('#af-filter-tabs .af-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        renderSchematicsModalGrid();
      });
    }
  }

  function openSchematicsModal() {
    ensureFoundryDOM();
    renderSchematicsModalGrid();
    document.getElementById('modal-artificer-schematics').classList.add('open');
  }

  function renderSchematicsModalGrid() {
    const grid = document.getElementById('af-schematics-grid');
    if (!grid) return;

    const parts = getPartsInfo();
    const partsPill = document.getElementById('af-modal-parts');
    if (partsPill) partsPill.textContent = `⚙️ Parts: ${parts.current}/${parts.max}`;

    const active = getActiveConstructs();
    const roster = DEFAULT_FOUNDRY_SCHEMATICS.filter(bp => currentFilter === 'all' || bp.archetype === currentFilter);

    grid.innerHTML = roster.map(bp => {
      const deployedCount = active.filter(c =>
        c && String(c.name || '').toLowerCase().includes(bp.name.split(' ')[0].toLowerCase())
      ).length;
      const unlocked = bp.id === 'auto_turret' || deployedCount > 0;

      return `
        <div class="af-bp-card ${unlocked ? '' : 'locked'}">
          <div>
            <div class="af-bp-top">
              <span class="af-bp-badge">${bp.icon} ${bp.archetype}</span>
              <span class="af-bp-cost">⚙️ ${bp.cost} Parts</span>
            </div>
            <div class="af-bp-name">${bp.name}</div>
          </div>
          <div class="af-card-req ${unlocked ? 'req-unlocked' : 'req-locked'}">
            ${unlocked ? '✅ Schematic Active' : `🔒 Obtain <strong>${bp.cardForm}</strong>`}
          </div>
          <div class="af-bp-desc">${bp.desc}</div>
          <div class="af-bp-overcharge">⚡ ${bp.overcharge}</div>
          <div class="af-bp-footer">
            <span class="af-bp-status ${deployedCount > 0 ? 'deployed' : ''}">
              ${deployedCount > 0 ? `● ${deployedCount} Deployed on Field` : '○ Ready'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateArtificerFoundryHUD() {
    ensureFoundryDOM();
    const rack = document.getElementById('artificer-stage-rack');
    if (!rack) return;

    if (!isInBattleScreen() || !isArtificerActive()) {
      rack.classList.remove('visible');
      return;
    }

    rack.classList.add('visible');
    const constructs = getActiveConstructs();

    let html = `
      <button class="af-btn-schematics" id="af-open-rack-btn" title="View Foundry Schematics">
        📐 Schematics (${constructs.length} Active)
      </button>
    `;

    constructs.forEach((c) => {
      const kind = classifyConstruct(c);
      const icon = kind === 'mech' ? '🤖' : (kind === 'building' ? '🏭' : '🔫');
      const name = c && c.name ? c.name : 'Auto-Turret Drone';
      const stat = kind === 'mech' ? `${c.hp || 24}♥` : (kind === 'building' ? '+1⚙️/t' : `${c.dmg || 6} DMG`);

      html += `
        <div class="af-construct-chip type-${kind}">
          <span>${icon} ${name}</span>
          <span class="af-chip-stat">${stat}</span>
        </div>
      `;
    });

    rack.innerHTML = html;
    const openBtn = document.getElementById('af-open-rack-btn');
    if (openBtn) openBtn.addEventListener('click', openSchematicsModal);
  }

  // Listen to deployment / scrap toasts and end-turn firing
  function installHooks() {
    ensureFoundryDOM();
    ensureOverlayCanvas();
    requestAnimationFrame(renderConstructsFrame);

    if (typeof window.showToast === 'function' && !window.showToast.__afDroneHook) {
      const origToast = window.showToast;
      const wrapped = function (msg, ...rest) {
        const text = String(msg || '');
        const deployMatch = text.match(/Deployed\s+(.+?)\s*\((\d+)\s*\/\s*(\d+)\)/i);
        if (deployMatch) {
          const count = parseInt(deployMatch[2], 10) || 1;
          domObservedDrones = Array.from({ length: count }, (_, i) => ({
            id: `auto_turret_${i}`,
            name: `${deployMatch[1]} #${i + 1}`,
            archetype: classifyConstruct({ name: deployMatch[1] }),
            dmg: 6
          }));
        } else if (/scrap(?:ped)?\s+drone/i.test(text) && domObservedDrones.length > 0) {
          domObservedDrones.pop();
        }
        updateArtificerFoundryHUD();
        return origToast.apply(this, [msg, ...rest]);
      };
      wrapped.__afDroneHook = true;
      window.showToast = wrapped;
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-execute-sequence, #btn-end-turn, .btn-execute')) {
        const setup = ensureOverlayCanvas();
        if (setup) spawnDroneVolleyTracers(setup.w, setup.h);
      }
      setTimeout(updateArtificerFoundryHUD, 40);
    });

    setInterval(updateArtificerFoundryHUD, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHooks);
  } else {
    installHooks();
  }
})();
