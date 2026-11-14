// --- ARTIFICER FOUNDRY UI: TURRETS, MECHS, BUILDINGS & 6-CONSTRUCT SCHEMATICS ---
(function () {
  // 1. Inject Blueprint HUD & Modal Styles (MacBook 100dvh safe)
  if (!document.getElementById('artificer-foundry-css')) {
    const style = document.createElement('style');
    style.id = 'artificer-foundry-css';
    style.textContent = `
      /* Compact top-left stage overlay bar (0px vertical layout push) */
      #artificer-stage-rack {
        position: absolute;
        top: 10px;
        left: 12px;
        z-index: 18;
        display: none;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        max-width: 62%;
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
        transition: transform 0.12s ease, box-shadow 0.12s ease;
      }
      .af-btn-schematics:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(56, 189, 248, 0.55);
      }

      /* Active Construct Chips */
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
        backdrop-filter: blur(4px);
        transition: transform 0.12s ease;
      }
      .af-construct-chip:hover {
        transform: translateY(-1px);
      }
      .af-construct-chip.type-turret {
        border: 1px solid #38bdf8;
        box-shadow: inset 0 0 8px rgba(56, 189, 248, 0.22);
      }
      .af-construct-chip.type-mech {
        border: 1px solid #f59e0b;
        box-shadow: inset 0 0 8px rgba(245, 158, 11, 0.24);
      }
      .af-construct-chip.type-building {
        border: 1px solid #10b981;
        box-shadow: inset 0 0 8px rgba(16, 185, 129, 0.24);
      }
      .af-construct-chip.overcharged {
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.55);
      }

      .af-chip-stat {
        font-size: 0.66rem;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.08);
      }
      .type-turret .af-chip-stat { color: #7dd3fc; }
      .type-mech .af-chip-stat { color: #fcd34d; }
      .type-building .af-chip-stat { color: #6ee7b7; }

      .af-mech-hp-bar {
        width: 34px;
        height: 4px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 99px;
        overflow: hidden;
      }
      .af-mech-hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #f59e0b, #fde047);
      }

      /* 6-Construct Foundry Schematics Modal */
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
      #modal-artificer-schematics.open {
        display: flex;
      }

      .af-blueprint-panel {
        width: 100%;
        max-width: 820px;
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
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 25px rgba(14, 165, 233, 0.25);
        color: #f1f5f9;
      }

      .af-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(56, 189, 248, 0.25);
        padding-bottom: 10px;
        margin-bottom: 12px;
      }
      .af-panel-title {
        font-size: 1.05rem;
        font-weight: 900;
        letter-spacing: 0.04em;
        color: #38bdf8;
        display: flex;
        align-items: center;
        gap: 8px;
      }
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
      .af-close-btn:hover {
        background: rgba(239, 68, 68, 0.25);
        border-color: #f87171;
      }

      /* Filter Tabs */
      .af-filter-tabs {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
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
      .af-tab.active {
        background: #0284c7;
        border-color: #7dd3fc;
        color: #ffffff;
      }

      /* 6-Construct Blueprint Grid */
      .af-schematics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
        gap: 10px;
      }
      .af-bp-card {
        background: rgba(15, 23, 42, 0.92);
        border-radius: 10px;
        padding: 11px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        position: relative;
      }
      .af-bp-card.archetype-turret { border: 1px solid rgba(56, 189, 248, 0.55); }
      .af-bp-card.archetype-mech { border: 1px solid rgba(245, 158, 11, 0.6); }
      .af-bp-card.archetype-building { border: 1px solid rgba(16, 185, 129, 0.6); }
      .af-bp-card.locked {
        opacity: 0.52;
        filter: grayscale(0.65);
      }

      .af-bp-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .af-bp-badge {
        font-size: 0.62rem;
        font-weight: 900;
        letter-spacing: 0.06em;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
      }
      .archetype-turret .af-bp-badge { background: rgba(56, 189, 248, 0.18); color: #7dd3fc; }
      .archetype-mech .af-bp-badge { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
      .archetype-building .af-bp-badge { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }

      .af-bp-cost {
        font-size: 0.72rem;
        font-weight: 800;
        color: #fde047;
      }
      .af-bp-name {
        font-size: 0.88rem;
        font-weight: 900;
        color: #f8fafc;
        margin-top: 2px;
      }
      .af-bp-desc {
        font-size: 0.75rem;
        color: #cbd5e1;
        line-height: 1.38;
      }
      .af-bp-overcharge {
        font-size: 0.70rem;
        color: #fde047;
        background: rgba(250, 204, 21, 0.09);
        border-left: 2px solid #facc15;
        padding: 4px 7px;
        border-radius: 0 5px 5px 0;
      }
      .af-bp-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;
      }
      .af-bp-status {
        font-size: 0.68rem;
        font-weight: 800;
        color: #94a3b8;
      }
      .af-bp-status.deployed {
        color: #4ade80;
      }
      .af-bp-craft-btn {
        background: linear-gradient(135deg, #0284c7, #2563eb);
        border: 1px solid #7dd3fc;
        color: #fff;
        font-size: 0.70rem;
        font-weight: 800;
        padding: 4px 9px;
        border-radius: 6px;
        cursor: pointer;
      }
      .af-bp-craft-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // 2. CANONICAL 6-CONSTRUCT FOUNDRY SCHEMATICS & ARCHETYPE CLASSIFIER
  // =========================================================================
  const DEFAULT_FOUNDRY_SCHEMATICS = [
    {
      id: 'auto_turret',
      name: 'Auto-Turret Mk.I',
      archetype: 'turret',
      icon: '🔫',
      cost: 2,
      desc: 'End of Turn: Fires high-velocity rounds for 6 DMG to front enemy.',
      overcharge: 'Overcharge: Fires twice (2x 6 DMG) & applies 1 Vulnerable.'
    },
    {
      id: 'tesla_coil',
      name: 'Arc Tesla Coil',
      archetype: 'turret',
      icon: '⚡',
      cost: 3,
      desc: 'End of Turn: Zaps ALL enemies for 5 Shock DMG (ignores 50% Shield).',
      overcharge: 'Overcharge: Chain lightning hits for 9 DMG & grants +1 Energy next turn.'
    },
    {
      id: 'aegis_mech',
      name: 'Aegis Vanguard Mech',
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
      archetype: 'building',
      icon: '🏭',
      cost: 2,
      desc: 'Building: Generates +1 ⚙️ Part & +4 Armor Shield at the start of every turn.',
      overcharge: 'Overcharge: Immediately fabricates +2 ⚙️ Parts & draws 1 card.'
    },
    {
      id: 'aegis_pylon',
      name: 'Chrono-Shield Pylon',
      archetype: 'building',
      icon: '🗼',
      cost: 3,
      desc: 'Building: Projects a barrier granting +8 Shield & 25% Retaliation Thorns.',
      overcharge: 'Overcharge: Pulses +16 Shield to Hero & repairs all Mechs for +8 HP.'
    }
  ];

  function classifyConstruct(item) {
    if (!item) return 'turret';
    const raw = `${item.archetype || ''} ${item.category || ''} ${item.type || ''} ${item.name || ''}`.toLowerCase();
    if (/mech|walker|golem|titan|exo|suit|vanguard|juggernaut/.test(raw)) return 'mech';
    if (/building|foundry|pylon|generator|reactor|bay|forge|bunker|tower|wall/.test(raw)) return 'building';
    return 'turret';
  }

  function getActiveConstructs() {
    if (typeof gameState === 'undefined' || !gameState) return [];
    const list = gameState.turrets || gameState.constructs || gameState.artificerTurrets || [];
    return Array.isArray(list) ? list : [];
  }

  function getPartsInfo() {
    if (typeof gameState !== 'undefined' && gameState) {
      if (typeof gameState.parts === 'number') {
        return { current: gameState.parts, max: gameState.maxParts || 6 };
      }
      if (typeof gameState.scrapParts === 'number') {
        return { current: gameState.scrapParts, max: gameState.maxScrapParts || 6 };
      }
    }
    const el = document.getElementById('ui-parts');
    if (el && el.textContent.includes('/')) {
      const [c, m] = el.textContent.split('/').map(n => parseInt(n, 10) || 0);
      return { current: c, max: m || 6 };
    }
    return { current: 0, max: 6 };
  }

  function getSchematicsRoster() {
    const active = getActiveConstructs();
    const stateSchems = (typeof gameState !== 'undefined' && gameState)
      ? (gameState.schematics || gameState.foundrySchematics || gameState.unlockedSchematics)
      : null;

    const baseList = (Array.isArray(stateSchems) && stateSchems.length > 0)
      ? stateSchems.map((s, i) => {
          if (typeof s === 'string') {
            const match = DEFAULT_FOUNDRY_SCHEMATICS.find(d => d.id === s || d.name.toLowerCase() === s.toLowerCase());
            return match || { id: `custom_${i}`, name: s, archetype: classifyConstruct({ name: s }), icon: '⚙️', cost: 2, desc: 'Foundry Construct Schematic.', overcharge: 'Overcharge: Enhances construct output.' };
          }
          return Object.assign({
            archetype: classifyConstruct(s),
            icon: classifyConstruct(s) === 'mech' ? '🤖' : (classifyConstruct(s) === 'building' ? '🏭' : '🔫'),
            cost: s.cost || s.partCost || 2,
            desc: s.desc || s.description || 'Deployable Artificer Construct.',
            overcharge: s.overcharge || 'Overcharge: Boosts output & durability.'
          }, s);
        })
      : DEFAULT_FOUNDRY_SCHEMATICS;

    return baseList.map(bp => {
      const deployedCount = active.filter(c =>
        c && String(c.name || '').toLowerCase().includes(bp.name.split(' ')[0].toLowerCase())
      ).length;
      return Object.assign({}, bp, { unlocked: bp.unlocked !== false, deployedCount });
    });
  }

  // =========================================================================
  // 3. CUSTOM PIXIJS STAGE SILHOUETTES FOR TURRETS, MECHS & BUILDINGS
  // =========================================================================
  let foundryStageLayer = null;

  window.renderArtificerTurrets = function () {
    if (typeof pixiApp === 'undefined' || !pixiApp || !pixiApp.stage) return;

    if (!foundryStageLayer || foundryStageLayer.destroyed) {
      foundryStageLayer = new PIXI.Container();
      foundryStageLayer.zIndex = 17;
      pixiApp.stage.addChild(foundryStageLayer);
    }
    foundryStageLayer.removeChildren();

    const constructs = getActiveConstructs();
    if (!constructs.length) return;

    const cEl = document.getElementById('pixi-container');
    const w = (cEl && cEl.clientWidth) || pixiApp.screen.width || 860;
    const h = (cEl && cEl.clientHeight) || pixiApp.screen.height || 220;
    const heroX = (typeof playerContainer !== 'undefined' && playerContainer && playerContainer.x) ? playerContainer.x : Math.round(w * 0.22);
    const heroY = (typeof playerContainer !== 'undefined' && playerContainer && playerContainer.y) ? playerContainer.y : Math.round(h * 0.62);

    let turretIdx = 0;
    let mechIdx = 0;
    let buildingIdx = 0;

    constructs.forEach((item, idx) => {
      const kind = classifyConstruct(item);
      const isOvercharged = Boolean(item && (item.overcharged || item.upgraded || (item.level && item.level > 1)));
      const rig = new PIXI.Container();
      rig.__phase = idx * 0.9;

      if (kind === 'mech') {
        // --- MECH: Heavy Vanguard Walker positioned ahead of the Artificer ---
        rig.x = Math.min(w * 0.48, Math.round(heroX + 68 + mechIdx * 42));
        rig.y = Math.min(h - 24, Math.round(heroY + 6 - mechIdx * 16));
        rig.__baseY = rig.y;
        rig.__bobAmp = 1.5;

        const armorColor = isOvercharged ? 0xfacc15 : 0xf59e0b;
        const g = new PIXI.Graphics();

        // Mech shadow & hydraulic legs
        g.beginFill(0x000000, 0.45);
        g.drawEllipse(0, 22, 16, 5);
        g.endFill();

        g.lineStyle(3.5, 0x94a3b8, 1);
        g.moveTo(-7, 6); g.lineTo(-9, 20);
        g.moveTo(7, 6);  g.lineTo(9, 20);

        // Armored torso + shoulder pauldrons
        g.beginFill(0x1e293b, 0.98);
        g.lineStyle(2.2, armorColor, 1);
        g.drawRoundedRect(-14, -14, 28, 22, 5);
        g.endFill();

        g.beginFill(armorColor, 0.9);
        g.drawRoundedRect(-18, -16, 8, 10, 3);
        g.drawRoundedRect(10, -16, 8, 10, 3);
        g.endFill();

        // Glowing visor eye
        g.beginFill(0x38bdf8, 1);
        g.drawRect(-6, -9, 14, 4);
        g.endFill();
        rig.addChild(g);

        // Mini HP bar below Mech
        if (typeof item.hp === 'number') {
          const maxHp = item.maxHp || Math.max(item.hp, 24);
          const ratio = Math.max(0, Math.min(1, item.hp / maxHp));
          const hpBar = new PIXI.Graphics();
          hpBar.beginFill(0x0f172a, 0.9);
          hpBar.drawRect(-14, 25, 28, 4);
          hpBar.beginFill(0xf59e0b, 1);
          hpBar.drawRect(-14, 25, 28 * ratio, 4);
          hpBar.endFill();
          rig.addChild(hpBar);
        }

        mechIdx++;
      } else if (kind === 'building') {
        // --- BUILDING: Anchored Hexagonal Energy Pylon behind/beside Hero ---
        rig.x = Math.max(28, Math.round(heroX - 48 - buildingIdx * 34));
        rig.y = Math.min(h - 24, Math.round(heroY + 4 - buildingIdx * 24));
        rig.__baseY = rig.y;
        rig.__bobAmp = 0; // Buildings stay firmly anchored

        const bColor = isOvercharged ? 0x34d399 : 0x10b981;
        const g = new PIXI.Graphics();

        // Base foundation
        g.beginFill(0x064e3b, 0.95);
        g.lineStyle(2, bColor, 1);
        g.drawPolygon([-14, 18, -10, -14, 10, -14, 14, 18]);
        g.endFill();

        // Pulsing energy crystal spire
        g.beginFill(0xa7f3d0, 1);
        g.drawPolygon([0, -24, 6, -14, 0, -6, -6, -14]);
        g.endFill();

        // Aura ring
        g.lineStyle(1.5, bColor, 0.45);
        g.drawEllipse(0, 18, 20, 6);
        rig.addChild(g);

        buildingIdx++;
      } else {
        // --- TURRET: Floating Hover-Pod in an arc above the Artificer ---
        rig.x = Math.min(w * 0.46, Math.round(heroX + 46 + (turretIdx % 3) * 40));
        rig.y = Math.max(36, Math.round(heroY - 54 - Math.floor(turretIdx / 3) * 34));
        rig.__baseY = rig.y;
        rig.__bobAmp = 2.8;

        const tColor = isOvercharged ? 0xfacc15 : 0x38bdf8;
        const g = new PIXI.Graphics();

        // Hover thruster glow
        g.beginFill(tColor, 0.35);
        g.drawEllipse(0, 11, 10, 3.5);
        g.endFill();

        // Sleek turret pod & dual barrels
        g.beginFill(0x0f172a, 0.96);
        g.lineStyle(2, tColor, 1);
        g.drawRoundedRect(-12, -8, 24, 14, 6);
        g.endFill();

        g.beginFill(tColor, 1);
        g.drawRect(10, -5, 11, 3);
        g.drawRect(10, 0, 9, 3);
        g.endFill();

        g.beginFill(0xe0f2fe, 1);
        g.drawCircle(-2, -1, 3.5);
        g.endFill();
        rig.addChild(g);

        turretIdx++;
      }

      // Label tag above each construct
      const labelColor = kind === 'mech' ? '#fcd34d' : (kind === 'building' ? '#6ee7b7' : '#7dd3fc');
      const shortName = item && item.name ? String(item.name).split(' ')[0] : kind.toUpperCase();
      const tag = new PIXI.Text(shortName, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 9,
        fontWeight: '800',
        fill: labelColor,
        stroke: '#020617',
        strokeThickness: 3
      });
      tag.anchor.set(0.5);
      tag.y = kind === 'building' ? -31 : -22;
      rig.addChild(tag);

      foundryStageLayer.addChild(rig);
    });

    if (!pixiApp.__foundryBobTicker) {
      pixiApp.__foundryBobTicker = true;
      pixiApp.ticker.add(() => {
        if (!foundryStageLayer || !foundryStageLayer.children) return;
        const t = performance.now() * 0.004;
        foundryStageLayer.children.forEach(c => {
          if (c.__bobAmp && typeof c.__baseY === 'number') {
            c.y = c.__baseY + Math.sin(t + (c.__phase || 0)) * c.__bobAmp;
          }
        });
      });
    }
  };

  // =========================================================================
  // 4. DOM STAGE RACK & 6-CONSTRUCT SCHEMATICS BLUEPRINT MODAL
  // =========================================================================
  let currentFilter = 'all';

  function ensureFoundryDOM() {
    const stageWrapper = document.querySelector('#screen-battle .battle-stage-wrapper');
    if (stageWrapper && !document.getElementById('artificer-stage-rack')) {
      const rack = document.createElement('div');
      rack.id = 'artificer-stage-rack';
      stageWrapper.appendChild(rack);
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
          <div class="af-filter-tabs" id="af-filter-tabs">
            <button class="af-tab active" data-filter="all">All Blueprints (6)</button>
            <button class="af-tab" data-filter="turret">🔫 Turrets</button>
            <button class="af-tab" data-filter="mech">🤖 Mechs</button>
            <button class="af-tab" data-filter="building">🏭 Buildings</button>
          </div>
          <div class="af-schematics-grid" id="af-schematics-grid"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSchematicsModal();
      });
      document.getElementById('af-close-modal').addEventListener('click', closeSchematicsModal);

      document.getElementById('af-filter-tabs').addEventListener('click', (e) => {
        const btn = e.target.closest('.af-tab');
        if (!btn) return;
        currentFilter = btn.dataset.filter || 'all';
        document.querySelectorAll('#af-filter-tabs .af-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        renderSchematicsModalGrid();
      });
    }

    // Make top HUD Parts badge clickable to open Schematics anytime
    const partsBadge = document.getElementById('ui-parts-badge');
    if (partsBadge && !partsBadge.__afBound) {
      partsBadge.__afBound = true;
      partsBadge.style.cursor = 'pointer';
      partsBadge.title = 'Open 6-Construct Foundry Schematics';
      partsBadge.addEventListener('click', openSchematicsModal);
    }
  }

  function openSchematicsModal() {
    ensureFoundryDOM();
    renderSchematicsModalGrid();
    document.getElementById('modal-artificer-schematics').classList.add('open');
  }

  function closeSchematicsModal() {
    const m = document.getElementById('modal-artificer-schematics');
    if (m) m.classList.remove('open');
  }

  function tryFabricateSchematic(bp) {
    const parts = getPartsInfo();
    if (parts.current < bp.cost) return;

    // Hook into native game craft/deploy function if present
    if (typeof window.fabricateConstruct === 'function') {
      window.fabricateConstruct(bp.id);
    } else if (typeof window.deploySchematic === 'function') {
      window.deploySchematic(bp.id);
    } else if (typeof gameState !== 'undefined' && gameState) {
      // Safe fallback deployment into gameState.turrets
      if (typeof gameState.parts === 'number') gameState.parts -= bp.cost;
      else if (typeof gameState.scrapParts === 'number') gameState.scrapParts -= bp.cost;

      if (!Array.isArray(gameState.turrets)) gameState.turrets = [];
      gameState.turrets.push({
        id: bp.id,
        name: bp.name,
        archetype: bp.archetype,
        hp: bp.hp || undefined,
        maxHp: bp.hp || undefined,
        dmg: bp.archetype === 'turret' ? 6 : (bp.archetype === 'mech' ? 5 : 0),
        shield: bp.archetype === 'building' ? 4 : 0
      });
      if (typeof updateBattleUI === 'function') updateBattleUI();
    }

    window.renderArtificerTurrets();
    updateArtificerFoundryHUD();
    renderSchematicsModalGrid();
  }

  function renderSchematicsModalGrid() {
    const grid = document.getElementById('af-schematics-grid');
    if (!grid) return;

    const parts = getPartsInfo();
    const partsPill = document.getElementById('af-modal-parts');
    if (partsPill) partsPill.textContent = `⚙️ Parts: ${parts.current}/${parts.max}`;

    const roster = getSchematicsRoster().filter(bp =>
      currentFilter === 'all' || bp.archetype === currentFilter
    );

    const inBattle = typeof gameState !== 'undefined' && gameState && gameState.screen === 'BATTLE';

    grid.innerHTML = roster.map(bp => {
      const canCraft = inBattle && bp.unlocked && parts.current >= bp.cost;
      const btnLabel = !bp.unlocked
        ? '🔒 Locked'
        : (!inBattle
            ? 'In Battle Only'
            : (parts.current < bp.cost ? `Need ${bp.cost} ⚙️` : `🔨 Build (${bp.cost} ⚙️)`));

      return `
        <div class="af-bp-card archetype-${bp.archetype} ${bp.unlocked ? '' : 'locked'}">
          <div>
            <div class="af-bp-top">
              <span class="af-bp-badge">${bp.icon} ${bp.archetype}</span>
              <span class="af-bp-cost">⚙️ ${bp.cost} Parts</span>
            </div>
            <div class="af-bp-name">${bp.name}</div>
          </div>
          <div class="af-bp-desc">${bp.desc}</div>
          <div class="af-bp-overcharge">⚡ ${bp.overcharge}</div>
          <div class="af-bp-footer">
            <span class="af-bp-status ${bp.deployedCount > 0 ? 'deployed' : ''}">
              ${bp.deployedCount > 0 ? `● ${bp.deployedCount} Active on Field` : '○ Standby'}
            </span>
            <button class="af-bp-craft-btn" data-bp-id="${bp.id}" ${canCraft ? '' : 'disabled'}>
              ${btnLabel}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.af-bp-craft-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const bp = roster.find(item => item.id === btn.dataset.bpId);
        if (bp) tryFabricateSchematic(bp);
      });
    });
  }

  function updateArtificerFoundryHUD() {
    ensureFoundryDOM();
    const rack = document.getElementById('artificer-stage-rack');
    if (!rack) return;

    const isArtificer = typeof gameState !== 'undefined' && gameState &&
      (gameState.classType === 'Artificer' || getActiveConstructs().length > 0);

    if (!isArtificer) {
      rack.classList.remove('visible');
      return;
    }

    rack.classList.add('visible');
    const constructs = getActiveConstructs();
    const roster = getSchematicsRoster();
    const unlockedCount = roster.filter(r => r.unlocked).length;

    let html = `
      <button class="af-btn-schematics" id="af-open-rack-btn" title="View 6-Construct Foundry Schematics">
        📐 Schematics (${unlockedCount}/6)
      </button>
    `;

    constructs.forEach((c) => {
      const kind = classifyConstruct(c);
      const isOvercharged = Boolean(c && (c.overcharged || c.upgraded || (c.level && c.level > 1)));
      const icon = kind === 'mech' ? '🤖' : (kind === 'building' ? '🏭' : '🔫');
      const name = c && c.name ? c.name : kind.toUpperCase();

      let statBadge = '';
      if (kind === 'mech') {
        const hp = typeof c.hp === 'number' ? c.hp : 24;
        const maxHp = c.maxHp || Math.max(hp, 24);
        const pct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
        statBadge = `
          <span class="af-chip-stat">${hp}♥</span>
          <span class="af-mech-hp-bar"><span class="af-mech-hp-fill" style="width:${pct}%"></span></span>
        `;
      } else if (kind === 'building') {
        const yieldTxt = c.shield ? `+${c.shield}🛡️` : '+1⚙️/t';
        statBadge = `<span class="af-chip-stat">${yieldTxt}</span>`;
      } else {
        const dmg = c.dmg || c.damage || 6;
        statBadge = `<span class="af-chip-stat">${dmg} DMG</span>`;
      }

      html += `
        <div class="af-construct-chip type-${kind} ${isOvercharged ? 'overcharged' : ''}" title="Click to inspect Foundry Blueprints">
          <span>${icon} ${name}${isOvercharged ? ' ⚡' : ''}</span>
          ${statBadge}
        </div>
      `;
    });

    rack.innerHTML = html;

    const openBtn = document.getElementById('af-open-rack-btn');
    if (openBtn) openBtn.addEventListener('click', openSchematicsModal);
    rack.querySelectorAll('.af-construct-chip').forEach(chip => {
      chip.addEventListener('click', openSchematicsModal);
    });
  }

  window.openArtificerSchematics = openSchematicsModal;
  window.updateArtificerFoundryHUD = updateArtificerFoundryHUD;

  // Hook into updateBattleUI & poll lightly during active Artificer battles
  function installFoundryHooks() {
    ensureFoundryDOM();
    if (typeof window.updateBattleUI === 'function' && !window.updateBattleUI.__afWrapped) {
      const orig = window.updateBattleUI;
      const wrapped = function (...args) {
        const res = orig.apply(this, args);
        updateArtificerFoundryHUD();
        window.renderArtificerTurrets();
        return res;
      };
      wrapped.__afWrapped = true;
      window.updateBattleUI = wrapped;
    }
    updateArtificerFoundryHUD();
  }

  setInterval(() => {
    if (typeof gameState !== 'undefined' && gameState && gameState.screen === 'BATTLE') {
      updateArtificerFoundryHUD();
    }
  }, 300);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installFoundryHooks);
  } else {
    installFoundryHooks();
  }
})();