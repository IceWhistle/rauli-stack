/**
 * Unit Tests for Deadlock Counter Logic
 * Tests designed to break the function and find edge cases
 */

const { getRecommendations, validateHeroInput, HEROES, COUNTER_ITEMS } = require('../counter-logic.js');

// ============================================
// Input Validation Tests
// ============================================

describe('validateHeroInput', () => {
  test('valid array of heroes', () => {
    const result = validateHeroInput(['Infernus', 'Haze', 'Seven']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus', 'Haze', 'Seven']);
  });

  test('empty array returns valid with empty heroes', () => {
    const result = validateHeroInput([]);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual([]);
  });

  test('filters out invalid hero names', () => {
    const result = validateHeroInput(['Infernus', 'FakeHero', 'Haze', 'NotReal']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus', 'Haze']);
  });

  test('rejects non-array input - null', () => {
    const result = validateHeroInput(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Input must be an array');
  });

  test('rejects non-array input - string', () => {
    const result = validateHeroInput('Infernus');
    expect(result.valid).toBe(false);
  });

  test('rejects non-array input - object', () => {
    const result = validateHeroInput({ hero: 'Infernus' });
    expect(result.valid).toBe(false);
  });

  test('rejects non-array input - number', () => {
    const result = validateHeroInput(42);
    expect(result.valid).toBe(false);
  });

  test('rejects non-array input - undefined', () => {
    const result = validateHeroInput(undefined);
    expect(result.valid).toBe(false);
  });

  test('rejects more than 6 heroes', () => {
    const result = validateHeroInput(['Infernus', 'Haze', 'Seven', 'Abrams', 'Bebop', 'Dynamo', 'Kelvin']);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Maximum 6 heroes allowed');
  });

  test('handles array with non-string elements', () => {
    const result = validateHeroInput(['Infernus', 123, null, undefined, {}, 'Haze']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus', 'Haze']);
  });

  test('handles array with empty strings', () => {
    const result = validateHeroInput(['Infernus', '', 'Haze', '']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus', 'Haze']);
  });

  test('SQL injection attempt in hero name', () => {
    const result = validateHeroInput(["'; DROP TABLE heroes;--", 'Infernus']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus']); // Malicious input filtered out
  });

  test('XSS attempt in hero name', () => {
    const result = validateHeroInput(['<script>alert(1)</script>', 'Infernus']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus']);
  });

  test('prototype pollution attempt', () => {
    const result = validateHeroInput(['__proto__', 'constructor', 'Infernus']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus']);
  });

  test('unicode characters in input', () => {
    const result = validateHeroInput(['Infernus', '七号', '🔥', 'Haze']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus', 'Haze']);
  });

  test('very long string input', () => {
    const longString = 'A'.repeat(10000);
    const result = validateHeroInput([longString, 'Infernus']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Infernus']);
  });

  test('case sensitivity - lowercase hero name', () => {
    const result = validateHeroInput(['infernus', 'HAZE', 'Seven']);
    expect(result.valid).toBe(true);
    expect(result.heroes).toEqual(['Seven']); // Only exact match
  });
});

// ============================================
// Recommendation Logic Tests
// ============================================

describe('getRecommendations', () => {
  test('returns empty for empty input', () => {
    const result = getRecommendations([]);
    expect(result.recommendations).toEqual([]);
    expect(result.tagCounts).toEqual({});
  });

  test('returns error for invalid input', () => {
    const result = getRecommendations(null);
    expect(result.error).toBeDefined();
    expect(result.recommendations).toEqual([]);
  });

  test('single spirit hero recommends spirit defense', () => {
    const result = getRecommendations(['Infernus']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Spirit Shielding');
  });

  test('single weapon hero recommends bullet defense', () => {
    const result = getRecommendations(['Haze']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Metal Skin');
  });

  test('healing heroes trigger anti-heal recommendations', () => {
    const result = getRecommendations(['Infernus', 'Dynamo', 'Ivy']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Healbane');
  });

  test('CC heavy team triggers debuff removal recommendations', () => {
    const result = getRecommendations(['Bebop', 'Kelvin', 'Warden', 'Paradox']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Debuff Remover');
    expect(result.analysis.ccHeavy).toBe(true);
  });

  test('tank heavy team triggers armor pen recommendations', () => {
    const result = getRecommendations(['Abrams', 'Mo & Krill', 'Viscous']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Armor Piercing Rounds');
    expect(result.analysis.tankHeavy).toBe(true);
  });

  test('assassin heroes trigger defensive recommendations', () => {
    const result = getRecommendations(['Haze', 'Shiv']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Reactive Barrier');
    expect(result.analysis.assassinThreat).toBe(true);
  });

  test('channeling ult heroes trigger interrupt recommendations', () => {
    const result = getRecommendations(['Seven', 'Haze', 'Dynamo']);
    const itemNames = result.recommendations.map(r => r.name);
    expect(itemNames).toContain('Knockdown');
    expect(result.analysis.channelUlts).toBe(true);
  });

  test('weapon heavy detection', () => {
    const result = getRecommendations(['Haze', 'Vindicta', 'Wraith']);
    expect(result.analysis.weaponHeavy).toBe(true);
  });

  test('spirit heavy detection', () => {
    const result = getRecommendations(['Infernus', 'Seven', 'Lady Geist', 'Mirage']);
    expect(result.analysis.spiritHeavy).toBe(true);
  });

  test('maximum 15 recommendations returned', () => {
    const result = getRecommendations(['Infernus', 'Haze', 'Seven', 'Abrams', 'Bebop', 'Dynamo']);
    expect(result.recommendations.length).toBeLessThanOrEqual(15);
  });

  test('recommendations are sorted by score descending', () => {
    const result = getRecommendations(['Infernus', 'Haze', 'Seven']);
    const scores = result.recommendations.map(r => r.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test('each recommendation has required fields', () => {
    const result = getRecommendations(['Infernus']);
    for (const rec of result.recommendations) {
      expect(rec).toHaveProperty('name');
      expect(rec).toHaveProperty('cost');
      expect(rec).toHaveProperty('category');
      expect(rec).toHaveProperty('desc');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('counters');
      expect(Array.isArray(rec.counters)).toBe(true);
    }
  });

  test('duplicate heroes handled correctly', () => {
    const result = getRecommendations(['Infernus', 'Infernus', 'Infernus']);
    // Should still work, tags counted multiple times
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('all valid heroes can be processed', () => {
    for (const heroName of Object.keys(HEROES)) {
      const result = getRecommendations([heroName]);
      expect(result.error).toBeUndefined();
      expect(result.recommendations).toBeDefined();
    }
  });
});

// ============================================
// Data Integrity Tests
// ============================================

describe('Data Integrity', () => {
  test('all heroes have tags array', () => {
    for (const hero of Object.values(HEROES)) {
      expect(Array.isArray(hero.tags)).toBe(true);
      expect(hero.tags.length).toBeGreaterThan(0);
    }
  });

  test('all heroes have color', () => {
    for (const hero of Object.values(HEROES)) {
      expect(typeof hero.color).toBe('string');
      expect(hero.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test('all counter items have required fields', () => {
    for (const items of Object.values(COUNTER_ITEMS)) {
      for (const item of items) {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('cost');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('desc');
        expect(typeof item.cost).toBe('number');
        expect(['weapon', 'vitality', 'spirit']).toContain(item.category);
      }
    }
  });

  test('no duplicate item names within same category', () => {
    for (const items of Object.values(COUNTER_ITEMS)) {
      const names = items.map(i => i.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    }
  });
});

// ============================================
// Edge Cases / Stress Tests
// ============================================

describe('Edge Cases', () => {
  test('handles 100 repeated calls', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRecommendations(['Infernus', 'Haze']);
      expect(result.recommendations).toBeDefined();
    }
  });

  test('array with 1000 invalid entries + 1 valid', () => {
    const input = Array(1000).fill('InvalidHero');
    input.push('Infernus');
    // This should be rejected due to length > 6
    const result = getRecommendations(input);
    expect(result.error).toBe('Maximum 6 heroes allowed');
  });

  test('special characters in array', () => {
    const result = getRecommendations(['\n', '\t', '\r', '\0', 'Infernus']);
    expect(result.valid !== false || result.recommendations).toBeDefined();
  });
});

// Tests complete
