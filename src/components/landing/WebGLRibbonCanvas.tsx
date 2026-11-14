/**
 * WebGLRibbonCanvas.tsx
 * Interactive 3D Flowing Ribbon rendered with custom WebGL GLSL Shaders.
 * Inspired by OmniRoute's WebGL editions-ribbon: reacts smoothly to page scroll and mouse pointer.
 * Includes software-WebGL detection, context-loss recovery, and reduced-motion compliance.
 */

import React, { useEffect, useRef, useState } from 'react';

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const rendererName = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererName);
  } catch {
    return true;
  }
}

function createRibbonTextureCanvas(isDark: boolean): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Midnight Space Obsidian ribbon base (#070B18 / #0F172A)
  ctx.fillStyle = isDark ? '#070B18' : '#0F172A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vibrant Electric Cyan -> Hyper Indigo -> Solar Gold edge rails
  const railGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  railGrad.addColorStop(0, '#06B6D4');
  railGrad.addColorStop(0.5, '#6366F1');
  railGrad.addColorStop(1, '#F59E0B');
  ctx.fillStyle = railGrad;
  ctx.fillRect(0, 0, canvas.width, 14);
  ctx.fillRect(0, canvas.height - 14, canvas.width, 14);

  // Subtle vertical technical tick marks in electric cyan
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.36)';
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x, x % 256 === 0 ? 48 : 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, canvas.height - 14);
    ctx.lineTo(x, x % 256 === 0 ? canvas.height - 48 : canvas.height - 30);
    ctx.stroke();
  }

  // Crisp Persian telemetry typography along the ribbon (#38BDF8 & #F8FAFC)
  const phrases = [
    'توان‌بان · ۴۰۰ کیلوولت',
    'پایش ارتباطات DTS و PLC',
    'قفل اسنپ‌شات فهرست بها',
    '۱۰۷ پست و مرکز کنترل',
    'همگام‌سازی آفلاین امن',
  ];

  ctx.font = '700 40px IRANSans, Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const step = canvas.width / phrases.length;
  phrases.forEach((phrase, idx) => {
    const cx = step * idx + step * 0.5;
    ctx.fillStyle = idx % 2 === 0 ? '#22D3EE' : '#F8FAFC';
    ctx.fillText(phrase, cx, canvas.height * 0.52);

    ctx.fillStyle = '#818CF8';
    ctx.beginPath();
    ctx.arc(step * (idx + 1), canvas.height * 0.5, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

const VERTEX_SHADER = `
precision highp float;

attribute vec2 aGrid; // x: u in [0..1] along ribbon length, y: v in [-1..1] across width

uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
uniform float uAspect;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vDepth;

vec3 ribbonCenter(float t) {
  float s = uScroll * 1.4;
  float px = uPointer.x * 0.42;
  float py = uPointer.y * 0.34;

  // Sweep diagonally across the right/center of the viewport for RTL balance
  float x = (t - 0.5) * 3.1 + sin(t * 4.2 + uTime * 0.35 + s) * 0.42 + px * (0.4 + 0.6 * sin(t * 3.14159));
  float y = (0.46 - t) * 1.65 + cos(t * 5.0 - uTime * 0.28 + s * 1.15) * 0.36 + py * sin(t * 3.14159);
  float z = sin(t * 6.28318 + uTime * 0.42 + s * 1.6) * 0.65 - 1.35;
  return vec3(x, y, z);
}

void main() {
  float u = aGrid.x;
  float v = aGrid.y;

  float eps = 0.006;
  vec3 c0 = ribbonCenter(u);
  vec3 c1 = ribbonCenter(min(1.0, u + eps));
  vec3 tangent = normalize(c1 - c0);

  // Smoothly twisting frame along the ribbon
  float twist = u * 5.6 + uTime * 0.38 + uScroll * 2.4 + uPointer.x * 0.9;
  vec3 refUp = vec3(0.0, 1.0, 0.0);
  vec3 side = normalize(cross(tangent, refUp));
  vec3 up = normalize(cross(side, tangent));

  vec3 twistedDir = normalize(side * cos(twist) + up * sin(twist));
  vec3 twistedNormal = normalize(cross(tangent, twistedDir));

  // Taper slightly at ends
  float edgeTaper = smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.92, u);
  float halfWidth = mix(0.08, 0.23, edgeTaper);

  vec3 pos = c0 + twistedDir * (v * halfWidth);

  // Perspective projection scaled for aspect
  float fov = 1.65;
  float zCam = max(0.35, -pos.z);
  vec2 projected = vec2(pos.x / max(0.65, uAspect), pos.y) * (fov / zCam);

  gl_Position = vec4(projected, clamp((-pos.z - 0.5) / 4.0, -0.95, 0.95), 1.0);

  vUv = vec2(u * 2.2 - uTime * 0.04, v * 0.5 + 0.5);
  vNormal = twistedNormal;
  vViewPos = -pos;
  vDepth = zCam;
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vDepth;

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) {
    N = -N;
  }

  vec3 V = normalize(vViewPos);
  vec3 L1 = normalize(vec3(0.6, 0.8, 1.0));
  vec3 L2 = normalize(vec3(-0.7, -0.3, 0.8));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0);

  // Specular & Fresnel rim
  vec3 H = normalize(L1 + V);
  float spec = pow(max(dot(N, H), 0.0), 36.0);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);

  vec4 tex = texture2D(uTexture, vec2(fract(vUv.x), vUv.y));

  // Backface receives brushed metallic deep indigo-obsidian tone
  vec3 backColor = mix(vec3(0.04, 0.07, 0.16), vec3(0.14, 0.18, 0.42), abs(vUv.y - 0.5) * 2.0);
  vec3 baseColor = gl_FrontFacing ? tex.rgb : backColor;

  vec3 lit = baseColor * (0.55 + 0.58 * diff1 + 0.25 * diff2)
           + vec3(0.13, 0.83, 0.93) * spec * 0.42
           + vec3(0.39, 0.40, 0.95) * fresnel * 0.30;

  float fog = smoothstep(2.8, 1.1, vDepth);
  float alpha = 0.78 * fog;

  gl_FragColor = vec4(lit, alpha);
}
`;

export const WebGLRibbonCanvas: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglReady, setWebglReady] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: !isSoftwareGl,
      premultipliedAlpha: false,
      depth: true,
    });

    if (!gl) {
      setWebglReady(false);
      return;
    }

    let disposed = false;
    let rafId = 0;
    let timeoutId = 0;

    // Compile shader helper
    const compileShader = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    let program: WebGLProgram | null = null;
    let vbo: WebGLBuffer | null = null;
    let ibo: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let indexCount = 0;

    const initPipeline = () => {
      const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vs || !fs) {
        setWebglReady(false);
        return false;
      }

      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        setWebglReady(false);
        return false;
      }
      program = prog;

      // Build ribbon mesh grid (140 length segments)
      const segments = 140;
      const verts = new Float32Array((segments + 1) * 2 * 2);
      const indices = new Uint16Array(segments * 6);

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const base = i * 4;
        verts[base] = u;
        verts[base + 1] = -1;
        verts[base + 2] = u;
        verts[base + 3] = 1;
      }

      for (let i = 0; i < segments; i++) {
        const idx = i * 6;
        const v0 = i * 2;
        indices[idx] = v0;
        indices[idx + 1] = v0 + 1;
        indices[idx + 2] = v0 + 2;
        indices[idx + 3] = v0 + 1;
        indices[idx + 4] = v0 + 3;
        indices[idx + 5] = v0 + 2;
      }
      indexCount = indices.length;

      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

      ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      const texCanvas = createRibbonTextureCanvas(isDark);
      if (texCanvas) {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);
      }

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      return true;
    };

    if (!initPipeline()) return;

    // Smooth state targets & damped values
    let targetScroll = 0;
    let currentScroll = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let width = 1;
    let height = 1;

    const resize = () => {
      const parent = containerRef.current;
      if (!parent || !canvas) return;
      const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScroll = window.scrollY / maxScroll;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      targetPointerX = nx;
      targetPointerY = ny;
    };

    const handlePointerLeave = () => {
      targetPointerX = 0;
      targetPointerY = 0;
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };

    const handleContextRestored = () => {
      if (!disposed) {
        initPipeline();
        resize();
      }
    };

    resize();
    handleScroll();

    const resizeObserver = new ResizeObserver(resize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    const startTime = performance.now();
    let lastTime = startTime;

    const drawFrame = (now: number) => {
      if (disposed || !program) return;

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const elapsed = prefersReducedMotion ? 1.2 : (now - startTime) / 1000;

      // Exponential smoothing
      const damp = 1 - Math.exp(-6.5 * dt);
      currentScroll += (targetScroll - currentScroll) * damp;
      currentPointerX += (targetPointerX - currentPointerX) * damp;
      currentPointerY += (targetPointerY - currentPointerY) * damp;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);

      const aGridLoc = gl.getAttribLocation(program, 'aGrid');
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aGridLoc);
      gl.vertexAttribPointer(aGridLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

      gl.uniform1f(gl.getUniformLocation(program, 'uTime'), elapsed);
      gl.uniform1f(gl.getUniformLocation(program, 'uScroll'), currentScroll);
      gl.uniform2f(gl.getUniformLocation(program, 'uPointer'), currentPointerX, currentPointerY);
      gl.uniform1f(gl.getUniformLocation(program, 'uAspect'), width / Math.max(1, height));

      if (texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);
      }

      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

      if (!prefersReducedMotion && !document.hidden) {
        if (isSoftwareGl) {
          timeoutId = window.setTimeout(() => {
            rafId = requestAnimationFrame(drawFrame);
          }, 80);
        } else {
          rafId = requestAnimationFrame(drawFrame);
        }
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && !prefersReducedMotion && !disposed) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(drawFrame);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (vbo) gl.deleteBuffer(vbo);
      if (ibo) gl.deleteBuffer(ibo);
      if (texture) gl.deleteTexture(texture);
      if (program) gl.deleteProgram(program);
    };
  }, [isDark]);

  if (!webglReady) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-45"
      >
        <div
          className="absolute -top-24 -left-24 w-[620px] h-[620px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.26), rgba(99,102,241,0.14) 55%, transparent 75%)' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-90"
      />
    </div>
  );
};
