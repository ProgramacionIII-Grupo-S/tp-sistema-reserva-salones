document.getElementById("formRegisterUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    nombre_usuario: document.getElementById("usuario").value,
    contrasenia: document.getElementById("contrasenia").value,
    celular: document.getElementById("celular").value
  };

  const errorContainer = document.getElementById("errores");
  errorContainer.innerHTML = "";

  try {
    const response = await fetch("http://localhost:3000/api/auth/register/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message) {
        const p = document.createElement("p");
        p.textContent = result.message;
        errorContainer.appendChild(p);
      }

      if (result.details && Array.isArray(result.details)) {
        result.details.forEach(err => {
          const p = document.createElement("p");
          p.textContent = `${err.msg}`;
          errorContainer.appendChild(p);
        });
      }

      return;
    }

    alert("Usuario registrado correctamente");
    window.location.href = "/loginUsuario.html";

  } catch (error) {
    console.error("Error:", error);
    const p = document.createElement("p");
    p.textContent = "Error de conexión con el servidor.";
    errorContainer.appendChild(p);
  }
});