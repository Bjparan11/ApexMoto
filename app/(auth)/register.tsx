import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase"; // Verify path matches your file tree

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    setLoading(true);
    
    // Connects to Supabase Authentication database
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: name } // Stores display name in metadata fields
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert("Registration Failed", error.message);
    } else {
      Alert.alert(
        "Registration Successful", 
        "Check your inbox for a confirmation link/code!",
        [{ text: "OK", onPress: () => router.push("/(auth)/login") }]
      );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join APEX and optimize your digital presence today</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

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
            placeholder="Create a strong password"
            placeholderTextColor="#64748b"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 24 }, loading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")} disabled={loading}>
            <Text style={[styles.linkText, styles.boldLink]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212" // Deep premium dark background canvas matching references
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
    color: "#ffffff", // Pure white for primary headers
    marginBottom: 8, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 15, 
    color: "#94a3b8", // Modern slate gray contrast
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
    color: "#e2e8f0", // Clean off-white label texts
    marginBottom: 8, 
    marginTop: 16 
  },
  input: { 
    width: "100%", 
    height: 50, 
    backgroundColor: "#1e1e1e", // Dark inputs matching the catalog search architecture
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: "#ffffff", // Pure white for text entries
    borderWidth: 1, 
    borderColor: "#2d2d2d" 
  },
  linkText: { 
    color: "#FF5722", // High-visibility performance orange matching the reference look
    fontSize: 14, 
    fontWeight: "500" 
  },
  boldLink: { 
    fontWeight: "700" 
  },
  primaryButton: { 
    width: "100%", 
    height: 52, 
    backgroundColor: "#FF5722", // High-visibility orange matching the + CART button UI
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