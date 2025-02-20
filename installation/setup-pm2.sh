#!/bin/bash

# Get the home directory of the user running with sudo
USER_HOME=$(eval echo ~$SUDO_USER)

# Ensure USER_HOME is set
if [ -z "$USER_HOME" ]; then
  echo "Error: Could not determine user home directory."
  exit 1
fi

# Create the PM2 target directory and logs directory if they don't exist
mkdir -p "$USER_HOME/pm2/logs"

# Define the ecosystem config file path
ecosystem_file="$USER_HOME/pm2/ecosystem.config.js"
cat > "$ecosystem_file" <<EOL
module.exports = {
  apps: [
    {
      name: "IDP Frontend",
      script: "./build/index.js",
      cwd: "$USER_HOME/repositories/IDP/frontend",
      env: {
        NODE_ENV: "production",
        PORT: 2024,
        REPOSITORIES_PATH: "$USER_HOME/repositories"
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M", // Restart if memory exceeds 500MB
      error_file: "$USER_HOME/pm2/logs/idp-frontend-error.log",
      out_file: "$USER_HOME/pm2/logs/idp-frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
EOL

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing..."
  npm install -g pm2
fi

sudo pm2 start "$ecosystem_file" --env production
sudo pm2 save
sudo pm2 startup systemd --user --hp "$USER_HOME"

echo "PM2 is now running with the ecosystem file at $ecosystem_file"
