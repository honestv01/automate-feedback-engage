import { useRouter } from 'expo-router';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './lib/theme';
import { useStore } from './lib/store';

const { width } = Dimensions.get('window');
const isWide = width >= 900;

export default function Landing() {
  const router = useRouter();
  const s = useStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Top Nav */}
      <View style={styles.nav}>
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Ionicons name="star" size={18} color={theme.bg} />
          </View>
          <Text style={styles.brandText}>ReviewBoost</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/employee/send')}>
            <Text style={styles.navBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>Live • Trusted by 2,400+ service businesses</Text>
        </View>
        <Text style={styles.heroTitle}>
          Get more 5-star{'\n'}
          <Text style={{ color: theme.mint }}>Google reviews</Text> on autopilot.
        </Text>
        <Text style={styles.heroSub}>
          Field employees send a review request in 5 seconds. We route happy customers to Google and unhappy ones privately to you — before they post publicly.
        </Text>

        <View style={[styles.ctaRow, isWide && { flexDirection: 'row' }]}>
          <TouchableOpacity style={styles.primaryCta} onPress={() => router.push('/owner/dashboard')}>
            <Ionicons name="speedometer" size={18} color={theme.bg} />
            <Text style={styles.primaryCtaText}>Open Owner Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryCta} onPress={() => router.push('/employee/send')}>
            <Ionicons name="phone-portrait-outline" size={18} color={theme.text} />
            <Text style={styles.secondaryCtaText}>Try Field App</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsStrip, isWide && { flexDirection: 'row' }]}>
          <StatBlock label="Avg. review increase" value="+312%" tint={theme.mint} />
          <StatBlock label="Reviews sent" value="184,392" tint={theme.lavender} />
          <StatBlock label="Click-through rate" value="68.4%" tint={theme.peach} />
          <StatBlock label="Setup time" value="< 5 min" tint={theme.pink} />
        </View>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>Three steps from job done to review live.</Text>
        <View style={[styles.steps, isWide && { flexDirection: 'row' }]}>
          <Step n="01" tint={theme.mint} icon="send" title="Employee sends" body="Enter name + phone after the job. SMS goes out instantly with a unique tracked link." />
          <Step n="02" tint={theme.lavender} icon="star" title="Customer rates" body="Branded mobile page loads in under 2 seconds with a 5-star rating prompt." />
          <Step n="03" tint={theme.peach} icon="git-branch" title="Smart routing" body="4–5 stars route to Google. 1–3 stars flow privately to the owner inbox." />
        </View>
      </View>

      {/* Role chooser */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>OPEN THE APP</Text>
        <Text style={styles.sectionTitle}>Pick a workspace to explore.</Text>

        <View style={[styles.roleGrid, isWide && { flexDirection: 'row' }]}>
          <RoleCard
            tint={theme.mint}
            icon="phone-portrait"
            title="Field App"
            subtitle="For technicians"
            bullets={['Send SMS in 5 seconds', 'See your last 10 requests', 'Track your rating']}
            cta="Open Field App"
            onPress={() => router.push('/employee/send')}
          />
          <RoleCard
            tint={theme.lavender}
            icon="bar-chart"
            title="Owner Dashboard"
            subtitle="For business owners"
            bullets={['Realtime analytics', 'Private feedback inbox', 'Team leaderboard']}
            cta="Open Dashboard"
            onPress={() => router.push('/owner/dashboard')}
          />
          <RoleCard
            tint={theme.peach}
            icon="globe"
            title="Customer Page"
            subtitle="Preview the rating page"
            bullets={['1–5 star interface', 'Branded for your business', 'Smart routing built in']}
            cta="Preview Review Page"
            onPress={() => {
              const r = s.requests[0];
              router.push(r ? `/review/${r.id}` : '/review/demo');
            }}
          />
        </View>

      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PRICING</Text>
        <Text style={styles.sectionTitle}>Simple plans that scale with your team.</Text>
        <View style={[styles.pricing, isWide && { flexDirection: 'row' }]}>
          <PriceCard name="Solo" price="$29" seats="1 user" features={['Unlimited SMS requests', '24-hour reminders', 'Private feedback inbox', 'Google routing']} active={s.business.plan === 'solo'} />
          <PriceCard name="Small Team" price="$49" seats="2–5 users" features={['Everything in Solo', 'Employee leaderboard', 'Per-employee analytics', 'CSV export']} highlight active={s.business.plan === 'team'} />
          <PriceCard name="Growth" price="$99" seats="6–15 users" features={['Everything in Team', 'Priority SMS delivery', 'Custom branding', 'Email + push alerts']} active={s.business.plan === 'growth'} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>ReviewBoost</Text>
        <Text style={styles.footerText}>The review automation platform for local home service businesses.</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Product</Text>
          <Text style={styles.footerLink}>Pricing</Text>
          <Text style={styles.footerLink}>Support</Text>
          <Text style={styles.footerLink}>Privacy</Text>
          <Text style={styles.footerLink}>Terms</Text>
        </View>
        <Text style={styles.footerCopy}>© 2026 ReviewBoost. SMS provided via Twilio. STOP to opt out.</Text>
      </View>
    </ScrollView>
  );
}

function StatBlock({ label, value, tint }: any) {
  return (
    <View style={styles.statBlock}>
      <View style={[styles.statDot, { backgroundColor: tint }]} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function Step({ n, tint, icon, title, body }: any) {
  return (
    <View style={styles.stepCard}>
      <View style={[styles.stepIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={22} color={theme.bg} />
      </View>
      <Text style={styles.stepN}>{n}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepBody}>{body}</Text>
    </View>
  );
}

function RoleCard({ tint, icon, title, subtitle, bullets, cta, onPress }: any) {
  return (
    <TouchableOpacity style={styles.roleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.roleIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={24} color={theme.bg} />
      </View>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleSubtitle}>{subtitle}</Text>
      <View style={{ gap: 8, marginVertical: 16 }}>
        {bullets.map((b: string) => (
          <View key={b} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={16} color={tint} />
            <Text style={styles.roleBullet}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.roleCta, { borderColor: tint }]}>
        <Text style={[styles.roleCtaText, { color: tint }]}>{cta}</Text>
        <Ionicons name="arrow-forward" size={16} color={tint} />
      </View>
    </TouchableOpacity>
  );
}

function PriceCard({ name, price, seats, features, highlight, active }: any) {
  return (
    <View style={[styles.priceCard, highlight && styles.priceCardHighlight]}>
      {highlight && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      <Text style={[styles.priceName, highlight && { color: theme.bg }]}>{name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 8 }}>
        <Text style={[styles.priceAmount, highlight && { color: theme.bg }]}>{price}</Text>
        <Text style={[styles.priceMonth, highlight && { color: theme.bg }]}>/month</Text>
      </View>
      <Text style={[styles.priceSeats, highlight && { color: theme.bg }]}>{seats}</Text>
      <View style={{ height: 1, backgroundColor: highlight ? 'rgba(0,0,0,0.1)' : theme.border, marginVertical: 16 }} />
      <View style={{ gap: 10 }}>
        {features.map((f: string) => (
          <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="checkmark" size={16} color={highlight ? theme.bg : theme.mint} />
            <Text style={[styles.priceFeature, highlight && { color: theme.bg }]}>{f}</Text>
          </View>
        ))}
      </View>
      {active && (
        <View style={[styles.activePill, { backgroundColor: highlight ? theme.bg : theme.mint }]}>
          <Text style={{ color: highlight ? theme.mint : theme.bg, fontSize: 11, fontWeight: '700' }}>YOUR CURRENT PLAN</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.mint, justifyContent: 'center', alignItems: 'center' },
  brandText: { color: theme.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  navBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  navBtnText: { color: theme.text, fontWeight: '600', fontSize: 13 },

  hero: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, marginBottom: 24 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.success },
  badgeText: { color: theme.textMuted, fontSize: 12, fontWeight: '500' },
  heroTitle: { color: theme.text, fontSize: 44, fontWeight: '800', lineHeight: 50, letterSpacing: -1.5 },
  heroSub: { color: theme.textMuted, fontSize: 16, lineHeight: 24, marginTop: 16, maxWidth: 600 },
  ctaRow: { gap: 12, marginTop: 28 },
  primaryCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.mint, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10 },
  primaryCtaText: { color: theme.bg, fontWeight: '700', fontSize: 15 },
  secondaryCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10 },
  secondaryCtaText: { color: theme.text, fontWeight: '600', fontSize: 15 },

  statsStrip: { gap: 12, marginTop: 36 },
  statBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, borderRadius: 12 },
  statDot: { width: 32, height: 32, borderRadius: 8 },
  statValue: { color: theme.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: theme.textMuted, fontSize: 11, marginTop: 2 },

  section: { paddingHorizontal: 24, paddingTop: 48 },
  sectionLabel: { color: theme.mint, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  sectionTitle: { color: theme.text, fontSize: 30, fontWeight: '700', marginTop: 8, letterSpacing: -0.8, maxWidth: 600 },

  steps: { gap: 16, marginTop: 28 },
  stepCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 24, borderRadius: 16 },
  stepIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stepN: { color: theme.textDim, fontSize: 12, fontWeight: '700', marginTop: 16, letterSpacing: 1 },
  stepTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  stepBody: { color: theme.textMuted, fontSize: 14, lineHeight: 20, marginTop: 8 },

  roleGrid: { gap: 16, marginTop: 28 },
  roleCard: { flex: 1, backgroundColor: theme.cardLight, padding: 24, borderRadius: 16 },
  roleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  roleTitle: { color: theme.bg, fontSize: 22, fontWeight: '700', marginTop: 16 },
  roleSubtitle: { color: theme.textDim, fontSize: 13, marginTop: 2 },
  roleBullet: { color: theme.bg, fontSize: 14 },
  roleCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  roleCtaText: { fontWeight: '700', fontSize: 14 },

  pricing: { gap: 16, marginTop: 28 },
  priceCard: { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 24, borderRadius: 16, position: 'relative' },
  priceCardHighlight: { backgroundColor: theme.mint, borderColor: theme.mint },
  priceBadge: { position: 'absolute', top: -10, left: 24, backgroundColor: theme.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  priceBadgeText: { color: theme.mint, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  priceName: { color: theme.text, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  priceAmount: { color: theme.text, fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  priceMonth: { color: theme.textMuted, fontSize: 14, marginBottom: 6 },
  priceSeats: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  priceFeature: { color: theme.text, fontSize: 14 },
  activePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, marginTop: 16 },

  footer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, borderTopWidth: 1, borderTopColor: theme.border, marginTop: 60 },
  footerBrand: { color: theme.text, fontSize: 22, fontWeight: '700' },
  footerText: { color: theme.textMuted, fontSize: 14, marginTop: 8, maxWidth: 500 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 24 },
  footerLink: { color: theme.textMuted, fontSize: 13, fontWeight: '500' },
  footerCopy: { color: theme.textDim, fontSize: 12, marginTop: 32 },
});
