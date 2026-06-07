# Ambi — Full Deployment Guide
## Stack: Render (backend + database) + Vercel (frontend)

---

## PART 0 — What You Need (all free)
- GitHub account with your repo
- Render account: https://render.com (sign up with GitHub)
- Vercel account: https://vercel.com (sign up with GitHub)

---

## PART 1 — Push Code to GitHub

Your repo should have this structure:
```
ambi/
├── backend/         ← Node.js API
├── frontend/        ← React app
├── C4_DIAGRAMS.md
└── .gitignore
```

In Terminal, inside your project folder:
```bash
git add .
git commit -m "Add backend and connect frontend"
git push origin main
```

---

## PART 2 — Set Up PostgreSQL on Render (free)

1. Go to https://dashboard.render.com → click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: `ambi-db`
   - **Region**: Oregon (US West) — free tier only available here
   - **Plan**: Free
3. Click **"Create Database"**
4. Wait ~1 minute for it to spin up
5. On the database page, copy the **"Internal Database URL"** — you'll need it in Part 3

---

## PART 3 — Deploy the Backend to Render (free Web Service)

1. Go to https://dashboard.render.com → **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Fill in:
   - **Name**: `ambi-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Click **"Advanced"** → **"Add Environment Variable"** and add these 3:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste the Internal Database URL from Part 2 |
   | `JWT_SECRET` | Any long random string, e.g. `ambi_super_secret_key_2024_xyz` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | Leave blank for now — you'll fill it in after Vercel deploy |

5. Click **"Create Web Service"**
6. Wait 2–3 minutes. Watch the logs — you should see:
   ```
   ✅ Seeded default spots
   ✅ Database ready
   🚀 Ambi backend running on port 10000
   ```
7. Copy your backend URL — it looks like: `https://ambi-backend.onrender.com`
8. **Test it**: Open `https://ambi-backend.onrender.com/health` in your browser.
   You should see: `{"status":"ok"}`

---

## PART 4 — Test the Backend with Postman

Import these requests into Postman to verify all endpoints work:

### Register a user
- Method: POST
- URL: `https://ambi-backend.onrender.com/api/auth/register`
- Body (JSON): `{ "email": "test@uci.edu", "password": "password123" }`
- Expected: 201 with a `token` field

### Login
- Method: POST
- URL: `https://ambi-backend.onrender.com/api/auth/login`
- Body (JSON): `{ "email": "test@uci.edu", "password": "password123" }`
- Copy the `token` from the response

### Get all spots (READ)
- Method: GET
- URL: `https://ambi-backend.onrender.com/api/spots`
- Expected: Array of 6 spots

### Create a spot (CREATE — requires token)
- Method: POST
- URL: `https://ambi-backend.onrender.com/api/spots`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`
- Body (JSON): `{ "name": "Test Cafe", "location": "Irvine, CA", "score": 8.0 }`

### Save a spot to stack (requires token)
- Method: POST
- URL: `https://ambi-backend.onrender.com/api/saved`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`
- Body (JSON): `{ "spot_id": 1 }`

### Get my stack (READ saved — requires token)
- Method: GET
- URL: `https://ambi-backend.onrender.com/api/saved`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

### Update profile (UPDATE — requires token)
- Method: PUT
- URL: `https://ambi-backend.onrender.com/api/users/me`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`
- Body (JSON): `{ "full_name": "Jane Doe", "university": "UC Irvine" }`

### Delete a spot (DELETE — requires token + ownership)
- Method: DELETE
- URL: `https://ambi-backend.onrender.com/api/spots/YOUR_SPOT_ID`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## PART 5 — Deploy the Frontend to Vercel

1. Go to https://vercel.com → **"Add New Project"**
2. Import your GitHub repo
3. Fill in:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
4. Under **"Environment Variables"**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://ambi-backend.onrender.com` |

5. Click **"Deploy"**
6. Wait ~1 minute. Your frontend URL will look like: `https://ambi.vercel.app`

---

## PART 6 — Connect Frontend ↔ Backend (final step)

Go back to Render → your backend service → **"Environment"** tab:
- Set `FRONTEND_URL` = `https://ambi.vercel.app` (your actual Vercel URL)
- Click **"Save Changes"** — Render will automatically redeploy the backend

---

## PART 7 — Verify Everything Works End-to-End

1. Open your Vercel URL in the browser
2. Click **"Create Account"** → register with your email
3. You should land on Dashboard and see 6 study spots (loaded from your database)
4. Save a spot → go to My Stack → it should still be there after page refresh
5. Go to My Spots → add a spot with a photo
6. Open the Map → click a pin → verify the popup shows
7. Try the Ranker → rank spots → add results to your stack

---

## LOCAL DEVELOPMENT (for testing before deploying)

### Step 1: Set up backend locally
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL to your Render DB's "External Database URL"
# (not Internal — that only works inside Render's network)
npm run dev
```

### Step 2: Set up frontend locally
```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local already has VITE_API_URL=http://localhost:3001
npm run dev
```

Open http://localhost:5173 — the frontend will proxy API calls to localhost:3001.

---

## ADDING PHOTOS TO THE 6 DEFAULT SPOTS

The 6 pre-seeded spots (Philz, Moongoat, etc.) don't have photos by default.
Two easy ways to add them:

**Option A — Via the app (easiest):**
1. Log in → go to My Spots → Add a Spot
2. This creates a new spot with your photo (not replacing the default ones)

**Option B — Update the database directly:**
1. On Render → your PostgreSQL → "Connect" tab → copy the PSQL command
2. Run in Terminal:
   ```sql
   UPDATE spots SET image_url = 'https://your-image-url.com/photo.jpg' WHERE name = 'Philz Coffee';
   ```
   Use any publicly accessible image URL (e.g. from Unsplash).

**Where images are referenced in code:**
- `backend/db.js` → the `INSERT INTO spots` seed block (add `image_url` values here)
- `frontend/src/pages/Dashboard.jsx` → line with `spot-image-placeholder` comment
- `frontend/src/pages/Ranker.jsx` → line with `ranker-image-placeholder` comment
- `frontend/src/pages/MapView.jsx` → popup image section
- All use `spotImageUrl()` from `src/api.js` which handles both local and full URLs

---

## TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| "Could not load spots" on Dashboard | Backend isn't running yet or DATABASE_URL is wrong |
| Login fails after deploy | Check FRONTEND_URL on Render matches your Vercel URL exactly |
| Spots load locally but not deployed | Make sure VITE_API_URL is set in Vercel env vars |
| Image uploads don't persist on Render | Render free tier has ephemeral storage. For permanent images, use Cloudinary (free) |
| Render backend goes to sleep | Free tier sleeps after 15 min inactivity. First request takes ~30s to wake up. Normal. |
