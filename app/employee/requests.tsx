import { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore, RequestStatus } from '../lib/store';
import { StatusBadge } from '../components/StatusBadge';

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RequestsScreen() {
  const s = useStore();
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [search, setSearch] = useState('');

  const myRequests = useMemo(() => {
    return s.requests
      .filter((r) => r.employeeId === s.currentUser?.id)
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter((r) => r.customerName.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search))
      .slice(0, 10);
  }, [s.requests, s.currentUser, filter, search]);

  const filters: Array<{ key: 'all' | RequestStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'clicked', label: 'Clicked' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'feedback', label: 'Feedback' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <Text style={styles.subtitle}>Your last 10 review requests</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={theme.textDim} />
        <TextInput
          style={styles.search}
          placeholder="Search by name or phone"
          placeholderTextColor={theme.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }} style={{ maxHeight: 50 }}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40, gap: 12 }}>
        {myRequests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="mail-outline" size={40} color={theme.textDim} />
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySub}>Send your first review request from the Send tab</Text>
          </View>
        ) : (
          myRequests.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.customerName}</Text>
                  <Text style={styles.phone}>{r.phone}</Text>
                </View>
                <StatusBadge status={r.status} />
              </View>

              {r.rating && (
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= r.rating! ? 'star' : 'star-outline'}
                      size={14}
                      color={r.rating! >= 4 ? theme.mint : theme.peach}
                    />
                  ))}
                  <Text style={styles.ratingText}>{r.rating}.0</Text>
                </View>
              )}

              {r.feedback && (
                <View style={styles.feedbackPreview}>
                  <Text style={styles.feedbackText} numberOfLines={2}>"{r.feedback}"</Text>
                </View>
              )}

              <View style={styles.meta}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={12} color={theme.textDim} />
                  <Text style={styles.metaText}>{timeAgo(r.createdAt)}</Text>
                </View>
                {r.status === 'pending' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="notifications-outline" size={12} color={theme.yellow} />
                    <Text style={[styles.metaText, { color: theme.yellow }]}>Reminder in 24h</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: theme.textMuted, fontSize: 14, marginTop: 4 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, marginHorizontal: 20, paddingHorizontal: 12, height: 44, borderRadius: 10, marginBottom: 12 },
  search: { flex: 1, color: theme.text, fontSize: 14, height: '100%' },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, height: 34 },
  chipActive: { backgroundColor: theme.mint, borderColor: theme.mint },
  chipText: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: theme.bg },

  card: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 14 },
  name: { color: theme.text, fontSize: 16, fontWeight: '600' },
  phone: { color: theme.textMuted, fontSize: 13, marginTop: 2 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 12 },
  ratingText: { color: theme.textMuted, fontSize: 12, marginLeft: 6, fontWeight: '600' },

  feedbackPreview: { marginTop: 12, padding: 10, backgroundColor: theme.bgElevated, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: theme.peach },
  feedbackText: { color: theme.textMuted, fontSize: 13, fontStyle: 'italic' },

  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border },
  metaText: { color: theme.textDim, fontSize: 11 },

  empty: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyText: { color: theme.text, fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySub: { color: theme.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
});
