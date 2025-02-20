#!/bin/bash

set -e

# Check for domain and lets-encrypt-email arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --domain) DOMAIN="$2"; shift ;;
        --lets-encrypt-email) LETS_ENCRYPT_EMAIL="$2"; shift ;;
        *) echo "Unknown option $1"; exit 1 ;;
    esac
    shift
done

# Validate domain and lets-encrypt-email arguments
if [[ -z "$DOMAIN" || -z "$LETS_ENCRYPT_EMAIL" ]]; then
    echo "Both --domain and --lets-encrypt-email must be specified."
    exit 1
fi

# Define the path to the Nginx configuration directories
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
CONFIG_FILE="$NGINX_CONF_DIR/$DOMAIN.conf"
CERTBOT_CHALLENGE_DIR="/var/www/certbot"

# Ensure Certbot challenge directory exists
mkdir -p "$CERTBOT_CHALLENGE_DIR"

# Remove default Nginx config if it exists
if [[ -f "$NGINX_CONF_DIR/default" ]]; then
    echo "Removing default Nginx configuration..."
    rm -f "$NGINX_CONF_DIR/default"
fi

if [[ -L "$NGINX_ENABLED_DIR/default" ]]; then
    rm -f "$NGINX_ENABLED_DIR/default"
fi

# Stop Nginx temporarily to allow Certbot standalone challenge
echo "Stopping Nginx to allow Certbot standalone challenge..."
systemctl stop nginx

# Obtain SSL certificate using Certbot standalone mode
echo "Requesting SSL certificate for $DOMAIN from Let's Encrypt..."
certbot certonly --standalone -d "$DOMAIN" --agree-tos --email "$LETS_ENCRYPT_EMAIL" --non-interactive || {
    echo "❌ Failed to obtain SSL certificate for $DOMAIN"
    exit 1
}

# Generate the Nginx configuration file for the domain
cat <<EOF > "$CONFIG_FILE"
server {
    listen 80;
    server_name $DOMAIN;

    # Let’s Encrypt challenge (ACME HTTP-01 challenge for SSL validation)
    location /.well-known/acme-challenge/ {
        root $CERTBOT_CHALLENGE_DIR;
    }

    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:...';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    location / {
        proxy_pass http://127.0.0.1:2024;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Remove existing symbolic link if it exists
if [[ -L "$NGINX_ENABLED_DIR/$DOMAIN.conf" ]]; then
    rm "$NGINX_ENABLED_DIR/$DOMAIN.conf"
fi

# Create a new symbolic link
ln -s "$CONFIG_FILE" "$NGINX_ENABLED_DIR/"

echo "Starting Nginx..."
systemctl start nginx

# Test Nginx configuration before reloading
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx configuration for $DOMAIN has been set up successfully!"
else
    echo "❌ Nginx configuration test failed. Reverting changes."
    rm "$CONFIG_FILE"
    exit 1
fi
