import { useRouter } from "expo-router";
import { ChevronRight, ShoppingCart, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

interface CartItem {
  id: string; 
  quantity: number;
  parts_catalog: {
    id: string;
    name: string;
    category: string;
    price: number;
  };
}

export default function CartLayout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Main data fetching function from Supabase
  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCartItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("user_cart")
        .select(`
          id,
          quantity,
          parts_catalog (
            id,
            name,
            category,
            price
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setCartItems(data as unknown as CartItem[] || []);

    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load cart selections.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Triggered when user pulls down on the scroll view
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCartItems();
  }, []);

  const handleRemoveItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_cart")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      Alert.alert("Deletion Failed", error.message || "Could not purge item component.");
    }
  };

  const handleCheckout = async () => {
  try {
    setLoading(true); // Start button loading spinner
    
    // 1. Verify user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Please log in to complete your purchase.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Add items to your cart before checking out.");
      return;
    }

    // 2. Calculate details for the order ledger
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.parts_catalog.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // 3. 🛑 PLACE THE SNIPPET HERE: Record order to history 🛑
    const { error: orderError } = await supabase
      .from("user_orders")
      .insert({ 
        user_id: user.id, 
        total_amount: totalAmount, 
        total_items: totalItems,
        status: "Processing" // Default status code
      });

    if (orderError) throw orderError;

    // 4. Wipe out the user's cart records since they've purchased them
    const { error: clearCartError } = await supabase
      .from("user_cart")
      .delete()
      .eq("user_id", user.id);

    if (clearCartError) throw clearCartError;

    // 5. Success feedback and routing
    Alert.alert(
      "Order Placed! 🎉", 
      "Your performance components are now being processed.",
      [
        { 
          text: "View Profile", 
          onPress: () => router.push("/profile") // Redirects to profile where counters refresh
        }
      ]
    );

  } catch (error: any) {
    Alert.alert("Checkout Failed", error.message || "An error occurred during checkout.");
  } finally {
    setLoading(false);
  }
};

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.parts_catalog?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  };

  // Initial loading spinner state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Syncing Order Basket...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        /* EMPTY CART VIEW WITH PULL-TO-REFRESH ENABLED */
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ShoppingCart color="#4b5563" size={64} style={styles.icon} />
              <Text style={styles.headerText}>Your Cart is Empty</Text>
              <Text style={styles.bodyText}>Add parts from the catalog or pull down to refresh your sync.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/catalog")}>
                <Text style={styles.primaryButtonText}>BROWSE CATALOG</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#FF5722" 
              colors={["#FF5722"]}
              progressBackgroundColor="#121212"
            />
          }
          contentContainerStyle={{ flex: 1 }}
        />
      ) : (
        /* POPULATED CART VIEW LIST */
        <>
          <Text style={styles.pageTitle}>Selected Workspace Components</Text>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#FF5722" // iOS loading wheel color
                colors={["#FF5722"]} // Android loading wheel color
                progressBackgroundColor="#121212"
              />
            }
            renderItem={({ item }) => {
              const details = item.parts_catalog;
              if (!details) return null;

              return (
                <View style={styles.cartCard}>
                  <View style={styles.infoColumn}>
                    <Text style={styles.categoryBadge}>
                      {details.category.toUpperCase()} {item.quantity > 1 && `(x${item.quantity})`}
                    </Text>
                    <Text style={styles.partName} numberOfLines={1}>{details.name}</Text>
                    <Text style={styles.priceText}>{(details.price * item.quantity).toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />

          {/* Persistent Summary Footer */}
          <View style={styles.summaryFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Components:</Text>
              <Text style={styles.summaryValue}>
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)} Items
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Subtotal:</Text>
              <Text style={styles.totalPriceText}>{calculateSubtotal().toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.checkoutButton, checkoutLoading && { opacity: 0.7 }]}
              onPress={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
                  <ChevronRight color="#ffffff" size={18} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, paddingTop: 100 },
  loadingContainer: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#6b7280", fontSize: 14, marginTop: 12, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", paddingHorizontal: 16, paddingTop: 20, marginBottom: 8 },
  listContent: { padding: 16 },
  cartCard: { backgroundColor: "#121212", borderRadius: 8, borderWidth: 1, borderColor: "#222222", padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoColumn: { flex: 1, paddingRight: 12 },
  categoryBadge: { color: "#FF5722", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4 },
  partName: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginBottom: 6 },
  priceText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  removeButton: { width: 36, height: 36, backgroundColor: "#1a1313", borderWidth: 1, borderColor: "#3a1e1e", borderRadius: 6, justifyContent: "center", alignItems: "center" },
  icon: { marginBottom: 20, opacity: 0.8 },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#ffffff", marginBottom: 12, textAlign: "center" },
  bodyText: { fontSize: 15, color: "#6b7280", textAlign: "center", marginBottom: 28, paddingHorizontal: 20 },
  primaryButton: { backgroundColor: "#FF5722", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 6 },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  summaryFooter: { backgroundColor: "#121212", borderTopWidth: 1, borderColor: "#222222", padding: 20, paddingBottom: Platform.OS === "ios" ? 34 : 24 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryLabel: { color: "#6b7280", fontSize: 14, fontWeight: "600" },
  summaryValue: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  totalPriceText: { color: "#FF5722", fontSize: 22, fontWeight: "900" },
  checkoutButton: { backgroundColor: "#FF5722", borderRadius: 6, height: 50, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 10, width: "100%" },
  checkoutButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 }
});