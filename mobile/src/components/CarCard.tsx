import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Car } from '../../../shared/schema';
import { formatEurPrice, formatKmDistance, isElectric } from '../utils/conversion';

interface CarCardProps {
  car: Car;
  onPress?: () => void;
  featured?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const CarCard: React.FC<CarCardProps> = ({ 
  car, 
  onPress, 
  featured = false, 
  size = 'medium' 
}) => {
  // Get the primary image or use a placeholder
  const primaryImage = car.images && car.images.length > 0 
    ? car.images[0] 
    : 'https://placehold.co/600x400/png?text=No+Image';

  // Adjust card dimensions based on size prop
  const cardWidth = size === 'small' ? 150 : size === 'medium' ? 300 : Dimensions.get('window').width - 32;
  const imageHeight = size === 'small' ? 100 : size === 'medium' ? 160 : 220;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { width: cardWidth },
        featured && styles.featuredContainer
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: primaryImage }}
          style={[styles.image, { height: imageHeight }]}
          resizeMode="cover"
        />
        {featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Ofertë</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{car.year} {car.make} {car.model}</Text>
        <Text style={styles.price}>{formatEurPrice(car.price)}</Text>
        
        <View style={styles.specs}>
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{formatKmDistance(car.mileage)}</Text>
            <Text style={styles.specLabel}>Kilometrazhi</Text>
          </View>
          
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{car.transmission}</Text>
            <Text style={styles.specLabel}>Transmisioni</Text>
          </View>
          
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{car.fuelType}</Text>
            <Text style={styles.specLabel}>Lloji i karburantit</Text>
          </View>
        </View>
        
        {!isElectric(car.fuelType) && car.fuelEfficiency && size !== 'small' && (
          <Text style={styles.fuelEfficiency}>
            Konsumi i karburantit: {car.fuelEfficiency} L/100km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  featuredContainer: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  specItem: {
    alignItems: 'center',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  specLabel: {
    fontSize: 12,
    color: '#666',
  },
  fuelEfficiency: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default CarCard;