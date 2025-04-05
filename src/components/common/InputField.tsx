import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface InputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: object;
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  rightIcon,
  onRightIconPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        multiline ? styles.multilineContainer : null
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          style={[
            styles.input,
            multiline ? styles.multilineInput : null
          ]}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...globalStyles.bodyText,
    marginBottom: 8,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.darkBlue,
    borderRadius: 8,
    backgroundColor: colors.deepBlack + '80', // 50% opacity
    paddingHorizontal: 12,
  },
  input: {
    ...globalStyles.bodyText,
    flex: 1,
    height: 48,
    color: colors.textPrimary,
  },
  multilineContainer: {
    minHeight: 100,
    paddingVertical: 8,
  },
  multilineInput: {
    height: undefined,
    textAlignVertical: 'top',
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...globalStyles.captionText,
    color: colors.error,
    marginTop: 4,
  },
});

export default InputField;
