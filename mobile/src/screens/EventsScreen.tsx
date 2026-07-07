import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';


interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  district: string;
  centerId: number;
  type: 'Workshop' | 'Awareness Camp' | 'Counseling Session' | 'Support Group' | 'Training';
  description: string;
  attendees?: number;
  maxAttendees?: number;
  registrationRequired: boolean;
}

const eventTypes: Array<EventItem['type']> = [
  'Workshop',
  'Awareness Camp',
  'Counseling Session',
  'Support Group',
  'Training',
];

const mockEvents: EventItem[] = [
  {
    id: 1,
    title: 'Substance Abuse Prevention Workshop',
    date: '2026-01-15',
    time: '10:00 AM - 12:00 PM',
    district: 'Bengaluru Urban',
    centerId: 7,
    type: 'Workshop',
    description:
      'Educational workshop on substance abuse prevention strategies and early intervention methods for families and individuals.',
    attendees: 45,
    maxAttendees: 60,
    registrationRequired: true,
  },
  {
    id: 2,
    title: 'Recovery Support Group Meeting',
    date: '2026-01-18',
    time: '2:00 PM - 4:00 PM',
    district: 'Mysuru',
    centerId: 3,
    type: 'Support Group',
    description:
      'Weekly support group meeting for individuals in recovery and their families. Share experiences and gain strength from peers.',
    attendees: 23,
    maxAttendees: 30,
    registrationRequired: false,
  },
  {
    id: 3,
    title: 'Mental Health Awareness Camp',
    date: '2026-01-20',
    time: '9:00 AM - 5:00 PM',
    district: 'Dakshina Kannada',
    centerId: 13,
    type: 'Awareness Camp',
    description:
      'Comprehensive awareness camp covering mental health issues related to addiction, stress management, and coping strategies.',
    attendees: 120,
    maxAttendees: 150,
    registrationRequired: true,
  },
  {
    id: 4,
    title: 'Family Counseling Session',
    date: '2026-01-22',
    time: '3:00 PM - 5:00 PM',
    district: 'Tumkur',
    centerId: 1,
    type: 'Counseling Session',
    description:
      'Specialized counseling session for families dealing with addiction-related challenges. Learn effective communication and support techniques.',
    attendees: 18,
    maxAttendees: 25,
    registrationRequired: true,
  },
  {
    id: 5,
    title: 'Addiction Recovery Training Program',
    date: '2026-01-25',
    time: '10:00 AM - 4:00 PM',
    district: 'Belagavi',
    centerId: 15,
    type: 'Training',
    description:
      'Professional training program for healthcare workers and counselors on modern addiction recovery techniques and treatment methods.',
    attendees: 35,
    maxAttendees: 40,
    registrationRequired: true,
  },
  {
    id: 6,
    title: 'Youth Awareness Workshop',
    date: '2026-01-28',
    time: '11:00 AM - 1:00 PM',
    district: 'Shivamogga',
    centerId: 6,
    type: 'Workshop',
    description:
      'Interactive workshop designed for young adults to understand the risks of substance abuse and develop healthy coping mechanisms.',
    attendees: 55,
    maxAttendees: 70,
    registrationRequired: true,
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getEventTypeColor(type: EventItem['type']) {
  switch (type) {
    case 'Workshop':
      return '#003366';
    case 'Awareness Camp':
      return '#2E8540';
    case 'Counseling Session':
      return '#FDB81E';
    case 'Support Group':
      return '#FFC72C';
    case 'Training':
      return '#6C757D';
    default:
      return '#003366';
  }
}

function getEventTypeTextColor(type: EventItem['type']) {
  if (type === 'Counseling Session' || type === 'Support Group') return '#1A1A1A';
  return '#FFFFFF';
}

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
  const selected = options.find((o) => o.value === value)?.label ?? label;

  return (
    <>
      <Pressable style={styles.pickerTrigger} onPress={() => setOpen(true)}>
        <Text style={styles.pickerTriggerText} numberOfLines={1}>
          {selected}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  style={[styles.optionRow, active ? styles.optionRowActive : null]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {item.label}
                  </Text>
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

// Enhanced Event Card Component
function EnhancedEventCard({ event }: { event: EventItem }) {
  const hasAttendance =
    typeof event.attendees === 'number' && typeof event.maxAttendees === 'number' && event.maxAttendees > 0;
  const pct = hasAttendance ? Math.min(100, Math.round((event.attendees! / event.maxAttendees!) * 100)) : 0;

  return (
    <TouchableOpacity style={styles.enhancedCard}>
      {/* Enhanced Card Header */}
      <View style={styles.enhancedCardHeader}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getEventTypeColor(event.type) },
            ]}
          >
            <Text style={[styles.badgeText, { color: getEventTypeTextColor(event.type) }]}>
              {event.type}
            </Text>
          </View>
          <View style={[styles.badge, styles.badgeOutline]}>
            <Text style={styles.badgeOutlineText} numberOfLines={1}>
              {event.district}
            </Text>
          </View>
        </View>

        <Text style={styles.enhancedCardTitle}>{event.title}</Text>

        <View style={styles.enhancedCardLocation}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{event.district}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Card Body */}
      <View style={styles.metaBox}>
        <Text style={styles.metaText}>📅 {formatDate(event.date)}</Text>
        <Text style={styles.metaText}>🕒 {event.time}</Text>
        <Text style={styles.metaText}>📍 {event.district}</Text>
      </View>

      <Text style={styles.enhancedCardDescription} numberOfLines={3}>
        {event.description}
      </Text>

      {/* Enhanced Stats */}
      {hasAttendance ? (
        <View style={styles.attendanceBox}>
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceText}>
              👥 {event.attendees}/{event.maxAttendees} attending
            </Text>
            <Text style={styles.attendancePct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>
      ) : null}

      {/* Enhanced Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardInfoText}>
            {event.registrationRequired ? '📝 Registration Required' : '📖 Open to All'}
          </Text>
        </View>
        <TouchableOpacity style={styles.cardButton}>
          <Text style={styles.cardButtonText}>
            {event.registrationRequired ? 'Register Now' : 'Learn More'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const districtOptions: Option[] = useMemo(() => {
    const unique = Array.from(new Set(mockEvents.map((e) => e.district))).sort((a, b) => a.localeCompare(b));
    return [{ label: 'All Districts', value: 'all' }, ...unique.map((d) => ({ label: d, value: d }))];
  }, []);

  const typeOptions: Option[] = useMemo(
    () => [{ label: 'All Types', value: 'all' }, ...eventTypes.map((t) => ({ label: t, value: t }))],
    []
  );

  const filteredEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mockEvents.filter((event) => {
      const matchesDistrict = selectedDistrict === 'all' || event.district === selectedDistrict;
      const matchesType = selectedType === 'all' || event.type === selectedType;
      const matchesSearch =
        q.length === 0 ||
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q);
      return matchesDistrict && matchesType && matchesSearch;
    });
  }, [searchTerm, selectedDistrict, selectedType]);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming = filteredEvents.filter((e) => new Date(e.date) >= now);
    const past = filteredEvents.filter((e) => new Date(e.date) < now);
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [filteredEvents]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Header */}
        <View style={styles.enhancedHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.mainTitle}>Events & Workshops</Text>
            <Text style={styles.subtitle}>
              Join educational events, workshops, and support groups across Karnataka.
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{upcomingEvents.length}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{pastEvents.length}</Text>
                <Text style={styles.statLabel}>Past</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockEvents.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Filters */}
        <View style={styles.enhancedFiltersCard}>
          <Text style={styles.filtersTitle}>Find Events</Text>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="🔍 Search events..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              placeholderTextColor="#6C757D"
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>District</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  // TODO: Implement district picker modal
                  console.log('District picker pressed');
                }}
              >
                <Text style={styles.pickerButtonText}>
                  {selectedDistrict === 'all' ? 'All Districts' : selectedDistrict}
                </Text>
                <Text style={styles.pickerDropdown}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Type</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  // TODO: Implement type picker modal
                  console.log('Type picker pressed');
                }}
              >
                <Text style={styles.pickerButtonText}>
                  {selectedType === 'all' ? 'All Types' : selectedType}
                </Text>
                <Text style={styles.pickerDropdown}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.resultsSummary}>
            <Text style={styles.resultCount}>
              Showing {filteredEvents.length} of {mockEvents.length} events
            </Text>
            {searchTerm && (
              <Text style={styles.searchTerm}>
                for "{searchTerm}"
              </Text>
            )}
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.centersListContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Text style={styles.sectionSubtitle}>Join us for these upcoming events and workshops</Text>
          </View>

          {upcomingEvents.length === 0 ? (
            <View style={styles.enhancedEmptyState}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No upcoming events</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for new events in your area.
              </Text>
            </View>
          ) : (
            <View style={styles.centersGrid}>
              {upcomingEvents.map((event) => (
                <EnhancedEventCard key={event.id} event={event} />
              ))}
            </View>
          )}
        </View>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <View style={styles.centersListContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Past Events</Text>
              <Text style={styles.sectionSubtitle}>Summaries of our previous events</Text>
            </View>
            <View style={styles.centersGrid}>
              {pastEvents.map((event) => (
                <EnhancedEventCard key={event.id} event={event} />
              ))}
            </View>
          </View>
        )}

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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

  // Enhanced Filters Styles
  enhancedFiltersCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  pickerDropdown: {
    fontSize: 12,
    color: '#6C757D',
  },
  resultsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  searchTerm: {
    fontSize: 14,
    color: '#003366',
    fontStyle: 'italic',
    marginLeft: 4,
  },

  // Centers List Styles
  centersListContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  centersGrid: {
    gap: 16,
  },
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
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 20,
  },
  footerSpacer: {
    height: 20,
  },

  // Enhanced Event Card Styles
  enhancedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#003366',
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
    marginTop: 12,
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

  // Section Header Styles
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },

  // Legacy styles (keeping for compatibility)
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#003366',
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  countsText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '600',
  },
  countBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  badgeOutlineText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#495057',
    maxWidth: 140,
  },
  listGap: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 6,
  },


  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#003366',
  },
  metaBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  attendanceBox: {
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 12,
    color: '#212529',
    fontWeight: '800',
  },
  attendancePct: {
    fontSize: 12,
    color: '#003366',
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#DEE2E6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#003366',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#003366',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  pickerTrigger: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#003366',
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  optionRowActive: {
    backgroundColor: '#F1F3F5',
  },
  optionText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#003366',
  },
  modalClose: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#003366',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
