import { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme, isDark } = useTheme();
  const [displayName, setDisplayName] = useState("John");
  const [email, setEmail] = useState("john@example.com");

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => {} },
    ]);
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundSecondary,
      color: theme.text,
      borderRadius: BorderRadius.md,
    },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your account</ThemedText>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.primary },
            ]}
          >
            <ThemedText style={styles.avatarText}>J</ThemedText>
          </View>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
        <Spacer height={Spacing.md} />

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Display Name</ThemedText>
          <TextInput
            style={inputStyle}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
          />
        </View>

        <Spacer height={Spacing.lg} />

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
        </View>

        <Spacer height={Spacing.lg} />
        <Button onPress={() => {}}>Save Changes</Button>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
        <Spacer height={Spacing.md} />
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {}}
        >
          <Feather name="bell" size={20} color={theme.primary} />
          <ThemedText style={styles.settingLabel}>Notifications</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Spacer height={Spacing.md} />
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {}}
        >
          <Feather name="moon" size={20} color={theme.primary} />
          <ThemedText style={styles.settingLabel}>Appearance</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Spacer height={Spacing.md} />
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {}}
        >
          <Feather name="lock" size={20} color={theme.primary} />
          <ThemedText style={styles.settingLabel}>Privacy Policy</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <Button onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>

      <Spacer height={Spacing.xl} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  fieldContainer: {
    width: "100%",
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 0,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#DC2626",
  },
});
