import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Animated, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore, submitReview, markRequestClicked } from '../lib/store';

export default function ReviewPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const s = useStore();
  const req = s.requests.find((r) => r.id === id);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'rate' | 'feedback' | 'google' | 'done'>('rate');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (req && req.status === 'pending') markRequestClicked(req.id);
  }, [req?.id]);

  if (!req) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle" size={48} color={theme.peach} />
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 12 }}>Link not found</Text>
        <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>This review link is invalid or expired.</Text>
        <TouchableOpacity style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: theme.mint, borderRadius: 10 }} onPress={() => router.push('/')}>
          <Text style={{ color: theme.bg, fontWeight: '700' }}>Go home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleStarPress(stars: number) {
    setRating(stars);
    setTimeout(() => {
      if (stars >= 4) setStep('google');
      else setStep('feedback');
    }, 600);
  }

  function submitFeedback() {
    submitReview(req!.id, rating, feedback + (tags.length ? ` [tags: ${tags.join(', ')}]` : ''));
    setStep('done');
  }

  function goToGoogle() {
    submitReview(req!.id, rating);
    Linking.openURL(s.business.googleReviewUrl).catch(() => {});
    setStep('done');
  }

  const FEEDBACK_TAGS = ['Late arrival', 'Pricing', 'Communication', 'Work quality', 'Cleanliness', 'Other'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fafafa' }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Branded header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoCircle}>
          <Ionicons name="hammer" size={22} color={theme.bg} />
        </View>
        <Text style={styles.brandName}>{s.business.name}</Text>
        <View style={styles.secureBadge}>
          <Ionicons name="lock-closed" size={10} color={theme.success} />
          <Text style={styles.secureText}>Verified review request</Text>
        </View>
      </View>

      {step === 'rate' && (
        <View style={styles.content}>
          <Text style={styles.greeting}>Hi {req.customerName.split(' ')[0]},</Text>
          <Text style={styles.title}>How was your experience?</Text>
          <Text style={styles.sub}>{req.employeeName} from {s.business.name} would love your feedback.</Text>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity
                key={i}
                style={styles.starBtn}
                onPress={() => handleStarPress(i)}
                onPressIn={() => setHover(i)}
                onPressOut={() => setHover(0)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={i <= (hover || rating) ? 'star' : 'star-outline'}
                  size={48}
                  color={i <= (hover || rating) ? '#fbbf24' : '#d4d4d4'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.tapHint}>Tap to rate</Text>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Ionicons name="time-outline" size={14} color="#737373" />
              <Text style={styles.trustText}>30 seconds</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#737373" />
              <Text style={styles.trustText}>Private & secure</Text>
            </View>
          </View>
        </View>
      )}

      {step === 'google' && (
        <View style={styles.content}>
          <View style={styles.successIconLight}>
            <Ionicons name="heart" size={32} color="#fbbf24" />
          </View>
          <Text style={styles.bigTitle}>Thank you!</Text>
          <Text style={styles.bigSub}>
            You rated us {rating} {rating === 5 ? 'stars — amazing!' : 'stars.'} Would you share that on Google?
          </Text>

          <View style={styles.googleCard}>
            <View style={styles.googleHeader}>
              <View style={styles.googleLogo}>
                <Text style={{ color: '#4285f4', fontWeight: '700', fontSize: 14 }}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.googleTitle}>{s.business.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name="star" size={11} color="#fbbf24" />
                  ))}
                  <Text style={styles.googleRating}>4.9 · 247 reviews</Text>
                </View>
              </View>
            </View>
            <Text style={styles.googleHint}>Reviews help small businesses thrive. It only takes 30 seconds.</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={goToGoogle}>
            <Ionicons name="logo-google" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Post review on Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => { submitReview(req!.id, rating); setStep('done'); }}>
            <Text style={styles.skipText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'feedback' && (
        <View style={styles.content}>
          <View style={[styles.successIconLight, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#d97706" />
          </View>
          <Text style={styles.bigTitle}>We'd like to make it right.</Text>
          <Text style={styles.bigSub}>Your feedback goes directly to the owner — not posted publicly. They'll personally follow up.</Text>

          <Text style={styles.fieldLabelLight}>What went wrong?</Text>
          <View style={styles.tagRow}>
            {FEEDBACK_TAGS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tag, tags.includes(t) && styles.tagActive]}
                onPress={() => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
              >
                <Text style={[styles.tagText, tags.includes(t) && styles.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabelLight}>Tell us more (optional)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="What could we have done better?"
            placeholderTextColor="#a3a3a3"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={submitFeedback}>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Send to owner</Text>
          </TouchableOpacity>

          <View style={styles.privateNote}>
            <Ionicons name="lock-closed" size={12} color="#737373" />
            <Text style={styles.privateNoteText}>This feedback is private and only seen by management.</Text>
          </View>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.content}>
          <View style={[styles.successIconLight, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="checkmark" size={36} color="#16a34a" />
          </View>
          <Text style={styles.bigTitle}>You're all set!</Text>
          <Text style={styles.bigSub}>Thank you for taking the time. {rating >= 4 ? "We're so glad you had a great experience." : "We'll be in touch shortly to make things right."}</Text>

          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/')}>
            <Text style={styles.outlineBtnText}>Back to {s.business.name}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by ReviewBoost</Text>
        <Text style={styles.footerSub}>Reply STOP to opt out of SMS</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  brandHeader: { paddingTop: 60, paddingBottom: 20, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  logoCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.mint, justifyContent: 'center', alignItems: 'center' },
  brandName: { color: '#0a0a0a', fontSize: 18, fontWeight: '700', marginTop: 10 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#dcfce7', borderRadius: 99 },
  secureText: { color: '#15803d', fontSize: 10, fontWeight: '600' },

  content: { padding: 24, alignItems: 'center' },
  greeting: { color: '#737373', fontSize: 15, fontWeight: '500' },
  title: { color: '#0a0a0a', fontSize: 30, fontWeight: '700', textAlign: 'center', letterSpacing: -0.8, marginTop: 6 },
  sub: { color: '#525252', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 400 },

  starRow: { flexDirection: 'row', gap: 6, marginTop: 36 },
  starBtn: { padding: 4 },
  tapHint: { color: '#a3a3a3', fontSize: 12, marginTop: 12 },

  trustRow: { flexDirection: 'row', gap: 20, marginTop: 32 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { color: '#737373', fontSize: 12 },

  successIconLight: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fef9c3', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  bigTitle: { color: '#0a0a0a', fontSize: 28, fontWeight: '700', textAlign: 'center', letterSpacing: -0.8, marginTop: 20 },
  bigSub: { color: '#525252', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 400 },

  googleCard: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', padding: 16, borderRadius: 12, marginTop: 24 },
  googleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  googleLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  googleTitle: { color: '#0a0a0a', fontSize: 14, fontWeight: '600' },
  googleRating: { color: '#737373', fontSize: 11, marginLeft: 4 },
  googleHint: { color: '#737373', fontSize: 12, marginTop: 12, lineHeight: 17 },

  primaryBtn: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#0a0a0a', height: 54, borderRadius: 12, marginTop: 24 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  skipBtn: { padding: 14, marginTop: 4 },
  skipText: { color: '#737373', fontSize: 13, fontWeight: '500' },
  outlineBtn: { width: '100%', height: 54, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, marginTop: 24 },
  outlineBtnText: { color: '#0a0a0a', fontWeight: '600' },

  fieldLabelLight: { width: '100%', color: '#737373', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 24, marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  tag: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: '#d4d4d4', backgroundColor: '#fff' },
  tagActive: { borderColor: '#0a0a0a', backgroundColor: '#0a0a0a' },
  tagText: { color: '#525252', fontSize: 12, fontWeight: '500' },
  tagTextActive: { color: '#fff' },
  textarea: { width: '100%', minHeight: 110, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, padding: 14, fontSize: 14, color: '#0a0a0a' },

  privateNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  privateNoteText: { color: '#737373', fontSize: 11 },

  footer: { paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  footerText: { color: '#a3a3a3', fontSize: 12, fontWeight: '500' },
  footerSub: { color: '#a3a3a3', fontSize: 11, marginTop: 4 },
});
