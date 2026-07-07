/**
 * ============================================================================
 * Feedback Service - IRCA Platform Mobile
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
        // Generate reference ID
        const referenceId = `IRCA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

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
                anonymous: feedbackData.anonymous || false,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error submitting feedback:', error);
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
        console.error('Unexpected error submitting feedback:', error);
        return {
            success: false,
            error: 'An unexpected error occurred while submitting feedback'
        };
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
