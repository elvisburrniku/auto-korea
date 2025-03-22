# Exporting and Testing the AutoMarket App on iPhone

This guide will walk you through the process of exporting the AutoMarket mobile app from Replit and setting it up for testing on an iPhone.

## Part 1: Exporting from Replit

1. **Download the project as a ZIP**
   - Click on the three dots (⋮) in the top-right corner of the Replit interface
   - Select "Download as zip"
   - Save the ZIP file to your computer

2. **Extract the ZIP file**
   - Right-click the downloaded ZIP file and select "Extract All" (Windows) or double-click (Mac)
   - Choose a location where you want to extract the files
   - Remember this location as we'll refer to it as `/path/to/extracted/project/`

## Part 2: Setting Up Development Environment

1. **Install Required Software**
   - Install [Node.js](https://nodejs.org/) (v14 or later)
   - Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835) from the Mac App Store
   - Install Xcode Command Line Tools by opening Terminal and running:
     ```bash
     xcode-select --install
     ```

2. **Install React Native CLI**
   - Open Terminal and run:
     ```bash
     npm install -g react-native-cli
     ```

## Part 3: Configure iOS Project

1. **Navigate to the project directory**
   ```bash
   cd /path/to/extracted/project/mobile
   ```

2. **Install project dependencies**
   ```bash
   npm install
   ```

3. **Initialize iOS project files**
   ```bash
   npx react-native init AutoMarketMobile --template react-native-template-typescript --directory ios-setup
   ```

4. **Copy iOS files to your project**
   ```bash
   cp -R ios-setup/ios ./
   rm -rf ios-setup
   ```

5. **Update Pod dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Part 4: Configuration for API Access

1. **Update API URL**
   - Open `src/api/apiClient.ts`
   - Edit the `baseUrl` in the `API_CONFIG` to point to your deployed API:
     ```typescript
     const API_CONFIG = {
       baseUrl: 'https://your-deployed-api-url.com/api',
       // or use your local IP if testing on local network
       // baseUrl: 'http://192.168.1.X:5000/api',
       headers: {
         'Content-Type': 'application/json',
       },
     };
     ```

## Part 5: Prepare Xcode Project

1. **Open the Xcode workspace**
   ```bash
   open ios/AutoMarketMobile.xcworkspace
   ```

2. **Sign the app**
   - In Xcode, select the "AutoMarketMobile" project in the Project Navigator
   - Select the "AutoMarketMobile" target
   - Go to the "Signing & Capabilities" tab
   - Sign in with your Apple ID (if not already signed in)
   - Check "Automatically manage signing"
   - Select your team from the dropdown

3. **Configure app permissions**
   - Still in the "Signing & Capabilities" tab, click "+ Capability"
   - Add the "Camera" capability for the car size visualization feature

4. **Update Info.plist**
   - Find and open `Info.plist`
   - Add the following entries for camera permissions:
     - Key: `NSCameraUsageDescription`
     - Value: `AutoMarket needs camera access for car size visualization`

## Part 6: Run on iPhone

1. **Connect your iPhone to your Mac via USB**

2. **Trust your Mac on your iPhone if prompted**

3. **Select your device in Xcode**
   - In the Xcode toolbar, select your iPhone from the device dropdown

4. **Run the app**
   - Click the "Play" button in Xcode, or press Command+R

5. **Trust the developer on your iPhone**
   - When first launching the app, you may need to trust your developer profile
   - On your iPhone, go to Settings → General → Device Management
   - Select your Apple ID and tap "Trust"

## Troubleshooting

### "Could not connect to development server"
- Make sure your iPhone and Mac are on the same network
- Try using your Mac's IP address in the Metro bundler URL

### Build errors
- Run `npm install` again to ensure all dependencies are installed
- Check Xcode console for specific error details
- Try cleaning the build folder: Xcode → Product → Clean Build Folder

### App crashes on startup
- Check Xcode console for crash logs
- Ensure all required native dependencies are installed and linked properly

## Need Help?

If you encounter issues during this process, you can:
- Check the React Native documentation: https://reactnative.dev/docs/environment-setup
- Search for error messages on Stack Overflow
- Ask for help in the React Native community Discord