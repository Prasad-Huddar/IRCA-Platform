/**
 * ============================================================================
 * Professional Tracker Page - IRCA Platform
 * ============================================================================
 * Clean, professional sobriety tracking with proper database integration
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllSobrietyTrackers,
  getUserMilestones,
  initializeSobrietyTracker,
  recordRelapse,
  updateSobrietyTracker,
  getUserGoals,
  createUserGoal,
  getDailyTrackingLogs,
  stopSobrietyTracker
} from '../services/profileTrackerService';
import { smsService } from '../services/smsService';
import { databaseTester } from '../utils/databaseTest';
import { testSMSConfiguration, testRelapseAlert } from '../utils/smsTest';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ProgressChart, StatsCard, MilestoneChart } from '../components/charts/SimpleCharts';
import {
  Calendar,
  CreditCard,
  Trophy,
  Shield,
  ChevronDown,
  ArrowLeft,
  Plus,
  Pause,
  Play,
  Square,
  TrendingUp,
  AlertTriangle,
  Phone,
  MessageCircle,
  DollarSign,
  Target,
  Activity,
  Clock
} from 'lucide-react';

// Extend SobrietyTracker to include daily_cost
interface ExtendedSobrietyTracker extends SobrietyTracker {
  daily_cost?: number;
}

// Use interfaces from profileTrackerService to avoid conflicts
import type {
  SobrietyTracker,
  DailyTrackingLog
} from '../services/profileTrackerService';

// Define local interfaces for Goal and Milestone since they're not exported
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

export const TrackerPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [trackers, setTrackers] = useState<ExtendedSobrietyTracker[]>([]);
  const [activeTracker, setActiveTracker] = useState<ExtendedSobrietyTracker | null>(null);
  const [trackingLogs, setTrackingLogs] = useState<DailyTrackingLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // UI state
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [showRelapseForm, setShowRelapseForm] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [trackerHistory, setTrackerHistory] = useState<any[]>([]);
  const [newTracker, setNewTracker] = useState({
    addiction_type: '',
    daily_cost: 0
  });
  const [relapseData, setRelapseData] = useState({
    triggers: [] as string[],
    notes: ''
  });
  const [newGoal, setNewGoal] = useState({
    goal_type: 'sobriety',
    goal_description: '',
    target_value: 0,
    target_date: '',
    progress_unit: 'days'
  });

  // Fetch tracker history
  const fetchTrackerHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Get all trackers (including inactive ones) for history
      const response = await getAllSobrietyTrackers(user.id);

      if (response.success && response.data) {
        const allTrackers = response.data;

        // Sort by creation date (newest first)
        const sortedTrackers = allTrackers.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setTrackerHistory(sortedTrackers);
      }
    } catch (error) {
      console.error('Error fetching tracker history:', error);
    }
  }, [user]);

  // Database test function
  const runDatabaseTests = async () => {
    if (!user) {
      setError('User must be logged in to run database tests');
      return;
    }

    try {
      setTestRunning(true);
      setError(null);
      setSuccess('Running database tests...');

      // Update the test user ID to use actual logged-in user
      const originalUserId = 'test-user-123';

      console.log('🧪 Starting Database Endpoint Tests...');
      console.log('Testing with user ID:', user.id);

      // Run all tests
      await databaseTester.runAllTests();

      setSuccess('Database tests completed! Check console for detailed results.');

    } catch (error) {
      console.error('Database test error:', error);
      setError('Database tests failed. Check console for details.');
    } finally {
      setTestRunning(false);
    }
  };

  // Real-time timer state
  const [elapsedTime, setElapsedTime] = useState<string>('0m 0s');
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Update timer every second for active tracker
  useEffect(() => {
    if (activeTracker?.is_active && activeTracker?.start_date) {
      // Clear existing interval
      if (timerInterval) {
        clearInterval(timerInterval);
      }

      // Update timer immediately
      const updateTimer = () => {
        const now = new Date();
        const start = new Date(activeTracker.start_date);
        const diff = now.getTime() - start.getTime();

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
      const interval = setInterval(updateTimer, 1000);
      setTimerInterval(interval);

      return () => clearInterval(interval);
    } else {
      // Clear timer when tracker is not active
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setElapsedTime('0m 0s');
    }
  }, [activeTracker?.is_active, activeTracker?.start_date]); // Remove timerInterval from dependencies

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Generate suggestions based on triggers
  const generateSuggestions = useCallback((triggers: string[]) => {
    const suggestionMap: { [key: string]: string[] } = {
      'At certain times, I feel like drinking': [
        'Set up alternative activities during high-risk times',
        'Create a structured daily routine',
        'Practice mindfulness during trigger times'
      ],
      'Feeling bored': [
        'Find engaging hobbies and activities',
        'Join support groups or community activities',
        'Exercise regularly to stay occupied'
      ],
      'Loneliness': [
        'Connect with supportive friends and family',
        'Attend AA/NA meetings regularly',
        'Consider therapy or counseling'
      ],
      'Nearby bars': [
        'Take different routes to avoid triggers',
        'Remove yourself from tempting environments',
        'Have an accountability partner'
      ],
      'Family tension': [
        'Practice healthy communication skills',
        'Seek family counseling if needed',
        'Create boundaries with toxic relationships'
      ],
      'Friends circle': [
        'Find sober friends and activities',
        'Be honest about your recovery needs',
        'Avoid social situations with substance use'
      ],
      'Tiredness': [
        'Maintain a regular sleep schedule',
        'Practice stress reduction techniques',
        'Avoid making important decisions when tired'
      ],
      'Financial stress': [
        'Create a budget and financial plan',
        'Seek financial counseling',
        'Focus on the money saved by not using'
      ],
      'Work tension': [
        'Practice stress management at work',
        'Take regular breaks and practice deep breathing',
        'Consider speaking with HR about stress management'
      ],
      'Love failure': [
        'Allow yourself time to heal and process emotions',
        'Focus on self-care and personal growth',
        'Consider therapy to work through relationship issues'
      ],
      'Having doubts': [
        'Remind yourself of your reasons for quitting',
        'Talk to a sponsor or supportive person',
        'Review your progress and achievements'
      ],
      'Family history of alcoholism': [
        'Understand that genetics don\'t determine your fate',
        'Be extra vigilant about your recovery',
        'Consider genetic counseling if helpful'
      ]
    };

    const allSuggestions: string[] = [];
    triggers.forEach(trigger => {
      if (suggestionMap[trigger]) {
        allSuggestions.push(...suggestionMap[trigger]);
      }
    });

    // Add general suggestions
    if (allSuggestions.length === 0) {
      allSuggestions.push(
        'Call your sponsor or support person',
        'Attend a recovery meeting',
        'Practice deep breathing or meditation',
        'Remove yourself from the triggering situation',
        'Remember that cravings are temporary'
      );
    }

    return [...new Set(allSuggestions)].slice(0, 5); // Return unique suggestions, max 5
  }, []);
  // Dashboard calculation functions using real database data
  const calculateTotalSavings = useCallback((): number => {
    if (!activeTracker) return 0;
    // Use total_sobriety_days from database instead of calculating from dates
    const totalDays = activeTracker.total_sobriety_days || 0;
    return totalDays * (activeTracker.daily_cost || 0);
  }, [activeTracker]);

  const calculateProjectedSavings = useCallback((): number => {
    if (!activeTracker) return 0;
    // Use current_streak_days from database for projection
    const currentDays = activeTracker.current_streak_days || 0;
    if (currentDays <= 0) return 0;
    return currentDays * (activeTracker.daily_cost || 0) * 365;
  }, [activeTracker]);

  const getHoursSinceStart = useCallback((): number => {
    if (!activeTracker?.start_date) return 0;
    const startDate = new Date(activeTracker.start_date);
    const now = new Date();
    return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  }, [activeTracker]);

  const shouldShowSavings = useCallback((): boolean => {
    return getHoursSinceStart() >= 24;
  }, [getHoursSinceStart]);

  const getWeeklyProgress = useCallback((): Array<{ day: string, saved: number, streak: number }> => {
    if (!activeTracker) return [];

    const progress = [];
    const startDate = new Date(activeTracker.start_date);
    const today = new Date();
    const dailyCost = activeTracker.daily_cost || 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      if (date >= startDate) {
        // Calculate days since start for this specific date
        const daysSober = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        // Use actual current_streak_days if available, otherwise calculate
        const actualStreak = Math.min(daysSober, activeTracker.current_streak_days || daysSober);

        progress.push({
          day: dayName,
          saved: dailyCost * Math.max(0, actualStreak),
          streak: actualStreak
        });
      } else {
        progress.push({
          day: dayName,
          saved: 0,
          streak: 0
        });
      }
    }

    return progress;
  }, [activeTracker]);

  const getMilestoneData = useCallback((): Array<{ days: number, achieved: boolean, date?: string }> => {
    const milestones = [1, 7, 30, 90, 180, 365];
    // Use current_streak_days from database for accurate milestone tracking
    const currentDays = activeTracker?.current_streak_days || 0;

    return milestones.map(days => ({
      days,
      achieved: currentDays >= days,
      date: currentDays >= days ? activeTracker?.start_date : undefined
    }));
  }, [activeTracker]);

  // Get real streak data from database
  const getCurrentStreak = useCallback((): number => {
    return activeTracker?.current_streak_days || 0;
  }, [activeTracker]);

  const getLongestStreak = useCallback((): number => {
    return activeTracker?.longest_streak_days || 0;
  }, [activeTracker]);

  const getTotalRelapses = useCallback((): number => {
    return activeTracker?.relapses_count || 0;
  }, [activeTracker]);

  const getLastRelapseDate = useCallback((): string => {
    return activeTracker?.last_relapse_date ? formatDate(activeTracker.last_relapse_date) : 'None';
  }, [activeTracker]);

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSobrietyDays = (tracker: ExtendedSobrietyTracker): number => {
    if (!tracker?.start_date) return 0;
    const startDate = new Date(tracker.start_date);
    const today = new Date();
    return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

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

  // Update timer
  useEffect(() => {
    if (!activeTracker?.start_date) {
      return;
    }

    const startDate = new Date(activeTracker.start_date);
    const updateTimer = () => {
      const endDate = activeTracker.is_active ? undefined : (activeTracker.end_date ? new Date(activeTracker.end_date) : new Date());
      const elapsedElement = document.getElementById('elapsed-time');
      if (elapsedElement) {
        elapsedElement.textContent = formatElapsedTime(startDate, endDate);
      }
    };

    updateTimer(); // Initial call

    if (activeTracker.is_active) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTracker?.id, activeTracker?.is_active, activeTracker?.start_date, activeTracker?.end_date]);

  // Fetch data with error handling
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [trackersResponse, goalsResponse, milestonesResponse] = await Promise.all([
        getAllSobrietyTrackers(user.id),
        getUserGoals(user.id),
        getUserMilestones(user.id)
      ]);

      // Get daily logs separately with error handling
      try {
        const logsResponse = await getDailyTrackingLogs(user.id, '', '');
        if (logsResponse.success && logsResponse.data) {
          const logsData = Array.isArray(logsResponse.data) ? logsResponse.data : [];
          setTrackingLogs(logsData);
        }
      } catch (logError) {
        console.warn('Failed to load daily logs (non-critical):', logError);
        setTrackingLogs([]); // Set empty array instead of failing
      }

      if (trackersResponse.success && trackersResponse.data) {
        const trackersData = Array.isArray(trackersResponse.data) ? trackersResponse.data : [];
        // Filter out stopped trackers
        const activeTrackers = trackersData.filter(t => t.is_active);
        setTrackers(activeTrackers as ExtendedSobrietyTracker[]);
        if (activeTrackers.length > 0) {
          const active = activeTrackers.find(t => t.is_active);
          setActiveTracker((active || activeTrackers[0]) as ExtendedSobrietyTracker);
        }
      }

      if (goalsResponse.success && goalsResponse.data) {
        const goalsData = Array.isArray(goalsResponse.data) ? goalsResponse.data : [];
        setGoals(goalsData);
      }

      if (milestonesResponse.success && milestonesResponse.data) {
        const milestonesData = Array.isArray(milestonesResponse.data) ? milestonesResponse.data : [];
        setMilestones(milestonesData as Milestone[]);
      }

    } catch (err) {
      console.error('Error fetching tracker data:', err);
      setError('Failed to load tracker data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch data on mount and user change
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Test SMS configuration on page load (for debugging)
    console.log('Testing SMS configuration...');
    testSMSConfiguration();

    fetchUserData();
  }, [user, navigate, fetchUserData]);

  // Handle functions
  const handleAddTracker = async () => {
    if (!newTracker.addiction_type || !user) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await initializeSobrietyTracker(
        user.id,
        newTracker.addiction_type,
        undefined,
        newTracker.daily_cost
      );

      if (response.success) {
        // Refresh trackers data
        try {
          const trackersResponse = await getAllSobrietyTrackers(user.id);
          if (trackersResponse.success && trackersResponse.data) {
            const allTrackers = trackersResponse.data as ExtendedSobrietyTracker[];
            const activeTrackers = allTrackers.filter(t => t.is_active);
            setTrackers(activeTrackers);

            const newTrackerData = activeTrackers.find(t => t.addiction_type === newTracker.addiction_type);
            if (newTrackerData) {
              setActiveTracker(newTrackerData);
            }
          }
        } catch (refreshError) {
          console.warn('Failed to refresh trackers after creation:', refreshError);
        }

        setShowAddTracker(false);
        setNewTracker({ addiction_type: '', daily_cost: 0 });
        setSuccess('New tracker added successfully!');

        // Send SMS notification
        try {
          await smsService.sendMilestoneAlert(
            user.email || 'User',
            'New Tracker Started',
            0,
            0
          );
        } catch (smsError) {
          console.warn('SMS notification failed:', smsError);
        }
      } else {
        setError(response.message || 'Failed to add new tracker');
      }
    } catch (err) {
      console.error('Error adding tracker:', err);
      setError('Failed to add new tracker. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTracker = async () => {
    if (!activeTracker || !user) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await updateSobrietyTracker(
        user.id,
        activeTracker.addiction_type,
        !activeTracker.is_active
      );

      if (response.success && response.data) {
        const updatedTrackers = trackers.map(t =>
          t.id === activeTracker.id ? (response.data as ExtendedSobrietyTracker) : t
        );
        setTrackers(updatedTrackers);
        setActiveTracker(response.data as ExtendedSobrietyTracker);
        setSuccess(`Tracker ${response.data.is_active ? 'started' : 'paused'} successfully!`);

        // Send SMS if tracker is started
        if (response.data.is_active) {
          try {
            await smsService.sendDailyCheckIn(user.email || 'User');
          } catch (smsError) {
            console.warn('SMS notification failed:', smsError);
          }
        }
      } else {
        setError(response.message || 'Failed to update tracker');
      }
    } catch (err) {
      console.error('Error updating tracker:', err);
      setError('Failed to update tracker');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTracker = async () => {
    if (!activeTracker || !user) return;

    if (!window.confirm("Are you sure you want to completely stop this tracker? This will end your streak and remove it from your active trackers.")) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await stopSobrietyTracker(activeTracker.id);

      if (response.success) {
        // Remove the stopped tracker from active trackers
        const updatedTrackers = trackers.filter(t => t.id !== activeTracker.id);
        setTrackers(updatedTrackers);

        // Set active tracker to next available or null
        if (updatedTrackers.length > 0) {
          setActiveTracker(updatedTrackers[0]);
        } else {
          setActiveTracker(null);
        }

        setSuccess('Tracker stopped successfully and removed from active trackers.');

        // Send SMS notification
        try {
          await smsService.sendRelapseAlert(
            user.email || 'User',
            activeTracker.addiction_type,
            ['Tracker stopped'],
            'User chose to stop tracking'
          );
        } catch (smsError) {
          console.warn('SMS notification failed:', smsError);
        }
      } else {
        setError(response.message || 'Failed to stop tracker');
      }
    } catch (err) {
      console.error('Error stopping tracker:', err);
      setError('Failed to stop tracker');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordRelapse = async () => {
    if (!activeTracker || !user || relapseData.triggers.length === 0) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await recordRelapse(
        user.id,
        activeTracker.addiction_type,
        new Date().toISOString(),
        relapseData.triggers,
        relapseData.notes
      );

      if (response.success) {
        // Refresh trackers data with error handling
        try {
          const trackersResponse = await getAllSobrietyTrackers(user.id);
          if (trackersResponse.success && trackersResponse.data) {
            const allTrackers = trackersResponse.data as ExtendedSobrietyTracker[];
            const activeTrackers = allTrackers.filter(t => t.is_active);
            setTrackers(activeTrackers);

            const updatedTracker = activeTrackers.find(t => t.id === activeTracker.id);
            if (updatedTracker) {
              setActiveTracker(updatedTracker);
            } else {
              setActiveTracker(null);
            }
          }
        } catch (refreshError) {
          console.warn('Failed to refresh trackers after relapse:', refreshError);
        }

        // Generate and show suggestions
        const triggerSuggestions = generateSuggestions(relapseData.triggers);
        setSuggestions(triggerSuggestions);
        setShowSuggestions(true);

        setSuccess('Relapse recorded successfully. Please review the suggestions below.');

        // Send SMS notification
        try {
          console.log('Attempting to send SMS alert...');
          const smsResult = await smsService.sendRelapseAlert(
            user.email || 'User',
            activeTracker.addiction_type,
            relapseData.triggers,
            relapseData.notes
          );

          if (smsResult.success) {
            console.log('SMS alert sent successfully');
          } else {
            console.warn('SMS alert failed:', smsResult.error);
          }
        } catch (smsError) {
          console.warn('SMS notification failed:', smsError);
        }

        // Reset form
        setRelapseData({ triggers: [], notes: '' });
        setShowRelapseForm(false);
      } else {
        setError(response.message || 'Failed to record relapse');
      }
    } catch (err) {
      console.error('Error recording relapse:', err);
      setError('Failed to record relapse. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.goal_description || !user) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await createUserGoal(user.id, {
        goal_type: newGoal.goal_type,
        goal_description: newGoal.goal_description,
        target_value: newGoal.target_value,
        target_date: newGoal.target_date,
        progress_unit: newGoal.progress_unit
      });

      if (response.success) {
        // Refresh goals with error handling
        try {
          const goalsResponse = await getUserGoals(user.id);
          if (goalsResponse.success && goalsResponse.data) {
            setGoals(goalsResponse.data);
          }
        } catch (refreshError) {
          console.warn('Failed to refresh goals after creation:', refreshError);
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
      setError('Failed to add new goal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
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
              <Skeleton className="h-4 w-3/4" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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
            <h1 className="text-2xl font-bold text-primary">Sobriety Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your recovery journey</p>
          </div>
        </div>

        {/* Database Test Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) {
                fetchTrackerHistory();
              }
            }}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={runDatabaseTests}
            disabled={testRunning || !user}
            className="flex items-center gap-2"
          >
            {testRunning ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Testing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Test Database
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Status Dashboard - Always Visible with Constant Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Activity className="h-6 w-6 text-blue-600" />
            <span>Recovery Dashboard</span>
            {activeTracker?.is_active && (
              <Badge variant="success" className="ml-2 animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Main Stats Row - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Current Streak"
              value={`${getCurrentStreak()} days`}
              subtitle={`${getHoursSinceStart()} hours elapsed`}
              trend="up"
              color="green"
            />

            <StatsCard
              title="Total Saved"
              value={shouldShowSavings() ? formatCurrency(calculateTotalSavings()) : '---'}
              subtitle={shouldShowSavings() ? `₹${activeTracker?.daily_cost || 0}/day` : 'Shows after 24 hours'}
              trend="up"
              color="green"
            />

            <StatsCard
              title="Highest Streak"
              value={`${getLongestStreak()} days`}
              subtitle="Personal best"
              trend="neutral"
              color="blue"
            />

            <StatsCard
              title="Total Relapses"
              value={getTotalRelapses()}
              subtitle="Learning opportunities"
              trend={getTotalRelapses() > 0 ? "down" : "up"}
              color="orange"
            />
          </div>

          {/* Additional Content - Only When Active Tracker Exists */}
          {activeTracker ? (
            <>
              {/* Professional Sober Timer */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                      You are sober since
                    </h2>
                    <div className="text-4xl font-bold text-green-600 mb-2 font-mono tracking-wider">
                      {elapsedTime}
                    </div>
                    <div className="text-sm text-green-600">
                      Started on {formatDate(activeTracker.start_date)} at {formatTime(activeTracker.start_date)}
                    </div>
                    {activeTracker.daily_cost && (
                      <div className="mt-3 text-sm text-green-700">
                        Saving ₹{activeTracker.daily_cost} per day
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Weekly Progress Chart */}
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Weekly Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {getWeeklyProgress().map((day, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-12 text-xs font-medium text-gray-600">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-6">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                  style={{ width: `${Math.min(100, (day.saved / Math.max(...getWeeklyProgress().map(d => d.saved), 1)) * 100)}%` }}
                                >
                                  {day.saved > 0 && (
                                    <span className="text-xs text-white font-medium">
                                      {formatCurrency(day.saved)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-16 text-right">
                            <span className="text-xs font-medium text-gray-700">
                              {day.streak > 0 ? `${day.streak}d` : '--'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Milestone Progress */}
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span>Milestone Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <MilestoneChart milestones={getMilestoneData()} />
                  </CardContent>
                </Card>
              </div>

              {/* Financial Summary */}
              {shouldShowSavings() && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Financial Impact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(calculateTotalSavings())}
                        </div>
                        <div className="text-sm text-green-600">Total Saved</div>
                        <div className="text-xs text-green-500 mt-1">
                          Over {activeTracker.total_sobriety_days || getCurrentStreak()} days
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {formatCurrency(calculateProjectedSavings())}
                        </div>
                        <div className="text-sm text-blue-600"></div>
                        <div className="text-xs text-blue-500 mt-1">
                          If current streak continues
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">
                          {formatCurrency(activeTracker.daily_cost || 0)}
                        </div>
                        <div className="text-sm text-purple-600">Daily Savings</div>
                        <div className="text-xs text-purple-500 mt-1">
                          Per day sober
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 24-Hour Warning */}
              {!shouldShowSavings() && activeTracker.is_active && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800">
                          Savings Calculation Active
                        </div>
                        <div className="text-xs text-yellow-600">
                          Financial savings will appear after 24 hours of tracking.
                          Current progress: {getHoursSinceStart()} hours completed.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* No Active Tracker State - Show message below stats */
            <div className="text-center py-8 border-t border-blue-200">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-blue-800 mb-2">Start Your Recovery Journey</h3>
              <p className="text-sm text-blue-600 mb-4 max-w-md mx-auto">
                Begin tracking your sobriety to unlock detailed progress charts, milestones, and financial insights
              </p>
              <Button
                onClick={() => setShowAddTracker(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {activeTracker && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="text-lg font-bold">{getCurrentStreak()} <span className="text-xs font-normal">days</span></p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Savings</p>
                <p className="text-lg font-bold">{shouldShowSavings() ? formatCurrency(calculateTotalSavings()) : '---'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
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

          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-2 mr-3">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Relapses</p>
                <p className="text-lg font-bold">{getTotalRelapses()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tracker History Section */}
      {showHistory && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Tracker History</span>
              <Badge variant="secondary" className="ml-2">{trackerHistory.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {trackerHistory.length > 0 ? (
              <div className="space-y-4">
                {trackerHistory.map((tracker, index) => (
                  <div key={tracker.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${tracker.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                        <div>
                          <h3 className="font-medium capitalize">
                            {tracker.addiction_type} Tracker
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={tracker.is_active ? "success" : "secondary"}
                              className="text-xs"
                            >
                              {tracker.is_active ? 'Active' : 'Stopped'}
                            </Badge>
                            {tracker.daily_cost && (
                              <Badge variant="outline" className="text-xs">
                                ₹{tracker.daily_cost}/day
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        #{trackerHistory.length - index}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      {/* Started */}
                      <div>
                        <div className="text-muted-foreground mb-1">Started</div>
                        <div className="font-medium">
                          {formatDate(tracker.start_date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(tracker.start_date)}
                        </div>
                      </div>

                      {/* Ended */}
                      <div>
                        <div className="text-muted-foreground mb-1">
                          {tracker.is_active ? 'Running Since' : 'Ended'}
                        </div>
                        <div className="font-medium">
                          {tracker.end_date ? formatDate(tracker.end_date) : '---'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tracker.end_date ? formatTime(tracker.end_date) : '---'}
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <div className="text-muted-foreground mb-1">Duration</div>
                        <div className="font-medium">
                          {tracker.end_date
                            ? `${calculateDuration(tracker.start_date, tracker.end_date)} days`
                            : tracker.is_active
                              ? `${calculateDuration(tracker.start_date, new Date().toISOString())} days`
                              : '---'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tracker.is_active ? 'Still active' : 'Completed'}
                        </div>
                      </div>

                      {/* Stats */}
                      <div>
                        <div className="text-muted-foreground mb-1">Best Streak</div>
                        <div className="font-medium">
                          {tracker.longest_streak_days || 0} days
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tracker.relapses_count || 0} relapses
                        </div>
                      </div>
                    </div>

                    {/* Last Relapse */}
                    {tracker.last_relapse_date && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last Relapse:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(tracker.last_relapse_date)} at {formatTime(tracker.last_relapse_date)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {tracker.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes:</span>
                          <span className="ml-2">{tracker.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Tracker History</h3>
                <p className="text-sm text-muted-foreground">
                  Your tracker history will appear here once you start tracking
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Tracker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tracker */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calendar className="h-5 w-5" />
              <span>Sobriety Tracker</span>
              {activeTracker?.is_active ? (
                <Badge variant="success" className="ml-2">Active</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">Paused</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Tracker Selection */}
            {trackers.length > 1 && (
              <div className="mb-4">
                <Label htmlFor="tracker-select" className="text-sm mb-2 block">Select Tracker</Label>
                <div className="relative">
                  <select
                    id="tracker-select"
                    value={activeTracker?.id || ''}
                    onChange={(e) => {
                      const selectedTracker = trackers.find(t => t.id === e.target.value);
                      if (selectedTracker) setActiveTracker(selectedTracker);
                    }}
                    className="w-full h-10 border border-input rounded-md pl-3 pr-8 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {trackers.map((tracker) => (
                      <option key={tracker.id} value={tracker.id}>
                        {tracker.addiction_type.charAt(0).toUpperCase() + tracker.addiction_type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Timer Display */}
            {activeTracker?.is_active && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center">
                <p className="text-sm text-muted-foreground mb-1">You are sober since</p>
                <p id="elapsed-time" className="text-2xl font-bold text-green-700">{formatElapsedTime(new Date(activeTracker.start_date))}</p>
              </div>
            )}

            {/* Daily Cost Display */}
            {activeTracker && (
              <div className="mb-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Daily Cost: <span className="font-bold text-primary">{formatCurrency(activeTracker.daily_cost || 0)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projected Annual Savings: <span className="font-bold text-green-600">{formatCurrency(calculateProjectedSavings())}</span>
                </p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                onClick={handleToggleTracker}
                variant={activeTracker?.is_active ? "secondary" : "default"}
                className="flex items-center gap-2"
                disabled={actionLoading || !activeTracker}
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : activeTracker?.is_active ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Tracker
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Tracker
                  </>
                )}
              </Button>

              {activeTracker?.is_active && (
                <Button
                  size="sm"
                  onClick={() => setShowRelapseForm(!showRelapseForm)}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <Square className="h-4 w-4" />
                  Record Relapse
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleStopTracker}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                disabled={actionLoading || !activeTracker}
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Stop Tracker
                  </>
                )}
              </Button>
            </div>

            {/* Add New Tracker */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTracker(!showAddTracker)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAddTracker ? 'Cancel' : 'Add New Tracker'}
              </Button>

              {showAddTracker && (
                <div className="mt-4 p-4 border rounded-md bg-card">
                  <h3 className="text-lg font-medium mb-4">Add New Tracker</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="addiction-type" className="text-sm mb-2 block">Addiction Type</Label>
                      <Input
                        id="addiction-type"
                        type="text"
                        placeholder="e.g., alcohol, smoking"
                        value={newTracker.addiction_type}
                        onChange={(e) => setNewTracker({ ...newTracker, addiction_type: e.target.value })}
                        className="h-10 w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="daily-cost" className="text-sm mb-2 block">Average Daily Cost (INR)</Label>
                      <Input
                        id="daily-cost"
                        type="number"
                        placeholder="Amount you save per day"
                        value={newTracker.daily_cost}
                        onChange={(e) => setNewTracker({ ...newTracker, daily_cost: Number(e.target.value) })}
                        className="h-10 w-full"
                        min="0"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddTracker}
                      className="w-full"
                      disabled={!newTracker.addiction_type || actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Adding...
                        </>
                      ) : (
                        <>
                          Start Tracking
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Display */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold">{getCurrentStreak()}</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{getLongestStreak()}</div>
                <div className="text-xs text-muted-foreground">Longest Streak</div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{activeTracker?.total_sobriety_days || 0}</div>
                <div className="text-xs text-muted-foreground">Total Days</div>
                <div className="text-xs text-muted-foreground">sober</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{getTotalRelapses()}</div>
                <div className="text-xs text-muted-foreground">Relapses</div>
                <div className="text-xs text-muted-foreground">recorded</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="font-medium">{formatDate(activeTracker?.start_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Relapse</p>
                  <p className="font-medium">
                    {getLastRelapseDate()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {activeTracker?.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-yellow-600">Paused</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relapse Form */}
        {showRelapseForm && (
          <Card className="lg:col-span-1">
            <CardHeader className="p-4">
              <CardTitle>Record Relapse</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">What triggered the relapse?</Label>
                  <div className="space-y-2">
                    {[
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
                    ].map((trigger) => (
                      <div key={trigger} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`trigger-${trigger}`}
                          checked={relapseData.triggers.includes(trigger)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRelapseData({ ...relapseData, triggers: [...relapseData.triggers, trigger] });
                            } else {
                              setRelapseData({ ...relapseData, triggers: relapseData.triggers.filter(t => t !== trigger) });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`trigger-${trigger}`} className="text-sm">{trigger}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="relapse-notes" className="text-sm mb-2 block">Notes (Optional)</Label>
                  <textarea
                    id="relapse-notes"
                    placeholder="Describe what happened..."
                    value={relapseData.notes}
                    onChange={(e) => setRelapseData({ ...relapseData, notes: e.target.value })}
                    className="w-full h-20 text-sm border border-input rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRelapseForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRecordRelapse}
                    disabled={relapseData.triggers.length === 0 || actionLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Recording...
                      </>
                    ) : (
                      <>
                        Record Relapse
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions Display */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="lg:col-span-1 mt-4">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Suggestions to Avoid Relapse</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Get Support</span>
                  </div>
                  <p className="text-xs text-green-700">
                    SMS notification has been sent to your support team. They will reach out to help you.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="w-full mt-4"
                >
                  Close Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goals Section */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>My Goals</span>
            <Badge variant="secondary" className="ml-2">{goals.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showAddGoal ? 'Cancel' : 'Add Goal'}
            </Button>
          </div>

          {showAddGoal && (
            <div className="p-4 border rounded-md bg-card">
              <h3 className="text-lg font-medium mb-4">Create New Goal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="goal-type" className="text-sm mb-2 block">Goal Type</Label>
                  <select
                    id="goal-type"
                    value={newGoal.goal_type}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                    className="w-full h-10 border border-input rounded-md pl-3 pr-8 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="sobriety">Sobriety</option>
                    <option value="financial">Financial</option>
                    <option value="health">Health</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="goal-description" className="text-sm mb-2 block">Goal Description</Label>
                  <Input
                    id="goal-description"
                    type="text"
                    placeholder="What do you want to achieve?"
                    value={newGoal.goal_description}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_description: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="target-value" className="text-sm mb-2 block">Target Value</Label>
                  <Input
                    id="target-value"
                    type="number"
                    placeholder="Target value"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    className="h-10 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="target-date" className="text-sm mb-2 block">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="progress-unit" className="text-sm mb-2 block">Progress Unit</Label>
                  <select
                    id="progress-unit"
                    value={newGoal.progress_unit}
                    onChange={(e) => setNewGoal({ ...newGoal, progress_unit: e.target.value })}
                    className="w-full h-10 border border-input rounded-md pl-3 pr-8 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="days">Days</option>
                    <option value="amount">Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddGoal}
                className="w-full"
                disabled={!newGoal.goal_description || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Goal
                  </>
                )}
              </Button>
            </div>
          )}

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-medium">{goal.goal_description}</h4>
                      <Badge variant="secondary" className="text-xs px-1 py-0.5">
                        {goal.goal_type}
                      </Badge>
                    </div>
                    <Badge variant="success" className="text-xs px-1 py-0.5">
                      {goal.target_value} {goal.progress_unit}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Target: {goal.target_date ? formatDate(goal.target_date) : 'No deadline'}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Progress</span>
                    <span>{Math.round((goal.current_progress / goal.target_value) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (goal.current_progress / goal.target_value) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No goals set yet. Set your first goal to start tracking your progress!</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddGoal(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {trackingLogs.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {trackingLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">{formatDate(log.log_date)}</p>
                      <Badge variant={log.sobriety_status ? "success" : "destructive"} className="text-xs">
                        {log.sobriety_status ? 'Sober' : 'Relapse'}
                      </Badge>
                    </div>
                  </div>
                  {log.challenges_faced && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Challenges:</span> {log.challenges_faced}
                    </p>
                  )}
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {log.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackerPage;
