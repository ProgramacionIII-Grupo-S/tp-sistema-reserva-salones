const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

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

    localStorage.setItem("token", data.token);

    const token = data.token;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    console.log("Usuario autenticado:", decoded);

    const userType = decoded.tipo_usuario;
    
    if (userType === 3) { 
      errorMsg.textContent = "Este acceso es solo para administradores y empleados. Los clientes deben usar el acceso de clientes.";
      errorMsg.style.display = "block";
      localStorage.removeItem('token'); 
      return;
    }

    const userData = {
      usuario_id: decoded.usuario_id,
      tipo_usuario: decoded.tipo_usuario,
      nombre: `Usuario ${decoded.usuario_id}`,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    if (userType === 1) {
      window.location.href = "/admin-main.html";
    } else if (userType === 2) { 
      window.location.href = "/empleado-dashboard.html";
    } else {
      errorMsg.textContent = "Tipo de usuario no válido para este acceso";
      errorMsg.style.display = "block";
    }

  } catch (error) {
    console.error("Error en login:", error);
    errorMsg.textContent = "Error de conexión con el servidor";
    errorMsg.style.display = "block";
  }
});
