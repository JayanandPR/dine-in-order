# Dine-In-Order

A full-stack restaurant digital ordering platform.

## Stack
- **Server**: Express + TypeScript, MongoDB (Mongoose), JWT auth, WebSockets, QR code generation, Razorpay payments
- **Admin**: React + TypeScript + Vite (port 5174) — restaurant setup, menu, tables, staff, orders, bills
- **Staff**: React + TypeScript + Vite (port 5175) — live order queue, table status (WebSocket real-time)
- **Customer**: React + TypeScript + Vite (port 5176) — QR scan → menu → cart → order → payment

## Getting started

### 1. Install dependencies (in each folder separately)
```bash
cd server   && npm install
cd ../admin && npm install
cd ../staff && npm install
cd ../customer && npm install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Fill in: MONGODB_URI, JWT secrets, Cloudinary keys, Razorpay keys
cp customer/.env.example customer/.env
# Fill in: VITE_RAZORPAY_KEY_ID
```

### 3. Run all four in separate terminals
```bash
cd server   && npm run dev   # http://localhost:3000
cd admin    && npm run dev   # http://localhost:5174
cd staff    && npm run dev   # http://localhost:5175
cd customer && npm run dev   # http://localhost:5176
```

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/refresh | — | Refresh access token |
| POST | /api/auth/logout | Bearer | Logout |
| GET  | /api/auth/me | Bearer | Current user + restaurant |
| POST | /api/restaurants | admin | Create restaurant |
| GET  | /api/restaurants/mine | admin | Get own restaurant |
| PUT  | /api/restaurants/mine | admin | Update restaurant |
| GET  | /api/restaurants/:id/public | — | Public restaurant info |
| GET  | /api/menu/:restaurantId/categories | — | List categories |
| POST | /api/menu/categories | admin | Create category |
| DELETE | /api/menu/categories/:id | admin | Delete category + items |
| GET  | /api/menu/:restaurantId/items | — | List menu items |
| POST | /api/menu/items | admin | Add food item |
| PUT  | /api/menu/items/:id | admin | Update food item |
| DELETE | /api/menu/items/:id | admin | Delete food item |
| GET  | /api/tables/:restaurantId | auth | Get tables |
| POST | /api/tables | admin | Add table + generate QR |
| PATCH | /api/tables/:id/status | admin/staff | Update table status |
| DELETE | /api/tables/:id | admin | Delete table |
| GET  | /api/cart/:tableId | — | Get cart |
| POST | /api/cart | — | Add to cart |
| PATCH | /api/cart/:id | — | Update cart item qty |
| DELETE | /api/cart/:id | — | Remove cart item |
| DELETE | /api/cart/clear/:tableId | — | Clear cart |
| POST | /api/orders | — | Place order from cart |
| GET  | /api/orders/restaurant/:id | admin/staff | All orders |
| GET  | /api/orders/table/:tableId | — | Table orders |
| PATCH | /api/orders/:id/status | admin/staff | Update order status |
| POST | /api/bills | admin/staff | Generate bill |
| GET  | /api/bills/table/:tableId | — | Get table bill |
| POST | /api/bills/create-payment | — | Create Razorpay order |
| POST | /api/bills/verify-payment | — | Verify payment |
| GET  | /api/bills/restaurant/:id | admin | All bills |
| GET  | /api/staff | admin | List staff |
| POST | /api/staff | admin | Create staff account |
| DELETE | /api/staff/:id | admin | Remove staff |

## WebSocket
Connect to: `ws://localhost:3000/ws?token=<accessToken>&restaurantId=<id>`

Events received:
- `order:new` — new order placed (for staff/admin)
- `order:status_update` — order status changed (for customer + staff)
- `table:status_update` — table status changed
- `bill:generated` — bill is ready (for customer)
