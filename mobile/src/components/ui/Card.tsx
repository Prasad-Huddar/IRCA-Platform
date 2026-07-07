/**
 * ============================================================================
 * Card Component - IRCA Platform Mobile
 * ============================================================================
 * Custom card component with header, content, and footer sections
 * ============================================================================
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ============================================================================
// Card Props Interface
// ============================================================================

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface CardHeaderProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface CardTitleProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

interface CardDescriptionProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

interface CardContentProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface CardFooterProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

// ============================================================================
// Card Components
// ============================================================================

export const Card: React.FC<CardProps> = ({ children, style, className }) => {
  const getCardStyle = (): ViewStyle => {
    return {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      margin: 16,
      overflow: 'hidden',
      ...style,
    };
  };

  return <View style={getCardStyle()}>{children}</View>;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style, className }) => {
  const getHeaderStyle = (): ViewStyle => {
    return {
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
      ...style,
    };
  };

  return <View style={getHeaderStyle()}>{children}</View>;
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, style, className }) => {
  const getTitleStyle = (): TextStyle => {
    return {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      textAlign: 'center',
      marginBottom: 4,
      ...style,
    };
  };

  return <Text style={getTitleStyle()}>{children}</Text>;
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style, className }) => {
  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: 14,
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 20,
      ...style,
    };
  };

  return <Text style={getDescriptionStyle()}>{children}</Text>;
};

export const CardContent: React.FC<CardContentProps> = ({ children, style, className }) => {
  const getContentStyle = (): ViewStyle => {
    return {
      padding: 20,
      ...style,
    };
  };

  return <View style={getContentStyle()}>{children}</View>;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, style, className }) => {
  const getFooterStyle = (): ViewStyle => {
    return {
      padding: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      ...style,
    };
  };

  return <View style={getFooterStyle()}>{children}</View>;
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Card;
