import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (to be created)
import HomeScreen from '../screens/HomeScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import BrowseCarsScreen from '../screens/BrowseCarsScreen';
import CarComparisonScreen from '../screens/CarComparisonScreen';
import SizeVisualizationScreen from '../screens/SizeVisualizationScreen';
import WishlistsScreen from '../screens/WishlistsScreen';
import WishlistDetailScreen from '../screens/WishlistDetailScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ContactScreen from '../screens/ContactScreen';
import AboutScreen from '../screens/AboutScreen';

// Define the navigation params
export type RootStackParamList = {
  Home: undefined;
  CarDetail: { carId: number };
  BrowseCars: { filter?: any };
  CarComparison: undefined;
  SizeVisualization: undefined;
  Wishlists: undefined;
  WishlistDetail: { wishlistId: number };
  Register: undefined;
  Contact: undefined;
  About: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Auto Korea Kosova Import' }}
        />
        <Stack.Screen 
          name="CarDetail" 
          component={CarDetailScreen} 
          options={{ title: 'Car Details' }}
        />
        <Stack.Screen 
          name="BrowseCars" 
          component={BrowseCarsScreen} 
          options={{ title: 'Browse Cars' }}
        />
        <Stack.Screen 
          name="CarComparison" 
          component={CarComparisonScreen} 
          options={{ title: 'Compare Cars' }}
        />
        <Stack.Screen 
          name="SizeVisualization" 
          component={SizeVisualizationScreen} 
          options={{ title: 'Size Visualization', headerShown: false }}
        />
        <Stack.Screen 
          name="Wishlists" 
          component={WishlistsScreen} 
          options={{ title: 'My Wishlists' }}
        />
        <Stack.Screen 
          name="WishlistDetail" 
          component={WishlistDetailScreen} 
          options={{ title: 'Wishlist' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Register' }}
        />
        <Stack.Screen 
          name="Contact" 
          component={ContactScreen} 
          options={{ title: 'Contact Us' }}
        />
        <Stack.Screen 
          name="About" 
          component={AboutScreen} 
          options={{ title: 'About Auto Korea Kosova Import' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;