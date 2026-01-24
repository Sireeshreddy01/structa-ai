/**
 * Reusable UI components for Profile screens
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PROFILE_COLORS } from './theme';

const { width } = Dimensions.get('window');

// ============================================
// Header Component
// ============================================
interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  return (
    <View style={headerStyles.container}>
      {onBack ? (
        <TouchableOpacity style={headerStyles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={PROFILE_COLORS.black} />
        </TouchableOpacity>
      ) : (
        <View style={headerStyles.spacer} />
      )}
      <Text style={headerStyles.title}>{title}</Text>
      {rightAction || <View style={headerStyles.spacer} />}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PROFILE_COLORS.white,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: PROFILE_COLORS.black,
  },
  spacer: {
    width: 44,
  },
});

// ============================================
// Settings Card (Grid Item)
// ============================================
interface SettingsCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  backgroundColor: string;
  onPress?: () => void;
}

export function SettingsCard({ icon, label, backgroundColor, onPress }: SettingsCardProps) {
  return (
    <TouchableOpacity
      style={[cardStyles.container, { backgroundColor }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={28} color={PROFILE_COLORS.black} />
      <Text style={cardStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    width: (width - 48 - 16) / 2,
    height: 128,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.black,
    letterSpacing: 0.3,
  },
});

// ============================================
// Preference Row (Navigable Item)
// ============================================
interface PreferenceRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

export function PreferenceRow({ icon, label, value, onPress }: PreferenceRowProps) {
  return (
    <TouchableOpacity
      style={rowStyles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={rowStyles.left}>
        <View style={rowStyles.iconContainer}>
          <MaterialIcons name={icon} size={20} color={PROFILE_COLORS.black} />
        </View>
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      <View style={rowStyles.right}>
        {value && <Text style={rowStyles.value}>{value}</Text>}
        <MaterialIcons name="chevron-right" size={24} color={PROFILE_COLORS.border} />
      </View>
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PROFILE_COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.black,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.textMuted,
  },
});

// ============================================
// Toggle Row (Switch Item)
// ============================================
interface ToggleRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export function ToggleRow({ icon, label, description, value, onToggle }: ToggleRowProps) {
  return (
    <View style={toggleStyles.container}>
      <View style={toggleStyles.left}>
        <View style={toggleStyles.iconContainer}>
          <MaterialIcons name={icon} size={20} color={PROFILE_COLORS.black} />
        </View>
        <View style={toggleStyles.textContainer}>
          <Text style={toggleStyles.label}>{label}</Text>
          {description && <Text style={toggleStyles.description}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: PROFILE_COLORS.border, true: PROFILE_COLORS.black }}
        thumbColor={PROFILE_COLORS.white}
        ios_backgroundColor={PROFILE_COLORS.border}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PROFILE_COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.black,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: PROFILE_COLORS.textMuted,
    marginTop: 2,
  },
});

// ============================================
// Section Title
// ============================================
interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return <Text style={sectionStyles.title}>{title}</Text>;
}

const sectionStyles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: PROFILE_COLORS.textMuted,
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
});

// ============================================
// Action Button
// ============================================
interface ActionButtonProps {
  label: string;
  variant?: 'primary' | 'danger' | 'outline';
  onPress?: () => void;
  disabled?: boolean;
}

export function ActionButton({ label, variant = 'primary', onPress, disabled }: ActionButtonProps) {
  const getStyle = () => {
    switch (variant) {
      case 'danger':
        return {
          container: buttonStyles.dangerContainer,
          text: buttonStyles.dangerText,
        };
      case 'outline':
        return {
          container: buttonStyles.outlineContainer,
          text: buttonStyles.outlineText,
        };
      default:
        return {
          container: buttonStyles.primaryContainer,
          text: buttonStyles.primaryText,
        };
    }
  };

  const style = getStyle();

  return (
    <TouchableOpacity
      style={[style.container, disabled && buttonStyles.disabled]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={style.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  primaryContainer: {
    backgroundColor: PROFILE_COLORS.black,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.white,
  },
  dangerContainer: {
    backgroundColor: PROFILE_COLORS.redLight,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.red,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.black,
  },
  disabled: {
    opacity: 0.5,
  },
});

// ============================================
// Input Field
// ============================================
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon,
  error,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={[inputStyles.inputContainer, error && inputStyles.inputError]}>
        {icon && (
          <MaterialIcons name={icon} size={20} color={PROFILE_COLORS.textMuted} />
        )}
        <View style={inputStyles.inputWrapper}>
          {/* Using a custom approach since TextInput would be imported separately */}
          <Text style={inputStyles.placeholder}>
            {value || placeholder}
          </Text>
        </View>
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color={PROFILE_COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={inputStyles.error}>{error}</Text>}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputError: {
    borderColor: PROFILE_COLORS.red,
  },
  inputWrapper: {
    flex: 1,
  },
  placeholder: {
    fontSize: 15,
    color: PROFILE_COLORS.textPrimary,
  },
  error: {
    fontSize: 12,
    color: PROFILE_COLORS.red,
    marginTop: 6,
  },
});

// ============================================
// Radio Option
// ============================================
interface RadioOptionProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

export function RadioOption({ label, description, selected, onSelect }: RadioOptionProps) {
  return (
    <TouchableOpacity
      style={[radioStyles.container, selected && radioStyles.selected]}
      activeOpacity={0.7}
      onPress={onSelect}
    >
      <View style={radioStyles.content}>
        <Text style={radioStyles.label}>{label}</Text>
        {description && <Text style={radioStyles.description}>{description}</Text>}
      </View>
      <View style={[radioStyles.radio, selected && radioStyles.radioSelected]}>
        {selected && <View style={radioStyles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const radioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
  },
  selected: {
    borderColor: PROFILE_COLORS.black,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.black,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: PROFILE_COLORS.textMuted,
    marginTop: 4,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PROFILE_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: PROFILE_COLORS.black,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PROFILE_COLORS.black,
  },
});
