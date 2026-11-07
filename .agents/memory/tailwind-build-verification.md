---
name: Tailwind build verification
description: Why compiler changes require visual checks even when builds and HTTP requests pass.
---

After changing the Next.js compiler or importing upstream build configuration, verify that Tailwind theme values and utility classes actually compile and render.

**Why:** A Turbopack-only CSS loader was bypassed by Webpack. The build and all homepage HTTP requests passed, while missing utility classes and theme variables broke the visible layout. HTTP success was not sufficient verification.

**How to apply:** Check the rendered homepage after compiler changes, including the header layout, brand colors, typography, and responsive columns. Keep CSS source discovery scoped to application code rather than scanning workspace tooling and old app directories.
