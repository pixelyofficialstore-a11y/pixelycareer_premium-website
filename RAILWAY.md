# Deploying on Railway

## Web service
- Build: `npm run build` (Railway detects it). Start: `npm start`, which runs `next start -p ${PORT:-3000}`.
- Node 20 (`engines.node` in package.json).
- Health check path: `/api/health` (200 when the database answers, 503 when it does not).
- Variables: every key in `.env.example`. The `NEXT_PUBLIC_*` ones are read at build time, so redeploy after changing them.
- Nothing is written to local disk: uploads go to Cloudinary, data goes to Supabase (schema `website`).

## Cron service (abandoned carts)
Add a second service in the same project, from the same repo or an empty image, with:
- Cron schedule: `*/30 * * * *`
- Start command:
  ```
  curl -fsS -H "x-cron-secret: $CRON_SECRET" https://pixelycareers.com/api/cron/abandoned
  ```
- Variable: `CRON_SECRET` (same value as the web service, or a reference `${{web.CRON_SECRET}}`).

`vercel.json` is only used on Vercel and is ignored by Railway.
