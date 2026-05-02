const { spawn } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");

const children = [
  spawn(process.execPath, [path.join(root, "server", "server.js")], { cwd: root, stdio: "inherit" }),
  spawn(process.execPath, [viteBin, "--host", "0.0.0.0"], { cwd: root, stdio: "inherit" })
];

function shutdown() {
  children.forEach((child) => child.kill());
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
