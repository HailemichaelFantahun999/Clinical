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

- `admin@ctr.local` / `Password@123`
- `reviewer@ctr.local` / `Password@123`
- `user@ctr.local` / `Password@123`

## API base URL

- `http://localhost:8080/api`

## ICD integration

Add these values to .env to enable ICD search in the trial form:

- ICD_API_CLIENT_ID
- ICD_API_CLIENT_SECRET
- ICD_API_RELEASE_ID (defaults to 2025-01)
- ICD_API_LINEARIZATION (defaults to mms)
- ICD_API_LANGUAGE (defaults to en)

The frontend calls the local backend route /api/icd/search so the WHO client secret stays server-side.
