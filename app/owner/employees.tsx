import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore, addEmployee, toggleEmployee, planLimit } from '../lib/store';

export default function EmployeesScreen() {
  const s = useStore();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const fieldEmployees = s.employees.filter((e) => e.role === 'employee');
  const activeCount = fieldEmployees.filter((e) => e.active).length;
  const limit = planLimit(s.business.plan);
  const planName = s.business.plan === 'solo' ? 'Solo' : s.business.plan === 'team' ? 'Small Team' : 'Growth';
  const atLimit = activeCount >= limit;

  function handleAdd() {
    setError('');
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    if (atLimit) { setError(`Plan limit reached (${limit} users). Upgrade to add more.`); return; }
    addEmployee(name.trim(), email.trim());
    setName('');
    setEmail('');
    setModal(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TEAM</Text>
          <Text style={styles.title}>Employees</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, atLimit && { opacity: 0.5 }]} onPress={() => setModal(true)} disabled={atLimit}>
          <Ionicons name="add" size={18} color={theme.bg} />
          <Text style={styles.addBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.usageCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.usageLabel}>{planName} plan</Text>
          <Text style={styles.usageCount}>{activeCount} <Text style={{ color: theme.textMuted, fontSize: 18 }}>/ {limit} seats</Text></Text>
          <View style={styles.usageBar}>
            <View style={{ width: `${(activeCount / limit) * 100}%`, height: '100%', backgroundColor: atLimit ? theme.peach : theme.mint, borderRadius: 99 }} />
          </View>
        </View>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 40, gap: 10 }}>
        {s.employees.map((e) => {
          const reqs = s.requests.filter((r) => r.employeeId === e.id);
          const reviewed = reqs.filter((r) => r.status === 'reviewed').length;
          return (
            <View key={e.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: e.role === 'owner' ? theme.lavender : !e.active ? theme.bgElevated : theme.mint }]}>
                <Text style={[styles.avatarText, !e.active && { color: theme.textMuted }]}>{e.name.split(' ').map((n) => n[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.name}>{e.name}</Text>
                  {e.role === 'owner' && (
                    <View style={styles.ownerTag}>
                      <Text style={styles.ownerTagText}>OWNER</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.email}>{e.email}</Text>
                {e.role === 'employee' && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <Text style={styles.stat}>{reqs.length} sent</Text>
                    <Text style={[styles.stat, { color: theme.mint }]}>{reviewed} reviewed</Text>
                  </View>
                )}
              </View>
              {e.role === 'employee' && (
                <TouchableOpacity onPress={() => toggleEmployee(e.id)} style={[styles.toggleBtn, e.active ? styles.toggleActive : styles.toggleInactive]}>
                  <Text style={[styles.toggleText, { color: e.active ? theme.mint : theme.textMuted }]}>
                    {e.active ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Employee</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>They'll receive an email to join {s.business.name}.</Text>

            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Doe" placeholderTextColor={theme.textDim} />

            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="jane@example.com" placeholderTextColor={theme.textDim} keyboardType="email-address" autoCapitalize="none" />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                <Text style={styles.confirmText}>Send invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  eyebrow: { color: theme.lavender, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.mint, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: theme.bg, fontWeight: '700', fontSize: 13 },

  usageCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 20, marginBottom: 14, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 14 },
  usageLabel: { color: theme.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  usageCount: { color: theme.text, fontSize: 26, fontWeight: '700', marginTop: 4 },
  usageBar: { height: 6, backgroundColor: theme.bgElevated, borderRadius: 99, marginTop: 10, overflow: 'hidden' },
  upgradeBtn: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.bgElevated, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  upgradeText: { color: theme.text, fontSize: 13, fontWeight: '600' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 14, borderRadius: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: theme.bg, fontSize: 14, fontWeight: '700' },
  name: { color: theme.text, fontSize: 15, fontWeight: '600' },
  email: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  stat: { color: theme.textMuted, fontSize: 11, fontWeight: '500' },
  ownerTag: { backgroundColor: theme.lavender, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ownerTagText: { color: theme.bg, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  toggleActive: { backgroundColor: 'rgba(180,228,206,0.12)', borderColor: 'rgba(180,228,206,0.3)' },
  toggleInactive: { backgroundColor: theme.bgElevated, borderColor: theme.border },
  toggleText: { fontSize: 11, fontWeight: '700' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 24, borderRadius: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: theme.text, fontSize: 20, fontWeight: '700' },
  modalSub: { color: theme.textMuted, fontSize: 13, marginTop: 4 },
  fieldLabel: { color: theme.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: theme.bgElevated, borderWidth: 1, borderColor: theme.border, color: theme.text, paddingHorizontal: 12, height: 46, borderRadius: 10, fontSize: 15 },
  error: { color: theme.danger, fontSize: 12, marginTop: 10 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  cancelBtn: { flex: 1, height: 46, backgroundColor: theme.bgElevated, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: theme.text, fontWeight: '600' },
  confirmBtn: { flex: 1, height: 46, backgroundColor: theme.mint, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: theme.bg, fontWeight: '700' },
});
