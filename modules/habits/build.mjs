// Rebuilds modules/habits/habits.js from src/habits.jsx
// Run from the project root:  node modules/habits/build.mjs
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const DIR = "modules/habits";
const res = await build({
  entryPoints: [`${DIR}/src/habits.jsx`],
  bundle: true,
  format: "iife",
  globalName: "__SIT_HB",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  target: "es2018",
  write: false,
});
const code = `/* StayInTrackApp · Habits module v1 — load after design-system/components/bundle.js */\n${res.outputFiles[0].text}Object.assign(window.StayInTrack,__SIT_HB);\n`;
writeFileSync(`${DIR}/habits.js`, code);
console.log(`Built ${DIR}/habits.js`);
