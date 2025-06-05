const { execSync } = require("child_process");

const outDir = process.env.OUTDIR || "./cpac-docs/develop";
execSync(`tsc --outDir ${outDir} --target es6`, { stdio: "inherit" });
