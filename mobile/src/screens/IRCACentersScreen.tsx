import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import {
  getAllIRCADetails,
  getDistrictNames,
  IRCACenterDetails,
} from '../services/supabaseService';
import AppHeader from '../components/AppHeader';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FacilityDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export default function IRCACentersScreen() {
  const navigation = useNavigation<Nav>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('government');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ircaCenters, setIRCACenters] = useState<IRCACenterDetails[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [expandedIRCA, setExpandedIRCA] = useState<boolean>(true); // Default expanded for easier discovery

  const toggleIRCA = () => {
    setExpandedIRCA(!expandedIRCA);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading IRCA centers...');

      // Load IRCA centers from details table
      const [ircaData, distData] = await Promise.all([
        getAllIRCADetails(),
        getDistrictNames(),
      ]);

      setIRCACenters(ircaData);
      setDistricts(distData);

      console.log('IRCA centers loaded:', ircaData.length);
      console.log('Districts loaded:', distData.length);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Combine and filter IRCA centers
  const allIRCACenters = useMemo(() => {
    console.log('Processing IRCA centers...');
    console.log('Total centers:', ircaCenters.length);

    let filtered = ircaCenters;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(center =>
        center.title?.toLowerCase().includes(q) ||
        center.location?.toLowerCase().includes(q)
      );
    }

    // District filter (extract district from location)
    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(center =>
        center.location?.toLowerCase().includes(selectedDistrict.toLowerCase())
      );
    }

    // Sort by title
    const sorted = filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    console.log('Final filtered centers:', sorted.length);
    return sorted;
  }, [ircaCenters, searchTerm, selectedDistrict]);

  const districtOptions = [
    { label: 'All Districts', value: 'all' },
    ...districts.map(d => ({ label: d, value: d }))
  ];

  const categoryOptions = [
    { label: 'Government Centers', value: 'government' },
  ];

  const handleCenterPress = (center: IRCACenterDetails) => {
    // Navigate to the new detailed IRCA center screen
    navigation.navigate('IRCACenterDetail', {
      centerId: center.center_id,
      centerName: center.title || 'Unknown IRCA Center'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading IRCA Centers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader showAuth={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#003366']}
            tintColor="#003366"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.enhancedHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.mainTitle}>Government IRCA Centers</Text>
            <Text style={styles.subtitle}>
              Karnataka's Premier Rehabilitation Network
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{ircaCenters.length}</Text>
                <Text style={styles.statLabel}>Total Centers</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{districts.length}</Text>
                <Text style={styles.statLabel}>Districts</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>Support</Text>
              </View>
            </View>
          </View>
        </View>

        {/* IRCA Centers Button */}
        <View style={styles.ircaButtonContainer}>
          <TouchableOpacity
            style={styles.ircaButton}
            onPress={toggleIRCA}
          >
            <View style={styles.ircaButtonContent}>
              <View style={styles.ircaButtonLeft}>
                <View style={styles.ircaButtonIcon}>
                  <Text style={{ fontSize: 24 }}>🏢</Text>
                </View>
                <View style={styles.ircaButtonText}>
                  <Text style={styles.ircaButtonTitle}>IRCA Centers List</Text>
                  <Text style={styles.ircaButtonSubtitle}>
                    {ircaCenters.length} government rehabilitation centers
                  </Text>
                </View>
              </View>
              <View style={styles.ircaButtonArrow}>
                <Text style={{ fontSize: 18, color: '#FFFFFF' }}>
                  {expandedIRCA ? '▲' : '▼'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* IRCA Centers Dropdown */}
          {expandedIRCA && (
            <View style={styles.ircaDropdown}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Available IRCA Centers</Text>
                <Text style={styles.dropdownSubtitle}>
                  {allIRCACenters.length} centers found
                </Text>
              </View>

              {/* Search within dropdown */}
              <View style={styles.dropdownSearchContainer}>
                <TextInput
                  style={styles.dropdownSearchInput}
                  placeholder="🔍 Search centers..."
                  placeholderTextColor="#6C757D"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              <View
                style={styles.ircaDropdownList}
              >
                {allIRCACenters.length === 0 ? (
                  <View style={styles.enhancedEmptyState}>
                    <Text style={styles.emptyEmoji}>🔍</Text>
                    <Text style={styles.emptyTitle}>No Centers Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try adjusting your search
                    </Text>
                    <TouchableOpacity
                      style={styles.clearFiltersButton}
                      onPress={() => {
                        setSearchTerm('');
                        setSelectedDistrict('all');
                      }}
                    >
                      <Text style={styles.clearFiltersText}>Clear Search</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  allIRCACenters.map((center) => (
                    <EnhancedIRCACenterCard
                      key={center.center_id}
                      center={center}
                      onPress={() => handleCenterPress(center)}
                    />
                  ))
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

// Enhanced IRCA Center Card Component
function EnhancedIRCACenterCard({
  center,
  onPress
}: {
  center: IRCACenterDetails;
  onPress: () => void;
}) {
  console.log('Rendering enhanced IRCA center card:', center.title);

  return (
    <TouchableOpacity style={styles.enhancedCard} onPress={onPress}>
      {/* Card Image - Conditional Rendering */}
      {center.images && center.images[0] && (
        <Image
          source={{ uri: center.images[0] }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.enhancedCardPadding}>
        {/* Enhanced Card Header */}
        <View style={styles.enhancedCardHeader}>
          <Text style={styles.enhancedCardTitle}>{center.title || 'IRCA Center'}</Text>

          <View style={styles.enhancedCardLocation}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{center.location || 'Location not available'}</Text>

          </View>
        </View>

        {/* Enhanced Card Body */}
        {center.overview && (
          <Text style={styles.enhancedCardDescription} numberOfLines={3}>
            {center.overview}
          </Text>
        )}

        {/* Enhanced Stats */}
        <View style={styles.enhancedCardStats}>
          <View style={styles.enhancedStatItem}>
            <Text style={styles.enhancedStatIcon}>🛏️</Text>
            <Text style={styles.enhancedStatText}>{center.beds || 'N/A'}</Text>
          </View>
          <View style={styles.enhancedStatItem}>
            <Text style={styles.enhancedStatIcon}>⭐</Text>
            <Text style={styles.enhancedStatText}>{center.rating || 'N/A'}</Text>
          </View>
          <View style={styles.enhancedStatItem}>
            <Text style={styles.enhancedStatIcon}>📅</Text>
            <Text style={styles.enhancedStatText}>{center.established_year || 'N/A'}</Text>
          </View>
        </View>

        {/* Enhanced Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardInfoText}>
              🏛️ Government Rehabilitation Center
            </Text>
          </View>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>View Details →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Option Picker Component
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
      <TouchableOpacity style={styles.pickerTrigger} onPress={() => setOpen(true)}>
        <Text style={styles.pickerText} numberOfLines={1}>{selected}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{label}</Text>
          <ScrollView>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.optionRow, active && styles.optionRowActive]}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.modalClose} onPress={() => setOpen(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
  },

  // IRCA Button Styles
  ircaButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  ircaButton: {
    backgroundColor: '#003366',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  ircaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ircaButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ircaButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ircaButtonText: {
    flex: 1,
  },
  ircaButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ircaButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ircaButtonArrow: {
    padding: 8,
  },

  // IRCA Dropdown Styles
  ircaDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownHeader: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 4,
  },
  dropdownSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  dropdownSearchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  dropdownSearchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
  },
  ircaDropdownList: {
    paddingBottom: 16,
  },

  // Enhanced Header Styles
  enhancedHeader: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 16,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },

  // Empty State Styles
  enhancedEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 20,
  },

  // Enhanced Card Styles
  enhancedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#003366',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  enhancedCardPadding: {
    padding: 16,
  },
  enhancedCardHeader: {
    marginBottom: 12,
  },
  enhancedCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 8,
    lineHeight: 24,
  },
  enhancedCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6C757D',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '600',
  },
  enhancedCardDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  enhancedCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  enhancedStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    borderRadius: 8,
  },
  enhancedStatIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  enhancedStatText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardInfoText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  cardButton: {
    backgroundColor: '#003366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  optionRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  optionRowActive: {
    backgroundColor: '#00336610',
  },
  optionText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#003366',
    fontWeight: '700',
  },
  modalClose: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
