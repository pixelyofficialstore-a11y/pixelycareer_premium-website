// Copies the sample CV images from content/samples/ to public/samples/, so they can be served.
import { cpSync, mkdirSync, readdirSync, rmSync } from "fs";
rmSync("public/samples", { recursive: true, force: true });
for (const tab of readdirSync("content/samples")) {
  mkdirSync(`public/samples/${tab}`, { recursive: true });
  for (const f of readdirSync(`content/samples/${tab}`)) if (f.endsWith(".webp")) cpSync(`content/samples/${tab}/${f}`, `public/samples/${tab}/${f}`);
}
