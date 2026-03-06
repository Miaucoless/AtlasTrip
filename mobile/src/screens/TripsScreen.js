import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Modal,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const MOCK_TRIPS = [
  {
    id: '1',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    startDate: 'Jan 15, 2025',
    endDate: 'Jan 22, 2025',
    itemsCount: 12,
    status: 'active',
    emoji: '🇯🇵',
    daysLeft: 14,
  },
  {
    id: '2',
    title: 'Santorini Escape',
    destination: 'Santorini, Greece',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600',
    startDate: 'Mar 5, 2025',
    endDate: 'Mar 12, 2025',
    itemsCount: 8,
    status: 'planning',
    emoji: '🇬🇷',
    daysLeft: 54,
  },
  {
    id: '3',
    title: 'Bali Retreat',
    destination: 'Bali, Indonesia',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600',
    startDate: 'Sep 10, 2024',
    endDate: 'Sep 18, 2024',
    itemsCount: 15,
    status: 'completed',
    emoji: '🇮🇩',
    daysLeft: 0,
  },
  {
    id: '4',
    title: 'Paris Getaway',
    destination: 'Paris, France',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    startDate: 'Jul 20, 2024',
    endDate: 'Jul 27, 2024',
    itemsCount: 10,
    status: 'completed',
    emoji: '🇫🇷',
    daysLeft: 0,
  },
];

const ITINERARY = [
  { day: 1, time: '09:00', title: 'Arrival & Check-in', type: 'hotel', location: 'Shinjuku Hotel', notes: 'Airport transfer booked' },
  { day: 1, time: '13:00', title: 'Shinjuku Gyoen Garden', type: 'sightseeing', location: 'Shinjuku, Tokyo', notes: 'Pack lunch' },
  { day: 1, time: '19:00', title: 'Ramen Dinner', type: 'food', location: 'Ichiran Ramen, Shinjuku', notes: 'Must try!' },
  { day: 2, time: '08:00', title: 'Senso-ji Temple', type: 'culture', location: 'Asakusa, Tokyo', notes: 'Early morning is less crowded' },
  { day: 2, time: '12:00', title: 'Tsukiji Fish Market', type: 'food', location: 'Tsukiji, Tokyo', notes: 'Fresh sushi for lunch' },
  { day: 2, time: '16:00', title: 'Akihabara Electronics', type: 'shopping', location: 'Akihabara, Tokyo', notes: 'Anime figurines district' },
];

const STATUS_COLORS = {
  active: COLORS.success,
  planning: COLORS.blue,
  completed: COLORS.textMuted,
};

const TYPE_ICONS = {
  hotel: 'bed-outline',
  sightseeing: 'camera-outline',
  food: 'restaurant-outline',
  culture: 'library-outline',
  shopping: 'bag-outline',
};

function TripCard({ trip, onPress }) {
  return (
    <TouchableOpacity style={styles.tripCard} activeOpacity={0.85} onPress={onPress}>
      <ImageBackground
        source={{ uri: trip.coverImage }}
        style={styles.tripCardBg}
        imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.tripCardGradient}
        >
          <View style={styles.tripStatusBadge}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[trip.status] }]} />
            <Text style={[styles.statusText, { color: STATUS_COLORS[trip.status] }]}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Text>
          </View>
          <View style={styles.tripCardBody}>
            <Text style={styles.tripEmoji}>{trip.emoji}</Text>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            <Text style={styles.tripDestination}>{trip.destination}</Text>
            <View style={styles.tripMeta}>
              <View style={styles.tripMetaItem}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.tripMetaText}>{trip.startDate} – {trip.endDate}</Text>
              </View>
              <View style={styles.tripMetaItem}>
                <Ionicons name="list-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.tripMetaText}>{trip.itemsCount} items</Text>
              </View>
            </View>
            {trip.daysLeft > 0 && (
              <View style={styles.daysLeftBadge}>
                <Text style={styles.daysLeftText}>{trip.daysLeft} days away</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function ItineraryItem({ item, isLast }) {
  return (
    <View style={styles.itinItem}>
      <View style={styles.itinTimeline}>
        <View style={[styles.itinDot, { backgroundColor: COLORS.gold }]} />
        {!isLast && <View style={styles.itinLine} />}
      </View>
      <GlassmorphicCard style={styles.itinCard}>
        <View style={styles.itinCardContent}>
          <View style={styles.itinHeader}>
            <View style={styles.itinIconWrap}>
              <Ionicons name={TYPE_ICONS[item.type] || 'pin-outline'} size={14} color={COLORS.gold} />
            </View>
            <Text style={styles.itinTime}>{item.time}</Text>
          </View>
          <Text style={styles.itinTitle}>{item.title}</Text>
          <View style={styles.itinLocation}>
            <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
            <Text style={styles.itinLocationText}>{item.location}</Text>
          </View>
          {item.notes && (
            <Text style={styles.itinNotes}>💡 {item.notes}</Text>
          )}
        </View>
      </GlassmorphicCard>
    </View>
  );
}

function CreateTripModal({ visible, onClose }) {
  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <GlassmorphicCard style={styles.modalCard} intensity={40}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✈️ New Trip</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tokyo Adventure"
                  placeholderTextColor={COLORS.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destination</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Where are you going?"
                  placeholderTextColor={COLORS.textMuted}
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jan 15"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>End Date</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jan 22"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={onClose}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                style={styles.createBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={20} color={COLORS.navyDark} />
                <Text style={styles.createBtnText}>Create Trip</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassmorphicCard>
      </View>
    </Modal>
  );
}

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const filteredTrips = MOCK_TRIPS.filter(t =>
    activeTab === 'active' ? t.status !== 'completed' : t.status === 'completed'
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.navyDark, COLORS.navy, COLORS.navyMid]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={styles.screenTitle}>My Trips</Text>
            <Text style={styles.screenSubtitle}>{MOCK_TRIPS.length} adventures planned</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <LinearGradient
              colors={[COLORS.gold, COLORS.goldDark]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={22} color={COLORS.navyDark} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['active', 'past'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trip Cards */}
        {selectedTrip === null ? (
          <View style={styles.tripsGrid}>
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => setSelectedTrip(trip)}
              />
            ))}
          </View>
        ) : (
          /* Itinerary View */
          <View style={styles.itinView}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedTrip(null)}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
              <Text style={styles.backText}>All Trips</Text>
            </TouchableOpacity>

            <View style={styles.itinHeroCard}>
              <ImageBackground
                source={{ uri: selectedTrip.coverImage }}
                style={styles.itinHeroBg}
                imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
              >
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.itinHeroGrad}>
                  <Text style={styles.itinHeroEmoji}>{selectedTrip.emoji}</Text>
                  <Text style={styles.itinHeroTitle}>{selectedTrip.title}</Text>
                  <Text style={styles.itinHeroDest}>{selectedTrip.destination}</Text>
                </LinearGradient>
              </ImageBackground>
            </View>

            <Text style={styles.itinSectionTitle}>📋 Itinerary</Text>
            {ITINERARY.map((item, index) => (
              <ItineraryItem
                key={index}
                item={item}
                isLast={index === ITINERARY.length - 1}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <CreateTripModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  screenSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  addBtnGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  tab: {
    paddingVertical: 8, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  tabActive: { backgroundColor: COLORS.gold + '22', borderColor: COLORS.gold },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.gold },

  tripsGrid: { paddingHorizontal: SPACING.md, gap: 16 },
  tripCard: { width: '100%', height: 200 },
  tripCardBg: { width: '100%', height: '100%' },
  tripCardGradient: {
    flex: 1, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, justifyContent: 'space-between',
  },
  tripStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  tripCardBody: { gap: 2 },
  tripEmoji: { fontSize: 24 },
  tripTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  tripDestination: { fontSize: 13, color: COLORS.textSecondary },
  tripMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripMetaText: { fontSize: 11, color: COLORS.textSecondary },
  daysLeftBadge: {
    alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: COLORS.gold + '33',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1, borderColor: COLORS.gold + '66',
  },
  daysLeftText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },

  itinView: { paddingHorizontal: SPACING.md },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  backText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  itinHeroCard: { height: 160, marginBottom: SPACING.md },
  itinHeroBg: { width: '100%', height: '100%' },
  itinHeroGrad: { flex: 1, borderRadius: BORDER_RADIUS.lg, justifyContent: 'flex-end', padding: SPACING.md },
  itinHeroEmoji: { fontSize: 28 },
  itinHeroTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  itinHeroDest: { fontSize: 13, color: COLORS.textSecondary },
  itinSectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },

  itinItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  itinTimeline: { width: 20, alignItems: 'center', paddingTop: 6 },
  itinDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  itinLine: { flex: 1, width: 2, backgroundColor: COLORS.navyLight, marginTop: 4 },
  itinCard: { flex: 1 },
  itinCardContent: { padding: SPACING.sm, gap: 4 },
  itinHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itinIconWrap: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.gold + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  itinTime: { fontSize: 12, color: COLORS.gold, fontWeight: '600' },
  itinTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  itinLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  itinLocationText: { fontSize: 11, color: COLORS.textMuted },
  itinNotes: { fontSize: 11, color: COLORS.textSecondary, fontStyle: 'italic' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: { margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  modalContent: { padding: SPACING.md, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },

  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md, paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  dateRow: { flexDirection: 'row' },

  createBtn: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  createBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15,
  },
  createBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark },
});
