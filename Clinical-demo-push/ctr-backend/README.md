# CTR Backend (Express + PostgreSQL)

## Setup

1. Create a PostgreSQL database named `ctr`.
2. Copy `.env.example` to `.env` and adjust values.
3. Install dependencies:
   - `npm install`
4. Apply schema:
   - `npm run migrate`
5. Seed demo users:
   - `npm run seed`
6. Start API:
   - `npm run dev`

## Default seeded accounts

Demo accounts are created for local development only. Update the seed script or environment to match your own local setup before using the backend outside a demo environment.

## API base URL

- `http://localhost:8080/api`
