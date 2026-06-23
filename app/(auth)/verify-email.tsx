import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase"; // Verify path matches your file tree

export default function VerifyEmail() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();
  
  const [email, setEmail] = useState(initialEmail || "");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Handles confirmation code token submission
  const handleVerify = async () => {
    if (!email || !token) {
      Alert.alert("Error", "Please fill out your email and confirmation token.");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: "signup"
    });

    setLoading(false);

    if (error) {
      Alert.alert("Verification Failed", error.message);
    } else {
      Alert.alert(
        "Account Activated", 
        "Your APEX account has been fully optimized!",
        [{ text: "Let's Ride", onPress: () => router.replace("/home") }]
      );
    }
  };

  // Handles requesting a new verification code
  const handleResendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please provide your registration email address.");
      return;
    }

    setResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    setResending(false);

    if (error) {
      Alert.alert("Resend Failed", error.message);
    } else {
      Alert.alert("Code Sent 📥", "A fresh confirmation code has been dispatched to your inbox.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the validation digits dispatched to your registration mailbox</Text>
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
            editable={!loading && !initialEmail} // Keep locked if passed from register redirect
          />

          <Text style={styles.label}>Confirmation Token Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP Code (6-digit token)"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 32 }, loading && { opacity: 0.7 }]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Verify Token</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn't receive structural codes? </Text>
          <TouchableOpacity onPress={handleResendCode} disabled={resending || loading}>
            {resending ? (
              <ActivityIndicator color="#FF5722" size="small" />
            ) : (
              <Text style={[styles.linkText, styles.boldLink]}>Resend Code</Text>
            )}
          </TouchableOpacity>
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
});