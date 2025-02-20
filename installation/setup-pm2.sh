#!/bin/bash

# Get the user running the script (the non-root user who used sudo)
RUNNING_USER=$(logname 2>/dev/null || echo "$SUDO_USER")

# Ensure RUNNING_USER is set
if [ -z "$RUNNING_USER" ]; then
  echo "Error: Could not determine the running user."
  exit 1
fi

USER_HOME=$(eval echo ~$RUNNING_USER)

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
        PORT: 2024
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      error_file: "$USER_HOME/pm2/logs/idp-frontend-error.log",
      out_file: "$USER_HOME/pm2/logs/idp-frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
EOL

# Ensure PM2 is installed for the user
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing..."
  npm install -g pm2
fi

# Run PM2 commands as the detected user
su - "$RUNNING_USER" -c "pm2 start '$ecosystem_file' --env production"
su - "$RUNNING_USER" -c "pm2 save"
su - "$RUNNING_USER" -c "pm2 startup systemd --user --hp '$USER_HOME'"

echo "PM2 is now running with the ecosystem file at $ecosystem_file"
