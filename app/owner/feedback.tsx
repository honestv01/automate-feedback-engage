import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore, markFeedbackRead } from '../lib/store';

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FeedbackScreen() {
  const s = useStore();
  const [tab, setTab] = useState<'unread' | 'all'>('unread');

  const visible = s.feedback.filter((f) => (tab === 'unread' ? !f.read : true));
  const unreadCount = s.feedback.filter((f) => !f.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>PRIVATE INBOX</Text>
        <Text style={styles.title}>Customer Feedback</Text>
        <Text style={styles.subtitle}>1–3 star ratings routed privately to you</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'unread' && styles.tabActive]} onPress={() => setTab('unread')}>
          <Text style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}>Unread</Text>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'all' && styles.tabActive]} onPress={() => setTab('all')}>
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All ({s.feedback.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40, gap: 12 }}>
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-circle" size={32} color={theme.mint} />
            </View>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySub}>No new private feedback to review.</Text>
          </View>
        ) : (
          visible.map((f) => (
            <View key={f.id} style={[styles.card, !f.read && styles.cardUnread]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.avatar, { backgroundColor: f.rating <= 2 ? theme.peach : theme.yellow }]}>
                    <Text style={styles.avatarText}>{f.customerName.split(' ').map((n) => n[0]).join('')}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{f.customerName}</Text>
                    <Text style={styles.meta}>Served by {f.employeeName} • {timeAgo(f.createdAt)}</Text>
                  </View>
                </View>
                {!f.read && <View style={styles.unreadDot} />}
              </View>

              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= f.rating ? 'star' : 'star-outline'}
                    size={16}
                    color={f.rating <= 2 ? theme.danger : theme.peach}
                  />
                ))}
                <Text style={[styles.ratingLabel, { color: f.rating <= 2 ? theme.danger : theme.peach }]}>
                  {f.rating === 1 ? 'Very poor' : f.rating === 2 ? 'Poor' : 'Neutral'}
                </Text>
              </View>

              <View style={styles.quote}>
                <Ionicons name="chatbubble" size={14} color={theme.textDim} />
                <Text style={styles.quoteText}>"{f.feedback}"</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="call-outline" size={14} color={theme.text} />
                  <Text style={styles.actionText}>Call customer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="mail-outline" size={14} color={theme.text} />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
                {!f.read && (
                  <TouchableOpacity style={[styles.actionBtn, styles.actionPrimary]} onPress={() => markFeedbackRead(f.id)}>
                    <Ionicons name="checkmark" size={14} color={theme.bg} />
                    <Text style={[styles.actionText, { color: theme.bg }]}>Mark read</Text>
                  </TouchableOpacity>
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
  eyebrow: { color: theme.peach, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  subtitle: { color: theme.textMuted, fontSize: 14, marginTop: 4 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  tabActive: { backgroundColor: theme.text, borderColor: theme.text },
  tabText: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: theme.bg },
  tabBadge: { backgroundColor: theme.peach, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, minWidth: 18, alignItems: 'center' },
  tabBadgeText: { color: theme.bg, fontSize: 10, fontWeight: '700' },

  card: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 14 },
  cardUnread: { borderColor: theme.peach },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: theme.bg, fontSize: 13, fontWeight: '700' },
  name: { color: theme.text, fontSize: 15, fontWeight: '600' },
  meta: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.peach },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 14 },
  ratingLabel: { fontSize: 11, fontWeight: '700', marginLeft: 8 },

  quote: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: theme.bgElevated, borderLeftWidth: 3, borderLeftColor: theme.peach, borderRadius: 8, marginTop: 12 },
  quoteText: { color: theme.text, fontSize: 14, lineHeight: 20, flex: 1, fontStyle: 'italic' },

  actions: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.bgElevated, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  actionPrimary: { backgroundColor: theme.mint, borderColor: theme.mint },
  actionText: { color: theme.text, fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: theme.textMuted, fontSize: 13, marginTop: 4 },
});
