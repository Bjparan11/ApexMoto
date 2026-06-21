import { useLocalSearchParams } from "expo-router";
import { Heart, Search, ShoppingCart, SlidersHorizontal, Star } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

interface PartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews_count: number;
  image_url?: string; 
}

export default function CatalogLayout() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  
  const [parts, setParts] = useState<PartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. High-quality default fallback images based strictly on the category string
  const categoryImages: Record<string, string> = {
    brakes: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=300&auto=format&fit=crop", // Brake discs/motorcycle wheel
    engine: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=300&auto=format&fit=crop", // Polished engine block
    suspension: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=300&auto=format&fit=crop", // Performance shock absorbers
    exhaust: "https://images.unsplash.com/photo-1611245781313-f4c022204c32?q=80&w=300&auto=format&fit=crop", // Exhaust pipings/chrome finish
    electrical: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?q=80&w=300&auto=format&fit=crop", // Wiring spark plugs/batteries
    accessories: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=300&auto=format&fit=crop", // Helmets/gloves/add-ons
    default: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=300&auto=format&fit=crop", // General performance bike photo
  };

  useEffect(() => {
    if (filter) {
      setSelectedCategory(filter.toLowerCase());
    } else {
      setSelectedCategory("all");
    }
  }, [filter]);

  useEffect(() => {
    loadCatalogAndWishlist();
  }, [selectedCategory]);

  const loadCatalogAndWishlist = async () => {
    try {
      if (!refreshing) setLoading(true);
      await Promise.all([fetchCatalog(), fetchWishlist()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      let query = supabase.from("parts_catalog").select("*");

      if (selectedCategory !== "all") {
        query = query.ilike("category", selectedCategory);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (error: any) {
      Alert.alert("Catalog Error", error.message || "Failed to download parts cache.");
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_wishlist")
        .select("part_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setWishlistIds(data?.map(item => item.part_id) || []);
    } catch (error) {
      console.log("Wishlist warning:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCatalogAndWishlist();
  }, [selectedCategory]);

  const handleAddToCart = async (part: PartItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert("Authentication Required", "Please log into your APEX account to add items to your cart.");
        return;
      }

      const { data: existingItem, error: fetchError } = await supabase
        .from("user_cart")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("part_id", part.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("user_cart")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_cart")
          .insert({
            user_id: user.id,
            part_id: part.id,
            quantity: 1
          });

        if (insertError) throw insertError;
      }

      Alert.alert("Success 🛒", `${part.name} has been added to your workspace cart layout!`);
    } catch (error: any) {
      Alert.alert("Action Failed", error.message || "Could not complete item insertion sequence.");
    }
  };

  const handleToggleWishlist = async (partId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Authentication Required", "Log in to compile your personal wishlist folder.");
        return;
      }

      const isBookmarked = wishlistIds.includes(partId);

      if (isBookmarked) {
        const { error } = await supabase
          .from("user_wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("part_id", partId);

        if (error) throw error;
        setWishlistIds(prev => prev.filter(id => id !== partId));
      } else {
        const { error } = await supabase
          .from("user_wishlist")
          .insert({ user_id: user.id, part_id: partId });

        if (error) throw error;
        setWishlistIds(prev => [...prev, partId]);
      }
    } catch (error: any) {
      Alert.alert("Wishlist Error", error.message || "Could not modify save state elements.");
    }
  };

  const filteredParts = parts.filter((part) =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Syncing High-Performance Feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBarContainer}>
          <Search color="#6b7280" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parts, engines, brakes..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7} onPress={() => setSelectedCategory("all")}>
          <SlidersHorizontal color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Parts List */}
      <FlatList
        data={filteredParts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5722" colors={["#FF5722"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No matching components found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isWishlisted = wishlistIds.includes(item.id);
          
          // 2. DYNAMIC MAPPING: Fall back to category-specific imagery if image_url is empty
          const normalizedCategory = item.category ? item.category.toLowerCase() : "default";
          const productPhoto = item.image_url || categoryImages[normalizedCategory] || categoryImages.default;

          return (
            <View style={styles.partCard}>
              
              {/* Product Thumbnail Block */}
              <Image 
                source={{ uri: productPhoto }} 
                style={styles.partImage} 
                resizeMode="cover"
              />

              {/* Core Text Elements */}
              <View style={styles.infoColumn}>
                <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
                <Text style={styles.partName} numberOfLines={2}>{item.name}</Text>
                
                <View style={styles.ratingRow}>
                  <Star color="#FF5722" size={12} fill="#FF5722" />
                  <Text style={styles.ratingText}>{item.rating ? item.rating.toFixed(1) : "5.0"}</Text>
                  <Text style={styles.reviewsText}>({item.reviews_count || 0})</Text>
                </View>
                
                <Text style={styles.priceText}>{item.price.toFixed(2)}</Text>
              </View>

              {/* Side Action Cluster */}
              <View style={styles.actionButtonGroup}>
                <TouchableOpacity 
                  style={[styles.wishlistButton, isWishlisted && styles.wishlistButtonActive]} 
                  onPress={() => handleToggleWishlist(item.id)}
                  activeOpacity={0.7}
                >
                  <Heart 
                    color={isWishlisted ? "#FF5722" : "#6b7280"} 
                    fill={isWishlisted ? "#FF5722" : "transparent"} 
                    size={16} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.addToCartButton} 
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.8}
                >
                  <ShoppingCart color="#ffffff" size={16} />
                </TouchableOpacity>
              </View>

            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  loadingContainer: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#6b7280", fontSize: 14, marginTop: 12, fontWeight: "600" },
  searchHeader: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 10 },
  searchBarContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 8, borderWidth: 1, borderColor: "#222222", paddingHorizontal: 12, height: 46 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#ffffff", fontSize: 14, height: "100%" },
  filterButton: { backgroundColor: "#121212", width: 46, height: 46, borderRadius: 8, borderWidth: 1, borderColor: "#222222", justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 32 },
  partCard: { backgroundColor: "#121212", borderRadius: 8, borderWidth: 1, borderColor: "#222222", padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center" },
  partImage: { width: 90, height: 90, borderRadius: 6, backgroundColor: "#1a1a1a", marginRight: 14 },
  infoColumn: { flex: 1, paddingRight: 6 },
  categoryBadge: { color: "#FF5722", fontSize: 9, fontWeight: "800", letterSpacing: 0.5, marginBottom: 2 },
  partName: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginBottom: 4, lineHeight: 19 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 4 },
  ratingText: { color: "#ffffff", fontSize: 11, fontWeight: "600" },
  reviewsText: { color: "#555555", fontSize: 11 },
  priceText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  actionButtonGroup: { flexDirection: "column", justifyContent: "center", gap: 8, paddingLeft: 4 },
  wishlistButton: { backgroundColor: "#1a1a1a", width: 38, height: 38, borderRadius: 6, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#262626" },
  wishlistButtonActive: { backgroundColor: "#221410", borderColor: "#FF5722" },
  addToCartButton: { backgroundColor: "#FF5722", width: 38, height: 38, borderRadius: 6, justifyContent: "center", alignItems: "center" },
  emptyView: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#555555", fontSize: 14, fontWeight: "600" }
});