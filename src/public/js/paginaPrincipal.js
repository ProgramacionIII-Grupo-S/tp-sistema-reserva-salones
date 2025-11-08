document.addEventListener("DOMContentLoaded", async () => {
  await cargarSalones();
  actualizarNavbar();
});

function actualizarNavbar() {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const userData = localStorage.getItem("user");
  
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const misReservasLink = document.getElementById("reservas-link");
  const logoutLink = document.getElementById("logout-link");
  const userWelcome = document.getElementById("user-welcome");
  const perfilLink = document.getElementById("perfil-link");

  if (token && userType) {
    if (parseInt(userType) !== 3) {
      alert("Esta plataforma es exclusiva para clientes.");
      cerrarSesion();
      return;
    }

    loginLink.style.display = "none";
    registerLink.style.display = "none";
    misReservasLink.style.display = "inline";
    logoutLink.style.display = "inline";
    userWelcome.style.display = "inline";
    perfilLink.style.display = "inline";
    
    if (userData) {
      const user = JSON.parse(userData);
      userWelcome.textContent = `Hola, ${user.nombre}`;
    }
    
    logoutLink.onclick = (e) => {
      e.preventDefault();
      cerrarSesion();
    };
  } else {
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    misReservasLink.style.display = "none";
    logoutLink.style.display = "none";
    userWelcome.style.display = "none";
    perfilLink.style.display = "none";
  }
}

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("user");
  localStorage.removeItem("userType");
  localStorage.removeItem("salon_pendiente");
  window.location.href = "/paginaPrincipal.html";
}

async function cargarSalones() {
  const contenedor = document.getElementById("lista-salones");
  const token = localStorage.getItem("token");

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const respuesta = await fetch("/api/salones", {
      method: "GET",
      headers: headers
    });

    console.log("Respuesta del servidor:", respuesta.status);

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        if (token) {
          console.warn("Token inválido o expirado");
          alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          cerrarSesion();
        } else {
          console.log("Usuario no autenticado, redirigiendo al login");
          mostrarMensajeNoAutenticado(contenedor);
        }
        return;
      }
      throw new Error(`Error ${respuesta.status} al obtener los salones`);
    }

    const salonesJSON = await respuesta.json();
    
    if (!salonesJSON.ok || !salonesJSON.data || salonesJSON.data.length === 0) {
      contenedor.innerHTML = "<p>No hay salones disponibles en este momento 👻</p>";
      return;
    }

    mostrarSalones(salonesJSON.data, contenedor);

  } catch (error) {
    console.error("Error fetch:", error);
    contenedor.innerHTML = `
      <div class="error-message">
        <p>Ocurrió un error al cargar los salones</p>
        <button onclick="cargarSalones()" class="btn-reintentar">Reintentar</button>
      </div>
    `;
  }
}

function mostrarMensajeNoAutenticado(contenedor) {
  contenedor.innerHTML = `
    <div class="auth-required-message">
      <h3>🔐 Acceso Requerido</h3>
      <p>Para ver los salones disponibles necesitas iniciar sesión</p>
      <div class="auth-buttons">
        <a href="/loginUsuario.html" class="btn-login">Iniciar Sesión</a>
        <a href="/registerUsuario.html" class="btn-register">Registrarse</a>
      </div>
    </div>
  `;
}

function mostrarSalones(salones, contenedor) {
  contenedor.innerHTML = ""; 

  salones.forEach((salon) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${salon.titulo}</h3>
      <p><strong>Dirección:</strong> ${salon.direccion}</p>
      <p><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
      <p><strong>Precio:</strong> $${salon.importe}</p>
      <button class="btn-alquilar" data-id="${salon.salon_id}">Alquilar</button>
    `;

    contenedor.appendChild(card);
  });

  contenedor.addEventListener("click", manejarClicAlquilar);
}

function manejarClicAlquilar(e) {
  if (e.target.classList.contains("btn-alquilar")) {
    const idSalon = e.target.dataset.id;
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token) {
      localStorage.setItem("salon_pendiente", idSalon);
      window.location.href = "/loginUsuario.html";
    } else if (parseInt(userType) !== 3) {
      alert("Solo los clientes pueden reservar salones.");
      cerrarSesion();
    } else {
      window.location.href = `/reservar.html?salon=${idSalon}`;
    }
  }
}

function verificarAutenticacion() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("Usuario no autenticado");
  } else {
    console.log("Usuario autenticado, token:", token.substring(0, 20) + "...");
  }
}

verificarAutenticacion();