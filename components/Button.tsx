import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon
}) => {
  const buttonStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const textStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle(),
        disabled && styles.disabledButton,
        fullWidth && styles.fullWidth
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={type === 'secondary' ? '#7048e8' : 'white'} />
      ) : (
        <>
          {icon && <Text style={styles.iconContainer}>{icon}</Text>}
          <Text style={textStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#7048e8',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7048e8',
  },
  dangerButton: {
    backgroundColor: '#e53935',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryText: {
    color: '#7048e8',
    fontSize: 16,
    fontWeight: '500',
  },
  fullWidth: {
    width: '100%',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;