import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherByCoords } from '../../services/api';
import GlassmorphicCard from '../Common/GlassmorphicCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const WEATHER_ICONS = {
  '01d': 'sunny-outline',
  '01n': 'moon-outline',
  '02d': 'partly-sunny-outline',
  '02n': 'cloudy-night-outline',
  '03d': 'cloud-outline',
  '03n': 'cloud-outline',
  '04d': 'cloudy-outline',
  '04n': 'cloudy-outline',
  '09d': 'rainy-outline',
  '09n': 'rainy-outline',
  '10d': 'rainy-outline',
  '10n': 'rainy-outline',
  '11d': 'thunderstorm-outline',
  '11n': 'thunderstorm-outline',
  '13d': 'snow-outline',
  '13n': 'snow-outline',
  '50d': 'water-outline',
  '50n': 'water-outline',
};

export default function WeatherWidget({ lat, lon, destinationName, compact = false }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(false);
      return;
    }

    getWeatherByCoords(lat, lon)
      .then((res) => setWeather(res.data.weather))
      .catch(() => setError('Weather unavailable'))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (loading) {
    return (
      <GlassmorphicCard style={styles.card}>
        <ActivityIndicator size="small" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </GlassmorphicCard>
    );
  }

  if (error || !weather) {
    return null;
  }

  const icon = WEATHER_ICONS[weather.icon] || 'partly-sunny-outline';

  if (compact) {
    return (
      <View style={styles.compact}>
        <Ionicons name={icon} size={16} color={COLORS.gold} />
        <Text style={styles.compactTemp}>{weather.temp}°C</Text>
        <Text style={styles.compactDesc}>{weather.description}</Text>
      </View>
    );
  }

  return (
    <GlassmorphicCard style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.cityName}>{weather.city || destinationName}</Text>
          <Text style={styles.description}>{weather.description}</Text>
        </View>
        <View style={styles.tempContainer}>
          <Ionicons name={icon} size={36} color={COLORS.gold} />
          <Text style={styles.temp}>{weather.temp}°C</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="thermometer-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.detailText}>Feels {weather.feels_like}°</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="water-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{weather.humidity}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{weather.windSpeed} m/s</Text>
        </View>
      </View>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cityName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  tempContainer: {
    alignItems: 'center',
  },
  temp: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  details: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactTemp: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  compactDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
