// Deadlock Counter-Item Recommendation Engine v2
// Fixed: Now properly infers damage types from enemy builds

const fs = require('fs');
const path = require('path');

class CounterEngine {
  constructor() {
    const dataPath = path.join(__dirname, '../data/items.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    this.items = data.items;
    this.heroTags = data.hero_tags;
  }

  // Analyze enemy team and infer their damage/threat profile
  analyzeEnemyTeam(enemyBuilds) {
    const threats = {
      tags: new Set(),
      items: [],
      heroes: [],
      // Track build directions
      spiritItemCount: 0,
      weaponItemCount: 0,
      vitalityItemCount: 0,
      hasAntiHeal: false,
      hasCC: false,
      hasLifesteal: false,
      hasTank: false
    };

    for (const enemy of enemyBuilds) {
      // Add hero-specific tags
      if (enemy.hero && this.heroTags[enemy.hero]) {
        this.heroTags[enemy.hero].forEach(tag => threats.tags.add(tag));
        threats.heroes.push({
          name: enemy.hero,
          tags: this.heroTags[enemy.hero]
        });
      }

      // Analyze each item the enemy has
      for (const itemName of (enemy.items || [])) {
        const item = this.items[itemName];
        if (!item) continue;

        // Add item's tags to threats
        (item.tags || []).forEach(tag => threats.tags.add(tag));
        
        threats.items.push({
          name: itemName,
          owner: enemy.hero,
          tags: item.tags,
          category: item.category
        });

        // Count by category - THIS IS KEY
        if (item.category === 'spirit') {
          threats.spiritItemCount++;
        } else if (item.category === 'weapon') {
          threats.weaponItemCount++;
        } else if (item.category === 'vitality') {
          threats.vitalityItemCount++;
        }

        // Detect specific threat patterns
        const tags = item.tags || [];
        if (tags.includes('anti_heal')) threats.hasAntiHeal = true;
        if (tags.includes('cc') || tags.includes('stun') || tags.includes('slow') || tags.includes('silence') || tags.includes('root')) {
          threats.hasCC = true;
        }
        if (tags.includes('lifesteal') || tags.includes('sustain')) threats.hasLifesteal = true;
        if (tags.includes('tank') || tags.includes('health')) threats.hasTank = true;
      }
    }

    // INFER DAMAGE TYPES based on item categories
    // This is the key fix - if enemy buys spirit items, they deal spirit damage!
    if (threats.spiritItemCount >= 2) {
      threats.tags.add('spirit_damage');
      threats.tags.add('spirit_heavy');
    }
    if (threats.spiritItemCount >= 4) {
      threats.tags.add('burst_spirit');
      threats.tags.add('spirit_caster');
    }
    
    if (threats.weaponItemCount >= 2) {
      threats.tags.add('bullet_damage');
      threats.tags.add('weapon_heavy');
    }
    if (threats.weaponItemCount >= 4) {
      threats.tags.add('dps');
      threats.tags.add('weapon_focused');
    }

    if (threats.hasCC) {
      threats.tags.add('cc_heavy');
    }

    return threats;
  }

  // Score items based on how well they counter the enemy team
  scoreCounterItems(threats, yourHero = null) {
    const scores = {};

    for (const [itemName, item] of Object.entries(this.items)) {
      let score = 0;
      const reasons = [];

      // Check if this item counters any enemy tags
      for (const counterTag of (item.counters || [])) {
        if (threats.tags.has(counterTag)) {
          score += 10;
          reasons.push(`Counters ${counterTag}`);
        }
      }

      // BONUS: Defense items get extra points based on enemy build direction
      const tags = item.tags || [];
      
      // Spirit defense vs spirit-heavy enemies
      if (tags.includes('spirit_defense') && threats.spiritItemCount >= 2) {
        score += 15;
        reasons.push(`Spirit defense vs ${threats.spiritItemCount} spirit items`);
      }
      
      // Bullet defense vs weapon-heavy enemies  
      if (tags.includes('bullet_defense') && threats.weaponItemCount >= 2) {
        score += 15;
        reasons.push(`Bullet defense vs ${threats.weaponItemCount} weapon items`);
      }

      // Anti-heal vs lifesteal/sustain
      if (tags.includes('anti_heal') && threats.hasLifesteal) {
        score += 15;
        reasons.push('Counters enemy lifesteal');
      }

      // CC immunity vs CC-heavy
      if ((tags.includes('anti_cc') || tags.includes('cc_immunity') || tags.includes('cleanse')) && threats.hasCC) {
        score += 15;
        reasons.push('Counters enemy CC');
      }

      // Anti-tank vs tanky enemies
      if ((tags.includes('anti_tank') || tags.includes('percent_damage')) && threats.hasTank) {
        score += 15;
        reasons.push('Counters enemy tanks');
      }

      // Check if this item is countered by enemy items (negative score)
      for (const enemyItem of threats.items) {
        if ((item.countered_by || []).includes(enemyItem.name)) {
          score -= 5;
          reasons.push(`Countered by ${enemyItem.name}`);
        }
      }

      // Specific item-to-item counters
      for (const enemyItem of threats.items) {
        if ((item.counters || []).includes(enemyItem.name)) {
          score += 20;
          reasons.push(`Directly counters ${enemyItem.name}`);
        }
      }

      if (score > 0) {
        scores[itemName] = {
          score,
          reasons,
          cost: item.cost,
          category: item.category,
          tier: item.tier
        };
      }
    }

    return scores;
  }

  // Get top recommendations
  getRecommendations(enemyBuilds, yourHero = null, limit = 12) {
    const threats = this.analyzeEnemyTeam(enemyBuilds);
    const scores = this.scoreCounterItems(threats, yourHero);

    // Sort by score descending
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit);

    return {
      threats: {
        tags: Array.from(threats.tags),
        keyItems: threats.items.slice(0, 5),
        heroes: threats.heroes,
        analysis: {
          spiritItems: threats.spiritItemCount,
          weaponItems: threats.weaponItemCount,
          vitalityItems: threats.vitalityItemCount,
          hasCC: threats.hasCC,
          hasLifesteal: threats.hasLifesteal
        }
      },
      recommendations: sorted.map(([name, data]) => ({
        name,
        ...data
      }))
    };
  }

  // Quick counter lookup for a specific item
  counterItem(itemName) {
    const counters = [];
    for (const [name, item] of Object.entries(this.items)) {
      if ((item.counters || []).some(c => 
        itemName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(itemName.toLowerCase())
      )) {
        counters.push({ name, cost: item.cost, category: item.category });
      }
    }
    return counters;
  }
}

module.exports = CounterEngine;

// CLI test
if (require.main === module) {
  const engine = new CounterEngine();
  
  // Test: Abrams building spirit items
  console.log('\\n=== TEST: Abrams with Spirit Build ===');
  const spiritAbrams = [
    { hero: 'Abrams', items: ['Greater Expansion', 'Spirit Snatch', 'Decay', 'Knockdown'] }
  ];
  
  const results = engine.getRecommendations(spiritAbrams);
  console.log('Threats:', results.threats.tags);
  console.log('Spirit items detected:', results.threats.analysis.spiritItems);
  console.log('\\nTop Recommendations:');
  results.recommendations.slice(0, 5).forEach(r => {
    console.log(`  ${r.name} (+${r.score}): ${r.reasons.join(', ')}`);
  });
}
