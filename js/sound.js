// --- MODERN CINEMATIC WEB AUDIO ENGINE & AUTO-WIRING (v0.8.0) ---
const SoundFX = (() => {
  let ctx = null;
  let masterGain = null;
  let compressor = null;
  let noiseBuffer = null;
  let muted = localStorage.getItem('col_sfx_muted') === 'true';

  function ensureContext() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;

      masterGain = ctx.createGain();
      masterGain.gain.value = 0.55;

      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      // 2-second pink-filtered noise buffer for organic whooshes, gunfire & impacts
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * 2;
      noiseBuffer = ctx.createBuffer(1, length, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // Unlock browser AudioContext automatically on first user gesture
  ['pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (!muted) ensureContext();
    }, { once: true, passive: true });
  });

  function playNoise({ duration = 0.2, filterType = 'bandpass', freqStart = 1200, freqEnd = 400, q = 1.5, gain = 0.35, delay = 0 }) {
    const c = ensureContext();
    if (!c || !noiseBuffer) return;
    const t0 = c.currentTime + delay;

    const src = c.createBufferSource();
    src.buffer = noiseBuffer;

    const filter = c.createBiquadFilter();
    filter.type = filterType;
    filter.Q.setValueAtTime(q, t0);
    filter.frequency.setValueAtTime(Math.max(20, freqStart), t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);

    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.012, duration * 0.2));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(filter);
    filter.connect(env);
    env.connect(compressor);

    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  function playTone({ type = 'sine', freqStart = 440, freqEnd = 440, duration = 0.2, gain = 0.25, attack = 0.008, delay = 0 }) {
    const c = ensureContext();
    if (!c) return;
    const t0 = c.currentTime + delay;

    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freqStart), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);

    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env);
    env.connect(compressor);

    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  const api = {
    isMuted() {
      return muted;
    },

    toggleMute() {
      muted = !muted;
      localStorage.setItem('col_sfx_muted', String(muted));
      if (!muted) {
        ensureContext();
        this.playSlot();
      }
      return muted;
    },

    // --- TACTILE UI & SEQUENCE SOUNDS ---
    playSlot() {
      playNoise({ duration: 0.055, filterType: 'bandpass', freqStart: 2400, freqEnd: 900, q: 2.2, gain: 0.28 });
      playTone({ type: 'triangle', freqStart: 320, freqEnd: 520, duration: 0.075, gain: 0.16, attack: 0.004 });
    },

    playUnplace() {
      playTone({ type: 'sine', freqStart: 460, freqEnd: 260, duration: 0.08, gain: 0.15, attack: 0.004 });
    },

    playVault() {
      playNoise({ duration: 0.16, filterType: 'lowpass', freqStart: 900, freqEnd: 180, q: 3.0, gain: 0.30 });
      playTone({ type: 'sine', freqStart: 587.33, freqEnd: 880, duration: 0.24, gain: 0.18, attack: 0.01 });
      playTone({ type: 'triangle', freqStart: 1174.66, freqEnd: 1174.66, duration: 0.28, gain: 0.10, delay: 0.04 });
    },

    playUnvault() {
      playTone({ type: 'sine', freqStart: 440, freqEnd: 987.77, duration: 0.22, gain: 0.18, attack: 0.01 });
      playNoise({ duration: 0.14, filterType: 'highpass', freqStart: 1800, freqEnd: 4200, q: 1.5, gain: 0.16 });
    },

    playScrap() {
      playNoise({ duration: 0.18, filterType: 'bandpass', freqStart: 1600, freqEnd: 320, q: 3.5, gain: 0.38 });
      playTone({ type: 'sawtooth', freqStart: 190, freqEnd: 65, duration: 0.16, gain: 0.16, attack: 0.005 });
    },

    playExecute() {
      playTone({ type: 'sine', freqStart: 140, freqEnd: 340, duration: 0.18, gain: 0.22, attack: 0.01 });
      playTone({ type: 'triangle', freqStart: 280, freqEnd: 680, duration: 0.22, gain: 0.14, delay: 0.03 });
    },

    // --- COMBAT & ELEMENTAL IMPACTS ---
    playSlash(heavy = false) {
      playNoise({
        duration: heavy ? 0.24 : 0.15,
        filterType: 'bandpass',
        freqStart: heavy ? 2600 : 3400,
        freqEnd: heavy ? 280 : 480,
        q: 1.8,
        gain: heavy ? 0.45 : 0.32
      });
      playTone({
        type: 'sine',
        freqStart: heavy ? 145 : 190,
        freqEnd: 42,
        duration: heavy ? 0.22 : 0.13,
        gain: heavy ? 0.34 : 0.22,
        attack: 0.004
      });
    },

    playShield() {
      playTone({ type: 'sine', freqStart: 523.25, freqEnd: 783.99, duration: 0.26, gain: 0.20, attack: 0.008 });
      playTone({ type: 'triangle', freqStart: 1046.5, freqEnd: 1318.5, duration: 0.30, gain: 0.11, delay: 0.02 });
    },

    playHeal() {
      [523.25, 659.25, 783.99].forEach((f, idx) => {
        playTone({ type: 'sine', freqStart: f, freqEnd: f * 1.02, duration: 0.34, gain: 0.13, attack: 0.02, delay: idx * 0.045 });
      });
    },

    playArcane() {
      playTone({ type: 'sine', freqStart: 620, freqEnd: 1240, duration: 0.24, gain: 0.18, attack: 0.01 });
      playTone({ type: 'triangle', freqStart: 930, freqEnd: 465, duration: 0.28, gain: 0.14, delay: 0.03 });
      playNoise({ duration: 0.18, filterType: 'highpass', freqStart: 2400, freqEnd: 5200, q: 2.0, gain: 0.14 });
    },

    playFire() {
      playNoise({ duration: 0.34, filterType: 'lowpass', freqStart: 1100, freqEnd: 160, q: 1.2, gain: 0.48 });
      playTone({ type: 'sine', freqStart: 110, freqEnd: 38, duration: 0.28, gain: 0.30, attack: 0.008 });
    },

    playLightning() {
      playNoise({ duration: 0.16, filterType: 'highpass', freqStart: 2200, freqEnd: 6500, q: 3.0, gain: 0.42 });
      playTone({ type: 'sawtooth', freqStart: 980, freqEnd: 140, duration: 0.14, gain: 0.16, attack: 0.002 });
    },

    playRailgun() {
      playTone({ type: 'sine', freqStart: 280, freqEnd: 1750, duration: 0.11, gain: 0.22, attack: 0.005 });
      playNoise({ duration: 0.24, filterType: 'bandpass', freqStart: 3200, freqEnd: 240, q: 2.5, gain: 0.50, delay: 0.06 });
      playTone({ type: 'sine', freqStart: 160, freqEnd: 35, duration: 0.25, gain: 0.38, delay: 0.06 });
    },

    playGunfire() {
      playNoise({ duration: 0.095, filterType: 'bandpass', freqStart: 2800, freqEnd: 420, q: 1.4, gain: 0.46 });
      playTone({ type: 'sine', freqStart: 175, freqEnd: 44, duration: 0.09, gain: 0.32, attack: 0.002 });
    },

    playPoison() {
      playNoise({ duration: 0.22, filterType: 'bandpass', freqStart: 1400, freqEnd: 2900, q: 5.0, gain: 0.24 });
      playTone({ type: 'sine', freqStart: 260, freqEnd: 410, duration: 0.18, gain: 0.12, attack: 0.01 });
    },

    playBlood() {
      playTone({ type: 'sine', freqStart: 130, freqEnd: 46, duration: 0.24, gain: 0.32, attack: 0.005 });
      playNoise({ duration: 0.14, filterType: 'bandpass', freqStart: 2100, freqEnd: 650, q: 2.2, gain: 0.28 });
    },

    playChrono() {
      playTone({ type: 'sine', freqStart: 330, freqEnd: 990, duration: 0.26, gain: 0.18, attack: 0.04 });
      playTone({ type: 'sine', freqStart: 990, freqEnd: 495, duration: 0.24, gain: 0.14, delay: 0.12 });
    },

    playCash() {
      playTone({ type: 'sine', freqStart: 1318.51, freqEnd: 1318.51, duration: 0.14, gain: 0.18, attack: 0.004 });
      playTone({ type: 'sine', freqStart: 1760.00, freqEnd: 1760.00, duration: 0.24, gain: 0.18, attack: 0.004, delay: 0.055 });
    },

    playBlackFlash() {
      playTone({ type: 'sine', freqStart: 150, freqEnd: 28, duration: 0.44, gain: 0.52, attack: 0.003 });
      playTone({ type: 'sawtooth', freqStart: 95, freqEnd: 32, duration: 0.36, gain: 0.26, attack: 0.004 });
      playNoise({ duration: 0.28, filterType: 'bandpass', freqStart: 3600, freqEnd: 220, q: 3.2, gain: 0.52 });
      playNoise({ duration: 0.18, filterType: 'highpass', freqStart: 2800, freqEnd: 7000, q: 2.5, gain: 0.32, delay: 0.04 });
    },

    playHit(blocked = false) {
      if (blocked) {
        playTone({ type: 'triangle', freqStart: 740, freqEnd: 520, duration: 0.14, gain: 0.22, attack: 0.003 });
      } else {
        playTone({ type: 'sine', freqStart: 125, freqEnd: 38, duration: 0.18, gain: 0.36, attack: 0.003 });
        playNoise({ duration: 0.11, filterType: 'lowpass', freqStart: 900, freqEnd: 180, q: 1.5, gain: 0.30 });
      }
    },

    playDodge() {
      playNoise({ duration: 0.16, filterType: 'bandpass', freqStart: 600, freqEnd: 2400, q: 1.6, gain: 0.24 });
    },

    playVictory() {
      const notes = [261.63, 329.63, 392.00, 493.88, 587.33];
      notes.forEach((freq, i) => {
        playTone({ type: 'sine', freqStart: freq, freqEnd: freq * 1.005, duration: 0.65, gain: 0.14, attack: 0.03, delay: i * 0.075 });
        playTone({ type: 'triangle', freqStart: freq * 2, freqEnd: freq * 2, duration: 0.55, gain: 0.05, attack: 0.04, delay: i * 0.075 });
      });
    },

    playDefeat() {
      const notes = [220.00, 196.00, 164.81, 130.81];
      notes.forEach((freq, i) => {
        playTone({ type: 'sine', freqStart: freq, freqEnd: freq * 0.96, duration: 0.55, gain: 0.18, attack: 0.03, delay: i * 0.14 });
      });
    }
  };

  // --- AUTO-HOOK INTO VFX, COMBAT & UI GLOBALS ---
  function wrapGlobal(fnName, hook) {
    const orig = window[fnName];
    if (typeof orig !== 'function' || orig.__sfxWrapped) return;
    const wrapped = function (...args) {
      return hook(orig, this, args);
    };
    wrapped.__sfxWrapped = true;
    window[fnName] = wrapped;
  }

  function installHooks() {
    // 1. Specialized VFX hooks
    wrapGlobal('spawnRailgunBeamVFX', (orig, self, args) => {
      api.playRailgun();
      return orig.apply(self, args);
    });
    wrapGlobal('spawnFlameJetVFX', (orig, self, args) => {
      api.playFire();
      return orig.apply(self, args);
    });
    wrapGlobal('spawnChainLightningVFX', (orig, self, args) => {
      api.playLightning();
      return orig.apply(self, args);
    });
    wrapGlobal('spawnBarrierPulseVFX', (orig, self, args) => {
      api.playShield();
      return orig.apply(self, args);
    });
    wrapGlobal('spawnGunfireTracer', (orig, self, args) => {
      api.playGunfire();
      return orig.apply(self, args);
    });
    wrapGlobal('spawnCashParticles', (orig, self, args) => {
      api.playCash();
      return orig.apply(self, args);
    });
    wrapGlobal('spawnBlackFlashVFX', (orig, self, args) => {
      api.playBlackFlash();
      return orig.apply(self, args);
    });

    // 2. Card-specific VFX audio router
    wrapGlobal('playCardVFX', (orig, self, args) => {
      const cardId = args[0];
      if (['hired_goon_contract', 'mercenary_contract', 'armored_limousine'].includes(cardId)) {
        api.playShield();
      } else if (['astral_cataclysm', 'astral_singularity', 'arcane_strike', 'spark', 'volatile_reserve', 'overcharge_conduit', 'spellweaver_prism'].includes(cardId)) {
        api.playArcane();
      } else if (cardId === 'titans_cleave' || ['heavy_slash', 'shield_slam', 'patience_fury', 'battering_rampart', 'cleaving_execution'].includes(cardId)) {
        api.playSlash(true);
      } else if (cardId === 'shadow_step_mirage') {
        api.playDodge();
      } else if (cardId === 'temporal_paradox' || ['chrono_slash', 'rift_strike', 'stasis_surge', 'entropy_bolt', 'stasis_condenser', 'temporal_fracture'].includes(cardId)) {
        api.playChrono();
      } else if (cardId === 'sanguine_eclipse' || ['siphon_slash', 'serrated_cleave', 'blood_boil', 'blood_suck', 'flurry_of_fangs', 'hemorrhagic_rupture', 'crimson_frenzy'].includes(cardId)) {
        api.playBlood();
      } else if (['fireball', 'mana_overload'].includes(cardId)) {
        api.playFire();
      } else if (['wrench_toss', 'capacitor_discharge', 'thermite_rivets', 'scrap_cannon', 'scrap_salvage', 'overload_capacitor'].includes(cardId)) {
        api.playSlash(false);
      } else if (['toxic_needle', 'venom_spreader', 'venom_surge', 'catalytic_rupture', 'vial_stash', 'shadow_prep', 'phantom_ambush'].includes(cardId)) {
        api.playPoison();
      } else if (['barrier', 'iron_defense', 'fortify', 'smoke_screen', 'bastion_scrap', 'juggernaut_stance', 'shadow_step', 'stasis_bubble', 'reinforced_plating', 'weld_and_patch', 'reactive_armor', 'deja_vu', 'chrono_rewind', 'unbreakable_phalanx', 'smokebomb_barrage', 'velvet_kevlar'].includes(cardId)) {
        api.playShield();
      } else if (['restoration', 'coagulate', 'sanguine_ward', 'bootleg_tonic', 'adrenaline_syringe'].includes(cardId)) {
        api.playHeal();
      } else if (![
        'tommy_gun_spray', 'drive_by_ambush', 'tommy_drum_extortion', 'chicago_typewriter', 'syndicate_hit_squad',
        'protection_racket', 'money_laundering', 'syndicate_ledger', 'black_market_voucher', 'offers_you_cant_refuse',
        'kingpins_ultimatum', 'golden_peacemaker', 'royal_flush', 'tesla_arc_pylon', 'arc_tesla_coil', 'astral_compass'
      ].includes(cardId)) {
        api.playArcane();
      }
      return orig.apply(self, args);
    });

    // 3. Tactile Hand, Vault, Scrap, Sequence & Victory/Defeat hooks
    wrapGlobal('vaultCardFromHand', (orig, self, args) => {
      const before = window.gameState ? gameState.hand.length : 0;
      const res = orig.apply(self, args);
      if (window.gameState && gameState.hand.length < before) api.playVault();
      return res;
    });

    wrapGlobal('unvaultCardToHand', (orig, self, args) => {
      const before = window.gameState ? gameState.vault.length : 0;
      const res = orig.apply(self, args);
      if (window.gameState && gameState.vault.length < before) api.playUnvault();
      return res;
    });

    wrapGlobal('scrapCardFromHand', (orig, self, args) => {
      const before = window.gameState ? gameState.scrappedThisTurn : 0;
      const res = orig.apply(self, args);
      if (window.gameState && gameState.scrappedThisTurn > before) api.playScrap();
      return res;
    });

    wrapGlobal('playCardToSequence', (orig, self, args) => {
      const before = window.gameState ? gameState.hand.length : 0;
      const res = orig.apply(self, args);
      if (window.gameState && gameState.hand.length < before) api.playSlot();
      return res;
    });

    wrapGlobal('removeCardFromSequence', (orig, self, args) => {
      const before = window.gameState ? gameState.hand.length : 0;
      const res = orig.apply(self, args);
      if (window.gameState && gameState.hand.length > before) api.playUnplace();
      return res;
    });

    wrapGlobal('executeSequence', (orig, self, args) => {
      const wasExec = window.gameState ? gameState.isExecuting : false;
      const res = orig.apply(self, args);
      if (window.gameState && !wasExec && gameState.isExecuting) api.playExecute();
      return res;
    });

    wrapGlobal('checkPostActionVictoryOrDefeat', (orig, self, args) => {
      const wasOver = window.gameState ? gameState.combatOver : false;
      const res = orig.apply(self, args);
      if (window.gameState && !wasOver && gameState.combatOver) {
        if (gameState.player.hp <= 0) api.playDefeat();
        else api.playVictory();
      }
      return res;
    });

    // 4. Auto-inject HUD Mute Button into .hud-right
    const hudRight = document.querySelector('.battle-hud-top .hud-right');
    if (hudRight && !document.getElementById('btn-hud-sound')) {
      const btn = document.createElement('button');
      btn.id = 'btn-hud-sound';
      btn.className = 'btn-hud';
      btn.title = 'Toggle Sound Effects';
      btn.textContent = muted ? '🔇 Muted' : '🔊 SFX';
      btn.onclick = () => {
        const nowMuted = api.toggleMute();
        btn.textContent = nowMuted ? '🔇 Muted' : '🔊 SFX';
      };
      hudRight.prepend(btn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHooks);
  } else {
    installHooks();
  }

  return api;
})();

window.SoundFX = SoundFX;
