// ---------- Service Worker (PWA) ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("PWA activada correctamente 🤖"))
      .catch(err => console.warn("Error al activar la PWA:", err));
  });
}

// ---------- Formulario de contacto (Formspree) ----------
const form = document.getElementById("formContacto");
if (form) {
  const estado = document.getElementById("estadoForm");
  const boton = document.getElementById("btnEnviar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    estado.className = "estado";

    if (form.elements["_honey"].value) return;          // spam: ignorar
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const datos = new FormData(form);
    datos.delete("_honey");

    boton.disabled = true;
    estado.textContent = "Enviando…";
    try {
      const r = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: datos
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      estado.textContent = "¡Mensaje enviado! Gracias por escribirnos.";
      form.reset();
    } catch (err) {
      estado.className = "estado error";
      estado.textContent = navigator.onLine
        ? "No se pudo enviar el mensaje. Inténtalo de nuevo."
        : "Sin conexión: conéctate a internet para enviar tu mensaje.";
    } finally {
      boton.disabled = false;
    }
  });
}

// ---------- Menú desplegable "Mi modelo" ----------
document.querySelectorAll(".menu-grupo").forEach((grupo) => {
  const btn = grupo.querySelector(".menu-btn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const abierto = grupo.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", abierto);
  });
});
document.addEventListener("click", () => {
  document.querySelectorAll(".menu-grupo.abierto").forEach((g) => {
    g.classList.remove("abierto");
    g.querySelector(".menu-btn").setAttribute("aria-expanded", "false");
  });
});
