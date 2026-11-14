// --- ATTACK LUNGES, FLOATING COMBAT NUMBERS & HEARTHSTONE CARD PREVIEWS ---
(function () {
  // 1. Inject Hearthstone-style dynamic number & breakdown pill CSS
  if (!document.getElementById('combat-juice-css')) {
    const style = document.createElement('style');
    style.id = 'combat-juice-css';
    style.textContent = `
      .hs-num-buffed {
        color: #4ade80 !important;
        font-weight: 900;
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.65);
      }
      .hs-num-nerfed {
        color: #f87171 !important;
        font-weight: 900;
        text-shadow: 0 0 8px rgba(248, 113, 113, 0.55);
      }
      .hs-num-scaling {
        color: #38bdf8 !important;
        font-weight: 800;
      }
      .hand-card {
        position: relative;
      }
      .hs-preview-pill {
        position: absolute;
        top: -11px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid #4ade80;
        color: #bbf7d0;
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
        opacity: 0;
        transition: opacity 0.14s ease, transform 0.14s ease;
        z-index: 25;
      }
      .hand-card:hover .hs-preview-pill {
        opacity: 1;
        transform: translateX(-50%) translateY(-3px);
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // PART A: PIXI ATTACK LUNGES, HIT FLASH & FLOATING DAMAGE NUMBERS
  // =========================================================================
  const activeFloaters = [];
  const activeLunges = [];
  let popupStagger = 0;

  function getHeroDisplayObj() {
    if (typeof playerContainer !== 'undefined' && playerContainer) return playerContainer;
    if (typeof playerSprite !== 'undefined' && playerSprite) return playerSprite;
    return null;
  }

  function getEnemyDisplayObj(index = 0) {
    if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
      const alive = enemyEntities.filter(e => e && e.container && (!e.data || e.data.hp > 0));
      const target = enemyEntities[index] && enemyEntities[index].container
        ? enemyEntities[index]
        : alive[0];
      if (target && target.container) return target.container;
    }
    if (typeof enemySprites !== 'undefined' && Array.isArray(enemySprites) && enemySprites[index]) {
      return enemySprites[index];
    }
    return null;
  }

  function triggerLunge(displayObj, dir = 1) {
    if (!displayObj) return;
    // Remove existing lunge on same unit so rapid hits snap cleanly
    for (let i = activeLunges.length - 1; i >= 0; i--) {
      if (activeLunges[i].obj === displayObj) activeLunges.splice(i, 1);
    }
    activeLunges.push({
      obj: displayObj,
      dir,
      elapsed: 0,
      duration: 260
    });
  }

  function triggerHitFlash(displayObj, tintColor = 0xff5555) {
    if (!displayObj) return;
    const targets = displayObj.children && displayObj.children.length > 0
      ? displayObj.children
      : [displayObj];
    targets.forEach(child => {
      if ('tint' in child) {
        const origTint = child.tint;
        child.tint = tintColor;
        setTimeout(() => {
          if (child && !child.destroyed) child.tint = origTint;
        }, 120);
      }
    });
  }

  function spawnFloatingNumber(targetObj, text, type = 'damage') {
    if (typeof pixiApp === 'undefined' || !pixiApp || !targetObj) return;

    const palette = {
      damage: { fill: '#ff4d4f', stroke: '#1f0505', size: 22 },
      crit:   { fill: '#facc15', stroke: '#271500', size: 26 },
      shield: { fill: '#38bdf8', stroke: '#041d2e', size: 20 },
      heal:   { fill: '#4ade80', stroke: '#042411', size: 20 },
      status: { fill: '#e879f9', stroke: '#240529', size: 18 }
    };
    const cfg = palette[type] || palette.damage;

    const delay = popupStagger * 95;
    popupStagger = (popupStagger + 1) % 4;
    setTimeout(() => { popupStagger = Math.max(0, popupStagger - 1); }, 320);

    setTimeout(() => {
      if (!pixiApp || !targetObj || targetObj.destroyed) return;

      const label = new PIXI.Text(text, {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: cfg.size,
        fontWeight: '900',
        fill: cfg.fill,
        stroke: cfg.stroke,
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowDistance: 2
      });

      label.anchor.set(0.5);
      const scatterX = (Math.random() - 0.5) * 34;
      label.x = targetObj.x + scatterX;
      label.y = targetObj.y - 34;
      label.scale.set(0.65);

      const layer = (typeof vfxContainer !== 'undefined' && vfxContainer)
        ? vfxContainer
        : pixiApp.stage;
      layer.addChild(label);

      activeFloaters.push({
        sprite: label,
        vx: scatterX * 0.015,
        vy: -1.65,
        life: 0,
        maxLife: 52
      });
    }, delay);
  }

  // Expose globally so any custom card effect can call them directly too
  window.spawnFloatingNumber = spawnFloatingNumber;
  window.triggerUnitLunge = triggerLunge;

  // Frame loop for smooth lunges & floating text physics
  function ensureJuiceTicker() {
    if (typeof pixiApp === 'undefined' || !pixiApp || pixiApp.__combatJuiceTicker) return;
    pixiApp.__combatJuiceTicker = true;

    pixiApp.ticker.add((delta) => {
      const dtMs = delta * 16.67;

      // Update lunges
      for (let i = activeLunges.length - 1; i >= 0; i--) {
        const L = activeLunges[i];
        L.elapsed += dtMs;
        const p = Math.min(1, L.elapsed / L.duration);
        // Fast forward dash (0 -> 0.35), smooth spring return (0.35 -> 1.0)
        const curve = p < 0.35
          ? (p / 0.35)
          : (1 - (p - 0.35) / 0.65);

        L.obj.__lungeX = Math.round(curve * 48 * L.dir);
        L.obj.rotation = curve * 0.09 * L.dir;

        if (p >= 1) {
          L.obj.__lungeX = 0;
          L.obj.rotation = 0;
          activeLunges.splice(i, 1);
        }
      }

      // Update floating numbers
      for (let i = activeFloaters.length - 1; i >= 0; i--) {
        const F = activeFloaters[i];
        F.life += delta;
        const progress = F.life / F.maxLife;

        F.sprite.x += F.vx * delta;
        F.sprite.y += F.vy * delta;
        F.vy *= 0.96; // Ease upward velocity

        // Pop scale in, then hold
        const s = progress < 0.18
          ? 0.65 + (progress / 0.18) * 0.45
          : 1.1 - Math.max(0, progress - 0.6) * 0.35;
        F.sprite.scale.set(s);

        if (progress > 0.65) {
          F.sprite.alpha = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        if (progress >= 1) {
          if (F.sprite.parent) F.sprite.parent.removeChild(F.sprite);
          F.sprite.destroy();
          activeFloaters.splice(i, 1);
        }
      }
    });
  }

  // Automatic HP / Shield delta tracker (catches ALL damage, heals, shields & multi-hits)
  let lastSnapshot = null;

  function captureCombatSnapshot() {
    if (typeof gameState === 'undefined' || !gameState || gameState.screen !== 'BATTLE') {
      lastSnapshot = null;
      return;
    }
    lastSnapshot = {
      hp: gameState.hp || 0,
      shield: gameState.shield || 0,
      enemies: Array.isArray(gameState.enemies)
        ? gameState.enemies.map(e => ({
            hp: e ? (e.hp || 0) : 0,
            shield: e ? (e.shield || 0) : 0
          }))
        : []
    };
  }

  function diffCombatSnapshot() {
    if (typeof gameState === 'undefined' || !gameState || gameState.screen !== 'BATTLE') {
      lastSnapshot = null;
      return;
    }
    if (!lastSnapshot) {
      captureCombatSnapshot();
      return;
    }

    ensureJuiceTicker();
    const heroObj = getHeroDisplayObj();

    // Check enemy HP / Shield changes
    if (Array.isArray(gameState.enemies)) {
      gameState.enemies.forEach((enemy, idx) => {
        const prev = lastSnapshot.enemies[idx];
        if (!enemy || !prev) return;

        const enemyObj = getEnemyDisplayObj(idx);
        const hpLoss = prev.hp - (enemy.hp || 0);
        const shieldLoss = prev.shield - (enemy.shield || 0);
        const shieldGain = (enemy.shield || 0) - prev.shield;

        if (hpLoss > 0) {
          triggerLunge(heroObj, 1);
          triggerHitFlash(enemyObj, 0xff5555);
          const totalHit = hpLoss + Math.max(0, shieldLoss);
          spawnFloatingNumber(
            enemyObj,
            totalHit >= 15 ? `-${totalHit} 💥` : `-${totalHit}`,
            totalHit >= 15 ? 'crit' : 'damage'
          );
        } else if (shieldLoss > 0) {
          triggerLunge(heroObj, 1);
          triggerHitFlash(enemyObj, 0x38bdf8);
          spawnFloatingNumber(enemyObj, `-${shieldLoss} 🛡️`, 'shield');
        }

        if (shieldGain > 0) {
          spawnFloatingNumber(enemyObj, `+${shieldGain} 🛡️`, 'shield');
        }
      });
    }

    // Check player HP / Shield changes
    const playerHpDiff = (gameState.hp || 0) - lastSnapshot.hp;
    const playerShieldDiff = (gameState.shield || 0) - lastSnapshot.shield;

    if (playerHpDiff < 0) {
      const dmg = Math.abs(playerHpDiff) + Math.max(0, -playerShieldDiff);
      triggerLunge(getEnemyDisplayObj(0), -1);
      triggerHitFlash(heroObj, 0xff5555);
      spawnFloatingNumber(heroObj, `-${dmg}`, 'damage');
    } else if (playerShieldDiff < 0) {
      triggerLunge(getEnemyDisplayObj(0), -1);
      triggerHitFlash(heroObj, 0x38bdf8);
      spawnFloatingNumber(heroObj, `${playerShieldDiff} 🛡️`, 'shield');
    }

    if (playerHpDiff > 0) {
      spawnFloatingNumber(heroObj, `+${playerHpDiff} ❤️`, 'heal');
    }
    if (playerShieldDiff > 0) {
      spawnFloatingNumber(heroObj, `+${playerShieldDiff} 🛡️`, 'shield');
    }

    captureCombatSnapshot();
  }

  // Poll cleanly during active battle so even async sequence steps animate individually
  setInterval(() => {
    if (typeof gameState !== 'undefined' && gameState && gameState.screen === 'BATTLE') {
      diffCombatSnapshot();
    } else {
      lastSnapshot = null;
    }
  }, 80);

  // =========================================================================
  // PART B: HEARTHSTONE-INSPIRED LIVE CARD STAT & DAMAGE PREVIEW
  // =========================================================================
  let isUpdatingCards = false;

  function getCombatModifiers() {
    const gs = typeof gameState !== 'undefined' ? gameState : null;
    if (!gs) return { flatDmg: 0, dmgMult: 1, flatShield: 0, restBonus: false, targetVuln: false, targetHemo: 0 };

    const buffs = gs.playerBuffs || gs.buffs || {};
    const flatDmg = (gs.strength || 0) + (buffs.strength || 0) + (buffs.attackBoost || 0) + (buffs.empower || 0);
    const flatShield = (gs.dexterity || 0) + (buffs.dexterity || 0) + (buffs.shieldBoost || 0);
    const restBonus = Boolean(gs.restBonusActive || gs.restBonus || buffs.restBonus);

    // Check front alive enemy debuffs
    const frontEnemy = Array.isArray(gs.enemies)
      ? gs.enemies.find(e => e && e.hp > 0)
      : null;
    const eStatus = frontEnemy ? (frontEnemy.statuses || frontEnemy.debuffs || {}) : {};
    const targetVuln = Boolean((frontEnemy && frontEnemy.vulnerable > 0) || eStatus.vulnerable > 0);
    const targetHemo = (frontEnemy && (frontEnemy.hemorrhage || frontEnemy.bleed)) || eStatus.hemorrhage || eStatus.bleed || 0;

    // Optional relic bonuses
    let relicFlatDmg = 0;
    let relicFlatShield = 0;
    if (Array.isArray(gs.relics)) {
      gs.relics.forEach(r => {
        const id = typeof r === 'string' ? r : (r && r.id);
        if (id === 'whetstone' || id === 'plasma_edge') relicFlatDmg += 2;
        if (id === 'aegis_core' || id === 'alloy_plating') relicFlatShield += 2;
      });
    }

    return {
      flatDmg: flatDmg + relicFlatDmg,
      dmgMult: targetVuln ? 1.5 : 1,
      flatShield: flatShield + relicFlatShield,
      restBonus,
      targetVuln,
      targetHemo
    };
  }

  function formatHearthstoneNumber(baseVal, finalVal, suffix) {
    if (finalVal > baseVal) {
      return `<span class="hs-num-buffed">*${finalVal}*</span>${suffix}`;
    }
    if (finalVal < baseVal) {
      return `<span class="hs-num-nerfed">*${finalVal}*</span>${suffix}`;
    }
    return `${baseVal}${suffix}`;
  }

  function updateHearthstoneCardPreviews() {
    if (isUpdatingCards) return;
    const container = document.getElementById('hand-cards-container');
    if (!container) return;

    const cards = container.querySelectorAll('.hand-card');
    if (!cards.length) return;

    isUpdatingCards = true;
    try {
      const mods = getCombatModifiers();

      cards.forEach(cardEl => {
        // Locate description element inside card
        const descEl = cardEl.querySelector('.card-desc, .card-description, p')
          || Array.from(cardEl.children).find(el =>
               el.tagName === 'DIV' &&
               !el.className.includes('header') &&
               !el.className.includes('type') &&
               !el.className.includes('actions') &&
               /\d/.test(el.textContent)
             );

        if (!descEl) return;

        if (!descEl.dataset.hsRawText) {
          descEl.dataset.hsRawText = descEl.textContent.trim();
        }
        const raw = descEl.dataset.hsRawText;
        let html = raw;
        const notes = [];

        // 1. Scale Damage numbers (e.g., "+18 Physical DMG", "10 DMG", "for 5 DMG")
        html = html.replace(/(\+?)(\d+)(\s*(?:Physical\s+|Phys\s+)?DMG\b)/gi, (match, plus, numStr, suffix) => {
          const base = parseInt(numStr, 10);
          // Skip "per stack" base multipliers so we handle them separately below
          if (/per\s+stack/i.test(raw.slice(raw.indexOf(match), raw.indexOf(match) + match.length + 14))) {
            return match;
          }
          const finalVal = Math.max(0, Math.round((base + mods.flatDmg) * mods.dmgMult));
          if (finalVal !== base) {
            const reasons = [];
            if (mods.flatDmg) reasons.push(`${mods.flatDmg > 0 ? '+' : ''}${mods.flatDmg} Buff`);
            if (mods.targetVuln) reasons.push('+50% Vuln');
            notes.push(`${base} → ${finalVal} DMG (${reasons.join(', ')})`);
          }
          return `${plus}${formatHearthstoneNumber(base, finalVal, suffix)}`;
        });

        // 2. Scale Shield numbers (e.g., "+12 Armor Shield", "+8 Shield")
        html = html.replace(/(\+?)(\d+)(\s*(?:Armor\s+)?Shield\b)/gi, (match, plus, numStr, suffix) => {
          const base = parseInt(numStr, 10);
          const finalVal = Math.max(0, base + mods.flatShield);
          if (finalVal !== base) {
            notes.push(`${base} → ${finalVal} Shield (+${mods.flatShield} Buff)`);
          }
          return `${plus}${formatHearthstoneNumber(base, finalVal, suffix)}`;
        });

        // 3. Highlight active Rest Bonus Turn values (e.g., "If Rest Bonus Turn: 24 DMG & +8 Shield")
        if (mods.restBonus && /Rest Bonus Turn/i.test(html)) {
          html = html.replace(/(Rest Bonus Turn:\s*)([^.]+)/i, (_, prefix, bonusPart) => {
            return `${prefix}<span class="hs-num-buffed">${bonusPart}</span>`;
          });
          notes.push('Rest Bonus Active!');
        }

        // 4. Live Hemorrhage / Stack consumer calculation (e.g., "deal 2 DMG & heal 4 HP per stack")
        if (mods.targetHemo > 0 && /per\s+stack/i.test(raw)) {
          const dmgMatch = raw.match(/deal\s+(\d+)\s*DMG/i);
          const healMatch = raw.match(/heal\s+(\d+)\s*HP/i);
          const totalDmg = dmgMatch ? parseInt(dmgMatch[1], 10) * mods.targetHemo : 0;
          const totalHeal = healMatch ? parseInt(healMatch[1], 10) * mods.targetHemo : 0;
          const parts = [];
          if (totalDmg > 0) parts.push(`${totalDmg} DMG`);
          if (totalHeal > 0) parts.push(`${totalHeal} Heal`);
          if (parts.length > 0) {
            html += ` <span class="hs-num-scaling">[${mods.targetHemo} stacks = ${parts.join(' / ')}]</span>`;
            notes.push(`${mods.targetHemo} Stacks Ready`);
          }
        }

        descEl.innerHTML = html;

        // Add or remove Hearthstone floating breakdown pill above the card
        let pill = cardEl.querySelector('.hs-preview-pill');
        if (notes.length > 0) {
          if (!pill) {
            pill = document.createElement('div');
            pill.className = 'hs-preview-pill';
            cardEl.appendChild(pill);
          }
          pill.textContent = `✦ ${notes[0]}`;
        } else if (pill) {
          pill.remove();
        }
      });
    } finally {
      isUpdatingCards = false;
    }
  }

  function installCardPreviewObserver() {
    const handContainer = document.getElementById('hand-cards-container');
    if (handContainer && typeof MutationObserver !== 'undefined' && !handContainer.__hsObserver) {
      handContainer.__hsObserver = true;
      new MutationObserver(() => {
        // Clear cached raw text if card DOM was freshly rebuilt
        handContainer.querySelectorAll('.hand-card').forEach(c => {
          const p = c.querySelector('.card-desc, .card-description, p');
          if (p && !p.innerHTML.includes('hs-num-')) {
            p.dataset.hsRawText = p.textContent.trim();
          }
        });
        updateHearthstoneCardPreviews();
      }).observe(handContainer, { childList: true, subtree: true });
    }

    if (typeof window.updateBattleUI === 'function' && !window.updateBattleUI.__hsWrapped) {
      const origUpdate = window.updateBattleUI;
      const wrappedUpdate = function (...args) {
        const res = origUpdate.apply(this, args);
        updateHearthstoneCardPreviews();
        return res;
      };
      wrappedUpdate.__hsWrapped = true;
      window.updateBattleUI = wrappedUpdate;
    }
  }

  window.updateHearthstoneCardPreviews = updateHearthstoneCardPreviews;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installCardPreviewObserver);
  } else {
    installCardPreviewObserver();
  }
})();
