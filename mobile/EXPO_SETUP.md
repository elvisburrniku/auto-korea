# Running Auto Korea Kosova Import Mobile App with Expo Go

This guide explains how to run the Auto Korea Kosova Import mobile app on your iPhone using Expo Go, which is a much simpler approach than setting up a full development environment.

## What is Expo Go?

Expo Go is a mobile app that allows you to run React Native applications directly on your device without going through complex build processes. It's perfect for testing and development.

## Setting Up the Project for Expo Go

### Prerequisites

1. **Expo Go App**
   - Install the Expo Go app on your iPhone from the App Store
   - No need for Xcode or Android Studio!

2. **Node.js**
   - Install Node.js on your computer (version 14 or later)

### Steps to Set Up

1. **Download the Project**
   - Download the project from Replit by clicking the three dots (⋮) and selecting "Download as zip"
   - Extract the ZIP file to a folder on your computer

2. **Create Expo Project**
   
   ```bash
   # Install Expo CLI
   npm install -g expo-cli
   
   # Create a new Expo project in a separate folder
   expo init Auto Korea Kosova ImportExpo
   
   # Choose a blank template when prompted
   ```

3. **Copy Project Files**
   
   ```bash
   # Navigate to the new Expo project
   cd Auto Korea Kosova ImportExpo
   
   # Create necessary directories
   mkdir -p src/api src/components src/screens src/navigation src/utils
   
   # Copy files from the downloaded project
   cp -R /path/to/extracted/project/mobile/src/* ./src/
   cp -R /path/to/extracted/project/shared ./
   cp /path/to/extracted/project/mobile/expo-app.json ./app.json
   ```

4. **Install Dependencies**
   
   ```bash
   # Install required dependencies
   npm install @react-navigation/native @react-navigation/native-stack react-native-safe-area-context react-native-screens
   npm install @react-navigation/stack react-native-gesture-handler
   npm install expo-camera
   ```

5. **Update API Configuration**
   
   Open `src/api/apiClient.ts` and update the API URL to point to your deployed API:
   
   ```typescript
   const API_CONFIG = {
     baseUrl: 'https://your-deployed-api-url.com/api', // Replace with your API URL
     headers: {
       'Content-Type': 'application/json',
     },
   };
   ```

## Running the App with Expo Go

1. **Start the Expo Development Server**
   
   ```bash
   # Start the Expo server
   npx expo start
   ```

2. **Connect with Your iPhone**
   
   - Open the Expo Go app on your iPhone
   - Scan the QR code displayed in your terminal or Expo Dev Tools browser window
   - Alternatively, if you're signed in to the same Expo account on both your computer and phone, the project will appear in the "Projects" tab

3. **Development Mode**
   
   - The app will load on your device
   - Changes you make to the code will automatically update on your phone
   - Shake your device to open the developer menu for additional options

## Troubleshooting

### Common Issues

1. **Can't connect to development server**
   - Make sure your phone and computer are on the same Wi-Fi network
   - Check if your Wi-Fi network allows device-to-device connections
   - Try using a mobile hotspot from your computer

2. **App crashes on startup**
   - Check the error in the Expo Dev Tools
   - Most common issues are related to missing dependencies or incompatible versions

3. **API connection issues**
   - Verify that your API URL is correct and the API is running
   - If your API requires authentication, ensure tokens are being sent correctly

### Getting Help

If you encounter issues, check the Expo documentation:
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)

## Publishing Your App (Optional)

When you're ready to share your app with others without requiring Expo Go:

```bash
expo build:ios
```

This will create a standalone binary that can be submitted to the App Store or shared via TestFlight.