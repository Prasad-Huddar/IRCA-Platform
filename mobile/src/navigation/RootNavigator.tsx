import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import TrackerScreen from '../screens/TrackerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FacilityDetailScreen from '../screens/FacilityDetailScreen';
import IRCACentersScreen from '../screens/IRCACentersScreen';
import IRCADropdownScreen from '../screens/IRCADropdownScreen';
import HelpLineScreen from '../screens/HelpLineScreen';
import HospitalsScreen from '../screens/HospitalsScreen';
import PsychiatryScreen from '../screens/PsychiatryScreen';
import FAQScreen from '../screens/FAQScreen';
import ContactScreen from '../screens/ContactScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AvoidanceScreen from '../screens/AvoidanceScreen';
import IRCACenterDetailScreen from '../screens/IRCACenterDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  FacilityDetail: {
    facilityId: string;
    facilityType: 'irca' | 'hospital' | 'psychiatrist';
    facilityName: string;
  };
  IRCACenters: undefined;
  Hospitals: undefined;
  Psychiatry: undefined;
  FAQ: undefined;
  Tracker: undefined;
  IRCANavigation: undefined;
  IRCACenterDetail: {
    centerId: string;
    centerName: string;
  };
  HospitalsNavigation: undefined;
  PsychiatristsNavigation: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Helpline: undefined;
  Events: undefined;
  Avoidance: undefined;
  Contact: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens
function FeedbackScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Feedback</Text>
      <Text style={{ fontSize: 14, color: '#6C757D' }}>Screen scaffolded. Next we'll port the Feedback page.</Text>
      <Text style={{ fontSize: 14, color: '#6C757D' }}>This is a new line of text.</Text>
    </View>
  );
}

function MainTabs({ navigation }: { navigation: any }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        }
      ]
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: '#6C757D',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E9ECEF' },
        headerStyle: { backgroundColor: '#003366' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: isAuthenticated ? `Hello, ${user?.first_name || 'User'}` : 'Hello, User',
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 15 }}>
              {isAuthenticated ? (
                <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                  <FontAwesome name="sign-out" size={18} color="#FFFFFF" />
                  <Text style={styles.headerButtonText}>Logout</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.headerButton}>
                    <FontAwesome name="sign-in" size={18} color="#FFFFFF" />
                    <Text style={styles.headerButtonText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.headerButton}>
                    <FontAwesome name="user-plus" size={18} color="#FFFFFF" />
                    <Text style={styles.headerButtonText}>Register</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Helpline" component={HelpLineScreen}
        options={{
          title: 'Helpline',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="phone-square" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: { backgroundColor: '#003366' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <Tab.Screen name="Events" component={EventsScreen}
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Avoidance" component={AvoidanceScreen}
        options={{
          title: 'Avoidance',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="shield" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Contact" component={ContactScreen}
        options={{
          title: 'Contact',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="phone" size={size} color={color} />
          ),
        }}
      />
      {isAuthenticated && (
        <Tab.Screen name="Profile" component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          headerStyle: { backgroundColor: '#003366' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <Stack.Screen
        name="FacilityDetail"
        component={FacilityDetailScreen}
        options={{
          headerShown: true,
          title: 'Facility Details',
          headerStyle: { backgroundColor: '#003366' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <Stack.Screen
        name="IRCACenters"
        component={IRCACentersScreen}
        options={{
          headerShown: false, // Header is handled in the tab navigator
        }}
      />
      <Stack.Screen
        name="Hospitals"
        component={HospitalsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Psychiatry"
        component={PsychiatryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Tracker"
        component={TrackerScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="IRCANavigation"
        component={IRCADropdownScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="IRCACenterDetail"
        component={IRCACenterDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HospitalsNavigation"
        component={HospitalsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PsychiatristsNavigation"
        component={PsychiatryScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Styles for auth screens
const styles = StyleSheet.create({
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    padding: 24,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  authForm: {
    width: '100%',
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#003366',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: '600',
  },
  switchAuthText: {
    color: '#003366',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
});
