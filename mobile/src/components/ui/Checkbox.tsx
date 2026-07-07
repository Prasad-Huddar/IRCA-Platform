/**
 * ============================================================================
 * Checkbox Component - IRCA Platform Mobile
 * ============================================================================
 * Custom checkbox component with proper styling and accessibility
 * ============================================================================
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ============================================================================
// Checkbox Props Interface
// ============================================================================

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  containerStyle?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  className?: string;
}

// ============================================================================
// Checkbox Component
// ============================================================================

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  containerStyle,
  checkboxStyle,
  labelStyle,
  descriptionStyle,
  className
}) => {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      opacity: disabled ? 0.5 : 1,
      ...containerStyle,
    };
  };

  const getCheckboxStyle = (): ViewStyle => {
    return {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: checked ? '#3b82f6' : '#d1d5db',
      backgroundColor: checked ? '#3b82f6' : '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 2,
      ...checkboxStyle,
    };
  };

  const getCheckmarkStyle = (): ViewStyle => {
    return {
      width: 12,
      height: 12,
      borderRadius: 2,
      backgroundColor: '#ffffff',
    };
  };

  const getTextContainerStyle = (): ViewStyle => {
    return {
      flex: 1,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 16,
      color: '#374151',
      fontWeight: '500',
      marginBottom: description ? 4 : 0,
      ...labelStyle,
    };
  };

  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#6b7280',
      lineHeight: 16,
      ...descriptionStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={getCheckboxStyle()}>
        {checked && <View style={getCheckmarkStyle()} />}
      </View>
      
      {(label || description) && (
        <View style={getTextContainerStyle()}>
          {label && (
            <Text style={getLabelStyle()}>
              {label}
            </Text>
          )}
          {description && (
            <Text style={getDescriptionStyle()}>
              {description}
            </Text>
          )}
        </View>
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

export default Checkbox;
