import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

export default function VerifyEmail() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();
  
  const [email, setEmail] = useState(initialEmail || "");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (!token) return Alert.alert("Error", "Please enter the verification code.");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    setLoading(false);

    if (error) {
      Alert.alert("Verification Failed", error.message);
    } else {
      router.replace("/home");
    }
  };

  const handleResendCode = async () => {
    setCooldown(60);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) Alert.alert("Resend Failed", error.message);
    else Alert.alert("Code Sent", "Check your inbox for a new code.");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
        </View>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="Enter 6-digit code" 
            placeholderTextColor="#64748b" 
            keyboardType="number-pad" 
            value={token} 
            onChangeText={setToken} 
          />
          
          <TouchableOpacity style={[styles.primaryButton, { marginTop: 32 }]} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Verify Token</Text>}
          </TouchableOpacity>
        </View>

        {/* Updated Footer Section */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Need another code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={cooldown > 0}>
              <Text style={[styles.linkText, { opacity: cooldown > 0 ? 0.5 : 1 }]}>
                {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend Code"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.footerRow, { marginTop: 12 }]}>
            <Text style={styles.footerText}>Already verified? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={[styles.linkText, styles.boldLink]}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212" 
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
    color: "#ffffff", 
    marginBottom: 8, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 15, 
    color: "#94a3b8", 
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
    color: "#e2e8f0", 
    marginBottom: 8, 
    marginTop: 16 
  },
  input: { 
    width: "100%", 
    height: 50, 
    backgroundColor: "#1e1e1e", 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: "#ffffff", 
    borderWidth: 1, 
    borderColor: "#2d2d2d" 
  },
  linkText: { 
    color: "#FF5722", 
    fontSize: 14, 
    fontWeight: "500" 
  },
  boldLink: { 
    fontWeight: "700" 
  },
  primaryButton: { 
    width: "100%", 
    height: 52, 
    backgroundColor: "#FF5722", 
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
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }
});