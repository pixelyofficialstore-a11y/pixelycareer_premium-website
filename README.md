# Pixely Careers website

Next.js (App Router), TypeScript, Tailwind CSS, React Three Fiber, GSAP and Lenis.

```bash
npm install
npm run dev
```

Production check: `npm run build`, then `npm start`.

## Before launch

- **Brand fonts.** Virtual and Aloevera Display are not in this repo, so the site uses Poppins. Add licensed files to `public/fonts/` and uncomment the block at the top of `src/app/globals.css`.
- **Announcement bar.** Edit the messages and rules in `src/config/announcements.ts`.
- **Client stories.** Add real, approved reviews to `content/reviews/{market}.json` (or `global.json`). The section stays hidden while they are empty. Blur phone numbers and get permission first.
- **Sample CVs.** Add `.webp` files and entries to `content/samples/{tab}/samples.json`. Remove personal details first.
- **Facebook.** Once the page URL is confirmed, add it to `sameAs` in `src/app/layout.tsx`.
- **Orders.** There is no backend yet: `/order` and `/free-cv-review` hand off to WhatsApp. The number is `WHATSAPP_NUMBER` in `src/lib/site.ts`.

## Useful to know

- **Logos** in `public/brand/` were exported from the official brand PDF as vectors. Don't redraw them.
- **Hero and Problem** share one scroll story in `src/components/hero/CvStory.tsx`. The CV images are in `public/cv/`, and the highlight areas are percentages in `CvPaper.tsx`.
- **Markets, packages and prices** live in `src/config/markets.ts`. Set `approved: true` on a market once its prices are confirmed: that removes its `[CONFIRM pricing]` marker and publishes its Offer data.
- **Service pages** are in `src/config/services.ts`, legal text in `src/config/legal.ts`.
- **Blog posts** are MDX in `content/blog/`. Posts with `draft: true` stay hidden from the index, sitemap and RSS.
- **Analytics:** set `NEXT_PUBLIC_GA4_ID` and `NEXT_PUBLIC_META_PIXEL_ID` to turn it on. Nothing loads until then.
- **Loading screen:** set `NEXT_PUBLIC_ENABLE_INTRO=false` to turn it off.
- **Motion** loads after first paint, through `src/lib/motion.ts`. Use `useGsapSection` for new animated sections.
