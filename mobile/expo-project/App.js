import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Define API URL - development server URL (replace with your actual URL when deploying)
const API_URL = 'https://autokoreakosova.relay.run';

// Car component to display in the list
const CarItem = ({ car, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.carCard}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {car.images && car.images.length > 0 ? (
          <Image 
            source={{ uri: car.images[0].includes('http') ? car.images[0] : `${API_URL}${car.images[0]}` }} 
            style={styles.carImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.carImage, styles.noImage]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>{car.make} {car.model}</Text>
        <Text style={styles.carYear}>{car.year}</Text>
        <Text style={styles.carPrice}>€{car.price.toLocaleString()}</Text>
        <View style={styles.carDetails}>
          <Text style={styles.carDetailText}>{car.mileage.toLocaleString()} km</Text>
          <Text style={styles.carDetailText}>{car.fuelType}</Text>
          <Text style={styles.carDetailText}>{car.transmission}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Home Screen Component
function HomeScreen({ navigation }) {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [recentCars, setRecentCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured cars
        const featuredRes = await fetch(`${API_URL}/api/cars/featured/list`);
        const featuredData = await featuredRes.json();
        
        // Fetch recent cars
        const recentRes = await fetch(`${API_URL}/api/cars/recent/list`);
        const recentData = await recentRes.json();
        
        // Update state
        setFeaturedCars(featuredData.cars || []);
        setRecentCars(recentData.cars || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch cars:", err);
        setError("Failed to load cars. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Re-trigger the useEffect
            setFeaturedCars([]);
            setRecentCars([]);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <FlatList
        data={[1]} // Just a dummy item to render the content once
        renderItem={() => (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Auto Korea Kosova Import</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Cars</Text>
              <FlatList
                horizontal
                data={featuredCars}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <CarItem 
                    car={item} 
                    onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Listings</Text>
              {recentCars.map((car) => (
                <CarItem 
                  key={car.id} 
                  car={car} 
                  onPress={() => navigation.navigate('CarDetail', { carId: car.id })}
                />
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => navigation.navigate('BrowseCars')}
            >
              <Text style={styles.browseButtonText}>Browse All Cars</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Car Detail Screen
function CarDetailScreen({ route, navigation }) {
  const { carId } = route.params;
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars/${carId}`);
        const data = await response.json();
        setCar(data.car);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch car details:", err);
        setError("Failed to load car details. Please try again.");
        setLoading(false);
      }
    };
    
    fetchCarDetails();
  }, [carId]);
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }
  
  if (error || !car) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Car not found"}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Re-trigger the useEffect
            setCar(null);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[1]} // Just a dummy item to render the content once
        renderItem={() => (
          <View>
            <View style={styles.imageGalleryContainer}>
              {car.images && car.images.length > 0 ? (
                <Image 
                  source={{ uri: car.images[0].includes('http') ? car.images[0] : `${API_URL}${car.images[0]}` }}
                  style={styles.detailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.detailImage, styles.noImage]}>
                  <Text style={styles.noImageText}>No Image Available</Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailsContainer}>
              <Text style={styles.detailTitle}>{car.make} {car.model}</Text>
              <Text style={styles.detailPrice}>€{car.price.toLocaleString()}</Text>
              
              <View style={styles.specRow}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Year</Text>
                  <Text style={styles.specValue}>{car.year}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Mileage</Text>
                  <Text style={styles.specValue}>{car.mileage.toLocaleString()} km</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Fuel</Text>
                  <Text style={styles.specValue}>{car.fuelType}</Text>
                </View>
              </View>
              
              <View style={styles.specRow}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Transmission</Text>
                  <Text style={styles.specValue}>{car.transmission}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Drivetrain</Text>
                  <Text style={styles.specValue}>{car.drivetrain}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Ext. Color</Text>
                  <Text style={styles.specValue}>{car.exteriorColor}</Text>
                </View>
              </View>
              
              <View style={styles.description}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{car.description}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => {
                  // Contact functionality would go here
                  alert("Contact feature will be available soon!");
                }}
              >
                <Text style={styles.contactButtonText}>Contact Seller</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Browse Cars Screen
function BrowseCarsScreen({ navigation }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars`);
        const data = await response.json();
        setCars(data.cars || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch cars:", err);
        setError("Failed to load cars. Please try again.");
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            setCars([]);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CarItem 
            car={item} 
            onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.browseHeader}>
            <Text style={styles.browseTitle}>All Cars</Text>
            <Text style={styles.browseSubtitle}>{cars.length} cars available</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>No cars found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Create a stack navigator
const Stack = createNativeStackNavigator();

// Main App component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CarDetail" 
          component={CarDetailScreen} 
          options={{ title: "Car Details" }}
        />
        <Stack.Screen 
          name="BrowseCars" 
          component={BrowseCarsScreen} 
          options={{ title: "Browse Cars" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featuredList: {
    paddingEnd: 15,
  },
  carCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 160,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#757575',
  },
  carInfo: {
    padding: 12,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  carYear: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 4,
  },
  carDetails: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  carDetailText: {
    fontSize: 13,
    color: '#666',
    marginRight: 10,
  },
  browseButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 20,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Detail page styles
  imageGalleryContainer: {
    width: '100%',
    height: 250,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 15,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 6,
    marginBottom: 15,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  description: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  contactButton: {
    backgroundColor: '#34d399',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Browse page styles
  browseHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  browseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  browseSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
  },
});