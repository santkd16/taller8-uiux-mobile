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
