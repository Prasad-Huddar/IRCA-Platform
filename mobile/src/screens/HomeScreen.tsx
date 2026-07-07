import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  RefreshControl,
  ImageBackground,
  Image,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/RootNavigator';
import {
  getAllIRCADetails,
  getAllIRCACenters,
  getAllHospitals,
  getAllPsychiatrists,
  getDistrictNames,
} from '../services/supabaseService';
import WebMapComponent from '../../components/WebMapComponent';
import {
  IRCACenter,
  Hospital,
  Psychiatrist,
  IRCACenterDetails,
} from '../services/supabaseService';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Home'>;
type StackNav = NativeStackNavigationProp<RootStackParamList>;

// Unified facility interface for mobile that works with all data types
interface Facility {
  id: string;
  name?: string;
  hospital?: string;
  city?: string;
  district?: string;
  address?: string;
  details?: string;
  affiliation?: string;
  beds?: number;
  type: 'irca' | 'hospital' | 'psychiatrist';
  category?: 'government' | 'private';
  // Additional fields from different types
  center_id?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
  services?: string[];
  established?: number;
  verified?: boolean;
  description?: string;
  village?: string;
  specialty?: string;
  images?: string[];
}

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const stackNavigation = useNavigation<StackNav>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6); // Start with 6 items
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  // Data states
  const [ircaDetails, setIRCADetails] = useState<IRCACenterDetails[]>([]);
  const [ircaBasics, setIRCABasics] = useState<IRCACenter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const translations = {
    en: {
      initiative: "Government of Karnataka Initiative",
      line1: "Rebuilding Lives,",
      line2: "One Step at a Time",
      subtitle: "Karnataka's official network of rehabilitation centers, hospitals, and psychiatrists, providing evidence-based treatment and compassionate care across the state.",
      totalFacilities: "Total Facilities",
      availableBeds: "Available Beds",
      coveredAreas: "Covered Areas",
      toggleLang: "ಕನ್ನಡ"
    },
    kn: {
      initiative: "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಉಪಕ್ರಮ",
      line1: "ಜೀವನವನ್ನು ಪುನರ್ನಿಮಿಸುತ್ತಿದೆ,",
      line2: "ಒಂದೊಂದೇ ಹೆಜ್ಜೆ",
      subtitle: "ಪುನರ್ವಸತಿ ಕೇಂದ್ರಗಳು, ಆಸ್ಪತ್ರೆಗಳು ಮತ್ತು ಮನೋವೈದ್ಯರ ಕರ್ನಾಟಕದ ಅಧಿಕೃತ ಜಾಲ, ರಾಜ್ಯಾದ್ಯಂತ ಸಾಕ್ಷ್ಯಾಧಾರಿತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಸಹಾನುಭೂತಿಯ ಆರೈಕೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.",
      totalFacilities: "ಒಟ್ಟು ಸೌಲಭ್ಯಗಳು",
      availableBeds: "ಲಭ್ಯವಿರುವ ಹಾಸಿಗೆಗಳು",
      coveredAreas: "ಆವರಿಸಿರುವ ಪ್ರದೇಶಗಳು",
      toggleLang: "English"
    }
  };

  const t = translations[language];

  // Load data with progressive loading
  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        // Keep existing loading
        setIsLoading(true);
      }

      // Fetch all data sources
      const [detailsData, basicsData, hospitalsData, psychData, distsData] = await Promise.all([
        getAllIRCADetails(),
        getAllIRCACenters(),
        getAllHospitals(),
        getAllPsychiatrists(),
        getDistrictNames(),
      ]);

      setIRCADetails(detailsData);
      setIRCABasics(basicsData);
      setHospitals(hospitalsData);
      setPsychiatrists(psychData);
      setDistricts(distsData);

      console.log('Data loaded successfully from DB');
      if (refresh) {
        setVisibleCount(6);
      }
    } catch (e) {
      console.error('Error fetching data from Supabase:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pull to refresh
  const handleRefresh = () => {
    loadData(true);
  };

  // Load more facilities
  const loadMore = () => {
    if (!isLoadingMore && visibleCount < filtered.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 6, filtered.length));
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const allFacilities = useMemo(() => {
    // Helper to extract district from location string
    const extractDistrict = (location: string) => {
      if (!location) return 'Other';
      const k = location.toLowerCase();
      // Special Hubli case
      if (k.includes('hubli') || k.includes('hubballi')) return 'Dharwad';

      const patterns = [
        { r: /\bchitradurga\b/i, n: 'Chitradurga' },
        { r: /\bdavangere\b/i, n: 'Davangere' },
        { r: /\bdavanagere\b/i, n: 'Davangere' },
        { r: /\bdharwad\b/i, n: 'Dharwad' },
        { r: /\bballari\b/i, n: 'Ballari' },
        { r: /\bbellary\b/i, n: 'Ballari' },
        { r: /\bkoppal\b/i, n: 'Koppal' },
        { r: /\btumkur\b/i, n: 'Tumkur' },
        { r: /\btumakuru\b/i, n: 'Tumkur' },
        { r: /\bmandya\b/i, n: 'Mandya' },
        { r: /\bmysore\b/i, n: 'Mysore' },
        { r: /\bmysuru\b/i, n: 'Mysore' },
        { r: /\bbelgaum\b/i, n: 'Belgaum' },
        { r: /\bbelagavi\b/i, n: 'Belgaum' },
        { r: /\bbangalore\b/i, n: 'Bangalore' },
        { r: /\bbengaluru\b/i, n: 'Bangalore' },
        { r: /\bgulbarga\b/i, n: 'Gulbarga' },
        { r: /\bkalaburagi\b/i, n: 'Gulbarga' },
        { r: /\bshimoga\b/i, n: 'Shimoga' },
        { r: /\bshivamogga\b/i, n: 'Shimoga' },
        { r: /\bhassan\b/i, n: 'Hassan' },
        { r: /\bgadag\b/i, n: 'Gadag' },
      ];

      for (const p of patterns) {
        if (p.r.test(location)) return p.n;
      }
      return 'Other';
    };

    // 1. Process IRCAs (Verified only from ircacenter_details)
    const processedIRCAs: Facility[] = ircaDetails.map(detail => {
      // Try to find matching basic center for Coordinates & Category
      const matchingBasic = ircaBasics.find(b =>
        b.name.toLowerCase().includes(detail.title.split('–')[0].trim().toLowerCase()) ||
        detail.title.toLowerCase().includes(b.name.toLowerCase())
      );

      const district = matchingBasic?.district || extractDistrict(detail.location);
      const category = matchingBasic?.category || 'government';

      return {
        id: detail.id,
        center_id: detail.center_id,
        name: detail.title,
        district: district,
        address: detail.location,
        beds: parseInt(detail.beds) || 0,
        type: 'irca' as const,
        category: category,
        verified: true,
        description: detail.overview,
        images: detail.images || [],
        phone: detail.phone?.[0],
        coordinates: matchingBasic?.coordinates,
        lat: matchingBasic?.lat,
        lng: matchingBasic?.lng,
      };
    });

    // 2. Process Hospitals
    const processedHospitals: Facility[] = hospitals.map(h => ({
      id: h.id,
      name: h.hospital,
      district: h.city,
      address: h.details,
      beds: 0,
      type: 'hospital' as const,
      category: h.type,
      village: h.village,
      images: []
    }));

    // 3. Process Psychiatrists
    const processedPsychiatrists: Facility[] = psychiatrists.map(p => ({
      id: p.id,
      name: p.name,
      district: p.city,
      address: p.affiliation || p.specialty,
      beds: 0,
      type: 'psychiatrist' as const,
      category: undefined,
      specialty: p.specialty,
      images: []
    }));

    // Combine and Deduplicate
    const rawList = [...processedIRCAs, ...processedHospitals, ...processedPsychiatrists];

    // Deduplicate by normalized name
    const seen = new Set<string>();
    return rawList.filter(item => {
      const normalizedName = (item.name || '').trim().toLowerCase();
      if (normalizedName && seen.has(normalizedName)) {
        return false;
      }
      seen.add(normalizedName);
      return true;
    });
  }, [ircaDetails, ircaBasics, hospitals, psychiatrists]);

  const filtered = useMemo(() => {
    let f = allFacilities;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(fac => {
        const name = fac.name || '';
        const district = fac.district || '';
        const address = fac.address || '';
        return name.toLowerCase().includes(q) || district.toLowerCase().includes(q) || address.toLowerCase().includes(q);
      });
    }
    if (selectedDistrict !== 'all') {
      f = f.filter(fac => fac.district === selectedDistrict);
    }
    // Sort
    f.sort((a, b) => {
      const aName = a.name || '';
      const bName = b.name || '';
      switch (sortBy) {
        case 'name':
          return aName.localeCompare(bName);
        case 'district':
          const aDist = a.district || '';
          const bDist = b.district || '';
          return aDist.localeCompare(bDist);
        case 'beds':
          return (b.beds || 0) - (a.beds || 0);
        default:
          return 0;
      }
    });
    return f;
  }, [searchTerm, selectedDistrict, sortBy, allFacilities]);

  const stats = useMemo(() => ({
    centers: allFacilities.length,
    beds: allFacilities.reduce((sum, f) => sum + (f.beds || 0), 0),
    districts: districts.length,
  }), [allFacilities, districts]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading facilities...</Text>
      </View>
    );
  }

  const districtOptions = [{ label: 'All Districts', value: 'all' }, ...districts.map(d => ({ label: d, value: d }))];
  const sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'District', value: 'district' },
    { label: 'Bed Capacity', value: 'beds' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#003366']}
            tintColor="#003366"
          />
        }
      >
        {/* Hero with Video Banner */}
        <View style={styles.heroContainer}>
          <Video
            source={require('../../assets/hero.mp4')}
            style={styles.heroBackground}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{t.initiative}</Text>
              <Text style={[styles.heroTitle, styles.heroAccent]}>{t.line1}</Text>
              <Text style={[styles.heroTitle, styles.heroAccent]}>{t.line2}</Text>
              <Text style={styles.heroSubtitle}>
                {t.subtitle}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.centers}</Text>
                  <Text style={styles.statLabel}>{t.totalFacilities}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.beds.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>{t.availableBeds}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.districts}</Text>
                  <Text style={styles.statLabel}>{t.coveredAreas}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Interactive Map Section */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Facility Map</Text>
          <WebMapComponent
            facilities={filtered.slice(0, 50)} // Show first 50 facilities on map
            onCenterSelect={(facility: any) => {
              // Navigate to facility details based on type
              stackNavigation.navigate('FacilityDetail', {
                facilityId: facility.id,
                facilityType: facility.type,
                facilityName: facility.name,
              });
            }}
          />
        </View>

        {/* Search/Filters */}
        <View style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Find Your Center</Text>
          <TextInput
            placeholder="Search by name, district, or location..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
            placeholderTextColor="#6C757D"
          />
          <View style={styles.pickerRow}>
            <OptionPicker
              label="District"
              value={selectedDistrict}
              options={districtOptions}
              onChange={setSelectedDistrict}
            />
            <OptionPicker
              label="Sort"
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
            />
          </View>
          <Text style={styles.resultCount}>
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} facilities
          </Text>
        </View>

        {/* Facility List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Healthcare Facilities</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No centers found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={filtered.slice(0, visibleCount)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FacilityCard facility={item} navigation={stackNavigation} />}
              scrollEnabled={false}
              ListFooterComponent={
                visibleCount < filtered.length ? (
                  <View style={styles.loadMoreContainer}>
                    {isLoadingMore ? (
                      <ActivityIndicator size="small" color="#003366" />
                    ) : (
                      <Pressable style={styles.loadMoreButton} onPress={loadMore}>
                        <Text style={styles.loadMoreButtonText}>Load More</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null
              }
            />
          </>
        )}

        {/* Quick Nav Buttons */}
        <View style={styles.quickNav}>
          <Pressable style={styles.quickButton} onPress={() => navigation.navigate('Events')}>
            <Text style={styles.quickButtonText}>Events</Text>
          </Pressable>
          <Pressable style={styles.quickButton} onPress={() => stackNavigation.navigate('FAQ')}>
            <Text style={styles.quickButtonText}>FAQ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// Simple OptionPicker (same as EventsScreen)
type Option = { label: string; value: string };
function OptionPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value)?.label ?? label;
  return (
    <>
      <Pressable style={styles.pickerTrigger} onPress={() => setOpen(true)}>
        <Text style={styles.pickerText} numberOfLines={1}>{selected}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  style={[styles.optionRow, active && styles.optionRowActive]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
                </Pressable>
              );
            }}
          />
          <Pressable style={styles.modalClose} onPress={() => setOpen(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

// Enhanced Facility Card matching web design
function FacilityCard({ facility, navigation }: { facility: Facility; navigation: StackNav }) {

  const getTypeIcon = () => {
    switch (facility.type) {
      case 'irca': return '🏢';
      case 'hospital': return '🏥';
      case 'psychiatrist': return '👤';
      default: return '📍';
    }
  };

  const getTypeColor = () => {
    switch (facility.type) {
      case 'irca': return '#003366';
      case 'hospital': return '#2E8540';
      case 'psychiatrist': return '#6C757D';
      default: return '#6C757D';
    }
  };

  const handlePress = () => {
    // Navigate to specialized screen for IRCA, or generic for others
    if (facility.type === 'irca' && facility.center_id) {
      navigation.navigate('IRCACenterDetail', {
        centerId: facility.center_id,
        centerName: facility.name || 'IRCA Center',
      });
    } else {
      navigation.navigate('FacilityDetail', {
        facilityId: facility.id,
        facilityType: facility.type,
        facilityName: facility.name || 'Unknown Facility',
      });
    }
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.cardPadding}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.cardTitle}>{facility.name}</Text>
              <Text style={styles.cardDistrict}>{facility.district}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(), paddingHorizontal: 12 }]}>
              <Text style={styles.typeBadgeText}>
                {facility.category === 'private' ? 'Private ' : facility.category === 'government' ? 'Govt ' : ''}
                {facility.type === 'irca' ? 'IRCA' : facility.type === 'hospital' ? 'Hospital' : 'Psychiatrist'}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Body */}
        <Text style={styles.cardDesc} numberOfLines={2}>
          {facility.address || 'No description available'}
        </Text>

        {/* Card Meta */}
        <View style={styles.cardMeta}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {facility.type === 'irca' && <Text style={styles.cardMetaText}>🛏️ {facility.beds || 'N/A'} beds</Text>}
            {facility.type === 'psychiatrist' && <Text style={styles.cardMetaText}>🩺 {facility.specialty || 'General'}</Text>}
            {facility.type === 'hospital' && <Text style={styles.cardMetaText}>📍 {facility.village || 'City'}</Text>}
          </View>
        </View>

        {/* Card Footer */}
        <Pressable style={styles.cardButton} onPress={handlePress}>
          <Text style={styles.cardButtonText}>View Details →</Text>
        </Pressable>
      </View>
    </Pressable >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#495057', fontWeight: '600' },

  // Enhanced Hero Section matching web design
  heroContainer: {
    height: screenHeight * 0.65, // Increased height to accommodate all content
    position: 'relative',
    backgroundColor: '#003366',
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 20
  },
  heroBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: '100%',
    justifyContent: 'center'
  },
  heroTitle: {
    fontSize: 20, // Further reduced for better fit
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  heroAccent: {
    color: '#FFC72C',
    textShadowColor: 'rgba(255, 199, 44, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
    lineHeight: 16,
    paddingHorizontal: 25
  },

  // Enhanced Stats Cards
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    width: '100%',
    paddingHorizontal: 10
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  statLabel: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center'
  },

  // Enhanced Filters Card
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 4
  },
  searchInput: {
    borderWidth: 2,
    borderColor: '#DEE2E6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#212529',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  pickerRow: { flexDirection: 'row', gap: 12 },
  pickerTrigger: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529'
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 8
  },
  optionRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5'
  },
  optionRowActive: {
    backgroundColor: '#F1F3F5'
  },
  optionText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600'
  },
  optionTextActive: {
    color: '#003366',
    fontWeight: '700'
  },
  modalClose: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#003366',
    marginTop: 8
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  },
  resultCount: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    marginTop: 8
  },

  // Enhanced Section Header
  sectionHeader: {
    gap: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#003366',
    textAlign: 'center'
  },

  // Map Section
  mapSection: {
    marginBottom: 20,
  },

  // Enhanced Empty State
  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#212529',
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center'
  },

  // Enhanced Facility Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
    overflow: 'hidden', // Added to contain image
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardPadding: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#003366',
    lineHeight: 24
  },
  cardDistrict: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500'
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  cardDesc: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontWeight: '400'
  },
  cardMeta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardMetaText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '700'
  },
  cardButton: {
    backgroundColor: '#003366',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5
  },

  // Load More Components
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  loadMoreButton: {
    backgroundColor: '#003366',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  quickNav: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#003366',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  quickButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5
  },
});
