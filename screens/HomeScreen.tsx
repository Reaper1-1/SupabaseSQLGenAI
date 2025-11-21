import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { StatCard } from "@/components/StatCard";
import { ChecklistItem } from "@/components/ChecklistItem";
import { ProgressRing } from "@/components/ProgressRing";
import Spacer from "@/components/Spacer";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import api from "@/lib/api";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [completedItems, setCompletedItems] = useState({
    devotional: false,
    study: false,
    journal: false,
    challenge: false,
  });
  const [prayerMinutes, setPrayerMinutes] = useState(0);
  const [versesRead, setVersesRead] = useState(0);
  const [stats, setStats] = useState({ currentStreak: 0, totalDays: 0 });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Load daily workflow on mount
  useEffect(() => {
    loadDailyData();
  }, []);

  const loadDailyData = async () => {
    const workflow = await api.getDailyWorkflow();
    if (workflow) {
      setCompletedItems({
        devotional: workflow.devotional_completed,
        study: workflow.study_completed,
        journal: workflow.journal_completed,
        challenge: workflow.challenge_completed,
      });
      setPrayerMinutes(workflow.prayer_minutes || 0);
      setVersesRead(workflow.verses_read || 0);
    }
    
    const progressStats = await api.getProgressStats();
    setStats({
      currentStreak: progressStats.currentStreak || 0,
      totalDays: progressStats.totalDays || 0
    });
  };

  const toggleItem = async (key: keyof typeof completedItems) => {
    const newValue = !completedItems[key];
    setCompletedItems((prev) => ({ ...prev, [key]: newValue }));
    
    // Update in database
    const updates = { [`${key}_completed`]: newValue };
    await api.updateDailyWorkflow(updates);
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText style={styles.greeting}>{greeting}, Brother</ThemedText>
        <ThemedText style={styles.subtitle}>
          You were made for more. Today is your opportunity to rise.
        </ThemedText>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Daily Progress</ThemedText>
        <View style={styles.progressContainer}>
          <View style={styles.ringContainer}>
            <ProgressRing progress={(completedCount / 4) * 100} size={100} label="Tasks" />
          </View>
          <View style={styles.statsColumn}>
            <StatCard icon="clock" title="Prayer" value={`${prayerMinutes} min`} />
            <Spacer height={Spacing.md} />
            <StatCard icon="book" title="Verses" value={versesRead.toString()} />
          </View>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Today's Checklist</ThemedText>
        <View
          style={[
            styles.checklistCard,
            { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.sm },
          ]}
        >
          <ChecklistItem
            label="Complete Devotional"
            completed={completedItems.devotional}
            onToggle={() => toggleItem("devotional")}
          />
          <ChecklistItem
            label="Bible Study"
            completed={completedItems.study}
            onToggle={() => toggleItem("study")}
          />
          <ChecklistItem
            label="Journal Entry"
            completed={completedItems.journal}
            onToggle={() => toggleItem("journal")}
          />
          <ChecklistItem
            label="Daily Challenge"
            completed={completedItems.challenge}
            onToggle={() => toggleItem("challenge")}
          />
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Insights</ThemedText>
        <StatCard icon="zap" title="Current Streak" value={`${stats.currentStreak} days`} subtitle="Keep the momentum" />
        <Spacer height={Spacing.md} />
        <StatCard icon="award" title="Total Days" value={`${stats.totalDays} days`} subtitle="On your journey" />
      </View>

      <Spacer height={Spacing.xl} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  ringContainer: {
    flex: 0,
  },
  statsColumn: {
    flex: 1,
    justifyContent: "center",
  },
  checklistCard: {
    paddingHorizontal: Spacing.lg,
  },
});
