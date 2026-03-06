import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GlobeView from '../components/Globe/GlobeView';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TRENDING_DESTINATIONS,
  FLIGHT_DEALS,
} from '../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.62;

const QUICK_ACTIONS = [
  { id: 'plan', icon: 'map-outline', label: 'Plan Trip', color: '#3B82F6' },
  { id: 'explore', icon: 'compass-outline', label: 'Explore', color: '#10B981' },
  { id: 'food', icon: 'restaurant-outline', label: 'Restaurants', color: '#F59E0B' },
  { id: 'events', icon: 'calendar-outline', label: 'Events', color: '#8B5CF6' },
];

const EXPERIENCES = [
  { id: '1', title: 'Northern Lights in Iceland', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400', price: 299, rating: 4.9 },
  { id: '2', title: 'Safari in Kenya', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400', price: 450, rating: 4.8 },
  { id: '3', title: 'Amalfi Coast Boat Tour', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400', price: 189, rating: 4.7 },
];

function DestinationCard({ item }) {
  return (
    <TouchableOpacity style={styles.destCard} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.destCardImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.destCardGradient}
        >
          <View style={styles.destCardContent}>
            <View style={styles.destRatingBadge}>
              <Ionicons name="star" size={10} color={COLORS.gold} />
              <Text style={styles.destRatingText}>{item.rating}</Text>
            </View>
            <Text style={styles.destCardName}>{item.emoji} {item.name}</Text>
            <Text style={styles.destCardCountry}>{item.country}</Text>
            <Text style={styles.destCardPrice}>From ${item.price}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function FlightDealCard({ deal }) {
  return (
    <GlassmorphicCard style={styles.flightCard}>
      <View style={styles.flightCardInner}>
        <View style={styles.flightRoute}>
          <Text style={styles.flightCity}>{deal.from}</Text>
          <View style={styles.flightArrowWrap}>
            <View style={styles.flightLine} />
            <Ionicons name="airplane" size={14} color={COLORS.gold} style={styles.flightIcon} />
          </View>
          <Text style={styles.flightCity}>{deal.to}</Text>
        </View>
        <Text style={styles.flightAirline}>{deal.airline} · {deal.date}</Text>
        <Text style={styles.flightPrice}>${deal.price}</Text>
      </View>
    </GlassmorphicCard>
  );
}

function ExperienceCard({ item }) {
  return (
    <TouchableOpacity style={styles.expCard} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.expCardImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.md }}
      >
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.expGradient}>
          <View style={styles.expContent}>
            <Text style={styles.expTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.expMeta}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={COLORS.gold} />
                <Text style={styles.expRating}>{item.rating}</Text>
              </View>
              <Text style={styles.expPrice}>From ${item.price}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.navyDark, COLORS.navy, COLORS.navyMid]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
      >
        {/* Globe Hero */}
        <View style={styles.heroSection}>
          <GlobeView style={styles.globe} />

          {/* Top Header */}
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <View>
              <Text style={styles.greeting}>Good Morning ✈️</Text>
              <Text style={styles.userName}>Explorer</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Hero Text Overlay */}
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Where to{'\n'}Next? 🌍</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <GlassmorphicCard style={styles.searchCard}>
            <View style={styles.searchInner}>
              <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations, cities..."
                placeholderTextColor={COLORS.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </GlassmorphicCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickActionBtn} activeOpacity={0.8}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '22' }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={TRENDING_DESTINATIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <DestinationCard item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>

        {/* Flight Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✈️ Flight Deals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {FLIGHT_DEALS.map((deal) => (
              <View key={deal.id} style={{ marginRight: 12 }}>
                <FlightDealCard deal={deal} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Popular Experiences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Top Experiences</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Explore</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {EXPERIENCES.map((item) => (
              <View key={item.id} style={{ marginRight: 12 }}>
                <ExperienceCard item={item} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  scroll: { flex: 1 },

  heroSection: { position: 'relative', height: Dimensions.get('window').height * 0.42 },
  globe: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    zIndex: 10,
  },
  greeting: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  userName: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.gold,
    borderWidth: 1.5, borderColor: COLORS.navyDark,
  },
  heroText: {
    position: 'absolute',
    bottom: 20, left: SPACING.md,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 36, fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 42,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  searchSection: { paddingHorizontal: SPACING.md, marginTop: SPACING.md },
  searchCard: {},
  searchInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 13,
    gap: 10,
  },
  searchInput: {
    flex: 1, fontSize: 15,
    color: COLORS.textPrimary,
  },

  section: { marginTop: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },

  quickActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  quickActionBtn: { alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 58, height: 58, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  quickActionLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },

  horizontalList: { paddingHorizontal: SPACING.md },
  destCard: { width: CARD_WIDTH, height: 200 },
  destCardImage: { width: '100%', height: '100%' },
  destCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  destCardContent: { gap: 2 },
  destRatingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.25)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  destRatingText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },
  destCardName: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  destCardCountry: { fontSize: 12, color: COLORS.textSecondary },
  destCardPrice: { fontSize: 13, color: COLORS.gold, fontWeight: '600', marginTop: 2 },

  flightCard: { width: width * 0.55 },
  flightCardInner: { padding: SPACING.md, gap: 6 },
  flightRoute: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flightCity: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  flightArrowWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  flightLine: { flex: 1, height: 1, backgroundColor: COLORS.textMuted },
  flightIcon: { marginHorizontal: 4 },
  flightAirline: { fontSize: 12, color: COLORS.textSecondary },
  flightPrice: { fontSize: 22, fontWeight: '800', color: COLORS.gold },

  expCard: { width: 180, height: 200 },
  expCardImage: { width: '100%', height: '100%' },
  expGradient: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 10 },
  expContent: { gap: 4 },
  expTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 18 },
  expMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  expRating: { fontSize: 11, color: COLORS.gold, fontWeight: '600' },
  expPrice: { fontSize: 11, color: COLORS.textSecondary },
});
