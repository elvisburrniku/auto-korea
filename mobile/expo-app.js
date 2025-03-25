import React from 'react';
import { StyleSheet, Text, View, Button, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Auto Korea Kosova Import</Text>
          <Text style={styles.subtitle}>Find your perfect car</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Explore Cars</Text>
          <Text style={styles.cardText}>
            Browse our selection of high-quality vehicles
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Browse Cars</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Size Visualization</Text>
          <Text style={styles.cardText}>
            Compare car sizes in your environment
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Try Visualization</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Wishlists</Text>
          <Text style={styles.cardText}>
            Save your favorite cars and share with others
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start Wishlist</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Auto Korea Kosova Import Mobile App - Demo Version
          </Text>
          <Text style={styles.footerSubtext}>
            Created with Expo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});