import { useState } from 'react';
import { View, Text, Linking, Platform } from 'react-native';
import { usePreferences } from './preferences';
import { releaseCopy } from './releaseCopy';
import { legalCopy } from './legalCopy';
import { Screen, Title, Body, Button, Notice, s } from './ui';
import publicInfo from '../../release-public.json';

const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || publicInfo.supportEmail;
const operator = process.env.EXPO_PUBLIC_OPERATOR_NAME || publicInfo.operatorName;
export const Legal = ({ kind }: { kind: 'privacy' | 'terms' | 'support' }) => {
  const language = usePreferences((state) => state.language);
  const c = releaseCopy[language];
  const [failed, setFailed] = useState(false);
  const open = async (url: string) => {
    setFailed(false);
    try { await Linking.openURL(url); } catch { setFailed(true); }
  };
  return <Screen detail><View style={[s.gap, { maxWidth: 650, alignSelf: 'center', width: '100%' }]}>
    <Title>{c[kind]}</Title>
    {operator && <Text style={s.small}>{operator}</Text>}
    {legalCopy[language][kind].map((paragraph) => <Body key={paragraph}>{paragraph}</Body>)}
    {kind === 'support' && <>
      {Platform.OS !== 'android' && <Button secondary onPress={() => { void open('https://reportaproblem.apple.com/'); }}>
        App Store · {c.refund}
      </Button>}
      {Platform.OS !== 'ios' && <Button secondary onPress={() => { void open(`https://support.google.com/googleplay/answer/2479637?hl=${language}`); }}>
        Google Play · {c.refund}
      </Button>}
    </>}
    {kind === 'privacy' && <Button secondary onPress={() => { void open('https://www.revenuecat.com/privacy/'); }}>
      RevenueCat · {c.privacy}
    </Button>}
    {email ? <Button secondary onPress={() => { void open(`mailto:${email}?subject=Ssak%20support`); }}>
      {c.contact} · {email}
    </Button> : <Notice>{c.contactMissing}</Notice>}
    {failed && <Notice error>{c.openError}</Notice>}
  </View></Screen>;
};
