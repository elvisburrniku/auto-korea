import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Car } from '../../../shared/schema';
import apiClient from '../api/apiClient';
import CarCard from '../components/CarCard';

type SizeVisualizationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SizeVisualization'>;
type SizeVisualizationScreenRouteProp = RouteProp<RootStackParamList, 'SizeVisualization'>;

interface SizeVisualizationScreenProps {
  navigation: SizeVisualizationScreenNavigationProp;
  route: SizeVisualizationScreenRouteProp;
}

// MockCameraView component as a placeholder for actual camera implementation
// In a real app, we would use react-native-camera or expo-camera
const MockCameraView = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.cameraContainer}>
    <Text style={styles.mockCameraText}>Camera View</Text>
    <Text style={styles.mockCameraSubText}>
      In a real app, this would be a live camera feed with the car model overlaid
    </Text>
    {children}
  </View>
);

const { width, height } = Dimensions.get('window');

const SizeVisualizationScreen: React.FC<SizeVisualizationScreenProps> = ({ navigation, route }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [carSelectorVisible, setCarSelectorVisible] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const allCars = await apiClient.cars.getAllCars();
        setCars(allCars);
        
        // If a car ID was passed in params, select that car
        if (route.params?.carId) {
          const car = allCars.cars.find(c => c.id === route.params.carId);
          if (car) {
            setSelectedCar(car);
          }
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
        Alert.alert(
          'Error',
          'Unable to load cars. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [navigation, route.params]);

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    setCarSelectorVisible(false);
  };

  const startCameraVisualization = () => {
    if (!selectedCar) {
      Alert.alert('Select a Car', 'Please select a car to visualize first.');
      return;
    }
    
    // In a real app, we would request camera permissions here
    // and initialize the camera
    setCameraActive(true);
    setCarSelectorVisible(false);
  };

  const stopCameraVisualization = () => {
    setCameraActive(false);
    setCarSelectorVisible(true);
  };

  const renderCarSelector = () => (
    <Modal
      visible={carSelectorVisible}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.selectorContainer}>
        <View style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Select a Car to Visualize</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading cars...</Text>
          </View>
        ) : (
          <ScrollView style={styles.carList}>
            {cars.map(car => (
              <TouchableOpacity 
                key={car.id}
                style={[
                  styles.carItem,
                  selectedCar?.id === car.id && styles.selectedCarItem
                ]}
                onPress={() => handleSelectCar(car)}
              >
                <CarCard car={car} size="medium" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              (!selectedCar) && styles.disabledButton
            ]}
            onPress={startCameraVisualization}
            disabled={!selectedCar}
          >
            <Text style={styles.actionButtonText}>
              Start Camera Visualization
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const inferCarType = (car: Car): 'suv' | 'sedan' | 'coupe' | 'hatchback' | 'truck' | 'other' => {
    const bodyType = car.bodyType?.toLowerCase() || '';
    
    if (bodyType.includes('suv') || bodyType.includes('crossover')) {
      return 'suv';
    } else if (bodyType.includes('sedan')) {
      return 'sedan';
    } else if (bodyType.includes('coupe')) {
      return 'coupe';
    } else if (bodyType.includes('hatchback')) {
      return 'hatchback';
    } else if (bodyType.includes('truck') || bodyType.includes('pickup')) {
      return 'truck';
    } else {
      return 'other';
    }
  };

  // Get appropriate car silhouette based on car type
  const getCarSilhouette = (car: Car): string => {
    const carType = inferCarType(car);
    
    const silhouettes = {
      suv: 'https://cdn-icons-png.flaticon.com/512/55/55283.png',
      sedan: 'https://cdn-icons-png.flaticon.com/512/55/55280.png',
      coupe: 'https://cdn-icons-png.flaticon.com/512/55/55281.png',
      hatchback: 'https://cdn-icons-png.flaticon.com/512/55/55282.png',
      truck: 'https://cdn-icons-png.flaticon.com/512/55/55307.png',
      other: 'https://cdn-icons-png.flaticon.com/512/55/55280.png'
    };
    
    return silhouettes[carType];
  };

  const renderCameraView = () => (
    <View style={styles.cameraViewContainer}>
      <MockCameraView>
        {selectedCar && (
          <View style={styles.carOverlayContainer}>
            <Image 
              source={{ uri: getCarSilhouette(selectedCar) }}
              style={styles.carSilhouette}
              resizeMode="contain"
            />
          </View>
        )}
      </MockCameraView>
      
      <View style={styles.cameraControlsContainer}>
        {selectedCar && (
          <View style={styles.selectedCarInfoContainer}>
            <Text style={styles.selectedCarTitle}>
              {selectedCar.year} {selectedCar.make} {selectedCar.model}
            </Text>
            <Text style={styles.selectedCarDimensions}>
              Length: {selectedCar.length || 'N/A'} • Width: {selectedCar.width || 'N/A'} • Height: {selectedCar.height || 'N/A'}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={stopCameraVisualization}
        >
          <Text style={styles.stopButtonText}>Stop Visualization</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {carSelectorVisible ? renderCarSelector() : null}
      {cameraActive ? renderCameraView() : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
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
  carList: {
    flex: 1,
    padding: 16,
  },
  carItem: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedCarItem: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 10,
  },
  actionButtonsContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cameraViewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  mockCameraText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mockCameraSubText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 10,
  },
  carOverlayContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carSilhouette: {
    width: width * 0.7,
    height: height * 0.3,
    opacity: 0.7,
  },
  cameraControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  selectedCarInfoContainer: {
    marginBottom: 16,
  },
  selectedCarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedCarDimensions: {
    fontSize: 14,
    color: '#cccccc',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SizeVisualizationScreen;