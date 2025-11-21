import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ChecklistItem } from "@/components/ChecklistItem";
import Spacer from "@/components/Spacer";
import { Button } from "@/components/Button";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export default function DevotionalScreen() {
  const { theme } = useTheme();
  const [completed, setCompleted] = useState({
    devotional: false,
    study: false,
    journal: false,
    challenge: false,
  });

  const toggleItem = (key: keyof typeof completed) => {
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText style={styles.date}>December 19, 2024</ThemedText>
        <ThemedText style={styles.title}>Today's Devotional</ThemedText>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.section}>
        <View
          style={[
            styles.devotionalCard,
            { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.sm },
          ]}
        >
          <ThemedText style={styles.verse}>"For God has not given us a spirit of fear, but of power and of love and of a sound mind." — 2 Timothy 1:7</ThemedText>
          <Spacer height={Spacing.lg} />
          <ThemedText style={styles.devotionalText}>
            Fear paralyzes. It whispers lies. It tells you that you're not enough, that you can't change, that your past defines your future. But God didn't call you to live in fear.
          </ThemedText>
          <Spacer height={Spacing.md} />
          <ThemedText style={styles.devotionalText}>
            You have been given power. The same power that raised Christ from the dead lives in you. You have been given love—unconditional, relentless, transformative love. And you have a sound mind—the ability to choose your thoughts, your actions, your direction.
          </ThemedText>
          <Spacer height={Spacing.md} />
          <ThemedText style={styles.devotionalText}>
            Today, when fear comes knocking, remember who you are. You are a son of God. You are not defined by your mistakes. You are defined by your willingness to rise.
          </ThemedText>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mark Your Progress</ThemedText>
        <View
          style={[
            styles.checklistCard,
            { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.sm },
          ]}
        >
          <ChecklistItem
            label="Read devotional"
            completed={completed.devotional}
            onToggle={() => toggleItem("devotional")}
          />
          <ChecklistItem
            label="Pray about it"
            completed={completed.study}
            onToggle={() => toggleItem("study")}
          />
          <ChecklistItem
            label="Journal reflections"
            completed={completed.journal}
            onToggle={() => toggleItem("journal")}
          />
          <ChecklistItem
            label="Take one action today"
            completed={completed.challenge}
            onToggle={() => toggleItem("challenge")}
          />
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <Button onPress={() => {}}>Next Devotional</Button>
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
  date: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  devotionalCard: {
    padding: Spacing.lg,
  },
  verse: {
    fontSize: 18,
    fontWeight: "700",
    fontStyle: "italic",
  },
  devotionalText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
  },
  checklistCard: {
    paddingHorizontal: Spacing.lg,
  },
});
