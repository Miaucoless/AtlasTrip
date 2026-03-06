export const COLORS = {
  // Primary palette
  navyDark: '#0A0E1A',
  navy: '#0F1629',
  navyMid: '#151D35',
  navyLight: '#1E2A45',
  cardBg: '#1A2238',

  // Accents
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  goldDark: '#D97706',

  // Blues
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  cyan: '#06B6D4',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Gradient stops
  gradientStart: '#0A0E1A',
  gradientEnd: '#1E2A45',

  // Glass
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const FONTS = {
  regular: Platform?.OS === 'ios' ? 'System' : 'Roboto',
  bold: Platform?.OS === 'ios' ? 'System' : 'Roboto',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  gold: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const TRENDING_DESTINATIONS = [
  {
    id: '1',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
    rating: 4.9,
    price: 1200,
    category: 'Islands',
    emoji: '🇬🇷',
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    rating: 4.8,
    price: 1800,
    category: 'Cities',
    emoji: '🇯🇵',
  },
  {
    id: '3',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
    rating: 4.7,
    price: 900,
    category: 'Tropical',
    emoji: '🇮🇩',
  },
  {
    id: '4',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
    rating: 4.8,
    price: 1500,
    category: 'Cities',
    emoji: '🇫🇷',
  },
  {
    id: '5',
    name: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
    rating: 4.9,
    price: 2500,
    category: 'Islands',
    emoji: '🇲🇻',
  },
  {
    id: '6',
    name: 'New York',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    rating: 4.7,
    price: 1600,
    category: 'Cities',
    emoji: '🇺🇸',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'globe-outline' },
  { id: 'beaches', label: 'Beaches', icon: 'sunny-outline' },
  { id: 'mountains', label: 'Mountains', icon: 'triangle-outline' },
  { id: 'cities', label: 'Cities', icon: 'business-outline' },
  { id: 'culture', label: 'Culture', icon: 'library-outline' },
  { id: 'adventure', label: 'Adventure', icon: 'flash-outline' },
];

export const FLIGHT_DEALS = [
  { id: '1', from: 'NYC', to: 'Paris', price: 389, airline: 'Air France', date: 'Dec 15' },
  { id: '2', from: 'LAX', to: 'Tokyo', price: 499, airline: 'ANA', date: 'Jan 5' },
  { id: '3', from: 'LHR', to: 'Bali', price: 620, airline: 'Singapore Air', date: 'Dec 28' },
];

export const API_BASE_URL = 'http://localhost:5000/api';
