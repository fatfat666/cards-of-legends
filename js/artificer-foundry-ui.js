// --- ARTIFICER FOUNDRY UI: DRONES, TURRETS, MECHS, BUILDINGS & SCHEMATICS ---
(function () {
  if (!document.getElementById('artificer-foundry-css')) {
    const style = document.createElement('style');
    style.id = 'artificer-foundry-css';
    style.textContent = `
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
        transition: transform 0.12s ease, box-shadow 0.12s ease;
      }
      .af-btn-schematics:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(56, 189, 248, 0.55);
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
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 25px rgba(14, 165, 233, 0.25);
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
        flex-wrap: wrap;
      }
      .af-panel-title {
        font-size: 1.02rem;
        font-weight: 900;
        letter-spacing: 0.04em;
        color: #38bdf8;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .af-panel-subtitle {
        font-size: 0.74rem;
        color: #94a3b8;
        margin-bottom: 10px;
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
      .af-schematics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 10px;
      }
      .af-bp-card {
        background: rgba(15, 23, 42, 0.94);
        border-radius: 10px;
        padding: 11px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 7px;
        position: relative;
        transition: border-color 0.15s ease, opacity 0.15s ease;
      }
      .af-bp-card.archetype-turret { border: 1px solid rgba(56, 189, 248, 0.55); }
      .af-bp-card.archetype-mech { border: 1px solid rgba(245, 158, 11, 0.6); }
      .af-bp-card.archetype-building { border: 1px solid rgba(16, 185, 129, 0.6); }
      .af-bp-card.locked {
        border-color: rgba(100, 116, 139, 0.45);
        background: rgba(9, 13, 24, 0.88);
      }
      .af-bp-card.locked .af-bp-desc,
      .af-bp-card.locked .af-bp-overcharge {
        opacity: 0.55;
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
        margin-top: 3px;
      }
      .af-card-req {
        font-size: 0.69rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 5px;
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
        gap: 6px;
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
        white-space: nowrap;
      }
      .af-bp-craft-btn:disabled {
        background: rgba(30, 41, 59, 0.9);
        border-color: rgba(100, 116, 139, 0.4);
        color: #94a3b8;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // 2. CANONICAL 6-CONSTRUCT FOUNDRY SCHEMATICS & UNIVERSAL STATE SCANNER
  // =========================================================================
  const DEFAULT_FOUNDRY_SCHEMATICS = [
    {
      id: 'auto_turret',
      name: 'Auto-Turret Drone',
      cardForm: 'Auto-Turret / Sentry Card',
      keywords: ['auto-turret', 'auto turret', 'drone', 'sentry', 'gatling', 'turret mk', 'deploy turret'],
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
      keywords: ['tesla', 'arc coil', 'shock turret', 'volt turret', 'lightning coil'],
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
      keywords: ['aegis mech', 'vanguard', 'guard mech', 'shield mech', 'defender mech', 'exo'],
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
      keywords: ['siege', 'walker', 'hellfire', 'mortar', 'juggernaut', 'titan mech'],
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
      keywords: ['scrap foundry', 'foundry', 'fabricator', 'salvage bay', 'assembly', 'generator'],
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
      keywords: ['pylon', 'chrono-shield', 'barrier tower', 'shield tower', 'bunker', 'fortress'],
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
    if (/mech|walker|golem|titan|exo|suit|vanguard|juggernaut|dreadnought/.test(raw)) return 'mech';
    if (/building|foundry|pylon|generator|reactor|bay|forge|bunker|tower|wall/.test(raw)) return 'building';
    return 'turret';
  }

  function isArtificerActive() {
    if (typeof gameState !== 'undefined' && gameState) {
      const clsStr = `${gameState.classType || ''} ${gameState.heroClass || ''} ${gameState.class || ''} ${gameState.selectedClass || ''} ${gameState.playerClass || ''} ${(gameState.player && gameState.player.classType) || ''}`.toLowerCase();
      if (clsStr.includes('artificer')) return true;
    }
    if (document.getElementById('ui-parts') || document.getElementById('ui-parts-badge')) return true;
    return getActiveConstructs().length > 0;
  }

  // Finds deployed Drones, Turrets, Mechs, or Buildings regardless of property key
  function getActiveConstructs() {
    const explicitPools = [];

    if (typeof gameState !== 'undefined' && gameState) {
      explicitPools.push(
        gameState.drones,
        gameState.activeDrones,
        gameState.playerDrones,
        gameState.turrets,
        gameState.activeTurrets,
        gameState.playerTurrets,
        gameState.artificerTurrets,
        gameState.constructs,
        gameState.activeConstructs,
        gameState.summons,
        gameState.allies,
        gameState.bots,
        gameState.mechs,
        gameState.buildings,
        gameState.deployed,
        gameState.player && gameState.player.drones,
        gameState.player && gameState.player.turrets,
        gameState.player && gameState.player.constructs,
        gameState.player && gameState.player.summons
      );
    }

    // Also check top-level globals if combat.js stores drones outside gameState
    ['drones', 'activeDrones', 'turrets', 'activeTurrets', 'constructs', 'activeConstructs'].forEach(gKey => {
      if (Array.isArray(window[gKey])) explicitPools.push(window[gKey]);
    });

    for (const list of explicitPools) {
      if (Array.isArray(list) && list.length > 0) {
        const alive = list.filter(item => item && (typeof item.hp !== 'number' || item.hp > 0));
        if (alive.length > 0) return alive;
      }
    }

    // Fallback: dynamically scan gameState arrays for any construct/drone objects
    if (typeof gameState !== 'undefined' && gameState) {
      const ignoreKeys = new Set([
        'deck', 'hand', 'drawPile', 'discardPile', 'exhaustPile', 'vault', 'sequence',
        'enemies', 'relics', 'shopItems', 'rewards', 'map', 'nodes', 'log', 'history',
        'unlockedSchematics', 'enforcers', 'goons'
      ]);
      for (const [key, val] of Object.entries(gameState)) {
        if (ignoreKeys.has(key) || !Array.isArray(val) || val.length === 0) continue;
        const sample = val[0];
        if (sample && typeof sample === 'object') {
          const text = `${key} ${sample.id || ''} ${sample.name || ''} ${sample.type || ''} ${sample.archetype || ''}`.toLowerCase();
          if (/drone|turret|construct|mech|walker|pylon|foundry|coil|bot|sentry/.test(text)) {
            return val.filter(item => item && (typeof item.hp !== 'number' || item.hp > 0));
          }
        }
      }
    }

    return [];
  }

  window.__getArtificerConstructs = getActiveConstructs;

  function collectPlayerCards() {
    if (typeof gameState === 'undefined' || !gameState) return [];
    const pools = [
      gameState.deck,
      gameState.hand,
      gameState.drawPile,
      gameState.discardPile,
      gameState.vault,
      gameState.sequence,
      gameState.exhaustPile
    ];
    const all = [];
    pools.forEach(pool => {
      if (Array.isArray(pool)) {
        pool.forEach(c => {
          if (c) all.push(typeof c === 'string' ? { name: c } : c);
        });
      }
    });
    return all;
  }

  function matchCardToSchematic(card, bp) {
    if (!card || !bp) return false;
    const cName = String(card.name || card.title || '').toLowerCase();
    const cId = String(card.id || '').toLowerCase();
    const cDesc = String(card.desc || card.description || '').toLowerCase();
    const cTags = `${card.type || ''} ${card.subType || ''} ${card.tag || ''}`.toLowerCase();

    if (!cName && !cId) return false;
    if (cId && cId.includes(bp.id)) return true;
    if (Array.isArray(bp.keywords) && bp.keywords.some(kw => cName.includes(kw) || cId.includes(kw))) {
      return true;
    }

    const isSummonCard = /deploy|summon|construct|build|drone|turret|mech|walker|foundry|pylon|tower/.test(`${cName} ${cDesc} ${cTags}`);
    if (isSummonCard) {
      const cardArchetype = classifyConstruct({ name: cName, type: cTags });
      if (bp.id === 'auto_turret' && cardArchetype === 'turret' && /drone|turret|sentry|gun|cannon/.test(cName)) return true;
      if (bp.id === 'aegis_mech' && cardArchetype === 'mech' && /mech|suit|golem/.test(cName)) return true;
      if (bp.id === 'scrap_foundry' && cardArchetype === 'building' && /building|forge|bay|reactor/.test(cName)) return true;
    }

    return false;
  }

  function syncSchematicUnlocksFromCards(allowToast = true) {
    if (typeof gameState === 'undefined' || !gameState) return {};
    if (!isArtificerActive()) return {};

    if (!Array.isArray(gameState.unlockedSchematics)) {
      gameState.unlockedSchematics = [];
    }

    const cards = collectPlayerCards();
    const matchedCardByBp = {};
    const newlyUnlocked = [];

    DEFAULT_FOUNDRY_SCHEMATICS.forEach(bp => {
      const foundCard = cards.find(c => matchCardToSchematic(c, bp));
      if (foundCard) {
        matchedCardByBp[bp.id] = foundCard.name || foundCard.title || bp.name;
        if (!gameState.unlockedSchematics.includes(bp.id)) {
          gameState.unlockedSchematics.push(bp.id);
          newlyUnlocked.push(bp);
        }
      }
    });

    if (allowToast && gameState.__schematicsBootstrapped && newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(bp => {
        if (typeof showToast === 'function') {
          showToast(`📐 Schematic Unlocked: ${bp.name}!`, 'success');
        }
      });
    }

    if (cards.length > 0) {
      gameState.__schematicsBootstrapped = true;
    }

    return matchedCardByBp;
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
    const matchedCardMap = syncSchematicUnlocksFromCards(true);
    const active = getActiveConstructs();
    const unlockedIds = (typeof gameState !== 'undefined' && gameState && Array.isArray(gameState.unlockedSchematics))
      ? gameState.unlockedSchematics
      : [];

    return DEFAULT_FOUNDRY_SCHEMATICS.map(bp => {
      const unlocked = unlockedIds.includes(bp.id) || Boolean(matchedCardMap[bp.id]);
      const deployedCount = active.filter(c =>
        c && String(c.name || '').toLowerCase().includes(bp.name.split(' ')[0].toLowerCase())
      ).length;

      return Object.assign({}, bp, {
        unlocked,
        ownedCardName: matchedCardMap[bp.id] || null,
        deployedCount
      });
    });
  }

  // =========================================================================
  // 3. DISTINCT PIXIJS MODELS FOR DRONES, TURRETS, MECHS & BUILDINGS
  // =========================================================================
  let foundryStageLayer = null;
  let lastConstructSig = '';
  window.__artificerStageCoords = [];

  function resolveHeroStageCoords(w, h) {
    const heroCandidates = [
      typeof playerContainer !== 'undefined' ? playerContainer : null,
      typeof playerSprite !== 'undefined' ? playerSprite : null,
      typeof heroContainer !== 'undefined' ? heroContainer : null,
      typeof heroSprite !== 'undefined' ? heroSprite : null
    ];
    for (const obj of heroCandidates) {
      if (obj && typeof obj.x === 'number' && obj.x > 0) {
        return { x: obj.x, y: obj.y || Math.round(h * 0.62) };
      }
    }
    return { x: Math.round(w * 0.22), y: Math.round(h * 0.62) };
  }

  function drawDistinctMechModel(rig, item, isOvercharged) {
    const raw = `${item.id || ''} ${item.name || ''} ${item.subType || ''}`.toLowerCase();
    const g = new PIXI.Graphics();

    g.beginFill(0x000000, 0.45);
    g.drawEllipse(0, 22, 18, 5);
    g.endFill();

    if (/siege|walker|hellfire|mortar|artillery/.test(raw)) {
      const hullColor = isOvercharged ? 0xfacc15 : 0xf97316;
      g.lineStyle(3, 0x94a3b8, 1);
      g.moveTo(-12, 6); g.lineTo(-17, 21);
      g.moveTo(-5, 8);  g.lineTo(-7, 22);
      g.moveTo(5, 8);   g.lineTo(7, 22);
      g.moveTo(12, 6);  g.lineTo(17, 21);

      g.beginFill(0x27150c, 0.98);
      g.lineStyle(2.2, hullColor, 1);
      g.drawPolygon([-18, 6, -13, -10, 13, -10, 18, 6]);
      g.endFill();

      g.beginFill(hullColor, 1);
      g.drawPolygon([-8, -10, -2, -22, 3, -20, -2, -10]);
      g.drawPolygon([1, -10, 8, -22, 13, -20, 7, -10]);
      g.endFill();

      g.beginFill(0xef4444, 1);
      g.drawRect(-6, -4, 15, 4);
      g.endFill();
    } else if (/titan|juggernaut|dreadnought|colossus|golem/.test(raw)) {
      const trim = isOvercharged ? 0xfef08a : 0xef4444;
      g.beginFill(0x334155, 1);
      g.drawRect(-13, 6, 8, 16);
      g.drawRect(5, 6, 8, 16);
      g.endFill();

      g.beginFill(0x1e1b2e, 0.98);
      g.lineStyle(2.5, trim, 1);
      g.drawPolygon([-16, 8, -20, -10, -10, -20, 10, -20, 20, -10, 16, 8]);
      g.endFill();

      g.beginFill(0xf97316, 1);
      g.drawCircle(0, -6, 5.5);
      g.beginFill(0xfef08a, 1);
      g.drawCircle(0, -6, 2.5);
      g.endFill();

      g.beginFill(trim, 0.95);
      g.drawPolygon([14, -8, 25, -13, 22, -4, 26, 3, 14, 2]);
      g.endFill();
    } else if (/exo|striker|scout|blade|assassin|nimble/.test(raw)) {
      const accent = isOvercharged ? 0xfacc15 : 0x22d3ee;
      g.lineStyle(2.8, 0xcbd5e1, 1);
      g.moveTo(-5, 5); g.lineTo(-10, 13); g.lineTo(-4, 21);
      g.moveTo(5, 5);  g.lineTo(1, 13);   g.lineTo(7, 21);

      g.beginFill(0x0f172a, 0.96);
      g.lineStyle(2, accent, 1);
      g.drawPolygon([-10, 6, -7, -15, 11, -11, 9, 6]);
      g.endFill();

      g.beginFill(accent, 0.85);
      g.drawPolygon([-7, -14, -15, -23, -3, -15]);
      g.endFill();

      g.beginFill(0x38bdf8, 0.95);
      g.drawPolygon([9, -3, 27, -6, 11, 2]);
      g.endFill();
    } else {
      const armorColor = isOvercharged ? 0xfacc15 : 0xf59e0b;
      g.lineStyle(3.5, 0x94a3b8, 1);
      g.moveTo(-7, 6); g.lineTo(-9, 20);
      g.moveTo(7, 6);  g.lineTo(9, 20);

      g.beginFill(0x1e293b, 0.98);
      g.lineStyle(2.2, armorColor, 1);
      g.drawRoundedRect(-14, -14, 26, 22, 5);
      g.endFill();

      g.beginFill(armorColor, 0.95);
      g.drawRoundedRect(-17, -16, 8, 10, 3);
      g.endFill();

      g.beginFill(0x38bdf8, 1);
      g.drawRect(-5, -9, 12, 4);
      g.endFill();

      g.beginFill(0x0284c7, 0.85);
      g.lineStyle(2, 0x7dd3fc, 1);
      g.drawRoundedRect(11, -14, 7, 26, 3);
      g.endFill();
      g.lineStyle(1.5, 0x38bdf8, 0.55);
      g.arc(12, -1, 17, -1.1, 1.1);
    }

    rig.addChild(g);

    if (typeof item.hp === 'number') {
      const maxHp = item.maxHp || Math.max(item.hp, 24);
      const ratio = Math.max(0, Math.min(1, item.hp / maxHp));
      const hpBar = new PIXI.Graphics();
      hpBar.beginFill(0x0f172a, 0.9);
      hpBar.drawRect(-15, 25, 30, 4);
      hpBar.beginFill(0xf59e0b, 1);
      hpBar.drawRect(-15, 25, 30 * ratio, 4);
      hpBar.endFill();
      rig.addChild(hpBar);
    }
  }

  function drawDistinctTurretModel(rig, item, isOvercharged) {
    const raw = `${item.id || ''} ${item.name || ''}`.toLowerCase();
    const g = new PIXI.Graphics();

    if (/tesla|arc|shock|volt|lightning/.test(raw)) {
      const c = isOvercharged ? 0xfacc15 : 0x22d3ee;
      g.beginFill(0x0f172a, 0.96);
      g.lineStyle(2, c, 1);
      g.drawPolygon([-10, 10, -5, -12, 5, -12, 10, 10]);
      g.endFill();

      g.lineStyle(2, 0x38bdf8, 0.95);
      g.drawEllipse(0, -4, 11, 3.5);
      g.drawEllipse(0, -10, 8, 2.5);

      g.beginFill(0xe0f2fe, 1);
      g.drawCircle(0, -15, 4.5);
      g.endFill();
    } else if (/flame|fire|inferno|pyro|burn/.test(raw)) {
      const c = isOvercharged ? 0xfacc15 : 0xf97316;
      g.beginFill(0x431407, 0.96);
      g.lineStyle(2, c, 1);
      g.drawRoundedRect(-12, -8, 22, 15, 6);
      g.endFill();

      g.beginFill(c, 1);
      g.drawPolygon([9, -6, 20, -9, 20, 4, 9, 1]);
      g.endFill();

      g.beginFill(0xfef08a, 1);
      g.drawCircle(22, -2.5, 3);
      g.endFill();
    } else if (/rail|laser|plasma|sniper|beam/.test(raw)) {
      const c = isOvercharged ? 0xfacc15 : 0xa855f7;
      g.beginFill(0x1e1b4b, 0.96);
      g.lineStyle(2, c, 1);
      g.drawRoundedRect(-11, -7, 20, 13, 4);
      g.endFill();

      g.beginFill(0x38bdf8, 1);
      g.drawRect(8, -6, 16, 2.5);
      g.drawRect(8, 1, 16, 2.5);
      g.endFill();
    } else {
      // AUTO-TURRET DRONE: Hovering quad-rotor tactical drone with underslung dual cannons
      const tColor = isOvercharged ? 0xfacc15 : 0x38bdf8;

      // Rotor arms + spinning rotor blades
      g.lineStyle(2, 0x94a3b8, 1);
      g.moveTo(-13, -7); g.lineTo(13, -7);
      g.beginFill(tColor, 0.55);
      g.drawEllipse(-13, -9, 7, 2);
      g.drawEllipse(13, -9, 7, 2);
      g.endFill();

      // Armored hexagonal drone hull
      g.beginFill(0x0f172a, 0.96);
      g.lineStyle(2, tColor, 1);
      g.drawPolygon([-11, -3, -6, -8, 6, -8, 11, -3, 7, 5, -7, 5]);
      g.endFill();

      // Underslung rotary auto-cannon barrels
      g.beginFill(tColor, 1);
      g.drawRect(6, 1, 13, 3);
      g.drawRect(6, 5, 10, 2.5);
      g.endFill();

      // Glowing sensor eye
      g.beginFill(0xe0f2fe, 1);
      g.drawCircle(2, -2, 3);
      g.endFill();
    }

    rig.addChild(g);
  }

  function drawDistinctBuildingModel(rig, item, isOvercharged) {
    const raw = `${item.id || ''} ${item.name || ''}`.toLowerCase();
    const g = new PIXI.Graphics();

    if (/foundry|fabricator|forge|salvage|scrap/.test(raw)) {
      const bColor = isOvercharged ? 0xfacc15 : 0x10b981;
      g.beginFill(0x064e3b, 0.96);
      g.lineStyle(2, bColor, 1);
      g.drawRect(-15, -10, 30, 28);
      g.endFill();

      g.beginFill(0x334155, 1);
      g.drawRect(-11, -22, 6, 12);
      g.endFill();

      g.beginFill(0xf59e0b, 1);
      g.drawRoundedRect(-5, 0, 12, 12, 3);
      g.endFill();
    } else {
      const bColor = isOvercharged ? 0x34d399 : 0x10b981;
      g.beginFill(0x064e3b, 0.95);
      g.lineStyle(2, bColor, 1);
      g.drawPolygon([-14, 18, -10, -14, 10, -14, 14, 18]);
      g.endFill();

      g.beginFill(0xa7f3d0, 1);
      g.drawPolygon([0, -24, 6, -14, 0, -6, -6, -14]);
      g.endFill();

      g.lineStyle(1.5, bColor, 0.45);
      g.drawEllipse(0, 18, 20, 6);
    }

    rig.addChild(g);
  }

  window.renderArtificerTurrets = function () {
    if (typeof pixiApp === 'undefined' || !pixiApp || !pixiApp.stage) return;

    pixiApp.stage.sortableChildren = true;
    if (!foundryStageLayer || foundryStageLayer.destroyed) {
      foundryStageLayer = new PIXI.Container();
    }
    foundryStageLayer.zIndex = 20;
    if (foundryStageLayer.parent !== pixiApp.stage) {
      pixiApp.stage.addChild(foundryStageLayer);
    }

    foundryStageLayer.removeChildren().forEach(c => c.destroy({ children: true }));
    window.__artificerStageCoords = [];

    const constructs = getActiveConstructs();
    if (!constructs.length) return;

    const cEl = document.getElementById('pixi-container');
    const w = (cEl && cEl.clientWidth) || pixiApp.screen.width || 860;
    const h = (cEl && cEl.clientHeight) || pixiApp.screen.height || 220;
    const hero = resolveHeroStageCoords(w, h);

    let turretIdx = 0;
    let mechIdx = 0;
    let buildingIdx = 0;

    constructs.forEach((item, idx) => {
      const kind = classifyConstruct(item);
      const isOvercharged = Boolean(item && (item.overcharged || item.upgraded || (item.level && item.level > 1)));
      const rig = new PIXI.Container();
      rig.__phase = idx * 0.9;

      if (kind === 'mech') {
        rig.x = Math.min(w * 0.50, Math.round(hero.x + 68 + mechIdx * 44));
        rig.y = Math.min(h - 24, Math.round(hero.y + 6 - mechIdx * 18));
        rig.__baseY = rig.y;
        rig.__bobAmp = 1.5;
        drawDistinctMechModel(rig, item, isOvercharged);
        mechIdx++;
      } else if (kind === 'building') {
        rig.x = Math.max(28, Math.round(hero.x - 48 - buildingIdx * 36));
        rig.y = Math.min(h - 24, Math.round(hero.y + 4 - buildingIdx * 24));
        rig.__baseY = rig.y;
        rig.__bobAmp = 0;
        drawDistinctBuildingModel(rig, item, isOvercharged);
        buildingIdx++;
      } else {
        rig.x = Math.min(w * 0.48, Math.round(hero.x + 48 + (turretIdx % 3) * 44));
        rig.y = Math.max(36, Math.round(hero.y - 52 - Math.floor(turretIdx / 3) * 34));
        rig.__baseY = rig.y;
        rig.__bobAmp = 2.8;
        drawDistinctTurretModel(rig, item, isOvercharged);
        turretIdx++;
      }

      window.__artificerStageCoords.push({
        index: idx,
        id: item && item.id,
        name: (item && item.name) || kind,
        archetype: kind,
        x: rig.x,
        y: rig.y
      });

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
      tag.y = kind === 'building' ? -31 : -24;
      rig.addChild(tag);

      foundryStageLayer.addChild(rig);
    });

    if (!pixiApp.__foundryBobTicker) {
      pixiApp.__foundryBobTicker = true;
      pixiApp.ticker.add(() => {
        if (!foundryStageLayer || foundryStageLayer.destroyed || !foundryStageLayer.children) return;
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

  function findStageContainerForRack() {
    const selectors = [
      '#screen-battle .battle-stage-wrapper',
      '#screen-battle .stage-wrapper',
      '#pixi-container'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const target = sel === '#pixi-container' && el.parentElement ? el.parentElement : el;
        if (getComputedStyle(target).position === 'static') {
          target.style.position = 'relative';
        }
        return target;
      }
    }
    return null;
  }

  function ensureFoundryDOM() {
    const stageWrapper = findStageContainerForRack();
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
          <div class="af-panel-subtitle">
            Obtain a construct's <strong>Card Form</strong> (via Starter Deck, Card Rewards, or Shop) to permanently unlock its Foundry Schematic for this run.
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
    if (!bp || !bp.unlocked) return;
    const parts = getPartsInfo();
    if (parts.current < bp.cost) return;

    if (typeof window.fabricateConstruct === 'function') {
      window.fabricateConstruct(bp.id);
    } else if (typeof window.deploySchematic === 'function') {
      window.deploySchematic(bp.id);
    } else if (typeof gameState !== 'undefined' && gameState) {
      if (typeof gameState.parts === 'number') gameState.parts -= bp.cost;
      else if (typeof gameState.scrapParts === 'number') gameState.scrapParts -= bp.cost;

      const targetArr = Array.isArray(gameState.drones) ? gameState.drones
        : (Array.isArray(gameState.turrets) ? gameState.turrets : (gameState.drones = []));
      targetArr.push({
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
        ? '🔒 Need Card Form'
        : (!inBattle
            ? 'In Battle Only'
            : (parts.current < bp.cost ? `Need ${bp.cost} ⚙️` : `🔨 Build (${bp.cost} ⚙️)`));

      const reqHtml = bp.unlocked
        ? `<div class="af-card-req req-unlocked">✅ Card Form Acquired${bp.ownedCardName ? `: <strong>${bp.ownedCardName}</strong>` : ''}</div>`
        : `<div class="af-card-req req-locked">🔒 Locked — Obtain <strong>${bp.cardForm}</strong></div>`;

      return `
        <div class="af-bp-card archetype-${bp.archetype} ${bp.unlocked ? '' : 'locked'}">
          <div>
            <div class="af-bp-top">
              <span class="af-bp-badge">${bp.icon} ${bp.archetype}</span>
              <span class="af-bp-cost">⚙️ ${bp.cost} Parts</span>
            </div>
            <div class="af-bp-name">${bp.name}</div>
          </div>
          ${reqHtml}
          <div class="af-bp-desc">${bp.desc}</div>
          <div class="af-bp-overcharge">⚡ ${bp.overcharge}</div>
          <div class="af-bp-footer">
            <span class="af-bp-status ${bp.deployedCount > 0 ? 'deployed' : ''}">
              ${!bp.unlocked ? '🔒 Blueprint Locked' : (bp.deployedCount > 0 ? `● ${bp.deployedCount} Active on Field` : '○ Ready to Fabricate')}
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

    if (!isArtificerActive()) {
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

  function installFoundryHooks() {
    ensureFoundryDOM();

    ['updateBattleUI', 'updateBoardUI', 'renderShopItems', 'selectHeroClass', 'renderCombatUnits', 'initPixi'].forEach(fnName => {
      if (typeof window[fnName] === 'function' && !window[fnName].__afWrapped) {
        const orig = window[fnName];
        const wrapped = function (...args) {
          const res = orig.apply(this, args);
          syncSchematicUnlocksFromCards(fnName !== 'selectHeroClass');
          updateArtificerFoundryHUD();
          if (fnName === 'updateBattleUI' || fnName === 'renderCombatUnits' || fnName === 'initPixi') {
            window.renderArtificerTurrets();
          }
          return res;
        };
        wrapped.__afWrapped = true;
        window[fnName] = wrapped;
      }
    });

    // Trigger immediate construct render whenever a deployment/scrap toast fires
    if (typeof window.showToast === 'function' && !window.showToast.__afToastWrapped) {
      const origToast = window.showToast;
      const wrappedToast = function (msg, ...rest) {
        const res = origToast.apply(this, [msg, ...rest]);
        if (/deploy|drone|turret|mech|foundry|pylon|scrap|construct/i.test(String(msg || ''))) {
          setTimeout(() => {
            updateArtificerFoundryHUD();
            window.renderArtificerTurrets();
          }, 20);
        }
        return res;
      };
      wrappedToast.__afToastWrapped = true;
      window.showToast = wrappedToast;
    }

    syncSchematicUnlocksFromCards(false);
    updateArtificerFoundryHUD();
    window.renderArtificerTurrets();
  }

  setInterval(() => {
    if (typeof gameState === 'undefined' || !gameState) return;
    if (isArtificerActive()) {
      syncSchematicUnlocksFromCards(true);
      const inBattle = gameState.screen === 'BATTLE' || (document.getElementById('screen-battle') && document.getElementById('screen-battle').classList.contains('active'));
      if (inBattle) {
        updateArtificerFoundryHUD();
        const constructs = getActiveConstructs();
        const sig = JSON.stringify(constructs.map(c => `${c.id || c.name}_${c.hp || 0}_${c.overcharged ? 1 : 0}`));
        const detached = Boolean(foundryStageLayer && typeof pixiApp !== 'undefined' && pixiApp && foundryStageLayer.parent !== pixiApp.stage);
        if (sig !== lastConstructSig || detached) {
          lastConstructSig = sig;
          window.renderArtificerTurrets();
        }
      }
    }
  }, 180);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installFoundryHooks);
  } else {
    installFoundryHooks();
  }
})();
