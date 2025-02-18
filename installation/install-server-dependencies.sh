#!/bin/bash

set -e

LETS_ENCRYPT_EMAIL=""
DOMAIN=""

# Function to display usage information
usage() {
  echo -e "\033[0;31mUsage: $0 --lets-encrypt-email <lets-encrypt-email> --domain <domain>\033[0m"
  exit 1
}

# Parse named arguments
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --lets-encrypt-email)
      LETS_ENCRYPT_EMAIL="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    *)
      echo -e "\033[0;31mUnknown parameter: $1\033[0m"
      usage
      ;;
  esac
done

# Ensure both arguments are provided
if [[ -z "$LETS_ENCRYPT_EMAIL" || -z "$DOMAIN" ]]; then
  echo -e "\033[0;31mError: Missing required arguments.\033[0m"
  usage
fi

log_message() {
  local color="$1"
  local message="$2"
  echo -e "${color}${message}\033[0m"
}

log_message "\033[1;33m" "Updating package lists"
sudo apt update -y || { log_message "\033[0;31m" "Error: apt update failed"; exit 1; }

log_message "\033[1;33m" "Installing Node.js and npm"
sudo apt install -y nodejs npm || { log_message "\033[0;31m" "Error: Node.js and npm installation failed"; exit 1; }

log_message "\033[1;33m" "Installing Yarn globally"
sudo npm install --global yarn || { log_message "\033[0;31m" "Error: Yarn installation failed"; exit 1; }

log_message "\033[1;33m" "Installing PM2 globally"
sudo yarn global add pm2 || { log_message "\033[0;31m" "Error: PM2 installation failed"; exit 1; }

log_message "\033[1;33m" "Installing Git"
sudo apt-get install -y git || { log_message "\033[0;31m" "Error: Git installation failed"; exit 1; }

log_message "\033[1;33m" "Installing Nginx"
sudo apt install -y nginx || { log_message "\033[0;31m" "Error: Nginx installation failed"; exit 1; }

log_message "\033[1;33m" "Installing Certbot and Nginx plugin"
sudo apt install -y certbot python3-certbot-nginx || { log_message "\033[0;31m" "Error: Certbot installation failed"; exit 1; }

log_message "\033[1;33m" "Enabling Nginx to start on system boot"
sudo systemctl enable nginx || { log_message "\033[0;31m" "Error: Enabling Nginx to start on boot failed"; exit 1; }

log_message "\033[1;33m" "Creating /services directory if it does not exist"
mkdir -p ~/services || { log_message "\033[0;31m" "Error: Failed to create /services directory"; exit 1; }

log_message "\033[1;33m" "Changing directory to /services"
cd ~/services || { log_message "\033[0;31m" "Error: Failed to enter /services directory"; exit 1; }

log_message "\033[1;33m" "Cloning repository: Servant-Cities/IDP"
git clone https://github.com/Servant-Cities/IDP.git || { log_message "\033[0;31m" "Error: Failed to clone repository"; exit 1; }

log_message "\033[1;33m" "Entering repository folder: IDP"
cd ~/services/IDP || { log_message "\033[0;31m" "Error: Failed to enter IDP directory"; exit 1; }

log_message "\033[1;33m" "Giving execution rights to all files in ./installation"
chmod +x ./installation/* || { log_message "\033[0;31m" "Error: Failed to set execution rights on installation files"; exit 1; }

log_message "\033[1;33m" "Running setup-nginx.sh with email: $LETS_ENCRYPT_EMAIL and domain: $DOMAIN"
./installation/setup-nginx.sh --lets-encrypt-email "$LETS_ENCRYPT_EMAIL" --domain "$DOMAIN" || { log_message "\033[0;31m" "Error: setup-nginx.sh failed"; exit 1; }

log_message "\033[0;32m" "All steps completed successfully!"
