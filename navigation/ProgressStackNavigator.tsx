import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProgressScreen from "@/screens/ProgressScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type ProgressStackParamList = {
  Progress: undefined;
};

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export default function ProgressStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ headerTitle: "Progress" }}
      />
    </Stack.Navigator>
  );
}
