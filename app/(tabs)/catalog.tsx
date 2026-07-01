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
  
  const [allParts, setAllParts] = useState<PartItem[]>([]); 
  const [filteredParts, setFilteredParts] = useState<PartItem[]>([]); 
  const [wishlistIds, setWishlistIds] = useState<string[]>([]); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categoryImages: Record<string, string> = {
    mags: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=300&auto=format&fit=crop", 
    mags_alloy: "https://images.unsplash.com/photo-1611245781313-f4c022204c32?q=80&w=300&auto=format&fit=crop", 
    mags_spoke: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=300&auto=format&fit=crop", 
    brake: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=300&auto=format&fit=crop", 
    wheel: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=300&auto=format&fit=crop", 
    exhaust: "https://images.unsplash.com/photo-1611245781313-f4c022204c32?q=80&w=300&auto=format&fit=crop", 
    muffler: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=300&auto=format&fit=crop", 
    seat: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=300&auto=format&fit=crop", 
    light: "https://images.unsplash.com/photo-1609630875289-22852233b5c3?q=80&w=300&auto=format&fit=crop", 
    default: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=300&auto=format&fit=crop", 
  };

  // 1. I-FETCH ANG MGA PRODUDKTO UG I-APPLY ANG FILTER KUNG ADUNA MAN
  async function fetchAndLoadParts(targetFilter?: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("parts_catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const partsData = data || [];
      setAllParts(partsData);
      
      const activeFilter = targetFilter || filter;
      if (activeFilter) {
        // KUNG GIKAN SA HOMEPAGE: I-filter dretso ang data
        const queryText = activeFilter.toLowerCase().trim();
        setSearchQuery(queryText);

        const matched = partsData.filter(item => {
          const categoryMatch = item.category ? item.category.toLowerCase().includes(queryText) : false;
          const nameMatch = item.name ? item.name.toLowerCase().includes(queryText) : false;
          return categoryMatch || nameMatch;
        });
        setFilteredParts(matched);
      } else {
        // KUNG WALAAY FILTER: I-display gihapon ang TANANG mga produkto (Orighinal Setup)
        setFilteredParts(partsData);
      }
    } catch (error: any) {
      Alert.alert("Catalog Error", error.message || "Failed to download parts cache.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Para sa manual typing filter sa search bar
  function applyClientFilter(text: string) {
    const queryText = text.trim().toLowerCase();
    if (!queryText) {
      setFilteredParts(allParts); // Ibalik sa tanang produkto kung gi-clear ang search input
      return;
    }

    const matched = allParts.filter(item => {
      const categoryMatch = item.category ? item.category.toLowerCase().includes(queryText) : false;
      const nameMatch = item.name ? item.name.toLowerCase().includes(queryText) : false;
      return categoryMatch || nameMatch;
    });

    setFilteredParts(matched);
  }

  // Mo-run kada abli ug kada usab sa rota / filter parameters
  useEffect(() => {
    fetchWishlist();
    fetchAndLoadParts();
  }, [filter]);

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
    fetchAndLoadParts();
  }, [filter]);

  const handleApplySearch = () => {
    applyClientFilter(searchQuery);
  };

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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Searching High-Performance Feed...</Text>
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
            onChangeText={(text) => {
              setSearchQuery(text);
              applyClientFilter(text); // Mo-filter ra dretso samtang nag-type (real-time)
            }}
            onSubmitEditing={handleApplySearch} 
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton} 
          activeOpacity={0.7} 
          onPress={handleApplySearch}
        >
          <SlidersHorizontal color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Parts List */}
      <FlatList
        data={filteredParts} // Kanunay kini naay sulod (All parts o gi-filter nga parts)
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5722" colors={["#FF5722"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No parts matched your query.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isWishlisted = wishlistIds.includes(item.id);
          const normalizedCategory = item.category ? item.category.toLowerCase().trim() : "default";
          const normalizedName = item.name ? item.name.toLowerCase() : "";
          
          let productPhoto = item.image_url;
          
          if (!productPhoto) {
            if (normalizedCategory === "mags") {
              if (normalizedName.includes("alloy")) {
                productPhoto = categoryImages.mags_alloy;
              } else if (normalizedName.includes("spoke")) {
                productPhoto = categoryImages.mags_spoke;
              } else {
                productPhoto = categoryImages.mags;
              }
            } else {
              productPhoto = categoryImages[normalizedCategory] || categoryImages.default;
            }
          }

          return (
            <View style={styles.partCard}>
              <Image source={{ uri: productPhoto }} style={styles.partImage} resizeMode="cover" />
              <View style={styles.infoColumn}>
                <Text style={styles.categoryBadge}>{item.category ? item.category.toUpperCase() : "PART"}</Text>
                <Text style={styles.partName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingRow}>
                  <Star color="#FF5722" size={12} fill="#FF5722" />
                  <Text style={styles.ratingText}>{item.rating ? item.rating.toFixed(1) : "5.0"}</Text>
                  <Text style={styles.reviewsText}>({item.reviews_count || 0})</Text>
                </View>
                <Text style={styles.priceText}>₱{item.price ? item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}</Text>
              </View>
              <View style={styles.actionButtonGroup}>
                <TouchableOpacity style={[styles.wishlistButton, isWishlisted && styles.wishlistButtonActive]} onPress={() => handleToggleWishlist(item.id)} activeOpacity={0.7}>
                  <Heart color={isWishlisted ? "#FF5722" : "#6b7280"} fill={isWishlisted ? "#FF5722" : "transparent"} size={16} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)} activeOpacity={0.8}>
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
  filterButton: { backgroundColor: "#FF5722", width: 46, height: 46, borderRadius: 8, justifyContent: "center", alignItems: "center" }, 
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
  emptyView: { alignItems: "center", paddingVertical: 80, paddingHorizontal: 20 },
  emptyText: { color: "#6b7280", fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 20 }
});