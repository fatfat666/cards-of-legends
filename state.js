// --- ADMIN LOCK STATE & AUTHENTICATION ---
window.isDeckBuilderUnlocked = false;
const DECK_BUILDER_ADMIN_PASS = 'fatfat666';

window.updateBuilderLockBadges = function() {
 const unlocked = window.isDeckBuilderUnlocked === true;
 const mainBtn = document.getElementById('btn-main-builder');
 const classBtn = document.getElementById('btn-class-builder');
 const boardBtn = document.getElementById('btn-board-builder');
 const tabBtn = document.getElementById('tab-builder-btn');
 const previewBtn = document.getElementById('btn-modal-preview-combat');

 if (mainBtn) mainBtn.innerText = unlocked ? '🔓 CARD BUILDER & PREVIEW' : '🔒 CARD BUILDER & PREVIEW';
 if (classBtn) classBtn.innerText = unlocked ? '🔓 CUSTOMIZE DECK' : '🔒 CUSTOMIZE DECK';
 if (boardBtn) boardBtn.innerText = unlocked ? '🔓 OPEN CARD BUILDER' : '🔒 OPEN CARD BUILDER';
 if (tabBtn) tabBtn.innerText = unlocked ? '🔓 DECK BUILDER (CUSTOMIZE)' : '🔒 DECK BUILDER (ADMIN)';
 if (previewBtn) previewBtn.style.display = (unlocked && window.currentGalleryTab === 'builder') ? 'inline-block' : 'none';
};

window.openAdminLockModal = function() {
 const modal = document.getElementById('modal-admin-lock');
 const input = document.getElementById('admin-password-input');
 const errEl = document.getElementById('admin-password-error');
 const box = document.getElementById('admin-lock-box');
 if (!modal) return;
 if (errEl) errEl.innerText = '';
 if (box) box.classList.remove('shake');
 if (input) input.value = '';
 modal.classList.add('active');
 setTimeout(() => {
 if (input) input.focus();
 }, 40);
};

window.closeAdminLockModal = function() {
 const modal = document.getElementById('modal-admin-lock');
 if (modal) modal.classList.remove('active');
};

window.verifyAdminPassword = function() {
 const input = document.getElementById('admin-password-input');
 const errEl = document.getElementById('admin-password-error');
 const box = document.getElementById('admin-lock-box');
 const entered = input ? input.value : '';

 if (entered === DECK_BUILDER_ADMIN_PASS) {
 window.isDeckBuilderUnlocked = true;
 window.updateBuilderLockBadges();
 window.closeAdminLockModal();
 showToast('🔓 Admin Access Granted — Deck Builder Unlocked!', 'var(--accent-green)');
 const deckModal = document.getElementById('modal-deck');
 if (deckModal) deckModal.classList.add('active');
 window.switchIndexTab('builder');
 } else {
 if (errEl) errEl.innerText = 'Access Denied: Invalid Admin Password.';
 if (box) {
 box.classList.remove('shake');
 void box.offsetWidth;
 box.classList.add('shake');
 }
 if (input) {
 input.value = '';
 input.focus();
 }
 }
};

window.lockDeckBuilder = function() {
 window.isDeckBuilderUnlocked = false;
 window.updateBuilderLockBadges();
 showToast('🔒 Deck Builder Locked.', 'var(--accent-gold)');
 window.switchIndexTab('cards');
};

function getDefaultStarterDeck(cls) {
 if (cls === 'Mage') {
 return ['arcane_strike', 'arcane_strike', 'barrier', 'barrier', 'spark', 'spark', 'arcane_battery'];
 } else if (cls === 'Warrior') {
 return ['heavy_slash', 'heavy_slash', 'iron_defense', 'iron_defense', 'iron_defense', 'restoration', 'fortify'];
 } else if (cls === 'Chronomancer') {
 return ['chrono_slash', 'chrono_slash', 'stasis_bubble', 'stasis_bubble', 'rift_strike', 'rift_strike', 'stasis_surge'];
 } else if (cls === 'Artificer') {
 return ['wrench_toss', 'wrench_toss', 'reinforced_plating', 'reinforced_plating', 'capacitor_discharge', 'capacitor_discharge', 'overclock_blueprint'];
 } else if (cls === 'Blood Reaver') {
 return ['siphon_slash', 'siphon_slash', 'serrated_cleave', 'serrated_cleave', 'blood_boil', 'blood_boil', 'blood_suck'];
 } else if (cls === 'Mob Boss') {
 return ['tommy_gun_spray', 'tommy_gun_spray', 'protection_racket', 'protection_racket', 'shakedown', 'shakedown', 'syndicate_ledger'];
 }
 return ['quick_dagger', 'quick_dagger', 'smoke_screen', 'smoke_screen', 'toxic_needle', 'toxic_needle', 'venom_spreader'];
}

function loadMasteryProgress() {
 const defaultProgress = {
 totalEnemiesKilled: 0,
 runsCompleted: 0,
 mageUnlocked: [true, false, false],
 warriorUnlocked: [true, false, false],
 rogueUnlocked: [true, false, false],
 chronomancerUnlocked: [true, false, false],
 artificerUnlocked: [true, false, false],
 bloodreaverUnlocked: [true, false, false],
 mobbossUnlocked: [true, false, false]
 };
 try {
 const parsed = JSON.parse(localStorage.getItem('rogue_board_mastery') || '{}');
 return syncMasteryUnlocks({ ...defaultProgress, ...parsed });
 } catch (e) {
 return defaultProgress;
 }
}

function syncMasteryUnlocks(progress) {
 const kills = progress.totalEnemiesKilled || 0;
 const runs = progress.runsCompleted || 0;

 const reqMap = {
 mageUnlocked: [0, 10, 3],
 warriorUnlocked: [0, 15, 3],
 rogueUnlocked: [0, 12, 3],
 chronomancerUnlocked: [0, 12, 3],
 artificerUnlocked: [0, 15, 3],
 bloodreaverUnlocked: [0, 15, 3],
 mobbossUnlocked: [0, 15, 3]
 };

 Object.keys(reqMap).forEach(key => {
 if (!Array.isArray(progress[key])) progress[key] = [true, false, false];
 progress[key][0] = true;
 if (kills >= reqMap[key][1]) progress[key][1] = true;
 if (runs >= reqMap[key][2]) progress[key][2] = true;
 });

 return progress;
}

function saveMasteryProgress() {
 syncMasteryUnlocks(gameState.masteryProgress);
 localStorage.setItem('rogue_board_mastery', JSON.stringify(gameState.masteryProgress));
}

function getClassUnlockedArray(cls) {
 const keyMap = {
 'Mage': 'mageUnlocked',
 'Warrior': 'warriorUnlocked',
 'Rogue': 'rogueUnlocked',
 'Chronomancer': 'chronomancerUnlocked',
 'Artificer': 'artificerUnlocked',
 'Blood Reaver': 'bloodreaverUnlocked',
 'Mob Boss': 'mobbossUnlocked'
 };
 const k = keyMap[cls] || 'rogueUnlocked';
 if (!gameState.masteryProgress[k]) {
 gameState.masteryProgress[k] = [true, false, false];
 }
 return gameState.masteryProgress[k];
}

function getMaxVaultSlots(cls) {
 if (cls === 'Warrior' || cls === 'Mage' || cls === 'Chronomancer' || cls === 'Mob Boss') return 2;
 return 1;
}

// --- NOTORIETY RANK & BLACK MARKET SLOT UNLOCK SYSTEM ---
function getNotorietyInfo(notorietyVal) {
 const n = Math.max(0, Math.floor(Number(notorietyVal) || 0));
 if (n >= 75) {
 return {
 rankNum: 5,
 rankName: 'RANK V • KINGPIN',
 unlockedSlots: 6,
 maxTier: 5,
 discountRatio: 0.85,
 nextThreshold: null,
 prevThreshold: 75,
 tierLabel: 'TIER I–V MYTHIC CONTRABAND (15% OFF)'
 };
 } else if (n >= 50) {
 return {
 rankNum: 4,
 rankName: 'RANK IV • UNDERBOSS',
 unlockedSlots: 6,
 maxTier: 4,
 discountRatio: 1.0,
 nextThreshold: 75,
 prevThreshold: 50,
 tierLabel: 'TIER I–IV CONTRABAND'
 };
 } else if (n >= 30) {
 return {
 rankNum: 3,
 rankName: 'RANK III • CAPO ENFORCER',
 unlockedSlots: 5,
 maxTier: 3,
 discountRatio: 1.0,
 nextThreshold: 50,
 prevThreshold: 30,
 tierLabel: 'TIER I–III CONTRABAND'
 };
 } else if (n >= 15) {
 return {
 rankNum: 2,
 rankName: 'RANK II • MADE ASSOCIATE',
 unlockedSlots: 4,
 maxTier: 2,
 discountRatio: 1.0,
 nextThreshold: 30,
 prevThreshold: 15,
 tierLabel: 'TIER I–II CONTRABAND'
 };
 }
 return {
 rankNum: 1,
 rankName: 'RANK I • STREET ROOKIE',
 unlockedSlots: 3,
 maxTier: 1,
 discountRatio: 1.0,
 nextThreshold: 15,
 prevThreshold: 0,
 tierLabel: 'TIER I CONTRABAND'
 };
}

function getBlackMarketCardPrice(cardDef) {
 if (!cardDef) return 15;
 const info = getNotorietyInfo(gameState.notoriety || 0);
 const mobT3Mult = (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2]) ? 0.75 : 1.0;
 return Math.max(5, Math.round((cardDef.basePrice || 20) * mobT3Mult * info.discountRatio));
}

function getBlackMarketRestockCost() {
 const info = getNotorietyInfo(gameState.notoriety || 0);
 const mobT3Mult = (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2]) ? 0.75 : 1.0;
 const consigliereDiscount = gameState.restockDiscount || 0;
 return Math.max(5, Math.round((15 - consigliereDiscount) * mobT3Mult * info.discountRatio));
}

function pickContrabandCardForTier(maxTier, excludeIds = []) {
 const allContraband = Object.values(CARD_DATABASE).filter(c => c.isContraband && (c.contrabandTier || 1) <= maxTier);
 const filtered = allContraband.filter(c => !excludeIds.includes(c.id));
 const pool = filtered.length > 0 ? filtered : allContraband;
 if (pool.length === 0) return null;
 return pool[Math.floor(Math.random() * pool.length)];
}

function generateBlackMarketStock() {
 const info = getNotorietyInfo(gameState.notoriety || 0);
 const usedIds = [];
 const stock = [];
 for (let i = 0; i < 6; i++) {
 if (i < info.unlockedSlots) {
 const card = pickContrabandCardForTier(info.maxTier, usedIds);
 if (card) {
 usedIds.push(card.id);
 stock.push({ slotIndex: i, cardId: card.id, sold: false });
 } else {
 stock.push({ slotIndex: i, cardId: null, sold: false });
 }
 } else {
 stock.push({ slotIndex: i, cardId: null, sold: false });
 }
 }
 gameState.blackMarketStock = stock;
}

function syncBlackMarketUnlockedSlots() {
 const info = getNotorietyInfo(gameState.notoriety || 0);
 if (!Array.isArray(gameState.blackMarketStock) || gameState.blackMarketStock.length !== 6) {
 generateBlackMarketStock();
 return;
 }
 const existingIds = gameState.blackMarketStock.filter(s => s && s.cardId).map(s => s.cardId);
 for (let i = 0; i < info.unlockedSlots; i++) {
 if (!gameState.blackMarketStock[i] || !gameState.blackMarketStock[i].cardId) {
 const card = pickContrabandCardForTier(info.maxTier, existingIds);
 if (card) {
 existingIds.push(card.id);
 gameState.blackMarketStock[i] = { slotIndex: i, cardId: card.id, sold: false };
 }
 }
 }
}

window.gameState = {
 classType: 'Rogue',
 boardNode: 1,
 maxNodes: 5,
 gold: 50,
 maxEnergy: 3,
 currentEnergy: 3,
 nextTurnBonusEnergy: 0,
 speedMultiplier: 1.0,
 speedLabel: '1x',
 abilityUsedThisTurn: false,
 nextHitBonusDmg: 0,
 nextHitMultiplier: 1.0,
 nextHitCritBonus: 0,
 nextHitLifestealBonus: 0,
 nextHitBonusHemorrhage: 0,
 guaranteedCritNextAttack: false,
 guaranteedDodgeCount: 0,
 manaSpentThisTurn: 0,
 attackDiscountThisTurn: 0,
 nextScrapBonusEnergy: 0,
 nextTomeEchoThisTurn: false,
 restBonusActiveThisTurn: false,
 restBonusActiveNextTurn: false,
 chronoEchoPlayedThisTurn: false,
 isExecuting: false,
 pendingNodeType: 'COMBAT',
 player: { hp: 70, maxHp: 70, shield: 0, critChance: 0.15, dodgeChance: 0.20, mana: 0, maxMana: 0 },
 enemies: [],

 // Chronomancer State
 chronos: 0,
 maxChronos: 3,
 chronosDodgeCounter: 0,
 lastInstantSlot1CardId: null,
 lastSlot1CardId: null,

 // Artificer State
 parts: 0,
 maxParts: 6,
 turrets: [],
 totalScrapsInBattle: 0,
 turretBonusVolleysThisTurn: 0,
 reactiveArmorActive: false,

 // Blood Reaver State
 spentHpThisTurn: false,

 // Mob Boss & Underground Black Market State
 cash: 0,
 notoriety: 0,
 cashSpentAccumulator: 0,
 restockDiscount: 0,
 intimidateMultiplier: 1.0,
 enforcers: [],
 blackMarketStock: [],
 reflectDamageThisTurn: 0,

 deck: getDefaultStarterDeck('Rogue'),
 drawPileAction: [],
 drawPileTome: [],
 discardPile: [],
 hand: [],
 vault: [],
 sequence: [null, null, null],

 scrapLimit: 1,
 scrapsUsedThisTurn: 0,
 juggernautStanceActive: false,

 passives: { BLACK_FLASH: 0, TIME_WARP: 0, DEFLECTION: 0, SHADOW_WEAVE: 0, FRENZY: 0, IGNITION: 0 },
 masteryProgress: loadMasteryProgress(),
 discoveredIndex: JSON.parse(localStorage.getItem('rogue_board_discovered') || '{}')
};

window.resetGameState = function(className, preserveCustomDeck = false) {
 const chosenClass = className || window.gameState.classType || 'Rogue';
 const savedDeck = preserveCustomDeck && window.gameState.deck && window.gameState.deck.length > 0
 ? [...window.gameState.deck]
 : null;

 const hasMobT1 = getClassUnlockedArray('Mob Boss')[0];

 window.gameState.classType = chosenClass;
 window.gameState.boardNode = 1;
 window.gameState.gold = 50;
 window.gameState.maxEnergy = chosenClass === 'Blood Reaver' ? 2 : 3;
 window.gameState.currentEnergy = window.gameState.maxEnergy;
 window.gameState.nextTurnBonusEnergy = 0;
 window.gameState.abilityUsedThisTurn = false;
 window.gameState.nextHitBonusDmg = 0;
 window.gameState.nextHitMultiplier = 1.0;
 window.gameState.nextHitCritBonus = 0;
 window.gameState.nextHitLifestealBonus = 0;
 window.gameState.nextHitBonusHemorrhage = 0;
 window.gameState.guaranteedCritNextAttack = false;
 window.gameState.guaranteedDodgeCount = 0;
 window.gameState.manaSpentThisTurn = 0;
 window.gameState.attackDiscountThisTurn = 0;
 window.gameState.nextScrapBonusEnergy = 0;
 window.gameState.nextTomeEchoThisTurn = false;
 window.gameState.restBonusActiveThisTurn = false;
 window.gameState.restBonusActiveNextTurn = false;
 window.gameState.chronoEchoPlayedThisTurn = false;
 window.gameState.isExecuting = false;
 window.gameState.drawPileAction = [];
 window.gameState.drawPileTome = [];
 window.gameState.discardPile = [];
 window.gameState.hand = [];
 window.gameState.vault = [];
 window.gameState.sequence = [null, null, null];
 window.gameState.scrapLimit = chosenClass === 'Artificer' ? 2 : 1;
 window.gameState.scrapsUsedThisTurn = 0;
 window.gameState.juggernautStanceActive = false;
 window.gameState.chronos = 0;
 window.gameState.chronosDodgeCounter = 0;
 window.gameState.lastInstantSlot1CardId = null;
 window.gameState.lastSlot1CardId = null;
 window.gameState.parts = 0;
 window.gameState.turrets = [];
 window.gameState.totalScrapsInBattle = 0;
 window.gameState.turretBonusVolleysThisTurn = 0;
 window.gameState.reactiveArmorActive = false;
 window.gameState.spentHpThisTurn = false;
 window.gameState.cash = chosenClass === 'Mob Boss' ? (hasMobT1 ? 45 : 25) : 0;
 window.gameState.notoriety = chosenClass === 'Mob Boss' ? (hasMobT1 ? 15 : 0) : 0;
 window.gameState.cashSpentAccumulator = 0;
 window.gameState.restockDiscount = 0;
 window.gameState.intimidateMultiplier = 1.0;
 window.gameState.enforcers = [];
 window.gameState.reflectDamageThisTurn = 0;
 window.gameState.passives = { BLACK_FLASH: 0, TIME_WARP: 0, DEFLECTION: 0, SHADOW_WEAVE: 0, FRENZY: 0, IGNITION: 0 };

 if (chosenClass === 'Mage') {
 window.gameState.player = { hp: 55, maxHp: 55, shield: 0, critChance: 0.00, dodgeChance: 0.05, mana: 5, maxMana: 5 };
 } else if (chosenClass === 'Warrior') {
 window.gameState.player = { hp: 90, maxHp: 90, shield: 15, critChance: 0.05, dodgeChance: 0.02, mana: 0, maxMana: 0 };
 } else if (chosenClass === 'Chronomancer') {
 window.gameState.player = { hp: 70, maxHp: 70, shield: 5, critChance: 0.10, dodgeChance: 0.10, mana: 0, maxMana: 0 };
 } else if (chosenClass === 'Artificer') {
 window.gameState.player = { hp: 75, maxHp: 75, shield: 10, critChance: 0.10, dodgeChance: 0.05, mana: 0, maxMana: 0 };
 } else if (chosenClass === 'Blood Reaver') {
 window.gameState.player = { hp: 115, maxHp: 115, shield: 0, critChance: 0.15, dodgeChance: 0.05, mana: 0, maxMana: 0 };
 } else if (chosenClass === 'Mob Boss') {
 window.gameState.player = { hp: 80, maxHp: 80, shield: 10, critChance: 0.10, dodgeChance: 0.10, mana: 0, maxMana: 0 };
 } else {
 const hasRogueT1 = getClassUnlockedArray('Rogue')[0] !== false;
 window.gameState.player = { hp: 70, maxHp: 70, shield: 0, critChance: 0.15, dodgeChance: hasRogueT1 ? 0.20 : 0.10, mana: 0, maxMana: 0 };
 }

 window.gameState.deck = savedDeck || getDefaultStarterDeck(chosenClass);
 generateBlackMarketStock();
};

// --- MOB BOSS $ CASH, ★ NOTORIETY & HIRED ENFORCER HELPERS ---
function gainCash(amount = 10, x, y, labelOverride, triggerExplosion = false) {
 const safeAmt = Math.max(0, Math.round(Number(amount) || 0));
 if (safeAmt <= 0) return;
 gameState.cash = (gameState.cash || 0) + safeAmt;
 if (x !== undefined && y !== undefined) {
 if (triggerExplosion || safeAmt >= 15) {
 spawnCashExplosionVFX(x, y - 12, safeAmt >= 20 ? 1.4 : 0.85);
 } else {
 spawnParticles(x, y, 10, { colors: [0x22c55e, 0xeab308, 0xfef08a], speed: 2.8, vyBias: -1.4, life: 22 });
 }
 spawnFloatingText(x, y - 34, labelOverride || `+$${safeAmt} CASH ($${gameState.cash})`, '#4ade80');
 }
}

function gainNotoriety(amount = 5, x, y, labelOverride) {
 const safeAmt = Math.max(0, Math.round(Number(amount) || 0));
 if (safeAmt <= 0) return;
 const prevInfo = getNotorietyInfo(gameState.notoriety || 0);
 gameState.notoriety = (gameState.notoriety || 0) + safeAmt;
 const newInfo = getNotorietyInfo(gameState.notoriety);
 syncBlackMarketUnlockedSlots();

 if (x !== undefined && y !== undefined) {
 spawnFloatingText(x, y - 50, labelOverride || `+${safeAmt} ★ NOTORIETY (${gameState.notoriety}★)`, '#eab308');
 }
 if (newInfo.unlockedSlots > prevInfo.unlockedSlots) {
 showToast(`🎩 ${newInfo.rankName}! Black Market Slot #${newInfo.unlockedSlots} Unlocked!`, 'var(--accent-mob)');
 }
}

function spendCash(amount, x, y) {
 const safeAmt = Math.max(0, Math.round(Number(amount) || 0));
 if ((gameState.cash || 0) < safeAmt) return false;
 gameState.cash -= safeAmt;

 // Mob Boss T3 Mastery: Untouchable Kingpin (spending Cash grants +4 Shield per $10 spent)
 if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2] && safeAmt > 0) {
 const prevBuckets = Math.floor((gameState.cashSpentAccumulator || 0) / 10);
 gameState.cashSpentAccumulator = (gameState.cashSpentAccumulator || 0) + safeAmt;
 const newBuckets = Math.floor(gameState.cashSpentAccumulator / 10);
 const earnedBuckets = newBuckets - prevBuckets;
 if (earnedBuckets > 0) {
 const shieldBonus = earnedBuckets * 4;
 addPlayerShield(shieldBonus, x, y);
 if (x !== undefined && y !== undefined) {
 spawnShockwave(x, y, 62, 0xeab308, 3, 20);
 spawnFloatingText(x, y - 48, `👑 UNTOUCHABLE KINGPIN: +${shieldBonus} SHIELD!`, '#eab308');
 }
 }
 }
 return true;
}

function hireOrReinforceEnforcer(x, y) {
 if (gameState.enforcers.length < 3) {
 gameState.enforcers.push({ id: Date.now() + Math.random(), hp: 12, maxHp: 12 });
 if (x !== undefined && y !== undefined) {
 spawnShockwave(x + 24, y - 20, 68, 0xeab308, 4, 24);
 spawnCashExplosionVFX(x + 24, y - 20, 0.85);
 spawnFloatingText(x, y - 28, `🎩 ENFORCER #${gameState.enforcers.length} HIRED (12 HP)!`, '#eab308');
 }
 updateAbilityBarLabel();
 } else {
 gameState.enforcers.forEach(e => e.hp = Math.min(e.maxHp || 12, e.hp + 6));
 gainCash(15, x, y, 'CREW FULL → +6 ENFORCER HP & +$15 CASH!', true);
 }
}

function gainMana(amount = 1, x, y, labelOverride) {
 const safeAmt = Math.max(0, Math.round(Number(amount) || 0));
 if (safeAmt <= 0) return;
 if ((gameState.player.maxMana || 0) < 5) {
 gameState.player.maxMana = 5;
 }
 gameState.player.mana = Math.min(gameState.player.maxMana, (gameState.player.mana || 0) + safeAmt);
 if (x !== undefined && y !== undefined) {
 spawnFloatingText(x, y - 24, labelOverride || `+${safeAmt} MANA`, '#c084fc');
 }
}

function gainChronos(amount = 1, x, y, labelOverride) {
 const prev = gameState.chronos;
 gameState.chronos = Math.min(gameState.maxChronos, gameState.chronos + amount);
 const gained = gameState.chronos - prev;
 if (gained > 0 && x !== undefined && y !== undefined) {
 spawnShockwave(x, y, 54, 0x2dd4bf, 3, 20);
 spawnFloatingText(x, y - 34, labelOverride || `+${gained} CHRONOS (${gameState.chronos}/${gameState.maxChronos})`, '#2dd4bf');
 }
}

function gainParts(amount = 1, x, y, labelOverride) {
 const prev = gameState.parts;
 gameState.parts = Math.min(gameState.maxParts, gameState.parts + amount);
 const gained = gameState.parts - prev;
 if (gained > 0 && x !== undefined && y !== undefined) {
 spawnParticles(x, y, 10, { colors: [0xf59e0b, 0xfef08a], speed: 2.8, shape: 'shard', life: 20 });
 spawnFloatingText(x, y - 34, labelOverride || `+${gained} PART${gained > 1 ? 'S' : ''} (${gameState.parts}/${gameState.maxParts})`, '#f59e0b');
 }
}

function deployOrRefundArtificerTurret(x, y) {
 if (gameState.turrets.length < 3) {
 gameState.turrets.push({ id: Date.now() + Math.random(), hp: 10, maxHp: 10 });
 if (x !== undefined && y !== undefined) {
 spawnShockwave(x + 20, y - 24, 65, 0xf59e0b, 4, 24);
 spawnParticles(x + 20, y - 24, 16, { colors: [0xf59e0b, 0x38bdf8, 0xfef08a], speed: 3.4, shape: 'shard', life: 24 });
 spawnFloatingText(x, y - 28, `AUTO-TURRET #${gameState.turrets.length} DEPLOYED (10 HP)!`, '#f59e0b');
 }
 updateAbilityBarLabel();
 } else {
 gainParts(2, x, y, 'MAX TURRETS → +2 SCRAP PARTS!');
 }
}

function addPlayerShield(amount, x, y) {
 const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
 if (safeAmount <= 0) return;

 if (gameState.classType === 'Blood Reaver') {
 const hasT1 = getClassUnlockedArray('Blood Reaver')[0];
 if (hasT1) {
 const overhealCap = gameState.player.maxHp + 25;
 const prevHp = gameState.player.hp;
 gameState.player.hp = Math.min(overhealCap, Math.max(prevHp, prevHp + safeAmount));
 const actualGain = gameState.player.hp - prevHp;
 if (actualGain > 0 && x !== undefined && y !== undefined) {
 spawnParticles(x, y, 12, { colors: [0xfb7185, 0xdc2626], speed: 2.4, vyBias: -1.6, shape: 'plus', life: 24 });
 spawnFloatingText(x, y - 34, `SANGUINE OVERHEAL +${actualGain} HP`, '#fb7185');
 }
 } else if (x !== undefined && y !== undefined) {
 spawnFloatingText(x, y - 34, 'BLOOD REAVER CANNOT GAIN SHIELD', '#fb7185');
 }
 return;
 }
 gameState.player.shield = (Number(gameState.player.shield) || 0) + safeAmount;
}

function applyDefenseCard(cardDef, srcPos, tgtPos, echoScale = 1.0, isEchoCast = false) {
 const baseVal = Number(cardDef.value) || 0;
 const chronosBonus = cardDef.id === 'stasis_bubble' ? Math.min(12, (Number(gameState.chronos) || 0) * 4) : 0;
 const rawGain = Math.round((baseVal + chronosBonus) * echoScale);
 const shieldGain = Math.max(1, rawGain);

 if (cardDef.id === 'fortify') {
 const currentShield = Number(gameState.player.shield) || 0;
 if (currentShield > 0) {
 const doubledBonus = Math.max(0, Math.min(60, currentShield * 2) - currentShield);
 addPlayerShield(doubledBonus + shieldGain, srcPos.x, srcPos.y);
 } else {
 addPlayerShield(shieldGain, srcPos.x, srcPos.y);
 }
 } else {
 addPlayerShield(shieldGain, srcPos.x, srcPos.y);
 }

 try {
 playCardVFX(cardDef.id, srcPos, tgtPos);
 } catch (vfxErr) {
 console.warn('Defense VFX warning:', vfxErr);
 }

 if (gameState.classType !== 'Blood Reaver') {
 const scaledChronosBonus = Math.round(chronosBonus * echoScale);
 const label = scaledChronosBonus > 0
 ? `${isEchoCast ? 'ECHO ' : ''}+${shieldGain} SHIELD (+${scaledChronosBonus} CHRONOS)`
 : `${isEchoCast ? 'ECHO ' : ''}+${shieldGain} SHIELD`;
 spawnFloatingText(srcPos.x, srcPos.y - 20, label, scaledChronosBonus > 0 ? '#2dd4bf' : '#38bdf8');
 }
}

function healPlayerHp(amount, x, y, customLabel) {
 if (amount <= 0) return;
 const prevHp = gameState.player.hp;
 const targetCap = Math.max(gameState.player.maxHp, prevHp);
 gameState.player.hp = Math.min(targetCap, prevHp + amount);
 const healed = gameState.player.hp - prevHp;
 if (healed > 0 && x !== undefined && y !== undefined) {
 spawnParticles(x, y, 12, { colors: [0x4ade80, 0xfb7185], speed: 2.2, vyBias: -1.8, shape: 'plus', life: 24 });
 spawnFloatingText(x, y - 32, customLabel || `+${healed} HP`, '#4ade80');
 }
}

function spendPlayerHp(amount, x, y) {
 if (amount <= 0) return false;
 if (gameState.player.hp <= amount) return false;
 gameState.player.hp -= amount;
 if (gameState.classType === 'Blood Reaver') {
 gameState.spentHpThisTurn = true;
 }
 if (x !== undefined && y !== undefined) {
 spawnParticles(x, y, 12, { colors: [0xdc2626, 0xfb7185], speed: 3.0, life: 22 });
 spawnFloatingText(x, y - 22, `-${amount} BLOOD HP`, '#fb7185');
 }
 return true;
}

function getEffectiveCritChance() {
 const blackFlashBonus = (gameState.passives.BLACK_FLASH || 0) * 0.05;
 let extra = gameState.nextHitCritBonus || 0;
 if (gameState.classType === 'Blood Reaver' && getClassUnlockedArray('Blood Reaver')[0] && gameState.spentHpThisTurn) {
 extra += 0.10;
 }
 return Math.min(1.0, (gameState.player.critChance || 0) + blackFlashBonus + extra);
}

function getEffectiveDodgeChance() {
 if ((gameState.guaranteedDodgeCount || 0) > 0) return 1.0;
 const shadowWeaveBonus = (gameState.passives.SHADOW_WEAVE || 0) * 0.05;
 let baseDodge = gameState.player.dodgeChance || 0;
 if (gameState.classType === 'Rogue' && getClassUnlockedArray('Rogue')[0]) {
 baseDodge = Math.max(0.20, baseDodge);
 }
 let chronosBonus = 0;
 if (gameState.classType === 'Chronomancer') {
 chronosBonus = (gameState.chronos || 0) * 0.10;
 }
 return Math.min(0.95, baseDodge + shadowWeaveBonus + chronosBonus);
}

function triggerRogueShadowCounter(x, y, customLabel = 'DODGE → 100% CRIT PRIMED!') {
 if (gameState.classType === 'Rogue' && getClassUnlockedArray('Rogue')[0]) {
 gameState.guaranteedCritNextAttack = true;
 spawnRedBlackLightning(x - 32, y + 26, x + 32, y - 30, { segments: 6, jitter: 18, thickness: 0.9, forks: 2, life: 20 });
 spawnShockwave(x, y, 64, 0xff1e42, 3, 20);
 spawnFloatingText(x, y - 24, customLabel, '#4ade80');
 return true;
 }
 return false;
}

function triggerHemorrhageOnEnemy(enemy, eSprite, hits = 1, consumeHitStack = false) {
 if (!enemy || enemy.hp <= 0 || (enemy.hemorrhage || 0) <= 0) return 0;
 const totalBleedDmg = enemy.hemorrhage * 2 * hits;
 enemy.hp = Math.max(0, enemy.hp - totalBleedDmg);
 if (consumeHitStack) {
 enemy.hemorrhage = Math.max(0, enemy.hemorrhage - 1);
 }
 if (eSprite) {
 spawnParticles(eSprite.x, eSprite.y, 12 * hits, { colors: [0xdc2626, 0xfb7185, 0x991b1b], speed: 4.0, life: 22 });
 spawnFloatingText(eSprite.x, eSprite.y - 38, `🩸 -${totalBleedDmg} HEMORRHAGE (${enemy.hemorrhage} LEFT)`, '#fb7185');
 }
 return totalBleedDmg;
}
