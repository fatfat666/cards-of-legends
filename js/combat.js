// --- COMBAT ENGINE: SEQUENCES, 6-CONSTRUCT FOUNDRY, T1-T4 MASTERIES & CARD-PLAYING ENEMY AI (v0.8.0) ---

function getEffectiveCardCost(cardDef, slotIdx = -1) {
  if (!cardDef) return 0;
  let cost = cardDef.cost;
  if (cardDef.id === 'battering_rampart' && slotIdx === 0) cost = 1;
  if (cardDef.id === 'crimson_frenzy' && gameState.player.hp < gameState.player.maxHp * 0.5) cost = 0;

  // Mage T4 Mastery: Astral Omniscience (Every 3rd Tome played costs 0 Mana)
  if (
    gameState.classType === 'Mage' &&
    getClassUnlockedArray('Mage')[3] &&
    cardDef.category === 'tome' &&
    (cardDef.costType || 'energy') === 'mana' &&
    ((gameState.tomesPlayedThisBattle + 1) % 3 === 0)
  ) {
    return 0;
  }

  if ((cardDef.costType || 'energy') === 'energy' && gameState.prismaticActive && cardDef.type === 'ATTACK') {
    cost = Math.max(0, cost - 1);
  }
  return cost;
}

function getEffectiveScrapLimit() {
  return (gameState.scrapLimit || 1) + (gameState.bonusScrapLimitThisTurn || 0);
}

function initBattle(enemiesList) {
  gameState.enemies = enemiesList.map((e, i) => ({
    ...e,
    id: 'enemy_' + i,
    hp: e.maxHp,
    shield: e.shield || 0,
    poison: 0,
    burn: 0,
    hemorrhage: 0,
    turnIndex: 0
  }));

  gameState.hand = [];
  gameState.vault = [];
  gameState.sequence = [null, null, null];
  gameState.scrappedThisTurn = 0;
  gameState.totalScrappedThisBattle = 0;
  gameState.bonusScrapLimitThisTurn = 0;
  gameState.nextScrapBonusEnergy = 0;
  gameState.isRestTurn = false;
  gameState.nextTurnRestBonus = false;
  gameState.nextTurnBonusEnergy = 0;
  gameState.nextTurnBonusMana = 0;
  gameState.manaSpentThisTurn = 0;
  gameState.cardsPlayedThisTurn = 0;
  gameState.tomesPlayedThisBattle = 0;
  gameState.playedCardsHistory = [];
  gameState.battleTurnCount = 1;
  gameState.warriorNoHpLossTurns = 0;
  gameState.tookHpDamageThisTurn = false;
  gameState.shieldDecayLocked = false;
  gameState.prismaticActive = false;
  gameState.spellweaverEchoActive = false;
  gameState.miragePoisonRetaliate = 0;
  gameState.thornsDmgThisTurn = 0;
  gameState.guaranteedDodges = 0;
  gameState.shadowCritPrimed = false;
  gameState.tempCritBonus = 0;
  gameState.nextAttackBonusDmg = 0;
  gameState.nextAttackForceCrit = false;
  gameState.nextAttackBleed = 0;
  gameState.nextAttackLifesteal = 0;
  gameState.enemyAtkDebuff = 0;
  gameState.bountyTargetId = null;
  gameState.reactiveArmorActive = false;
  gameState.turrets = [];
  gameState.mobEnforcers = [];
  gameState.warriorRevived = false;
  gameState.isExecuting = false;
  gameState.combatOver = false;

  const unlocked = getClassUnlockedArray(gameState.classType);

  gameState.player.shield = 0;
  if (gameState.classType === 'Warrior') {
    gameState.player.shield = unlocked[0] ? 20 : 15; // T1: Heavy Iron (+5 Starting Shield)
  }
  if (gameState.classType === 'Chronomancer') {
    gameState.player.shield = 5;
    gameState.player.maxChronos = unlocked[3] ? 4 : 3;
    gameState.player.chronos = 1;
  }
  if (gameState.classType === 'Artificer') {
    gameState.player.shield = 10;
    gameState.player.parts = 2;
    if (unlocked[1]) {
      deployArtificerConstruct('auto_turret', 10); // T2: Twin-Linked Chassis
    }
  }
  if (gameState.classType === 'Mob Boss') {
    gameState.player.shield = 10;
    if (unlocked[1]) {
      summonMobEnforcer(); // T2: Made Men
    }
  }

  gameState.player.energy = gameState.player.maxEnergy;
  if (gameState.classType === 'Rogue' && unlocked[1]) {
    gameState.player.energy += 1; // T2: Assassin Mastery (+1 Energy)
  }

  if (gameState.classType === 'Mage') {
    gameState.player.maxMana = unlocked[1] ? 7 : 5; // T2: Mana Overflow (+2 Max Mana)
    gameState.player.mana = unlocked[1] ? 5 : 3;
  } else {
    gameState.player.mana = 0;
  }

  // Relic: Deflection
  if (gameState.relics.DEFLECTION > 0) {
    addPlayerShield(gameState.relics.DEFLECTION * 3);
  }

  // Relic: Chrono Hourglass Tier 3 (+1 permanent Sequence Slot on Turn 1)
  if ((gameState.relics.CHRONO_HOURGLASS || 0) >= 3) {
    gameState.sequence.push(null);
  }

  const actionCards = [];
  const tomeCards = [];
  gameState.deck.forEach((cid, idx) => {
    const def = CARD_DATABASE[cid];
    const instance = { uid: 'card_' + idx + '_' + Math.random().toString(36).substr(2, 5), id: cid, turnsInVault: 0 };
    if (def && def.category === 'tome') tomeCards.push(instance);
    else actionCards.push(instance);
  });

  gameState.drawPileAction = shuffleArray(actionCards);
  gameState.drawPileTome = shuffleArray(tomeCards);

  renderCombatUnits();
  drawCardsForTurn(true);

  // Rogue T2: Free Smoke Screen on Turn 1
  if (gameState.classType === 'Rogue' && unlocked[1]) {
    gameState.hand.push({
      uid: 'card_rogue_t2_' + Math.random().toString(36).substr(2, 5),
      id: 'smoke_screen',
      turnsInVault: 0,
      freeCostOverride: true
    });
  }

  updateBattleUI();
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawSpecificCategory(category) {
  const pile = category === 'tome' ? gameState.drawPileTome : gameState.drawPileAction;
  if (pile.length === 0) {
    const matchingIds = gameState.deck.filter(cid => {
      const def = CARD_DATABASE[cid];
      return def && (category === 'tome' ? def.category === 'tome' : def.category !== 'tome');
    });
    if (matchingIds.length === 0) return null;
    const rebuilt = matchingIds.map((cid, i) => ({
      uid: 'reshuf_' + i + '_' + Math.random().toString(36).substr(2, 5),
      id: cid,
      turnsInVault: 0
    }));
    if (category === 'tome') gameState.drawPileTome = shuffleArray(rebuilt);
    else gameState.drawPileAction = shuffleArray(rebuilt);
  }
  const activePile = category === 'tome' ? gameState.drawPileTome : gameState.drawPileAction;
  return activePile.pop() || null;
}

function drawCardsForTurn(isFirstTurn) {
  let drawn = [];
  if (isFirstTurn) {
    for (let i = 0; i < 4; i++) {
      const c = drawSpecificCategory('action');
      if (c) drawn.push(c);
    }
    const t = drawSpecificCategory('tome');
    if (t) drawn.push(t);
    while (drawn.length < 5) {
      const fallback = drawSpecificCategory('action') || drawSpecificCategory('tome');
      if (!fallback) break;
      drawn.push(fallback);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const wantTome = Math.random() < 0.20;
      let c = drawSpecificCategory(wantTome ? 'tome' : 'action');
      if (!c) c = drawSpecificCategory(wantTome ? 'action' : 'tome');
      if (c) drawn.push(c);
    }
  }

  drawn.forEach(c => {
    if (c.id === 'vial_stash' && gameState.vault.length < gameState.maxVaultSlots) {
      c.turnsInVault = 0;
      gameState.vault.push(c);
      showToast('Vial Stash auto-stashed into Stasis Vault!', 'info');
    } else if (c.id === 'assembly_blueprint' && gameState.vault.length === 0 && gameState.maxVaultSlots > 0) {
      c.turnsInVault = 0;
      gameState.vault.push(c);
      showToast('Assembly Blueprint primed in Stasis Vault!', 'info');
    } else {
      gameState.hand.push(c);
    }
  });
}

function drawSingleRandomCard() {
  const wantTome = Math.random() < 0.25;
  let c = drawSpecificCategory(wantTome ? 'tome' : 'action');
  if (!c) c = drawSpecificCategory(wantTome ? 'action' : 'tome');
  if (c) gameState.hand.push(c);
}

// --- STASIS VAULT & SCRAP MECHANICS ---
function vaultCardFromHand(handIndex) {
  if (gameState.isExecuting || gameState.combatOver) return;
  if (gameState.vault.length >= gameState.maxVaultSlots) {
    showToast(`Stasis Vault is full (${gameState.maxVaultSlots}/${gameState.maxVaultSlots})!`, 'warning');
    return;
  }
  const cardObj = gameState.hand[handIndex];
  if (!cardObj) return;
  gameState.hand.splice(handIndex, 1);
  cardObj.turnsInVault = 0;
  gameState.vault.push(cardObj);
  showToast(`Stored ${CARD_DATABASE[cardObj.id].name} in Stasis Vault`, 'info');
  updateBattleUI();
}

function unvaultCardToHand(vaultIndex) {
  if (gameState.isExecuting || gameState.combatOver) return;
  const cardObj = gameState.vault[vaultIndex];
  if (!cardObj) return;
  gameState.vault.splice(vaultIndex, 1);
  cardObj.wasUnvaultedThisTurn = true;
  cardObj.unvaultedTurnsHeld = cardObj.turnsInVault || 0;
  gameState.hand.push(cardObj);

  if (cardObj.id === 'assembly_blueprint') {
    if (deployArtificerConstruct('auto_turret', 10)) {
      renderArtificerTurrets();
      showToast('Assembly Blueprint Unvaulted: Auto-Turret Deployed!', 'success');
    }
  } else {
    showToast(`Retrieved ${CARD_DATABASE[cardObj.id].name} (50% Paradox Echo primed!)`, 'info');
  }
  updateBattleUI();
}

function scrapCardFromHand(handIndex) {
  if (gameState.isExecuting || gameState.combatOver) return;
  const limit = getEffectiveScrapLimit();
  if (gameState.scrappedThisTurn >= limit) {
    showToast(`Scrap limit reached (${limit}/turn)!`, 'warning');
    return;
  }
  const cardObj = gameState.hand[handIndex];
  if (!cardObj) return;
  const def = CARD_DATABASE[cardObj.id];

  gameState.hand.splice(handIndex, 1);
  gameState.scrappedThisTurn++;
  gameState.totalScrappedThisBattle++;

  let energyGain = 1 + gameState.nextScrapBonusEnergy;
  gameState.nextScrapBonusEnergy = 0;

  if (def.id === 'money_laundering') {
    energyGain += 1;
    gainSyndicateCash(25, playerContainer ? playerContainer.x : 180, playerContainer ? playerContainer.y - 30 : 100);
    gainNotoriety(2);
    showToast('Laundered Card: +$25 Cash, +2 ★ & +2 Energy!', 'success');
  } else if (def.id === 'deja_vu') {
    gainChronos(1);
    drawSingleRandomCard();
    showToast('Déjà Vu Scrapped: +1 Chronos, +1 Card & +1 Energy!', 'info');
  } else if (def.id === 'bastion_scrap') {
    addPlayerShield(12);
    showToast('Bastion Scrapped: +12 Armor Shield & +1 Energy!', 'info');
  } else if (def.id === 'reinforced_plating') {
    gainScrapParts(2);
    showToast('Plating Scrapped: +2 Scrap Parts & +1 Energy!', 'info');
  } else if (def.id === 'scrap_salvage') {
    gainScrapParts(3);
    showToast('Scrap Salvage Dismantled: +3 Scrap Parts & +1 Energy!', 'success');
  } else {
    showToast(`Scrapped ${def.name} for +${energyGain} ⚡`, 'info');
  }

  gameState.player.energy += energyGain;

  if (gameState.classType === 'Mob Boss') {
    gainSyndicateCash(20, playerContainer ? playerContainer.x : 180, playerContainer ? playerContainer.y - 35 : 95);
    gainNotoriety(2);
    showToast('💼 Syndicate Chop-Shop: +$20 Cash & +2 ★ Notoriety!', 'success');
  }

  if (gameState.classType === 'Artificer') {
    // T1: Master Salvager (+2 Parts on Scrap & 4 DMG Salvage Bolt)
    gainScrapParts(2);
    const target = getFirstLivingEnemy();
    if (target) {
      dealDamageToEnemy(target, 4, false, '#f59e0b');
      spawnFloatingText('SALVAGE BOLT -4', target.container.x, target.container.y - 40, '#f59e0b');
      checkPostActionVictoryOrDefeat();
    }
    if (getClassUnlockedArray('Artificer')[2] && gameState.totalScrappedThisBattle % 4 === 0) {
      addPlayerShield(15);
      gameState.enemies.forEach(e => {
        if (e.hp > 0) dealDamageToEnemy(e, 20, false, '#38bdf8');
      });
      triggerShake(14, 10);
      showToast('💥 SINGULARITY CORE MELTDOWN: 20 AoE DMG & +15 Shield!', 'success');
      checkPostActionVictoryOrDefeat();
    }
  }

  updateBattleUI();
}

// --- SEQUENCE PLACEMENT & UNDO ---
function playCardToSequence(handIndex) {
  if (gameState.isExecuting || gameState.combatOver) return;
  const cardObj = gameState.hand[handIndex];
  if (!cardObj) return;
  const cardDef = CARD_DATABASE[cardObj.id];

  const slotIdx = gameState.sequence.findIndex(s => s === null);
  if (slotIdx === -1) {
    showToast('Sequence slots are full! Execute or click a slot to undo.', 'warning');
    return;
  }

  const effectiveCost = cardObj.freeCostOverride ? 0 : getEffectiveCardCost(cardDef, slotIdx);
  const costType = cardDef.costType || 'energy';

  if (costType === 'mana') {
    if (gameState.player.mana < effectiveCost) {
      showToast(`Not enough Mana! Need ${effectiveCost} 💧`, 'error');
      return;
    }
    gameState.player.mana -= effectiveCost;
    gameState.manaSpentThisTurn += effectiveCost;
  } else if (costType === 'chronos') {
    if ((gameState.player.chronos || 0) < effectiveCost) {
      showToast(`Not enough Chronos! Need ${effectiveCost} ⏳`, 'error');
      return;
    }
    gameState.player.chronos -= effectiveCost;
  } else if (costType === 'hp') {
    if (gameState.player.hp <= effectiveCost) {
      showToast(`Not enough HP! Need >${effectiveCost} ❤️`, 'error');
      return;
    }
    spendPlayerHp(effectiveCost);
  } else if (costType === 'cash') {
    if ((gameState.syndicateCash || 0) < effectiveCost) {
      showToast(`Not enough Syndicate Cash! Need $${effectiveCost} 💵`, 'error');
      return;
    }
    spendSyndicateCash(effectiveCost);
  } else {
    if (gameState.player.energy < effectiveCost) {
      showToast(`Not enough Energy! Need ${effectiveCost} ⚡`, 'error');
      return;
    }
    gameState.player.energy -= effectiveCost;
  }

  cardObj.paidCost = effectiveCost;
  cardObj.paidCostType = costType;
  gameState.hand.splice(handIndex, 1);

  if (cardDef.id === 'chrono_slash' && slotIdx === 0) {
    gainChronos(1);
    showToast('Chrono Slash placed in Slot 1: +1 Chronos!', 'info');
  }

  // Chronomancer T2 Fix: Slot 1 stays queued so player can undo/reorder, and fires at 0ms on Execute Sequence!
  gameState.sequence[slotIdx] = cardObj;
  updateBattleUI();
}

function removeCardFromSequence(slotIdx) {
  if (gameState.isExecuting || gameState.combatOver) return;
  const cardObj = gameState.sequence[slotIdx];
  if (!cardObj) return;

  const costType = cardObj.paidCostType || 'energy';
  const refund = cardObj.paidCost !== undefined ? cardObj.paidCost : CARD_DATABASE[cardObj.id].cost;

  if (costType === 'mana') {
    gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + refund);
    gameState.manaSpentThisTurn = Math.max(0, gameState.manaSpentThisTurn - refund);
  } else if (costType === 'chronos') {
    gainChronos(refund);
  } else if (costType === 'hp') {
    gameState.player.hp = Math.min(gameState.player.maxHp + getBloodReaverOverhealCap(), gameState.player.hp + refund);
  } else if (costType === 'cash') {
    gameState.syndicateCash += refund;
  } else {
    gameState.player.energy += refund;
  }

  gameState.sequence[slotIdx] = null;
  gameState.hand.push(cardObj);
  updateBattleUI();
}

// --- CLASS ABILITIES ---
function useClassAbility() {
  if (gameState.isExecuting || gameState.combatOver) return;

  if (gameState.classType === 'Mage') {
    if (gameState.player.mana < 2) { showToast('Need 2 Mana 💧!', 'error'); return; }
    if (gameState.sequence.length >= 4) { showToast('Max 4 Sequence Slots active!', 'warning'); return; }
    gameState.player.mana -= 2;
    gameState.manaSpentThisTurn += 2;
    gameState.player.energy += 1;
    gameState.sequence.push(null);
    spawnVFXParticles(playerContainer.x, playerContainer.y, 0xc084fc, 16, 4);
    showToast('Mana Convert: +1 ⚡ & +1 Temp Sequence Slot!', 'success');
  } else if (gameState.classType === 'Warrior') {
    if (gameState.player.energy < 1) { showToast('Need 1 Energy ⚡!', 'error'); return; }
    gameState.player.energy -= 1;
    addPlayerShield(20);
    spawnVFXParticles(playerContainer.x, playerContainer.y, 0x38bdf8, 16, 4);
    showToast('Shield Wall: +20 Armor Shield!', 'success');
  } else if (gameState.classType === 'Rogue') {
    if (gameState.player.energy < 1) { showToast('Need 1 Energy ⚡!', 'error'); return; }
    gameState.player.energy -= 1;
    gameState.nextAttackBonusDmg += 8;
    spawnVFXParticles(playerContainer.x, playerContainer.y, 0x4ade80, 14, 4);
    showToast('Precise Poison: +8 DMG on next hit!', 'success');
  } else if (gameState.classType === 'Chronomancer') {
    if ((gameState.player.chronos || 0) < 2) { showToast('Need 2 Chronos ⏳!', 'error'); return; }
    const slot0 = gameState.sequence[0];
    if (!slot0) { showToast('Place a card in Slot 1 first to Temporal Loop it!', 'warning'); return; }
    if (gameState.sequence.length >= 5) { showToast('Max Sequence Slots reached!', 'warning'); return; }
    gameState.player.chronos -= 2;
    const cloneCard = {
      uid: 'echo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      id: slot0.id,
      turnsInVault: 0,
      isTemporalClone: true
    };
    gameState.sequence.push(cloneCard);
    spawnVFXParticles(playerContainer.x, playerContainer.y, 0x2dd4bf, 18, 4.5);
    showToast(`Temporal Loop: Cloned ${CARD_DATABASE[slot0.id].name} into Temp Echo Slot!`, 'success');
  } else if (gameState.classType === 'Artificer') {
    if (gameState.player.energy < 1 || (gameState.player.parts || 0) < 2) {
      showToast('Need 1 ⚡ & 2 Scrap Parts ⚙️!', 'error');
      return;
    }
    gameState.player.energy -= 1;
    gameState.player.parts -= 2;
    const maxBays = getMaxTurrets();
    if (gameState.turrets.length < maxBays) {
      deployArtificerConstruct('auto_turret', 10);
      renderArtificerTurrets();
      spawnVFXParticles(playerContainer.x + 50, playerContainer.y, 0xf59e0b, 16, 4);
      showToast(`Deployed Auto-Turret Drone (${gameState.turrets.length}/${maxBays})!`, 'success');
    } else {
      fireAllArtificerTurrets(2.0);
      showToast(`⚡ OVERCLOCK BARRAGE: All ${maxBays} Constructs fired at 2x DMG!`, 'success');
      checkPostActionVictoryOrDefeat();
    }
  } else if (gameState.classType === 'Blood Reaver') {
    if (gameState.player.hp <= 8) { showToast('Need >8 HP ❤️ for Crimson Pact!', 'error'); return; }
    spendPlayerHp(8);
    gameState.player.energy += 1;
    gameState.nextAttackLifesteal = 0.50;
    gameState.nextAttackBleed += 4;
    spawnVFXParticles(playerContainer.x, playerContainer.y, 0xe11d48, 18, 4.5);
    showToast('Crimson Pact: -8 HP → +1 ⚡, +50% Lifesteal & +4 Hemorrhage on next hit!', 'success');
  } else if (gameState.classType === 'Mob Boss') {
    if ((gameState.syndicateCash || 0) < 20) {
      showToast('Need $20 Syndicate Cash 💵 for Put Out a Hit!', 'error');
      return;
    }
    const target = getFirstLivingEnemy();
    if (!target) return;
    spendSyndicateCash(20);
    gameState.bountyTargetId = target.id;
    gameState.nextAttackBonusDmg = Math.max(gameState.nextAttackBonusDmg, 0);
    const dmg = Math.round(12 * 1.5);
    spawnGunfireTracer(playerContainer.x + 20, playerContainer.y, target.container.x, target.container.y, 0xef4444);
    dealDamageToEnemy(target, dmg, false, '#ef4444');
    spawnFloatingText('🎯 BOUNTY HIT!', target.container.x, target.container.y - 52, '#ef4444');
    showToast(`🎯 PUT OUT A HIT on ${target.name}! +$25 Cash & +5 ★ on kill!`, 'success');
    checkPostActionVictoryOrDefeat();
  }
  updateBattleUI();
}

// --- SEQUENCE EXECUTION & PARADOX ECHO ENGINE ---
function executeSequence() {
  if (gameState.isExecuting || gameState.combatOver) return;
  const filledCount = gameState.sequence.filter(s => s !== null).length;

  if (filledCount === 0) {
    gameState.isRestTurn = true;
    gameState.nextTurnRestBonus = true;
    if (gameState.classType === 'Mage') {
      gameState.nextTurnBonusMana += 1;
      showToast('Rest & Charge: +1 Temp Slot & +1 Mana next turn!', 'info');
    } else if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[2]) {
      showToast('Sovereign of Time: Rest grants +2 Temp Slots (5 total) & triggers Vault!', 'success');
      if (gameState.vault.length > 0) {
        const vaultedCopy = [...gameState.vault];
        vaultedCopy.forEach(vCard => {
          resolveSingleCardAction(vCard, 0, 1.0);
        });
      }
    } else {
      showToast('Rest & Charge: +1 Temp Sequence Slot next turn!', 'info');
    }
    endPlayerTurn();
    return;
  }

  gameState.isRestTurn = false;
  gameState.isExecuting = true;
  updateBattleUI();

  const chronoT2Instant = gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[1];
  const baseStepDelay = (gameState.relics.TIME_WARP || 0) > 0 ? 300 : 520;
  let stepIdx = 0;

  function runNextSlot() {
    if (gameState.combatOver) {
      gameState.isExecuting = false;
      return;
    }
    if (stepIdx >= gameState.sequence.length) {
      gameState.sequence = [null, null, null];
      setTimeout(() => {
        if (!gameState.combatOver) endPlayerTurn();
      }, 320);
      return;
    }

    const cardObj = gameState.sequence[stepIdx];
    const currentSlot = stepIdx;
    stepIdx++;

    if (!cardObj) {
      runNextSlot();
      return;
    }

    // Chronomancer T2 Mastery: Accelerated Timeline (Slot 1 executes instantaneously at 0ms!)
    const isInstantSlot1 = currentSlot === 0 && chronoT2Instant;
    if (isInstantSlot1) {
      spawnFloatingText('⚡ 0ms INSTANT CAST!', playerContainer.x, playerContainer.y - 58, '#2dd4bf');
    }

    resolveSingleCardAction(cardObj, currentSlot, 1.0);

    // Record card history for Temporal Paradox (avoiding self-loop)
    if (cardObj.id !== 'temporal_paradox') {
      gameState.playedCardsHistory.push(cardObj.id);
    }

    // Mage T4 Mastery: Astral Omniscience (Every 3rd Tome echoes at 100% power & grants +1 temp slot)
    const def = CARD_DATABASE[cardObj.id];
    const isMageT4Omniscience =
      gameState.classType === 'Mage' &&
      getClassUnlockedArray('Mage')[3] &&
      def &&
      def.category === 'tome' &&
      (gameState.tomesPlayedThisBattle % 3 === 0);

    if (isMageT4Omniscience) {
      setTimeout(() => {
        if (!gameState.combatOver) {
          spawnFloatingText('🌌 ASTRAL OMNISCIENCE ECHO!', playerContainer.x, playerContainer.y - 62, '#c084fc');
          resolveSingleCardAction(cardObj, currentSlot, 1.0);
          if (gameState.sequence.length < 5) {
            gameState.sequence.push(null);
          }
          updateBattleUI();
        }
      }, 180);
    }

    // Spellweaver Prism 50% Tome Echo
    if (def && def.category === 'tome' && gameState.spellweaverEchoActive && cardObj.id !== 'spellweaver_prism') {
      gameState.spellweaverEchoActive = false;
      setTimeout(() => {
        if (!gameState.combatOver) {
          spawnFloatingText('✨ SPELLWEAVER ECHO!', playerContainer.x, playerContainer.y - 55, '#c084fc');
          resolveSingleCardAction(cardObj, currentSlot, 0.5);
          updateBattleUI();
        }
      }, 220);
    }

    // Stasis Vault Paradox Echo (50% base, or 2x 100% triggers if Chronomancer T4 & held 2+ turns!)
    if (cardObj.wasUnvaultedThisTurn) {
      const isChronoT4 =
        gameState.classType === 'Chronomancer' &&
        getClassUnlockedArray('Chronomancer')[3] &&
        (cardObj.unvaultedTurnsHeld || 0) >= 2;

      setTimeout(() => {
        if (!gameState.combatOver) {
          if (isChronoT4) {
            spawnFloatingText('⏳ LORD OF ETERNITY 2X ECHO!', playerContainer.x, playerContainer.y - 58, '#2dd4bf');
            resolveSingleCardAction(cardObj, currentSlot, 1.0);
            resolveSingleCardAction(cardObj, currentSlot, 1.0);
          } else {
            spawnFloatingText('⏳ PARADOX ECHO!', playerContainer.x, playerContainer.y - 55, '#2dd4bf');
            resolveSingleCardAction(cardObj, currentSlot, 0.5);
          }
          updateBattleUI();
        }
      }, 240);
    }

    updateBattleUI();
    if (checkPostActionVictoryOrDefeat()) {
      gameState.isExecuting = false;
      return;
    }

    const delay = isInstantSlot1 ? 0 : (cardObj.wasUnvaultedThisTurn || isMageT4Omniscience ? baseStepDelay + 240 : baseStepDelay);
    if (delay === 0) {
      runNextSlot();
    } else {
      setTimeout(runNextSlot, delay);
    }
  }

  runNextSlot();
}

function resolveSingleCardAction(cardObj, slotIndex, echoScale = 1.0) {
  const cardDef = CARD_DATABASE[cardObj.id];
  if (!cardDef) return;
  const isEchoCast = echoScale < 1.0;

  if (!isEchoCast) {
    gameState.cardsPlayedThisTurn++;
    if (cardDef.category === 'tome') {
      gameState.tomesPlayedThisBattle++;
      // Relic: Aegis Overcharger (+4 Shield per tier whenever you play a Tome)
      if ((gameState.relics.AEGIS_OVERCHARGER || 0) > 0) {
        addPlayerShield(4 * gameState.relics.AEGIS_OVERCHARGER);
      }
    }
  }

  const targetEnemy = getFirstLivingEnemy();
  playCardVFX(cardDef.id, targetEnemy);

  // --- HANDLE TOME & SPECIAL UTILITY CARDS ---
  if (cardDef.id === 'arcane_battery') {
    gameState.nextTurnBonusEnergy += 1;
    const actionIdx = gameState.drawPileAction.length - 1;
    if (actionIdx >= 0) {
      gameState.hand.push(gameState.drawPileAction.pop());
    } else {
      const c = drawSpecificCategory('action');
      if (c) gameState.hand.push(c);
    }
    showToast('Arcane Battery: +1 ⚡ next turn & Tutored 1 Action!', 'info');
  } else if (cardDef.id === 'overcharge_conduit') {
    // Fixed v0.7.6 bug: overcharge_conduit is a TOME so resolve its damage & Slot 3 bonus here!
    if (targetEnemy) {
      const dmg = Math.max(1, Math.round(6 * echoScale));
      dealDamageToEnemy(targetEnemy, dmg, false, '#c084fc');
    }
    if (slotIndex === 2) {
      gameState.player.energy += 1;
      gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + 1);
      showToast('Overcharge Conduit Slot 3 Bonus: +1 ⚡ & +1 💧!', 'success');
    }
  } else if (cardDef.id === 'chrono_echo') {
    addPlayerShield(Math.max(1, Math.round(5 * echoScale)));
    drawSingleRandomCard();
    if (gameState.isRestTurn) gameState.nextTurnBonusMana += 1;
  } else if (cardDef.id === 'prismatic_catalyst') {
    gameState.prismaticActive = true;
    showToast('Prismatic Catalyst: Attack Spells cost -1 ⚡ this turn!', 'info');
  } else if (cardDef.id === 'spellweaver_prism') {
    addPlayerShield(Math.max(1, Math.round(6 * echoScale)));
    gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + 2);
    gameState.spellweaverEchoActive = true;
    showToast('Spellweaver Prism: +6 Shield, +2 Mana & Next Tome Echoes!', 'success');
  } else if (cardDef.id === 'astral_cataclysm') {
    // Mage Signature Expansion: Deal 24 AoE Arcane DMG; refund 1 Mana per enemy hit
    let baseDmg = Math.round(24 * echoScale);
    if (gameState.classType === 'Mage' && getClassUnlockedArray('Mage')[2]) {
      baseDmg += 15; // T3 Archmage Supremacy (+15 DMG on Mage Ultimates)
    }
    let enemiesHit = 0;
    gameState.enemies.forEach(e => {
      if (e.hp > 0) {
        dealDamageToEnemy(e, baseDmg, false, '#c084fc');
        enemiesHit++;
      }
    });
    if (enemiesHit > 0) {
      gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + enemiesHit);
      showToast(`Astral Cataclysm hit ${enemiesHit} enemies & refunded +${enemiesHit} 💧!`, 'success');
    }
  } else if (cardDef.id === 'juggernaut_stance') {
    addPlayerShield(Math.max(1, Math.round(10 * echoScale)));
    gameState.shieldDecayLocked = true;
    showToast('Juggernaut Stance: Shield Decay Locked for 1 turn!', 'info');
  } else if (cardDef.id === 'shadow_step') {
    addPlayerShield(Math.max(1, Math.round(15 * echoScale)));
    gameState.guaranteedDodges++;
    gameState.shadowCritPrimed = true;
    showToast('Shadow Step: +15 Shield, Guaranteed Dodge & 100% Crit Primed!', 'info');
  } else if (cardDef.id === 'smokebomb_barrage') {
    addPlayerShield(Math.max(1, Math.round(8 * echoScale)));
    gameState.guaranteedDodges++;
    gameState.enemies.forEach(e => {
      if (e.hp > 0) {
        e.poison = (e.poison || 0) + Math.max(1, Math.round(2 * echoScale));
        spawnPoisonBubbles(e.container.x, e.container.y);
      }
    });
  } else if (cardDef.id === 'stasis_surge') {
    if (targetEnemy) {
      dealDamageToEnemy(targetEnemy, Math.max(1, Math.round(8 * echoScale)), false, '#2dd4bf');
    }
    gainChronos(1);
    const c = drawSpecificCategory('action');
    if (c) gameState.hand.push(c);
  } else if (cardDef.id === 'chrono_rewind') {
    addPlayerShield(Math.max(1, Math.round(8 * echoScale)));
    gameState.player.energy += 1;
    if (gameState.sequence[0] && gameState.sequence[0].uid !== cardObj.uid) {
      const copy = { uid: 'rew_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), id: gameState.sequence[0].id, turnsInVault: 0 };
      gameState.hand.push(copy);
      showToast(`Chrono Rewind: Copied ${CARD_DATABASE[copy.id].name} to hand!`, 'success');
    }
  } else if (cardDef.id === 'temporal_paradox') {
    // Chronomancer Signature Expansion: Replay last 2 played cards at 75% effectiveness & +1 Energy
    gameState.player.energy += 1;
    const recent = gameState.playedCardsHistory.slice(-2);
    if (recent.length > 0) {
      showToast(`Temporal Paradox: Replaying ${recent.length} card(s) at 75% power & +1 ⚡!`, 'success');
      recent.forEach(prevId => {
        resolveSingleCardAction({ uid: 'paradox_' + Math.random().toString(36).slice(2, 6), id: prevId }, slotIndex, 0.75);
      });
    } else {
      showToast('Temporal Paradox: +1 ⚡ (No prior cards to replay yet)!', 'info');
    }
  } else if (cardDef.id === 'overclock_blueprint') {
    gainScrapParts(1);
    const c = drawSpecificCategory('action');
    if (c) gameState.hand.push(c);
    fireAllArtificerTurrets(1.0);
  } else if (cardDef.id === 'overload_capacitor') {
    if (gameState.turrets.length > 0) {
      fireAllArtificerTurrets(1.0);
      showToast('⚡ Overload Capacitor: All Constructs fired an immediate bonus volley!', 'success');
    } else {
      gainScrapParts(2);
      showToast('Overload Capacitor: Bay empty → +2 Scrap Parts!', 'info');
    }
  } else if (cardDef.id === 'reactive_armor') {
    addPlayerShield(Math.max(1, Math.round(8 * echoScale)));
    gameState.reactiveArmorActive = true;
    showToast('Reactive Armor Active: Construct hits grant +1 Part & 5 counter DMG!', 'info');
  } else if (cardDef.id === 'assembly_blueprint') {
    if (deployArtificerConstruct('auto_turret', 10)) {
      renderArtificerTurrets();
      showToast('Deployed 10-HP Auto-Turret Drone!', 'success');
    }
  } else if (cardDef.constructType && CONSTRUCT_CATALOG[cardDef.constructType]) {
    // All 6 Construct Schematic Tome Cards!
    const spec = CONSTRUCT_CATALOG[cardDef.constructType];
    if (deployArtificerConstruct(spec.type, spec.defaultHp)) {
      renderArtificerTurrets();
      spawnVFXParticles(playerContainer.x + 50, playerContainer.y, spec.colorHex, 18, 4.5);
      showToast(`Deployed ${spec.name} (${spec.defaultHp} HP)!`, 'success');
    }
  } else if (cardDef.id === 'tesla_arc_pylon') {
    // Artificer Signature Expansion: Deploy 12-HP Auto-Turret & immediate 8 AoE chain-lightning volley
    if (deployArtificerConstruct('auto_turret', 12)) {
      renderArtificerTurrets();
    }
    const aoeDmg = Math.max(1, Math.round(8 * echoScale));
    gameState.enemies.forEach(e => {
      if (e.hp > 0) {
        spawnChainLightningVFX(playerContainer.x + 40, playerContainer.y - 10, e.container.x, e.container.y, 0x38bdf8);
        dealDamageToEnemy(e, aoeDmg, false, '#38bdf8');
      }
    });
    showToast('Tesla Arc Pylon: 12-HP Turret Deployed + 8 AoE Chain Lightning!', 'success');
  } else if (cardDef.id === 'blood_suck') {
    if (targetEnemy) {
      const stacks = targetEnemy.hemorrhage || 0;
      if (stacks > 0) {
        const dmg = Math.max(1, Math.round(stacks * 2 * echoScale));
        const heal = Math.max(1, Math.round(stacks * 4 * echoScale));
        targetEnemy.hemorrhage = 0;
        dealDamageToEnemy(targetEnemy, dmg, false, '#e11d48');
        healPlayer(heal);
        showToast(`Blood Suck: Consumed ${stacks} Bleed → ${dmg} DMG & +${heal} HP!`, 'success');
      } else {
        showToast('Target has no Hemorrhage stacks!', 'warning');
      }
    }
  } else if (cardDef.id === 'sanguine_ward') {
    addPlayerShield(Math.max(1, Math.round(10 * echoScale)));
    gameState.enemies.forEach(e => {
      if (e.hp > 0) {
        e.hemorrhage = (e.hemorrhage || 0) + Math.max(1, Math.round(2 * echoScale));
      }
    });
  } else if (cardDef.id === 'syndicate_ledger') {
    const cashGain = Math.max(1, Math.round(15 * echoScale));
    gainSyndicateCash(cashGain, playerContainer.x, playerContainer.y - 30);
    gainNotoriety(2);
    const c = drawSpecificCategory('action');
    if (c) gameState.hand.push(c);
    gameState.mobEnforcers.forEach(m => { m.hp = Math.min(m.maxHp, m.hp + 5); });
    renderMobEnforcers();
  } else if (cardDef.id === 'hired_goon_contract') {
    if (summonMobEnforcer()) {
      renderMobEnforcers();
      showToast('Hired a 12-HP Frontline Enforcer!', 'success');
    }
    addPlayerShield(Math.max(1, Math.round(8 * echoScale)));
  } else if (cardDef.id === 'syndicate_hit_squad') {
    // Mob Boss Signature Expansion: Summon 2 Hired Enforcers (12 HP each) & immediate coordinated volley
    let hired = 0;
    if (summonMobEnforcer(12)) hired++;
    if (summonMobEnforcer(12)) hired++;
    renderMobEnforcers();
    fireAllMobEnforcers(echoScale);
    showToast(`Syndicate Hit Squad: ${hired} Enforcer(s) deployed & coordinated volley fired!`, 'success');
  } else if (cardDef.id === 'offers_you_cant_refuse') {
    gameState.enemyAtkDebuff = 0.50;
    addPlayerShield(Math.max(1, Math.round(10 * echoScale)));
    gainNotoriety(3);
    drawSingleRandomCard();
    showToast("Offer You Can't Refuse: Enemy ATK -50% this turn!", 'success');
  } else if (cardDef.id === 'family_consigliere') {
    addPlayerShield(Math.max(1, Math.round(10 * echoScale)));
    gainNotoriety(2);
    gameState.blackMarketRestockDiscount += 5;
    if (gameState.sequence.length < 5) {
      gameState.sequence.push(null);
    }
    showToast('Family Consigliere: +10 Shield, +1 Temp Slot & -$5 Black Market Restock!', 'success');
  } else if (cardDef.id === 'black_market_voucher') {
    gainSyndicateCash(Math.max(1, Math.round(18 * echoScale)), playerContainer.x, playerContainer.y - 30);
    gainNotoriety(3);
    const c = drawSpecificCategory('action');
    if (c) gameState.hand.push(c);
  } else if (cardDef.id === 'mercenary_contract') {
    if (summonMobEnforcer()) renderMobEnforcers();
    gameState.player.energy += 1;
  } else if (cardDef.id === 'adrenaline_syringe') {
    gameState.player.energy += 2;
    const c = drawSpecificCategory('action');
    if (c) gameState.hand.push(c);
    showToast('Adrenaline Syringe: +2 ⚡ & +1 Action Card!', 'success');
  } else if (cardDef.id === 'astral_compass') {
    // Neutral Signature Expansion: Draw 2 cards, +1 Scrap this turn, +10g / +$10 Cash
    drawSingleRandomCard();
    drawSingleRandomCard();
    gameState.bonusScrapLimitThisTurn += 1;
    gameState.gold += 10;
    if (gameState.classType === 'Mob Boss') {
      gainSyndicateCash(10, playerContainer.x, playerContainer.y - 30);
      showToast('Astral Compass: +2 Cards, +1 Scrap Limit, +10g & +$10 Cash!', 'success');
    } else {
      showToast('Astral Compass: +2 Cards, +1 Scrap Limit this turn & +10g!', 'success');
    }
  } else if (cardDef.id === 'loaded_dice') {
    gameState.player.energy += 1;
    gameState.tempCritBonus = Math.min(1.0, (gameState.tempCritBonus || 0) + 0.15);
    drawSingleRandomCard();
    showToast('Loaded Dice: +1 ⚡, +15% Crit & +1 Card!', 'success');
  } else if (cardDef.id === 'hollow_point_mag') {
    gameState.nextAttackBonusDmg += Math.max(1, Math.round(12 * echoScale));
    gameState.nextAttackForceCrit = true;
    gameState.nextAttackBleed += 3;
    showToast('Hollow-Point Mag Loaded: Next Attack +12 DMG, 100% Crit & +3 Bleed!', 'success');
  } else if (cardDef.id === 'syndicate_bribe') {
    gameState.player.energy += 2;
    drawSingleRandomCard();
    if (gameState.sequence.length < 5) gameState.sequence.push(null);
    showToast('Syndicate Bribe: +2 ⚡, +1 Temp Slot & +1 Card!', 'success');
  } else if (cardDef.id === 'godfathers_decree') {
    const aoeDmg = Math.max(1, Math.round(20 * echoScale));
    gameState.enemies.forEach(e => {
      if (e.hp > 0) dealDamageToEnemy(e, aoeDmg, false, '#eab308');
    });
    addPlayerShield(Math.max(1, Math.round(20 * echoScale)));
    if (!isEchoCast) {
      gameState.player.maxEnergy += 1;
      gameState.player.energy += 1;
    }
    showToast("👑 GODFATHER'S DECREE: 20 AoE DMG, +20 Shield & +1 Max Energy!", 'success');
  } else if (cardDef.id === 'vault_recycle') {
    if (gameState.vault.length > 0) {
      const vCard = gameState.vault.shift();
      vCard.wasUnvaultedThisTurn = true;
      vCard.unvaultedTurnsHeld = vCard.turnsInVault || 0;
      if (gameState.sequence[0] === null) {
        gameState.sequence[0] = vCard;
      } else {
        gameState.hand.push(vCard);
      }
      showToast(`Vault Recycled ${CARD_DATABASE[vCard.id].name}!`, 'info');
    }
    drawSingleRandomCard();
  } else if (cardDef.type === 'HEAL') {
    let healAmt = Math.max(1, Math.round(cardDef.value * echoScale));
    healPlayer(healAmt);
    if (cardDef.id === 'bootleg_tonic') {
      addPlayerShield(Math.max(1, Math.round(6 * echoScale)));
      // Fixed v0.7.6 bug: cleanse 2 Poison/Bleed stacks or run debuffs
      if (gameState.runDebuffs.length > 0) {
        gameState.runDebuffs.splice(0, 2);
      }
      showToast('Bootleg Tonic: +14 HP, +6 Shield & Cleansed Debuffs!', 'success');
    }
  } else if (cardDef.type === 'DEFEND') {
    let shieldAmt = cardDef.value;
    if (cardDef.id === 'stasis_bubble') {
      shieldAmt += (gameState.player.chronos || 0) * 4;
    }
    shieldAmt = Math.max(1, Math.round(shieldAmt * echoScale));
    addPlayerShield(shieldAmt);

    if (cardDef.id === 'fortify') {
      const doubled = Math.min(60, gameState.player.shield * 2);
      const diff = doubled - gameState.player.shield;
      if (diff > 0) addPlayerShield(diff);
    }
    if (cardDef.id === 'unbreakable_phalanx') {
      gameState.thornsDmgThisTurn += 8;
    }
    if (cardDef.id === 'velvet_kevlar') {
      gameState.thornsDmgThisTurn += 6;
    }
    if (cardDef.id === 'coagulate' && gameState.player.hp > gameState.player.maxHp) {
      gameState.nextTurnBonusEnergy += 1;
    }
    if (cardDef.id === 'protection_racket') {
      const cash = Math.max(1, Math.round((10 + gameState.mobEnforcers.length * 5) * echoScale));
      gainSyndicateCash(cash, playerContainer.x, playerContainer.y - 30);
    }
    if (cardDef.id === 'money_laundering') {
      gainSyndicateCash(Math.max(1, Math.round(15 * echoScale)), playerContainer.x, playerContainer.y - 30);
    }
    if (cardDef.id === 'armored_limousine') {
      gameState.shieldDecayLocked = true;
      if (summonMobEnforcer()) renderMobEnforcers();
    }
    if (cardDef.id === 'shadow_step_mirage') {
      // Rogue Signature Expansion: +10 Shield, +1 Guaranteed Dodge & apply 3 Poison to attacker
      gameState.miragePoisonRetaliate += Math.max(1, Math.round(3 * echoScale));
      showToast('Shadow Step Mirage: +10 Shield, Guaranteed Dodge & 3 Poison Counter!', 'success');
    }
    if (cardDef.guaranteedDodge) {
      gameState.guaranteedDodges++;
      if (gameState.classType === 'Rogue') gameState.shadowCritPrimed = true;
    }
  } else if (cardDef.type === 'ATTACK' && targetEnemy) {
    if (cardDef.id === 'catalytic_rupture') {
      const pStacks = targetEnemy.poison || 0;
      if (pStacks > 0) {
        const detonateDmg = Math.max(1, Math.round(pStacks * 1.5 * echoScale));
        targetEnemy.poison = 0;
        dealDamageToEnemy(targetEnemy, detonateDmg, false, '#22c55e');
        spawnFloatingText(`RUPTURE -${detonateDmg}!`, targetEnemy.container.x, targetEnemy.container.y - 45, '#4ade80');
      } else {
        showToast('Target has no Poison stacks to rupture!', 'warning');
      }
      return;
    }

    if (cardDef.id === 'shadow_prep') {
      gameState.nextTurnRestBonus = true;
      gameState.enemies.forEach(e => {
        if (e.hp > 0) {
          e.poison = (e.poison || 0) + Math.max(1, Math.round(3 * echoScale));
          spawnPoisonBubbles(e.container.x, e.container.y);
        }
      });
      return;
    }

    const hits = cardDef.hits || (cardDef.id === 'rift_strike' && cardObj.wasUnvaultedThisTurn ? 2 : 1);

    let baseDmg = cardDef.value;
    if (cardDef.id === 'shield_slam') {
      baseDmg = gameState.player.shield;
      gameState.player.shield = 0;
      setEntityShieldVisual(false);
    } else if (cardDef.id === 'titans_cleave') {
      // Warrior Signature Expansion: 14 AoE DMG + 50% of current Shield as bonus DMG
      baseDmg = 14 + Math.floor((gameState.player.shield || 0) * 0.5);
    } else if (cardDef.id === 'volatile_reserve') {
      baseDmg += (cardObj.turnsInVault || 0) * 6;
    } else if (cardDef.id === 'mana_overload') {
      baseDmg += (gameState.manaSpentThisTurn || 0) * 6;
    } else if (cardDef.id === 'patience_fury' && gameState.isRestTurn) {
      baseDmg = 24;
      addPlayerShield(8);
    } else if (cardDef.id === 'cleaving_execution' && gameState.player.shield >= 15) {
      baseDmg += 10;
    } else if (cardDef.id === 'entropy_bolt') {
      const emptySlots = gameState.sequence.filter(s => s === null).length;
      baseDmg += emptySlots * 4;
    } else if (cardDef.id === 'capacitor_discharge') {
      baseDmg = (gameState.player.parts || 0) * 5;
      gameState.player.parts = 0;
    } else if (cardDef.id === 'scrap_cannon') {
      baseDmg += (gameState.scrappedThisTurn || 0) * 6;
    } else if (cardDef.id === 'hemorrhagic_rupture') {
      baseDmg += (targetEnemy.hemorrhage || 0) * 4;
    } else if (cardDef.id === 'concrete_shoes') {
      baseDmg += gameState.mobEnforcers.length * 5;
    }

    // Mage T3 Mastery: Archmage Supremacy (+15 DMG on Mage Ultimates)
    if (
      gameState.classType === 'Mage' &&
      getClassUnlockedArray('Mage')[2] &&
      ['fireball', 'astral_singularity', 'astral_cataclysm'].includes(cardDef.id)
    ) {
      baseDmg += 15;
    }

    if (gameState.nextAttackBonusDmg > 0) {
      baseDmg += gameState.nextAttackBonusDmg;
      gameState.nextAttackBonusDmg = 0;
    }

    if (cardDef.id === 'spark') {
      gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + 1);
    } else if (cardDef.id === 'wrench_toss') {
      gainScrapParts(1);
    } else if (cardDef.id === 'scrap_salvage') {
      gainScrapParts(2);
    } else if (cardDef.id === 'scrap_engine') {
      gameState.nextScrapBonusEnergy += 1;
    } else if (cardDef.id === 'siphon_slash') {
      healPlayer(Math.max(1, Math.round(3 * echoScale)));
    } else if (cardDef.id === 'crimson_frenzy' && gameState.player.hp < gameState.player.maxHp * 0.5) {
      healPlayer(Math.max(1, Math.round(6 * echoScale)));
    } else if (cardDef.id === 'tommy_gun_spray') {
      gainSyndicateCash(Math.max(1, Math.round(5 * echoScale)), playerContainer.x, playerContainer.y - 30);
    } else if (cardDef.id === 'shakedown') {
      const cash = targetEnemy.hp < targetEnemy.maxHp * 0.5 ? 24 : 12;
      gainSyndicateCash(Math.max(1, Math.round(cash * echoScale)), targetEnemy.container.x, targetEnemy.container.y - 35);
    } else if (cardDef.id === 'kingpins_ultimatum') {
      gameState.gold += 15;
      showToast("👑 Kingpin's Ultimatum: +15g Run Gold!", 'success');
    } else if (cardDef.id === 'golden_peacemaker') {
      gainSyndicateCash(Math.max(1, Math.round(15 * echoScale)), targetEnemy.container.x, targetEnemy.container.y - 35);
    } else if (cardDef.id === 'chicago_typewriter') {
      gainSyndicateCash(Math.max(1, Math.round(8 * echoScale)), playerContainer.x, playerContainer.y - 30);
    } else if (cardDef.id === 'royal_flush') {
      addPlayerShield(Math.max(1, Math.round(15 * echoScale)));
      healPlayer(Math.max(1, Math.round(10 * echoScale)));
      gameState.player.energy += 1;
      gainSyndicateCash(Math.max(1, Math.round(20 * echoScale)), playerContainer.x, playerContainer.y - 30);
    }

    const isAoE = ['astral_singularity', 'cleaving_execution', 'titans_cleave', 'drive_by_ambush'].includes(cardDef.id);
    const targets = isAoE ? gameState.enemies.filter(e => e.hp > 0) : [targetEnemy];

    targets.forEach(tgt => {
      const prevTargetHp = tgt.hp;

      for (let h = 0; h < hits; h++) {
        if (tgt.hp <= 0) break;
        let dmg = Math.max(1, Math.round(baseDmg * echoScale));

        // Warrior T2 Mastery: Turtle Momentum (2 turns no HP loss -> 1.5x DMG)
        if (gameState.classType === 'Warrior' && getClassUnlockedArray('Warrior')[1] && gameState.warriorNoHpLossTurns >= 2) {
          dmg = Math.round(dmg * 1.5);
        }

        // Chronomancer T1 Mastery: Temporal Anchor (+10% DMG on unvaulted cards)
        if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[0] && cardObj.wasUnvaultedThisTurn) {
          dmg = Math.round(dmg * 1.10);
        }

        if (gameState.relics.TIME_WARP >= 3 && slotIndex === 1) {
          dmg = Math.round(dmg * 1.35);
        }
        if (gameState.relics.FRENZY > 0) {
          const missingPct = Math.max(0, (gameState.player.maxHp - gameState.player.hp) / gameState.player.maxHp);
          dmg = Math.round(dmg * (1 + missingPct * 0.5 * gameState.relics.FRENZY));
        }

        const effectiveCritChance = Math.min(1.0, (gameState.player.critChance || 0) + (gameState.relics.BLACK_FLASH || 0) * 0.05 + (gameState.tempCritBonus || 0));
        const forceCrit = gameState.shadowCritPrimed || gameState.nextAttackForceCrit || (cardDef.id === 'phantom_ambush' && gameState.shadowCritPrimed);
        const isCrit = forceCrit || Math.random() < effectiveCritChance;

        if (isCrit) {
          gameState.shadowCritPrimed = false;
          gameState.nextAttackForceCrit = false;
          let critMult = gameState.relics.BLACK_FLASH >= 3 ? 2.25 : 2.0;
          if (cardDef.id === 'golden_peacemaker') critMult = 2.5;
          if (gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[1] && (tgt.hemorrhage || 0) > 0) {
            critMult += 0.25;
          }
          dmg = Math.round(dmg * critMult);

          if (gameState.classType === 'Mob Boss') {
            gainSyndicateCash(8, tgt.container.x, tgt.container.y - 35);
          }

          if (gameState.relics.BLACK_FLASH > 0) {
            const isT3 = gameState.relics.BLACK_FLASH >= 3;
            spawnBlackFlashVFX(tgt.container.x, tgt.container.y, isT3);
            triggerShake(isT3 ? 18 : 11, isT3 ? 13 : 8);
            spawnFloatingText(`⚡ BLACK FLASH! -${dmg}`, tgt.container.x, tgt.container.y - 38, '#ef4444');
          } else {
            spawnFloatingText(`CRIT! -${dmg}`, tgt.container.x, tgt.container.y - 34, '#facc15');
          }
        } else {
          spawnFloatingText(`-${dmg}`, tgt.container.x, tgt.container.y - 24, '#ffffff');
        }

        if (cardDef.id === 'tommy_drum_extortion') {
          gainSyndicateCash(4, tgt.container.x, tgt.container.y - 25);
        }

        dealDamageToEnemy(tgt, dmg, isCrit);

        if (cardDef.id === 'blood_boil' && (tgt.hemorrhage || 0) > 0) {
          const bleedBurst = tgt.hemorrhage * 2;
          dealDamageToEnemy(tgt, bleedBurst, false, '#e11d48');
          spawnFloatingText(`BOIL -${bleedBurst}`, tgt.container.x, tgt.container.y - 42, '#fb7185');
        }

        let lifestealRatio = gameState.nextAttackLifesteal || 0;
        if (gameState.relics.FRENZY >= 3) lifestealRatio += 0.15;
        if (gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[2] && gameState.player.hp < gameState.player.maxHp * 0.40) {
          lifestealRatio += isCrit ? 1.0 : 0.30;
        }
        if (lifestealRatio > 0) {
          healPlayer(Math.max(1, Math.round(dmg * lifestealRatio)));
        }
      }

      // Sanguine Eclipse: Heal 50% of unblocked HP DMG dealt
      if (cardDef.id === 'sanguine_eclipse') {
        const unblockedDmg = Math.max(0, prevTargetHp - Math.max(0, tgt.hp));
        if (unblockedDmg > 0) {
          const eclipseHeal = Math.max(1, Math.round(unblockedDmg * 0.50));
          healPlayer(eclipseHeal);
          spawnFloatingText(`ECLIPSE +${eclipseHeal} HP`, playerContainer.x, playerContainer.y - 48, '#fb7185');
        }
      }

      gameState.nextAttackLifesteal = 0;

      if (cardDef.poison && tgt.hp > 0) {
        const pGain = Math.max(1, Math.round(cardDef.poison * echoScale));
        tgt.poison = (tgt.poison || 0) + pGain;
        spawnPoisonBubbles(tgt.container.x, tgt.container.y);
      }
      if (cardDef.id === 'venom_spreader' && tgt.hp > 0) {
        const bonusP = Math.min(5, tgt.poison || 0);
        if (bonusP > 0) tgt.poison += bonusP;
      }
      if (cardDef.id === 'venom_surge' && tgt.hp > 0) {
        const ahead = slotIndex;
        if (ahead > 0) tgt.poison = (tgt.poison || 0) + ahead * 3;
      }
      if (cardDef.burn && tgt.hp > 0) {
        let bGain = cardDef.burn;
        if (cardDef.id === 'thermite_rivets' && gameState.turrets.length > 0) bGain = 5;
        tgt.burn = (tgt.burn || 0) + bGain;
      }
      const bleedApply = (cardDef.hemorrhage || 0) + (gameState.nextAttackBleed || 0);
      if (bleedApply > 0 && tgt.hp > 0) {
        tgt.hemorrhage = (tgt.hemorrhage || 0) + bleedApply;
        spawnFloatingText(`+${bleedApply} BLEED`, tgt.container.x, tgt.container.y - 44, '#e11d48');
      }
      if (gameState.relics.IGNITION > 0 && slotIndex === 2 && tgt.hp > 0) {
        const burnBonus = gameState.relics.IGNITION * 5;
        dealDamageToEnemy(tgt, burnBonus, false, '#f97316');
      }
    });

    gameState.nextAttackBleed = 0;

    if (cardDef.id === 'drive_by_ambush') {
      fireAllMobEnforcers(1.0);
    }
  }
}

function healPlayer(amount) {
  if (amount <= 0) return;
  const maxAllowed = gameState.player.maxHp + getBloodReaverOverhealCap();
  gameState.player.hp = Math.min(maxAllowed, gameState.player.hp + amount);
  spawnFloatingText(`+${amount} HP`, playerContainer.x, playerContainer.y - 36, '#4ade80');
}

function dealWarriorColossusShockwave(shockwaveDmg) {
  if (!Array.isArray(gameState.enemies) || shockwaveDmg <= 0) return;
  let hitAny = false;
  gameState.enemies.forEach(e => {
    if (e.hp > 0) {
      dealDamageToEnemy(e, shockwaveDmg, false, '#38bdf8');
      hitAny = true;
    }
  });
  if (hitAny && playerContainer) {
    spawnBarrierPulseVFX(playerContainer.x, playerContainer.y);
    spawnFloatingText(`🛡️ COLOSSUS WAVE ${shockwaveDmg}`, playerContainer.x, playerContainer.y - 52, '#38bdf8');
  }
}

function dealDamageToEnemy(enemy, amount, isCrit = false, customColor = null, pierceShield = false) {
  if (!enemy || enemy.hp <= 0) return;
  let remaining = amount;

  if (!pierceShield && (enemy.shield || 0) > 0) {
    const blocked = Math.min(enemy.shield, remaining);
    enemy.shield -= blocked;
    remaining -= blocked;
    if (blocked > 0 && enemy.container) {
      spawnFloatingText(`🛡️-${blocked}`, enemy.container.x, enemy.container.y - 12, '#38bdf8');
    }
  }

  enemy.hp = Math.max(0, enemy.hp - remaining);

  // Rogue T3 Mastery: Executioner (Execute enemies <20% HP & heal 80% of executed HP)
  if (
    enemy.hp > 0 &&
    enemy.hp < enemy.maxHp * 0.20 &&
    gameState.classType === 'Rogue' &&
    getClassUnlockedArray('Rogue')[2]
  ) {
    const executedHp = enemy.hp;
    enemy.hp = 0;
    const healAmt = Math.max(1, Math.round(executedHp * 0.80));
    healPlayer(healAmt);
    if (enemy.container) {
      spawnFloatingText('🗡️ EXECUTIONER!', enemy.container.x, enemy.container.y - 48, '#4ade80');
    }
  }

  if (enemy.sprite) {
    flashEntity(enemy.sprite, isCrit ? 0xfacc15 : 0xffffff);
  }

  if (enemy.hp <= 0 && !enemy.countedKill) {
    enemy.countedKill = true;
    if (masteryData[gameState.classType]) {
      masteryData[gameState.classType].kills++;
      checkMasteryUnlocks(gameState.classType);
      saveMasteryData();
    }
    if (gameState.classType === 'Mob Boss') {
      gainSyndicateCash(8, enemy.container.x, enemy.container.y - 25);
      gainNotoriety(2);
    }
    // Mob Boss T3 Untouchable Kingpin gates the +$25 Bounty Hit payout
    if (gameState.bountyTargetId === enemy.id) {
      gameState.bountyTargetId = null;
      const isMobT3 = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2];
      const payout = isMobT3 ? 50 : 25;
      gainSyndicateCash(payout, enemy.container.x, enemy.container.y - 45);
      gainNotoriety(5);
      showToast(`💰 BOUNTY COLLECTED: +$${payout} Cash & +5 ★ Notoriety!`, 'success');
    }
    if (enemy.container) {
      spawnVFXParticles(enemy.container.x, enemy.container.y, 0xef4444, 24, 6);
      enemy.container.visible = false;
    }
  }
}

// --- 6-CONSTRUCT FOUNDRY END-OF-TURN & OVERCLOCK VOLLEYS ---
function fireAllArtificerTurrets(mult = 1.0) {
  if (gameState.turrets.length === 0) return;

  const isArtificerT2 = gameState.classType === 'Artificer' && getClassUnlockedArray('Artificer')[1];
  const isArtificerT4 = gameState.classType === 'Artificer' && getClassUnlockedArray('Artificer')[3];

  gameState.turrets.forEach((t, idx) => {
    const spec = CONSTRUCT_CATALOG[t.type] || CONSTRUCT_CATALOG.auto_turret;
    const droneSprite = turretGroup && turretGroup.children[idx] ? turretGroup.children[idx] : null;
    const sx = droneSprite ? droneSprite.x : (playerContainer ? playerContainer.x + 50 : 220);
    const sy = droneSprite ? droneSprite.y : (playerContainer ? playerContainer.y : 130);

    // Passive Shield / Parts generation per Construct
    if (spec.shieldPerTurn > 0) {
      const shGain = Math.max(1, Math.round(spec.shieldPerTurn * mult));
      addPlayerShield(shGain);
      spawnBarrierPulseVFX(sx, sy);
    }
    if (spec.partsPerTurn > 0) {
      gainScrapParts(spec.partsPerTurn);
      spawnFloatingText(`+${spec.partsPerTurn} PART`, sx, sy - 24, '#818cf8');
    }

    const livingEnemies = gameState.enemies.filter(e => e.hp > 0);
    if (livingEnemies.length === 0) return;
    const primaryTarget = livingEnemies[0];

    if (spec.dmg > 0) {
      const calcShotDmg = (baseVal) => {
        let d = Math.max(1, Math.round(baseVal * mult));
        if (isArtificerT2 && Math.random() < (gameState.player.critChance || 0.10)) {
          d = Math.round(d * 2.0);
        }
        return d;
      };

      if (spec.type === 'heavy_rail') {
        const d = calcShotDmg(spec.dmg);
        spawnRailgunBeamVFX(sx, sy, primaryTarget.container.x, primaryTarget.container.y);
        dealDamageToEnemy(primaryTarget, d, false, '#38bdf8', true); // Pierces enemy shield!
        spawnFloatingText(`RAIL -${d}`, primaryTarget.container.x, primaryTarget.container.y - 30, '#38bdf8');
      } else if (spec.type === 'inferno_flame') {
        livingEnemies.forEach(e => {
          const d = calcShotDmg(spec.dmg);
          spawnFlameJetVFX(sx, sy, e.container.x, e.container.y);
          dealDamageToEnemy(e, d, false, '#f97316');
          e.burn = (e.burn || 0) + (spec.burn || 3);
        });
      } else if (spec.type === 'arc_tesla') {
        const d = calcShotDmg(spec.dmg);
        spawnChainLightningVFX(sx, sy, primaryTarget.container.x, primaryTarget.container.y, 0x818cf8);
        dealDamageToEnemy(primaryTarget, d, false, '#818cf8');
        const chainTarget = livingEnemies.length > 1 ? livingEnemies[1] : primaryTarget;
        const cDmg = calcShotDmg(spec.chainDmg || 4);
        spawnChainLightningVFX(primaryTarget.container.x, primaryTarget.container.y, chainTarget.container.x, chainTarget.container.y, 0x38bdf8);
        dealDamageToEnemy(chainTarget, cDmg, false, '#38bdf8');
      } else if (spec.type === 'goliath_mech') {
        const d = calcShotDmg(spec.dmg);
        spawnMechSalvoVFX(sx, sy, primaryTarget.container.x, primaryTarget.container.y);
        dealDamageToEnemy(primaryTarget, d, false, '#eab308');
        spawnFloatingText(`MECH -${d}`, primaryTarget.container.x, primaryTarget.container.y - 34, '#eab308');
      } else {
        // Auto-Turret Drone
        const d = calcShotDmg(spec.dmg);
        spawnGunfireTracer(sx, sy, primaryTarget.container.x, primaryTarget.container.y, 0xf59e0b);
        dealDamageToEnemy(primaryTarget, d, false, '#f59e0b');
        if (spec.burn > 0) primaryTarget.burn = (primaryTarget.burn || 0) + spec.burn;
      }

      // Artificer T4 Mastery: Omega Foundry (Construct volleys apply 1 Burn stack & restore +2 Player Shield per shot)
      if (isArtificerT4) {
        if (primaryTarget.hp > 0) primaryTarget.burn = (primaryTarget.burn || 0) + 1;
        addPlayerShield(2);
      }
    }
  });
}

function fireAllMobEnforcers(mult = 1.0) {
  if (gameState.mobEnforcers.length === 0) return;
  const crewCount = gameState.mobEnforcers.length;
  const hasMadeMen = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[1];
  const isMobT4 = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[3];
  const bonusPerMember = hasMadeMen ? crewCount * 3 : 0;

  gameState.mobEnforcers.forEach((m, idx) => {
    const target = getFirstLivingEnemy();
    if (!target) return;
    const goonSprite = enforcerGroup && enforcerGroup.children[idx] ? enforcerGroup.children[idx] : null;
    const sx = goonSprite ? goonSprite.x : (playerContainer ? playerContainer.x + 55 : 225);
    const sy = goonSprite ? goonSprite.y : (playerContainer ? playerContainer.y : 130);

    const dmg = Math.max(1, Math.round((5 + bonusPerMember) * mult));
    spawnGunfireTracer(sx, sy, target.container.x, target.container.y, 0xfef08a);
    spawnShellCasings(sx, sy, 2);
    dealDamageToEnemy(target, dmg, false, '#eab308');

    // Mob Boss T4 Mastery: Godfather of the Underworld (Enforcers extort +$4 Cash per attack)
    if (isMobT4) {
      gainSyndicateCash(4, target.container.x, target.container.y - 28);
    }
  });
}

function getFirstLivingEnemy() {
  return gameState.enemies.find(e => e.hp > 0) || null;
}

// --- END PLAYER TURN & CARD-PLAYING ENEMY AI ---
function endPlayerTurn() {
  if (gameState.combatOver) return;

  fireAllArtificerTurrets(1.0);
  fireAllMobEnforcers(1.0);
  if (checkPostActionVictoryOrDefeat()) return;

  gameState.enemies.forEach(e => {
    if (e.hp > 0 && (e.poison || 0) > 0) {
      const pDmg = e.poison;
      e.poison = Math.max(0, e.poison - 1);
      dealDamageToEnemy(e, pDmg, false, '#22c55e', true);
      spawnPoisonBubbles(e.container.x, e.container.y);
      spawnFloatingText(`☣️ -${pDmg}`, e.container.x, e.container.y - 28, '#4ade80');
    }
    if (e.hp > 0 && (e.burn || 0) > 0) {
      const bDmg = e.burn;
      e.burn = Math.max(0, e.burn - 1);
      dealDamageToEnemy(e, bDmg, false, '#f97316', true);
      spawnFloatingText(`🔥 -${bDmg}`, e.container.x, e.container.y - 36, '#fb923c');
    }
    if (e.hp > 0 && (e.hemorrhage || 0) > 0) {
      const hDmg = e.hemorrhage;
      e.hemorrhage = Math.max(0, e.hemorrhage - 1);
      dealDamageToEnemy(e, hDmg, false, '#e11d48', true);
      spawnFloatingText(`🩸 -${hDmg}`, e.container.x, e.container.y - 44, '#fb7185');
      if (e.hp <= 0 && gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[1]) {
        healPlayer(12);
        showToast('🩸 Crimson Resonance: Bleed Kill healed +12 HP!', 'success');
      }
    }
  });

  if (checkPostActionVictoryOrDefeat()) return;

  setTimeout(() => {
    if (!gameState.combatOver) executeEnemyTurns();
  }, 420);
}

function executeEnemyTurns() {
  const livingEnemies = gameState.enemies.filter(e => e.hp > 0);
  let idx = 0;

  function stepEnemy() {
    if (gameState.combatOver) return;
    if (idx >= livingEnemies.length) {
      finishEnemyPhase();
      return;
    }

    const enemy = livingEnemies[idx];
    idx++;

    const cardsThisTurn = enemy.cardsPerTurn || 1;
    let cardPlayIdx = 0;

    function playNextEnemyCard() {
      if (gameState.combatOver || enemy.hp <= 0 || cardPlayIdx >= cardsThisTurn) {
        setTimeout(stepEnemy, 340);
        return;
      }

      const intent = enemy.intents[enemy.turnIndex % enemy.intents.length];
      enemy.turnIndex++;
      cardPlayIdx++;

      const cardTitle = intent.cardName ? `🃏 ${intent.cardName}` : intent.type;
      if (enemy.container) {
        spawnFloatingText(cardTitle, enemy.container.x, enemy.container.y - 54, '#e2e8f0');
      }

      if (intent.type === 'DEFEND') {
        enemy.shield = (enemy.shield || 0) + intent.value;
        if (enemy.container) {
          spawnVFXParticles(enemy.container.x, enemy.container.y, 0x38bdf8, 12, 3);
          spawnFloatingText(`🛡️ +${intent.value}`, enemy.container.x, enemy.container.y - 30, '#38bdf8');
        }
        setTimeout(playNextEnemyCard, 280);
        return;
      }

      if (intent.type === 'HEAL') {
        const injuredAlly = gameState.enemies.filter(e => e.hp > 0).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0] || enemy;
        injuredAlly.hp = Math.min(injuredAlly.maxHp, injuredAlly.hp + intent.value);
        if (intent.shieldValue) {
          injuredAlly.shield = (injuredAlly.shield || 0) + intent.shieldValue;
        }
        if (injuredAlly.container) {
          spawnVFXParticles(injuredAlly.container.x, injuredAlly.container.y, 0x4ade80, 14, 3);
          spawnFloatingText(`+${intent.value} HP`, injuredAlly.container.x, injuredAlly.container.y - 30, '#4ade80');
        }
        setTimeout(playNextEnemyCard, 280);
        return;
      }

      // ATTACK or COMBO (Attack + Shield/Debuff)
      if (intent.shieldValue) {
        enemy.shield = (enemy.shield || 0) + intent.shieldValue;
        if (enemy.container) {
          spawnFloatingText(`🛡️ +${intent.shieldValue}`, enemy.container.x, enemy.container.y - 32, '#38bdf8');
        }
      }

      const hits = intent.hits || 1;
      for (let h = 0; h < hits; h++) {
        if (gameState.combatOver) break;

        // Reactive Poison from Shadow Step Mirage
        if ((gameState.miragePoisonRetaliate || 0) > 0 && enemy.hp > 0) {
          const pRet = gameState.miragePoisonRetaliate;
          enemy.poison = (enemy.poison || 0) + pRet;
          spawnPoisonBubbles(enemy.container.x, enemy.container.y);
          spawnFloatingText(`☣️ MIRAGE +${pRet}`, enemy.container.x, enemy.container.y - 38, '#4ade80');
        }

        const totalDodge = Math.min(0.85, (gameState.player.dodgeChance || 0) + (gameState.relics.SHADOW_WEAVE || 0) * 0.05);
        const dodged = gameState.guaranteedDodges > 0 || Math.random() < totalDodge;

        if (dodged) {
          if (gameState.guaranteedDodges > 0) gameState.guaranteedDodges--;
          spawnFloatingText('DODGED!', playerContainer.x, playerContainer.y - 35, '#4ade80');
          if (gameState.classType === 'Rogue') {
            gameState.shadowCritPrimed = true;
            // Rogue T4 Mastery: Phantom Sovereign (Dodging deals 14 Shadow Counter DMG, applies 2 Poison & draws 1 Action card)
            if (getClassUnlockedArray('Rogue')[3] && enemy.hp > 0) {
              dealDamageToEnemy(enemy, 14, false, '#4ade80');
              enemy.poison = (enemy.poison || 0) + 2;
              const actCard = drawSpecificCategory('action');
              if (actCard) gameState.hand.push(actCard);
              spawnFloatingText('👻 PHANTOM COUNTER -14 & +2☣️!', enemy.container.x, enemy.container.y - 44, '#4ade80');
            }
          }
          if (gameState.relics.SHADOW_WEAVE >= 3) {
            healPlayer(Math.max(1, Math.round(gameState.player.maxHp * 0.05)));
          }
          continue;
        }

        let incoming = intent.value;
        if (gameState.enemyAtkDebuff > 0) {
          incoming = Math.max(1, Math.round(incoming * (1 - gameState.enemyAtkDebuff)));
        }

        // Frontline Hired Enforcer Interception (50%)
        if (gameState.mobEnforcers.length > 0 && incoming > 0) {
          const frontGoon = gameState.mobEnforcers[0];
          const intercepted = Math.ceil(incoming * 0.50);
          incoming -= intercepted;
          frontGoon.hp -= intercepted;
          spawnFloatingText(`GOON -${intercepted}`, playerContainer.x + 55, playerContainer.y - 25, '#eab308');

          if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[1] && enemy.hp > 0) {
            dealDamageToEnemy(enemy, 6, false, '#eab308');
            spawnFloatingText('RETALIATE -6', enemy.container.x, enemy.container.y - 35, '#eab308');
          }

          if (frontGoon.hp <= 0) {
            gameState.mobEnforcers.shift();
            showToast('💥 A Hired Enforcer took a fatal bullet for you!', 'warning');
          }
          renderMobEnforcers();
        }

        // Frontline Artificer Construct Interception (65% for Aegis Force-Barrier, 50% for others)
        if (gameState.turrets.length > 0 && incoming > 0) {
          const aegisIdx = gameState.turrets.findIndex(t => t.type === 'aegis_barrier');
          const interceptIdx = aegisIdx !== -1 ? aegisIdx : 0;
          const frontTurret = gameState.turrets[interceptIdx];
          const spec = CONSTRUCT_CATALOG[frontTurret.type] || CONSTRUCT_CATALOG.auto_turret;
          const ratio = spec.interceptRatio || 0.50;

          const intercepted = Math.ceil(incoming * ratio);
          incoming -= intercepted;
          frontTurret.hp -= intercepted;
          spawnFloatingText(`${frontTurret.name.split(' ')[0].toUpperCase()} -${intercepted}`, playerContainer.x + 50, playerContainer.y - 20, '#f59e0b');

          if (gameState.reactiveArmorActive && enemy.hp > 0) {
            gainScrapParts(1);
            dealDamageToEnemy(enemy, 5, false, '#38bdf8');
          }

          if (frontTurret.hp <= 0) {
            gameState.turrets.splice(interceptIdx, 1);
            showToast(`💥 ${frontTurret.name} destroyed intercepting enemy fire!`, 'warning');
          }
          renderArtificerTurrets();
        }

        const origIncoming = incoming;
        if (gameState.relics.DEFLECTION >= 3 && incoming > 0) {
          const reflected = Math.max(1, Math.round(incoming * 0.5));
          dealDamageToEnemy(enemy, reflected, false, '#38bdf8');
        }
        if (gameState.thornsDmgThisTurn > 0 && enemy.hp > 0) {
          dealDamageToEnemy(enemy, gameState.thornsDmgThisTurn, false, '#38bdf8');
        }

        const shieldAbsorbed = Math.min(gameState.player.shield, incoming);
        gameState.player.shield -= shieldAbsorbed;
        const hpLoss = incoming - shieldAbsorbed;
        gameState.player.hp = Math.max(0, gameState.player.hp - hpLoss);

        if (hpLoss > 0) {
          gameState.tookHpDamageThisTurn = true;
        }

        // Relic: Aegis Overcharger Tier 3 (Full Shield blocks trigger a 10 DMG counter-pulse)
        if ((gameState.relics.AEGIS_OVERCHARGER || 0) >= 3 && hpLoss === 0 && shieldAbsorbed > 0 && enemy.hp > 0) {
          spawnBarrierPulseVFX(playerContainer.x, playerContainer.y);
          dealDamageToEnemy(enemy, 10, false, '#22d3ee');
          spawnFloatingText('🛡️ AEGIS PULSE -10!', enemy.container.x, enemy.container.y - 42, '#22d3ee');
        }

        triggerShake(10, 8);
        flashEntity(playerSprite, 0xef4444);
        if (hpLoss > 0) {
          spawnFloatingText(`-${hpLoss}`, playerContainer.x, playerContainer.y - 25, '#ef4444');
        } else if (origIncoming > 0) {
          spawnFloatingText(`BLOCKED (${shieldAbsorbed})`, playerContainer.x, playerContainer.y - 25, '#38bdf8');
        }
      }

      // Enemy Card Secondary Debuffs (Poison, Burn, Hemorrhage, Energy Drain)
      if (intent.debuffType && !gameState.combatOver) {
        const dVal = intent.debuffValue || 1;
        if (intent.debuffType === 'energy_drain') {
          gameState.nextTurnBonusEnergy -= dVal;
          spawnFloatingText(`⚡ -${dVal} NEXT TURN`, playerContainer.x, playerContainer.y - 46, '#c084fc');
        } else if (intent.debuffType === 'bleed' || intent.debuffType === 'burn' || intent.debuffType === 'poison') {
          const dotDmg = dVal * 2;
          gameState.player.hp = Math.max(1, gameState.player.hp - dotDmg);
          gameState.tookHpDamageThisTurn = true;
          spawnFloatingText(`HEX -${dotDmg} HP`, playerContainer.x, playerContainer.y - 46, '#fb7185');
        }
      }

      updateBattleUI();
      if (checkPostActionVictoryOrDefeat()) return;
      setTimeout(playNextEnemyCard, 280);
    }

    playNextEnemyCard();
  }

  stepEnemy();
}

function finishEnemyPhase() {
  if (checkPostActionVictoryOrDefeat()) return;

  gameState.battleTurnCount++;

  // Warrior T2 Mastery: Turtle Momentum tracking
  if (gameState.classType === 'Warrior') {
    if (!gameState.tookHpDamageThisTurn) {
      gameState.warriorNoHpLossTurns++;
      if (gameState.warriorNoHpLossTurns === 2 && getClassUnlockedArray('Warrior')[1]) {
        showToast('🐢 TURTLE MOMENTUM ACTIVE: 1.5x DMG & Shield!', 'success');
      }
    } else {
      gameState.warriorNoHpLossTurns = 0;
    }
  }
  gameState.tookHpDamageThisTurn = false;

  // Shield Decay (Warrior T4 Colossus Unbreakable carries over 100% Shield!)
  const warriorT4Unbreakable = gameState.classType === 'Warrior' && getClassUnlockedArray('Warrior')[3];
  if (!gameState.shieldDecayLocked && !warriorT4Unbreakable) {
    gameState.player.shield = Math.floor(gameState.player.shield * 0.5);
  }
  gameState.shieldDecayLocked = false;
  gameState.prismaticActive = false;
  gameState.spellweaverEchoActive = false;
  gameState.miragePoisonRetaliate = 0;
  gameState.thornsDmgThisTurn = 0;
  gameState.tempCritBonus = 0;
  gameState.enemyAtkDebuff = 0;
  gameState.reactiveArmorActive = false;
  gameState.scrappedThisTurn = 0;
  gameState.bonusScrapLimitThisTurn = 0;

  if (gameState.relics.DEFLECTION > 0) {
    addPlayerShield(gameState.relics.DEFLECTION * 3);
  }

  gameState.vault.forEach(vCard => {
    vCard.turnsInVault = (vCard.turnsInVault || 0) + 1;
  });

  // Relic: Chrono Hourglass (Every 2nd turn, gain +1 Energy and advance all Stasis Vault cards by +1 turn)
  if ((gameState.relics.CHRONO_HOURGLASS || 0) > 0 && (gameState.battleTurnCount % 2 === 0)) {
    gameState.nextTurnBonusEnergy += 1;
    gameState.vault.forEach(vCard => {
      vCard.turnsInVault = (vCard.turnsInVault || 0) + 1;
    });
    showToast('⏳ Chrono Hourglass: +1 ⚡ & Stasis Vault +1 turn!', 'info');
  }

  if (gameState.nextTurnRestBonus) {
    const isChronoT3 = gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[2];
    gameState.sequence = isChronoT3 ? [null, null, null, null, null] : [null, null, null, null];
    gameState.nextTurnRestBonus = false;
  } else {
    gameState.sequence = (gameState.relics.CHRONO_HOURGLASS || 0) >= 3 ? [null, null, null, null] : [null, null, null];
  }

  let carryOverEnergy = 0;
  if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[1]) {
    carryOverEnergy = Math.min(1, gameState.player.energy);
  }

  gameState.player.energy = Math.max(1, gameState.player.maxEnergy + gameState.nextTurnBonusEnergy + carryOverEnergy);
  gameState.nextTurnBonusEnergy = 0;

  if (gameState.classType === 'Mage') {
    const regen = 2 + gameState.nextTurnBonusMana;
    gameState.nextTurnBonusMana = 0;
    gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + regen);
  }
  gameState.manaSpentThisTurn = 0;
  gameState.cardsPlayedThisTurn = 0;

  drawCardsForTurn(false);
  gameState.isExecuting = false;
  updateBattleUI();
}

function checkPostActionVictoryOrDefeat() {
  if (gameState.combatOver) return true;

  if (gameState.player.hp <= 0) {
    if (gameState.classType === 'Warrior' && !gameState.warriorRevived && getClassUnlockedArray('Warrior')[2]) {
      gameState.warriorRevived = true;
      gameState.player.hp = Math.max(1, Math.round(gameState.player.maxHp * 0.20));
      gameState.enemies.forEach(e => {
        if (e.hp > 0) dealDamageToEnemy(e, 10, false, '#ef4444');
      });
      showToast('🔥 SECOND WIND ACTIVATED! Revived & dealt 10 AoE DMG!', 'success');
      updateBattleUI();
      if (gameState.enemies.every(e => e.hp <= 0)) {
        return checkPostActionVictoryOrDefeat();
      }
      return false;
    }

    gameState.combatOver = true;
    gameState.isExecuting = false;
    setTimeout(() => {
      alert('💀 DEFEAT! Your hero has fallen in combat.');
      navigateTo('CLASS_SELECT');
    }, 450);
    return true;
  }

  if (gameState.enemies.every(e => e.hp <= 0)) {
    gameState.combatOver = true;
    gameState.isExecuting = false;

    const isBoss = gameState.boardNode >= gameState.maxNodes;
    const goldReward = isBoss ? (gameState.stage >= 2 ? 95 : 65) : (gameState.stage >= 2 ? 35 : 25);
    gameState.gold += goldReward;

    // Relic: Syndicate Signet (+8g and +$8 Cash per tier after every combat)
    if ((gameState.relics.SYNDICATE_SIGNET || 0) > 0) {
      const sigTier = gameState.relics.SYNDICATE_SIGNET;
      gameState.gold += 8 * sigTier;
      if (gameState.classType === 'Mob Boss') {
        gainSyndicateCash(8 * sigTier);
      }
    }

    if (gameState.classType === 'Mob Boss') {
      const cashReward = isBoss ? 35 : 15;
      const repReward = isBoss ? 10 : 5;
      gainSyndicateCash(cashReward);
      gainNotoriety(repReward);
      showToast(`🏆 VICTORY! +${goldReward}g, +$${cashReward} Cash & +${repReward} ★ Notoriety!`, 'success');
    } else {
      showToast(`🏆 VICTORY! +${goldReward}g Gold earned!`, 'success');
    }

    setTimeout(() => {
      openVictoryCardDraft(isBoss);
    }, 550);
    return true;
  }

  return false;
}
