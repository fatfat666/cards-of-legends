// --- UI CONTROLLERS, BOARD NAVIGATION, REST SHRINE, STAGE II & BLACK MARKET (v0.8.0) ---

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 2400);
}

function navigateTo(screenName) {
  gameState.screen = screenName;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  if (screenName === 'MAIN') {
    document.getElementById('screen-main').classList.add('active');
  } else if (screenName === 'CLASS_SELECT') {
    document.getElementById('screen-class').classList.add('active');
  } else if (screenName === 'BOARD') {
    document.getElementById('screen-board').classList.add('active');
    updateBoardUI();
  } else if (screenName === 'SHOP') {
    document.getElementById('screen-shop').classList.add('active');
    openShopScreen();
  } else if (screenName === 'BATTLE') {
    document.getElementById('screen-battle').classList.add('active');
    if (!pixiApp) initPixi();
    setTimeout(() => {
      if (pixiApp) {
        const c = document.getElementById('pixi-container');
        pixiApp.renderer.resize(c.clientWidth || 800, c.clientHeight || 255);
        repositionCombatUnits();
      }
    }, 30);
  }
}

function selectHeroClass(classType) {
  resetGameState(classType);
  showToast(`Selected ${classType}!`, 'info');
  navigateTo('BOARD');
}

// --- BOARD MAP & COIN FLIP ENCOUNTER ENGINE ---
function updateBoardUI() {
  const isMobBoss = gameState.classType === 'Mob Boss';
  const isStage2 = gameState.stage >= 2;

  const boardTitleEl = document.getElementById('board-stage-title');
  const boardSubEl = document.getElementById('board-stage-subtitle');
  if (boardTitleEl) {
    boardTitleEl.textContent = isStage2
      ? '🌌 STAGE II: ASTRAL NEXUS'
      : '🌌 STAGE I: NEON UNDERWORLD';
    boardTitleEl.style.color = isStage2 ? '#c084fc' : 'var(--accent-gold)';
  }
  if (boardSubEl) {
    boardSubEl.textContent = isStage2
      ? `Cross-Class Drafts Active • Deck Cap: ${getMaxDeckSize()} • Node ${gameState.boardNode}/${gameState.maxNodes}`
      : 'Flip the Fate Coin to reveal each node encounter';
  }

  document.getElementById('board-class-name').textContent = gameState.classType;
  document.getElementById('board-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
  document.getElementById('board-gold').textContent = `${gameState.gold}g`;
  document.getElementById('board-deck-count').textContent = `${gameState.deck.length}/${getMaxDeckSize()}`;

  // Mob Boss-Exclusive Black Market & Syndicate HUD Badges
  const boardCashBadge = document.getElementById('board-cash-badge');
  const boardRepBadge = document.getElementById('board-notoriety-badge');
  const boardBmBtn = document.getElementById('btn-board-black-market');
  if (boardCashBadge) boardCashBadge.style.display = isMobBoss ? 'inline-flex' : 'none';
  if (boardRepBadge) boardRepBadge.style.display = isMobBoss ? 'inline-flex' : 'none';
  if (boardBmBtn) boardBmBtn.style.display = isMobBoss ? 'inline-flex' : 'none';

  if (isMobBoss) {
    const rankInfo = getNotorietyRankInfo();
    document.getElementById('board-cash').textContent = `$${gameState.syndicateCash}`;
    document.getElementById('board-notoriety').textContent = `${gameState.notoriety} ★ (${rankInfo.title.split('•')[0].trim()})`;
  }

  const track = document.getElementById('board-nodes-track');
  track.innerHTML = '';

  const normalLabels = isStage2
    ? ['Rift Gate', 'Astral Spire', 'Void Forge', 'Nebula Sanctum', 'Chrono Abyss']
    : ['Outpost', 'Alleyway', 'Bazaar', 'Sanctum'];
  const bossLabel = isStage2 ? 'Architect' : 'Overlord';

  for (let n = 1; n <= gameState.maxNodes; n++) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'board-node';
    if (n < gameState.boardNode) nodeDiv.classList.add('completed');
    else if (n === gameState.boardNode) nodeDiv.classList.add('active');
    else nodeDiv.classList.add('locked');

    const icon = n === gameState.maxNodes ? (isStage2 ? '🌌' : '👑') : (n < gameState.boardNode ? '✔' : (n === gameState.boardNode ? '🎲' : '🔒'));
    const label = n === gameState.maxNodes ? bossLabel : (normalLabels[n - 1] || `Node ${n}`);
    nodeDiv.innerHTML = `<div class="node-icon">${icon}</div><div class="node-label">Node ${n}<br>${label}</div>`;
    track.appendChild(nodeDiv);
  }

  const btnFlip = document.getElementById('btn-flip-coin');
  const btnEnter = document.getElementById('btn-enter-node');
  const coinIcon = document.getElementById('coin-icon');
  const outcomeTxt = document.getElementById('coin-outcome-text');

  if (!gameState.nodeRevealed) {
    btnFlip.classList.remove('hidden');
    btnFlip.disabled = false;
    btnEnter.classList.add('hidden');
    coinIcon.textContent = '🪙';
    outcomeTxt.textContent = gameState.boardNode === gameState.maxNodes
      ? (isStage2 ? 'FINAL BOSS GATE: OMEGA ARCHITECT AWAITS' : 'BOSS GATE: VOID OVERLORD AWAITS')
      : 'AWAITING FATE COIN';
  } else {
    btnFlip.classList.add('hidden');
    btnEnter.classList.remove('hidden');
  }
}

function triggerNodeReveal() {
  if (gameState.nodeRevealed) return;
  const coinEl = document.getElementById('fate-coin');
  const coinIcon = document.getElementById('coin-icon');
  const outcomeTxt = document.getElementById('coin-outcome-text');
  const btnFlip = document.getElementById('btn-flip-coin');

  btnFlip.disabled = true;
  coinEl.classList.add('flipping');

  setTimeout(() => {
    coinEl.classList.remove('flipping');
    gameState.nodeRevealed = true;

    if (gameState.boardNode === gameState.maxNodes) {
      gameState.nodeOutcome = 'BOSS';
      if (gameState.stage >= 2) {
        coinIcon.textContent = '🌌';
        outcomeTxt.textContent = 'FINAL BOSS: OMEGA ARCHITECT: ETERNITY PRIME!';
      } else {
        coinIcon.textContent = '👑';
        outcomeTxt.textContent = 'BOSS ENCOUNTER: VOID OVERLORD!';
      }
    } else if (gameState.boardNode === 1) {
      gameState.nodeOutcome = 'SINGLE';
      coinIcon.textContent = '⚔️';
      outcomeTxt.textContent = gameState.stage >= 2 ? 'ASTRAL VANGUARD ENCOUNTER!' : 'SINGLE COMBAT ENCOUNTER!';
    } else {
      const roll = Math.random();
      if (roll < 0.22) {
        gameState.nodeOutcome = 'REST_SHRINE';
        coinIcon.textContent = '🔥';
        outcomeTxt.textContent = 'CAMPFIRE / REST SHRINE DISCOVERED!';
      } else if (roll < 0.44) {
        gameState.nodeOutcome = 'SHOP';
        coinIcon.textContent = '🏪';
        outcomeTxt.textContent = 'NEON BAZAAR MERCHANT DISCOVERED!';
      } else if (roll < 0.72) {
        gameState.nodeOutcome = 'DUO';
        coinIcon.textContent = '⚔️⚔️';
        outcomeTxt.textContent = gameState.stage >= 2 ? 'ASTRAL DUO AMBUSH!' : 'DUO COMBAT AMBUSH!';
      } else {
        gameState.nodeOutcome = 'SINGLE';
        coinIcon.textContent = '⚔️';
        outcomeTxt.textContent = gameState.stage >= 2 ? 'ASTRAL SENTINEL ENCOUNTER!' : 'SINGLE COMBAT ENCOUNTER!';
      }
    }
    updateBoardUI();
  }, 550);
}

function enterRevealedNode() {
  if (!gameState.nodeRevealed) return;
  if (gameState.nodeOutcome === 'SHOP') {
    navigateTo('SHOP');
  } else if (gameState.nodeOutcome === 'REST_SHRINE') {
    openRestShrineModal();
  } else {
    startBattleAtNode(gameState.nodeOutcome);
  }
}

// --- CAMPFIRE / REST SHRINE ENCOUNTER ---
function openRestShrineModal() {
  const modal = document.getElementById('modal-rest-shrine');
  if (!modal) return;
  const healAmt = Math.round(gameState.player.maxHp * 0.40);
  const rejuvDesc = document.getElementById('rest-shrine-rejuv-desc');
  if (rejuvDesc) {
    rejuvDesc.textContent = gameState.classType === 'Blood Reaver'
      ? `Restore +${healAmt} HP (40% Max HP), gain +15 Overheal, and cleanse all run debuffs.`
      : `Restore +${healAmt} HP (40% Max HP) and cleanse all run debuffs.`;
  }
  const spoilsBtn = document.getElementById('btn-shrine-forge-spoils');
  if (spoilsBtn) {
    spoilsBtn.textContent = gameState.classType === 'Mob Boss'
      ? '💰 SYNDICATE SPOILS (+15g & +10 ★)'
      : '💰 ARCANE TREASURE (+25g Gold)';
  }
  modal.classList.remove('hidden');
}

window.chooseRestShrineRejuvenate = function() {
  const healAmt = Math.round(gameState.player.maxHp * 0.40);
  const overhealCap = getBloodReaverOverhealCap();
  const extraOverheal = gameState.classType === 'Blood Reaver' ? 15 : 0;
  gameState.player.hp = Math.min(gameState.player.maxHp + overhealCap, gameState.player.hp + healAmt + extraOverheal);
  gameState.runDebuffs = [];

  document.getElementById('modal-rest-shrine').classList.add('hidden');
  showToast(
    gameState.classType === 'Blood Reaver'
      ? `🔥 Rejuvenated: +${healAmt} HP, +15 Overheal & Debuffs Cleansed!`
      : `🔥 Rejuvenated: +${healAmt} HP & Debuffs Cleansed!`,
    'success'
  );
  advanceAfterNonCombatNode();
};

window.chooseRestShrineForgeScrap = function() {
  gameState.scrapLimit += 1;
  document.getElementById('modal-rest-shrine').classList.add('hidden');
  showToast(`⚒️ Arcane Forge: +1 Permanent Scrap Limit/Turn (${gameState.scrapLimit}/turn)!`, 'success');
  advanceAfterNonCombatNode();
};

window.chooseRestShrineForgeSpoils = function() {
  document.getElementById('modal-rest-shrine').classList.add('hidden');
  if (gameState.classType === 'Mob Boss') {
    gameState.gold += 15;
    gainNotoriety(10);
    showToast('💰 Syndicate Spoils: +15g Gold & +10 ★ Notoriety!', 'success');
  } else {
    gameState.gold += 25;
    showToast('💰 Arcane Treasure: +25g Gold!', 'success');
  }
  advanceAfterNonCombatNode();
};

function advanceAfterNonCombatNode() {
  gameState.boardNode++;
  gameState.nodeRevealed = false;
  gameState.nodeOutcome = null;
  updateBoardUI();
}

function startBattleAtNode(outcomeType) {
  const isStage2 = gameState.stage >= 2;
  const themes = isStage2 ? ASTRAL_STAGE_THEMES : STAGE_THEMES;
  const theme = themes[(gameState.boardNode - 1) % themes.length];
  document.getElementById('pixi-container').style.background = theme.bg;

  const scale = isStage2 ? (1 + (gameState.boardNode - 1) * 0.14) : (1 + (gameState.boardNode - 1) * 0.16);
  let enemies = [];

  if (isStage2) {
    // STAGE II: ASTRAL NEXUS ENCOUNTERS (CARD-PLAYING ENEMY AI)
    if (outcomeType === 'BOSS') {
      enemies = [{
        name: 'Omega Architect: Eternity Prime',
        maxHp: 185,
        shield: 25,
        isBoss: true,
        isAstralBoss: true,
        cardsPerTurn: 2,
        colorHex: 0x7e22ce,
        intents: [
          { cardName: 'Singularity Beam', type: 'ATTACK', value: 18, debuffType: 'burn', debuffValue: 2, desc: '18 DMG + 4 Burn' },
          { cardName: 'Celestial Bastion', type: 'HEAL', value: 12, shieldValue: 20, desc: 'Heal 12 HP & +20 Shield' },
          { cardName: 'Starfall Volley', type: 'ATTACK', value: 7, hits: 3, desc: '7 DMG x 3' },
          { cardName: 'Chrono Collapse', type: 'COMBO', value: 14, shieldValue: 10, debuffType: 'energy_drain', debuffValue: 1, desc: '14 DMG, +10 Shield & -1⚡' }
        ]
      }];
    } else if (outcomeType === 'DUO') {
      enemies = [
        {
          name: 'Rift Weaver',
          maxHp: Math.round(58 * scale),
          shield: 8,
          shape: 'diamond',
          colorHex: 0x9333ea,
          intents: [
            { cardName: 'Void Bolt', type: 'ATTACK', value: Math.round(11 * scale), debuffType: 'burn', debuffValue: 1, desc: `${Math.round(11 * scale)} DMG + Hex` },
            { cardName: 'Astral Mending', type: 'HEAL', value: 12, shieldValue: 8, desc: 'Heal 12 HP & +8 Shield' },
            { cardName: 'Twin Rift', type: 'ATTACK', value: Math.round(6 * scale), hits: 2, desc: `${Math.round(6 * scale)} DMG x 2` }
          ]
        },
        {
          name: 'Void Zealot',
          maxHp: Math.round(64 * scale),
          shield: 6,
          shape: 'triangle',
          colorHex: 0x2563eb,
          intents: [
            { cardName: 'Abyssal Slash', type: 'ATTACK', value: Math.round(13 * scale), desc: `${Math.round(13 * scale)} DMG` },
            { cardName: 'Dark Bulwark', type: 'DEFEND', value: 14, desc: '+14 Shield' },
            { cardName: 'Void Flurry', type: 'ATTACK', value: Math.round(7 * scale), hits: 2, desc: `${Math.round(7 * scale)} DMG x 2` }
          ]
        }
      ];
    } else {
      const pickSentinel = gameState.boardNode % 2 === 1;
      if (pickSentinel) {
        enemies = [{
          name: 'Astral Sentinel',
          maxHp: Math.round(82 * scale),
          shield: 15,
          shape: 'diamond',
          colorHex: 0x0284c7,
          intents: [
            { cardName: 'Starlight Lance', type: 'ATTACK', value: Math.round(14 * scale), desc: `${Math.round(14 * scale)} DMG` },
            { cardName: 'Aegis Matrix', type: 'COMBO', value: Math.round(8 * scale), shieldValue: 14, desc: `${Math.round(8 * scale)} DMG & +14 Shield` },
            { cardName: 'Ion Barrage', type: 'ATTACK', value: Math.round(6 * scale), hits: 3, desc: `${Math.round(6 * scale)} DMG x 3` }
          ]
        }];
      } else {
        enemies = [{
          name: 'Chrono Stalker',
          maxHp: Math.round(78 * scale),
          shield: 10,
          shape: 'triangle',
          colorHex: 0x4f46e5,
          intents: [
            { cardName: 'Temporal Cleave', type: 'ATTACK', value: Math.round(15 * scale), desc: `${Math.round(15 * scale)} DMG` },
            { cardName: 'Phase Shift', type: 'HEAL', value: 10, shieldValue: 12, desc: 'Heal 10 HP & +12 Shield' },
            { cardName: 'Entropy Siphon', type: 'ATTACK', value: Math.round(11 * scale), debuffType: 'energy_drain', debuffValue: 1, desc: `${Math.round(11 * scale)} DMG & -1⚡ next turn` }
          ]
        }];
      }
    }
  } else {
    // STAGE I: NEON UNDERWORLD ENCOUNTERS
    if (outcomeType === 'BOSS') {
      enemies = [{
        name: 'Void Overlord',
        maxHp: 130,
        shield: 12,
        isBoss: true,
        colorHex: 0x991b1b,
        intents: [
          { cardName: 'Void Cleave', type: 'ATTACK', value: 14, desc: '14 DMG' },
          { cardName: 'Abyssal Aegis', type: 'DEFEND', value: 16, desc: '+16 Shield' },
          { cardName: 'Twin Meteor', type: 'ATTACK', value: 10, hits: 2, desc: '10 DMG x 2' }
        ]
      }];
    } else if (outcomeType === 'DUO') {
      enemies = [
        {
          name: 'Cyber Stalker',
          maxHp: Math.round(38 * scale),
          shape: 'diamond',
          colorHex: 0xe11d48,
          intents: [
            { cardName: 'Plasma Slash', type: 'ATTACK', value: Math.round(9 * scale), desc: `${Math.round(9 * scale)} DMG` },
            { cardName: 'Nano Guard', type: 'DEFEND', value: 8, desc: '+8 Shield' }
          ]
        },
        {
          name: 'Neon Bruiser',
          maxHp: Math.round(44 * scale),
          shape: 'triangle',
          colorHex: 0xd97706,
          intents: [
            { cardName: 'Heavy Slam', type: 'ATTACK', value: Math.round(11 * scale), desc: `${Math.round(11 * scale)} DMG` },
            { cardName: 'Rapid Jab', type: 'ATTACK', value: Math.round(6 * scale), hits: 2, desc: `${Math.round(6 * scale)} DMG x 2` }
          ]
        }
      ];
    } else {
      enemies = [{
        name: gameState.boardNode === 1 ? 'Scrap Drone' : 'Void Sentinel',
        maxHp: Math.round(52 * scale),
        shape: 'triangle',
        colorHex: 0xdc2626,
        intents: [
          { cardName: 'Laser Pulse', type: 'ATTACK', value: Math.round(10 * scale), desc: `${Math.round(10 * scale)} DMG` },
          { cardName: 'Energy Shield', type: 'DEFEND', value: 10, desc: '+10 Shield' },
          { cardName: 'Twin Burst', type: 'ATTACK', value: Math.round(7 * scale), hits: 2, desc: `${Math.round(7 * scale)} DMG x 2` }
        ]
      }];
    }
  }

  navigateTo('BATTLE');
  initBattle(enemies);
}

// --- NEON BAZAAR SHOP ---
function openShopScreen() {
  const isMobBoss = gameState.classType === 'Mob Boss';
  const hasSignetDiscount = (gameState.relics.SYNDICATE_SIGNET || 0) >= 3;

  document.getElementById('shop-gold').textContent = `${gameState.gold}g`;
  document.getElementById('shop-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;

  const shopBmBtn = document.getElementById('btn-shop-black-market');
  if (shopBmBtn) shopBmBtn.style.display = isMobBoss ? 'inline-flex' : 'none';

  const grid = document.getElementById('shop-items-grid');
  grid.innerHTML = '';

  const calcCost = (base) => hasSignetDiscount ? Math.max(5, Math.round(base * 0.85)) : base;

  const items = [
    { name: 'Nano Medkit', cost: calcCost(20), desc: 'Restore +25 HP immediately.', action: () => {
      gameState.player.hp = Math.min(gameState.player.maxHp + getBloodReaverOverhealCap(), gameState.player.hp + 25);
      showToast('Restored +25 HP!', 'success');
    }},
    { name: 'Relic Cache', cost: calcCost(35), desc: 'Gain +1 tier of a random Relic.', action: () => {
      const keys = Object.keys(RELIC_CATALOG);
      const rk = keys[Math.floor(Math.random() * keys.length)];
      gameState.relics[rk] = Math.min(3, (gameState.relics[rk] || 0) + 1);
      showToast(`Acquired ${RELIC_CATALOG[rk].name} (Tier ${gameState.relics[rk]})!`, 'success');
    }},
    { name: 'Scrap Forge Upgrade', cost: calcCost(40), desc: '+1 Permanent Scrap Limit per turn.', action: () => {
      gameState.scrapLimit++;
      showToast('Upgraded Scrap Limit (+1/turn)!', 'success');
    }},
    { name: 'Deck Purge', cost: calcCost(25), desc: 'Remove a random Basic card from your deck.', action: () => {
      const idx = gameState.deck.findIndex(cid => CARD_DATABASE[cid] && CARD_DATABASE[cid].rarity === 'basic');
      if (idx !== -1) {
        const removed = CARD_DATABASE[gameState.deck.splice(idx, 1)[0]].name;
        showToast(`Purged ${removed} from deck!`, 'success');
      } else {
        showToast('No Basic cards left to purge!', 'warning');
      }
    }}
  ];

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shop-item-card';
    const discountBadge = hasSignetDiscount ? ' <span style="color:#4ade80;font-size:0.75rem;">(-15%)</span>' : '';
    div.innerHTML = `
      <div>
        <div style="font-weight:900;font-size:1.05rem;color:#fff;margin-bottom:6px;">${item.name}</div>
        <div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">${item.desc}</div>
      </div>
      <button class="btn-primary" style="width:100%;margin-top:12px;">BUY (${item.cost}g)${discountBadge}</button>
    `;
    div.querySelector('button').onclick = () => {
      if (gameState.gold < item.cost) {
        showToast('Not enough Gold!', 'error');
        return;
      }
      gameState.gold -= item.cost;
      item.action();
      openShopScreen();
    };
    grid.appendChild(div);
  });
}

function leaveShop() {
  gameState.boardNode++;
  gameState.nodeRevealed = false;
  gameState.nodeOutcome = null;
  navigateTo('BOARD');
}

// --- POST-COMBAT CARD DRAFT, STAGE II TRANSITION & RELIC REWARD ---
function openVictoryCardDraft(wasBoss) {
  const modal = document.getElementById('modal-reward');
  const grid = document.getElementById('reward-cards-grid');
  grid.innerHTML = '';

  const maxDeck = getMaxDeckSize();
  document.getElementById('reward-title').textContent = wasBoss
    ? (gameState.stage >= 2 ? '🌌 ARCHITECT DEFEATED! CHOOSE COSMIC SPOILS' : '👑 STAGE I BOSS DEFEATED! CHOOSE LEGENDARY SPOILS')
    : '🏆 VICTORY! DRAFT A CARD';
  document.getElementById('reward-subtitle').textContent = gameState.stage >= 2
    ? `Stage II Cross-Class Draft Active (Deck: ${gameState.deck.length}/${maxDeck})`
    : `Add 1 card to your deck (${gameState.deck.length}/${maxDeck})`;

  // Never include Contraband cards for non-Mob Boss classes; Stage II unlocks Cross-Class Victory Drafts!
  const allCards = Object.values(CARD_DATABASE).filter(c => {
    if (c.isContraband) return gameState.classType === 'Mob Boss';
    if (gameState.stage >= 2) return true; // Cross-Class Drafts in Stage II!
    return c.classTag === gameState.classType || c.classTag === 'Neutral';
  });

  const choices = shuffleArray(allCards).slice(0, 3);
  choices.forEach(cardDef => {
    const el = createCardElement(cardDef, false);
    el.onclick = () => {
      if (gameState.deck.length >= maxDeck) {
        showToast(`Deck is at max capacity (${maxDeck}/${maxDeck})!`, 'warning');
      } else {
        gameState.deck.push(cardDef.id);
        showToast(`Drafted ${cardDef.name}!`, 'success');
      }
      modal.classList.add('hidden');
      finishPostCombatStep(wasBoss);
    };
    grid.appendChild(el);
  });

  document.getElementById('btn-skip-reward').onclick = () => {
    modal.classList.add('hidden');
    finishPostCombatStep(wasBoss);
  };

  modal.classList.remove('hidden');
}

function finishPostCombatStep(wasBoss) {
  if (wasBoss && gameState.stage === 1) {
    // Open Stage I -> Stage II: Astral Nexus Transition Modal!
    openStageTransitionModal();
    return;
  }

  if (wasBoss && gameState.stage >= 2) {
    if (masteryData[gameState.classType]) {
      masteryData[gameState.classType].runsCompleted++;
      checkMasteryUnlocks(gameState.classType);
      saveMasteryData();
    }
    showToast('🌌 STAGE II: ASTRAL NEXUS CONQUERED! Run Complete!', 'success');
    navigateTo('CLASS_SELECT');
    return;
  }

  if (Math.random() < 0.35) {
    const keys = Object.keys(RELIC_CATALOG);
    const rk = keys[Math.floor(Math.random() * keys.length)];
    gameState.relics[rk] = Math.min(3, (gameState.relics[rk] || 0) + 1);
    showToast(`💎 Bonus Relic Found: ${RELIC_CATALOG[rk].name}!`, 'success');
  }

  gameState.boardNode++;
  gameState.nodeRevealed = false;
  gameState.nodeOutcome = null;
  navigateTo('BOARD');
}

function openStageTransitionModal() {
  const modal = document.getElementById('modal-stage-transition');
  if (!modal) {
    // Fallback if modal element is absent
    window.ascendToStageTwo();
    return;
  }
  const healAmt = Math.round(gameState.player.maxHp * 0.35);
  const summaryEl = document.getElementById('stage-transition-summary');
  if (summaryEl) {
    summaryEl.textContent = `Ascend to Stage II: Astral Nexus (+${healAmt} HP [35% Max HP], +50g Gold, 26-Card Deck Cap & Cross-Class Drafts) or claim your Stage I victory now.`;
  }
  modal.classList.remove('hidden');
}

window.ascendToStageTwo = function() {
  const modal = document.getElementById('modal-stage-transition');
  if (modal) modal.classList.add('hidden');

  const healAmt = Math.round(gameState.player.maxHp * 0.35);
  gameState.player.hp = Math.min(gameState.player.maxHp + getBloodReaverOverhealCap(), gameState.player.hp + healAmt);
  gameState.gold += 50;
  gameState.stage = 2;
  gameState.boardNode = 1;
  gameState.maxNodes = 6;
  gameState.nodeRevealed = false;
  gameState.nodeOutcome = null;

  showToast(`🌌 ASCENDED TO STAGE II: ASTRAL NEXUS! +${healAmt} HP, +50g & 26-Card Cap!`, 'success');
  navigateTo('BOARD');
};

window.claimStageOneVictory = function() {
  const modal = document.getElementById('modal-stage-transition');
  if (modal) modal.classList.add('hidden');

  if (masteryData[gameState.classType]) {
    masteryData[gameState.classType].runsCompleted++;
    checkMasteryUnlocks(gameState.classType);
    saveMasteryData();
  }
  showToast('👑 STAGE I VICTORY CLAIMED! Mastery progress saved!', 'success');
  navigateTo('CLASS_SELECT');
};

// --- BATTLE HUD & CARD RENDERING ---
function updateBattleUI() {
  const isMobBoss = gameState.classType === 'Mob Boss';
  const hpDisplay = gameState.player.hp > gameState.player.maxHp
    ? `${gameState.player.hp}/${gameState.player.maxHp} (+${gameState.player.hp - gameState.player.maxHp} OVERHEAL)`
    : `${gameState.player.hp}/${gameState.player.maxHp}`;
  document.getElementById('ui-hp').textContent = hpDisplay;
  document.getElementById('ui-shield').textContent = gameState.player.shield;
  document.getElementById('ui-energy').textContent = `${gameState.player.energy}/${gameState.player.maxEnergy}`;
  document.getElementById('ui-gold').textContent = `${gameState.gold}g`;
  document.getElementById('ui-scrap-count').textContent = `${gameState.scrappedThisTurn}/${getEffectiveScrapLimit()}`;

  // Mob Boss-Exclusive Cash Badge & Black Market HUD Button
  const cashBadge = document.getElementById('ui-cash-badge');
  const hudBmBtn = document.getElementById('btn-hud-black-market');
  if (cashBadge) cashBadge.style.display = isMobBoss ? 'inline-flex' : 'none';
  if (hudBmBtn) hudBmBtn.style.display = isMobBoss ? 'inline-flex' : 'none';
  if (isMobBoss) {
    document.getElementById('ui-cash').textContent = `$${gameState.syndicateCash} (${gameState.notoriety}★)`;
  }

  const manaBadge = document.getElementById('ui-mana-badge');
  const chronosBadge = document.getElementById('ui-chronos-badge');
  const partsBadge = document.getElementById('ui-parts-badge');
  manaBadge.style.display = gameState.classType === 'Mage' ? 'inline-flex' : 'none';
  chronosBadge.style.display = gameState.classType === 'Chronomancer' ? 'inline-flex' : 'none';
  partsBadge.style.display = gameState.classType === 'Artificer' ? 'inline-flex' : 'none';

  if (gameState.classType === 'Mage') {
    document.getElementById('ui-mana').textContent = `${gameState.player.mana}/${gameState.player.maxMana}`;
  } else if (gameState.classType === 'Chronomancer') {
    document.getElementById('ui-chronos').textContent = `${gameState.player.chronos}/${gameState.player.maxChronos}`;
  } else if (gameState.classType === 'Artificer') {
    document.getElementById('ui-parts').textContent = `${gameState.player.parts}/${gameState.player.maxParts}`;
  }

  setEntityShieldVisual(gameState.player.shield > 0);

  // Enemy HUD
  const firstLiving = getFirstLivingEnemy();
  if (firstLiving) {
    const shieldStr = (firstLiving.shield || 0) > 0 ? ` | 🛡️ ${firstLiving.shield}` : '';
    document.getElementById('enemy-name-label').textContent = `${firstLiving.name} (HP: ${firstLiving.hp}/${firstLiving.maxHp}${shieldStr})`;
    const nextIntent = firstLiving.intents[firstLiving.turnIndex % firstLiving.intents.length];
    const intentPrefix = nextIntent.cardName ? `🃏 ${nextIntent.cardName}: ` : '';
    const multiCardNote = (firstLiving.cardsPerTurn || 1) > 1 ? ` [Plays ${firstLiving.cardsPerTurn} cards/turn]` : '';
    document.getElementById('enemy-intent-badge').textContent = `NEXT: ${intentPrefix}${nextIntent.desc}${multiCardNote}`;

    let statusParts = [];
    if (firstLiving.poison > 0) statusParts.push(`☣️ Poison: ${firstLiving.poison}`);
    if (firstLiving.burn > 0) statusParts.push(`🔥 Burn: ${firstLiving.burn}`);
    if (firstLiving.hemorrhage > 0) statusParts.push(`🩸 Bleed: ${firstLiving.hemorrhage}`);
    if (gameState.bountyTargetId === firstLiving.id) statusParts.push(`🎯 BOUNTY`);
    if (gameState.classType === 'Warrior' && getClassUnlockedArray('Warrior')[1] && gameState.warriorNoHpLossTurns >= 2) {
      statusParts.push(`🐢 1.5x MOMENTUM`);
    }
    document.getElementById('enemy-status-badges').textContent = statusParts.join(' | ');
  }

  // Class Ability Button
  const abilityBtn = document.getElementById('btn-class-ability');
  const abilityLabels = {
    Mage: '🔮 Mana Convert (2💧 → +1⚡ & +1 Slot)',
    Warrior: '🛡️ Shield Wall (1⚡ → +20 Shield)',
    Rogue: '🗡️ Precise Poison (1⚡ → +8 Next Hit)',
    Chronomancer: '⏳ Temporal Loop (2⏳ → Clone Slot 1)',
    Artificer: gameState.turrets.length >= getMaxTurrets()
      ? `⚡ Overclock Barrage (1⚡ + 2⚙️ → 2x Volley)`
      : `🤖 Deploy Turret (1⚡ + 2⚙️ → ${gameState.turrets.length}/${getMaxTurrets()})`,
    'Blood Reaver': '🩸 Crimson Pact (-8❤️ → +1⚡, 50% Lifesteal)',
    'Mob Boss': '🎯 Put Out a Hit ($20 💵 → 18 DMG + Bounty)'
  };
  abilityBtn.textContent = abilityLabels[gameState.classType] || 'Class Ability';

  // Execute Button Label
  const execBtn = document.getElementById('btn-execute-seq');
  const hasQueued = gameState.sequence.some(s => s !== null);
  execBtn.textContent = hasQueued ? '▶ EXECUTE SEQUENCE' : '⏭️ REST & CHARGE (+1 SLOT)';

  // Sequence Slots
  const seqContainer = document.getElementById('sequence-slots');
  seqContainer.innerHTML = '';
  gameState.sequence.forEach((cardObj, idx) => {
    const slotDiv = document.createElement('div');
    const isTemp = idx >= 3;
    slotDiv.className = `seq-slot ${cardObj ? 'filled' : ''} ${isTemp ? 'temp-slot' : ''}`;
    if (!cardObj) {
      slotDiv.innerHTML = `<div class="slot-label">${isTemp ? 'ECHO SLOT ' + (idx + 1) : 'SLOT ' + (idx + 1)}</div><div style="font-size:0.75rem;color:var(--text-muted);">Empty</div>`;
    } else {
      const def = CARD_DATABASE[cardObj.id];
      slotDiv.innerHTML = `
        <div class="slot-label">SLOT ${idx + 1} (Click to Undo)</div>
        <div style="font-weight:900;font-size:0.86rem;color:#fff;">${def.name}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">${def.text}</div>
      `;
      slotDiv.onclick = () => removeCardFromSequence(idx);
    }
    seqContainer.appendChild(slotDiv);
  });

  // Stasis Vault
  document.getElementById('vault-cap-label').textContent = `${gameState.vault.length}/${gameState.maxVaultSlots}`;
  const vaultContainer = document.getElementById('vault-slots');
  vaultContainer.innerHTML = '';
  for (let v = 0; v < gameState.maxVaultSlots; v++) {
    const vObj = gameState.vault[v];
    const vSlot = document.createElement('div');
    vSlot.className = `vault-slot ${vObj ? 'occupied' : ''}`;
    if (!vObj) {
      vSlot.innerHTML = `<span style="font-size:0.74rem;color:var(--text-muted);">Vault Slot ${v + 1}</span>`;
    } else {
      const def = CARD_DATABASE[vObj.id];
      vSlot.innerHTML = `
        <div style="font-weight:800;font-size:0.8rem;color:#a5f3fc;">${def.name}</div>
        <div style="font-size:0.68rem;color:var(--text-muted);">Stored ${vObj.turnsInVault || 0}t • Click to Retrieve</div>
      `;
      vSlot.onclick = () => unvaultCardToHand(v);
    }
    vaultContainer.appendChild(vSlot);
  }

  // Hand Cards
  const handContainer = document.getElementById('hand-cards-container');
  handContainer.innerHTML = '';
  gameState.hand.forEach((cardObj, hIdx) => {
    const def = CARD_DATABASE[cardObj.id];
    const el = createCardElement(def, true, hIdx, cardObj);
    handContainer.appendChild(el);
  });
}

function createCardElement(cardDef, inBattle = false, handIdx = -1, cardObj = null) {
  const div = document.createElement('div');
  const classSlug = (cardDef.classTag || 'Neutral').toLowerCase().replace(/\s+/g, '-');
  div.className = `card-item class-${classSlug}`;

  const effectiveCost = (inBattle && cardObj && cardObj.freeCostOverride)
    ? 0
    : (inBattle ? getEffectiveCardCost(cardDef, -1) : cardDef.cost);

  const costIcons = { energy: '⚡', mana: '💧', chronos: '⏳', hp: '❤️', cash: '💵' };
  const cIcon = costIcons[cardDef.costType || 'energy'] || '⚡';
  const costText = cardDef.costType === 'cash' ? `$${effectiveCost}` : `${effectiveCost}${cIcon}`;

  const isZeroManaOmniscience =
    inBattle &&
    gameState.classType === 'Mage' &&
    getClassUnlockedArray('Mage')[3] &&
    cardDef.category === 'tome' &&
    (cardDef.costType || 'energy') === 'mana' &&
    effectiveCost === 0;

  if (isZeroManaOmniscience) {
    div.style.boxShadow = '0 0 14px rgba(192, 132, 252, 0.75)';
  }

  div.innerHTML = `
    <div class="card-header">
      <span class="card-name">${cardDef.name}</span>
      <span class="card-cost" style="${isZeroManaOmniscience ? 'color:#4ade80;' : ''}">${costText}</span>
    </div>
    <div class="card-type-row">
      <span>${cardDef.category.toUpperCase()} • ${cardDef.type}</span>
      <span>${cardDef.classTag}</span>
    </div>
    <div class="card-body">${cardDef.text}</div>
    ${inBattle ? `
      <div class="card-actions-bar">
        <button class="btn-mini vault">🔒 VAULT</button>
        <button class="btn-mini scrap">♻️ SCRAP</button>
      </div>
    ` : ''}
  `;

  if (inBattle) {
    div.onclick = (e) => {
      if (e.target.classList.contains('btn-mini')) return;
      playCardToSequence(handIdx);
    };
    div.querySelector('.btn-mini.vault').onclick = (e) => {
      e.stopPropagation();
      vaultCardFromHand(handIdx);
    };
    div.querySelector('.btn-mini.scrap').onclick = (e) => {
      e.stopPropagation();
      scrapCardFromHand(handIdx);
    };
  }

  return div;
}

// --- MODALS: BLACK MARKET (MOB BOSS EXCLUSIVE), DECK BUILDER, MASTERY TREE & RELICS ---
window.openBlackMarketModal = function() {
  if (gameState.classType !== 'Mob Boss') {
    showToast('The Underground Black Market is exclusive to the Mob Boss!', 'error');
    return;
  }

  const modal = document.getElementById('modal-black-market');
  if (!modal) return;
  if (!gameState.blackMarketStock || gameState.blackMarketStock.length === 0) {
    generateBlackMarketStock();
  }

  const rankInfo = getNotorietyRankInfo();
  const maxDeck = getMaxDeckSize();
  document.getElementById('bm-cash-display').textContent = `$${gameState.syndicateCash}`;
  document.getElementById('bm-notoriety-display').textContent = `${gameState.notoriety} ★`;
  document.getElementById('bm-rank-badge').textContent = rankInfo.title;
  document.getElementById('bm-deck-count').textContent = `${gameState.deck.length}/${maxDeck}`;
  document.getElementById('bm-restock-cost').textContent = `$${getBlackMarketRestockCost()}`;

  const grid = document.getElementById('bm-cards-grid');
  grid.innerHTML = '';

  gameState.blackMarketStock.forEach((slot, idx) => {
    const def = CARD_DATABASE[slot.cardId];
    if (!def) return;
    const price = getBlackMarketCardPrice(def);
    const cardDiv = document.createElement('div');
    cardDiv.className = `bm-card-slot ${slot.locked ? 'locked-slot' : ''} ${def.rarity === 'mythic' ? 'mythic-slot' : ''}`;

    if (slot.locked) {
      cardDiv.innerHTML = `
        <div class="bm-tier-badge">🔒 LOCKED SLOT</div>
        <div style="font-weight:900;font-size:1rem;color:#94a3b8;margin:10px 0;">Requires ${slot.reqRank}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Gain Notoriety ★ through combat, Scrapping & Syndicate cards to unlock higher-tier Contraband.</div>
      `;
    } else if (slot.sold) {
      cardDiv.innerHTML = `
        <div class="bm-tier-badge">✔ ACQUIRED</div>
        <div style="font-weight:900;font-size:1rem;color:#4ade80;margin:12px 0;">${def.name}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Smuggled into your active deck & hand.</div>
      `;
    } else {
      cardDiv.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="bm-tier-badge">TIER ${def.contrabandTier || 1} ${def.rarity.toUpperCase()}</span>
          <span style="font-weight:900;color:#eab308;">$${price}</span>
        </div>
        <div style="font-weight:900;font-size:1rem;color:#fff;margin:8px 0 4px 0;">${def.name}</div>
        <div style="font-size:0.82rem;color:#cbd5e1;line-height:1.35;flex:1;">${def.text}</div>
        <button class="btn-bm-buy" style="margin-top:10px;">SMUGGLE ($${price})</button>
      `;
      cardDiv.querySelector('button').onclick = () => {
        if (gameState.deck.length >= maxDeck) {
          showToast(`Deck is full (${maxDeck}/${maxDeck} cards)!`, 'error');
          return;
        }
        if (!spendSyndicateCash(price)) {
          showToast(`Need $${price} Syndicate Cash!`, 'error');
          return;
        }
        slot.sold = true;
        gameState.deck.push(def.id);
        if (gameState.screen === 'BATTLE' && !gameState.combatOver) {
          gameState.hand.push({ uid: 'bm_' + Date.now() + '_' + idx, id: def.id, turnsInVault: 0 });
          updateBattleUI();
        }
        updateBoardUI();
        showToast(`🕴️ Smuggled ${def.name} into your deck${gameState.screen === 'BATTLE' ? ' & hand' : ''}!`, 'success');
        window.openBlackMarketModal();
      };
    }

    grid.appendChild(cardDiv);
  });

  modal.classList.remove('hidden');
};

window.restockBlackMarket = function() {
  if (gameState.classType !== 'Mob Boss') return;
  const cost = getBlackMarketRestockCost();
  if (!spendSyndicateCash(cost)) {
    showToast(`Need $${cost} Syndicate Cash to restock!`, 'error');
    return;
  }
  gameState.blackMarketRestocks++;
  generateBlackMarketStock();
  updateBoardUI();
  if (gameState.screen === 'BATTLE') updateBattleUI();
  showToast('🔄 Black Market inventory restocked!', 'info');
  window.openBlackMarketModal();
};

function openDeckBuilderModal() {
  const modal = document.getElementById('modal-deck-builder');
  const filtersDiv = document.getElementById('builder-class-filters');
  const maxDeck = getMaxDeckSize();
  const classes = ['ALL', 'Mage', 'Warrior', 'Rogue', 'Chronomancer', 'Artificer', 'Blood Reaver', 'Mob Boss', 'Contraband', 'Neutral'];

  filtersDiv.innerHTML = '';
  classes.forEach(cls => {
    const btn = document.createElement('button');
    btn.className = `btn-filter ${gameState.builderFilter === cls ? 'active' : ''}`;
    btn.textContent = cls;
    btn.onclick = () => {
      gameState.builderFilter = cls;
      openDeckBuilderModal();
    };
    filtersDiv.appendChild(btn);
  });

  document.getElementById('builder-deck-count').textContent = `${gameState.deck.length}/${maxDeck}`;
  const catalogGrid = document.getElementById('builder-catalog-grid');
  const currentList = document.getElementById('builder-current-deck');
  catalogGrid.innerHTML = '';
  currentList.innerHTML = '';

  const filteredCards = Object.values(CARD_DATABASE).filter(c => gameState.builderFilter === 'ALL' || c.classTag === gameState.builderFilter);
  filteredCards.forEach(cardDef => {
    const countInDeck = gameState.deck.filter(id => id === cardDef.id).length;
    const item = document.createElement('div');
    item.className = 'shop-item-card';
    item.style.padding = '10px';
    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-weight:900;font-size:0.88rem;color:#fff;">
        <span>${cardDef.name}</span>
        <span style="color:var(--accent-gold);">${cardDef.costType === 'cash' ? '$' + cardDef.cost : cardDef.cost}</span>
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin:3px 0;">${cardDef.classTag} • ${cardDef.category.toUpperCase()} (${countInDeck}/${cardDef.limit})</div>
      <div style="font-size:0.78rem;color:#cbd5e1;">${cardDef.text}</div>
    `;
    item.onclick = () => {
      if (gameState.deck.length >= maxDeck) {
        showToast(`Max ${maxDeck} cards in deck!`, 'warning');
        return;
      }
      if (countInDeck >= cardDef.limit) {
        showToast(`Card limit (${cardDef.limit}) reached!`, 'warning');
        return;
      }
      gameState.deck.push(cardDef.id);
      openDeckBuilderModal();
      updateBoardUI();
    };
    catalogGrid.appendChild(item);
  });

  gameState.deck.forEach((cid, idx) => {
    const def = CARD_DATABASE[cid];
    if (!def) return;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:rgba(15,23,42,0.8);padding:6px 10px;border-radius:6px;border:1px solid #334155;font-size:0.82rem;cursor:pointer;';
    row.innerHTML = `<span>${def.name}</span><span style="color:#ef4444;font-weight:800;">✕</span>`;
    row.onclick = () => {
      if (gameState.deck.length <= 5) {
        showToast('Minimum 5 cards required in deck!', 'warning');
        return;
      }
      gameState.deck.splice(idx, 1);
      openDeckBuilderModal();
      updateBoardUI();
    };
    currentList.appendChild(row);
  });

  modal.classList.remove('hidden');
}

function renderMasteryTreeModal() {
  const modal = document.getElementById('modal-mastery');
  const container = document.getElementById('mastery-tree-container');
  container.innerHTML = '';

  Object.keys(MASTERY_DEFINITIONS).forEach(cls => {
    const mData = masteryData[cls] || { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] };
    const defs = MASTERY_DEFINITIONS[cls];

    const col = document.createElement('div');
    col.style.cssText = 'background:rgba(15,23,42,0.85);border:1px solid #334155;border-radius:10px;padding:12px;';
    col.innerHTML = `
      <div style="font-weight:900;font-size:1rem;color:${CLASS_THEMES[cls].cssColor};margin-bottom:4px;">${cls}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">Kills: ${mData.kills} | Runs: ${mData.runsCompleted}</div>
    `;

    defs.forEach((tier, idx) => {
      const isUnlocked = mData.unlocked[idx];
      const tDiv = document.createElement('div');
      tDiv.style.cssText = `padding:7px;border-radius:6px;margin-bottom:6px;border:1px solid ${isUnlocked ? '#22c55e' : '#334155'};background:${isUnlocked ? 'rgba(34,197,94,0.12)' : 'rgba(2,6,23,0.6)'};`;
      tDiv.innerHTML = `
        <div style="font-weight:800;font-size:0.8rem;color:${isUnlocked ? '#4ade80' : '#94a3b8'};">${isUnlocked ? '✔' : '🔒'} ${tier.title}</div>
        <div style="font-size:0.75rem;color:#e2e8f0;margin-top:2px;">${tier.effect}</div>
        <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">${tier.req}</div>
      `;
      col.appendChild(tDiv);
    });

    container.appendChild(col);
  });

  modal.classList.remove('hidden');
}

function renderRelicsModal() {
  const modal = document.getElementById('modal-relics');
  const grid = document.getElementById('relics-list-grid');
  grid.innerHTML = '';

  Object.entries(RELIC_CATALOG).forEach(([key, info]) => {
    const tier = gameState.relics[key] || 0;
    const div = document.createElement('div');
    div.className = 'shop-item-card';
    div.style.opacity = tier > 0 ? '1' : '0.5';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:900;color:#fff;">${info.name}</span>
        <span style="font-size:0.75rem;color:var(--accent-gold);">${info.rarity}</span>
      </div>
      <div style="font-size:0.78rem;color:#38bdf8;font-weight:800;margin:4px 0;">Current Tier: ${tier}/3</div>
      <div style="font-size:0.82rem;color:var(--text-muted);">${info.desc}</div>
    `;
    grid.appendChild(div);
  });

  modal.classList.remove('hidden');
}

// --- EVENT WIRING & BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start-game').onclick = () => navigateTo('CLASS_SELECT');
  document.getElementById('btn-main-mastery').onclick = renderMasteryTreeModal;
  document.getElementById('btn-back-main').onclick = () => navigateTo('MAIN');

  document.querySelectorAll('.btn-select-class').forEach(btn => {
    btn.onclick = (e) => {
      const card = e.target.closest('.class-card');
      if (card) selectHeroClass(card.dataset.class);
    };
  });

  document.getElementById('btn-board-back').onclick = () => navigateTo('CLASS_SELECT');
  document.getElementById('btn-board-deck').onclick = openDeckBuilderModal;
  document.getElementById('btn-board-relics').onclick = renderRelicsModal;
  document.getElementById('btn-board-mastery').onclick = renderMasteryTreeModal;
  document.getElementById('btn-board-black-market').onclick = window.openBlackMarketModal;
  document.getElementById('btn-flip-coin').onclick = triggerNodeReveal;
  document.getElementById('btn-enter-node').onclick = enterRevealedNode;

  document.getElementById('btn-shop-black-market').onclick = window.openBlackMarketModal;
  document.getElementById('btn-leave-shop').onclick = leaveShop;

  document.getElementById('btn-execute-seq').onclick = executeSequence;
  document.getElementById('btn-class-ability').onclick = useClassAbility;
  document.getElementById('btn-hud-relics').onclick = renderRelicsModal;
  document.getElementById('btn-hud-black-market').onclick = window.openBlackMarketModal;
  document.getElementById('btn-bm-restock').onclick = window.restockBlackMarket;

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.dataset.target;
      if (targetId) document.getElementById(targetId).classList.add('hidden');
    };
  });

  const adminModal = document.getElementById('modal-admin');
  document.getElementById('btn-open-admin').onclick = () => {
    adminModal.classList.remove('hidden');
  };
  document.getElementById('btn-admin-unlock').onclick = () => {
    const val = document.getElementById('admin-pass-input').value.trim();
    if (val === ADMIN_PASSCODE) {
      gameState.isBuilderUnlocked = true;
      document.getElementById('admin-lock-view').classList.add('hidden');
      document.getElementById('admin-controls-view').classList.remove('hidden');
      showToast('Admin Sandbox Unlocked!', 'success');
    } else {
      showToast('Invalid Admin Passcode!', 'error');
    }
  };
  document.getElementById('btn-admin-gold').onclick = () => {
    gameState.gold += 500;
    updateBoardUI();
    if (gameState.screen === 'BATTLE') updateBattleUI();
    showToast('+500g Gold Added!', 'success');
  };
  document.getElementById('btn-admin-cash').onclick = () => {
    gainSyndicateCash(250);
    gainNotoriety(25);
    updateBoardUI();
    if (gameState.screen === 'BATTLE') updateBattleUI();
    showToast('+$250 Cash & +25 ★ Notoriety Added!', 'success');
  };
  document.getElementById('btn-admin-mastery').onclick = () => {
    Object.keys(masteryData).forEach(cls => {
      masteryData[cls].kills = 99;
      masteryData[cls].runsCompleted = 10;
      masteryData[cls].unlocked = [true, true, true, true];
    });
    saveMasteryData();
    showToast('All T1–T4 Masteries Unlocked!', 'success');
  };
  document.getElementById('btn-admin-stage2').onclick = () => {
    window.ascendToStageTwo();
    adminModal.classList.add('hidden');
  };
  document.getElementById('btn-admin-builder').onclick = () => {
    adminModal.classList.add('hidden');
    openDeckBuilderModal();
  };
});
