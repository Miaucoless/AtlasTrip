import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const USER_PROFILE = {
  name: 'Alex Johnson',
  handle: '@alexexplores',
  bio: 'Passionate traveler · 47 countries · Coffee lover ☕',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  banner: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
  stats: {
    trips: 24,
    countries: 47,
    miles: '128K',
    cities: 89,
  },
};

const SAVED_TRIPS = [
  { id: '1', name: 'Tokyo 2025', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300', emoji: '🇯🇵' },
  { id: '2', name: 'Santorini', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300', emoji: '🇬🇷' },
  { id: '3', name: 'Bali Retreat', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300', emoji: '🇮🇩' },
];

const FAVORITES = [
  { id: '1', name: 'Paris', country: 'France', emoji: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200' },
  { id: '2', name: 'Tokyo', country: 'Japan', emoji: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200' },
  { id: '3', name: 'New York', country: 'USA', emoji: '🇺🇸', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200' },
  { id: '4', name: 'Bali', country: 'Indonesia', emoji: '🇮🇩', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200' },
];

const TRAVEL_HISTORY = [
  { continent: 'Europe', countries: ['France', 'Italy', 'Greece', 'Spain', 'Germany', 'Portugal', 'UK'], emoji: '🌍' },
  { continent: 'Asia', countries: ['Japan', 'Thailand', 'Indonesia', 'Singapore', 'India', 'UAE'], emoji: '🌏' },
  { continent: 'Americas', countries: ['USA', 'Canada', 'Mexico', 'Brazil', 'Peru', 'Argentina'], emoji: '🌎' },
  { continent: 'Oceania', countries: ['Australia', 'New Zealand', 'Fiji'], emoji: '🗺' },
];

const SETTINGS_ITEMS = [
  { id: 'notifications', icon: 'notifications-outline', label: 'Notifications', badge: '3' },
  { id: 'privacy', icon: 'shield-outline', label: 'Privacy & Security' },
  { id: 'currency', icon: 'cash-outline', label: 'Currency & Units', value: 'USD' },
  { id: 'language', icon: 'language-outline', label: 'Language', value: 'English' },
  { id: 'offline', icon: 'cloud-download-outline', label: 'Offline Data' },
  { id: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
  { id: 'about', icon: 'information-circle-outline', label: 'About AtlasTrip' },
];

function StatCard({ value, label, icon }) {
  return (
    <GlassmorphicCard style={styles.statCard}>
      <View style={styles.statContent}>
        <Ionicons name={icon} size={20} color={COLORS.gold} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </GlassmorphicCard>
  );
}

function SavedTripCard({ trip }) {
  return (
    <TouchableOpacity style={styles.savedCard} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: trip.image }}
        style={styles.savedCardImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.md }}
      >
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.savedGradient}>
          <Text style={styles.savedEmoji}>{trip.emoji}</Text>
          <Text style={styles.savedName}>{trip.name}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function FavoriteItem({ item }) {
  return (
    <TouchableOpacity style={styles.favItem} activeOpacity={0.8}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.favImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.sm }}
      >
        <View style={styles.favOverlay}>
          <Text style={styles.favEmoji}>{item.emoji}</Text>
        </View>
      </ImageBackground>
      <Text style={styles.favName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.favCountry} numberOfLines={1}>{item.country}</Text>
    </TouchableOpacity>
  );
}

function SettingsRow({ item }) {
  return (
    <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
      <View style={styles.settingsLeft}>
        <View style={styles.settingsIconWrap}>
          <Ionicons name={item.icon} size={18} color={COLORS.gold} />
        </View>
        <Text style={styles.settingsLabel}>{item.label}</Text>
      </View>
      <View style={styles.settingsRight}>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.value && <Text style={styles.settingsValue}>{item.value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [editMode, setEditMode] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy, COLORS.navyMid]} style={StyleSheet.absoluteFillObject} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner & Avatar */}
        <View style={styles.bannerSection}>
          <ImageBackground
            source={{ uri: USER_PROFILE.banner }}
            style={[styles.banner, { paddingTop: insets.top }]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(10,14,26,0.9)']}
              style={styles.bannerGradient}
            >
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(!editMode)}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.textPrimary} />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: USER_PROFILE.avatar }} style={styles.avatar} />
              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark" size={10} color={COLORS.navyDark} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{USER_PROFILE.name}</Text>
              <Text style={styles.profileHandle}>{USER_PROFILE.handle}</Text>
              <Text style={styles.profileBio} numberOfLines={2}>{USER_PROFILE.bio}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={USER_PROFILE.stats.trips} label="Trips" icon="airplane-outline" />
          <StatCard value={USER_PROFILE.stats.countries} label="Countries" icon="globe-outline" />
          <StatCard value={USER_PROFILE.stats.cities} label="Cities" icon="business-outline" />
          <StatCard value={USER_PROFILE.stats.miles} label="Miles" icon="navigate-outline" />
        </View>

        {/* Saved Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📌 Saved Trips</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {SAVED_TRIPS.map((trip) => (
              <View key={trip.id} style={{ marginRight: 12 }}>
                <SavedTripCard trip={trip} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❤️ Favorites</Text>
          </View>
          <View style={styles.favGrid}>
            {FAVORITES.map((item) => (
              <FavoriteItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Travel History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🗺 Travel History</Text>
          </View>
          <View style={styles.historyContainer}>
            {TRAVEL_HISTORY.map((region) => (
              <GlassmorphicCard key={region.continent} style={styles.historyCard}>
                <View style={styles.historyCardContent}>
                  <Text style={styles.historyEmoji}>{region.emoji}</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyCont}>{region.continent}</Text>
                    <Text style={styles.historyCount}>{region.countries.length} countries visited</Text>
                    <Text style={styles.historyCountries} numberOfLines={1}>
                      {region.countries.join(' · ')}
                    </Text>
                  </View>
                </View>
              </GlassmorphicCard>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          </View>
          <GlassmorphicCard style={styles.settingsCard}>
            {SETTINGS_ITEMS.map((item, index) => (
              <View key={item.id}>
                <SettingsRow item={item} />
                {index < SETTINGS_ITEMS.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </GlassmorphicCard>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, { paddingHorizontal: SPACING.md }]}>
          <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>AtlasTrip v1.0.0 · Made with ❤️</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  scroll: { flex: 1 },

  bannerSection: { marginBottom: SPACING.md },
  banner: { height: 180 },
  bannerGradient: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', padding: SPACING.md },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.round,
  },
  editText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },

  avatarSection: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 14,
    paddingHorizontal: SPACING.md, marginTop: -40,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: COLORS.navyDark,
  },
  avatarBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.navyDark,
  },
  profileInfo: { flex: 1, paddingBottom: 6 },
  profileName: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  profileHandle: { fontSize: 12, color: COLORS.gold, fontWeight: '500' },
  profileBio: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, lineHeight: 16 },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.md, gap: 8, marginBottom: SPACING.lg,
  },
  statCard: { flex: 1 },
  statContent: { alignItems: 'center', paddingVertical: 12, gap: 3 },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },

  section: { marginBottom: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },
  horizontalList: { paddingHorizontal: SPACING.md },

  savedCard: { width: 130, height: 100 },
  savedCardImage: { width: '100%', height: '100%' },
  savedGradient: { flex: 1, borderRadius: BORDER_RADIUS.md, justifyContent: 'flex-end', padding: 8 },
  savedEmoji: { fontSize: 18 },
  savedName: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },

  favGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: SPACING.md,
  },
  favItem: { width: (width - SPACING.md * 2 - 30) / 4, alignItems: 'center', gap: 4 },
  favImage: { width: '100%', aspectRatio: 1 },
  favOverlay: {
    ...StyleSheet.absoluteFillObject, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  favEmoji: { fontSize: 22 },
  favName: { fontSize: 11, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  favCountry: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center' },

  historyContainer: { paddingHorizontal: SPACING.md, gap: 10 },
  historyCard: {},
  historyCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  historyEmoji: { fontSize: 28 },
  historyInfo: { flex: 1 },
  historyCont: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  historyCount: { fontSize: 12, color: COLORS.gold, fontWeight: '500' },
  historyCountries: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  settingsCard: {},
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconWrap: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gold + '22', alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontSize: 13, color: COLORS.textSecondary },
  badge: {
    backgroundColor: COLORS.error, borderRadius: BORDER_RADIUS.round,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.glassBorder, marginHorizontal: 14 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.error + '44',
    backgroundColor: COLORS.error + '11',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: COLORS.error },

  versionInfo: { alignItems: 'center', paddingBottom: SPACING.md },
  versionText: { fontSize: 12, color: COLORS.textMuted },
});
