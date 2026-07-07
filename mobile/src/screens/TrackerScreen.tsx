import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import CryptoJS from 'crypto-js';
import {
  getAllSobrietyTrackers,
  getUserMilestones,
  initializeSobrietyTracker,
  recordRelapse,
  updateSobrietyTracker,
  getUserGoals,
  createUserGoal,
  getDailyTrackingLogs,
  stopSobrietyTracker,
  SobrietyTracker,
  DailyTrackingLog
} from '../services/profileTrackerService';

// Interfaces matching the logic
interface ExtendedSobrietyTracker extends SobrietyTracker {
  daily_cost?: number;
}

interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  goal_description: string;
  target_value: number;
  target_date?: string;
  progress_unit: string;
  current_progress: number;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  user_id: string;
  tracker_id: string;
  milestone_type: string;
  days_achieved: number;
  financial_savings: number;
  date_achieved: string;
  created_at: string;
}

export default function TrackerScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  // State management
  const [trackers, setTrackers] = useState<ExtendedSobrietyTracker[]>([]);
  const [allTrackers, setAllTrackers] = useState<ExtendedSobrietyTracker[]>([]); // ALL trackers including stopped
  const [activeTracker, setActiveTracker] = useState<ExtendedSobrietyTracker | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<DailyTrackingLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // UI state
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showRelapseForm, setShowRelapseForm] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const [newTracker, setNewTracker] = useState({
    addiction_type: '',
    daily_cost: ''
  });
  const [relapseData, setRelapseData] = useState({
    triggers: [] as string[],
    notes: ''
  });
  const [newGoal, setNewGoal] = useState({
    goal_type: 'sobriety',
    goal_description: '',
    target_value: '',
    target_date: '',
    progress_unit: 'days'
  });

  // Timer state
  const [elapsedTime, setElapsedTime] = useState<string>('0m 0s');

  const addictionOptions = [
    'Alcohol addiction',
    'Drug addiction',
    'Tobacco addiction',
    'Cannabis',
    'Opioid'
  ];

  const triggersList = [
    'At certain times, I feel like drinking',
    'Feeling bored',
    'Loneliness',
    'Nearby bars',
    'Family tension',
    'Friends circle',
    'Tiredness',
    'Financial stress',
    'Work tension',
    'Love failure',
    'Having doubts',
    'Family history of alcoholism'
  ];

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTracker?.is_active && activeTracker?.start_date) {
      const updateTimer = () => {
        const now = new Date();
        const start = new Date(activeTracker.start_date);
        const diff = now.getTime() - start.getTime();

        if (diff < 0) {
          setElapsedTime('0m 0s');
          return;
        }

        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeString = '';
        if (months > 0) timeString += `${months}m `;
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        timeString += `${minutes}m ${seconds}s`;
        setElapsedTime(timeString);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('0m 0s');
    }
    return () => clearInterval(interval);
  }, [activeTracker?.is_active, activeTracker?.start_date]);

  // Data fetching
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [trackersResponse, goalsResponse, milestonesResponse] = await Promise.all([
        getAllSobrietyTrackers(user.id),
        getUserGoals(user.id),
        getUserMilestones(user.id)
      ]);

      try {
        const logsResponse = await getDailyTrackingLogs(user.id, '', '');
        if (logsResponse.success && logsResponse.data) {
          setTrackingLogs(logsResponse.data);
        }
      } catch (e) {
        console.warn('⚠️ Failed to load daily logs:', e);
      }

      if (trackersResponse.success && trackersResponse.data) {
        const fetchedTrackers = trackersResponse.data as ExtendedSobrietyTracker[];
        setAllTrackers(fetchedTrackers);
        const currentTrackers = fetchedTrackers.filter(t => !t.end_date);
        setTrackers(currentTrackers);

        const active = currentTrackers.find(t => t.is_active);
        if (active) {
          setActiveTracker(active);
        } else if (currentTrackers.length > 0) {
          setActiveTracker(currentTrackers[0]);
        } else if (fetchedTrackers.length > 0) {
          const mostRecent = fetchedTrackers.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          setActiveTracker(mostRecent);
        } else {
          setActiveTracker(null);
        }
      }

      if (goalsResponse.success && goalsResponse.data) {
        setGoals(goalsResponse.data);
      }

      if (milestonesResponse.success && milestonesResponse.data) {
        setMilestones(milestonesResponse.data as Milestone[]);
      }

    } catch (err) {
      console.error('❌ Error fetching tracker data:', err);
      Alert.alert('Error', 'Failed to load tracker data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Derived calculations
  const getCurrentStreak = () => {
    if (!activeTracker) return 0;
    if (!activeTracker.is_active || activeTracker.end_date) return activeTracker.current_streak_days || 0;

    const start = new Date(activeTracker.start_date);
    const now = new Date();
    const diff = Math.max(0, now.getTime() - start.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };
  const getLastRelapseDate = () => activeTracker?.last_relapse_date ? new Date(activeTracker.last_relapse_date).toLocaleDateString() : 'None';

  // Suggestions logic
  const generateSuggestions = (triggers: string[]) => {
    const suggestionMap: { [key: string]: string[] } = {
      'At certain times, I feel like drinking': ['Set up alternative activities', 'Create a routine', 'Practice mindfulness'],
      'Feeling bored': ['Find hobbies', 'Join support groups', 'Exercise'],
      'Loneliness': ['Connect with support', 'Attend meetings', 'Call a friend'],
      'Nearby bars': ['Take different routes', 'Remove yourself', 'Accountability partner'],
      'Family tension': ['Communication skills', 'Family counseling', 'Boundaries'],
      'Friends circle': ['Find sober friends', 'Be honest', 'Avoid high-risk social'],
      'Tiredness': ['Sleep schedule', 'Stress reduction', 'Pause decisions'],
      'Financial stress': ['Budget plan', 'Financial counseling', 'Focus on savings'],
      'Work tension': ['Stress management', 'Deep breathing', 'Talk to HR'],
      'Love failure': ['Time to heal', 'Focus on self-care', 'Therapy'],
      'Having doubts': ['Remind reasons', 'Talk to sponsor', 'Review progress'],
      'Family history of alcoholism': ['Genetics ≠ Fate', 'Be vigilant', 'Counseling']
    };
    const allSuggestions: string[] = [];
    triggers.forEach(t => {
      if (suggestionMap[t]) allSuggestions.push(...suggestionMap[t]);
    });
    if (allSuggestions.length === 0) allSuggestions.push('Call sponsor', 'Attend meeting', 'Deep breathing');
    return [...new Set(allSuggestions)].slice(0, 5);
  };

  // Handlers
  const handleAddTracker = async () => {
    if (!newTracker.addiction_type || !user) return;
    try {
      setActionLoading(true);
      const res = await initializeSobrietyTracker(user.id, newTracker.addiction_type, undefined, Number(newTracker.daily_cost) || 0);
      if (res.success) {
        await fetchUserData();
        setShowAddTracker(false);
        setNewTracker({ addiction_type: '', daily_cost: '' });
        Alert.alert('Success', 'Tracker started!');
      } else {
        Alert.alert('Error', res.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTracker = async () => {
    if (!activeTracker || !user) return;
    try {
      setActionLoading(true);
      const res = await updateSobrietyTracker(user.id, activeTracker.addiction_type, !activeTracker.is_active);
      if (res.success) {
        await fetchUserData();
      } else {
        Alert.alert('Error', res.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTracker = async () => {
    if (!activeTracker) return;
    Alert.alert('Stop Tracker', 'Are you sure? This will end your streak and remove it from active trackers.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          const res = await stopSobrietyTracker(activeTracker.id);
          if (res.success) {
            await fetchUserData();
          }
          setActionLoading(false);
        }
      }
    ]);
  };

  const sendRelapseAlert = async (triggers: string[], notes: string) => {
    if (!user) return;

    // Twilio Credentials (LIVE)
    const ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || 'your_auth_token_here';
    const FROM_NUM = process.env.EXPO_PUBLIC_TWILIO_FROM_NUMBER || '+12345678901';
    const TO_NUM = process.env.EXPO_PUBLIC_TWILIO_TO_NUMBER || '+910000000000'; // User Specified for Call/Alert

    const messageBody = `Relapse Alert:\nUser ${user.first_name} ${user.last_name} reported the following triggers:\n${triggers.join(', ')}.\nNotes: ${notes}\nPlease review and take necessary action.`;

    try {
      // 1. Send SMS via Twilio API
      const auth = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${ACCOUNT_SID}:${AUTH_TOKEN}`));

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'To': TO_NUM,
          'From': FROM_NUM,
          'Body': messageBody
        }).toString()
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Twilio SMS Failed:', errText);
        Alert.alert('Alert Error', 'Failed to send alert SMS to counselor.');
      } else {
        console.log('Twilio SMS Sent Successfully');
      }

      // 2. Automated Call
      const phoneUrl = `tel:${TO_NUM}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Call Error', 'Unable to initiate automated call.');
      }

    } catch (error) {
      console.error('Relapse Alert Error:', error);
      Alert.alert('Error', 'Failed to trigger relapse alerts.');
    }
  };

  const handleRecordRelapse = async () => {
    if (!activeTracker || !user) return;
    try {
      setActionLoading(true);
      const res = await recordRelapse(user.id, activeTracker.addiction_type, new Date().toISOString(), relapseData.triggers, relapseData.notes);
      if (res.success) {
        await fetchUserData();
        setShowRelapseForm(false);

        // Generate and show suggestions
        setSuggestions(generateSuggestions(relapseData.triggers));
        setShowSuggestions(true);

        // Trigger Alerts (SMS + Call) - executed after setting UI
        sendRelapseAlert(relapseData.triggers, relapseData.notes);

        setRelapseData({ triggers: [], notes: '' });
      } else {
        Alert.alert('Error', res.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!user || !newGoal.goal_description) return;
    try {
      setActionLoading(true);
      const res = await createUserGoal(user.id, { ...newGoal, target_value: Number(newGoal.target_value) });
      if (res.success) {
        await fetchUserData();
        setShowAddGoal(false);
        setNewGoal({ goal_type: 'sobriety', goal_description: '', target_value: '', target_date: '', progress_unit: 'days' });
      } else {
        Alert.alert('Error', res.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#003366" /></View>;

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <FontAwesome name="line-chart" size={24} color="#FFFFFF" style={{ marginBottom: 8 }} />
        <Text style={styles.headerTitle}>Sobriety Tracker</Text>
        <Text style={styles.headerSubtitle}>Monitor your progress and milestones</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Dashboard Card */}
        <View style={[styles.card, styles.dashboardCard]}>
          <View style={styles.cardHeader}>
            <FontAwesome name="calendar" size={18} color="#003366" />
            <Text style={styles.cardTitle}>Current Status</Text>
            {activeTracker ? (
              <View style={[styles.badge, activeTracker.is_active ? styles.badgeSuccess : styles.badgeSecondary]}>
                <Text style={styles.badgeText}>
                  {activeTracker.end_date ? 'No Tracker Active' : (activeTracker.is_active ? 'Active' : 'Paused')}
                </Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Text style={styles.badgeText}>Not Set</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={{ marginLeft: 'auto' }}>
              <FontAwesome name="history" size={18} color="#003366" />
            </TouchableOpacity>
          </View>

          {trackers.length > 1 && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Select Tracker</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 10 }}>
                {trackers.map(t => (
                  <Pressable
                    key={t.id}
                    onPress={() => setActiveTracker(t)}
                    style={[
                      styles.trackerTab,
                      activeTracker?.id === t.id && styles.trackerTabActive
                    ]}
                  >
                    <Text style={[styles.trackerTabText, activeTracker?.id === t.id && styles.trackerTabTextActive]}>{t.addiction_type}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {activeTracker?.is_active && (
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>You are sober since</Text>
              <Text style={styles.timerValue}>{elapsedTime}</Text>
            </View>
          )}

          {activeTracker && (
            <View style={styles.costBox}>
              <Text style={styles.costText}>
                Daily Cost: <Text style={styles.costValue}>{formatCurrency(activeTracker.daily_cost || 0)}</Text>
              </Text>
            </View>
          )}

          <View style={styles.controlsRow}>
            <Pressable
              style={[
                styles.btn,
                activeTracker?.end_date ? styles.btnSecondary : (activeTracker?.is_active ? styles.btnSecondary : styles.btnPrimary),
                { flex: 1 },
                activeTracker?.end_date ? { opacity: 0.6 } : {}
              ]}
              onPress={handleToggleTracker}
              disabled={actionLoading || !activeTracker || !!activeTracker.end_date}
            >
              <FontAwesome
                name={activeTracker?.end_date ? "ban" : (activeTracker?.is_active ? "pause" : "play")}
                size={14}
                color={activeTracker?.end_date ? "#6c757d" : (activeTracker?.is_active ? "#495057" : "#FFF")}
              />
              <Text style={activeTracker?.end_date || activeTracker?.is_active ? styles.btnTextSecondary : styles.btnTextPrimary}>
                {activeTracker?.end_date ? "Ended" : (activeTracker?.is_active ? "Pause" : "Start")}
              </Text>
            </Pressable>

            {activeTracker?.is_active && (
              <Pressable
                style={[styles.btn, styles.btnOutline, { flex: 1 }]}
                onPress={() => setShowRelapseForm(!showRelapseForm)}
                disabled={actionLoading}
              >
                <FontAwesome name="square-o" size={14} color="#495057" />
                <Text style={styles.btnTextOutline}>Relapse</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.btn, styles.btnDangerOutline, { flex: 1 }, activeTracker?.end_date ? { opacity: 0.5 } : {}]}
              onPress={handleStopTracker}
              disabled={actionLoading || !activeTracker || !!activeTracker.end_date}
            >
              <FontAwesome name="stop" size={14} color="#dc3545" />
              <Text style={styles.btnTextDanger}>Stop</Text>
            </Pressable>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Pressable
              style={[styles.btn, styles.btnOutline, { justifyContent: 'center' }]}
              onPress={() => setShowAddTracker(!showAddTracker)}
            >
              <FontAwesome name={showAddTracker ? "minus" : "plus"} size={14} color="#495057" />
              <Text style={styles.btnTextOutline}>{showAddTracker ? "Cancel" : "Add New Tracker"}</Text>
            </Pressable>

            {showAddTracker && (
              <View style={styles.addForm}>
                <Text style={styles.formSectionTitle}>Add New Tracker</Text>
                <Text style={styles.label}>Addiction Type</Text>

                <View style={{ marginBottom: 12, zIndex: 10 }}>
                  <Pressable
                    style={styles.dropdownSelector}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <Text style={{ color: newTracker.addiction_type ? '#000' : '#888' }}>
                      {newTracker.addiction_type || 'Select Addiction Type'}
                    </Text>
                    <FontAwesome name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={12} color="#666" />
                  </Pressable>

                  {showTypeDropdown && (
                    <View style={styles.dropdownList}>
                      {addictionOptions.map((option) => (
                        <Pressable
                          key={option}
                          style={styles.dropdownOption}
                          onPress={() => {
                            setNewTracker({ ...newTracker, addiction_type: option });
                            setShowTypeDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>{option}</Text>
                          {newTracker.addiction_type === option && (
                            <FontAwesome name="check" size={12} color="#003366" />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.label}>Average Daily Cost (INR)</Text>
                <TextInput
                  placeholder="0"
                  style={styles.input}
                  keyboardType="numeric"
                  value={newTracker.daily_cost}
                  onChangeText={t => setNewTracker({ ...newTracker, daily_cost: t })}
                />
                <Pressable style={[styles.btn, styles.btnPrimary, { width: '100%' }]} onPress={handleAddTracker}>
                  <Text style={styles.btnTextPrimary}>Start Tracking</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getCurrentStreak()}</Text>
              <Text style={styles.statLabel}>Current{'\n'}Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.max(activeTracker?.longest_streak_days || 0, getCurrentStreak())}</Text>
              <Text style={styles.statLabel}>Longest{'\n'}Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(activeTracker?.total_sobriety_days || 0) + Math.max(0, getCurrentStreak() - (activeTracker?.current_streak_days || 0))}
              </Text>
              <Text style={styles.statLabel}>Total{'\n'}Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeTracker?.relapses_count || 0}</Text>
              <Text style={styles.statLabel}>Relapses</Text>
            </View>
          </View>

          {activeTracker && activeTracker.daily_cost && activeTracker.daily_cost > 0 && (
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#d1f2eb', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#1e7e34' }}>
              <Text style={{ fontSize: 11, color: '#155724', marginBottom: 2, fontWeight: '700' }}>TOTAL COST SAVED</Text>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#155724' }}>
                {formatCurrency((activeTracker.total_sobriety_days || 0) * (activeTracker.daily_cost || 0))}
              </Text>
              <Text style={{ fontSize: 10, color: '#155724', opacity: 0.8 }}>
                Saving lives and resources every day
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Started</Text>
              <Text style={styles.footerValue}>{activeTracker ? new Date(activeTracker.start_date).toLocaleDateString() : 'N/A'}</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>Last Relapse</Text>
              <Text style={styles.footerValue}>{getLastRelapseDate()}</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>Status</Text>
              <Text style={[styles.footerValue, { color: activeTracker?.end_date ? '#6c757d' : (activeTracker?.is_active ? '#28a745' : '#ffc107') }]}>
                {activeTracker?.end_date ? 'Stopped' : (activeTracker?.is_active ? 'Active' : (activeTracker ? 'Paused' : 'None'))}
              </Text>
            </View>
          </View>
        </View>

        {showRelapseForm && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Record Relapse</Text>
            <Text style={styles.label}>What triggered the relapse?</Text>
            {triggersList.map(t => (
              <Pressable key={t} style={styles.checkboxRow} onPress={() => {
                if (relapseData.triggers.includes(t)) {
                  setRelapseData(prev => ({ ...prev, triggers: prev.triggers.filter(x => x !== t) }));
                } else {
                  setRelapseData(prev => ({ ...prev, triggers: [...prev.triggers, t] }));
                }
              }}>
                <View style={[styles.checkbox, relapseData.triggers.includes(t) && styles.checkboxChecked]}>
                  {relapseData.triggers.includes(t) && <FontAwesome name="check" size={10} color="#FFF" />}
                </View>
                <Text style={styles.checkboxLabel}>{t}</Text>
              </Pressable>
            ))}
            <Text style={[styles.label, { marginTop: 10 }]}>Notes (Optional)</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline value={relapseData.notes} onChangeText={t => setRelapseData(prev => ({ ...prev, notes: t }))} />
            <View style={styles.controlsRow}>
              <Pressable style={[styles.btn, styles.btnOutline]} onPress={() => setShowRelapseForm(false)}>
                <Text style={styles.btnTextOutline}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnDanger]} onPress={handleRecordRelapse}>
                <Text style={styles.btnTextPrimary}>Record</Text>
              </Pressable>
            </View>
          </View>
        )}

        {showHistory && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tracker History</Text>
              {allTrackers.length > 0 ? (
                allTrackers
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((tracker, index) => (
                    <View key={tracker.id} style={[styles.historyItem, index > 0 && { marginTop: 12 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#003366' }}>{tracker.addiction_type}</Text>
                        <View style={[styles.badge, tracker.is_active ? styles.badgeSuccess : styles.badgeSecondary]}>
                          <Text style={styles.badgeText}>{tracker.is_active ? 'Active' : (tracker.end_date ? 'Stopped' : 'Paused')}</Text>
                        </View>
                      </View>

                      <View style={{ paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ fontSize: 13, color: '#444', fontWeight: '500' }}>
                          📅 {new Date(tracker.start_date).toLocaleDateString()} — {tracker.end_date ? new Date(tracker.end_date).toLocaleDateString() : 'Present'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                        <View style={{ width: '50%', marginBottom: 8 }}>
                          <Text style={{ fontSize: 10, color: '#888' }}>BEST STREAK</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#28a745' }}>{tracker.longest_streak_days} days</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 8 }}>
                          <Text style={{ fontSize: 10, color: '#888' }}>TOTAL DAYS</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#003366' }}>{tracker.total_sobriety_days}</Text>
                        </View>
                        <View style={{ width: '50%' }}>
                          <Text style={{ fontSize: 10, color: '#888' }}>RELAPSES</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#dc3545' }}>{tracker.relapses_count}</Text>
                        </View>
                        <View style={{ width: '50%' }}>
                          <Text style={{ fontSize: 10, color: '#888' }}>MONEY SAVED</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#155724' }}>
                            {formatCurrency(tracker.total_sobriety_days * (tracker.daily_cost || 0))}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
              ) : (
                <Text style={{ textAlign: 'center', color: '#888', padding: 20 }}>No history found.</Text>
              )}
            </View>

            {trackingLogs.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Activity Logs</Text>
                {trackingLogs.slice(0, 10).map((log, index) => (
                  <View key={log.id} style={[styles.logItem, index > 0 && { borderTopWidth: 1, borderTopColor: '#f1f3f5', marginTop: 10, paddingTop: 10 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: '#666', fontWeight: '500' }}>
                        {new Date(log.log_date).toLocaleDateString()}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: log.sobriety_status ? '#28a745' : '#dc3545',
                        backgroundColor: log.sobriety_status ? '#d1e7dd' : '#f8d7da',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        {log.sobriety_status ? 'Sober' : 'Relapse'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#333' }}>Type: <Text style={{ fontWeight: '600' }}>{log.addiction_type}</Text></Text>
                    {log.notes && <Text style={{ fontSize: 12, color: '#555', fontStyle: 'italic', marginTop: 4 }}>"{log.notes}"</Text>}
                    {log.relapse_triggers && log.relapse_triggers.length > 0 && (
                      <Text style={{ fontSize: 11, color: '#dc3545', marginTop: 4 }}>
                        Triggers: {log.relapse_triggers.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Suggestions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSuggestions}
        onRequestClose={() => setShowSuggestions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stay Strong!</Text>
            <Text style={styles.modalSubtitle}>Based on your triggers, we suggest:</Text>

            <ScrollView style={{ marginBottom: 20 }}>
              {suggestions.map((s, i) => (
                <View key={i} style={styles.suggestionItem}>
                  <FontAwesome name="lightbulb-o" size={20} color="#003366" />
                  <Text style={styles.suggestionText}>{s}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ gap: 10 }}>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setShowSuggestions(false)}>
                <Text style={styles.btnTextPrimary}>Close</Text>
              </Pressable>
              <Text style={{ fontSize: 10, color: '#888', textAlign: 'center', marginTop: 10 }}>
                Alert sent to counselor. Call initiated.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#003366',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerBack: {
    position: 'absolute',
    left: 16,
    top: 52,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#B3D9FF',
    marginTop: 2,
    opacity: 0.9,
    textAlign: 'center',
  },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  dashboardCard: { borderTopWidth: 4, borderTopColor: '#003366' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#003366', marginLeft: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  badgeSuccess: { backgroundColor: '#d1e7dd' },
  badgeSecondary: { backgroundColor: '#e9ecef' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#495057' },
  dropdownContainer: { marginBottom: 16 },
  trackerTab: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderRadius: 16, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6' },
  trackerTabActive: { backgroundColor: '#003366', borderColor: '#003366' },
  trackerTabText: { fontSize: 12, color: '#495057' },
  trackerTabTextActive: { color: '#FFF' },
  timerBox: { backgroundColor: '#d1e7dd', borderRadius: 8, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#badbcc' },
  timerLabel: { fontSize: 14, color: '#0f5132', marginBottom: 4 },
  timerValue: { fontSize: 32, fontWeight: '700', color: '#0f5132' },
  costBox: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef' },
  costText: { fontSize: 14, color: '#666' },
  costValue: { fontWeight: '700', color: '#003366' },
  controlsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6 },
  btnPrimary: { backgroundColor: '#003366' },
  btnSecondary: { backgroundColor: '#e9ecef' },
  btnOutline: { borderWidth: 1, borderColor: '#ced4da', backgroundColor: '#FFF' },
  btnDanger: { backgroundColor: '#dc3545' },
  btnDangerOutline: { borderWidth: 1, borderColor: '#f5c2c7', backgroundColor: '#fff5f5' },
  btnTextPrimary: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  btnTextSecondary: { color: '#495057', fontWeight: '600', fontSize: 13 },
  btnTextOutline: { color: '#495057', fontWeight: '600', fontSize: 13 },
  btnTextDanger: { color: '#dc3545', fontWeight: '600', fontSize: 13 },
  addForm: { marginTop: 10, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  formSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#212529' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ced4da', borderRadius: 4, padding: 10, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  statItem: { width: '25%', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#212529' },
  statLabel: { fontSize: 10, color: '#6c757d', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#dee2e6', marginVertical: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 12, color: '#6c757d', marginBottom: 2 },
  footerValue: { fontSize: 14, fontWeight: '500', color: '#212529' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#adb5bd', borderRadius: 3, marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxChecked: { backgroundColor: '#003366', borderColor: '#003366' },
  checkboxLabel: { fontSize: 14, color: '#212529' },
  historyItem: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#dee2e6' },
  logItem: { paddingVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, width: '100%', maxHeight: '80%', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#003366', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  suggestionText: { marginLeft: 10, fontSize: 14, color: '#333', flex: 1 },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
});
