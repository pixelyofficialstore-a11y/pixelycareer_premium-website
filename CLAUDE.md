# Pixely Careers website

## Backend sync rule
Whenever a form field, a new form, a cart/checkout step, a cookie or a tracking event is added or changed on the frontend, update the backend in the same task: the DB column (Drizzle migration in schema `website`), zod validation, the API route, Cloudinary handling for uploads, attribution and CRM-visible fields. Never ship a frontend field that isn't stored. Never touch the `public` schema.
