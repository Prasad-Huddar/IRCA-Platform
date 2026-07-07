/**
 * ============================================================================
 * Button Component - IRCA Platform Mobile
 * ============================================================================
 * Custom button component with multiple variants and sizes
 * ============================================================================
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

// ============================================================================
// Button Props Interface
// ============================================================================

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

// ============================================================================
// Button Component
// ============================================================================

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
  className
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      default: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
      },
      sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 36,
      },
      lg: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 56,
      },
      icon: {
        padding: 8,
        minHeight: 40,
        minWidth: 40,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: '#3b82f6',
      },
      destructive: {
        backgroundColor: '#ef4444',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#d1d5db',
      },
      secondary: {
        backgroundColor: '#f3f4f6',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      link: {
        backgroundColor: 'transparent',
        padding: 0,
        minHeight: 'auto',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.5 : 1,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      default: {
        fontSize: 16,
        lineHeight: 24,
      },
      sm: {
        fontSize: 14,
        lineHeight: 20,
      },
      lg: {
        fontSize: 18,
        lineHeight: 28,
      },
      icon: {
        fontSize: 16,
        lineHeight: 24,
      },
    };

    // Variant text styles
    const variantTextStyles: Record<string, TextStyle> = {
      default: {
        color: '#ffffff',
      },
      destructive: {
        color: '#ffffff',
      },
      outline: {
        color: '#374151',
      },
      secondary: {
        color: '#374151',
      },
      ghost: {
        color: '#374151',
      },
      link: {
        color: '#3b82f6',
        textDecorationLine: 'underline',
      },
    };

    return {
      ...baseStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' || variant === 'ghost' ? '#374151' : '#ffffff'}
        />
      ) : (
        <Text style={getTextStyle()}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Button;
