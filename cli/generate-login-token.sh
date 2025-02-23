#!/bin/bash

# Default token directory (Linux)
TOKEN_DIR="/dev/shm/login_tokens"
EXPIRATION_TIME=6000

# Parse command-line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --token-dir) TOKEN_DIR="$2"; shift ;;  # Override TOKEN_DIR
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Create token directory if it doesn't exist
mkdir -p "$TOKEN_DIR" || { echo "Error: Failed to create directory $TOKEN_DIR"; exit 1; }

# Generate token
TOKEN=$(openssl rand -hex 16)
TIMESTAMP=$(date +%s)

# Save timestamp to token file
echo "$TIMESTAMP" > "$TOKEN_DIR/$TOKEN" || { echo "Error: Failed to write token file"; exit 1; }

# Output generated token
echo "$TOKEN"
