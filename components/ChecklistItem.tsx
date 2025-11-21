import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ChecklistItemProps {
  label: string;
  completed: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ label, completed, onToggle }: ChecklistItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: completed ? theme.success : "transparent",
            borderColor: completed ? theme.success : theme.textSecondary,
          },
        ]}
      >
        {completed ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
      </View>
      <ThemedText style={[styles.label, completed && styles.labelCompleted]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  labelCompleted: {
    opacity: 0.6,
  },
});
