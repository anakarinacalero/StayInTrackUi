// Rebuilds design-system/components/bundle.js from components/src/index.jsx
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "design-system/components/src/index.jsx";
const OUT = "design-system/components/bundle.js";
const names = [...readFileSync(SRC, "utf8").matchAll(/^export function ([A-Za-z]+)/gm)].map((m) => m[1]);

const res = await build({
  entryPoints: [SRC],
  bundle: true,
  format: "iife",
  globalName: "__SIT",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  target: "es2018",
  write: false,
});

const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: "StayInTrack", components: names.map((name) => ({ name })) })} */`;
const code = `${header}\n${res.outputFiles[0].text}window.StayInTrack=Object.assign(window.StayInTrack||{},__SIT);\n`;
if (/<\/script|<!--/i.test(code)) throw new Error("bundle contains </script or <!--");
writeFileSync(OUT, code);
console.log(`Built ${OUT} with ${names.length} components`);
