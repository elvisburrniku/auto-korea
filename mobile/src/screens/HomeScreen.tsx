import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CarCard from '../components/CarCard';
import { Car } from '../../../shared/schema';
import apiClient from '../api/apiClient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [recentCars, setRecentCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCars = async () => {
    try {
      const [featured, recent] = await Promise.all([
        apiClient.cars.getFeaturedCars(3),
        apiClient.cars.getRecentCars(4)
      ]);
      setFeaturedCars(featured);
      setRecentCars(recent);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars();
  };

  const navigateToCarDetail = (carId: number) => {
    navigation.navigate('CarDetail', { carId });
  };

  const navigateToBrowseCars = () => {
    navigation.navigate('BrowseCars', {});
  };

  const navigateToCarComparison = () => {
    navigation.navigate('CarComparison');
  };

  const navigateToSizeVisualization = () => {
    navigation.navigate('SizeVisualization');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070' }} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Find Your Dream Car</Text>
          <Text style={styles.heroSubtitle}>Browse through our exclusive collection</Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={navigateToBrowseCars}
          >
            <Text style={styles.heroButtonText}>Explore Cars</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feature Buttons */}
      <View style={styles.featureButtons}>
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={navigateToBrowseCars}
        >
          <Text style={styles.featureButtonText}>Browse All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={navigateToCarComparison}
        >
          <Text style={styles.featureButtonText}>Compare</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={navigateToSizeVisualization}
        >
          <Text style={styles.featureButtonText}>Visualize Size</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Cars Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Cars</Text>
          <TouchableOpacity onPress={navigateToBrowseCars}>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredCarsList}
        >
          {featuredCars.map((car) => (
            <View key={car.id} style={styles.featuredCarContainer}>
              <CarCard 
                car={car} 
                featured={true} 
                size="medium"
                onPress={() => navigateToCarDetail(car.id)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recent Additions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Additions</Text>
          <TouchableOpacity onPress={navigateToBrowseCars}>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recentCarsList}>
          {recentCars.map((car) => (
            <CarCard 
              key={car.id}
              car={car} 
              size="large"
              onPress={() => navigateToCarDetail(car.id)}
            />
          ))}
        </View>
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
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  heroButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 4,
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  featuredCarsList: {
    paddingEnd: 8,
  },
  featuredCarContainer: {
    marginRight: 12,
  },
  recentCarsList: {
    
  },
});

export default HomeScreen;