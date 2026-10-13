// harness/dev.mjs — detached Astro dev server control.
// Usage: node harness/dev.mjs [start|stop|restart|status]
// Always prints exactly ONE line: "dev: up (200)" | "dev: down" | "dev: not-up (000)".
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4321;
const ASTRO_BIN = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const LOG = path.join(root, 'harness', 'logs', 'dev.log');

fs.mkdirSync(path.dirname(LOG), { recursive: true });

function killPort() {
  try {
    const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const m = line.trim().match(new RegExp(`:${PORT}\\s+\\S+\\s+LISTENING\\s+(\\d+)`));
      if (m) pids.add(m[1]);
    }
    for (const pid of pids) {
      try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch {}
    }
  } catch {}
}

async function status() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(`http://localhost:${PORT}/`, { redirect: 'manual', signal: ctrl.signal });
    clearTimeout(t);
    return r.status;
  } catch { return 0; }
}

function start() {
  killPort();
  const log = fs.openSync(LOG, 'a');
  const p = spawn(process.execPath, [ASTRO_BIN, 'dev', '--port', String(PORT)], {
    cwd: root,
    detached: true,
    stdio: ['ignore', log, log],
  });
  p.unref();
  fs.writeFileSync(path.join(root, 'harness', 'logs', 'dev.pid'), String(p.pid));
}

function stop() {
  killPort();
}

const cmd = process.argv[2] || 'status';

(async () => {
  if (cmd === 'start' || cmd === 'restart') {
    if (cmd === 'restart') stop();
    start();
    // poll up to ~25s
    let code = 0;
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      code = await status();
      if (code === 200) break;
    }
    console.log(code === 200 ? `dev: up (${code})` : `dev: not-up (${String(code).padStart(3, '0')})`);
  } else if (cmd === 'stop') {
    stop();
    const code = await status();
    console.log(code === 0 ? 'dev: down' : `dev: still-up (${code})`);
  } else {
    const code = await status();
    console.log(code === 200 ? `dev: up (${code})` : `dev: not-up (${String(code).padStart(3, '0')})`);
  }
})();
