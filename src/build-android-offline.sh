#!/bin/bash

# Make script executable in terminal with: chmod +x build-android-offline.sh

echo "Building Android app in offline mode..."

# First attempt to download dependencies in online mode
cd android
./gradlew --refresh-dependencies
cd ..

# Then build in offline mode
cd android
./gradlew assembleDebug --offline
cd ..

# Run with bundled apk
npx expo run:android --no-build

echo "Build completed!"
