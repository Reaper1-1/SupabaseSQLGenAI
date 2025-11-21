import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";

interface ProgressRingProps {
  progress: number;
  size?: number;
  label?: string;
}

export function ProgressRing({ progress, size = 80, label }: ProgressRingProps) {
  const { theme } = useTheme();
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: theme.backgroundSecondary,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: size,
              height: (normalizedProgress / 100) * size,
              borderRadius: size / 2,
            },
            { backgroundColor: theme.primary },
          ]}
        />
      </View>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.progressText}>{Math.round(normalizedProgress)}</ThemedText>
        {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  progressFill: {
    width: "100%",
  },
  labelContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    fontSize: 10,
    opacity: 0.7,
  },
});
