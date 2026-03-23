# AryavartCart

AryavartCart is a modern, full-stack dropshipping e-commerce platform built on the MERN stack. Designed with a rich, traditional Indian aesthetic featuring warm saffron and terracotta colors, AryavartCart delivers a premium shopping experience with a seamless frontend and robust backend management.

## Features

### Customer Features
- **Modern Traditional UI**: A beautiful, responsive design blending traditional Indian aesthetics with modern web design principles using Tailwind CSS.
- **Product Browsing & Purchasing**: Comprehensive product catalogs, individual product pages, shopping cart, and seamless checkout.
- **Secure Authentication**: User registration and login powered by JSON Web Tokens (JWT).
- **Secure Payments**: Fully integrated Stripe checkout for processing credit cards securely.
- **Order Tracking**: Customers can view their personal order history and current statuses.

### Administrator Features
- **Admin Dashboard**: A centralized hub to view store statistics, recent orders, and top products.
- **Product Management**: Full CRUD capabilities for the store's inventory. Add new items, update pricing and details, and securely manage stock.
- **Image Uploads**: Direct local image uploading capabilities with live thumbnail previews powered by Multer.
- **Automated Stock Management**: Product quantities represent real-world physical stock, automatically decrementing upon successful user checkout to prevent overselling.
- **Order Management**: A comprehensive detailed view of all store transactions including customer credentials, shipping coordinates, and line-item financial breakdowns.
- **Order Lifecycle**: Editable order statuses (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) complete with Tracking Number support.

## Technology Stack

- **Frontend**: React (Vite), React Router DOM, Redux Toolkit, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Payment Processing**: Stripe API
- **File Management**: Multer (Local disk storage)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Environment Setup

Create a `.env` file in the `backend/` directory based on the following structure:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/dropship
JWT_SECRET=your_jwt_secret_key

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email setup for confirmations
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

> **Note**: For local image uploads to work out of the box, `multer` expects a `backend/uploads` directory. The upload route automatically handles directory creation if it doesn't exist.

### Running the Application Locally

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

2. **Start the Frontend Application**
   In a new terminal window:
   ```bash
   cd frontend
   npm run dev
   ```
   The application will start on `http://localhost:5173`.

## Admin Access

To access the Admin features:
1. Register a new user account through the frontend UI.
2. Directly modify your user record in the connected MongoDB database, changing the `role` field from `"user"` to `"admin"`.
3. Log in with the updated account to reveal the Admin Dashboard routing.
