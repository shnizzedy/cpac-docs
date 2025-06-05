const { execSync } = require("child_process");

const outDir = process.env.OUTDIR || "./cpac-docs/develop";

execSync(`cpx "${outDir}/assets/**/*" ./cpac-docs/assets`, {
  stdio: "inherit",
});
