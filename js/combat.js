
function initPilesForBattle() {
 gameState.drawPileAction = [];
 gameState.drawPileTome = [];
 gameState.discardPile = [];
 gameState.hand = [];
 gameState.vault = [];

 const shuffled = [...gameState.deck].sort(() => Math.random() - 0.5);
 shuffled.forEach(cId => {
 const cDef = CARD_DATABASE[cId];
 if (cDef) {
 if (cDef.category === 'action') gameState.drawPileAction.push(cId);
 else gameState.drawPileTome.push(cId);
 }
 });
}

function drawCardsForTurn(isFirstTurn = false) {
 if (isFirstTurn) {
 drawTypeFromPile('action', 4);
 drawTypeFromPile('tome', 1);
 } else {
 for (let i = 0; i < 4; i++) {
 const hasAction = gameState.drawPileAction.length > 0 || gameState.discardPile.some(cId => CARD_DATABASE[cId] && CARD_DATABASE[cId].category === 'action');
 const hasTome = gameState.drawPileTome.length > 0 || gameState.discardPile.some(cId => CARD_DATABASE[cId] && CARD_DATABASE[cId].category === 'tome');
 
 let targetCat = 'action';
 if (hasAction && hasTome) {
 targetCat = Math.random() < 0.8 ? 'action' : 'tome';
 } else if (hasTome) {
 targetCat = 'tome';
 } else {
 targetCat = 'action';
 }
 drawTypeFromPile(targetCat, 1);
 }
 }
}

function drawTypeFromPile(cat, count) {
  const maxVaultSlots = getMaxVaultSlots(gameState.classType);

  for (let i = 0; i < count; i++) {
    let pile = cat === 'action' ? gameState.drawPileAction : gameState.drawPileTome;
    if (pile.length === 0) {
      reshuffleCategoryDiscard(cat);
      pile = cat === 'action' ? gameState.drawPileAction : gameState.drawPileTome;
    }
    if (pile.length > 0) {
      const cId = pile.pop();
      const cardObj = { instanceId: Math.random().toString(36).substring(7), id: cId, isNew: true, turnsInVault: 0, wasUnvaultedThisTurn: false };

      if (cId === 'vial_stash' && gameState.vault.length < maxVaultSlots) {
        gameState.vault.push(cardObj);
        if (playerSprite) {
          spawnPoisonBubbles(playerSprite.x, playerSprite.y - 10, 8);
          spawnFloatingText(playerSprite.x, playerSprite.y - 25, 'VIAL STASH AUTO-VAULTED!', '#4ade80');
        }
      } else if (cId === 'assembly_blueprint' && gameState.vault.length === 0) {
        gameState.vault.push(cardObj);
        if (playerSprite) {
          spawnParticles(playerSprite.x, playerSprite.y - 10, 10, { colors: [0xf59e0b, 0x38bdf8], speed: 2.5, shape: 'shard', life: 20 });
          spawnFloatingText(playerSprite.x, playerSprite.y - 25, '⚙️ BLUEPRINT AUTO-VAULTED!', '#f59e0b');
        }
      } else {
        gameState.hand.push(cardObj);
      }
    }
  }
}

function reshuffleCategoryDiscard(cat) {
 const matching = gameState.discardPile.filter(cId => CARD_DATABASE[cId] && CARD_DATABASE[cId].category === cat);
 matching.length > 0) {
 gameState.discardPile = gameState.discardPile.filter(cId => CARD_DATABASE[cId] && CARD_DATABASE[cId].category !== cat);
 const shuffled = matching.sort(() => Math.random() - 0.5);
 cat === 'action') gameState.drawPileAction.push(...shuffled);
 else gameState.drawPileTome.push(...shuffled);
 }
}

function startBattleAtNode() {
 gameState.restBonusActiveThisTurn = gameState.restBonusActiveNextTurn;
 gameState.restBonusActiveNextTurn = false;

 const initialSlots = gameState.restBonusActiveThisTurn ? 4 : 3;
 gameState.sequence = Array(initialSlots).fill(null);

 gameState.currentEnergy = gameState.maxEnergy + (gameState.nextTurnBonusEnergy || 0);
 gameState.nextTurnBonusEnergy = 0;
 gameState.abilityUsedThisTurn = false;
 gameState.nextHitBonusDmg = 0;
 gameState.nextHitMultiplier = 1.0;
 gameState.nextHitCritBonus = 0;
 gameState.guaranteedCritNextAttack = false;
 gameState.guaranteedDodgeCount = 0;
 gameState.nextHitLifestealBonus = 0;
 gameState.nextHitBonusHemorrhage = 0;
 gameState.scrapsUsedThisTurn = 0;
 gameState.juggernautStanceActive = false;
 gameState.manaSpentThisTurn = 0;
 gameState.attackDiscountThisTurn = 0;
 gameState.nextScrapBonusEnergy = 0;
 gameState.nextTomeEchoThisTurn = false;
 gameState.chronoEchoPlayedThisTurn = false;
 gameState.spentHpThisTurn = false;
 gameState.totalScrapsInBattle = 0;
 gameState.turretBonusVolleysThisTurn = 0;
 gameState.reactiveArmorActive = false;
 gameState.lastInstantSlot1CardId = null;
 gameState.lastSlot1CardId = null;
 gameState.reflectDamageThisTurn = 0;
 gameState.intimidateMultiplier = 1.0;

 gameState.classType === 'Chronomancer') {
 const hasChronoT1 = getClassUnlockedArray('Chronomancer')[0];
 gameState.chronos = hasChronoT1 ? 1 : 0;
 gameState.chronosDodgeCounter = 0;
 }
 gameState.classType === 'Artificer') {
 const hasArtT2 = getClassUnlockedArray('Artificer')[1];
 gameState.turrets = hasArtT2 ? [{ id: 1, hp: 10, maxHp: 10 }] : [];
 }
if (gameState.classType === 'Mob Boss') {
    const hasMobT1 = getClassUnlockedArray('Mob Boss')[0];
    const hasMobT2 = getClassUnlockedArray('Mob Boss')[1];
    gameState.cash = Math.max(gameState.cash || 0, hasMobT1 ? 45 : 25);
    gameState.notoriety = Math.max(gameState.notoriety || 0, 5);
    gameState.enforcers = hasMobT2 ? [{ id: 1, hp: 12, maxHp: 12 }] : [];
  }
 const defTier = gameState.passives.DEFLECTION || 0;
 if (defTier > 0) {
 addPlayerShield(defTier * 3);
 }

 if (gameState.boardNode === 5) {
 gameState.enemies = [{
 id: 1, name: 'VOID OVERLORD', hp: 90, maxHp: 90, atk: 14, poison: 0, hemorrhage: 0, burn: 0, hasBountyLock: false,
 sequence: [
 { name: 'Doom Strike', type: 'ATTACK', value: 16, speed: 1.2 },
 { name: 'Dark Shield', type: 'DEFEND', value: 12, speed: 1.0 }
 ]
 }];
 } else if (gameState.pendingNodeType === 'DUO COMBAT') {
 gameState.enemies = [
 { id: 1, name: 'SHADOW GUARD A', hp: 35, maxHp: 35, atk: 8, poison: 0, hemorrhage: 0, burn: 0, hasBountyLock: false, sequence: [{ name: 'Stab', type: 'ATTACK', value: 8, speed: 1.0 }, { name: 'Evade', type: 'DEFEND', value: 6, speed: 1.0 }] },
 { id: 2, name: 'SHADOW GUARD B', hp: 35, maxHp: 35, atk: 8, poison: 0, hemorrhage: 0, burn: 0, hasBountyLock: false, sequence: [{ name: 'Soul Heal', type: 'HEAL', value: 10, speed: 1.5 }, { name: 'Shadow Strike', type: 'ATTACK', value: 10, speed: 1.2 }] }
 ];
 } else {
 gameState.enemies = [{
 id: 1, name: 'SHADOW GUARD', hp: 45, maxHp: 45, atk: 10, poison: 0, hemorrhage: 0, burn: 0, hasBountyLock: false,
 sequence: [
 { name: 'Shadow Slash', type: 'ATTACK', value: 10, speed: 1.0 },
 { name: 'Iron Guard', type: 'DEFEND', value: 8, speed: 1.0 }
 ]
 }];
 }

 const wrapper = document.getElementById('canvas-wrapper');
 if (wrapper) {
 const themeIdx = (gameState.boardNode - 1) % STAGE_THEMES.length;
 wrapper.style.background = STAGE_THEMES[themeIdx].bg;
 }

 syncBlackMarketUnlockedSlots();
 initPilesForBattle();
 setupPixiApp();
 drawCardsForTurn(true);
 updateAbilityBarLabel();
 renderUI();
 window.showScreen('screen-battle');
}

function updateAbilityBarLabel() {
 const btn = document.getElementById('ui-ability-btn');
 const uiClass = document.getElementById('ui-class');
 const theme = CLASS_THEMES[gameState.classType] || CLASS_THEMES.Rogue;

 if (uiClass) {
 uiClass.innerText = gameState.classType.toUpperCase();
 uiClass.style.color = theme.cssColor;
 }

 if (!btn) return;
 if (gameState.classType === 'Mage') {
 btn.innerText = '🔮 MANA CONVERT (Spend 2 Mana → Gain +1 Energy & +1 Temp Slot) [2 Mana]';
 btn.style.borderColor = 'var(--accent-purple)';
 btn.style.color = 'var(--accent-purple)';
 } else if (gameState.classType === 'Warrior') {
 btn.innerText = '🛡️ SHIELD WALL (+20 Shield) [1 Energy]';
 btn.style.borderColor = 'var(--accent-red)';
 btn.style.color = 'var(--accent-red)';
 } else if (gameState.classType === 'Chronomancer') {
 btn.innerText = '⏳ TEMPORAL LOOP (Duplicate Slot 1 Card into 0⚡ Temp Echo Slot) [2 Chronos]';
 btn.style.borderColor = 'var(--accent-teal)';
 btn.style.color = 'var(--accent-teal)';
 } else if (gameState.classType === 'Artificer') {
 const modeText = (gameState.turrets && gameState.turrets.length >= 3)
 ? 'OVERCLOCK TURRETS (All 3 Turrets Fire Immediately for 2x DMG!)'
 : 'DEPLOY AUTO-TURRET (Summon 10-HP Drone: 6 DMG + 2 Burn/Turn)';
 btn.innerText = `⚙️ ${modeText} [1 Energy + 2 Parts]`;
 btn.style.borderColor = 'var(--accent-gold)';
 btn.style.color = 'var(--accent-gold)';
 } else if (gameState.classType === 'Blood Reaver') {
 btn.innerText = '🩸 CRIMSON PACT (+1 Energy, +50% Lifesteal & +4 Hemorrhage on Next Hit) [8 HP]';
 btn.style.borderColor = 'var(--accent-crimson)';
 btn.style.color = 'var(--accent-crimson)';
 } else if (gameState.classType === 'Mob Boss') {
 btn.innerText = '🎯 PUT OUT A HIT (Lock Bounty, 12 DMG, +50% Next Hit & +$25 Cash on Kill!) [$20 Cash • 0⚡]';
 btn.style.borderColor = 'var(--accent-mob)';
 btn.style.color = '#fef08a';
 } else {
 btn.innerText = '🗡️ PRECISE POISON (+8 DMG Next Hit) [1 Energy]';
 btn.style.borderColor = 'var(--accent-green)';
 btn.style.color = 'var(--accent-green)';
 }
}

window.useClassAbility = async function() {
 if (gameState.isExecuting) return;

 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;

 if (gameState.classType === 'Artificer') {
 if (gameState.currentEnergy < 1 || gameState.parts < 2) {
 showToast('Requires 1 Energy and 2 Scrap Parts!', 'var(--accent-gold)');
 return;
 }
 gameState.currentEnergy -= 1;
 gameState.parts -= 2;

 if (gameState.turrets.length < 3) {
 deployOrRefundArtificerTurret(px, py);
 } else {
 spawnShockwave(px, py, 95, 0xf59e0b, 6, 26);
 spawnFloatingText(px, py - 28, 'TURRET OVERCLOCK (2X VOLLEY)!', '#f59e0b');
 await fireAllArtificerTurrets(2.0);
 }
 updateAbilityBarLabel();
 renderUI();
 return;
 }

 if (gameState.abilityUsedThisTurn) {
 showToast('Ability already used this turn!', 'var(--accent-gold)');
 return;
 }

 if (gameState.classType === 'Mob Boss') {
 if ((gameState.cash || 0) < 20) {
 showToast('Not enough Cash! Requires $20 Cash.', 'var(--accent-mob)');
 return;
 }
 const activeEnemies = gameState.enemies.filter(e => e.hp > 0);
 if (activeEnemies.length === 0) return;
 const targetEnemy = activeEnemies[0];
 const targetIdx = gameState.enemies.indexOf(targetEnemy);
 const targetSprite = enemySprites[targetIdx];
 const tx = targetSprite ? targetSprite.x : 750;
 const ty = targetSprite ? targetSprite.y : 138;

 spendCash(20, px, py);
 gameState.abilityUsedThisTurn = true;
 gameState.nextHitMultiplier = Math.max(gameState.nextHitMultiplier || 1.0, 1.5);
 targetEnemy.hasBountyLock = true;

 spawnBountyCrosshairVFX(tx, ty);
 spawnGunfireVolleyVFX(px, py, tx, ty, 3);
 spawnFloatingText(px, py - 26, '🎯 PUT OUT A HIT (-$20 CASH)', '#eab308');

 await new Promise(r => setTimeout(r, 220 * gameState.speedMultiplier));

 targetEnemy.hp = Math.max(0, targetEnemy.hp - 12);
 spawnShockwave(tx, ty, 74, 0xdc2626, 5, 22);
 spawnFloatingText(tx, ty - 28, '🎯 BOUNTY SHOT -12 HP (+50% NEXT HIT!)', '#fb7185');
 if (targetEnemy.hp === 0 && targetEnemy.hasBountyLock) {
 targetEnemy.hasBountyLock = false;
 gainCash(25, tx, ty, '💰 HIT CONTRACT PAID +$25 CASH!', true);
 gainNotoriety(5, tx, ty);
 }
 renderUI();
 checkPostActionVictoryOrDefeat();
 return;
 }

 if (gameState.classType === 'Mage') {
 if (gameState.player.mana < 2) {
 showToast('Not enough Mana! Requires 2 Mana.', 'var(--accent-purple)');
 return;
 }
 gameState.player.mana -= 2;
 gameState.manaSpentThisTurn += 2;
 gameState.currentEnergy += 1;
 if (gameState.sequence.length < 4) {
 gameState.sequence.push(null);
 }
 gameState.abilityUsedThisTurn = true;
 spawnShockwave(px, py, 75, 0xc084fc, 4, 24);
 spawnParticles(px, py, 16, { colors: [0xc084fc, 0x38bdf8, 0xf59e0b], speed: 3.5, life: 28 });
 spawnFloatingText(px, py - 24, '-2 MANA → +1 ENERGY & SLOT!', '#c084fc');
 } else if (gameState.classType === 'Warrior') {
 if (gameState.currentEnergy < 1) {
 showToast('Not enough Energy!', 'var(--accent-red)');
 return;
 }
 gameState.currentEnergy -= 1;
 addPlayerShield(20, px, py);
 gameState.abilityUsedThisTurn = true;
 playCardVFX('iron_defense', { x: px, y: py }, { x: px, y: py });
 spawnFloatingText(px, py - 24, '+20 SHIELD WALL', '#38bdf8');
 } else if (gameState.classType === 'Chronomancer') {
 if (gameState.chronos < 2) {
 showToast('Requires 2 Chronos!', 'var(--accent-teal)');
 return;
 }
 const sourceCardObj = gameState.sequence[0] || (gameState.lastInstantSlot1CardId ? { id: gameState.lastInstantSlot1CardId } : null);
 if (!sourceCardObj) {
 showToast('Place a card in Slot 1 first to duplicate with Temporal Loop!', 'var(--accent-teal)');
 return;
 }
 gameState.chronos -= 2;
 const cloneObj = {
 instanceId: Math.random().toString(36).substring(7),
 id: sourceCardObj.id,
 isNew: false,
 turnsInVault: 0,
 wasUnvaultedThisTurn: false,
 paidCost: 0
 };
 if (gameState.sequence.length < 5) {
 gameState.sequence.push(cloneObj);
 } else {
 const emptySlot = gameState.sequence.findIndex(s => s === null);
 if (emptySlot !== -1) gameState.sequence[emptySlot] = cloneObj;
 }
 gameState.abilityUsedThisTurn = true;
 spawnShockwave(px, py, 82, 0x2dd4bf, 5, 26);
 spawnParticles(px, py, 18, { colors: [0x2dd4bf, 0xf59e0b, 0x38bdf8], speed: 3.6, life: 26 });
 spawnFloatingText(px, py - 26, `TEMPORAL LOOP: [${CARD_DATABASE[sourceCardObj.id].name}] CLONED!`, '#2dd4bf');
 } else if (gameState.classType === 'Blood Reaver') {
 if (!spendPlayerHp(8, px, py)) {
 showToast('Not enough HP for Crimson Pact (Requires > 8 HP)!', 'var(--accent-crimson)');
 return;
 }
 gameState.currentEnergy += 1;
 gameState.nextHitLifestealBonus += 0.50;
 gameState.nextHitBonusHemorrhage += 4;
 gameState.abilityUsedThisTurn = true;
 spawnShockwave(px, py, 78, 0xdc2626, 5, 24);
 spawnFloatingText(px, py - 26, 'CRIMSON PACT (+1⚡, +50% LIFESTEAL, +4 BLEED)', '#fb7185');
 } else {
 if (gameState.currentEnergy < 1) {
 showToast('Not enough Energy!', 'var(--accent-green)');
 return;
 }
 gameState.currentEnergy -= 1;
 gameState.nextHitBonusDmg += 8;
 gameState.abilityUsedThisTurn = true;
 spawnPoisonBubbles(px, py - 10, 12);
 spawnSlashArc(px + 15, py, -0.4, 48, 0x4ade80, 0x86efac);
 spawnFloatingText(px, py - 24, 'POISON COATED (+8 DMG)', '#4ade80');
 }

 renderUI();
};


// --- CARD PLAY, SLOT 1 INSTANT CAST, STASIS VAULT & SCRAP LOGIC ---
window.playCardToSequence = async function(handIdx) {
 if (gameState.isExecuting) return;
 const cardObj = gameState.hand[handIdx];
 if (!cardObj) return;
 const cardDef = CARD_DATABASE[cardObj.id];
 if (!cardDef) return;

 const slotIdx = gameState.sequence.findIndex(s => s === null);
 if (slotIdx === -1) {
 showToast('All sequence slots are full! Execute or Rest.', 'var(--accent-gold)');
 return;
 }

 const isBloodCost = cardDef.costType === 'hp';
 const isManaCost = cardDef.costType === 'mana';
 const isChronosCost = cardDef.costType === 'chronos';
 const isCashCost = cardDef.costType === 'cash';
 let actualCost = cardDef.cost;

 if (isBloodCost) {
 actualCost = cardDef.hpCost || cardDef.cost || 6;
 if (gameState.player.hp <= actualCost) {
 showToast(`Requires > ${actualCost} HP to pay Blood Tithe!`, 'var(--accent-crimson)');
 return;
 }
 } else if (isCashCost) {
 if ((gameState.cash || 0) < actualCost) {
 showToast(`Not enough Cash! Requires $${actualCost} Cash.`, 'var(--accent-mob)');
 return;
 }
 } else if (isChronosCost) {
 if (gameState.chronos < actualCost) {
 showToast(`Not enough Chronos! Requires ${actualCost} Chronos.`, 'var(--accent-teal)');
 return;
 }
 } else if (isManaCost) {
 if (gameState.player.mana < actualCost) {
 showToast(`Not enough Mana! Requires ${actualCost} Mana.`, 'var(--accent-purple)');
 return;
 }
 } else {
 if (cardDef.id === 'battering_rampart' && slotIdx === 0) actualCost = 1;
 if (cardDef.id === 'crimson_frenzy' && gameState.player.hp < gameState.player.maxHp * 0.5) actualCost = 0;
 if (cardDef.type === 'ATTACK' && gameState.attackDiscountThisTurn > 0) {
 actualCost = Math.max(0, actualCost - gameState.attackDiscountThisTurn);
 }
 if (gameState.currentEnergy < actualCost) {
 showToast('Not enough Energy for this card!', 'var(--accent-red)');
 return;
 }
 }

 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;

 if (isBloodCost) {
 spendPlayerHp(actualCost, px, py);
 } else if (isCashCost) {
 spendCash(actualCost, px, py);
 } else if (isChronosCost) {
 gameState.chronos -= actualCost;
 } else if (isManaCost) {
 gameState.player.mana -= actualCost;
 gameState.manaSpentThisTurn += actualCost;
 } else {
 gameState.currentEnergy -= actualCost;
 }

 cardObj.paidCost = actualCost;
 gameState.hand.splice(handIdx, 1);

 // Chronomancer T2 Mastery: Accelerated Timeline (Slot 1 casts immediately upon placement!)
 if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[1] && slotIdx === 0) {
 gameState.lastInstantSlot1CardId = cardDef.id;
 gameState.lastSlot1CardId = cardDef.id;
 spawnShockwave(px, py, 64, 0x2dd4bf, 4, 20);
 spawnFloatingText(px, py - 24, `ACCELERATED SLOT 1: [${cardDef.name}]!`, '#2dd4bf');

 gameState.isExecuting = true;
 renderUI();
 try {
 await resolveSingleCardAction(cardObj, 0, false);
 gameState.discardPile.push(cardObj.id);
 } finally {
 gameState.isExecuting = false;
 }
 renderUI();
 checkPostActionVictoryOrDefeat();
 return;
 }

 gameState.sequence[slotIdx] = cardObj;
 renderUI();
};

window.removeCardFromSequence = function(slotIdx) {
 if (gameState.isExecuting) return;
 const cardObj = gameState.sequence[slotIdx];
 if (!cardObj) return;
 const cardDef = CARD_DATABASE[cardObj.id];

 const refund = cardObj.paidCost !== undefined ? cardObj.paidCost : cardDef.cost;
 if (cardDef.costType === 'hp') {
 gameState.player.hp = Math.min(Math.max(gameState.player.maxHp, gameState.player.hp), gameState.player.hp + refund);
 } else if (cardDef.costType === 'cash') {
 gameState.cash = (gameState.cash || 0) + refund;
 } else if (cardDef.costType === 'chronos') {
 gameState.chronos = Math.min(gameState.maxChronos, gameState.chronos + refund);
 } else if (cardDef.costType === 'mana') {
 gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + refund);
 gameState.manaSpentThisTurn = Math.max(0, gameState.manaSpentThisTurn - refund);
 } else {
 gameState.currentEnergy += refund;
 }

 gameState.sequence[slotIdx] = null;
 gameState.hand.push(cardObj);
 renderUI();
};

window.moveCardToVault = function(e, handIdx) {
 e.stopPropagation();
 if (gameState.isExecuting) return;
 const maxVaultSlots = getMaxVaultSlots(gameState.classType);
 if (gameState.vault.length >= maxVaultSlots) {
 showToast(`Stasis Vault is full (Max ${maxVaultSlots} Card${maxVaultSlots > 1 ? 's' : ''})!`, 'var(--accent-purple)');
 return;
 }
 const cardObj = gameState.hand[handIdx];
 if (!cardObj) return;
 cardObj.turnsInVault = 0;
 gameState.hand.splice(handIdx, 1);
 gameState.vault.push(cardObj);
 renderUI();
};

window.retrieveCardFromVault = async function(vaultIdx) {
 if (gameState.isExecuting) return;
 const cardObj = gameState.vault[vaultIdx];
 if (!cardObj) return;

 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;

 if (cardObj.id === 'assembly_blueprint') {
 gameState.vault.splice(vaultIdx, 1);
 gameState.discardPile.push(cardObj.id);
 deployOrRefundArtificerTurret(px, py);
 renderUI();
 return;
 }

 cardObj.wasUnvaultedThisTurn = true;
 gameState.vault.splice(vaultIdx, 1);
 gameState.hand.push(cardObj);
 renderUI();
};

window.scrapHandCard = async function(e, handIdx) {
 e.stopPropagation();
 if (gameState.isExecuting) return;
 if (gameState.scrapsUsedThisTurn >= gameState.scrapLimit) {
 showToast(`Scrap capacity reached! Max ${gameState.scrapLimit} card${gameState.scrapLimit > 1 ? 's' : ''} per turn.`, 'var(--accent-gold)');
 return;
 }
 const cardObj = gameState.hand[handIdx];
 if (!cardObj) return;
 const cardDef = CARD_DATABASE[cardObj.id];
 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;

 gameState.hand.splice(handIdx, 1);
 gameState.discardPile.push(cardObj.id);
 gameState.scrapsUsedThisTurn += 1;
 gameState.totalScrapsInBattle += 1;

 // Mob Boss T1 Mastery: Syndicate Boss (+$20 Cash & +2 Notoriety on Scrap)
 if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[0]) {
 gainCash(20, px, py, '🎩 FENCED ON STREET: +$20 CASH!', true);
 gainNotoriety(2, px, py);
 } else {
 let energyGain = 1 + (gameState.nextScrapBonusEnergy || 0);
 gameState.nextScrapBonusEnergy = 0;
 gameState.currentEnergy += energyGain;
 spawnFloatingText(px, py - 24, `SCRAPPED → +${energyGain} ENERGY`, '#f59e0b');
 }

 if (cardDef.id === 'bastion_scrap') {
 addPlayerShield(12, px, py);
 if (gameState.classType !== 'Blood Reaver') {
 spawnFloatingText(px, py - 42, 'BASTION SCRAP → +12 SHIELD!', '#38bdf8');
 }
 }

 if (cardDef.id === 'reinforced_plating') {
 gainParts(2, px, py, 'PLATING SCRAPPED → +2 PARTS!');
 }

 if (cardDef.id === 'deja_vu') {
 gainChronos(1, px, py, 'DÉJÀ VU SCRAPPED → +1 CHRONOS!');
 drawCardsForTurn(false);
 }

 if (cardDef.id === 'money_laundering') {
 gainCash(25, px, py, 'LAUNDERED SCRAP → +$25 CASH!', true);
 gainNotoriety(2, px, py);
 gameState.currentEnergy += 1;
 }

 // Artificer T1 Mastery: Master Salvager (+1 Part & 4 DMG Scrap Bolt)
 if (gameState.classType === 'Artificer' && getClassUnlockedArray('Artificer')[0]) {
 gainParts(1, px, py);
 const activeEnemies = gameState.enemies.filter(en => en.hp > 0);
 if (activeEnemies.length > 0) {
 const target = activeEnemies[0];
 const tIdx = gameState.enemies.indexOf(target);
 const eSprite = enemySprites[tIdx];
 const tx = eSprite ? eSprite.x : 750;
 const ty = eSprite ? eSprite.y : 138;
 target.hp = Math.max(0, target.hp - 4);
 spawnLightningBolt(px + 18, py, tx, ty, 0xf59e0b, 0xfef08a);
 spawnFloatingText(tx, ty - 24, 'SALVAGE BOLT -4 HP', '#f59e0b');
 }
 }

 // Artificer T3 Mastery: Singularity Core (Every 4th Scrap triggers 20 AoE DMG & +15 Shield)
 if (gameState.classType === 'Artificer' && getClassUnlockedArray('Artificer')[2] && gameState.totalScrapsInBattle % 4 === 0) {
 addPlayerShield(15, px, py);
 spawnShockwave(px, py, 145, 0xf59e0b, 7, 28);
 spawnFloatingText(px, py - 46, 'SINGULARITY CORE MELTDOWN (20 AOE + 15 SHIELD)!', '#fef08a');
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hp = Math.max(0, en.hp - 20);
 const sp = enemySprites[idx];
 if (sp) {
 spawnShockwave(sp.x, sp.y, 75, 0xf59e0b, 5, 22);
 spawnFloatingText(sp.x, sp.y - 26, '-20 CORE BLAST', '#f59e0b');
 }
 }
 });
 }

 renderUI();
 checkPostActionVictoryOrDefeat();
};

window.restAndCharge = async function() {
 if (gameState.isExecuting) return;
 gameState.isExecuting = true;

 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;

 if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[2]) {
 gameState.restBonusActiveNextTurn = true;
 spawnShockwave(px, py, 85, 0x2dd4bf, 5, 26);
 spawnFloatingText(px, py - 24, 'SOVEREIGN OF TIME (+2 TEMP SLOTS & VAULT ECHOES)!', '#2dd4bf');

 const vaultCopy = [...gameState.vault];
 for (let v = 0; v < vaultCopy.length; v++) {
 const vCardObj = vaultCopy[v];
 const vDef = CARD_DATABASE[vCardObj.id];
 if (vDef) {
 spawnFloatingText(px, py - 42, `VAULT ECHO: ${vDef.name.toUpperCase()}!`, '#38bdf8');
 await resolveSingleCardAction(vCardObj, 0, true);
 await new Promise(r => setTimeout(r, 260 * gameState.speedMultiplier));
 }
 }
 } else {
 gameState.restBonusActiveNextTurn = true;
 spawnShockwave(px, py, 65, 0xf59e0b, 4, 24);
 spawnFloatingText(px, py - 24, 'RESTING (+1 SLOT NEXT TURN)', '#f59e0b');
 }

 if (gameState.chronoEchoPlayedThisTurn) {
 gameState.nextTurnBonusEnergy += 1;
 gainMana(1, px, py, 'CHRONO ECHO → +1 MANA!');
 }

 await new Promise(r => setTimeout(r, 380 * gameState.speedMultiplier));
 await executeEnemyTurns();
 endPlayerTurnCleanup();
};

// --- SINGLE CARD ACTION RESOLVER (SUPPORTS NORMAL & PARADOX ECHO CASTS) ---
async function resolveSingleCardAction(cardObj, slotIndex, isEchoCast = false) {
 const cardDef = CARD_DATABASE[cardObj.id];
 if (!cardDef) return;
 const echoScale = isEchoCast ? 0.5 : 1.0;

 const activeEnemies = gameState.enemies.filter(e => e.hp > 0);
 const targetEnemy = activeEnemies[0];
 const targetIdx = gameState.enemies.indexOf(targetEnemy);
 const targetSprite = targetIdx !== -1 ? enemySprites[targetIdx] : null;
 const srcPos = { x: playerSprite ? playerSprite.x : 200, y: playerSprite ? playerSprite.y : 138 };
 const tgtPos = { x: targetSprite ? targetSprite.x : 750, y: targetSprite ? targetSprite.y : 138 };

 // Spellweaver Prism Tome Echo Check
 let triggerTomeEchoAfter = false;
 if (!isEchoCast && cardDef.category === 'tome' && gameState.nextTomeEchoThisTurn && cardDef.id !== 'spellweaver_prism') {
 gameState.nextTomeEchoThisTurn = false;
 triggerTomeEchoAfter = true;
 }

 // Card-specific immediate utility hooks
 if (cardDef.id === 'chrono_slash' && slotIndex === 0) {
 gainChronos(1, srcPos.x, srcPos.y);
 }
 if (cardDef.id === 'stasis_surge') {
 gainChronos(1, srcPos.x, srcPos.y);
 drawTypeFromPile('action', 1);
 }
 if (cardDef.id === 'stasis_condenser') {
 gameState.vault.forEach(v => v.turnsInVault = (v.turnsInVault || 0) + 2);
 spawnFloatingText(srcPos.x, srcPos.y - 38, 'STASIS VAULT +2 TURNS!', '#2dd4bf');
 }
 if (cardDef.id === 'chrono_rewind') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gameState.currentEnergy += 1;
 const rewindId = gameState.lastSlot1CardId || gameState.lastInstantSlot1CardId;
 if (rewindId && CARD_DATABASE[rewindId]) {
 gameState.hand.push({ instanceId: Math.random().toString(36).substring(7), id: rewindId, isNew: true, turnsInVault: 0, wasUnvaultedThisTurn: false });
 spawnFloatingText(srcPos.x, srcPos.y - 40, `REWIND → [${CARD_DATABASE[rewindId].name}] RETURNED!`, '#2dd4bf');
 } else {
 drawTypeFromPile('action', 1);
 }
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'temporal_fracture') {
 gameState.guaranteedDodgeCount += 1;
 playCardVFX(cardDef.id, srcPos, tgtPos);
 const aoeDmg = Math.max(1, Math.round(16 * echoScale));
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hp = Math.max(0, en.hp - aoeDmg);
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, `-${aoeDmg} FRACTURE`, '#2dd4bf');
 }
 });
 spawnFloatingText(srcPos.x, srcPos.y - 36, '+1 GUARANTEED DODGE!', '#4ade80');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }

 // Mob Boss & Contraband Special Utility Cards
 if (cardDef.id === 'syndicate_ledger') {
 gainCash(Math.round(15 * echoScale), srcPos.x, srcPos.y, undefined, true);
 gainNotoriety(2, srcPos.x, srcPos.y);
 drawTypeFromPile('action', 1);
 gameState.enforcers.forEach(e => e.hp = Math.min(e.maxHp || 12, e.hp + 5));
 playCardVFX(cardDef.id, srcPos, tgtPos);
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'hired_goon_contract') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 hireOrReinforceEnforcer(srcPos.x, srcPos.y);
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'mercenary_contract') {
 hireOrReinforceEnforcer(srcPos.x, srcPos.y);
 gameState.currentEnergy += 1;
 spawnFloatingText(srcPos.x, srcPos.y - 44, '+1 ENERGY!', '#38bdf8');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'black_market_voucher') {
 gainCash(Math.round(18 * echoScale), srcPos.x, srcPos.y, undefined, true);
 gainNotoriety(3, srcPos.x, srcPos.y);
 drawTypeFromPile('action', 1);
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'adrenaline_syringe') {
 gameState.currentEnergy += 2;
 drawTypeFromPile('action', 1);
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 26, '💉 ADRENALINE: +2 ENERGY & DRAW!', '#4ade80');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'offers_you_cant_refuse') {
 gameState.intimidateMultiplier = 0.5;
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gainNotoriety(3, srcPos.x, srcPos.y);
 drawTypeFromPile('action', 1);
 spawnFloatingText(srcPos.x, srcPos.y - 44, '🎩 INTIMIDATED: ENEMY ATK -50% THIS TURN!', '#eab308');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'family_consigliere') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gainNotoriety(2, srcPos.x, srcPos.y);
 gameState.restockDiscount = Math.min(10, (gameState.restockDiscount || 0) + 5);
 if (gameState.sequence.length < 5) {
 gameState.sequence.push(null);
 }
 spawnFloatingText(srcPos.x, srcPos.y - 44, '+1 TEMP SLOT & -$5 RESTOCK COST!', '#eab308');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'loaded_dice') {
 gameState.currentEnergy += 1;
 gameState.nextHitCritBonus += 0.15;
 drawCardsForTurn(false);
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 28, '🎲 LOADED DICE: +1⚡, +15% CRIT & DRAW!', '#eab308');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'hollow_point_mag') {
 gameState.nextHitBonusDmg += 12;
 gameState.guaranteedCritNextAttack = true;
 gameState.nextHitBonusHemorrhage += 3;
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 28, '💥 HOLLOW-POINT: +12 DMG, 100% CRIT & +3 BLEED!', '#fb7185');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'syndicate_bribe') {
 gameState.currentEnergy += 2;
 if (gameState.sequence.length < 5) {
 gameState.sequence.push(null);
 }
 drawCardsForTurn(false);
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 28, '💵 SYNDICATE BRIBE: +2⚡, +1 SLOT & DRAW!', '#4ade80');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'godfathers_decree') {
 addPlayerShield(Math.round(20 * echoScale), srcPos.x, srcPos.y);
 if (!isEchoCast) gameState.maxEnergy += 1;
 gameState.currentEnergy += 1;
 playCardVFX(cardDef.id, srcPos, tgtPos);
 const aoeDmg = Math.max(1, Math.round(20 * echoScale));
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hp = Math.max(0, en.hp - aoeDmg);
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, `-${aoeDmg} DECREE`, '#eab308');
 }
 });
 spawnFloatingText(srcPos.x, srcPos.y - 36, '👑 +1 MAX ENERGY & +20 SHIELD!', '#fef08a');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'drive_by_ambush') {
 playCardVFX(cardDef.id, srcPos, tgtPos);
 const aoeDmg = Math.max(1, Math.round(12 * echoScale));
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hp = Math.max(0, en.hp - aoeDmg);
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, `-${aoeDmg} DRIVE-BY`, '#eab308');
 }
 });
 await fireAllMobEnforcers(1.0);
 return;
 }

 // Artificer Utility Cards
 if (cardDef.id === 'wrench_toss') {
 gainParts(1, srcPos.x, srcPos.y);
 }
 if (cardDef.id === 'overclock_blueprint') {
 gainParts(1, srcPos.x, srcPos.y);
 gameState.turretBonusVolleysThisTurn += 1;
 drawTypeFromPile('action', 1);
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 28, 'OVERCLOCK: TURRETS +1 VOLLEY!', '#f59e0b');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'weld_and_patch') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gameState.turrets.forEach(t => t.hp = Math.min(t.maxHp || 10, t.hp + 6));
 if (gameState.turrets.length > 0) {
 spawnFloatingText(srcPos.x, srcPos.y - 38, 'TURRETS REPAIRED (+6 HP)!', '#4ade80');
 }
 return;
 }
 if (cardDef.id === 'reactive_armor') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gameState.reactiveArmorActive = true;
 spawnFloatingText(srcPos.x, srcPos.y - 38, 'REACTIVE ARMOR ONLINE!', '#f59e0b');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'assembly_blueprint') {
 deployOrRefundArtificerTurret(srcPos.x, srcPos.y);
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }

 // Blood Reaver Utility Cards
 if (cardDef.id === 'blood_suck') {
 playCardVFX(cardDef.id, srcPos, tgtPos);
 if (targetEnemy && (targetEnemy.hemorrhage || 0) > 0) {
 const stacks = targetEnemy.hemorrhage;
 targetEnemy.hemorrhage = 0;
 const dmg = Math.max(1, Math.round(stacks * 2 * echoScale));
 const heal = Math.max(1, Math.round(stacks * 4 * echoScale));
 targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);
 healPlayerHp(heal, srcPos.x, srcPos.y, `🩸 SIPHONED +${heal} HP!`);
 spawnFloatingText(tgtPos.x, tgtPos.y - 26, `🩸 DRAINED ${stacks} STACKS (-${dmg} HP)`, '#fb7185');
 } else {
 spawnFloatingText(tgtPos.x, tgtPos.y - 24, 'NO HEMORRHAGE STACKS', '#94a3b8');
 }
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }
 if (cardDef.id === 'coagulate') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 if (gameState.player.hp > gameState.player.maxHp) {
 gameState.nextTurnBonusEnergy += 1;
 spawnFloatingText(srcPos.x, srcPos.y - 46, 'OVERHEALED → +1⚡ NEXT TURN!', '#fb7185');
 }
 return;
 }
 if (cardDef.id === 'sanguine_ward') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hemorrhage = (en.hemorrhage || 0) + 2;
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, '+2 HEMORRHAGE', '#fb7185');
 }
 });
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }

 // Mage, Warrior, Rogue Utility Cards
 if (cardDef.id === 'arcane_battery') {
 gameState.nextTurnBonusEnergy += 1;
 drawTypeFromPile('action', 1);
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 24, '+1 ENERGY NEXT TURN & TUTORED!', '#c084fc');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'spellweaver_prism') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gainMana(2, srcPos.x, srcPos.y, '+2 MANA & TOME ECHO PRIMED!');
 gameState.nextTomeEchoThisTurn = true;
 return;
 } else if (cardDef.id === 'astral_singularity') {
 gameState.currentEnergy += 1;
 playCardVFX(cardDef.id, srcPos, tgtPos);
 const aoeDmg = Math.max(1, Math.round(24 * echoScale));
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hp = Math.max(0, en.hp - aoeDmg);
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, `-${aoeDmg} SINGULARITY`, '#c084fc');
 }
 });
 spawnFloatingText(srcPos.x, srcPos.y - 34, '🌌 +1 ENERGY!', '#38bdf8');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'cleaving_execution') {
 playCardVFX(cardDef.id, srcPos, tgtPos);
 const shieldBonus = (gameState.player.shield || 0) >= 15 ? 10 : 0;
 const aoeDmg = Math.max(1, Math.round((16 + shieldBonus) * echoScale));
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.hp = Math.max(0, en.hp - aoeDmg);
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, `-${aoeDmg} CLEAVE`, '#ef4444');
 }
 });
 return;
 } else if (cardDef.id === 'smokebomb_barrage') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gameState.guaranteedDodgeCount += 1;
 triggerRogueShadowCounter(srcPos.x, srcPos.y, 'SMOKE → 100% CRIT PRIMED!');
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.poison = (en.poison || 0) + 2;
 const sp = enemySprites[idx];
 if (sp) spawnFloatingText(sp.x, sp.y - 26, '+2 POISON', '#4ade80');
 }
 });
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'chrono_echo') {
 gameState.chronoEchoPlayedThisTurn = true;
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 drawCardsForTurn(false);
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'prismatic_catalyst') {
 gameState.attackDiscountThisTurn += 1;
 playCardVFX(cardDef.id, srcPos, tgtPos);
 spawnFloatingText(srcPos.x, srcPos.y - 24, '-1⚡ ATTACK COST THIS TURN', '#38bdf8');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'juggernaut_stance') {
 gameState.juggernautStanceActive = true;
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 spawnFloatingText(srcPos.x, srcPos.y - 40, 'SHIELD LOCKED FOR 1 TURN', '#38bdf8');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'shadow_step') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
 gameState.guaranteedDodgeCount += 1;
 triggerRogueShadowCounter(srcPos.x, srcPos.y, 'EVASION → 100% CRIT PRIMED!');
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 } else if (cardDef.id === 'vault_recycle') {
 playCardVFX(cardDef.id, srcPos, tgtPos);
 if (gameState.vault.length > 0 && gameState.sequence[0] === null) {
 const vCard = gameState.vault.pop();
 vCard.wasUnvaultedThisTurn = true;
 gameState.sequence[0] = vCard;
 spawnFloatingText(srcPos.x, srcPos.y - 24, 'VAULT CARD RECYCLED TO SLOT 1!', '#c084fc');
 }
 drawCardsForTurn(false);
 if (triggerTomeEchoAfter) await resolveSingleCardAction(cardObj, slotIndex, true);
 return;
 }

 if (cardDef.type === 'ATTACK' && targetEnemy) {
 let hitCount = cardDef.hits || 1;
 if (cardDef.id === 'rift_strike' && cardObj.wasUnvaultedThisTurn) {
 hitCount = 2;
 spawnFloatingText(srcPos.x, srcPos.y - 44, 'RIFT DOUBLE STRIKE!', '#2dd4bf');
 }

 for (let h = 0; h < hitCount; h++) {
 if (!targetEnemy || targetEnemy.hp <= 0) break;

 let baseDmg = cardDef.value || 0;

 if (cardDef.id === 'overcharge_conduit') {
 if (slotIndex === 2) {
 gameState.currentEnergy += 1;
 gainMana(1, srcPos.x, srcPos.y);
 spawnFloatingText(srcPos.x, srcPos.y - 40, 'SLOT 3 OVERCHARGE (+1⚡ +1 MANA)', '#c084fc');
 }
 } else if (cardDef.id === 'volatile_reserve') {
 baseDmg += (cardObj.turnsInVault || 0) * 6;
 } else if (cardDef.id === 'mana_overload') {
 baseDmg += (gameState.manaSpentThisTurn || 0) * 6;
 } else if (cardDef.id === 'patience_fury') {
 if (gameState.restBonusActiveThisTurn) {
 baseDmg = 24;
 addPlayerShield(8, srcPos.x, srcPos.y);
 }
 } else if (cardDef.id === 'battering_rampart') {
 baseDmg = 22;
 } else if (cardDef.id === 'shield_slam') {
 baseDmg = gameState.player.shield;
 gameState.player.shield = 0;
 } else if (cardDef.id === 'venom_spreader') {
 const extraStacks = Math.min(5, targetEnemy.poison || 0);
 targetEnemy.poison = (targetEnemy.poison || 0) + extraStacks;
 spawnFloatingText(tgtPos.x, tgtPos.y - 42, `+${extraStacks} VENOM SPREAD`, '#4ade80');
 } else if (cardDef.id === 'shadow_prep') {
 gameState.restBonusActiveNextTurn = true;
 gameState.enemies.forEach((en, idx) => {
 if (en.hp > 0) {
 en.poison = (en.poison || 0) + 3;
 if (enemySprites[idx]) spawnPoisonBubbles(enemySprites[idx].x, enemySprites[idx].y, 8);
 }
 });
 spawnFloatingText(srcPos.x, srcPos.y - 24, 'SHADOW PREP (+3 ALL POISON & REST BONUS)', '#4ade80');
 } else if (cardDef.id === 'venom_surge') {
 const aheadCount = gameState.sequence.slice(0, slotIndex).filter(c => c !== null).length;
 targetEnemy.poison = (targetEnemy.poison || 0) + (aheadCount * 3);
 spawnFloatingText(tgtPos.x, tgtPos.y - 42, `SURGE +${aheadCount * 3} POISON`, '#4ade80');
 } else if (cardDef.id === 'catalytic_rupture') {
 const ruptureDmg = Math.floor((targetEnemy.poison || 0) * 1.5);
 targetEnemy.poison = 0;
 baseDmg = ruptureDmg;
 } else if (cardDef.id === 'entropy_bolt') {
 const emptySlots = gameState.sequence.filter(s => s === null).length;
 baseDmg = 8 + emptySlots * 4;
 } else if (cardDef.id === 'capacitor_discharge') {
 const spentParts = gameState.parts || 0;
 gameState.parts = 0;
 baseDmg = spentParts * 5;
 spawnFloatingText(srcPos.x, srcPos.y - 36, `DISCHARGED ${spentParts} PARTS (${baseDmg} DMG)!`, '#f59e0b');
 } else if (cardDef.id === 'scrap_cannon') {
 baseDmg = 12 + (gameState.scrapsUsedThisTurn || 0) * 6;
 } else if (cardDef.id === 'blood_boil') {
 triggerHemorrhageOnEnemy(targetEnemy, targetSprite, 2, false);
 } else if (cardDef.id === 'hemorrhagic_rupture') {
 baseDmg = 8 + (targetEnemy.hemorrhage || 0) * 4;
 } else if (cardDef.id === 'concrete_shoes') {
 baseDmg = 16 + (gameState.enforcers ? gameState.enforcers.length * 5 : 0);
 } else if (cardDef.id === 'scrap_engine') {
 gameState.nextScrapBonusEnergy += 2;
 spawnFloatingText(srcPos.x, srcPos.y - 24, 'NEXT SCRAP GIVES +2⚡', '#f59e0b');
 }

 if (h === 0) {
 baseDmg += gameState.nextHitBonusDmg;
 gameState.nextHitBonusDmg = 0;

 if (gameState.nextHitMultiplier && gameState.nextHitMultiplier > 1.0) {
 baseDmg = Math.round(baseDmg * gameState.nextHitMultiplier);
 gameState.nextHitMultiplier = 1.0;
 }
 }

 // Mob Boss T2 Mastery: Made Men (+3 DMG per active Enforcer)
 if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[1] && gameState.enforcers.length > 0) {
 baseDmg += gameState.enforcers.length * 3;
 }

 // Chronomancer T1 Mastery: Temporal Anchor (+10% DMG on unvaulted cards)
 if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[0] && cardObj.wasUnvaultedThisTurn) {
 baseDmg = Math.round(baseDmg * 1.10);
 }

 const timeTier = gameState.passives.TIME_WARP || 0;
 if (slotIndex === 1 && timeTier >= 3) baseDmg = Math.round(baseDmg * 1.35);

 const frenzyTier = gameState.passives.FRENZY || 0;
 if (frenzyTier > 0) {
 const missingPct = Math.max(0, (gameState.player.maxHp - gameState.player.hp) / gameState.player.maxHp);
 baseDmg = Math.round(baseDmg * (1 + missingPct * 50 * 0.005 * frenzyTier));
 }

 const bfTier = gameState.passives.BLACK_FLASH || 0;
 const effectiveCrit = getEffectiveCritChance();
 const phantomAutoCrit = cardDef.id === 'phantom_ambush' && ((gameState.guaranteedDodgeCount || 0) > 0 || gameState.guaranteedCritNextAttack);
 const isGuaranteedCrit = (h === 0 && gameState.guaranteedCritNextAttack === true) || phantomAutoCrit;
 if (h === 0) {
 gameState.guaranteedCritNextAttack = false;
 gameState.nextHitCritBonus = 0;
 }
 const isCrit = baseDmg > 0 && (isGuaranteedCrit || Math.random() < effectiveCrit);

 let critMult = bfTier >= 3 ? 2.25 : 2.0;
 if (cardDef.id === 'golden_peacemaker') critMult = 2.5;
 if (gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[1] && (targetEnemy.hemorrhage || 0) > 0) {
 critMult += 0.25;
 }

 let finalDmg = isCrit ? Math.round(baseDmg * critMult) : baseDmg;
 finalDmg = Math.max(baseDmg > 0 ? 1 : 0, Math.round(finalDmg * echoScale));

 if (h === 0) {
 playCardVFX(cardDef.id, srcPos, tgtPos);
 }

 const totalBleedApplied = (cardDef.hemorrhage || 0) + (h === 0 ? (gameState.nextHitBonusHemorrhage || 0) : 0);
 if (h === 0) gameState.nextHitBonusHemorrhage = 0;

 if (totalBleedApplied > 0) {
 targetEnemy.hemorrhage = (targetEnemy.hemorrhage || 0) + totalBleedApplied;
 spawnParticles(tgtPos.x, tgtPos.y, 10, { colors: [0xdc2626, 0xfb7185], speed: 3.0, life: 20 });
 spawnFloatingText(tgtPos.x, tgtPos.y - 36, `+${totalBleedApplied} HEMORRHAGE`, '#fb7185');
 }

 if (cardDef.poison) {
 targetEnemy.poison = (targetEnemy.poison || 0) + cardDef.poison;
 spawnFloatingText(tgtPos.x, tgtPos.y - 32, `+${cardDef.poison} POISON`, '#4ade80');
 }

 if (cardDef.burn) {
 const extraBurn = (cardDef.id === 'thermite_rivets' && gameState.turrets.length > 0) ? 2 : 0;
 const totalBurn = cardDef.burn + extraBurn;
 targetEnemy.burn = (targetEnemy.burn || 0) + totalBurn;
 spawnFloatingText(tgtPos.x, tgtPos.y - 34, `+${totalBurn} BURN`, '#f97316');
 }

 if (cardDef.id === 'spark') {
 gainMana(1, srcPos.x, srcPos.y, '+1 MANA');
 }

 const igTier = gameState.passives.IGNITION || 0;
 if (igTier > 0 && slotIndex === 2 && h === 0) {
 finalDmg += igTier * 5;
 spawnParticles(tgtPos.x, tgtPos.y, 14, { colors: [0xf97316, 0xfef08a], speed: 4.5, life: 22 });
 spawnFloatingText(tgtPos.x, tgtPos.y - 45, `IGNITION +${igTier * 5}!`, '#f97316');
 }

if (finalDmg > 0) {
    targetEnemy.hp = Math.max(0, targetEnemy.hp - finalDmg);
    if (isCrit) {
      if (bfTier > 0) {
        spawnBlackFlashVFX(tgtPos.x, tgtPos.y, bfTier);
        spawnBlackFlashBanner(tgtPos.x, tgtPos.y - 54);
        spawnFloatingText(tgtPos.x, tgtPos.y - 16, `${isGuaranteedCrit ? 'SHADOW ' : ''}CRIT -${finalDmg}!`, '#ff2a55');
      } else {
        spawnParticles(tgtPos.x, tgtPos.y, 14, { colors: [0xfacc15, 0xfef08a], speed: 4.5, life: 22 });
        spawnFloatingText(tgtPos.x, tgtPos.y - 16, `${isGuaranteedCrit ? 'SHADOW ' : ''}CRIT -${finalDmg}!`, '#facc15');
      }
    } else {
      spawnFloatingText(tgtPos.x, tgtPos.y - 16, `${isEchoCast ? 'ECHO ' : ''}-${finalDmg}`, '#f87171');
    }

 // Mob Boss T1 Passive: Syndicate Shakedown (+$8 Cash & +1 ★ on Crit or Kill)
 if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[0] && (isCrit || targetEnemy.hp === 0)) {
 gainCash(8, tgtPos.x, tgtPos.y, '🎩 SHAKEDOWN +$8 CASH!');
 gainNotoriety(1, tgtPos.x, tgtPos.y);
 }

 // Bounty Hit Contract Payout on Kill
 if (targetEnemy.hp === 0 && targetEnemy.hasBountyLock) {
 targetEnemy.hasBountyLock = false;
 gainCash(25, tgtPos.x, tgtPos.y, '💰 HIT CONTRACT PAID +$25 CASH!', true);
 gainNotoriety(5, tgtPos.x, tgtPos.y);
 }

 if (cardDef.id === 'siphon_slash') {
 healPlayerHp(Math.max(1, Math.round(3 * echoScale)), srcPos.x, srcPos.y);
 }

 // Mob Boss Card Cash Rewards
 if (cardDef.id === 'tommy_gun_spray') {
 gainCash(Math.max(1, Math.round(5 * echoScale)), tgtPos.x, tgtPos.y);
 } else if (cardDef.id === 'tommy_drum_extortion') {
 gainCash(Math.max(1, Math.round(4 * echoScale)), tgtPos.x, tgtPos.y);
 } else if (cardDef.id === 'shakedown') {
 const isLowHp = targetEnemy.hp < targetEnemy.maxHp * 0.5;
 const payout = Math.round((isLowHp ? 24 : 12) * echoScale);
 gainCash(payout, tgtPos.x, tgtPos.y, isLowHp ? `💰 BRUTAL SHAKEDOWN +$${payout}!` : `+$${payout} CASH`, isLowHp);
 } else if (cardDef.id === 'kingpins_ultimatum') {
 gameState.gold += 15;
 spawnCashExplosionVFX(tgtPos.x, tgtPos.y, 1.5);
 spawnFloatingText(srcPos.x, srcPos.y - 34, '👑 KINGPIN PAYOUT: +15g RUN GOLD!', '#eab308');
 } else if (cardDef.id === 'chicago_typewriter' && h === hitCount - 1) {
 gainCash(8, tgtPos.x, tgtPos.y);
 } else if (cardDef.id === 'golden_peacemaker') {
 gainCash(15, tgtPos.x, tgtPos.y, '💰 GOLDEN SLUG +$15 CASH!', true);
 } else if (cardDef.id === 'royal_flush') {
 addPlayerShield(15, srcPos.x, srcPos.y);
 healPlayerHp(10, srcPos.x, srcPos.y);
 gameState.currentEnergy += 1;
 gainCash(20, tgtPos.x, tgtPos.y, '🃏 ROYAL FLUSH +$20 CASH!', true);
 }

 // Blood Reaver Lifesteal & Sovereign Overheal
 let lifestealRatio = (h === 0 ? (gameState.nextHitLifestealBonus || 0) : 0);
 if (h === 0) gameState.nextHitLifestealBonus = 0;

 if (frenzyTier >= 3) lifestealRatio += 0.15;
 if (gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[2]) {
 if (gameState.player.hp < gameState.player.maxHp * 0.40) lifestealRatio += 0.30;
 if (isCrit) lifestealRatio += 1.0;
 }
 if (lifestealRatio > 0) {
 const healAmt = Math.max(1, Math.round(finalDmg * lifestealRatio));
 healPlayerHp(healAmt, srcPos.x, srcPos.y, `🩸 LIFESTEAL +${healAmt} HP`);
 }

 if ((targetEnemy.hemorrhage || 0) > 0) {
 const prevHp = targetEnemy.hp;
 triggerHemorrhageOnEnemy(targetEnemy, targetSprite, 1, true);
 if (prevHp > 0 && targetEnemy.hp === 0 && gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[1]) {
 healPlayerHp(12, srcPos.x, srcPos.y, '🩸 CRIMSON RESONANCE +12 HP!');
 }
 }
 }

 if (hitCount > 1 && h < hitCount - 1) {
 await new Promise(r => setTimeout(r, 170 * gameState.speedMultiplier));
 }
 }
 } else if (cardDef.type === 'DEFEND') {
 applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);

 if (cardDef.id === 'unbreakable_phalanx') {
 gameState.reflectDamageThisTurn = (gameState.reflectDamageThisTurn || 0) + 8;
 spawnFloatingText(srcPos.x, srcPos.y - 38, '🛡️ THORNS: REFLECT 8 DMG!', '#38bdf8');
 } else if (cardDef.id === 'protection_racket') {
 const crewBonus = (gameState.enforcers ? gameState.enforcers.length * 5 : 0);
 const payout = Math.round((10 + crewBonus) * echoScale);
 gainCash(payout, srcPos.x, srcPos.y, `🎩 PROTECTION RACKET +$${payout} CASH!`);
 } else if (cardDef.id === 'money_laundering') {
 gainCash(Math.round(15 * echoScale), srcPos.x, srcPos.y, undefined, true);
 } else if (cardDef.id === 'velvet_kevlar') {
 gameState.reflectDamageThisTurn = (gameState.reflectDamageThisTurn || 0) + 6;
 spawnFloatingText(srcPos.x, srcPos.y - 38, 'REFLECT 6 DMG ACTIVE!', '#eab308');
 } else if (cardDef.id === 'armored_limousine') {
 gameState.juggernautStanceActive = true;
 hireOrReinforceEnforcer(srcPos.x, srcPos.y);
 }
 } else if (cardDef.type === 'HEAL') {
 const healGain = Math.max(1, Math.round((cardDef.value || 10) * echoScale));
 healPlayerHp(healGain, srcPos.x, srcPos.y);
 playCardVFX(cardDef.id, srcPos, tgtPos);

 if (cardDef.id === 'bootleg_tonic') {
 addPlayerShield(6, srcPos.x, srcPos.y);
 spawnFloatingText(srcPos.x, srcPos.y - 44, '🥃 BOOTLEG TONIC: +6 SHIELD!', '#eab308');
 }
 }

 if (triggerTomeEchoAfter) {
 spawnFloatingText(srcPos.x, srcPos.y - 48, '🔮 SPELLWEAVER TOME ECHO!', '#c084fc');
 await new Promise(r => setTimeout(r, 200 * gameState.speedMultiplier));
 await resolveSingleCardAction(cardObj, slotIndex, true);
 }
}

async function fireAllArtificerTurrets(damageMult = 1.0) {
 if (!gameState.turrets || gameState.turrets.length === 0) return;
 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;
 const hasCritTurrets = gameState.classType === 'Artificer' && getClassUnlockedArray('Artificer')[1];

 for (let t = 0; t < gameState.turrets.length; t++) {
 const activeEnemies = gameState.enemies.filter(e => e.hp > 0);
 if (activeEnemies.length === 0) break;
 const targetEnemy = activeEnemies[0];
 const targetIdx = gameState.enemies.indexOf(targetEnemy);
 const targetSprite = enemySprites[targetIdx];

 const droneSprite = (turretGroup && turretGroup.children[t]) ? turretGroup.children[t] : null;
 const sx = droneSprite ? droneSprite.x : px + 44;
 const sy = droneSprite ? droneSprite.y : py - 24 + t * 24;
 const tx = targetSprite ? targetSprite.x : 750;
 const ty = targetSprite ? targetSprite.y : 138;

 const isCrit = hasCritTurrets && Math.random() < getEffectiveCritChance();
 const dmg = Math.round(6 * damageMult * (isCrit ? 2.0 : 1.0));
 targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);
 targetEnemy.burn = (targetEnemy.burn || 0) + 2;

 spawnLightningBolt(sx, sy, tx, ty, 0xf59e0b, 0x38bdf8);
 spawnParticles(tx, ty, 10, { colors: [0xf59e0b, 0xf97316, 0x38bdf8], speed: 3.6, life: 18, shape: 'shard' });
 spawnFloatingText(tx, ty - 22, `TURRET #${t + 1}: -${dmg} ${isCrit ? 'CRIT ' : ''}(+2 BURN)`, '#f59e0b');

 renderUI();
 await new Promise(r => setTimeout(r, 210 * gameState.speedMultiplier));
 }
}

async function fireAllMobEnforcers(damageMult = 1.0) {
 if (!gameState.enforcers || gameState.enforcers.length === 0) return;
 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;
 const hasMadeMen = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[1];

 for (let e = 0; e < gameState.enforcers.length; e++) {
 const activeEnemies = gameState.enemies.filter(en => en.hp > 0);
 if (activeEnemies.length === 0) break;
 const targetEnemy = activeEnemies[0];
 const targetIdx = gameState.enemies.indexOf(targetEnemy);
 const targetSprite = enemySprites[targetIdx];

 const enfSprite = (enforcerGroup && enforcerGroup.children[e]) ? enforcerGroup.children[e] : null;
 const sx = enfSprite ? enfSprite.x : px + 52;
 const sy = enfSprite ? enfSprite.y : py - 20 + e * 24;
 const tx = targetSprite ? targetSprite.x : 750;
 const ty = targetSprite ? targetSprite.y : 138;

 const madeMenBonus = hasMadeMen ? gameState.enforcers.length * 3 : 0;
 const dmg = Math.round((9 + madeMenBonus) * damageMult);
 targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);

 spawnGunfireVolleyVFX(sx, sy, tx, ty, 3);
 spawnFloatingText(tx, ty - 24, `🎩 ENFORCER #${e + 1}: -${dmg} HP`, '#eab308');

 if (targetEnemy.hp === 0 && targetEnemy.hasBountyLock) {
 targetEnemy.hasBountyLock = false;
 gainCash(25, tx, ty, '💰 HIT CONTRACT PAID +$25 CASH!', true);
 gainNotoriety(5, tx, ty);
 }

 renderUI();
 await new Promise(r => setTimeout(r, 220 * gameState.speedMultiplier));
 }
}

window.executeSequence = async function() {
 if (gameState.isExecuting) return;
 gameState.isExecuting = true;

 const timeTier = gameState.passives.TIME_WARP || 0;

 for (let i = 0; i < gameState.sequence.length; i++) {
 const cardObj = gameState.sequence[i];
 if (!cardObj) continue;

 const cardDef = CARD_DATABASE[cardObj.id];
 if (i === 0) {
 gameState.lastSlot1CardId = cardDef.id;
 }
 const slotEl = document.getElementById(`seq-slot-${i}`);
 if (slotEl) slotEl.classList.add('active-executing');

 await resolveSingleCardAction(cardObj, i, false);

 // Chronomancer Base Mechanic: Paradox Echo (cards unvaulted this turn trigger a 50% Echo!)
 if (cardObj.wasUnvaultedThisTurn && gameState.enemies.some(e => e.hp > 0)) {
 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;
 spawnShockwave(px, py, 58, 0x2dd4bf, 3, 20);
 spawnFloatingText(px, py - 42, '⏳ PARADOX ECHO (50%)!', '#2dd4bf');
 await new Promise(r => setTimeout(r, 210 * gameState.speedMultiplier));
 await resolveSingleCardAction(cardObj, i, true);
 }

 gameState.discardPile.push(cardObj.id);
 gameState.sequence[i] = null;
 renderUI();

 let stepDelay = 360;
 if (i === 0 && timeTier >= 1) stepDelay = 180;
 await new Promise(r => setTimeout(r, stepDelay * gameState.speedMultiplier));
 }

 // Fire Artificer Auto-Turrets at end of sequence (+ bonus volleys from Overclock Blueprint)
 if (gameState.turrets && gameState.turrets.length > 0 && gameState.enemies.some(e => e.hp > 0)) {
 const totalVolleys = 1 + (gameState.turretBonusVolleysThisTurn || 0);
 gameState.turretBonusVolleysThisTurn = 0;
 for (let v = 0; v < totalVolleys; v++) {
 if (!gameState.enemies.some(e => e.hp > 0)) break;
 await fireAllArtificerTurrets(1.0);
 }
 }

 // Fire Mob Boss Hired Enforcers at end of sequence
 if (gameState.enforcers && gameState.enforcers.length > 0 && gameState.enemies.some(e => e.hp > 0)) {
 await fireAllMobEnforcers(1.0);
 }

 if (!checkPostActionVictoryOrDefeat()) {
 await executeEnemyTurns();
 endPlayerTurnCleanup();
 }
};

function checkPostActionVictoryOrDefeat() {
 const remainingEnemies = gameState.enemies.filter(e => e.hp > 0);
 if (remainingEnemies.length === 0) {
 const killedCount = gameState.enemies.length;
 gameState.masteryProgress.totalEnemiesKilled = (gameState.masteryProgress.totalEnemiesKilled || 0) + killedCount;
 saveMasteryProgress();

 gameState.isExecuting = false;
 const goldReward = gameState.boardNode === 5 ? 65 : 25;
 const cashBounty = gameState.boardNode === 5 ? 35 : 15;
 const notorietyBounty = gameState.boardNode === 5 ? 10 : 5;
 gameState.gold += goldReward;
 gainCash(cashBounty);
 gainNotoriety(notorietyBounty);
 showToast(`Victory! +${goldReward}g Gold, +$${cashBounty} Cash & +${notorietyBounty} ★ Notoriety!`, 'var(--accent-green)');

 setTimeout(() => {
 triggerCardDraftModal();
 }, 450);
 return true;
 }
 return false;
}

async function executeEnemyTurns() {
 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;
 const shadowTier = gameState.passives.SHADOW_WEAVE || 0;
 const defTier = gameState.passives.DEFLECTION || 0;
 const intimidateMult = gameState.intimidateMultiplier || 1.0;

 for (let i = 0; i < gameState.enemies.length; i++) {
 const enemy = gameState.enemies[i];
 if (enemy.hp <= 0) continue;
 const eSprite = enemySprites[i];
 const ex = eSprite ? eSprite.x : 750;
 const ey = eSprite ? eSprite.y : 138;

 if ((enemy.poison || 0) > 0) {
 const poisonDmg = enemy.poison;
 enemy.hp = Math.max(0, enemy.hp - poisonDmg);
 enemy.poison = Math.max(0, enemy.poison - 1);
 spawnPoisonBubbles(ex, ey, 10);
 spawnFloatingText(ex, ey - 28, `-${poisonDmg} POISON`, '#4ade80');
 await new Promise(r => setTimeout(r, 240 * gameState.speedMultiplier));
 if (enemy.hp <= 0) continue;
 }

 if ((enemy.burn || 0) > 0) {
 const burnDmg = enemy.burn;
 enemy.hp = Math.max(0, enemy.hp - burnDmg);
 enemy.burn = Math.max(0, enemy.burn - 1);
 spawnParticles(ex, ey, 12, { colors: [0xf97316, 0xfef08a], speed: 3.4, life: 20 });
 spawnFloatingText(ex, ey - 32, `-${burnDmg} BURN`, '#f97316');
 await new Promise(r => setTimeout(r, 240 * gameState.speedMultiplier));
 if (enemy.hp <= 0) continue;
 }

 const intent = enemy.sequence[Math.floor(Math.random() * enemy.sequence.length)];
 if (intent.type === 'ATTACK') {
 const dodgeChance = getEffectiveDodgeChance();
 if (Math.random() < dodgeChance) {
 if ((gameState.guaranteedDodgeCount || 0) > 0) gameState.guaranteedDodgeCount -= 1;
 spawnParticles(px, py, 16, { colors: [0x38bdf8, 0x4ade80], speed: 3.5, life: 22 });
 spawnFloatingText(px, py - 24, 'DODGED!', '#4ade80');

 if (gameState.classType === 'Chronomancer') {
 gameState.chronosDodgeCounter = (gameState.chronosDodgeCounter || 0) + 1;
 if (gameState.chronosDodgeCounter % 2 === 0) {
 gainChronos(1, px, py, 'CHRONO EVASION → +1 CHRONOS!');
 }
 }

 triggerRogueShadowCounter(px, py);

 if (shadowTier >= 3) {
 const dodgeHeal = Math.max(2, Math.round(gameState.player.maxHp * 0.05));
 healPlayerHp(dodgeHeal, px, py);
 }
 } else {
 let dmg = Math.max(1, Math.round(intent.value * intimidateMult));

 // Mob Boss Hired Enforcers intercept enemy attacks first & retaliate!
 if (gameState.enforcers && gameState.enforcers.length > 0 && dmg > 0) {
 const frontEnforcer = gameState.enforcers[0];
 const absorbed = Math.min(frontEnforcer.hp, dmg);
 frontEnforcer.hp -= absorbed;
 dmg -= absorbed;
 spawnSlashArc(px + 42, py, 0.3, 44, 0xeab308, 0xffffff);
 spawnFloatingText(px + 34, py - 24, `🎩 ENFORCER TOOK -${absorbed} HP`, '#eab308');

 // Enforcer Frontline Counter-Fire Retaliation
 const hasMadeMen = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[1];
 const counterDmg = 4 + (hasMadeMen ? gameState.enforcers.length * 2 : 0);
 enemy.hp = Math.max(0, enemy.hp - counterDmg);
 spawnGunfireVolleyVFX(px + 42, py, ex, ey, 2);
 spawnFloatingText(ex, ey - 36, `🔫 ENFORCER RETALIATE -${counterDmg} HP`, '#eab308');

 if (frontEnforcer.hp <= 0) {
 gameState.enforcers.shift();
 spawnParticles(px + 42, py, 16, { colors: [0xeab308, 0xef4444], speed: 4.0, life: 22 });
 spawnFloatingText(px + 34, py - 42, 'ENFORCER DOWN!', '#f87171');
 }
 updateAbilityBarLabel();
 }

 // Artificer Auto-Turrets intercept up to 50% of incoming damage before Player Shield/HP
 if (gameState.turrets && gameState.turrets.length > 0 && dmg > 0) {
 const frontTurret = gameState.turrets[0];
 const interceptTarget = Math.max(1, Math.ceil(dmg * 0.5));
 const absorbedByTurret = Math.min(frontTurret.hp, interceptTarget);
 frontTurret.hp -= absorbedByTurret;
 dmg -= absorbedByTurret;

 spawnSlashArc(px + 38, py, 0.3, 44, 0xf59e0b, 0xffffff);
 spawnFloatingText(px + 30, py - 24, `TURRET INTERCEPT -${absorbedByTurret} HP`, '#f59e0b');

 if (gameState.reactiveArmorActive) {
 gainParts(1, px, py, 'REACTIVE ARMOR → +1 PART!');
 enemy.hp = Math.max(0, enemy.hp - 5);
 spawnLightningBolt(px + 38, py, ex, ey, 0xf59e0b, 0x38bdf8);
 spawnFloatingText(ex, ey - 32, 'REACTIVE COUNTER -5 HP', '#f59e0b');
 }

 if (frontTurret.hp <= 0) {
 gameState.turrets.shift();
 spawnParticles(px + 38, py, 18, { colors: [0xf59e0b, 0xef4444, 0xfef08a], speed: 4.5, shape: 'shard', life: 24 });
 spawnFloatingText(px + 30, py - 42, 'TURRET DESTROYED!', '#f87171');
 }
 updateAbilityBarLabel();
 }

 if (dmg > 0) {
 const shieldAbsorbed = Math.min(gameState.player.shield, dmg);
 gameState.player.shield -= shieldAbsorbed;
 const hpLoss = dmg - shieldAbsorbed;
 gameState.player.hp = Math.max(0, gameState.player.hp - hpLoss);

 spawnSlashArc(px, py, 0.4, 58, 0xef4444, 0xfca5a5);
 spawnParticles(px, py, 12, { colors: [0xef4444, 0xf87171], speed: 3.8, life: 20 });
 if (hpLoss > 0) triggerScreenShake(6, 10);
 spawnFloatingText(px, py - 24, hpLoss > 0 ? `-${hpLoss} HP` : 'BLOCKED!', hpLoss > 0 ? '#ef4444' : '#38bdf8');
 }

 const totalReflect = (defTier >= 3 ? Math.floor(intent.value * 0.5) : 0) + (gameState.reflectDamageThisTurn || 0);
 if (totalReflect > 0) {
 enemy.hp = Math.max(0, enemy.hp - totalReflect);
 spawnFloatingText(ex, ey - 24, `REFLECT -${totalReflect}`, '#38bdf8');
 }
 }
 } else if (intent.type === 'DEFEND') {
 spawnShockwave(ex, ey, 58, 0x38bdf8, 4, 20);
 spawnFloatingText(ex, ey - 24, `${intent.name}`, '#38bdf8');
 } else if (intent.type === 'HEAL') {
 enemy.hp = Math.min(enemy.maxHp, enemy.hp + intent.value);
 spawnParticles(ex, ey, 12, { colors: [0x4ade80], speed: 2.2, vyBias: -1.5, shape: 'plus', life: 22 });
 spawnFloatingText(ex, ey - 24, `+${intent.value} HP`, '#4ade80');
 }
 renderUI();
 await new Promise(r => setTimeout(r, 340 * gameState.speedMultiplier));
 }
}

function endPlayerTurnCleanup() {
 gameState.isExecuting = false;
 if (checkPostActionVictoryOrDefeat()) return;

 if (gameState.player.hp <= 0) {
 if (gameState.classType === 'Warrior' && getClassUnlockedArray('Warrior')[2] && !gameState.secondWindUsed) {
 gameState.secondWindUsed = true;
 gameState.player.hp = Math.max(10, Math.round(gameState.player.maxHp * 0.20));
 showToast('🔥 SECOND WIND ACTIVATED! Revived at 20% HP!', 'var(--accent-gold)');
 } else {
 showToast('DEFEAT! Your champion has fallen. Returning to Main Menu...', 'var(--accent-red)');
 setTimeout(() => {
 window.resetGameState(gameState.classType);
 window.showScreen('screen-main');
 }, 1400);
 return;
 }
 }

 // Chronomancer T2 Mastery: Accelerated Timeline (carry over up to 1 unspent Energy)
 const energyCarryover = (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[1])
 ? Math.min(1, Math.max(0, gameState.currentEnergy))
 : 0;

 gameState.restBonusActiveThisTurn = gameState.restBonusActiveNextTurn;
 gameState.restBonusActiveNextTurn = false;
 const slotCount = gameState.restBonusActiveThisTurn ? 4 : 3;
 gameState.sequence = Array(slotCount).fill(null);

 if (!gameState.juggernautStanceActive) {
 gameState.player.shield = Math.floor(gameState.player.shield * 0.5);
 }
 gameState.juggernautStanceActive = false;

 const defTier = gameState.passives.DEFLECTION || 0;
 if (defTier > 0) addPlayerShield(defTier * 3);

 if (gameState.classType === 'Mage') {
 const hasT1 = getClassUnlockedArray('Mage')[0];
 const gain = hasT1 ? 2 : 1;
 gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + gain);
 }

 gameState.vault.forEach(vCard => {
 vCard.turnsInVault = (vCard.turnsInVault || 0) + 1;
 });

 gameState.hand.forEach(cObj => gameState.discardPile.push(cObj.id));
 gameState.hand = [];
 drawCardsForTurn(false);

 gameState.currentEnergy = gameState.maxEnergy + (gameState.nextTurnBonusEnergy || 0) + energyCarryover;
 gameState.nextTurnBonusEnergy = 0;
 gameState.abilityUsedThisTurn = false;
 gameState.scrapsUsedThisTurn = 0;
 gameState.manaSpentThisTurn = 0;
 gameState.attackDiscountThisTurn = 0;
 gameState.nextScrapBonusEnergy = 0;
 gameState.nextTomeEchoThisTurn = false;
 gameState.chronoEchoPlayedThisTurn = false;
 gameState.spentHpThisTurn = false;
 gameState.turretBonusVolleysThisTurn = 0;
 gameState.reactiveArmorActive = false;
 gameState.reflectDamageThisTurn = 0;
 gameState.intimidateMultiplier = 1.0;

 renderUI();
}

