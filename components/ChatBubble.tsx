import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.primary : theme.backgroundSecondary,
            borderRadius: BorderRadius.md,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.message,
            isUser && { color: "#FFFFFF" },
          ]}
        >
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  message: {
    fontSize: 16,
  },
});
