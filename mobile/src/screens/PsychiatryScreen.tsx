/**
 * ============================================================================
 * Psychiatry Screen - IRCA Platform Mobile
 * ============================================================================
 * Directory of mental health professionals and consultants
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
import { getAllPsychiatrists, Psychiatrist } from '../services/supabaseService';

type PsychiatryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PsychiatristsNavigation'>;

interface PsychiatristCityGroup {
  city: string;
  specialists: Psychiatrist[];
}

export default function PsychiatryScreen() {
  const navigation = useNavigation<PsychiatryNavigationProp>();
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPsychiatrists();
  }, []);

  const loadPsychiatrists = async () => {
    try {
      setLoading(true);
      const data = await getAllPsychiatrists();
      setPsychiatrists(data || []);
    } catch (error) {
      console.error('Error loading psychiatrists:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPsychiatrists();
    setRefreshing(false);
  };

  const psychiatristsByCity = useMemo(() => {
    const filtered = (psychiatrists || []).filter(p =>
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.affiliation || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [city: string]: PsychiatristCityGroup } = {};

    filtered.forEach(p => {
      const city = p.city || 'Other';
      if (!groups[city]) {
        groups[city] = {
          city,
          specialists: [],
        };
      }
      groups[city].specialists.push(p);
    });

    return Object.values(groups).sort((a, b) => (a.city || '').localeCompare(b.city || ''));
  }, [psychiatrists, searchQuery]);

  const handleCityPress = (city: string) => {
    setExpandedCity(expandedCity === city ? null : city);
  };

  const navigateToDetail = (psychiatrist: Psychiatrist) => {
    navigation.navigate('FacilityDetail', {
      facilityId: psychiatrist.id,
      facilityType: 'psychiatrist',
      facilityName: psychiatrist.name
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading Medical Directory...</Text>
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
        <FontAwesome name="user-md" size={26} color="#FFFFFF" style={{ marginBottom: 10 }} />
        <Text style={styles.headerTitle}>Mental Health Directory</Text>
        <Text style={styles.headerSubtitle}>
          Professional consultation registry: {psychiatrists.length} experts
        </Text>
      </View>

      {/* Modern Search */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search experts by name, specialty or city..."
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
          Find government-recognized psychiatric consultants and mental health specialists
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
        {psychiatristsByCity.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsEmoji}>🧠</Text>
            <Text style={styles.noResultsTitle}>No Specialists Found</Text>
            <Text style={styles.noResultsText}>Please try a different search keyword</Text>
          </View>
        ) : (
          psychiatristsByCity.map((group) => (
            <View key={group.city} style={styles.cityCard}>
              <TouchableOpacity
                style={[styles.cityHeader, expandedCity === group.city && styles.cityHeaderExpanded]}
                onPress={() => handleCityPress(group.city)}
                activeOpacity={0.7}
              >
                <View style={styles.cityLeft}>
                  <View style={styles.cityIconCircleSmall}>
                    <FontAwesome name="map-marker" size={16} color="#003366" />
                  </View>
                  <View style={styles.cityTextContainer}>
                    <Text style={styles.cityName}>{group.city}</Text>
                    <Text style={styles.cityCount}>{group.specialists.length} Certified Experts</Text>
                  </View>
                </View>
                <FontAwesome
                  name={expandedCity === group.city ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {expandedCity === group.city && (
                <View style={styles.specialistsList}>
                  {group.specialists.map((psychiatrist) => (
                    <TouchableOpacity
                      key={psychiatrist.id}
                      style={styles.psychiatristItem}
                      onPress={() => navigateToDetail(psychiatrist)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemCardContent}>
                        <View style={styles.psychiatristIconMain}>
                          <FontAwesome name="user-md" size={20} color="#003366" />
                        </View>
                        <View style={styles.psychiatristInfo}>
                          <View style={styles.titleRow}>
                            <Text style={styles.psychiatristName} numberOfLines={1}>
                              {psychiatrist.name}
                            </Text>

                          </View>
                          <View style={styles.specialtyBadgeRow}>
                            <View style={styles.specialtyBadge}>
                              <Text style={styles.specialtyBadgeText}>
                                {psychiatrist.specialty || 'Psychiatry'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.affiliationRow}>
                            <FontAwesome name="hospital-o" size={12} color="#6B7280" />
                            <Text style={styles.psychiatristAffiliation} numberOfLines={1}>
                              {psychiatrist.affiliation}
                            </Text>
                          </View>
                          <View style={styles.viewDetailRow}>
                            <Text style={styles.viewDetailText}>Professional Profile</Text>
                            <FontAwesome name="chevron-right" size={10} color="#3B82F6" style={{ marginLeft: 4 }} />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Primary Helpline */}
      <View style={styles.helplineFooter}>
        <View style={styles.helplineContent}>
          <View style={styles.helplineTitleRow}>
            <FontAwesome name="shield" size={16} color="#FFFFFF" />
            <Text style={styles.helplineTitleText}>KIRAN Mental Health Helpline</Text>
          </View>
          <Text style={styles.helplineSubtext}>Govt. of India Initiative (Available 24/7)</Text>
          <Text style={styles.helplineNumber}>1800-599-0019</Text>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL('tel:1800-599-0019')}
        >
          <FontAwesome name="phone" size={18} color="#003366" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
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

  specialistsList: { backgroundColor: '#FFFFFF' },
  psychiatristItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemCardContent: { flexDirection: 'row', alignItems: 'flex-start' },
  psychiatristIconMain: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  psychiatristInfo: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  psychiatristName: { fontSize: 16, fontWeight: '800', color: '#1F2937', flex: 1 },
  verifiedBatchSmall: { marginLeft: 8 },
  specialtyBadgeRow: { flexDirection: 'row', marginBottom: 10 },
  specialtyBadge: { backgroundColor: '#E6F2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  specialtyBadgeText: { fontSize: 11, color: '#003366', fontWeight: '800' },
  affiliationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  psychiatristAffiliation: { fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '500' },
  viewDetailRow: { flexDirection: 'row', alignItems: 'center' },
  viewDetailText: { fontSize: 12, color: '#3B82F6', fontWeight: '700' },

  noResultsContainer: { alignItems: 'center', paddingVertical: 60 },
  noResultsEmoji: { fontSize: 48, marginBottom: 16 },
  noResultsTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  noResultsText: { fontSize: 14, color: '#6B7280' },

  helplineFooter: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
  },
  helplineContent: { flex: 1 },
  helplineTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  helplineTitleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  helplineSubtext: { color: '#B3D9FF', fontSize: 11, marginBottom: 2 },
  helplineNumber: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  callButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonText: { color: '#003366', fontWeight: '800', marginLeft: 10, fontSize: 15 },
  bottomSpacer: { height: 20 },
});
