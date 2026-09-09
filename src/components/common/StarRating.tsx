import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../ui/Theme';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showCount?: boolean;
  totalReviews?: number;
  textColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 14,
  interactive = false,
  onRatingChange,
  showCount = false,
  totalReviews,
  textColor = Colors.textSecondary,
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalf = !isFilled && i - 0.5 <= rating;

    const iconName = isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline';

    const starComponent = (
      <Ionicons
        key={i}
        name={iconName}
        size={size}
        color={isFilled || isHalf ? Colors.primary : Colors.textMuted}
        style={{ marginRight: 2 }}
      />
    );

    if (interactive && onRatingChange) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => onRatingChange(i)} activeOpacity={0.7}>
          {starComponent}
        </TouchableOpacity>
      );
    } else {
      stars.push(starComponent);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>{stars}</View>
      {showCount && (
        <Text style={[styles.ratingText, { color: textColor, fontSize: size * 0.9 }]}>
          {rating.toFixed(1)}{' '}
          {totalReviews !== undefined && (
            <Text style={{ color: Colors.textMuted }}>({totalReviews})</Text>
          )}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 6,
    fontWeight: '700',
  },
});
