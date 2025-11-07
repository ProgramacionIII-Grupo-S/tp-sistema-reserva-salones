document.getElementById("btn-login").addEventListener("click", async () => {
  const nombre_usuario = document.getElementById("usuario").value.trim();
  const contrasenia = document.getElementById("contrasenia").value.trim();

  if (!nombre_usuario || !contrasenia) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, contrasenia })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Error al iniciar sesión");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.user.tipo_usuario_nombre.toLowerCase());

    alert(`Bienvenido, ${data.user.nombre} ${data.user.apellido}!`);

    if (data.user.tipo_usuario_nombre === "Cliente") {
      window.location.href = "/paginaPrincipal.html";
    } else {
      window.location.href = "/adminPanel.html";
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor. Asegúrate de que esté corriendo en el puerto correcto.");
  }
});
