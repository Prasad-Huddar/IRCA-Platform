/**
 * ============================================================================
 * Login Page - IRCA Platform
 * ============================================================================
 * User login page with form validation, security features, and accessibility
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { LoginSchema } from '../services/authService';
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
import { Eye, EyeOff, AlertCircle, Shield, Lock, Mail, HelpCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Form setup with Zod validation
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false
    }
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      const result = await login(data);
      if (result.success) {
        // Login successful, redirect to home
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0 animate-fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 p-2">
              <img src="/src/images/kargovlogo2.png" alt="IRCA Karnataka Logo" className="w-full h-full object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your IRCA Karnataka account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          autoComplete="email"
                        />
                      </FormControl>
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
                      <div className="flex justify-between items-center">
                        <FormLabel>
                          <Lock className="inline w-4 h-4 mr-2" /> Password
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            {...field}
                            disabled={isLoading}
                            className="bg-background pr-10"
                            autoComplete="current-password"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember Me */}
                <FormField
                  control={form.control}
                  name="remember_me"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          aria-label="Remember me"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          Remember me for 30 days
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Only use this on your personal device
                        </FormDescription>
                      </div>
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
                      <span className="animate-spin mr-2">🔄</span> Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Alternative Login Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full hover:bg-secondary/50 transition-all duration-300"
                disabled={true} // Would be enabled in full implementation
              >
                <span className="text-red-500 mr-2">G</span> Google
              </Button>
              <Button
                variant="outline"
                className="w-full hover:bg-secondary/50 transition-all duration-300"
                disabled={true} // Would be enabled in full implementation
              >
                <span className="text-blue-600 mr-2">f</span> Facebook
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create account
              </Link>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground space-y-2">
              <div className="flex items-center">
                <HelpCircle className="w-3 h-3 mr-2 text-primary" />
                <span>Having trouble signing in?</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-2 text-primary" />
                <span>Contact support: support@irca.karnataka.gov.in</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-3 h-3 mr-2 text-primary" />
                <span>Phone: 1800-XXX-XXXX (24/7)</span>
              </div>
            </div>

            {/* Security Information */}
            <div className="mt-4 p-3 bg-background border border-border rounded-lg text-xs text-muted-foreground space-y-1">
              <div className="flex items-center font-semibold text-primary">
                <Shield className="w-3 h-3 mr-2" />
                <span>Security Information</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Your session is encrypted with TLS 1.3</li>
                <li>We use government-grade security standards</li>
                <li>Automatic logout after 30 minutes of inactivity</li>
                <li>Multi-factor authentication available</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;