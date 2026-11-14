// --- NON-BLOCKING TOAST & UTILITY HELPERS ---
let toastTimer = null;
function showToast(message, borderColor = 'var(--accent-cyan)') {
 const toast = document.getElementById('game-toast');
 if (!toast) return;
 toast.innerText = message;
 toast.style.borderColor = borderColor;
 toast.classList.add('visible');
 if (toastTimer) clearTimeout(toastTimer);
 toastTimer = setTimeout(() => {
 toast.classList.remove('visible');
 }, 2600);
}

window.toggleSpeed = function() {
 if (gameState.speedLabel === '1x') {
 gameState.speedLabel = '2x';
 gameState.speedMultiplier = 0.5;
 } else {
 gameState.speedLabel = '1x';
 gameState.speedMultiplier = 1.0;
 }
 const sp = document.getElementById('ui-speed');
 if (sp) sp.innerText = gameState.speedLabel;
 showToast(`Combat Animation Speed: ${gameState.speedLabel}`, 'var(--accent-gold)');
};

window.leaveShop = function() {
 advanceNodeProgress();
};



window.showScreen = function(screenId) {
 document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
 const target = document.getElementById(screenId);
 if (target) target.classList.add('active');
 if (screenId === 'screen-class') {
 saveMasteryProgress();
 window.selectClass(window.gameState.classType || 'Rogue');
 renderMasteryTrees();
 }
 if (screenId === 'screen-board') {
 renderBoard();
 }
};

window.selectClass = function(className) {
 if (!window.gameState) return;
 window.resetGameState(className, false);
 document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
 const slug = className.toLowerCase().replace(/\s+/g, '-');
 const targetCard = document.getElementById(`card-${slug}`);
 if (targetCard) targetCard.classList.add('selected');
};

window.openDeckInfo = function(tabName) {
 const requestedTab = tabName || 'cards';
 if (requestedTab === 'builder' && !window.isDeckBuilderUnlocked) {
 window.openAdminLockModal();
 return;
 }
 const modal = document.getElementById('modal-deck');
 if (modal) {
 modal.classList.add('active');
 if (typeof window.switchIndexTab === 'function') {
 window.switchIndexTab(requestedTab);
 }
 }
};

window.closeDeckInfo = function() {
 const modal = document.getElementById('modal-deck');
 if (modal) modal.classList.remove('active');
};

window.confirmClassAndStart = function() {
 window.resetGameState(window.gameState.classType, window.isDeckBuilderUnlocked);
 window.showScreen('screen-board');
};

window.previewCustomDeckInBattle = function() {
 if (!window.isDeckBuilderUnlocked) {
 window.openAdminLockModal();
 return;
 }
 if (!gameState.deck || gameState.deck.length < 5) {
 showToast('Add at least 5 cards to your deck before previewing in combat!', 'var(--accent-red)');
 return;
 }
 window.closeDeckInfo();
 const savedDeck = [...gameState.deck];
 window.resetGameState(gameState.classType, false);
 gameState.deck = savedDeck;
 gameState.pendingNodeType = 'SINGLE COMBAT';
 startBattleAtNode();
 showToast(`Testing custom ${gameState.classType} deck (${gameState.deck.length} cards) in PixiJS Arena!`, 'var(--accent-purple)');
};

// --- UNDERGROUND BLACK MARKET MODAL CONTROLLER ---
window.openBlackMarketModal = function() {
 syncBlackMarketUnlockedSlots();
 renderBlackMarketModal();
 const modal = document.getElementById('modal-black-market');
 if (modal) modal.classList.add('active');
};

window.closeBlackMarketModal = function() {
 const modal = document.getElementById('modal-black-market');
 if (modal) modal.classList.remove('active');
 renderUI();
 renderBoard();
};

window.restockBlackMarket = function() {
 const cost = getBlackMarketRestockCost();
 if ((gameState.cash || 0) < cost) {
 showToast(`Not enough Cash to restock! Requires $${cost} Cash.`, 'var(--accent-mob)');
 return;
 }
 spendCash(cost);
 generateBlackMarketStock();
 renderBlackMarketModal();
 renderUI();
 renderBoard();
 showToast(`🔄 Dealer stock refreshed for $${cost} Cash!`, 'var(--accent-mob)');
};

window.buyBlackMarketCard = function(slotIdx) {
 const slot = gameState.blackMarketStock && gameState.blackMarketStock[slotIdx];
 if (!slot || !slot.cardId || slot.sold) return;
 const cardDef = CARD_DATABASE[slot.cardId];
 if (!cardDef) return;

 if (gameState.deck.length >= 24) {
 showToast('Deck cap reached (24/24 cards)!', 'var(--accent-red)');
 return;
 }

 const price = getBlackMarketCardPrice(cardDef);
 if ((gameState.cash || 0) < price) {
 showToast(`Not enough Cash! Requires $${price} Cash.`, 'var(--accent-mob)');
 return;
 }

 const inCombat = document.getElementById('screen-battle')?.classList.contains('active');
 const px = playerSprite ? playerSprite.x : 200;
 const py = playerSprite ? playerSprite.y : 138;

 spendCash(price, inCombat ? px : undefined, inCombat ? py : undefined);
 slot.sold = true;
 gameState.deck.push(cardDef.id);

 if (inCombat) {
 gameState.hand.push({
 instanceId: Math.random().toString(36).substring(7),
 id: cardDef.id,
 isNew: true,
 turnsInVault: 0,
 wasUnvaultedThisTurn: false
 });
 spawnCashExplosionVFX(px, py, 1.0);
 spawnFloatingText(px, py - 24, `🎩 ACQUIRED [${cardDef.name.toUpperCase()}]!`, '#eab308');
 showToast(`Acquired ${cardDef.name} (-$${price}) — added to Deck & Hand!`, 'var(--accent-mob)');
 } else {
 showToast(`Acquired ${cardDef.name} (-$${price}) — added permanently to Deck!`, 'var(--accent-mob)');
 }

 renderBlackMarketModal();
 renderUI();
 renderBoard();
};

function renderBlackMarketModal() {
 const info = getNotorietyInfo(gameState.notoriety || 0);
 const rankBadge = document.getElementById('bm-rank-badge');
 const cashDisplay = document.getElementById('bm-cash-display');
 const discountTag = document.getElementById('bm-discount-tag');
 const notorietyScore = document.getElementById('bm-notoriety-score');
 const nextUnlockText = document.getElementById('bm-next-unlock-text');
 const notorietyBar = document.getElementById('bm-notoriety-bar');
 const slotsUnlockedText = document.getElementById('bm-slots-unlocked-text');
 const tierAccessText = document.getElementById('bm-tier-access-text');
 const restockBtn = document.getElementById('btn-bm-restock');
 const grid = document.getElementById('bm-dealer-grid');

 if (rankBadge) rankBadge.innerText = info.rankName;
 if (cashDisplay) cashDisplay.innerText = `$${gameState.cash || 0}`;

 const hasMobT3 = gameState.classType === 'Mob Boss' && getClassUnlockedArray('Mob Boss')[2];
 const discounts = [];
 if (hasMobT3) discounts.push('-25% KINGPIN');
 if (info.discountRatio < 1.0) discounts.push('-15% RANK V');
 if (discountTag) discountTag.innerText = discounts.length > 0 ? `(${discounts.join(' + ')})` : '';

 const n = gameState.notoriety || 0;
 if (notorietyScore) notorietyScore.innerText = `★ ${n} NOTORIETY`;

 if (info.nextThreshold !== null) {
 const span = info.nextThreshold - info.prevThreshold;
 const prog = Math.max(0, Math.min(100, ((n - info.prevThreshold) / span) * 100));
 const nextSlotNum = Math.min(6, info.unlockedSlots + 1);
 if (nextUnlockText) {
 nextUnlockText.innerText = info.unlockedSlots < 6
 ? `SLOT ${nextSlotNum} AT ${info.nextThreshold} ★`
 : `RANK V MYTHIC AT ${info.nextThreshold} ★`;
 }
 if (notorietyBar) notorietyBar.style.width = `${prog}%`;
 } else {
 if (nextUnlockText) nextUnlockText.innerText = 'MAX RANK V UNLOCKED!';
 if (notorietyBar) notorietyBar.style.width = '100%';
 }

 if (slotsUnlockedText) slotsUnlockedText.innerText = `${info.unlockedSlots}/6 UNLOCKED`;
 if (tierAccessText) tierAccessText.innerText = info.tierLabel;

 const restockCost = getBlackMarketRestockCost();
 if (restockBtn) {
 restockBtn.innerText = `🔄 RESTOCK DEALER ($${restockCost})`;
 restockBtn.disabled = (gameState.cash || 0) < restockCost;
 }

 if (!grid) return;
 grid.innerHTML = '';

 const slotUnlockReqs = [0, 0, 0, 15, 30, 50];
 for (let i = 0; i < 6; i++) {
 const reqNotoriety = slotUnlockReqs[i];
 const isUnlocked = i < info.unlockedSlots;
 const slotData = gameState.blackMarketStock && gameState.blackMarketStock[i];

 if (!isUnlocked) {
 const lockedCard = document.createElement('div');
 lockedCard.className = 'bm-slot-card bm-locked';
 lockedCard.innerHTML = `
 <div style="font-size:32px; margin-bottom:6px;">🔒</div>
 <div style="font-family:'Teko'; font-size:22px; color:var(--accent-mob); letter-spacing:1px;">LOCKED DEALER VAULT #${i + 1}</div>
 <div style="font-size:11px; color:#cbd5e1; margin-top:4px;">Requires <strong style="color:#fef08a;">${reqNotoriety} ★ Notoriety</strong></div>
 <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">Win battles or Scrap as Mob Boss to build reputation</div>
 `;
 grid.appendChild(lockedCard);
 continue;
 }

 const cardDef = slotData && slotData.cardId ? CARD_DATABASE[slotData.cardId] : null;
 if (!cardDef) continue;

 const isSold = slotData.sold === true;
 const price = getBlackMarketCardPrice(cardDef);
 const canAfford = (gameState.cash || 0) >= price && !isSold;
 const isMythic = (cardDef.contrabandTier || 1) >= 5;
 const costBadge = cardDef.costType === 'cash' ? `$${cardDef.cost}` : `${cardDef.cost}⚡`;

 const cardEl = document.createElement('div');
 cardEl.className = `bm-slot-card ${isSold ? 'bm-sold' : ''}`;
 cardEl.innerHTML = `
 <div>
 <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
 <span class="bm-tier-badge ${isMythic ? 'tier-mythic' : ''}">TIER ${cardDef.contrabandTier || 1} ${isMythic ? '★ MYTHIC' : 'CONTRABAND'}</span>
 <span style="font-size:10px; font-weight:800; color:var(--accent-cyan); background:rgba(56,189,248,0.14); border:1px solid rgba(56,189,248,0.4); padding:1px 6px; border-radius:4px;">${costBadge} • ${cardDef.type}</span>
 </div>
 <div style="font-family:'Teko'; font-size:24px; color:#fef08a; line-height:1.05; margin-top:7px; letter-spacing:0.5px;">${cardDef.name}</div>
 <div style="font-size:11px; color:#e2e8f0; margin-top:5px; line-height:1.35;">${cardDef.text}</div>
 </div>
 <div>
 <button class="btn-bm-buy" ${!canAfford ? 'disabled' : ''} onclick="window.buyBlackMarketCard(${i})">
 ${isSold ? '✓ SOLD OUT' : `BUY CONTRABAND • $${price}`}
 </button>
 </div>
 `;
 grid.appendChild(cardEl);
 }
}



function renderMasteryTrees() {
 saveMasteryProgress();
 const kills = gameState.masteryProgress.totalEnemiesKilled || 0;
 const runs = gameState.masteryProgress.runsCompleted || 0;
 let totalUnlockedNodes = 0;
 const totalPossibleNodes = Object.keys(MASTERY_DEFINITIONS).length * 3;

 Object.keys(MASTERY_DEFINITIONS).forEach(cls => {
 const slug = cls.toLowerCase().replace(/\s+/g, '-');
 const container = document.getElementById(`${slug}-mastery-tree`);
 if (!container) return;
 container.innerHTML = '';
 const unlockedArr = getClassUnlockedArray(cls);
 const classUnlockedCount = unlockedArr.filter(Boolean).length;
 totalUnlockedNodes += classUnlockedCount;

 const classBadge = document.getElementById(`badge-mastery-${cls}`);
 if (classBadge) {
 classBadge.innerText = `MASTERY ${classUnlockedCount}/3`;
 classBadge.style.borderColor = classUnlockedCount === 3 ? 'var(--accent-gold)' : 'rgba(192, 132, 252, 0.5)';
 classBadge.style.color = classUnlockedCount === 3 ? 'var(--accent-gold)' : 'var(--accent-purple)';
 }

 MASTERY_DEFINITIONS[cls].forEach((m, idx) => {
 const isUnlocked = unlockedArr[idx];
 let progressPct = 100;
 let progressCounter = 'ACTIVE';

 if (!isUnlocked && m.reqVal) {
 const currentVal = m.isRun ? runs : kills;
 progressPct = Math.min(100, Math.round((currentVal / m.reqVal) * 100));
 progressCounter = `${Math.min(currentVal, m.reqVal)}/${m.reqVal}`;
 }

 const node = document.createElement('div');
 node.className = `mastery-node ${isUnlocked ? 'unlocked' : 'locked'}`;
 node.innerHTML = `
 <div class="mastery-header">
 <span class="mastery-title">${m.title}</span>
 <span class="mastery-pill ${isUnlocked ? 'pill-unlocked' : 'pill-locked'}">${isUnlocked ? '✓ UNLOCKED' : progressCounter}</span>
 </div>
 <div class="mastery-effect">${m.effect}</div>
 <div class="mastery-req-row">
 <span>${m.req}</span>
 ${!isUnlocked ? `<span style="color:var(--accent-gold); font-style:normal; font-weight:700;">${progressPct}%</span>` : ''}
 </div>
 ${!isUnlocked ? `<div class="node-mini-track"><div class="node-mini-fill" style="width:${progressPct}%;"></div></div>` : ''}
 `;
 container.appendChild(node);
 });
 });

 const killsText = document.getElementById('mp-kills-text');
 const killsBar = document.getElementById('mp-kills-bar');
 const runsText = document.getElementById('mp-runs-text');
 const runsBar = document.getElementById('mp-runs-bar');
 const nodesText = document.getElementById('mp-nodes-text');
 const nodesBar = document.getElementById('mp-nodes-bar');

 if (killsText) killsText.innerText = `${kills} / 15`;
 if (killsBar) killsBar.style.width = `${Math.min(100, (kills / 15) * 100)}%`;
 if (runsText) runsText.innerText = `${runs} / 3`;
 if (runsBar) runsBar.style.width = `${Math.min(100, (runs / 3) * 100)}%`;
 if (nodesText) nodesText.innerText = `${totalUnlockedNodes} / ${totalPossibleNodes}`;
 if (nodesBar) nodesBar.style.width = `${Math.min(100, (totalUnlockedNodes / totalPossibleNodes) * 100)}%`;
}

function renderBoard() {
 syncBlackMarketUnlockedSlots();
 const info = getNotorietyInfo(gameState.notoriety || 0);
 const boardCash = document.getElementById('board-cash-text');
 const boardNot = document.getElementById('board-notoriety-text');
 const boardGold = document.getElementById('board-gold-text');
 const boardBmBtn = document.getElementById('btn-board-black-market');

 if (boardCash) boardCash.innerText = `$${gameState.cash || 0}`;
 if (boardNot) boardNot.innerText = `${gameState.notoriety || 0} ★ (${info.rankName.split('•')[0].trim()})`;
 if (boardGold) boardGold.innerText = `${gameState.gold}g`;
 if (boardBmBtn) boardBmBtn.innerText = `🎩 BLACK MARKET (${info.unlockedSlots}/6)`;

 const grid = document.getElementById('board-grid');
 if (!grid) return;
 grid.innerHTML = '';
 for (let i = 1; i <= gameState.maxNodes; i++) {
 const tile = document.createElement('div');
 let label = i === gameState.maxNodes ? 'BOSS ENCOUNTER' : `NODE ${i}`;
 tile.className = `board-tile ${i === gameState.boardNode ? 'current' : ''} ${i < gameState.boardNode ? 'completed' : ''} ${i === gameState.maxNodes ? 'boss' : ''}`;
 tile.innerHTML = `<div>${label}</div><div style="font-size:11px; margin-top:4px; color:var(--text-muted);">${i < gameState.boardNode ? 'COMPLETED' : 'SCOUTABLE'}</div>`;
 grid.appendChild(tile);
 }
}

// --- COIN FLIP NODE SCOUTING & POST-BATTLE DRAFTS ---
window.triggerNodeReveal = function() {
 const modal = document.getElementById('modal-coin');
 const animEl = document.getElementById('coin-anim');
 const resEl = document.getElementById('coin-result');
 const btn = document.getElementById('btn-coin-proceed');
 if (!modal) return;

 btn.style.display = 'none';
 resEl.innerText = 'FLIPPING DESTINY COIN...';
 animEl.classList.remove('coin-animating');
 void animEl.offsetWidth;
 animEl.classList.add('coin-animating');
 modal.classList.add('active');

 setTimeout(() => {
 if (gameState.boardNode === gameState.maxNodes) {
 gameState.pendingNodeType = 'BOSS';
 animEl.innerText = '👑';
 resEl.innerText = 'FINAL BOSS: VOID OVERLORD!';
 } else {
 const roll = Math.random();
 if (roll < 0.25 && gameState.boardNode > 1) {
 gameState.pendingNodeType = 'SHOP';
 animEl.innerText = '🛒';
 resEl.innerText = 'NEON BAZAAR SHOP DISCOVERED!';
 } else if (roll < 0.62) {
 gameState.pendingNodeType = 'DUO COMBAT';
 animEl.innerText = '⚔️';
 resEl.innerText = 'AMBUSH: DUO SHADOW GUARDS!';
 } else {
 gameState.pendingNodeType = 'SINGLE COMBAT';
 animEl.innerText = '🗡️';
 resEl.innerText = 'SINGLE COMBAT ENCOUNTER!';
 }
 }
 btn.style.display = 'inline-block';
 }, 950);
};

window.proceedToNode = function() {
 document.getElementById('modal-coin').classList.remove('active');
 if (gameState.pendingNodeType === 'SHOP') {
 document.getElementById('shop-gold-text').innerText = gameState.gold;
 window.showScreen('screen-shop');
 } else {
 startBattleAtNode();
 }
};

// --- UNIFIED SHARED LOOTPOOL VICTORY CARD DRAFT (NO CLASS SWITCH / NO ARCHETYPE FILTER) ---
function triggerCardDraftModal() {
 const modal = document.getElementById('modal-card-draft');
 const container = document.getElementById('card-draft-container');
 if (!modal || !container) return;

 // Every non-contraband card across ALL 7 classes + Neutral is in the same unified loot pool!
 const unifiedPool = Object.keys(CARD_DATABASE).filter(cId => !CARD_DATABASE[cId].isContraband);

 const choices = [];
 const used = new Set();
 while (choices.length < 3 && used.size < unifiedPool.length) {
 const pick = unifiedPool[Math.floor(Math.random() * unifiedPool.length)];
 if (!used.has(pick)) {
 used.add(pick);
 choices.push(pick);
 }
 }

 container.innerHTML = '';
 choices.forEach(cId => {
 const cDef = CARD_DATABASE[cId];
 const costLabel = cDef.costType === 'hp'
 ? `${cDef.cost} HP`
 : (cDef.costType === 'cash'
 ? `$${cDef.cost}`
 : (cDef.costType === 'chronos'
 ? `${cDef.cost} Chronos`
 : (cDef.costType === 'mana' ? `${cDef.cost} Mana` : `${cDef.cost} Energy`)));
 const tagTheme = CLASS_THEMES[cDef.classTag] || CLASS_THEMES.Neutral;
 const isOwnClass = cDef.classTag === gameState.classType;

 const cardEl = document.createElement('div');
 cardEl.className = 'relic-card';
 cardEl.style.borderColor = isOwnClass ? 'var(--accent-cyan)' : 'var(--panel-border)';
 cardEl.innerHTML = `
 <div>
 <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:6px; flex-wrap:wrap;">
 <span class="draft-class-pill" style="color:${tagTheme.cssColor}; background:rgba(15,23,42,0.85);">${cDef.classTag}</span>
 <span class="${cDef.isExpansion ? 'badge-evo' : 'badge-new'}">${cDef.isExpansion ? 'EXPANSION' : cDef.category.toUpperCase()}</span>
 <span style="font-size:11px; color:var(--accent-cyan); font-weight:800;">${costLabel}</span>
 </div>
 <div style="font-family:'Teko'; font-size:26px; color:var(--text-main); line-height:1.05;">${cDef.name}</div>
 <div style="font-size:12px; color:var(--text-muted); margin-top:6px; line-height:1.35;">${cDef.text}</div>
 </div>
 <div style="margin-top:12px; font-size:11px; font-weight:800; color:var(--accent-green);">+ ADD TO DECK (${gameState.deck.length}/20)</div>
 `;
 cardEl.onclick = () => {
 if (gameState.deck.length < 20) {
 gameState.deck.push(cId);
 showToast(`Added ${cDef.name} (${cDef.classTag}) to your deck!`, 'var(--accent-cyan)');
 } else {
 showToast('Deck cap reached (20/20 cards)!', 'var(--accent-gold)');
 }
 modal.classList.remove('active');
 triggerRelicDraftModal();
 };
 container.appendChild(cardEl);
 });

 modal.classList.add('active');
}

window.skipCardDraft = function() {
 gameState.gold += 10;
 document.getElementById('modal-card-draft').classList.remove('active');
 triggerRelicDraftModal();
};

function triggerRelicDraftModal() {
 const modal = document.getElementById('modal-relic-draft');
 const container = document.getElementById('relic-draft-container');
 if (!modal || !container) return;

 const keys = Object.keys(RELIC_CATALOG).sort(() => Math.random() - 0.5).slice(0, 3);
 container.innerHTML = '';

 keys.forEach(rKey => {
 const rel = RELIC_CATALOG[rKey];
 const curTier = gameState.passives[rKey] || 0;
 const nextTier = Math.min(3, curTier + 1);
 const cardEl = document.createElement('div');
 cardEl.className = `relic-card ${rel.cssClass}`;
 cardEl.innerHTML = `
 <div>
 <div style="font-size:11px; font-weight:800; color:var(--accent-gold);">${rel.rarity} • TIER ${curTier} → ${nextTier}</div>
 <div style="font-family:'Teko'; font-size:28px; color:var(--text-main); margin-top:4px;">${rel.name}</div>
 <div style="font-size:12px; color:var(--text-muted); margin-top:6px; line-height:1.35;">${rel.desc}</div>
 </div>
 <div style="margin-top:12px; font-size:11px; font-weight:800; color:var(--accent-purple);">SELECT RELIC</div>
 `;
 cardEl.onclick = () => {
 gameState.passives[rKey] = nextTier;
 modal.classList.remove('active');
 advanceNodeProgress();
 };
 container.appendChild(cardEl);
 });

 modal.classList.add('active');
}

window.skipRelicDraft = function() {
 gameState.gold += 15;
 document.getElementById('modal-relic-draft').classList.remove('active');
 advanceNodeProgress();
};

function advanceNodeProgress() {
 if (gameState.boardNode >= gameState.maxNodes) {
 gameState.masteryProgress.runsCompleted = (gameState.masteryProgress.runsCompleted || 0) + 1;
 saveMasteryProgress();
 showToast('🏆 RUN COMPLETE! Void Overlord Defeated! Mastery Progress Updated.', 'var(--accent-gold)');
 setTimeout(() => {
 window.resetGameState(gameState.classType);
 window.showScreen('screen-class');
 }, 1500);
 } else {
 gameState.boardNode += 1;
 renderBoard();
 window.showScreen('screen-board');
 }
}

// --- SHOP SYSTEM ---
window.buyShopItem = function(itemKey) {
 const costs = {
 heal: 25,
 energy: 40,
 card_fireball: 35,
 card_catalytic: 35,
 card_shieldslam: 35,
 relic_random: 50
 };
 const cost = costs[itemKey] || 30;
 if (gameState.gold < cost) {
 showToast(`Not enough Gold! Requires ${cost}g.`, 'var(--accent-red)');
 return;
 }

 gameState.gold -= cost;
 if (itemKey === 'heal') {
 gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 30);
 showToast('Restored +30 HP!', 'var(--accent-green)');
 } else if (itemKey === 'energy') {
 gameState.maxEnergy += 1;
 showToast('Permanently gained +1 Max Energy!', 'var(--accent-cyan)');
 } else if (itemKey === 'card_fireball') {
 gameState.deck.push('fireball');
 showToast('Added Fireball Tome to your deck!', 'var(--accent-purple)');
 } else if (itemKey === 'card_catalytic') {
 gameState.deck.push('catalytic_rupture');
 showToast('Added Catalytic Rupture to your deck!', 'var(--accent-green)');
 } else if (itemKey === 'card_shieldslam') {
 gameState.deck.push('shield_slam');
 showToast('Added Shield Slam to your deck!', 'var(--accent-cyan)');
 } else if (itemKey === 'relic_random') {
 const keys = Object.keys(RELIC_CATALOG);
 const pick = keys[Math.floor(Math.random() * keys.length)];
 gameState.passives[pick] = Math.min(3, (gameState.passives[pick] || 0) + 1);
 showToast(`Unlocked ${RELIC_CATALOG[pick].name} Tier ${gameState.passives[pick]}!`, 'var(--accent-gold)');
 }

 document.getElementById('shop-gold-text').innerText = gameState.gold;
};

// --- UI RENDERER (HUD, STASIS VAULT, SEQUENCE SLOTS, HAND) ---
function renderUI() {
 const hpText = document.getElementById('ui-hp-text');
 const hpBar = document.getElementById('ui-hp-bar');
 const shieldEl = document.getElementById('ui-shield');
 const shieldBadge = document.getElementById('ui-shield-badge');
 const manaBadge = document.getElementById('ui-mana-badge');
 const manaEl = document.getElementById('ui-mana');
 const chronosBadge = document.getElementById('ui-chronos-badge');
 const chronosEl = document.getElementById('ui-chronos');
 const partsBadge = document.getElementById('ui-parts-badge');
 const partsEl = document.getElementById('ui-parts');
 const turretsEl = document.getElementById('ui-turrets');
 const cashEl = document.getElementById('ui-cash');
 const notorietyEl = document.getElementById('ui-notoriety');
 const enforcersWrap = document.getElementById('ui-enforcers-wrap');
 const enforcersEl = document.getElementById('ui-enforcers');
 const critEl = document.getElementById('ui-crit');
 const goldEl = document.getElementById('ui-gold');
 const energyEl = document.getElementById('ui-energy');
 const hudBmBtn = document.getElementById('btn-hud-black-market');

 if (hpText) {
 const isOverhealed = gameState.player.hp > gameState.player.maxHp;
 hpText.innerText = `${gameState.player.hp}/${gameState.player.maxHp}`;
 hpText.style.color = isOverhealed ? '#fb7185' : 'var(--accent-cyan)';
 }
 if (hpBar) {
 const pct = Math.max(0, Math.min(100, (gameState.player.hp / gameState.player.maxHp) * 100));
 hpBar.style.width = `${pct}%`;
 hpBar.style.background = gameState.player.hp > gameState.player.maxHp
 ? 'linear-gradient(90deg, #dc2626, #fb7185, #fef08a)'
 : 'linear-gradient(90deg, #ef4444, #f87171)';
 }

 if (shieldBadge) {
 shieldBadge.style.display = gameState.classType === 'Blood Reaver' ? 'none' : 'flex';
 }
 if (shieldEl) shieldEl.innerText = gameState.player.shield;

 if (manaBadge && manaEl) {
 const showMana = gameState.classType === 'Mage' || (gameState.player.maxMana || 0) > 0 || (gameState.player.mana || 0) > 0;
 manaBadge.style.display = showMana ? 'flex' : 'none';
 manaEl.innerText = `${gameState.player.mana || 0}/${gameState.player.maxMana || 5}`;
 }

 if (chronosBadge && chronosEl) {
 const showChronos = gameState.classType === 'Chronomancer' || gameState.chronos > 0;
 chronosBadge.style.display = showChronos ? 'flex' : 'none';
 chronosEl.innerText = `${gameState.chronos}/${gameState.maxChronos}`;
 }

 if (partsBadge && partsEl && turretsEl) {
 const showParts = gameState.classType === 'Artificer' || gameState.parts > 0 || gameState.turrets.length > 0;
 partsBadge.style.display = showParts ? 'flex' : 'none';
 partsEl.innerText = `${gameState.parts}/${gameState.maxParts}`;
 turretsEl.innerText = `${gameState.turrets.length}/3`;
 }

 if (cashEl) cashEl.innerText = `$${gameState.cash || 0}`;
 if (notorietyEl) notorietyEl.innerText = `${gameState.notoriety || 0}★`;
 if (enforcersWrap && enforcersEl) {
 const showCrew = gameState.classType === 'Mob Boss' || (gameState.enforcers && gameState.enforcers.length > 0);
 enforcersWrap.style.display = showCrew ? 'inline' : 'none';
 enforcersEl.innerText = `${gameState.enforcers ? gameState.enforcers.length : 0}/3`;
 }
 if (hudBmBtn) {
 const bmInfo = getNotorietyInfo(gameState.notoriety || 0);
 hudBmBtn.innerText = `🎩 BLACK MARKET (${bmInfo.unlockedSlots}/6)`;
 }

 if (critEl) {
 const cPct = Math.round(getEffectiveCritChance() * 100);
 const dPct = Math.round(getEffectiveDodgeChance() * 100);
 critEl.innerText = `${cPct}% / ${dPct}%`;
 }
 if (goldEl) goldEl.innerText = `${gameState.gold}g`;
 if (energyEl) energyEl.innerText = `${gameState.currentEnergy}/${gameState.maxEnergy}`;

 // Stasis Vault UI
 const maxVaultSlots = getMaxVaultSlots(gameState.classType);
 const vaultCountEl = document.getElementById('ui-vault-count');
 const vaultContainer = document.getElementById('stasis-vault-slots');
 if (vaultCountEl) vaultCountEl.innerText = `(${gameState.vault.length}/${maxVaultSlots})`;
 if (vaultContainer) {
 vaultContainer.innerHTML = '';
 if (gameState.vault.length === 0) {
 vaultContainer.innerHTML = `<div style="font-size:10px; color:var(--text-muted); padding:4px 8px;">Empty (Store cards between turns)</div>`;
 } else {
 gameState.vault.forEach((vCard, idx) => {
 const cDef = CARD_DATABASE[vCard.id];
 const el = document.createElement('div');
 el.className = 'vault-card';
 const actionHint = vCard.id === 'assembly_blueprint' ? 'CLICK: DEPLOY TURRET' : 'CLICK TO UNVAULT';
 el.innerHTML = `
 <div style="font-size:9px; font-weight:800; color:var(--accent-purple);">${cDef.name}</div>
 <div style="font-size:8px; color:var(--text-muted); line-height:1.15;">${cDef.text}</div>
 <div style="font-size:8px; color:var(--accent-cyan); font-weight:bold;">${actionHint}</div>
 `;
 el.onclick = () => window.retrieveCardFromVault(idx);
 vaultContainer.appendChild(el);
 });
 }
 }

 // Sequence Slots UI
 const seqContainer = document.getElementById('sequence-slots');
 if (seqContainer) {
 seqContainer.innerHTML = '';
 gameState.sequence.forEach((sCard, idx) => {
 const slotEl = document.createElement('div');
 slotEl.id = `seq-slot-${idx}`;
 const isTempSlot = idx >= 3;
 slotEl.className = `slot-card ${sCard ? 'filled' : ''} ${isTempSlot ? 'temp-magic-slot' : ''}`;
 if (sCard) {
 const cDef = CARD_DATABASE[sCard.id];
 slotEl.innerHTML = `
 <div style="font-size:9px; color:var(--accent-cyan); font-weight:800;">SLOT ${idx + 1}</div>
 <div style="font-size:10px; font-weight:800; color:var(--text-main); margin:2px 0;">${cDef.name}</div>
 <div style="font-size:8px; color:var(--text-muted);">Click to Remove</div>
 `;
 slotEl.onclick = () => window.removeCardFromSequence(idx);
 } else {
 const instantHint = (idx === 0 && gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[1])
 ? 'INSTANT CAST'
 : (isTempSlot ? 'BONUS SLOT' : 'EMPTY');
 slotEl.innerHTML = `
 <div style="font-size:9px; font-weight:800; color:${isTempSlot ? 'var(--accent-purple)' : 'var(--text-muted)'};">SLOT ${idx + 1}</div>
 <div style="font-size:8px; color:var(--text-muted); margin-top:4px;">${instantHint}</div>
 `;
 }
 seqContainer.appendChild(slotEl);
 });
 }

 // Scrap & Pile Counters
 const scrapText = document.getElementById('ui-scrap-text');
 const drawCount = document.getElementById('ui-draw-count');
 const discardCount = document.getElementById('ui-discard-count');
 if (scrapText) scrapText.innerText = `${gameState.scrapsUsedThisTurn} / ${gameState.scrapLimit} USED`;
 if (drawCount) drawCount.innerText = gameState.drawPileAction.length + gameState.drawPileTome.length;
 if (discardCount) discardCount.innerText = gameState.discardPile.length;

 // Hand Cards UI
 const handContainer = document.getElementById('hand-cards');
 if (handContainer) {
 handContainer.innerHTML = '';
 gameState.hand.forEach((hCard, idx) => {
 const cDef = CARD_DATABASE[hCard.id];
 if (!cDef) return;
 let cost = cDef.cost;
 const isHpCost = cDef.costType === 'hp';
 const isManaCost = cDef.costType === 'mana';
 const isChronosCost = cDef.costType === 'chronos';
 const isCashCost = cDef.costType === 'cash';

 if (!isHpCost && !isManaCost && !isChronosCost && !isCashCost) {
 if (cDef.id === 'battering_rampart' && gameState.sequence[0] === null) cost = 1;
 if (cDef.id === 'crimson_frenzy' && gameState.player.hp < gameState.player.maxHp * 0.5) cost = 0;
 if (cDef.type === 'ATTACK' && gameState.attackDiscountThisTurn > 0) {
 cost = Math.max(0, cost - gameState.attackDiscountThisTurn);
 }
 }

 const canAfford = isHpCost
 ? gameState.player.hp > cost
 : (isCashCost
 ? (gameState.cash || 0) >= cost
 : (isChronosCost
 ? gameState.chronos >= cost
 : (isManaCost ? gameState.player.mana >= cost : gameState.currentEnergy >= cost)));

 const costClass = isHpCost ? 'hp-cost' : (isCashCost ? 'cash-cost' : (isChronosCost ? 'chronos-cost' : (isManaCost ? 'mana-cost' : '')));
 const costBadgeText = isHpCost ? `${cost}HP` : (isCashCost ? `$${cost}` : (isChronosCost ? `${cost}⏳` : cost));

 const cardEl = document.createElement('div');
 cardEl.className = `deck-card ${!canAfford ? 'disabled' : ''} ${hCard.isNew ? 'drawing' : ''} ${isHpCost && canAfford ? 'blood-tithe-ready' : ''} ${cDef.isContraband ? 'contraband-hand-card' : ''}`;
 hCard.isNew = false;

 cardEl.innerHTML = `
 <div class="card-cost ${costClass}">${costBadgeText}</div>
 <div>
 <div style="font-size:8px; font-weight:800; color:${cDef.isContraband ? 'var(--accent-mob)' : (cDef.category === 'tome' ? 'var(--accent-purple)' : 'var(--accent-cyan)')}; text-transform:uppercase;">${cDef.isContraband ? 'CONTRABAND' : cDef.category}</div>
 <div style="font-size:10px; font-weight:800; color:var(--text-main); line-height:1.1; margin-top:2px; padding-right:16px;">${cDef.name}</div>
 </div>
 <div style="font-size:8.5px; color:var(--text-muted); line-height:1.18;">${cDef.text}</div>
 <div class="card-actions-row">
 <div class="btn-card-act btn-vault" onclick="window.moveCardToVault(event, ${idx})">VAULT</div>
 <div class="btn-card-act btn-scrap" onclick="window.scrapHandCard(event, ${idx})">SCRAP</div>
 </div>
 `;
 cardEl.onclick = () => {
 if (canAfford) window.playCardToSequence(idx);
 };
 handContainer.appendChild(cardEl);
 });
 }
}

// --- DECK BUILDER, COMBAT DECK INSPECTOR, PASSIVE RELICS & CLASS MASTERY TABS ---
window.currentGalleryTab = 'cards';
window.builderFilterClass = 'ALL';

window.switchIndexTab = function(tabName) {
 if (tabName === 'builder' && !window.isDeckBuilderUnlocked) {
 window.openAdminLockModal();
 return;
 }

 window.currentGalleryTab = tabName;
 document.querySelectorAll('.index-tab-btn').forEach(b => b.classList.remove('active-tab'));
 const activeBtn = document.getElementById(`tab-${tabName}-btn`);
 if (activeBtn) activeBtn.classList.add('active-tab');

 const previewBtn = document.getElementById('btn-modal-preview-combat');
 if (previewBtn) {
 previewBtn.style.display = (tabName === 'builder' && window.isDeckBuilderUnlocked) ? 'inline-block' : 'none';
 }

 renderIndexGallery();
};

window.setBuilderFilter = function(filterTag) {
 window.builderFilterClass = filterTag;
 renderIndexGallery();
};

window.builderSetClass = function(cls) {
 window.selectClass(cls);
 window.builderFilterClass = cls;
 renderIndexGallery();
};

window.builderAddCard = function(cardId) {
 if (!window.isDeckBuilderUnlocked) return;
 const cDef = CARD_DATABASE[cardId];
 if (!cDef) return;
 if (gameState.deck.length >= 20) {
 showToast('Deck limit reached (20/20 cards)! Remove a card first.', 'var(--accent-red)');
 return;
 }
 const currentCopies = gameState.deck.filter(id => id === cardId).length;
 const maxCopies = cDef.limit || 3;
 if (currentCopies >= maxCopies) {
 showToast(`Max ${maxCopies} copies of ${cDef.name} allowed!`, 'var(--accent-gold)');
 return;
 }
 gameState.deck.push(cardId);
 renderIndexGallery();
};

window.builderRemoveCard = function(cardId) {
 if (!window.isDeckBuilderUnlocked) return;
 const idx = gameState.deck.lastIndexOf(cardId);
 if (idx !== -1) {
 gameState.deck.splice(idx, 1);
 renderIndexGallery();
 }
};

window.builderResetStarter = function() {
 if (!window.isDeckBuilderUnlocked) return;
 gameState.deck = getDefaultStarterDeck(gameState.classType);
 renderIndexGallery();
 showToast(`Reset ${gameState.classType} deck to default 7-card starter.`, 'var(--accent-cyan)');
};

window.builderLoadExpansionPreset = function() {
 if (!window.isDeckBuilderUnlocked) return;
 const cls = gameState.classType;
 const presets = {
 'Mob Boss': [
 'tommy_gun_spray', 'tommy_gun_spray', 'protection_racket', 'protection_racket',
 'shakedown', 'shakedown', 'syndicate_ledger', 'syndicate_ledger',
 'concrete_shoes', 'money_laundering', 'drive_by_ambush',
 'hired_goon_contract', 'hired_goon_contract', 'kingpins_ultimatum',
 'offers_you_cant_refuse', 'tommy_drum_extortion', 'family_consigliere'
 ],
 'Chronomancer': [
 'chrono_slash', 'chrono_slash', 'stasis_bubble', 'stasis_bubble',
 'rift_strike', 'rift_strike', 'stasis_surge', 'stasis_surge',
 'entropy_bolt', 'entropy_bolt', 'deja_vu', 'deja_vu',
 'stasis_condenser', 'chrono_rewind', 'temporal_fracture'
 ],
 'Artificer': [
 'wrench_toss', 'wrench_toss', 'reinforced_plating', 'reinforced_plating',
 'capacitor_discharge', 'capacitor_discharge', 'overclock_blueprint', 'overclock_blueprint',
 'weld_and_patch', 'weld_and_patch', 'thermite_rivets', 'thermite_rivets',
 'scrap_cannon', 'reactive_armor', 'assembly_blueprint', 'assembly_blueprint'
 ],
 'Blood Reaver': [
 'siphon_slash', 'siphon_slash', 'serrated_cleave', 'serrated_cleave',
 'blood_boil', 'blood_boil', 'blood_suck', 'blood_suck',
 'flurry_of_fangs', 'flurry_of_fangs', 'coagulate', 'coagulate',
 'hemorrhagic_rupture', 'crimson_frenzy', 'sanguine_ward', 'sanguine_ward'
 ],
 'Mage': [
 'arcane_strike', 'arcane_strike', 'barrier', 'spark', 'spark',
 'arcane_battery', 'overcharge_conduit', 'chrono_echo', 'mana_overload',
 'fireball', 'prismatic_catalyst', 'astral_singularity', 'spellweaver_prism', 'spellweaver_prism'
 ],
 'Warrior': [
 'heavy_slash', 'iron_defense', 'iron_defense', 'restoration', 'fortify',
 'patience_fury', 'bastion_scrap', 'battering_rampart', 'juggernaut_stance',
 'shield_slam', 'unbreakable_phalanx', 'unbreakable_phalanx', 'cleaving_execution', 'cleaving_execution'
 ],
 'Rogue': [
 'quick_dagger', 'smoke_screen', 'toxic_needle', 'toxic_needle',
 'venom_spreader', 'shadow_prep', 'vial_stash', 'venom_surge',
 'catalytic_rupture', 'shadow_step', 'phantom_ambush', 'phantom_ambush', 'smokebomb_barrage', 'smokebomb_barrage'
 ]
 };
 gameState.deck = [...(presets[cls] || getDefaultStarterDeck(cls))];
 renderIndexGallery();
 showToast(`Loaded ${cls} Expansion Showcase Deck (${gameState.deck.length} cards)!`, 'var(--accent-purple)');
};

window.builderLoadContrabandPreset = function() {
 if (!window.isDeckBuilderUnlocked) return;
 window.selectClass('Mob Boss');
 gameState.deck = [
 'tommy_gun_spray', 'tommy_gun_spray', 'protection_racket', 'shakedown',
 'syndicate_ledger', 'hired_goon_contract', 'kingpins_ultimatum',
 'offers_you_cant_refuse', 'tommy_drum_extortion', 'family_consigliere',
 'bootleg_tonic', 'loaded_dice', 'hollow_point_mag', 'velvet_kevlar',
 'chicago_typewriter', 'syndicate_bribe', 'armored_limousine',
 'golden_peacemaker', 'godfathers_decree', 'royal_flush'
 ];
 renderIndexGallery();
 showToast(`Loaded Mob Boss Syndicate + All 10 Contraband Cards (${gameState.deck.length}/20)!`, 'var(--accent-mob)');
};

function renderIndexGallery() {
 const grid = document.getElementById('deck-index-grid');
 if (!grid) return;
 grid.innerHTML = '';

 if (window.currentGalleryTab === 'builder') {
 if (!window.isDeckBuilderUnlocked) {
 window.switchIndexTab('cards');
 return;
 }

 const classes = ['Mage', 'Warrior', 'Rogue', 'Chronomancer', 'Artificer', 'Blood Reaver', 'Mob Boss'];
 const filterTags = ['ALL', 'Mob Boss', 'Contraband', 'Chronomancer', 'Artificer', 'Blood Reaver', 'Mage', 'Warrior', 'Rogue', 'Neutral', 'EXPANSION'];

 const topControls = document.createElement('div');
 topControls.style.cssText = 'background:rgba(30,41,59,0.75); border:1px solid var(--panel-border); border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:8px;';

 const classRow = document.createElement('div');
 classRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;';
 const classPillsHtml = classes.map(cls => {
 const isSel = gameState.classType === cls;
 return `<button class="filter-pill ${isSel ? 'active-filter' : ''}" onclick="window.builderSetClass('${cls}')">${cls.toUpperCase()}</button>`;
 }).join('');
 classRow.innerHTML = `
 <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
 <span style="font-size:11px; font-weight:800; color:var(--accent-cyan);">CHAMPION:</span>
 ${classPillsHtml}
 </div>
 <div style="display:flex; gap:5px; flex-wrap:wrap;">
 <button class="filter-pill" style="border-color:var(--accent-mob); color:#fef08a;" onclick="window.builderLoadContrabandPreset()">🎩 SYNDICATE + CONTRABAND (20)</button>
 <button class="filter-pill" style="border-color:var(--accent-purple); color:var(--accent-purple);" onclick="window.builderLoadExpansionPreset()">✨ LOAD EXPANSION PRESET</button>
 <button class="filter-pill" style="border-color:var(--accent-gold); color:var(--accent-gold);" onclick="window.builderResetStarter()">↺ RESET STARTER</button>
 <button class="filter-pill" style="border-color:var(--accent-red); color:var(--accent-red);" onclick="window.lockDeckBuilder()">🔒 LOCK</button>
 </div>
 `;
 topControls.appendChild(classRow);

 const countsMap = {};
 gameState.deck.forEach(id => { countsMap[id] = (countsMap[id] || 0) + 1; });
 const uniqueIds = Object.keys(countsMap);

 const tray = document.createElement('div');
 tray.className = 'builder-deck-tray';
 const chipsHtml = uniqueIds.length === 0
 ? `<span style="font-size:11px; color:var(--text-muted);">Deck is empty — add cards below!</span>`
 : uniqueIds.map(id => {
 const c = CARD_DATABASE[id];
 if (!c) return '';
 return `<span class="deck-chip" title="Click to remove 1 copy" onclick="window.builderRemoveCard('${id}')">${c.name} <strong style="color:var(--accent-cyan);">x${countsMap[id]}</strong> ✕</span>`;
 }).join('');
 tray.innerHTML = `
 <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
 <span style="font-size:11px; font-weight:800; color:var(--text-main);">CURRENT DECK (${gameState.deck.length} / 20 CARDS)</span>
 <span style="font-size:10px; color:var(--text-muted);">Click any chip to remove 1 copy</span>
 </div>
 ${chipsHtml}
 `;
 topControls.appendChild(tray);

 const filterRow = document.createElement('div');
 filterRow.className = 'builder-filter-bar';
 filterRow.style.marginBottom = '0';
 filterRow.innerHTML = filterTags.map(tag => {
 const active = window.builderFilterClass === tag;
 return `<button class="filter-pill ${active ? 'active-filter' : ''}" onclick="window.setBuilderFilter('${tag}')">${tag === 'EXPANSION' ? '✨ EXPANSION CARDS' : (tag === 'Contraband' ? '🎩 CONTRABAND (10)' : tag.toUpperCase())}</button>`;
 }).join('');
 topControls.appendChild(filterRow);

 grid.appendChild(topControls);

 const catalogWrap = document.createElement('div');
 catalogWrap.className = 'inspector-row';
 catalogWrap.style.justifyContent = 'center';

 const allCardIds = Object.keys(CARD_DATABASE).filter(id => {
 const c = CARD_DATABASE[id];
 if (window.builderFilterClass === 'ALL') return true;
 if (window.builderFilterClass === 'EXPANSION') return c.isExpansion === true;
 return c.classTag === window.builderFilterClass;
 });

 allCardIds.forEach(id => {
 const cDef = CARD_DATABASE[id];
 const qty = countsMap[id] || 0;
 const maxCopies = cDef.limit || 3;
 const costClass = cDef.costType === 'hp' ? 'hp-cost' : (cDef.costType === 'cash' ? 'cash-cost' : (cDef.costType === 'chronos' ? 'chronos-cost' : (cDef.costType === 'mana' ? 'mana-cost' : '')));
 const costBadge = cDef.costType === 'hp' ? `${cDef.cost}HP` : (cDef.costType === 'cash' ? `$${cDef.cost}` : (cDef.costType === 'chronos' ? `${cDef.cost}⏳` : cDef.cost));

 const tile = document.createElement('div');
 tile.className = `builder-card-tile ${qty > 0 ? 'has-copies' : ''} ${cDef.isExpansion || cDef.isContraband ? 'new-pack-card' : ''}`;
 if (cDef.isContraband) {
 tile.style.borderColor = 'rgba(234, 179, 8, 0.75)';
 }
 tile.innerHTML = `
 ${cDef.isContraband ? `<div class="new-pack-tag" style="background:linear-gradient(90deg, #b45309, #eab308); color:#000;">TIER ${cDef.contrabandTier || 1} CONTRABAND</div>` : (cDef.isExpansion ? `<div class="new-pack-tag">NEW EXPANSION</div>` : '')}
 <div class="card-cost ${costClass}" style="top:8px; right:8px;">${costBadge}</div>
 <div style="margin-top:${cDef.isExpansion || cDef.isContraband ? '6px' : '0'};">
 <div style="font-size:8.5px; font-weight:800; color:${cDef.isContraband ? 'var(--accent-mob)' : (cDef.category === 'tome' ? 'var(--accent-purple)' : 'var(--accent-cyan)')}; text-transform:uppercase;">
 ${cDef.classTag} • ${cDef.category}
 </div>
 <div style="font-size:12px; font-weight:800; color:var(--text-main); margin-top:2px; padding-right:20px; line-height:1.1;">${cDef.name}</div>
 <div style="font-size:9.5px; color:var(--text-muted); margin-top:5px; line-height:1.25;">${cDef.text}</div>
 </div>
 <div class="builder-qty-row">
 <button class="btn-qty btn-rem" ${qty === 0 ? 'disabled' : ''} onclick="window.builderRemoveCard('${id}')">−</button>
 <span style="font-size:11px; font-weight:800; color:${qty > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)'};">${qty} / ${maxCopies}</span>
 <button class="btn-qty" ${(qty >= maxCopies || gameState.deck.length >= 20) ? 'disabled' : ''} onclick="window.builderAddCard('${id}')">+</button>
 </div>
 `;
 catalogWrap.appendChild(tile);
 });

 grid.appendChild(catalogWrap);
 return;
 }

 if (window.currentGalleryTab === 'cards') {
 const inBattle = document.getElementById('screen-battle')?.classList.contains('active');
 const actionPool = inBattle
 ? [...gameState.drawPileAction]
 : gameState.deck.filter(id => CARD_DATABASE[id] && CARD_DATABASE[id].category === 'action');
 const tomePool = inBattle
 ? [...gameState.drawPileTome]
 : gameState.deck.filter(id => CARD_DATABASE[id] && CARD_DATABASE[id].category === 'tome');

 const renderPileSection = (title, colorVar, poolIds, isTome) => {
 const sec = document.createElement('div');
 sec.style.textAlign = 'left';
 const total = poolIds.length;
 sec.innerHTML = `<div style="font-family:'Teko'; font-size:22px; color:${colorVar}; letter-spacing:1px;">${title} (${total} CARDS AVAILABLE)</div>`;
 const row = document.createElement('div');
 row.className = 'inspector-row';

 const counts = {};
 poolIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });

 if (total === 0) {
 row.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:6px;">No cards remaining in this draw pile (will reshuffle from discard when drawn).</div>`;
 } else {
 Object.keys(counts).forEach(cId => {
 const cDef = CARD_DATABASE[cId];
 const qty = counts[cId];
 const odds = Math.round((qty / total) * 100);
 const costClass = cDef.costType === 'hp' ? 'hp-cost' : (cDef.costType === 'cash' ? 'cash-cost' : (cDef.costType === 'chronos' ? 'chronos-cost' : (cDef.costType === 'mana' ? 'mana-cost' : '')));
 const costBadge = cDef.costType === 'hp' ? `${cDef.cost}HP` : (cDef.costType === 'cash' ? `$${cDef.cost}` : (cDef.costType === 'chronos' ? `${cDef.cost}⏳` : cDef.cost));
 const cardEl = document.createElement('div');
 cardEl.className = `inspector-card ${isTome ? 'tome-card' : ''}`;
 cardEl.innerHTML = `
 <div class="card-cost ${costClass}">${costBadge}</div>
 <div>
 <div style="font-size:8px; font-weight:800; color:${colorVar};">${cDef.type} • x${qty}</div>
 <div style="font-size:11px; font-weight:800; color:var(--text-main); margin-top:2px; padding-right:16px;">${cDef.name}</div>
 </div>
 <div style="font-size:9px; color:var(--text-muted); line-height:1.2;">${cDef.text}</div>
 <div class="odds-badge">DRAW ODDS: ${odds}%</div>
 `;
 row.appendChild(cardEl);
 });
 }
 sec.appendChild(row);
 grid.appendChild(sec);
 };

 renderPileSection('ACTION DRAW PILE (80% TURN DRAW WEIGHT)', 'var(--accent-cyan)', actionPool, false);
 renderPileSection('TOME & STANCE DRAW PILE (20% TURN DRAW WEIGHT)', 'var(--accent-purple)', tomePool, true);
 } else if (window.currentGalleryTab === 'relics') {
 const row = document.createElement('div');
 row.className = 'inspector-row';
 Object.keys(RELIC_CATALOG).forEach(rKey => {
 const rel = RELIC_CATALOG[rKey];
 const tier = gameState.passives[rKey] || 0;
 const cardEl = document.createElement('div');
 cardEl.className = `index-card`;
 cardEl.style.width = '280px';
 cardEl.innerHTML = `
 <div>
 <div style="font-size:11px; font-weight:800; color:var(--accent-gold);">${rel.rarity} • ACTIVE TIER: ${tier}/3</div>
 <div style="font-family:'Teko'; font-size:24px; color:var(--text-main); margin-top:2px;">${rel.name}</div>
 <div style="font-size:11px; color:var(--text-muted); margin-top:4px; line-height:1.35;">${rel.desc}</div>
 </div>
 `;
 row.appendChild(cardEl);
 });
 grid.appendChild(row);
 } else if (window.currentGalleryTab === 'mastery') {
 Object.keys(MASTERY_DEFINITIONS).forEach(cls => {
 const sec = document.createElement('div');
 sec.style.textAlign = 'left';
 const unlockedArr = getClassUnlockedArray(cls);
 sec.innerHTML = `<div style="font-family:'Teko'; font-size:22px; color:var(--accent-cyan);">${cls.toUpperCase()} MASTERY TREE</div>`;
 const row = document.createElement('div');
 row.className = 'inspector-row';
 MASTERY_DEFINITIONS[cls].forEach((m, idx) => {
 const isUnl = unlockedArr[idx];
 const cardEl = document.createElement('div');
 cardEl.className = 'index-card';
 cardEl.style.width = '285px';
 cardEl.style.borderColor = isUnl ? 'var(--accent-purple)' : 'var(--panel-border)';
 cardEl.innerHTML = `
 <div style="display:flex; justify-content:space-between; align-items:center;">
 <strong style="font-size:12px;">${m.title}</strong>
 <span class="mastery-pill ${isUnl ? 'pill-unlocked' : 'pill-locked'}">${isUnl ? 'UNLOCKED' : 'LOCKED'}</span>
 </div>
 <div style="font-size:11px; color:var(--accent-green); margin-top:4px;">${m.effect}</div>
 <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">${m.req}</div>
 `;
 row.appendChild(cardEl);
 });
 sec.appendChild(row);
 grid.appendChild(sec);
 });
 }
}

// Initialize Mastery Trees & Admin Lock Badges on Load
window.addEventListener('DOMContentLoaded', () => {
 renderMasteryTrees();
 window.updateBuilderLockBadges();
});
