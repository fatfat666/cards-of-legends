// --- TURRET ATTACK VFX, MOB GOONS, BOUNTY ANIMATION & SIGNATURE CARD VFX (v0.8.3) ---
(function () {
  let turretLayer = null;
  let goonLayer = null;
  let bountyLayer = null;
  let activeFxList = [];
  let lastTurretSig = '';
  let lastGoonSig = '';
  let lastBountySig = 'none';
  let lastCardPlayTimestamp = 0;
  let lastTotalEnemyHp = null;

  function isMobBossClass() {
    return typeof gameState !== 'undefined' && gameState &&
      String(gameState.classType || '').toLowerCase() === 'mob boss';
  }

  function getStageBounds() {
    const c = document.getElementById('pixi-container');
    const w = (c && c.clientWidth) || (typeof pixiApp !== 'undefined' && pixiApp ? pixiApp.screen.width : 860);
    const h = (c && c.clientHeight) || (typeof pixiApp !== 'undefined' && pixiApp ? pixiApp.screen.height : 220);
    return { w, h };
  }

  function ensureCustomLayers() {
    if (typeof pixiApp === 'undefined' || !pixiApp || !pixiApp.stage) return false;

    if (!turretLayer || turretLayer.destroyed) {
      turretLayer = new PIXI.Container();
      turretLayer.zIndex = 15;
      pixiApp.stage.addChild(turretLayer);
    }
    if (!goonLayer || goonLayer.destroyed) {
      goonLayer = new PIXI.Container();
      goonLayer.zIndex = 16;
      pixiApp.stage.addChild(goonLayer);
    }
    if (!bountyLayer || bountyLayer.destroyed) {
      bountyLayer = new PIXI.Container();
      bountyLayer.zIndex = 25;
      pixiApp.stage.addChild(bountyLayer);
    }

    ensureExpansionTicker();
    return true;
  }

  function getHeroPos() {
    const { w, h } = getStageBounds();
    if (typeof playerContainer !== 'undefined' && playerContainer) {
      return { x: playerContainer.x || w * 0.22, y: playerContainer.y || h * 0.62 };
    }
    return { x: Math.round(w * 0.22), y: Math.round(h * 0.62) };
  }

  function getEnemyPos(idx = 0) {
    const { w, h } = getStageBounds();
    if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
      const alive = enemyEntities.filter(e => e && e.container && (!e.data || e.data.hp > 0));
      const target = (enemyEntities[idx] && enemyEntities[idx].container && (!enemyEntities[idx].data || enemyEntities[idx].data.hp > 0))
        ? enemyEntities[idx]
        : alive[0];
      if (target && target.container) {
        return { x: target.container.x || w * 0.72, y: target.container.y || h * 0.60 };
      }
    }
    return { x: Math.round(w * 0.72), y: Math.round(h * 0.60) };
  }

  function getAllAliveEnemyPositions() {
    if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
      const list = enemyEntities
        .filter(e => e && e.container && (!e.data || e.data.hp > 0))
        .map(e => ({ x: e.container.x, y: e.container.y }));
      if (list.length > 0) return list;
    }
    return [getEnemyPos(0)];
  }

  // =========================================================================
  // 1. ARTIFICER TURRET / MECH ATTACK VFX (ALL TYPES)
  // =========================================================================
  function getTurretList() {
    if (typeof gameState === 'undefined' || !gameState) return [];
    const list = gameState.turrets || gameState.constructs || gameState.artificerTurrets || [];
    return Array.isArray(list) ? list : [];
  }

  function getConstructOrigin(turretIdx = 0) {
    if (Array.isArray(window.__artificerStageCoords) && window.__artificerStageCoords[turretIdx]) {
      const c = window.__artificerStageCoords[turretIdx];
      return { x: c.x + 14, y: c.y - 2 };
    }
    const hero = getHeroPos();
    return { x: hero.x + 54 + (turretIdx % 3) * 35, y: hero.y - 50 };
  }

  window.playTurretAttackVFX = function (construct, turretIdx = 0) {
    if (!ensureCustomLayers()) return;

    const raw = `${(construct && construct.id) || ''} ${(construct && construct.name) || ''} ${(construct && construct.archetype) || ''}`.toLowerCase();
    // Passive buildings don't fire attacks
    if (/foundry|pylon|generator|fabricator|bunker/.test(raw)) return;

    const origin = getConstructOrigin(turretIdx);
    const enemy = getEnemyPos(0);

    // A. ARC TESLA COIL: Jagged chain lightning arcing across ALL enemies
    if (/tesla|arc|shock|volt|lightning/.test(raw)) {
      const targets = getAllAliveEnemyPositions();
      let prevPt = origin;

      targets.forEach((tPos, tIdx) => {
        const bolt = new PIXI.Graphics();
        bolt.lineStyle(4, 0x0284c7, 0.55);
        bolt.moveTo(prevPt.x, prevPt.y);

        const segments = 6;
        const pts = [];
        for (let s = 1; s < segments; s++) {
          const frac = s / segments;
          const midX = prevPt.x + (tPos.x - prevPt.x) * frac + (Math.random() - 0.5) * 18;
          const midY = prevPt.y + (tPos.y - prevPt.y) * frac + (Math.random() - 0.5) * 26;
          pts.push({ x: midX, y: midY });
          bolt.lineTo(midX, midY);
        }
        bolt.lineTo(tPos.x, tPos.y);

        // Bright white-cyan inner core
        bolt.lineStyle(2, 0xe0f2fe, 1);
        bolt.moveTo(prevPt.x, prevPt.y);
        pts.forEach(p => bolt.lineTo(p.x, p.y));
        bolt.lineTo(tPos.x, tPos.y);

        // Impact spark ring
        bolt.beginFill(0x38bdf8, 0.85);
        bolt.drawCircle(tPos.x, tPos.y, 8 + tIdx * 2);
        bolt.endFill();

        bountyLayer.addChild(bolt);
        activeFxList.push({
          obj: bolt,
          life: 0,
          maxLife: 18,
          update(p) {
            bolt.alpha = 1 - p;
          }
        });

        prevPt = tPos;
      });
      return;
    }

    // B. RAILGUN / PLASMA / LASER TURRET: High-energy beam + muzzle shockwave
    if (/rail|laser|plasma|sniper|beam/.test(raw)) {
      const beam = new PIXI.Graphics();
      beam.lineStyle(9, 0xa855f7, 0.45);
      beam.moveTo(origin.x, origin.y);
      beam.lineTo(enemy.x, enemy.y);
      beam.lineStyle(3, 0xf3e8ff, 1);
      beam.moveTo(origin.x, origin.y);
      beam.lineTo(enemy.x, enemy.y);
      beam.beginFill(0xc084fc, 0.9);
      beam.drawCircle(enemy.x, enemy.y, 12);
      beam.endFill();
      bountyLayer.addChild(beam);

      activeFxList.push({
        obj: beam,
        life: 0,
        maxLife: 18,
        update(p) {
          beam.alpha = 1 - p;
        }
      });
      return;
    }

    // C. SIEGE WALKER / MORTAR / ROCKET POD: Parabolic explosive shell + AoE blast
    if (/siege|walker|mortar|rocket|missile|hellfire|artillery/.test(raw)) {
      const shell = new PIXI.Graphics();
      shell.beginFill(0xf97316, 1);
      shell.lineStyle(1.5, 0xfef08a, 1);
      shell.drawCircle(0, 0, 5);
      shell.endFill();
      shell.x = origin.x;
      shell.y = origin.y - 8;
      bountyLayer.addChild(shell);

      activeFxList.push({
        obj: shell,
        life: 0,
        maxLife: 22,
        update(p) {
          shell.x = origin.x + (enemy.x - origin.x) * p;
          shell.y = (origin.y - 8) + (enemy.y - (origin.y - 8)) * p - Math.sin(p * Math.PI) * 58;
          if (p >= 0.95) {
            // Spawn explosion ring on touchdown
            const boom = new PIXI.Graphics();
            boom.beginFill(0xf97316, 0.55);
            boom.lineStyle(3, 0xfacc15, 1);
            boom.drawCircle(0, 0, 22);
            boom.endFill();
            boom.x = enemy.x;
            boom.y = enemy.y;
            bountyLayer.addChild(boom);
            activeFxList.push({
              obj: boom,
              life: 0,
              maxLife: 16,
              update(bp) {
                boom.scale.set(0.7 + bp * 0.9);
                boom.alpha = 1 - bp;
              }
            });
          }
        }
      });
      return;
    }

    // D. CRYO / FROST TURRET: Crystalline ice shards + frost mist burst
    if (/cryo|frost|ice|freeze|chill/.test(raw)) {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (!ensureCustomLayers()) return;
          const shard = new PIXI.Graphics();
          shard.beginFill(0x7dd3fc, 0.95);
          shard.lineStyle(1, 0xffffff, 1);
          shard.drawPolygon([-8, 0, 0, -4, 10, 0, 0, 4]);
          shard.endFill();
          shard.x = origin.x;
          shard.y = origin.y + (i - 1.5) * 6;
          bountyLayer.addChild(shard);

          activeFxList.push({
            obj: shard,
            life: 0,
            maxLife: 14,
            update(p) {
              shard.x = origin.x + (enemy.x - origin.x) * p;
              shard.y = origin.y + (enemy.y - origin.y) * p;
            }
          });
        }, i * 45);
      }
      return;
    }

    // E. FLAME / INFERNO TURRET: Fireball stream
    if (/flame|fire|inferno|pyro|burn/.test(raw)) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (!ensureCustomLayers()) return;
          const ember = new PIXI.Graphics();
          ember.beginFill(i % 2 === 0 ? 0xf97316 : 0xfacc15, 0.9);
          ember.drawCircle(0, 0, 5 + i);
          ember.endFill();
          ember.x = origin.x;
          ember.y = origin.y;
          bountyLayer.addChild(ember);

          const spreadY = (Math.random() - 0.5) * 26;
          activeFxList.push({
            obj: ember,
            life: 0,
            maxLife: 15,
            update(p) {
              ember.x = origin.x + (enemy.x - origin.x) * p;
              ember.y = origin.y + (enemy.y + spreadY - origin.y) * p;
              ember.scale.set(0.8 + p * 0.8);
              ember.alpha = 1 - p * 0.6;
            }
          });
        }, i * 40);
      }
      return;
    }

    // F. AUTO-TURRET / GATLING / AEGIS MECH SLAM: Rapid tracer burst from turret barrel
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!ensureCustomLayers()) return;
        const tracer = new PIXI.Graphics();
        tracer.beginFill(0x38bdf8, 1);
        tracer.drawRoundedRect(-10, -2, 20, 4, 2);
        tracer.endFill();
        tracer.x = origin.x;
        tracer.y = origin.y + (i - 1) * 5;
        bountyLayer.addChild(tracer);

        activeFxList.push({
          obj: tracer,
          life: 0,
          maxLife: 11,
          update(p) {
            tracer.x = origin.x + (enemy.x - origin.x) * p;
            tracer.y = origin.y + (enemy.y - origin.y) * p;
          }
        });
      }, i * 55);
    }
  };

  window.triggerAllTurretAttackVFX = function () {
    const constructs = getTurretList();
    if (!constructs.length) return;
    constructs.forEach((c, idx) => {
      setTimeout(() => window.playTurretAttackVFX(c, idx), idx * 120);
    });
  };

  // Fallback turret renderer if artificer-foundry-ui.js isn't loaded
  if (typeof window.renderArtificerTurrets !== 'function') {
    window.renderArtificerTurrets = function () {
      if (!ensureCustomLayers()) return;
      turretLayer.removeChildren();
      const turrets = getTurretList();
      if (!turrets.length) return;
      const { w, h } = getStageBounds();
      const hero = getHeroPos();

      turrets.forEach((t, idx) => {
        const pod = new PIXI.Container();
        pod.x = Math.min(w * 0.46, Math.round(hero.x + 52 + (idx % 3) * 42));
        pod.y = Math.max(32, Math.round(hero.y - 58 - Math.floor(idx / 3) * 38));
        pod.__baseY = pod.y;
        pod.__phase = idx * 1.1;

        const body = new PIXI.Graphics();
        body.beginFill(0x0f172a, 0.95);
        body.lineStyle(2, 0x38bdf8, 1);
        body.drawRoundedRect(-13, -10, 26, 16, 6);
        body.endFill();
        pod.addChild(body);
        turretLayer.addChild(pod);
      });
    };
  }

  // =========================================================================
  // 2. MOB BOSS GOONS / ENFORCERS RENDERER
  // =========================================================================
  function getGoonList() {
    if (typeof gameState === 'undefined' || !gameState) return [];
    const list = gameState.enforcers || gameState.goons || gameState.minions || gameState.mobEnforcers || [];
    return Array.isArray(list) ? list : [];
  }

  window.renderMobEnforcers = function () {
    if (!ensureCustomLayers()) return;
    goonLayer.removeChildren();

    const goons = getGoonList();
    if (!goons.length) return;

    const { w, h } = getStageBounds();
    const hero = getHeroPos();

    goons.forEach((g, idx) => {
      if (g && typeof g.hp === 'number' && g.hp <= 0) return;

      const unit = new PIXI.Container();
      const offsetX = 48 + (idx % 2) * 34;
      const offsetY = 18 + idx * 24 - (goons.length * 10);

      unit.x = Math.min(w * 0.45, Math.round(hero.x + offsetX));
      unit.y = Math.min(h - 24, Math.max(44, Math.round(hero.y + offsetY)));
      unit.__baseY = unit.y;
      unit.__phase = idx * 0.9;

      const isBruiser = g && /bruiser|heavy|muscle|hitman/i.test(String(g.name || g.role || ''));
      const accent = isBruiser ? 0xf97316 : 0xa855f7;

      const shadow = new PIXI.Graphics();
      shadow.beginFill(0x000000, 0.45);
      shadow.drawEllipse(0, 18, 13, 4);
      shadow.endFill();
      unit.addChild(shadow);

      const coat = new PIXI.Graphics();
      coat.beginFill(0x1e1b4b, 0.96);
      coat.lineStyle(2, accent, 1);
      coat.drawPolygon([-10, 16, -7, -6, 7, -6, 10, 16]);
      coat.endFill();

      coat.beginFill(0xe2e8f0, 1);
      coat.drawCircle(0, -11, 5.5);
      coat.endFill();

      coat.beginFill(0x0f172a, 1);
      coat.lineStyle(1.5, accent, 1);
      coat.drawRect(-9, -16, 18, 3);
      coat.drawRect(-5, -21, 10, 5);
      coat.endFill();

      coat.beginFill(0x94a3b8, 1);
      coat.drawRect(4, -2, 13, 3.5);
      coat.endFill();
      unit.addChild(coat);

      const hpStr = (g && typeof g.hp === 'number') ? ` ${g.hp}♥` : '';
      const rawName = (g && g.name) ? String(g.name).split(' ')[0] : 'Goon';
      const label = new PIXI.Text(`${rawName}${hpStr}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 9.5,
        fontWeight: '800',
        fill: '#f3e8ff',
        stroke: '#090d16',
        strokeThickness: 3
      });
      label.anchor.set(0.5);
      label.y = -28;
      unit.addChild(label);

      goonLayer.addChild(unit);
    });
  };

  // =========================================================================
  // 3. MOB BOSS BOUNTY LOCK-ON & CASH-OUT ANIMATION (MOB BOSS ONLY)
  // =========================================================================
  function getBountiedEnemyIndex() {
    if (!isMobBossClass() || !Array.isArray(gameState.enemies)) return -1;

    if (typeof gameState.bountyTargetIndex === 'number' && gameState.bountyTargetIndex >= 0) {
      const target = gameState.enemies[gameState.bountyTargetIndex];
      if (target && target.hp > 0) return gameState.bountyTargetIndex;
    }

    return gameState.enemies.findIndex(e =>
      e && e.hp > 0 && (e.hasBounty || (e.statuses && e.statuses.bounty))
    );
  }

  window.playBountyVFX = function (enemyIdx = 0, mode = 'mark') {
    if (!isMobBossClass() || !ensureCustomLayers()) return;
    const target = getEnemyPos(enemyIdx);

    if (mode === 'collect') {
      const hero = getHeroPos();
      for (let i = 0; i < 16; i++) {
        const coin = new PIXI.Graphics();
        const isBill = i % 3 === 0;
        if (isBill) {
          coin.beginFill(0x22c55e, 1);
          coin.lineStyle(1, 0xbbf7d0, 1);
          coin.drawRect(-6, -3, 12, 6);
        } else {
          coin.beginFill(0xfacc15, 1);
          coin.lineStyle(1.5, 0xfef08a, 1);
          coin.drawCircle(0, 0, 5);
        }
        coin.endFill();
        coin.x = target.x + (Math.random() - 0.5) * 30;
        coin.y = target.y + (Math.random() - 0.5) * 30;
        bountyLayer.addChild(coin);

        const burstVx = (Math.random() - 0.5) * 6;
        const burstVy = -3 - Math.random() * 4;
        activeFxList.push({
          obj: coin,
          life: 0,
          maxLife: 48 + i * 2,
          update(p) {
            if (p < 0.35) {
              coin.x += burstVx;
              coin.y += burstVy;
            } else {
              coin.x += (hero.x - coin.x) * 0.16;
              coin.y += (hero.y - coin.y) * 0.16;
            }
            coin.rotation += 0.25;
            if (p > 0.85) coin.alpha = 1 - (p - 0.85) / 0.15;
          }
        });
      }

      if (typeof window.spawnFloatingNumber === 'function') {
        const heroObj = (typeof playerContainer !== 'undefined' && playerContainer) ? playerContainer : null;
        if (heroObj) window.spawnFloatingNumber(heroObj, '💰 BOUNTY CASHED!', 'crit');
      }
      return;
    }

    const rig = new PIXI.Container();
    rig.x = target.x;
    rig.y = target.y;
    rig.scale.set(2.1);
    rig.alpha = 0;

    const ring = new PIXI.Graphics();
    ring.lineStyle(3, 0xfacc15, 0.95);
    ring.drawCircle(0, 0, 32);
    ring.lineStyle(2, 0xef4444, 0.95);
    ring.drawCircle(0, 0, 22);
    ring.moveTo(-40, 0); ring.lineTo(-16, 0);
    ring.moveTo(16, 0);  ring.lineTo(40, 0);
    ring.moveTo(0, -40); ring.lineTo(0, -16);
    ring.moveTo(0, 16);  ring.lineTo(0, 40);
    rig.addChild(ring);

    const badge = new PIXI.Text('🎯 BOUNTY', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 11,
      fontWeight: '900',
      fill: '#facc15',
      stroke: '#450a0a',
      strokeThickness: 4
    });
    badge.anchor.set(0.5);
    badge.y = -44;
    rig.addChild(badge);

    bountyLayer.addChild(rig);

    activeFxList.push({
      obj: rig,
      life: 0,
      maxLife: 55,
      update(p) {
        const snap = Math.min(1, p * 4);
        rig.scale.set(2.1 - snap * 1.1);
        rig.alpha = p < 0.8 ? 1 : (1 - (p - 0.8) / 0.2);
        ring.rotation += 0.06;
      }
    });
  };

  function syncPersistentBountyMarker() {
    if (!isMobBossClass()) {
      lastBountySig = 'none';
      return;
    }
    if (!ensureCustomLayers()) return;

    const bIdx = getBountiedEnemyIndex();
    const sig = bIdx >= 0 ? `bounty_${bIdx}` : 'none';

    if (sig !== lastBountySig) {
      if (lastBountySig !== 'none' && sig === 'none') {
        const oldIdx = parseInt(lastBountySig.split('_')[1], 10) || 0;
        window.playBountyVFX(oldIdx, 'collect');
      } else if (sig !== 'none') {
        window.playBountyVFX(bIdx, 'mark');
      }
      lastBountySig = sig;
    }
  }

  // =========================================================================
  // 4. SIGNATURE CARD & CLASS VFX LIBRARY
  // =========================================================================
  window.playCardSignatureVFX = function (card) {
    if (!ensureCustomLayers() || !card) return;
    lastCardPlayTimestamp = performance.now();

    const name = String(card.name || '').toLowerCase();
    const cls = String(card.classType || card.heroClass || (typeof gameState !== 'undefined' ? gameState.classType : '')).toLowerCase();
    const type = String(card.type || '').toLowerCase();
    const hero = getHeroPos();
    const enemy = getEnemyPos(0);

    // A. MOB BOSS: Bounty / Mark (Mob Boss only)
    if (isMobBossClass() && (name.includes('bounty') || name.includes('wanted') || name.includes('contract'))) {
      window.playBountyVFX(0, 'mark');
      return;
    }

    // B. MOB BOSS: Tommy Gun / Rapid Bullet Tracers
    if (name.includes('tommy') || name.includes('spray') || name.includes('ambush') || (isMobBossClass() && name.includes('shot'))) {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (!ensureCustomLayers()) return;
          const bullet = new PIXI.Graphics();
          bullet.beginFill(0xfef08a, 1);
          bullet.drawRoundedRect(-12, -2, 24, 4, 2);
          bullet.endFill();
          bullet.x = hero.x + 25;
          bullet.y = hero.y + (Math.random() - 0.5) * 26;
          bountyLayer.addChild(bullet);

          const targetY = enemy.y + (Math.random() - 0.5) * 32;
          activeFxList.push({
            obj: bullet,
            life: 0,
            maxLife: 12,
            update(p) {
              bullet.x = hero.x + 25 + (enemy.x - hero.x - 25) * p;
              bullet.y = bullet.y + (targetY - bullet.y) * p;
            }
          });
        }, i * 55);
      }
      return;
    }

    // C. MOB BOSS: Bribe / Extort / Syndicate Cash (Mob Boss only)
    if (isMobBossClass() && (name.includes('bribe') || name.includes('extort') || name.includes('cash') || name.includes('syndicate') || name.includes('hire'))) {
      window.playBountyVFX(0, 'collect');
      return;
    }

    // D. BLOOD REAVER: Flurry of Fangs / Bite Jaws
    if (name.includes('fang') || name.includes('bite') || name.includes('devour')) {
      for (let b = 0; b < 3; b++) {
        setTimeout(() => {
          if (!ensureCustomLayers()) return;
          const jaws = new PIXI.Graphics();
          jaws.beginFill(0xef4444, 0.95);
          jaws.drawPolygon([-18, -22, -10, -4, -2, -22]);
          jaws.drawPolygon([2, -22, 10, -4, 18, -22]);
          jaws.drawPolygon([-18, 22, -10, 4, -2, 22]);
          jaws.drawPolygon([2, 22, 10, 4, 18, 22]);
          jaws.endFill();
          jaws.x = enemy.x + (b - 1) * 12;
          jaws.y = enemy.y;
          bountyLayer.addChild(jaws);

          activeFxList.push({
            obj: jaws,
            life: 0,
            maxLife: 18,
            update(p) {
              jaws.scale.y = 1.3 - Math.sin(p * Math.PI) * 0.7;
              jaws.alpha = 1 - p * 0.7;
            }
          });
        }, b * 110);
      }
      return;
    }

    // E. BLOOD REAVER: Blood Boil / Hemorrhage Burst
    if (name.includes('boil') || name.includes('hemorrhage') || name.includes('bleed') || name.includes('crimson')) {
      for (let i = 0; i < 12; i++) {
        const orb = new PIXI.Graphics();
        orb.beginFill(i % 2 === 0 ? 0xdc2626 : 0x991b1b, 0.9);
        orb.lineStyle(1, 0xfca5a5, 0.8);
        orb.drawCircle(0, 0, 4 + Math.random() * 5);
        orb.endFill();
        orb.x = enemy.x + (Math.random() - 0.5) * 55;
        orb.y = enemy.y + 24;
        bountyLayer.addChild(orb);

        const riseSpeed = 1.5 + Math.random() * 2;
        activeFxList.push({
          obj: orb,
          life: 0,
          maxLife: 34,
          update(p) {
            orb.y -= riseSpeed;
            orb.scale.set(1 + p * 0.5);
            orb.alpha = 1 - p;
          }
        });
      }
      return;
    }

    // F. BLOOD REAVER: Siphon / Blood Suck / Lifesteal Orb Return
    if (name.includes('siphon') || name.includes('suck') || name.includes('drain') || name.includes('leech')) {
      for (let i = 0; i < 8; i++) {
        const drop = new PIXI.Graphics();
        drop.beginFill(0xf43f5e, 1);
        drop.drawCircle(0, 0, 5);
        drop.endFill();
        drop.x = enemy.x;
        drop.y = enemy.y;
        bountyLayer.addChild(drop);

        const arcOffset = (Math.random() - 0.5) * 90;
        activeFxList.push({
          obj: drop,
          life: 0,
          maxLife: 28 + i * 2,
          update(p) {
            drop.x = enemy.x + (hero.x - enemy.x) * p;
            drop.y = enemy.y + (hero.y - enemy.y) * p + Math.sin(p * Math.PI) * arcOffset;
            drop.alpha = 1 - p * 0.4;
          }
        });
      }
      return;
    }

    // G. ARTIFICER: Overcharge / Command Turrets -> fire all active constructs immediately!
    if (name.includes('overcharge') || name.includes('command') || name.includes('barrage') || name.includes('salvo')) {
      window.triggerAllTurretAttackVFX();
      return;
    }

    // H. ARTIFICER: Turret / Mech / Building / Forge Deployment
    if (name.includes('turret') || name.includes('mech') || name.includes('walker') || name.includes('pylon') || name.includes('construct') || name.includes('forge') || name.includes('foundry')) {
      const ring = new PIXI.Graphics();
      ring.lineStyle(3, 0x38bdf8, 1);
      ring.drawCircle(0, 0, 14);
      ring.lineStyle(2, 0xf59e0b, 0.9);
      ring.drawRect(-16, -16, 32, 32);
      ring.x = hero.x + 55;
      ring.y = hero.y - 45;
      bountyLayer.addChild(ring);

      activeFxList.push({
        obj: ring,
        life: 0,
        maxLife: 30,
        update(p) {
          ring.rotation += 0.18;
          ring.scale.set(0.6 + p * 1.4);
          ring.alpha = 1 - p;
        }
      });
      setTimeout(() => {
        if (typeof window.renderArtificerTurrets === 'function') window.renderArtificerTurrets();
      }, 40);
      return;
    }

    // I. ARTIFICER: Plasma / Railgun / Laser Beam
    if (cls.includes('artificer') || name.includes('laser') || name.includes('plasma') || name.includes('beam') || name.includes('volt')) {
      const beam = new PIXI.Graphics();
      beam.lineStyle(8, 0x0284c7, 0.45);
      beam.moveTo(hero.x + 20, hero.y - 8);
      beam.lineTo(enemy.x, enemy.y - 8);
      beam.lineStyle(3, 0xe0f2fe, 1);
      beam.moveTo(hero.x + 20, hero.y - 8);
      beam.lineTo(enemy.x, enemy.y - 8);
      bountyLayer.addChild(beam);

      activeFxList.push({
        obj: beam,
        life: 0,
        maxLife: 18,
        update(p) {
          beam.alpha = 1 - p;
        }
      });
      return;
    }

    // J. CHRONOMANCER: Time Warp / Stasis / Echo Rift
    if (cls.includes('chrono') || name.includes('time') || name.includes('chrono') || name.includes('stasis') || name.includes('echo')) {
      const portal = new PIXI.Graphics();
      portal.lineStyle(3, 0x22d3ee, 0.95);
      portal.drawCircle(0, 0, 28);
      portal.lineStyle(2, 0xc084fc, 0.9);
      portal.moveTo(0, 0); portal.lineTo(0, -20);
      portal.moveTo(0, 0); portal.lineTo(14, 0);
      portal.x = type.includes('attack') ? enemy.x : hero.x;
      portal.y = type.includes('attack') ? enemy.y : hero.y;
      bountyLayer.addChild(portal);

      activeFxList.push({
        obj: portal,
        life: 0,
        maxLife: 32,
        update(p) {
          portal.rotation -= 0.15;
          portal.scale.set(0.7 + Math.sin(p * Math.PI) * 0.7);
          portal.alpha = 1 - p;
        }
      });
      return;
    }

    // K. DEFENSIVE / SHIELD CARDS: Hexagonal Barrier Dome
    if (type.includes('defend') || name.includes('shield') || name.includes('fortify') || name.includes('iron') || name.includes('ward')) {
      const dome = new PIXI.Graphics();
      dome.lineStyle(3, 0x38bdf8, 0.95);
      dome.beginFill(0x38bdf8, 0.16);
      dome.drawCircle(0, 0, 34);
      dome.endFill();
      dome.x = hero.x;
      dome.y = hero.y;
      bountyLayer.addChild(dome);

      activeFxList.push({
        obj: dome,
        life: 0,
        maxLife: 26,
        update(p) {
          dome.scale.set(0.85 + p * 0.35);
          dome.alpha = 1 - p;
        }
      });
      return;
    }

    // L. DEFAULT HEAVY ATTACK: High-Contrast Crescent Slash
    const slash = new PIXI.Graphics();
    slash.lineStyle(5, 0xf8fafc, 0.95);
    slash.arc(0, 0, 34, -0.9, 0.9);
    slash.lineStyle(2, 0xf59e0b, 0.9);
    slash.arc(4, 0, 38, -0.7, 0.7);
    slash.x = enemy.x - 10;
    slash.y = enemy.y;
    bountyLayer.addChild(slash);

    activeFxList.push({
      obj: slash,
      life: 0,
      maxLife: 16,
      update(p) {
        slash.x += 2;
        slash.alpha = 1 - p;
      }
    });
  };

  // =========================================================================
  // 5. TICKER, STATE WATCHER & END-OF-TURN TURRET FIRING HOOKS
  // =========================================================================
  function ensureExpansionTicker() {
    if (typeof pixiApp === 'undefined' || !pixiApp || pixiApp.__vfxExpansionTicker) return;
    pixiApp.__vfxExpansionTicker = true;

    pixiApp.ticker.add((delta) => {
      const t = performance.now() * 0.004;

      if (turretLayer && turretLayer.children) {
        turretLayer.children.forEach(pod => {
          if (typeof pod.__baseY === 'number') {
            pod.y = pod.__baseY + Math.sin(t + (pod.__phase || 0)) * 2.5;
          }
        });
      }

      if (goonLayer && goonLayer.children) {
        goonLayer.children.forEach(unit => {
          if (typeof unit.__baseY === 'number') {
            unit.y = unit.__baseY + Math.abs(Math.sin(t * 1.3 + (unit.__phase || 0))) * -3;
          }
        });
      }

      for (let i = activeFxList.length - 1; i >= 0; i--) {
        const fx = activeFxList[i];
        fx.life += delta;
        const p = Math.min(1, fx.life / fx.maxLife);
        if (fx.update) fx.update(p);
        if (p >= 1) {
          if (fx.obj && fx.obj.parent) fx.obj.parent.removeChild(fx.obj);
          if (fx.obj && !fx.obj.destroyed) fx.obj.destroy({ children: true });
          activeFxList.splice(i, 1);
        }
      }
    });
  }

  setInterval(() => {
    if (typeof gameState === 'undefined' || !gameState || gameState.screen !== 'BATTLE') {
      lastTurretSig = '';
      lastGoonSig = '';
      lastBountySig = 'none';
      lastTotalEnemyHp = null;
      return;
    }

    const turrets = getTurretList();
    const tSig = JSON.stringify(turrets.map(t => (t && (t.id || t.name || 1))));
    if (tSig !== lastTurretSig) {
      lastTurretSig = tSig;
      if (typeof window.renderArtificerTurrets === 'function') window.renderArtificerTurrets();
    }

    // Detect end-of-turn turret damage when enemy HP drops outside of a direct card play
    if (Array.isArray(gameState.enemies)) {
      const totalHp = gameState.enemies.reduce((sum, e) => sum + (e ? Math.max(0, e.hp || 0) : 0), 0);
      if (lastTotalEnemyHp !== null && totalHp < lastTotalEnemyHp && turrets.length > 0) {
        const msSinceCard = performance.now() - lastCardPlayTimestamp;
        if (msSinceCard > 450) {
          window.triggerAllTurretAttackVFX();
        }
      }
      lastTotalEnemyHp = totalHp;
    }

    const goons = getGoonList();
    const gSig = JSON.stringify(goons.map(g => (g && `${g.name || 'g'}_${g.hp || 1}`)));
    if (gSig !== lastGoonSig) {
      lastGoonSig = gSig;
      window.renderMobEnforcers();
    }

    syncPersistentBountyMarker();
  }, 150);

  function installCardVfxHooks() {
    ['playCardEffect', 'resolveCardEffect', 'executeCard'].forEach(fnName => {
      if (typeof window[fnName] === 'function' && !window[fnName].__vfxWrapped) {
        const orig = window[fnName];
        const wrapped = function (card, ...rest) {
          try {
            if (card && typeof card === 'object') window.playCardSignatureVFX(card);
          } catch (_) {}
          return orig.apply(this, [card, ...rest]);
        };
        wrapped.__vfxWrapped = true;
        window[fnName] = wrapped;
      }
    });

    // Also wrap end-of-turn / construct resolution functions if exposed globally
    ['resolveTurrets', 'processTurrets', 'tickConstructs', 'endPlayerTurn'].forEach(fnName => {
      if (typeof window[fnName] === 'function' && !window[fnName].__turretVfxWrapped) {
        const orig = window[fnName];
        const wrapped = function (...args) {
          window.triggerAllTurretAttackVFX();
          return orig.apply(this, args);
        };
        wrapped.__turretVfxWrapped = true;
        window[fnName] = wrapped;
      }
    });

    const seqContainer = document.getElementById('sequence-slots');
    if (seqContainer && typeof MutationObserver !== 'undefined' && !seqContainer.__vfxSeqObs) {
      seqContainer.__vfxSeqObs = true;
      new MutationObserver(() => {
        const activeSlot = seqContainer.querySelector('.active, .executing, .slot-active');
        if (activeSlot && !activeSlot.dataset.vfxFired) {
          activeSlot.dataset.vfxFired = '1';
          const titleEl = activeSlot.querySelector('.slot-card-name, strong, b') || activeSlot;
          window.playCardSignatureVFX({ name: titleEl.textContent || '' });
        }
      }).observe(seqContainer, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
  }

  installCardVfxHooks();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installCardVfxHooks);
  }
})();
