/**
 * ============================================================================
 * Contact & Feedback Screen - IRCA Platform Mobile
 * ============================================================================
 * Fully integrated with Supabase backend for feedback submission
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { submitFeedback, FeedbackSubmission } from '../services/feedbackService';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  feedbackType: string;
  testimonialConsent: boolean;
  anonymous: boolean;
}

const feedbackTypes = [
  { value: 'feedback', label: 'General Feedback', icon: '💬', description: 'Share your thoughts and suggestions' },
  { value: 'complaint', label: 'Complaint', icon: '⚠️', description: 'Report an issue or concern' },
  { value: 'testimonial', label: 'Success Story', icon: '❤️', description: 'Share your recovery journey' },
  { value: 'suggestion', label: 'Suggestion', icon: '💡', description: 'Propose improvements' },
  { value: 'appreciation', label: 'Appreciation', icon: '⭐', description: 'Express gratitude or praise' },
];

export default function ContactScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    feedbackType: 'feedback',
    testimonialConsent: false,
    anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.anonymous && !formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }
    if (!formData.anonymous && (!formData.email.trim() || !formData.email.includes('@'))) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.anonymous && (!formData.phone.trim() || formData.phone.length < 10)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.subject.trim() || formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare feedback data for submission
      const feedbackData: FeedbackSubmission = {
        name: formData.anonymous ? 'Anonymous' : formData.name,
        email: formData.anonymous ? 'anonymous@irca.karnataka.gov.in' : formData.email,
        phone: formData.anonymous ? '0000000000' : formData.phone,
        feedbackType: formData.feedbackType,
        subject: formData.subject,
        message: formData.message,
        testimonialConsent: formData.testimonialConsent,
        anonymous: formData.anonymous
      };

      // Submit feedback to backend
      const result = await submitFeedback(feedbackData);

      if (result.success && result.referenceId) {
        setReferenceId(result.referenceId);
        setIsSubmitted(true);
      } else {
        Alert.alert(
          'Submission Failed',
          result.error || 'Failed to submit feedback. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setReferenceId('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      feedbackType: 'feedback',
      testimonialConsent: false,
      anonymous: false,
    });
  };

  const handleCall = () => {
    Linking.openURL('tel:14446');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@irca.karnataka.gov.in');
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>

            <Text style={styles.successTitle}>Thank You for Your Feedback!</Text>

            <Text style={styles.successMessage}>
              Your feedback has been successfully submitted. We truly appreciate you taking the time
              to share your thoughts with us.
            </Text>

            <View style={styles.referenceIdContainer}>
              <Text style={styles.referenceIdLabel}>Reference ID:</Text>
              <Text style={styles.referenceIdValue}>{referenceId}</Text>
              <Text style={styles.referenceIdNote}>Please save this reference ID for your records</Text>
            </View>

            <View style={styles.nextStepsContainer}>
              <Text style={styles.nextStepsTitle}>What happens next?</Text>

              <View style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <View style={styles.stepDot} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Review</Text>
                  <Text style={styles.stepDescription}>We'll review your feedback within 24 hours</Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <View style={[styles.stepDot, { backgroundColor: '#10B981' }]} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Action</Text>
                  <Text style={styles.stepDescription}>We'll take appropriate action if needed</Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <View style={[styles.stepDot, { backgroundColor: '#3B82F6' }]} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Follow-up</Text>
                  <Text style={styles.stepDescription}>We'll contact you if more information is needed</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={resetForm}>
              <Text style={styles.submitButtonText}>Submit Another Feedback</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.enhancedHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.mainTitle}>Contact & Feedback</Text>
            <Text style={styles.subtitle}>
              We value your feedback and are here to help. Share your thoughts, suggestions,
              or concerns to help us improve our services.
            </Text>
          </View>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyContent}>
            <View style={styles.emergencyIcon}>
              <Text style={styles.emergencyIconText}>🚨</Text>
            </View>
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
              <Text style={styles.emergencySubtitle}>
                If you or someone you know needs immediate assistance, contact our 24/7 helpline.
              </Text>
              <TouchableOpacity style={styles.emergencyButton} onPress={handleCall}>
                <Text style={styles.emergencyButtonText}>📞 Call 14446</Text>
              </TouchableOpacity>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyInfoText}>Available 24/7 • Confidential Support</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactInfoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.contactInfoCard}>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Text style={styles.contactIcon}>📧</Text>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>support@irca.karnataka.gov.in</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>
                  Department of Health and Family Welfare{'\n'}Government of Karnataka
                </Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>⏰</Text>
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Response Time</Text>
                <Text style={styles.contactValue}>Within 24 hours</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Feedback Types Info */}
        <View style={styles.feedbackTypesSection}>
          <Text style={styles.sectionTitle}>Feedback Types</Text>
          <View style={styles.feedbackTypesGrid}>
            {feedbackTypes.map((type) => (
              <View key={type.value} style={styles.feedbackTypeCard}>
                <Text style={styles.feedbackTypeIcon}>{type.icon}</Text>
                <Text style={styles.feedbackTypeLabel}>{type.label}</Text>
                <Text style={styles.feedbackTypeDescription}>{type.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Feedback Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Share Your Feedback</Text>
          <Text style={styles.sectionSubtitle}>
            Your feedback helps us improve our services and better serve the community
          </Text>

          <View style={styles.formCard}>
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  editable={!formData.anonymous}
                />
                {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
              </View>

              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!formData.anonymous}
                />
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  editable={!formData.anonymous}
                />
                {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
              </View>

              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Feedback Type *</Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => setShowTypeModal(true)}
                >
                  <Text style={styles.formInputText}>
                    {feedbackTypes.find(t => t.value === formData.feedbackType)?.label || 'Select type'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formFull}>
              <Text style={styles.formLabel}>Subject *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Brief description of your feedback"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />
              {errors.subject && <Text style={styles.fieldError}>{errors.subject}</Text>}
            </View>

            <View style={styles.formFull}>
              <Text style={styles.formLabel}>Message *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Please provide detailed information about your feedback, suggestion, or concern..."
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                multiline
                numberOfLines={4}
              />
              {errors.message && <Text style={styles.fieldError}>{errors.message}</Text>}
            </View>

            {/* Checkboxes */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, testimonialConsent: !formData.testimonialConsent })}
            >
              <View style={[styles.checkbox, formData.testimonialConsent && styles.checkboxChecked]}>
                {formData.testimonialConsent && <Text style={styles.checkboxIcon}>✓</Text>}
              </View>
              <View style={styles.checkboxLabel}>
                <Text style={styles.checkboxText}>
                  I consent to my feedback being used as a testimonial (optional)
                </Text>
                <Text style={styles.checkboxSubtext}>
                  Your story can inspire others. We'll only use it with your explicit permission.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, anonymous: !formData.anonymous })}
            >
              <View style={[styles.checkbox, formData.anonymous && styles.checkboxChecked]}>
                {formData.anonymous && <Text style={styles.checkboxIcon}>✓</Text>}
              </View>
              <View style={styles.checkboxLabel}>
                <Text style={styles.checkboxText}>
                  Submit anonymously (optional)
                </Text>
                <Text style={styles.checkboxSubtext}>
                  Your contact information will not be shared or displayed publicly.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>📤 Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Feedback Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Feedback Type</Text>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.modalOption,
                  formData.feedbackType === type.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setFormData({ ...formData, feedbackType: type.value });
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.modalOptionIcon}>{type.icon}</Text>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionLabel}>{type.label}</Text>
                  <Text style={styles.modalOptionDescription}>{type.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    paddingTop: 60,
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
    lineHeight: 24,
  },

  // Emergency Section
  emergencySection: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  emergencyIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFC107',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emergencyIconText: {
    fontSize: 24,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyInfoText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },

  // Contact Info Section
  contactInfoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
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
    marginBottom: 16,
  },
  fieldError: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 2,
  },
  contactInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    fontSize: 20,
    width: 40,
    textAlign: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#6C757D',
  },

  // Feedback Types Section
  feedbackTypesSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  feedbackTypesGrid: {
    gap: 12,
  },
  feedbackTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackTypeIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  feedbackTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  feedbackTypeDescription: {
    fontSize: 12,
    color: '#6C757D',
    flex: 2,
  },

  // Form Section
  formSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  formFull: {
    width: '100%',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  formInputText: {
    color: '#1F2937',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Checkbox Styles
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  checkboxIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  checkboxSubtext: {
    fontSize: 12,
    color: '#6C757D',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#003366',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#6C757D',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#EBF5FF',
    borderColor: '#003366',
  },
  modalOptionIcon: {
    fontSize: 24,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  modalOptionDescription: {
    fontSize: 12,
    color: '#6C757D',
  },
  modalCloseButton: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Success Screen Styles
  successContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#D1FAE5',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  referenceIdContainer: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#003366',
    marginBottom: 20,
  },
  referenceIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 4,
  },
  referenceIdValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  referenceIdNote: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  nextStepsContainer: {
    marginBottom: 20,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    backgroundColor: '#003366',
    borderRadius: 5,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6C757D',
  },

  footerSpacer: {
    height: 20,
  },
});
