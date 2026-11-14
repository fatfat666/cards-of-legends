# Cards of Legends v0.8.0 — Astral Nexus & Construct Foundry

A modular, browser-based Seven-Class Tactical Deckbuilding Roguelite powered by **PixiJS** and Vanilla ES6+ JavaScript.

## What's New in v0.8.0

### 1. Stage II: *Astral Nexus* (Second Floor)
- Defeating the Stage I Boss (*Void Overlord*) opens the **Stage I Cleared / Ascend to Stage II** transition modal.
- **Ascend to Stage II: Astral Nexus:** Heals **+35% Max HP**, grants **+50g** Gold, raises the Max Deck Cap from **20 → 26 cards**, unlocks **Cross-Class Victory Drafts** across all 7 classes, and introduces 6 cosmic nodes culminating in **Omega Architect: Eternity Prime** (185 HP, 25 Shield, plays 2 enemy cards per turn).
- **Card-Playing Enemy AI:** Enemies play named tactical cards (`ATTACK`, `DEFEND`, `HEAL`, `COMBO`) with visible Shield values and multi-effect sequences.

### 2. Campfire / Rest Shrine Random Encounter
- Flipping the Fate Coin on intermediate board nodes can reveal a **🔥 Campfire / Rest Shrine**:
  - **Option A — Rejuvenate:** Restore **40% Max HP** (+15 Overheal for Blood Reaver) and cleanse all run debuffs.
  - **Option B — Arcane Forge:** Gain **+1 Permanent Scrap Limit/Turn** or scavenge extra **Gold & Notoriety**.

### 3. Artificer 6-Construct Foundry & 8 New Cards
- **6 Distinct Procedural PixiJS Construct Models** with individual HP bars and custom projectile VFX:
  1. **Auto-Turret Drone** (`10 HP`): `6 DMG + 2 Burn` per turn.
  2. **Heavy Rail-Turret** (`12 HP`): `14 Piercing DMG` (ignores enemy Shield).
  3. **Inferno Flamethrower** (`10 HP`): `5 AoE DMG + 3 Burn` to all enemies.
  4. **Aegis Force-Barrier** (`14 HP`): `+6 Player Shield`/turn & intercepts **65%** of incoming damage.
  5. **Arc Tesla Coil** (`10 HP`): `8 DMG + 4 Chain Lightning` & `+1 Scrap Part`/turn.
  6. **Goliath Battle Mech** (`18 HP`): `16 DMG + +6 Player Shield`/turn.
- Plus **Scrap Salvage** (`0⚡`, `6 DMG + 2 Parts`, `+3 Parts` on Scrap) and **Overload Capacitor** (`1⚡`, immediate bonus Construct volley).

### 4. All 8 Signature Expansion Cards
- **Astral Cataclysm** (*Mage*, `3 Mana`): `24 AoE Arcane DMG; refund 1 Mana per enemy hit.`
- **Titan's Cleave** (*Warrior*, `2 Energy`): `14 AoE DMG + 50% of current Shield as bonus DMG.`
- **Shadow Step Mirage** (*Rogue*, `1 Energy`): `+10 Shield, +1 Guaranteed Dodge, and apply 3 Poison to attacker.`
- **Temporal Paradox** (*Chronomancer*, `2 Chronos`): `Replay your last 2 played cards at 75% effectiveness and gain +1⚡.`
- **Tesla Arc Pylon** (*Artificer*, `2 Energy`): `Deploy a 12-HP Auto-Turret and immediately fire an 8 AoE chain-lightning volley.`
- **Sanguine Eclipse** (*Blood Reaver*, `10 HP`): `Deal 22 DMG, apply 5 Hemorrhage, and heal 50% of unblocked DMG dealt.`
- **Syndicate Hit Squad** (*Mob Boss*, `$25 Cash`): `Summon 2 Hired Enforcers (12 HP each) and trigger an immediate coordinated volley.`
- **Astral Compass** (*Neutral*, `0 Energy`): `Draw 2 cards, gain +1 Scrap this turn, and gain +10g / +$10 Cash.`

### 5. Three New Relics
- **Chrono Hourglass** (*Epic*): Every 2nd turn, gain `+1 Energy` and advance all Stasis Vault cards by `+1` turn (Tier 3: `+1` permanent Sequence Slot on Turn 1).
- **Aegis Overcharger** (*Rare*): Gain `+4 Shield` whenever you play a Tome (Tier 3: full Shield blocks trigger a `10 DMG` counter-pulse).
- **Syndicate Signet** (*Legendary*): Gain `+8g` and `+$8 Cash` after every combat (Tier 3: `15%` discount in both the Neon Bazaar Shop and Black Market).

### 6. Complete Tier 1–4 Masteries & Balance Fixes
- **Mob Boss-Exclusive Black Market:** Black Market buttons, Syndicate Cash/Notoriety HUD badges, and Contraband drafts are strictly exclusive to the **Mob Boss**.
- **Chronomancer T2 (*Accelerated Timeline*):** Slot 1 remains queued until **Execute Sequence**, then casts instantaneously (`0ms` delay).
- **All Tier 4 Masteries Implemented:** *Astral Omniscience* (Mage), *Colossus Unbreakable* (Warrior), *Phantom Sovereign* (Rogue), *Lord of Eternity* (Chronomancer), *Omega Foundry* (Artificer), *Crimson Apotheosis* (Blood Reaver), and *Godfather of the Underworld* (Mob Boss).
- **Bug Fixes:** Fixed `Overcharge Conduit` resolution as a `TOME` and implemented `Bootleg Tonic`'s debuff cleanse.
