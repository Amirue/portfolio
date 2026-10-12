/**
 * Real shader backgrounds for the V6 design.
 *
 * The design uses two WebGL fragment shaders as section fills:
 *   glow-a.glsl    — hero, closing, footer, page heroes
 *   dark-glow.glsl — work, toolbox, case visuals
 *
 * This renders them for real on a <canvas>. The CSS on .glow is only a
 * first-paint / no-WebGL fallback. Falls back silently if anything fails.
 *
 * Performance: one shared rAF loop, throttled to ~30fps, and any canvas that
 * is off-screen is skipped entirely. Under prefers-reduced-motion we draw a
 * single static frame and stop.
 */

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';

const FILES = {
  a: '/shaders/glow-a.glsl',
  dark: '/shaders/dark-glow.glsl',
};

const sources = new Map();
const instances = [];

const reduced =
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn('shader compile failed:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl, frag) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  return prog;
}

function getSource(variant) {
  if (!sources.has(variant)) {
    sources.set(
      variant,
      fetch(FILES[variant] || FILES.a)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
        .catch(() => null)
    );
  }
  return sources.get(variant);
}

function draw(inst, time) {
  const { gl, canvas } = inst;
  inst.resize();
  gl.useProgram(inst.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, inst.buffer);
  gl.enableVertexAttribArray(inst.loc);
  gl.vertexAttribPointer(inst.loc, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(inst.uTime, time);
  gl.uniform2f(inst.uResolution, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function start() {
  let last = -1;
  const step = (t) => {
    // ~30fps is plenty for these slow-moving gradients
    if (t - last >= 33) {
      last = t;
      const time = reduced ? 0 : t / 1000;
      for (const inst of instances) {
        if (inst.visible && inst.ready) draw(inst, time);
      }
    }
    if (!reduced) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

async function setup(canvas) {
  const variant = canvas.dataset.glow === 'dark' ? 'dark' : 'a';

  let gl;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
  } catch {
    gl = null;
  }
  if (!gl) return; // keep the CSS fallback

  const frag = await getSource(variant);
  if (!frag) return;

  const program = link(gl, frag);
  if (!program) return;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  if (loc < 0) return;

  const inst = {
    gl,
    canvas,
    program,
    buffer,
    loc,
    uTime: gl.getUniformLocation(program, 'u_time'),
    uResolution: gl.getUniformLocation(program, 'u_resolution'),
    visible: false,
    ready: false,
    w: 0,
    h: 0,
  };

  // Cap DPR: the gradients are soft, full-res costs more than it's worth.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  inst.resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (w !== inst.w || h !== inst.h) {
      canvas.width = w;
      canvas.height = h;
      inst.w = w;
      inst.h = h;
      gl.viewport(0, 0, w, h);
    }
  };

  inst.resize();
  gl.clearColor(0, 0, 0, 0);
  inst.ready = true;
  instances.push(inst);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) inst.visible = e.isIntersecting;
      // When we come back on screen (or on first paint) make sure it's current.
      if (inst.visible) draw(inst, reduced ? 0 : performance.now() / 1000);
    },
    { rootMargin: '120px' }
  );
  io.observe(canvas);

  const ro = new ResizeObserver(() => {
    // Always re-measure, even off-screen: the backing store must match the
    // element's box or the first frame after scrolling in is stretched.
    inst.resize();
    if (inst.visible) draw(inst, reduced ? 0 : performance.now() / 1000);
  });
  ro.observe(canvas);
}

export function initGlow() {
  const canvases = document.querySelectorAll('canvas[data-glow]');
  if (!canvases.length) return;
  canvases.forEach((c) => {
    setup(c).catch(() => {});
  });
  start();
}
