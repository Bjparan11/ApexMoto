import { Tabs } from "expo-router";
import { Compass, Home, Package, ShoppingCart, User } from "lucide-react-native"; // Imported Package icon
import { Platform, StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF5722", // High-visibility performance orange matching reference
        tabBarInactiveTintColor: "#6b7280", // Dimmed gray matching catalog reviews/parts count text
        headerShown: true, // Show headers for standard app context navigation
        headerStyle: {
          backgroundColor: "#1a1a1a", // Deep grey header surface matching card background elements
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
          borderBottomWidth: 1,
          borderBottomColor: "#262626", // Subtle partition stroke line
        },
        headerTitleStyle: {
          fontWeight: "900", // Thicker structure matching catalog typography
          color: "#ffffff", // Pure white for high-contrast titles
          fontSize: 18,
          letterSpacing: 0.5,
        },
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Home Tab Screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      {/* 2. Catalog Tab Screen */}
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Catalog",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />

      {/* 3. Cart Tab Screen */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />

      {/* 4. Order Tab Screen (Now featuring the proper Package icon) */}
      <Tabs.Screen
        name="order"
        options={{
          title: "Order",
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />

      {/* 5. Profile Tab Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#121212", // Base dark canvas background
    borderTopWidth: 1,
    borderTopColor: "#262626", // Card border style outline accent line
    height: Platform.OS === "ios" ? 88 : 64,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700", // Increased weight layout to stand out better on dark pixels
  },
});