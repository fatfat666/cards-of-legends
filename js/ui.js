// --- MASTER GAMEPLAY, COMBAT, UI & PROGRESSION ENGINE (v0.8.0) ---

function sleep(ms) {
 return new Promise(resolve => setTimeout(resolve, Math.max(15, Math.round(ms * (gameState.speedMultiplier || 1.0)))));
}

function shuffleArray(arr) {
 const copy = [...arr];
 for (let i = copy.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [copy[i], copy[j]] = [copy[j], copy[i]];
 }
 return copy;
}

function showToast(message, borderColor = 'var(--accent-blue)') {
 const container = document.getElementById('toast-container');
 if (!container) return;
 const toast = document.createElement('div');
 toast.className = 'toast-msg';
 toast.style.borderLeftColor = borderColor;
 toast.innerText = message;
 container.appendChild(toast);
 setTimeout(() => {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-8px)';
  setTimeout(() => toast.remove(), 260);
 }, 2600);
}

function showScreen(screenId) {
 document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
 const target = document.getElementById(screenId);
 if (target) target.classList.add('active');
 window.updateBuilderLockBadges();
}

function toggleCombatSpeed() {
 if (gameState.speedMultiplier === 1.0) {
  gameState.speedMultiplier = 0.5;
  gameState.speedLabel = '2x';
 } else if (gameState.speedMultiplier === 0.5) {
  gameState.speedMultiplier = 0.25;
  gameState.speedLabel = '4x';
 } else {
  gameState.speedMultiplier = 1.0;
  gameState.speedLabel = '1x';
 }
 const btn = document.getElementById('btn-speed');
 if (btn) btn.innerText = `⚡ SPEED: ${gameState.speedLabel}`;
 showToast(`Combat Speed set to ${gameState.speedLabel}`, 'var(--accent-gold)');
}

// --- CLASS SELECTION & MASTERY UI ---
function selectClass(cls) {
 gameState.classType = cls;
 document.querySelectorAll('.class-card').forEach(card => {
  card.classList.toggle('selected', card.dataset.class === cls);
 });
 renderClassMasteryPreview(cls);
}

function renderClassMasteryPreview(cls) {
 const box = document.getElementById('class-mastery-preview');
 if (!box) return;
 const defs = MASTERY_DEFINITIONS[cls] || [];
 const unlocked = getClassUnlockedArray(cls);
 const theme = CLASS_THEMES[cls] || CLASS_THEMES.Rogue;
 box.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
   <strong style="color:${theme.cssColor};font-family:'Teko',sans-serif;font-size:1.35rem;letter-spacing:1px;">
    ${theme.name} MASTERY TIERS
   </strong>
   <span style="font-size:0.8rem;color:#94a3b8;">
    Kills: ${gameState.masteryProgress.totalEnemiesKilled || 0} | Runs: ${gameState.masteryProgress.runsCompleted || 0}
   </span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;">
   ${defs.map((m, i) => `
    <div style="padding:8px 10px;border-radius:8px;background:${unlocked[i] ? 'rgba(34,197,94,0.12)' : 'rgba(15,23,42,0.75)'};border:1px solid ${unlocked[i] ? '#22c55e' : '#334155'};">
     <div style="font-weight:700;font-size:0.85rem;color:${unlocked[i] ? '#4ade80' : '#94a3b8'};">
      ${unlocked[i] ? '✅' : '🔒'} ${m.title}
     </div>
     <div style="font-size:0.78rem;color:#e2e8f0;margin-top:3px;">${m.effect}</div>
     <div style="font-size:0.7rem;color:#64748b;margin-top:2px;">${m.req}</div>
    </div>
   `).join('')}
  </div>
 `;
}

function startRun(cls) {
 const chosen = cls || gameState.classType || 'Rogue';
 resetGameState(chosen, false);
 showScreen('screen-board');
 renderBoard();
 showToast(`Started ${chosen} Run! Stage I`, (CLASS_THEMES[chosen] || CLASS_THEMES.Rogue).cssColor);
}

function startCustomDeckRun() {
 if (!window.isDeckBuilderUnlocked) {
  window.openAdminLockModal();
  return;
 }
 if (!gameState.deck || gameState.deck.length < 5) {
  showToast('Deck must contain at least 5 cards!', 'var(--accent-red)');
  return;
 }
 resetGameState(gameState.classType, true);
 closeDeckModal();
 showScreen('screen-board');
 renderBoard();
 showToast(`Custom ${gameState.classType} Deck Run Launched!`, 'var(--accent-green)');
}

function previewCustomDeckCombat() {
 if (!window.isDeckBuilderUnlocked) {
  window.openAdminLockModal();
  return;
 }
 if (!gameState.deck || gameState.deck.length < 5) {
  showToast('Deck must contain at least 5 cards to preview!', 'var(--accent-red)');
  return;
 }
 resetGameState(gameState.classType, true);
 closeDeckModal();
 initCombat(true);
 showToast(`Preview Combat Started (${gameState.classType})`, 'var(--accent-gold)');
}

// --- COMPENDIUM & ADMIN-LOCKED DECK BUILDER MODAL ---
window.currentGalleryTab = 'cards';
window.currentGalleryFilter = 'ALL';

function openDeckModal(tab = 'cards') {
 const modal = document.getElementById('modal-deck');
 if (!modal) return;
 modal.classList.add('active');
 window.switchIndexTab(tab);
}

function closeDeckModal() {
 const modal = document.getElementById('modal-deck');
 if (modal) modal.classList.remove('active');
}

window.switchIndexTab = function(tab) {
 if (tab === 'builder' && !window.isDeckBuilderUnlocked) {
  window.openAdminLockModal();
  return;
 }
 window.currentGalleryTab = tab;
 document.querySelectorAll('.gallery-tab-btn').forEach(btn => {
  btn.classList.toggle('active', btn.dataset.tab === tab);
 });
 window.updateBuilderLockBadges();
 renderGalleryContent();
};

function setGalleryFilter(filterVal) {
 window.currentGalleryFilter = filterVal;
 renderGalleryContent();
}

function renderGalleryContent() {
 const body = document.getElementById('gallery-modal-body');
 if (!body) return;
 const tab = window.currentGalleryTab;

 if (tab === 'relics') {
  body.innerHTML = `
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">
    ${Object.entries(RELIC_CATALOG).map(([k, r]) => `
     <div class="compendium-card ${r.cssClass}" style="padding:12px;border-radius:10px;background:#0f172a;border:1px solid #334155;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
       <strong style="color:#f8fafc;font-size:1rem;">${r.name}</strong>
       <span style="font-size:0.72rem;font-weight:700;color:#eab308;">${r.rarity}</span>
      </div>
      <p style="font-size:0.82rem;color:#cbd5e1;margin:8px 0 0;">${r.desc}</p>
     </div>
    `).join('')}
   </div>
  `;
  return;
 }

 if (tab === 'constructs') {
  body.innerHTML = `
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
    ${Object.values(CONSTRUCT_CATALOG).map(c => `
     <div style="padding:14px;border-radius:10px;background:#0f172a;border:1px solid #f59e0b;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
       <strong style="color:#fbbf24;font-size:1.05rem;">⚙️ ${c.name}</strong>
       <span style="font-size:0.78rem;color:#4ade80;font-weight:700;">${c.maxHp} HP</span>
      </div>
      <div style="font-size:0.78rem;color:#94a3b8;margin-top:4px;">Intercept Ratio: ${Math.round(c.interceptRatio * 100)}%</div>
      <p style="font-size:0.84rem;color:#e2e8f0;margin:8px 0 0;">${c.desc}</p>
     </div>
    `).join('')}
   </div>
  `;
  return;
 }

 const classes = ['ALL', 'Mage', 'Warrior', 'Rogue', 'Chronomancer', 'Artificer', 'Blood Reaver', 'Mob Boss', 'Neutral', 'Contraband'];
 const filterBar = `
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
   ${classes.map(c => `
    <button class="btn-secondary ${window.currentGalleryFilter === c ? 'active-filter' : ''}"
     style="padding:4px 10px;font-size:0.78rem;${window.currentGalleryFilter === c ? 'border-color:#38bdf8;background:#1e293b;color:#38bdf8;' : ''}"
     onclick="setGalleryFilter('${c}')">${c}</button>
   `).join('')}
  </div>
 `;

 const allCards = Object.values(CARD_DATABASE).filter(c =>
  window.currentGalleryFilter === 'ALL' || c.classTag === window.currentGalleryFilter
 );

 if (tab === 'cards') {
  body.innerHTML = `
   ${filterBar}
   <div style="font-size:0.82rem;color:#94a3b8;margin-bottom:10px;">Showing ${allCards.length} Cards (Total Database: ${Object.keys(CARD_DATABASE).length})</div>
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:10px;max-height:56vh;overflow-y:auto;padding-right:4px;">
    ${allCards.map(c => renderCardTileHTML(c, '')).join('')}
   </div>
  `;
  return;
 }

 if (tab === 'builder') {
  const deckCounts = {};
  (gameState.deck || []).forEach(id => { deckCounts[id] = (deckCounts[id] || 0) + 1; });

  body.innerHTML = `
   <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding:10px;background:#0f172a;border:1px solid #334155;border-radius:10px;margin-bottom:12px;">
    <div>
     <strong style="color:#4ade80;">ACTIVE BUILDER CLASS:</strong>
     <select onchange="gameState.classType=this.value;renderGalleryContent();" style="background:#1e293b;color:#f8fafc;border:1px solid #475569;border-radius:6px;padding:4px 8px;margin-left:6px;">
      ${['Mage', 'Warrior', 'Rogue', 'Chronomancer', 'Artificer', 'Blood Reaver', 'Mob Boss'].map(cls =>
       `<option value="${cls}" ${gameState.classType === cls ? 'selected' : ''}>${cls}</option>`
      ).join('')}
     </select>
     <span style="margin-left:10px;color:#cbd5e1;font-size:0.85rem;">Deck Size: <strong>${gameState.deck.length}</strong> / 20</span>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
     <button class="btn-secondary" style="padding:5px 10px;font-size:0.78rem;" onclick="resetBuilderDeck()">↺ Starter Deck</button>
     <button class="btn-secondary" style="padding:5px 10px;font-size:0.78rem;border-color:#ef4444;color:#fca5a5;" onclick="window.lockDeckBuilder()">🔒 Lock</button>
     <button class="btn-primary" style="padding:5px 12px;font-size:0.8rem;" onclick="startCustomDeckRun()">▶ START RUN</button>
    </div>
   </div>
   <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:14px;">
    <div>
     ${filterBar}
     <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:8px;max-height:48vh;overflow-y:auto;padding-right:4px;">
      ${allCards.map(c => {
       const count = deckCounts[c.id] || 0;
       const limit = c.limit || 3;
       const footer = `<div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.72rem;color:#94a3b8;">In Deck: ${count}/${limit}</span>
        <button class="btn-primary" style="padding:2px 8px;font-size:0.74rem;" ${count >= limit || gameState.deck.length >= 20 ? 'disabled' : ''} onclick="addCardToBuilder('${c.id}')">+ ADD</button>
       </div>`;
       return renderCardTileHTML(c, footer);
      }).join('')}
     </div>
    </div>
    <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:10px;max-height:54vh;overflow-y:auto;">
     <strong style="color:#38bdf8;font-size:0.9rem;display:block;margin-bottom:8px;">CURRENT DECK LIST (${gameState.deck.length})</strong>
     ${gameState.deck.map((id, idx) => {
      const c = CARD_DATABASE[id];
      if (!c) return '';
      return `
       <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;margin-bottom:5px;background:#1e293b;border-radius:6px;font-size:0.8rem;">
        <span>${c.name} <small style="color:#94a3b8;">(${formatCardCost(c)})</small></span>
        <button class="btn-secondary" style="padding:1px 7px;font-size:0.72rem;color:#f87171;border-color:#ef4444;" onclick="removeCardFromBuilder(${idx})">✕</button>
       </div>
      `;
     }).join('')}
    </div>
   </div>
  `;
 }
}

function addCardToBuilder(cardId) {
 const card = CARD_DATABASE[cardId];
 if (!card) return;
 const currentCount = gameState.deck.filter(id => id === cardId).length;
 if (currentCount >= (card.limit || 3)) {
  showToast(`Limit reached (${card.limit || 3} max) for ${card.name}`, 'var(--accent-gold)');
  return;
 }
 if (gameState.deck.length >= 20) {
  showToast('Maximum deck size (20) reached!', 'var(--accent-red)');
  return;
 }
 gameState.deck.push(cardId);
 renderGalleryContent();
}

function removeCardFromBuilder(idx) {
 gameState.deck.splice(idx, 1);
 renderGalleryContent();
}

function resetBuilderDeck() {
 gameState.deck = getDefaultStarterDeck(gameState.classType);
 renderGalleryContent();
 showToast(`Reset to default ${gameState.classType} starter deck`, 'var(--accent-blue)');
}

function formatCardCost(c) {
 if (c.costType === 'mana') return `${c.cost}💧`;
 if (c.costType === 'chronos') return `${c.cost}⏳`;
 if (c.costType === 'hp') return `${c.cost}🩸`;
 if (c.costType === 'cash') return `$${c.cost}`;
 return `${c.cost}⚡`;
}

function renderCardTileHTML(c, extraFooter = '') {
 const theme = CLASS_THEMES[c.classTag] || { cssColor: '#eab308' };
 return `
  <div style="padding:10px;border-radius:10px;background:#0f172a;border:1px solid ${theme.cssColor};display:flex;flex-direction:column;justify-content:space-between;">
   <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
     <strong style="color:#f8fafc;font-size:0.88rem;">${c.name}</strong>
     <span style="font-size:0.75rem;font-weight:700;padding:2px 6px;border-radius:6px;background:#1e293b;color:#fef08a;">${formatCardCost(c)}</span>
    </div>
    <div style="font-size:0.7rem;color:${theme.cssColor};margin-top:2px;font-weight:600;">
     ${c.classTag.toUpperCase()} • ${c.category.toUpperCase()} • ${c.type}
    </div>
    <p style="font-size:0.78rem;color:#cbd5e1;margin:6px 0 0;line-height:1.35;">${c.text}</p>
   </div>
   ${extraFooter}
  </div>
 `;
}

// --- BOARD MAP, RELIC SHOP & UNDERGROUND BLACK MARKET ---
const BOARD_NODE_PLAN = [
 { node: 1, type: 'COMBAT', icon: '⚔️', label: 'SKIRMISH' },
 { node: 2, type: 'BLACK_MARKET', icon: '🕶️', label: 'BLACK MARKET' },
 { node: 3, type: 'COMBAT', icon: '⚔️', label: 'AMBUSH' },
 { node: 4, type: 'REST', icon: '🔥', label: 'SAFEHOUSE REST' },
 { node: 5, type: 'ELITE', icon: '💀', label: 'ELITE ENFORCER' },
 { node: 6, type: 'BLACK_MARKET', icon: '🕶️', label: 'SYNDICATE VAULT' },
 { node: 7, type: 'BOSS', icon: '👑', label: 'SECTOR BOSS' }
];

function renderBoard() {
 const track = document.getElementById('board-nodes-container');
 const stats = document.getElementById('board-status-bar');
 if (stats) {
  const nInfo = getNotorietyInfo(gameState.notoriety || 0);
  stats.innerHTML = `
   <span>STAGE <strong>${gameState.stage === 1 ? 'I' : 'II'}</strong> • NODE <strong>${gameState.boardNode}/7</strong></span>
   <span>❤️ HP: <strong>${gameState.player.hp}/${gameState.player.maxHp}</strong></span>
   <span>🪙 GOLD: <strong>${gameState.gold}g</strong></span>
   <span>💵 CASH: <strong>$${gameState.cash}</strong></span>
   <span>★ ${gameState.notoriety} (${nInfo.rankName})</span>
  `;
 }

 if (!track) return;
 track.innerHTML = BOARD_NODE_PLAN.map(n => {
  const isCurrent = n.node === gameState.boardNode;
  const isDone = n.node < gameState.boardNode;
  return `
   <div class="board-node ${isCurrent ? 'current' : ''} ${isDone ? 'completed' : ''}"
    style="padding:14px 12px;border-radius:12px;min-width:115px;text-align:center;background:${isCurrent ? 'rgba(56,189,248,0.18)' : isDone ? 'rgba(34,197,94,0.12)' : '#0f172a'};border:2px solid ${isCurrent ? '#38bdf8' : isDone ? '#22c55e' : '#334155'};cursor:${isCurrent ? 'pointer' : 'default'};"
    ${isCurrent ? `onclick="enterCurrentBoardNode('${n.type}')"` : ''}>
    <div style="font-size:1.6rem;">${isDone ? '✅' : n.icon}</div>
    <div style="font-weight:700;font-size:0.82rem;margin-top:4px;color:${isCurrent ? '#38bdf8' : '#e2e8f0'};">NODE ${n.node}</div>
    <div style="font-size:0.74rem;color:#94a3b8;">${n.label}</div>
    ${isCurrent ? `<div style="margin-top:6px;font-size:0.72rem;font-weight:700;color:#fef08a;">▶ ENTER</div>` : ''}
   </div>
  `;
 }).join('');

 renderBoardRelics();
}

function renderBoardRelics() {
 const bar = document.getElementById('board-relics-bar');
 if (!bar) return;
 const owned = Object.entries(gameState.passives || {}).filter(([, tier]) => tier > 0);
 if (owned.length === 0) {
  bar.innerHTML = `<span style="color:#64748b;font-size:0.82rem;">No Relics equipped yet — visit the Relic Armory!</span>`;
  return;
 }
 bar.innerHTML = owned.map(([key, tier]) => {
  const r = RELIC_CATALOG[key];
  if (!r) return '';
  return `<span style="padding:4px 10px;border-radius:8px;background:#1e293b;border:1px solid #eab308;font-size:0.78rem;color:#fef08a;">
   ${r.name} <strong>T${tier}</strong>
  </span>`;
 }).join('');
}

function enterCurrentBoardNode(nodeType) {
 gameState.pendingNodeType = nodeType;
 if (nodeType === 'REST') {
  const healAmt = Math.round(gameState.player.maxHp * 0.35);
  gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmt);
  gainCash(15);
  gainNotoriety(5);
  showToast(`🔥 Safehouse Rest: +${healAmt} HP, +$15 Cash & +5 ★ Notoriety!`, 'var(--accent-green)');
  gameState.boardNode++;
  renderBoard();
  return;
 }
 if (nodeType === 'BLACK_MARKET') {
  openBlackMarketModal(true);
  return;
 }
 initCombat(false);
}

// --- UNDERGROUND BLACK MARKET ---
let blackMarketAdvancesNode = false;

function openBlackMarketModal(advanceOnClose = false) {
 blackMarketAdvancesNode = advanceOnClose;
 syncBlackMarketUnlockedSlots();
 const modal = document.getElementById('modal-black-market');
 if (!modal) return;
 modal.classList.add('active');
 renderBlackMarketModal();
}

function closeBlackMarketModal() {
 const modal = document.getElementById('modal-black-market');
 if (modal) modal.classList.remove('active');
 if (blackMarketAdvancesNode) {
  blackMarketAdvancesNode = false;
  gameState.boardNode++;
  renderBoard();
 }
}

function renderBlackMarketModal() {
 const header = document.getElementById('bm-header-info');
 const grid = document.getElementById('bm-stock-grid');
 const restockBtn = document.getElementById('btn-bm-restock');
 const nInfo = getNotorietyInfo(gameState.notoriety || 0);

 if (header) {
  header.innerHTML = `
   <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
    <div>
     <strong style="color:#eab308;font-size:1.05rem;">🎩 ${nInfo.rankName}</strong>
     <div style="font-size:0.78rem;color:#94a3b8;">${nInfo.tierLabel} • Notoriety: ${gameState.notoriety} ★</div>
    </div>
    <div style="font-size:1rem;font-weight:700;color:#4ade80;">
     💵 SYNDICATE CASH: $${gameState.cash}
    </div>
   </div>
  `;
 }

 if (restockBtn) {
  const rCost = getBlackMarketRestockCost();
  restockBtn.innerText = `🔄 RESTOCK CONTRABAND ($${rCost})`;
  restockBtn.disabled = (gameState.cash || 0) < rCost;
 }

 if (!grid) return;
 grid.innerHTML = (gameState.blackMarketStock || []).map((slot, idx) => {
  if (idx >= nInfo.unlockedSlots || !slot.cardId) {
   const reqRank = idx === 3 ? '15 ★ (Rank II)' : idx === 4 ? '30 ★ (Rank III)' : '50 ★ (Rank IV)';
   return `
    <div style="padding:14px;border-radius:10px;background:#090d16;border:1px dashed #334155;text-align:center;color:#64748b;">
     <div style="font-size:1.4rem;">🔒</div>
     <div style="font-weight:700;font-size:0.84rem;margin-top:4px;">LOCKED SLOT #${idx + 1}</div>
     <div style="font-size:0.74rem;margin-top:2px;">Requires ${reqRank}</div>
    </div>
   `;
  }
  const card = CARD_DATABASE[slot.cardId];
  const price = getBlackMarketCardPrice(card);
  const canAfford = (gameState.cash || 0) >= price && !slot.sold;
  return `
   <div style="padding:12px;border-radius:10px;background:#0f172a;border:1px solid ${slot.sold ? '#334155' : '#eab308'};opacity:${slot.sold ? '0.55' : '1'};display:flex;flex-direction:column;justify-content:space-between;">
    <div>
     <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:0.7rem;font-weight:700;color:#eab308;">TIER ${card.contrabandTier || 1} CONTRABAND</span>
      <span style="font-size:0.75rem;color:#fef08a;">${formatCardCost(card)}</span>
     </div>
     <strong style="color:#f8fafc;font-size:0.95rem;display:block;margin-top:3px;">${card.name}</strong>
     <p style="font-size:0.78rem;color:#cbd5e1;margin:6px 0;">${card.text}</p>
    </div>
    <button class="btn-primary" style="width:100%;padding:6px;font-size:0.8rem;margin-top:6px;"
     ${canAfford ? '' : 'disabled'} onclick="buyBlackMarketItem(${idx})">
     ${slot.sold ? 'SOLD OUT' : `BUY ($${price} CASH)`}
    </button>
   </div>
  `;
 }).join('');
}

function buyBlackMarketItem(slotIdx) {
 const slot = gameState.blackMarketStock[slotIdx];
 if (!slot || slot.sold || !slot.cardId) return;
 const card = CARD_DATABASE[slot.cardId];
 const price = getBlackMarketCardPrice(card);
 if (!spendCash(price)) {
  showToast('Not enough Syndicate Cash ($)!', 'var(--accent-red)');
  return;
 }
 slot.sold = true;
 gameState.deck.push(card.id);
 gameState.discoveredIndex[card.id] = true;
 localStorage.setItem('rogue_board_discovered', JSON.stringify(gameState.discoveredIndex));
 gainNotoriety(4);
 showToast(`🕶️ Acquired ${card.name} for $${price}! (+4 ★)`, 'var(--accent-gold)');
 renderBlackMarketModal();
 renderBoard();
}

function restockBlackMarket() {
 const rCost = getBlackMarketRestockCost();
 if (!spendCash(rCost)) {
  showToast(`Need $${rCost} Cash to restock!`, 'var(--accent-red)');
  return;
 }
 generateBlackMarketStock();
 renderBlackMarketModal();
 renderBoard();
 showToast('🔄 Black Market Contraband Restocked!', 'var(--accent-gold)');
}

// --- RELIC SHOP ---
function openRelicShopModal() {
 const modal = document.getElementById('modal-relic-shop');
 if (!modal) return;
 modal.classList.add('active');
 renderRelicShopModal();
}

function closeRelicShopModal() {
 const modal = document.getElementById('modal-relic-shop');
 if (modal) modal.classList.remove('active');
 renderBoard();
}

function renderRelicShopModal() {
 const grid = document.getElementById('relic-shop-grid');
 const goldEl = document.getElementById('relic-shop-gold');
 if (goldEl) goldEl.innerText = `${gameState.gold}g`;
 if (!grid) return;

 grid.innerHTML = Object.entries(RELIC_CATALOG).map(([key, r]) => {
  const tier = gameState.passives[key] || 0;
  const maxed = tier >= 3;
  const cost = 35 + tier * 20;
  return `
   <div style="padding:12px;border-radius:10px;background:#0f172a;border:1px solid ${tier > 0 ? '#eab308' : '#334155'};display:flex;flex-direction:column;justify-content:space-between;">
    <div>
     <div style="display:flex;justify-content:space-between;align-items:center;">
      <strong style="color:#f8fafc;font-size:0.92rem;">${r.name}</strong>
      <span style="font-size:0.74rem;color:#38bdf8;font-weight:700;">TIER ${tier}/3</span>
     </div>
     <div style="font-size:0.7rem;color:#eab308;margin-top:2px;">${r.rarity}</div>
     <p style="font-size:0.78rem;color:#cbd5e1;margin:6px 0;">${r.desc}</p>
    </div>
    <button class="btn-primary" style="width:100%;padding:6px;font-size:0.78rem;"
     ${maxed || gameState.gold < cost ? 'disabled' : ''} onclick="buyRelic('${key}', ${cost})">
     ${maxed ? 'MAXED (T3)' : `UPGRADE (${cost}g)`}
    </button>
   </div>
  `;
 }).join('');
}

function buyRelic(key, cost) {
 if ((gameState.passives[key] || 0) >= 3) return;
 if (gameState.gold < cost) {
  showToast('Insufficient Gold!', 'var(--accent-red)');
  return;
 }
 gameState.gold -= cost;
 gameState.passives[key] = (gameState.passives[key] || 0) + 1;
 if (key === 'AEGIS_OVERCHARGER') {
  gameState.player.shield += 6;
 }
 showToast(`Upgraded ${RELIC_CATALOG[key].name} to Tier ${gameState.passives[key]}!`, 'var(--accent-gold)');
 renderRelicShopModal();
 renderBoard();
}

// --- COMBAT INITIALIZATION & ENCOUNTER GENERATION ---
function generateEnemiesForNode() {
 const stage = gameState.stage || 1;
 const node = gameState.boardNode || 1;
 const nodeType = gameState.pendingNodeType || 'COMBAT';

 if (nodeType === 'BOSS' || node === 7) {
  if (stage === 1) {
   const bossTemplate = STAGE_I_BOSSES[Math.floor(Math.random() * STAGE_I_BOSSES.length)];
   return [JSON.parse(JSON.stringify(bossTemplate))];
  } else {
   return [JSON.parse(JSON.stringify(STAGE_II_FINAL_BOSS))];
  }
 }

 const scale = (stage === 2 ? 1.55 : 1.0) * (nodeType === 'ELITE' ? 1.35 : 1.0) * (1 + (node - 1) * 0.08);
 const count = (node >= 3 && nodeType !== 'ELITE' && Math.random() < 0.55) ? 2 : 1;
 const enemyNamesStage1 = ['Cyber-Raider', 'Void Stalker', 'Scrap Bruiser', 'Syndicate Gunner', 'Neon Assassin'];
 const enemyNamesStage2 = ['Astral Warden', 'Omega Enforcer', 'Chrono-Wraith', 'Abyssal Juggernaut', 'Apex Nemesis'];
 const pool = stage === 2 ? enemyNamesStage2 : enemyNamesStage1;

 const list = [];
 for (let i = 0; i < count; i++) {
  const baseHp = Math.round((count === 2 ? 38 : 54) * scale);
  const baseAtk = Math.round((count === 2 ? 8 : 11) * scale);
  const name = (nodeType === 'ELITE' ? 'ELITE ' : '') + pool[(node + i) % pool.length].toUpperCase();
  list.push({
   id: i + 1,
   name,
   hp: baseHp,
   maxHp: baseHp,
   atk: baseAtk,
   poison: 0,
   hemorrhage: 0,
   burn: 0,
   hasBountyLock: false,
   isBoss: false,
   sequence: [
    { name: 'Strike', type: 'ATTACK', value: baseAtk, speed: 1.0 },
    { name: 'Fortify', type: 'DEFEND', value: Math.round(baseAtk * 0.8), speed: 1.0 }
   ]
  });
 }
 return list;
}

function initCombat(isPreview = false) {
 gameState.isPreviewCombat = isPreview;
 gameState.isExecuting = false;
 gameState.secondWindUsed = false;
 gameState.totalScrapsInBattle = 0;
 gameState.turrets = [];
 gameState.enforcers = [];
 gameState.vault = [];
 gameState.hand = [];
 gameState.discardPile = [];
 gameState.chronos = 0;
 gameState.parts = 0;
 gameState.nextTurnBonusEnergy = 0;
 gameState.restBonusActiveThisTurn = false;
 gameState.restBonusActiveNextTurn = false;

 const actions = [];
 const tomes = [];
 (gameState.deck || []).forEach(id => {
  const c = CARD_DATABASE[id];
  if (!c) return;
  if (c.category === 'tome') tomes.push(id);
  else actions.push(id);
 });
 gameState.drawPileAction = shuffleArray(actions);
 gameState.drawPileTome = shuffleArray(tomes);

 gameState.enemies = generateEnemiesForNode();

 const themes = gameState.stage === 2 ? STAGE_II_THEMES : STAGE_THEMES;
 const themeObj = themes[(gameState.boardNode - 1) % themes.length];
 const combatScreen = document.getElementById('screen-combat');
 if (combatScreen && themeObj) combatScreen.style.background = themeObj.bg;

 showScreen('screen-combat');
 setupPixiApp();

 // Apply Combat Start Masteries
 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);
 if (cls === 'Mage' && unl[3]) {
  gainMana(2, 200, 110, 'T4 ASTRAL OMNISCIENCE: +2 MANA!');
 }
 if (cls === 'Chronomancer' && unl[0]) {
  gainChronos(1, 200, 110, 'T1 TEMPORAL ANCHOR: +1 CHRONOS');
 }
 if (cls === 'Artificer') {
  if (unl[1]) deployOrRefundArtificerTurret(210, 110, 'auto_turret');
  if (unl[3]) gainParts(2, 210, 110, 'T4 GRAND ARCHITECT: +2 PARTS');
 }
 if (cls === 'Mob Boss') {
  if (unl[1]) hireOrReinforceEnforcer(210, 110);
  if (unl[3]) {
   hireOrReinforceEnforcer(210, 110);
   gainNotoriety(15, 210, 110, 'T4 CAPO DI TUTTI CAPI: +15 ★!');
  }
 }

 startPlayerTurn(true);
}

function drawCard(category = 'any', count = 1) {
 for (let i = 0; i < count; i++) {
  if (gameState.hand.length >= 8) break;
  let picked = null;

  const refillIfNeeded = (cat) => {
   if (cat === 'action' && gameState.drawPileAction.length === 0) {
    const actDiscards = gameState.discardPile.filter(id => CARD_DATABASE[id] && CARD_DATABASE[id].category !== 'tome');
    gameState.discardPile = gameState.discardPile.filter(id => CARD_DATABASE[id] && CARD_DATABASE[id].category === 'tome');
    gameState.drawPileAction = shuffleArray(actDiscards);
   } else if (cat === 'tome' && gameState.drawPileTome.length === 0) {
    const tomeDiscards = gameState.discardPile.filter(id => CARD_DATABASE[id] && CARD_DATABASE[id].category === 'tome');
    gameState.discardPile = gameState.discardPile.filter(id => CARD_DATABASE[id] && CARD_DATABASE[id].category !== 'tome');
    gameState.drawPileTome = shuffleArray(tomeDiscards);
   }
  };

  if (category === 'action') {
   refillIfNeeded('action');
   picked = gameState.drawPileAction.pop();
  } else if (category === 'tome') {
   refillIfNeeded('tome');
   picked = gameState.drawPileTome.pop();
  } else {
   refillIfNeeded('action');
   refillIfNeeded('tome');
   const pool = [];
   if (gameState.drawPileAction.length > 0) pool.push('action');
   if (gameState.drawPileTome.length > 0) pool.push('tome');
   if (pool.length > 0) {
    const pickCat = pool[Math.floor(Math.random() * pool.length)];
    picked = pickCat === 'action' ? gameState.drawPileAction.pop() : gameState.drawPileTome.pop();
   }
  }

  if (picked) {
   // Rogue Vial Stash auto-vaults when drawn if space exists
   if (picked === 'vial_stash' && gameState.vault.length < getMaxVaultSlots(gameState.classType)) {
    gameState.vault.push({ cardId: picked, turnsStored: 0 });
    showToast('🧪 Vial Stash auto-stored in Vault!', 'var(--accent-green)');
   } else {
    gameState.hand.push(picked);
   }
  }
 }
 renderCombatUI();
}

function startPlayerTurn(isFirstTurn = false) {
 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);

 gameState.isExecuting = false;
 gameState.abilityUsedThisTurn = false;
 gameState.firstAttackUsedThisTurn = false;
 gameState.manaSpentThisTurn = 0;
 gameState.attackDiscountThisTurn = 0;
 gameState.nextTomeEchoThisTurn = false;
 gameState.scrapsUsedThisTurn = 0;
 gameState.turretBonusVolleysThisTurn = 0;
 gameState.spentHpThisTurn = false;
 gameState.intimidateMultiplier = 1.0;
 gameState.reflectDamageThisTurn = 0;
 gameState.unvaultEnergyGrantedThisTurn = false;

 gameState.restBonusActiveThisTurn = gameState.restBonusActiveNextTurn;
 gameState.restBonusActiveNextTurn = false;

 const prevUnspentEnergy = isFirstTurn ? 0 : Math.max(0, gameState.currentEnergy || 0);

 // Shield decay between turns
 if (!isFirstTurn) {
  if (gameState.juggernautStanceActive) {
   gameState.juggernautStanceActive = false;
  } else if (cls === 'Warrior' && unl[3]) {
   gameState.player.shield = Math.floor((gameState.player.shield || 0) * 0.75);
  } else {
   gameState.player.shield = 0;
  }
 }

 // Deflection Relic turn-start shield
 const deflTier = gameState.passives.DEFLECTION || 0;
 if (deflTier > 0) {
  addPlayerShield(deflTier * 3, 200, 120);
 }

 // Energy Calculation
 let turnEnergy = gameState.maxEnergy + (gameState.nextTurnBonusEnergy || 0);
 gameState.nextTurnBonusEnergy = 0;
 if (cls === 'Chronomancer' && unl[1] && prevUnspentEnergy > 0) {
  turnEnergy += 1;
 }
 if (cls === 'Blood Reaver' && unl[3] && gameState.player.hp < gameState.player.maxHp * 0.75) {
  turnEnergy += 1;
 }
 gameState.currentEnergy = turnEnergy;

 // Mage Mana Turn Gain
 if (cls === 'Mage' && unl[0]) {
  let mGain = 2;
  if (gameState.chronoEchoPlayedThisTurn && gameState.restBonusActiveThisTurn) mGain += 1;
  gainMana(mGain, 200, 115);
 }
 gameState.chronoEchoPlayedThisTurn = false;

 // Artificer Construct Turn-Start Effects
 (gameState.turrets || []).forEach(t => {
  const spec = CONSTRUCT_CATALOG[t.type];
  if (!spec) return;
  if (spec.shield > 0) addPlayerShield(spec.shield, 240, 115);
  if (spec.partsGain > 0) gainParts(spec.partsGain, 240, 115);
 });

 // Sequence Slots (3 base, +1 Temp Slot for Mage T4 on turn 1 or Chronomancer T3 on Rest)
 let slotCount = 3;
 if (isFirstTurn && cls === 'Mage' && unl[3]) slotCount = 4;
 if (!isFirstTurn && cls === 'Chronomancer' && unl[2] && gameState.restBonusActiveThisTurn) slotCount = 4;
 gameState.sequence = new Array(slotCount).fill(null);

 // Increment Vault turnsStored
 (gameState.vault || []).forEach(v => { v.turnsStored = (v.turnsStored || 0) + 1; });

 // Draw up to 5 cards
 const toDraw = Math.max(0, 5 - gameState.hand.length);
 drawCard('any', toDraw);
 renderCombatUI();
}

// --- CARD COST, QUEUING, SCRAPPING & VAULTING ---
function getEffectiveCardCost(cardDef, slotIndex = 0) {
 if (!cardDef) return 0;
 let cost = cardDef.cost || 0;
 if (cardDef.costType === 'energy') {
  if (cardDef.id === 'battering_rampart' && slotIndex === 0) cost = 1;
  if (cardDef.id === 'crimson_frenzy' && gameState.player.hp < gameState.player.maxHp * 0.5) cost = 0;
  if (cardDef.type === 'ATTACK' && gameState.attackDiscountThisTurn > 0) {
   cost = Math.max(0, cost - gameState.attackDiscountThisTurn);
  }
 }
 return Math.max(0, cost);
}

function canAffordCard(cardDef, slotIndex) {
 const cost = getEffectiveCardCost(cardDef, slotIndex);
 if (cardDef.costType === 'mana') return (gameState.player.mana || 0) >= cost;
 if (cardDef.costType === 'chronos') return (gameState.chronos || 0) >= cost;
 if (cardDef.costType === 'hp') return (gameState.player.hp || 0) > cost;
 if (cardDef.costType === 'cash') return (gameState.cash || 0) >= cost;
 return (gameState.currentEnergy || 0) >= cost;
}

function payCardCost(cardDef, slotIndex) {
 const cost = getEffectiveCardCost(cardDef, slotIndex);
 if (cardDef.costType === 'mana') {
  gameState.player.mana -= cost;
  gameState.manaSpentThisTurn = (gameState.manaSpentThisTurn || 0) + cost;
 } else if (cardDef.costType === 'chronos') {
  gameState.chronos -= cost;
 } else if (cardDef.costType === 'hp') {
  spendPlayerHp(cost, 200, 125);
 } else if (cardDef.costType === 'cash') {
  spendCash(cost, 200, 125);
 } else {
  gameState.currentEnergy -= cost;
 }
 return cost;
}

function refundCardCost(cardDef, paidCost) {
 if (cardDef.costType === 'mana') {
  gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + paidCost);
  gameState.manaSpentThisTurn = Math.max(0, (gameState.manaSpentThisTurn || 0) - paidCost);
 } else if (cardDef.costType === 'chronos') {
  gameState.chronos = Math.min(gameState.maxChronos, gameState.chronos + paidCost);
 } else if (cardDef.costType === 'hp') {
  gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + paidCost);
 } else if (cardDef.costType === 'cash') {
  gameState.cash += paidCost;
 } else {
  gameState.currentEnergy += paidCost;
 }
}

function queueCardFromHand(handIdx) {
 if (gameState.isExecuting) return;
 const openSlot = gameState.sequence.findIndex(s => s === null);
 if (openSlot === -1) {
  showToast('Sequence Queue is full!', 'var(--accent-gold)');
  return;
 }
 const cardId = gameState.hand[handIdx];
 const cardDef = CARD_DATABASE[cardId];
 if (!cardDef) return;

 if (!canAffordCard(cardDef, openSlot)) {
  showToast(`Insufficient ${cardDef.costType.toUpperCase()} for ${cardDef.name}!`, 'var(--accent-red)');
  return;
 }

 const paidCost = payCardCost(cardDef, openSlot);
 gameState.hand.splice(handIdx, 1);
 gameState.sequence[openSlot] = { cardId, paidCost, fromVault: false, turnsStored: 0 };
 renderCombatUI();
}

function unqueueSequenceSlot(slotIdx) {
 if (gameState.isExecuting) return;
 const entry = gameState.sequence[slotIdx];
 if (!entry) return;
 const cardDef = CARD_DATABASE[entry.cardId];
 if (cardDef && !entry.fromVault) {
  refundCardCost(cardDef, entry.paidCost || 0);
 }
 gameState.hand.push(entry.cardId);
 gameState.sequence[slotIdx] = null;
 renderCombatUI();
}

function scrapCardFromHand(handIdx) {
 if (gameState.isExecuting) return;
 if (gameState.scrapsUsedThisTurn >= gameState.scrapLimit) {
  showToast(`Scrap limit (${gameState.scrapLimit}/turn) reached!`, 'var(--accent-gold)');
  return;
 }
 const cardId = gameState.hand[handIdx];
 const cardDef = CARD_DATABASE[cardId];
 if (!cardDef) return;

 gameState.hand.splice(handIdx, 1);
 gameState.discardPile.push(cardId);
 gameState.scrapsUsedThisTurn++;
 gameState.totalScrapsInBattle = (gameState.totalScrapsInBattle || 0) + 1;

 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);

 if (gameState.nextScrapBonusEnergy > 0) {
  gameState.currentEnergy += gameState.nextScrapBonusEnergy;
  showToast(`Scrap Engine: +${gameState.nextScrapBonusEnergy}⚡!`, 'var(--accent-blue)');
  gameState.nextScrapBonusEnergy = 0;
 }

 // Card-specific Scrap Bonuses
 if (cardId === 'bastion_scrap') addPlayerShield(12, 200, 120);
 if (cardId === 'reinforced_plating') gainParts(2, 200, 120);
 if (cardId === 'deja_vu') { gainChronos(1, 200, 120); drawCard('any', 1); }
 if (cardId === 'money_laundering') { gainCash(25, 200, 120, '+$25 LAUNDERED!', true); gainNotoriety(2, 200, 120); gameState.currentEnergy += 1; }
 if (cardId === 'scrap_recycler') { gameState.currentEnergy += 2; drawCard('any', 1); }
 if (cardId === 'salvage_magnet') gainParts(1, 200, 120);

 // Artificer T1 & T3 Masteries
 if (cls === 'Artificer') {
  if (unl[0]) {
   gainParts(2, 200, 120);
   const target = gameState.enemies.find(e => e.hp > 0);
   if (target) {
    target.hp = Math.max(0, target.hp - 4);
    spawnFloatingText(730, 120, 'SALVAGE BOLT -4', '#f59e0b');
   }
  }
  if (unl[2] && gameState.totalScrapsInBattle % 4 === 0) {
   addPlayerShield(15, 200, 120);
   gameState.enemies.forEach((e, idx) => {
    if (e.hp > 0) {
     e.hp = Math.max(0, e.hp - 20);
     if (enemySprites[idx]) spawnShockwave(enemySprites[idx].x, enemySprites[idx].y, 90, 0xf59e0b, 5, 24);
    }
   });
   showToast('💥 SINGULARITY MELTDOWN: 20 AoE DMG & +15 Shield!', 'var(--accent-gold)');
  }
 }

 // Mob Boss T1 Mastery
 if (cls === 'Mob Boss' && unl[0]) {
  gainCash(20, 200, 120, 'SYNDICATE SCRAP +$20!', true);
  gainNotoriety(2, 200, 120);
 }

 renderCombatUI();
 checkAllEnemiesDefeated();
}

function vaultCardFromHand(handIdx) {
 if (gameState.isExecuting) return;
 const maxV = getMaxVaultSlots(gameState.classType);
 if (gameState.vault.length >= maxV) {
  showToast(`Stasis Vault is full (${maxV}/${maxV})!`, 'var(--accent-gold)');
  return;
 }
 const cardId = gameState.hand[handIdx];
 gameState.hand.splice(handIdx, 1);
 gameState.vault.push({ cardId, turnsStored: 0 });
 showToast(`Stored ${CARD_DATABASE[cardId].name} in Vault`, 'var(--accent-blue)');
 renderCombatUI();
}

function unvaultCardToSequence(vaultIdx) {
 if (gameState.isExecuting) return;
 const openSlot = gameState.sequence.findIndex(s => s === null);
 if (openSlot === -1) {
  showToast('No open Sequence Slot to unvault into!', 'var(--accent-gold)');
  return;
 }
 const vItem = gameState.vault.splice(vaultIdx, 1)[0];
 if (!vItem) return;

 const hourglassTier = gameState.passives.CHRONO_HOURGLASS || 0;
 if (hourglassTier >= 3 && !gameState.unvaultEnergyGrantedThisTurn) {
  gameState.currentEnergy += 1;
  gameState.unvaultEnergyGrantedThisTurn = true;
  showToast('⏳ Chrono Hourglass T3: +1⚡ on Unvault!', 'var(--accent-blue)');
 }
 if (gameState.classType === 'Chronomancer' && getClassUnlockedArray('Chronomancer')[3] && !gameState.unvaultEnergyGrantedThisTurn) {
  gameState.currentEnergy += 1;
  gameState.unvaultEnergyGrantedThisTurn = true;
  showToast('⏳ Eternity Weaver: +1⚡ on Unvault!', '#2dd4bf');
 }

 if (vItem.cardId === 'assembly_blueprint') {
  deployOrRefundArtificerTurret(210, 110, 'auto_turret');
  gameState.discardPile.push(vItem.cardId);
  renderCombatUI();
  return;
 }

 gameState.sequence[openSlot] = {
  cardId: vItem.cardId,
  paidCost: 0,
  fromVault: true,
  turnsStored: vItem.turnsStored || 1
 };
 renderCombatUI();
}

// --- SIGNATURE CLASS ABILITY & REST ---
function updateAbilityBarLabel() {
 const btn = document.getElementById('btn-class-ability');
 if (!btn) return;
 const cls = gameState.classType;
 const labels = {
  Mage: '🔮 ARCANE CONDUIT (1⚡: +2 Mana & Draw Tome)',
  Warrior: '🛡️ IRON BULWARK (1⚡: +12 Shield)',
  Rogue: '🗡️ SHADOW FEINT (1⚡: +1 Dodge & 100% Crit)',
  Chronomancer: '⏳ TEMPORAL SHIFT (1⚡: +1 Chronos)',
  Artificer: '⚙️ FABRICATE TURRET (1⚡: Deploy Drone)',
  'Blood Reaver': '🩸 BLOODLETTING (4 HP: +1⚡ & +3 Bleed)',
  'Mob Boss': '🎯 BOUNTY HIT ($15 Cash: Mark Target)'
 };
 btn.innerText = labels[cls] || '✨ CLASS ABILITY';
 btn.disabled = gameState.abilityUsedThisTurn || gameState.isExecuting;
}

function useClassAbility() {
 if (gameState.isExecuting || gameState.abilityUsedThisTurn) return;
 const cls = gameState.classType;
 const target = gameState.enemies.find(e => e.hp > 0);
 const tIdx = gameState.enemies.indexOf(target);
 const tSprite = enemySprites[tIdx] || { x: 730, y: 125 };

 if (cls === 'Blood Reaver') {
  if (!spendPlayerHp(4, 200, 125)) {
   showToast('Not enough HP for Bloodletting!', 'var(--accent-red)');
   return;
  }
  gameState.currentEnergy += 1;
  gameState.nextHitCritBonus += 0.10;
  if (target) {
   target.hemorrhage = (target.hemorrhage || 0) + 3;
   spawnFloatingText(tSprite.x, tSprite.y - 25, '+3 HEMORRHAGE', '#fb7185');
  }
 } else if (cls === 'Mob Boss') {
  if (!target) return;
  if (!spendCash(15, 200, 125)) {
   showToast('Need $15 Cash to place a Bounty Hit!', 'var(--accent-red)');
   return;
  }
  gameState.enemies.forEach(e => { e.hasBountyLock = false; });
  target.hasBountyLock = true;
  spawnBountyCrosshairVFX(tSprite.x, tSprite.y);
  spawnFloatingText(tSprite.x, tSprite.y - 44, '🎯 BOUNTY MARKED!', '#ef4444');
 } else {
  if (gameState.currentEnergy < 1) {
   showToast('Need 1⚡ for Class Ability!', 'var(--accent-red)');
   return;
  }
  gameState.currentEnergy -= 1;
  if (cls === 'Mage') {
   gainMana(2, 200, 115);
   drawCard('tome', 1);
  } else if (cls === 'Warrior') {
   addPlayerShield(12, 200, 115);
   gameState.reflectDamageThisTurn += 4;
   spawnFloatingText(200, 105, '+12 SHIELD & +4 THORNS', '#38bdf8');
  } else if (cls === 'Rogue') {
   gameState.guaranteedDodgeCount += 1;
   gameState.guaranteedCritNextAttack = true;
   spawnFloatingText(200, 105, '+1 DODGE & 100% CRIT PRIMED', '#4ade80');
  } else if (cls === 'Chronomancer') {
   gainChronos(1, 200, 115);
  } else if (cls === 'Artificer') {
   deployOrRefundArtificerTurret(210, 110, 'auto_turret');
  }
 }

 gameState.abilityUsedThisTurn = true;
 renderCombatUI();
}

function restAndCharge() {
 if (gameState.isExecuting) return;
 gameState.restBonusActiveNextTurn = true;
 addPlayerShield(6, 200, 115);
 showToast('⏸️ Rest & Charge: +6 Shield & Rest Bonus primed for next turn!', 'var(--accent-blue)');
 executeSequence(true);
}

// --- SEQUENCE EXECUTION & ENEMY TURN ---
async function executeSequence(fromRest = false) {
 if (gameState.isExecuting) return;
 gameState.isExecuting = true;
 renderCombatUI();

 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);

 for (let slotIdx = 0; slotIdx < gameState.sequence.length; slotIdx++) {
  const entry = gameState.sequence[slotIdx];
  if (!entry) continue;

  const cardDef = CARD_DATABASE[entry.cardId];
  if (!cardDef) continue;

  if (slotIdx === 0) gameState.lastSlot1CardId = cardDef.id;
  if (cardDef.id === 'chrono_echo') gameState.chronoEchoPlayedThisTurn = true;

  const repeatCount = (cardDef.category === 'tome' && gameState.nextTomeEchoThisTurn) ? 2 : 1;
  if (repeatCount === 2) gameState.nextTomeEchoThisTurn = false;

  for (let castNum = 0; castNum < repeatCount; castNum++) {
   const isEchoCast = castNum > 0;
   const echoScale = isEchoCast ? 0.5 : 1.0;

   const target = gameState.enemies.find(e => e.hp > 0);
   const tIdx = gameState.enemies.indexOf(target);
   const srcPos = { x: playerSprite ? playerSprite.x : 200, y: playerSprite ? playerSprite.y : 132 };
   const tgtPos = (tIdx >= 0 && enemySprites[tIdx]) ? { x: enemySprites[tIdx].x, y: enemySprites[tIdx].y } : { x: 750, y: 132 };

   await resolveSingleCardCast(cardDef, entry, slotIdx, srcPos, tgtPos, echoScale, isEchoCast);

   const skipDelay = (slotIdx === 0 && cls === 'Chronomancer' && unl[1]);
   if (!skipDelay) await sleep(340);

   if (checkAllEnemiesDefeated()) {
    gameState.sequence[slotIdx] = null;
    gameState.discardPile.push(entry.cardId);
    handleCombatVictory();
    return;
   }
  }

  gameState.sequence[slotIdx] = null;
  gameState.discardPile.push(entry.cardId);
  renderCombatUI();
 }

 // Fire Artificer Constructs
 const baseVolleys = (gameState.turrets && gameState.turrets.length > 0) ? (1 + (gameState.turretBonusVolleysThisTurn || 0)) : 0;
 for (let v = 0; v < baseVolleys; v++) {
  for (let t = 0; t < gameState.turrets.length; t++) {
   const turret = gameState.turrets[t];
   const spec = CONSTRUCT_CATALOG[turret.type] || CONSTRUCT_CATALOG.auto_turret;
   if (spec.atk <= 0) continue;

   const target = gameState.enemies.find(e => e.hp > 0);
   if (!target) break;
   const tIdx = gameState.enemies.indexOf(target);
   const tSprite = enemySprites[tIdx] || { x: 750, y: 132 };

   let dmg = spec.atk;
   if (cls === 'Artificer' && unl[3]) dmg = Math.round(dmg * 1.35);
   if (cls === 'Artificer' && unl[1] && Math.random() < getEffectiveCritChance()) {
    dmg = Math.round(dmg * 1.75);
   }

   if (spec.aoe) {
    gameState.enemies.forEach((e, idx) => {
     if (e.hp > 0) {
      e.hp = Math.max(0, e.hp - dmg);
      if (spec.burn) e.burn = (e.burn || 0) + spec.burn;
      if (enemySprites[idx]) spawnFloatingText(enemySprites[idx].x, enemySprites[idx].y - 24, `🔥 -${dmg}`, '#f97316');
     }
    });
   } else {
    target.hp = Math.max(0, target.hp - dmg);
    if (spec.burn) target.burn = (target.burn || 0) + spec.burn;
    spawnLightningBolt(260, 95 + t * 40, tSprite.x, tSprite.y, 0xf59e0b, 0xfef08a);
    spawnFloatingText(tSprite.x, tSprite.y - 24, `⚙️ -${dmg}`, '#f59e0b');
    if (spec.chainDmg) {
     const second = gameState.enemies.find((e, idx) => idx !== tIdx && e.hp > 0);
     if (second) second.hp = Math.max(0, second.hp - spec.chainDmg);
    }
   }

   if ((gameState.passives.AEGIS_OVERCHARGER || 0) >= 3) {
    addPlayerShield(6, 200, 115);
   }
   await sleep(220);
  }
  if (checkAllEnemiesDefeated()) {
   handleCombatVictory();
   return;
  }
 }

 // Fire Mob Boss Enforcers
 for (let eIdx = 0; eIdx < (gameState.enforcers || []).length; eIdx++) {
  const target = gameState.enemies.find(e => e.hp > 0);
  if (!target) break;
  const tIdx = gameState.enemies.indexOf(target);
  const tSprite = enemySprites[tIdx] || { x: 750, y: 132 };
  const crewBonus = (cls === 'Mob Boss' && unl[1]) ? gameState.enforcers.length * 3 : 0;
  const dmg = 4 + crewBonus;
  target.hp = Math.max(0, target.hp - dmg);
  spawnGunfireVolleyVFX(265, 95 + eIdx * 40, tSprite.x, tSprite.y, 2);
  spawnFloatingText(tSprite.x, tSprite.y - 26, `🎩 -${dmg}`, '#eab308');
  gainCash(3, 250, 100);
  await sleep(220);
  if (checkAllEnemiesDefeated()) {
   handleCombatVictory();
   return;
  }
 }

 await executeEnemyTurn();
}

async function resolveSingleCardCast(cardDef, entry, slotIdx, srcPos, tgtPos, echoScale, isEchoCast) {
 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);
 const id = cardDef.id;

 // Defense Cards
 if (cardDef.type === 'DEFEND' || cardDef.type === 'STANCE') {
  applyDefenseCard(cardDef, srcPos, tgtPos, echoScale, isEchoCast);
  if (id === 'juggernaut_stance' || id === 'armored_limousine') gameState.juggernautStanceActive = true;
  if (id === 'unbreakable_phalanx') gameState.reflectDamageThisTurn += 8;
  if (id === 'velvet_kevlar') gameState.reflectDamageThisTurn += 6;
  if (id === 'coagulate' && gameState.player.hp > gameState.player.maxHp) gameState.nextTurnBonusEnergy += 1;
  if (id === 'weld_and_patch') {
   (gameState.turrets || []).forEach(t => { t.hp = Math.min(t.maxHp, t.hp + 6); });
  }
  if (id === 'money_laundering') gainCash(15, srcPos.x, srcPos.y);
  if (id === 'armored_limousine') hireOrReinforceEnforcer(srcPos.x, srcPos.y);
  return;
 }

 // Heal Cards
 if (cardDef.type === 'HEAL') {
  playCardVFX(id, srcPos, tgtPos);
  healPlayerHp(Math.round((cardDef.value || 10) * echoScale), srcPos.x, srcPos.y);
  if (id === 'bootleg_tonic') {
   addPlayerShield(6, srcPos.x, srcPos.y);
  }
  return;
 }

 // Utility Tomes
 if (cardDef.type === 'TOME') {
  playCardVFX(id, srcPos, tgtPos);
  if (cardDef.value > 0 && ['chrono_echo', 'shadow_step', 'smokebomb_barrage', 'reactive_armor', 'sanguine_ward', 'offers_you_cant_refuse', 'family_consigliere', 'paradox_anchor', 'syndicate_armory', 'chrono_catalyst', 'hired_goon_contract'].includes(id)) {
   addPlayerShield(Math.round(cardDef.value * echoScale), srcPos.x, srcPos.y);
  }
  if (cardDef.guaranteedDodge) gameState.guaranteedDodgeCount += 1;
  if (id === 'shadow_step') gameState.guaranteedCritNextAttack = true;
  if (id === 'smokebomb_barrage') gameState.enemies.forEach(e => { if (e.hp > 0) e.poison = (e.poison || 0) + 2; });
  if (id === 'arcane_battery') { gameState.nextTurnBonusEnergy += 1; drawCard('action', 1); }
  if (id === 'overcharge_conduit') {
   dealDamageToTarget(Math.round(6 * echoScale), slotIdx, entry, cardDef);
   if (slotIdx === 2) { gameState.currentEnergy += 1; gainMana(1, srcPos.x, srcPos.y); }
  }
  if (id === 'chrono_echo') drawCard('any', 1);
  if (id === 'prismatic_catalyst') gameState.attackDiscountThisTurn += 1;
  if (id === 'spellweaver_prism') { gainMana(2, srcPos.x, srcPos.y); gameState.nextTomeEchoThisTurn = true; }
  if (id === 'stasis_surge') { dealDamageToTarget(Math.round(8 * echoScale), slotIdx, entry, cardDef); gainChronos(1, srcPos.x, srcPos.y); drawCard('action', 1); }
  if (id === 'chrono_rewind') {
   gameState.currentEnergy += 1;
   if (gameState.lastSlot1CardId) gameState.hand.push(gameState.lastSlot1CardId);
  }
  if (id === 'overclock_blueprint') { gainParts(1, srcPos.x, srcPos.y); drawCard('action', 1); gameState.turretBonusVolleysThisTurn += 1; }
  if (id === 'reactive_armor') gameState.reactiveArmorActive = true;
  if (id === 'assembly_blueprint' || cardDef.constructType) {
   deployOrRefundArtificerTurret(srcPos.x, srcPos.y, cardDef.constructType || 'auto_turret');
  }
  if (id === 'overdrive_core') {
   gainParts(2, srcPos.x, srcPos.y);
   (gameState.turrets || []).forEach(t => { t.hp = Math.min(t.maxHp, t.hp + 6); });
   gameState.turretBonusVolleysThisTurn += 1;
  }
  if (id === 'blood_suck') {
   const target = gameState.enemies.find(e => e.hp > 0);
   if (target && (target.hemorrhage || 0) > 0) {
    const stacks = target.hemorrhage;
    target.hemorrhage = 0;
    dealDamageToTarget(stacks * 2, slotIdx, entry, cardDef);
    healPlayerHp(stacks * 4, srcPos.x, srcPos.y);
   }
  }
  if (id === 'sanguine_ward') {
   gameState.enemies.forEach(e => { if (e.hp > 0) e.hemorrhage = (e.hemorrhage || 0) + 2; });
  }
  if (id === 'syndicate_ledger') {
   gainCash(15, srcPos.x, srcPos.y);
   gainNotoriety(2, srcPos.x, srcPos.y);
   drawCard('action', 1);
   (gameState.enforcers || []).forEach(enf => { enf.hp = Math.min(enf.maxHp, enf.hp + 5); });
  }
  if (id === 'hired_goon_contract') hireOrReinforceEnforcer(srcPos.x, srcPos.y);
  if (id === 'offers_you_cant_refuse') {
   gameState.intimidateMultiplier = 0.5;
   gainNotoriety(3, srcPos.x, srcPos.y);
   drawCard('any', 1);
  }
  if (id === 'family_consigliere') {
   gameState.sequence.push(null);
   gainNotoriety(2, srcPos.x, srcPos.y);
   gameState.restockDiscount = (gameState.restockDiscount || 0) + 5;
  }
  if (id === 'vault_recycle') {
   if (gameState.vault.length > 0) {
    const v = gameState.vault.shift();
    gameState.hand.unshift(v.cardId);
   }
   drawCard('any', 1);
  }
  if (id === 'black_market_voucher') { gainCash(18, srcPos.x, srcPos.y); gainNotoriety(3, srcPos.x, srcPos.y); drawCard('action', 1); }
  if (id === 'mercenary_contract') { hireOrReinforceEnforcer(srcPos.x, srcPos.y); gameState.currentEnergy += 1; }
  if (id === 'adrenaline_syringe') { gameState.currentEnergy += 2; drawCard('action', 1); }
  if (id === 'loaded_dice') { gameState.currentEnergy += 1; gameState.nextHitCritBonus += 0.15; drawCard('any', 1); }
  if (id === 'hollow_point_mag') { gameState.nextHitBonusDmg += 12; gameState.guaranteedCritNextAttack = true; gameState.nextHitBonusHemorrhage += 3; }
  if (id === 'syndicate_bribe') { gameState.currentEnergy += 2; gameState.sequence.push(null); drawCard('any', 1); }
  if (id === 'godfathers_decree') {
   gameState.enemies.forEach((e, idx) => { if (e.hp > 0) e.hp = Math.max(0, e.hp - 20); });
   addPlayerShield(20, srcPos.x, srcPos.y);
   gameState.currentEnergy += 1;
  }
  if (id === 'paradox_anchor') { gameState.currentEnergy += 1; drawCard('tome', 1); }
  if (id === 'syndicate_armory') { gainNotoriety(3, srcPos.x, srcPos.y); }
  if (id === 'chrono_catalyst') { gameState.currentEnergy += 1; drawCard('any', 1); }
  return;
 }

 // Attack Cards
 playCardVFX(id, srcPos, tgtPos);

 let baseDmg = cardDef.value || 0;
 if (id === 'volatile_reserve') baseDmg += (entry.turnsStored || 0) * 6;
 if (id === 'mana_overload') baseDmg += (gameState.manaSpentThisTurn || 0) * 6;
 if (id === 'patience_fury' && gameState.restBonusActiveThisTurn) {
  baseDmg = 24;
  addPlayerShield(8, srcPos.x, srcPos.y);
 }
 if (id === 'shield_slam') {
  baseDmg = gameState.player.shield || 0;
  gameState.player.shield = 0;
 }
 if (id === 'titans_counterblow') {
  baseDmg += Math.round((gameState.player.shield || 0) * 0.5);
 }
 if (id === 'cleaving_execution' && (gameState.player.shield || 0) >= 15) baseDmg += 10;
 if (id === 'venom_surge') baseDmg += slotIdx * 2;
 if (id === 'entropy_bolt') {
  const emptySlots = gameState.sequence.filter(s => s === null).length;
  baseDmg += emptySlots * 4;
 }
 if (id === 'capacitor_discharge') {
  baseDmg = (gameState.parts || 0) * 5;
  gameState.parts = 0;
 }
 if (id === 'scrap_cannon') baseDmg += (gameState.scrapsUsedThisTurn || 0) * 6;
 if (id === 'hemorrhagic_rupture') {
  const target = gameState.enemies.find(e => e.hp > 0);
  if (target) baseDmg += (target.hemorrhage || 0) * 4;
 }
 if (id === 'concrete_shoes') baseDmg += (gameState.enforcers || []).length * 5;

 const isAoE = ['astral_singularity', 'cleaving_execution', 'temporal_fracture', 'drive_by_ambush', 'astral_resonance'].includes(id);
 let hits = cardDef.hits || 1;
 if (id === 'rift_strike' && entry.fromVault) hits = 2;

 for (let h = 0; h < hits; h++) {
  if (isAoE) {
   gameState.enemies.forEach((e, idx) => {
    if (e.hp > 0) dealDamageToSpecificEnemy(e, idx, Math.round(baseDmg * echoScale), slotIdx, entry, cardDef);
   });
  } else {
   dealDamageToTarget(Math.round(baseDmg * echoScale), slotIdx, entry, cardDef);
  }
  if (hits > 1 && h < hits - 1) await sleep(110);
 }

 // On-Hit / Post-Attack Secondary Effects
 const target = gameState.enemies.find(e => e.hp > 0);
 if (id === 'spark') gainMana(1, srcPos.x, srcPos.y);
 if (id === 'astral_singularity') gameState.currentEnergy += 1;
 if (id === 'venom_spreader' && target) target.poison = (target.poison || 0) + Math.min(5, target.poison || 0);
 if (id === 'shadow_prep') {
  gameState.enemies.forEach(e => { if (e.hp > 0) e.poison = (e.poison || 0) + 3; });
  gameState.restBonusActiveNextTurn = true;
 }
 if (id === 'venom_surge' && target) target.poison = (target.poison || 0) + slotIdx * 3;
 if (id === 'catalytic_rupture' && target && (target.poison || 0) > 0) {
  const burst = Math.round(target.poison * 1.5);
  target.poison = 0;
  dealDamageToTarget(burst, slotIdx, entry, cardDef);
 }
 if (id === 'nightblade_ambush' && target && (target.poison || 0) > 0) gameState.currentEnergy += 1;
 if (id === 'chrono_slash' && slotIdx === 0) gainChronos(1, srcPos.x, srcPos.y);
 if (id === 'stasis_condenser') (gameState.vault || []).forEach(v => { v.turnsStored += 2; });
 if (id === 'temporal_fracture') gameState.guaranteedDodgeCount += 1;
 if (id === 'wrench_toss' || id === 'salvage_magnet') gainParts(1, srcPos.x, srcPos.y);
 if (id === 'thermite_rivets' && target && (gameState.turrets || []).length > 0) target.burn = (target.burn || 0) + 5;
 if (id === 'siphon_slash') healPlayerHp(3, srcPos.x, srcPos.y);
 if (id === 'blood_boil' && target) triggerHemorrhageOnEnemy(target, enemySprites[gameState.enemies.indexOf(target)], 2, false);
 if (id === 'crimson_frenzy' && gameState.player.hp < gameState.player.maxHp * 0.5) healPlayerHp(6, srcPos.x, srcPos.y);
 if (id === 'crimson_ascension') healPlayerHp(gameState.player.hp < gameState.player.maxHp * 0.5 ? 14 : 8, srcPos.x, srcPos.y);
 if (id === 'tommy_gun_spray') gainCash(5, srcPos.x, srcPos.y);
 if (id === 'shakedown') gainCash((target && target.hp < target.maxHp * 0.5) ? 24 : 12, srcPos.x, srcPos.y);
 if (id === 'kingpins_ultimatum') { gameState.gold += 15; spawnCashExplosionVFX(tgtPos.x, tgtPos.y, 1.4); }
 if (id === 'tommy_drum_extortion') gainCash(20, srcPos.x, srcPos.y);
 if (id === 'chicago_typewriter') gainCash(8, srcPos.x, srcPos.y);
 if (id === 'golden_peacemaker') gainCash(15, srcPos.x, srcPos.y);
 if (id === 'royal_flush') {
  addPlayerShield(15, srcPos.x, srcPos.y);
  healPlayerHp(10, srcPos.x, srcPos.y);
  gameState.currentEnergy += 1;
  gainCash(20, srcPos.x, srcPos.y, '+$20 ROYAL FLUSH!', true);
 }
 if (id === 'astral_resonance') addPlayerShield(8, srcPos.x, srcPos.y);
 if (id === 'scrap_engine') gameState.nextScrapBonusEnergy += 2;
}

function dealDamageToTarget(rawDmg, slotIdx, entry, cardDef) {
 const target = gameState.enemies.find(e => e.hp > 0);
 if (!target) return;
 const tIdx = gameState.enemies.indexOf(target);
 dealDamageToSpecificEnemy(target, tIdx, rawDmg, slotIdx, entry, cardDef);
}

function dealDamageToSpecificEnemy(target, tIdx, rawDmg, slotIdx, entry, cardDef) {
 if (!target || target.hp <= 0) return;
 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);
 const tSprite = enemySprites[tIdx] || { x: 750, y: 132 };

 let dmg = rawDmg + (gameState.nextHitBonusDmg || 0);
 gameState.nextHitBonusDmg = 0;

 // Mastery & Relic Damage Multipliers
 if (cls === 'Mage' && unl[2] && cardDef.category === 'tome') dmg *= 1.20;
 if (cls === 'Warrior' && unl[1] && (gameState.player.shield || 0) >= 15) dmg *= 1.25;
 if (entry && entry.fromVault) {
  const hgTier = gameState.passives.CHRONO_HOURGLASS || 0;
  const chronoT1 = (cls === 'Chronomancer' && unl[0]) ? 0.10 : 0;
  dmg *= (1 + hgTier * 0.15 + chronoT1);
 }
 if (slotIdx === 1 && (gameState.passives.TIME_WARP || 0) >= 3) dmg *= 1.35;

 const frenzyTier = gameState.passives.FRENZY || 0;
 if (frenzyTier > 0) {
  const missingPct = Math.max(0, 1 - (gameState.player.hp / gameState.player.maxHp));
  dmg *= (1 + missingPct * 0.5 * frenzyTier);
 }

 // Crit Roll
 let isCrit = gameState.guaranteedCritNextAttack || false;
 gameState.guaranteedCritNextAttack = false;
 if (!gameState.firstAttackUsedThisTurn && cls === 'Rogue' && unl[3]) {
  isCrit = true;
 }
 gameState.firstAttackUsedThisTurn = true;
 if (!isCrit && Math.random() < getEffectiveCritChance()) isCrit = true;
 gameState.nextHitCritBonus = 0;

 if (isCrit) {
  const bfTier = gameState.passives.BLACK_FLASH || 0;
  let critMult = bfTier >= 3 ? 2.25 : 2.0;
  if (cls === 'Rogue' && unl[3]) critMult = Math.max(critMult, 2.5);
  if (cardDef.id === 'golden_peacemaker') critMult = 2.5;
  if (cls === 'Blood Reaver' && unl[1] && (target.hemorrhage || 0) > 0) critMult += 0.25;
  dmg *= critMult;

  if (bfTier > 0) {
   spawnBlackFlashVFX(tSprite.x, tSprite.y, bfTier);
   spawnBlackFlashBanner(tSprite.x, tSprite.y - 68);
  }
  if (cls === 'Mob Boss' && unl[0]) gainCash(8, tSprite.x, tSprite.y);
 }

 const finalDmg = Math.max(1, Math.round(dmg));
 target.hp = Math.max(0, target.hp - finalDmg);

 // Apply Status Stacks
 if (cardDef.poison) target.poison = (target.poison || 0) + cardDef.poison;
 if (cardDef.hemorrhage || gameState.nextHitBonusHemorrhage > 0) {
  target.hemorrhage = (target.hemorrhage || 0) + (cardDef.hemorrhage || 0) + (gameState.nextHitBonusHemorrhage || 0);
  gameState.nextHitBonusHemorrhage = 0;
 }
 if (cardDef.burn) target.burn = (target.burn || 0) + cardDef.burn;
 if (slotIdx === 2 && (gameState.passives.IGNITION || 0) > 0) {
  target.burn = (target.burn || 0) + gameState.passives.IGNITION * 5;
 }

 // Lifesteal
 if (cls === 'Blood Reaver' && unl[2] && gameState.player.hp < gameState.player.maxHp * 0.4) {
  const lsRatio = isCrit ? 1.0 : 0.30;
  healPlayerHp(Math.max(1, Math.round(finalDmg * lsRatio)), 200, 115);
 } else if ((gameState.passives.FRENZY || 0) >= 3) {
  healPlayerHp(Math.max(1, Math.round(finalDmg * 0.15)), 200, 115);
 }

 // Rogue T3 Executioner
 if (cls === 'Rogue' && unl[2] && target.hp > 0 && target.hp < target.maxHp * 0.20) {
  target.hp = 0;
  spawnFloatingText(tSprite.x, tSprite.y - 45, '☠️ EXECUTED!', '#4ade80');
 }

 spawnFloatingText(
  tSprite.x,
  tSprite.y - 20,
  isCrit ? `💥 CRIT -${finalDmg}!` : `-${finalDmg}`,
  isCrit ? '#ff2a55' : '#f8fafc'
 );

 if (target.hp <= 0) {
  onEnemyKilled(target, tSprite, cardDef);
 }
}

function onEnemyKilled(enemy, tSprite, cardDef) {
 gameState.masteryProgress.totalEnemiesKilled = (gameState.masteryProgress.totalEnemiesKilled || 0) + 1;
 saveMasteryProgress();

 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);

 if (cardDef && cardDef.id === 'void_cataclysm') gainMana(1, 200, 115);
 if (cls === 'Rogue' && unl[2]) healPlayerHp(10, 200, 115);
 if (cls === 'Mob Boss' && unl[0]) gainCash(8, tSprite.x, tSprite.y);

 if (enemy.hasBountyLock) {
  enemy.hasBountyLock = false;
  const bountyCash = (cls === 'Mob Boss' && unl[2]) ? 50 : 25;
  gainCash(bountyCash, tSprite.x, tSprite.y, `🎯 BOUNTY CLAIMED +$${bountyCash}!`, true);
  gameState.gold += 15;
  gainNotoriety(6, tSprite.x, tSprite.y);
 }
}

// --- ENEMY TURN RESOLUTION ---
async function executeEnemyTurn() {
 const cls = gameState.classType;
 const unl = getClassUnlockedArray(cls);

 // 1. DoT Ticks (Poison, Burn, Hemorrhage)
 for (let i = 0; i < gameState.enemies.length; i++) {
  const e = gameState.enemies[i];
  if (e.hp <= 0) continue;
  const eSprite = enemySprites[i] || { x: 750, y: 132 };

  if ((e.poison || 0) > 0) {
   e.hp = Math.max(0, e.hp - e.poison);
   spawnFloatingText(eSprite.x, eSprite.y - 22, `🧪 -${e.poison} POISON`, '#4ade80');
   e.poison = Math.max(0, e.poison - 1);
  }
  if (e.hp > 0 && (e.burn || 0) > 0) {
   e.hp = Math.max(0, e.hp - e.burn);
   spawnFloatingText(eSprite.x, eSprite.y - 36, `🔥 -${e.burn} BURN`, '#f97316');
   e.burn = Math.max(0, e.burn - 1);
  }
  if (e.hp > 0 && (e.hemorrhage || 0) > 0) {
   const prevHp = e.hp;
   triggerHemorrhageOnEnemy(e, eSprite, 1, true);
   if (prevHp > 0 && e.hp <= 0 && cls === 'Blood Reaver' && unl[1]) {
    healPlayerHp(12, 200, 115, 'CRIMSON RESONANCE +12 HP');
   }
  }
  if (e.hp <= 0) onEnemyKilled(e, eSprite, null);
 }

 if (checkAllEnemiesDefeated()) {
  handleCombatVictory();
  return;
 }

 // 2. Enemy Attacks / Actions
 for (let i = 0; i < gameState.enemies.length; i++) {
  const e = gameState.enemies[i];
  if (e.hp <= 0) continue;
  const eSprite = enemySprites[i] || { x: 750, y: 132 };
  const intent = (e.sequence && e.sequence[0]) || { name: 'Attack', type: 'ATTACK', value: e.atk || 10 };

  if (intent.type === 'HEAL') {
   e.hp = Math.min(e.maxHp, e.hp + intent.value);
   spawnFloatingText(eSprite.x, eSprite.y - 24, `+${intent.value} HEAL`, '#4ade80');
  } else if (intent.type === 'DEFEND') {
   e.hp = Math.min(e.maxHp, e.hp + Math.round(intent.value * 0.5));
   spawnFloatingText(eSprite.x, eSprite.y - 24, `🛡️ FORTIFIED`, '#38bdf8');
  } else {
   let incoming = Math.max(1, Math.round((intent.value || e.atk || 10) * (gameState.intimidateMultiplier || 1.0)));

   // Frontline Hired Enforcer Intercept
   if ((gameState.enforcers || []).length > 0) {
    const frontEnf = gameState.enforcers[0];
    const absorbed = Math.min(frontEnf.hp, incoming);
    frontEnf.hp -= absorbed;
    incoming -= absorbed;
    spawnFloatingText(255, 95, `🎩 ENFORCER SOAKED -${absorbed}`, '#eab308');
    if (cls === 'Mob Boss' && unl[1]) {
     e.hp = Math.max(0, e.hp - 6);
     spawnFloatingText(eSprite.x, eSprite.y - 28, 'RETALIATION -6', '#eab308');
    }
    if (frontEnf.hp <= 0) gameState.enforcers.shift();
   }

   // Artificer Construct Intercept
   if (incoming > 0 && (gameState.turrets || []).length > 0) {
    const frontTurret = gameState.turrets[0];
    const spec = CONSTRUCT_CATALOG[frontTurret.type] || CONSTRUCT_CATALOG.auto_turret;
    if (Math.random() < (spec.interceptRatio || 0.5)) {
     const absorbed = Math.min(frontTurret.hp, incoming);
     frontTurret.hp -= absorbed;
     incoming -= absorbed;
     spawnFloatingText(250, 95, `⚙️ CONSTRUCT INTERCEPT -${absorbed}`, '#f59e0b');
     if (gameState.reactiveArmorActive) {
      gainParts(1, 200, 115);
      e.hp = Math.max(0, e.hp - 5);
     }
     if (frontTurret.hp <= 0) gameState.turrets.shift();
    }
   }

   // Player Dodge Check
   if (incoming > 0) {
    let dodged = false;
    if ((gameState.guaranteedDodgeCount || 0) > 0) {
     gameState.guaranteedDodgeCount -= 1;
     dodged = true;
    } else if (Math.random() < getEffectiveDodgeChance()) {
     dodged = true;
    }

    if (dodged) {
     spawnFloatingText(200, 105, '💨 DODGED!', '#4ade80');
     triggerRogueShadowCounter(200, 125);
     if ((gameState.passives.SHADOW_WEAVE || 0) >= 3) {
      healPlayerHp(Math.max(1, Math.round(gameState.player.maxHp * 0.05)), 200, 115);
     }
     incoming = 0;
    }
   }

   // Thorns / Deflection Reflection
   if (incoming > 0) {
    const deflTier = gameState.passives.DEFLECTION || 0;
    const thorns = (gameState.reflectDamageThisTurn || 0) + (cls === 'Warrior' && unl[3] ? 4 : 0) + (deflTier >= 3 ? Math.round(incoming * 0.5) : 0);
    if (thorns > 0) {
     e.hp = Math.max(0, e.hp - thorns);
     spawnFloatingText(eSprite.x, eSprite.y - 30, `🛡️ REFLECT -${thorns}`, '#38bdf8');
    }

    // Apply to Player Shield then HP
    if (gameState.player.shield > 0) {
     const blocked = Math.min(gameState.player.shield, incoming);
     gameState.player.shield -= blocked;
     incoming -= blocked;
    }
    if (incoming > 0) {
     gameState.player.hp = Math.max(0, gameState.player.hp - incoming);
     triggerScreenShake(8, 12);
     spawnFloatingText(200, 110, `-${incoming} HP`, '#ef4444');
    }
   }
  }

  // Rotate enemy intent
  if (e.sequence && e.sequence.length > 1) {
   e.sequence.push(e.sequence.shift());
  }
  await sleep(280);

  if (gameState.player.hp <= 0) {
   if (cls === 'Warrior' && unl[2] && !gameState.secondWindUsed) {
    gameState.secondWindUsed = true;
    gameState.player.hp = Math.max(1, Math.round(gameState.player.maxHp * 0.20));
    addPlayerShield(15, 200, 115);
    showToast('🔥 WARRIOR SECOND WIND ACTIVATED!', 'var(--accent-gold)');
   } else {
    showScreen('screen-gameover');
    return;
   }
  }
 }

 if (checkAllEnemiesDefeated()) {
  handleCombatVictory();
  return;
 }

 startPlayerTurn(false);
}

function checkAllEnemiesDefeated() {
 return (gameState.enemies || []).every(e => e.hp <= 0);
}

function handleCombatVictory() {
 gameState.isExecuting = false;
 if (gameState.isPreviewCombat) {
  showToast('Preview Combat Complete! Returning to Title.', 'var(--accent-green)');
  showScreen('screen-title');
  return;
 }

 const signetTier = gameState.passives.SYNDICATE_SIGNET || 0;
 const goldReward = Math.round((gameState.pendingNodeType === 'BOSS' ? 45 : gameState.pendingNodeType === 'ELITE' ? 30 : 20) * (1 + signetTier * 0.10));
 const cashReward = gameState.pendingNodeType === 'BOSS' ? 30 : 12;
 const notoReward = gameState.pendingNodeType === 'BOSS' ? 12 : 5;

 gameState.gold += goldReward;
 gainCash(cashReward);
 gainNotoriety(notoReward);

 if (gameState.boardNode >= 7) {
  if (gameState.stage === 1) {
   gameState.stage = 2;
   gameState.boardNode = 1;
   gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 25);
   showToast(`👑 STAGE I BOSS DEFEATED! Advancing to STAGE II (+${goldReward}g, +$${cashReward})!`, 'var(--accent-gold)');
   showScreen('screen-board');
   renderBoard();
   return;
  } else {
   gameState.masteryProgress.runsCompleted = (gameState.masteryProgress.runsCompleted || 0) + 1;
   saveMasteryProgress();
   showScreen('screen-victory');
   return;
  }
 }

 gameState.boardNode++;
 showToast(`Victory! +${goldReward}g, +$${cashReward} Cash, +${notoReward} ★`, 'var(--accent-green)');
 showScreen('screen-board');
 renderBoard();
}

// --- COMBAT HUD & INTERACTIVE HAND / SEQUENCE RENDERING ---
function renderCombatUI() {
 const pHp = document.getElementById('hud-player-hp');
 const pShield = document.getElementById('hud-player-shield');
 const pEnergy = document.getElementById('hud-player-energy');
 const pClassRes = document.getElementById('hud-class-resource');
 const handEl = document.getElementById('combat-hand');
 const seqEl = document.getElementById('combat-sequence');
 const vaultEl = document.getElementById('combat-vault');
 const enemiesEl = document.getElementById('combat-enemies-hud');
 const scrapBtnInfo = document.getElementById('hud-scrap-info');

 if (pHp) pHp.innerText = `${gameState.player.hp}/${gameState.player.maxHp}`;
 if (pShield) pShield.innerText = `${gameState.player.shield || 0}`;
 if (pEnergy) pEnergy.innerText = `${gameState.currentEnergy}/${gameState.maxEnergy}`;
 if (scrapBtnInfo) scrapBtnInfo.innerText = `Scrap: ${gameState.scrapsUsedThisTurn}/${gameState.scrapLimit}`;

 if (pClassRes) {
  const cls = gameState.classType;
  if (cls === 'Mage') pClassRes.innerText = `💧 Mana: ${gameState.player.mana}/${gameState.player.maxMana}`;
  else if (cls === 'Chronomancer') pClassRes.innerText = `⏳ Chronos: ${gameState.chronos}/${gameState.maxChronos}`;
  else if (cls === 'Artificer') pClassRes.innerText = `⚙️ Parts: ${gameState.parts}/${gameState.maxParts} | Drones: ${gameState.turrets.length}/3`;
  else if (cls === 'Blood Reaver') pClassRes.innerText = `🩸 Overheal Cap: +${getClassUnlockedArray('Blood Reaver')[3] ? 40 : 25}`;
  else if (cls === 'Mob Boss') pClassRes.innerText = `💵 $${gameState.cash} | ★ ${gameState.notoriety} | Crew: ${gameState.enforcers.length}/3`;
  else pClassRes.innerText = `🎯 Crit: ${Math.round(getEffectiveCritChance() * 100)}% | Dodge: ${Math.round(getEffectiveDodgeChance() * 100)}%`;
 }

 updateAbilityBarLabel();

 if (enemiesEl) {
  enemiesEl.innerHTML = (gameState.enemies || []).map(e => {
   const nextIntent = (e.sequence && e.sequence[0]) || { name: 'Strike', type: 'ATTACK', value: e.atk };
   return `
    <div style="padding:8px 12px;border-radius:10px;background:#0f172a;border:1px solid ${e.hp > 0 ? (e.hasBountyLock ? '#eab308' : '#ef4444') : '#334155'};opacity:${e.hp > 0 ? '1' : '0.45'};min-width:170px;">
     <div style="font-weight:700;font-size:0.84rem;color:#f8fafc;">${e.name} ${e.hasBountyLock ? '🎯' : ''}</div>
     <div style="font-size:0.78rem;color:#fca5a5;">❤️ ${e.hp}/${e.maxHp} HP</div>
     <div style="font-size:0.72rem;color:#94a3b8;">Intent: ${nextIntent.name} (${nextIntent.value})</div>
    </div>
   `;
  }).join('');
 }

 if (seqEl) {
  seqEl.innerHTML = (gameState.sequence || []).map((slot, idx) => {
   if (!slot) {
    return `
     <div class="seq-slot empty" style="width:155px;min-height:92px;border:2px dashed #334155;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:0.8rem;">
      SLOT ${idx + 1}
     </div>
    `;
   }
   const c = CARD_DATABASE[slot.cardId];
   return `
    <div class="seq-slot filled" onclick="unqueueSequenceSlot(${idx})"
     style="width:155px;min-height:92px;padding:8px;border-radius:10px;background:#1e293b;border:2px solid #38bdf8;cursor:pointer;">
     <div style="display:flex;justify-content:space-between;font-size:0.74rem;color:#38bdf8;font-weight:700;">
      <span>SLOT ${idx + 1}</span>
      <span>✕</span>
     </div>
     <strong style="font-size:0.84rem;color:#f8fafc;display:block;margin-top:2px;">${c ? c.name : slot.cardId}</strong>
     <div style="font-size:0.7rem;color:#cbd5e1;margin-top:3px;">${c ? c.text : ''}</div>
    </div>
   `;
  }).join('');
 }

 if (vaultEl) {
  const maxV = getMaxVaultSlots(gameState.classType);
  const slotsHTML = [];
  for (let v = 0; v < maxV; v++) {
   const item = gameState.vault[v];
   if (!item) {
    slotsHTML.push(`<div style="padding:8px 12px;border:1px dashed #475569;border-radius:8px;color:#64748b;font-size:0.76rem;">VAULT ${v + 1} (EMPTY)</div>`);
   } else {
    const c = CARD_DATABASE[item.cardId];
    slotsHTML.push(`
     <div onclick="unvaultCardToSequence(${v})" style="padding:8px 12px;border:1px solid #2dd4bf;background:#0f172a;border-radius:8px;cursor:pointer;font-size:0.78rem;">
      <strong style="color:#2dd4bf;">⏳ ${c ? c.name : item.cardId}</strong>
      <div style="font-size:0.68rem;color:#94a3b8;">Stored ${item.turnsStored || 0}t • Click to Queue</div>
     </div>
    `);
   }
  }
  vaultEl.innerHTML = slotsHTML.join('');
 }

 if (handEl) {
  handEl.innerHTML = (gameState.hand || []).map((id, idx) => {
   const c = CARD_DATABASE[id];
   if (!c) return '';
   const theme = CLASS_THEMES[c.classTag] || { cssColor: '#eab308' };
   const openSlot = Math.max(0, gameState.sequence.findIndex(s => s === null));
   const effCost = getEffectiveCardCost(c, openSlot);
   const costBadge = c.costType === 'mana' ? `${effCost}💧` : c.costType === 'chronos' ? `${effCost}⏳` : c.costType === 'hp' ? `${effCost}🩸` : c.costType === 'cash' ? `$${effCost}` : `${effCost}⚡`;
   return `
    <div class="hand-card" style="width:172px;padding:10px;border-radius:10px;background:#0f172a;border:1.5px solid ${theme.cssColor};display:flex;flex-direction:column;justify-content:space-between;">
     <div onclick="queueCardFromHand(${idx})" style="cursor:pointer;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
       <strong style="font-size:0.86rem;color:#f8fafc;">${c.name}</strong>
       <span style="font-size:0.74rem;font-weight:700;padding:2px 6px;border-radius:5px;background:#1e293b;color:#fef08a;">${costBadge}</span>
      </div>
      <div style="font-size:0.68rem;color:${theme.cssColor};margin-top:2px;">${c.classTag} • ${c.type}</div>
      <p style="font-size:0.74rem;color:#cbd5e1;margin:6px 0 8px;line-height:1.3;">${c.text}</p>
     </div>
     <div style="display:flex;gap:4px;">
      <button class="btn-primary" style="flex:1;padding:3px 6px;font-size:0.7rem;" onclick="queueCardFromHand(${idx})">QUEUE</button>
      <button class="btn-secondary" style="padding:3px 6px;font-size:0.7rem;" onclick="vaultCardFromHand(${idx})" title="Store in Stasis Vault">⏳</button>
      <button class="btn-secondary" style="padding:3px 6px;font-size:0.7rem;color:#fca5a5;border-color:#ef4444;" onclick="scrapCardFromHand(${idx})" title="Scrap Card">♻️</button>
     </div>
    </div>
   `;
  }).join('');
 }
}

document.addEventListener('DOMContentLoaded', () => {
 selectClass(gameState.classType || 'Rogue');
 window.updateBuilderLockBadges();
});
