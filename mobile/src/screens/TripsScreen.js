import React, { useState, useCallback, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import AITripOptimizer from '../components/AI/AITripOptimizer';
import TripReplay from '../components/Trips/TripReplay';
import FlightBookingModal from '../components/Booking/FlightBookingModal';
import { useRealtimeTrip } from '../hooks/useRealtimeTrip';
import {
  getTrips, createTrip, deleteTrip, shareTrip,
} from '../services/api';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const STATUS_COLORS = {
  active: COLORS.success,
  planning: COLORS.blue,
  completed: COLORS.textMuted,
  cancelled: COLORS.error,
};

const TYPE_ICONS = {
  hotel: 'bed-outline',
  flight: 'airplane-outline',
  sightseeing: 'camera-outline',
  food: 'restaurant-outline',
  restaurant: 'restaurant-outline',
  activity: 'walk-outline',
  culture: 'library-outline',
  shopping: 'bag-outline',
  transport: 'car-outline',
  event: 'calendar-outline',
  note: 'document-text-outline',
};

const TYPE_COLORS = {
  hotel: '#10B981',
  flight: '#8B5CF6',
  restaurant: '#F59E0B',
  food: '#F59E0B',
  activity: '#3B82F6',
  sightseeing: '#06B6D4',
  transport: '#EC4899',
  event: '#F97316',
  note: '#94A3B8',
};

function TripCard({ trip, onPress, onDelete }) {
  const imageUrl = trip.cover_image_url || trip.coverImage ||
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600';

  const daysLeft = trip.start_date
    ? Math.max(0, Math.ceil((new Date(trip.start_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <TouchableOpacity style={styles.tripCard} activeOpacity={0.85} onPress={onPress}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.tripCardBg}
        imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100' }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.tripCardGradient}
        >
          <View style={styles.tripCardTop}>
            <View style={styles.tripStatusBadge}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[trip.status] || COLORS.textMuted }]} />
              <Text style={[styles.statusText, { color: STATUS_COLORS[trip.status] || COLORS.textMuted }]}>
                {(trip.status || 'planning').charAt(0).toUpperCase() + (trip.status || 'planning').slice(1)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onDelete(trip.id); }}
              style={styles.tripDeleteBtn}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tripCardBody}>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            <Text style={styles.tripDestination}>{trip.destination}</Text>
            <View style={styles.tripMeta}>
              {trip.start_date && (
                <View style={styles.tripMetaItem}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.tripMetaText}>{trip.start_date}</Text>
                </View>
              )}
            </View>
            {daysLeft > 0 && trip.status !== 'completed' && (
              <View style={styles.daysLeftBadge}>
                <Text style={styles.daysLeftText}>✈️ {daysLeft} days away</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function ItineraryItemCard({ item, isLast, onPress }) {
  const color = TYPE_COLORS[item.type] || COLORS.blue;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.itinItem}>
        <View style={styles.itinTimeline}>
          <View style={[styles.itinDot, { backgroundColor: color }]} />
          {!isLast && <View style={styles.itinLine} />}
        </View>
        <GlassmorphicCard style={styles.itinCard}>
          <View style={styles.itinCardContent}>
            <View style={styles.itinHeader}>
              <View style={[styles.itinIconWrap, { backgroundColor: color + '22' }]}>
                <Ionicons name={TYPE_ICONS[item.type] || 'pin-outline'} size={14} color={color} />
              </View>
              {item.start_time && <Text style={styles.itinTime}>{item.start_time}</Text>}
              <View style={[styles.dayBadge]}>
                <Text style={styles.dayBadgeText}>Day {item.day_number}</Text>
              </View>
            </View>
            <Text style={styles.itinTitle}>{item.name}</Text>
            {item.location && (
              <View style={styles.itinLocation}>
                <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
                <Text style={styles.itinLocationText}>{item.location}</Text>
              </View>
            )}
            {item.cost && (
              <Text style={styles.itinCost}>${item.cost}</Text>
            )}
            {item.notes && (
              <Text style={styles.itinNotes}>💡 {item.notes}</Text>
            )}
          </View>
        </GlassmorphicCard>
      </View>
    </TouchableOpacity>
  );
}

function CreateTripModal({ visible, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Trip name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await createTrip({ title, destination, start_date: startDate || null, end_date: endDate || null });
      onCreate?.(res.data.trip);
      setTitle(''); setDestination(''); setStartDate(''); setEndDate('');
      onClose();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <GlassmorphicCard style={styles.modalCard}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✈️ New Trip</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Name *</Text>
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
                    placeholder="2025-01-15"
                    placeholderTextColor={COLORS.textMuted}
                    value={startDate}
                    onChangeText={setStartDate}
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
                    placeholder="2025-01-22"
                    placeholderTextColor={COLORS.textMuted}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                style={styles.createBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.navyDark} />
                ) : (
                  <>
                    <Ionicons name="add" size={20} color={COLORS.navyDark} />
                    <Text style={styles.createBtnText}>Create Trip</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassmorphicCard>
      </View>
    </Modal>
  );
}

// Itinerary view with real-time data and all features
function TripDetailView({ trip, onBack, onRefreshList }) {
  const [activeFeature, setActiveFeature] = useState(null); // 'optimizer' | 'replay' | 'flights' | 'chat'
  const { itineraryItems, comments, collaborators, loading, refresh, addItem, deleteItem } = useRealtimeTrip(trip.id);
  const [addItemModal, setAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('activity');
  const [newItemDay, setNewItemDay] = useState('1');
  const [addLoading, setAddLoading] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    setAddLoading(true);
    try {
      await addItem({ name: newItemName, type: newItemType, day_number: parseInt(newItemDay) || 1, sort_order: itineraryItems.length });
      setNewItemName(''); setAddItemModal(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await shareTrip(trip.id);
      Alert.alert('Trip Shared!', `Share link: atlastrip://trips/shared/${res.data.shareToken}`);
    } catch {
      Alert.alert('Error', 'Could not share trip');
    }
  };

  const FEATURE_BUTTONS = [
    { id: 'optimizer', label: 'AI Optimize', icon: 'sparkles-outline', color: '#7C3AED' },
    { id: 'replay', label: 'Trip Replay', icon: 'play-circle-outline', color: '#EC4899' },
    { id: 'flights', label: 'Flights', icon: 'airplane-outline', color: '#8B5CF6' },
    { id: 'chat', label: 'AI Chat', icon: 'chatbubble-ellipses-outline', color: COLORS.gold },
  ];

  if (activeFeature === 'optimizer') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setActiveFeature(null)} style={styles.featureBackBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to Trip</Text>
        </TouchableOpacity>
        <AITripOptimizer tripId={trip.id} onApply={() => { setActiveFeature(null); refresh(); }} />
      </View>
    );
  }

  if (activeFeature === 'replay') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setActiveFeature(null)} style={styles.featureBackBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to Trip</Text>
        </TouchableOpacity>
        <TripReplay trip={trip} itineraryItems={itineraryItems} />
      </View>
    );
  }

  if (activeFeature === 'flights') {
    return (
      <>
        <TouchableOpacity onPress={() => setActiveFeature(null)} style={styles.featureBackBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to Trip</Text>
        </TouchableOpacity>
        <FlightBookingModal
          visible
          onClose={() => setActiveFeature(null)}
          tripId={trip.id}
          onFlightSaved={refresh}
        />
      </>
    );
  }

  return (
    <ScrollView style={styles.itinView} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        <Text style={styles.backText}>All Trips</Text>
      </TouchableOpacity>

      {/* Trip Hero */}
      <View style={styles.itinHeroCard}>
        <ImageBackground
          source={{ uri: trip.cover_image_url || trip.coverImage || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' }}
          style={styles.itinHeroBg}
          imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.itinHeroGrad}>
            <View>
              <Text style={styles.itinHeroTitle}>{trip.title}</Text>
              <Text style={styles.itinHeroDest}>{trip.destination}</Text>
              {trip.start_date && (
                <Text style={styles.itinHeroDates}>{trip.start_date} → {trip.end_date}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Feature Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featureButtons} contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}>
        {FEATURE_BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.id}
            style={[styles.featureBtn, { borderColor: btn.color + '40' }]}
            onPress={() => setActiveFeature(btn.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.featureBtnIcon, { backgroundColor: btn.color + '20' }]}>
              <Ionicons name={btn.icon} size={18} color={btn.color} />
            </View>
            <Text style={[styles.featureBtnLabel, { color: btn.color }]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Collaborators */}
      {collaborators.length > 0 && (
        <View style={styles.collabRow}>
          <Text style={styles.collabLabel}>With:</Text>
          {collaborators.slice(0, 4).map((c) => (
            <View key={c.user_id} style={styles.collabAvatar}>
              <Text style={styles.collabAvatarText}>
                {(c.profiles?.full_name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          ))}
          {collaborators.length > 4 && (
            <Text style={styles.collabMore}>+{collaborators.length - 4}</Text>
          )}
        </View>
      )}

      {/* Itinerary Header */}
      <View style={styles.itinSectionHeader}>
        <Text style={styles.itinSectionTitle}>📋 Itinerary</Text>
        <TouchableOpacity onPress={() => setAddItemModal(true)} style={styles.addItemBtn}>
          <Ionicons name="add" size={18} color={COLORS.gold} />
          <Text style={styles.addItemBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: SPACING.xl }} />
      ) : itineraryItems.length === 0 ? (
        <GlassmorphicCard style={styles.emptyItinCard}>
          <Ionicons name="map-outline" size={36} color={COLORS.textMuted} />
          <Text style={styles.emptyItinText}>No activities yet</Text>
          <Text style={styles.emptyItinSubtext}>Tap "Add" to start building your itinerary</Text>
        </GlassmorphicCard>
      ) : (
        itineraryItems.map((item, index) => (
          <ItineraryItemCard
            key={item.id}
            item={item}
            isLast={index === itineraryItems.length - 1}
            onPress={() => {
              Alert.alert(item.name, item.notes || 'No notes', [
                { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
                { text: 'Close', style: 'cancel' },
              ]);
            }}
          />
        ))
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <View style={styles.commentsSection}>
          <Text style={styles.itinSectionTitle}>💬 Comments ({comments.length})</Text>
          {comments.slice(-3).map((c) => (
            <GlassmorphicCard key={c.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(c.profiles?.full_name || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.commentAuthor}>{c.profiles?.full_name || 'User'}</Text>
                  <Text style={styles.commentTime}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentText}>{c.content}</Text>
            </GlassmorphicCard>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />

      {/* Add Item Modal */}
      <Modal visible={addItemModal} transparent animationType="slide" onRequestClose={() => setAddItemModal(false)}>
        <View style={styles.modalOverlay}>
          <GlassmorphicCard style={styles.modalCard}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Activity</Text>
                <TouchableOpacity onPress={() => setAddItemModal(false)}>
                  <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity Name *</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="e.g. Visit Eiffel Tower" placeholderTextColor={COLORS.textMuted} value={newItemName} onChangeText={setNewItemName} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Day</Text>
                <View style={styles.inputWrap}>
                  <TextInput style={styles.input} placeholder="1" keyboardType="number-pad" placeholderTextColor={COLORS.textMuted} value={newItemDay} onChangeText={setNewItemDay} />
                </View>
              </View>

              <View style={styles.typeRow}>
                {['activity', 'restaurant', 'hotel', 'flight', 'transport', 'note'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, newItemType === t && styles.typeChipActive]}
                    onPress={() => setNewItemType(t)}
                  >
                    <Ionicons name={TYPE_ICONS[t]} size={14} color={newItemType === t ? COLORS.gold : COLORS.textMuted} />
                    <Text style={[styles.typeChipText, newItemType === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.createBtn} onPress={handleAddItem} disabled={addLoading}>
                <LinearGradient colors={[COLORS.gold, COLORS.goldDark]} style={styles.createBtnGradient}>
                  {addLoading ? <ActivityIndicator size="small" color={COLORS.navyDark} /> : (
                    <>
                      <Ionicons name="add" size={20} color={COLORS.navyDark} />
                      <Text style={styles.createBtnText}>Add to Itinerary</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassmorphicCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      const res = await getTrips();
      setTrips(res.data.trips || []);
    } catch {
      // Use empty array on error (user may not be logged in yet)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [fetchTrips]);

  const handleDeleteTrip = (tripId) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip(tripId);
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
          } catch {
            Alert.alert('Error', 'Failed to delete trip');
          }
        },
      },
    ]);
  };

  const filteredTrips = trips.filter((t) =>
    activeTab === 'active' ? t.status !== 'completed' : t.status === 'completed',
  );

  if (selectedTrip) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.navyDark, COLORS.navy, COLORS.navyMid]} style={StyleSheet.absoluteFillObject} />
        <View style={{ paddingTop: insets.top }}>
          <TripDetailView
            trip={selectedTrip}
            onBack={() => setSelectedTrip(null)}
            onRefreshList={fetchTrips}
          />
        </View>
      </View>
    );
  }

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} colors={[COLORS.gold]} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={styles.screenTitle}>My Trips</Text>
            <Text style={styles.screenSubtitle}>{trips.length} adventures</Text>
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
                {tab === 'active' ? 'Active & Upcoming' : 'Past Trips'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trip Cards */}
        {loading ? (
          <ActivityIndicator color={COLORS.gold} style={{ paddingVertical: SPACING.xl }} />
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🗺️</Text>
            <Text style={styles.emptyStateTitle}>No trips yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeTab === 'active' ? "Start planning your next adventure!" : "Complete a trip to see it here."}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.emptyStateBtn}>
                <LinearGradient colors={[COLORS.gold, COLORS.goldDark]} style={styles.emptyStateBtnGrad}>
                  <Text style={styles.emptyStateBtnText}>Plan a Trip</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.tripsGrid}>
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => setSelectedTrip(trip)}
                onDelete={handleDeleteTrip}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <CreateTripModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(newTrip) => setTrips((prev) => [newTrip, ...prev])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  screenSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  addBtnGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  tabs: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginBottom: SPACING.md, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  tabActive: { backgroundColor: COLORS.gold + '22', borderColor: COLORS.gold },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.gold },

  tripsGrid: { paddingHorizontal: SPACING.md, gap: 16 },
  tripCard: { width: '100%', height: 200, ...SHADOWS.medium },
  tripCardBg: { width: '100%', height: '100%' },
  tripCardGradient: { flex: 1, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, justifyContent: 'space-between' },
  tripCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.round },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  tripDeleteBtn: { padding: 4 },
  tripCardBody: { gap: 2 },
  tripTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  tripDestination: { fontSize: 13, color: COLORS.textSecondary },
  tripMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripMetaText: { fontSize: 11, color: COLORS.textSecondary },
  daysLeftBadge: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: COLORS.gold + '33', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.round, borderWidth: 1, borderColor: COLORS.gold + '66' },
  daysLeftText: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },

  itinView: { paddingHorizontal: SPACING.md },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md, paddingTop: SPACING.sm },
  backText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  featureBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: SPACING.md },

  itinHeroCard: { height: 160, marginBottom: SPACING.md },
  itinHeroBg: { width: '100%', height: '100%' },
  itinHeroGrad: { flex: 1, borderRadius: BORDER_RADIUS.lg, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md },
  itinHeroTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  itinHeroDest: { fontSize: 13, color: COLORS.textSecondary },
  itinHeroDates: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  shareBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 },

  featureButtons: { marginBottom: SPACING.md },
  featureBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.navyLight, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1 },
  featureBtnIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  featureBtnLabel: { fontSize: 13, fontWeight: '600' },

  collabRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  collabLabel: { color: COLORS.textSecondary, fontSize: 12 },
  collabAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.blue + '40', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.blue },
  collabAvatarText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  collabMore: { color: COLORS.textMuted, fontSize: 12 },

  itinSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  itinSectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gold + '22', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.round, borderWidth: 1, borderColor: COLORS.gold + '44' },
  addItemBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },

  itinItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  itinTimeline: { width: 20, alignItems: 'center', paddingTop: 6 },
  itinDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  itinLine: { flex: 1, width: 2, backgroundColor: COLORS.navyLight, marginTop: 4 },
  itinCard: { flex: 1 },
  itinCardContent: { padding: SPACING.sm, gap: 4 },
  itinHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itinIconWrap: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itinTime: { fontSize: 12, color: COLORS.gold, fontWeight: '600' },
  dayBadge: { backgroundColor: COLORS.navyDark, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.round },
  dayBadgeText: { color: COLORS.textMuted, fontSize: 10 },
  itinTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  itinLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  itinLocationText: { fontSize: 11, color: COLORS.textMuted },
  itinCost: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  itinNotes: { fontSize: 11, color: COLORS.textSecondary, fontStyle: 'italic' },

  emptyItinCard: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.md },
  emptyItinText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  emptyItinSubtext: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },

  commentsSection: { marginTop: SPACING.md, marginBottom: SPACING.md },
  commentCard: { padding: SPACING.md, marginBottom: SPACING.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.blue + '40', alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  commentAuthor: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  commentTime: { color: COLORS.textMuted, fontSize: 11 },
  commentText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.xl, gap: SPACING.md },
  emptyStateEmoji: { fontSize: 64 },
  emptyStateTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  emptyStateSubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  emptyStateBtn: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  emptyStateBtnGrad: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  emptyStateBtnText: { color: COLORS.navyDark, fontSize: 15, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  modalContent: { padding: SPACING.md, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },

  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.navyLight, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: SPACING.md, paddingVertical: 13 },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  dateRow: { flexDirection: 'row' },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.navyLight, borderWidth: 1, borderColor: COLORS.glassBorder },
  typeChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '22' },
  typeChipText: { fontSize: 11, color: COLORS.textMuted, textTransform: 'capitalize' },
  typeChipTextActive: { color: COLORS.gold },

  createBtn: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  createBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  createBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark },
});
