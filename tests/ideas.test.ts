import { describe, expect, it } from 'vitest';
import { categoryIds, getHabitIdeas } from '../src/renewal/ideas';
import type { Language } from '../src/renewal/copy';
describe('a broad, editable starting point', () => {
  it.each<Language>(['en', 'ko', 'ja', 'zh-TW'])(
    '%s has 18 complete ideas in six distinct areas',
    (language) => {
      const ideas = getHabitIdeas(language);
      expect(ideas).toHaveLength(18);
      expect(new Set(ideas.map((idea) => idea.id)).size).toBe(18);
      for (const category of categoryIds)
        expect(ideas.filter((idea) => idea.category === category)).toHaveLength(3);
      expect(
        ideas.every(
          (idea) =>
            idea.name.length > 0 &&
            idea.name.length <= 80 &&
            idea.cue.length > 0 &&
            idea.cue.length <= 120 &&
            idea.minimum.length > 0 &&
            idea.minimum.length <= 120,
        ),
      ).toBe(true);
    },
  );
});
