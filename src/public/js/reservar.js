document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const salonId = params.get("salon");
  const token = localStorage.getItem("token");

  const seleccionarSalonSection = document.getElementById("seleccionar-salon");
  const formularioReservaSection =
    document.getElementById("formulario-reserva");
  const selectSalon = document.getElementById("select-salon");
  const btnContinuar = document.getElementById("btn-continuar");
  const listaSalonesReserva = document.getElementById("lista-salones-reserva");
  const mensaje = document.getElementById("mensaje");
  const infoSalon = document.getElementById("info-salon");
  const turnoSelect = document.getElementById("turno");
  const serviciosContainer = document.getElementById("servicios-container");
  const resumenReserva = document.getElementById("resumen-reserva");
  const inputTematica = document.getElementById("tematica");
  const btnConfirmar = document.getElementById("btn-confirmar");

  let salon = null;
  let turnos = [];
  let servicios = [];
  let todosLosSalones = [];

  function manejarErrorToken(error) {
    console.error("Error de autenticación:", error);

    if (
      error.message.includes("expired") ||
      error.message.includes("TokenExpiredError") ||
      error.message.includes("401")
    ) {
      alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("rol");
      window.location.href = "/loginUsuario.html";
      return true;
    }
    return false;
  }

  if (!token) {
    window.location.href = "/loginUsuario.html?salon=" + salonId;
    return;
  }

  // Función para hacer peticiones autenticadas
  function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async function cargarSalonesDropdown() {
    try {
      console.log("Intentando cargar salones...");

      const response = await fetch("/api/salones", {
        headers: getAuthHeaders()
      });

      console.log("Status de respuesta:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado - manejar redirección
          console.log("Token expirado, redirigiendo al login");
          manejarErrorToken(new Error("Token expirado"));
          return;
        }
        throw new Error(
          `Error ${response.status}: No se pudieron cargar los salones`
        );
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);

      todosLosSalones = data.data || data;

      // Llenar el dropdown
      selectSalon.innerHTML =
        '<option value="">-- Selecciona un salón --</option>';

      if (todosLosSalones.length === 0) {
        selectSalon.innerHTML =
          '<option value="">No hay salones disponibles</option>';
        return;
      }

      todosLosSalones.forEach((salon) => {
        const option = document.createElement("option");
        option.value = salon.salon_id;
        option.textContent = `${salon.titulo} - $${salon.importe} (Capacidad: ${salon.capacidad} personas)`;
        selectSalon.appendChild(option);
      });

      console.log(
        "Dropdown llenado exitosamente con",
        todosLosSalones.length,
        "salones"
      );
    } catch (error) {
      console.error("Error completo cargando salones:", error);

      if (!manejarErrorToken(error)) {
        selectSalon.innerHTML =
          '<option value="">Error al cargar los salones. Intenta recargar la página.</option>';
      }
    }
  }

  // Cargar información específica del salón
  async function cargarInformacionSalon(id) {
    try {
      const respSalon = await fetch(`/api/salones/${id}`, {
        headers: getAuthHeaders()
      });

      if (!respSalon.ok) {
        if (respSalon.status === 401) {
          throw new Error("Token expirado o inválido");
        }
        throw new Error("No se pudo obtener el salón");
      }

      const dataSalon = await respSalon.json();
      salon = dataSalon.data || dataSalon;

      // Mostrar información del salón
      infoSalon.innerHTML = `
                <div class="salon-info">
                    <h3>${salon.titulo}</h3>
                    <p><strong>Dirección:</strong> ${salon.direccion}</p>
                    <p><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
                    <p><strong>Precio base:</strong> $${salon.importe}</p>
                </div>
            `;

      // Cambiar a la vista de formulario
      seleccionarSalonSection.style.display = "none";
      formularioReservaSection.style.display = "block";

      // Cargar datos necesarios para el formulario
      await cargarTurnos();
      await cargarServicios();
    } catch (error) {
      console.error("Error cargando información del salón:", error);
      if (!manejarErrorToken(error)) {
        infoSalon.innerHTML =
          "<p>No se pudo cargar la información del salón.</p>";
        seleccionarSalonSection.style.display = "none";
        formularioReservaSection.style.display = "block";
      }
    }
  }

  // Cargar turnos
  async function cargarTurnos() {
    try {
      const respTurnos = await fetch("/api/turnos", {
        headers: getAuthHeaders()
      });
      
      if (!respTurnos.ok) {
        if (respTurnos.status === 401) {
          throw new Error("Token expirado o inválido");
        }
        throw new Error("No se pudieron cargar los turnos");
      }
      
      const data = await respTurnos.json();
      turnos = data.data || data;

      turnoSelect.innerHTML = '<option value="">Selecciona un turno</option>';
      turnos.forEach((turno) => {
        const option = document.createElement("option");
        option.value = turno.turno_id;
        option.textContent = `${turno.hora_desde} - ${turno.hora_hasta}`;
        turnoSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error cargando turnos:", error);
      if (!manejarErrorToken(error)) {
        turnoSelect.innerHTML =
          '<option value="">No se pudieron cargar los turnos</option>';
      }
    }
  }

  // Cargar servicios
  async function cargarServicios() {
    try {
      const respServicios = await fetch("/api/servicios", {
        headers: getAuthHeaders()
      });
      
      if (!respServicios.ok) {
        if (respServicios.status === 401) {
          throw new Error("Token expirado o inválido");
        }
        throw new Error("No se pudieron cargar los servicios");
      }
      
      const data = await respServicios.json();
      servicios = data.data || data;

      serviciosContainer.innerHTML = "";
      servicios.forEach((servicio) => {
        const div = document.createElement("div");
        div.className = "servicio-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `servicio-${servicio.servicio_id}`;
        checkbox.value = servicio.servicio_id;
        checkbox.className = "checkbox-servicio";

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = `${servicio.descripcion} - $${servicio.importe}`;

        div.appendChild(checkbox);
        div.appendChild(label);
        serviciosContainer.appendChild(div);
      });
    } catch (error) {
      console.error("Error cargando servicios:", error);
      if (!manejarErrorToken(error)) {
        serviciosContainer.innerHTML =
          "<p>No se pudieron cargar los servicios adicionales.</p>";
      }
    }
  }

  // Determinar qué vista mostrar
  if (salonId) {
    // Hay salonId en la URL - cargar información específica
    seleccionarSalonSection.style.display = "none";
    formularioReservaSection.style.display = "block";
    await cargarInformacionSalon(salonId);
  } else {
    // No hay salonId - mostrar selector de salones
    seleccionarSalonSection.style.display = "block";
    formularioReservaSection.style.display = "none";
    await cargarSalonesDropdown();
  }

  // Event listener para el dropdown de salones
  selectSalon.addEventListener("change", function () {
    const selectedSalonId = this.value;
    btnContinuar.disabled = !selectedSalonId;
  });

  // Event listener para el botón continuar
  btnContinuar.addEventListener("click", function () {
    const selectedSalonId = selectSalon.value;
    if (selectedSalonId) {
      // Actualizar URL sin recargar la página
      const newUrl = `${window.location.pathname}?salon=${selectedSalonId}`;
      window.history.pushState({}, "", newUrl);
      cargarInformacionSalon(selectedSalonId);
    }
  });

  // Actualizar resumen
  function actualizarResumen() {
    if (!salon) return;
    const fecha = document.getElementById("fecha").value;
    const turnoId = turnoSelect.value;
    const turnoSeleccionado = turnos.find((t) => t.turno_id == turnoId);
    const serviciosSeleccionados = servicios.filter((s) => {
      const checkbox = document.getElementById(`servicio-${s.servicio_id}`);
      return checkbox ? checkbox.checked : false;
    });
    const tematica = inputTematica.value.trim();

    if (!turnoSeleccionado) {
      resumenReserva.innerHTML =
        "<p>Selecciona fecha, turno y servicios para ver el resumen.</p>";
      return;
    }

    let total = Number(salon.importe);
    let serviciosHtml = "";
    serviciosSeleccionados.forEach((s) => {
      total += Number(s.importe);
      serviciosHtml += `<li>${s.descripcion} - $${Number(s.importe).toFixed(
        2
      )}</li>`;
    });

    resumenReserva.innerHTML = `
            <div class="resumen-detalle">
                <p><strong>Salón:</strong> ${salon.titulo} - $${Number(
      salon.importe
    ).toFixed(2)}</p>
                <p><strong>Fecha:</strong> ${fecha || "No seleccionada"}</p>
                <p><strong>Turno:</strong> ${turnoSeleccionado.hora_desde} - ${
      turnoSeleccionado.hora_hasta
    }</p>
                <p><strong>Temática:</strong> ${tematica || "Sin definir"}</p>
                <p><strong>Servicios adicionales:</strong></p>
                <ul>${serviciosHtml || "<li>Ninguno seleccionado</li>"}</ul>
                <p class="total"><strong>Total:</strong> $${total.toFixed(
                  2
                )}</p>
            </div>
        `;
  }

  // Event listeners
  turnoSelect.addEventListener("change", actualizarResumen);
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("checkbox-servicio")) actualizarResumen();
  });
  document
    .getElementById("fecha")
    .addEventListener("change", actualizarResumen);
  inputTematica.addEventListener("input", actualizarResumen);

// Confirmar reserva
btnConfirmar.addEventListener("click", async () => {
  if (!salon) {
    mensaje.textContent = "Por favor selecciona un salón primero.";
    mensaje.style.color = "red";
    return;
  }

  const fecha = document.getElementById("fecha").value;
  const turnoId = turnoSelect.value;
  const tematica = inputTematica.value.trim();
  const serviciosSeleccionados = servicios.filter((s) => {
    const checkbox = document.getElementById(`servicio-${s.servicio_id}`);
    return checkbox ? checkbox.checked : false;
  }).map((s) => s.servicio_id);

  if (!fecha || !turnoId) {
    mensaje.textContent = "Por favor selecciona fecha y turno.";
    mensaje.style.color = "red";
    return;
  }

  const fechaSeleccionada = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaSeleccionada < hoy) {
    mensaje.textContent = "No puedes reservar para una fecha pasada.";
    mensaje.style.color = "red";
    return;
  }

  try {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Procesando...";
    mensaje.textContent = "";
    mensaje.style.color = "";

    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error("No se encontró información del usuario. Por favor, inicia sesión nuevamente.");
    }
    
    const user = JSON.parse(userData);
    const usuario_id = user.usuario_id;

    console.log("Enviando datos de reserva:", {
      usuario_id: usuario_id, 
      salon_id: salon.salon_id,
      fecha_reserva: fecha,
      turno_id: turnoId,
      tematica: tematica,
      servicios: serviciosSeleccionados
    });

    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        usuario_id: parseInt(usuario_id), 
        salon_id: parseInt(salon.salon_id),
        turno_id: parseInt(turnoId),
        fecha_reserva: fecha,
        tematica: tematica || null,
        servicios: serviciosSeleccionados
      }),
    });

    console.log("Respuesta del servidor:", res.status);

    if (!res.ok) {
      let errorMessage = "Error al realizar la reserva.";
      
      try {
        const errorData = await res.json();
        console.error("Error data:", errorData);
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Error parseando respuesta de error:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const result = await res.json();
    console.log("Reserva creada exitosamente:", result);

    mensaje.textContent = "¡Reserva confirmada con éxito!";
    mensaje.style.color = "green";

    setTimeout(() => {
      window.location.href = "/paginaPrincipal.html";
    }, 2000);

  } catch (err) {
    console.error("Error completo confirmando reserva:", err);
    
    if (err.message.includes("Token expirado") || err.message.includes("401")) {
      if (manejarErrorToken(err)) {
        return;
      }
    }
    
    mensaje.textContent = err.message || "Error de conexión al servidor.";
    mensaje.style.color = "red";
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "Confirmar reserva";
  }
});

  // Logout
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/paginaPrincipal.html";
  });
});
