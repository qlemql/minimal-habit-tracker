import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { useRouter } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { trackableHabits } from './access';
import { FreeHabitChoice } from './FreeHabitChoice';
import { HabitAction } from './HabitAction';
import { usePreferences, useCopy } from './preferences';
import { completedDays, weeklyCount, hasReviewDue } from './domain';
import { clearExample, loadExample } from './sample';
import { languages } from './copy';
import {
  Screen,
  s,
  palette,
  headingFont,
  Icon,
  Button,
  TextButton,
  Body,
  Title,
  Eyebrow,
  TrailArt,
  Week,
  useToday,
  Notice,
} from './ui';

export const Today = () => {
  const c = useCopy();
  const router = useRouter();
  const today = useToday();
  const width = useWindowDimensions().width;
  const wide = width >= 1050;
  const { habits, logs, legacyAccess, freeHabitId } = useHabitStore();
  const pro = useProStore((state) => state.isPro);
  const { language, welcomed, welcome, example, setLanguage } = usePreferences();
  const active = trackableHabits(habits, pro, legacyAccess, freeHabitId);
  const needsChoice = !pro && !legacyAccess && habits.some((habit) => !habit.isGraduated) && active.length === 0;
  const dates = new Set(
    logs.filter((log) => log.completed && log.date <= today).map((log) => log.date),
  );
  const due = active.find((habit) => hasReviewDue(habit, today));
  const start = () => {
    welcome();
    router.push('/add');
  };
  if (!welcomed && habits.length === 0)
    return (
      <Screen>
        <View style={st.welcome}>
          <View style={st.languageRow}>
            {languages.map((item) => (
              <Pressable
                key={item.code}
                accessibilityRole="button"
                onPress={() => setLanguage(item.code)}
                style={[st.language, language === item.code && st.languageActive]}
              >
                <Text style={st.languageText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={st.welcomeArt}>
            <TrailArt />
          </View>
          <Eyebrow>{c.welcomeKicker}</Eyebrow>
          <Title>{c.welcomeTitle}</Title>
          <Body>{c.welcomeSub}</Body>
          <View style={st.welcomeFeatures}>
            {[c.welcome1, c.welcome2, c.welcome3].map((text) => (
              <View key={text} style={s.row}>
                <Icon name="check" size={16} />
                <Text style={s.small}>{text}</Text>
              </View>
            ))}
          </View>
          <Button onPress={start} icon="arrow">
            {c.welcomeButton}
          </Button>
          <TextButton onPress={() => loadExample(c)}>{c.sample}</TextButton>
          <Text style={st.welcomeFooter}>{c.welcomeFooter}</Text>
        </View>
      </Screen>
    );
  return (
    <Screen>
      <View style={s.between}>
        <Eyebrow>
          {new Date(`${today}T12:00:00`)
            .toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })
            .toLocaleUpperCase(language)}
        </Eyebrow>
        {width >= 850 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={c.plusCta}
            onPress={() => router.push('/plus')}
            style={s.plusBadge}
          >
            <Icon name="spark" size={13} />
            <Text style={s.plusBadgeText}>SSAK PLUS</Text>
          </Pressable>
        )}
      </View>
      {example && (
        <View style={st.example}>
          <Text style={s.pillText}>{c.sampleLabel}</Text>
          <TextButton
            onPress={() => {
              clearExample();
              router.push('/add');
            }}
          >
            {c.sampleClear}
          </TextButton>
        </View>
      )}
      <View style={[st.hero, width < 850 && st.heroMobile]}>
        <View style={s.flex}>
          <Title>{c.hero}</Title>
          <View style={st.heroSub}>
            <Body>{c.heroSub}</Body>
          </View>
        </View>
        {wide && <TrailArt />}
      </View>
      <View style={[st.columns, wide && st.columnsWide]}>
        <View style={st.left}>
          <View style={st.sectionHeading}>
            <Eyebrow>{c.todayLabel}</Eyebrow>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={c.add}
              onPress={() => router.push('/add')}
              style={st.add}
            >
              <Icon name="plus" size={16} />
              <Text style={st.addText}>{c.add}</Text>
            </Pressable>
          </View>
          <FreeHabitChoice />
          {needsChoice ? null : active.length === 0 ? (
            <View style={s.card}>
              <Icon name="sun" size={35} />
              <Text style={s.cardTitle}>{c.empty}</Text>
              <Body>{c.emptySub}</Body>
              <Button onPress={start} icon="arrow">
                {c.start}
              </Button>
            </View>
          ) : (
            <View style={s.gap}>
              {active.map((habit) => {
                const completed = completedDays(habit.id, logs);
                const log = logs.find(
                  (item) => item.habitId === habit.id && item.date === today && item.completed,
                );
                const count = weeklyCount(habit.id, logs, today);
                return (
                  <View key={habit.id} style={[s.card, st.habitCard]}>
                    <View style={s.between}>
                      <View style={[s.row, s.flex]}>
                        <View style={s.iconBox}>
                          <Text style={st.habitEmoji}>{habit.icon}</Text>
                        </View>
                        <View style={s.flex}>
                          <Text style={s.cardTitle}>{habit.name}</Text>
                          <Text style={s.small}>{habit.cue ?? c.cueLabel}</Text>
                        </View>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${c.details}: ${habit.name}`}
                        onPress={() =>
                          router.push({ pathname: '/practice', params: { id: habit.id } })
                        }
                        style={st.detail}
                      >
                        <Icon name="arrow" size={19} />
                      </Pressable>
                    </View>
                    <View style={st.minimum}>
                      <Icon name="spark" size={18} />
                      <View style={s.flex}>
                        <Text style={st.minimumLabel}>{c.minimumLabel}</Text>
                        <Text style={st.minimumText}>{habit.minimum ?? habit.name}</Text>
                      </View>
                    </View>
                    <Week dates={completed} today={today} />
                    <View style={s.between}>
                      <Text style={s.small}>{c.intention}</Text>
                      <Text style={st.count}>
                        {count} / {habit.weeklyTarget ?? 7} {c.days}
                      </Text>
                    </View>
                    <View style={s.divider} />
                    <HabitAction habitId={habit.id} completed={Boolean(log)} tiny={log?.effort === 'tiny'} />
                  </View>
                );
              })}
            </View>
          )}
          <View style={st.quietNote}>
            <View style={st.noteLine} />
            <Text style={st.quietText}>{c.noRush}</Text>
            <View style={st.noteLine} />
          </View>
        </View>
        <View style={[st.right, wide && st.rightWide]}>
          <View style={s.panel}>
            <View style={s.between}>
              <Icon name="path" size={22} />
              <Text style={st.weekNumber}>
                {String(new Date(`${today}T12:00:00`).getFullYear())}
              </Text>
            </View>
            <Text style={st.panelTitle}>{c.week}</Text>
            <Body>{c.weekSub}</Body>
            <View style={st.weekMetric}>
              <Text style={st.bigNumber}>{dates.size}</Text>
              <Text style={st.metricLabel}>{c.total}</Text>
            </View>
            <View style={st.miniArt}>
              <TrailArt small />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={c.review}
            onPress={() =>
              due || active[0]
                ? router.push({ pathname: '/review', params: { id: (due ?? active[0]).id } })
                : router.push('/add')
            }
            style={({ pressed }) => [st.reviewCard, pressed && s.pressed]}
          >
            <View style={s.between}>
              <Icon name="pen" size={22} />
              {due && <View style={st.reviewDot} />}
            </View>
            <Text style={s.cardTitle}>{c.reviewTitle}</Text>
            <Body>{c.reviewSub}</Body>
            <View style={s.row}>
              <Text style={st.reviewLink}>{c.review}</Text>
              <Icon name="arrow" size={16} />
            </View>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};
const st = StyleSheet.create({
  welcome: { maxWidth: 510, width: '100%', alignSelf: 'center', gap: 15, paddingTop: 5 },
  welcomeArt: { alignSelf: 'center', marginVertical: 5 },
  welcomeFeatures: { gap: 15, marginVertical: 10 },
  welcomeFooter: { fontSize: 11, color: palette.soft, textAlign: 'center', marginTop: 5 },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  language: { padding: 10, minHeight: 40, borderRadius: 10 },
  languageActive: { backgroundColor: palette.pale },
  languageText: { fontSize: 12, color: palette.green },
  hero: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 35, gap: 24 },
  heroMobile: { marginTop: 4, marginBottom: 16 },
  heroSub: { maxWidth: 340, marginTop: 10 },
  columns: { gap: 24 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  left: { flex: 1, minWidth: 0 },
  right: { gap: 20 },
  rightWide: { width: 290 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 10,
    marginTop: -14,
    minHeight: 44,
  },
  addText: { color: palette.green, fontSize: 12, fontWeight: '500' },
  habitCard: { gap: 16 },
  habitEmoji: { fontSize: 25 },
  detail: { width: 44, height: 44, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  minimum: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: palette.paper,
    borderRadius: 12,
    padding: 15,
  },
  minimumLabel: { fontSize: 12, color: palette.muted, marginBottom: 5 },
  minimumText: { fontSize: 16, lineHeight: 24, color: palette.ink },
  count: { fontSize: 12, fontWeight: '600', color: palette.green },
  quietNote: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  noteLine: { height: 1, backgroundColor: palette.line, flex: 1 },
  quietText: { fontSize: 11, color: palette.soft, flexShrink: 1, textAlign: 'center', lineHeight: 17 },
  panelTitle: {
    fontFamily: headingFont,
    fontSize: 28,
    lineHeight: 34,
    color: palette.ink,
    letterSpacing: -0.6,
  },
  weekNumber: { fontSize: 10, letterSpacing: 2, color: palette.muted },
  weekMetric: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  bigNumber: { fontFamily: headingFont, fontSize: 47, color: palette.green },
  metricLabel: { color: palette.muted, fontSize: 12, maxWidth: 125, lineHeight: 18 },
  miniArt: { alignSelf: 'flex-end', marginTop: -24, marginBottom: -10 },
  reviewCard: { padding: 24, gap: 14, backgroundColor: palette.peach, borderRadius: 20 },
  reviewDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: palette.orange },
  reviewLink: { color: palette.green, fontSize: 13, fontWeight: '600' },
  example: {
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: palette.peach,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
  },
});
