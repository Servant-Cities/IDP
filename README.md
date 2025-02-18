# IDP
Tools we need to operate our development and hosting processes

## How to run

You can prepare the server running the following command (don't forget to update the <parameters>):
```
curl -L https://raw.githubusercontent.com/Servant-Cities/IDP/main/installation/install-server-dependencies.sh | sudo bash -s -- --lets-encrypt-email <your-email> --domain <domain-to-use-for-the-idp>
```