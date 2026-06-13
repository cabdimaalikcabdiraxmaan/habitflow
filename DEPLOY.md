# Deploy HabitFlow (free tier)

Deploy the **backend + database** on Render and the **frontend** on Netlify.

---

## Step 1 — Push to GitHub

Push your latest code to GitHub so Netlify and Render can redeploy.

---

## Step 2 — Deploy backend on Render

1. Go to [render.com](https://render.com) → connect your GitHub repo
2. Use the `render.yaml` blueprint (creates PostgreSQL + `habitflow-api`)
3. Wait until the service shows **Live**
4. Copy your API URL, e.g. `https://habitflow-api.onrender.com`

**Test:** open `https://YOUR-API-URL.onrender.com/health` — should show `{"ok":true}`

> Free Render services **sleep after inactivity**. The first request after sleep can take **30–60 seconds**. This is the main reason the live demo feels slow.

---

## Step 3 — Deploy frontend on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → import your GitHub repo
2. Configure:

| Setting | Value |
|---------|--------|
| **Base directory** | `habbit` |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

3. **Environment variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-API-URL.onrender.com` |

4. Deploy → your site, e.g. [https://habittflow.netlify.app](https://habittflow.netlify.app)

After changing `VITE_API_URL`, trigger **Deploys → Deploy site** again.

---

## Step 4 — Update README

Set your live demo and GitHub links in `README.md`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend can’t reach API | Check `VITE_API_URL` on Netlify matches Render URL (no trailing slash) |
| Very slow first login / load | Normal — Render free tier cold start. Wait ~30s or upgrade Render |
| 500 on register/login | Render logs → check DB migrated; redeploy backend |
| CORS errors | Verify `VITE_API_URL` is correct |
| Routes 404 on refresh | Ensure `habbit/public/_redirects` exists |

---

## Faster live demo (optional)

| Option | Cost | Effect |
|--------|------|--------|
| Render **Starter** plan | ~$7/mo | Server stays awake — no cold starts |
| Keep using free tier | $0 | Accept 30–60s delay after idle time |

---

## Resume line

> **HabitFlow** — Full-stack habit tracker (React, TypeScript, Node, PostgreSQL). JWT auth, streaks, calendar, stats. [Live demo](https://habittflow.netlify.app) · [GitHub](https://github.com/cabdimaalikcabdiraxmaan/habitflow)
