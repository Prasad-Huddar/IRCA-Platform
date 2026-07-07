/**
 * ============================================================================
 * Register Page - IRCA Platform
 * ============================================================================
 * User registration page with form validation, password security, and accessibility
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { RegisterSchema } from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info, Shield, Lock, User, Mail, Phone } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Form setup with Zod validation
  const form = useForm<z.infer<typeof RegisterSchema>>({
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

  // Watch password field for strength analysis
  const password = form.watch('password');

  // Analyze password strength
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
        // Registration and auto-login successful
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Calculate overall password strength score
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthLevel = strengthScore >= 5 ? 'strong' :
                       strengthScore >= 3 ? 'medium' : 'weak';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0 animate-fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 p-2">
              <img src="/src/images/kargovlogo2.png" alt="IRCA Karnataka Logo" className="w-full h-full object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join IRCA Karnataka to access personalized services and support
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Registration Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <User className="inline w-4 h-4 mr-2" /> First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                            disabled={isLoading}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <User className="inline w-4 h-4 mr-2" /> Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                            disabled={isLoading}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Mail className="inline w-4 h-4 mr-2" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          disabled={isLoading}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormDescription>
                        We'll never share your email with anyone else
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Phone className="inline w-4 h-4 mr-2" /> Phone Number (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          {...field}
                          disabled={isLoading}
                          className="bg-background"
                        />
                      </FormControl>
                      <FormDescription>
                        For account recovery and notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Lock className="inline w-4 h-4 mr-2" /> Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            {...field}
                            disabled={isLoading}
                            className="bg-background pr-10"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>

                      {/* Password Strength Meter */}
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Password Strength</span>
                          <span className={`text-xs font-semibold ${
                            strengthLevel === 'strong' ? 'text-success' :
                            strengthLevel === 'medium' ? 'text-warning' : 'text-destructive'
                          }`}>
                            {strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)}
                          </span>
                        </div>

                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <div
                              key={item}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                item <= strengthScore
                                  ? strengthLevel === 'strong' ? 'bg-success' :
                                    strengthLevel === 'medium' ? 'bg-warning' : 'bg-destructive'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <div className={`flex items-center ${passwordStrength.length ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordStrength.length ? <CheckCircle className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                            At least 8 characters
                          </div>
                          <div className={`flex items-center ${passwordStrength.uppercase ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordStrength.uppercase ? <CheckCircle className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                            Contains uppercase letter
                          </div>
                          <div className={`flex items-center ${passwordStrength.lowercase ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordStrength.lowercase ? <CheckCircle className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                            Contains lowercase letter
                          </div>
                          <div className={`flex items-center ${passwordStrength.number ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordStrength.number ? <CheckCircle className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                            Contains number
                          </div>
                          <div className={`flex items-center ${passwordStrength.special ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordStrength.special ? <CheckCircle className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                            Contains special character
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Lock className="inline w-4 h-4 mr-2" /> Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            {...field}
                            disabled={isLoading}
                            className="bg-background pr-10"
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            aria-label="I accept the terms and conditions"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            I accept the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                          </FormLabel>
                          <FormDescription className="text-xs text-muted-foreground">
                            By creating an account, you agree to our terms of service and privacy policy
                          </FormDescription>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-lg transition-all duration-300"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">🔄</span> Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>

            {/* Security Information */}
            <div className="mt-6 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-2">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-2 text-primary" />
                <span>Your data is protected with end-to-end encryption</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-3 h-3 mr-2 text-primary" />
                <span>We follow strict government security standards</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-2 text-primary" />
                <span>We'll never ask for your password via email or phone</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;