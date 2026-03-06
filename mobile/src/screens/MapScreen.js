import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import GlassmorphicCard from '../components/Common/GlassmorphicCard';
import WeatherWidget from '../components/Map/WeatherWidget';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const MAP_FILTERS = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'food', label: 'Food', icon: 'restaurant-outline' },
  { id: 'nightlife', label: 'Nightlife', icon: 'wine-outline' },
  { id: 'museums', label: 'Museums', icon: 'library-outline' },
  { id: 'parks', label: 'Parks', icon: 'leaf-outline' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-outline' },
];

const MAP_MARKERS = [
  { id: '1', type: 'food', title: 'Sushi Jiro', subtitle: '★ 4.9 · $$$', lat: 35.6897, lng: 139.6894, emoji: '🍣' },
  { id: '2', type: 'museums', title: 'Tokyo National Museum', subtitle: '★ 4.7 · Free', lat: 35.7188, lng: 139.7765, emoji: '🏛' },
  { id: '3', type: 'parks', title: 'Shinjuku Gyoen', subtitle: '★ 4.8 · ¥500', lat: 35.6851, lng: 139.7101, emoji: '🌳' },
  { id: '4', type: 'nightlife', title: 'Bar Shaft', subtitle: '★ 4.5 · $$', lat: 35.6938, lng: 139.7034, emoji: '🍸' },
  { id: '5', type: 'shopping', title: 'Harajuku', subtitle: '★ 4.6 · Trendy', lat: 35.6702, lng: 139.7026, emoji: '🛍' },
  { id: '6', type: 'food', title: 'Ramen Ichiran', subtitle: '★ 4.8 · $', lat: 35.6935, lng: 139.7036, emoji: '🍜' },
];

const TYPE_COLORS = {
  food: '#F59E0B',
  nightlife: '#8B5CF6',
  museums: '#3B82F6',
  parks: '#10B981',
  shopping: '#EC4899',
  all: COLORS.gold,
};

function MapMarkerPin({ type, emoji }) {
  const color = TYPE_COLORS[type] || COLORS.gold;
  return (
    <View style={[styles.pinContainer]}>
      <View style={[styles.pin, { backgroundColor: color }]}>
        <Text style={styles.pinEmoji}>{emoji}</Text>
      </View>
      <View style={[styles.pinTail, { borderTopColor: color }]} />
    </View>
  );
}

function PlaceSheet({ place, onClose }) {
  if (!place) return null;
  const color = TYPE_COLORS[place.type] || COLORS.gold;

  return (
    <GlassmorphicCard style={styles.bottomSheet} intensity={40}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <View style={[styles.placeIconWrap, { backgroundColor: color + '22' }]}>
            <Text style={styles.placeEmoji}>{place.emoji}</Text>
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{place.title}</Text>
            <Text style={styles.placeSubtitle}>{place.subtitle}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sheetActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color + '22', borderColor: color + '44' }]}>
            <Ionicons name="navigate-outline" size={16} color={color} />
            <Text style={[styles.actionText, { color }]}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.glassBg, borderColor: COLORS.glassBorder }]}>
            <Ionicons name="bookmark-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.glassBg, borderColor: COLORS.glassBorder }]}>
            <Ionicons name="share-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlassmorphicCard>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showWeather, setShowWeather] = useState(false);

  // Map region state
  const [mapRegion, setMapRegion] = useState({
    latitude: 35.6892,
    longitude: 139.6921,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        setMapRegion((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
    })();
  }, []);

  const visibleMarkers = MAP_MARKERS.filter(m =>
    activeFilter === 'all' || m.type === activeFilter
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : null}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        customMapStyle={MAP_STYLE}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
        onPress={() => setSelectedPlace(null)}
      >
        {visibleMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            onPress={() => setSelectedPlace(marker)}
            tracksViewChanges={false}
          >
            <MapMarkerPin type={marker.type} emoji={marker.emoji} />
          </Marker>
        ))}
      </MapView>

      {/* Top Search Bar */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 10 }]}>
        <GlassmorphicCard style={styles.searchCard} intensity={60}>
          <View style={styles.searchInner}>
            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search places on map...</Text>
            <TouchableOpacity
              style={styles.filterIconBtn}
              onPress={() => setShowWeather((v) => !v)}
            >
              <Ionicons name={showWeather ? 'partly-sunny' : 'partly-sunny-outline'} size={18} color={showWeather ? COLORS.gold : COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </GlassmorphicCard>

        {/* Weather widget */}
        {showWeather && userLocation && (
          <View style={{ marginTop: SPACING.sm }}>
            <WeatherWidget lat={userLocation.lat} lon={userLocation.lon} />
          </View>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersOverlay}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {MAP_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                activeFilter === f.id && {
                  backgroundColor: TYPE_COLORS[f.id] || COLORS.gold,
                  borderColor: TYPE_COLORS[f.id] || COLORS.gold,
                },
              ]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Ionicons
                name={f.icon}
                size={13}
                color={activeFilter === f.id ? COLORS.navyDark : COLORS.textSecondary}
              />
              <Text style={[
                styles.filterLabel,
                activeFilter === f.id && { color: COLORS.navyDark },
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* My Location Button */}
      <TouchableOpacity style={styles.locationBtn}>
        <GlassmorphicCard style={styles.locationBtnCard} intensity={60}>
          <View style={styles.locationBtnInner}>
            <Ionicons name="locate-outline" size={22} color={COLORS.gold} />
          </View>
        </GlassmorphicCard>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      {selectedPlace && (
        <View style={[styles.sheetOverlay, { paddingBottom: insets.bottom + 80 }]}>
          <PlaceSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
        </View>
      )}
    </View>
  );
}

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f1629' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1629' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  topOverlay: {
    position: 'absolute', left: SPACING.md, right: SPACING.md,
    zIndex: 10,
  },
  searchCard: {},
  searchInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: SPACING.md, paddingVertical: 13,
  },
  searchPlaceholder: { flex: 1, fontSize: 15, color: COLORS.textMuted },
  filterIconBtn: {},

  filtersOverlay: {
    position: 'absolute', top: 110, left: 0, right: 0,
    zIndex: 10,
  },
  filtersScroll: { paddingHorizontal: SPACING.md, gap: 8 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(15,22,41,0.85)',
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  filterLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  locationBtn: {
    position: 'absolute', right: SPACING.md, bottom: 200,
    zIndex: 10,
  },
  locationBtnCard: {},
  locationBtnInner: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  pinContainer: { alignItems: 'center' },
  pin: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  pinEmoji: { fontSize: 18 },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  sheetOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.md,
    zIndex: 20,
  },
  bottomSheet: {},
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  sheetContent: { padding: SPACING.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACING.md },
  placeIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  placeEmoji: { fontSize: 24 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  placeSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  closeBtn: { padding: 4 },

  sheetActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
});
