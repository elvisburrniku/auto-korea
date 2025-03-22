# AutoMarket Mobile Application

This directory contains the AutoMarket mobile application built with React Native. The mobile app provides similar functionality to the web version with a native mobile experience.

## Project Structure

```
mobile/
├── expo-project/           # Standalone Expo project for easy testing
├── src/                    # Main source code directory
│   ├── api/                # API client for backend communication
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main application component
├── EXPO_GO_QUICK_START.md  # Guide for testing with Expo Go
├── IPHONE_SETUP.md         # Guide for native iOS development
├── index.js                # Entry point for the app
└── package.json            # Dependencies and scripts
```

## Features

The mobile application includes the following features:

- **Car Browsing**: View and filter available cars
- **Car Details**: View detailed information about specific vehicles
- **Size Visualization**: Compare car sizes in your environment using the device camera
- **Wishlists**: View and manage wishlists (requires authentication)
- **Contact Forms**: Inquire about vehicles
- **User Authentication**: Register and login to access personal features

## Getting Started

### Quick Start with Expo Go

For the easiest way to test the mobile app, see the [Expo Go Quick Start Guide](./EXPO_GO_QUICK_START.md).

### Native iOS Development

For developing and testing on iOS devices using Xcode, see the [iPhone Setup Guide](./IPHONE_SETUP.md).

## Development

### Dependencies

The mobile app uses:

- React Native for the core framework
- React Navigation for navigation
- Shared API client with the web version
- Camera features for size visualization
- Device-native capabilities

### API Integration

The mobile app communicates with the same backend API as the web version, sharing data models and endpoints. Configuration for different environments is managed through environment variables.

## Testing

- **Expo Go**: For quick testing on physical devices
- **iOS Simulator**: For iOS-specific testing
- **Jest**: For unit testing components and utilities

## Building for Production

For building production-ready versions:

1. Follow the setup guides for each platform
2. Configure app signing and certificates
3. Build using the appropriate production configuration
4. Submit to respective app stores

## Notes

- The mobile app uses the European unit system (kilometers and euros)
- The admin functionality is limited in the mobile version, focusing primarily on user features
- The size visualization feature uses the device camera and does not require AR frameworks