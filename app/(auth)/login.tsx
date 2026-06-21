import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase"; // Verify path matches your file tree

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Logs the user in against your Supabase backend
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      // Swaps layout stack into the logged in ecosystem cleanly
      router.replace("/(tabs)/home");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your APEX account to continue</Text>
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
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#64748b"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} style={styles.forgotPasswordAlign} disabled={loading}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")} disabled={loading}>
            <Text style={[styles.linkText, styles.boldLink]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#ffffff", // Pure white for title readability
    marginBottom: 8, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 15, 
    color: "#94a3b8", // Clean slate gray for modern contrast
    textAlign: "center", 
    paddingHorizontal: 10 
  },
  form: { 
    width: "100%", 
    marginBottom: 24 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#e2e8f0", // Light off-white for labels
    marginBottom: 8, 
    marginTop: 16 
  },
  input: { 
    width: "100%", 
    height: 50, 
    backgroundColor: "#1e1e1e", // Dark input background card
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: "#ffffff", // Typed text shows up white
    borderWidth: 1, 
    borderColor: "#2d2d2d" // Subtle dark border outlines
  },
  forgotPasswordAlign: { 
    alignSelf: "flex-end", 
    marginTop: 12, 
    marginBottom: 24 
  },
  linkText: { 
    color: "#FF5722", // High-visibility orange for links matching the catalog theme
    fontSize: 14, 
    fontWeight: "500" 
  },
  boldLink: { 
    fontWeight: "700" 
  },
  primaryButton: { 
    width: "100%", 
    height: 52, 
    backgroundColor: "#FF5722", // High-visibility orange matching the + CART button
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 10, 
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
  footer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 16 
  },
  footerText: { 
    color: "#94a3b8", 
    fontSize: 14 
  },
});