# CTR Project

This workspace now has:

- `ctr-frontend`: React/Vite UI
- `ctr-backend`: Express API with PostgreSQL

## Quick start

1. Create PostgreSQL database: `ctr`
2. Backend:
   - `cd ctr-backend`
   - copy `.env.example` to `.env`
   - `npm install`
   - `npm run migrate`
   - `npm run seed`
   - `npm run dev`
3. Frontend:
   - `cd ../ctr-frontend`
   - `npm install`
   - `npm run dev`

Frontend default API URL is `http://localhost:8080`.
