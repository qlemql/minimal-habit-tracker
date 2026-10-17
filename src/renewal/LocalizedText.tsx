import { Platform, Text as NativeText } from 'react-native';
import { usePreferences } from './preferences';
import type { TextProps, TextStyle } from 'react-native';

interface WebTextStyle extends TextStyle {
  wordBreak: 'keep-all' | 'normal';
  overflowWrap: 'anywhere';
  lineBreak: 'strict';
  textWrap: 'pretty';
}

const webKorean: WebTextStyle = { wordBreak: 'keep-all', overflowWrap: 'anywhere', lineBreak: 'strict', textWrap: 'pretty' };
const webDefault: WebTextStyle = { wordBreak: 'normal', overflowWrap: 'anywhere', lineBreak: 'strict', textWrap: 'pretty' };

export const LocalizedText = ({ style, ...props }: TextProps) => {
  const language = usePreferences((state) => state.language);
  const webProps = Platform.OS === 'web' ? { lang: language } : {};
  const webStyle = Platform.OS === 'web' ? (language === 'ko' ? webKorean : webDefault) : undefined;
  return (
    <NativeText
      lineBreakStrategyIOS={language === 'ko' ? 'hangul-word' : 'standard'}
      textBreakStrategy="highQuality"
      android_hyphenationFrequency="none"
      {...webProps}
      {...props}
      style={[webStyle, style]}
    />
  );
};
