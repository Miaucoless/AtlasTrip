import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Svg, Path, Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const { width } = Dimensions.get('window');

/**
 * Converts lat/lon to SVG x/y coordinates within the given dimensions.
 */
function latLonToXY(lat, lon, svgWidth, svgHeight) {
  const x = ((lon + 180) / 360) * svgWidth;
  const y = ((90 - lat) / 180) * svgHeight;
  return { x, y };
}

/**
 * Returns a quadratic bezier control point that arcs the path upward.
 */
function getBezierControlPoint(x1, y1, x2, y2, curvature = 0.25) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const cx = midX - (dy / len) * len * curvature;
  const cy = midY + (dx / len) * len * curvature;
  return { cx, cy };
}

function FlightArc({ x1, y1, x2, y2, color = COLORS.gold, animated = true }) {
  const progress = useRef(new Animated.Value(0)).current;
  const planeX = useRef(new Animated.Value(x1)).current;
  const planeY = useRef(new Animated.Value(y1)).current;

  const { cx, cy } = getBezierControlPoint(x1, y1, x2, y2);
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  useEffect(() => {
    if (!animated) return;
    const duration = 2500 + Math.random() * 1500;

    const animate = () => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) setTimeout(animate, 1000 + Math.random() * 2000);
      });
    };

    // Offset start time
    setTimeout(animate, Math.random() * 3000);
  }, []);

  return (
    <G>
      {/* Static arc */}
      <Path d={d} stroke={color + '40'} strokeWidth={1} fill="none" />
      {/* Glowing animated arc */}
      <Path d={d} stroke={color} strokeWidth={1.5} fill="none" strokeDasharray="4 6" />
      {/* Origin dot */}
      <Circle cx={x1} cy={y1} r={3} fill={color} opacity={0.9} />
      {/* Destination dot */}
      <Circle cx={x2} cy={y2} r={3} fill={color} opacity={0.9} />
    </G>
  );
}

export default function AnimatedFlightPaths({ flights = [], width: svgWidth = width - 32, height: svgHeight = 200 }) {
  const validFlights = flights.filter(
    (f) => f.origin_lat && f.origin_lon && f.dest_lat && f.dest_lon,
  );

  if (validFlights.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="airplane-outline" size={40} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No flight history yet</Text>
        <Text style={styles.emptySubtext}>Add flights to your trips to see your travel map</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: svgWidth, height: svgHeight }]}>
      {/* World map background (simplified) */}
      <View style={styles.mapBackground} />

      <Svg width={svgWidth} height={svgHeight} style={StyleSheet.absoluteFill}>
        {/* Grid lines */}
        {[...Array(7)].map((_, i) => (
          <Path
            key={`h${i}`}
            d={`M 0 ${(i / 6) * svgHeight} H ${svgWidth}`}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        {[...Array(13)].map((_, i) => (
          <Path
            key={`v${i}`}
            d={`M ${(i / 12) * svgWidth} 0 V ${svgHeight}`}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Flight arcs */}
        {validFlights.map((flight, index) => {
          const origin = latLonToXY(flight.origin_lat, flight.origin_lon, svgWidth, svgHeight);
          const dest = latLonToXY(flight.dest_lat, flight.dest_lon, svgWidth, svgHeight);
          return (
            <FlightArc
              key={index}
              x1={origin.x}
              y1={origin.y}
              x2={dest.x}
              y2={dest.y}
              color={COLORS.gold}
              animated
            />
          );
        })}
      </Svg>
    </View>
  );
}

/**
 * FlightStatsPanel – Shows aggregate flight statistics.
 */
export function FlightStatsPanel({ stats }) {
  const items = [
    { label: 'Total Flights', value: stats?.totalFlights || 0, icon: 'airplane-outline', color: '#8B5CF6' },
    { label: 'Miles Flown', value: stats?.totalMiles ? `${(stats.totalMiles / 1000).toFixed(1)}k` : '0', icon: 'compass-outline', color: COLORS.gold },
    { label: 'Countries', value: stats?.countriesVisited || 0, icon: 'earth-outline', color: '#10B981' },
    { label: 'Continents', value: stats?.continentsVisited || 0, icon: 'globe-outline', color: '#3B82F6' },
  ];

  return (
    <View style={styles.statsGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.navyDark,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A1628',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});
