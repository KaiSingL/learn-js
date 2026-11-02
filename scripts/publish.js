import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const source = join(dist, "index.html");
const target = join(root, "courses.html");

if (!existsSync(source)) {
  console.error("dist/index.html is missing. Run `bun run build` from the project root.");
  process.exit(1);
}

if (existsSync(target)) {
  const archiveDir = join(root, "archive");
  const archive = join(archiveDir, "courses.original.html");
  if (!existsSync(archive)) {
    mkdirSync(archiveDir, { recursive: true });
    copyFileSync(target, archive);
    console.log("Archived the previous artifact to archive/courses.original.html");
  }
}

// The primary portable artifact.
copyFileSync(source, target);

// Copy every build asset (hashed icon, manifest, etc.) next to courses.html so
// relative references like ./icon-xBZwUum4.png resolve when opened directly.
// index.html is skipped: root/index.html must stay the Vite entry source.
const assets = existsSync(dist) ? readdirSync(dist) : [];
for (let i = 0; i < assets.length; i += 1) {
  const name = assets[i];
  if (name === "index.html") continue;
  const from = join(dist, name);
  const to = join(root, name);
  try {
    if (statSync(from).isFile()) {
      copyFileSync(from, to);
      console.log("Published " + name);
    }
  } catch (err) {
    console.log("Skipped " + name + ": " + err.message);
  }
}

const size = statSync(target).size;
console.log("Published courses.html (" + (size / 1024).toFixed(1) + " KB)");
