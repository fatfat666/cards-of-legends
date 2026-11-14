// --- BLOOD REAVER & CHRONOMANCER STAGE AURAS & REACTIVE VFX (v0.8.4) ---
(function () {
  let auraLayer = null;
  let heroAuraContainer = null;
  let enemyAuraContainer = null;
  let burstContainer = null;

  const activeBursts = [];
  let prevEnemyHemo = [];
  let prevVaultCount = 0;
  let lastHeroSig = '';
  let lastEnemySig = '';

  function ensureAuraLayers() {
    if (typeof pixiApp === 'undefined' || !pixiApp || !pixiApp.stage) return false;

    if (!auraLayer || auraLayer.destroyed) {
      auraLayer = new PIXI.Container();
      auraLayer.zIndex = 14;
      pixiApp.stage.addChild(auraLayer);

      heroAuraContainer = new PIXI.Container();
      enemyAuraContainer = new PIXI.Container();
      burstContainer = new PIXI.Container();

      auraLayer.addChild(heroAuraContainer);
      auraLayer.addChild(enemyAuraContainer);
      auraLayer.addChild(burstContainer);
    }

    ensureAuraTicker();
    return true;
  }

  function getHeroDisplay() {
    if (typeof playerContainer !== 'undefined' && playerContainer) return playerContainer;
    if (typeof playerSprite !== 'undefined' && playerSprite) return playerSprite;
    return null;
  }

  function getEnemyDisplay(idx) {
    if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
      if (enemyEntities[idx] && enemyEntities[idx].container) return enemyEntities[idx].container;
    }
    if (typeof enemySprites !== 'undefined' && Array.isArray(enemySprites) && enemySprites[idx]) {
      return enemySprites[idx];
    }
    return null;
  }

  function getClassType() {
    if (typeof gameState === 'undefined' || !gameState) return '';
    return String(gameState.classType || gameState.heroClass || '').toLowerCase();
  }

  // =========================================================================
  // 1. STATE READERS (HEMORRHAGE STACKS & STASIS VAULT CARDS)
  // =========================================================================
  function getEnemyHemorrhage(enemy) {
    if (!enemy || (typeof enemy.hp === 'number' && enemy.hp <= 0)) return 0;
    const st = enemy.statuses || enemy.debuffs || enemy.effects || {};
    const raw =
      enemy.hemorrhage ??
      enemy.bleed ??
      st.hemorrhage ??
      st.bleed ??
      st.Hemorrhage ??
      0;
    return Math.max(0, Number(raw) || 0);
  }

  function getVaultedCards() {
    if (typeof gameState !== 'undefined' && gameState) {
      const candidates = [
        gameState.vault,
        gameState.stasisVault,
        gameState.vaultedCards,
        gameState.stasisCards
      ];
      for (const list of candidates) {
        if (Array.isArray(list)) {
          return list.filter(Boolean);
        }
      }
    }

    // Fallback: inspect Stasis Vault DOM slots if state uses a custom key
    const vaultRow = document.querySelector('.sequence-vault-row');
    if (vaultRow) {
      const filled = vaultRow.querySelectorAll('.vault-card, .hand-card, .slot-card');
      if (filled.length > 0) {
        return Array.from(filled).map(el => ({
          name: (el.textContent || 'Vaulted').trim().slice(0, 14)
        }));
      }
    }
    return [];
  }

  // =========================================================================
  // 2. REACTIVE BURST EFFECTS (HEMORRHAGE SIPHON & STASIS RELEASE)
  // =========================================================================
  function triggerHemorrhageSiphonBurst(fromPos, count) {
    if (!ensureAuraLayers() || !fromPos) return;
    const hero = getHeroDisplay();
    const toX = hero ? hero.x : 190;
    const toY = hero ? hero.y : 140;
    const droplets = Math.min(Math.max(count, 3), 12);

    for (let i = 0; i < droplets; i++) {
      const drop = new PIXI.Graphics();
      drop.beginFill(0xf43f5e, 1);
      drop.lineStyle(1, 0xfecdd3, 0.9);
      drop.drawCircle(0, 0, 4.5);
      drop.endFill();
      drop.x = fromPos.x + (Math.random() - 0.5) * 28;
      drop.y = fromPos.y + (Math.random() - 0.5) * 28;
      burstContainer.addChild(drop);

      const startX = drop.x;
      const startY = drop.y;
      const arc = (Math.random() - 0.5) * 85;

      activeBursts.push({
        obj: drop,
        life: 0,
        maxLife: 26 + i * 2,
        update(p) {
          drop.x = startX + (toX - startX) * p;
          drop.y = startY + (toY - startY) * p + Math.sin(p * Math.PI) * arc;
          drop.scale.set(1.15 - p * 0.45);
          drop.alpha = 1 - p * 0.35;
        }
      });
    }
  }

  function triggerStasisReleasePulse() {
    if (!ensureAuraLayers()) return;
    const hero = getHeroDisplay();
    if (!hero) return;

    const pulse = new PIXI.Graphics();
    pulse.lineStyle(3, 0x22d3ee, 0.95);
    pulse.drawCircle(0, 0, 22);
    pulse.lineStyle(2, 0xc084fc, 0.85);
    pulse.drawCircle(0, 0, 32);
    pulse.x = hero.x;
    pulse.y = hero.y;
    burstContainer.addChild(pulse);

    activeBursts.push({
      obj: pulse,
      life: 0,
      maxLife: 24,
      update(p) {
        const h = getHeroDisplay();
        if (h) {
          pulse.x = h.x;
          pulse.y = h.y;
        }
        pulse.scale.set(0.75 + p * 0.95);
        pulse.alpha = 1 - p;
      }
    });
  }

  // =========================================================================
  // 3. BUILD HERO AURA (CHRONOMANCER STASIS RUNES / BLOOD REAVER PACT)
  // =========================================================================
  function rebuildHeroAura(cls, vaultedCards, hpRatio) {
    if (!ensureAuraLayers()) return;
    heroAuraContainer.removeChildren().forEach(c => c.destroy({ children: true }));

    const isChrono = cls.includes('chrono');
    const isBlood = cls.includes('blood');

    // A. CHRONOMANCER (or any class with cards in Stasis Vault): Glowing Stasis Runes
    if (isChrono || vaultedCards.length > 0) {
      const rig = new PIXI.Container();
      rig.__mode = 'chrono';

      // Celestial clockwork astrolabe ring beneath hero
      const ring = new PIXI.Graphics();
      ring.lineStyle(1.8, 0x22d3ee, isChrono ? 0.55 : 0.35);
      ring.drawEllipse(0, 22, 34, 10);
      ring.lineStyle(1.2, 0xc084fc, 0.45);
      ring.drawEllipse(0, 22, 24, 7);
      rig.addChild(ring);
      rig.__baseRing = ring;

      // Orbiting Stasis Rune Crystals & Mini Card Glyphs (1 per vaulted card)
      const orbitGroup = new PIXI.Container();
      const count = Math.min(vaultedCards.length, 6);

      for (let i = 0; i < count; i++) {
        const rune = new PIXI.Container();
        rune.__angleOffset = (Math.PI * 2 * i) / Math.max(1, count);

        // Glowing miniature stasis card crystal
        const crystal = new PIXI.Graphics();
        crystal.beginFill(0x0f172a, 0.92);
        crystal.lineStyle(1.8, i % 2 === 0 ? 0x22d3ee : 0xc084fc, 1);
        crystal.drawRoundedRect(-7, -10, 14, 20, 3);
        crystal.endFill();

        // Inner rune diamond
        crystal.beginFill(0x67e8f9, 0.95);
        crystal.drawPolygon([0, -5, 4, 0, 0, 5, -4, 0]);
        crystal.endFill();

        rune.addChild(crystal);
        orbitGroup.addChild(rune);
      }

      if (count > 0) {
        const badge = new PIXI.Text(`⏳ ${count}`, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: 9.5,
          fontWeight: '900',
          fill: '#67e8f9',
          stroke: '#020617',
          strokeThickness: 3
        });
        badge.anchor.set(0.5);
        badge.y = 33;
        rig.addChild(badge);
      }

      rig.addChild(orbitGroup);
      rig.__orbitGroup = orbitGroup;
      heroAuraContainer.addChild(rig);
    }

    // B. BLOOD REAVER: Crimson Pact Floor Aura & Rising Blood Wisps
    if (isBlood) {
      const rig = new PIXI.Container();
      rig.__mode = 'blood';
      const empowered = hpRatio <= 0.65;

      const pool = new PIXI.Graphics();
      pool.beginFill(0x991b1b, empowered ? 0.28 : 0.16);
      pool.lineStyle(1.8, empowered ? 0xf43f5e : 0xdc2626, empowered ? 0.75 : 0.45);
      pool.drawEllipse(0, 22, 32, 9);
      pool.endFill();
      rig.addChild(pool);
      rig.__pool = pool;

      const wispGroup = new PIXI.Container();
      const wispCount = empowered ? 5 : 3;
      for (let i = 0; i < wispCount; i++) {
        const wisp = new PIXI.Graphics();
        wisp.beginFill(0xf43f5e, 0.85);
        wisp.drawCircle(0, 0, 2.8);
        wisp.endFill();
        wisp.__phase = (Math.PI * 2 * i) / wispCount;
        wispGroup.addChild(wisp);
      }
      rig.addChild(wispGroup);
      rig.__wispGroup = wispGroup;

      heroAuraContainer.addChild(rig);
    }
  }

  // =========================================================================
  // 4. BUILD ENEMY HEMORRHAGE DROPLET ORBITS
  // =========================================================================
  function rebuildEnemyHemorrhageAuras(hemoCounts) {
    if (!ensureAuraLayers()) return;
    enemyAuraContainer.removeChildren().forEach(c => c.destroy({ children: true }));

    hemoCounts.forEach((stacks, idx) => {
      if (stacks <= 0) return;

      const rig = new PIXI.Container();
      rig.__enemyIdx = idx;

      // Crimson bleed ring under enemy
      const bleedRing = new PIXI.Graphics();
      bleedRing.lineStyle(2, 0xef4444, 0.7);
      bleedRing.beginFill(0x7f1d1d, 0.22);
      bleedRing.drawEllipse(0, 22, 28, 8);
      bleedRing.endFill();
      rig.addChild(bleedRing);

      // Orbiting crimson droplets (1 per stack up to 12)
      const dropletGroup = new PIXI.Container();
      const visibleDrops = Math.min(stacks, 12);

      for (let d = 0; d < visibleDrops; d++) {
        const drop = new PIXI.Graphics();
        drop.beginFill(d % 2 === 0 ? 0xef4444 : 0xdc2626, 0.96);
        drop.lineStyle(1, 0xfecaca, 0.85);
        // Teardrop silhouette
        drop.drawPolygon([0, -6, 4, 1, 0, 5, -4, 1]);
        drop.endFill();
        drop.__angleOffset = (Math.PI * 2 * d) / visibleDrops;
        dropletGroup.addChild(drop);
      }
      rig.addChild(dropletGroup);
      rig.__dropletGroup = dropletGroup;

      // Stack badge below enemy
      const label = new PIXI.Text(`🩸 ${stacks}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 10,
        fontWeight: '900',
        fill: '#fda4af',
        stroke: '#1f0505',
        strokeThickness: 3.5
      });
      label.anchor.set(0.5);
      label.y = 33;
      rig.addChild(label);

      enemyAuraContainer.addChild(rig);
    });
  }

  // =========================================================================
  // 5. 60FPS ANIMATION TICKER (FOLLOWS UNITS + ORBIT MOTION)
  // =========================================================================
  function ensureAuraTicker() {
    if (typeof pixiApp === 'undefined' || !pixiApp || pixiApp.__classAurasTicker) return;
    pixiApp.__classAurasTicker = true;

    pixiApp.ticker.add((delta) => {
      const t = performance.now() * 0.0025;
      const hero = getHeroDisplay();

      // Position & animate hero auras
      if (heroAuraContainer && heroAuraContainer.children.length > 0) {
        heroAuraContainer.visible = Boolean(hero);
        if (hero) {
          heroAuraContainer.children.forEach(rig => {
            rig.x = hero.x;
            rig.y = hero.y;

            if (rig.__mode === 'chrono' && rig.__orbitGroup) {
              rig.__orbitGroup.children.forEach((rune, idx) => {
                const a = t * 1.15 + (rune.__angleOffset || 0);
                rune.x = Math.cos(a) * 38;
                rune.y = Math.sin(a) * 14 - 8 + Math.sin(t * 2 + idx) * 2.5;
                rune.scale.set(0.85 + Math.sin(a) * 0.18);
                rune.alpha = 0.72 + Math.sin(a) * 0.28;
              });
            }

            if (rig.__mode === 'blood' && rig.__wispGroup) {
              rig.__wispGroup.children.forEach(wisp => {
                const cycle = (t * 0.9 + (wisp.__phase || 0)) % (Math.PI * 2);
                const prog = cycle / (Math.PI * 2);
                wisp.x = Math.cos(cycle * 2) * 22;
                wisp.y = 18 - prog * 44;
                wisp.alpha = Math.sin(prog * Math.PI) * 0.85;
              });
            }
          });
        }
      }

      // Position & animate enemy Hemorrhage droplets
      if (enemyAuraContainer && enemyAuraContainer.children.length > 0) {
        enemyAuraContainer.children.forEach(rig => {
          const enemyObj = getEnemyDisplay(rig.__enemyIdx);
          if (!enemyObj) {
            rig.visible = false;
            return;
          }
          rig.visible = true;
          rig.x = enemyObj.x;
          rig.y = enemyObj.y;

          if (rig.__dropletGroup) {
            rig.__dropletGroup.children.forEach(drop => {
              const a = t * 1.6 + (drop.__angleOffset || 0);
              drop.x = Math.cos(a) * 32;
              drop.y = Math.sin(a) * 12 - 4;
              drop.scale.set(0.85 + Math.sin(a) * 0.22);
            });
          }
        });
      }

      // Update reactive bursts
      for (let i = activeBursts.length - 1; i >= 0; i--) {
        const b = activeBursts[i];
        b.life += delta;
        const p = Math.min(1, b.life / b.maxLife);
        if (b.update) b.update(p);
        if (p >= 1) {
          if (b.obj && b.obj.parent) b.obj.parent.removeChild(b.obj);
          if (b.obj && !b.obj.destroyed) b.obj.destroy({ children: true });
          activeBursts.splice(i, 1);
        }
      }
    });
  }

  // =========================================================================
  // 6. STATE POLLING & REACTIVE TRIGGER DETECTION
  // =========================================================================
  setInterval(() => {
    if (typeof gameState === 'undefined' || !gameState || gameState.screen !== 'BATTLE') {
      if (auraLayer) auraLayer.visible = false;
      lastHeroSig = '';
      lastEnemySig = '';
      prevEnemyHemo = [];
      prevVaultCount = 0;
      return;
    }

    if (!ensureAuraLayers()) return;
    auraLayer.visible = true;

    const cls = getClassType();
    const vaultedCards = getVaultedCards();
    const hpRatio = gameState.maxHp ? (gameState.hp / gameState.maxHp) : 1;

    // Trigger temporal pulse when a card is pulled out of Stasis Vault
    if (vaultedCards.length < prevVaultCount && prevVaultCount > 0) {
      triggerStasisReleasePulse();
    }
    prevVaultCount = vaultedCards.length;

    const heroSig = `${cls}_${vaultedCards.length}_${hpRatio <= 0.65 ? 'low' : 'high'}`;
    if (heroSig !== lastHeroSig) {
      lastHeroSig = heroSig;
      rebuildHeroAura(cls, vaultedCards, hpRatio);
    }

    // Track enemy Hemorrhage stacks & trigger siphon burst when consumed
    const enemies = Array.isArray(gameState.enemies) ? gameState.enemies : [];
    const hemoCounts = enemies.map(e => getEnemyHemorrhage(e));

    hemoCounts.forEach((curr, idx) => {
      const prev = prevEnemyHemo[idx] || 0;
      const enemyAlive = enemies[idx] && enemies[idx].hp > 0;
      if (prev > 0 && curr === 0 && enemyAlive) {
        const eDisp = getEnemyDisplay(idx);
        triggerHemorrhageSiphonBurst(eDisp ? { x: eDisp.x, y: eDisp.y } : null, prev);
      }
    });
    prevEnemyHemo = hemoCounts.slice();

    const enemySig = hemoCounts.join(',');
    if (enemySig !== lastEnemySig) {
      lastEnemySig = enemySig;
      rebuildEnemyHemorrhageAuras(hemoCounts);
    }
  }, 140);
})();