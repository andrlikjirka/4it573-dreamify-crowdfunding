# Dreamify - crowdfunding app

## Project description
...

## How to run the project

To run app instance (on port 3000)
1. run `git clone <repository>`
2. run `cd <project>`
3. run `npm install`
4. edit `app.env` and `db.env` files
5. run: `docker compose up --detach`
6. optionally run `node db-seed.js`
7. go to: `http://localhost:3000/`


To run end-to-end tests (using independent test-app instance on port 3001):

8. run tests on your local machine in new terminal window: `npm run test`

### Tech-stack

- Node.js & Express
- Nunjucks templating engine
- Mongoose ODM
- MongoDB
- Websockets
- JSON WebTokens
- Playwright
- PayPal API
- Docker
 
### Functionality

#### Public module
- registration and login process
- dreams categories
- publishing new dreams
- contribution to dream authors using PayPal (helping to make their dreams come true)
- real-time updates when a new contribution made
- user profile
- author's dreams 

#### Administration module
- dreams approval process
- dream administration
- users administration


