import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';
import { StarRating } from '../common/StarRating';

interface ReviewModalProps {
  vehicle: Vehicle | null;
  visible: boolean;
  onClose: () => void;
  bookingId?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  vehicle,
  visible,
  onClose,
  bookingId,
}) => {
  const { addReview } = useApp();

  const [rating, setRating] = useState(5);
  const [conditionRating, setConditionRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('Alexander Hayes');

  if (!vehicle) return null;

  const handleSubmit = () => {
    if (!comment.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please add a comment about your rental experience.');
      } else {
        Alert.alert('Comment Required', 'Please share details about your experience.');
      }
      return;
    }

    addReview({
      bookingId,
      vehicleId: vehicle.id,
      showroomId: vehicle.showroomId,
      customerName,
      customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating,
      conditionRating,
      serviceRating,
      cleanlinessRating,
      comment,
      verifiedRental: true,
    });

    onClose();
    if (Platform.OS === 'web') {
      window.alert('Thank you! Your verified review has been published.');
    } else {
      Alert.alert('Review Submitted', 'Thank you! Your verified review has been published.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate & Review</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.carHeader}>
            <Text style={styles.carTitle}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={styles.showroomSubtitle}>
              Rented from {vehicle.showroomName}
            </Text>
          </View>

          {/* Overall Stars */}
          <View style={styles.overallRatingCard}>
            <Text style={styles.overallRatingLabel}>Overall Experience</Text>
            <StarRating
              rating={rating}
              size={32}
              interactive
              onRatingChange={setRating}
            />
            <Text style={styles.ratingDescriptor}>
              {rating === 5 ? 'Exceptional Experience' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Could be better'}
            </Text>
          </View>

          {/* Multi-Criteria Ratings */}
          <View style={styles.criteriaContainer}>
            <Text style={styles.criteriaSectionTitle}>Detailed Rating Criteria</Text>

            <View style={styles.criteriaRow}>
              <View>
                <Text style={styles.criteriaLabel}>Vehicle Condition</Text>
                <Text style={styles.criteriaSub}>Mechanical & exterior state</Text>
              </View>
              <StarRating
                rating={conditionRating}
                size={18}
                interactive
                onRatingChange={setConditionRating}
              />
            </View>

            <View style={styles.criteriaRow}>
              <View>
                <Text style={styles.criteriaLabel}>Cleanliness</Text>
                <Text style={styles.criteriaSub}>Sanitization and interior feel</Text>
              </View>
              <StarRating
                rating={cleanlinessRating}
                size={18}
                interactive
                onRatingChange={setCleanlinessRating}
              />
            </View>

            <View style={styles.criteriaRow}>
              <View>
                <Text style={styles.criteriaLabel}>Showroom Service</Text>
                <Text style={styles.criteriaSub}>Staff handover, speed, and courtesy</Text>
              </View>
              <StarRating
                rating={serviceRating}
                size={18}
                interactive
                onRatingChange={setServiceRating}
              />
            </View>
          </View>

          {/* Written Feedback */}
          <View style={styles.feedbackSection}>
            <Text style={styles.inputLabel}>Your Written Review</Text>
            <TextInput
              style={styles.textArea}
              placeholder="How was the drive? Mention vehicle handling, fuel economy, and customer service..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
          </View>

          <View style={styles.feedbackSection}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.textInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Your full name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Publish Verified Review</Text>
            <Ionicons name="send" size={16} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  carHeader: {
    marginBottom: Spacing.md,
  },
  carTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  showroomSubtitle: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.primary,
    marginTop: 2,
  },
  overallRatingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  overallRatingLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  ratingDescriptor: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
  },
  criteriaContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: 14,
  },
  criteriaSectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  criteriaLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  criteriaSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  feedbackSection: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.textInverse,
  },
});
