// --- MASTER SEVEN-CLASS + 32 EXPANSION + 10 CONTRABAND CARD DATABASE ---
const CARD_DATABASE = {
 // Mage Cards (10 Starter/Core + 2 Expansion)
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

 // Warrior Cards (9 Core + 2 Expansion)
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

 // Rogue Cards (9 Core + 2 Expansion)
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

 // Chronomancer Starter + 5 Expansion Cards
 chrono_slash: { id: 'chrono_slash', name: 'Chrono Slash', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 11, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+11 Temporal DMG. If queued in Slot 1: +1 Chronos.' },
 stasis_bubble: { id: 'stasis_bubble', name: 'Stasis Bubble', classTag: 'Chronomancer', category: 'action', type: 'DEFEND', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 Shield (+4 extra Shield per active Chronos).' },
 rift_strike: { id: 'rift_strike', name: 'Rift Strike', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 9, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+9 DMG. Strikes twice if played from Stasis Vault!' },
 stasis_surge: { id: 'stasis_surge', name: 'Stasis Surge', classTag: 'Chronomancer', category: 'tome', type: 'TOME', value: 8, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+8 Temporal DMG, +1 Chronos & Draw 1 Action Card.' },
 entropy_bolt: { id: 'entropy_bolt', name: 'Entropy Bolt', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 8, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '8 DMG (+4 extra DMG per empty Sequence Slot).' },
 deja_vu: { id: 'deja_vu', name: 'Déjà Vu', classTag: 'Chronomancer', category: 'action', type: 'DEFEND', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+10 Shield. If Scrapped: +1 Chronos & Draw 1 Card.' },
 stasis_condenser: { id: 'stasis_condenser', name: 'Stasis Condenser', classTag: 'Chronomancer', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '12 DMG & advance all Stasis Vault cards by +2 turns.' },
 chrono_rewind: { id: 'chrono_rewind', name: 'Chrono Rewind', classTag: 'Chronomancer', category: 'tome', type: 'DEFEND', value: 8, cost: 1, costType: 'chronos', rarity: 'advanced', limit: 3, isExpansion: true, text: '+8 Shield, +1⚡ & return last Slot 1 card to hand.' },
 temporal_fracture: { id: 'temporal_fracture', name: 'Temporal Fracture', classTag: 'Chronomancer', category: 'tome', type: 'ATTACK', value: 16, cost: 2, costType: 'chronos', rarity: 'advanced', limit: 3, isExpansion: true, text: '16 AoE Temporal DMG to all enemies + 1 Guaranteed Dodge.' },

 // Artificer Starter + 5 Expansion Cards
 wrench_toss: { id: 'wrench_toss', name: 'Wrench Toss', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 9, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+9 Physical DMG & +1 Scrap Part.' },
 reinforced_plating: { id: 'reinforced_plating', name: 'Reinforced Plating', classTag: 'Artificer', category: 'action', type: 'DEFEND', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 Shield. If Scrapped: +2 Scrap Parts (0 Shield).' },
 capacitor_discharge: { id: 'capacitor_discharge', name: 'Capacitor Discharge', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 0, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: 'Consume all Scrap Parts to deal 5 DMG per Part.' },
 overclock_blueprint: { id: 'overclock_blueprint', name: 'Overclock Blueprint', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: '+1 Part, Draw 1 Action & Turrets fire +1 extra volley!' },
 weld_and_patch: { id: 'weld_and_patch', name: 'Weld & Patch', classTag: 'Artificer', category: 'action', type: 'DEFEND', value: 8, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+8 Shield & repair all active Auto-Turrets for +6 HP.' },
 thermite_rivets: { id: 'thermite_rivets', name: 'Thermite Rivets', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 8, burn: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '8 DMG + 3 Burn (+5 Burn if you control a Turret).' },
 scrap_cannon: { id: 'scrap_cannon', name: 'Scrap Cannon', classTag: 'Artificer', category: 'action', type: 'ATTACK', value: 12, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '12 DMG (+6 extra DMG per card Scrapped this turn).' },
 reactive_armor: { id: 'reactive_armor', name: 'Reactive Armor', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 8, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '+8 Shield. Whenever a Turret takes DMG: +1 Part & 5 counter DMG.' },
 assembly_blueprint: { id: 'assembly_blueprint', name: 'Assembly Blueprint', classTag: 'Artificer', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Deploy 10-HP Auto-Turret (or +2 Parts). Auto-vaults if empty; deploys on unvault!' },

 // Blood Reaver Starter + 5 Expansion Cards
 siphon_slash: { id: 'siphon_slash', name: 'Siphon Slash', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 10, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+10 DMG & heal +3 HP.' },
 serrated_cleave: { id: 'serrated_cleave', name: 'Serrated Cleave', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 8, hemorrhage: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '+8 DMG & apply 3 Hemorrhage stacks.' },
 blood_boil: { id: 'blood_boil', name: 'Blood Boil', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 10, hpCost: 6, cost: 6, costType: 'hp', rarity: 'basic', limit: 4, text: 'Costs 6 HP: 10 DMG & trigger target Hemorrhage twice!' },
 blood_suck: { id: 'blood_suck', name: 'Blood Suck', classTag: 'Blood Reaver', category: 'tome', type: 'TOME', value: 0, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: 'Consume target Hemorrhage: deal 2 DMG & heal 4 HP per stack.' },
 flurry_of_fangs: { id: 'flurry_of_fangs', name: 'Flurry of Fangs', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 5, hits: 3, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: 'Strike 3 times for 5 DMG each (procs Hemorrhage 3 times!).' },
 coagulate: { id: 'coagulate', name: 'Coagulate', classTag: 'Blood Reaver', category: 'action', type: 'DEFEND', value: 12, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '+12 Overheal HP. If already Overhealed, gain +1⚡ next turn.' },
 hemorrhagic_rupture: { id: 'hemorrhagic_rupture', name: 'Hemorrhagic Rupture', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 8, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '8 DMG (+4 DMG per Hemorrhage stack) without consuming stacks.' },
 crimson_frenzy: { id: 'crimson_frenzy', name: 'Crimson Frenzy', classTag: 'Blood Reaver', category: 'action', type: 'ATTACK', value: 14, cost: 2, costType: 'energy', rarity: 'advanced', limit: 3, isExpansion: true, text: '14 DMG. Below 50% HP: costs 0⚡ & heals +6 HP.' },
 sanguine_ward: { id: 'sanguine_ward', name: 'Sanguine Ward', classTag: 'Blood Reaver', category: 'tome', type: 'TOME', value: 10, cost: 6, hpCost: 6, costType: 'hp', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs 6 HP: +10 Overheal HP & apply 2 Hemorrhage to all enemies.' },

 // Mob Boss Starter (4) + Expansion Cards (8)
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

 // Neutral Cards (2 Core + 3 Expansion)
 scrap_engine: { id: 'scrap_engine', name: 'Scrap Engine', classTag: 'Neutral', category: 'action', type: 'ATTACK', value: 6, cost: 1, costType: 'energy', rarity: 'basic', limit: 4, text: '6 DMG. Next card Scrapped gives +2 Energy.' },
 vault_recycle: { id: 'vault_recycle', name: 'Vault Recycle', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 1, cost: 1, costType: 'energy', rarity: 'advanced', limit: 3, text: 'Move Vault card into Slot 1 and draw 1 card.' },
 black_market_voucher: { id: 'black_market_voucher', name: 'Black Market Voucher', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 18, cost: 0, costType: 'energy', rarity: 'basic', limit: 4, isExpansion: true, text: '0⚡: Gain +$18 Cash, +3 ★ Notoriety & Draw 1 Action Card.' },
 mercenary_contract: { id: 'mercenary_contract', name: 'Mercenary Contract', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 1, cost: 15, costType: 'cash', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs $15 Cash: Hire a 12-HP Frontline Enforcer & gain +1 Energy.' },
 adrenaline_syringe: { id: 'adrenaline_syringe', name: 'Adrenaline Syringe', classTag: 'Neutral', category: 'tome', type: 'TOME', value: 2, hpCost: 5, cost: 5, costType: 'hp', rarity: 'advanced', limit: 3, isExpansion: true, text: 'Costs 5 HP (0⚡): Gain +2 Energy this turn & Draw 1 Action Card.' },

 // --- UNDERGROUND BLACK MARKET CONTRABAND CARDS (10 TIERED ITEMS) ---
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
 { title: 'T2: Mana Overflow', effect: '+2 Base Max Mana', req: 'Req: 10 Enemies Killed', reqVal: 10, key: 1 },
 { title: 'T3: Archmage Supremacy', effect: 'Arcane Ult deals +15 DMG', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ],
 Warrior: [
 { title: 'T1: Heavy Iron', effect: '+20 Max HP & +5 Shield', req: 'Unlocked by default', key: 0 },
 { title: 'T2: Turtle Momentum', effect: '2 turns no HP loss → 1.5x stats', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
 { title: 'T3: Second Wind', effect: 'Revive at 20% HP + 10 DMG', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ],
 Rogue: [
 { title: 'T1: Shadow Counter', effect: '20% Dodge. Dodge & Evasion cards trigger 100% Crit (2x DMG)', req: 'Unlocked by default', key: 0 },
 { title: 'T2: Assassin Mastery', effect: '+1 Energy & Smoke Screen', req: 'Req: 12 Enemies Killed', reqVal: 12, key: 1 },
 { title: 'T3: Executioner', effect: 'Execute enemies <20% HP & heal 80%', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ],
 Chronomancer: [
 { title: 'T1: Temporal Anchor', effect: 'Start combat with +1 Chronos. Unvaulted cards deal +10% DMG this turn', req: 'Unlocked by default', key: 0 },
 { title: 'T2: Accelerated Timeline', effect: 'Slot 1 casts instantly when slotted; carry over up to 1 unspent Energy', req: 'Req: 12 Enemies Killed', reqVal: 12, key: 1 },
 { title: 'T3: Sovereign of Time', effect: 'Rest & Charge grants +2 Temp Slots (5 total) & triggers all Vaulted cards', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ],
 Artificer: [
 { title: 'T1: Master Salvager', effect: '2 Scrap/turn. Scrapping any card fires a 4 DMG bolt at an enemy', req: 'Unlocked by default', key: 0 },
 { title: 'T2: Twin-Linked Chassis', effect: 'Start combat with 1 Auto-Turret (10 HP); Turret shots inherit Crit Chance', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
 { title: 'T3: Singularity Core', effect: 'Every 4th card Scrapped triggers a 20 AoE DMG & +15 Shield Meltdown', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ],
 'Blood Reaver': [
 { title: 'T1: Sanguine Engine', effect: 'Shield gains convert 1:1 to Overheal HP (+25 cap). Spending HP gives +10% Crit', req: 'Unlocked by default', key: 0 },
 { title: 'T2: Crimson Resonance', effect: 'Hemorrhaging enemies take +25% Crit DMG; bleed kills heal 12 HP', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
 { title: 'T3: Undying Sovereign', effect: 'Below 40% HP: +30% base Lifesteal & Crits grant 100% Lifesteal', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ],
 'Mob Boss': [
 { title: 'T1: Syndicate Boss', effect: '$45 starting Cash, 15 ★, +$20 Cash & +2 ★ on Scrap, +$8 Cash on Crit/Kill', req: 'Unlocked by default', key: 0 },
 { title: 'T2: Made Men', effect: 'Start with 1 Hired Enforcer; crew deals +3 DMG/member & retaliates when hit', req: 'Req: 15 Enemies Killed', reqVal: 15, key: 1 },
 { title: 'T3: Untouchable Kingpin', effect: '-25% Black Market prices; +4 Shield per $10 spent; +$25 Bounty Hit payout', req: 'Req: Complete 3 Runs', reqVal: 3, isRun: true, key: 2 }
 ]
};

const RELIC_CATALOG = {
 BLACK_FLASH: { name: 'Black Flash', rarity: '👑 LEGENDARY', cssClass: 'border-legendary', desc: '+5% Crit Chance per tier. Tier 3 unlocks 2.25x Crits & 5x Shockwaves.' },
 TIME_WARP: { name: 'Time Warp', rarity: '🔷 RARE', cssClass: 'border-rare', desc: 'Slot 1 executes 50% faster. Slot 2 deals +35% Bonus DMG at Tier 3.' },
 DEFLECTION: { name: 'Deflection', rarity: '⚪ COMMON', cssClass: 'border-common', desc: '+3 Shield per turn start per tier. Reflects 50% damage at Tier 3.' },
 SHADOW_WEAVE: { name: 'Shadow Weave', rarity: '🔷 RARE', cssClass: 'border-rare', desc: '+5% Dodge Chance per tier. Dodging heals 5% HP at Tier 3.' },
 FRENZY: { name: 'Blood Frenzy', rarity: '💜 EPIC', cssClass: 'border-epic', desc: '+0.5% DMG per 1% missing HP per tier. Lifesteal at Tier 3.' },
 IGNITION: { name: 'Ignition Engine', rarity: '🔷 RARE', cssClass: 'border-rare', desc: 'Every 3rd card deals +5 Burn DMG per tier to target.' }
};

const STAGE_THEMES = [
 { bg: 'radial-gradient(circle at center, #1e293b 0%, #070a12 100%)' },
 { bg: 'radial-gradient(circle at center, #1e1b4b 0%, #070a12 100%)' },
 { bg: 'radial-gradient(circle at center, #064e3b 0%, #070a12 100%)' },
 { bg: 'radial-gradient(circle at center, #701a75 0%, #070a12 100%)' },
 { bg: 'radial-gradient(circle at center, #451a03 0%, #070a12 100%)' }
];
