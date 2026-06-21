import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSendRecovery = () => {
    // Navigate them directly to reset screen for simulation
    router.push("/(auth)/reset-password");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your account email below to reset your access credentials.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={[styles.primaryButton, { marginTop: 24 }]} onPress={handleSendRecovery}>
            <Text style={styles.primaryButtonText}>Send Reset Instructions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.backButton}>
          <Text style={styles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212" // Deep premium dark background canvas
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  headerContainer: { 
    alignItems: "center", 
    marginBottom: 32 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#ffffff", // Pure white for primary headline focus
    marginBottom: 12, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 15, 
    color: "#94a3b8", // Subdued slate grey contrast
    textAlign: "center", 
    lineHeight: 22 
  },
  form: { 
    width: "100%" 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#e2e8f0", // Soft off-white for labels
    marginBottom: 8 
  },
  input: { 
    width: "100%", 
    height: 50, 
    backgroundColor: "#1e1e1e", // Deep charcoal input element matching catalog cards
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: "#ffffff", // White text input entry
    borderWidth: 1, 
    borderColor: "#2d2d2d" 
  },
  primaryButton: { 
    width: "100%", 
    height: 52, 
    backgroundColor: "#FF5722", // High-visibility racing orange theme color
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#FF5722", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6, 
    elevation: 3 
  },
  primaryButtonText: { 
    color: "#ffffff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  backButton: { 
    marginTop: 24, 
    alignItems: "center" 
  },
  linkText: { 
    color: "#FF5722", // Performance orange for navigation links
    fontSize: 15, 
    fontWeight: "600" 
  },
});