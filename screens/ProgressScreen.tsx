import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import Spacer from "@/components/Spacer";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export default function ProgressScreen() {
  const { theme } = useTheme();

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Your Progress</ThemedText>
        <ThemedText style={styles.subtitle}>Track your spiritual journey</ThemedText>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Streaks & Achievements</ThemedText>
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <Feather name="zap" size={32} />
            <ThemedText style={styles.streakNumber}>12</ThemedText>
            <ThemedText style={styles.streakLabel}>Day Streak</ThemedText>
          </View>
          <View style={styles.streakCard}>
            <Feather name="star" size={32} />
            <ThemedText style={styles.streakNumber}>48</ThemedText>
            <ThemedText style={styles.streakLabel}>Total Days</ThemedText>
          </View>
          <View style={styles.streakCard}>
            <Feather name="award" size={32} />
            <ThemedText style={styles.streakNumber}>7</ThemedText>
            <ThemedText style={styles.streakLabel}>Badges</ThemedText>
          </View>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Weekly Overview</ThemedText>
        <View style={styles.statsGrid}>
          <StatCard icon="check-circle" title="Completed" value="5/7" subtitle="days" />
          <Spacer height={Spacing.md} />
          <StatCard icon="clock" title="Total Prayer" value="285 min" subtitle="this week" />
          <Spacer height={Spacing.md} />
          <StatCard icon="book" title="Verses Read" value="21" subtitle="this week" />
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Personal Stats</ThemedText>
        <View
          style={[
            styles.statsCard,
            { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.sm },
          ]}
        >
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Total Journals</ThemedText>
            <ThemedText style={styles.statValue}>27</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Coach Conversations</ThemedText>
            <ThemedText style={styles.statValue}>143</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Days Active</ThemedText>
            <ThemedText style={styles.statValue}>48</ThemedText>
          </View>
        </View>
      </View>

      <Spacer height={Spacing.xl} />
    </ScreenScrollView>
  );
}

import { Feather } from "@expo/vector-icons";

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  streakCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: "transparent",
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    gap: 0,
  },
  statsCard: {
    padding: Spacing.lg,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  statDivider: {
    height: 1,
    opacity: 0.1,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
