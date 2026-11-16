# Pixely Careers website

## Backend sync rule
Whenever a form field, a new form, a cart/checkout step, a cookie or a tracking event is added or changed on the frontend, update the backend in the same task: the DB column (Drizzle migration in schema `website`), zod validation, the API route, Cloudinary handling for uploads, attribution and CRM-visible fields. Never ship a frontend field that isn't stored. Never touch the `public` schema.

## Visual check rule (before saying any UI task is done)
1. Take screenshots at 1440px and 390px of every section you changed AND the sections directly above and below it.
2. Check them yourself for: empty gaps, clipped text, overlaps (including the floating WhatsApp button and the mobile sticky bar), broken alignment.
3. Fix anything you find, re-take the screenshots, then send them to the user.
