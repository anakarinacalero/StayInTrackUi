// Rebuilds modules/week/week.js from src/week.jsx
// Run from the project root:  node modules/week/build.mjs
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const DIR = "modules/week";
const res = await build({
  entryPoints: [`${DIR}/src/week.jsx`],
  bundle: true,
  format: "iife",
  globalName: "__SIT_WK",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  target: "es2018",
  write: false,
});
const code = `/* StayInTrackApp · Week module v1 — load after design-system/components/bundle.js */\n${res.outputFiles[0].text}Object.assign(window.StayInTrack,__SIT_WK);\n`;
writeFileSync(`${DIR}/week.js`, code);
console.log(`Built ${DIR}/week.js`);
