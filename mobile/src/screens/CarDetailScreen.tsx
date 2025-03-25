import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Share
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Car } from '../../../shared/schema';
import apiClient from '../api/apiClient';
import { 
  formatEurPrice, 
  formatKmDistance, 
  formatYear, 
  formatFuelEfficiency,
  isElectric
} from '../utils/conversion';
import CarCard from '../components/CarCard';

type CarDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CarDetail'>;
type CarDetailScreenRouteProp = RouteProp<RootStackParamList, 'CarDetail'>;

interface CarDetailScreenProps {
  navigation: CarDetailScreenNavigationProp;
  route: CarDetailScreenRouteProp;
}

const { width } = Dimensions.get('window');

const CarDetailScreen: React.FC<CarDetailScreenProps> = ({ navigation, route }) => {
  const { carId } = route.params;
  const [car, setCar] = useState<Car | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const [carData, similarCarsData] = await Promise.all([
          apiClient.cars.getCarById(carId),
          apiClient.cars.getSimilarCars(carId, 3)
        ]);
        setCar(carData);
        setSimilarCars(similarCarsData);
      } catch (error) {
        console.error('Error fetching car details:', error);
        Alert.alert(
          'Error',
          'Unable to load car details. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId, navigation]);

  const handleContactSeller = () => {
    // Navigate to contact form or directly open messaging app
    if (car) {
      navigation.navigate('Contact', { carId: car.id });
    }
  };

  const handleShareCar = async () => {
    if (!car) return;
    
    try {
      await Share.share({
        message: `Check out this ${car.year} ${car.make} ${car.model} for ${formatEurPrice(car.price)} on Auto Korea Kosova Import!`,
        // In a real app, we would include a deep link URL here
        // url: `https://autokoreakosova.com/cars/${car.id}`
      });
    } catch (error) {
      console.error('Error sharing car:', error);
    }
  };

  const openWhatsApp = () => {
    if (!car) return;
    
    // Example WhatsApp integration (would use real number in production)
    const phoneNumber = '+123456789';
    const message = encodeURIComponent(
      `Hi, I'm interested in the ${car.year} ${car.make} ${car.model} (${formatEurPrice(car.price)}) listed on Auto Korea Kosova Import.`
    );
    
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${message}`)
      .catch(() => {
        Alert.alert(
          'WhatsApp Not Installed',
          'Please install WhatsApp to contact the seller via WhatsApp.',
          [{ text: 'OK' }]
        );
      });
  };

  const handleVisualize = () => {
    if (car) {
      navigation.navigate('SizeVisualization', { carId: car.id });
    }
  };

  const navigateToCarDetail = (id: number) => {
    // Navigate to the same screen but with different car ID
    navigation.push('CarDetail', { carId: id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Car not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Car Images Gallery */}
      <View style={styles.imageGalleryContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const slide = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            if (slide !== currentImageIndex) {
              setCurrentImageIndex(slide);
            }
          }}
          scrollEventThrottle={16}
        >
          {car.images && car.images.length > 0 ? (
            car.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.carImage}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={{ uri: 'https://placehold.co/600x400/png?text=No+Image' }}
              style={styles.carImage}
              resizeMode="cover"
            />
          )}
        </ScrollView>
        
        {/* Image Pagination Dots */}
        {car.images && car.images.length > 1 && (
          <View style={styles.paginationContainer}>
            {car.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Car Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.carTitle}>
          {car.year} {car.make} {car.model}
        </Text>
        <Text style={styles.carPrice}>{formatEurPrice(car.price)}</Text>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleContactSeller}
          >
            <Text style={styles.primaryButtonText}>Contact Seller</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={openWhatsApp}
          >
            <Text style={styles.secondaryButtonText}>WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.tertiaryButton]}
            onPress={handleShareCar}
          >
            <Text style={styles.tertiaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Car Specifications */}
        <View style={styles.specificationsContainer}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>{formatYear(car.year)}</Text>
            </View>
            
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Mileage</Text>
              <Text style={styles.specValue}>{formatKmDistance(car.mileage)}</Text>
            </View>
            
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>{car.fuelType}</Text>
            </View>
            
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{car.transmission}</Text>
            </View>
            
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Engine</Text>
              <Text style={styles.specValue}>{car.engine || 'N/A'}</Text>
            </View>
            
            {!isElectric(car.fuelType) && car.fuelEfficiency && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Fuel Efficiency</Text>
                <Text style={styles.specValue}>{formatFuelEfficiency(car.fuelEfficiency)}</Text>
              </View>
            )}
            
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>{car.color}</Text>
            </View>
            
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Body Type</Text>
              <Text style={styles.specValue}>{car.bodyType}</Text>
            </View>
          </View>
        </View>

        {/* Car Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{car.description}</Text>
        </View>

        {/* Visualize Size Button */}
        <TouchableOpacity 
          style={styles.visualizeButton}
          onPress={handleVisualize}
        >
          <Text style={styles.visualizeButtonText}>
            Visualize Car Size with Camera
          </Text>
        </TouchableOpacity>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <View style={styles.similarCarsContainer}>
            <Text style={styles.sectionTitle}>Similar Cars</Text>
            
            {similarCars.map((similarCar) => (
              <CarCard
                key={similarCar.id}
                car={similarCar}
                size="large"
                onPress={() => navigateToCarDetail(similarCar.id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageGalleryContainer: {
    position: 'relative',
  },
  carImage: {
    width,
    height: 300,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoContainer: {
    padding: 16,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  carPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 4,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tertiaryButton: {
    backgroundColor: '#f1f5f9',
  },
  tertiaryButtonText: {
    color: '#334155',
    fontWeight: 'bold',
    fontSize: 14,
  },
  specificationsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  specItem: {
    width: '50%',
    padding: 8,
  },
  specLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  visualizeButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  visualizeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize:.16,
  },
  similarCarsContainer: {
    marginBottom: 24,
  },
});

export default CarDetailScreen;