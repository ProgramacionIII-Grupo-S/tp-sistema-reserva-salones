const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Tomamos los valores del formulario
  const nombre_usuario = document.getElementById("email").value.trim();
  const contrasenia = document.getElementById("password").value.trim();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, contrasenia })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || "Error al iniciar sesión";
      errorMsg.style.display = "block";
      return;
    }

    // Guardamos el token en localStorage
    localStorage.setItem("token", data.token);

    // Redirigimos al dashboard
    window.location.href = "/dashboard.html";
  } catch (error) {
    console.error("Error en login:", error);
    errorMsg.textContent = "Error de conexión";
    errorMsg.style.display = "block";
  }
});
