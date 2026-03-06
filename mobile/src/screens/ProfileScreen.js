import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import AnimatedFlightPaths, { FlightStatsPanel } from '../components/Map/AnimatedFlightPaths';
import { useAuth } from '../hooks/useAuth';
import { getTravelHistory, getFlightHistory, getTrips } from '../services/api';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const SETTINGS_ITEMS = [
  { id: 'notifications', icon: 'notifications-outline', label: 'Notifications' },
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
  const imageUrl = trip.cover_image_url || trip.image ||
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300';
  const name = trip.title || trip.name;

  return (
    <TouchableOpacity style={[styles.savedCard, { marginRight: 12 }]} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.savedCardImage}
        imageStyle={{ borderRadius: BORDER_RADIUS.md }}
      >
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.savedGradient}>
          <Text style={styles.savedName}>{name}</Text>
          {trip.destination && <Text style={styles.savedDest}>{trip.destination}</Text>}
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
  const { user, profile, logout, updateProfile, uploadAvatar } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [trips, setTrips] = useState([]);
  const [flightData, setFlightData] = useState({ flights: [], stats: {} });
  const [travelStats, setTravelStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tripsRes, flightRes, historyRes] = await Promise.allSettled([
        getTrips(),
        getFlightHistory(),
        getTravelHistory(),
      ]);

      if (tripsRes.status === 'fulfilled') setTrips(tripsRes.value.data.trips || []);
      if (flightRes.status === 'fulfilled') setFlightData(flightRes.value.data);
      if (historyRes.status === 'fulfilled') setTravelStats(historyRes.value.data.stats);
    } catch {
      // Gracefully handle errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: editName, bio: editBio });
      setEditMode(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorer';
  const displayBio = profile?.bio || 'Passionate traveler exploring the world ✈️';
  const avatar = profile?.avatar_url;
  const banner = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800';

  const completedTrips = trips.filter((t) => t.status === 'completed');
  const stats = {
    trips: trips.length,
    countries: travelStats?.countriesVisited || flightData.stats?.countriesVisited || 0,
    cities: travelStats?.citiesVisited || 0,
    miles: travelStats?.totalMilesFlown || flightData.stats?.totalMiles || 0,
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy, COLORS.navyMid]} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} colors={[COLORS.gold]} />
        }
      >
        {/* Banner & Avatar */}
        <View style={styles.bannerSection}>
          <ImageBackground
            source={{ uri: banner }}
            style={[styles.banner, { paddingTop: insets.top }]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(10,14,26,0.9)']}
              style={styles.bannerGradient}
            >
              <TouchableOpacity style={styles.editBtn} onPress={() => {
                setEditName(displayName);
                setEditBio(displayBio);
                setEditMode(true);
              }}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.textPrimary} />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>{displayName[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark" size={10} color={COLORS.navyDark} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              {profile?.username && <Text style={styles.profileHandle}>@{profile.username}</Text>}
              <Text style={styles.profileBio} numberOfLines={2}>{displayBio}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={stats.trips} label="Trips" icon="airplane-outline" />
          <StatCard value={stats.countries} label="Countries" icon="globe-outline" />
          <StatCard value={stats.cities} label="Cities" icon="business-outline" />
          <StatCard value={stats.miles >= 1000 ? `${(stats.miles / 1000).toFixed(0)}K` : stats.miles} label="Miles" icon="navigate-outline" />
        </View>

        {/* Flight Map */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✈️ Travel Map</Text>
          </View>
          <View style={{ paddingHorizontal: SPACING.md }}>
            <AnimatedFlightPaths flights={flightData.flights || []} height={160} />
          </View>
          {flightData.stats && (
            <View style={{ paddingHorizontal: SPACING.md, marginTop: SPACING.sm }}>
              <FlightStatsPanel stats={flightData.stats} />
            </View>
          )}
        </View>

        {/* Recent Trips */}
        {trips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📌 My Trips</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {trips.slice(0, 6).map((trip) => (
                <SavedTripCard key={trip.id} trip={trip} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Completed Trips History */}
        {completedTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🗺 Travel History</Text>
            </View>
            <View style={styles.historyContainer}>
              {completedTrips.map((trip) => (
                <GlassmorphicCard key={trip.id} style={styles.historyCard}>
                  <View style={styles.historyCardContent}>
                    <Text style={styles.historyEmoji}>✅</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyCont}>{trip.title}</Text>
                      <Text style={styles.historyCount}>{trip.destination}</Text>
                      {trip.start_date && (
                        <Text style={styles.historyCountries}>{trip.start_date} → {trip.end_date}</Text>
                      )}
                    </View>
                  </View>
                </GlassmorphicCard>
              ))}
            </View>
          </View>
        )}

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
          <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>AtlasTrip v1.0.0 · Made with ❤️</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editMode} transparent animationType="slide" onRequestClose={() => setEditMode(false)}>
        <View style={styles.editModalOverlay}>
          <GlassmorphicCard style={styles.editModal}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditMode(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <View style={[styles.inputWrap, { height: 80, alignItems: 'flex-start', paddingTop: SPACING.sm }]}>
                <TextInput style={[styles.input, { height: 60 }]} value={editBio} onChangeText={setEditBio} placeholder="Tell us about yourself..." placeholderTextColor={COLORS.textMuted} multiline />
              </View>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleEditSave} disabled={saving}>
              <LinearGradient colors={[COLORS.gold, COLORS.goldDark]} style={styles.createBtnGradient}>
                {saving ? <ActivityIndicator size="small" color={COLORS.navyDark} /> : (
                  <>
                    <Ionicons name="checkmark" size={20} color={COLORS.navyDark} />
                    <Text style={styles.createBtnText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassmorphicCard>
        </View>
      </Modal>
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
  savedDest: { fontSize: 10, color: COLORS.textSecondary },

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

  avatarPlaceholder: {
    backgroundColor: COLORS.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.gold,
  },

  editModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  editModal: {
    margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: SPACING.lg, paddingBottom: 40,
  },
  editModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg,
  },
  editModalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },

  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.navyLight, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: SPACING.md },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary, paddingVertical: SPACING.sm },

  createBtn: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  createBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  createBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark },
});
