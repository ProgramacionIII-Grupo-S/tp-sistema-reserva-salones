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

  async function cargarSalonesDropdown() {
    try {
      console.log("Intentando cargar salones...");

      const response = await fetch("/api/salones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // El resto del código para cargar turnos, servicios, etc. se mantiene igual
  // Cargar turnos
  try {
    const respTurnos = await fetch("/api/turnos");
    if (!respTurnos.ok) throw new Error("No se pudieron cargar los turnos");
    turnos = await respTurnos.json();

    turnoSelect.innerHTML = '<option value="">Selecciona un turno</option>';
    turnos.forEach((turno) => {
      const option = document.createElement("option");
      option.value = turno.turno_id;
      option.textContent = `${turno.hora_desde} - ${turno.hora_hasta}`;
      turnoSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando turnos:", error);
    turnoSelect.innerHTML =
      '<option value="">No se pudieron cargar los turnos</option>';
  }

  // Cargar servicios
  try {
    const respServicios = await fetch("/api/servicios");
    if (!respServicios.ok)
      throw new Error("No se pudieron cargar los servicios");
    servicios = await respServicios.json();

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
    serviciosContainer.innerHTML =
      "<p>No se pudieron cargar los servicios adicionales.</p>";
  }

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
    });

    if (!fecha || !turnoId) {
      mensaje.textContent = "Por favor selecciona fecha y turno.";
      mensaje.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salon_id: salon.salon_id,
          fecha_reserva: fecha,
          turno_id: turnoId,
          tematica: tematica,
          servicios: serviciosSeleccionados.map((s) => s.servicio_id),
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Token expirado o inválido");
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al realizar la reserva.");
      }

      const result = await res.json();
      mensaje.textContent = "¡Reserva confirmada con éxito!";
      mensaje.style.color = "green";

      setTimeout(() => {
        window.location.href = "/mis-reservas.html";
      }, 2000);
    } catch (err) {
      console.error("Error confirmando reserva:", err);
      if (manejarErrorToken(err)) {
        return;
      }
      mensaje.textContent = err.message || "Error de conexión al servidor.";
      mensaje.style.color = "red";
    }
  });

  // Logout
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/paginaPrincipal.html";
  });
});
