import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AutoMarket</Text>
        <Text style={styles.subtitle}>Car Sales Mobile App</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          This is a minimal version of the AutoMarket app designed for Expo Go.
        </Text>
        <Text style={styles.paragraph}>
          Features available in the full app:
        </Text>
        <Text style={styles.feature}>• Browse Cars</Text>
        <Text style={styles.feature}>• Car Size Visualization</Text>
        <Text style={styles.feature}>• Wishlists</Text>
        <Text style={styles.feature}>• Contact Sellers</Text>
        <Text style={styles.feature}>• Compare Features</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>AutoMarket © 2025</Text>
      </View>
    </View>
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
    justifyContent: 'center',
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    lineHeight: 22,
  },
  feature: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 8,
    color: '#555',
  },
  footer: {
    padding: 20,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  }
});