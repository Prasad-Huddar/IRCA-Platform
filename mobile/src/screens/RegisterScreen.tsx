/**
 * ============================================================================
 * Register Screen - IRCA Platform Mobile
 * ============================================================================
 * Ultra-compact registration screen with Expo icons and centered card layout
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RegisterSchema } from '../services/authService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen: React.FC = () => {
  const { register, error, isLoading } = useAuth();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Collapsed password requirements state
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      terms_accepted: false
    }
  });

  const password = watch('password');

  React.useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  }, [password]);

  const onSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    try {
      const result = await register(data);
      if (result.success) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthLevel = strengthScore >= 5 ? 'Strong' : strengthScore >= 3 ? 'Medium' : 'Weak';
  const strengthColor = strengthScore >= 5 ? '#10B981' : strengthScore >= 3 ? '#F59E0B' : '#EF4444';

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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>IRCA Karnataka Citizen Services</Text>
            </View>
          </View>

          {/* Error Alert */}
          {error && (
            <View style={styles.errorAlert}>
              <FontAwesome name="exclamation-circle" size={12} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Name Fields Row - Compact */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={12} color="#6B7280" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      editable={!isLoading}
                    />
                  )}
                />
              </View>
              {errors.first_name && <Text style={styles.fieldError}>{errors.first_name.message}</Text>}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="user" size={12} color="#6B7280" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      editable={!isLoading}
                    />
                  )}
                />
              </View>
              {errors.last_name && <Text style={styles.fieldError}>{errors.last_name.message}</Text>}
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
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
            {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="phone" size={14} color="#6B7280" style={styles.inputIcon} />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="9876543210"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                )}
              />
            </View>
            {errors.phone && <Text style={styles.fieldError}>{errors.phone.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Text style={[styles.strengthBadge, { color: strengthColor }]}>
                {password ? `(${strengthLevel})` : ''}
              </Text>
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={14} color="#6B7280" style={styles.inputIcon} />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Strong Password"
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
            {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

            {/* Minimal Password Rules Text */}
            <Text style={styles.rulesText}>
              8+ chars, A-Z, a-z, 0-9, special char
            </Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={14} color="#6B7280" style={styles.inputIcon} />
              <Controller
                control={control}
                name="confirm_password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                )}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showConfirmPassword ? 'eye-slash' : 'eye'} size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {errors.confirm_password && <Text style={styles.fieldError}>{errors.confirm_password.message}</Text>}
          </View>

          {/* Terms */}
          <Controller
            control={control}
            name="terms_accepted"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity onPress={() => onChange(!value)} style={styles.termsRow} activeOpacity={0.7}>
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value && <FontAwesome name="check" size={10} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText} numberOfLines={2}>
                  I agree to <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.terms_accepted && <Text style={styles.fieldError}>{errors.terms_accepted.message}</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Wait...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Footer Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} style={styles.footer}>
            <Text style={styles.footerText}>Have an account? <Text style={styles.footerLink}>Login</Text></Text>
          </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  field: {
    marginBottom: 10,
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
  rulesText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  strengthBadge: {
    fontSize: 10,
    fontWeight: '700',
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
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
  },
  link: {
    color: '#003366',
    fontWeight: '700',
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
  fieldError: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 4,
    marginLeft: 2,
  },
});

export default RegisterScreen;
