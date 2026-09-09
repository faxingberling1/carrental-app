import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Typography } from '../ui/Theme';
import { VehicleStatus } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: VehicleStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  status,
  size = 'md',
  style,
}) => {
  let backgroundColor: string = Colors.surfaceHover;
  let textColor: string = Colors.textSecondary;
  let borderColor: string = Colors.border;

  // Auto-map vehicle status
  if (status) {
    switch (status) {
      case 'available':
        backgroundColor = 'rgba(16, 185, 129, 0.15)';
        textColor = Colors.success;
        borderColor = 'rgba(16, 185, 129, 0.3)';
        break;
      case 'rented':
        backgroundColor = 'rgba(6, 182, 212, 0.15)';
        textColor = Colors.secondary;
        borderColor = 'rgba(6, 182, 212, 0.3)';
        break;
      case 'maintenance':
        backgroundColor = 'rgba(239, 68, 68, 0.15)';
        textColor = Colors.danger;
        borderColor = 'rgba(239, 68, 68, 0.3)';
        break;
      case 'reserved':
        backgroundColor = 'rgba(245, 158, 11, 0.15)';
        textColor = Colors.primary;
        borderColor = 'rgba(245, 158, 11, 0.3)';
        break;
    }
  } else {
    switch (variant) {
      case 'primary':
        backgroundColor = Colors.primaryGlow;
        textColor = Colors.primary;
        borderColor = 'rgba(245, 158, 11, 0.3)';
        break;
      case 'success':
        backgroundColor = Colors.successGlow;
        textColor = Colors.success;
        borderColor = 'rgba(16, 185, 129, 0.3)';
        break;
      case 'warning':
        backgroundColor = 'rgba(245, 158, 11, 0.15)';
        textColor = Colors.warning;
        borderColor = 'rgba(245, 158, 11, 0.3)';
        break;
      case 'danger':
        backgroundColor = Colors.dangerGlow;
        textColor = Colors.danger;
        borderColor = 'rgba(239, 68, 68, 0.3)';
        break;
      case 'info':
        backgroundColor = Colors.secondaryGlow;
        textColor = Colors.secondary;
        borderColor = 'rgba(6, 182, 212, 0.3)';
        break;
    }
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderColor,
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: textColor,
            fontSize: isSmall ? Typography.sizes.xs - 1 : Typography.sizes.xs,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
