/**
 * Deadlock Counter Logic v4.0 - Major Upgrade
 * Based on deadlock.wiki and community meta as of 2025
 * @module counter-logic
 */

// Hero database with accurate threat tags and icon URLs
const HEROES = {
  "Abrams": { 
    tags: ["tank", "melee", "regen", "cc", "gap_closer", "sustain", "charge", "stun"],
    threats: ["high_hp", "melee_threat", "cc_chain"],
    color: "#e67e22",
    icon: "abrams",
    role: "bruiser",
    priorities: { bullet_resist: 0.8, spirit_resist: 0.4, anti_kite: 1.0, sustain: 0.9 }
  },
  "Bebop": { 
    tags: ["cc", "hook", "burst_damage", "bomb", "ult_channeling", "displacement"],
    threats: ["hook_threat", "burst", "channeling_ult"],
    color: "#9b59b6",
    icon: "bebop",
    role: "controller",
    priorities: { spirit_resist: 0.7, mobility: 0.6, survivability: 0.8 }
  },
  "Calico": { 
    tags: ["support", "healing", "cc", "mobility", "dash"],
    threats: ["team_healing", "mobility"],
    color: "#1abc9c",
    icon: "calico",
    role: "support",
    priorities: { survivability: 0.9, spirit_resist: 0.6, anti_assassin: 0.8 }
  },
  "Dynamo": { 
    tags: ["healing", "cc", "support", "spirit_damage", "aoe_heal", "ult_channeling", "stun"],
    threats: ["team_healing", "channeling_ult", "aoe_cc"],
    color: "#3498db",
    icon: "dynamo",
    role: "support",
    priorities: { survivability: 0.9, spirit_resist: 0.5, anti_interrupt: 0.8 }
  },
  "Grey Talon": { 
    tags: ["weapon_focused", "bullet_damage", "ranged", "spirit_damage", "poke"],
    threats: ["long_range", "poke", "mixed_damage"],
    color: "#7f8c8d",
    icon: "grey_talon",
    role: "carry",
    priorities: { survivability: 0.7, anti_assassin: 0.9, positioning: 0.8 }
  },
  "Haze": { 
    tags: ["weapon_focused", "bullet_damage", "assassin", "squishy", "invis", "ult_channeling", "dps"],
    threats: ["invis_threat", "channeling_ult", "high_dps", "assassin"],
    color: "#e74c3c",
    icon: "haze",
    role: "carry",
    priorities: { spirit_resist: 0.9, anti_cc: 0.9, survivability: 0.7, lifesteal: 0.8 }
  },
  "Holliday": { 
    tags: ["weapon_focused", "burst_damage", "cc", "ground_pound", "stun"],
    threats: ["burst", "cc_chain"],
    color: "#d35400",
    icon: "holliday",
    role: "bruiser",
    priorities: { bullet_resist: 0.6, mobility: 0.7, survivability: 0.8 }
  },
  "Infernus": { 
    tags: ["spirit_damage", "dot", "healing", "sustain", "aoe", "afterburn"],
    threats: ["dot_damage", "self_sustain", "spirit_burst"],
    color: "#e74c3c",
    icon: "infernus",
    role: "mage",
    priorities: { anti_heal: 0.3, spirit_power: 0.9, survivability: 0.7 }
  },
  "Ivy": { 
    tags: ["support", "healing", "mobile", "team_mobility", "tether"],
    threats: ["team_healing", "team_mobility"],
    color: "#2ecc71",
    icon: "ivy",
    role: "support",
    priorities: { survivability: 0.9, anti_assassin: 0.8, mobility: 0.6 }
  },
  "Kelvin": { 
    tags: ["tank", "cc", "spirit_damage", "aoe", "slow", "beam", "stun"],
    threats: ["aoe_cc", "tank", "spirit_burst"],
    color: "#3498db",
    icon: "kelvin",
    role: "tank",
    priorities: { bullet_resist: 0.8, spirit_power: 0.7, survivability: 0.9 }
  },
  "Lady Geist": { 
    tags: ["spirit_damage", "burst_spirit", "lifesteal", "sustain", "execute"],
    threats: ["spirit_burst", "self_sustain", "execute"],
    color: "#8e44ad",
    icon: "lady_geist",
    role: "mage",
    priorities: { spirit_resist: 0.5, anti_heal: 0.3, survivability: 0.8 }
  },
  "Lash": { 
    tags: ["mobile", "cc", "spirit_damage", "melee", "gap_closer", "slam", "displacement"],
    threats: ["mobility", "displacement", "burst"],
    color: "#f39c12",
    icon: "lash",
    role: "bruiser",
    priorities: { bullet_resist: 0.6, mobility: 0.5, survivability: 0.8 }
  },
  "McGinnis": { 
    tags: ["turrets", "sustained_damage", "zone_control", "wall", "objective"],
    threats: ["zone_control", "sustained_dps"],
    color: "#27ae60",
    icon: "mcginnis",
    role: "specialist",
    priorities: { survivability: 0.9, bullet_resist: 0.7, anti_dive: 0.8 }
  },
  "Mirage": { 
    tags: ["spirit_damage", "burst_spirit", "aoe", "scarabs", "tornado"],
    threats: ["spirit_burst", "aoe_damage"],
    color: "#9b59b6",
    icon: "mirage",
    role: "mage",
    priorities: { spirit_resist: 0.5, survivability: 0.7, spirit_power: 0.9 }
  },
  "Mo & Krill": { 
    tags: ["tank", "cc", "sustain", "melee", "burrow", "ult_suppress", "stun"],
    threats: ["suppress", "tank", "melee_threat"],
    color: "#34495e",
    icon: "mo_krill",
    role: "tank",
    priorities: { bullet_resist: 0.7, anti_kite: 0.9, survivability: 0.9 }
  },
  "Paradox": { 
    tags: ["cc", "spirit_damage", "burst_spirit", "swap", "time_stop", "stun"],
    threats: ["displacement", "spirit_burst", "cc_chain"],
    color: "#1abc9c",
    icon: "paradox",
    role: "mage",
    priorities: { survivability: 0.8, spirit_power: 0.8, anti_cc: 0.6 }
  },
  "Pocket": { 
    tags: ["spirit_damage", "burst_spirit", "squishy", "mobile", "briefcase"],
    threats: ["spirit_burst", "mobility"],
    color: "#9b59b6",
    icon: "pocket",
    role: "mage",
    priorities: { survivability: 0.8, spirit_power: 0.9, mobility: 0.7 }
  },
  "Seven": { 
    tags: ["spirit_damage", "aoe", "stun", "ult_channeling", "burst_spirit", "chain_lightning"],
    threats: ["channeling_ult", "aoe_damage", "spirit_burst", "stun"],
    color: "#3498db",
    icon: "seven",
    role: "mage",
    priorities: { anti_interrupt: 0.9, survivability: 0.7, spirit_power: 0.9 }
  },
  "Shiv": { 
    tags: ["assassin", "melee", "execute", "bleed", "dash", "rage"],
    threats: ["assassin", "execute", "melee_threat", "bleed"],
    color: "#c0392b",
    icon: "shiv",
    role: "assassin",
    priorities: { survivability: 0.8, anti_kite: 0.9, lifesteal: 0.7 }
  },
  "Vindicta": { 
    tags: ["weapon_focused", "bullet_damage", "sniper", "ranged", "execute", "flight"],
    threats: ["long_range", "execute", "sniper"],
    color: "#2c3e50",
    icon: "vindicta",
    role: "carry",
    priorities: { survivability: 0.8, anti_assassin: 0.9, positioning: 0.9 }
  },
  "Viscous": { 
    tags: ["tank", "cc", "spirit_damage", "sustain", "puddle", "cube"],
    threats: ["tank", "cc_chain", "sustain"],
    color: "#16a085",
    icon: "viscous",
    role: "tank",
    priorities: { survivability: 0.8, spirit_power: 0.7, anti_heal: 0.5 }
  },
  "Vyper": { 
    tags: ["spirit_damage", "dot", "aoe", "puddle", "sustain"],
    threats: ["dot_damage", "zone_control"],
    color: "#27ae60",
    icon: "vyper",
    role: "mage",
    priorities: { survivability: 0.7, spirit_power: 0.9, anti_heal: 0.4 }
  },
  "Warden": { 
    tags: ["tank", "cc", "stun", "bullet_damage", "binding", "ult_fear"],
    threats: ["cc_chain", "tank", "binding"],
    color: "#2c3e50",
    icon: "warden",
    role: "tank",
    priorities: { bullet_resist: 0.7, survivability: 0.9, anti_cc: 0.5 }
  },
  "Wraith": { 
    tags: ["weapon_focused", "bullet_damage", "burst_damage", "mobile", "sniper", "card"],
    threats: ["burst", "long_range", "mobility"],
    color: "#7f8c8d",
    icon: "wraith",
    role: "carry",
    priorities: { survivability: 0.7, anti_assassin: 0.8, lifesteal: 0.7 }
  },
  "Yamato": { 
    tags: ["weapon_focused", "melee", "burst_damage", "mobile", "parry", "ult_channeling"],
    threats: ["burst", "melee_threat", "channeling_ult"],
    color: "#e74c3c",
    icon: "yamato",
    role: "bruiser",
    priorities: { survivability: 0.7, anti_cc: 0.8, lifesteal: 0.8 }
  },
  "Billy": { 
    tags: ["tank", "cc", "melee", "sustain", "knockup", "chain", "gap_closer", "stun"],
    threats: ["cc_chain", "melee_threat", "tank"],
    color: "#8B4513",
    icon: "billy",
    role: "tank",
    priorities: { bullet_resist: 0.7, anti_kite: 0.9, survivability: 0.9 }
  },
  "Mina": { 
    tags: ["spirit_damage", "burst_spirit", "squishy", "mobile", "escape", "silence", "assassin"],
    threats: ["spirit_burst", "silence", "assassin"],
    color: "#800020",
    icon: "mina",
    role: "assassin",
    priorities: { survivability: 0.7, spirit_power: 0.9, mobility: 0.8 }
  },
  "Sinclair": { 
    tags: ["spirit_damage", "poke", "cc", "polymorph", "hex", "ult_copy", "support"],
    threats: ["cc_chain", "spirit_burst", "poke"],
    color: "#DA70D6",
    icon: "sinclair",
    role: "support",
    priorities: { survivability: 0.8, spirit_power: 0.7, anti_cc: 0.6 }
  },
  "Drifter": { 
    tags: ["assassin", "weapon_focused", "isolation", "bleed", "ambush", "gap_closer", "execute"],
    threats: ["assassin", "execute", "isolation"],
    color: "#2F4F4F",
    icon: "drifter",
    role: "assassin",
    priorities: { survivability: 0.7, anti_kite: 0.8, lifesteal: 0.8 }
  },
  "Doorman": { 
    tags: ["spirit_damage", "cc", "zone_control", "portals", "pull", "slow"],
    threats: ["zone_control", "displacement", "spirit_burst"],
    color: "#4A4A4A",
    icon: "doorman",
    role: "controller",
    priorities: { survivability: 0.8, spirit_power: 0.8, anti_cc: 0.5 }
  },
  "Victor": { 
    tags: ["tank", "sustain", "aoe", "spirit_damage", "revive", "mobile"],
    threats: ["tank", "aoe_damage", "hard_to_kill"],
    color: "#FFD700",
    icon: "victor",
    role: "bruiser",
    priorities: { survivability: 0.9, spirit_power: 0.7, anti_heal: 0.4 }
  },
  "Paige": { 
    tags: ["support", "healing", "cc", "shield", "barrier", "spirit_damage", "global_ult", "stun"],
    threats: ["team_healing", "cc_chain", "global_ult"],
    color: "#FFB6C1",
    icon: "paige",
    role: "support",
    priorities: { survivability: 0.9, spirit_power: 0.6, anti_assassin: 0.8 }
  }
};

const VALID_HERO_NAMES = Object.keys(HEROES);

// Build path items with tier classifications
const BUILD_PATHS = {
  anti_heal: {
    name: "Anti-Heal Build",
    early: [
      { name: "Healbane", cost: 1600, desc: "-35% healing on spirit damage" }
    ],
    mid: [
      { name: "Toxic Bullets", cost: 3200, desc: "-25% healing on bullet hit" }
    ],
    late: [
      { name: "Inhibitor", cost: 6400, desc: "-35% healing on bullet/melee" }
    ]
  },
  anti_spirit: {
    name: "Spirit Resist Build",
    early: [
      { name: "Spirit Shielding", cost: 1600, desc: "+20 spirit resist" }
    ],
    mid: [
      { name: "Spirit Resilience", cost: 3200, desc: "+30 spirit resist" },
      { name: "Counterspell", cost: 3200, desc: "Block next ability" }
    ],
    late: [
      { name: "Divine Barrier", cost: 6400, desc: "+25 spirit resist + team shield" },
      { name: "Ethereal Shift", cost: 6400, desc: "Invulnerable dodge" }
    ]
  },
  anti_bullet: {
    name: "Bullet Resist Build",
    early: [
      { name: "Battle Vest", cost: 1600, desc: "+18 bullet resist" },
      { name: "Return Fire", cost: 1600, desc: "Reflect 60% bullet damage" }
    ],
    mid: [
      { name: "Metal Skin", cost: 3200, desc: "5s bullet immunity" },
      { name: "Bullet Resilience", cost: 3200, desc: "+30 bullet resist" }
    ],
    late: [
      { name: "Plated Armor", cost: 6400, desc: "+35 bullet +15 spirit resist" }
    ]
  },
  anti_cc: {
    name: "Anti-CC Build",
    early: [
      { name: "Debuff Reducer", cost: 1600, desc: "+30% debuff resist" }
    ],
    mid: [
      { name: "Debuff Remover", cost: 3200, desc: "Purge all CC + heal" }
    ],
    late: [
      { name: "Unstoppable", cost: 6400, desc: "8s CC immunity" }
    ]
  },
  anti_tank: {
    name: "Tank Buster Build",
    early: [],
    mid: [
      { name: "Decay", cost: 3200, desc: "% current HP DOT" },
      { name: "Hunter's Aura", cost: 3200, desc: "-12% bullet resist aura" },
      { name: "Tankbuster", cost: 3200, desc: "+25% bonus dmg above 50% HP" }
    ],
    late: [
      { name: "Armor Piercing Rounds", cost: 6400, desc: "Ignores 45% bullet resist" },
      { name: "Siphon Bullets", cost: 6400, desc: "Steal max HP on hit" }
    ]
  },
  interrupt: {
    name: "Interrupt Build",
    early: [],
    mid: [
      { name: "Knockdown", cost: 3200, desc: "Interrupt ability, 1s stun" },
      { name: "Silence Wave", cost: 3200, desc: "3.5s silence" }
    ],
    late: [
      { name: "Curse", cost: 6400, desc: "Interrupt + silence + disarm" },
      { name: "Phantom Strike", cost: 6400, desc: "Teleport + stun" }
    ]
  },
  survivability: {
    name: "Survivability Build",
    early: [
      { name: "Reactive Barrier", cost: 1600, desc: "Auto-shield on heavy damage" },
      { name: "Healing Booster", cost: 1600, desc: "+25% healing received" }
    ],
    mid: [
      { name: "Fortitude", cost: 3200, desc: "30% damage reduction below 40% HP" },
      { name: "Majestic Leap", cost: 3200, desc: "Jump escape" }
    ],
    late: [
      { name: "Cheat Death", cost: 6400, desc: "Survive lethal damage" },
      { name: "Divine Barrier", cost: 6400, desc: "Team shield active" }
    ]
  },
  mobility: {
    name: "Mobility/Kiting Build",
    early: [
      { name: "Fleetfoot", cost: 1600, desc: "+3 m/s and slow resist" },
      { name: "Slowing Bullets", cost: 1600, desc: "Bullets slow enemies" }
    ],
    mid: [
      { name: "Warp Stone", cost: 3200, desc: "Short blink" },
      { name: "Majestic Leap", cost: 3200, desc: "Jump ability" }
    ],
    late: [
      { name: "Phantom Strike", cost: 6400, desc: "Teleport to enemy + stun" }
    ]
  }
};

// Key item power spike costs for warnings
const POWER_SPIKES = {
  "Haze": [
    { item: "Ricochet", cost: 6400, timing: "~8-10 min", threat: "Team wipe potential" },
    { item: "Silencer", cost: 3200, timing: "~5-6 min", threat: "Silence on ult" }
  ],
  "Seven": [
    { item: "Unstoppable", cost: 6400, timing: "~8-10 min", threat: "Uninterruptible ult" },
    { item: "Refresher", cost: 6400, timing: "~12-15 min", threat: "Double ult" }
  ],
  "Abrams": [
    { item: "Leech", cost: 3200, timing: "~6-8 min", threat: "Massive sustain" },
    { item: "Unstoppable", cost: 6400, timing: "~10-12 min", threat: "Unstoppable charge" }
  ],
  "Shiv": [
    { item: "Silencer", cost: 3200, timing: "~5-6 min", threat: "Silence + execute" },
    { item: "Leech", cost: 3200, timing: "~6-8 min", threat: "Sustain in fights" }
  ],
  "Lady Geist": [
    { item: "Soul Exchange", cost: 6400, timing: "~10-12 min", threat: "HP swap execute" }
  ],
  "Vindicta": [
    { item: "Armor Piercing Rounds", cost: 6400, timing: "~10-12 min", threat: "Ignores armor" }
  ],
  "Infernus": [
    { item: "Torment Pulse", cost: 3200, timing: "~6-8 min", threat: "AOE burn stacking" }
  ]
};

// Team synergy patterns
const SYNERGY_PATTERNS = [
  {
    id: "spirit_heavy",
    check: (tags) => (tags['spirit_damage'] || 0) >= 3,
    alert: "🔮 3+ Spirit Heroes = RUSH Spirit Resilience!",
    priority: "high",
    counterBuild: "anti_spirit"
  },
  {
    id: "heal_heavy", 
    check: (tags) => (tags['healing'] || 0) + (tags['sustain'] || 0) >= 3,
    alert: "💚 Heavy Healing Team = Stack Anti-Heal!",
    priority: "high",
    counterBuild: "anti_heal"
  },
  {
    id: "cc_heavy",
    check: (tags) => (tags['cc'] || 0) >= 4 || (tags['stun'] || 0) >= 3,
    alert: "⛓️ CC Heavy Team = Prioritize Unstoppable!",
    priority: "high",
    counterBuild: "anti_cc"
  },
  {
    id: "bullet_heavy",
    check: (tags) => (tags['weapon_focused'] || 0) >= 3 || (tags['bullet_damage'] || 0) >= 3,
    alert: "🔫 Bullet Heavy = Metal Skin is CORE!",
    priority: "high",
    counterBuild: "anti_bullet"
  },
  {
    id: "tank_heavy",
    check: (tags) => (tags['tank'] || 0) >= 2,
    alert: "🛡️ Tanky Frontline = Build % HP damage!",
    priority: "medium",
    counterBuild: "anti_tank"
  },
  {
    id: "channel_ults",
    check: (tags) => (tags['ult_channeling'] || 0) >= 2,
    alert: "⏱️ Multiple Channel Ults = GET Knockdown!",
    priority: "high",
    counterBuild: "interrupt"
  },
  {
    id: "assassin_threat",
    check: (tags) => (tags['assassin'] || 0) >= 2 || ((tags['assassin'] || 0) >= 1 && (tags['invis'] || 0) >= 1),
    alert: "🗡️ Assassin Threat = Reactive Barrier + Reveal!",
    priority: "high",
    counterBuild: "survivability"
  },
  {
    id: "melee_heavy",
    check: (tags) => (tags['melee'] || 0) >= 3,
    alert: "⚔️ Melee Heavy = Slowing Bullets + Kite!",
    priority: "medium",
    counterBuild: "mobility"
  },
  {
    id: "dot_bleed",
    check: (tags) => (tags['dot'] || 0) >= 2 || (tags['bleed'] || 0) >= 1,
    alert: "🔥 DOT/Bleed Comp = Debuff Remover Essential!",
    priority: "medium",
    counterBuild: "anti_cc"
  }
];

// Comprehensive counter items based on actual game mechanics
const COUNTER_ITEMS = {
  // === ANTI-HEALING (Core counter to sustain/lifesteal) ===
  "healing": [
    { name: "Healbane", cost: 1600, category: "vitality", desc: "-35% healing on spirit damage for 8s. Heal 275 on kill.", priority: 1 },
    { name: "Toxic Bullets", cost: 3200, category: "weapon", desc: "-25% healing on bullet hit. Core vs Abrams/Infernus.", priority: 2 },
    { name: "Inhibitor", cost: 6400, category: "vitality", desc: "-35% healing on bullet/melee. Best late-game anti-heal.", priority: 3 }
  ],
  "sustain": [
    { name: "Healbane", cost: 1600, category: "vitality", desc: "-35% healing reduction. Rush vs Infernus.", priority: 1 },
    { name: "Toxic Bullets", cost: 3200, category: "weapon", desc: "-25% healing. Essential vs lifesteal builds.", priority: 2 }
  ],
  "lifesteal": [
    { name: "Healbane", cost: 1600, category: "vitality", desc: "Counters all spirit lifesteal.", priority: 1 },
    { name: "Toxic Bullets", cost: 3200, category: "weapon", desc: "Counters bullet lifesteal builds.", priority: 1 },
    { name: "Inhibitor", cost: 6400, category: "vitality", desc: "Best item vs Leech/lifesteal stackers.", priority: 2 }
  ],
  "regen": [
    { name: "Healbane", cost: 1600, category: "vitality", desc: "Reduces regen effectiveness.", priority: 1 },
    { name: "Decay", cost: 3200, category: "spirit", desc: "% current HP damage, strong vs high HP regen tanks.", priority: 2 }
  ],
  
  // === ANTI-TANK (Armor/HP shred) ===
  "tank": [
    { name: "Decay", cost: 3200, category: "spirit", desc: "% current HP DOT. Melts tanks.", priority: 1 },
    { name: "Hunter's Aura", cost: 3200, category: "weapon", desc: "-12% bullet resist aura. Team benefit.", priority: 1 },
    { name: "Armor Piercing Rounds", cost: 6400, category: "weapon", desc: "Ignores 45% bullet resist. Core vs Colossus.", priority: 2 },
    { name: "Tankbuster", cost: 3200, category: "spirit", desc: "+25% bonus damage to enemies above 50% HP.", priority: 2 },
    { name: "Siphon Bullets", cost: 6400, category: "vitality", desc: "Steal max HP on hit. Strong vs tanks.", priority: 3 }
  ],
  "high_hp": [
    { name: "Decay", cost: 3200, category: "spirit", desc: "Deals % current HP. Best vs high HP.", priority: 1 },
    { name: "Tankbuster", cost: 3200, category: "spirit", desc: "Bonus damage above 50% HP.", priority: 1 }
  ],
  
  // === ANTI-SPIRIT DAMAGE ===
  "spirit_damage": [
    { name: "Spirit Shielding", cost: 1600, category: "vitality", desc: "+20 spirit resist. Cheap early defense.", priority: 1 },
    { name: "Spirit Resilience", cost: 3200, category: "vitality", desc: "+30 spirit resist, +30% more below 30% HP.", priority: 2 },
    { name: "Counterspell", cost: 3200, category: "vitality", desc: "Block next ability. 15s CD. Core vs burst.", priority: 2 },
    { name: "Divine Barrier", cost: 6400, category: "vitality", desc: "+25 spirit resist + team shield active.", priority: 3 },
    { name: "Ethereal Shift", cost: 6400, category: "spirit", desc: "Invulnerable dodge. Counters burst combos.", priority: 3 }
  ],
  "burst_spirit": [
    { name: "Counterspell", cost: 3200, category: "vitality", desc: "Block ability damage. Essential vs Seven ult.", priority: 1 },
    { name: "Reactive Barrier", cost: 1600, category: "vitality", desc: "Shield on heavy damage. Good vs burst.", priority: 1 },
    { name: "Ethereal Shift", cost: 6400, category: "spirit", desc: "Dodge burst window completely.", priority: 2 },
    { name: "Fortitude", cost: 3200, category: "vitality", desc: "30% damage reduction below 40% HP.", priority: 2 }
  ],
  
  // === ANTI-WEAPON/BULLET DAMAGE ===
  "weapon_focused": [
    { name: "Metal Skin", cost: 3200, category: "vitality", desc: "Bullet immunity 5s. Counters Haze ult.", priority: 1 },
    { name: "Return Fire", cost: 1600, category: "vitality", desc: "Reflect 60% bullet damage for 7s.", priority: 1 },
    { name: "Bullet Resilience", cost: 3200, category: "vitality", desc: "+30 bullet resist, +30% more below 30% HP.", priority: 2 }
  ],
  "bullet_damage": [
    { name: "Battle Vest", cost: 1600, category: "vitality", desc: "+18 bullet resist. Cheap and effective.", priority: 1 },
    { name: "Metal Skin", cost: 3200, category: "vitality", desc: "5s bullet immunity. Core vs Haze/Vindicta.", priority: 1 },
    { name: "Plated Armor", cost: 6400, category: "vitality", desc: "+35 bullet +15 spirit resist. Best tank item.", priority: 3 }
  ],
  "dps": [
    { name: "Metal Skin", cost: 3200, category: "vitality", desc: "Completely negates DPS for 5s.", priority: 1 },
    { name: "Return Fire", cost: 1600, category: "vitality", desc: "Punish DPS with reflect.", priority: 1 }
  ],
  
  // === ANTI-CC (Stuns, slows, roots) ===
  "cc": [
    { name: "Debuff Reducer", cost: 1600, category: "vitality", desc: "+30% debuff resist. Reduces CC duration.", priority: 1 },
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Purge all CC + heal + speed. 50s CD.", priority: 1 },
    { name: "Unstoppable", cost: 6400, category: "vitality", desc: "8s CC immunity. Best vs CC-heavy.", priority: 2 }
  ],
  "stun": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Purge stun. Cannot use WHILE stunned.", priority: 1 },
    { name: "Unstoppable", cost: 6400, category: "vitality", desc: "Prevents all CC including stuns.", priority: 2 },
    { name: "Metal Skin", cost: 3200, category: "vitality", desc: "Immune to damage during stun recovery.", priority: 2 }
  ],
  "slow": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Purge slow + gain speed.", priority: 1 },
    { name: "Fleetfoot", cost: 1600, category: "weapon", desc: "+3 m/s and slow resist for 4s.", priority: 1 }
  ],
  "displacement": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Can cleanse knockups on impact timing.", priority: 1 },
    { name: "Unstoppable", cost: 6400, category: "vitality", desc: "Immune to displacement.", priority: 2 }
  ],
  
  // === ANTI-ASSASSIN/BURST ===
  "assassin": [
    { name: "Reactive Barrier", cost: 1600, category: "vitality", desc: "Auto-shield vs burst. Survives burst.", priority: 1 },
    { name: "Fortitude", cost: 3200, category: "vitality", desc: "30% damage reduction when low.", priority: 1 },
    { name: "Cheat Death", cost: 6400, category: "vitality", desc: "Survive lethal damage once per 210s.", priority: 2 },
    { name: "Metal Skin", cost: 3200, category: "vitality", desc: "5s to escape or turn fight.", priority: 2 }
  ],
  "invis": [
    { name: "Slowing Hex", cost: 1600, category: "spirit", desc: "Reveals invisible enemies.", priority: 1 }
  ],
  "invis_threat": [
    { name: "Slowing Hex", cost: 1600, category: "spirit", desc: "Reveals + slows. Essential vs Haze.", priority: 1 },
    { name: "Tesla Bullets", cost: 3200, category: "weapon", desc: "Chain lightning can hit invis nearby.", priority: 2 }
  ],
  
  // === ANTI-CHANNELING ULTS ===
  "ult_channeling": [
    { name: "Knockdown", cost: 3200, category: "spirit", desc: "Interrupt ability. 1s stun. Core vs Haze.", priority: 1 },
    { name: "Silence Wave", cost: 3200, category: "spirit", desc: "3.5s silence. Prevents ult cast.", priority: 1 },
    { name: "Curse", cost: 6400, category: "spirit", desc: "Interrupt + silence + disarm. Ultimate counter.", priority: 2 },
    { name: "Phantom Strike", cost: 6400, category: "vitality", desc: "Teleport + stun. Interrupt from range.", priority: 2 }
  ],
  "channeling_ult": [
    { name: "Knockdown", cost: 3200, category: "spirit", desc: "Instantly cancels Haze/Seven/Yamato ult.", priority: 1 },
    { name: "Curse", cost: 6400, category: "spirit", desc: "Stops everything. Best single-target shutdown.", priority: 2 },
    { name: "Metal Skin", cost: 3200, category: "vitality", desc: "Survive through Haze ult.", priority: 1 }
  ],
  
  // === ANTI-MOBILITY ===
  "mobile": [
    { name: "Slowing Bullets", cost: 1600, category: "weapon", desc: "Bullets slow. Catches mobile heroes.", priority: 1 },
    { name: "Crippling Headshot", cost: 6400, category: "weapon", desc: "Headshots slow + weaken.", priority: 2 },
    { name: "Vortex Web", cost: 6400, category: "spirit", desc: "Large slow field. Locks down area.", priority: 2 }
  ],
  "gap_closer": [
    { name: "Majestic Leap", cost: 3200, category: "vitality", desc: "Jump away from gap closers.", priority: 1 },
    { name: "Warp Stone", cost: 3200, category: "vitality", desc: "Short blink escape.", priority: 1 },
    { name: "Ethereal Shift", cost: 6400, category: "spirit", desc: "Invuln dodge their engage.", priority: 2 }
  ],
  "mobility": [
    { name: "Slowing Bullets", cost: 1600, category: "weapon", desc: "Slows mobile targets.", priority: 1 },
    { name: "Slowing Hex", cost: 1600, category: "spirit", desc: "Big slow to catch mobility.", priority: 1 }
  ],
  
  // === ANTI-MELEE ===
  "melee": [
    { name: "Slowing Bullets", cost: 1600, category: "weapon", desc: "Kite melee heroes.", priority: 1 },
    { name: "Majestic Leap", cost: 3200, category: "vitality", desc: "Jump over melee.", priority: 1 },
    { name: "Cold Front", cost: 1600, category: "spirit", desc: "AoE slow to disengage.", priority: 1 }
  ],
  "melee_threat": [
    { name: "Slowing Bullets", cost: 1600, category: "weapon", desc: "Essential kiting tool.", priority: 1 },
    { name: "Return Fire", cost: 1600, category: "vitality", desc: "Punish melee bullet builds.", priority: 1 },
    { name: "Majestic Leap", cost: 3200, category: "vitality", desc: "Escape melee range.", priority: 2 }
  ],
  
  // === ANTI-DOT/BLEED ===
  "dot": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Purge Infernus afterburn.", priority: 1 },
    { name: "Healing Booster", cost: 1600, category: "vitality", desc: "+25% healing to outheal DOT.", priority: 1 }
  ],
  "dot_damage": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Cleanse DOT effects.", priority: 1 }
  ],
  "bleed": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Purge Shiv bleed stacks.", priority: 1 }
  ],
  
  // === ANTI-EXECUTE ===
  "execute": [
    { name: "Cheat Death", cost: 6400, category: "vitality", desc: "Survive execute attempts.", priority: 1 },
    { name: "Fortitude", cost: 3200, category: "vitality", desc: "30% damage reduction when low HP.", priority: 1 },
    { name: "Healing Nova", cost: 3200, category: "vitality", desc: "Emergency team heal vs execute.", priority: 2 }
  ],
  
  // === UTILITY COUNTERS ===
  "sniper": [
    { name: "Warp Stone", cost: 3200, category: "vitality", desc: "Blink to cover.", priority: 1 },
    { name: "Majestic Leap", cost: 3200, category: "vitality", desc: "Dodge sniper shots.", priority: 1 }
  ],
  "long_range": [
    { name: "Phantom Strike", cost: 6400, category: "vitality", desc: "Gap close to snipers.", priority: 2 },
    { name: "Warp Stone", cost: 3200, category: "vitality", desc: "Close distance quickly.", priority: 1 }
  ],
  "zone_control": [
    { name: "Majestic Leap", cost: 3200, category: "vitality", desc: "Jump over zones.", priority: 1 },
    { name: "Warp Stone", cost: 3200, category: "vitality", desc: "Blink through zones.", priority: 1 }
  ],
  "turrets": [
    { name: "Decay", cost: 3200, category: "spirit", desc: "% damage to turrets.", priority: 1 }
  ],
  "binding": [
    { name: "Debuff Remover", cost: 3200, category: "vitality", desc: "Purge Warden binding.", priority: 1 },
    { name: "Unstoppable", cost: 6400, category: "vitality", desc: "Immune to binding.", priority: 2 }
  ],
  "suppress": [
    { name: "Ethereal Shift", cost: 6400, category: "spirit", desc: "Can't use during suppress, but good vs followup.", priority: 2 }
  ]
};

/**
 * Validate hero input array
 */
function validateHeroInput(input) {
  if (!Array.isArray(input)) {
    return { valid: false, heroes: [], error: 'Input must be an array' };
  }
  if (input.length > 6) {
    return { valid: false, heroes: [], error: 'Maximum 6 heroes allowed' };
  }
  const validHeroes = input.filter(h => 
    typeof h === 'string' && VALID_HERO_NAMES.includes(h)
  );
  return { valid: true, heroes: validHeroes };
}

/**
 * Get personalized recommendations based on your hero
 */
function getPersonalizedPriorities(myHero, enemyTags) {
  if (!myHero || !HEROES[myHero]) return {};
  
  const hero = HEROES[myHero];
  const priorities = hero.priorities || {};
  const bonuses = [];
  
  // Apply hero-specific bonuses
  if (priorities.spirit_resist && enemyTags['spirit_damage'] >= 2) {
    bonuses.push({ item: "Spirit Resilience", reason: `${myHero} needs spirit resist vs this comp` });
  }
  if (priorities.bullet_resist && enemyTags['bullet_damage'] >= 2) {
    bonuses.push({ item: "Metal Skin", reason: `${myHero} needs bullet protection` });
  }
  if (priorities.anti_kite && enemyTags['mobile'] >= 2) {
    bonuses.push({ item: "Slowing Bullets", reason: `${myHero} needs to catch mobile heroes` });
  }
  if (priorities.anti_cc && enemyTags['cc'] >= 3) {
    bonuses.push({ item: "Unstoppable", reason: `${myHero} can't afford CC lockdown` });
  }
  if (priorities.survivability && (enemyTags['assassin'] >= 1 || enemyTags['burst_spirit'] >= 2)) {
    bonuses.push({ item: "Reactive Barrier", reason: `${myHero} is burst vulnerable` });
  }
  
  return { priorities, bonuses, role: hero.role };
}

/**
 * Get power spike warnings for enemy team
 */
function getPowerSpikeWarnings(enemyHeroes) {
  const warnings = [];
  
  for (const heroName of enemyHeroes) {
    const spikes = POWER_SPIKES[heroName];
    if (spikes) {
      for (const spike of spikes) {
        warnings.push({
          hero: heroName,
          item: spike.item,
          cost: spike.cost,
          timing: spike.timing,
          threat: spike.threat,
          warning: `⚠️ ${heroName} ${spike.timing} from ${spike.item}`
        });
      }
    }
  }
  
  return warnings.sort((a, b) => a.cost - b.cost);
}

/**
 * Get team synergy alerts
 */
function getSynergyAlerts(tagCounts) {
  const alerts = [];
  
  for (const pattern of SYNERGY_PATTERNS) {
    if (pattern.check(tagCounts)) {
      alerts.push({
        id: pattern.id,
        alert: pattern.alert,
        priority: pattern.priority,
        counterBuild: pattern.counterBuild
      });
    }
  }
  
  return alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get recommended build paths
 */
function getRecommendedBuildPaths(analysis, alerts) {
  const paths = [];
  const addedPaths = new Set();
  
  // Add paths based on synergy alerts
  for (const alert of alerts) {
    if (alert.counterBuild && BUILD_PATHS[alert.counterBuild] && !addedPaths.has(alert.counterBuild)) {
      paths.push({
        ...BUILD_PATHS[alert.counterBuild],
        id: alert.counterBuild,
        reason: alert.alert
      });
      addedPaths.add(alert.counterBuild);
    }
  }
  
  // Add survivability if heavy burst
  if (analysis.assassinThreat && !addedPaths.has('survivability')) {
    paths.push({
      ...BUILD_PATHS.survivability,
      id: 'survivability',
      reason: 'Assassin threats detected'
    });
  }
  
  return paths.slice(0, 3); // Max 3 recommended paths
}

/**
 * Get counter item recommendations for enemy team
 */
function getRecommendations(selectedHeroes, myHero = null) {
  const validation = validateHeroInput(selectedHeroes);
  if (!validation.valid) {
    return { recommendations: [], analysis: {}, tagCounts: {}, error: validation.error };
  }
  
  const heroes = validation.heroes;
  if (heroes.length === 0) {
    return { recommendations: [], analysis: {}, tagCounts: {} };
  }
  
  const allTags = new Set();
  const tagCounts = {};
  const threatTypes = new Set();
  
  for (const heroName of heroes) {
    const hero = HEROES[heroName];
    if (!hero) continue;
    
    for (const tag of hero.tags) {
      allTags.add(tag);
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
    for (const threat of (hero.threats || [])) {
      threatTypes.add(threat);
    }
  }
  
  // Score items based on threats countered + priority
  const itemScores = {};
  
  for (const tag of allTags) {
    const counters = COUNTER_ITEMS[tag] || [];
    const weight = tagCounts[tag];
    
    for (const item of counters) {
      const key = item.name;
      if (!itemScores[key]) {
        itemScores[key] = { ...item, score: 0, counters: [], priorityBonus: 0 };
      }
      // Base score from tag count
      itemScores[key].score += weight;
      // Priority bonus (priority 1 items are most important)
      itemScores[key].priorityBonus += (4 - (item.priority || 2));
      if (!itemScores[key].counters.includes(tag)) {
        itemScores[key].counters.push(tag);
      }
    }
  }
  
  // Apply priority bonus to final score
  for (const item of Object.values(itemScores)) {
    item.score += item.priorityBonus * 0.5;
  }
  
  // Sort by score, then by cost (cheaper first for ties)
  const recommendations = Object.values(itemScores)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.cost - b.cost;
    })
    .slice(0, 15);
  
  // Team composition analysis
  const analysis = {
    weaponHeavy: (tagCounts['weapon_focused'] || 0) >= 2 || (tagCounts['bullet_damage'] || 0) >= 2,
    spiritHeavy: (tagCounts['spirit_damage'] || 0) >= 3 || (tagCounts['burst_spirit'] || 0) >= 2,
    healHeavy: (tagCounts['healing'] || 0) + (tagCounts['sustain'] || 0) + (tagCounts['lifesteal'] || 0) + (tagCounts['regen'] || 0) >= 3,
    ccHeavy: (tagCounts['cc'] || 0) >= 3 || (tagCounts['stun'] || 0) >= 2,
    tankHeavy: (tagCounts['tank'] || 0) >= 2,
    assassinThreat: allTags.has('assassin') || allTags.has('invis'),
    channelUlts: (tagCounts['ult_channeling'] || 0) >= 2,
    meleeThreat: (tagCounts['melee'] || 0) >= 2,
    mobilityHeavy: (tagCounts['mobile'] || 0) + (tagCounts['gap_closer'] || 0) >= 3,
    dotHeavy: (tagCounts['dot'] || 0) >= 2 || allTags.has('bleed'),
    executeThreat: allTags.has('execute')
  };
  
  // Generate priority recommendations text
  const priorityItems = [];
  if (analysis.healHeavy) priorityItems.push("🩹 RUSH Healbane/Toxic Bullets");
  if (analysis.channelUlts) priorityItems.push("🔇 GET Knockdown for ult interrupts");
  if (analysis.assassinThreat && allTags.has('invis')) priorityItems.push("👁️ BUY Slowing Hex to reveal invis");
  if (analysis.weaponHeavy) priorityItems.push("🛡️ NEED Metal Skin vs bullet DPS");
  if (analysis.ccHeavy) priorityItems.push("💨 RUSH Debuff Remover");
  
  // Get synergy alerts
  const synergyAlerts = getSynergyAlerts(tagCounts);
  
  // Get power spike warnings
  const powerSpikes = getPowerSpikeWarnings(heroes);
  
  // Get recommended build paths
  const buildPaths = getRecommendedBuildPaths(analysis, synergyAlerts);
  
  // Get personalized priorities if playing as a specific hero
  const personalized = myHero ? getPersonalizedPriorities(myHero, tagCounts) : null;
  
  return { 
    recommendations, 
    analysis, 
    tagCounts, 
    priorityItems,
    synergyAlerts,
    powerSpikes,
    buildPaths,
    personalized
  };
}

/**
 * Format build for clipboard
 */
function formatBuildForClipboard(recommendations, buildPaths, enemyHeroes) {
  let text = `🎮 DEADLOCK COUNTER BUILD\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📋 Enemy Team: ${enemyHeroes.join(', ')}\n\n`;
  
  if (buildPaths.length > 0) {
    text += `📊 RECOMMENDED BUILD PATHS:\n`;
    for (const path of buildPaths) {
      text += `\n▸ ${path.name}\n`;
      if (path.early.length > 0) {
        text += `  Early: ${path.early.map(i => i.name).join(', ')}\n`;
      }
      if (path.mid.length > 0) {
        text += `  Mid: ${path.mid.map(i => i.name).join(', ')}\n`;
      }
      if (path.late.length > 0) {
        text += `  Late: ${path.late.map(i => i.name).join(', ')}\n`;
      }
    }
    text += '\n';
  }
  
  text += `🛡️ TOP COUNTER ITEMS:\n`;
  const top5 = recommendations.slice(0, 5);
  for (const item of top5) {
    text += `• ${item.name} (${item.cost}💰) - ${item.desc}\n`;
  }
  
  text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated by Deadlock Counter v4.0`;
  
  return text;
}

module.exports = {
  HEROES,
  VALID_HERO_NAMES,
  COUNTER_ITEMS,
  BUILD_PATHS,
  POWER_SPIKES,
  SYNERGY_PATTERNS,
  validateHeroInput,
  getRecommendations,
  getPersonalizedPriorities,
  getPowerSpikeWarnings,
  getSynergyAlerts,
  getRecommendedBuildPaths,
  formatBuildForClipboard
};
