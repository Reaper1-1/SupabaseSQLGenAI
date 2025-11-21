import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AgentCardProps {
  name: string;
  icon: keyof typeof Feather.glyphMap;
  selected?: boolean;
  onPress?: () => void;
}

export function AgentCard({ name, icon, selected = false, onPress }: AgentCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundSecondary,
          borderRadius: BorderRadius.sm,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather
        name={icon}
        size={24}
        color={selected ? "#FFFFFF" : theme.primary}
        style={styles.icon}
      />
      <ThemedText
        style={[
          styles.label,
          selected && { color: "#FFFFFF" },
        ]}
      >
        {name}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    minWidth: 90,
  },
  icon: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
