/**
 * ============================================================================
 * Login Screen - IRCA Platform Mobile
 * ============================================================================
 * Ultra-compact login screen with Expo icons and centered card layout
 * Matches RegisterScreen design
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginSchema } from '../services/authService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false
    }
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      const result = await login(data.email, data.password, data.remember_me);
      if (result.success) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Coming Soon',
      'Password reset functionality will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/kargovlogo2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to IRCA Karnataka</Text>
            </View>
          </View>

          {/* Error Alert */}
          {error && (
            <View style={styles.errorAlert}>
              <FontAwesome name="exclamation-circle" size={12} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope" size={12} color="#6B7280" style={styles.inputIcon} />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                )}
              />
            </View>
            {errors.email && (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={14} color="#6B7280" style={styles.inputIcon} />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                )}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            )}
          </View>

          {/* Remember Me */}
          <Controller
            control={control}
            name="remember_me"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity onPress={() => onChange(!value)} style={styles.termsRow} activeOpacity={0.7}>
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value && <FontAwesome name="check" size={10} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText} numberOfLines={1}>
                  Remember me for 30 days
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Footer Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)} style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? <Text style={styles.footerLink}>Create</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>Contact Support: 1800-XXX-XXXX</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
    maxWidth: 360, // Limit width for centering
    alignSelf: 'center',
    // Theme Border / Shadow
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  forgotPasswordLink: {
    fontSize: 11,
    color: '#003366',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    height: 38, // Compact height
  },
  inputIcon: {
    marginLeft: 10,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#111827',
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#6B7280',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#003366',
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerLink: {
    color: '#003366',
    fontWeight: '700',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: '#DC2626',
  },
  supportContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  fieldError: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 4,
  }
});

export default LoginScreen;

