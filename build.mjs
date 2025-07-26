import { build } from "esbuild";
import fs from "fs";
import path from "path";

const entryFile = "src/index.js";
const distDir = "dist";

await build({
  entryPoints: [entryFile],
  outfile: path.join(distDir, "index.cjs"),
  bundle: false,
  platform: "node",
  format: "cjs",
  target: ["node16"],
  sourcemap: false,
  minify: false,
});

fs.copyFileSync(entryFile, path.join(distDir, "index.mjs"));
