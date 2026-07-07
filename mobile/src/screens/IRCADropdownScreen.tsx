/**
 * ============================================================================
 * IRCA Centers Screen - Premium Unified UI
 * ============================================================================
 * Fully Database-Driven - No Hardcoded Dummy Data
 * Displays ONLY IRCA centers present in the database
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  getAllIRCADetails,
  getAllIRCACenters,
  IRCACenterDetails,
  IRCACenter
} from '../services/supabaseService';

const { width: screenWidth } = Dimensions.get('window');

// Premium Icons
const Icons = {
  Back: () => <Text style={{ fontSize: 20, color: '#FFFFFF' }}>←</Text>,
  Building: () => <View style={styles.iconCircle}><Text style={{ fontSize: 24 }}>🏢</Text></View>,
  ChevronDown: () => <Text style={{ fontSize: 16, color: '#1E293B' }}>▼</Text>,
  MapPin: () => <Text style={{ fontSize: 20 }}>📍</Text>,
  Search: () => <Text style={{ fontSize: 18, color: '#64748B' }}>🔍</Text>,
  Info: () => <Text style={{ fontSize: 18, color: '#003366' }}>ℹ️</Text>,
};

export default function IRCADropdownScreen() {
  const navigation = useNavigation();
  const [centers, setCenters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const filterTypes = ['All', 'Government', 'Private'];

  const loadData = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);

      // ONLY use ircacenter_details table - this is the source of truth
      const allDetails = await getAllIRCADetails();

      // Helper to extract district from location string with precise matching
      const extractDistrict = (location: string) => {
        if (!location) return 'Other';

        const locationLower = location.toLowerCase();

        // Special case: Hubli is in Dharwad district
        if (locationLower.includes('hubli') || locationLower.includes('hubballi')) {
          return 'Dharwad';
        }

        // Define districts with exact matching patterns
        // Order matters: check longer/more specific names first
        const districtPatterns = [
          { pattern: /\bchitradurga\b/i, name: 'Chitradurga' },
          { pattern: /\bdavangere\b/i, name: 'Davangere' },
          { pattern: /\bdavanagere\b/i, name: 'Davangere' },
          { pattern: /\bdharwad\b/i, name: 'Dharwad' },
          { pattern: /\bballari\b/i, name: 'Ballari' },
          { pattern: /\bbellary\b/i, name: 'Ballari' },
          { pattern: /\bkoppal\b/i, name: 'Koppal' },
          { pattern: /\btumkur\b/i, name: 'Tumkur' },
          { pattern: /\btumakuru\b/i, name: 'Tumkur' },
          { pattern: /\bmandya\b/i, name: 'Mandya' },
          { pattern: /\bmysore\b/i, name: 'Mysore' },
          { pattern: /\bmysuru\b/i, name: 'Mysore' },
          { pattern: /\bbelgaum\b/i, name: 'Belgaum' },
          { pattern: /\bbelagavi\b/i, name: 'Belgaum' },
          { pattern: /\bbangalore\b/i, name: 'Bangalore' },
          { pattern: /\bbengaluru\b/i, name: 'Bangalore' },
          { pattern: /\bgulbarga\b/i, name: 'Gulbarga' },
          { pattern: /\bkalaburagi\b/i, name: 'Gulbarga' },
          { pattern: /\bshimoga\b/i, name: 'Shimoga' },
          { pattern: /\bshivamogga\b/i, name: 'Shimoga' },
          { pattern: /\bhassan\b/i, name: 'Hassan' },
          { pattern: /\bgadag\b/i, name: 'Gadag' },
        ];

        // Try each pattern
        for (const { pattern, name } of districtPatterns) {
          if (pattern.test(location)) {
            return name;
          }
        }

        return 'Other';
      };

      // Map details to include extracted district
      const centersWithDistrict = allDetails.map(detail => ({
        ...detail,
        name: detail.title,
        address: detail.location,
        district: extractDistrict(detail.location),
        category: 'government' // All IRCA centers in your DB are government
      }));

      console.log('Loaded centers with districts:', centersWithDistrict.map(c => ({ name: c.name, district: c.district })));
      setCenters(centersWithDistrict);
    } catch (error) {
      console.error('Error loading IRCA data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Group centers by district and filter by type
  const districtGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    centers.forEach(center => {
      const type = center.category === 'government' ? 'Government' : 'Private';
      if (selectedType !== 'All' && type !== selectedType) return;

      const groupName = center.district || 'Other';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(center);
    });

    return Object.entries(groups)
      .map(([name, centers]) => ({ name, centers }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [centers, selectedType]);

  const totalCenters = centers.length;
  const totalDistricts = new Set(centers.map(c => c.district)).size;

  const navigateToDetail = (center: any) => {
    const centerId = center.center_id;
    if (centerId) {
      (navigation as any).navigate('IRCACenterDetail', {
        centerId: centerId,
        centerName: center.name
      });
    } else {
      (navigation as any).navigate('FacilityDetail', {
        facilityId: center.id,
        facilityType: 'irca',
        facilityName: center.name
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Connecting to Database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icons.Back />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Icons.Building />
          <Text style={styles.headerTitle}>IRCA Centers</Text>
          <Text style={styles.headerSubtitle}>{totalCenters} Verified centers in {totalDistricts} districts</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Icons.Search />
            <Text style={styles.filterLabel}>Search Categories</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {filterTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  selectedType === type && styles.activeChip
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.chipText,
                  selectedType === type && styles.activeChipText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconContainer}>
            <Icons.Info />
          </View>
          <Text style={styles.infoText}>Select a district to explore available rehabilitation facilities and their details.</Text>
        </View>

        {/* District List */}
        <View style={styles.listContainer}>
          {districtGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No verified centers found in database.</Text>
            </View>
          ) : (
            districtGroups.map(district => (
              <View key={district.name} style={styles.talukCard}>
                <TouchableOpacity
                  style={styles.talukHeader}
                  onPress={() => setExpandedDistrict(expandedDistrict === district.name ? null : district.name)}
                >
                  <View style={styles.talukInfo}>
                    <Icons.MapPin />
                    <View style={styles.talukTextContainer}>
                      <Text style={styles.talukName}>{district.name}</Text>
                      <Text style={styles.centerCount}>{district.centers.length} {district.centers.length === 1 ? 'center' : 'centers'}</Text>
                    </View>
                  </View>
                  <Icons.ChevronDown />
                </TouchableOpacity>

                {expandedDistrict === district.name && (
                  <View style={styles.expandedContent}>
                    {district.centers.map((center, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.centerItem}
                        onPress={() => navigateToDetail(center)}
                      >
                        <View style={styles.centerTextInfo}>
                          <Text style={styles.centerName}>{center.name}</Text>
                          <Text style={styles.centerAddress} numberOfLines={1}>{center.address}</Text>

                          <View style={styles.centerStatsRow}>
                            {center.beds && (
                              <View style={styles.miniStat}>
                                <Text style={styles.miniStatText}>🛏️ {center.beds}</Text>
                              </View>
                            )}
                            {center.rating && (
                              <View style={styles.miniStat}>
                                <Text style={styles.miniStatText}>⭐ {center.rating}</Text>
                              </View>
                            )}
                            {center.established_year && (
                              <View style={styles.miniStat}>
                                <Text style={styles.miniStatText}>📅 {center.established_year}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.typeTag}>
                          <Text style={styles.typeTagText}>
                            {center.category === 'government' ? 'Govt' : 'Pvt'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#003366',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  filterSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 10,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeChip: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    margin: 20,
    marginTop: 15,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  talukCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  talukHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  talukInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  talukTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  talukName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  centerCount: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  expandedContent: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  centerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  centerTextInfo: {
    flex: 1,
    marginRight: 10,
  },
  centerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  centerAddress: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  centerStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniStat: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniStatText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  typeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});
