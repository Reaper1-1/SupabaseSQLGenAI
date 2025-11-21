import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AgentsScreen from "@/screens/AgentsScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type AgentsStackParamList = {
  Agents: undefined;
};

const Stack = createNativeStackNavigator<AgentsStackParamList>();

export default function AgentsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Agents"
        component={AgentsScreen}
        options={{ headerTitle: "AI Coaches" }}
      />
    </Stack.Navigator>
  );
}
