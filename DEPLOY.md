# Deploy HabitFlow (free tier)

Deploy the **backend + database** on Render and the **frontend** on Vercel. Total time: ~15 minutes.

---

## Step 1 — Push to GitHub

1. Create a new repo on [github.com/new](https://github.com/new) (e.g. `habitflow`)
2. In this folder, run:

```bash
git init
git add .
git commit -m "Initial commit — HabitFlow portfolio app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/habitflow.git
git push -u origin main
```

---

## Step 2 — Deploy backend on Render

1. Go to [render.com](https://render.com) → **Sign up** (free)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repo
4. Render detects `render.yaml` automatically
5. Click **Apply** — it creates:
   - PostgreSQL database (`habitflow-db`)
   - Web service (`habitflow-api`)
6. Wait for the deploy to finish (green “Live”)
7. Copy your API URL, e.g. `https://habitflow-api.onrender.com`

**Test:** open `https://YOUR-API-URL.onrender.com/health` — should show `{"ok":true}`

> Free Render services sleep after inactivity. First request may take ~30 seconds.

---

## Step 3 — Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up** (free)
2. **Add New → Project** → import the same GitHub repo
3. Configure:
   - **Root Directory:** `habbit`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** — add:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-API-URL.onrender.com` |

5. Click **Deploy**
6. Copy your Vercel URL, e.g. `https://habitflow.vercel.app`

---

## Step 4 — Finish README

Open `README.md` and replace the placeholders:

```markdown
**Live demo:** https://habitflow.vercel.app
**GitHub:** https://github.com/YOUR_USERNAME/habitflow
```

---

## Step 5 — Screenshots (optional)

1. Open your live demo → take screenshots of dashboard, statistics, account page
2. Save to `docs/screenshots/`
3. Add to README:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend can’t reach API | Check `VITE_API_URL` on Vercel matches Render URL (no trailing slash) |
| 500 on register/login | Render logs → check DB migrated; redeploy backend |
| CORS errors | Backend uses `cors({ origin: true })` — should work; verify API URL is correct |
| Slow first load | Normal on Render free tier (cold start) |

---

## Resume line

> **HabitFlow** — Full-stack habit tracker (React, TypeScript, Node, PostgreSQL). JWT auth, streaks, calendar, stats. [Live demo](https://YOUR-VERCEL-URL) · [GitHub](https://github.com/YOUR_USERNAME/habitflow)
