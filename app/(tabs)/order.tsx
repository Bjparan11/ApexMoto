import { PackageOpen, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../utils/supabase"; // Adjust path to your structure

interface OrderItem {
  id: string;
  total_amount: number;
  total_items: number;
  status: string;
  created_at: string;
}

export default function OrderHistoryLayout() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load order history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Syncing Order History...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Your Order Ledger</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#FF5722" 
            colors={["#FF5722"]}
            progressBackgroundColor="#121212"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PackageOpen color="#4b5563" size={64} style={styles.icon} />
            <Text style={styles.headerText}>No Orders Found</Text>
            <Text style={styles.bodyText}>When you complete a checkout workspace request, it will settle here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderIdLabel}>ORDER ID</Text>
                <Text style={styles.orderIdValue} numberOfLines={1}>{item.id.slice(0, 8).toUpperCase()}...</Text>
              </View>
              <View style={styles.statusBadge}>
                <ShieldCheck color="#FF5722" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
              <View>
                <Text style={styles.metaLabel}>DATE PLACED</Text>
                <Text style={styles.metaValue}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.metaLabel}>COMPONENTS</Text>
                <Text style={styles.metaValue}>{item.total_items} Items</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.metaLabel}>TOTAL PAID</Text>
                <Text style={styles.priceValue}>{Number(item.total_amount).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  loadingContainer: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#6b7280", fontSize: 14, marginTop: 12, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", paddingHorizontal: 16, paddingTop: 20, marginBottom: 8 },
  listContent: { padding: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 100 },
  icon: { marginBottom: 16, opacity: 0.6 },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#ffffff", marginBottom: 8 },
  bodyText: { fontSize: 14, color: "#6b7280", textAlign: "center", paddingHorizontal: 40 },
  orderCard: { backgroundColor: "#121212", borderRadius: 8, borderWidth: 1, borderColor: "#222222", padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderIdLabel: { color: "#4b5563", fontSize: 10, fontWeight: "800" },
  orderIdValue: { color: "#ffffff", fontSize: 14, fontWeight: "700", marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#221410", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 0.5, borderColor: "#FF5722" },
  statusText: { color: "#FF5722", fontSize: 11, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#222222", marginVertical: 12 },
  cardBody: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaLabel: { color: "#4b5563", fontSize: 10, fontWeight: "800", marginBottom: 4 },
  metaValue: { color: "#9ca3af", fontSize: 13, fontWeight: "600" },
  priceValue: { color: "#ffffff", fontSize: 15, fontWeight: "800" }
});