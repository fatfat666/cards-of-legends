// --- MACBOOK RETINA (2X DPI) & SHORT-VIEWPORT FIX (v0.8.0) ---
(function () {
  // 1. Inject responsive battle layout CSS so hand cards never clip on MacBook / iframes
  if (!document.getElementById('macbook-viewport-fix-css')) {
    const style = document.createElement('style');
    style.id = 'macbook-viewport-fix-css';
    style.textContent = `
      #screen-battle.screen.active {
        height: 100dvh;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        padding-top: 8px;
        padding-bottom: 8px;
        gap: 8px;
        box-sizing: border-box;
      }
      #screen-battle .battle-hud-top,
      #screen-battle .sequence-vault-row,
      #screen-battle .hand-area {
        flex-shrink: 0;
      }
      #screen-battle .battle-stage-wrapper {
        flex: 1 1 auto;
        min-height: 150px;
        max-height: 260px;
        position: relative;
        overflow: hidden;
      }
      #screen-battle #pixi-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      #screen-battle #pixi-container canvas {
        width: 100% !important;
        height: 100% !important;
        display: block;
      }
      #screen-battle .hand-area {
        padding-bottom: 2px;
      }
      #screen-battle .hand-card {
        min-height: 150px;
        padding: 8px 10px;
      }
    `;
    document.head.appendChild(style);
  }

  // 2. Force autoDensity: true at PIXI.Application construction time (prevents 2x Retina zoom)
  if (window.PIXI && PIXI.Application && !PIXI.Application.__retinaPatched) {
    const OrigApp = PIXI.Application;
    function PatchedApplication(options = {}) {
      const merged = Object.assign({}, options, {
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
      });
      return new OrigApp(merged);
    }
    PatchedApplication.prototype = OrigApp.prototype;
    Object.setPrototypeOf(PatchedApplication, OrigApp);
    PatchedApplication.__retinaPatched = true;
    PIXI.Application = PatchedApplication;
  }

  // 3. Always resize & position units using logical CSS pixels
  function syncStageAndUnits() {
    const container = document.getElementById('pixi-container');
    if (typeof pixiApp === 'undefined' || !pixiApp || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    if (pixiApp.screen.width !== w || pixiApp.screen.height !== h) {
      pixiApp.renderer.resize(w, h);
    }

    if (typeof playerContainer !== 'undefined' && playerContainer) {
      playerContainer.x = Math.round(w * 0.22);
      playerContainer.y = Math.round(h * 0.62);
    }

    if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
      const count = enemyEntities.length;
      enemyEntities.forEach((ent, idx) => {
        if (!ent || !ent.container) return;
        const spacing = count > 1 ? Math.min(125, (w * 0.36) / count) : 0;
        const startX = w * 0.72 - ((count - 1) * spacing) / 2;
        ent.container.x = Math.round(startX + idx * spacing);
        ent.baseY = Math.round(h * 0.60);
        ent.container.y = ent.baseY;
      });
    }

    if (typeof renderArtificerTurrets === 'function') renderArtificerTurrets();
    if (typeof renderMobEnforcers === 'function') renderMobEnforcers();
  }

  function installRuntimeWrappers() {
    window.repositionCombatUnits = syncStageAndUnits;

    if (typeof window.initPixi === 'function' && !window.initPixi.__viewportWrapped) {
      const origInit = window.initPixi;
      const wrappedInit = function (...args) {
        const res = origInit.apply(this, args);
        const container = document.getElementById('pixi-container');

        syncStageAndUnits();

        if (typeof pixiApp !== 'undefined' && pixiApp && !pixiApp.__viewportTicker) {
          pixiApp.__viewportTicker = true;
          pixiApp.ticker.add(() => {
            const c = document.getElementById('pixi-container');
            if (!c || !c.clientHeight) return;
            const h = c.clientHeight;
            const t = typeof battleTime !== 'undefined' ? battleTime : performance.now() * 0.003;

            if (typeof playerContainer !== 'undefined' && playerContainer) {
              playerContainer.y = Math.round(h * 0.62) + Math.sin(t * 2) * 3;
            }
            if (typeof enemyEntities !== 'undefined' && Array.isArray(enemyEntities)) {
              enemyEntities.forEach((ent, idx) => {
                if (ent && ent.container && ent.data && ent.data.hp > 0) {
                  ent.baseY = Math.round(h * 0.60);
                  ent.container.y = ent.baseY + Math.sin(t * 2.2 + idx) * 3.5;
                }
              });
            }
          });
        }

        if (container && typeof ResizeObserver !== 'undefined' && !container.__viewportRO) {
          container.__viewportRO = true;
          new ResizeObserver(() => syncStageAndUnits()).observe(container);
        }

        return res;
      };
      wrappedInit.__viewportWrapped = true;
      window.initPixi = wrappedInit;
    }

    if (typeof window.navigateTo === 'function' && !window.navigateTo.__viewportWrapped) {
      const origNav = window.navigateTo;
      const wrappedNav = function (screenName, ...rest) {
        const res = origNav.apply(this, [screenName, ...rest]);
        if (screenName === 'BATTLE') {
          requestAnimationFrame(() => syncStageAndUnits());
          setTimeout(() => syncStageAndUnits(), 60);
        }
        return res;
      };
      wrappedNav.__viewportWrapped = true;
      window.navigateTo = wrappedNav;
    }
  }

  window.addEventListener('resize', syncStageAndUnits);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRuntimeWrappers);
  } else {
    installRuntimeWrappers();
  }
})();