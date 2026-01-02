# Backend Project – Authentication & Products

This is my backend project made using **Node.js, Express, MongoDB and EJS**.  
I created this project to practice backend concepts like authentication, authorization, CRUD operations, and middleware.

---

## Features

- User Signup & Login
- Password hashing using bcrypt
- JWT based authentication
- Admin and Normal User roles
- Admin can:
  - Add products
  - Edit products
  - Delete products
- Normal user can:
  - View products
- Product listing with image, price, description, and category
- Middleware for user authentication
- EJS used for frontend views

---

## Tech Stack Used

- Node.js
- Express.js
- MongoDB (Mongoose)
- EJS
- JWT (jsonwebtoken)
- bcrypt
- cookie-parser

---

## How Authentication Works

- User logs in
- JWT token is created and stored in cookies
- Middleware checks the token
- Logged in user is attached to `req.user`
- `res.locals.currentUser` is used to access user in EJS files

---

## Admin Logic

- User role is stored in database
- Middleware checks:
  - If user exists
  - If user role is `admin`
- Only admin can access product create, edit and delete routes

---

## How to Run the Project

1. Clone the repository
   ```bash
   git clone https://github.com/manishmittal08/Backend_Project_1.git


