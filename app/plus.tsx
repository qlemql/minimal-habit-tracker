import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LocalizedText as Text } from '@/renewal/LocalizedText';
import { useRouter } from 'expo-router';
import { releaseCopy } from '@/renewal/releaseCopy';
import { useHabitStore } from '@/store/habitStore';
import { useProStore } from '@/store/proStore';
import { useCopy, usePreferences } from '@/renewal/preferences';
import { discoveryCopy } from '@/renewal/ideas';
import {
  getLifetimePackage,
  buyLifetime,
  restoreLifetime,
  billingAvailable,
  PurchasePendingError,
} from '@/renewal/billing';
import {
  Screen,
  Title,
  Body,
  Eyebrow,
  Button,
  TextButton,
  Notice,
  Icon,
  s,
  palette,
} from '@/renewal/ui';
import type { PurchasesPackage } from 'react-native-purchases';
export default function Plus() {
  const c = useCopy();
  const router = useRouter();
  const language = usePreferences((state) => state.language);
  const d = discoveryCopy[language];
  const pro = useProStore((state) => state.isPro);
  const legacy = useHabitStore((state) => state.legacyAccess);
  const [item, setItem] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (pro) { setPending(false); setMessage(''); }
  }, [pro]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await getLifetimePackage();
        if (mounted) setItem(result);
      } catch {
        /* Store may be offline or not configured. */
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);
  const transact = async (restore: boolean) => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const success = restore ? await restoreLifetime() : item ? await buyLifetime(item) : false;
      setMessage(success ? c.purchased : restore ? c.nothingRestore : c.purchaseError);
    } catch (error) {
      if (error instanceof PurchasePendingError) {
        setPending(true);
        setMessage(releaseCopy[language].purchasePending);
        return;
      }
      if (!(
        typeof error === 'object' &&
        error !== null &&
        'userCancelled' in error &&
        error.userCancelled
      ))
        setMessage(c.purchaseError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen detail>
      <View style={st.content}>
        <Eyebrow>{c.plusName}</Eyebrow>
        <Title>{c.plusTitle}</Title>
        <Body>{c.plusSub}</Body>
        <View style={s.card}>
          <View style={s.row}>
            <Icon name="sun" />
            <Text style={s.cardTitle}>{c.freeTitle}</Text>
          </View>
          <Body>{c.freeText}</Body>
        </View>
        <View style={[s.panel, st.plusPanel]}>
          <View style={s.between}>
            <Text style={s.cardTitle}>{c.plusName}</Text>
            <Icon name="spark" />
          </View>
          <Body>{c.plusText}</Body>
          <Text style={s.small}>{c.lifetime}</Text>
          {pro ? (
            <Notice>{c.plusActive}</Notice>
          ) : (
            <>
              <Button
                disabled={!item || busy || loading || pending}
                onPress={() => {
                  void transact(false);
                }}
                icon="arrow"
              >
                {item ? `${c.buy} · ${item.product.priceString}` : c.buy}
              </Button>
              {!item && !loading && (
                <Text style={s.small}>
                  {billingAvailable() ? d.unavailable : c.billingUnavailable}
                </Text>
              )}
            </>
          )}
        </View>
        {legacy && <Notice>{c.legacy}</Notice>}
        {message ? <Notice>{message}</Notice> : null}
        <Text style={s.small}>{d.scope}</Text>
        <Button
          secondary
          disabled={!billingAvailable() || busy}
          onPress={() => {
            void transact(true);
          }}
        >
          {c.restorePurchase}
        </Button>
        <TextButton onPress={() => router.push('/terms')}>{releaseCopy[language].terms}</TextButton>
        <TextButton onPress={() => router.push('/support')}>{releaseCopy[language].support}</TextButton>
        <TextButton onPress={() => router.push('/privacy')}>{releaseCopy[language].privacy}</TextButton>
      </View>
    </Screen>
  );
}
const st = StyleSheet.create({
  content: { maxWidth: 580, alignSelf: 'center', width: '100%', gap: 20 },
  plusPanel: { borderWidth: 1, borderColor: palette.mint },
});
