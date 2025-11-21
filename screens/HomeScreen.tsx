import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { StatCard } from "@/components/StatCard";
import { ChecklistItem } from "@/components/ChecklistItem";
import { ProgressRing } from "@/components/ProgressRing";
import Spacer from "@/components/Spacer";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export default function HomeScreen() {
  const { theme } = useTheme();
  const [completedItems, setCompletedItems] = useState({
    devotional: false,
    study: false,
    journal: false,
    challenge: false,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const toggleItem = (key: keyof typeof completedItems) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
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
            <StatCard icon="clock" title="Prayer" value="45 min" />
            <Spacer height={Spacing.md} />
            <StatCard icon="book" title="Verses" value="3" />
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
        <StatCard icon="zap" title="Current Streak" value="12 days" subtitle="Keep the momentum" />
        <Spacer height={Spacing.md} />
        <StatCard icon="award" title="This Week" value="5/7 days" subtitle="Almost perfect" />
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
