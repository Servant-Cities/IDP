#!/bin/bash

# Define USER_HOME
USER_HOME=$(eval echo ~$SUDO_USER)

# Define the target directory
TARGET_DIR="$USER_HOME/repositories/IDP/frontend"

# Navigate to the target directory
cd "$TARGET_DIR" || { echo "Directory $TARGET_DIR not found."; exit 1; }

# Run yarn and yarn build
yarn && yarn build

# Check for the existence of the /build folder and index.js file
if [[ -d "build" && -f "build/index.js" ]]; then
    echo "Build successful: /build/index.js exists."
else
    echo "Build failed: /build/index.js does not exist."
    exit 1
fi
