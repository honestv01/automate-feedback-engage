import { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { useStore } from '../lib/store';

const { width } = Dimensions.get('window');
const isWide = width >= 900;

export default function Dashboard() {
  const s = useStore();
  const router = useRouter();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = Date.now() - daysBack * 86400000;
  const inRange = s.requests.filter((r) => r.createdAt >= cutoff);

  const metrics = useMemo(() => {
    const sent = inRange.length;
    const clicked = inRange.filter((r) => r.status !== 'pending').length;
    const reviewed = inRange.filter((r) => r.status === 'reviewed');
    const feedback = inRange.filter((r) => r.status === 'feedback');
    const pending = inRange.filter((r) => r.status === 'pending').length;
    const clickRate = sent ? Math.round((clicked / sent) * 100) : 0;
    const conversionRate = sent ? Math.round((reviewed.length / sent) * 100) : 0;
    const avg = reviewed.length ? reviewed.reduce((a, r) => a + (r.rating || 0), 0) / reviewed.length : 0;
    return { sent, clicked, reviewed: reviewed.length, feedback: feedback.length, pending, clickRate, conversionRate, avg };
  }, [inRange]);

  // Per-employee leaderboard
  const leaderboard = useMemo(() => {
    const map = new Map<string, { name: string; sent: number; reviewed: number; rating: number; ratingCount: number }>();
    s.employees.forEach((e) => map.set(e.id, { name: e.name, sent: 0, reviewed: 0, rating: 0, ratingCount: 0 }));
    inRange.forEach((r) => {
      const m = map.get(r.employeeId);
      if (!m) return;
      m.sent++;
      if (r.status === 'reviewed') m.reviewed++;
      if (r.rating) { m.rating += r.rating; m.ratingCount++; }
    });
    return [...map.values()]
      .filter((m) => m.sent > 0)
      .map((m) => ({ ...m, avg: m.ratingCount ? m.rating / m.ratingCount : 0, conv: m.sent ? Math.round((m.reviewed / m.sent) * 100) : 0 }))
      .sort((a, b) => b.reviewed - a.reviewed);
  }, [inRange, s.employees]);

  // Bar chart data — last 7 days regardless of range
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = dayStart.getTime() + 86400000;
      const count = s.requests.filter((r) => r.createdAt >= dayStart.getTime() && r.createdAt < dayEnd).length;
      const label = dayStart.toLocaleDateString('en', { weekday: 'short' });
      days.push({ label, count });
    }
    const max = Math.max(1, ...days.map((d) => d.count));
    return { days, max };
  }, [s.requests]);

  const ratingDist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    inRange.forEach((r) => { if (r.rating) d[r.rating - 1]++; });
    const total = d.reduce((a, b) => a + b, 0) || 1;
    return d.map((v, i) => ({ star: i + 1, count: v, pct: Math.round((v / total) * 100) }));
  }, [inRange]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>OWNER DASHBOARD</Text>
          <Text style={styles.title}>{s.business.name}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Range selector */}
      <View style={styles.rangeRow}>
        {(['7d', '30d', '90d'] as const).map((r) => (
          <TouchableOpacity key={r} style={[styles.rangeBtn, range === r && styles.rangeBtnActive]} onPress={() => setRange(r)}>
            <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
              {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metric Grid */}
      <View style={styles.metricsGrid}>
        <Metric icon="send" tint={theme.mint} value={metrics.sent} label="Requests sent" trend="+18%" />
        <Metric icon="cursor-default-click" tint={theme.lavender} value={`${metrics.clickRate}%`} label="Click-through" trend="+4.2%" />
        <Metric icon="star" tint={theme.peach} value={metrics.reviewed} label="Google reviews" trend="+22%" />
        <Metric icon="trending-up" tint={theme.pink} value={metrics.avg ? metrics.avg.toFixed(1) : '—'} label="Avg rating" sub="of 5.0" />
        <Metric icon="time" tint={theme.yellow} value={metrics.pending} label="Pending reminders" />
        <Metric icon="alert-circle" tint={theme.peach} value={metrics.feedback} label="Private feedback" />
        <Metric icon="trophy" tint={theme.mint} value={leaderboard[0]?.name.split(' ')[0] || '—'} label="Top performer" small />
        <Metric icon="checkmark-done" tint={theme.lavender} value={`${metrics.conversionRate}%`} label="Conversion" trend="+6%" />
      </View>

      {/* Charts row */}
      <View style={[styles.chartsRow, isWide && { flexDirection: 'row' }]}>
        {/* Daily volume */}
        <View style={[styles.chartCard, { flex: 2 }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Requests over time</Text>
            <Text style={styles.chartSub}>Last 7 days</Text>
          </View>
          <View style={styles.chart}>
            {dailyData.days.map((d, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                  <View
                    style={{
                      width: '70%',
                      height: `${(d.count / dailyData.max) * 100}%`,
                      backgroundColor: i === dailyData.days.length - 1 ? theme.mint : theme.lavender,
                      borderRadius: 6,
                      minHeight: 4,
                    }}
                  />
                </View>
                <Text style={styles.barCount}>{d.count}</Text>
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rating distribution */}
        <View style={[styles.chartCard, { flex: 1 }]}>
          <Text style={styles.chartTitle}>Rating breakdown</Text>
          <Text style={styles.chartSub}>{range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}</Text>
          <View style={{ marginTop: 16, gap: 10 }}>
            {[...ratingDist].reverse().map((r) => (
              <View key={r.star} style={styles.distRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: 36 }}>
                  <Text style={styles.distStar}>{r.star}</Text>
                  <Ionicons name="star" size={11} color={r.star >= 4 ? theme.mint : theme.peach} />
                </View>
                <View style={styles.distBar}>
                  <View style={{ width: `${r.pct}%`, height: '100%', backgroundColor: r.star >= 4 ? theme.mint : theme.peach, borderRadius: 99 }} />
                </View>
                <Text style={styles.distCount}>{r.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Leaderboard */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team leaderboard</Text>
          <TouchableOpacity onPress={() => router.push('/owner/employees')}>
            <Text style={styles.linkText}>Manage team →</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 10 }}>
          {leaderboard.map((m, i) => (
            <View key={m.name} style={styles.leaderRow}>
              <View style={[styles.rank, i === 0 && { backgroundColor: theme.mint }, i === 1 && { backgroundColor: theme.lavender }, i === 2 && { backgroundColor: theme.peach }]}>
                <Text style={[styles.rankText, i < 3 && { color: theme.bg }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderName}>{m.name}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 3 }}>
                  <Text style={styles.leaderStat}>{m.sent} sent</Text>
                  <Text style={styles.leaderStat}>{m.reviewed} reviewed</Text>
                  <Text style={styles.leaderStat}>{m.avg ? m.avg.toFixed(1) : '—'}★</Text>
                </View>
              </View>
              <View style={styles.convPill}>
                <Text style={styles.convText}>{m.conv}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {s.requests.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.activityRow}>
              <View style={[styles.activityIcon, { backgroundColor: r.status === 'reviewed' ? theme.mint : r.status === 'feedback' ? theme.peach : r.status === 'clicked' ? theme.lavender : theme.yellow }]}>
                <Ionicons
                  name={r.status === 'reviewed' ? 'star' : r.status === 'feedback' ? 'chatbubble-ellipses' : r.status === 'clicked' ? 'finger-print' : 'send'}
                  size={14}
                  color={theme.bg}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>
                  <Text style={{ fontWeight: '700' }}>{r.customerName}</Text>
                  {' '}{r.status === 'reviewed' ? `left a ${r.rating}-star review` : r.status === 'feedback' ? `submitted private feedback (${r.rating}★)` : r.status === 'clicked' ? 'opened the link' : 'received SMS'}
                </Text>
                <Text style={styles.activitySub}>via {r.employeeName}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Metric({ icon, tint, value, label, trend, sub, small }: any) {
  return (
    <View style={[styles.metric, { width: isWide ? '23%' : '47%' }]}>
      <View style={[styles.metricIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={14} color={theme.bg} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 14 }}>
        <Text style={[styles.metricValue, small && { fontSize: 18 }]} numberOfLines={1}>{value}</Text>
        {sub && <Text style={styles.metricSub}>{sub}</Text>}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Ionicons name="trending-up" size={11} color={theme.success} />
          <Text style={{ color: theme.success, fontSize: 11, fontWeight: '600' }}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  eyebrow: { color: theme.mint, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },

  rangeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  rangeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  rangeBtnActive: { backgroundColor: theme.text, borderColor: theme.text },
  rangeBtnText: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
  rangeBtnTextActive: { color: theme.bg },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  metric: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 14, flexGrow: 1 },
  metricIcon: { width: 26, height: 26, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  metricValue: { color: theme.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  metricSub: { color: theme.textMuted, fontSize: 12 },
  metricLabel: { color: theme.textMuted, fontSize: 12, marginTop: 4 },

  chartsRow: { gap: 12, paddingHorizontal: 20, marginTop: 16 },
  chartCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 18, borderRadius: 14 },
  chartHeader: { marginBottom: 6 },
  chartTitle: { color: theme.text, fontSize: 15, fontWeight: '700' },
  chartSub: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  chart: { height: 140, flexDirection: 'row', gap: 6, marginTop: 16, alignItems: 'flex-end' },
  barWrap: { flex: 1, height: '100%', alignItems: 'center' },
  barCount: { color: theme.text, fontSize: 11, fontWeight: '600', marginTop: 4 },
  barLabel: { color: theme.textDim, fontSize: 10, marginTop: 2 },

   distRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
   distStar: { color: theme.text, fontSize: 13, fontWeight: '600', width: 20 },
   distBar: { flex: 1, height: 8, backgroundColor: theme.bgElevated, borderRadius: 99, overflow: 'hidden', minWidth: 60 },
   distCount: { color: theme.textMuted, fontSize: 12, width: 24, textAlign: 'right' },

  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
  linkText: { color: theme.mint, fontSize: 13, fontWeight: '600' },

  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 12, borderRadius: 12 },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.bgElevated, justifyContent: 'center', alignItems: 'center' },
  rankText: { color: theme.text, fontSize: 13, fontWeight: '700' },
  leaderName: { color: theme.text, fontSize: 14, fontWeight: '600' },
  leaderStat: { color: theme.textMuted, fontSize: 11 },
  convPill: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: theme.bgElevated, borderRadius: 99 },
  convText: { color: theme.mint, fontSize: 12, fontWeight: '700' },

  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12 },
  activityIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  activityTitle: { color: theme.text, fontSize: 13, lineHeight: 18 },
  activitySub: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
});
