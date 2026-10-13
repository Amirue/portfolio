// harness/dev.mjs — detached Astro dev server control.
// Usage: node harness/dev.mjs [start|stop|restart|status]
// Prints exactly one line: "up <code>" | "failed: <reason>".
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4321;
const ASTRO_BIN = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pidsOnPort() {
  let out = '';
  try {
    out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
  } catch {
    return [];
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const m = line.trim().match(new RegExp(`:${PORT}\\s+\\S+\\s+LISTENING\\s+(\\d+)`));
    if (m) pids.add(m[1]);
  }
  return [...pids];
}

function killPort() {
  // Process-tree kill, then re-scan to confirm the port is actually free.
  for (let attempt = 0; attempt < 3; attempt++) {
    const pids = pidsOnPort();
    if (pids.length === 0) return true;
    for (const pid of pids) {
      try { execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' }); } catch {}
    }
    // give the OS a moment, then re-scan
    try { execSync('ping -n 2 127.0.0.1 > nul'); } catch {}
  }
  return pidsOnPort().length === 0;
}

async function status() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 3000);
  try {
    const r = await fetch(`http://localhost:${PORT}/`, { redirect: 'manual', signal: ctrl.signal });
    return r.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(t);
  }
}

function start() {
  // Fully detached. The server's stdio goes to a log file, never the wrapper's pipe.
  // `stdio: 'ignore'` alone still hangs the calling shell on Windows: libuv sets
  // bInheritHandles=TRUE, so the child inherits our stdout pipe handle and the shell
  // never sees EOF. Redirecting stdout/stderr to an fd detaches it from our pipe.
  const logDir = path.join(root, 'harness', 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  const out = fs.openSync(path.join(logDir, 'dev.log'), 'a');
  spawn(process.execPath, [ASTRO_BIN, 'dev', '--port', String(PORT)], {
    cwd: root,
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true,
  }).unref();
}

const cmd = process.argv[2] || 'status';

(async () => {
  if (cmd === 'stop') {
    const freed = killPort();
    console.log(freed ? 'up 0 (stopped)' : 'failed: port still in use');
    process.exit(0);
  }

  if (cmd === 'start' || cmd === 'restart') {
    if (cmd === 'restart') killPort();
    start();
    for (let i = 0; i < 10; i++) {
      await sleep(1000);
      const code = await status();
      if (code === 200) {
        console.log('up 200');
        process.exit(0);
      }
    }
    console.log('failed: no HTTP 200 within 10s');
    process.exit(0);
  }

  const code = await status();
  console.log(code === 200 ? 'up 200' : code === 0 ? 'failed: not responding' : `failed: HTTP ${code}`);
  process.exit(0);
})();
