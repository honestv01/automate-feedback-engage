import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { useStore, setPlan, planLimit } from '../lib/store';

export default function SettingsScreen() {
  const s = useStore();
  const router = useRouter();
  const [name, setName] = useState(s.business.name);
  const [googleUrl, setGoogleUrl] = useState(s.business.googleReviewUrl);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [autoStop, setAutoStop] = useState(true);

  const plans = [
    { id: 'solo' as const, name: 'Solo', price: 29, seats: 1, features: ['SMS requests', 'Reminders', 'Private inbox'] },
    { id: 'team' as const, name: 'Small Team', price: 49, seats: 5, features: ['Everything in Solo', 'Leaderboard', 'CSV export'] },
    { id: 'growth' as const, name: 'Growth', price: 99, seats: 15, features: ['Everything in Team', 'Priority delivery', 'Custom branding'] },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Business */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUSINESS</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Business name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.textDim} />

          <Text style={styles.fieldLabel}>Google review URL</Text>
          <TextInput style={styles.input} value={googleUrl} onChangeText={setGoogleUrl} placeholderTextColor={theme.textDim} autoCapitalize="none" />

          <Text style={styles.fieldLabel}>SMS sender ID</Text>
          <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
            <Ionicons name="checkmark-circle" size={16} color={theme.mint} />
            <Text style={{ color: theme.text }}>+1 (888) 555-0142 (Twilio verified)</Text>
          </View>

          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Automation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AUTOMATION</Text>
        <View style={styles.card}>
          <SettingToggle label="24-hour reminder" sub="Re-text customers who didn't click within 24h" value={reminderEnabled} onChange={setReminderEnabled} />
          <SettingToggle label="STOP/HELP compliance" sub="Auto-unsubscribe on STOP keyword" value={autoStop} onChange={setAutoStop} />
          <SettingToggle label="Email alerts on private feedback" sub="Get instantly notified for 1–3★ ratings" value={emailAlerts} onChange={setEmailAlerts} />
          <SettingToggle label="Push notifications" sub="Mobile alerts for new ratings" value={pushAlerts} onChange={setPushAlerts} last />
        </View>
      </View>

      {/* Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
        <View style={{ gap: 12 }}>
          {plans.map((p) => {
            const active = s.business.plan === p.id;
            return (
              <TouchableOpacity key={p.id} style={[styles.planCard, active && styles.planCardActive]} onPress={() => setPlan(p.id)}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.planName}>{p.name}</Text>
                    {active && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>CURRENT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planSeats}>Up to {p.seats} {p.seats === 1 ? 'user' : 'users'}</Text>
                  <Text style={styles.planFeatures}>{p.features.join(' • ')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.planPrice}>${p.price}</Text>
                  <Text style={styles.planMonth}>/mo</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.billingRow}>
          <Ionicons name="card-outline" size={18} color={theme.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.billingTitle}>Visa ending in 4242</Text>
            <Text style={styles.billingSub}>Next charge: Dec 12 • ${plans.find(p => p.id === s.business.plan)?.price}.00</Text>
          </View>
          <TouchableOpacity><Text style={styles.linkText}>Manage</Text></TouchableOpacity>
        </View>
      </View>

      {/* Webhook + danger */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTEGRATIONS</Text>
        <View style={styles.card}>
          <IntegrationRow icon="chatbubbles" tint={theme.mint} name="Twilio SMS" status="Connected" />
          <IntegrationRow icon="card" tint={theme.lavender} name="Stripe Billing" status="Connected" />
          <IntegrationRow icon="logo-google" tint={theme.peach} name="Google Business Profile" status="Connected" last />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 8 }}>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/')}>
          <Ionicons name="log-out-outline" size={18} color={theme.danger} />
          <Text style={[styles.linkBtnText, { color: theme.danger }]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SettingToggle({ label, sub, value, onChange, last }: any) {
  return (
    <View style={[stStyles.row, !last && stStyles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={stStyles.label}>{label}</Text>
        <Text style={stStyles.sub}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.mint, false: theme.border }} thumbColor={theme.text} />
    </View>
  );
}

function IntegrationRow({ icon, tint, name, status, last }: any) {
  return (
    <View style={[stStyles.row, !last && stStyles.rowBorder]}>
      <View style={[styles.intIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={16} color={theme.bg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={stStyles.label}>{name}</Text>
        <Text style={stStyles.sub}>{status}</Text>
      </View>
      <View style={styles.connDot} />
    </View>
  );
}

const stStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },
  label: { color: theme.text, fontSize: 14, fontWeight: '500' },
  sub: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
});

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  eyebrow: { color: theme.mint, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { color: theme.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 14 },

  fieldLabel: { color: theme.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.bgElevated, borderWidth: 1, borderColor: theme.border, color: theme.text, paddingHorizontal: 12, height: 44, borderRadius: 10, fontSize: 14 },

  saveBtn: { backgroundColor: theme.text, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: theme.bg, fontWeight: '700', fontSize: 14 },

  planCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 14 },
  planCardActive: { borderColor: theme.mint, backgroundColor: 'rgba(180,228,206,0.04)' },
  planName: { color: theme.text, fontSize: 16, fontWeight: '700' },
  planSeats: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  planFeatures: { color: theme.textDim, fontSize: 11, marginTop: 6 },
  planPrice: { color: theme.text, fontSize: 24, fontWeight: '700' },
  planMonth: { color: theme.textMuted, fontSize: 11 },
  currentBadge: { backgroundColor: theme.mint, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  currentBadgeText: { color: theme.bg, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: theme.mint },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.mint },

  billingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 12, marginTop: 12 },
  billingTitle: { color: theme.text, fontSize: 13, fontWeight: '600' },
  billingSub: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  linkText: { color: theme.mint, fontSize: 13, fontWeight: '600' },

  intIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  connDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.success },

  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 12, justifyContent: 'center' },
  linkBtnText: { fontSize: 14, fontWeight: '600' },
});
