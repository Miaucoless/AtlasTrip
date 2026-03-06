import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { optimizeTrip } from '../../services/api';
import GlassmorphicCard from '../Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const TYPE_ICONS = {
  activity: 'walk-outline',
  flight: 'airplane-outline',
  hotel: 'bed-outline',
  restaurant: 'restaurant-outline',
  transport: 'car-outline',
  note: 'document-text-outline',
  event: 'calendar-outline',
};

const TYPE_COLORS = {
  activity: '#3B82F6',
  flight: '#8B5CF6',
  hotel: '#10B981',
  restaurant: '#F59E0B',
  transport: '#06B6D4',
  note: '#94A3B8',
  event: '#EC4899',
};

export default function AITripOptimizer({ tripId, onApply }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await optimizeTrip(tripId);
      setResult(response.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Optimization failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7C3AED', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Trip Optimizer</Text>
            <Text style={styles.headerSubtitle}>Powered by GPT-4o mini</Text>
          </View>
        </View>
        <Text style={styles.headerDesc}>
          Reorder activities to minimize travel time, group nearby attractions, and discover hidden gems.
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Optimize Button */}
        {!result && !loading && (
          <TouchableOpacity onPress={handleOptimize} style={styles.optimizeBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.optimizeBtnGradient}
            >
              <Ionicons name="sparkles-outline" size={20} color="#fff" />
              <Text style={styles.optimizeBtnText}>Optimize My Itinerary</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Analyzing your itinerary...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <GlassmorphicCard style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleOptimize} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </GlassmorphicCard>
        )}

        {/* Result */}
        {result && (
          <View>
            {/* Reasoning */}
            <GlassmorphicCard style={styles.reasoningCard}>
              <View style={styles.reasoningHeader}>
                <Ionicons name="bulb-outline" size={18} color={COLORS.gold} />
                <Text style={styles.reasoningTitle}>AI Insights</Text>
              </View>
              <Text style={styles.reasoningText}>{result.reasoning}</Text>
            </GlassmorphicCard>

            {/* Optimized Items */}
            {result.optimizedItems?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Optimized Order</Text>
                {result.optimizedItems.map((item, index) => (
                  <View key={item.id || index} style={styles.itemRow}>
                    <View style={styles.itemNumber}>
                      <Text style={styles.itemNumberText}>{index + 1}</Text>
                    </View>
                    <View style={[styles.itemIconWrap, { backgroundColor: (TYPE_COLORS[item.type] || COLORS.blue) + '20' }]}>
                      <Ionicons
                        name={TYPE_ICONS[item.type] || 'location-outline'}
                        size={16}
                        color={TYPE_COLORS[item.type] || COLORS.blue}
                      />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>Day {item.day_number} {item.start_time ? `· ${item.start_time}` : ''}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Hidden Gems */}
            {result.hiddenGems?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💎 Hidden Gems Discovered</Text>
                {result.hiddenGems.map((gem, index) => (
                  <GlassmorphicCard key={index} style={styles.gemCard}>
                    <View style={styles.gemHeader}>
                      <Text style={styles.gemName}>{gem.name}</Text>
                      {gem.estimatedCost && (
                        <Text style={styles.gemCost}>${gem.estimatedCost}</Text>
                      )}
                    </View>
                    <Text style={styles.gemDesc}>{gem.description}</Text>
                    {gem.type && (
                      <View style={styles.gemTypeBadge}>
                        <Text style={styles.gemTypeText}>{gem.type}</Text>
                      </View>
                    )}
                  </GlassmorphicCard>
                ))}
              </View>
            )}

            {/* Apply Button */}
            {onApply && result.optimizedItems?.length > 0 && (
              <TouchableOpacity
                onPress={() => onApply(result.optimizedItems)}
                style={styles.applyBtn}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[COLORS.success, '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyBtnGradient}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.applyBtnText}>Apply Optimized Order</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Re-optimize */}
            <TouchableOpacity onPress={handleOptimize} style={styles.reoptimizeBtn}>
              <Text style={styles.reoptimizeText}>Re-optimize</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navyDark,
  },
  header: {
    padding: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerText: {},
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  headerDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    padding: SPACING.md,
  },
  optimizeBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginVertical: SPACING.lg,
  },
  optimizeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  optimizeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  loadingSubtext: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  errorCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  reasoningCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  reasoningTitle: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  reasoningText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.navyDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  gemCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  gemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  gemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  gemCost: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  gemDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  gemTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.navyDark,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginTop: SPACING.xs,
  },
  gemTypeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  applyBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  applyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  reoptimizeBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
  },
  reoptimizeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
