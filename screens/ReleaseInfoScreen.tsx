import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Build information
const BUILD_DATE = '2025-11-24';
const VERSION = '1.2.0';
const BUILD_NUMBER = '42';
const AGENT_ROUTER_VERSION = 'v1.0.0-base44';

export default function ReleaseInfoScreen() {
  const { colors } = useTheme();

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: keyof typeof Feather.glyphMap }) => (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        {icon && <Feather name={icon} size={18} color={colors.secondary} />}
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );

  const LinkButton = ({ label, url, icon }: { label: string; url: string; icon: keyof typeof Feather.glyphMap }) => (
    <Pressable 
      style={[styles.linkButton, { backgroundColor: colors.elevation1 }]}
      onPress={() => Linking.openURL(url)}
    >
      <Feather name={icon} size={20} color={colors.secondary} />
      <ThemedText style={[styles.linkText, { color: colors.secondary }]}>{label}</ThemedText>
      <Feather name="external-link" size={16} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        {/* Version Card */}
        <View style={[styles.card, { backgroundColor: colors.elevation1 }]}>
          <View style={styles.cardHeader}>
            <Feather name="package" size={24} color={colors.secondary} />
            <ThemedText style={styles.cardTitle}>Version Information</ThemedText>
          </View>
          
          <InfoRow label="App Version" value={VERSION} icon="tag" />
          <InfoRow label="Build Number" value={BUILD_NUMBER} icon="hash" />
          <InfoRow label="Build Date" value={BUILD_DATE} icon="calendar" />
          <InfoRow label="Agent Router" value={AGENT_ROUTER_VERSION} icon="cpu" />
        </View>

        {/* Environment Card */}
        <View style={[styles.card, { backgroundColor: colors.elevation1 }]}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={24} color={colors.secondary} />
            <ThemedText style={styles.cardTitle}>Environment</ThemedText>
          </View>
          
          <InfoRow 
            label="Expo SDK" 
            value={Constants.expoConfig?.sdkVersion || 'Unknown'} 
            icon="layers" 
          />
          <InfoRow 
            label="Supabase" 
            value={process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Connected' : 'Mock Mode'} 
            icon="database" 
          />
          <InfoRow 
            label="Base44 AI" 
            value={process.env.EXPO_PUBLIC_BASE44_ENABLED === 'true' ? 'Enabled' : 'Mock Mode'} 
            icon="zap" 
          />
          <InfoRow 
            label="Environment" 
            value={__DEV__ ? 'Development' : 'Production'} 
            icon="code" 
          />
        </View>

        {/* Features Card */}
        <View style={[styles.card, { backgroundColor: colors.elevation1 }]}>
          <View style={styles.cardHeader}>
            <Feather name="star" size={24} color={colors.secondary} />
            <ThemedText style={styles.cardTitle}>Active Features</ThemedText>
          </View>
          
          <View style={styles.featureGrid}>
            <FeatureBadge label="11 AI Agents" active={true} />
            <FeatureBadge label="TypeScript" active={true} />
            <FeatureBadge label="Entity Memory" active={true} />
            <FeatureBadge label="Agent Router" active={true} />
            <FeatureBadge label="Progress Tracking" active={true} />
            <FeatureBadge label="Daily Workflows" active={true} />
          </View>
        </View>

        {/* Links Card */}
        <View style={[styles.card, { backgroundColor: colors.elevation1 }]}>
          <View style={styles.cardHeader}>
            <Feather name="link" size={24} color={colors.secondary} />
            <ThemedText style={styles.cardTitle}>Resources</ThemedText>
          </View>
          
          <LinkButton 
            label="Privacy Policy" 
            url="https://betterman.app/privacy"
            icon="shield"
          />
          <LinkButton 
            label="Terms of Service" 
            url="https://betterman.app/terms"
            icon="file-text"
          />
          <LinkButton 
            label="Support" 
            url="https://betterman.app/support"
            icon="help-circle"
          />
        </View>

        {/* About Card */}
        <View style={[styles.card, { backgroundColor: colors.elevation1 }]}>
          <View style={styles.cardHeader}>
            <Feather name="info" size={24} color={colors.secondary} />
            <ThemedText style={styles.cardTitle}>About</ThemedText>
          </View>
          
          <ThemedText style={styles.aboutText}>
            The Better Man Project is a faith-based personal development platform designed to help men grow spiritually, emotionally, and mentally through AI-powered coaching, daily devotionals, and progress tracking.
          </ThemedText>
          
          <ThemedText style={[styles.aboutText, styles.copyrightText]}>
            © 2025 Better Man Project. All rights reserved.
          </ThemedText>
        </View>
      </View>
    </ScreenScrollView>
  );
}

const FeatureBadge = ({ label, active }: { label: string; active: boolean }) => {
  const { colors } = useTheme();
  return (
    <View style={[
      styles.featureBadge, 
      { backgroundColor: active ? colors.secondary + '20' : colors.elevation2 }
    ]}>
      <Feather 
        name={active ? "check-circle" : "circle"} 
        size={14} 
        color={active ? colors.secondary : colors.textSecondary} 
      />
      <ThemedText style={[
        styles.featureText,
        { color: active ? colors.secondary : colors.textSecondary }
      ]}>
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  card: {
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: Spacing.sm,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  linkText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 14,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: Spacing.md,
  },
  copyrightText: {
    marginTop: Spacing.sm,
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 0,
  },
});