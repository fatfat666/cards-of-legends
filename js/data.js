// --- MASTER SEVEN-CLASS + ARTIFICER CONSTRUCT FOUNDRY + EXPANSION + CONTRABAND CARD DATABASE (v0.8.0) ---
const CARD_DATABASE = {
  // Mage Cards (10 Core + 3 Expansion)
  arcane_strike: { id: 'arcane_strike', name: 'Arcane Strike', classTag: 'Mage', category: 'action', type: 'ATTACK', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 Arcane DMG' },
  barrier: { id: 'barrier', name: 'Barrier', classTag: 'Mage', category: 'action', type: 'DEFEND', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 Armor Shield' },
  spark: { id: 'spark', name: 'Spark', classTag: 'Mage', category: 'action', type: 'ATTACK', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 DMG & +1 Mana' },
  arcane_battery: { id: 'arcane_battery', name: 'Arcane Battery', classTag: 'Mage', category: 'tome', type: 'TOME', value: 1, cost: 2, costType: 'mana', rarity: 'advanced', limit: 3, text: '+1 Energy Next Turn & Tutor 1 Action Card' },
  overcharge_conduit: { id: 'overcharge_conduit', name: 'Overcharge Conduit', classTag: 'Mage', category: 'tome', type: 'TOME', value: 6, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '6 Magic DMG. If in Slot 3: +1 Energy & +1 Mana.' },
  volatile_reserve: { id: 'volatile_reserve', name: 'Volatile Reserve', classTag: 'Mage', category: 'action', type: 'ATTACK', value: 10, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, text: '10 Magic DMG (+6 DMG per turn stored in Vault).' },
  chrono_echo: { id: 'chrono_echo', name: 'Chrono Echo', classTag: 'Mage', category: 'tome', type: 'TOME', value: 5, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+5 Shield & Draw 1. Rest turn gives +1 Mana next turn.' },
  mana_overload: { id: 'mana_overload', name: 'Mana Overload', classTag: 'Mage', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, text: '12 DMG (+6 DMG per Mana spent this turn).' },
  fireball: { id: 'fireball', name: 'Fireball', classTag: 'Mage', category: 'tome', type: 'TOME', value: 25, cost: 2, costType: 'mana', rarity: 'advanced', limit: 3, text: '+25 Fire DMG' },
  prismatic_catalyst: { id: 'prismatic_catalyst', name: 'Prismatic Catalyst', classTag: 'Mage', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '-1 Energy Cost to Attack Spells this turn' },
  astral_singularity: { id: 'astral_singularity', name: 'Astral Singularity', classTag: 'Mage', category: 'tome', type: 'ATTACK', value: 24, cost: 3, costType: 'mana', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs 3 Mana: 24 AoE Arcane DMG to all enemies & +1 Energy.' },
  spellweaver_prism: { id: 'spellweaver_prism', name: 'Spellweaver Prism', classTag: 'Mage', category: 'tome', type: 'TOME', value: 6, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+6 Shield, +2 Mana & next Tome cast triggers a 50% Echo!' },
  astral_cataclysm: { id: 'astral_cataclysm', name: 'Astral Cataclysm', classTag: 'Mage', category: 'tome', type: 'TOME', value: 24, cost: 3, costType: 'mana', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Deal 24 AoE Arcane DMG; refund 1 Mana per enemy hit.' },

  // Warrior Cards (9 Core + 3 Expansion)
  heavy_slash: { id: 'heavy_slash', name: 'Heavy Slash', classTag: 'Warrior', category: 'action', type: 'ATTACK', value: 18, cost: 2, costType: 'energy', rarity: 'basic', limit: 4, text: '+18 Physical DMG' },
  iron_defense: { id: 'iron_defense', name: 'Iron Defense', classTag: 'Warrior', category: 'action', type: 'DEFEND', value: 12, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+12 Armor Shield' },
  restoration: { id: 'restoration', name: 'Restoration', classTag: 'Warrior', category: 'action', type: 'HEAL', value: 14, cost: 2, costType: 'energy', rarity: 'basic', limit: 4, text: '+14 Hull HP' },
  fortify: { id: 'fortify', name: 'Fortify', classTag: 'Warrior', category: 'action', type: 'DEFEND', value: 12, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+12 Shield (Doubles Shield up to 60)' },
  patience_fury: { id: 'patience_fury', name: 'Patience & Fury', classTag: 'Warrior', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, text: '12 Phys DMG. If Rest Bonus Turn: 24 DMG & +8 Shield.' },
  bastion_scrap: { id: 'bastion_scrap', name: 'Bastion Scrap', classTag: 'Warrior', category: 'action', type: 'DEFEND', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 Shield. If Scrapped: +12 Shield instead.' },
  battering_rampart: { id: 'battering_rampart', name: 'Battering Rampart', classTag: 'Warrior', category: 'action', type: 'ATTACK', value: 22, cost: 3, costType: 'energy', rarity: 'advanced', limit: 3, text: '22 Phys DMG. Energy cost drops to 1⚡ if placed in Slot 1.' },
  juggernaut_stance: { id: 'juggernaut_stance', name: 'Juggernaut Stance', classTag: 'Warrior', category: 'tome', type: 'STANCE', value: 10, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+10 Shield & Lock Shield Decay for 1 turn.' },
  shield_slam: { id: 'shield_slam', name: 'Shield Slam', classTag: 'Warrior', category: 'action', type: 'ATTACK', value: 0, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, text: 'Deals 100% current Shield as DMG & consumes Shield.' },
  unbreakable_phalanx: { id: 'unbreakable_phalanx', name: 'Unbreakable Phalanx', classTag: 'Warrior', category: 'action', type: 'DEFEND', value: 18, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '+18 Shield & reflect 8 Thorns DMG to attackers this turn.' },
  cleaving_execution: { id: 'cleaving_execution', name: 'Cleaving Execution', classTag: 'Warrior', category: 'action', type: 'ATTACK', value: 16, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '16 AoE Phys DMG to all enemies (+10 DMG if Shield ≥ 15).' },
  titans_cleave: { id: 'titans_cleave', name: "Titan's Cleave", classTag: 'Warrior', category: 'action', type: 'ATTACK', value: 14, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Deal 14 AoE DMG + 50% of current Shield as bonus DMG.' },

  // Rogue Cards (9 Core + 3 Expansion)
  quick_dagger: { id: 'quick_dagger', name: 'Quick Dagger', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 Fast DMG' },
  smoke_screen: { id: 'smoke_screen', name: 'Smoke Screen', classTag: 'Rogue', category: 'action', type: 'DEFEND', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 Armor Shield' },
  toxic_needle: { id: 'toxic_needle', name: 'Toxic Needle', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 6, poison: 4, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+6 DMG + 4 Poison Stacks' },
  venom_spreader: { id: 'venom_spreader', name: 'Venom Spreader', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 4, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+4 DMG & Add active Poison stacks (up to +5)' },
  shadow_prep: { id: 'shadow_prep', name: 'Shadow Prep', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 0, poison: 3, cost: 0, costType: 'energy', rarity: 'advanced', limit: 3, text: '+3 Poison to all enemies & guarantees Rest Bonus next turn.' },
  vial_stash: { id: 'vial_stash', name: 'Vial Stash', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 4, poison: 4, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+4 DMG & +4 Poison. Auto-vaults when drawn if space.' },
  venom_surge: { id: 'venom_surge', name: 'Venom Surge', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 4, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, text: '+4 DMG + 3 Poison per card queued ahead in sequence.' },
  catalytic_rupture: { id: 'catalytic_rupture', name: 'Catalytic Rupture', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 0, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, text: 'Detonate Poison (1.5x DoT DMG) & clear stacks.' },
  shadow_step: { id: 'shadow_step', name: 'Shadow Step', classTag: 'Rogue', category: 'tome', type: 'TOME', value: 15, guaranteedDodge: true, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+15 Shield, 1 Guaranteed Dodge & Prime 100% Crit.' },
  phantom_ambush: { id: 'phantom_ambush', name: 'Phantom Ambush', classTag: 'Rogue', category: 'action', type: 'ATTACK', value: 12, poison: 3, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '12 DMG (100% Crit if Evasion/Shadow Crit primed) & +3 Poison.' },
  smokebomb_barrage: { id: 'smokebomb_barrage', name: 'Smokebomb Barrage', classTag: 'Rogue', category: 'tome', type: 'TOME', value: 8, guaranteedDodge: true, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+8 Shield, +1 Guaranteed Dodge & +2 Poison to all enemies.' },
  shadow_step_mirage: { id: 'shadow_step_mirage', name: 'Shadow Step Mirage', classTag: 'Rogue', category: 'action', type: 'DEFEND', value: 10, guaranteedDodge: true, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '+10 Shield, +1 Guaranteed Dodge, and apply 3 Poison to attacker.' },

  // Chronomancer Core (4) + Expansion Cards (6)
  chrono_slash: { id: 'chrono_slash', name: 'Chrono Slash', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 11, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+11 Temporal DMG. If queued in Slot 1: +1 Chronos.' },
  stasis_bubble: { id: 'stasis_bubble', name: 'Stasis Bubble', classTag: 'Chronomancer', category: 'action', type: 'DEFEND', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 Shield (+4 extra Shield per active Chronos).' },
  rift_strike: { id: 'rift_strike', name: 'Rift Strike', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 9, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+9 DMG. Strikes twice if played from Stasis Vault!' },
  stasis_surge: { id: 'stasis_surge', name: 'Stasis Surge', classTag: 'Chronomancer', category: 'tome', type: 'TOME', value: 8, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+8 Temporal DMG, +1 Chronos & Draw 1 Action Card.' },
  entropy_bolt: { id: 'entropy_bolt', name: 'Entropy Bolt', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 8, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '8 DMG (+4 extra DMG per empty Sequence Slot).' },
  deja_vu: { id: 'deja_vu', name: 'Déjà Vu', classTag: 'Chronomancer', category: 'action', type: 'DEFEND', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+10 Shield. If Scrapped: +1 Chronos & Draw 1 Card.' },
  stasis_condenser: { id: 'stasis_condenser', name: 'Stasis Condenser', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '12 DMG & advance all Stasis Vault cards by +2 turns.' },
  chrono_rewind: { id: 'chrono_rewind', name: 'Chrono Rewind', classTag: 'Chronomancer', category: 'tome', type: 'DEFEND', value: 8, cost: 1, costType: 'chronos', rarity: 'advanced', limit: 3, isExpansion: true, text: '+8 Shield, +1⚡ & return last Slot 1 card to hand.' },
  temporal_fracture: { id: 'temporal_fracture', name: 'Temporal Fracture', classTag: 'Chronomancer', category: 'tome', type: 'ATTACK', value: 16, cost: 2, costType: 'chronos', rarity: 'advanced', limit: 3, isExpansion: true, text: '16 AoE Temporal DMG to all enemies + 1 Guaranteed Dodge.' },
  temporal_paradox: { id: 'temporal_paradox', name: 'Temporal Paradox', classTag: 'Chronomancer', category: 'tome', type: 'TOME', value: 1, cost: 2, costType: 'chronos', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Replay your last 2 played cards at 75% effectiveness and gain +1⚡.' },

  // Artificer Core (4) + Expansion (5) + Construct Foundry & Scrap Schematics (9)
  wrench_toss: { id: 'wrench_toss', name: 'Wrench Toss', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 9, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+9 Physical DMG & +1 Scrap Part.' },
  reinforced_plating: { id: 'reinforced_plating', name: 'Reinforced Plating', classTag: 'Artificer', category: 'action', type: 'DEFEND', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 Shield. If Scrapped: +2 Scrap Parts (0 Shield).' },
  capacitor_discharge: { id: 'capacitor_discharge', name: 'Capacitor Discharge', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 0, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: 'Consume all Scrap Parts to deal 5 DMG per Part.' },
  overclock_blueprint: { id: 'overclock_blueprint', name: 'Overclock Blueprint', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+1 Part, Draw 1 Action & Constructs fire +1 extra volley!' },
  weld_and_patch: { id: 'weld_and_patch', name: 'Weld & Patch', classTag: 'Artificer', category: 'action', type: 'DEFEND', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+8 Shield & repair all active Constructs for +6 HP.' },
  thermite_rivets: { id: 'thermite_rivets', name: 'Thermite Rivets', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 8, burn: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '8 DMG + 3 Burn (+5 Burn if you control a Construct).' },
  scrap_cannon: { id: 'scrap_cannon', name: 'Scrap Cannon', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '12 DMG (+6 extra DMG per card Scrapped this turn).' },
  reactive_armor: { id: 'reactive_armor', name: 'Reactive Armor', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 8, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '+8 Shield. Whenever a Construct takes DMG: +1 Part & 5 counter DMG.' },
  assembly_blueprint: { id: 'assembly_blueprint', name: 'Assembly Blueprint', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Deploy 10-HP Auto-Turret Drone (or +2 Parts). Auto-vaults if empty; deploys on unvault!' },
  auto_turret_drone: { id: 'auto_turret_drone', name: 'Auto-Turret Drone', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, constructType: 'auto_turret', text: 'Deploy a 10 HP drone dealing 6 DMG + 2 Burn per turn.' },
  heavy_rail_turret: { id: 'heavy_rail_turret', name: 'Heavy Rail-Turret', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, constructType: 'heavy_rail', text: 'Deploy a 12 HP railgun dealing 14 DMG piercing armor.' },
  inferno_flamethrower: { id: 'inferno_flamethrower', name: 'Inferno Flamethrower', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 10, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, constructType: 'inferno_flame', text: 'Deploy a 10 HP turret dealing 5 AoE DMG + 3 Burn to all enemies.' },
  aegis_force_barrier: { id: 'aegis_force_barrier', name: 'Aegis Force-Barrier', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 14, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, constructType: 'aegis_barrier', text: 'Deploy a 14 HP barrier granting +6 Shield each turn and intercepting 65% incoming damage.' },
  arc_tesla_coil: { id: 'arc_tesla_coil', name: 'Arc Tesla Coil', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 10, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, constructType: 'arc_tesla', text: 'Deploy a 10 HP coil dealing 8 DMG + 4 chain lightning and +1 Part per turn.' },
  goliath_battle_mech: { id: 'goliath_battle_mech', name: 'Goliath Battle Mech', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 18, cost: 3, costType: 'energy', rarity: 'advanced', limit: 2, isExpansion: true, constructType: 'goliath_mech', text: 'Deploy an 18 HP mech dealing 16 DMG + +6 Shield per turn.' },
  scrap_salvage: { id: 'scrap_salvage', name: 'Scrap Salvage', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 6, cost: 0, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '0⚡: 6 DMG + +2 Parts (+3 Parts when scrapped).' },
  overload_capacitor: { id: 'overload_capacitor', name: 'Overload Capacitor', classTag: 'Artificer', category: 'action', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Overclock all active Constructs for an immediate bonus volley (+2 Parts if bay is empty).' },
  tesla_arc_pylon: { id: 'tesla_arc_pylon', name: 'Tesla Arc Pylon', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Deploy a 12-HP Auto-Turret and immediately fire a chain-lightning volley (8 AoE DMG).' },

  // Blood Reaver Core (4) + Expansion Cards (6)
  siphon_slash: { id: 'siphon_slash', name: 'Siphon Slash', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 DMG & heal +3 HP.' },
  serrated_cleave: { id: 'serrated_cleave', name: 'Serrated Cleave', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 8, hemorrhage: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 DMG & apply 3 Hemorrhage stacks.' },
  blood_boil: { id: 'blood_boil', name: 'Blood Boil', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 10, hpCost: 6, cost: 6, costType: 'hp', rarity: 'basic', limit: 4, text: 'Costs 6 HP: 10 DMG & trigger target Hemorrhage twice!' },
  blood_suck: { id: 'blood_suck', name: 'Blood Suck', classTag: 'Blood Reaver', category: 'tome', type: 'TOME', value: 0, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: 'Consume target Hemorrhage: deal 2 DMG & heal 4 HP per stack.' },
  flurry_of_fangs: { id: 'flurry_of_fangs', name: 'Flurry of Fangs', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 5, hits: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: 'Strike 3 times for 5 DMG each (procs Hemorrhage 3 times!).' },
  coagulate: { id: 'coagulate', name: 'Coagulate', classTag: 'Blood Reaver', category: 'action', type: 'DEFEND', value: 12, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+12 Overheal HP. If already Overhealed, gain +1⚡ next turn.' },
  hemorrhagic_rupture: { id: 'hemorrhagic_rupture', name: 'Hemorrhagic Rupture', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 8, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '8 DMG (+4 DMG per Hemorrhage stack) without consuming stacks.' },
  crimson_frenzy: { id: 'crimson_frenzy', name: 'Crimson Frenzy', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 14, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '14 DMG. Below 50% HP: costs 0⚡ & heals +6 HP.' },
  sanguine_ward: { id: 'sanguine_ward', name: 'Sanguine Ward', classTag: 'Blood Reaver', category: 'tome', type: 'TOME', value: 10, cost: 6, hpCost: 6, costType: 'hp', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs 6 HP: +10 Overheal HP & apply 2 Hemorrhage to all enemies.' },
  sanguine_eclipse: { id: 'sanguine_eclipse', name: 'Sanguine Eclipse', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 22, hemorrhage: 5, cost: 10, hpCost: 10, costType: 'hp', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs 10 HP: Deal 22 DMG, apply 5 Hemorrhage, and heal 50% of unblocked DMG dealt.' },

  // Mob Boss Core (4) + Expansion Cards (9)
  tommy_gun_spray: { id: 'tommy_gun_spray', name: 'Tommy Gun Spray', classTag: 'Mob Boss', category: 'action', type: 'ATTACK', value: 4, hits: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: 'Fire 3 rapid shots for 4 DMG each (12 total) & gain +$5 Cash.' },
  protection_racket: { id: 'protection_racket', name: 'Protection Racket', classTag: 'Mob Boss', category: 'action', type: 'DEFEND', value: 9, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+9 Shield & extort +$10 Cash (+$5 extra per active Enforcer).' },
  shakedown: { id: 'shakedown', name: 'Shakedown', classTag: 'Mob Boss', category: 'action', type: 'ATTACK', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 DMG & collect +$12 Cash (+$24 Cash if enemy <50% HP).' },
  syndicate_ledger: { id: 'syndicate_ledger', name: 'Syndicate Ledger', classTag: 'Mob Boss', category: 'tome', type: 'TOME', value: 15, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+$15 Cash, +2 Notoriety, Draw 1 Action & heal Enforcers +5 HP.' },
  concrete_shoes: { id: 'concrete_shoes', name: 'Concrete Shoes', classTag: 'Mob Boss', category: 'action', type: 'ATTACK', value: 16, hemorrhage: 3, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '16 Heavy DMG (+5 DMG per active Enforcer) & +3 Bleed stacks.' },
  money_laundering: { id: 'money_laundering', name: 'Money Laundering', classTag: 'Mob Boss', category: 'action', type: 'DEFEND', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+10 Shield & +$15 Cash. If Scrapped: +$25 Cash, +2 ★ & +1⚡.' },
  drive_by_ambush: { id: 'drive_by_ambush', name: 'Drive-By Ambush', classTag: 'Mob Boss', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '12 AoE Gunfire DMG to all enemies & all Enforcers fire immediately!' },
  hired_goon_contract: { id: 'hired_goon_contract', name: 'Hired Goon Contract', classTag: 'Mob Boss', category: 'tome', type: 'TOME', value: 8, cost: 15, costType: 'cash', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs $15 Cash: Hire a 12-HP Frontline Enforcer & gain +8 Shield.' },
  kingpins_ultimatum: { id: 'kingpins_ultimatum', name: "Kingpin's Ultimatum", classTag: 'Mob Boss', category: 'tome', type: 'ATTACK', value: 28, cost: 30, costType: 'cash', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs $30 Cash: 28 Gold-Plated Barrage DMG + Cash Explosion (+15g Run Gold!).' },
  offers_you_cant_refuse: { id: 'offers_you_cant_refuse', name: "Offer You Can't Refuse", classTag: 'Mob Boss', category: 'tome', type: 'TOME', value: 10, cost: 20, costType: 'cash', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs $20 Cash: Intimidate enemies (-50% ATK this turn), +10 Shield, +3 ★ & Draw 1.' },
  tommy_drum_extortion: { id: 'tommy_drum_extortion', name: 'Chicago Drum Extortion', classTag: 'Mob Boss', category: 'action', type: 'ATTACK', value: 4, hits: 5, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Fire 5 rapid rounds for 4 DMG each (20 total) & extort +$4 Cash per shot!' },
  family_consigliere: { id: 'family_consigliere', name: 'Family Consigliere', classTag: 'Mob Boss', category: 'tome', type: 'TOME', value: 10, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '+10 Shield, +1 Temp Sequence Slot, +2 ★ Notoriety & -$5 Black Market Restock.' },
  syndicate_hit_squad: { id: 'syndicate_hit_squad', name: 'Syndicate Hit Squad', classTag: 'Mob Boss', category: 'tome', type: 'TOME', value: 2, cost: 25, costType: 'cash', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs $25 Cash: Summon 2 Hired Enforcers (12 HP each) and trigger an immediate coordinated volley.' },

  // Neutral Cards (2 Core + 4 Expansion)
  scrap_engine: { id: 'scrap_engine', name: 'Scrap Engine', classTag: 'Neutral', category: 'action', type: 'ATTACK', value: 6, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '6 DMG. Next card Scrapped gives +2 Energy.' },
  vault_recycle: { id: 'vault_recycle', name: 'Vault Recycle', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: 'Move Vault card into Slot 1 and draw 1 card.' },
  black_market_voucher: { id: 'black_market_voucher', name: 'Black Market Voucher', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 18, cost: 0, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '0⚡: Gain +$18 Cash, +3 ★ Notoriety & Draw 1 Action Card.' },
  mercenary_contract: { id: 'mercenary_contract', name: 'Mercenary Contract', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 1, cost: 15, costType: 'cash', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs $15 Cash: Hire a 12-HP Frontline Enforcer & gain +1 Energy.' },
  adrenaline_syringe: { id: 'adrenaline_syringe', name: 'Adrenaline Syringe', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 2, hpCost: 5, cost: 5, costType: 'hp', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs 5 HP (0⚡): Gain +2 Energy this turn & Draw 1 Action Card.' },
  astral_compass: { id: 'astral_compass', name: 'Astral Compass', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 2, cost: 0, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '0⚡: Draw 2 cards, gain +1 Scrap this turn, and gain +10g / +$10 Cash.' },

  // --- UNDERGROUND BLACK MARKET CONTRABAND CARDS (10 TIERED ITEMS — MOB BOSS EXCLUSIVE) ---
  bootleg_tonic: { id: 'bootleg_tonic', name: 'Bootleg Tonic', classTag: 'Contraband', category: 'tome', type: 'HEAL', value: 14, cost: 0, costType: 'energy', rarity: 'contraband', contrabandTier: 1, basePrice: 15, isContraband: true, limit: 3, text: '0⚡ Contraband: Heal +14 HP, +6 Shield & cleanse 2 Poison/Bleed.' },
  loaded_dice: { id: 'loaded_dice', name: 'Loaded Dice', classTag: 'Contraband', category: 'tome', type: 'TOME', value: 1, cost: 0, costType: 'energy', rarity: 'contraband', contrabandTier: 1, basePrice: 18, isContraband: true, limit: 3, text: '0⚡ Contraband: Gain +1 Energy, +15% Crit this turn & Draw 1 Card.' },
  hollow_point_mag: { id: 'hollow_point_mag', name: 'Hollow-Point Mag', classTag: 'Contraband', category: 'tome', type: 'TOME', value: 12, cost: 0, costType: 'energy', rarity: 'contraband', contrabandTier: 2, basePrice: 22, isContraband: true, limit: 3, text: '0⚡ Contraband: Next Attack deals +12 DMG, 100% Crit & +3 Bleed.' },
  velvet_kevlar: { id: 'velvet_kevlar', name: 'Velvet Kevlar', classTag: 'Contraband', category: 'action', type: 'DEFEND', value: 16, cost: 1, costType: 'energy', rarity: 'contraband', contrabandTier: 2, basePrice: 24, isContraband: true, limit: 3, text: '+16 Shield & reflect 6 DMG to attackers this turn.' },
  chicago_typewriter: { id: 'chicago_typewriter', name: 'Chicago Typewriter', classTag: 'Contraband', category: 'action', type: 'ATTACK', value: 6, hits: 4, cost: 2, costType: 'energy', rarity: 'contraband', contrabandTier: 3, basePrice: 30, isContraband: true, limit: 3, text: 'Fire 4 Tommy-Gun rounds for 6 DMG each (24 total) & +$8 Cash.' },
  syndicate_bribe: { id: 'syndicate_bribe', name: 'Syndicate Bribe', classTag: 'Contraband', category: 'tome', type: 'TOME', value: 2, cost: 0, costType: 'energy', rarity: 'contraband', contrabandTier: 3, basePrice: 28, isContraband: true, limit: 3, text: '0⚡ Contraband: Gain +2 Energy, +1 Temp Sequence Slot & Draw 1 Card.' },
  armored_limousine: { id: 'armored_limousine', name: 'Armored Limousine', classTag: 'Contraband', category: 'action', type: 'DEFEND', value: 22, cost: 1, costType: 'energy', rarity: 'contraband', contrabandTier: 4, basePrice: 36, isContraband: true, limit: 3, text: '+22 Shield, Lock Shield Decay & Hire 1 Enforcer (12 HP).' },
  golden_peacemaker: { id: 'golden_peacemaker', name: 'Golden Peacemaker', classTag: 'Contraband', category: 'action', type: 'ATTACK', value: 22, cost: 1, costType: 'energy', rarity: 'contraband', contrabandTier: 4, basePrice: 38, isContraband: true, limit: 3, text: '22 Gold-Slug DMG (2.5x on Crit!) & gain +$15 Cash on hit.' },
  godfathers_decree: { id: 'godfathers_decree', name: "Godfather's Decree", classTag: 'Contraband', category: 'tome', type: 'TOME', value: 20, cost: 1, costType: 'energy', rarity: 'mythic', contrabandTier: 5, basePrice: 48, isContraband: true, limit: 2, text: 'Mythic: 20 AoE DMG to all enemies, +20 Shield & +1 Battle Max Energy!' },
  royal_flush: { id: 'royal_flush', name: 'Royal Flush', classTag: 'Contraband', category: 'action', type: 'ATTACK', value: 25, cost: 1, costType: 'energy', rarity: 'mythic', contrabandTier: 5, basePrice: 50, isContraband: true, limit: 2, text: 'Mythic Cascade: 25 DMG, +15 Shield, +10 HP, +1⚡ & +$20 Cash!' }
};

// --- ARTIFICER CONSTRUCT CATALOG (6 DISTINCT MODELS) ---
const CONSTRUCT_CATALOG = {
  auto_turret: {
    type: 'auto_turret',
    name: 'Auto-Turret Drone',
    defaultHp: 10,
    dmg: 6,
    burn: 2,
    aoe: false,
    pierce: false,
    shieldPerTurn: 0,
    partsPerTurn: 0,
    interceptRatio: 0.50,
    colorHex: 0xf59e0b,
    accentHex: 0x38bdf8,
    desc: '10 HP Drone: 6 DMG + 2 Burn/turn.'
  },
  heavy_rail: {
    type: 'heavy_rail',
    name: 'Heavy Rail-Turret',
    defaultHp: 12,
    dmg: 14,
    burn: 0,
    aoe: false,
    pierce: true,
    shieldPerTurn: 0,
    partsPerTurn: 0,
    interceptRatio: 0.50,
    colorHex: 0x38bdf8,
    accentHex: 0xffffff,
    desc: '12 HP Railgun: 14 Piercing DMG/turn.'
  },
  inferno_flame: {
    type: 'inferno_flame',
    name: 'Inferno Flamethrower',
    defaultHp: 10,
    dmg: 5,
    burn: 3,
    aoe: true,
    pierce: false,
    shieldPerTurn: 0,
    partsPerTurn: 0,
    interceptRatio: 0.50,
    colorHex: 0xf97316,
    accentHex: 0xef4444,
    desc: '10 HP Flame Turret: 5 AoE DMG + 3 Burn to all enemies.'
  },
  aegis_barrier: {
    type: 'aegis_barrier',
    name: 'Aegis Force-Barrier',
    defaultHp: 14,
    dmg: 0,
    burn: 0,
    aoe: false,
    pierce: false,
    shieldPerTurn: 6,
    partsPerTurn: 0,
    interceptRatio: 0.65,
    colorHex: 0x06b6d4,
    accentHex: 0x93c5fd,
    desc: '14 HP Barrier: +6 Shield/turn & intercepts 65% incoming DMG.'
  },
  arc_tesla: {
    type: 'arc_tesla',
    name: 'Arc Tesla Coil',
    defaultHp: 10,
    dmg: 8,
    chainDmg: 4,
    burn: 0,
    aoe: false,
    pierce: false,
    shieldPerTurn: 0,
    partsPerTurn: 1,
    interceptRatio: 0.50,
    colorHex: 0x818cf8,
    accentHex: 0x38bdf8,
    desc: '10 HP Coil: 8 DMG + 4 Chain Lightning & +1 Part/turn.'
  },
  goliath_mech: {
    type: 'goliath_mech',
    name: 'Goliath Battle Mech',
    defaultHp: 18,
    dmg: 16,
    burn: 0,
    aoe: false,
    pierce: false,
    shieldPerTurn: 6,
    partsPerTurn: 0,
    interceptRatio: 0.55,
    colorHex: 0xeab308,
    accentHex: 0xef4444,
    desc: '18 HP Mech: 16 DMG + +6 Shield/turn.'
  }
};

const CLASS_THEMES = {
  Mage: { primaryHex: 0xc084fc, cssColor: '#c084fc', name: 'MAGE' },
  Warrior: { primaryHex: 0xef4444, cssColor: '#ef4444', name: 'WARRIOR' },
  Rogue: { primaryHex: 0x10b981, cssColor: '#4ade80', name: 'ROGUE' },
  Chronomancer: { primaryHex: 0x2dd4bf, cssColor: '#2dd4bf', name: 'CHRONOMANCER' },
  Artificer: { primaryHex: 0xf59e0b, cssColor: '#f59e0b', name: 'ARTIFICER' },
  'Blood Reaver': { primaryHex: 0xdc2626, cssColor: '#fb7185', name: 'BLOOD REAVER' },
  'Mob Boss': { primaryHex: 0xeab308, cssColor: '#eab308', name: 'MOB BOSS' },
  Neutral: { primaryHex: 0x94a3b8, cssColor: '#cbd5e1', name: 'NEUTRAL' }
};

const MASTERY_DEFINITIONS = {
  Mage: [
    { title: 'T1: Arcane Synergy', effect: '+2 Mana Turn Gain', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Mana Overflow', effect: '+2 Base Max Mana (7 Max)', req: 'Req: 10 Enemies Killed', reqVal: 10, key: 1 },
    { title: 'T3: Archmage Supremacy', effect: 'Arcane Ultimates deal +15 DMG', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Astral Omniscience', effect: 'Every 3rd Tome played costs 0 Mana, echoes at 100% power, and grants +1 temp Sequence Slot', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ],
  Warrior: [
    { title: 'T1: Heavy Iron', effect: '+20 Max HP & +5 Starting Shield', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Turtle Momentum', effect: '2 turns no HP loss → 1.5x DMG & Shield', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
    { title: 'T3: Second Wind', effect: 'Revive at 20% HP + 10 AoE DMG', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Colossus Unbreakable', effect: 'Shield carries over 100% between turns; gaining Shield deals 35% of gained Shield as AoE shockwave DMG', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ],
  Rogue: [
    { title: 'T1: Shadow Counter', effect: '20% Dodge. Dodge & Evasion cards trigger 100% Crit (2x DMG)', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Assassin Mastery', effect: '+1 Max Energy & Free Smoke Screen', req: 'Req: 12 Enemies Killed', reqVal: 12, key: 1 },
    { title: 'T3: Executioner', effect: 'Execute enemies <20% HP & heal 80%', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Phantom Sovereign', effect: 'Dodging an attack deals 14 Shadow Counter DMG, applies 2 Poison, and draws 1 Action card', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ],
  Chronomancer: [
    { title: 'T1: Temporal Anchor', effect: 'Start combat with +1 Chronos. Unvaulted cards deal +10% DMG this turn', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Accelerated Timeline', effect: 'Slot 1 casts instantaneously (0ms) on Execute Sequence; carry over up to 1 unspent Energy', req: 'Req: 12 Enemies Killed', reqVal: 12, key: 1 },
    { title: 'T3: Sovereign of Time', effect: 'Rest & Charge grants +2 Temp Slots (5 total) & triggers all Vaulted cards', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Lord of Eternity', effect: 'Max Chronos increases to 4; cards held in the Stasis Vault for 2+ turns trigger twice when unvaulted', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ],
  Artificer: [
    { title: 'T1: Master Salvager', effect: '2 Scrap/turn. Scrapping any card grants +2 Parts & fires a 4 DMG bolt', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Twin-Linked Chassis', effect: 'Start combat with 1 Auto-Turret (10 HP); Construct shots inherit Crit Chance', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
    { title: 'T3: Singularity Core', effect: 'Every 4th card Scrapped triggers a 20 AoE DMG & +15 Shield Meltdown', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Omega Foundry', effect: 'Max Constructs increases to 4; Construct volleys apply 1 Burn stack and restore +2 Player Shield per shot', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ],
  'Blood Reaver': [
    { title: 'T1: Sanguine Engine', effect: 'Shield gains convert 1:1 to Overheal HP (+25 cap). Spending HP gives +10% Crit', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Crimson Resonance', effect: 'Hemorrhaging enemies take +25% Crit DMG; bleed kills heal 12 HP', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
    { title: 'T3: Undying Sovereign', effect: 'Below 40% HP: +30% base Lifesteal & Crits grant 100% Lifesteal', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Crimson Apotheosis', effect: 'Overheal cap increases to +50 HP; spending HP deals equal bonus Hemorrhage stacks to all enemies', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ],
  'Mob Boss': [
    { title: 'T1: Syndicate Boss', effect: '$45 starting Cash, 15 ★, +$20 Cash & +2 ★ on Scrap, +$8 Cash on Crit/Kill', req: 'Unlocked by default', key: 0 },
    { title: 'T2: Made Men', effect: 'Start with 1 Hired Enforcer; crew deals +3 DMG/member & retaliates when hit', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
    { title: 'T3: Untouchable Kingpin', effect: '-25% Black Market prices; +4 Shield per $10 spent; +$25 Bounty Hit payout', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 },
    { title: 'T4: Godfather of the Underworld', effect: 'Start runs at 15 ★ Notoriety (Rank II); Enforcers gain +6 Max HP and extort +$4 Cash per attack', req: 'Req: Complete 5 Runs', reqVal: 5, isRun: true, key: 3 }
  ]
};

const RELIC_CATALOG = {
  BLACK_FLASH: { name: 'Black Flash', rarity: '👑 LEGENDARY', cssClass: 'border-legendary', desc: '+5% Crit Chance per tier. Tier 3 unlocks 2.25x Crits & 5x Shockwaves.' },
  TIME_WARP: { name: 'Time Warp', rarity: '🔷 RARE', cssClass: 'border-rare', desc: 'Slot 1 executes 50% faster. Slot 2 deals +35% Bonus DMG at Tier 3.' },
  DEFLECTION: { name: 'Deflection', rarity: '⚪ COMMON', cssClass: 'border-common', desc: '+3 Shield per turn start per tier. Reflects 50% damage at Tier 3.' },
  SHADOW_WEAVE: { name: 'Shadow Weave', rarity: '🔷 RARE', cssClass: 'border-rare', desc: '+5% Dodge Chance per tier. Dodging heals 5% HP at Tier 3.' },
  FRENZY: { name: 'Blood Frenzy', rarity: '💜 EPIC', cssClass: 'border-epic', desc: '+0.5% DMG per 1% missing HP per tier. Lifesteal at Tier 3.' },
  IGNITION: { name: 'Ignition Engine', rarity: '🔷 RARE', cssClass: 'border-rare', desc: 'Every 3rd card deals +5 Burn DMG per tier to target.' },
  CHRONO_HOURGLASS: { name: 'Chrono Hourglass', rarity: '💜 EPIC', cssClass: 'border-epic', desc: 'Every 2nd turn, gain +1 Energy and advance all Stasis Vault cards by +1 turn (Tier 3: +1 permanent Sequence Slot on Turn 1).' },
  AEGIS_OVERCHARGER: { name: 'Aegis Overcharger', rarity: '🔷 RARE', cssClass: 'border-rare', desc: 'Gain +4 Shield whenever you play a Tome (Tier 3: full Shield blocks trigger a 10 DMG counter-pulse).' },
  SYNDICATE_SIGNET: { name: 'Syndicate Signet', rarity: '👑 LEGENDARY', cssClass: 'border-legendary', desc: 'Gain +8g and +$8 Cash after every combat (Tier 3: 15% discount in both the Neon Bazaar Shop and Underground Black Market).' }
};

const STAGE_THEMES = [
  { bg: 'radial-gradient(circle at center, #1e293b 0%, #070a12 100%)' },
  { bg: 'radial-gradient(circle at center, #1e1b4b 0%, #070a12 100%)' },
  { bg: 'radial-gradient(circle at center, #064e3b 0%, #070a12 100%)' },
  { bg: 'radial-gradient(circle at center, #701a75 0%, #070a12 100%)' },
  { bg: 'radial-gradient(circle at center, #451a03 0%, #070a12 100%)' }
];

const ASTRAL_STAGE_THEMES = [
  { bg: 'radial-gradient(circle at center, #311042 0%, #05060f 100%)' },
  { bg: 'radial-gradient(circle at center, #0f294a 0%, #040711 100%)' },
  { bg: 'radial-gradient(circle at center, #3b0764 0%, #06040e 100%)' },
  { bg: 'radial-gradient(circle at center, #134e4a 0%, #040810 100%)' },
  { bg: 'radial-gradient(circle at center, #4c1d95 0%, #070412 100%)' },
  { bg: 'radial-gradient(circle at center, #581c87 0%, #09030f 100%)' }
];
