# AutoMarket Mobile App

This is the React Native mobile app for AutoMarket, a car marketplace application that allows users to browse, compare, and inquire about vehicles.

## Features

- **Browse Cars**: View all available cars with filtering options
- **Car Details**: Detailed view of each car with specifications
- **Size Visualization**: Compare car sizes in your environment using the camera
- **Car Comparison**: Compare multiple cars side by side
- **Wishlists**: Create and manage car wishlists
- **User Registration**: Register to save preferences and wishlists

## Project Structure

- `src/api`: API client for communicating with the backend
- `src/components`: Reusable UI components
- `src/screens`: Main application screens
- `src/navigation`: Navigation configuration
- `src/utils`: Utility functions like unit conversion

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd mobile
   npm install
   ```

### Running the App

#### iOS

```
npm run ios
```

#### Android

```
npm run android
```

## Development

### API Integration

The application uses a shared API client (`src/api/apiClient.ts`) that communicates with the backend server. The same client is used in both the web and mobile applications, ensuring consistency.

### Navigation

The app uses React Navigation for handling screen transitions. The navigation configuration is defined in `src/navigation/AppNavigator.tsx`.

### UI Components

Reusable UI components are stored in the `src/components` directory. These components are designed to be responsive and work across different device sizes.

## Testing on iPhone

For detailed instructions on how to test the application on an iPhone, please refer to the [IPHONE_SETUP.md](./IPHONE_SETUP.md) document.

## Troubleshooting

If you encounter issues during development or when running the application, check the following:

- Make sure all dependencies are installed correctly
- For iOS, run `pod install` in the `ios` directory
- Check that the API URL is set correctly in `src/api/apiClient.ts`
- Verify that your development environment is set up correctly following React Native guidelines

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request