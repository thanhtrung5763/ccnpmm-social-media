## Installation
1. Install NPM packages
    ```sh
    cd api
    npm ci
    ```
    ```sh
    cd client
    npm ci
    ```
    ```sh
    cd socket
    npm ci
    ```
2. Run
    ```sh
    cd api
    npm start
    ```
    ```sh
    cd client
    NODE_OPTIONS=--openssl-legacy-provider npm start 
    ```
    ```sh
    cd socket
    npm start
    ```