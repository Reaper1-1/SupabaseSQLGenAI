// Example component demonstrating how to use the enhanced Agent Router client
// This shows how to build a simple chat interface with any of the 11 coaches

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { AgentId, callAgentRouter } from "@/lib/agentRouterClient";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AgentChatExampleProps {
  agentId: AgentId;
  title?: string;
}

export const AgentChatExample: React.FC<AgentChatExampleProps> = ({ agentId, title }) => {
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await callAgentRouter({
        agent_id: agentId,
        message: input.trim(),
        // Optional: attach context & metadata
        context: { 
          timestamp: new Date().toISOString(),
          screen: "AgentChatExample" 
        },
        metadata: { 
          source: "mobile",
          version: "1.1.0"
        },
      });

      setReply(res.reply);
      setInput("");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
      )}

      <View style={styles.agentInfo}>
        <ThemedText style={styles.agentLabel}>
          Talking to: {agentId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </ThemedText>
      </View>

      {reply && (
        <View
          style={[
            styles.replyBox,
            { backgroundColor: theme.backgroundSecondary }
          ]}
        >
          <ThemedText style={styles.replyText}>{reply}</ThemedText>
        </View>
      )}

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}

      <View
        style={[
          styles.inputContainer,
          { 
            backgroundColor: theme.backgroundElevated,
            borderColor: theme.border 
          }
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Type your message..."
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !input.trim()}
          style={[
            styles.sendButton,
            { opacity: loading || !input.trim() ? 0.5 : 1 }
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText style={[styles.sendButtonText, { color: theme.primary }]}>
              Send
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  agentInfo: {
    marginBottom: Spacing.md,
  },
  agentLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  replyBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "red",
    marginBottom: Spacing.sm,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sendButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});