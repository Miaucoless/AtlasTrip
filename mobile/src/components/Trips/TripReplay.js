import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { generateTripStory } from '../../services/api';
import GlassmorphicCard from '../Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const ACTIVITY_ICONS = {
  flight: '✈️', hotel: '🏨', restaurant: '🍽️',
  activity: '🎯', transport: '🚗', event: '🎭', note: '📝',
};

function TimelineItem({ item, index, totalItems, animate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!animate) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }
    const delay = index * 300;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [animate]);

  return (
    <Animated.View style={[styles.timelineItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Line */}
      {index < totalItems - 1 && <View style={styles.timelineLine} />}

      <View style={styles.timelineDot}>
        <Text style={styles.timelineIcon}>{ACTIVITY_ICONS[item.type] || '📍'}</Text>
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineDay}>Day {item.day_number}</Text>
        <Text style={styles.timelineName}>{item.name}</Text>
        {item.location && (
          <Text style={styles.timelineLocation}>
            <Ionicons name="location-outline" size={11} color={COLORS.textMuted} /> {item.location}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function TripReplay({ trip, itineraryItems = [] }) {
  const [playing, setPlaying] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  const totalItems = itineraryItems.length;

  const handlePlay = () => {
    setPlaying(true);
    setCurrentIndex(0);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: totalItems * 800,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setPlaying(false);
    });

    // Step through items
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += 1;
      if (idx >= totalItems) {
        clearInterval(intervalRef.current);
        setPlaying(false);
      } else {
        setCurrentIndex(idx);
      }
    }, 800);
  };

  const handleStop = () => {
    setPlaying(false);
    progressAnim.stopAnimation();
    clearInterval(intervalRef.current);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const generateStory = async () => {
    setStoryLoading(true);
    try {
      const res = await generateTripStory(trip.id);
      setStory(res.data);
    } catch {
      setStory({
        title: `${trip.title} – An Unforgettable Journey`,
        story: `From the moment we arrived, ${trip.destination || 'this destination'} captivated us with its beauty and culture. Every day brought new adventures, amazing food, and memories that will last a lifetime. This trip was truly a once-in-a-lifetime experience.`,
        hashtags: ['#travel', '#adventure', '#atlastrip', '#wanderlust', '#explore'],
      });
    } finally {
      setStoryLoading(false);
    }
  };

  const shareStory = async () => {
    if (!story) return;
    try {
      await Share.share({
        message: `${story.title}\n\n${story.story}\n\n${story.hashtags?.join(' ')} 🌍\n\nPlanned with AtlasTrip`,
        title: story.title,
      });
    } catch {
      // Share cancelled
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['#7C3AED', '#1E3A5F', COLORS.navyDark]}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>🎬</Text>
        <Text style={styles.heroTitle}>{trip.title}</Text>
        <Text style={styles.heroSubtitle}>
          {trip.start_date} — {trip.end_date}
        </Text>
        <Text style={styles.heroStats}>
          {totalItems} Activities · {trip.destination || 'Multiple Destinations'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Play Controls */}
        <View style={styles.playControls}>
          <TouchableOpacity
            onPress={playing ? handleStop : handlePlay}
            style={styles.playBtn}
            activeOpacity={0.85}
            disabled={totalItems === 0}
          >
            <LinearGradient
              colors={playing ? [COLORS.error, '#DC2626'] : ['#7C3AED', '#4F46E5']}
              style={styles.playBtnGradient}
            >
              <Ionicons name={playing ? 'stop' : 'play'} size={22} color="#fff" />
              <Text style={styles.playBtnText}>{playing ? 'Stop Replay' : 'Play Trip Replay'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Progress bar */}
          {(playing || currentIndex > 0) && (
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          )}
        </View>

        {/* Timeline */}
        {totalItems > 0 ? (
          <View style={styles.timeline}>
            <Text style={styles.sectionTitle}>Trip Timeline</Text>
            {itineraryItems.map((item, index) => (
              <TimelineItem
                key={item.id || index}
                item={item}
                index={index}
                totalItems={totalItems}
                animate={playing && index <= currentIndex}
              />
            ))}
          </View>
        ) : (
          <GlassmorphicCard style={styles.emptyTimeline}>
            <Ionicons name="time-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No activities yet</Text>
            <Text style={styles.emptySubtext}>Add activities to your trip to see the replay</Text>
          </GlassmorphicCard>
        )}

        {/* AI Trip Story */}
        <View style={styles.storySection}>
          <Text style={styles.sectionTitle}>✨ AI Trip Story</Text>
          {!story ? (
            <TouchableOpacity
              onPress={generateStory}
              style={styles.generateBtn}
              disabled={storyLoading}
            >
              <GlassmorphicCard style={styles.generateCard}>
                {storyLoading ? (
                  <Text style={styles.generateText}>Generating your story...</Text>
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={24} color={COLORS.gold} />
                    <Text style={styles.generateText}>Generate AI Trip Story</Text>
                    <Text style={styles.generateSubtext}>Create a shareable recap of your journey</Text>
                  </>
                )}
              </GlassmorphicCard>
            </TouchableOpacity>
          ) : (
            <GlassmorphicCard style={styles.storyCard}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyText}>{story.story}</Text>
              <View style={styles.hashtagRow}>
                {story.hashtags?.map((tag) => (
                  <View key={tag} style={styles.hashtag}>
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={shareStory} style={styles.shareBtn}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shareBtnGradient}
                >
                  <Ionicons name="share-outline" size={18} color="#fff" />
                  <Text style={styles.shareBtnText}>Share Story</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassmorphicCard>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navyDark,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  heroStats: {
    color: COLORS.gold,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
  },
  playControls: {
    marginBottom: SPACING.lg,
  },
  playBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  playBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.navyLight,
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  timeline: {
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 42,
    width: 2,
    height: SPACING.xl + SPACING.md,
    backgroundColor: COLORS.glassBorder,
    zIndex: 0,
  },
  timelineDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    zIndex: 1,
    marginRight: SPACING.md,
  },
  timelineIcon: {
    fontSize: 18,
  },
  timelineContent: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  timelineDay: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  timelineLocation: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  emptyTimeline: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  storySection: {
    marginBottom: SPACING.xl,
  },
  generateBtn: {},
  generateCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  generateText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  generateSubtext: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  storyCard: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  storyTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  storyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  hashtag: {
    backgroundColor: COLORS.navyDark,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  hashtagText: {
    color: COLORS.blue,
    fontSize: 12,
  },
  shareBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 4,
    gap: SPACING.sm,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
