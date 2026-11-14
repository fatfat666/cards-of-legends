// --- GLOBAL STATE & PERSISTENT MASTERY SYSTEM (v0.8.0) ---
const ADMIN_PASSCODE = 'fatfat666';

const DEFAULT_MASTERY_DATA = {
  Mage: { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] },
  Warrior: { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] },
  Rogue: { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] },
  Chronomancer: { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] },
  Artificer: { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] },
  'Blood Reaver': { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] },
  'Mob Boss': { kills: 0, runsCompleted: 0, unlocked: [true, false, false, false] }
};

let masteryData = loadMasteryData();

function loadMasteryData() {
  try {
    const raw = localStorage.getItem('rogue_board_mastery');
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_MASTERY_DATA));
    const parsed = JSON.parse(raw);
    const merged = JSON.parse(JSON.stringify(DEFAULT_MASTERY_DATA));
    for (const cls of Object.keys(merged)) {
      if (parsed[cls]) {
        merged[cls].kills = Number(parsed[cls].kills) || 0;
        merged[cls].runsCompleted = Number(parsed[cls].runsCompleted) || 0;
        if (Array.isArray(parsed[cls].unlocked)) {
          merged[cls].unlocked = [
            true,
            Boolean(parsed[cls].unlocked[1]),
            Boolean(parsed[cls].unlocked[2]),
            Boolean(parsed[cls].unlocked[3])
          ];
        }
      }
    }
    return merged;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_MASTERY_DATA));
  }
}

function saveMasteryData() {
  try {
    localStorage.setItem('rogue_board_mastery', JSON.stringify(masteryData));
  } catch (e) {}
}

function getClassUnlockedArray(classType) {
  return (masteryData[classType] && masteryData[classType].unlocked) || [true, false, false, false];
}

function checkMasteryUnlocks(classType) {
  const m = masteryData[classType];
  const defs = MASTERY_DEFINITIONS[classType];
  if (!m || !defs) return;
  let newlyUnlocked = false;
  for (let i = 1; i < defs.length; i++) {
    if (!m.unlocked[i]) {
      const val = defs[i].isRun ? m.runsCompleted : m.kills;
      if (val >= defs[i].reqVal) {
        m.unlocked[i] = true;
        newlyUnlocked = true;
        if (typeof showToast === 'function') {
          showToast(`🏆 MASTERY UNLOCKED: ${defs[i].title}!`, 'success');
        }
      }
    }
  }
  if (newlyUnlocked) saveMasteryData();
}

const gameState = {
  screen: 'MAIN',
  classType: 'Mage',
  stage: 1, // 1 = Neon Underworld, 2 = Astral Nexus
  boardNode: 1,
  maxNodes: 5,
  nodeRevealed: false,
  nodeOutcome: null,
  gold: 50,
  syndicateCash: 0,
  notoriety: 0,
  blackMarketStock: [],
  blackMarketRestocks: 0,
  blackMarketRestockDiscount: 0,
  runDebuffs: [],
  relics: {
    BLACK_FLASH: 0,
    TIME_WARP: 0,
    DEFLECTION: 0,
    SHADOW_WEAVE: 0,
    FRENZY: 0,
    IGNITION: 0,
    CHRONO_HOURGLASS: 0,
    AEGIS_OVERCHARGER: 0,
    SYNDICATE_SIGNET: 0
  },
  deck: [],
  drawPileAction: [],
  drawPileTome: [],
  hand: [],
  sequence: [null, null, null],
  vault: [],
  maxVaultSlots: 1,
  scrapLimit: 1,
  bonusScrapLimitThisTurn: 0,
  scrappedThisTurn: 0,
  totalScrappedThisBattle: 0,
  nextScrapBonusEnergy: 0,
  isRestTurn: false,
  nextTurnRestBonus: false,
  nextTurnBonusEnergy: 0,
  nextTurnBonusMana: 0,
  manaSpentThisTurn: 0,
  cardsPlayedThisTurn: 0,
  tomesPlayedThisBattle: 0,
  playedCardsHistory: [],
  battleTurnCount: 1,
  warriorNoHpLossTurns: 0,
  tookHpDamageThisTurn: false,
  shieldDecayLocked: false,
  prismaticActive: false,
  spellweaverEchoActive: false,
  miragePoisonRetaliate: 0,
  thornsDmgThisTurn: 0,
  guaranteedDodges: 0,
  shadowCritPrimed: false,
  tempCritBonus: 0,
  nextAttackBonusDmg: 0,
  nextAttackForceCrit: false,
  nextAttackBleed: 0,
  nextAttackLifesteal: 0,
  enemyAtkDebuff: 0,
  bountyTargetId: null,
  reactiveArmorActive: false,
  turrets: [], // Array of { id, type, name, hp, maxHp }
  mobEnforcers: [],
  warriorRevived: false,
  isExecuting: false,
  combatOver: false,
  isBuilderUnlocked: false,
  builderFilter: 'ALL',
  player: {
    hp: 60,
    maxHp: 60,
    shield: 0,
    energy: 3,
    maxEnergy: 3,
    mana: 0,
    maxMana: 5,
    chronos: 0,
    maxChronos: 3,
    parts: 0,
    maxParts: 6,
    critChance: 0.05,
    dodgeChance: 0.05
  },
  enemies: []
};

function getMaxDeckSize() {
  return gameState.stage >= 2 ? 26 : 20;
}

function getMaxTurrets() {
  if (gameState.classType === 'Artificer' && getClassUnlockedArray('Artificer')[3]) {
    return 4;
  }
  return 3;
}

function getBloodReaverOverhealCap() {
  if (gameState.classType !== 'Blood Reaver') return 0;
  return getClassUnlockedArray('Blood Reaver')[3] ? 50 : 25;
}

function resetGameState(classType) {
  gameState.classType = classType;
  gameState.stage = 1;
  gameState.boardNode = 1;
  gameState.maxNodes = 5;
  gameState.nodeRevealed = false;
  gameState.nodeOutcome = null;
  gameState.gold = 50;
  gameState.syndicateCash = 0;
  gameState.notoriety = 0;
  gameState.blackMarketStock = [];
  gameState.blackMarketRestocks = 0;
  gameState.blackMarketRestockDiscount = 0;
  gameState.runDebuffs = [];

  for (const k of Object.keys(gameState.relics)) gameState.relics[k] = 0;

  gameState.maxVaultSlots = ['Mage', 'Warrior', 'Chronomancer', 'Mob Boss'].includes(classType) ? 2 : 1;
  gameState.scrapLimit = classType === 'Artificer' ? 2 : 1;
  gameState.bonusScrapLimitThisTurn = 0;
  gameState.scrappedThisTurn = 0;
  gameState.totalScrappedThisBattle = 0;
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

  const unlocked = getClassUnlockedArray(classType);

  if (classType === 'Mage') {
    const bonusMaxMana = unlocked[1] ? 2 : 0; // T2: Mana Overflow (+2 Base Max Mana)
    gameState.player = {
      hp: 55, maxHp: 55, shield: 0, energy: 3, maxEnergy: 3,
      mana: 3, maxMana: 5 + bonusMaxMana, chronos: 0, maxChronos: 3,
      parts: 0, maxParts: 6, critChance: 0.0, dodgeChance: 0.05
    };
    gameState.deck = ['arcane_strike', 'arcane_strike', 'barrier', 'barrier', 'spark', 'spark', 'arcane_battery', 'chrono_echo'];
  } else if (classType === 'Warrior') {
    const bonusHp = unlocked[0] ? 20 : 0; // T1: Heavy Iron (+20 Max HP & +5 Starting Shield)
    const bonusShield = unlocked[0] ? 5 : 0;
    gameState.player = {
      hp: 90 + bonusHp, maxHp: 90 + bonusHp, shield: 15 + bonusShield, energy: 3, maxEnergy: 3,
      mana: 0, maxMana: 0, chronos: 0, maxChronos: 3,
      parts: 0, maxParts: 6, critChance: 0.05, dodgeChance: 0.02
    };
    gameState.deck = ['heavy_slash', 'heavy_slash', 'iron_defense', 'iron_defense', 'restoration', 'bastion_scrap', 'fortify', 'patience_fury'];
  } else if (classType === 'Rogue') {
    const bonusEnergy = unlocked[1] ? 1 : 0; // T2: Assassin Mastery (+1 Max Energy)
    gameState.player = {
      hp: 70, maxHp: 70, shield: 0, energy: 3 + bonusEnergy, maxEnergy: 3 + bonusEnergy,
      mana: 0, maxMana: 0, chronos: 0, maxChronos: 3,
      parts: 0, maxParts: 6, critChance: 0.15, dodgeChance: 0.20
    };
    gameState.deck = ['quick_dagger', 'quick_dagger', 'smoke_screen', 'toxic_needle', 'toxic_needle', 'vial_stash', 'venom_spreader', 'shadow_prep'];
  } else if (classType === 'Chronomancer') {
    const maxChronos = unlocked[3] ? 4 : 3; // T4: Lord of Eternity (Max Chronos 4)
    gameState.player = {
      hp: 70, maxHp: 70, shield: 5, energy: 3, maxEnergy: 3,
      mana: 0, maxMana: 0, chronos: 1, maxChronos,
      parts: 0, maxParts: 6, critChance: 0.10, dodgeChance: 0.10
    };
    gameState.deck = ['chrono_slash', 'chrono_slash', 'stasis_bubble', 'stasis_bubble', 'rift_strike', 'rift_strike', 'stasis_surge', 'deja_vu'];
  } else if (classType === 'Artificer') {
    gameState.player = {
      hp: 75, maxHp: 75, shield: 10, energy: 3, maxEnergy: 3,
      mana: 0, maxMana: 0, chronos: 0, maxChronos: 3,
      parts: 2, maxParts: 6, critChance: 0.10, dodgeChance: 0.05
    };
    gameState.deck = ['wrench_toss', 'wrench_toss', 'reinforced_plating', 'reinforced_plating', 'capacitor_discharge', 'overclock_blueprint', 'auto_turret_drone', 'scrap_salvage'];
  } else if (classType === 'Blood Reaver') {
    gameState.player = {
      hp: 115, maxHp: 115, shield: 0, energy: 2, maxEnergy: 2,
      mana: 0, maxMana: 0, chronos: 0, maxChronos: 3,
      parts: 0, maxParts: 6, critChance: 0.15, dodgeChance: 0.05
    };
    gameState.deck = ['siphon_slash', 'siphon_slash', 'serrated_cleave', 'serrated_cleave', 'blood_boil', 'flurry_of_fangs', 'coagulate', 'blood_suck'];
  } else if (classType === 'Mob Boss') {
    gameState.syndicateCash = 45;
    gameState.notoriety = 15; // Rank II (15 ★) unlocked by T1/T4 Syndicate Boss
    gameState.player = {
      hp: 80, maxHp: 80, shield: 10, energy: 3, maxEnergy: 3,
      mana: 0, maxMana: 0, chronos: 0, maxChronos: 3,
      parts: 0, maxParts: 6, critChance: 0.10, dodgeChance: 0.10
    };
    gameState.deck = ['tommy_gun_spray', 'tommy_gun_spray', 'protection_racket', 'protection_racket', 'shakedown', 'money_laundering', 'syndicate_ledger', 'black_market_voucher'];
    generateBlackMarketStock();
  }
}

// --- BLACK MARKET & SYNDICATE NOTORIETY HELPERS (MOB BOSS EXCLUSIVE) ---
function getNotorietyRankInfo(notoriety = gameState.notoriety) {
  if (notoriety >= 75) {
    return { rank: 5, title: 'RANK V • KINGPIN', unlockedSlots: 6, maxTier: 5, discount: 0.15, nextThreshold: null };
  }
  if (notoriety >= 50) {
    return { rank: 4, title: 'RANK IV • UNDERBOSS', unlockedSlots: 6, maxTier: 4, discount: 0.0, nextThreshold: 75 };
  }
  if (notoriety >= 30) {
    return { rank: 3, title: 'RANK III • CAPO ENFORCER', unlockedSlots: 5, maxTier: 3, discount: 0.0, nextThreshold: 50 };
  }
  if (notoriety >= 15) {
    return { rank: 2, title: 'RANK II • MADE ASSOCIATE', unlockedSlots: 4, maxTier: 2, discount: 0.0, nextThreshold: 30 };
  }
  return { rank: 1, title: 'RANK I • STREET ROOKIE', unlockedSlots: 3, maxTier: 1, discount: 0.0, nextThreshold: 15 };
}

function getBlackMarketCardPrice(cardDef) {
  if (!cardDef) return 20;
  let price = cardDef.basePrice || 20;
  const rankInfo = getNotorietyRankInfo();
  if (rankInfo.discount > 0) price *= (1 - rankInfo.discount);
  if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2]) {
    price *= 0.75; // T3 Untouchable Kingpin: -25% Black Market prices
  }
  if ((gameState.relics.SYNDICATE_SIGNET || 0) >= 3) {
    price *= 0.85; // Syndicate Signet Tier 3: 15% discount
  }
  return Math.max(5, Math.round(price));
}

function getBlackMarketRestockCost() {
  let base = Math.max(5, 15 + (gameState.blackMarketRestocks * 5) - (gameState.blackMarketRestockDiscount || 0));
  if ((gameState.relics.SYNDICATE_SIGNET || 0) >= 3) {
    base = Math.max(5, Math.round(base * 0.85));
  }
  return base;
}

function generateBlackMarketStock() {
  const allContraband = Object.values(CARD_DATABASE).filter(c => c.isContraband);
  const rankInfo = getNotorietyRankInfo();
  const eligible = allContraband.filter(c => (c.contrabandTier || 1) <= rankInfo.maxTier);
  const stock = [];
  for (let i = 0; i < 6; i++) {
    const slotLocked = i >= rankInfo.unlockedSlots;
    const pool = slotLocked ? allContraband : (eligible.length > 0 ? eligible : allContraband);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    stock.push({
      slotIndex: i,
      cardId: pick.id,
      sold: false,
      locked: slotLocked,
      reqRank: i === 3 ? 'Rank II (15★)' : (i === 4 ? 'Rank III (30★)' : (i === 5 ? 'Rank IV (50★)' : ''))
    });
  }
  gameState.blackMarketStock = stock;
}

function gainSyndicateCash(amount, sourceX, sourceY) {
  if (amount <= 0) return;
  gameState.syndicateCash += amount;
  if (typeof spawnFloatingText === 'function' && sourceX !== undefined) {
    spawnFloatingText(`+$${amount}`, sourceX, sourceY, '#eab308');
  }
  if (typeof spawnCashParticles === 'function' && sourceX !== undefined) {
    spawnCashParticles(sourceX, sourceY, Math.min(18, Math.max(6, Math.floor(amount / 2))), false);
  }
}

function spendSyndicateCash(amount) {
  if (gameState.syndicateCash < amount) return false;
  gameState.syndicateCash -= amount;
  if (gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2]) {
    const shieldGain = Math.floor(amount / 10) * 4;
    if (shieldGain > 0 && gameState.screen === 'BATTLE') {
      addPlayerShield(shieldGain);
      if (typeof showToast === 'function') {
        showToast(`👑 KINGPIN ARMOR: +${shieldGain} Shield from $${amount} spent!`, 'success');
      }
    }
  }
  return true;
}

function gainNotoriety(amount) {
  if (amount <= 0) return;
  const prevRank = getNotorietyRankInfo(gameState.notoriety).rank;
  gameState.notoriety += amount;
  const newRankInfo = getNotorietyRankInfo(gameState.notoriety);
  if (newRankInfo.rank > prevRank) {
    generateBlackMarketStock();
    if (typeof showToast === 'function') {
      showToast(`⭐ NOTORIETY RANK UP: ${newRankInfo.title}! Black Market upgraded!`, 'success');
    }
  }
}

// --- COMBAT RESOURCE & SUMMON HELPERS ---
function addPlayerShield(amount) {
  if (amount <= 0) return;
  let finalAmount = amount;
  // Warrior T2 Mastery: Turtle Momentum (2 turns no HP loss -> 1.5x Shield)
  if (gameState.classType === 'Warrior' && getClassUnlockedArray('Warrior')[1] && gameState.warriorNoHpLossTurns >= 2) {
    finalAmount = Math.round(finalAmount * 1.5);
  }

  if (gameState.classType === 'Blood Reaver') {
    const overhealCap = getBloodReaverOverhealCap();
    const maxAllowedHp = gameState.player.maxHp + overhealCap;
    const prevHp = gameState.player.hp;
    gameState.player.hp = Math.min(maxAllowedHp, gameState.player.hp + finalAmount);
    const gained = gameState.player.hp - prevHp;
    if (gained > 0 && typeof spawnFloatingText === 'function' && typeof playerContainer !== 'undefined') {
      spawnFloatingText(`+${gained} OVERHEAL`, playerContainer.x, playerContainer.y - 45, '#fb7185');
    }
  } else {
    gameState.player.shield += finalAmount;
    // Warrior T4 Mastery: Colossus Unbreakable (gaining Shield deals 35% of gained Shield as AoE shockwave DMG)
    if (gameState.classType === 'Warrior' && getClassUnlockedArray('Warrior')[3] && gameState.screen === 'BATTLE') {
      const shockwaveDmg = Math.max(1, Math.round(finalAmount * 0.35));
      if (typeof dealWarriorColossusShockwave === 'function') {
        dealWarriorColossusShockwave(shockwaveDmg);
      }
    }
  }
}

function spendPlayerHp(amount) {
  if (amount <= 0) return;
  gameState.player.hp = Math.max(1, gameState.player.hp - amount);
  gameState.tookHpDamageThisTurn = true;
  if (gameState.classType === 'Blood Reaver') {
    gameState.tempCritBonus = Math.min(1.0, (gameState.tempCritBonus || 0) + 0.10);
    // Blood Reaver T4 Mastery: Crimson Apotheosis (spending HP deals equal bonus Hemorrhage stacks to all enemies)
    if (getClassUnlockedArray('Blood Reaver')[3] && Array.isArray(gameState.enemies)) {
      gameState.enemies.forEach(e => {
        if (e.hp > 0) {
          e.hemorrhage = (e.hemorrhage || 0) + amount;
          if (typeof spawnFloatingText === 'function' && e.container) {
            spawnFloatingText(`+${amount} BLEED`, e.container.x, e.container.y - 40, '#e11d48');
          }
        }
      });
    }
  }
}

function gainChronos(amount) {
  const maxC = gameState.player.maxChronos || 3;
  gameState.player.chronos = Math.min(maxC, (gameState.player.chronos || 0) + amount);
}

function gainScrapParts(amount) {
  const maxP = gameState.player.maxParts || 6;
  gameState.player.parts = Math.min(maxP, (gameState.player.parts || 0) + amount);
}

function deployArtificerConstruct(constructType = 'auto_turret', customHp = null) {
  const maxBays = getMaxTurrets();
  const spec = CONSTRUCT_CATALOG[constructType] || CONSTRUCT_CATALOG.auto_turret;
  const hpVal = customHp !== null ? customHp : spec.defaultHp;

  if (gameState.turrets.length >= maxBays) {
    // Reinforce lowest HP construct and refund +2 Parts
    let lowest = gameState.turrets[0];
    for (const t of gameState.turrets) {
      if (t.hp < lowest.hp) lowest = t;
    }
    lowest.hp = Math.min(lowest.maxHp, lowest.hp + 6);
    gainScrapParts(2);
    if (typeof showToast === 'function') {
      showToast(`Bay Full (${maxBays}/${maxBays})! Repaired ${lowest.name} (+6 HP) & +2 Parts!`, 'warning');
    }
    return false;
  }

  gameState.turrets.push({
    id: 'construct_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type: spec.type,
    name: spec.name,
    hp: hpVal,
    maxHp: hpVal
  });
  return true;
}

// Backward-compatible alias
function deployArtificerTurret(customHp = null) {
  return deployArtificerConstruct('auto_turret', customHp);
}

function summonMobEnforcer(customHp = null) {
  const isT4 = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[3];
  const baseHp = (customHp !== null ? customHp : 12) + (isT4 ? 6 : 0);

  if (gameState.mobEnforcers.length >= 3) {
    let lowest = gameState.mobEnforcers[0];
    for (const e of gameState.mobEnforcers) {
      if (e.hp < lowest.hp) lowest = e;
    }
    lowest.hp = Math.min(lowest.maxHp, lowest.hp + 6);
    gainSyndicateCash(10);
    if (typeof showToast === 'function') showToast('Crew Full (3/3)! Reinforced Enforcer & +$10 Cash!', 'warning');
    return false;
  }
  gameState.mobEnforcers.push({
    id: 'enforcer_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    hp: baseHp,
    maxHp: baseHp
  });
  return true;
}
