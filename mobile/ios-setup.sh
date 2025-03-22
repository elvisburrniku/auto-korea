#!/bin/bash

# This script helps set up the iOS environment for the AutoMarket mobile app

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null
then
    echo "Xcode is not installed. Please install Xcode from the Mac App Store first."
    exit 1
fi

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null
then
    echo "CocoaPods is not installed. Installing..."
    sudo gem install cocoapods
else
    echo "CocoaPods is already installed."
fi

# Check if React Native CLI is installed
if ! command -v react-native &> /dev/null
then
    echo "React Native CLI is not installed. Installing..."
    npm install -g react-native-cli
else
    echo "React Native CLI is already installed."
fi

# Create iOS project if it doesn't exist
if [ ! -d "ios" ]; then
    echo "Creating iOS project files..."
    npx react-native init AutoMarketMobile --template react-native-template-typescript --directory temp-ios
    
    echo "Copying iOS files to your project..."
    cp -R temp-ios/ios ./
    rm -rf temp-ios
else
    echo "iOS directory already exists. Skipping iOS project creation."
fi

# Install dependencies
echo "Installing project dependencies..."
npm install

# Install iOS pods
echo "Installing iOS pods..."
cd ios
pod install
cd ..

echo "--------------------------------------------"
echo "Setup complete! Next steps:"
echo "1. Open the iOS project in Xcode: open ios/AutoMarketMobile.xcworkspace"
echo "2. Configure signing with your Apple ID"
echo "3. Connect your iPhone and run the app"
echo "--------------------------------------------"