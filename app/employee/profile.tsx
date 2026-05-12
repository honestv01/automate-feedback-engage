import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { useStore, setCurrentUser } from '../lib/store';

export default function ProfileScreen() {
  const s = useStore();
  const router = useRouter();
  const user = s.currentUser!;
  const [pushAlerts, setPushAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const myReqs = s.requests.filter((r) => r.employeeId === user.id);
  const reviewed = myReqs.filter((r) => r.status === 'reviewed');
  const avgRating = reviewed.length ? reviewed.reduce((a, r) => a + (r.rating || 0), 0) / reviewed.length : 0;
  const clickRate = myReqs.length ? Math.round((myReqs.filter((r) => r.status !== 'pending').length / myReqs.length) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.split(' ').map((n) => n[0]).join('')}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="briefcase" size={12} color={theme.mint} />
          <Text style={styles.roleText}>{s.business.name}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{myReqs.length}</Text>
          <Text style={styles.statLabel}>Requests</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.mint }]}>{reviewed.length}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.lavender }]}>{avgRating ? avgRating.toFixed(1) : '—'}</Text>
          <Text style={styles.statLabel}>Avg rating</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.peach }]}>{clickRate}%</Text>
          <Text style={styles.statLabel}>Click rate</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Push alerts</Text>
            <Text style={styles.settingSub}>When customers reply or rate</Text>
          </View>
          <Switch value={pushAlerts} onValueChange={setPushAlerts} trackColor={{ true: theme.mint, false: theme.border }} thumbColor={theme.text} />
        </View>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Email alerts</Text>
            <Text style={styles.settingSub}>Daily digest of activity</Text>
          </View>
          <Switch value={emailAlerts} onValueChange={setEmailAlerts} trackColor={{ true: theme.mint, false: theme.border }} thumbColor={theme.text} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SWITCH WORKSPACE</Text>
        {s.employees.filter((e) => e.active).map((e) => (
          <TouchableOpacity
            key={e.id}
            style={[styles.userRow, e.id === user.id && styles.userRowActive]}
            onPress={() => setCurrentUser(e)}
          >
            <View style={[styles.miniAvatar, { backgroundColor: e.role === 'owner' ? theme.lavender : theme.mint }]}>
              <Text style={styles.miniAvatarText}>{e.name.split(' ').map((n) => n[0]).join('')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{e.name}</Text>
              <Text style={styles.userRole}>{e.role === 'owner' ? 'Owner' : 'Field employee'}</Text>
            </View>
            {e.id === user.id && <Ionicons name="checkmark-circle" size={20} color={theme.mint} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 8 }}>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/owner/dashboard')}>
          <Ionicons name="bar-chart-outline" size={18} color={theme.text} />
          <Text style={styles.linkText}>Open Owner Dashboard</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/')}>
          <Ionicons name="log-out-outline" size={18} color={theme.danger} />
          <Text style={[styles.linkText, { color: theme.danger }]}>Sign out</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textDim} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },

  profileCard: { marginHorizontal: 20, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 24, borderRadius: 16, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.mint, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: theme.bg, fontSize: 26, fontWeight: '700' },
  name: { color: theme.text, fontSize: 20, fontWeight: '700', marginTop: 14 },
  email: { color: theme.textMuted, fontSize: 14, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.bgElevated, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, marginTop: 12, borderWidth: 1, borderColor: theme.border },
  roleText: { color: theme.text, fontSize: 12, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 16, gap: 12 },
  stat: { flex: 1, minWidth: '47%', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 12 },
  statValue: { color: theme.text, fontSize: 22, fontWeight: '700' },
  statLabel: { color: theme.textMuted, fontSize: 12, marginTop: 2 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { color: theme.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },

  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 12, marginBottom: 8 },
  settingLabel: { color: theme.text, fontSize: 15, fontWeight: '500' },
  settingSub: { color: theme.textMuted, fontSize: 12, marginTop: 2 },

  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 12, borderRadius: 12, marginBottom: 8 },
  userRowActive: { borderColor: theme.mint },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { color: theme.bg, fontSize: 13, fontWeight: '700' },
  userName: { color: theme.text, fontSize: 14, fontWeight: '600' },
  userRole: { color: theme.textMuted, fontSize: 12, marginTop: 1 },

  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 12 },
  linkText: { color: theme.text, flex: 1, fontSize: 14, fontWeight: '500' },
});
