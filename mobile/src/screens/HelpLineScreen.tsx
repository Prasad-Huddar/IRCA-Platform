/**
 * ============================================================================
 * Help Line Screen - IRCA Platform Mobile
 * ============================================================================
 * Helpline page with IRCA centers, Hospitals, and Psychiatry options
 * Updated to use website's IRCA navigation logic
 * ============================================================================
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type HelpLineNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

// Simple icon components
const Icons = {
  Phone: () => <Text style={{ fontSize: 20 }}>📞</Text>,
  Hospital: () => <Text style={{ fontSize: 20 }}>🏥</Text>,
  Brain: () => <Text style={{ fontSize: 20 }}>🧠</Text>,
  Building: () => <Text style={{ fontSize: 20 }}>🏢</Text>,
};

export default function HelpLineScreen() {
  const navigation = useNavigation();

  const handleCall = (phone: string) => {
    Alert.alert(
      'Call Helpline',
      `Do you want to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  const navigateToHospitals = () => {
    (navigation as any).navigate('HospitalsNavigation');
  };

  const navigateToPsychiatry = () => {
    (navigation as any).navigate('PsychiatristsNavigation');
  };

  const navigateToIRCA = () => {
    (navigation as any).navigate('IRCANavigation');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icons.Phone />
        <Text style={styles.headerTitle}>Help Line</Text>
        <Text style={styles.headerSubtitle}>24/7 Emergency Support Services</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <Text style={styles.sectionSubtitle}>
            Get immediate help and support
          </Text>

          {/* IRCA Button - Website Logic */}
          <TouchableOpacity
            style={styles.ircaButton}
            onPress={navigateToIRCA}
          >
            <View style={styles.ircaButtonContent}>
              <View style={styles.ircaButtonLeft}>
                <View style={styles.ircaButtonIcon}>
                  <Icons.Building />
                </View>
                <View style={styles.ircaButtonText}>
                  <Text style={styles.ircaButtonTitle}>IRCA Centers</Text>
                  <Text style={styles.ircaButtonSubtitle}>
                    Browse rehabilitation centers by taluk
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Other Service Buttons */}
          <View style={styles.otherServicesContainer}>
            <TouchableOpacity style={styles.serviceButton} onPress={navigateToHospitals}>
              <View style={styles.serviceButtonIcon}>
                <Icons.Hospital />
              </View>
              <View style={styles.serviceButtonText}>
                <Text style={styles.serviceButtonTitle}>Hospitals</Text>
                <Text style={styles.serviceButtonSubtitle}>
                  Find nearby hospitals and emergency services
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceButton} onPress={navigateToPsychiatry}>
              <View style={styles.serviceButtonIcon}>
                <Icons.Brain />
              </View>
              <View style={styles.serviceButtonText}>
                <Text style={styles.serviceButtonTitle}>Psychiatry</Text>
                <Text style={styles.serviceButtonSubtitle}>
                  Access mental health and psychiatric services
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer to ensure proper separation */}
        <View style={styles.sectionSpacer} />

        {/* Emergency Contact Section */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Helpline</Text>
          <Text style={styles.emergencyNumber}>112</Text>
          <Text style={styles.emergencySubtitle}>National Emergency Number</Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => handleCall('112')}
          >
            <Icons.Phone />
            <Text style={styles.emergencyButtonText}>Call Emergency</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 50, // Account for status bar
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B3D9FF',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
    minHeight: '100%',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionSpacer: {
    height: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 16,
  },

  // IRCA Button Styles
  ircaButton: {
    backgroundColor: '#003366',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  ircaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ircaButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ircaButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ircaButtonText: {
    flex: 1,
  },
  ircaButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ircaButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },

  // Other Services Styles
  otherServicesContainer: {
    gap: 12,
  },
  serviceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceButtonText: {
    flex: 1,
  },
  serviceButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 4,
  },
  serviceButtonSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  emergencySection: {
    backgroundColor: '#FF4757',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emergencyNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#FFB3B3',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4757',
    marginLeft: 8,
  },
});
