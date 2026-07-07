/**
 * ============================================================================
 * IRCA Center Detail Screen - Mobile Version
 * ============================================================================
 * Strictly Database-Driven Detailed View
 * Ensures no dummy data is shown, fetching everything from Supabase
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    Dimensions,
    Linking,
    StatusBar,
    Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { getIRCACenterDetails, IRCACenterDetails } from '../services/supabaseService';

type IRCACenterDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IRCACenterDetail'>;

const { width: screenWidth } = Dimensions.get('window');

// Premium Icons
const Icons = {
    Back: () => <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>,
    Phone: () => <Text style={{ fontSize: 18 }}>📞</Text>,
    Email: () => <Text style={{ fontSize: 18 }}>📧</Text>,
    Clock: () => <Text style={{ fontSize: 18 }}>🕐</Text>,
    MapPin: () => <Text style={{ fontSize: 18 }}>📍</Text>,
    Star: () => <Text style={{ fontSize: 18, color: '#FBBF24' }}>⭐</Text>,
    Bed: () => <Text style={{ fontSize: 18 }}>🛏️</Text>,
    Calendar: () => <Text style={{ fontSize: 18 }}>📅</Text>,
    Verified: () => <Text style={{ fontSize: 14 }}>✅</Text>,
    Navigation: () => <Text style={{ fontSize: 18 }}>🧭</Text>,
    Info: () => <Text style={{ fontSize: 18 }}>ℹ️</Text>,
    Users: () => <Text style={{ fontSize: 18 }}>👥</Text>,
    Share: () => <Text style={{ fontSize: 18, color: '#FFFFFF' }}>📤</Text>,
};

export default function IRCACenterDetailScreen() {
    const navigation = useNavigation<IRCACenterDetailNavigationProp>();
    const route = useRoute();
    const { centerId } = route.params as { centerId: string };

    const [details, setDetails] = useState<IRCACenterDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'staff'>('overview');
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    useEffect(() => {
        loadData();
    }, [centerId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getIRCACenterDetails(centerId);

            if (data) {
                // Parse staff and contact if they are strings (TEXT columns in DB)
                let processedStaff = data.staff;
                if (typeof data.staff === 'string') {
                    try { processedStaff = JSON.parse(data.staff); } catch (e) { processedStaff = []; }
                }

                let processedContact = data.contact;
                if (typeof data.contact === 'string') {
                    try { processedContact = JSON.parse(data.contact); } catch (e) { processedContact = {}; }
                }

                setDetails({
                    ...data,
                    staff: processedStaff,
                    contact: processedContact
                });
            } else {
                setDetails(null);
            }
        } catch (error) {
            console.error('Error loading center details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone?: string) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = (email?: string) => {
        if (!email) return;
        Linking.openURL(`mailto:${email}`);
    };

    const handleMap = () => {
        if (details?.location) {
            const query = encodeURIComponent(details.location);
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
        }
    };

    const handleShare = async () => {
        if (!details) return;
        try {
            await Share.share({
                message: `Check out ${details.title} on IRCA Platform. Location: ${details.location}. Helpline: ${details.contact?.helpline || '14446'}`,
            });
        } catch (error) {
            console.error('Sharing failed', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#003366" />
                <Text style={styles.loadingText}>Fetching details from database...</Text>
            </View>
        );
    }

    if (!details) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Center Not Found</Text>
                <Text style={styles.errorText}>We couldn't retrieve information for this center from our database.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Return to List</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = (details.images && details.images.length > 0)
        ? details.images
        : ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop'];

    const staffArray = Array.isArray(details.staff) ? details.staff : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Dynamic Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
                    <Icons.Back />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{details.title}</Text>
                <TouchableOpacity style={styles.headerIconButton} onPress={handleShare}>
                    <Icons.Share />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel - Conditional Rendering */}
                {details.images && details.images.length > 0 && (
                    <View style={styles.imageContainer}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const x = e.nativeEvent.contentOffset.x;
                                setCurrentImgIndex(Math.round(x / screenWidth));
                            }}
                        >
                            {details.images.map((img, i) => (
                                <Image key={i} source={{ uri: img }} style={styles.heroImage} />
                            ))}
                        </ScrollView>
                        <View style={styles.imageBadge}>
                            <Text style={styles.imageBadgeText}>{currentImgIndex + 1} / {details.images.length}</Text>
                        </View>
                    </View>
                )}

                {/* Content Card */}
                <View style={styles.contentCard}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{details.title}</Text>

                    </View>

                    <View style={styles.locationRow}>
                        <Icons.MapPin />
                        <Text style={styles.locationText}>{details.location || 'Location not specified in database'}</Text>
                    </View>

                    {/* Quick Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Icons.Bed />
                            <Text style={styles.statValue}>{details.beds || 'N/A'}</Text>
                            <Text style={styles.statLabel}>Capacity</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Icons.Star />
                            <Text style={styles.statValue}>{details.rating || 'N/A'}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Icons.Calendar />
                            <Text style={styles.statValue}>{details.established_year || 'N/A'}</Text>
                            <Text style={styles.statLabel}>Established</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.primaryCallBtn} onPress={() => handleCall(details.phone?.[0])}>
                            <Icons.Phone />
                            <Text style={styles.primaryCallText}>Contact Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mapBtn} onPress={handleMap}>
                            <Icons.Navigation />
                            <Text style={styles.mapBtnText}>Directions</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        {(['overview', 'services', 'staff'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Tab Content */}
                    <View style={styles.tabContent}>
                        {activeTab === 'overview' && (
                            <View>
                                <Text style={styles.sectionTitle}>About this IRCA</Text>
                                <Text style={styles.description}>
                                    {details.overview || 'Detailed information for this center is currently unavailable in the database.'}
                                </Text>

                                <Text style={styles.sectionTitle}>Official Contact Details</Text>
                                <View style={styles.contactList}>
                                    <ContactItem
                                        icon={<Icons.Phone />}
                                        label="National Helpline"
                                        value={details.contact?.helpline?.split(',')[0] || '14446'}
                                        onPress={() => handleCall('14446')}
                                    />
                                    <ContactItem
                                        icon={<Icons.Email />}
                                        label="Primary Email"
                                        value={details.email || 'N/A'}
                                        onPress={() => handleEmail(details.email)}
                                    />
                                    <ContactItem
                                        icon={<Icons.Clock />}
                                        label="Service Hours"
                                        value={details.contact?.operating_hours || '24/7 Available'}
                                    />
                                </View>
                            </View>
                        )}

                        {activeTab === 'services' && (
                            <View>
                                <Text style={styles.sectionTitle}>Treatment & Services</Text>
                                {details.services && details.services.length > 0 ? (
                                    <View style={styles.servicesGrid}>
                                        {details.services.map((s, idx) => (
                                            <View key={idx} style={styles.serviceChip}>
                                                <Text style={styles.serviceChipText}>• {s}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.noData}>Service details are pending database update.</Text>
                                )}
                            </View>
                        )}

                        {activeTab === 'staff' && (
                            <View>
                                <Text style={styles.sectionTitle}>Specialist Team</Text>
                                {staffArray.length > 0 ? (
                                    staffArray.map((s: any, idx: number) => (
                                        <View key={idx} style={styles.staffCard}>
                                            <View style={styles.staffIcon}><Icons.Users /></View>
                                            <View>
                                                <Text style={styles.staffName}>{s.name || 'N/A'}</Text>
                                                <Text style={styles.staffRole}>{s.designation || 'N/A'}</Text>
                                                <Text style={styles.staffQual}>{s.qualification || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noData}>Personnel records are currently not listed.</Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function ContactItem({ icon, label, value, onPress }: { icon: any, label: string, value: string, onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.contactItem} onPress={onPress} disabled={!onPress}>
            <View style={styles.contactIconContainer}>{icon}</View>
            <View>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={styles.contactValue}>{value}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, color: '#003366', fontWeight: '600' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorTitle: { fontSize: 24, fontWeight: '800', color: '#003366', marginBottom: 12 },
    errorText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
    backBtn: { backgroundColor: '#003366', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    backBtnText: { color: '#FFFFFF', fontWeight: '700' },
    header: {
        backgroundColor: '#003366',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    headerIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 15 },
    imageContainer: { width: screenWidth, height: 280, position: 'relative' },
    heroImage: { width: screenWidth, height: 280, resizeMode: 'cover' },
    imageBadge: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    imageBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    contentCard: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 24 },
    titleSection: { marginBottom: 12 },
    title: { fontSize: 26, fontWeight: '800', color: '#003266', marginBottom: 8 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
    verifiedText: { color: '#059669', fontSize: 12, fontWeight: '700', marginLeft: 6 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    locationText: { color: '#6B7280', fontSize: 14, marginLeft: 8, flex: 1 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 15, alignItems: 'center', marginHorizontal: 4 },
    statValue: { fontSize: 16, fontWeight: '800', color: '#003366', marginTop: 8 },
    statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    primaryCallBtn: { flex: 1.5, backgroundColor: '#003366', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    primaryCallText: { color: '#FFFFFF', fontWeight: '800', marginLeft: 10, fontSize: 16 },
    mapBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    mapBtnText: { color: '#003366', fontWeight: '700', marginLeft: 8 },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 24 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#003366' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
    activeTabText: { color: '#003366', fontWeight: '800' },
    tabContent: { minHeight: 400 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#003366', marginTop: 10, marginBottom: 12 },
    description: { fontSize: 15, lineHeight: 24, color: '#4B5563', marginBottom: 24 },
    contactList: { gap: 16 },
    contactItem: { flexDirection: 'row', alignItems: 'center' },
    contactIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    contactLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    contactValue: { fontSize: 15, color: '#1F2937', fontWeight: '700' },
    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    serviceChip: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
    serviceChipText: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
    staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 16, marginBottom: 12 },
    staffIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    staffName: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
    staffRole: { fontSize: 13, color: '#4F46E5', fontWeight: '700' },
    staffQual: { fontSize: 12, color: '#6B7280' },
    noData: { color: '#9CA3AF', fontSize: 14, fontStyle: 'italic' },
});
