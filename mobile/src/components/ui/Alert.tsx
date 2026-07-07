/**
 * ============================================================================
 * Alert Component - IRCA Platform Mobile
 * ============================================================================
 * Custom alert component for displaying important messages
 * ============================================================================
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ============================================================================
// Alert Props Interface
// ============================================================================

interface AlertProps {
  children?: React.ReactNode;
  variant?: 'default' | 'destructive';
  style?: ViewStyle;
  className?: string;
}

interface AlertTitleProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

interface AlertDescriptionProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

// ============================================================================
// Alert Components
// ============================================================================

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'default', 
  style, 
  className 
}) => {
  const getAlertStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: '#f0f9ff',
        borderWidth: 1,
        borderColor: '#bae6fd',
      },
      destructive: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  return <View style={getAlertStyle()}>{children}</View>;
};

export const AlertTitle: React.FC<AlertTitleProps> = ({ children, style, className }) => {
  const getTitleStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '600',
      color: '#991b1b',
      marginBottom: 2,
      flex: 1,
      ...style,
    };
  };

  return <Text style={getTitleStyle()}>{children}</Text>;
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, style, className }) => {
  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#7f1d1d',
      lineHeight: 16,
      flex: 1,
      ...style,
    };
  };

  return <Text style={getDescriptionStyle()}>{children}</Text>;
};

// ============================================================================
// Icon Components
// ============================================================================

interface AlertCircleProps {
  style?: ViewStyle;
  className?: string;
}

export const AlertCircle: React.FC<AlertCircleProps> = ({ style, className }) => {
  const getIconStyle = (): ViewStyle => {
    return {
      width: 16,
      height: 16,
      marginRight: 8,
      marginTop: 1,
      ...style,
    };
  };

  return (
    <View style={getIconStyle()}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#ef4444',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#ef4444',
          }}
        />
      </View>
    </View>
  );
};

// Alias for backward compatibility
export const AlertCircleIcon = AlertCircle;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Alert;
