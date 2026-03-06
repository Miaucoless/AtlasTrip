import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { searchFlights, saveFlight } from '../../services/api';
import GlassmorphicCard from '../Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function FlightOfferCard({ offer, onSelect }) {
  const outbound = offer.itineraries?.[0];
  const segments = outbound?.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  const depTime = firstSeg?.departure?.at ? new Date(firstSeg.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--';
  const arrTime = lastSeg?.arrival?.at ? new Date(lastSeg.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--';
  const stops = segments.length - 1;

  return (
    <GlassmorphicCard style={styles.offerCard}>
      <TouchableOpacity onPress={() => onSelect(offer)} activeOpacity={0.85}>
        <View style={styles.offerRow}>
          <View style={styles.offerLeft}>
            <Text style={styles.offerCarrier}>{firstSeg?.carrierCode}</Text>
            <Text style={styles.offerTime}>{depTime}</Text>
            <Text style={styles.offerCode}>{firstSeg?.departure?.iataCode}</Text>
          </View>

          <View style={styles.offerMiddle}>
            <Text style={styles.offerDuration}>{outbound?.duration?.replace('PT', '').toLowerCase()}</Text>
            <View style={styles.offerLine}>
              <View style={styles.offerLineDot} />
              <View style={styles.offerLineBar} />
              {stops > 0 && <View style={styles.offerLineStop} />}
              <View style={styles.offerLineBar} />
              <Ionicons name="airplane" size={12} color={COLORS.gold} />
            </View>
            <Text style={styles.offerStops}>{stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}</Text>
          </View>

          <View style={styles.offerRight}>
            <Text style={styles.offerTime}>{arrTime}</Text>
            <Text style={styles.offerCode}>{lastSeg?.arrival?.iataCode}</Text>
          </View>

          <View style={styles.offerPrice}>
            <Text style={styles.offerPriceValue}>${Math.round(offer.price)}</Text>
            <Text style={styles.offerPriceLabel}>per person</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onSelect(offer)} style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>Select</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </GlassmorphicCard>
  );
}

export default function FlightBookingModal({ visible, onClose, tripId, onFlightSaved }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [adults, setAdults] = useState('1');
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!origin || !destination || !departDate) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    setOffers([]);

    try {
      const res = await searchFlights({ origin, destination, departureDate: departDate, adults });
      setOffers(res.data.offers || []);
      if (res.data.offers?.length === 0) setError('No flights found for these dates');
    } catch (e) {
      setError(e.response?.data?.message || 'Flight search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (offer) => {
    setSaving(true);
    try {
      const outbound = offer.itineraries?.[0];
      const segments = outbound?.segments || [];
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];

      await saveFlight({
        trip_id: tripId,
        flight_number: firstSeg ? `${firstSeg.carrierCode}${firstSeg.number}` : null,
        airline: firstSeg?.carrierCode,
        airline_code: firstSeg?.carrierCode,
        origin_airport: firstSeg?.departure?.iataCode,
        dest_airport: lastSeg?.arrival?.iataCode,
        departure_time: firstSeg?.departure?.at,
        arrival_time: lastSeg?.arrival?.at,
        price: offer.price,
        currency: offer.currency,
        amadeus_offer_id: offer.id,
        status: 'planned',
      });
      onFlightSaved?.();
      onClose();
    } catch (e) {
      setError('Failed to save flight. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const Overlay = Platform.OS === 'ios' ? BlurView : View;
  const overlayProps = Platform.OS === 'ios' ? { intensity: 20, tint: 'dark' } : { style: { backgroundColor: 'rgba(0,0,0,0.7)' } };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Overlay {...overlayProps} style={StyleSheet.absoluteFill} />
      <View style={styles.modalContainer}>
        <GlassmorphicCard style={styles.modal}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>✈️ Search Flights</Text>
              <Text style={styles.modalSubtitle}>Powered by Amadeus</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Search Form */}
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.formField}>
                  <Text style={styles.label}>From</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="airplane-outline" size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={origin}
                      onChangeText={(v) => setOrigin(v.toUpperCase())}
                      placeholder="JFK"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={3}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>To</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={destination}
                      onChangeText={(v) => setDestination(v.toUpperCase())}
                      placeholder="CDG"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={3}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Depart Date</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={departDate}
                      onChangeText={setDepartDate}
                      placeholder="2024-12-15"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.formField}>
                  <Text style={styles.label}>Adults</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="people-outline" size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={adults}
                      onChangeText={setAdults}
                      keyboardType="number-pad"
                      maxLength={1}
                      placeholder="1"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                </View>
              </View>

              {error && (
                <View style={styles.errorWrap}>
                  <Ionicons name="alert-circle-outline" size={14} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity onPress={handleSearch} style={styles.searchBtn} disabled={loading}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.searchBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="search-outline" size={18} color="#fff" />
                      <Text style={styles.searchBtnText}>Search Flights</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Results */}
            {saving && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.savingText}>Saving flight...</Text>
              </View>
            )}

            {offers.length > 0 && (
              <View style={styles.results}>
                <Text style={styles.resultsTitle}>{offers.length} flights found</Text>
                {offers.map((offer, i) => (
                  <FlightOfferCard key={offer.id || i} offer={offer} onSelect={handleSelect} />
                ))}
              </View>
            )}
          </ScrollView>
        </GlassmorphicCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.glassBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formField: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: SPACING.xs,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingVertical: SPACING.sm,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
  },
  searchBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  searchBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  results: {
    gap: SPACING.sm,
  },
  resultsTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.xs,
  },
  offerCard: {
    padding: SPACING.md,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  offerLeft: {
    alignItems: 'center',
    flex: 1,
  },
  offerMiddle: {
    flex: 2,
    alignItems: 'center',
  },
  offerRight: {
    alignItems: 'center',
    flex: 1,
  },
  offerPrice: {
    alignItems: 'center',
    flex: 1,
  },
  offerCarrier: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  offerTime: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  offerCode: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  offerDuration: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  offerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  offerLineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
  },
  offerLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.glassBorder,
  },
  offerLineStop: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.warning,
    marginHorizontal: 2,
  },
  offerStops: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  offerPriceValue: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '800',
  },
  offerPriceLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  selectBtn: {
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  selectBtnText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  savingOverlay: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  savingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
