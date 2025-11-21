import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AgentCard } from "@/components/AgentCard";
import { ChatBubble } from "@/components/ChatBubble";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load initial message when agent changes
  useEffect(() => {
    const loadHistory = async () => {
      const history = await api.getConversationHistory(selectedAgent);
      if (history.length === 0) {
        // Add welcome message for new conversation
        const welcomeMessages = {
          breakup: "Hey brother. I know you're going through something heavy. I'm here to help you process this and come out stronger. What's weighing on you today?",
          journal: "Welcome. This is your space to explore what's really going on beneath the surface. What thoughts have been circling in your mind?",
          prayer: "I'm glad you're here. Whether you're new to prayer or been doing it for years, God's ready to listen. What's on your heart?",
          habits: "Ready to build the life you want? Small changes, done consistently, create massive results. What habit are you working on?"
        };
        
        setMessages([{
          id: "welcome",
          message: welcomeMessages[selectedAgent as keyof typeof welcomeMessages] || "How can I help you today?",
          isUser: false
        }]);
      } else {
        // Convert history to chat messages
        const chatMessages = history.map((msg: any, index: number) => ({
          id: msg.id || index.toString(),
          message: msg.content,
          isUser: msg.role === 'user'
        }));
        setMessages(chatMessages);
      }
    };
    
    loadHistory();
  }, [selectedAgent]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: input,
        isUser: true,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await api.sendChatMessage(selectedAgent, input);
        const responseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response,
          isUser: false,
        };
        setMessages((prev) => [...prev, responseMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: "I'm having trouble connecting right now, but I'm still here. Try sharing again in a moment.",
          isUser: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const agentName =
    AGENTS.find((a) => a.id === selectedAgent)?.name || "Coach";

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Select Your Coach</ThemedText>
        <View style={styles.agentGrid}>
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              name={agent.name}
              icon={agent.icon}
              selected={selectedAgent === agent.id}
              onPress={() => setSelectedAgent(agent.id)}
            />
          ))}
        </View>
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
