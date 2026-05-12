import { Text, View, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';
import { RequestStatus } from '../lib/store';

export function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'PENDING', color: theme.yellow, bg: 'rgba(255,243,176,0.12)' },
    clicked: { label: 'CLICKED', color: theme.blue, bg: 'rgba(191,217,255,0.12)' },
    reviewed: { label: 'REVIEWED', color: theme.mint, bg: 'rgba(180,228,206,0.15)' },
    feedback: { label: 'FEEDBACK', color: theme.peach, bg: 'rgba(255,212,184,0.15)' },
  };
  const s = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      <Text style={[styles.text, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
