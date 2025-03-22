# Quick Start Guide: Running with Expo Go

This is a simplified guide to quickly get the AutoMarket app running on your iPhone using Expo Go.

## Step 1: Install Expo Go on your iPhone

Download and install the Expo Go app from the App Store on your iPhone.

## Step 2: Create a new Expo project on your computer

```bash
# Install Expo CLI globally if you don't have it
npm install -g expo-cli

# Create a new Expo project
npx create-expo-app AutoMarketExpo

# Navigate to the project directory
cd AutoMarketExpo
```

## Step 3: Replace the project files

1. Copy the `expo-app.js` file from this folder to your new project and rename it to `App.js`:

```bash
# Copy and replace the main App.js file
cp /path/to/downloaded/project/mobile/expo-app.js ./App.js
```

2. Copy the `expo-app.json` file and rename it to `app.json`:

```bash
# Copy and replace the app.json file
cp /path/to/downloaded/project/mobile/expo-app.json ./app.json
```

3. Update the dependencies in your project:

```bash
# Install required dependencies
npm install @react-navigation/native @react-navigation/native-stack react-native-safe-area-context react-native-screens react-native-gesture-handler expo-camera
```

## Step 4: Start the Expo development server

```bash
npx expo start
```

This will display a QR code in your terminal.

## Step 5: Run on your iPhone

1. Open the Expo Go app on your iPhone
2. Scan the QR code from your terminal
3. The app will load on your device

## If you want to use the full app

If you want to run the complete AutoMarket app (not just the demo screen), follow the more detailed instructions in the `EXPO_SETUP.md` file, which explains how to copy all the necessary files and set up the full application structure.

## Troubleshooting

- Make sure your phone and computer are on the same Wi-Fi network
- If the QR code doesn't work, try creating an Expo account and logging in both on your computer and phone
- If you see module errors, double-check that you've installed all the required dependencies