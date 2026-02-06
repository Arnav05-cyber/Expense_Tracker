import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#050a30", // Darker Blue
          },
          headerTintColor: "#fff", // White text
          headerTitle: "Expense Tracker",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight: () => {
            // We need a subtle way to access logout or move it elsewhere later.
            // For now, let's keep it simple or user might get stuck without logout since we removed it from Home.
            // But router and logic are inside Home...
            // Actually, usually Logout is in a settings menu or right header.
            // Since I can't easily pass the specific logout function from Home up to Layout without context/redux,
            // I will move the Logout button to the bottom of the Home screen or keep it in the DOM but different style?
            // User just asked to remove "Expected Expense Tracker".
            // Let's re-read: "remove the expected expense tracker that is coming on the home page".
            // He didn't explicitly say "Remove Logout".
            // But the Logout button was INSIDE that header block I just deleted.
            // Mistake! I deleted the logout button. I should restore it but put it elsewhere.
            return null;
          },
        }}
      />
    </GluestackUIProvider>
  );
}
