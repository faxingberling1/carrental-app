import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

interface DriverProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentUser, userRole, currentShowroom } = useApp();

  const dl = currentUser?.driverLicenseInfo || {
    licenseNumber: currentUser?.driverLicenseNumber || 'DL-9088214-B',
    expiryDate: '2029-10-18',
    issueCountry: 'California, USA',
    licenseClass: 'Class C (Passenger & Sport GT)',
    status: 'verified' as const,
    digitalCardId: 'VR-DL-448109',
    dateOfBirth: '1992-06-14',
    emergencyContact: '+1 (555) 902-1144 (Sarah Hayes)',
    nationality: 'United States',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {userRole === 'customer' ? 'Driver Profile & License' : 'Dealership Profile'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {userRole === 'customer' ? (
            <>
              {/* Luxury Digital Driver License Card */}
              <View style={styles.licenseCard}>
                <View style={styles.licenseCardOverlay} />
                
                {/* License Card Top */}
                <View style={styles.licenseTopRow}>
                  <View style={styles.licenseStateBox}>
                    <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
                    <Text style={styles.licenseStateText}>{dl.issueCountry.toUpperCase()}</Text>
                  </View>
                  <View style={styles.verifiedChip}>
                    <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                    <Text style={styles.verifiedChipText}>VERIFIED DRIVER</Text>
                  </View>
                </View>

                {/* License Card Middle (Photo + Credentials) */}
                <View style={styles.licenseBodyRow}>
                  <View style={styles.licenseAvatarWrap}>
                    <Image
                      source={{
                        uri:
                          currentUser?.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                      }}
                      style={styles.licenseAvatar}
                      contentFit="cover"
                    />
                    <View style={styles.digitalChipIcon}>
                      <Ionicons name="hardware-chip" size={18} color={Colors.primary} />
                    </View>
                  </View>

                  <View style={styles.licenseCredentialsCol}>
                    <Text style={styles.licenseName}>{currentUser?.name || 'Alexander Hayes'}</Text>
                    
                    <View style={styles.dlNumberRow}>
                      <Text style={styles.dlLabel}>LICENSE NO.</Text>
                      <Text style={styles.dlNumberValue}>{dl.licenseNumber}</Text>
                    </View>

                    <View style={styles.dlMetaRow}>
                      <View style={{ marginRight: 14 }}>
                        <Text style={styles.dlLabel}>EXPIRES</Text>
                        <Text style={styles.dlMetaValue}>{dl.expiryDate}</Text>
                      </View>
                      <View>
                        <Text style={styles.dlLabel}>CLASS</Text>
                        <Text style={styles.dlMetaValue}>CLASS C</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* License Card Bottom (Security Hologram & Barcode simulation) */}
                <View style={styles.licenseBottomRow}>
                  <View style={styles.barcodeSimRow}>
                    <Ionicons name="barcode-outline" size={24} color="rgba(255, 255, 255, 0.45)" />
                    <Text style={styles.digitalCardIdText}>{dl.digitalCardId}</Text>
                  </View>
                  <View style={styles.tierPillSmall}>
                    <Ionicons name="sparkles" size={11} color={Colors.primary} />
                    <Text style={styles.tierPillText}>
                      {currentUser?.membershipTier || 'GOLD'} TIER
                    </Text>
                  </View>
                </View>
              </View>

              {/* Verified Driver Credentials Details List */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Official License Record</Text>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="id-card-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Driver's License ID</Text>
                  </View>
                  <Text style={styles.detailValue}>{dl.licenseNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="calendar-outline" size={18} color={Colors.secondary} />
                    <Text style={styles.detailLabel}>Valid Until / Expiry</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: Colors.success }]}>
                    {dl.expiryDate} (Active)
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="globe-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.detailLabel}>Issuing State / Authority</Text>
                  </View>
                  <Text style={styles.detailValue}>{dl.issueCountry}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="car-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Authorized Vehicle Classes</Text>
                  </View>
                  <Text style={styles.detailValue}>{dl.licenseClass}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                  </View>
                  <Text style={styles.detailValue}>{dl.dateOfBirth}</Text>
                </View>
              </View>

              {/* Personal Contact & Roadside Safety Details */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Renter Contact & Safety Info</Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.detailLabel}>Email Address</Text>
                  </View>
                  <Text style={styles.detailValue}>{currentUser?.email}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.detailLabel}>Mobile Phone</Text>
                  </View>
                  <Text style={styles.detailValue}>{currentUser?.phone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="medkit-outline" size={18} color={Colors.danger} />
                    <Text style={styles.detailLabel}>Emergency Contact</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: Colors.text }]}>
                    {dl.emergencyContact}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
                    <Text style={styles.detailLabel}>Insurance Policy</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: Colors.success }]}>
                    Pre-Approved Zero Excess
                  </Text>
                </View>
              </View>
            </>
          ) : (
            /* Showroom Owner Dealership Profile */
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>Dealership Host Profile</Text>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="business-outline" size={18} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Showroom Name</Text>
                </View>
                <Text style={styles.detailValue}>{currentShowroom?.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="location-outline" size={18} color={Colors.secondary} />
                  <Text style={styles.detailLabel}>Dealership Address</Text>
                </View>
                <Text style={styles.detailValue}>{currentShowroom?.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
                  <Text style={styles.detailLabel}>Operating Hours</Text>
                </View>
                <Text style={styles.detailValue}>{currentShowroom?.workingHours}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="star" size={18} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Host Rating</Text>
                </View>
                <Text style={[styles.detailValue, { color: Colors.primary }]}>
                  {currentShowroom?.ratingAvg.toFixed(2)} ★ ({currentShowroom?.totalReviews} reviews)
                </Text>
              </View>
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={styles.updateBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Your driver credentials and license are fully verified and up to date.');
              }
            }}
          >
            <Ionicons name="checkmark-done-circle" size={18} color={Colors.textInverse} />
            <Text style={styles.updateBtnText}>Driver Credentials Verified</Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingBottom: 40,
  },
  licenseCard: {
    backgroundColor: '#0F1626',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  licenseCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  licenseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  licenseStateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  licenseStateText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1.2,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedChipText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.success,
    letterSpacing: 0.6,
  },
  licenseBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  licenseAvatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  licenseAvatar: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  digitalChipIcon: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#151C2C',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  licenseCredentialsCol: {
    flex: 1,
  },
  licenseName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  dlNumberRow: {
    marginVertical: 4,
  },
  dlLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  dlNumberValue: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  dlMetaRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  dlMetaValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  licenseBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  barcodeSimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitalCardIdText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tierPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tierPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.white,
  },
  updateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  updateBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.textInverse,
  },
});
