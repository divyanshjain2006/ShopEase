# Ethnic Threads — E-commerce Web Application

A full-stack MERN e-commerce app built for a CSE internship project.

## Stack

- Frontend: React + Vite, React Router, Redux Toolkit, Axios, CSS
- Backend: Node.js + Express
- Database: MongoDB (MongoDB Atlas or local) + Mongoose
- Auth: JWT + bcrypt
- Payments: Stripe TEST MODE only
- Dev: GitHub Codespaces-friendly, basic Docker support

## Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB) with connection string
- Stripe account (TEST MODE keys from https://dashboard.stripe.com/apikeys)

## Quick start

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Copy `server/.env.example` to `server/.env` and fill in real values:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` — Stripe test secret key (`sk_test_...`)
- Optional: `STRIPE_WEBHOOK_SECRET` if using Stripe CLI webhooks
- `PORT` (default 5000)
- `CLIENT_URL` (default http://localhost:5173)
- `BASE_URL` (default http://localhost:5173)

The client uses `client/.env` for the API base URL:

```bash
# client/.env (already included)
VITE_API_URL=http://localhost:5000/api
```

If you use the Vite proxy, you can point `VITE_API_URL` to the same origin; the proxy forwards `/api` to the backend.

### 3. Start backend

```bash
cd server
npm run dev
```

The backend connects to MongoDB and exposes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/categories`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/products/seed` (admin) — seeds sample data if collection is empty
- `POST /api/orders` — create order from cart
- `GET /api/orders/mine` — current user orders
- `GET /api/orders/:id` — single order
- `GET /api/orders` (admin) — all orders
- `PUT /api/orders/:id/status` (admin)
- `POST /api/orders/:id/cancel` (user owns order)
- `POST /api/stripe/create-checkout-session` — Stripe TEST checkout
- `POST /api/stripe/webhook` — optional Stripe webhook

### 4. Start frontend

```bash
cd client
npm run dev
```

Frontend runs on http://localhost:5173 by default.

### 5. Seed sample products (one-time)

After logging in as admin, visit:

```
http://localhost:5173/admin
```

Then use the Admin dashboard or call:

```
POST /api/products/seed
```

This seeds 8 sample products only if the products collection is empty.

## Testing checklist

Use Postman (or the browser UI) to verify:

1. Register a new user
2. Login and verify JWT is stored in localStorage
3. Get products list and product detail
4. Search products and filter by category
5. Add product to cart and adjust quantity
6. Create an order from the cart
7. View order history
8. Admin: create/edit/delete products
9. Admin: update order status
10. Stripe TEST checkout: add items to cart, click "Checkout with Stripe (test)"
    - Use Stripe test card `4242 4242 4242 4242` with any future expiry, any CVC, any ZIP
    - On success, you are redirected back to `/orders?success=true`
    - The order is created in MongoDB via the backend order endpoint triggered before Stripe redirect (cart submission), so the order exists even before Stripe payment completion in this simple implementation.

## Default sample users

For testing, register your own users via the UI. Admin access is granted only by setting `role: 'admin'` on a user document in MongoDB. You can do this via MongoDB Compass/Atlas UI or a one-off script.

To make a user an admin quickly, run in MongoDB:

```js
db.users.updateOne({ email: 'your@email.com' }, { $set: { role: 'admin' } })
```

## Docker

A basic Dockerfile may be added later if needed. The app is designed to run without Docker for development.

## Environment secrets

Never commit `.env`. The following are kept out of version control:

- `MONGODB_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Known limitations

- Stripe checkout creates a payment link and redirects; order creation is done before redirect in this simple flow. For a stricter flow, you can rely on the Stripe webhook to confirm payment and update the order status.
- No email verification, password reset, or advanced input sanitization beyond Mongoose validation.
- Stock is not decremented automatically on order creation; this is an internship-scoped simplification.
