import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AgentCard } from "@/components/AgentCard";
import { ChatBubble } from "@/components/ChatBubble";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { callAgentRouter } from "@/lib/agentRouterClient";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
}

const AGENTS = [
  { id: "devotional_guide", name: "Devotional Coach", icon: "book-open" as const },
  { id: "journal_coach", name: "Journal Coach", icon: "edit-3" as const },
  { id: "breakup_coach", name: "Breakup Coach", icon: "heart" as const },
  { id: "habits_coach", name: "Habits Coach", icon: "check-circle" as const },
  { id: "breakthrough_coach", name: "Breakthrough Coach", icon: "zap" as const },
  { id: "bible_study_agent", name: "Bible Study", icon: "book" as const },
  { id: "prayer_coach", name: "Prayer Coach", icon: "sun" as const },
  { id: "leadership_mentor", name: "Leadership", icon: "users" as const },
  { id: "emotional_intelligence_coach", name: "Emotional IQ", icon: "smile" as const },
  { id: "workflow_meta_agent", name: "Workflow", icon: "layers" as const },
  { id: "builder_handoff_agent", name: "Builder", icon: "code" as const },
];

export default function AgentsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedAgent, setSelectedAgent] = useState("devotional_guide");
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
          devotional_guide: "Welcome to your daily walk with Scripture. I'm here to help you dive deeper into God's Word and apply timeless truth to modern struggles. What passage or theme would you like to explore today?",
          journal_coach: "Welcome. This is your space to explore what's really going on beneath the surface. What thoughts have been circling in your mind?",
          breakup_coach: "Hey brother. I know you're going through something heavy. I'm here to help you process this and come out stronger. What's weighing on you today?",
          habits_coach: "Ready to build the life you want? Small changes, done consistently, create massive results. What habit are you working on?",
          breakthrough_coach: "I'm here to help you confront what you've been avoiding and find freedom. Every stronghold can fall with truth and action. What battle are you facing today?",
          bible_study_agent: "Let's dig into Scripture together. I can help with context, cross-references, and practical application. What passage or topic would you like to study?",
          prayer_coach: "I'm glad you're here. Whether you're new to prayer or been doing it for years, God's ready to listen. What's on your heart?",
          leadership_mentor: "Leadership starts with leading yourself well. I'm here to help you develop the courage and integrity to influence others. What leadership challenge are you facing?",
          emotional_intelligence_coach: "Many men never learned the language of emotions. I'm here to help you understand and express what you feel in healthy ways. What emotions are present for you right now?",
          workflow_meta_agent: "I analyze your situation and recommend which coaches and routines will serve you best. Tell me about your current challenges and goals.",
          builder_handoff_agent: "I help translate ministry vision into technical specifications. What feature or system would you like to build?"
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
        // Call the edge function with conversation context
        const response = await callAgentRouter({
          agent_id: selectedAgent,
          message: input,
          context: {
            // Send last 5 messages as context
            recent_messages: messages.slice(-5).map(m => ({
              role: m.isUser ? 'user' : 'assistant',
              content: m.message
            }))
          },
          metadata: {
            source: 'mobile_app',
            timestamp: new Date().toISOString()
          }
        });

        if (response.ok && response.reply) {
          const responseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            message: response.reply,
            isUser: false,
          };
          setMessages((prev) => [...prev, responseMessage]);
        } else {
          throw new Error(response.error || 'No response from agent');
        }
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
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.agentScrollContent}
          style={styles.agentScrollView}
        >
          {AGENTS.map((agent) => (
            <View key={agent.id} style={styles.agentCardWrapper}>
              <AgentCard
                name={agent.name}
                icon={agent.icon}
                selected={selectedAgent === agent.id}
                onPress={() => setSelectedAgent(agent.id)}
              />
            </View>
          ))}
        </ScrollView>
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
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  agentScrollView: {
    flexGrow: 0,
  },
  agentScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  agentCardWrapper: {
    marginRight: Spacing.sm,
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
