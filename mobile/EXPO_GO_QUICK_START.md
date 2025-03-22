# AutoMarket Mobile App - Expo Go Quick Start Guide

This guide will help you quickly get started testing the AutoMarket mobile app using Expo Go on your iOS or Android device without complicated setup or development environments.

## What is Expo Go?

Expo Go is a mobile app available on the App Store and Google Play Store that lets you run React Native apps directly on your device without needing to build or compile them yourself. It's perfect for testing and development.

## Prerequisites

1. A smartphone (iOS or Android)
2. Internet connection on both your computer and smartphone
3. Expo Go app installed on your device:
   - [Download on App Store (iOS)](https://apps.apple.com/app/apple-store/id982107779)
   - [Download on Google Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Getting Started

### Step 1: Start the Expo development server

From the project root directory, run:

```bash
cd mobile/expo-project
npm install  # Only needed the first time
npx expo start
```

This will start the Expo development server and display a QR code in your terminal.

### Step 2: Connect your device

#### For iOS:
1. Open the Camera app on your iPhone
2. Point it at the QR code in your terminal
3. Tap the banner that appears at the top of your screen
4. The Expo Go app will open and load the AutoMarket app

#### For Android:
1. Open the Expo Go app on your Android device
2. Tap "Scan QR Code" in the Expo Go app
3. Scan the QR code displayed in your terminal
4. The AutoMarket app will load in Expo Go

## Key Features to Test

Once the app is running on your device, you can test these key features:

1. **Browse Cars**: Explore the vehicle listings 
2. **Car Details**: View detailed information about specific vehicles
3. **Size Visualization**: Compare car sizes in your environment
4. **Wishlists**: Create and manage lists of favorite vehicles

## Troubleshooting

If you encounter any issues:

1. **App won't load or crashes**:
   - Make sure your phone and computer are on the same WiFi network
   - Try restarting the Expo server with `npx expo start -c` to clear cache

2. **QR code doesn't work**:
   - iOS: Make sure your iOS is updated to the latest version
   - Android: Make sure you're scanning from within the Expo Go app

3. **Can't connect to development server**:
   - Check if your phone and computer are on the same network
   - Temporarily disable firewalls that might block connections

## Development Notes

- Changes made to the code will automatically reload in the Expo Go app
- Check the terminal for any error messages if you encounter issues
- The app uses the same API backend as the web version

## Next Steps

After testing with Expo Go, if you want to build a standalone version of the app or set up a more comprehensive development environment, refer to the `IPHONE_SETUP.md` file for native development instructions.