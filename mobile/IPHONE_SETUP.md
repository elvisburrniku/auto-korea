# iPhone Development Setup Guide for Auto Korea Kosova Import

This guide will walk you through setting up your environment for native iOS development of the Auto Korea Kosova Import mobile app.

## Prerequisites

Before you begin, make sure you have:

1. **macOS computer** - Required for iOS development
2. **Apple Developer Account** - Either paid ($99/year) or free (with limitations)
3. **Xcode** - Download the latest version from the Mac App Store
4. **Node.js and npm** - Make sure you have Node.js v16 or newer installed

## Setup Steps

### 1. Install Development Tools

```bash
# Install CocoaPods (Ruby gem for iOS dependency management)
sudo gem install cocoapods

# Install React Native CLI globally
npm install -g react-native-cli
```

### 2. Configure Xcode

1. Open Xcode
2. Go to Preferences > Accounts
3. Add your Apple ID
4. Download Manual Profiles if prompted

### 3. Clone and Setup the Project

```bash
# Navigate to the project directory
cd mobile

# Install JavaScript dependencies
npm install
```

### 4. Configure iOS Project

```bash
# Install iOS dependencies using CocoaPods
cd ios
pod install
cd ..
```

### 5. Running on Simulator

```bash
# Start the Metro bundler
npx react-native start

# In another terminal, run the iOS app
npx react-native run-ios
```

### 6. Running on Physical Device

#### Prepare your iOS device:
1. Connect your iPhone to your Mac with a USB cable
2. Open Xcode
3. Go to Window > Devices and Simulators
4. Select your device and make sure it's recognized

#### Configure app for your device:
1. Open `ios/Auto Korea Kosova Import.xcworkspace` in Xcode
2. Select your project in the Project Navigator
3. Select the "Auto Korea Kosova Import" target
4. Go to the "Signing & Capabilities" tab
5. Select your development team
6. Make sure "Automatically manage signing" is checked

#### Run on your device:
```bash
# Run the app on your connected device
npx react-native run-ios --device
```

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Make sure all dependencies are installed
   - Try cleaning the build: `cd ios && xcodebuild clean && cd ..`
   - Check for CocoaPods issues: `cd ios && pod install --repo-update && cd ..`

2. **Device Not Recognized**:
   - Make sure your device is unlocked
   - Trust your computer on the device if prompted
   - Check your USB cable and try a different port

3. **Signing Issues**:
   - Verify your Apple Developer account is properly set up in Xcode
   - Try using a personal development team for testing
   - Check that your bundle identifier is unique (e.g., com.yourname.Auto Korea Kosova Import)

4. **App Crashing on Launch**:
   - Check the Metro bundler console for JavaScript errors
   - Look for native crash logs in Xcode > Window > Devices and Simulators > View Device Logs

## Alternative: Using Expo

If you're encountering difficulties with the native iOS setup, consider using Expo Go for testing as described in the `EXPO_GO_QUICK_START.md` guide. It's much simpler for testing purposes.

## Advanced Configuration

### Custom App Icons and Splash Screens

The app icons and splash screens are located in:
- `ios/Auto Korea Kosova Import/Images.xcassets/AppIcon.appiconset/`
- `ios/Auto Korea Kosova Import/Images.xcassets/SplashScreen.imageset/`

You can modify these using Xcode's Asset Catalog editor.

### Debugging

1. **React Native Debugger**:
   - Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
   - Run `open "rndebugger://set-debugger-loc?host=localhost&port=8081"`
   - Enable debugging in the app's developer menu (shake device or press Cmd+D in simulator)

2. **Native Code Debugging**:
   - Use Xcode's debugging tools when running through Xcode
   - Set breakpoints in Swift/Objective-C code

## Publishing to App Store

1. Configure app signing in Xcode with your Production certificate
2. Create an App Store Connect entry for your app
3. Build for release: `npx react-native run-ios --configuration Release`
4. Use Xcode to upload the build to App Store Connect
5. Complete the submission process in App Store Connect

## Resources

- [React Native Documentation](https://reactnative.dev/docs/environment-setup)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Need Help?

If you encounter issues not covered in this guide, please:
1. Check the React Native documentation
2. Look for similar issues on Stack Overflow
3. Reach out to the project maintainers