import React, { useState } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AgentCard } from "@/components/AgentCard";
import { ChatBubble } from "@/components/ChatBubble";
import Spacer from "@/components/Spacer";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
}

const AGENTS = [
  { id: "breakup", name: "Breakup Coach", icon: "heart" as const },
  { id: "journal", name: "Journal Coach", icon: "edit" as const },
  { id: "prayer", name: "Prayer Coach", icon: "smile" as const },
  { id: "habits", name: "Habits Coach", icon: "check-circle" as const },
];

export default function AgentsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedAgent, setSelectedAgent] = useState("breakup");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      message: "Hey there. I'm here to help you navigate this. What's on your mind?",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: input,
        isUser: true,
      };
      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message:
            "That's a powerful thought. Let's explore this together. What do you think the first step should be?",
          isUser: false,
        };
        setMessages((prev) => [...prev, response]);
      }, 500);

      setInput("");
    }
  };

  const agentName =
    AGENTS.find((a) => a.id === selectedAgent)?.name || "Coach";

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Select Your Coach</ThemedText>
        <FlatList
          data={AGENTS}
          renderItem={({ item }) => (
            <AgentCard
              name={item.name}
              icon={item.icon}
              selected={selectedAgent === item.id}
              onPress={() => setSelectedAgent(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          numColumns={4}
          columnWrapperStyle={styles.agentGrid}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.chatHeader}>
        <ThemedText style={styles.agentName}>{agentName}</ThemedText>
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item.message} isUser={item.isUser} />}
        keyExtractor={(item) => item.id}
        inverted
        style={styles.messageList}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: theme.backgroundSecondary, borderRadius: BorderRadius.full },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Share what's on your heart..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="send" size={20} color={theme.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  agentGrid: {
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginVertical: Spacing.md,
  },
  chatHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "600",
  },
  messageList: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    marginRight: Spacing.md,
  },
  sendButton: {
    padding: Spacing.sm,
  },
});
