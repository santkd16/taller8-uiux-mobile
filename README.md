# Calibrar — Taller 8 de UI/UX móvil

Presentación y laboratorio de la Actividad Evaluable 08 de Mobile Cloud Computing, por David Santiago Piedrahita Cabezas, Ingeniería de Sistemas.

## Uso

Abre `index.html` en el navegador o ejecuta `python3 -m http.server 8000` desde esta carpeta. No requiere instalación ni compilación. GitHub Pages publica la rama `main` desde su raíz.

- `index.html`: nueve diapositivas para una exposición de 15–20 minutos y preguntas. Botones, selector de tema, flechas de teclado, AvPág/RePág, Inicio/Fin y deslizamiento táctil. El modo exposición permite pantalla completa; Esc permite salir.
- `ejemplos.html`: conserva los nueve grupos de pruebas sobre plataformas, ergonomía, estados, accesibilidad, adaptación, validación, sincronización, áreas táctiles y aplicación en la industria.
- `documentos/`: guía original e informe editable con el desarrollo y las referencias IEEE; se conservan sin modificar.
- `styles.css` y `script.js`: sistema visual y comportamiento compartidos, sin bibliotecas externas. Google Fonts es el único recurso externo; hay fuentes de reserva.

## Identidad e interacción

La metáfora de un banco de calibración organiza la experiencia. Un teléfono interactivo muestra cambios de plataforma y confirmación; cinco SVG propios explican los ejes técnicos. Barlow Condensed se usa en titulares y Atkinson Hyperlegible en lectura y controles.

La apariencia comienza en Azul tinta. El selector permite elegir otros dos temas oscuros (Grafito y Ciruela) o el claro opcional; la elección se mantiene al pasar entre páginas. El movimiento respeta `prefers-reduced-motion` y puede reducirse manualmente. Las preferencias se conservan localmente si el navegador permite almacenamiento. La única animación inicial revela el teléfono; el resto de transiciones responde a acciones.

Los ejemplos son prototipos educativos. No envían datos ni implementan sincronización offline real. La lista de criterios activados no certifica accesibilidad. TalkBack, VoiceOver y la lectura a distancia requieren validación con dispositivos y personas reales.

## Verificación del rediseño

Se comprobaron las nueve diapositivas y las pruebas interactivas con Chromium/Playwright, anchos de 360, 390, 768 y 1440 px, modos claro y oscuro, teclado y modo exposición a 1366 × 768. Se revisaron contraste de la paleta, dimensiones de controles, enlaces locales y sintaxis de JavaScript.

## Pruebas completas de la edición oscura

La cita permite revisar, cancelar y confirmar mediante un diálogo nativo. El teléfono del laboratorio tiene destinos navegables; compartir usa el sistema, el portapapeles o un enlace seleccionable como alternativa. La información de la cita se abre en un diálogo con retorno del foco. El conflicto de sincronización puede resolverse en la simulación.

Se probaron 40 combinaciones de página, tema y ancho, sin desbordamiento horizontal y con controles de al menos 48 px. También se comprobaron la persistencia de apariencia, el contraste de la paleta y de los botones seleccionados, los estados de formulario, los enlaces de descarga, los diálogos, el modo exposición y las preferencias de movimiento. Las comprobaciones se realizaron con Chromium; no sustituyen pruebas manuales con TalkBack o VoiceOver.
