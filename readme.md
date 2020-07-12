# Pickup
#### `Pickup` is a shopping cart built in Node.js (Express, MongoDB, Redis), including features: Third-party login, Full-text search, deployed on AWS EC2.
![homepage](https://i.imgur.com/QwC6ecF.jpg)
-  [**View demo**](http://ec2-3-136-24-168.us-east-2.compute.amazonaws.com:4000/)
-  [**View admin-demo**](http://ec2-3-136-24-168.us-east-2.compute.amazonaws.com:4000/admin)
```
Demo Credentials:
------------------------
Customer:
    email:test@test.com
    password:test

Admin:
    email:admin@admin.com
    password:admin
```


## Stack
1. Backend: Node.Js (Express.Js)
2. Frontend: HTML, CSS, Bootstrap
3. Database: MongoDB, Redis(Session Store)
4. Deployment: 
   * [AWS EC2](http://ec2-3-136-24-168.us-east-2.compute.amazonaws.com:4000/)
   * Heroku
5. [Docker](https://hub.docker.com/layers/yoyochingyu/shoppingsite_web/version1/images/sha256-b6e2aca404a231c6c330c24f1ea8deff96d59b27feb2d29cdb945a28d4d2de91?context=repo)

## Feautres
1. Integrated **third party login** ([Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2))
   * Simplify login procedures and increase the number of potential customers.
2. Full text search
3. Categories and Sizing options
   * Providing two categories and three sizing options (Cloth, shoes, free-size)
5. Admin management
   * Edit/ Add new products
   * Manage customers and orders 
6. Allowed cart function **before login**
   * Customers can add products into cart before they register/login. 
Only when checkout should they log in.
   * Ease the difficulty of retrieving new customers.

## Installation
### 1. Docker
- Requirements: Docker engine & Docker compose.
```bash=
# Pull docker-compose.yml from github
$ wget "https://raw.githubusercontent.com/yoyochingyu/ShoppingSite/master/docker-compose.yml"

# Edit env
$ vim .env

# Copy and paste the following into .env
GOOGLE_OAUTH_CLIENTID='YOUR_OWN_CLIENTID'
GOOGLE_OAUTH_SECRET='YOUR_OWN_SECRET'
GOOGLE_OAUTH_REDIRECTURL='YOUR_OWN_REDIRECTURL'

# Run application
$ docker-compose up
```
- Visit http://127.0.0.1:4000 in your browser for customer view.
Visit http://127.0.0.1:4000/admin for admin view.
### 2. Local
- Reqirements: Install and run mongoDB and redis.
```bash=
# Clone the repo
$ git clone "https://github.com/yoyochingyu/ShoppingSite.git"

# Change directory
$ cd ShoppingSite

# Install dependencies
$ npm install

# Edit env
$ vim .env

# Copy and paste the following into .env
GOOGLE_OAUTH_CLIENTID='YOUR_OWN_CLIENTID'
GOOGLE_OAUTH_SECRET='YOUR_OWN_SECRET'
GOOGLE_OAUTH_REDIRECTURL='YOUR_OWN_REDIRECTURL'
REDIS_HOST=localhost
MONGODB_URL=mongodb://localhost:27017

# Run application
$ node app.js
```


## Coming Soon
1. ElasticSearch
2. Facebook login
3. Travis CI
4. Nodemailer for authentication
5. Flash
