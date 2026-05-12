import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { sendReviewRequest, useStore } from '../lib/store';
import { Toast } from '../components/Toast';

export default function SendScreen() {
  const s = useStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; msg: string }>({ visible: false, msg: '' });
  const [lastReq, setLastReq] = useState<string | null>(null);
  const successAnim = useRef(new Animated.Value(0)).current;

  const todayCount = s.requests.filter((r) => r.employeeId === s.currentUser?.id && r.createdAt > Date.now() - 86400000).length;
  const todayReviews = s.requests.filter((r) => r.employeeId === s.currentUser?.id && r.status === 'reviewed' && r.createdAt > Date.now() - 86400000).length;

  function formatPhone(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  async function handleSend() {
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) {
      setToast({ visible: true, msg: 'Please enter a valid name and phone number' });
      setTimeout(() => setToast({ visible: false, msg: '' }), 2500);
      return;
    }
    const customer = name.trim();
    setSending(true);
    const result = await sendReviewRequest(customer, '+1' + phone.replace(/\D/g, ''));
    setSending(false);

    if (!result.ok) {
      setToast({ visible: true, msg: result.error || 'Failed to send SMS' });
      setTimeout(() => setToast({ visible: false, msg: '' }), 3500);
      return;
    }

    // pick up newest request id (just-created) from store
    const newest = require('../lib/store').store.get().requests[0];
    setLastReq(newest?.id || null);
    Animated.sequence([
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.delay(2500),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    setName('');
    setPhone('');
    setToast({ visible: true, msg: `SMS sent to ${customer}` });
    setTimeout(() => setToast({ visible: false, msg: '' }), 2500);
  }


  const smsPreview = `Hi ${name || '[Customer]'}, this is ${s.currentUser?.name.split(' ')[0]} from ${s.business.name}. Thanks for choosing us! Mind sharing a quick review? ${'reviewboost.io/r/abc'} Reply STOP to opt out.`;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Toast visible={toast.visible} message={toast.msg} type={toast.msg.includes('sent') ? 'success' : 'error'} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {s.currentUser?.name.split(' ')[0]}</Text>
            <Text style={styles.subgreeting}>Ready to collect some reviews?</Text>
          </View>
          <TouchableOpacity style={styles.backHome} onPress={() => router.push('/')}>
            <Ionicons name="home-outline" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Today stats */}
        <View style={styles.todayRow}>
          <View style={styles.todayCard}>
            <View style={[styles.todayDot, { backgroundColor: theme.mint }]} />
            <Text style={styles.todayValue}>{todayCount}</Text>
            <Text style={styles.todayLabel}>Sent today</Text>
          </View>
          <View style={styles.todayCard}>
            <View style={[styles.todayDot, { backgroundColor: theme.lavender }]} />
            <Text style={styles.todayValue}>{todayReviews}</Text>
            <Text style={styles.todayLabel}>Reviews earned</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Send Review Request</Text>
          <Text style={styles.formSub}>Enter the customer's details to text them a review link.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Customer name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={theme.textDim} />
              <TextInput
                style={styles.input}
                placeholder="John Smith"
                placeholderTextColor={theme.textDim}
                value={name}
                onChangeText={setName}
                editable={!sending}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={theme.textDim} />
              <Text style={styles.prefix}>+1</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                placeholderTextColor={theme.textDim}
                value={phone}
                onChangeText={(t) => setPhone(formatPhone(t))}
                keyboardType="phone-pad"
                editable={!sending}
              />
            </View>
          </View>

          {/* SMS Preview */}
          <View style={styles.previewBox}>
            <View style={styles.previewHeader}>
              <Ionicons name="chatbubble-ellipses" size={14} color={theme.mint} />
              <Text style={styles.previewLabel}>SMS PREVIEW</Text>
            </View>
            <Text style={styles.previewText}>{smsPreview}</Text>
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, sending && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <>
                <Animated.View style={styles.spinner} />
                <Text style={styles.sendBtnText}>Sending...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={18} color={theme.bg} />
                <Text style={styles.sendBtnText}>Send SMS</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.complianceRow}>
            <Ionicons name="shield-checkmark" size={14} color={theme.textDim} />
            <Text style={styles.compliance}>STOP/HELP compliance, 24-hr reminder auto-scheduled</Text>
          </View>
        </View>

        {/* Success animation */}
        <Animated.View
          style={[
            styles.successCard,
            {
              opacity: successAnim,
              transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={28} color={theme.bg} />
          </View>
          <Text style={styles.successTitle}>SMS delivered</Text>
          <Text style={styles.successSub}>Request ID: {lastReq?.slice(0, 8).toUpperCase()}</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  greeting: { color: theme.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  subgreeting: { color: theme.textMuted, fontSize: 14, marginTop: 4 },
  backHome: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },

  todayRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  todayCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 14 },
  todayDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 12 },
  todayValue: { color: theme.text, fontSize: 28, fontWeight: '700' },
  todayLabel: { color: theme.textMuted, fontSize: 12, marginTop: 2 },

  formCard: { marginHorizontal: 20, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 20, borderRadius: 16 },
  formTitle: { color: theme.text, fontSize: 20, fontWeight: '700' },
  formSub: { color: theme.textMuted, fontSize: 14, marginTop: 4, marginBottom: 20 },

  field: { marginBottom: 16 },
  label: { color: theme.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.bgElevated, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, height: 50 },
  prefix: { color: theme.textMuted, fontSize: 15, fontWeight: '500' },
  input: { flex: 1, color: theme.text, fontSize: 15, height: '100%' },

  previewBox: { backgroundColor: theme.bgElevated, borderWidth: 1, borderColor: theme.border, padding: 12, borderRadius: 10, marginBottom: 16 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  previewLabel: { color: theme.mint, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  previewText: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },

  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.mint, height: 54, borderRadius: 12 },
  sendBtnText: { color: theme.bg, fontWeight: '700', fontSize: 16 },
  spinner: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: theme.bg, borderTopColor: 'transparent' },

  complianceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  compliance: { color: theme.textDim, fontSize: 11 },

  successCard: { position: 'absolute', top: '40%', alignSelf: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.mint, padding: 28, borderRadius: 20, alignItems: 'center', shadowColor: theme.mint, shadowOpacity: 0.4, shadowRadius: 30, elevation: 20 },
  successIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.mint, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  successTitle: { color: theme.text, fontSize: 20, fontWeight: '700' },
  successSub: { color: theme.textMuted, fontSize: 13, marginTop: 4 },
});
