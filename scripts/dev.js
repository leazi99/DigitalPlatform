// Runs the API and the Vite dev server together, so `npm run dev` is still
// one command now that the site has a backend.
//
// Both children inherit this terminal, so their output interleaves as it
// happens. Ctrl-C stops both, and if either exits on its own the other is
// stopped too — a half-running stack is more confusing than a stopped one.

import { spawn } from "node:child_process";

const children = [];
let shuttingDown = false;

function run(name, command, args) {
  const child = spawn(command, args, { stdio: "inherit", shell: false });
  children.push({ name, child });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const how = signal ?? `code ${code}`;
    console.log(`\n  ${name} exited (${how}) — stopping the rest.\n`);
    stop(code ?? 1);
  });

  child.on("error", (error) => {
    console.error(`  could not start ${name}: ${error.message}`);
    stop(1);
  });
}

function stop(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
  }
  // Give them a moment to close their listeners before the process goes.
  setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

run("api", process.execPath, ["--watch", "server/index.js"]);
run("vite", process.execPath, ["node_modules/vite/bin/vite.js"]);
