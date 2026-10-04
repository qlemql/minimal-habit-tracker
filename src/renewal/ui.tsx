import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Platform, useWindowDimensions, TextInput, AppState } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Ellipse, G } from 'react-native-svg';
import brand from '../../assets/brand/design.json';
import { useCopy, usePreferences } from './preferences';
import { localDate, weekDays } from './domain';
import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

export const palette = {
  paper: '#F7F7F2',
  white: '#FFFFFF',
  ink: '#233C35',
  muted: '#56695F',
  soft: '#5F6D64',
  line: '#E2E7DF',
  green: '#315E4C',
  pale: '#EDF2E8',
  mint: '#DDE9D6',
  orange: '#C37952',
  peach: '#F4E8DA',
  yellow: '#E8C884',
  danger: '#A44D40',
  transparent: 'transparent',
};
export const headingFont = Platform.select({
  web: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  ios: 'System',
  default: 'sans-serif',
});
type IconName =
  | 'sun'
  | 'path'
  | 'settings'
  | 'plus'
  | 'arrow'
  | 'back'
  | 'check'
  | 'book'
  | 'walk'
  | 'pen'
  | 'spark'
  | 'shield'
  | 'clock'
  | 'close'
  | 'download';
const paths: Record<IconName, string> = {
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5',
  path: 'M5 20V7a3 3 0 0 1 6 0v10a3 3 0 0 0 6 0V4m-3 3 3-3 3 3',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  back: 'M19 12H5m5-5-5 5 5 5',
  check: 'm5 12 4 4L19 6',
  book: 'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1V6',
  walk: 'm8 21 3-6-3-4 2-5 5 5 4 1M5 11l3-5h5m-1 9 4 6',
  pen: 'm4 20 4-1L20 7l-4-4L4 15v5m10-15 4 4',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
  shield: 'm12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Zm-4 9 3 3 5-6',
  clock: 'M12 7v5l3 2',
  close: 'm6 6 12 12M6 18 18 6',
  download: 'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',
};
export const Icon = ({
  name,
  size = 22,
  color = palette.green,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d={paths[name]}
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {name === 'sun' && <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.7} />}
    {name === 'clock' && <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />}
    {name === 'walk' && <Circle cx={13} cy={3} r={1.5} fill={color} />}
  </Svg>
);
export const TrailArt = ({ small = false }: { small?: boolean }) => (
  <Svg
    width={small ? 160 : 240}
    height={small ? 135 : 205}
    viewBox="0 0 240 205"
    accessible={false}
    importantForAccessibility="no-hide-descendants"
  >
    <Circle cx={174} cy={43} r={26} fill={palette.yellow} />
    <Path
      d="M23 179 C28 141 80 160 79 114 C78 68 124 115 142 94 C160 73 195 80 208 20"
      stroke={palette.mint}
      strokeWidth={43}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M23 179 C28 141 80 160 79 114 C78 68 124 115 142 94 C160 73 195 80 208 20"
      stroke={palette.green}
      strokeWidth={1.5}
      strokeDasharray="3 7"
      fill="none"
    />
    <Ellipse cx={57} cy={151} rx={14} ry={10} fill={palette.green} rotation={-26} origin="57,151" />
    <Ellipse cx={114} cy={99} rx={13} ry={9} fill={palette.orange} rotation={14} origin="114,99" />
    <Circle cx={166} cy={79} r={7} fill={palette.white} />
    <Path d="m162 79 3 3 5-6" stroke={palette.green} strokeWidth={1.4} fill="none" />
    <Path d="M22 61h14m-7-7v14M191 160h12m-6-6v12" stroke={palette.orange} strokeWidth={1.3} />
    <Circle cx={50} cy={36} r={3} fill={palette.mint} />
  </Svg>
);
export const Brand = () => (
  <View style={s.brandRow} accessible accessibilityLabel="ssak">
    <Svg width={35} height={35} viewBox="0 0 512 512" accessible={false}>
      <Rect width={512} height={512} rx={145} fill={brand.brown} />
      <Path d={brand.contour} fill={brand.cream} />
      <Path d={brand.tip} fill={brand.coral} />
    </Svg>
    <Svg width={94} height={35} viewBox="-4 -15 180 67" accessible={false}>
      <G fill="none" stroke={brand.brown} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d={brand.wordS} />
        <Path d={brand.wordS} transform="translate(44 0)" />
        <Path d="M120 24 C120 1 84 1 84 24 C84 48 120 48 120 24 M120 7 V42 M138 -9 V42 M165 8 L140 26 L168 42" />
      </G>
    </Svg>
  </View>
);
export const Button = ({
  children,
  onPress,
  secondary = false,
  disabled = false,
  icon,
  testID,
}: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: IconName;
  testID?: string;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    testID={testID}
    onPress={onPress}
    style={({ pressed }) => [
      s.button,
      secondary && s.buttonSecondary,
      disabled && s.disabled,
      pressed && s.pressed,
    ]}
  >
    <Text style={[s.buttonText, secondary && s.buttonSecondaryText]}>{children}</Text>
    {icon && <Icon name={icon} size={18} color={secondary ? palette.green : palette.white} />}
  </Pressable>
);
export const TextButton = ({
  children,
  onPress,
  danger = false,
}: {
  children: ReactNode;
  onPress: () => void;
  danger?: boolean;
}) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.textButton, pressed && s.pressed]}>
    <Text style={[s.textButtonText, danger && s.danger]}>{children}</Text>
  </Pressable>
);
export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <Text style={s.eyebrow}>{children}</Text>
);
export const Title = ({ children }: { children: ReactNode }) => {
  const { width } = useWindowDimensions();
  return (
    <Text accessibilityRole="header" textBreakStrategy="balanced" style={[s.title, width < 375 && s.titleCompact]}>
      {children}
    </Text>
  );
};
export const Body = ({ children }: { children: ReactNode }) => (
  <Text style={s.body}>{children}</Text>
);
export const Field = ({ label, ...props }: TextInputProps & { label: string }) => (
  <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput
      {...props}
      accessibilityLabel={label}
      placeholderTextColor={palette.soft}
      style={[s.input, props.multiline && s.textarea]}
    />
  </View>
);
export const Notice = ({ children, error = false }: { children: ReactNode; error?: boolean }) => (
  <View accessibilityLiveRegion="polite" style={[s.notice, error && s.noticeError]}>
    <Text style={[s.noticeText, error && s.danger]}>{children}</Text>
  </View>
);
export const useToday = () => {
  const [today, setToday] = useState(localDate());
  useEffect(() => {
    const update = () => setToday(localDate());
    const timer = setInterval(update, 30000);
    const sub = AppState.addEventListener('change', update);
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return today;
};
export const Week = ({
  dates,
  today,
  large = false,
}: {
  dates: Set<string>;
  today: string;
  large?: boolean;
}) => {
  const language = usePreferences((state) => state.language);
  const c = useCopy();
  return (
    <View style={s.week}>
      {weekDays(today).map((date) => (
        <View key={date} style={s.day}>
          <Text style={s.dayLabel}>
            {new Date(`${date}T12:00:00`).toLocaleDateString(language, { weekday: 'narrow' })}
          </Text>
          <View
            accessibilityLabel={`${date}: ${dates.has(date) ? c.recorded : c.notRecorded}`}
            style={[
              s.dayCircle,
              large && s.dayCircleLarge,
              date === today && s.dayToday,
              dates.has(date) && s.dayDone,
              date > today && s.dayFuture,
            ]}
          >
            {dates.has(date) ? (
              <Icon name="check" size={16} color={palette.white} />
            ) : (
              <Text style={[s.dayNumber, date === today && s.dayNumberToday]}>
                {Number(date.slice(-2))}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};
export const Screen = ({ children, detail = false }: { children: ReactNode; detail?: boolean }) => {
  const c = useCopy();
  const path = usePathname();
  const router = useRouter();
  const wide = useWindowDimensions().width >= 850;
  const showPlus = path !== '/add' && path !== '/edit' && path !== '/plus';
  const tabs: { label: string; path: '/' | '/stats' | '/settings'; icon: IconName }[] = [
    { label: c.today, path: '/', icon: 'sun' },
    { label: c.journey, path: '/stats', icon: 'path' },
    { label: c.settings, path: '/settings', icon: 'settings' },
  ];
  const nav = (
    <View style={wide ? s.navVertical : s.navHorizontal}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: path === tab.path }}
          accessibilityLabel={tab.label}
          key={tab.path}
          onPress={() => router.replace(tab.path)}
          style={({ pressed }) => [s.navItem, !wide && s.navItemMobile, path === tab.path && s.navActive, pressed && s.pressed]}
        >
          <Icon name={tab.icon} color={path === tab.path ? palette.green : palette.soft} />
          <Text style={[s.navText, path === tab.path && s.navTextActive]}>{tab.label}</Text>
          {wide && path === tab.path && <View style={s.activeDot} />}
        </Pressable>
      ))}
    </View>
  );
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[s.appFrame, wide && s.appFrameWide]}>
        {wide && (
          <View style={s.sidebar}>
            <Brand />
            <Text style={s.tagline}>{c.tagline}</Text>
            {nav}
            <View style={s.sidebarBottom}>
              <View style={s.sidebarNote}>
                <Icon name="spark" size={19} />
                <Text style={s.sidebarNoteText}>{c.noRush}</Text>
              </View>
              <Text style={s.version}>SSAK / A LITTLE EVERY DAY</Text>
            </View>
          </View>
        )}
        <View style={s.main}>
          {!wide && (
            <View style={s.mobileHeader}>
              <Brand />
              {showPlus && <Pressable
                accessibilityRole="button"
                accessibilityLabel={c.plusCta}
                onPress={() => router.push('/plus')}
                style={s.plusBadge}
              >
                <Icon name="spark" size={14} />
                <Text style={s.plusBadgeText}>PLUS</Text>
              </Pressable>}
            </View>
          )}
          <ScrollView
            contentContainerStyle={[s.scroll, wide && s.scrollWide]}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
          >
            {detail && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={c.back}
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                style={s.back}
              >
                <Icon name="back" size={19} />
                <Text style={s.backText}>{c.back}</Text>
              </Pressable>
            )}
            {children}
            <View style={s.endSpace} />
          </ScrollView>
          {!wide && !detail && <View style={s.bottomNav}>{nav}</View>}
        </View>
      </View>
    </SafeAreaView>
  );
};

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  appFrame: { flex: 1, width: '100%', maxWidth: 1440, alignSelf: 'center' },
  appFrameWide: { flexDirection: 'row' },
  sidebar: {
    width: 228,
    padding: 30,
    paddingTop: 42,
    borderRightWidth: 1,
    borderRightColor: palette.line,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tagline: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 14 },
  sidebarBottom: { marginTop: 'auto', paddingTop: 60 },
  sidebarNote: { gap: 12, padding: 17, borderRadius: 14, backgroundColor: palette.pale },
  sidebarNoteText: { fontSize: 13, lineHeight: 20, color: palette.green },
  version: { fontSize: 8, letterSpacing: 1.5, color: palette.soft, marginTop: 24 },
  navVertical: { gap: 8, marginTop: 54 },
  navHorizontal: { flexDirection: 'row', justifyContent: 'space-around', padding: 7, gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    minHeight: 48,
  },
  navItemMobile: { flex: 1, justifyContent: 'center', flexDirection: 'column', gap: 5, padding: 8 },
  navActive: { backgroundColor: palette.pale },
  navText: { color: palette.muted, fontSize: 12 },
  navTextActive: { color: palette.green, fontWeight: '600' },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.green,
    marginLeft: 'auto',
  },
  main: { flex: 1, minWidth: 0 },
  mobileHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plusBadge: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  plusBadgeText: { fontSize: 10, letterSpacing: 1, color: palette.green, fontWeight: '600' },
  scroll: { padding: 24, paddingTop: 24, width: '100%', maxWidth: 1120, alignSelf: 'center' },
  scrollWide: { paddingHorizontal: 48, paddingTop: 42 },
  endSpace: { height: 24 },
  bottomNav: { backgroundColor: palette.paper, borderTopWidth: 1, borderColor: palette.line },
  title: {
    fontFamily: headingFont,
    fontSize: 30,
    lineHeight: 39,
    fontWeight: '600',
    letterSpacing: -0.6,
    color: palette.ink,
  },
  body: { color: palette.muted, fontSize: 16, lineHeight: 25 },
  titleCompact: { fontSize: 28, lineHeight: 37 },
  eyebrow: {
    fontSize: 10,
    color: palette.muted,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 14,
  },
  header: { gap: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  gap: { gap: 16 },
  gapSmall: { gap: 8 },
  section: { marginTop: 28 },
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 24,
    gap: 18,
  },
  panel: { backgroundColor: palette.pale, borderRadius: 20, padding: 24, gap: 16 },
  cardTitle: {
    color: palette.ink,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  small: { color: palette.muted, fontSize: 13, lineHeight: 20, flexShrink: 1 },
  divider: { height: 1, backgroundColor: palette.line },
  button: {
    backgroundColor: palette.green,
    paddingHorizontal: 22,
    paddingVertical: 16,
    minHeight: 52,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonSecondary: { backgroundColor: palette.pale, borderWidth: 1, borderColor: palette.line },
  buttonText: { fontSize: 16, fontWeight: '600', color: palette.white, textAlign: 'center', flexShrink: 1 },
  buttonSecondaryText: { color: palette.green },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  textButton: {
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonText: { color: palette.green, fontSize: 14, fontWeight: '500', textAlign: 'center' },
  danger: { color: palette.danger },
  field: { gap: 10 },
  fieldLabel: { fontSize: 14, color: palette.ink, fontWeight: '600' },
  input: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: palette.ink,
    minHeight: 54,
    outlineColor: palette.green,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  notice: { backgroundColor: palette.pale, padding: 15, borderRadius: 12 },
  noticeError: { backgroundColor: palette.peach },
  noticeText: { color: palette.green, fontSize: 13, lineHeight: 21 },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  day: { alignItems: 'center', gap: 12, flex: 1 },
  dayLabel: { color: palette.muted, fontSize: 11 },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleLarge: { width: 34, height: 34, borderRadius: 17 },
  dayToday: { borderWidth: 1, borderColor: palette.green },
  dayDone: { backgroundColor: palette.green },
  dayFuture: { opacity: 0.4 },
  dayNumber: { fontSize: 11, color: palette.muted },
  dayNumberToday: { color: palette.green, fontWeight: '700' },
  back: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    minHeight: 44,
    marginBottom: 20,
  },
  backText: { color: palette.muted, fontSize: 13 },
  pill: {
    backgroundColor: palette.pale,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pillText: { color: palette.green, fontSize: 10, fontWeight: '600', letterSpacing: 0.6 },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: palette.pale,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
