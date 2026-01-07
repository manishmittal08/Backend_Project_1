# Backend Project – Authentication, Products & Cart

This is my backend project built using **Node.js, Express, MongoDB and EJS**.  
I created this project to practice backend development concepts like authentication, authorization, CRUD operations, middleware, and session-based cart functionality.

This project helped me understand how real backend applications work step by step.

---

## What I Learned from This Project

- How JWT authentication works
- How middleware protects routes
- Difference between `req.user` and `res.locals.currentUser`
- How admin and user roles are handled
- How session-based cart works
- How backend data is rendered in EJS

---

## Features

### User Authentication
- User Signup & Login
- Password hashing using **bcrypt**
- JWT based authentication
- Token stored in cookies
- Protected routes using middleware

---

### Roles & Authorization
- Admin and Normal User roles
- User role stored in MongoDB

**Admin can:**
- Add products
- Edit products
- Delete products

**Normal User can:**
- View products
- Add products to cart
- Increase or decrease product quantity in cart

---

### Product Management
- Add, edit and delete products (Admin only)
- Product details:
  - Image
  - Price
  - Description
  - Category
- Product listing using EJS templates

---

### Cart (Session Based)
- Cart stored using **express-session**
- Add products to cart
- Increase or decrease quantity
- Cart persists during session
- Grand total calculation
- Cart page built using EJS

---

## Tech Stack Used

- Node.js
- Express.js
- MongoDB (Mongoose)
- EJS
- JWT (jsonwebtoken)
- bcrypt
- cookie-parser
- express-session

---

## How Authentication Works

1. User logs in
2. JWT token is generated
3. Token is stored in cookies
4. Middleware verifies the token
5. Logged-in user is attached to `req.user`
6. `res.locals.currentUser` is used to access user data inside EJS files

---

## Admin Logic

- User role is saved in database
- `isAdmin` middleware checks:
  - User is logged in
  - User role is `admin`
- Only admin can access product create, edit and delete routes

---

## Cart Logic (Simple Explanation)

- Cart data is stored in `req.session.cart`
- Each cart item contains:
  - Product details
  - Quantity
- If the same product is added again:
  - Quantity increases
- Grand total is calculated on cart page

---

## Project Folder Structure

Authentication/
│
├── middlewares/
│ ├── attachUser.js
│ └── isAdmin.js
│
├── models/
│ ├── user.js
│ └── product.js
│
├── views/
│ ├── products.ejs
│ ├── cart.ejs
│ ├── login.ejs
│ ├── addProducts.ejs
│ ├── editProduct.ejs
│ └── users.ejs
│
├── public/
│ ├── images/
│ ├── stylesheet/
│ │ └── style.css
│ └── javascripts/
│ └── script.js
│
├── app.js
├── .gitignore
├── package.json
├── package-lock.json

---

## How to Run the Project

1. Clone the repository
     ```bash
    - git clone https://github.com/manishmittal08/Backend_Project_1.git
   
2. Go inside project folder 
    - cd Backend_Project_1

4. Install dependencies
    - npm install
   
5. Create .env file
    - PORT=4000
   
6. Start the server
    - nodemon app.js
   
8. Open browser and visit
    - http://localhost:4000
