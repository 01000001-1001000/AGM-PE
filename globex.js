/* =========================================================
   AH — Globo 3D: conexiones de red simuladas + Luna en órbita
   Corrección: el globo se anima SIEMPRE (ignora el modo
   "Reducir movimiento" del sistema), igual que la marquesina.
   ========================================================= */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("[globe] módulo cargado");
const mount = document.getElementById("globe");
if (!mount) { console.warn("[globe] No existe #globe en esta página"); }

if (mount) {
  // El globo se anima SIEMPRE, aunque el sistema pida reducir movimiento.
  const REDUCE = false;
  const R = 1;

  const CITIES = [
    { code: "MAD", lat: 40.4,  lon: -3.7 },   { code: "BCN", lat: 41.4,  lon: 2.2 },
    { code: "PAR", lat: 48.9,  lon: 2.3 },    { code: "LON", lat: 51.5,  lon: -0.1 },
    { code: "BER", lat: 52.5,  lon: 13.4 },   { code: "ROM", lat: 41.9,  lon: 12.5 },
    { code: "MOW", lat: 55.7,  lon: 37.6 },   { code: "IST", lat: 41.0,  lon: 28.9 },
    { code: "CAI", lat: 30.0,  lon: 31.2 },   { code: "LOS", lat: 6.5,   lon: 3.4 },
    { code: "NBO", lat: -1.3,  lon: 36.8 },   { code: "JNB", lat: -26.2, lon: 28.0 },
    { code: "DXB", lat: 25.2,  lon: 55.3 },   { code: "BOM", lat: 19.0,  lon: 72.8 },
    { code: "BLR", lat: 12.9,  lon: 77.6 },   { code: "SIN", lat: 1.3,   lon: 103.8 },
    { code: "JKT", lat: -6.2,  lon: 106.8 },  { code: "SHA", lat: 31.2,  lon: 121.5 },
    { code: "TYO", lat: 35.7,  lon: 139.7 },  { code: "SEL", lat: 37.6,  lon: 127.0 },
    { code: "SYD", lat: -33.9, lon: 151.2 },  { code: "NYC", lat: 40.7,  lon: -74.0 },
    { code: "YYZ", lat: 43.7,  lon: -79.4 },  { code: "MEX", lat: 19.4,  lon: -99.1 },
    { code: "GRU", lat: -23.5, lon: -46.6 },  { code: "EZE", lat: -34.6, lon: -58.4 },
    { code: "LAX", lat: 34.0,  lon: -118.2 }, { code: "SFO", lat: 37.8,  lon: -122.4 }
  ];

  function llToVec3(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }
  function glowTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(255,120,120,0.6)");
    grd.addColorStop(1, "rgba(255,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  function moonTexture() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#8f8f96"; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 900; i++) {
      const r = Math.random() * 3 + 0.5, a = Math.random() * 0.25;
      g.fillStyle = `rgba(${Math.random() > 0.5 ? "60,60,66" : "190,190,196"},${a})`;
      g.beginPath(); g.arc(Math.random() * 512, Math.random() * 256, r, 0, 7); g.fill();
    }
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * 512, y = 60 + Math.random() * 130, r = 30 + Math.random() * 55;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, "rgba(70,70,78,0.55)"); grd.addColorStop(1, "rgba(70,70,78,0)");
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    return new THREE.CanvasTexture(c);
  }

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch (e) { mount.innerHTML = '<p class="globe-fallback">WebGL no disponible en este navegador</p>'; }

  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 0.4, 3.6);

    scene.add(new THREE.AmbientLight(0x334455, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(5, 2.5, 3); scene.add(sun);

    const spin = new THREE.Group(); scene.add(spin);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a55, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0.5
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), earthMat);
    spin.add(earth);
    new THREE.TextureLoader().load(
      "https://unpkg.com/three-globe/example/img/earth-night.jpg",
      (t) => { t.colorSpace = THREE.SRGBColorSpace; earthMat.map = t; earthMat.emissiveMap = t; earthMat.color.set(0xffffff); earthMat.needsUpdate = true; }
    );

    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.18, 48, 48),
      new THREE.ShaderMaterial({
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: "varying vec3 vN; void main(){ float i = pow(max(0.72 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 2.4); gl_FragColor = vec4(0.25, 0.55, 1.0, 1.0) * i; }",
        blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true, depthWrite: false
      })
    );
    spin.add(atmo);

    const starPos = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 40);
      starPos.set([v.x, v.y, v.z], i * 3);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x9fb6d9, size: 0.09, transparent: true, opacity: 0.8 })));

    const glow = glowTexture();
    const nodePos = CITIES.map(c => llToVec3(c.lat, c.lon, R * 1.005));
    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nodePos.flatMap(v => [v.x, v.y, v.z])), 3));
    spin.add(new THREE.Points(nodesGeo, new THREE.PointsMaterial({
      color: 0xff3b3b, size: 0.05, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    })));

    const rings = [];
    const ringGeo = new THREE.RingGeometry(0.015, 0.02, 24);
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      m.userData.life = -1; spin.add(m); rings.push(m);
    }
    function pulse(pos) {
      const m = rings.find(r => r.userData.life < 0) || rings[0];
      m.position.copy(pos).multiplyScalar(1.002);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      m.userData.life = 0;
    }

    const MAX_LINKS = 16;
    const links = [];
    const linkMatBase = { color: 0xff2a2a, transparent: true, opacity: 0.22, depthWrite: false };
    function newLink() {
      const a = CITIES[(Math.random() * CITIES.length) | 0];
      let b = a;
      for (let t = 0; t < 6; t++) { b = CITIES[(Math.random() * CITIES.length) | 0]; if (b !== a) break; }
      const va = llToVec3(a.lat, a.lon, R), vb = llToVec3(b.lat, b.lon, R);
      if (va.angleTo(vb) < 0.5) return;
      const mid = va.clone().add(vb).normalize().multiplyScalar(R * (1 + 0.12 + 0.55 * va.angleTo(vb) / Math.PI));
      const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial(linkMatBase));
      const packet = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xff5a5a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      packet.scale.setScalar(0.07);
      spin.add(line); spin.add(packet);
      links.push({ line, packet, curve, t: 0, speed: 0.16 + Math.random() * 0.2, lat: Math.round(20 + Math.random() * 160), mb: 5 + Math.round(Math.random() * 90), a, b });
      pulse(va);
    }

    const moonOrbit = new THREE.Group(); moonOrbit.rotation.set(0.45, 0, 0.28); scene.add(moonOrbit);
    const moonPivot = new THREE.Group(); moonOrbit.add(moonPivot);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 32), new THREE.MeshStandardMaterial({ map: moonTexture(), roughness: 1, metalness: 0 }));
    moon.position.set(2.7, 0, 0); moonPivot.add(moon);

    const elNodes = document.getElementById("hudNodes");
    const elPps = document.getElementById("hudPps");
    const elLat = document.getElementById("hudLat");
    const elTraffic = document.getElementById("hudTraffic");
    const elLog = document.getElementById("hudLog");
    let totalPk = 0, totalMB = 0;
    const stampWin = [], latWin = [];
    function logEvent(l) {
      const li = document.createElement("li");
      li.innerHTML = `<b>${l.a}</b> → <b>${l.b}</b> · ${l.lat}ms · <i>OK</i> · ${l.mb} MB`;
      elLog.prepend(li);
      while (elLog.children.length > 7) elLog.lastChild.remove();
    }
    function fmtMB(mb) { return mb >= 1024 ? (mb / 1024).toFixed(2) + " GB" : Math.round(mb) + " MB"; }

    let dragging = false, px = 0, py = 0, idle = 0;
    mount.addEventListener("pointerdown", e => { dragging = true; idle = 0; px = e.clientX; py = e.clientY; mount.setPointerCapture(e.pointerId); });
    mount.addEventListener("pointermove", e => {
      if (!dragging) return;
      spin.rotation.y += (e.clientX - px) * 0.005;
      spin.rotation.x = Math.max(-0.6, Math.min(0.6, spin.rotation.x + (e.clientY - py) * 0.004));
      px = e.clientX; py = e.clientY; idle = 0;
    });
    mount.addEventListener("pointerup", () => dragging = false);
    mount.addEventListener("pointercancel", () => dragging = false);

    const clock = new THREE.Clock();
    let spawnT = 0, hudT = 0, running = true, entered = false, raf;

    function update(dt, now) {
      idle += dt;
      if (idle > 2.5 && !REDUCE) spin.rotation.y += dt * 0.06;
      moonPivot.rotation.y += dt * 0.22;
      moon.rotation.y += dt * 0.05;
      spawnT -= dt;
      if (spawnT <= 0 && links.length < MAX_LINKS) { newLink(); spawnT = 0.35 + Math.random() * 0.5; }
      for (let i = links.length - 1; i >= 0; i--) {
        const l = links[i];
        l.t += dt * l.speed;
        if (l.t >= 1) {
          spin.remove(l.line); spin.remove(l.packet);
          l.line.geometry.dispose(); l.line.material.dispose(); l.packet.material.dispose();
          links.splice(i, 1);
          totalPk++; totalMB += l.mb; stampWin.push(now); latWin.push(l.lat);
          if (latWin.length > 50) latWin.shift();
          logEvent({ a: l.a.code, b: l.b.code, lat: l.lat, mb: l.mb });
          continue;
        }
        l.packet.position.copy(l.curve.getPoint(l.t));
        l.packet.material.opacity = Math.sin(Math.min(l.t, 1) * Math.PI) * 0.9 + 0.1;
      }
      rings.forEach(r => {
        if (r.userData.life < 0) return;
        r.userData.life += dt;
        const p = r.userData.life / 1.4;
        if (p >= 1) { r.userData.life = -1; r.material.opacity = 0; return; }
        r.scale.setScalar(1 + p * 2.4);
        r.material.opacity = 0.8 * (1 - p);
      });
      hudT -= dt;
      if (hudT <= 0) {
        hudT = 0.25;
        while (stampWin.length && now - stampWin[0] > 1000) stampWin.shift();
        elNodes.textContent = links.length;
        elPps.textContent = stampWin.length;
        elPps.classList.toggle("hot", stampWin.length >= 8);
        elLat.textContent = latWin.length ? Math.round(latWin.reduce((s, v) => s + v, 0) / latWin.length) + " ms" : "—";
        elTraffic.textContent = fmtMB(totalMB);
      }
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05), now = performance.now();
      update(dt, now);
      renderer.render(scene, camera);
    }

    function resize() {
      const w = mount.clientWidth || 420, h = mount.clientHeight || w;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(mount);
    resize();

    // Render inicial: se ve aunque la sección esté fuera de pantalla al cargar.
    for (let i = 0; i < 6; i++) { newLink(); links.forEach(l => { l.t = 0.5; l.packet.position.copy(l.curve.getPoint(0.5)); }); }
    renderer.render(scene, camera);
    console.log("[globe] primer render OK");

    // Pausar fuera de pantalla, pero solo DESPUÉS de haber entrado una vez.
    new IntersectionObserver(es => {
      es.forEach(en => {
        if (en.isIntersecting) { entered = true; running = true; clock.getDelta(); }
        else if (entered) running = false;
      });
    }, { threshold: 0.05 }).observe(mount);

    if (!REDUCE) loop();
  }
}