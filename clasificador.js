// Modelo de Teachable Machine
const URL_MODELO = "https://teachablemachine.withgoogle.com/models/U0nyd9OLS/";

let modelo = null;
let webcam = null;
let corriendo = false;

const $ = (id) => document.getElementById(id);
const btnCamara = $("btnCamara");
const archivo = $("archivo");
const foto = $("foto");
const contCamara = $("camara");
const resultado = $("resultado");
const barras = $("barras");

async function cargarModelo() {
  if (modelo) return modelo;
  if (typeof tmImage === "undefined") {
    throw new Error("Las librerías de IA no se cargaron. Conéctate a internet una vez para guardarlas.");
  }
  resultado.textContent = "Cargando modelo…";
  modelo = await tmImage.load(URL_MODELO + "model.json", URL_MODELO + "metadata.json");
  return modelo;
}

// "selene" -> "Selene", "no selene" -> "No Selene"
const bonito = (t) => t.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

function mostrar(predicciones) {
  const ordenadas = [...predicciones].sort((a, b) => b.probability - a.probability);
  const top = ordenadas[0];
  resultado.textContent = `${bonito(top.className)} — ${(top.probability * 100).toFixed(1)}%`;

  barras.replaceChildren(...ordenadas.map((p) => {
    const pct = (p.probability * 100).toFixed(1);
    const fila = document.createElement("div");
    fila.className = "fila-barra";

    const nombre = document.createElement("div");
    nombre.className = "nombre";
    const n = document.createElement("span");
    n.textContent = bonito(p.className);
    const v = document.createElement("span");
    v.textContent = pct + "%";
    nombre.append(n, v);

    const pista = document.createElement("div");
    pista.className = "pista";
    const relleno = document.createElement("div");
    relleno.className = "relleno";
    relleno.style.width = pct + "%";
    pista.append(relleno);

    fila.append(nombre, pista);
    return fila;
  }));
}

function mostrarError(err) {
  console.error(err);
  resultado.textContent = err.message || "Ocurrió un error.";
}

// ---------- Cámara ----------
async function bucle() {
  if (!corriendo) return;
  webcam.update();
  mostrar(await modelo.predict(webcam.canvas));
  requestAnimationFrame(bucle);
}

async function iniciarCamara() {
  try {
    await cargarModelo();
    resultado.textContent = "Activando cámara…";
    webcam = new tmImage.Webcam(320, 320, true);
    await webcam.setup();
    await webcam.play();
    foto.hidden = true;
    contCamara.replaceChildren(webcam.canvas);
    corriendo = true;
    btnCamara.textContent = "Detener cámara";
    requestAnimationFrame(bucle);
  } catch (err) {
    corriendo = false;
    mostrarError(err.name === "NotAllowedError"
      ? new Error("Permiso de cámara denegado. Actívalo en tu navegador o sube una foto.")
      : err);
  }
}

function detenerCamara() {
  corriendo = false;
  if (webcam) { webcam.stop(); webcam = null; }
  contCamara.replaceChildren();
  btnCamara.textContent = "Iniciar cámara";
}

btnCamara.addEventListener("click", () => (corriendo ? detenerCamara() : iniciarCamara()));

// ---------- Foto de galería ----------
archivo.addEventListener("change", async () => {
  const f = archivo.files[0];
  if (!f) return;
  try {
    detenerCamara();
    await cargarModelo();
    if (foto.src.startsWith("blob:")) URL.revokeObjectURL(foto.src);
    foto.src = URL.createObjectURL(f);
    foto.hidden = false;
    await foto.decode();
    mostrar(await modelo.predict(foto));
  } catch (err) {
    mostrarError(err);
  }
});
