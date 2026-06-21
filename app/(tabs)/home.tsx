import { useRouter } from "expo-router";
import { AppWindow, Disc, Gauge, Layers, ShieldAlert, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase"; // Verify path matches your file tree

interface CategoryItem {
  name: string;
  count: string;
  icon: React.ReactNode;
}

export default function HomeLayout() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalParts, setTotalParts] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);

  // Icon mapping dictionary based on database category names
  const iconMap: Record<string, React.ReactNode> = {
    Brakes: <Disc color="#FF5722" size={24} />, // Active highlighted card default color
    Engine: <Gauge color="#ffffff" size={24} />,
    Suspension: <Layers color="#ffffff" size={24} />,
    Exhaust: <ShieldAlert color="#ffffff" size={24} />,
    Electrical: <Zap color="#ffffff" size={24} />,
    Accessories: <AppWindow color="#ffffff" size={24} />,
  };

  useEffect(() => {
    fetchMarketplaceMetrics();
  }, []);

  const fetchMarketplaceMetrics = async () => {
    try {
      setLoading(true);

      // Fetch all core columns needed to generate stats from your catalog
      const { data: catalogData, error } = await supabase
        .from("parts_catalog")
        .select("category");

      if (error) throw error;

      if (catalogData) {
        // 1. Calculate live aggregate stock metric
        const grandTotal = catalogData.length;
        setTotalParts(grandTotal > 1000 ? `${(grandTotal / 1000).toFixed(1)}k` : `${grandTotal}`);

        // 2. Reduce row groups to dynamically calculate accurate counts
        const frequencyMap = catalogData.reduce((acc: Record<string, number>, item) => {
          // Normalize string formatting to match fallback dictionaries
          const formattedName = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : "Accessories";
          acc[formattedName] = (acc[formattedName] || 0) + 1;
          return acc;
        }, {});

        // 3. Re-map static schema layout against real-time database value aggregates
        const targetedCategories = ["Brakes", "Engine", "Suspension", "Exhaust", "Electrical", "Accessories"];
        const computedCategories = targetedCategories.map((cat) => ({
          name: cat,
          count: `${frequencyMap[cat] || 0} parts`,
          icon: iconMap[cat] || <AppWindow color="#ffffff" size={24} />
        }));

        setCategories(computedCategories);
      }
    } catch (error: any) {
      console.error("Failed to load dashboard sync metrics:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Click behavior allowing category filtering parameters to be handled by catalog screen routing
  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: "/catalog",
      params: { filter: categoryName.toLowerCase() }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* --- HERO BANNER SECTION --- */}
      <View style={styles.heroSection}>
        <Text style={styles.welcomeText}>
          Performance Parts{"\n"}for <Text style={styles.orangeText}>Every Ride</Text>
        </Text>
        <Text style={styles.bodyText}>
          Genuine OEM and aftermarket motorcycle components. From engine internals to custom exhausts — built for riders who demand more.
        </Text>

        {/* Hero Actions Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.push("/catalog")}>
            <Text style={styles.primaryButtonText}>☰  BROWSE PARTS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => router.push("/cart")}>
            <Text style={styles.secondaryButtonText}>+  LIST A PART</Text>
          </TouchableOpacity>
        </View>

        {/* Divider Line */}
        <View style={styles.divider} />

        {/* Live Marketplace Statistics Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalParts}<Text style={styles.orangeText}>+</Text></Text>
            <Text style={styles.statLabel}>PARTS IN STOCK</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>48<Text style={styles.orangeText}>h</Text></Text>
            <Text style={styles.statLabel}>AVG. DISPATCH</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8<Text style={styles.orangeText}>★</Text></Text>
            <Text style={styles.statLabel}>SELLER RATING</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50<Text style={styles.orangeText}>+</Text></Text>
            <Text style={styles.statLabel}>BRANDS</Text>
          </View>
        </View>
      </View>

      {/* --- CATEGORIES SECTION --- */}
      <View style={styles.categoryHeaderRow}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <TouchableOpacity onPress={() => router.push("/catalog")}>
          <Text style={styles.viewAllText}>View all ❯</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Render Block with Loading Skeleton Fallback */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color="#FF5722" />
          <Text style={styles.loadingText}>Loading Live Catalog metrics...</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(item.name)}
            >
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCount}>{item.count}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0a0a0a" 
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroSection: {
    backgroundColor: "#111111", 
    borderRadius: 8,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  welcomeText: { 
    fontSize: 28, 
    fontWeight: "900", 
    color: "#ffffff", 
    lineHeight: 34,
    marginBottom: 14,
  },
  orangeText: {
    color: "#FF5722", 
  },
  bodyText: { 
    fontSize: 14, 
    color: "#888888", 
    lineHeight: 20,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#FF5722", 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6, 
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#262626", 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#222222",
    width: "100%",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    minWidth: "45%",
    marginBottom: 10,
  },
  statNumber: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  categoryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  viewAllText: {
    color: "#FF5722",
    fontSize: 13,
    fontWeight: "600",
  },
  gridContainer: {
    gap: 10,
    paddingBottom: 10,
  },
  categoryCard: {
    width: 110,
    backgroundColor: "#161616", 
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#222222",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardCount: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "500",
  },
  loadingWrapper: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#555555",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600"
  }
});