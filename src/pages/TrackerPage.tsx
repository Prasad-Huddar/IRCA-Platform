/**
 * ============================================================================
 * Enhanced Tracker Page - IRCA Platform
 * ============================================================================
 * Comprehensive sobriety tracking with checkbox-based trigger selection
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllSobrietyTrackers,
  getFinancialSavingsHistory,
  getUserMilestones,
  initializeSobrietyTracker,
  recordRelapse,
  updateSobrietyTracker,
  getUserGoals,
  createUserGoal,
  getDetailedTrackingLogs,
  getMoodTrackingData,
  stopSobrietyTracker
} from '../services/profileTrackerService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import {
  Calendar,
  CreditCard,
  Trophy,
  Check,
  IndianRupee,
  TrendingUp,
  BarChart2,
  Shield,
  ChevronDown,
  User,
  ArrowLeft,
  MessageSquare,
  Phone
} from 'lucide-react';
import { SobrietyChart } from '../components/SobrietyChart';

export const TrackerPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trackers, setTrackers] = useState<any[]>([]);
  const [activeTracker, setActiveTracker] = useState<any>(null);
  const [savings, setSavings] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [newAddictionType, setNewAddictionType] = useState('');
  const [dailyCost, setDailyCost] = useState(0);
  const [showRelapseForm, setShowRelapseForm] = useState(false);
  const [relapseTriggers, setRelapseTriggers] = useState<string[]>([]);
  const [relapseNotes, setRelapseNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);

  // Predefined relapse triggers
  const predefinedTriggers = [
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

  const [goals, setGoals] = useState<any[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'sobriety',
    goal_description: '',
    target_value: 0,
    target_date: '',
    progress_unit: 'days'
  });
  const [analyticsData, setAnalyticsData] = useState({
    sobrietyTrend: [] as any[],
    financialTrend: [] as any[],
    relapseData: [] as any[],
    moodTrend: [] as any[],
    weeklyComparison: [] as any[]
  });
  const [elapsedTime, setElapsedTime] = useState<string>('');

  // Helper functions
  const calculateSobrietyDays = () => {
    if (!activeTracker?.start_date) return 0;
    const startDate = new Date(activeTracker.start_date);
    const today = new Date();
    return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Format elapsed time in a readable format
  const formatElapsedTime = (startDate: Date, endDate?: Date): string => {
    const end = endDate || new Date();
    const diffMs = end.getTime() - startDate.getTime();

    if (diffMs < 0) return '0 min';

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m ${totalSeconds % 60}s`;
    }
  };

  // Update timer every second
  useEffect(() => {
    if (!activeTracker?.start_date) {
      setElapsedTime('0m');
      return;
    }

    const startDate = new Date(activeTracker.start_date);

    const updateTimer = () => {
      const endDate = activeTracker.is_active ? undefined : (activeTracker.end_date ? new Date(activeTracker.end_date) : new Date());
      setElapsedTime(formatElapsedTime(startDate, endDate));
    };

    updateTimer(); // Initial call

    if (activeTracker.is_active) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTracker?.id, activeTracker?.is_active, activeTracker?.start_date, activeTracker?.end_date]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateHealthImpact = () => {
    if (!activeTracker) return null;

    const days = calculateSobrietyDays();
    if (days <= 0) return null;

    const healthData = {
      sleepQuality: Math.min(100, Math.floor(days * 0.5)),
      liverRecovery: Math.min(100, Math.floor(days * 0.3)),
      cardiovascular: Math.min(100, Math.floor(days * 0.2)),
      mentalClarity: Math.min(100, Math.floor(days * 0.4)),
      lifeExpectancy: Math.floor(days / 365 * 0.2 * 10) / 10
    };

    return healthData;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateProjectedSavings = () => {
    if (!activeTracker || savings.length === 0) return 0;

    const days = calculateSobrietyDays();
    if (days <= 0) return 0;

    const totalSavings = savings[0]?.cumulative_savings || 0;
    const avgDailySavings = totalSavings / Math.max(1, savings.length);

    return avgDailySavings * 365;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Every day you stay sober is a victory. Keep going!",
      "You're stronger than you think. One day at a time.",
      "Your commitment to sobriety is inspiring. Stay strong!",
      "Progress, not perfection. You're doing great!",
      "Each sober day is a gift to yourself and your loved ones.",
      "Believe in yourself. You've got this!",
      "Recovery is a journey, and you're on the right path.",
      "Your strength grows with each passing day. Keep it up!"
    ];

    const days = calculateSobrietyDays();
    if (days >= 365) {
      return "Incredible milestone! Over a year of sobriety. You're truly amazing!";
    } else if (days >= 180) {
      return "Six months strong! Your dedication is remarkable.";
    } else if (days >= 30) {
      return "A month of sobriety! That's something to celebrate.";
    } else if (days >= 7) {
      return "A full week of sobriety! Great job staying committed.";
    } else if (days > 0) {
      return "Day by day, you're building a stronger future. Keep going!";
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  // Generate personalized suggestions based on selected triggers
  const generatePersonalizedSuggestions = (selectedTriggers: string[]): string[] => {
    const suggestions: string[] = [];
    
    if (selectedTriggers.includes('At certain times, I feel like drinking')) {
      suggestions.push('Create a schedule to fill these vulnerable times with positive activities');
      suggestions.push('Consider meditation or deep breathing exercises during high-risk times');
      suggestions.push('Keep healthy snacks and drinks available to occupy your hands and mouth');
    }
    
    if (selectedTriggers.includes('Feeling bored')) {
      suggestions.push('Create a list of engaging activities you enjoy (reading, exercise, hobbies)');
      suggestions.push('Try new activities to keep your mind occupied and body active');
      suggestions.push('Join online communities or local groups with similar interests');
    }
    
    if (selectedTriggers.includes('Loneliness')) {
      suggestions.push('Reach out to trusted friends or family members');
      suggestions.push('Consider joining support groups or online communities');
      suggestions.push('Practice self-care activities like journaling or meditation');
    }
    
    if (selectedTriggers.includes('Nearby bars')) {
      suggestions.push('Plan alternative routes when going out to avoid trigger locations');
      suggestions.push('Choose restaurants or cafes instead of bars when socializing');
      suggestions.push('Bring a supportive friend when you need to pass by these areas');
    }
    
    if (selectedTriggers.includes('Family tension')) {
      suggestions.push('Practice healthy communication techniques');
      suggestions.push('Set boundaries when conversations become heated');
      suggestions.push('Consider family therapy or counseling if tensions persist');
    }
    
    if (selectedTriggers.includes('Friends circle')) {
      suggestions.push('Be selective about social gatherings and environments');
      suggestions.push('Suggest alternative activities that don\'t involve alcohol');
      suggestions.push('Seek out new friends who support your recovery journey');
    }
    
    if (selectedTriggers.includes('Tiredness')) {
      suggestions.push('Maintain a consistent sleep schedule');
      suggestions.push('Practice good sleep hygiene (no screens before bed, cool environment)');
      suggestions.push('Consider relaxation techniques before bedtime');
    }
    
    if (selectedTriggers.includes('Financial stress')) {
      suggestions.push('Create a budget and stick to it');
      suggestions.push('Focus on the money you\'re saving by staying sober');
      suggestions.push('Seek financial counseling if needed');
    }
    
    if (selectedTriggers.includes('Work tension')) {
      suggestions.push('Practice stress management techniques at work');
      suggestions.push('Take regular breaks and use vacation time');
      suggestions.push('Consider talking to HR about workplace stress');
    }
    
    if (selectedTriggers.includes('Love failure')) {
      suggestions.push('Focus on self-love and personal growth');
      suggestions.push('Seek support from friends, family, or counselors');
      suggestions.push('Remember that recovery is the most important relationship you have');
    }
    
    if (selectedTriggers.includes('Having doubts')) {
      suggestions.push('Review your reasons for staying sober');
      suggestions.push('Connect with others in recovery for support');
      suggestions.push('Consider speaking with a counselor or sponsor');
    }
    
    if (selectedTriggers.includes('Family history of alcoholism')) {
      suggestions.push('Remember that your story can be different');
      suggestions.push('Focus on the positive changes you\'re making');
      suggestions.push('Consider genetic counseling if helpful');
    }
    
    // Add general suggestions if no specific triggers selected
    if (suggestions.length === 0) {
      suggestions.push('Stay hydrated and eat regular, nutritious meals');
      suggestions.push('Practice daily mindfulness or meditation');
      suggestions.push('Keep a journal to track your triggers and progress');
      suggestions.push('Reach out to your support network when needed');
    }
    
    return suggestions;
  };

  // Send SMS notification to admin
  const sendSMSNotification = async (selectedTriggers: string[]) => {
    try {
      // Updated admin phone number as requested
      const adminPhoneNumber = '+919731250288';
      
      // Get current timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Get user information (fallback to 'Anonymous User' if not available)
      const userName = user?.user_metadata?.full_name || 
                      user?.user_metadata?.name || 
                      user?.email?.split('@')[0] || 
                      'Anonymous User';
      
      // Format triggers for SMS
      const formattedTriggers = selectedTriggers.length > 0 
        ? selectedTriggers.map(trigger => `• ${trigger}`).join('\n')
        : '• No specific triggers selected';
      
      // Create simple SMS message
      const message = `User has reported the following relapse triggers: ${selectedTriggers.join(', ')}`;
      
      // Get Twilio credentials from environment variables
      const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'your_auth_token_here';
      const twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
      
      // Check if Twilio phone number is configured
      if (!twilioPhoneNumber) {
        console.warn('Twilio phone number not configured. Please set VITE_TWILIO_PHONE_NUMBER environment variable.');
        console.log('SMS would have been sent to:', adminPhoneNumber);
        console.log('Message:', message);
        return;
      }
      
      // Send SMS via Twilio API
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: adminPhoneNumber,
          From: twilioPhoneNumber,
          Body: message
        })
      });
      
      if (response.ok) {
        console.log('✅ SMS sent successfully to:', adminPhoneNumber);
        console.log('👤 User:', userName);
        console.log('📱 Message preview:', message.substring(0, 100) + '...');
        
        // Show success feedback to user (optional)
        setSuccess('Alert sent to admin successfully!');
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to send SMS:', errorData);
        
        // Check for specific Twilio errors
        if (errorData.includes('trial')) {
          console.warn('⚠️ Trial account limitation: Please upgrade Twilio account to remove trial headers');
        }
        
        setError('Failed to send alert to admin. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ SMS notification error:', error);
      setError('SMS service temporarily unavailable. Admin will be notified via other means.');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [
        getAllSobrietyTrackers(user!.id),
        getFinancialSavingsHistory(user!.id),
        getUserMilestones(user!.id),
        getUserGoals(user!.id),
        getDetailedTrackingLogs(user!.id),
        getMoodTrackingData(user!.id)
      ];

      const results = await Promise.allSettled(promises);

      const trackersResponse = results[0].status === 'fulfilled' ? results[0].value : null;
      const savingsResponse = results[1].status === 'fulfilled' ? results[1].value : null;
      const milestonesResponse = results[2].status === 'fulfilled' ? results[2].value : null;
      const goalsResponse = results[3].status === 'fulfilled' ? results[3].value : null;
      const trackingLogsResponse = results[4].status === 'fulfilled' ? results[4].value : null;
      const moodDataResponse = results[5].status === 'fulfilled' ? results[5].value : null;

      if (trackersResponse && trackersResponse.success && trackersResponse.data) {
        const trackersData = Array.isArray(trackersResponse.data) ? trackersResponse.data : [];
        setTrackers(trackersData);
        if (trackersData.length > 0) {
          // Prefer active tracker, else default to first
          const active = trackersData.find(t => t.is_active);
          setActiveTracker(active || trackersData[0]);
        }
      }

      if (savingsResponse && savingsResponse.success && savingsResponse.data) {
        const savingsData = Array.isArray(savingsResponse.data) ? savingsResponse.data : [];
        setSavings(savingsData);
      }

      if (milestonesResponse && milestonesResponse.success && milestonesResponse.data) {
        const milestonesData = Array.isArray(milestonesResponse.data) ? milestonesResponse.data : [];
        setMilestones(milestonesData);
      }

      if (goalsResponse && goalsResponse.success && goalsResponse.data) {
        const goalsData = Array.isArray(goalsResponse.data) ? goalsResponse.data : [];
        setGoals(goalsData);
      }

      const trackersData = (trackersResponse && trackersResponse.success && Array.isArray(trackersResponse.data))
        ? trackersResponse.data : [];
      const savingsData = (savingsResponse && savingsResponse.success && Array.isArray(savingsResponse.data))
        ? savingsResponse.data : [];
      const trackingLogsData = (trackingLogsResponse && trackingLogsResponse.success && Array.isArray(trackingLogsResponse.data))
        ? trackingLogsResponse.data : [];
      const moodData = (moodDataResponse && moodDataResponse.success && Array.isArray(moodDataResponse.data))
        ? moodDataResponse.data : [];

      prepareAnalyticsData(trackersData, savingsData, trackingLogsData, moodData);

    } catch (err) {
      console.error('Error fetching tracker data:', err);
      setError('Failed to load tracker data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prepareAnalyticsData = (trackers: any[], savings: any[], trackingLogs: any[], moodData: any[]) => {
    const sobrietyTrend = trackers.map(tracker => ({
      name: tracker.addiction_type.charAt(0).toUpperCase() + tracker.addiction_type.slice(1),
      days: tracker.current_streak_days,
      longest: tracker.longest_streak_days,
      total: tracker.total_sobriety_days
    }));

    const financialTrend = savings.slice(0, 10).map((saving) => ({
      date: new Date(saving.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: saving.cumulative_savings
    })).reverse();

    const relapseData = trackers.map(tracker => ({
      name: tracker.addiction_type.charAt(0).toUpperCase() + tracker.addiction_type.slice(1),
      relapses: tracker.relapses_count
    }));

    const moodTrend = moodData.map(entry => ({
      date: new Date(entry.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood_rating
    }));

    const weeklyComparison = [
      {
        name: 'This Week', value: trackingLogs.filter((log: any) => {
          const logDate = new Date(log.log_date);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return logDate >= oneWeekAgo && log.sobriety_status;
        }).length
      },
      {
        name: 'Last Week', value: trackingLogs.filter((log: any) => {
          const logDate = new Date(log.log_date);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          return logDate >= twoWeeksAgo && logDate < oneWeekAgo && log.sobriety_status;
        }).length
      }
    ];

    setAnalyticsData({
      sobrietyTrend,
      financialTrend,
      relapseData,
      moodTrend,
      weeklyComparison
    });
  };

  const handleStopTracker = async () => {
    if (!activeTracker) return;

    if (!window.confirm("Are you sure you want to completely stop this tracker? This will end your streak.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await stopSobrietyTracker(activeTracker.id);

      if (response.success) {
        // Refresh trackers
        const trackersResponse = await getAllSobrietyTrackers(user!.id);
        if (trackersResponse.success && trackersResponse.data) {
          setTrackers(trackersResponse.data);
          const updated = trackersResponse.data.find(t => t.id === activeTracker.id);
          if (updated) setActiveTracker(updated);
        }
        setSuccess('Tracker stopped successfully.');
      } else {
        setError(response.message || 'Failed to stop tracker');
      }
    } catch (err) {
      console.error('Error stopping tracker:', err);
      setError('Failed to stop tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTracker = async () => {
    if (!newAddictionType) return;

    try {
      setLoading(true);
      // Pass dailyCost to the service
      const response = await initializeSobrietyTracker(user!.id, newAddictionType, undefined, dailyCost);

      if (response.success) {
        const trackersResponse = await getAllSobrietyTrackers(user!.id);
        if (trackersResponse.success && trackersResponse.data) {
          setTrackers(trackersResponse.data);
          const newTracker = trackersResponse.data.find(t => t.addiction_type === newAddictionType);
          if (newTracker) setActiveTracker(newTracker);
        }
        setShowAddTracker(false);
        setNewAddictionType('');
        setDailyCost(0); // Reset cost
        setSuccess('New tracker added successfully!');
      } else {
        setError(response.message || 'Failed to add new tracker');
      }
    } catch (err) {
      console.error('Error adding tracker:', err);
      setError('Failed to add new tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordRelapse = async () => {
    if (!activeTracker) return;

    try {
      setLoading(true);
      const response = await recordRelapse(
        user!.id,
        activeTracker.addiction_type,
        new Date().toISOString(),
        relapseTriggers,
        relapseNotes
      );

      if (response.success) {
        const trackersResponse = await getAllSobrietyTrackers(user!.id);
        if (trackersResponse.success && trackersResponse.data) {
          setTrackers(trackersResponse.data);
          const updatedTracker = trackersResponse.data.find(t => t.id === activeTracker.id);
          if (updatedTracker) setActiveTracker(updatedTracker);
        }

        // Generate personalized suggestions
        const suggestions = generatePersonalizedSuggestions(relapseTriggers);
        setPersonalizedSuggestions(suggestions);
        setShowSuggestions(true);

        // Send SMS notification to admin
        await sendSMSNotification(relapseTriggers);

        setRelapseTriggers([]);
        setRelapseNotes('');
        setShowRelapseForm(false);
        setSuccess('Relapse recorded successfully! Personalized suggestions have been provided.');
      } else {
        setError(response.message || 'Failed to record relapse');
      }
    } catch (err) {
      console.error('Error recording relapse:', err);
      setError('Failed to record relapse');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTracker = async () => {
    if (!activeTracker) return;

    try {
      setLoading(true);
      const response = await updateSobrietyTracker(
        user!.id,
        activeTracker.addiction_type,
        !activeTracker.is_active
      );

      if (response.success && response.data) {
        const updatedTrackers = trackers.map(t =>
          t.id === activeTracker.id ? response.data : t
        );
        setTrackers(updatedTrackers);
        setActiveTracker(response.data);
        setSuccess(`Tracker ${response.data.is_active ? 'started' : 'paused'} successfully!`);
      } else {
        setError(response.message || 'Failed to update tracker');
      }
    } catch (err) {
      console.error('Error updating tracker:', err);
      setError('Failed to update tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCheckboxChange = (trigger: string, checked: boolean) => {
    if (checked) {
      setRelapseTriggers([...relapseTriggers, trigger]);
    } else {
      setRelapseTriggers(relapseTriggers.filter(t => t !== trigger));
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.goal_description) return;

    try {
      setLoading(true);
      const response = await createUserGoal(user!.id, {
        goal_type: newGoal.goal_type,
        goal_description: newGoal.goal_description,
        target_value: newGoal.target_value,
        target_date: newGoal.target_date,
        progress_unit: newGoal.progress_unit
      });

      if (response.success) {
        const goalsResponse = await getUserGoals(user!.id);
        if (goalsResponse.success && goalsResponse.data) {
          setGoals(goalsResponse.data);
        }
        setShowAddGoal(false);
        setNewGoal({
          goal_type: 'sobriety',
          goal_description: '',
          target_value: 0,
          target_date: '',
          progress_unit: 'days'
        });
        setSuccess('New goal added successfully!');
      } else {
        setError(response.message || 'Failed to add new goal');
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Failed to add new goal');
    } finally {
      setLoading(false);
    }
  };

  if (loading && trackers.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4 p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="space-y-4 p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Sobriety Tracker</h1>
            <p className="text-xs text-muted-foreground mt-1">Track your recovery journey</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      {activeTracker && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="text-lg font-bold">{calculateSobrietyDays()} <span className="text-xs font-normal">days</span></p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <IndianRupee className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Savings</p>
                <p className="text-lg font-bold">{formatCurrency(savings[0]?.cumulative_savings || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <Trophy className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Achievements</p>
                <p className="text-lg font-bold">{milestones.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-2 mr-3">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Relapses</p>
                <p className="text-lg font-bold">{activeTracker?.relapses_count || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Sobriety Tracker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Calendar className="h-4 w-4" />
              <span>Sobriety Tracker</span>
              {activeTracker?.is_active ? (
                <Badge variant="success" className="ml-2 text-xs">Active</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2 text-xs">Paused</Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Track your sobriety journey
            </p>
          </CardHeader>
          <CardContent className="p-3">
            {/* Addiction Type Selector */}
            {trackers.length > 1 && (
              <div className="mb-3">
                <Label htmlFor="addiction-type" className="text-xs mb-1 block">Addiction Type</Label>
                <div className="relative">
                  <select
                    id="addiction-type"
                    value={activeTracker?.addiction_type || ''}
                    onChange={(e) => {
                      const selectedTracker = trackers.find(t => t.addiction_type === e.target.value);
                      if (selectedTracker) setActiveTracker(selectedTracker);
                    }}
                    className="w-full h-8 text-xs border border-input rounded-md pl-2 pr-8 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {trackers.map((tracker) => (
                      <option key={tracker.id} value={tracker.addiction_type}>
                        {tracker.addiction_type.charAt(0).toUpperCase() + tracker.addiction_type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Daily Cost Info & Motivational Message */}
            {activeTracker && (
              <div className="mt-2 mb-4 text-sm text-center italic text-muted-foreground p-3 bg-muted rounded">
                "{getMotivationalMessage()}"
              </div>
            )}

            {/* Add New Tracker Section */}
            <div className="mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTracker(!showAddTracker)}
                className="h-8 text-xs px-2"
              >
                {showAddTracker ? 'Cancel' : 'Add New Tracker'}
              </Button>

              {showAddTracker && (
                <div className="mt-3 space-y-3 p-3 border rounded-md bg-card">
                  <div>
                    <Label htmlFor="addiction-type" className="text-xs mb-1 block">Addiction Type</Label>
                    <Input
                      id="addiction-type"
                      type="text"
                      placeholder="e.g., alcohol, smoking"
                      value={newAddictionType}
                      onChange={(e) => setNewAddictionType(e.target.value)}
                      className="h-8 text-xs py-1 px-2 mb-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="daily-cost" className="text-xs mb-1 block">Average Daily Cost (INR)</Label>
                    <Input
                      id="daily-cost"
                      type="number"
                      placeholder="Amount you save per day"
                      value={dailyCost}
                      onChange={(e) => setDailyCost(Number(e.target.value))}
                      className="h-8 text-xs py-1 px-2 mb-2"
                      min="0"
                    />
                    <p className="text-[10px] text-muted-foreground">Used to calculate your savings automatically.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddTracker}
                    className="h-8 text-xs px-2 w-full"
                    disabled={!newAddictionType}
                  >
                    Start Tracking
                  </Button>
                </div>
              )}
            </div>

            {/* Tracker Controls */}
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                onClick={handleToggleTracker}
                className="h-8 text-xs px-2"
                variant={activeTracker?.is_active ? "secondary" : "default"}
              >
                {activeTracker?.is_active ? 'Pause Tracker' : 'Start Tracker'}
              </Button>

              {activeTracker?.is_active && (
                <Button
                  size="sm"
                  onClick={handleStopTracker}
                  className="h-8 text-xs px-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  variant="outline"
                >
                  Stop Tracker
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRelapseForm(!showRelapseForm)}
                className="h-8 text-xs px-2"
              >
                {showRelapseForm ? 'Cancel' : 'Record Relapse'}
              </Button>
            </div>

            {/* Sobriety Timer Display */}
            {activeTracker?.is_active && elapsedTime && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center">
                <p className="text-xs text-muted-foreground mb-1">You are sober since</p>
                <p className="text-2xl font-bold text-green-700">{elapsedTime}</p>
              </div>
            )}

            {/* Enhanced Relapse Form with Checkboxes */}
            {showRelapseForm && (
              <div className="mb-4 p-3 border rounded-md bg-muted/50">
                <h3 className="text-sm font-medium mb-2">Record Relapse</h3>

                <div className="mb-3">
                  <Label className="text-xs mb-2 block">Select your triggers (check all that apply):</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {predefinedTriggers.map((trigger) => (
                      <div key={trigger} className="flex items-center space-x-2">
                        <Checkbox
                          id={`trigger-${trigger}`}
                          checked={relapseTriggers.includes(trigger)}
                          onCheckedChange={(checked) => handleTriggerCheckboxChange(trigger, checked as boolean)}
                        />
                        <Label
                          htmlFor={`trigger-${trigger}`}
                          className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {trigger}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <Label htmlFor="relapse-notes" className="text-xs mb-1 block">Notes (Optional)</Label>
                  <textarea
                    id="relapse-notes"
                    placeholder="Describe what happened..."
                    value={relapseNotes}
                    onChange={(e) => setRelapseNotes(e.target.value)}
                    className="w-full h-20 text-xs border border-input rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={handleRecordRelapse}
                  className="h-8 text-xs px-2"
                  variant="destructive"
                  disabled={relapseTriggers.length === 0}
                >
                  Confirm Relapse
                </Button>
              </div>
            )}

            {/* Personalized Suggestions Displayed Below Form */}
            {showSuggestions && personalizedSuggestions.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3">Personalized Suggestions for You</h4>
                    <div className="space-y-3">
                      {personalizedSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start bg-white p-3 rounded-md border border-blue-100">
                          <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 h-8 text-xs px-3 border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                      onClick={() => setShowSuggestions(false)}
                    >
                      Got it, thanks!
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold">{elapsedTime || '0m'}</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
                <div className="text-[0.6rem] text-muted-foreground">duration</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{activeTracker?.longest_streak_days || 0}</div>
                <div className="text-xs text-muted-foreground">Longest Streak</div>
                <div className="text-[0.6rem] text-muted-foreground">days</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{activeTracker?.total_sobriety_days || 0}</div>
                <div className="text-xs text-muted-foreground">Total Days</div>
                <div className="text-[0.6rem] text-muted-foreground">sober</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{activeTracker?.relapses_count || 0}</div>
                <div className="text-xs text-muted-foreground">Relapses</div>
                <div className="text-[0.6rem] text-muted-foreground">recorded</div>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="font-medium text-xs">{formatDate(activeTracker?.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Relapse</p>
                  <p className="font-medium text-xs">
                    {activeTracker?.last_relapse_date ? formatDate(activeTracker.last_relapse_date) : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium text-xs">
                    {activeTracker?.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-yellow-600">Paused</span>
                    )}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tracker')}
                className="h-8 text-xs px-2"
              >
                <BarChart2 className="h-3 w-3 mr-1" />
                View Stats
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <CreditCard className="h-4 w-4" />
              <span>Financial Savings</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Track your financial progress
            </p>
          </CardHeader>
          <CardContent className="p-3">
            {savings.length > 0 ? (
              <>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {formatCurrency(savings[0]?.cumulative_savings || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Savings</div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-muted-foreground text-xs">Daily Average</p>
                      <p className="font-medium text-xs">
                        {formatCurrency((savings[0]?.cumulative_savings || 0) / Math.max(1, savings.length))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Projected Annual</p>
                      <p className="font-medium text-xs">
                        {formatCurrency(calculateProjectedSavings())}
                      </p>
                    </div>
                  </div>

                  {activeTracker && (
                    <div className="pt-2">
                      <h4 className="text-xs font-medium mb-2">Health Improvements</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center">
                          <div className="text-sm font-bold">
                            {calculateHealthImpact()?.sleepQuality || 0}%
                          </div>
                          <div className="text-[0.6rem] text-muted-foreground">Sleep Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold">
                            {calculateHealthImpact()?.liverRecovery || 0}%
                          </div>
                          <div className="text-[0.6rem] text-muted-foreground">Liver Recovery</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold">
                            {calculateHealthImpact()?.cardiovascular || 0}%
                          </div>
                          <div className="text-[0.6rem] text-muted-foreground">Heart Health</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold">
                            {calculateHealthImpact()?.lifeExpectancy || 0} yrs
                          </div>
                          <div className="text-[0.6rem] text-muted-foreground">Life Gain</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs px-2"
                    onClick={() => navigate('/financial')}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-xs mb-3">No financial data available</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2"
                  onClick={() => navigate('/financial')}
                >
                  <CreditCard className="h-3 w-3 mr-1" />
                  Set Up Tracking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Trophy className="h-4 w-4" />
            <span>My Achievements</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {milestones.length}
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Celebrate your milestones
          </p>
        </CardHeader>
        <CardContent className="p-3">
          {milestones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="border rounded-md p-3 hover:shadow transition-shadow"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="text-xs font-medium">{milestone.milestone_type}</div>
                    <Badge variant="success" className="text-[0.6rem] px-1 py-0.5">
                      {milestone.days_achieved} days
                    </Badge>
                  </div>
                  <div className="text-lg font-bold mb-1">
                    {formatCurrency(milestone.financial_savings)}
                  </div>
                  <div className="text-[0.6rem] text-muted-foreground">
                    {formatDate(milestone.date_achieved)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-xs mb-3">
                No achievements yet. Keep up your sobriety journey!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => navigate('/achievements')}
              >
                <Trophy className="h-3 w-3 mr-1" />
                Learn About Achievements
              </Button>
            </div>
          )}

          {/* Motivational Message */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <div className="ml-2">
                <h4 className="text-xs font-medium text-blue-800">Daily Motivation</h4>
                <p className="text-[0.7rem] text-blue-700 mt-1">
                  {getMotivationalMessage()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Check className="h-4 w-4" />
            <span>My Goals</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {goals.length}
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Track your personal recovery goals
          </p>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex justify-end mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="h-8 text-xs px-2"
            >
              {showAddGoal ? 'Cancel' : 'Add Goal'}
            </Button>
          </div>

          {showAddGoal && (
            <div className="mb-4 p-3 border rounded-md bg-muted/50">
              <h3 className="text-sm font-medium mb-3">Create New Goal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor="goal-type" className="text-xs mb-1 block">Goal Type</Label>
                  <select
                    id="goal-type"
                    value={newGoal.goal_type}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                    className="w-full h-8 text-xs border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="sobriety">Sobriety</option>
                    <option value="financial">Financial</option>
                    <option value="health">Health</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="progress-unit" className="text-xs mb-1 block">Progress Unit</Label>
                  <select
                    id="progress-unit"
                    value={newGoal.progress_unit}
                    onChange={(e) => setNewGoal({ ...newGoal, progress_unit: e.target.value })}
                    className="w-full h-8 text-xs border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="days">Days</option>
                    <option value="amount">Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <Label htmlFor="goal-description" className="text-xs mb-1 block">Goal Description</Label>
                <Input
                  id="goal-description"
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={newGoal.goal_description}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_description: e.target.value })}
                  className="h-8 text-xs py-1 px-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor="target-value" className="text-xs mb-1 block">Target Value</Label>
                  <Input
                    id="target-value"
                    type="number"
                    placeholder="Target value"
                    value={newGoal.target_value || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    className="h-8 text-xs py-1 px-2"
                  />
                </div>

                <div>
                  <Label htmlFor="target-date" className="text-xs mb-1 block">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="h-8 text-xs py-1 px-2"
                  />
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleAddGoal}
                className="h-8 text-xs px-2"
                disabled={!newGoal.goal_description}
              >
                Create Goal
              </Button>
            </div>
          )}

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">{goal.goal_description}</h4>
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-[0.6rem] px-1.5 py-0.5 mr-2">
                          {goal.goal_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Target: {goal.target_value} {goal.progress_unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {Math.round(goal.current_progress)} / {goal.target_value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {goal.target_date ? `Due: ${formatDate(goal.target_date)}` : 'No deadline'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{Math.round((goal.current_progress / goal.target_value) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (goal.current_progress / goal.target_value) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-xs mb-3">
                No goals set yet. Set your first goal to start tracking your progress!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => setShowAddGoal(true)}
              >
                <Check className="h-3 w-3 mr-1" />
                Create Your First Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1.5 h-16 text-xs px-2"
              onClick={() => navigate('/tracker')}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Sobriety Tracker</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1.5 h-16 text-xs px-2"
              onClick={() => navigate('/financial')}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Financial Savings</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1.5 h-16 text-xs px-2"
              onClick={() => navigate('/achievements')}
            >
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Achievements</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1.5 h-16 text-xs px-2"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Profile Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Past Trackers History */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">History</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Past tracking sessions
          </p>
        </CardHeader>
        <CardContent className="p-3">
          {trackers.filter(t => !t.is_active).length > 0 ? (
            <div className="space-y-3">
              {trackers.filter(t => !t.is_active).map(tracker => {
                // Calculate final savings for display
                const finalDays = tracker.total_sobriety_days || 0; // Should be set by stop function now
                const finalSavings = finalDays * (tracker.daily_cost || 0);

                return (
                  <div key={tracker.id} className="flex justify-between items-center border p-2 rounded text-sm hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{tracker.addiction_type.charAt(0).toUpperCase() + tracker.addiction_type.slice(1)}</p>
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {(tracker.daily_cost > 0) ? `${formatCurrency(tracker.daily_cost)}/day` : 'No cost'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(tracker.start_date)} — {tracker.end_date ? formatDate(tracker.end_date) : 'Stopped'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{finalDays} days</p>
                      {finalSavings > 0 && (
                        <p className="text-xs text-green-600 font-medium">Saved {formatCurrency(finalSavings)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">No history available</p>
          )}
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics Dashboard</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Track your progress with detailed analytics
          </p>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.sobrietyTrend.length > 0 ? (
              <SobrietyChart
                data={analyticsData.sobrietyTrend}
                type="bar"
                title="Sobriety Trends by Addiction Type"
                dataKey="days"
                xAxisKey="name"
              />
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No data available</p>
              </Card>
            )}

            {analyticsData.financialTrend.length > 0 ? (
              <SobrietyChart
                data={analyticsData.financialTrend}
                type="line"
                title="Financial Savings Progress"
                dataKey="amount"
                xAxisKey="date"
              />
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No data available</p>
              </Card>
            )}

            {analyticsData.relapseData.length > 0 ? (
              <SobrietyChart
                data={analyticsData.relapseData}
                type="pie"
                title="Relapse Distribution"
                dataKey="relapses"
                xAxisKey="name"
              />
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No data available</p>
              </Card>
            )}

            {analyticsData.moodTrend.length > 0 ? (
              <SobrietyChart
                data={analyticsData.moodTrend}
                type="line"
                title="Mood Tracking"
                dataKey="mood"
                xAxisKey="date"
              />
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No data available</p>
              </Card>
            )}

            {analyticsData.weeklyComparison.length > 0 ? (
              <SobrietyChart
                data={analyticsData.weeklyComparison}
                type="bar"
                title="Weekly Comparison"
                dataKey="value"
                xAxisKey="name"
              />
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">No data available</p>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Key Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">Best Streak:</span> {Math.max(...analyticsData.sobrietyTrend.map(t => t.days), 0)} days
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-xs text-green-800">
                    <span className="font-medium">Total Savings:</span> {formatCurrency(savings[0]?.cumulative_savings || 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-md">
                  <p className="text-xs text-purple-800">
                    <span className="font-medium">Total Achievements:</span> {milestones.length}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-md">
                  <p className="text-xs text-orange-800">
                    <span className="font-medium">Avg. Mood Rating:</span> {(analyticsData.moodTrend.reduce((sum, entry) => sum + (entry.mood || 0), 0) / Math.max(analyticsData.moodTrend.length, 1)).toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerPage;