import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    Alert.alert("Success", "Password updated successfully!", [
      { text: "OK", onPress: () => router.replace("/(auth)/login") }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Set up your updated unique password to restore full platform access.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#64748b"
            secureTextEntry
            autoCapitalize="none"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#64748b"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={[styles.primaryButton, { marginTop: 32 }]} onPress={handleResetPassword}>
            <Text style={styles.primaryButtonText}>Update Password</Text>
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
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#ffffff", // Pure white layout title
    marginBottom: 12, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 15, 
    color: "#94a3b8", // Clean slate gray contrast text
    textAlign: "center", 
    lineHeight: 22 
  },
  form: { 
    width: "100%" 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#e2e8f0", // Soft off-white for structural inputs
    marginBottom: 8, 
    marginTop: 16 
  },
  input: { 
    width: "100%", 
    height: 50, 
    backgroundColor: "#1e1e1e", // Dark input surface matching your catalog block style
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    color: "#ffffff", // White text element entry
    borderWidth: 1, 
    borderColor: "#2d2d2d" 
  },
  primaryButton: { 
    width: "100%", 
    height: 52, 
    backgroundColor: "#FF5722", // High-visibility racing orange base color
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
});