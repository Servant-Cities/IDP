# IDP
Tools we need to operate our development and hosting processes

## How to run on your server

You can prepare the server running the following command (don't forget to update the <parameters>):
```
curl -L https://raw.githubusercontent.com/Servant-Cities/IDP/main/installation/install-server-dependencies.sh | sudo bash -s -- --lets-encrypt-email <your-email> --domain <domain-to-use-for-the-idp>
```

## Web UI

### Connect to the web UI
Assuming you are testing locally or have access to the server, you can get a login token using the IDP's command line interface:

MacOS
```
sh cli/generate-login-token.sh --token-dir /tmp/login_tokens
```

Linux
```
sh cli/generate-login-token.sh
```

### Test web UI locally
This process requires you to [install pm2 globally](https://pm2.io/docs/runtime/guide/installation/) and have available PORT 3000.


Go to the IDP folder and install dependencies
```
cd IDP
cd frontend
yarn
cp .env.example .env
```

Update your .env file
```
REPOSITORIES_PATH="./repositories"
SITES_AVAILABLE_PATH="./sites-available"
```

You can mock the server data like that (unopinionated but not ideal):
```
mkdir repositories
mkdir sites-available

cd repositories
git clone https://github.com/Servant-Cities/IDP.git

cd ../
yarn build
pm2 start build/index.js

cd sites-available
nano test.example.org.conf
```

Add the following content to the test.example.org.conf file
```
server {
    listen 80;
    server_name test.example.org;

    # Let’s Encrypt challenge (ACME HTTP-01 challenge for SSL validation)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name test.example.org;

    ssl_certificate /etc/letsencrypt/live/test.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test.example.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:...';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use the development mode and access it http://localhost:5173 if you want to modify the app and see live updates:
```
cd ../
yarn dev
```

Or access the app already running on port http://localhost:3000 (You will not see modifications)
