// Deadlock Counter-Item Recommendation Engine v2
const fs = require('fs');
const path = require('path');

class CounterEngine {
  constructor() {
    // Use path relative to THIS file's location
    const dataPath = path.join(__dirname, 'data', 'items.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    this.items = data.items;
    this.heroTags = data.hero_tags;
  }

  analyzeEnemyTeam(enemyBuilds) {
    const threats = {
      tags: new Set(),
      items: [],
      heroes: [],
      spiritItemCount: 0,
      weaponItemCount: 0,
      vitalityItemCount: 0,
      hasAntiHeal: false,
      hasCC: false,
      hasLifesteal: false,
      hasTank: false
    };

    for (const enemy of enemyBuilds) {
      if (enemy.hero && this.heroTags[enemy.hero]) {
        this.heroTags[enemy.hero].forEach(tag => threats.tags.add(tag));
        threats.heroes.push({ name: enemy.hero, tags: this.heroTags[enemy.hero] });
      }

      for (const itemName of (enemy.items || [])) {
        const item = this.items[itemName];
        if (!item) continue;
        (item.tags || []).forEach(tag => threats.tags.add(tag));
        threats.items.push({ name: itemName, owner: enemy.hero, tags: item.tags, category: item.category });

        if (item.category === 'spirit') threats.spiritItemCount++;
        else if (item.category === 'weapon') threats.weaponItemCount++;
        else if (item.category === 'vitality') threats.vitalityItemCount++;

        const tags = item.tags || [];
        if (tags.includes('anti_heal')) threats.hasAntiHeal = true;
        if (tags.some(t => ['cc','stun','slow','silence','root'].includes(t))) threats.hasCC = true;
        if (tags.includes('lifesteal') || tags.includes('sustain')) threats.hasLifesteal = true;
        if (tags.includes('tank') || tags.includes('health')) threats.hasTank = true;
      }
    }

    if (threats.spiritItemCount >= 2) { threats.tags.add('spirit_damage'); threats.tags.add('spirit_heavy'); }
    if (threats.spiritItemCount >= 4) { threats.tags.add('burst_spirit'); threats.tags.add('spirit_caster'); }
    if (threats.weaponItemCount >= 2) { threats.tags.add('bullet_damage'); threats.tags.add('weapon_heavy'); }
    if (threats.weaponItemCount >= 4) { threats.tags.add('dps'); threats.tags.add('weapon_focused'); }
    if (threats.hasCC) threats.tags.add('cc_heavy');

    return threats;
  }

  scoreCounterItems(threats) {
    const scores = {};
    for (const [itemName, item] of Object.entries(this.items)) {
      let score = 0;
      const reasons = [];

      for (const counterTag of (item.counters || [])) {
        if (threats.tags.has(counterTag)) { score += 10; reasons.push('Counters ' + counterTag); }
      }

      const tags = item.tags || [];
      if (tags.includes('spirit_defense') && threats.spiritItemCount >= 2) {
        score += 15; reasons.push('Spirit defense vs ' + threats.spiritItemCount + ' spirit items');
      }
      if (tags.includes('bullet_defense') && threats.weaponItemCount >= 2) {
        score += 15; reasons.push('Bullet defense vs ' + threats.weaponItemCount + ' weapon items');
      }
      if (tags.includes('anti_heal') && threats.hasLifesteal) {
        score += 15; reasons.push('Counters enemy lifesteal');
      }
      if ((tags.includes('anti_cc') || tags.includes('cc_immunity') || tags.includes('cleanse')) && threats.hasCC) {
        score += 15; reasons.push('Counters enemy CC');
      }
      if ((tags.includes('anti_tank') || tags.includes('percent_damage')) && threats.hasTank) {
        score += 15; reasons.push('Counters enemy tanks');
      }

      for (const enemyItem of threats.items) {
        if ((item.countered_by || []).includes(enemyItem.name)) { score -= 5; reasons.push('Countered by ' + enemyItem.name); }
        if ((item.counters || []).includes(enemyItem.name)) { score += 20; reasons.push('Directly counters ' + enemyItem.name); }
      }

      if (score > 0) {
        scores[itemName] = { score, reasons, cost: item.cost, category: item.category, tier: item.tier };
      }
    }
    return scores;
  }

  getRecommendations(enemyBuilds, limit = 12) {
    const threats = this.analyzeEnemyTeam(enemyBuilds);
    const scores = this.scoreCounterItems(threats);
    const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score).slice(0, limit);

    return {
      threats: {
        tags: Array.from(threats.tags),
        keyItems: threats.items.slice(0, 5),
        heroes: threats.heroes,
        analysis: { spiritItems: threats.spiritItemCount, weaponItems: threats.weaponItemCount, vitalityItems: threats.vitalityItemCount, hasCC: threats.hasCC, hasLifesteal: threats.hasLifesteal }
      },
      recommendations: sorted.map(([name, data]) => ({ name, ...data }))
    };
  }
}

module.exports = CounterEngine;
