🏛️ Auction House — API

The backend for a full-stack vintage auction platform — handles auth, auctions, real-time bidding, and everything in between. Built as a decoupled REST API, not tied to any specific frontend.

📦 Stack

Express
PostgreSQL + Prisma 7
Socket.io
JWT (jsonwebtoken + bcryptjs)
Zod
Supabase Storage (image uploads)
node-cron
Helmet + express-rate-limit

✨ Quick start

bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

You'll need a .env with DATABASE_URL, JWT_SECRET, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY before anything works.

🗂️ What it does

Auth — register/login with hashed passwords and JWT, /auth/me for the current user
Auctions — full CRUD with category filtering, price range, search, and sorting; owners can edit or delete only if no bids have landed yet
Bids — placing a bid validates the amount, blocks self-bidding, runs inside a Prisma transaction, and triggers anti-sniping (bids in the final stretch push the deadline back)
Real-time — Socket.io rooms per auction broadcast new bids to everyone watching, live
Auto-closing — a cron job sweeps expired auctions and flips their status, so nothing lingers as "active" past its deadline
Image uploads — Multer parses the file, Supabase Storage hosts it, the public URL gets saved on the auction

🔒 Security

Helmet for headers, rate limiting on auth routes (stricter) and general routes, Zod validation on every input, and a centralized error-handling middleware so nothing leaks a raw stack trace.

🤖 How it works

Auth uses JWT with the user's id and role baked into the token, verified by middleware that attaches req.user before any protected route runs. Placing a bid is the trickiest part — it checks the auction is active, isn't the bidder's own listing, and beats the current price, then wraps the bid creation and price update in a single transaction so the two can never go out of sync. Right after that succeeds, the server emits a new-bid event into that auction's Socket.io room, so every connected client sees the update instantly without polling. A separate cron job runs on an interval, closing out any auction whose deadline has passed — independent of whether anyone's actively bidding on it.

📁 Project structure

src/
  controllers/           # Route handler logic (auth, auctions, bids, users)
  routes/                 # Express route definitions
  middleware/              # Auth middleware, error handler
  schemas/                 # Zod validation schemas
  jobs/                    # Cron job for closing expired auctions
  lib/                     # Prisma client, Supabase client, axios-style API setup
prisma/
  schema.prisma            # Data models
  migrations/               # Migration history
  seed.js                   # Seed script with demo auctions
server.js                   # Entry point — Express + Socket.io + cron bootstrapping

👤 Author

Milos — github.com/itsmilos
