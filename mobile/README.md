# AutoMarket Mobile App

This is the React Native mobile app version of AutoMarket, a comprehensive car sales application. This mobile app is designed to work in parallel with the web version, sharing the same backend API but providing a native mobile experience.

## Project Structure

```
/mobile/
  /src/
    /api/            # API client for communication with the backend
    /components/     # Reusable React Native components
    /hooks/          # Custom React hooks
    /navigation/     # Navigation setup using React Navigation
    /screens/        # Screen components for the app
    /utils/          # Utility functions and helpers
    App.tsx          # Main app component
    index.js         # Entry point for the React Native app
```

## Features

- Browse and search for cars
- View detailed car information
- Car size visualization using camera
- Compare different car models
- Contact sellers via form or WhatsApp
- Create and share wishlists
- User registration and authentication
- European unit system (kilometers, euros)

## Technical Implementation

- **React Native**: Core framework for building the mobile app
- **React Navigation**: For handling navigation between screens
- **Native Device Features**: Camera access for car size visualization
- **Shared API Client**: Compatible with the web version backend
- **Responsive Design**: Adapts to different device sizes and orientations

## Setup and Running

### Prerequisites

- Node.js (v14 or later)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Install dependencies:
   ```
   cd mobile
   npm install
   ```

2. For iOS (macOS only):
   ```
   cd ios
   pod install
   cd ..
   ```

3. Run the development server:
   ```
   npm start
   ```

4. Run on Android:
   ```
   npm run android
   ```

5. Run on iOS (macOS only):
   ```
   npm run ios
   ```

## Integration with Web Version

The mobile app uses the same API endpoints as the web version, ensuring data consistency across platforms. The shared code includes:

- Data models (schema.ts)
- API client logic
- Utility functions
- Business logic

## Building for Production

### Android

```
cd mobile
npm run android -- --variant=release
```

### iOS

```
cd mobile
npm run ios -- --configuration Release
```

## Notes

- The car size visualization feature uses a simpler camera-based approach compared to the AR implementation in the web version
- The app is designed to work offline with data caching when possible
- Deep linking is configured to allow opening the app from web links or other apps