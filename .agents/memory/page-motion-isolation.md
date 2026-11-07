---
name: Page motion isolation
description: Avoid competing page-level and shared reveal controllers.
---

Give custom page animations their own reveal targets rather than reusing the shared reveal selector.

**Why:** The shared reveal controller scans the entire document. A second controller targeting the same elements can compete over opacity and transforms, including leaving content invisible.

**How to apply:** Keep custom selectors scoped to their page and show above-the-fold content by default. Only hide offscreen content after its reveal observer has been initialized.
