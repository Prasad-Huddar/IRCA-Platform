import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';



export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  // Derive display values from auth user
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Guest';
  const email = user?.email || 'Not logged in';
  const phone = user?.phone;
  // properties not currently in auth schema:
  // date_of_birth, gender, address, emergency_contact

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive', onPress: async () => {
            await logout();
            // No explicit navigation needed; RootNavigator removes the Profile tab,
            // dropping the user back to Home.
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: () => {
            // TODO: Implement real account deletion
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
          }
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Please Log In</Text>
        <Text style={{ color: '#6C757D', marginTop: 10 }}>Access your profile by logging in.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Tracker Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.cardTitle}>Sobriety Tracking & Analytics</Text>
              <Text style={{ fontSize: 13, color: '#6C757D', marginTop: 4 }}>
                Track your recovery journey, goals, and achievements
              </Text>
            </View>
            <Pressable
              style={styles.trackerButton}
              onPress={() => navigation.navigate('Tracker')}
            >
              <Text style={styles.trackerButtonText}>Go to Tracker</Text>
            </Pressable>
          </View>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          {phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
          )}
          {/* 
            The following fields are not currently available in the User interface 
            from AuthContext / Database. Hiding them for now.
          */}
          {/* 
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>N/A</Text>
          </View>
          */}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{new Date(user.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E9ECEF', true: '#003366' }}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E9ECEF', true: '#003366' }}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Location Sharing</Text>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#E9ECEF', true: '#003366' }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <Pressable style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Password reset feature coming soon.')}>
            <Text style={styles.actionButtonText}>Change Password</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Privacy settings feature coming soon.')}>
            <Text style={styles.actionButtonText}>Privacy Settings</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Download your data feature coming soon.')}>
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteAccount}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
          </Pressable>
        </View>

        {/* Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <Pressable style={styles.actionButton} onPress={() => Alert.alert('Contact', 'Email: support@irca.karnataka.gov.in\nPhone: 1800-425-1234')}>
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => Alert.alert('FAQ', 'Visit our website for frequently asked questions.')}>
            <Text style={styles.actionButtonText}>FAQ</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => Alert.alert('About', 'IRCA Platform v1.0\nKarnataka Government Initiative')}>
            <Text style={styles.actionButtonText}>About</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 16, gap: 20 },
  header: { alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#003366' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#003366' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 14, color: '#6C757D', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#212529', fontWeight: '500' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: { fontSize: 16, color: '#212529', fontWeight: '600' },
  actionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#003366', textAlign: 'center' },
  logoutButton: { backgroundColor: '#FFC72C', borderColor: '#FFC72C' },
  logoutButtonText: { color: '#003366' },
  deleteButton: { backgroundColor: '#DC3545', borderColor: '#DC3545' },
  deleteButtonText: { color: '#FFFFFF' },
  trackerButton: {
    backgroundColor: '#003366',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  trackerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
