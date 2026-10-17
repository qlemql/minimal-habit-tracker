import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { usePreferences } from './preferences';
import { categoryIds, discoveryCopy, getHabitIdeas } from './ideas';
import type { Category, HabitIdea } from './ideas';
import { Title, Body, Button, TextButton, Eyebrow, Notice, Icon, s, palette } from './ui';
export const Discovery = ({
  onChoose,
  onOwn,
  hasDraft,
}: {
  onChoose: (idea: HabitIdea) => void;
  onOwn: () => void;
  hasDraft: boolean;
}) => {
  const language = usePreferences((state) => state.language);
  const d = discoveryCopy[language];
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [expanded, setExpanded] = useState(false);
  const ideas = getHabitIdeas(language).filter((idea, index) =>
    category === 'all' ? expanded || index % 3 === 0 : idea.category === category,
  );
  return (
    <View style={st.content}>
      <View style={s.gapSmall}>
        <Eyebrow>01 / 02</Eyebrow>
        <Title>{d.title}</Title>
        <Body>{d.sub}</Body>
      </View>
      <View style={s.gapSmall}>
        <Button onPress={onOwn} icon="pen">
          {d.own}
        </Button>
        <Text style={s.small}>{d.ownHint}</Text>
      </View>
      {hasDraft && <Notice>{d.replace}</Notice>}
      <View style={st.categories}>
        {(['all', ...categoryIds] as const).map((id) => (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ checked: category === id }}
            onPress={() => setCategory(id)}
            style={[st.category, category === id && st.selected]}
          >
            <Text style={[st.categoryText, category === id && st.selectedText]}>
              {id === 'all' ? d.all : d.categories[categoryIds.indexOf(id)]}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.gapSmall}>
        {ideas.map((idea) => (
          <Pressable
            key={idea.id}
            accessibilityRole="button"
            accessibilityLabel={idea.name}
            onPress={() => onChoose(idea)}
            style={({ pressed }) => [st.idea, pressed && s.pressed]}
          >
            <Text style={st.emoji}>{idea.icon}</Text>
            <View style={s.flex}>
              <Text style={s.fieldLabel}>{idea.name}</Text>
              <Text style={s.small}>{idea.minimum}</Text>
            </View>
            <Icon name="arrow" size={18} />
          </Pressable>
        ))}
      </View>
      {category === 'all' && (
        <TextButton onPress={() => setExpanded(!expanded)}>{expanded ? d.less : d.more}</TextButton>
      )}
    </View>
  );
};
const st = StyleSheet.create({
  content: { gap: 24, width: '100%', maxWidth: 580, alignSelf: 'center' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
  },
  selected: { backgroundColor: palette.green, borderColor: palette.green },
  categoryText: { fontSize: 12, color: palette.green },
  selectedText: { color: palette.white },
  idea: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    alignItems: 'center',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 15,
  },
  emoji: { fontSize: 23 },
});
