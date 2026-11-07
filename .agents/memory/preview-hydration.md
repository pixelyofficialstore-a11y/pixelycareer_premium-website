---
name: Preview hydration safety
description: Script handling and intro timing constraints for hydration inside the Replit preview.
---

Use framework-managed initialization scripts rather than position-dependent raw scripts in the document head. Keep animated overlays mounted while CSS hides them instead of removing server-rendered nodes on a timer.

**Why:** The preview injects its own script into the head. React matched that node against an app-owned raw script and failed hydration. Independently, an intro timer could delete server markup before a slow device finished hydrating.

**How to apply:** Preserve pre-paint market initialization and the intro animation without deleting React-owned DOM before hydration. Verify fresh loads with an extra head script present, not just direct localhost screenshots or HTTP responses.

## Screenshot origin checks

When a localhost capture shows unstyled client-component markup, compare it with the actual proxied preview before changing the styles.

**Why:** Local captures showed server-rendered styling but omitted client-injected styles, while the same page rendered correctly through the proxied preview with no browser errors.

**How to apply:** Use a browser pass on the current proxied development hostname to distinguish a capture-origin issue from an application styling defect.
