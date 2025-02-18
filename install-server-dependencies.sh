#!/bin/bash

set -e

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

log_message "\033[1;33m" "Enabling Nginx to start on system boot"
sudo systemctl enable nginx || { log_message "\033[0;31m" "Error: Enabling Nginx to start on boot failed"; exit 1; }

log_message "\033[1;33m" "Starting Nginx if it's not already running"
sudo systemctl start nginx || { log_message "\033[0;31m" "Error: Starting Nginx service failed"; exit 1; }

log_message "\033[1;33m" "Setting PM2 to run on system boot"
sudo pm2 startup systemd -u $(whoami) --hp $HOME || { log_message "\033[0;31m" "Error: PM2 startup failed"; exit 1; }

log_message "\033[0;32m" "All steps completed successfully!"
