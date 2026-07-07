/**
 * ============================================================================
 * Profile Page - IRCA Platform
 * ============================================================================
 * Clean and focused user profile page with essential information
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
} from '../services/profileTrackerService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  User,
  Calendar,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Form validation schema
// Form validation schema
const ProfileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  // Helper functions

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    const total = 4; // Simplified total

    if (profile.first_name) completed++;
    if (profile.last_name) completed++;
    if (profile.phone) completed++;
    if (profile.bio) completed++;

    return Math.round((completed / total) * 100);
  };


  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(ProfileSchema),
  });

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

      const profileResponse = await getUserProfile(user!.id);

      console.log('DEBUG: fetchUserData response:', profileResponse);

      if (profileResponse && profileResponse.success && profileResponse.data) {
        const profileData = profileResponse.data as any;

        setProfile(profileData);

        // Use profile data, fallback to auth data, or empty string
        reset({
          first_name: profileData.first_name || (user as any)?.first_name || (user as any)?.user_metadata?.first_name || '',
          last_name: profileData.last_name || (user as any)?.last_name || (user as any)?.user_metadata?.last_name || '',
          phone: profileData.phone || (user as any)?.phone || '',
          bio: profileData.bio || '',
        });
      } else {
        // Handle case where profile is not found or error occurred
        console.warn('Profile not found or error:', profileResponse?.message);

        // Even if profile fetch fails, we let the user "create" it by filling the form with auth defaults
        reset({
          first_name: (user as any)?.first_name || (user as any)?.user_metadata?.first_name || '',
          last_name: (user as any)?.last_name || (user as any)?.user_metadata?.last_name || '',
          phone: (user as any)?.phone || '',
          bio: '',
        });

        // We do NOT set 'error' here if it's just a missing profile, so the UI allows them to create it.
        // Only set error if it's a critical failure that prevents saving.
        if (profileResponse?.statusCode !== 404) {
          console.error('Fetch error:', profileResponse?.message);
          // Optional: setError(profileResponse?.message || 'Failed to load profile');
          // Decided NOT to show error to user to avoid "404" alarms. Let them save the form.
        }
      }

    } catch (err) {
      console.error('Error fetching profile data:', err);
      // Fallback defaults
      reset({
        first_name: (user as any)?.first_name || (user as any)?.user_metadata?.first_name || '',
        last_name: (user as any)?.last_name || (user as any)?.user_metadata?.last_name || '',
        phone: '',
        bio: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Prepare profile data
      const profileDataPayload = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        bio: data.bio,
      };

      let response;

      // If we have an existing profile, update it
      if (profile) {
        response = await updateUserProfile(user!.id, profileDataPayload);
      }
      // Otherwise, create a new one (Upsert logic)
      else {
        response = await createUserProfile(user!.id, {
          ...profileDataPayload,
          // Provide defaults for fields not in the form but potentially expected by schema/types
          currency: 'USD',
          daily_spending_goal: 0,
        });
      }

      if (!response.success) {
        throw new Error(response.message);
      }

      setSuccess('Profile saved successfully!');
      setEditMode(false);
      fetchUserData(); // Refresh data

    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };


  if (loading && !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4 p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
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

  // Show error state if we have an error and no profile data
  if (error && !profile) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchUserData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Page Header - More Compact */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold text-primary">My Profile</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your personal information</p>
        </div>
      </div>

      {/* Quick Navigation to Tracker */}
      <Card className="max-w-3xl mx-auto mb-4">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Sobriety Tracking & Analytics</h3>
              <p className="text-xs text-muted-foreground">Track your recovery journey, goals, and achievements</p>
            </div>
            <Button
              onClick={() => navigate('/tracker')}
              className="h-8 text-xs px-3"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Go to Tracker
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Profile Completion Indicator */}
      <Card className="max-w-3xl mx-auto mb-4">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Profile Completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{calculateProfileCompletion()}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information - More Compact Layout */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="p-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your personal information
              </p>
            </div>
            <div className="flex space-x-1.5">
              {editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)} className="h-7 px-2 text-xs">
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSubmit(onSubmit)} className="h-7 px-2 text-xs">
                    <Save className="h-3 w-3 mr-1" /> Save
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setEditMode(true)} className="h-7 px-2 text-xs">
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-sm">First Name</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  disabled={!editMode}
                  className="h-8 text-sm disabled:opacity-100 disabled:bg-transparent py-1 px-2 text-foreground"
                />
                {errors.first_name && (
                  <p className="text-xs text-destructive">{errors.first_name.message as string}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-sm">Last Name</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  disabled={!editMode}
                  className="h-8 text-sm disabled:opacity-100 disabled:bg-transparent py-1 px-2 text-foreground"
                />
                {errors.last_name && (
                  <p className="text-xs text-destructive">{errors.last_name.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  value={user?.email}
                  disabled
                  className="h-8 text-sm disabled:opacity-100 disabled:bg-transparent py-1 px-2 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  disabled={!editMode}
                  className="h-8 text-sm disabled:opacity-100 disabled:bg-transparent py-1 px-2 text-foreground"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-sm">Bio</Label>
              <textarea
                id="bio"
                {...register('bio')}
                disabled={!editMode}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                placeholder="Tell us about yourself..."
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message as string}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
