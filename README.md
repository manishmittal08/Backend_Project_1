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

### Order Management & Checkout
- Complete checkout flow
- User address and phone validation
- Order placed and saved to MongoDB
- **Automatic Discount System**:
  - 5% discount on purchases ≥ 25,000
  - 10% discount on purchases ≥ 50,000
  - 25% discount on purchases ≥ 100,000
- **Coupon Code System**:
  - `SAVE10` - 10% additional discount
  - `SAVE25` - 25% additional discount
  - Coupons applied on top of automatic discounts
- Order confirmation email sent to user
- Order success page with details
- Order status tracking (default: "Placed")

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
- nodemailer (for order confirmation emails)

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

## Discount & Coupon Logic

### Automatic Discount
- Based on cart grand total:
  - Below 25,000: No discount
  - 25,000 - 49,999: 5% discount
  - 50,000 - 99,999: 10% discount
  - 100,000+: 25% discount

### Coupon Codes
- `SAVE10`: Gives 10% additional discount on the discounted price
- `SAVE25`: Gives 25% additional discount on the discounted price
- Coupons are stacked on top of automatic discounts

### Order Placement
- User must enter valid address and phone number
- Phone validation: Must follow Indian format (+91 + 6-9 + 9 digits)
- Order is saved with all discount details
- Confirmation email is sent to user

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
│ ├── product.js
│ └── order.js
│
├── views/
│ ├── index.ejs
│ ├── products.ejs
│ ├── cart.ejs
│ ├── checkout.ejs
│ ├── orderSuccess.ejs
│ ├── login.ejs
│ ├── addProducts.ejs
│ ├── editProduct.ejs
│ ├── edit.ejs
│ └── users.ejs
│
├── public/
│ ├── images/
│ ├── stylesheet/
│ │ └── style.css
│ └── javascripts/
│ └── script.js
│
├── utils/
│ └── sendMail.js
│
├── app.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

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
