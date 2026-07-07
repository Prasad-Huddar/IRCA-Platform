/**
 * ============================================================================
 * Feedback Service - IRCA Platform
 * ============================================================================
 * This service handles feedback submissions and retrieval from Supabase
 * ============================================================================
 */

import { supabase } from '../lib/supabaseClient';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Feedback {
  id: string;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  feedback_type: 'feedback' | 'complaint' | 'testimonial' | 'suggestion' | 'appreciation';
  subject: string;
  message: string;
  testimonial_consent: boolean;
  anonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackSubmission {
  name: string;
  email: string;
  phone: string;
  feedbackType: string;
  subject: string;
  message: string;
  testimonialConsent?: boolean;
  anonymous?: boolean;
}

export interface FeedbackResponse {
  success: boolean;
  referenceId?: string;
  error?: string;
}

// ============================================================================
// Feedback Functions
// ============================================================================

/**
 * Submit feedback to the database
 */
export async function submitFeedback(feedbackData: FeedbackSubmission): Promise<FeedbackResponse> {
  try {
    const { data, error } = await supabase.rpc('submit_feedback', {
      p_name: feedbackData.name,
      p_email: feedbackData.email,
      p_phone: feedbackData.phone,
      p_feedback_type: feedbackData.feedbackType,
      p_subject: feedbackData.subject,
      p_message: feedbackData.message,
      p_testimonial_consent: feedbackData.testimonialConsent || false,
      p_anonymous: feedbackData.anonymous || false
    });

    if (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (data && data.length > 0) {
      return {
        success: true,
        referenceId: data[0].reference_id
      };
    }

    return {
      success: false,
      error: 'No data returned from feedback submission'
    };
  } catch (error) {
    console.error('Unexpected error submitting feedback:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while submitting feedback'
    };
  }
}

/**
 * Alternative submit feedback using direct insert (fallback method)
 */
export async function submitFeedbackDirect(feedbackData: FeedbackSubmission): Promise<FeedbackResponse> {
  try {
    // Generate reference ID
    const referenceId = `IRCA-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        reference_id: referenceId,
        name: feedbackData.name,
        email: feedbackData.email,
        phone: feedbackData.phone,
        feedback_type: feedbackData.feedbackType,
        subject: feedbackData.subject,
        message: feedbackData.message,
        testimonial_consent: feedbackData.testimonialConsent || false,
        anonymous: feedbackData.anonymous || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback directly:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      referenceId: data.reference_id
    };
  } catch (error) {
    console.error('Unexpected error submitting feedback directly:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while submitting feedback'
    };
  }
}

/**
 * Get all feedback (for admin purposes)
 */
export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching feedback:', error);
    return [];
  }
}

/**
 * Get feedback by reference ID
 */
export async function getFeedbackByReferenceId(referenceId: string): Promise<Feedback | null> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('reference_id', referenceId)
      .single();

    if (error) {
      console.error('Error fetching feedback by reference ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching feedback by reference ID:', error);
    return null;
  }
}

/**
 * Update feedback status (for admin purposes)
 */
export async function updateFeedbackStatus(
  feedbackId: string, 
  status: 'pending' | 'reviewed' | 'resolved' | 'closed',
  adminNotes?: string
): Promise<boolean> {
  try {
    const updateData: any = { status };
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', feedbackId);

    if (error) {
      console.error('Error updating feedback status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating feedback status:', error);
    return false;
  }
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<{
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  closed: number;
  byType: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('status, feedback_type');

    if (error) {
      console.error('Error fetching feedback stats:', error);
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        closed: 0,
        byType: {}
      };
    }

    const feedback = data || [];
    const stats = {
      total: feedback.length,
      pending: feedback.filter(f => f.status === 'pending').length,
      reviewed: feedback.filter(f => f.status === 'reviewed').length,
      resolved: feedback.filter(f => f.status === 'resolved').length,
      closed: feedback.filter(f => f.status === 'closed').length,
      byType: {} as Record<string, number>
    };

    // Count by feedback type
    feedback.forEach(f => {
      stats.byType[f.feedback_type] = (stats.byType[f.feedback_type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Unexpected error fetching feedback stats:', error);
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      resolved: 0,
      closed: 0,
      byType: {}
    };
  }
}
