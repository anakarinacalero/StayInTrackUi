// Rebuilds modules/minimal-tracker/minimal-tracker.js from src/minimal-tracker.jsx
// Run from the project root:  node modules/minimal-tracker/build.mjs
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const DIR = "modules/minimal-tracker";
const res = await build({
  entryPoints: [`${DIR}/src/minimal-tracker.jsx`],
  bundle: true,
  format: "iife",
  globalName: "__SIT_MT",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  target: "es2018",
  write: false,
});
const code = `/* StayInTrackApp · Minimal tracker module v1 — load after design-system/components/bundle.js */\n${res.outputFiles[0].text}Object.assign(window.StayInTrack,__SIT_MT);\n`;
writeFileSync(`${DIR}/minimal-tracker.js`, code);
console.log(`Built ${DIR}/minimal-tracker.js`);
