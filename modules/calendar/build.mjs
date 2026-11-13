// Rebuilds modules/calendar/calendar.js from src/calendar.jsx
// Run from the project root:  node modules/calendar/build.mjs
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const DIR = "modules/calendar";
const res = await build({
  entryPoints: [`${DIR}/src/calendar.jsx`],
  bundle: true,
  format: "iife",
  globalName: "__SIT_CAL",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  target: "es2018",
  write: false,
});
const code = `/* StayInTrackApp · Calendar module v1 — load after design-system/components/bundle.js */\n${res.outputFiles[0].text}Object.assign(window.StayInTrack,__SIT_CAL);\n`;
writeFileSync(`${DIR}/calendar.js`, code);
console.log(`Built ${DIR}/calendar.js`);
