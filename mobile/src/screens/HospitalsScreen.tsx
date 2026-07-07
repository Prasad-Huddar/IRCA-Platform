/**
 * ============================================================================
 * Hospitals Screen - IRCA Platform Mobile
 * ============================================================================
 * Directory of hospitals and emergency medical services
 * High-Fidelity Government Based Design
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { getAllHospitals, Hospital } from '../services/supabaseService';

type HospitalsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HospitalsNavigation'>;

interface HospitalCityGroup {
  city: string;
  governmentHospitals: Hospital[];
  privateHospitals: Hospital[];
}

export default function HospitalsScreen() {
  const navigation = useNavigation<HospitalsNavigationProp>();
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await getAllHospitals();
      setHospitals(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHospitals();
    setRefreshing(false);
  };

  const hospitalsByCity = useMemo(() => {
    const filtered = (hospitals || []).filter(h =>
      (h.hospital || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.village || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [city: string]: HospitalCityGroup } = {};

    filtered.forEach(h => {
      const city = h.city || 'Other';
      if (!groups[city]) {
        groups[city] = {
          city,
          governmentHospitals: [],
          privateHospitals: [],
        };
      }

      if (h.type === 'government') {
        groups[city].governmentHospitals.push(h);
      } else {
        groups[city].privateHospitals.push(h);
      }
    });

    return Object.values(groups).sort((a, b) => (a.city || '').localeCompare(b.city || ''));
  }, [hospitals, searchQuery]);

  const handleCityPress = (city: string) => {
    setExpandedCity(expandedCity === city ? null : city);
    setExpandedType(null);
  };

  const handleTypePress = (cityType: string) => {
    setExpandedType(expandedType === cityType ? null : cityType);
  };

  const navigateToDetail = (hospital: Hospital) => {
    navigation.navigate('FacilityDetail', {
      facilityId: hospital.id,
      facilityType: 'hospital',
      facilityName: hospital.hospital
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading Healthcare Database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <FontAwesome name="hospital-o" size={24} color="#FFFFFF" style={{ marginBottom: 12 }} />
        <Text style={styles.headerTitle}>Hospitals & Emergency</Text>
        <Text style={styles.headerSubtitle}>
          Secure directory of {hospitals.length} medical facilities
        </Text>
      </View>

      {/* Modern Search */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by hospital name or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoIconCircle}>
          <FontAwesome name="info" size={10} color="#FFFFFF" />
        </View>
        <Text style={styles.infoBarText}>
          Expand geographic regions to locate verified de-addiction and psychiatric wings
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {hospitalsByCity.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsEmoji}>🏥</Text>
            <Text style={styles.noResultsTitle}>No Facilities Found</Text>
            <Text style={styles.noResultsText}>Please try a broader search term</Text>
          </View>
        ) : (
          hospitalsByCity.map((cityGroup) => (
            <View key={cityGroup.city} style={styles.cityCard}>
              <TouchableOpacity
                style={[styles.cityHeader, expandedCity === cityGroup.city && styles.cityHeaderExpanded]}
                onPress={() => handleCityPress(cityGroup.city)}
              >
                <View style={styles.cityLeft}>
                  <View style={styles.cityIconCircleSmall}>
                    <FontAwesome name="map-marker" size={16} color="#003366" />
                  </View>
                  <View style={styles.cityTextContainer}>
                    <Text style={styles.cityName}>{cityGroup.city}</Text>
                    <Text style={styles.cityCount}>
                      {cityGroup.governmentHospitals.length + cityGroup.privateHospitals.length} Medical Centers
                    </Text>
                  </View>
                </View>
                <FontAwesome
                  name={expandedCity === cityGroup.city ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {expandedCity === cityGroup.city && (
                <View style={styles.typesList}>
                  {/* Govt Section */}
                  {cityGroup.governmentHospitals.length > 0 && (
                    <View style={styles.typeSection}>
                      <TouchableOpacity
                        style={[styles.typeHeader, expandedType === `${cityGroup.city}-gov` && styles.typeHeaderActive]}
                        onPress={() => handleTypePress(`${cityGroup.city}-gov`)}
                      >
                        <View style={styles.typeLeft}>
                          <View style={styles.govIconBadge}>
                            <FontAwesome name="institution" size={12} color="#FFFFFF" />
                          </View>
                          <Text style={styles.typeLabel}>Government Sector</Text>
                        </View>
                        <View style={styles.countBadgeGov}>
                          <Text style={styles.countBadgeText}>{cityGroup.governmentHospitals.length}</Text>
                        </View>
                      </TouchableOpacity>

                      {expandedType === `${cityGroup.city}-gov` && (
                        <View style={styles.hospitalList}>
                          {cityGroup.governmentHospitals.map(h => (
                            <HospitalListItem key={h.id} hospital={h} onPress={() => navigateToDetail(h)} />
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Private Section */}
                  {cityGroup.privateHospitals.length > 0 && (
                    <View style={styles.typeSection}>
                      <TouchableOpacity
                        style={[styles.typeHeader, expandedType === `${cityGroup.city}-pvt` && styles.typeHeaderActive]}
                        onPress={() => handleTypePress(`${cityGroup.city}-pvt`)}
                      >
                        <View style={styles.typeLeft}>
                          <View style={styles.pvtIconBadge}>
                            <FontAwesome name="building" size={12} color="#FFFFFF" />
                          </View>
                          <Text style={styles.typeLabel}>Private Sector</Text>
                        </View>
                        <View style={styles.countBadgePvt}>
                          <Text style={styles.countBadgeText}>{cityGroup.privateHospitals.length}</Text>
                        </View>
                      </TouchableOpacity>

                      {expandedType === `${cityGroup.city}-pvt` && (
                        <View style={styles.hospitalList}>
                          {cityGroup.privateHospitals.map(h => (
                            <HospitalListItem key={h.id} hospital={h} onPress={() => navigateToDetail(h)} />
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Emergency Helpline */}
      <View style={styles.emergencyFooter}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Linking.openURL('tel:108')}
        >
          <FontAwesome name="phone" size={20} color="#FFFFFF" />
          <Text style={styles.emergencyText}>Medical Emergency: Call 108</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HospitalListItem({ hospital, onPress }: { hospital: Hospital, onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.hospitalItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.hospitalCardContent}>
        <View style={styles.hospitalIconMain}>
          <FontAwesome name="hospital-o" size={20} color="#003366" />
        </View>
        <View style={styles.hospitalInfo}>
          <View style={styles.hospitalTitleRow}>
            <Text style={styles.hospitalTitle} numberOfLines={1}>{hospital.hospital}</Text>
            {hospital.type === 'government' && (
              <View style={styles.govBadgeSmall}>
                <Text style={styles.govBadgeTextSmall}>Govt</Text>
              </View>
            )}
          </View>
          <View style={styles.hospitalLocationRow}>
            <FontAwesome name="map-marker" size={12} color="#6B7280" />
            <Text style={styles.hospitalSubtitle} numberOfLines={1}>
              {hospital.village ? `${hospital.village}, ` : ''}{hospital.city}
            </Text>
          </View>
          {hospital.details && (
            <Text style={styles.hospitalDetailsSnippet} numberOfLines={2}>
              {hospital.details}
            </Text>
          )}
          <View style={styles.viewDetailRow}>
            <Text style={styles.viewDetailText}>View full facilities</Text>
            <FontAwesome name="chevron-right" size={10} color="#3B82F6" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#003366', fontWeight: '600' },

  header: {
    backgroundColor: '#003366',
    paddingTop: 50,
    paddingBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerBack: {
    position: 'absolute',
    left: 16,
    top: 52,
    zIndex: 10,
    padding: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  headerSubtitle: { fontSize: 13, color: '#B3D9FF', marginTop: 4, opacity: 0.9, textAlign: 'center' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1F2937' },

  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  infoIconCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoBarText: { fontSize: 13, color: '#1E40AF', fontWeight: '500', flex: 1, lineHeight: 18 },

  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },

  cityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  cityHeaderExpanded: { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  cityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cityIconCircleSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' },
  cityTextContainer: { marginLeft: 16, flex: 1 },
  cityName: { fontSize: 18, fontWeight: '800', color: '#003366' },
  cityCount: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },

  typesList: { backgroundColor: '#FFFFFF', paddingBottom: 8 },
  typeSection: { marginBottom: 2 },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  typeHeaderActive: { backgroundColor: '#F8FAFC' },
  typeLeft: { flexDirection: 'row', alignItems: 'center' },
  govIconBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
  pvtIconBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  typeLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginLeft: 12 },
  countBadgeGov: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  countBadgePvt: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: '#1F2937' },

  hospitalList: { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  hospitalItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hospitalCardContent: { flexDirection: 'row', alignItems: 'flex-start' },
  hospitalIconMain: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  hospitalInfo: { flex: 1, marginLeft: 16 },
  hospitalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  hospitalTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', flex: 1, marginRight: 8 },
  govBadgeSmall: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  govBadgeTextSmall: { fontSize: 10, fontWeight: '700', color: '#059669' },
  hospitalLocationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  hospitalSubtitle: { fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '500' },
  hospitalDetailsSnippet: { fontSize: 12, color: '#4B5563', lineHeight: 18, marginBottom: 10, fontStyle: 'italic' },
  viewDetailRow: { flexDirection: 'row', alignItems: 'center' },
  viewDetailText: { fontSize: 12, color: '#3B82F6', fontWeight: '700' },

  noResultsContainer: { alignItems: 'center', paddingVertical: 60 },
  noResultsEmoji: { fontSize: 48, marginBottom: 16 },
  noResultsTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  noResultsText: { fontSize: 14, color: '#6B7280' },

  emergencyFooter: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginLeft: 12 },
  bottomSpacer: { height: 20 },
});
