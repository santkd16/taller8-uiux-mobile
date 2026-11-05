"use strict";

// La nueva apariencia comienza en azul tinta y conserva la selección explícita.
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const preference = {
  read(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Se puede usar sin almacenamiento. */
    }
  },
};
const themes = {
  ink: "#111c30",
  graphite: "#202127",
  plum: "#282039",
  light: "#f2f5fa",
};
function applyTheme(theme) {
  const selected = Object.hasOwn(themes, theme) ? theme : "ink";
  root.dataset.theme = selected;
  const select = document.getElementById("theme-select");
  if (select) select.value = selected;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themes[selected]);
}
applyTheme(preference.read("calibrar-appearance"));
document.getElementById("theme-select")?.addEventListener("change", (event) => {
  applyTheme(event.target.value);
  preference.write("calibrar-appearance", event.target.value);
});
function updateMotionControl() {
  const reduced =
    reducedMotion.matches || preference.read("calibrar-motion") === "reduced";
  root.dataset.motion = reduced ? "reduced" : "full";
  const button = document.getElementById("motion-toggle");
  button?.setAttribute("aria-pressed", String(reduced));
  if (button) {
    button.disabled = reducedMotion.matches;
    button.title = reducedMotion.matches
      ? "Movimiento reducido por la preferencia del sistema"
      : "Reducir las transiciones de la interfaz";
  }
}
document.getElementById("motion-toggle")?.addEventListener("click", () => {
  preference.write(
    "calibrar-motion",
    root.dataset.motion === "reduced" ? "full" : "reduced",
  );
  updateMotionControl();
});
reducedMotion.addEventListener("change", updateMotionControl);
updateMotionControl();
// La entrada del instrumento ocurre una vez, incluso al volver a la portada.
setTimeout(() => (root.dataset.ready = "true"), 800);

// Un teléfono para reconocer causa y efecto en la portada.
const coverDevice = document.getElementById("cover-device");
document.querySelectorAll("[data-cover-platform]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-cover-platform]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    coverDevice.classList.toggle(
      "material",
      button.dataset.coverPlatform === "android",
    );
  });
});
document.getElementById("cover-confirm")?.addEventListener("click", (event) => {
  const confirmed = event.currentTarget.dataset.confirmed === "true";
  event.currentTarget.dataset.confirmed = String(!confirmed);
  event.currentTarget.textContent = confirmed
    ? "Confirmar cita de prueba"
    : "Reiniciar prueba";
  coverDevice.querySelector(".device-message").textContent = confirmed
    ? "Cita disponible para revisar."
    : "Cita confirmada en esta demostración.";
});

// Presentación: misma navegación por botones, teclado, índice y gesto táctil.
const slides = [...document.querySelectorAll(".presentation .slide")];
if (slides.length) {
  let current = 0;
  const counter = document.getElementById("slide-counter");
  const label = document.getElementById("slide-label");
  const jump = document.getElementById("slide-jump");
  const progress = document.querySelector(".progress-track");
  const fill = document.getElementById("progress-fill");
  const previous = document.getElementById("prev-slide");
  const next = document.getElementById("next-slide");
  slides.forEach((slide, index) =>
    jump.add(new Option(slide.dataset.title, String(index))),
  );
  function showSlide(index, moveFocus = false) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      slide.classList.toggle("active", i === current);
      slide.setAttribute("aria-hidden", String(i !== current));
    });
    jump.value = String(current);
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    label.textContent = slides[current].dataset.title;
    progress.setAttribute("aria-valuenow", String(current + 1));
    progress.setAttribute(
      "aria-valuetext",
      `${current + 1} de ${slides.length}: ${slides[current].dataset.title}`,
    );
    fill.style.width = `${((current + 1) / slides.length) * 100}%`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    history.replaceState(null, "", `#diapositiva-${current + 1}`);
    if (moveFocus) {
      const heading = slides[current].querySelector("h1, h2");
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  previous.addEventListener("click", () => showSlide(current - 1));
  next.addEventListener("click", () => showSlide(current + 1));
  jump.addEventListener("change", () => showSlide(Number(jump.value)));
  document
    .querySelectorAll("[data-next]")
    .forEach((button) =>
      button.addEventListener("click", () => showSlide(current + 1, true)),
    );
  document.addEventListener("keydown", (event) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target.closest('input, select, textarea, [contenteditable="true"]')
    )
      return;
    const action = {
      ArrowRight: current + 1,
      PageDown: current + 1,
      ArrowLeft: current - 1,
      PageUp: current - 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (event.key in action) {
      event.preventDefault();
      showSlide(action[event.key], true);
    } else if (event.key === " " && !event.target.closest("button, a")) {
      event.preventDefault();
      showSlide(current + 1, true);
    }
  });
  const stage = document.getElementById("slide-stage");
  let touchStart = null;
  stage.addEventListener(
    "touchstart",
    (event) => {
      if (event.target.closest("button, a, input, select")) return;
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2)
        showSlide(current + (dx < 0 ? 1 : -1), true);
    },
    { passive: true },
  );
  stage.addEventListener("touchcancel", () => {
    touchStart = null;
  });
  const exposure = document.getElementById("fullscreen-slide");
  function setExposure(active) {
    document.body.classList.toggle("exposure-mode", active);
    exposure.setAttribute("aria-pressed", String(active));
    exposure.textContent = active ? "Salir de exposición" : "Modo exposición";
  }
  exposure.addEventListener("click", async () => {
    if (document.body.classList.contains("exposure-mode")) {
      setExposure(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          document.getElementById("presentation-notice").textContent =
            "Usa Esc para salir de pantalla completa.";
        }
      }
    } else {
      setExposure(true);
      try {
        await document.documentElement.requestFullscreen?.();
      } catch {
        document.getElementById("presentation-notice").textContent =
          "Modo exposición activado. El navegador no permite pantalla completa.";
      }
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) setExposure(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setExposure(false);
  });
  const requested = Number(location.hash.match(/diapositiva-(\d+)/)?.[1]);
  showSlide(requested ? requested - 1 : 0);
}

// Laboratorio: conservar los escenarios y hacer visibles sus resultados.
const platformButtons = document.querySelectorAll("[data-platform]");
platformButtons.forEach((button) =>
  button.addEventListener("click", () => {
    platformButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    document
      .getElementById("platform-phone")
      .classList.toggle("material", button.dataset.platform === "android");
  }),
);
const states = {
  loading: [
    "◌",
    "Cargando citas",
    "Estamos consultando la información. Espera un momento.",
    "Consulta en curso",
  ],
  empty: [
    "＋",
    "Aún no hay citas",
    "Cuando agendes una cita aparecerá aquí.",
    "Agendar cita",
  ],
  error: [
    "!",
    "No pudimos cargar las citas",
    "Comprueba la conexión y vuelve a intentarlo.",
    "Reintentar consulta",
  ],
  offline: [
    "⌁",
    "Sin conexión",
    "Puedes consultar los datos locales de ejemplo; no hay sincronización activa.",
    "Ver datos locales",
  ],
  success: [
    "✓",
    "Consulta completada",
    "Tus citas están actualizadas.",
    "Ver citas",
  ],
};
let currentState = "success";
function setDemoState(state) {
  currentState = state;
  document.querySelectorAll("[data-state]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.state === state));
    button.classList.toggle("active", button.dataset.state === state);
  });
  document.querySelector(".state-card").dataset.currentState = state;
  const [icon, title, message, action] = states[state];
  document.getElementById("state-icon").textContent = icon;
  document.getElementById("state-title").textContent = title;
  document.getElementById("state-message").textContent = message;
  const button = document.getElementById("state-action");
  button.textContent = action;
  button.disabled = state === "loading";
}
if (document.getElementById("state-action")) {
  setDemoState("success");
  document
    .querySelectorAll("[data-state]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        setDemoState(button.dataset.state),
      ),
    );
  document.getElementById("state-action").addEventListener("click", () => {
    if (currentState === "error") {
      setDemoState("success");
      document.getElementById("state-message").textContent =
        "Reintento completado en esta simulación. Cita: jueves, 10:30 a. m.";
    } else if (currentState === "empty") {
      document.getElementById("date-demo").focus();
      document.getElementById("date-demo").scrollIntoView({ block: "center" });
    } else {
      document.getElementById("state-message").textContent =
        currentState === "offline"
          ? "Dato local de ejemplo: consulta general, jueves a las 10:30 a. m. Sin confirmar con el servidor."
          : "Consulta general: jueves, 10:30 a. m. Registro de demostración.";
    }
  });
}
const appointmentDialog = document.getElementById("appointment-dialog");
document.getElementById("appointment-btn")?.addEventListener("click", () => {
  appointmentDialog.returnValue = "";
  appointmentDialog.showModal();
});
appointmentDialog?.addEventListener("close", () => {
  const confirmed = appointmentDialog.returnValue === "confirm";
  document.getElementById("appointment-feedback").textContent = confirmed
    ? "Cita confirmada en esta demostración. No se realizó una reserva real."
    : "Puedes revisar los datos antes de confirmar.";
  document.getElementById("appointment-step").textContent = confirmed
    ? "Paso 2 de 2: confirmado en la demo"
    : "Paso 1 de 2";
  document.getElementById("appointment-btn").textContent = confirmed
    ? "Revisar cita de prueba"
    : "Continuar";
});
const criteria = [
  ...document.querySelectorAll('.check-card input[type="checkbox"]'),
];
criteria.forEach((input) =>
  input.addEventListener("change", () => {
    document.getElementById("check-count").textContent =
      `${criteria.filter((item) => item.checked).length} de ${criteria.length} criterios activados`;
  }),
);
document
  .getElementById("adaptive-width")
  ?.addEventListener("input", (event) => {
    const compact = Number(event.target.value) < 50;
    const preview = document.getElementById("adaptive-preview");
    preview.classList.toggle("compact", compact);
    preview.style.maxWidth = `${240 + Number(event.target.value) * 3}px`;
    document.getElementById("width-value").textContent = compact
      ? "Compacto"
      : "Amplio";
  });
const validationForm = document.getElementById("validation-demo");
validationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("demo-name");
  const email = document.getElementById("demo-email");
  const feedback = document.getElementById("form-feedback");
  const invalidName = !name.value.trim();
  const invalidEmail = !email.value.trim() || !email.validity.valid;
  validationForm.dataset.complete = String(!invalidName && !invalidEmail);
  name.setAttribute("aria-invalid", String(invalidName));
  email.setAttribute("aria-invalid", String(invalidEmail));
  if (invalidName) {
    feedback.textContent = "Escribe tu nombre para continuar.";
    name.focus();
  } else if (invalidEmail) {
    feedback.textContent =
      "Escribe un correo válido, por ejemplo nombre@correo.com.";
    email.focus();
  } else
    feedback.textContent =
      "Datos válidos. Recordatorio guardado solo en esta demostración.";
});
validationForm?.querySelectorAll("input").forEach((input) =>
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    validationForm.dataset.complete = "false";
  }),
);
const syncMessages = {
  pending: [
    "Pendiente de sincronización",
    "Guardado localmente; el servidor aún no confirmó la entrega.",
  ],
  synced: [
    "Confirmado por el servidor (simulación)",
    "La operación figura como aceptada en este ejemplo.",
  ],
  conflict: [
    "Conflicto por resolver",
    "Los datos locales y remotos difieren. Revisa antes de sobrescribir.",
  ],
};
function showSync(state) {
  const [title, description] = syncMessages[state];
  document.querySelector("#sync-status b").textContent = title;
  document.querySelector("#sync-status small").textContent = description;
  document.getElementById("resolve-conflict").hidden = state !== "conflict";
  document
    .querySelectorAll("[data-sync]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.sync === state),
      ),
    );
}
document.querySelectorAll("[data-sync]").forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => showSync(button.dataset.sync));
});
document.getElementById("resolve-conflict")?.addEventListener("click", () => {
  showSync("pending");
  document.querySelector("#sync-status small").textContent =
    "Versión local elegida en la simulación. Pendiente de confirmación del servidor.";
  document.querySelector('[data-sync="pending"]').focus();
});
document.querySelectorAll("[data-touch]").forEach((button) =>
  button.addEventListener("click", async () => {
    const feedback = document.getElementById("touch-feedback");
    if (button.dataset.touch === "favorito") {
      const selected = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute(
        "aria-label",
        selected ? "Retirar cita de favoritos" : "Añadir cita a favoritos",
      );
      button.textContent = selected ? "★" : "☆";
      feedback.textContent = selected
        ? "Cita añadida a favoritos en esta demo."
        : "Cita retirada de favoritos en esta demo.";
    } else if (button.dataset.touch === "información") {
      document.getElementById("info-dialog").showModal();
    } else {
      const url = new URL("ejemplos.html#toque", location.href).href;
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Calibrar: ejemplo de áreas táctiles",
            url,
          });
          feedback.textContent =
            "Se abrió la opción de compartir del dispositivo.";
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          feedback.textContent =
            "Enlace del ejemplo copiado. Puedes pegarlo para compartir.";
        } else throw new Error("Se requiere copia manual");
      } catch (error) {
        if (error.name === "AbortError") {
          feedback.textContent = "Compartir cancelado.";
          return;
        }
        const input = document.getElementById("share-link");
        input.value = url;
        document.getElementById("share-dialog").showModal();
        input.focus();
        input.select();
      }
    }
  }),
);

// Los destinos que se dibujan en el teléfono también responden a la persona.
const demoPhone = document.getElementById("platform-phone");
if (demoPhone) {
  const nav = demoPhone.querySelector(".phone-nav");
  nav.setAttribute("role", "group");
  nav.setAttribute("aria-label", "Pantallas del teléfono de ejemplo");
  const home = demoPhone.querySelector(".phone-content");
  const panel = document.createElement("div");
  panel.className = "phone-tab-panel";
  panel.hidden = true;
  panel.id = "phone-destination";
  demoPhone.insertBefore(panel, nav);
  const destinations = {
    Inicio: null,
    Agenda: [
      "Tu agenda",
      "Consulta general. Jueves, 12 de noviembre, a las 10:30 a. m.",
    ],
    Perfil: [
      "Perfil de prueba",
      "Alex. Estos datos son ficticios y se usan para demostrar la navegación.",
    ],
  };
  nav.replaceChildren();
  Object.entries(destinations).forEach(([name, content]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.setAttribute("aria-pressed", String(name === "Inicio"));
    button.addEventListener("click", () => {
      nav
        .querySelectorAll("button")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      home.hidden = Boolean(content);
      panel.hidden = !content;
      if (content) {
        const title = document.createElement("h3");
        const description = document.createElement("p");
        title.textContent = content[0];
        description.textContent = content[1];
        panel.replaceChildren(title, description);
      }
    });
    nav.append(button);
  });
}
const labSections = [...document.querySelectorAll(".demo-section")];
if (labSections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll(".lab-index a").forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-10% 0px -55% 0px", threshold: 0 },
  );
  labSections.forEach((section) => observer.observe(section));
}

// Dos indicadores para una misma carga controlada por la persona.
const loadingComparison = document.getElementById("carga-comparada");
function setLoadingComparison(phase) {
  const waiting = phase === "loading";
  const completed = phase === "complete";
  loadingComparison.dataset.phase = phase;
  loadingComparison
    .querySelectorAll(".loading-panel")
    .forEach((panel) => panel.setAttribute("aria-busy", String(waiting)));
  loadingComparison
    .querySelectorAll(".loading-placeholder")
    .forEach((element) => (element.hidden = completed));
  loadingComparison
    .querySelectorAll(".loading-content")
    .forEach((element) => (element.hidden = !completed));
  const finish = document.getElementById("loading-finish");
  const start = document.getElementById("loading-start");
  start.disabled = waiting;
  start.textContent = completed ? "Repetir carga" : "Simular carga";
  finish.disabled = !waiting;
  document.getElementById("loading-status").textContent = waiting
    ? "Consulta simulada en curso. Observa los dos indicadores y pulsa Completar carga para recibir el mismo contenido."
    : "Carga completada. Ambos indicadores dieron paso a los mismos datos; la estructura del skeleton anticipaba el contenido.";
}
document.getElementById("loading-start")?.addEventListener("click", () => {
  setLoadingComparison("loading");
  document.getElementById("loading-finish").focus();
});
document.getElementById("loading-finish")?.addEventListener("click", () => {
  setLoadingComparison("complete");
  document.getElementById("loading-start").focus();
});

// Comparación de la misma tarea: cambia la jerarquía, no la información.
document
  .getElementById("show-design-notes")
  ?.addEventListener("click", (event) => {
    const expanded =
      event.currentTarget.getAttribute("aria-expanded") !== "true";
    event.currentTarget.setAttribute("aria-expanded", String(expanded));
    event.currentTarget.textContent = expanded
      ? "Ocultar decisiones de diseño"
      : "Mostrar decisiones de diseño";
    document.getElementById("design-notes").hidden = !expanded;
    document.getElementById("antes-despues").dataset.notes = String(expanded);
  });
document.querySelectorAll("[data-screen-action]").forEach((button) =>
  button.addEventListener("click", () => {
    const [version, action] = button.dataset.screenAction.split("-");
    document.getElementById("screen-feedback").textContent =
      action === "confirm"
        ? `Confirmación de prueba desde la versión ${version === "before" ? "Antes" : "Después"}. No se reservó una cita real.`
        : "Volviste a la revisión de datos en esta comparación. Puedes probar la otra versión.";
  }),
);

// Modelo didáctico del alcance: la distancia a la esquina inferior cambia de mano.
const thumbButtons = [...document.querySelectorAll("[data-thumb-row]")];
let thumbHand = "right";
let selectedThumb = null;
const reachNames = { easy: "Cómoda", middle: "Intermedia", far: "Lejana" };
function refreshThumb() {
  thumbButtons.forEach((button) => {
    const row = Number(button.dataset.thumbRow);
    const col = Number(button.dataset.thumbCol);
    const distance = 2 - row + (thumbHand === "right" ? 2 - col : col);
    const reach = distance <= 1 ? "easy" : distance <= 2 ? "middle" : "far";
    button.dataset.reach = reach;
    button.querySelector(".reach-label").textContent = reachNames[reach];
    button.setAttribute(
      "aria-label",
      `${button.dataset.position}: zona ${reachNames[reach].toLowerCase()} en el modelo para mano ${thumbHand === "right" ? "derecha" : "izquierda"}`,
    );
    button.setAttribute("aria-pressed", String(button === selectedThumb));
  });
  if (selectedThumb) {
    document.getElementById("thumb-result").textContent =
      `${selectedThumb.dataset.position}: zona ${reachNames[selectedThumb.dataset.reach].toLowerCase()} para mano ${thumbHand === "right" ? "derecha" : "izquierda"} en este modelo. El alcance real depende del agarre y del dispositivo.`;
  }
}
thumbButtons.forEach((button) =>
  button.addEventListener("click", () => {
    selectedThumb = button;
    refreshThumb();
  }),
);
document.querySelectorAll("[data-hand]").forEach((button) =>
  button.addEventListener("click", () => {
    thumbHand = button.dataset.hand;
    document
      .querySelectorAll("[data-hand]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    refreshThumb();
    if (!selectedThumb)
      document.getElementById("thumb-result").textContent =
        `Modelo de mano ${thumbHand === "right" ? "derecha" : "izquierda"} seleccionado. Toca una zona para explorar su alcance.`;
  }),
);
if (thumbButtons.length) refreshThumb();

// Contraste WCAG: conversión sRGB a luminancia relativa, sin redondear al evaluar.
const contrastColors = { foreground: "#EEF3FF", background: "#111C30" };
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map(
    (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function renderContrast() {
  const foreground = relativeLuminance(contrastColors.foreground);
  const background = relativeLuminance(contrastColors.background);
  const ratio =
    (Math.max(foreground, background) + 0.05) /
    (Math.min(foreground, background) + 0.05);
  const preview = document.getElementById("contrast-preview");
  preview.style.color = contrastColors.foreground;
  preview.style.backgroundColor = contrastColors.background;
  // El valor mostrado es conservador: nunca redondea hacia un aprobado aparente.
  document.getElementById("contrast-ratio").textContent =
    `${(Math.floor(ratio * 100 + 1e-9) / 100).toFixed(2).replace(".", ",")}:1`;
  for (const [id, threshold, label] of [
    ["contrast-normal", 4.5, "texto normal"],
    ["contrast-large", 3, "texto grande"],
  ]) {
    const pass = ratio >= threshold;
    const result = document.getElementById(id);
    result.dataset.pass = String(pass);
    result.textContent = `${pass ? "Cumple" : "No cumple"} AA para ${label} (mínimo ${String(threshold).replace(".", ",")}:1).`;
  }
}
function showColorError() {
  const invalid = document.querySelector(
    '.color-pair input[aria-invalid="true"]',
  );
  document.getElementById("contrast-error").textContent = invalid
    ? "Escribe un color completo con formato #RRGGBB. Se conserva el último color válido en la vista previa."
    : "";
}
for (const side of ["foreground", "background"]) {
  const picker = document.getElementById(`contrast-${side}`);
  const text = document.getElementById(`contrast-${side}-hex`);
  picker?.addEventListener("input", () => {
    contrastColors[side] = picker.value.toUpperCase();
    text.value = contrastColors[side];
    text.setAttribute("aria-invalid", "false");
    showColorError();
    renderContrast();
  });
  text?.addEventListener("input", () => {
    const valid = /^#[0-9a-f]{6}$/i.test(text.value);
    text.setAttribute("aria-invalid", String(!valid));
    if (valid) {
      contrastColors[side] = text.value.toUpperCase();
      picker.value = text.value;
      renderContrast();
    }
    showColorError();
  });
}
document.querySelectorAll("[data-contrast-preset]").forEach((button) =>
  button.addEventListener("click", () => {
    const colors =
      button.dataset.contrastPreset === "pass"
        ? ["#EEF3FF", "#111C30"]
        : ["#999999", "#FFFFFF"];
    ["foreground", "background"].forEach((side, i) => {
      contrastColors[side] = colors[i];
      document.getElementById(`contrast-${side}`).value = colors[i];
      const input = document.getElementById(`contrast-${side}-hex`);
      input.value = colors[i];
      input.setAttribute("aria-invalid", "false");
    });
    showColorError();
    renderContrast();
  }),
);
if (document.getElementById("contrast-preview")) renderContrast();

// Ampliación local: el contenedor no impone una altura ni recorta el texto.
function updateTextScale(value) {
  const percent = Number(value);
  const slider = document.getElementById("text-scale");
  slider.value = String(percent);
  slider.setAttribute("aria-valuetext", `${percent} por ciento`);
  document.getElementById("text-scale-value").textContent = `${percent} %`;
  document
    .getElementById("scalable-preview")
    .style.setProperty("--text-scale", String(percent / 100));
  document.getElementById("text-scale-feedback").textContent = "";
}
document
  .getElementById("text-scale")
  ?.addEventListener("input", (event) => updateTextScale(event.target.value));
document
  .getElementById("text-scale-reset")
  ?.addEventListener("click", () => updateTextScale(100));
document.getElementById("readable-confirm")?.addEventListener("click", () => {
  document.getElementById("text-scale-feedback").textContent =
    `Lectura confirmada con el texto al ${document.getElementById("text-scale").value} %. El control sigue disponible.`;
});

// La confirmación visual siempre funciona; la vibración es opcional y no verificable.
document.getElementById("haptic-test")?.addEventListener("click", () => {
  document.getElementById("haptic-preview").dataset.result = "confirmed";
  document.getElementById("haptic-symbol").textContent = "✓";
  document.getElementById("haptic-label").textContent =
    "Acción confirmada en la demo";
  const feedback = document.getElementById("haptic-feedback");
  if (!document.getElementById("haptic-enabled").checked) {
    feedback.textContent =
      "Confirmación visual mostrada. La vibración está desactivada en esta prueba.";
  } else if (typeof navigator.vibrate !== "function") {
    feedback.textContent =
      "Confirmación visual mostrada. Este navegador no ofrece la API de vibración.";
  } else {
    try {
      const accepted = navigator.vibrate(40);
      feedback.textContent = accepted
        ? "Confirmación visual mostrada. Se solicitó una vibración breve; su percepción depende del equipo y sus preferencias."
        : "Confirmación visual mostrada. El navegador rechazó la solicitud de vibración.";
    } catch {
      feedback.textContent =
        "Confirmación visual mostrada. No se pudo solicitar la vibración en este entorno.";
    }
  }
});
document.getElementById("haptic-reset")?.addEventListener("click", () => {
  document.getElementById("haptic-enabled").checked = false;
  document.getElementById("haptic-preview").removeAttribute("data-result");
  document.getElementById("haptic-symbol").textContent = "○";
  document.getElementById("haptic-label").textContent = "Esperando tu acción";
  document.getElementById("haptic-feedback").textContent =
    "Prueba restablecida. La señal visual funciona aunque el dispositivo no tenga vibración.";
});
