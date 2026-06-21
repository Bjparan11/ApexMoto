import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Expo Router resolves routes inside group folders automatically!
    router.replace("/login"); 
  };

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {/* Logo Image */}
        <Image 
          source={require("../assets/images/blue.jpg")} // Double-check and adjust this path to match your local project structure
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Catchy Tagline */}
        <Text style={styles.title}>Reach Your APEX</Text>
        <Text style={styles.subtitle}>
          Elevate your productivity and experience the next generation of performance management.
        </Text>
      </View>

      {/* Footer Button Area */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Clean dark theme canvas matching your references
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logo: {
    width: width * 0.65,
    height: 150,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff", // High-contrast crisp white for main visibility
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8", // Clean slate grey for premium subtitle contrast
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FF5722", // High-visibility performance orange matching the reference look
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#FF5722", // Color matched shadow glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4, // Shadow elevation for Android
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800", // Bolder weight layout matching the catalog action buttons
    letterSpacing: 0.5,
  },
});