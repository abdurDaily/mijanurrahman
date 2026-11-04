/**
 * Hero atmosphere: a field of soft golden dust particles that drift slowly and
 * lean gently toward the pointer. Loaded on demand (dynamic import) only when
 * WebGL is available and the user hasn't asked for reduced motion.
 */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export async function initHeroScene(canvas) {
  if (!canvas || !webglAvailable() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  let THREE;
  try { THREE = await import(THREE_URL); } catch { return null; } // CDN unreachable → static hero

  const hero = canvas.parentElement;
  const isSmall = window.matchMedia('(max-width: 767px)').matches;
  const COUNT = isSmall ? 450 : 1400;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 14;

  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    seeds[i] = Math.random() * 100;
    sizes[i] = Math.random() * 0.8 + 0.35;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixel: { value: renderer.getPixelRatio() },
      uColor: { value: new THREE.Color('#A47B45') },
    },
    vertexShader: /* glsl */`
      uniform float uTime; uniform vec2 uMouse; uniform float uPixel;
      attribute float aSeed; attribute float aSize;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.12 + aSeed) * 0.6;
        p.y += cos(uTime * 0.10 + aSeed * 1.3) * 0.5 + mod(uTime * 0.15 + aSeed, 20.0) * 0.08;
        // gentle attraction toward the pointer, stronger for nearer particles
        vec2 m = uMouse * vec2(15.0, 9.0);
        float d = distance(p.xy, m);
        p.xy += (m - p.xy) * smoothstep(7.0, 0.0, d) * 0.12 * (p.z + 8.0) / 14.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixel * (60.0 / -mv.z);
        vAlpha = 0.25 + 0.55 * (0.5 + 0.5 * sin(uTime * 0.8 + aSeed * 6.0));
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * vAlpha * 0.75);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Interaction & lifecycle
  const target = new THREE.Vector2();
  const onPointer = (e) => {
    const r = hero.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = hero;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(hero);
  resize();
  hero.addEventListener('pointermove', onPointer, { passive: true });

  let raf = 0, visible = true, last = performance.now(), time = 0;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    time += Math.min((now - last) / 1000, 0.05);
    last = now;
    material.uniforms.uTime.value = time;
    material.uniforms.uMouse.value.lerp(target, 0.04);
    points.rotation.y = material.uniforms.uMouse.value.x * 0.06;
    points.rotation.x = -material.uniforms.uMouse.value.y * 0.04;
    renderer.render(scene, camera);
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  // Render only while the hero is on screen and the tab is visible
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); });
  io.observe(hero);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  if (window.gsap) gsap.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, ease: 'power2.out' });
  start();

  return function dispose() {
    stop();
    io.disconnect(); ro.disconnect();
    hero.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVis);
    geometry.dispose(); material.dispose(); renderer.dispose();
  };
}
