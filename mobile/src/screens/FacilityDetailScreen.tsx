import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
  RefreshControl,
  Image,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { getGovernmentIRCACenters, getPrivateIRCACenters, getGovernmentHospitals, getPrivateHospitals, getAllPsychiatrists, getIRCACenterDetails, IRCACenterDetails } from '../services/supabaseService';
import { supabase } from '../lib/supabaseClient';

const { width: screenWidth } = Dimensions.get('window');

type FacilityDetailRouteProp = RouteProp<{
  FacilityDetail: {
    facilityId: string;
    facilityType: 'irca' | 'hospital' | 'psychiatrist';
    facilityName: string;
  };
}, 'FacilityDetail'>;

const Icons = {
  Building: () => <Text style={{ fontSize: 24 }}>🏢</Text>,
  ChevronDown: () => <Text style={{ fontSize: 16 }}>▼</Text>,
  ChevronUp: () => <Text style={{ fontSize: 16 }}>▲</Text>,
  MapPin: () => <Text style={{ fontSize: 18 }}>📍</Text>,
  Phone: () => <Text style={{ fontSize: 18 }}>📞</Text>,
  Clock: () => <Text style={{ fontSize: 18 }}>🕒</Text>,
  Star: () => <Text style={{ fontSize: 18 }}>⭐</Text>,
  Calendar: () => <Text style={{ fontSize: 18 }}>📅</Text>,
  Bed: () => <Text style={{ fontSize: 18 }}>🛏️</Text>,
  Compass: () => <Text style={{ fontSize: 18 }}>🧭</Text>,
  Verified: () => <Text style={{ fontSize: 14 }}>✅</Text>,
};

export default function FacilityDetailScreen() {
  const route = useRoute<FacilityDetailRouteProp>();
  const navigation = useNavigation();
  const { facilityId, facilityType, facilityName } = route.params;

  const [facilityDetails, setFacilityDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (facilityDetails && facilityDetails.images && facilityDetails.images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === facilityDetails.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [facilityDetails?.images]);

  const nextImage = () => {
    if (facilityDetails && facilityDetails.images) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === facilityDetails.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (facilityDetails && facilityDetails.images) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? facilityDetails.images.length - 1 : prevIndex - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFacilityDetails();
    setIsRefreshing(false);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // In a real app, you would scroll to the section
  };

  const loadFacilityDetails = useCallback(async () => {
    try {
      console.log('Loading facility details for:', facilityId, facilityType);

      let data: any = null;

      if (facilityType === 'irca') {
        // 1. Try fetching from ircacenter_details (Primary for verified centers from HomeScreen)
        const { data: detailData, error: detailError } = await supabase
          .from('ircacenter_details')
          .select('*')
          .eq('id', facilityId)
          .single();

        if (detailData) {
          console.log('Found detailed IRCA data');
          data = {
            id: detailData.id,
            center_id: detailData.center_id,
            name: detailData.title,
            type: 'irca',
            location: detailData.location,
            district: detailData.location?.split(',').slice(-1)[0]?.trim() || 'Karnataka',
            address: detailData.location,
            phone: detailData.phone,
            beds: detailData.beds,
            email: detailData.email,
            overview: detailData.overview,
            services: detailData.services || [],
            contact: detailData.contact || {},
            rating: detailData.rating,
            established_year: detailData.established_year,
            verified: true,
            images: detailData.images || [],
            staff: detailData.staff || [],
          };
        } else {
          // 2. Fallback: Fetch basic IRCA data (if ID refers to basic table)
          console.log('Detailed fetch failed, trying basic IRCA data for UUID:', facilityId);
          const { data: basicData } = await supabase
            .from('ircacenters')
            .select('*')
            .eq('id', facilityId)
            .single();

          if (basicData) {
            // Upgrade if possible
            let extended = null;
            if (basicData.center_id) {
              extended = await getIRCACenterDetails(basicData.center_id);
            }

            if (extended) {
              data = {
                ...extended,
                id: basicData.id,
                name: extended.title || basicData.name,
                location: extended.location || basicData.address,
                type: 'irca',
                verified: true
              };
            } else {
              data = {
                id: basicData.id,
                name: basicData.name,
                type: 'irca',
                district: basicData.district,
                location: basicData.address,
                address: basicData.address,
                phone: basicData.phone ? [basicData.phone] : [],
                beds: basicData.beds,
                overview: basicData.description,
                verified: false,
                images: []
              };
            }
          }
        }
      } else if (facilityType === 'hospital') {
        const { data: hospital } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', facilityId)
          .single();

        if (hospital) {
          const detailStr = hospital.details || '';
          let servicesList: string[] = [];

          if (detailStr.includes('Services:')) {
            try {
              servicesList = detailStr.split('Services:')[1].split('.')[0].split(',').map((s: string) => s.trim());
            } catch (e) { }
          }

          const fullLocation = hospital.village ? `${hospital.village}, ${hospital.city}` : hospital.city;

          data = {
            id: hospital.id,
            name: hospital.hospital,
            type: 'hospital',
            district: hospital.city,
            location: fullLocation,
            address: fullLocation,
            overview: detailStr,
            services: servicesList,
            category: hospital.type,
            verified: true,
            images: [],
            phone: [],
            email: null
          };
        }
      } else if (facilityType === 'psychiatrist') {
        const { data: psychiatrist } = await supabase
          .from('psychiatrists')
          .select('*')
          .eq('id', facilityId)
          .single();

        if (psychiatrist) {
          const servicesList = psychiatrist.specialty
            ? psychiatrist.specialty.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
            : [];

          const fullLocation = psychiatrist.village ? `${psychiatrist.village}, ${psychiatrist.city}` : psychiatrist.city;

          data = {
            id: psychiatrist.id,
            name: psychiatrist.name,
            type: 'psychiatrist',
            district: psychiatrist.city,
            location: fullLocation,
            address: fullLocation,
            overview: psychiatrist.affiliation || 'Psychiatric Specialist',
            services: servicesList,
            specialty: psychiatrist.specialty,
            affiliation: psychiatrist.affiliation,
            verified: true,
            images: [],
            phone: [],
            email: null
          };
        }
      }

      setFacilityDetails(data);
    } catch (error) {
      console.error('Error loading facility details:', error);
      Alert.alert('Error', 'Failed to load facility details');
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, facilityType]);

  useEffect(() => {
    loadFacilityDetails();
  }, [loadFacilityDetails]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${facilityName}, a ${facilityType} facility in Karnataka.`,
        title: facilityName,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWebsite = () => {
    if (facilityDetails?.contact?.website) {
      Alert.alert('Website', `Would open: ${facilityDetails.contact.website}`);
      // In a real app, you'd use Linking.openURL(website)
    }
  };

  const handleCall = () => {
    if (facilityDetails?.phone?.[0]) {
      Alert.alert('Call Facility', `Would call: ${facilityDetails.phone[0]}`);
      // In a real app, you'd use Linking.openURL(`tel:${phone}`)
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077B6" />
        <Text style={styles.loadingText}>Loading center details...</Text>
      </View>
    );
  }

  if (!facilityDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Center Not Found</Text>
        <Text style={styles.errorText}>The center you're looking for doesn't exist.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'ℹ️' },
    { id: 'services', label: 'Services', icon: '🏥' },
    { id: 'gallery', label: 'Gallery', icon: '📷' },
    { id: 'staff', label: 'Staff', icon: '👥' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{facilityDetails.name || 'Center Details'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#003366']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Conditional Rendering */}
        {facilityDetails.images && facilityDetails.images.length > 0 && (
          <View style={styles.heroSection}>
            <Image
              source={{ uri: facilityDetails.images[currentImageIndex] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {facilityDetails.images.length > 1 && (
              <View style={styles.paginationContainer}>
                {facilityDetails.images.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.paginationDot,
                      currentImageIndex === i && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Content Card overlapping Hero */}
        <View style={styles.mainContentCard}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.facilityTitle}>{facilityDetails.name}</Text>

          </View>

          {(facilityDetails.location || facilityDetails.address) && (
            <View style={styles.addressRow}>
              <Icons.MapPin />
              <Text style={styles.addressText}>{facilityDetails.location || facilityDetails.address}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icons.Bed />
              <Text style={styles.statText}>{facilityDetails.beds || '30'} beds</Text>
            </View>
            <View style={styles.statItem}>
              <Icons.Calendar />
              <Text style={styles.statText}>Est. {facilityDetails.established_year || '1995'}</Text>
            </View>
            <View style={styles.statItem}>
              <Icons.Star />
              <Text style={styles.statText}>{facilityDetails.rating || '4.6'}/5</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.callNowButton} onPress={handleCall}>
              <Icons.Phone />
              <Text style={styles.callNowButtonText}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionsButton}>
              <Icons.Compass />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Info Section */}
          <View style={styles.contactInfoSection}>
            <Text style={styles.sectionHeaderTitle}>Contact Info</Text>

            <View style={styles.contactItemRow}>
              <View style={styles.contactIconContainer}>
                <Icons.Phone />
              </View>
              <View style={styles.contactValueContainer}>
                <Text style={styles.contactLabelSmall}>Phone</Text>
                <Text style={styles.contactValueLarge}>
                  {Array.isArray(facilityDetails.phone) ? facilityDetails.phone[0] : (facilityDetails.phone || '+91-816-2279463')}
                </Text>
              </View>
            </View>

            {facilityDetails.email && (
              <View style={styles.contactItemRow}>
                <View style={styles.contactIconContainer}>
                  <Text style={{ fontSize: 20 }}>✉️</Text>
                </View>
                <View style={styles.contactValueContainer}>
                  <Text style={styles.contactLabelSmall}>Email</Text>
                  <Text style={styles.contactValueLarge}>{facilityDetails.email}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <Text style={styles.navigationTitle}>Quick Navigation</Text>
          <View style={styles.navigationGrid}>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navigationItem,
                  activeSection === item.id && styles.activeNavigationItem
                ]}
                onPress={() => scrollToSection(item.id)}
              >
                <Text style={styles.navigationIcon}>{item.icon}</Text>
                <Text style={[
                  styles.navigationLabel,
                  activeSection === item.id && styles.activeNavigationLabel
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overview Section */}
        {facilityDetails.overview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ About This Facility</Text>
            <View style={styles.card}>
              <Text style={styles.overviewText}>{facilityDetails.overview}</Text>

              <View style={styles.featureGrid}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureValue}>{facilityDetails.beds || 'N/A'}</Text>
                  <Text style={styles.featureLabel}>Treatment Beds</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureValue}>{facilityDetails.rating ? `${facilityDetails.rating}/5` : 'N/A'}</Text>
                  <Text style={styles.featureLabel}>Rating</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureValue}>{facilityDetails.established_year || 'N/A'}</Text>
                  <Text style={styles.featureLabel}>Established</Text>
                </View>
              </View>

              <View style={styles.checklistContainer}>
                <View style={styles.checklistItem}>
                  <Text style={styles.checklistText}>✓ Licensed Rehabilitation Center</Text>
                </View>
                <View style={styles.checklistItem}>
                  <Text style={styles.checklistText}>✓ Professional Medical Staff</Text>
                </View>
                <View style={styles.checklistItem}>
                  <Text style={styles.checklistText}>✓ Evidence-based Treatment</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Services Section */}
        {facilityDetails.services && facilityDetails.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 Our Services</Text>
            <View style={styles.servicesGrid}>
              {facilityDetails.services.map((service: string, index: number) => (
                <View key={index} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceIcon}>🏥</Text>
                    <Text style={styles.serviceTitle}>{service}</Text>
                  </View>
                  <View style={styles.serviceBadge}>
                    <Text style={styles.serviceBadgeText}>Available</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Gallery Section - Only show if center has images */}
        {facilityDetails.images && facilityDetails.images.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Facility Gallery</Text>
            <View style={styles.galleryGrid}>
              {facilityDetails.images.map((image: string, index: number) => (
                <View key={index} style={styles.galleryItem}>
                  {image.startsWith('http') ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.galleryImage}
                    />
                  ) : (
                    <View style={styles.galleryPlaceholder}>
                      <Text style={styles.galleryPlaceholderText}>📷 Photo {index + 1}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Staff Section - Only show if center has staff data */}
        {facilityDetails.staff && facilityDetails.staff.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Our Medical Team</Text>
            <View style={styles.staffGrid}>
              {facilityDetails.staff.map((staff: any, index: number) => (
                <View key={index} style={styles.staffCard}>
                  <View style={styles.staffHeader}>
                    <View style={styles.staffAvatar}>
                      <Text style={styles.staffAvatarText}>👤</Text>
                    </View>
                    <Text style={styles.staffName}>{staff.name}</Text>
                  </View>
                  <View style={styles.staffDetails}>
                    <Text style={styles.staffRole}>{staff.designation}</Text>
                    <Text style={styles.staffQualification}>{staff.qualification}</Text>
                  </View>
                  <View style={styles.staffBadge}>
                    <Text style={styles.staffBadgeText}>Available</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Contact Section - Detailed (Redundant with Hero, maybe keep if different or just hide duplicates) 
            For now, I'll clean it to only show if data exists and is not shown above or if this is the "official" full contact area 
        */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Information</Text>
          <View style={styles.card}>
            {facilityDetails.phone ? (
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoIcon}>📞</Text>
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Phone Number</Text>
                  <Text style={styles.contactInfoValue}>{Array.isArray(facilityDetails.phone) ? facilityDetails.phone.join(', ') : facilityDetails.phone}</Text>
                </View>
              </View>
            ) : null}

            {facilityDetails.email ? (
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoIcon}>✉️</Text>
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Email Address</Text>
                  <Text style={styles.contactInfoValue}>{facilityDetails.email}</Text>
                </View>
              </View>
            ) : null}

            {(facilityDetails.location || facilityDetails.address) ? (
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoIcon}>📍</Text>
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Address</Text>
                  <Text style={styles.contactInfoValue}>{facilityDetails.location || facilityDetails.address}</Text>
                </View>
              </View>
            ) : null}

            {facilityDetails.contact?.operating_hours ? (
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoIcon}>🕒</Text>
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Operating Hours</Text>
                  <Text style={styles.contactInfoValue}>{facilityDetails.contact.operating_hours}</Text>
                </View>
              </View>
            ) : null}

            {/* Emergency Contact */}
            {facilityDetails.contact?.helpline && (
              <View style={styles.emergencyCard}>
                <Text style={styles.emergencyTitle}>Emergency Contact</Text>
                <View style={styles.emergencyContent}>
                  <Text style={styles.emergencyIcon}>📞</Text>
                  <View>
                    <Text style={styles.emergencyLabel}>Emergency Helpline</Text>
                    <Text style={styles.emergencyNumber}>{facilityDetails.contact.helpline}</Text>
                    <Text style={styles.emergencySubtext}>Available 24/7 for emergencies</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>


        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#003366',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0077B6',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#495057',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  mainContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    minHeight: 400,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  facilityTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#003366',
    flex: 1,
    marginRight: 10,
    lineHeight: 32,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B7EBCE',
  },
  verifiedBadgeText: {
    color: '#28A745',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 10,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  callNowButton: {
    flex: 1,
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  directionsButtonText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: '700',
  },
  contactInfoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactValueContainer: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabelSmall: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  contactValueLarge: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  heroOverlay: {
    display: 'none',
  },
  heroContent: {
    display: 'none',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  districtBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  contactLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  successRow: {
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  successText: {
    color: '#155724',
  },
  navigationSection: {
    padding: 20,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 16,
  },
  navigationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  navigationItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeNavigationItem: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  navigationIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  navigationLabel: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeNavigationLabel: {
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  checklistContainer: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checklistText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
    lineHeight: 18,
  },
  serviceBadge: {
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  serviceBadgeText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '600',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: (screenWidth - 56) / 2, // 2 columns with padding
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  galleryPlaceholderText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  staffGrid: {
    gap: 16,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  staffAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffAvatarText: {
    fontSize: 24,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 4,
    textAlign: 'center',
  },
  staffRole: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  staffQualification: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 8,
    textAlign: 'center',
  },
  staffBadge: {
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  staffBadgeText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '600',
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffDetails: {
    alignItems: 'center',
    marginBottom: 12,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  contactInfoIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  contactInfoContent: {
    flex: 1,
  },
  contactInfoLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactInfoValue: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
  },
  emergencyCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 12,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#856404',
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 2,
  },
  emergencyNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#856404',
    marginBottom: 2,
  },
  emergencySubtext: {
    fontSize: 12,
    color: '#856404',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#003366',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryActionButton: {
    backgroundColor: '#6C757D',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerSpacer: {
    height: 40,
  },
});
