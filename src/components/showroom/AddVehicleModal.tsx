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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Vehicle, VehicleCategory, VehicleSpecs } from '../../types';
import { useApp } from '../../context/AppContext';

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: Exclude<VehicleCategory, 'All'>[] = [
  'SUV',
  'Luxury',
  'Sports',
  'Sedan',
  'Electric',
  'Economy',
];

const PRESET_CAR_PHOTOS = [
  {
    name: 'Ferrari F8 Tributo',
    url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=900&q=80',
    brand: 'Ferrari',
    model: 'F8 Tributo V8',
    category: 'Sports' as const,
  },
  {
    name: 'Lamborghini Urus',
    url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=80',
    brand: 'Lamborghini',
    model: 'Urus Super SUV',
    category: 'SUV' as const,
  },
  {
    name: 'BMW M8 Competition',
    url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
    brand: 'BMW',
    model: 'M8 Competition Gran Coupe',
    category: 'Luxury' as const,
  },
  {
    name: 'Porsche Taycan Turbo S',
    url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80',
    brand: 'Porsche',
    model: 'Taycan Turbo S EV',
    category: 'Electric' as const,
  },
  {
    name: 'Mercedes-AMG GT Coupe',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80',
    brand: 'Mercedes-Benz',
    model: 'AMG GT Coupe',
    category: 'Sports' as const,
  },
];

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentShowroom, addVehicle } = useApp();

  const [brand, setBrand] = useState('Ferrari');
  const [model, setModel] = useState('F8 Tributo V8');
  const [year, setYear] = useState('2024');
  const [plateNumber, setPlateNumber] = useState('SHR-8899');
  const [color, setColor] = useState('Rosso Corsa Red');
  const [category, setCategory] = useState<Exclude<VehicleCategory, 'All'>>('Sports');
  
  // Rates
  const [dailyRate, setDailyRate] = useState('750');
  const [monthlyRate, setMonthlyRate] = useState('13500');
  const [securityDeposit, setSecurityDeposit] = useState('2500');

  // Specs
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Petrol');
  const [seats, setSeats] = useState('2');
  const [engine, setEngine] = useState('3.9L Twin-Turbo V8');
  const [horsepower, setHorsepower] = useState('710');
  const [acceleration, setAcceleration] = useState('0-100 in 2.9s');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(PRESET_CAR_PHOTOS[0].url);

  const handleSelectPreset = (preset: typeof PRESET_CAR_PHOTOS[0]) => {
    setSelectedPhotoUrl(preset.url);
    setBrand(preset.brand);
    setModel(preset.model);
    setCategory(preset.category);
  };

  const handleSave = () => {
    if (!brand.trim() || !model.trim() || !dailyRate || !monthlyRate) {
      if (Platform.OS === 'web') {
        window.alert('Please fill out all required vehicle details and pricing.');
      } else {
        Alert.alert('Incomplete Details', 'Please fill out all required vehicle fields.');
      }
      return;
    }

    if (!currentShowroom) return;

    addVehicle({
      showroomId: currentShowroom.id,
      showroomName: currentShowroom.name,
      showroomCity: currentShowroom.city,
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year) || 2024,
      plateNumber: plateNumber.trim(),
      category,
      color,
      dailyRate: parseFloat(dailyRate) || 100,
      monthlyRate: parseFloat(monthlyRate) || 2000,
      securityDeposit: parseFloat(securityDeposit) || 500,
      coverImage: selectedPhotoUrl,
      images: [
        selectedPhotoUrl,
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'available',
      features: ['Apple CarPlay', 'Leather Interior', 'GPS Navigation', 'Launch Control', 'Sport Exhaust'],
      specs: {
        transmission,
        fuelType,
        seats: parseInt(seats) || 2,
        engine,
        horsepower: parseInt(horsepower) || 500,
        acceleration,
        mileageLimitPerDay: 250,
      },
    });

    onClose();
    if (Platform.OS === 'web') {
      window.alert(`Vehicle ${brand} ${model} successfully added to ${currentShowroom.name}!`);
    } else {
      Alert.alert('Vehicle Added', `${brand} ${model} is now live in your showroom marketplace.`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Vehicle to Fleet</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Target Showroom banner */}
          <View style={styles.showroomNotice}>
            <Ionicons name="business" size={16} color={Colors.primary} />
            <Text style={styles.showroomNoticeText}>
              Adding to: <Text style={{ color: Colors.white, fontWeight: '700' }}>{currentShowroom?.name}</Text>
            </Text>
          </View>

          {/* Quick Preset Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Photography & Preset</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {PRESET_CAR_PHOTOS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetCard,
                    selectedPhotoUrl === p.url && styles.presetCardActive,
                  ]}
                  onPress={() => handleSelectPreset(p)}
                >
                  <Image source={{ uri: p.url }} style={styles.presetImage} contentFit="cover" />
                  <Text style={styles.presetName} numberOfLines={1}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Primary Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Vehicle Brand & Model</Text>
            <View style={styles.rowTwo}>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Make / Brand</Text>
                <TextInput
                  style={styles.textInput}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g. Porsche"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Model</Text>
                <TextInput
                  style={styles.textInput}
                  value={model}
                  onChangeText={setModel}
                  placeholder="e.g. 911 Turbo"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.rowThree}>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Year</Text>
                <TextInput
                  style={styles.textInput}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Plate #</Text>
                <TextInput
                  style={styles.textInput}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Color</Text>
                <TextInput
                  style={styles.textInput}
                  value={color}
                  onChangeText={setColor}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Category Pills */}
            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Category</Text>
            <View style={styles.categoryPillsRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    category === cat && styles.catPillActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      category === cat && styles.catPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pricing: Daily vs Monthly */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Pricing Model (Daily & Monthly)</Text>
            <View style={styles.rowThree}>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Daily Rate ($)</Text>
                <TextInput
                  style={[styles.textInput, styles.rateInput]}
                  value={dailyRate}
                  onChangeText={setDailyRate}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Monthly Rate ($)</Text>
                <TextInput
                  style={[styles.textInput, styles.rateInput]}
                  value={monthlyRate}
                  onChangeText={setMonthlyRate}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Security Deposit ($)</Text>
                <TextInput
                  style={styles.textInput}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Specs & Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Technical Specs</Text>
            <View style={styles.rowTwo}>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Engine</Text>
                <TextInput
                  style={styles.textInput}
                  value={engine}
                  onChangeText={setEngine}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Horsepower (HP)</Text>
                <TextInput
                  style={styles.textInput}
                  value={horsepower}
                  onChangeText={setHorsepower}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.rowThree}>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>0-100 km/h</Text>
                <TextInput
                  style={styles.textInput}
                  value={acceleration}
                  onChangeText={setAcceleration}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Passengers</Text>
                <TextInput
                  style={styles.textInput}
                  value={seats}
                  onChangeText={setSeats}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Transmission</Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() =>
                    setTransmission((prev) => (prev === 'Automatic' ? 'Manual' : 'Automatic'))
                  }
                >
                  <Text style={styles.selectBtnText}>{transmission}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.publishBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.publishBtnText}>Publish to Marketplace</Text>
            <Ionicons name="cloud-upload" size={18} color={Colors.textInverse} />
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
    paddingBottom: 110,
  },
  showroomNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: Spacing.md,
  },
  showroomNoticeText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
  },
  presetCard: {
    width: 120,
    marginRight: 10,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  presetCardActive: {
    borderColor: Colors.primary,
  },
  presetImage: {
    width: '100%',
    height: 70,
  },
  presetName: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.text,
    padding: 6,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  rowThree: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 10,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rateInput: {
    color: Colors.primary,
    fontWeight: '700',
  },
  selectBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectBtnText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.white,
    fontWeight: '700',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  catPillTextActive: {
    color: Colors.primary,
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
  publishBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.textInverse,
  },
});
