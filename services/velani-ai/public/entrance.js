/* Standalone and fail-open: no API, framework, font-loading or app dependency. */
(() => {
  const dialog = document.getElementById("velani-entrance");
  const skip = document.getElementById("skip-entrance");
  const replay = document.getElementById("replay-entrance");
  if (!dialog || !skip || typeof dialog.showModal !== "function") return;
  if (getComputedStyle(dialog).getPropertyValue("--velani-entry-ready").trim() !== "1") return;

  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const marker = "velani:entrance:v2";
  const duration = 3350;
  const canvas = dialog.querySelector(".velani-entry-canvas");
  let timer;
  let frame;
  let renderer;
  let started;
  let pointerX = 0;
  let pointerY = 0;
  let scrollCompensation;

  function draw(now) {
    if (!dialog.open) return;
    try {
      if (!renderer?.render((now - started) / 1000, pointerX, pointerY)) {
        dialog.dataset.renderer = "fallback";
        return;
      }
      dialog.dataset.renderer = "ready";
      frame = requestAnimationFrame(draw);
    } catch {
      dialog.dataset.renderer = "fallback";
    }
  }
  let priorFocus;
  let seen = false;
  try { seen = sessionStorage.getItem(marker) === "seen"; } catch { /* Storage is optional. */ }

  function remember() {
    seen = true;
    try { sessionStorage.setItem(marker, "seen"); } catch { /* Do not block private browsing. */ }
  }

  function finish() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    root.classList.remove("velani-entry-active");
    if (scrollCompensation) root.style.setProperty("--velani-entry-scrollbar", scrollCompensation);
    else root.style.removeProperty("--velani-entry-scrollbar");
    if (!dialog.open) return;
    dialog.close();
    if (priorFocus instanceof HTMLElement && priorFocus.isConnected) {
      priorFocus.focus({ preventScroll: true });
    }
    priorFocus = null;
  }

  function play() {
    if (motion.matches || document.hidden || dialog.open || document.querySelector("dialog[open]")) return;
    // Prepare the tiny hidden canvas before starting the timed composition.
    try {
      if (!renderer && window.VelaniEntranceRenderer && canvas) {
        renderer = new window.VelaniEntranceRenderer(canvas);
        renderer.render(0);
        renderer.gl.finish();
      }
    } catch {
      renderer = null;
      dialog.dataset.renderer = "fallback";
    }
    priorFocus = document.activeElement;
    pointerX = 0;
    pointerY = 0;
    scrollCompensation = root.style.getPropertyValue("--velani-entry-scrollbar");
    root.style.setProperty("--velani-entry-scrollbar", `${Math.max(0, innerWidth - root.clientWidth)}px`);
    // Arm cleanup before showing: the page never waits for an animation event.
    timer = setTimeout(finish, duration);
    try {
      dialog.showModal();
      root.classList.add("velani-entry-active");
      remember();
      started = performance.now();
      // The SVG is visible immediately; WebGL progressively replaces it.
      try {
        draw(performance.now());
      } catch {
        dialog.dataset.renderer = "fallback";
      }
    } catch {
      finish();
    }
  }

  function translate() {
    const spanish = root.lang.toLowerCase().startsWith("es");
    document.getElementById("velani-entry-title").textContent = spanish ? "Bienvenido a Velani" : "Welcome to Velani";
    document.getElementById("velani-entry-description").textContent = spanish
      ? "Una breve introducción. Sáltala o pulsa Escape para continuar."
      : "A short introduction. Skip or press Escape to continue.";
    skip.firstElementChild.textContent = spanish ? "Saltar intro" : "Skip intro";
    if (replay) replay.textContent = spanish ? "Repetir intro" : "Replay intro";

  }

  dialog.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointerX = (event.clientX / innerWidth - .5) * 2;
    pointerY = (event.clientY / innerHeight - .5) * 2;
  });
  canvas?.addEventListener("webglcontextlost", () => {
    cancelAnimationFrame(frame);
    dialog.dataset.renderer = "fallback";
  });
  skip.addEventListener("click", finish);
  replay?.addEventListener("click", play);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(); });
  dialog.addEventListener("keydown", (event) => {
    // Keyboard users can continue into the site without waiting.
    if (event.key === "Tab") finish();
  });
  dialog.addEventListener("close", () => {
    if (!dialog.open) {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      root.classList.remove("velani-entry-active");
    }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); });
  window.addEventListener("pagehide", () => {
    finish();
    renderer?.dispose();
    renderer = null;
  });
  window.addEventListener("beforeprint", finish);
  motion.addEventListener("change", () => {
    if (replay) replay.hidden = motion.matches;
    if (motion.matches) finish();
  });
  new MutationObserver(translate).observe(root, { attributes: true, attributeFilter: ["lang"] });
  translate();
  if (replay) replay.hidden = motion.matches;

  const navigation = performance.getEntriesByType("navigation")[0];
  const alreadyInteracting = document.activeElement !== document.body && document.activeElement !== root;
  const bypass = motion.matches || location.hash || window.Shopify?.designMode || navigation?.type === "back_forward"
    || window.scrollY > 0 || document.hidden || alreadyInteracting;
  if (bypass) remember();
  else if (!seen) play();
})();
