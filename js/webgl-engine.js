// Corefinity Hybrid WebGL Field
// -------------------------------------
// - Attaches to <canvas id="cf-webgl-field">
// - Reacts to .cf-fttb-pill[data-variant]
// - Variants: home, category, product, cart, checkout
// - Autoplay cycles variants until user interacts
// - Falls back gracefully if WebGL is unavailable

(function () {
  const canvas = document.getElementById("cf-webgl-field");
  if (!canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Fallback: if WebGL is not available, we simply keep the CSS gradient background.
  const contextAttributes = {
    antialias: true,
    premultipliedAlpha: false,
    alpha: true,
  };

  const gl =
    canvas.getContext("webgl", contextAttributes) ||
    canvas.getContext("experimental-webgl", contextAttributes);

  if (!gl) {
    console.warn("[Corefinity] WebGL not available; using CSS-only background.");
    return;
  }

  canvas.style.background = "transparent";

  // -----------------------------
  // Variants & Color Accents
  // -----------------------------
  const VARIANTS = ["home", "category", "product", "cart", "checkout"];

  // Accent colors roughly based on your palette:
  // --primary-blue, --primary-blue-light, --primary-orange, etc.
  const ACCENTS = {
    home: [0.0, 148.0 / 255.0, 230.0 / 255.0], // primary blue
    category: [0.21, 0.78, 0.72], // teal-ish
    product: [0.13, 0.70, 1.0], // light blue
    cart: [1.0, 0.42, 0.21], // orange
    checkout: [1.0, 0.51, 0.33], // softer orange
  };

  const GRID_VERTICAL_COLORS = {
    home: [1.0, 0.92, 0.29], // neon yellow (#FFE84A)
    category: [0.78, 0.48, 1.0], // laser purple (#C77BFF)
    product: [1.0, 0.3, 0.3], // cyber red (#FF4D4D)
    cart: [0.49, 1.0, 0.43], // acid green (#7DFF70)
    checkout: [0.39, 0.99, 0.85], // aqua mint (#63FCD9)
  };

  let activeVariant = "home";
  let activeVertColor = GRID_VERTICAL_COLORS.home;
  let lastTime = 0;
  let startTime = performance.now();
  let autoplayId = null;
  let autoplayStopped = false;
  let burst = 0.0;

  // -----------------------------
  // Shaders (Hybrid: fog + streaks)
  // -----------------------------

  const vertexSrc = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader: transparent frame + slow, fine pixel explosion
    // Fragment shader: minimal floating grid, thin lines, slow drift
  const fragmentSrc = `
    precision highp float;
    varying vec2 v_uv;

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_accent;
    uniform vec3 u_vertColor;
    uniform float u_variantIndex;
    uniform float u_burst;

    void main() {
      vec2 uv = v_uv;
      vec2 res = u_resolution;
      float t = u_time;

      // Center and aspect-correct coordinates
      vec2 p = (uv - 0.5) * vec2(res.x / res.y, 1.0);

      // Variant index 0..4 (0 = Homepage fastest, 4 = Checkout slowest)
      float vIndex = clamp(u_variantIndex, 0.0, 4.0);

      // Base drift speed: faster variants drift slightly faster,
      // but always very calm and slow.
      float driftSpeed = mix(0.05, 0.015, vIndex / 4.0);

      // Small additional motion when burst is active (pill hover),
      // but still subtle and long-lived.
      float burst = clamp(u_burst, 0.0, 2.0);
      float burstPhase = burst * 0.4;

      // Compute grid coordinates with slow drifting offset
      float scale = 9.0; // number of cells across the viewport
      vec2 drift = vec2(
        t * driftSpeed * 0.6 + burstPhase,
        t * driftSpeed * -0.4 - burstPhase * 0.5
      );

      vec2 gridUV = p * scale + drift;

      // Distance to nearest vertical / horizontal grid line
      vec2 cell = abs(fract(gridUV) - 0.5);
      float nearestLine = min(cell.x, cell.y);

      // Thin, crisp lines
      float lineThickness = 0.03;
      float verticalLine = smoothstep(lineThickness, lineThickness - 0.012, cell.x);
      float horizontalLine = smoothstep(lineThickness, lineThickness - 0.012, cell.y);

      // A second, even finer inner grid for extra precision
      float fineScale = scale * 2.0;
      vec2 fineGridUV = p * fineScale + drift * 1.3;
      vec2 fineCell = abs(fract(fineGridUV) - 0.5);
      float fineVertical = smoothstep(0.018, 0.012, fineCell.x);
      float fineHorizontal = smoothstep(0.018, 0.012, fineCell.y);

      // Combine lines
      float verticalMask = clamp(verticalLine + fineVertical * 0.6, 0.0, 1.0);
      float horizontalMask = clamp(horizontalLine + fineHorizontal * 0.6, 0.0, 1.0);
      float gridMask = clamp(verticalMask + horizontalMask, 0.0, 1.0);

      // Subtle breathing of intensity over time, very slow
      float breathe = 0.4 + 0.25 * sin(t * 0.25);

      // Base color is essentially transparent/black;
      // we only draw where gridMask > 0.
      vec3 verticalColor = vec3(
        u_vertColor.r,
        u_vertColor.g,
        u_vertColor.b
      ) * (0.55 + 0.25 * breathe);
      vec3 horizontalColor = u_accent * (0.55 + 0.25 * breathe);

      vec3 color =
        verticalColor * verticalMask +
        horizontalColor * horizontalMask;

      // Soft vignette so lines fade slightly near the corners
      float r = length(p);
      float vignette = smoothstep(1.2, 0.35, r);
      color *= vignette;

      // Very light tone mapping
      color = 1.0 - exp(-color * 1.4);

      // Alpha based on grid intensity; background stays mostly transparent.
      float alpha = clamp(gridMask * 1.4 * vignette, 0.0, 1.0);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  // -----------------------------
  // Shader compilation helpers
  // -----------------------------
  function compileShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("[Corefinity] Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(vsSrc, fsSrc) {
    const vs = compileShader(gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[Corefinity] Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  const program = createProgram(vertexSrc, fragmentSrc);
  if (!program) return;

  gl.useProgram(program);
  gl.clearColor(0, 0, 0, 0);

  // Fullscreen quad
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  const quadVertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  const aPositionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPositionLoc);
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTimeLoc = gl.getUniformLocation(program, "u_time");
  const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
  const uAccentLoc = gl.getUniformLocation(program, "u_accent");
  const uVariantIndexLoc = gl.getUniformLocation(program, "u_variantIndex");
  const uBurstLoc = gl.getUniformLocation(program, "u_burst");
  const uVertColorLoc = gl.getUniformLocation(program, "u_vertColor");

  function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolutionLoc, width, height);
    }
  }

  setCanvasSize();
  window.addEventListener("resize", setCanvasSize);

  // -----------------------------
  // Variant handling (pills)
  // -----------------------------

  const pills = Array.from(document.querySelectorAll(".cf-fttb-pill"));
  const pillsRow = document.querySelector(".cf-fttb-pills");

  function variantIndex(variant) {
    const idx = VARIANTS.indexOf(variant);
    return idx >= 0 ? idx : 0;
  }

  function getAccent(variant) {
    return ACCENTS[variant] || ACCENTS.home;
  }

  // Stronger bursts for faster pages (200ms) so they feel snappier
  const BURST_STRENGTH = {
    home: 1.6, // 200ms
    category: 1.3, // 350ms
    product: 1.1, // 400ms
    cart: 1.0, // 440ms
    checkout: 0.9, // 500ms
  };

  function setActiveVariant(variant, opts) {
    if (!VARIANTS.includes(variant)) variant = "home";
    activeVariant = variant;
    activeVertColor = GRID_VERTICAL_COLORS[variant] || GRID_VERTICAL_COLORS.home;

    // Update pill classes
    pills.forEach((pill) => {
      const isActive = pill.dataset.variant === variant;
      pill.classList.toggle("is-active", isActive);
      if (isActive) {
        pill.setAttribute("aria-selected", "true");
      } else {
        pill.setAttribute("aria-selected", "false");
      }
    });

    // Metric tick animation
    if (!opts || !opts.silent) {
      const activePill = pills.find((p) => p.dataset.variant === variant);
      const metricSpan = activePill
        ? activePill.querySelector(".cf-fttb-pill-metric")
        : null;
      if (metricSpan) {
        metricSpan.classList.remove("is-ticking");
        // force reflow
        void metricSpan.offsetWidth;
        metricSpan.classList.add("is-ticking");
      }
    }

    if (!opts || !opts.silent) {
      // Stronger burst for faster variants so you feel the difference
      const strength = BURST_STRENGTH[variant] || 1.0;
      burst = strength;
    }
  }

  // Attach events
  let userInteracted = false;

  pills.forEach((pill) => {
    const variant = pill.dataset.variant;
    if (!variant) return;

    function onUserActivate() {
      userInteracted = true;
      stopAutoplay();
      setActiveVariant(variant, { silent: false });
    }

    pill.addEventListener("click", onUserActivate);
    pill.addEventListener("mouseenter", onUserActivate);
    pill.addEventListener("focus", onUserActivate);
  });

  if (pillsRow) {
    let resumeTimeoutId = null;
    const scheduleResume = () => {
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
      resumeTimeoutId = setTimeout(() => {
        if (!userInteracted) startAutoplay();
      }, 5000);
    };
    pillsRow.addEventListener("mouseleave", scheduleResume);
    pillsRow.addEventListener("blur", scheduleResume, true);
  }

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => {
      const currentIndex = VARIANTS.indexOf(activeVariant);
      const nextIndex = (currentIndex + 1) % VARIANTS.length;
      setActiveVariant(VARIANTS[nextIndex], { silent: false });
    }, 5200);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  // Initial state
  const initialPill = pills.find((p) => p.classList.contains("is-active"));
  const initialVariant =
    (initialPill && initialPill.dataset.variant) || "home";
  setActiveVariant(initialVariant, { silent: true });
  startAutoplay();

  // -----------------------------
  // Render loop
  // -----------------------------
  function render(now) {
    const t = (now - startTime) / 1000.0;
    lastTime = t;

    setCanvasSize();

    gl.useProgram(program);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Decay burst over time (slightly slower so bursts feel impactful)
    burst *= 0.90;
    if (burst < 0.003) burst = 0.0;

    gl.uniform1f(uTimeLoc, t);
    gl.uniform1f(uVariantIndexLoc, variantIndex(activeVariant));
    gl.uniform1f(uBurstLoc, burst);

    const accent = getAccent(activeVariant);
    gl.uniform3f(uAccentLoc, accent[0], accent[1], accent[2]);
    const vertColor = activeVertColor || GRID_VERTICAL_COLORS.home;
    gl.uniform3f(uVertColorLoc, vertColor[0], vertColor[1], vertColor[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();