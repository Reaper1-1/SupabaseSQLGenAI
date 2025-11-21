import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DevotionalScreen from "@/screens/DevotionalScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type DevotionalStackParamList = {
  Devotional: undefined;
};

const Stack = createNativeStackNavigator<DevotionalStackParamList>();

export default function DevotionalStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Devotional"
        component={DevotionalScreen}
        options={{ headerTitle: "Daily Devotional" }}
      />
    </Stack.Navigator>
  );
}
