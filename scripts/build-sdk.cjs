const { spawnSync } = require("node:child_process");
const path = require("node:path");

const sdkDir = path.resolve(__dirname, "..", "flowvault-sdk");
const isWindows = process.platform === "win32";
const npmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const command = isWindows ? process.execPath : "npm";
const env =
  isWindows
    ? { ...process.env, npm_config_script_shell: "cmd.exe" }
    : process.env;

function run(args) {
  const result = spawnSync(command, isWindows ? [npmCli, ...args] : args, {
    cwd: sdkDir,
    env,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(["install"]);
run(["run", "build"]);
