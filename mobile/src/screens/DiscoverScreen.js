import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS, CATEGORIES } from '../utils/constants';

const { width } = Dimensions.get('window');
const GRID_ITEM = (width - SPACING.md * 2 - 12) / 2;

const ALL_DESTINATIONS = [
  { id: '1', name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400', rating: 4.9, category: 'beaches', emoji: '🇬🇷' },
  { id: '2', name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', rating: 4.8, category: 'cities', emoji: '🇯🇵' },
  { id: '3', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', rating: 4.7, category: 'beaches', emoji: '🇮🇩' },
  { id: '4', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', rating: 4.8, category: 'cities', emoji: '🇫🇷' },
  { id: '5', name: 'Machu Picchu', country: 'Peru', image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400', rating: 4.9, category: 'mountains', emoji: '🇵🇪' },
  { id: '6', name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', rating: 4.8, category: 'culture', emoji: '🇯🇵' },
  { id: '7', name: 'Patagonia', country: 'Argentina', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', rating: 4.9, category: 'adventure', emoji: '🇦🇷' },
  { id: '8', name: 'Amalfi Coast', country: 'Italy', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400', rating: 4.8, category: 'beaches', emoji: '🇮🇹' },
];

const HIDDEN_GEMS = [
  { id: 'g1', name: 'Faroe Islands', country: 'Denmark', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400', description: 'Dramatic cliffs, puffins & Viking history' },
  { id: 'g2', name: 'Kotor', country: 'Montenegro', image: 'https://images.unsplash.com/photo-1581974944026-5d6ed762f617?w=400', description: 'Medieval walled city on Adriatic' },
  { id: 'g3', name: 'Luang Prabang', country: 'Laos', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', description: 'UNESCO temples & Buddhist culture' },
];

const RESTAURANTS = [
  { id: 'r1', name: 'Sushi Jiro', cuisine: 'Japanese', rating: 4.9, distance: '0.3 km', price: '$$$', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300' },
  { id: 'r2', name: 'Le Petit Bistro', cuisine: 'French', rating: 4.7, distance: '0.8 km', price: '$$', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300' },
  { id: 'r3', name: 'Tapas Barcelona', cuisine: 'Spanish', rating: 4.8, distance: '1.2 km', price: '$$', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
];

const EVENTS = [
  { id: 'e1', title: 'Cherry Blossom Festival', date: 'Apr 1–15', location: 'Tokyo', emoji: '🌸' },
  { id: 'e2', title: 'Carnival of Venice', date: 'Feb 10–20', location: 'Venice', emoji: '🎭' },
  { id: 'e3', title: 'Oktoberfest', date: 'Sep 16 – Oct 3', location: 'Munich', emoji: '🍺' },
  { id: 'e4', title: 'La Tomatina', date: 'Aug 28', location: 'Valencia', emoji: '🍅' },
];

const CITY_PULSE = [
  { id: 'cp1', city: 'Bangkok', metric: '🔥 Trending', value: '+42%', color: COLORS.gold },
  { id: 'cp2', city: 'Lisbon', metric: '✈️ Flights', value: '$289', color: COLORS.blue },
  { id: 'cp3', city: 'Cape Town', metric: '🌤 Weather', value: '24°C', color: COLORS.success },
];

function DestinationGridItem({ item }) {
  return (
    <TouchableOpacity style={[styles.gridItem, { width: GRID_ITEM }]} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.gridItemImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.md }}
      >
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.gridGradient}>
          <Text style={styles.gridItemEmoji}>{item.emoji}</Text>
          <Text style={styles.gridItemName}>{item.name}</Text>
          <Text style={styles.gridItemCountry}>{item.country}</Text>
          <View style={styles.gridRating}>
            <Ionicons name="star" size={10} color={COLORS.gold} />
            <Text style={styles.gridRatingText}>{item.rating}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function HiddenGemCard({ item }) {
  return (
    <TouchableOpacity style={styles.gemCard} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.gemCardImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.md }}
      >
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gemGradient}>
          <View style={styles.gemBadge}>
            <Text style={styles.gemBadgeText}>💎 Hidden Gem</Text>
          </View>
          <Text style={styles.gemName}>{item.name}</Text>
          <Text style={styles.gemCountry}>{item.country}</Text>
          <Text style={styles.gemDesc} numberOfLines={2}>{item.description}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function RestaurantCard({ item }) {
  return (
    <GlassmorphicCard style={styles.restCard}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.restImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.md }}
      />
      <View style={styles.restInfo}>
        <Text style={styles.restName}>{item.name}</Text>
        <Text style={styles.restCuisine}>{item.cuisine} · {item.price}</Text>
        <View style={styles.restMeta}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={COLORS.gold} />
            <Text style={styles.restRating}>{item.rating}</Text>
          </View>
          <Text style={styles.restDistance}>{item.distance}</Text>
        </View>
      </View>
    </GlassmorphicCard>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredDests = ALL_DESTINATIONS.filter(d =>
    (activeCategory === 'all' || d.category === activeCategory) &&
    (searchText === '' || d.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy, COLORS.navyMid]} style={StyleSheet.absoluteFillObject} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.screenTitle}>Discover 🌏</Text>
          <Text style={styles.screenSubtitle}>Find your next adventure</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <GlassmorphicCard style={styles.searchCard}>
            <View style={styles.searchInner}>
              <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations..."
                placeholderTextColor={COLORS.textMuted}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </GlassmorphicCard>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
          style={styles.categoriesWrap}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={activeCategory === cat.id ? COLORS.navyDark : COLORS.textSecondary}
              />
              <Text style={[styles.catLabel, activeCategory === cat.id && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Destinations Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🗺 Destinations</Text>
          </View>
          <View style={styles.grid}>
            {filteredDests.map((item, index) => (
              <DestinationGridItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Hidden Gems */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💎 Hidden Gems</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {HIDDEN_GEMS.map((item) => (
              <View key={item.id} style={{ marginRight: 12 }}>
                <HiddenGemCard item={item} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Restaurants Nearby */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍽 Nearby Restaurants</Text>
          </View>
          <View style={styles.restaurantsList}>
            {RESTAURANTS.map((item) => (
              <View key={item.id} style={{ marginBottom: 10 }}>
                <RestaurantCard item={item} />
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎉 Upcoming Events</Text>
          </View>
          <View style={styles.eventsContainer}>
            {EVENTS.map((event) => (
              <GlassmorphicCard key={event.id} style={styles.eventCard}>
                <View style={styles.eventContent}>
                  <Text style={styles.eventEmoji}>{event.emoji}</Text>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>📍 {event.location} · 📅 {event.date}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </GlassmorphicCard>
            ))}
          </View>
        </View>

        {/* Live City Pulse */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📡 City Pulse</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {CITY_PULSE.map((item) => (
              <GlassmorphicCard key={item.id} style={styles.pulseCard}>
                <View style={styles.pulseContent}>
                  <Text style={styles.pulseCity}>{item.city}</Text>
                  <Text style={styles.pulseMetric}>{item.metric}</Text>
                  <Text style={[styles.pulseValue, { color: item.color }]}>{item.value}</Text>
                </View>
              </GlassmorphicCard>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  scroll: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  screenSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  searchSection: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  searchCard: {},
  searchInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 13, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary },

  categoriesWrap: { marginBottom: SPACING.md },
  categoriesScroll: { paddingHorizontal: SPACING.md, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  catChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  catLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  catLabelActive: { color: COLORS.navyDark },

  section: { marginBottom: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },
  horizontalList: { paddingHorizontal: SPACING.md },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, paddingHorizontal: SPACING.md,
  },
  gridItem: { height: 160 },
  gridItemImage: { width: '100%', height: '100%' },
  gridGradient: { flex: 1, borderRadius: BORDER_RADIUS.md, justifyContent: 'flex-end', padding: 10 },
  gridItemEmoji: { fontSize: 16 },
  gridItemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  gridItemCountry: { fontSize: 11, color: COLORS.textSecondary },
  gridRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  gridRatingText: { fontSize: 11, color: COLORS.gold, fontWeight: '600' },

  gemCard: { width: 220, height: 180 },
  gemCardImage: { width: '100%', height: '100%' },
  gemGradient: { flex: 1, borderRadius: BORDER_RADIUS.md, justifyContent: 'flex-end', padding: 10 },
  gemBadge: {
    alignSelf: 'flex-start', marginBottom: 6,
    backgroundColor: 'rgba(139,92,246,0.4)',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  gemBadgeText: { fontSize: 10, color: '#C4B5FD', fontWeight: '600' },
  gemName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  gemCountry: { fontSize: 12, color: COLORS.textSecondary },
  gemDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },

  restaurantsList: { paddingHorizontal: SPACING.md },
  restCard: {},
  restCardInner: { flexDirection: 'row', gap: 12 },
  restImage: { width: 70, height: 70, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  restInfo: { flex: 1, padding: 10, gap: 3 },
  restName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  restCuisine: { fontSize: 12, color: COLORS.textSecondary },
  restMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  restRating: { fontSize: 12, color: COLORS.gold, fontWeight: '600' },
  restDistance: { fontSize: 12, color: COLORS.textMuted },

  eventsContainer: { paddingHorizontal: SPACING.md, gap: 10 },
  eventCard: {},
  eventContent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  eventEmoji: { fontSize: 28 },
  eventInfo: { flex: 1, gap: 3 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  eventMeta: { fontSize: 11, color: COLORS.textSecondary },

  pulseCard: { width: 130, marginRight: 12 },
  pulseContent: { padding: SPACING.md, gap: 4 },
  pulseCity: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  pulseMetric: { fontSize: 11, color: COLORS.textSecondary },
  pulseValue: { fontSize: 20, fontWeight: '800' },
});
