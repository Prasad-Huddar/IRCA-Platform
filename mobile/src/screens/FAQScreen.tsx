import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ResourceItem {
  id: number;
  title: string;
  description: string;
  type: 'PDF' | 'Link' | 'Document';
  url?: string;
  downloadUrl?: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'About IRCA Centers',
    question: 'What is an IRCA center?',
    answer: 'Integrated Rehabilitation Centre for Addicts (IRCA) centers are government-supported facilities that provide comprehensive treatment, rehabilitation, and support services for individuals struggling with substance abuse and addiction.'
  },
  {
    id: 'faq-2',
    category: 'About IRCA Centers',
    question: 'How many IRCA centers are there in Karnataka?',
    answer: 'Karnataka has 33 government-verified IRCA centers spread across all districts of the state, ensuring accessibility for people seeking help with addiction recovery.'
  },
  {
    id: 'faq-3',
    category: 'About IRCA Centers',
    question: 'Are IRCA centers free of cost?',
    answer: 'Most services at IRCA centers are either free or heavily subsidized by the government. Treatment costs are covered under various government schemes.'
  },
  {
    id: 'faq-4',
    category: 'Treatment & Recovery',
    question: 'What types of treatment are available?',
    answer: 'IRCA centers offer comprehensive treatment including detoxification, medical management, individual and group counseling, therapy sessions, family support programs, and aftercare planning.'
  },
  {
    id: 'faq-5',
    category: 'Treatment & Recovery',
    question: 'How long does treatment usually take?',
    answer: 'Treatment duration varies based on individual needs and addiction severity. Typical programs range from 28-day detoxification programs to 90-day comprehensive rehabilitation programs.'
  }
];

const resourcesData: ResourceItem[] = [
  {
    id: 1,
    title: 'National Action Plan for Drug Demand Reduction (NAPDDR)',
    description: 'Comprehensive government guidelines for drug demand reduction and rehabilitation services.',
    type: 'PDF',
    downloadUrl: '/resources/napddr-guidelines.pdf',
    category: 'Government Guidelines'
  },
  {
    id: 2,
    title: 'Ministry of Social Justice and Empowerment',
    description: 'Official website with resources and information about drug prevention programs.',
    type: 'Link',
    url: 'https://socialjustice.nic.in/',
    category: 'Government Resources'
  }
];

const categories = ['All', 'About IRCA Centers', 'Treatment & Recovery', 'Government Schemes', 'Contact & Support'];

export default function FAQScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeResourceTab, setActiveResourceTab] = useState('faqs');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'About IRCA Centers': return '👥';
      case 'Treatment & Recovery': return '❤️';
      case 'Government Schemes': return '🛡️';
      case 'Contact & Support': return '📞';
      default: return '❓';
    }
  };


  return (
    <View style={styles.container}>


      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, marginBottom: 8 }}>📚</Text>
        <Text style={styles.headerTitle}>FAQ & Resources</Text>
        <Text style={styles.headerSubtitle}>Official guide and technical resources</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub Header Content */}
        <View style={styles.enhancedHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.subtitle}>
              Find answers to common questions about IRCA centers, treatment options,
              and government schemes.
            </Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.enhancedFiltersCard}>
          <Text style={styles.filtersTitle}>Search Knowledge Base</Text>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="🔍 Search FAQs and resources..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              placeholderTextColor="#6C757D"
            />
          </View>

          <View style={styles.categoryButtons}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeResourceTab === 'faqs' && styles.tabButtonActive
            ]}
            onPress={() => setActiveResourceTab('faqs')}
          >
            <Text style={[
              styles.tabButtonText,
              activeResourceTab === 'faqs' && styles.tabButtonTextActive
            ]}>❓ FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeResourceTab === 'resources' && styles.tabButtonActive
            ]}
            onPress={() => setActiveResourceTab('resources')}
          >
            <Text style={[
              styles.tabButtonText,
              activeResourceTab === 'resources' && styles.tabButtonTextActive
            ]}>📚 Resources</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Content */}
        {activeResourceTab === 'faqs' ? (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <Text style={styles.sectionSubtitle}>
                Browse through our comprehensive FAQ section to find answers to common questions
              </Text>
            </View>

            {filteredFAQs.length === 0 ? (
              <View style={styles.enhancedEmptyState}>
                <Text style={styles.emptyEmoji}>❓</Text>
                <Text style={styles.emptyTitle}>No FAQs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search terms or category filter.
                </Text>
              </View>
            ) : (
              <View style={styles.faqList}>
                {filteredFAQs.map((faq, index) => (
                  <View key={faq.id} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqQuestion}
                      onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <View style={styles.faqQuestionHeader}>
                        <View style={styles.faqIcon}>
                          <Text style={styles.faqIconText}>
                            {getCategoryIcon(faq.category)}
                          </Text>
                        </View>
                        <View style={styles.faqQuestionContent}>
                          <View style={styles.faqCategory}>
                            <Text style={styles.faqCategoryText}>{faq.category}</Text>
                          </View>
                          <Text style={styles.faqQuestionText}>{faq.question}</Text>
                        </View>
                        <Text style={styles.expandIcon}>
                          {expandedFAQ === faq.id ? '-' : '+'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {expandedFAQ === faq.id && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Resources & Documents</Text>
              <Text style={styles.sectionSubtitle}>
                Download helpful resources, guidelines, and documents for addiction recovery
              </Text>
            </View>

            <View style={styles.resourcesGrid}>
              {resourcesData.map((resource, index) => (
                <TouchableOpacity key={resource.id} style={styles.resourceCard}>
                  <View style={styles.resourceHeader}>
                    <View style={styles.resourceIcon}>
                      <Text style={styles.resourceIconText}>📄</Text>
                    </View>
                    <View style={styles.resourceContent}>
                      <View style={styles.resourceCategory}>
                        <Text style={styles.resourceCategoryText}>{resource.category}</Text>
                      </View>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                    </View>
                    <View style={styles.resourceTypeBadge}>
                      <Text style={styles.resourceTypeText}>{resource.type}</Text>
                    </View>
                  </View>

                  <Text style={styles.resourceDescription}>{resource.description}</Text>

                  <TouchableOpacity style={styles.resourceButton}>
                    <Text style={styles.resourceButtonText}>
                      {resource.type === 'Link' ? '🔗 Visit Resource' : '📥 Download'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
                Our trained professionals are ready to help.
              </Text>
              <TouchableOpacity style={styles.emergencyButton}>
                <Text style={styles.emergencyButtonText}>📞 Call 1800-XXX-XXXX</Text>
              </TouchableOpacity>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyInfoText}>Available 24/7 • Confidential Support</Text>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Enhanced Header Styles
  enhancedHeader: {
    backgroundColor: '#003366',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 20,
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
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#003366',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 20,
  },
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

  // Enhanced Empty State
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

  // FAQ Styles
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  faqQuestion: {
    padding: 16,
  },
  faqQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  faqIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#00336610',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  faqIconText: {
    fontSize: 20,
  },
  faqQuestionContent: {
    flex: 1,
  },
  faqCategory: {
    marginBottom: 4,
  },
  faqCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003366',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6C757D',
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F8F9FA',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },

  // Resources Styles
  resourcesGrid: {
    gap: 16,
  },
  resourceCard: {
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
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resourceIconText: {
    fontSize: 20,
  },
  resourceContent: {
    flex: 1,
  },
  resourceCategory: {
    marginBottom: 4,
  },
  resourceCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  resourceTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#D4EDDA',
  },
  resourceTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#155724',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  resourceButton: {
    backgroundColor: '#003366',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resourceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Emergency Section
  emergencySection: {
    marginHorizontal: 20,
    marginTop: 20,
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

  footerSpacer: {
    height: 20,
  },
});
