import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  value: string | number;
  subtitle?: string;
  onPress?: () => void;
}

export function StatCard({ icon, title, value, subtitle, onPress }: StatCardProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.sm },
      ]}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon} size={24} color={theme.primary} />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.value}>{value}</ThemedText>
        {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
});
