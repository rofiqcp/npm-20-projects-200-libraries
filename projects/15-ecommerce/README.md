# Project 15: E-Commerce Full-Stack Platform

**Complexity:** ⭐⭐⭐⭐⭐  
**Duration:** 4-5 weeks  
**Database:** PostgreSQL + Redis  
**Level:** Advanced

## Overview
Build a complete e-commerce platform with shopping cart, payment integration, and inventory management.

## Tech Stack
- **Frontend:** React + Redux
- **Backend:** Express.js
- **Database:** PostgreSQL + Redis (cache)
- **Payment:** Stripe integration
- **Authentication:** JWT + OAuth
- **File Upload:** Multer + Cloud Storage
- **Search:** Elasticsearch (optional)
- **Admin:** Separate dashboard

## Key Features
- ✅ Product catalog with search/filter
- ✅ Shopping cart persistence
- ✅ Stripe payment integration
- ✅ Order management
- ✅ User reviews & ratings
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Wishlist functionality
- ✅ Inventory tracking

## Tech Dependencies
```bash
# Backend
npm install express pg redis stripe jsonwebtoken cors multer

# Frontend
npm install react redux axios react-router-dom tailwindcss stripe-react
```

## Database Schema
```javascript
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  stock_quantity INT,
  category VARCHAR(100),
  images JSON,
  rating FLOAT,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_amount DECIMAL(10, 2),
  status VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  price DECIMAL(10, 2)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  user_id INT REFERENCES users(id),
  rating INT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
```

## Learning Outcomes
- Complete e-commerce architecture
- Stripe payment processing
- Redux state management
- Inventory management
- User authentication flows
- Admin dashboard design
- Email notifications
- Search optimization

## Project Structure
```
ecommerce/
├── backend/
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   └── payments.js
│   ├── services/
│   │   ├── stripeService.js
│   │   └── emailService.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   └── Admin/
│   │   ├── store/
│   │   │   ├── productSlice.js
│   │   │   ├── cartSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
npm install

# .env
STRIPE_SECRET_KEY=your_stripe_key
POSTGRESQL_URL=postgresql://...
REDIS_URL=redis://...

npm run server
npm run client
```

## Features to Add
- User wish lists
- Product recommendations
- Email newsletter
- Coupon codes
- Shipping integrations
- Multiple payment methods
- Inventory alerts
- Order tracking
- Mobile app

## Resources
- Stripe documentation
- PostgreSQL guide
- Redux documentation
- E-commerce best practices
