/* ==========================================================================
   LE PERFAM · Viaje 3D al hacer scroll (three.js) y parallax de la portada
   - Portada: un gran cristal tallado con su aro dorado, rodeado de gotas,
     perlas y cristales. Todo se mueve con el mouse.
   - Al bajar: el gran cristal gira y vuela hacia la cámara hasta atravesarla;
     después la cámara desciende entre cristales, gotas y aros que pasan a
     distinta profundidad, detrás del vidrio de las secciones.
   - Cuanto más rápido se baja, más giran las piezas, más se abre la cámara
     y más corre el polvo dorado.
   - Se apaga antes del catálogo.
   Mejora progresiva: sin WebGL, sin conexión al CDN o con «reducir
   movimiento», la página funciona igual (con «reducir movimiento» la escena
   queda quieta en la portada).
   ========================================================================== */
(function () {
  "use strict";

  var hero = document.querySelector("[data-hero]");
  if (!hero) return;

  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js";
  var THREE_SRI = "sha384-RRHfJ6w1mTlKUBMYT/hvnRiOzEB/vyRV3DrQOseb6oYfvaZSfdd0byS4bHps0k2R";

  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var finePointer = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var saveData = !!(navigator.connection && navigator.connection.saveData);

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- Estado compartido ---------- */
  var st = {
    px: 0, py: 0, tx: 0, ty: 0,   // puntero suavizado y objetivo (-1 a 1)
    y: 0, lastY: 0, vel: 0,       // scroll y velocidad suavizada (px/s)
    heroTop: 0, heroH: 1,
    endY: 1e9                     // donde termina el viaje (antes del catálogo)
  };
  var three = null;
  var raf = 0;
  var catalogo = document.getElementById("catalogo");

  function measure() {
    var r = hero.getBoundingClientRect();
    st.heroTop = r.top + window.scrollY;
    st.heroH = Math.max(1, r.height);
    if (catalogo) st.endY = Math.max(st.heroH, catalogo.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3);
  }

  /* ---------- Entradas ---------- */
  if (finePointer && !reduce) {
    window.addEventListener("pointermove", function (e) {
      st.tx = clamp(e.clientX / window.innerWidth * 2 - 1, -1, 1);
      st.ty = clamp(e.clientY / window.innerHeight * 2 - 1, -1, 1);
      wake();
    }, { passive: true });
    document.addEventListener("pointerleave", function () { st.tx = 0; st.ty = 0; wake(); });
  }
  if (!reduce) window.addEventListener("scroll", wake, { passive: true });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) wake(); });

  /* ---------- Bucle ---------- */
  var last = 0;
  function frame(now) {
    raf = 0;
    var raw = last ? (now - last) / 1000 : 0;    // duración real del cuadro (para medir rendimiento)
    var dt = raw ? Math.min(0.05, raw) : 0.016;
    last = now;

    // Lecturas primero, escrituras después
    var y = window.scrollY;
    var k = 1 - Math.pow(0.0018, dt);
    st.px += (st.tx - st.px) * k;
    st.py += (st.ty - st.py) * k;
    var instVel = raw ? (y - st.lastY) / raw : 0;
    st.vel += (clamp(instVel, -6000, 6000) - st.vel) * (1 - Math.pow(0.02, dt));
    st.lastY = y; st.y = y;

    var heroScroll = clamp(y - st.heroTop, 0, st.heroH);
    if (y < st.heroTop + st.heroH + 200) {
      hero.style.setProperty("--px", st.px.toFixed(4));
      hero.style.setProperty("--py", st.py.toFixed(4));
      hero.style.setProperty("--sp", (heroScroll / st.heroH).toFixed(4));
    }

    if (three && !three.frozen) three.render(now / 1000, dt, raw);

    var moving = Math.abs(st.tx - st.px) + Math.abs(st.ty - st.py) > 0.001 || Math.abs(st.vel) > 4;
    var inRange = y < st.endY + 40;
    if (!document.hidden && ((three && three.animated && inRange) || moving)) raf = requestAnimationFrame(frame);
    else { last = 0; st.vel = 0; }
  }

  function wake() {
    if (reduce || raf || document.hidden) return;
    st.lastY = window.scrollY;
    raf = requestAnimationFrame(frame);
  }

  measure();
  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { measure(); if (three) three.resize(); wake(); }, 120);
  }
  window.addEventListener("resize", onResize);
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(document.body);
  window.addEventListener("load", measure);
  wake();

  // Al cambiar a modo noche (o volver al día) la escena ajusta sus materiales
  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      if (!three || !three.setTema) return;
      three.setTema();
      if (reduce) three.render(0, 0, 0); else wake();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  }

  /* ---------- Carga diferida de three.js ---------- */
  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }
  function whenIdle(fn) {
    var go = function () {
      if ("requestIdleCallback" in window) window.requestIdleCallback(fn, { timeout: 1200 });
      else setTimeout(fn, 300);
    };
    if (document.readyState === "complete") go(); else window.addEventListener("load", go);
  }
  function loadThree(cb) {
    if (window.THREE) return cb();
    var s = document.createElement("script");
    s.src = THREE_URL;
    s.integrity = THREE_SRI;
    s.crossOrigin = "anonymous";
    s.async = true;
    s.onload = function () { if (window.THREE) cb(); };
    s.onerror = function () { /* sin 3D: la página queda como siempre */ };
    document.head.appendChild(s);
  }

  if (!saveData && webglOK()) {
    whenIdle(function () {
      loadThree(function () {
        try { three = createScene(window.THREE); } catch (e) { three = null; }
        if (three) { measure(); three.resize(); if (reduce) three.render(0, 0, 0); wake(); }
      });
    });
  }

  /* ======================================================================
     Escena
     ====================================================================== */
  function createScene(T) {
    var journey = !reduce;                        // viaje con el scroll (si no, escena quieta en la portada)
    var small = window.innerWidth < 768;

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    if (journey) {
      canvas.className = "scene3d";
      var aura = document.querySelector(".aura");
      if (aura && aura.parentNode) aura.parentNode.insertBefore(canvas, aura.nextSibling);
      else document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      canvas.className = "hero__3d";
      hero.insertBefore(canvas, hero.firstChild);
    }

    var renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    var dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);

    var scene = new T.Scene();
    var BASE_FOV = 30;
    var camera = new T.PerspectiveCamera(BASE_FOV, 1, 0.1, 90);
    var CAM_Z = 14;
    camera.position.set(0, 0, CAM_Z);

    /* Entorno: estudio de luz cálida pintado en un canvas, para que el vidrio tenga qué reflejar */
    scene.environment = (function () {
      var c = document.createElement("canvas");
      c.width = 1024; c.height = 512;
      var g = c.getContext("2d");
      var grd = g.createLinearGradient(0, 0, 0, 512);
      grd.addColorStop(0, "#fff6ea");
      grd.addColorStop(0.36, "#ebcda8");
      grd.addColorStop(0.55, "#8d633f");
      grd.addColorStop(1, "#1a120c");
      g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
      function glow(x, y, r, col) {
        var rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, col); rg.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      glow(250, 150, 150, "rgba(255,255,255,1)");
      glow(720, 120, 120, "rgba(255,252,246,1)");
      glow(540, 310, 170, "rgba(226,150,140,.75)");
      glow(910, 290, 150, "rgba(232,176,108,.8)");
      glow(80, 300, 130, "rgba(160,140,186,.55)");
      g.fillStyle = "rgba(255,255,255,.95)";
      g.fillRect(180, 60, 140, 26);   // ventanas de luz: reflejos nítidos en las facetas
      g.fillRect(660, 70, 100, 18);
      var tex = new T.CanvasTexture(c);
      tex.mapping = T.EquirectangularReflectionMapping;
      tex.encoding = T.sRGBEncoding;
      var pm = new T.PMREMGenerator(renderer);
      var env = pm.fromEquirectangular(tex).texture;
      tex.dispose(); pm.dispose();
      return env;
    })();

    scene.add(new T.HemisphereLight(0xfff3e4, 0x5a3f2a, 0.55));
    var key = new T.DirectionalLight(0xffe4c4, 1.3); key.position.set(5, 7, 9); scene.add(key);
    var rim = new T.PointLight(0xffb3a6, 1.1, 40); rim.position.set(-7, -3, 6); scene.add(rim);
    // Las luces acompañan a la cámara en el viaje
    var lightRig = new T.Group(); scene.add(lightRig); lightRig.add(key); lightRig.add(rim);

    /* Materiales */
    function glass(tint, opts) {
      opts = opts || {};
      return new T.MeshPhysicalMaterial({
        color: tint, metalness: 0.05, roughness: 0.06,
        transparent: true, opacity: opts.opacity || 0.5, depthWrite: false, side: T.DoubleSide,
        clearcoat: 1, clearcoatRoughness: 0.04,
        envMapIntensity: 1.35, flatShading: !!opts.flat,
        iridescence: small ? 0 : (opts.iri || 0), iridescenceIOR: 1.35
      });
    }
    var M = {
      champagne: glass(0xe8bf86, { flat: true, opacity: 0.66, iri: 0.25 }),
      rose: glass(0xe3988e, { flat: true, opacity: 0.64, iri: 0.35 }),
      amber: glass(0xd4843a, { opacity: 0.74 }),
      blush: glass(0xeaa79c, { opacity: 0.66, iri: 0.4 }),
      smoke: glass(0x9a88ae, { flat: true, opacity: 0.55 }),
      gold: new T.MeshPhysicalMaterial({ color: 0xd6ab73, metalness: 1, roughness: 0.2, clearcoat: 0.6, envMapIntensity: 1.35 }),
      pearl: new T.MeshPhysicalMaterial({ color: 0xfff4ea, metalness: 0, roughness: 0.22, clearcoat: 1, sheen: 1, sheenColor: new T.Color(0xffd9cc), envMapIntensity: 1.2 })
    };

    /* Geometrías */
    var gem = new T.LatheGeometry([          // cristal tallado, como el tapón de un frasco
      new T.Vector2(0.0001, -1.05), new T.Vector2(0.98, 0.05), new T.Vector2(0.82, 0.32),
      new T.Vector2(0.48, 0.46), new T.Vector2(0.0001, 0.46)
    ], 8);
    var dropPts = [];                         // gota de perfume
    for (var i = 0; i <= 40; i++) {
      var th = Math.PI * i / 40;
      dropPts.push(new T.Vector2(Math.max(0.0001, Math.sin(th) * Math.pow(Math.sin(th / 2), 1.7) * 0.95), Math.cos(th) * 1.25));
    }
    var drop = new T.LatheGeometry(dropPts, 48);
    var prism = new T.OctahedronGeometry(1, 0);
    var ring = new T.TorusGeometry(1, 0.075, 24, 120);
    var pearl = new T.SphereGeometry(1, 40, 28);

    var edgeCache = new Map();
    function edgesOf(geo) { if (!edgeCache.has(geo)) edgeCache.set(geo, new T.EdgesGeometry(geo, 1)); return edgeCache.get(geo); }
    var edgeMat = new T.LineBasicMaterial({ color: 0xfff8ee, transparent: true, opacity: 0.55, depthWrite: false });

    /* ---------- El gran cristal de la portada (con su aro dorado) ---------- */
    var heroMat = M.champagne.clone(); heroMat.opacity = 0.7;
    var heroEdge = edgeMat.clone();
    var hero3 = new T.Group();
    var heroGem = new T.Mesh(gem, heroMat);
    heroGem.add(new T.LineSegments(edgesOf(gem), heroEdge));
    heroGem.scale.set(1, 1.3, 1);
    var heroRing = new T.Mesh(new T.TorusGeometry(1.25, 0.05, 20, 140), M.gold);
    heroRing.rotation.x = 1.25;
    heroRing.position.y = 0.05;
    hero3.add(heroGem); hero3.add(heroRing);
    hero3.renderOrder = 500;
    scene.add(hero3);

    /* Modo noche: vidrio más transparente y aristas doradas que brillan sobre el fondo oscuro */
    var glassMats = [M.champagne, M.rose, M.amber, M.blush, M.smoke];
    var baseOp = glassMats.map(function (m) { return m.opacity; });
    var nightK = 1, edgeOp = 0.55;
    function applyTema() {
      var night = document.documentElement.getAttribute("data-tema") === "noche";
      nightK = night ? 0.68 : 1;
      edgeOp = night ? 0.85 : 0.55;
      glassMats.forEach(function (m, i) { m.opacity = baseOp[i] * nightK; m.envMapIntensity = night ? 1.1 : 1.35; });
      heroMat.envMapIntensity = night ? 1.1 : 1.35;
      [edgeMat, heroEdge].forEach(function (m) { m.color.setHex(night ? 0xf0cd98 : 0xfff8ee); });
      edgeMat.opacity = edgeOp;
    }
    applyTema();
    var HERO_START = small ? { x: 0.42, y: 0.5, z: -3, s: 0.62 } : { x: 0.17, y: 0.0, z: -3, s: 1.15 };
    var HERO_END = small ? { x: -0.3, y: -0.05, z: 11.2 } : { x: -0.42, y: -0.08, z: 11.4 };

    /* ---------- Piezas de la portada (posición en la pantalla al cargar) ---------- */
    var HERO_SET = small ? [
      { g: drop, m: M.amber, x: 0.9, y: -0.15, z: 0.8, s: 0.36 },
      { g: ring, m: M.gold, x: -0.86, y: 0.72, z: -1.5, s: 0.42, rx: 1.1 },
      { g: pearl, m: M.pearl, x: -0.7, y: 0.95, z: -2.5, s: 0.16 },
      { g: prism, m: M.rose, x: -0.92, y: -0.55, z: -3, s: 0.5, sy: 1.4 },
      { g: pearl, m: M.pearl, x: 0.95, y: 0.2, z: -1, s: 0.13 }
    ] : [
      { g: drop, m: M.amber, x: 0.94, y: -0.18, z: 1.2, s: 0.62 },
      { g: ring, m: M.gold, x: 0.36, y: -0.62, z: -0.6, s: 0.85, rx: 1.1 },
      { g: pearl, m: M.pearl, x: 0.1, y: 0.7, z: -3.5, s: 0.32 },
      { g: gem, m: M.rose, x: -0.93, y: 0.68, z: -1.2, s: 0.6, sy: 1.2 },
      { g: drop, m: M.blush, x: -0.18, y: -0.78, z: -3, s: 0.5 },
      { g: ring, m: M.gold, x: 0.84, y: 0.78, z: -4, s: 0.55, rx: 0.5 },
      { g: pearl, m: M.pearl, x: -0.58, y: -0.45, z: -5, s: 0.22 },
      { g: prism, m: M.smoke, x: 0.66, y: 0.6, z: -6, s: 1.1, sy: 1.5 },
      { g: pearl, m: M.pearl, x: 0.98, y: 0.32, z: -1.5, s: 0.2 }
    ];

    /* ---------- Piezas del viaje: aparecen a los costados mientras se baja ---------- */
    var JOURNEY = [];
    if (journey) {
      var rnd = (function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; })(20261014);
      var kinds = [
        [gem, M.champagne], [drop, M.amber], [ring, M.gold], [prism, M.rose],
        [pearl, M.pearl], [gem, M.rose], [drop, M.blush], [prism, M.smoke], [ring, M.gold], [pearl, M.pearl]
      ];
      var count = small ? 18 : 26;
      for (var q = 0; q < count; q++) {
        var kd = kinds[q % kinds.length];
        var side = (q % 2 ? 1 : -1);
        var z = -7 + rnd() * 8.5;
        var base = kd[0] === pearl ? 0.18 : kd[0] === ring ? 0.6 : 0.62;
        JOURNEY.push({
          g: kd[0], m: kd[1],
          x: side * (small ? 0.58 + rnd() * 0.36 : 0.68 + rnd() * 0.3),
          y: (rnd() - 0.5) * 0.6,
          z: z, s: base * (small ? 0.9 : 1) * (0.75 + rnd() * 0.6), sy: kd[0] === prism ? 1.45 : kd[0] === gem ? 1.2 : 1,
          rx: kd[0] === ring ? 0.4 + rnd() * 1.1 : null,
          f: (q + 0.5 + (rnd() - 0.5) * 0.6) / count   // fracción del recorrido donde cruza el centro
        });
      }
    }

    var Z_NEAR = 1.5, Z_FAR = -8;
    function makeItem(d, idx, isJourney) {
      var mesh = new T.Mesh(d.g, d.m);
      if (d.g === gem || d.g === prism) mesh.add(new T.LineSegments(edgesOf(d.g), edgeMat));
      mesh.rotation.set(d.rx != null ? d.rx : Math.random() * 0.6, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
      mesh.renderOrder = Math.round((d.z + 10) * 10);   // de atrás hacia adelante, para el vidrio
      scene.add(mesh);
      return {
        mesh: mesh, d: d, journey: isJourney, base: new T.Vector3(),
        near: clamp((d.z - Z_FAR) / (Z_NEAR - Z_FAR), 0, 1),
        spin: (0.08 + Math.random() * 0.12) * (Math.random() < 0.5 ? -1 : 1),
        phase: Math.random() * Math.PI * 2,
        delay: isJourney ? 0 : 0.35 + idx * 0.09
      };
    }
    var items = HERO_SET.map(function (d, i) { return makeItem(d, i, false); })
      .concat(JOURNEY.map(function (d, i) { return makeItem(d, i, true); }));

    /* ---------- Polvo dorado (acompaña a la cámara) ---------- */
    var dustN = small ? 80 : 190;
    var dustGeo = new T.BufferGeometry();
    var dustPos = new Float32Array(dustN * 3);
    var dustSpeed = new Float32Array(dustN);
    for (var j = 0; j < dustN; j++) {
      dustPos[j * 3] = (Math.random() * 2 - 1) * 10;
      dustPos[j * 3 + 1] = (Math.random() * 2 - 1) * 7;
      dustPos[j * 3 + 2] = -9 + Math.random() * 11;
      dustSpeed[j] = 0.6 + Math.random() * 0.9;
    }
    dustGeo.setAttribute("position", new T.BufferAttribute(dustPos, 3));
    var spr = (function () {
      var c = document.createElement("canvas"); c.width = c.height = 64;
      var g = c.getContext("2d");
      var rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, "rgba(255,240,214,1)");
      rg.addColorStop(0.35, "rgba(214,164,98,.95)");
      rg.addColorStop(1, "rgba(184,134,76,0)");
      g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
    })();
    var dust = new T.Points(dustGeo, new T.PointsMaterial({
      size: small ? 0.09 : 0.075, map: spr, transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true
    }));
    dust.renderOrder = 1000;
    scene.add(dust);

    /* ---------- Medidas ---------- */
    var W = 1, H = 1, U = 0.01;                   // U: unidades de mundo por px de scroll (a profundidad 0)
    var TAN = Math.tan(T.MathUtils.degToRad(BASE_FOV / 2));
    function halfH(z) { return TAN * (CAM_Z - z); }

    function place() {
      U = (halfH(0) * 2) / H;
      var start = st.heroH * 0.55, span = Math.max(1, st.endY - start);
      items.forEach(function (it) {
        var hh = halfH(it.d.z), hw = hh * camera.aspect;
        var s0 = it.journey ? start + it.d.f * span : 0;   // scroll en el que la pieza pasa por su lugar
        it.s0 = s0;
        it.base.set(it.d.x * hw, -s0 * U + it.d.y * hh, it.d.z);
        it.mesh.position.copy(it.base);
      });
    }

    var lastW = 0, lastH = 0;
    function resize() {
      var w, h;
      if (journey) { w = window.innerWidth; h = window.innerHeight; }
      else { var r = hero.getBoundingClientRect(); w = r.width; h = r.height; }
      w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
      // En celular la barra del navegador cambia el alto al bajar: se ignoran cambios chicos
      if (journey && w === lastW && Math.abs(h - lastH) < 160 && lastH) { place(); return; }
      lastW = w; lastH = h; W = w; H = h;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      place();
      if (reduce) render(0, 0, 0);
    }

    function easeOutBack(t) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    var start = -1, slow = 0, frames = 0, tAcc = 0, roll = 0, fov = BASE_FOV, spinAcc = 0;
    var api = { animated: !reduce, frozen: false, render: render, resize: resize, setTema: applyTema };

    function render(t, dt, raw) {
      if (start < 0) start = t;
      var age = reduce ? 10 : t - start;
      var y = journey ? st.y : 0;
      var vel = journey ? st.vel : 0;
      var speed = Math.abs(vel);

      // Cámara: baja con el scroll; el puntero la corre (lo cercano se mueve más que lo lejano)
      var camY = -y * U;
      camera.position.set(st.px * 1.1, camY - st.py * 0.75, CAM_Z);
      camera.lookAt(st.px * 0.2, camY, -2);
      roll += (clamp(vel / 4200, -0.07, 0.07) - roll) * Math.min(1, dt * 5);
      camera.rotateZ(roll);
      var fovT = BASE_FOV + Math.min(speed / 230, 9);         // con velocidad, la cámara se abre
      fov += (fovT - fov) * Math.min(1, dt * 4);
      if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
      lightRig.position.y = camY;

      // Giro extra según la velocidad de scroll
      spinAcc = clamp(vel / 700, -4, 4);

      items.forEach(function (it) {
        var bob = reduce ? 0 : Math.sin(age * 0.55 + it.phase) * 0.12;
        // lo lejano se queda atrás, lo cercano se adelanta (además del paralaje natural de la cámara)
        var extra = (y - it.s0) * U * (-0.3 + 0.6 * it.near);
        it.mesh.position.y = it.base.y + bob + extra;
        if (!reduce) {
          it.mesh.rotation.y += (it.spin + spinAcc * (0.5 + it.near)) * dt;
          it.mesh.rotation.x += (it.spin * 0.35 + spinAcc * 0.25) * dt;
        }
        var e = it.journey ? 1 : clamp((age - it.delay) / 1.1, 0, 1);
        var sc = it.d.s * (e >= 1 ? 1 : Math.max(0.0001, easeOutBack(e)));
        it.mesh.scale.set(sc, sc * (it.d.sy || 1), sc);
      });

      // El gran cristal: gira y vuela hacia la cámara al bajar por la portada, hasta atravesarla
      var hp = clamp(y / Math.min(st.heroH * 0.95, H * 1.1), 0, 1);
      var fly = hp * hp * hp;                                  // arranca lento y se acelera
      var hz = lerp(HERO_START.z, HERO_END.z, fly);
      var hh = halfH(hz);
      var hx = lerp(HERO_START.x, HERO_END.x, smooth(0, 1, hp)) * hh * camera.aspect;
      var hy = camY + lerp(HERO_START.y, HERO_END.y, hp) * hh + (reduce ? 0 : Math.sin(age * 0.5) * 0.15);
      hero3.position.set(hx, hy, hz);
      var heroIn = reduce ? 1 : clamp((age - 0.2) / 1.3, 0, 1);
      var hs = HERO_START.s * (heroIn >= 1 ? 1 : Math.max(0.0001, easeOutBack(heroIn)));
      hero3.scale.setScalar(hs);
      if (!reduce) {
        heroGem.rotation.y += (0.25 + spinAcc * 0.9) * dt;
        heroRing.rotation.z += (0.4 + spinAcc * 1.2) * dt;
      }
      hero3.rotation.set(hp * 1.1, hp * 5.5, hp * 0.6);
      var fade = 1 - smooth(0.74, 0.97, hp);
      heroMat.opacity = 0.7 * nightK * fade; heroEdge.opacity = edgeOp * fade;
      hero3.visible = fade > 0.01;
      heroRing.visible = fade > 0.3;

      // Polvo: acompaña a la cámara y corre hacia arriba más rápido cuanto más rápido se baja
      if (!reduce) {
        var rush = (vel * U) * 0.9;
        for (var n = 0; n < dustN; n++) {
          var yi = n * 3 + 1;
          dustPos[yi] += (dustSpeed[n] * 0.12 + rush * dustSpeed[n]) * dt;
          if (dustPos[yi] > 7) dustPos[yi] -= 14; else if (dustPos[yi] < -7) dustPos[yi] += 14;
        }
        dustGeo.attributes.position.needsUpdate = true;
      }
      dust.position.y = camY;

      // Se apaga al llegar al catálogo
      if (journey) {
        var op = smooth(0, 1.2, age) * (1 - smooth(st.endY - H * 0.9, st.endY, y));
        canvas.style.opacity = op.toFixed(3);
        canvas.style.visibility = op < 0.005 ? "hidden" : "visible";
        if (op < 0.005) return;
      }

      renderer.render(scene, camera);
      if (!journey) canvas.classList.add("is-ready");

      // Si el equipo no da abasto, se baja la resolución; si aun así no alcanza, la escena queda quieta
      if (!reduce && raw > 0) {
        frames++; tAcc += raw;
        if (frames >= 24 || tAcc > 1.5) {
          var avg = tAcc / frames;
          if (avg > 0.09) {
            // demasiado lento: en el viaje la escena se retira; en la portada queda quieta
            api.animated = false; api.frozen = true;
            if (journey) { canvas.style.transition = "opacity .6s"; canvas.style.opacity = "0"; }
          }
          else if (avg > 0.034 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); renderer.setSize(W, H, false); }
          else if (avg > 0.05) { slow++; if (slow >= 2) { api.animated = false; api.frozen = true; if (journey) { canvas.style.transition = "opacity .6s"; canvas.style.opacity = "0"; } } }
          frames = 0; tAcc = 0;
        }
      }
    }

    return api;
  }
})();
