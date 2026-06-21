import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

export default function ProfileLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // Dynamic Numeric Summary State Matrix
  const [orderCount, setOrderCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  // Editable Form Local States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Re-fetch calculations every time the layout receives user view focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSupabaseProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchSupabaseProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("No user found");

      // Set personal data
      const fullName = user.user_metadata?.full_name || "";
      const nameParts = fullName.trim().split(" ");
      
      setFirstName(user.user_metadata?.first_name || nameParts[0] || "");
      setLastName(user.user_metadata?.last_name || nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.user_metadata?.phone_number || "");
      setLocation(user.user_metadata?.location || "");

      const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
      setCreatedAt(
        user.created_at 
          ? new Date(user.created_at).toLocaleDateString("en-US", dateOptions)
          : "Recent"
      );

      // Fetch row totals across tables simultaneously using count overrides
      const [ordersRes, wishlistRes, cartRes] = await Promise.all([
        supabase.from("user_orders").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_wishlist").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_cart").select("quantity").eq("user_id", user.id)
      ]);

      setOrderCount(ordersRes.count || 0);
      setWishlistCount(wishlistRes.count || 0);
      
      // Accumulate specific custom unit quantities inside the cart link rows
      const accumulatedCartItems = cartRes.data?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
      setCartCount(accumulatedCartItems);

    } catch (error: any) {
      Alert.alert("Profile Error", error.message || "Failed to load account information.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Validation Error", "First and Last names cannot be empty.");
      return;
    }

    try {
      setUpdating(true);
      const combinedFullName = `${firstName.trim()} ${lastName.trim()}`;

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: combinedFullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phone.trim(),
          location: location.trim(),
        }
      });

      if (error) throw error;
      Alert.alert("Success", "Your profile changes have been synced successfully!");
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "An error occurred while saving.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Error", error.message);
    } else {
      router.replace("/(auth)/login");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Fetching Account Sync...</Text>
      </View>
    );
  }

  const initials = ((firstName.charAt(0) || "") + (lastName.charAt(0) || "")).toUpperCase() || "AX";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.leftProfileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.nameText}>{`${firstName} ${lastName}`.trim() || "APEX User"}</Text>
          <Text style={styles.emailText}>{email}</Text>
          
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Member since {createdAt}</Text>
          </View>

          {/* Fully Connected Real-Time Stats Summary Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statBoxBorder]}>
              <Text style={styles.statNumberOrange}>{orderCount}</Text>
              <Text style={styles.statLabel}>ORDERS</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxBorder]}>
              <Text style={[styles.statNumberDim, wishlistCount > 0 && { color: "#FF5722" }]}>{wishlistCount}</Text>
              <Text style={styles.statLabel}>WISHLIST</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumberDim, cartCount > 0 && { color: "#FF5722" }]}>{cartCount}</Text>
              <Text style={styles.statLabel}>IN CART</Text>
            </View>
          </View>

          
        </View>

        <View style={styles.mainFormCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.row}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>FIRST NAME</Text>
              <TextInput style={styles.editableInput} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor="#4b5563" editable={!updating} />
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>LAST NAME</Text>
              <TextInput style={styles.editableInput} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor="#4b5563" editable={!updating} />
            </View>
          </View>

          <Text style={styles.inputLabel}>EMAIL ADDRESS (READ-ONLY)</Text>
          <TextInput style={styles.disabledInput} value={email} editable={false} />

          <View style={styles.row}>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput style={styles.editableInput} value={phone} onChangeText={setPhone} placeholder="+63 917 123 4567" placeholderTextColor="#4b5563" keyboardType="phone-pad" editable={!updating} />
            </View>
            <View style={styles.flexField}>
              <Text style={styles.inputLabel}>LOCATION</Text>
              <TextInput style={styles.editableInput} value={location} onChangeText={setLocation} placeholder="City, Country" placeholderTextColor="#4b5563" editable={!updating} />
            </View>
          </View>

          <View style={styles.buttonActionRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={fetchSupabaseProfile} disabled={updating}>
              <Text style={styles.cancelButtonText}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, updating && { opacity: 0.6 }]} onPress={handleSaveChanges} disabled={updating}>
              {updating ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.saveButtonText}>SAVE CHANGES</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={updating}>
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#9ca3af", fontSize: 14, marginTop: 12, fontWeight: "600" },
  leftProfileCard: { backgroundColor: "#121212", padding: 20, borderRadius: 8, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "#222222" },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FF5722", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarText: { color: "#ffffff", fontSize: 26, fontWeight: "900", letterSpacing: 0.5 },
  nameText: { fontSize: 20, fontWeight: "800", color: "#ffffff", marginBottom: 4 },
  emailText: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  badgeContainer: { backgroundColor: "#1e1e1e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  badgeText: { color: "#6b7280", fontSize: 12, fontWeight: "500" },
  statsGrid: { flexDirection: "row", backgroundColor: "#1a1a1a", borderRadius: 8, borderWidth: 1, borderColor: "#262626", marginBottom: 20, width: "100%" },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 12 },
  statBoxBorder: { borderRightWidth: 1, borderColor: "#262626" },
  statNumberOrange: { color: "#FF5722", fontSize: 16, fontWeight: "800" },
  statNumberDim: { color: "#6b7280", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "#4b5563", fontSize: 10, fontWeight: "700", marginTop: 2 },
  menuItem: { width: "100%", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 6, marginBottom: 4, flexDirection: "row" },
  menuItemActive: { backgroundColor: "#221410" },
  menuItemActiveText: { color: "#FF5722", fontWeight: "700", fontSize: 14 },
  menuItemText: { color: "#9ca3af", fontWeight: "600", fontSize: 14 },
  mainFormCard: { backgroundColor: "#121212", padding: 20, borderRadius: 8, borderWidth: 1, borderColor: "#222222", marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#ffffff", marginBottom: 20, letterSpacing: 0.3 },
  row: { flexDirection: "row", gap: 12, width: "100%" },
  flexField: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: "700", color: "#4b5563", marginBottom: 8, marginTop: 4 },
  editableInput: { height: 44, backgroundColor: "#1e1e1e", borderRadius: 6, borderWidth: 1, borderColor: "#333", paddingHorizontal: 14, color: "#ffffff", fontSize: 14, marginBottom: 14 },
  disabledInput: { height: 44, backgroundColor: "#141414", borderRadius: 6, borderWidth: 1, borderColor: "#262626", paddingHorizontal: 14, color: "#6b7280", fontSize: 14, marginBottom: 14 },
  buttonActionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 },
  cancelButton: { borderWidth: 1, borderColor: "#262626", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6 },
  cancelButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  saveButton: { backgroundColor: "#FF5722", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6, minWidth: 130, justifyContent: "center", alignItems: "center" },
  saveButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  logoutButton: { width: "100%", height: 50, backgroundColor: "#1e1a1a", borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#3f2222" },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
});