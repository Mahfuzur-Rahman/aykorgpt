import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#0F6E56",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            title: "AykorGPT Assistant",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
