import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
  Switch
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Car, CarFilter } from '../../../shared/schema';
import apiClient from '../api/apiClient';
import CarCard from '../components/CarCard';
import { formatEurPrice } from '../utils/conversion';

type BrowseCarsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BrowseCars'>;
type BrowseCarsScreenRouteProp = RouteProp<RootStackParamList, 'BrowseCars'>;

interface BrowseCarsScreenProps {
  navigation: BrowseCarsScreenNavigationProp;
  route: BrowseCarsScreenRouteProp;
}

const BrowseCarsScreen: React.FC<BrowseCarsScreenProps> = ({ navigation, route }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<CarFilter>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2025]);

  // Predefined lists for filters
  const makes = ["All", "BMW", "Audi", "Mercedes", "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Volkswagen"];
  const fuelTypes = ["All", "Gasoline", "Diesel", "Electric", "Hybrid"];
  const transmissions = ["All", "Automatic", "Manual", "Semi-automatic"];
  const bodyTypes = ["All", "Sedan", "SUV", "Coupe", "Hatchback", "Truck", "Van"];

  const fetchCars = async (filterParams?: CarFilter) => {
    try {
      setLoading(true);
      let carsData;
      
      if (filterParams && Object.keys(filterParams).length > 0) {
        // Remove any filters set to "All"
        const cleanedFilters = { ...filterParams };
        Object.keys(cleanedFilters).forEach(key => {
          if (cleanedFilters[key] === "All") {
            delete cleanedFilters[key];
          }
        });
        
        carsData = await apiClient.cars.filterCars(cleanedFilters);
      } else {
        carsData = await apiClient.cars.getAllCars();
      }
      
      setCars(carsData);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // If route.params has filter data, use it
    if (route.params?.filter) {
      setFilters(route.params.filter);
      fetchCars(route.params.filter);
    } else {
      fetchCars();
    }
  }, [route.params]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars(filters);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    fetchCars(filters);
  };

  const resetFilters = () => {
    setFilters({});
    setPriceRange([0, 100000]);
    setYearRange([2000, 2025]);
  };

  const navigateToCarDetail = (carId: number) => {
    navigation.navigate('CarDetail', { carId });
  };

  const renderFilterItem = (
    label: string,
    options: string[],
    currentValue: string | undefined,
    filterKey: keyof CarFilter
  ) => (
    <View style={styles.filterItem}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterOptionsContainer}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterOption,
              currentValue === option && styles.filterOptionSelected
            ]}
            onPress={() => {
              if (option === "All") {
                const newFilters = { ...filters };
                delete newFilters[filterKey];
                setFilters(newFilters);
              } else {
                setFilters({ ...filters, [filterKey]: option });
              }
            }}
          >
            <Text style={[
              styles.filterOptionText,
              currentValue === option && styles.filterOptionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPriceFilter = () => (
    <View style={styles.filterItem}>
      <Text style={styles.filterLabel}>Price Range</Text>
      <View style={styles.priceRangeContainer}>
        <Text style={styles.priceRangeText}>
          {formatEurPrice(priceRange[0])} - {formatEurPrice(priceRange[1])}
        </Text>
        {/* In a real app, we would use a slider component here */}
        <TouchableOpacity 
          style={styles.priceRangeButton}
          onPress={() => {
            setFilters({ 
              ...filters, 
              minPrice: priceRange[0], 
              maxPrice: priceRange[1] 
            });
          }}
        >
          <Text style={styles.priceRangeButtonText}>Apply Price Range</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderElectricOnlyFilter = () => (
    <View style={styles.switchFilterItem}>
      <Text style={styles.filterLabel}>Electric Vehicles Only</Text>
      <Switch
        value={filters.fuelType === "Electric"}
        onValueChange={(value) => {
          if (value) {
            setFilters({ ...filters, fuelType: "Electric" });
          } else {
            const newFilters = { ...filters };
            delete newFilters.fuelType;
            setFilters(newFilters);
          }
        }}
        trackColor={{ false: "#767577", true: "#bfdbfe" }}
        thumbColor={filters.fuelType === "Electric" ? "#3b82f6" : "#f4f3f4"}
      />
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.filterModalContainer}>
        <View style={styles.filterModalHeader}>
          <Text style={styles.filterModalTitle}>Filter Cars</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterModalContent}>
          {renderFilterItem("Make", makes, filters.make, "make")}
          {renderFilterItem("Body Type", bodyTypes, filters.bodyType, "bodyType")}
          {renderFilterItem("Fuel Type", fuelTypes, filters.fuelType, "fuelType")}
          {renderFilterItem("Transmission", transmissions, filters.transmission, "transmission")}
          {renderPriceFilter()}
          {renderElectricOnlyFilter()}
        </ScrollView>

        <View style={styles.filterModalFooter}>
          <TouchableOpacity 
            style={styles.resetFiltersButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.applyFiltersButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderItem = ({ item }: { item: Car }) => (
    <CarCard 
      car={item} 
      onPress={() => navigateToCarDetail(item.id)}
      size="large"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            placeholderTextColor="#64748b"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading cars...</Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.carList}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No cars found matching your filters.</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  resetFilters();
                  fetchCars();
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
    color: '#334155',
  },
  filterButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  carList: {
    padding: 16,
  },
  emptyListContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterModalTitle: {
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
  filterModalContent: {
    flex: 1,
    padding: 16,
  },
  filterItem: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  filterOptionsContainer: {
    paddingVertical: 4,
  },
  filterOption: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  filterOptionText: {
    color: '#334155',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
  },
  priceRangeContainer: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 16,
  },
  priceRangeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceRangeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  switchFilterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  resetFiltersButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  resetFiltersButtonText: {
    color: '#334155',
    fontWeight: 'bold',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyFiltersButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default BrowseCarsScreen;