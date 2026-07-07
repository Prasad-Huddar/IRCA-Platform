/**
 * ============================================================================
 * Input Component - IRCA Platform Mobile
 * ============================================================================
 * Custom input component with various input types and styling
 * ============================================================================
 */

import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';

// ============================================================================
// Input Props Interface
// ============================================================================

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  description?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

// ============================================================================
// Input Component
// ============================================================================

export const Input: React.FC<InputProps> = ({
  label,
  error,
  description,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  descriptionStyle,
  leftIcon,
  rightIcon,
  className,
  style,
  ...textInputProps
}) => {
  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      borderWidth: 1,
      borderColor: error ? '#ef4444' : '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    };

    return {
      ...baseStyle,
      paddingLeft: leftIcon ? 44 : 12,
      paddingRight: rightIcon ? 44 : 12,
      ...(inputStyle as TextStyle),
      ...(style as TextStyle),
    };
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      marginBottom: 16,
      ...(containerStyle as ViewStyle),
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 6,
      ...(labelStyle as TextStyle),
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 4,
      ...(errorStyle as TextStyle),
    };
  };

  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 4,
      ...(descriptionStyle as TextStyle),
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={getLabelStyle()}>
          {label}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
          }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={getInputStyle()}
          placeholderTextColor="#9ca3af"
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
          }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={getErrorStyle()}>
          {error}
        </Text>
      )}
      
      {description && !error && (
        <Text style={getDescriptionStyle()}>
          {description}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Input;
