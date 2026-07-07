/**
 * ============================================================================
 * Form Components - IRCA Platform Mobile
 * ============================================================================
 * Custom form components for react-hook-form integration
 * ============================================================================
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Control, Controller, FieldPath, FieldValues, FormState } from 'react-hook-form';

// ============================================================================
// Form Props Interfaces
// ============================================================================

interface FormProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  render: (field: {
    field: any;
    fieldState: {
      error?: {
        message?: string;
      };
    };
  }) => React.ReactElement;
}

interface FormControlProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface FormItemProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface FormLabelProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

interface FormMessageProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

interface FormDescriptionProps {
  children?: React.ReactNode;
  style?: TextStyle;
  className?: string;
}

// ============================================================================
// Form Components
// ============================================================================

export const Form: React.FC<FormProps> = ({ children, style, className }) => {
  const getFormStyle = (): ViewStyle => {
    return {
      ...style,
    };
  };

  return <View style={getFormStyle()}>{children}</View>;
};

export const FormField = <T extends FieldValues>({
  control,
  name,
  render
}: FormFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={render}
    />
  );
};

export const FormControl: React.FC<FormControlProps> = ({ children, style, className }) => {
  const getControlStyle = (): ViewStyle => {
    return {
      ...style,
    };
  };

  return <View style={getControlStyle()}>{children}</View>;
};

export const FormItem: React.FC<FormItemProps> = ({ children, style, className }) => {
  const getItemStyle = (): ViewStyle => {
    return {
      marginBottom: 16,
      ...style,
    };
  };

  return <View style={getItemStyle()}>{children}</View>;
};

export const FormLabel: React.FC<FormLabelProps> = ({ children, style, className }) => {
  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 6,
      ...style,
    };
  };

  return <Text style={getLabelStyle()}>{children}</Text>;
};

export const FormMessage: React.FC<FormMessageProps> = ({ children, style, className }) => {
  const getMessageStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 4,
      ...style,
    };
  };

  if (!children) return null;

  return <Text style={getMessageStyle()}>{children}</Text>;
};

export const FormDescription: React.FC<FormDescriptionProps> = ({ children, style, className }) => {
  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 4,
      ...style,
    };
  };

  if (!children) return null;

  return <Text style={getDescriptionStyle()}>{children}</Text>;
};

// ============================================================================
// Form Field Wrapper Component
// ============================================================================

interface FormFieldWrapperProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  children: (field: any) => React.ReactNode;
  style?: ViewStyle;
}

export const FormFieldWrapper = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  children,
  style
}: FormFieldWrapperProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem style={style}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {children(field)}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Form;
