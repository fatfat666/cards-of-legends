// --- ARTIFICER FOUNDRY UI: 6-CONSTRUCT STAGE MODELS & SCHEMATICS ---
(function () {
  const origRenderArtificerTurrets = typeof window.renderArtificerTurrets === 'function'
    ? window.renderArtificerTurrets
    : null;

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
        z-index: 15;
      }
      #artificer-stage-rack {
        position: absolute;
        top: 10px;
        left: 12px;
        z-index: 25;
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
      .af-bp-name { font-size: 0.88rem; font-weight: 900; color: #f8fafc; margin-top: 3px; }
      .af-bp-desc { font-size: 0.75rem; color: #cbd5e1; line-height: 1.38; }
      .af-bp-status { font-size: 0.68rem; font-weight: 800; color: #94a3b8; }
      .af-bp-status.deployed { color: #4ade80; }
    `;
    document.head.appendChild(style);
  }

  function classifyConstruct(item) {
    if (!item) return 'turret';
    const raw = `${item.type || ''} ${item.name || ''}`.toLowerCase();
    if (/goliath|mech/.test(raw)) return 'mech';
    if (/aegis|barrier|pylon|foundry/.test(raw)) return 'building';
    return 'turret';
  }

  // Uses actual DOM visibility instead of assuming .active class
  function isBattleVisible() {
    const battleEl = document.getElementById('screen-battle');
    if (battleEl && battleEl.offsetParent !== null && getComputedStyle(battleEl).display !== 'none') {
      return true;
    }
    return typeof gameState !== 'undefined' && gameState && !gameState.combatOver && Array.isArray(gameState.enemies) && gameState.enemies.length > 0;
  }

  function getActiveConstructs() {
    if (typeof gameState !== 'undefined' && gameState && Array.isArray(gameState.turrets)) {
      return gameState.turrets.filter(t => t && (typeof t.hp !== 'number' || t.hp > 0));
    }
    return [];
  }

  window.__getArtificerConstructs = getActiveConstructs;

  // =========================================================================
  // 2D HIGH-DPI STAGE OVERLAY RENDERER FOR ALL 6 CONSTRUCT TYPES
  // =========================================================================
  let overlayCanvas = null;
  let overlayCtx = null;
  window.__artificerStageCoords = [];

  function findBattleStageHost() {
    const pixiEl = document.getElementById('pixi-container');
    if (pixiEl && pixiEl.offsetParent !== null) {
      if (getComputedStyle(pixiEl).position === 'static') pixiEl.style.position = 'relative';
      return pixiEl;
    }
    const canvas = document.querySelector('#screen-battle canvas') || document.querySelector('canvas');
    if (canvas && canvas.parentElement) {
      const host = canvas.parentElement;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      return host;
    }
    return document.querySelector('#screen-battle .battle-stage-wrapper');
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

  function drawConstructModel(ctx, x, y, item, index, t) {
    const type = (item && item.type) || 'auto_turret';
    const label = (item && item.name) ? item.name.split(' ')[0].toUpperCase() : 'DRONE';

    ctx.save();
    ctx.translate(x, y);

    if (type === 'goliath_mech') {
      // Heavy Armored Goliath Mech
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 22, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-7, 6); ctx.lineTo(-9, 20);
      ctx.moveTo(7, 6);  ctx.lineTo(9, 20);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 22, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-6, -9, 14, 4);
    } else if (type === 'aegis_barrier') {
      // Aegis Force-Barrier Pylon
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, 18); ctx.lineTo(-8, -14); ctx.lineTo(8, -14); ctx.lineTo(12, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, 0, 20, -1.0, 1.0);
      ctx.stroke();
    } else if (type === 'arc_tesla') {
      // Arc Tesla Coil
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 10); ctx.lineTo(-5, -12); ctx.lineTo(5, -12); ctx.lineTo(10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c7d2fe';
      ctx.beginPath();
      ctx.arc(0, -15, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'heavy_rail') {
      // Heavy Railgun Turret
      ctx.fillStyle = '#082f49';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-12, -7, 22, 13, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(8, -6, 17, 2.5);
      ctx.fillRect(8, 1, 17, 2.5);
    } else if (type === 'inferno_flame') {
      // Inferno Flamethrower Turret
      ctx.fillStyle = '#431407';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-12, -8, 22, 15, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fb923c';
      ctx.fillRect(9, -5, 12, 8);
    } else {
      // Auto-Turret Drone (Hovering Quad-Rotor)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -8); ctx.lineTo(14, -8);
      ctx.stroke();

      const bladeW = 7 + Math.sin(t * 18 + index) * 3.5;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.72)';
      ctx.beginPath();
      ctx.ellipse(-14, -10, Math.abs(bladeW), 2.2, 0, 0, Math.PI * 2);
      ctx.ellipse(14, -10, Math.abs(bladeW), 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-11, -2); ctx.lineTo(-6, -8); ctx.lineTo(6, -8);
      ctx.lineTo(11, -2); ctx.lineTo(7, 5); ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, 1, 13, 3);
      ctx.fillRect(6, 5, 10, 2.5);

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(2, -1.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // HP Bar beneath construct
    if (typeof item.hp === 'number') {
      const maxHp = item.maxHp || Math.max(item.hp, 10);
      const pct = Math.max(0, Math.min(1, item.hp / maxHp));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-14, 12, 28, 4);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-14, 12, 28 * pct, 4);
    }

    // Label above construct
    ctx.font = '800 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#020617';
    ctx.fillText(label, 1, -17);
    ctx.fillStyle = '#fde047';
    ctx.fillText(label, 0, -18);

    ctx.restore();
  }

  function renderConstructsLoop() {
    requestAnimationFrame(renderConstructsLoop);

    const setup = ensureOverlayCanvas();
    if (!setup || !setup.ctx) return;

    const { ctx, w, h, dpr } = setup;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (!isBattleVisible()) {
      ctx.restore();
      return;
    }

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

      constructs.forEach((item, idx) => {
        const kind = classifyConstruct(item);
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const drawX = Math.min(w * 0.48, heroX + 48 + col * 48);
        const drawY = Math.max(32, Math.min(h - 26, heroY - 38 + row * 38)) + Math.sin(t + idx * 1.1) * 2.6;

        drawConstructModel(ctx, drawX, drawY, item, idx, t);

        window.__artificerStageCoords.push({
          index: idx,
          name: item.name || item.type,
          archetype: kind,
          x: drawX,
          y: drawY
        });
      });
    }

    ctx.restore();
  }

  window.renderArtificerTurrets = function () {
    if (origRenderArtificerTurrets) {
      try { origRenderArtificerTurrets.apply(this, arguments); } catch (e) {}
    }
    ensureOverlayCanvas();
    updateArtificerFoundryHUD();
  };

  // =========================================================================
  // SCHEMATICS MODAL & TOP-LEFT STAGE RACK
  // =========================================================================
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
            Play Construct Schematic Tome cards in battle to deploy specialized Turrets, Mechs, and Force-Barriers into your Foundry Bays.
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
    }
  }

  function openSchematicsModal() {
    ensureFoundryDOM();
    const grid = document.getElementById('af-schematics-grid');
    const partsPill = document.getElementById('af-modal-parts');
    if (partsPill && typeof gameState !== 'undefined' && gameState && gameState.player) {
      partsPill.textContent = `⚙️ Parts: ${gameState.player.parts || 0}/6`;
    }

    const catalog = (typeof CONSTRUCT_CATALOG !== 'undefined' && CONSTRUCT_CATALOG) ? Object.values(CONSTRUCT_CATALOG) : [];
    const active = getActiveConstructs();

    if (grid) {
      grid.innerHTML = catalog.map(spec => {
        const count = active.filter(c => c.type === spec.type).length;
        return `
          <div class="af-bp-card">
            <div>
              <div class="af-bp-top">
                <span class="af-bp-badge">${spec.defaultHp || 10} HP</span>
              </div>
              <div class="af-bp-name">${spec.name}</div>
            </div>
            <div class="af-bp-desc">${spec.desc || ''}</div>
            <div class="af-bp-status ${count > 0 ? 'deployed' : ''}">
              ${count > 0 ? `● ${count} Deployed on Field` : '○ Ready in Schematic Deck'}
            </div>
          </div>
        `;
      }).join('');
    }

    document.getElementById('modal-artificer-schematics').classList.add('open');
  }

  function updateArtificerFoundryHUD() {
    ensureFoundryDOM();
    const rack = document.getElementById('artificer-stage-rack');
    if (!rack) return;

    const isArtificer = typeof gameState !== 'undefined' && gameState &&
      (gameState.classType === 'Artificer' || getActiveConstructs().length > 0);

    if (!isBattleVisible() || !isArtificer) {
      rack.classList.remove('visible');
      return;
    }

    rack.classList.add('visible');
    const constructs = getActiveConstructs();
    const maxBays = typeof getMaxTurrets === 'function' ? getMaxTurrets() : 3;

    let html = `
      <button class="af-btn-schematics" id="af-open-rack-btn">
        📐 Bays (${constructs.length}/${maxBays})
      </button>
    `;

    constructs.forEach(c => {
      const kind = classifyConstruct(c);
      const icon = kind === 'mech' ? '🤖' : (kind === 'building' ? '🛡️' : '🔫');
      html += `
        <div class="af-construct-chip type-${kind}">
          <span>${icon} ${c.name || 'Construct'}</span>
          <span class="af-chip-stat">${c.hp}/${c.maxHp || c.hp}♥</span>
        </div>
      `;
    });

    rack.innerHTML = html;
    const openBtn = document.getElementById('af-open-rack-btn');
    if (openBtn) openBtn.addEventListener('click', openSchematicsModal);
  }

  function initFoundryUI() {
    ensureFoundryDOM();
    ensureOverlayCanvas();
    requestAnimationFrame(renderConstructsLoop);
    setInterval(updateArtificerFoundryHUD, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFoundryUI);
  } else {
    initFoundryUI();
  }
})();
