document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const salonId = params.get("salon");
  const token = localStorage.getItem("token");
  const mensaje = document.getElementById("mensaje");
  const infoSalon = document.getElementById("info-salon");
  const turnoSelect = document.getElementById("turno");
  const serviciosContainer = document.getElementById("servicios-container");
  const resumenReserva = document.getElementById("resumen-reserva"); 

  let salon = null;
  let turnos = [];
  let servicios = [];

  if (!token) {
    window.location.href = "/loginUsuario.html?salon=" + salonId;
    return;
  }

  try {
    const respSalon = await fetch(`/api/salones/${salonId}`);
    if (!respSalon.ok) throw new Error("No se pudo obtener el salón");

    const dataSalon = await respSalon.json();
    salon = dataSalon.salon;

    infoSalon.innerHTML = `
      <h3>${salon.titulo}</h3>
      <p><strong>Dirección:</strong> ${salon.direccion}</p>
      <p><strong>Capacidad:</strong> ${salon.capacidad}</p>
      <p><strong>Precio:</strong> $${salon.importe}</p>
    `;
  } catch (error) {
    infoSalon.innerHTML = "<p> No se pudo cargar la información del salón.</p>";
  }

  try {
    const respTurnos = await fetch("/api/turnos");
    if (!respTurnos.ok) throw new Error("No se pudieron cargar los turnos");
    turnos = await respTurnos.json();

    turnoSelect.innerHTML = '<option value="">Selecciona un turno</option>';
    turnos.forEach(turno => {
      const option = document.createElement("option");
      option.value = turno.turno_id;
      option.textContent = `${turno.hora_desde} - ${turno.hora_hasta}`;
      turnoSelect.appendChild(option);
    });
  } catch (error) {
    turnoSelect.innerHTML = '<option value="">No se pudieron cargar los turnos</option>';
  }

  try {
    const respServicios = await fetch("/api/servicios");
    if (!respServicios.ok) throw new Error("No se pudieron cargar los servicios");
    servicios = await respServicios.json();

    serviciosContainer.innerHTML = "";
    servicios.forEach(servicio => {
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
    serviciosContainer.innerHTML = "<p>No se pudieron cargar los servicios adicionales.</p>";
  }

 function actualizarResumen() {
  if (!salon) return;
  const turnoId = turnoSelect.value;
  const turnoSeleccionado = turnos.find(t => t.turno_id == turnoId);
  const serviciosSeleccionados = servicios.filter(s => document.getElementById(`servicio-${s.servicio_id}`).checked);

  if (!turnoSeleccionado) {
    resumenReserva.innerHTML = "<p>Selecciona fecha, turno y servicios para ver el resumen.</p>";
    return;
  }

  let total = Number(salon.importe);
  let serviciosHtml = "";
  serviciosSeleccionados.forEach(s => {
    total += Number(s.importe);
    serviciosHtml += `<li>${s.descripcion} - $${Number(s.importe).toFixed(2)}</li>`;
  });

  resumenReserva.innerHTML = `
    <p><strong>Salón:</strong> ${salon.titulo} - $${Number(salon.importe).toFixed(2)}</p>
    <p><strong>Turno:</strong> ${turnoSeleccionado.hora_desde} - ${turnoSeleccionado.hora_hasta}</p>
    <p><strong>Servicios adicionales:</strong></p>
    <ul>${serviciosHtml || "<li>Ninguno seleccionado</li>"}</ul>
    <p><strong>Total:</strong> $${total.toFixed(2)}</p>
  `;
}


  turnoSelect.addEventListener("change", actualizarResumen);
  document.addEventListener("change", e => {
    if (e.target.classList.contains("checkbox-servicio")) actualizarResumen();
  });

  const btnConfirmar = document.getElementById("btn-confirmar");
  btnConfirmar.addEventListener("click", async () => {
    const fecha = document.getElementById("fecha").value;
    const turnoId = turnoSelect.value;
    const serviciosSeleccionados = servicios.filter(s => document.getElementById(`servicio-${s.servicio_id}`).checked);

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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          salon_id: salonId,
          fecha_reserva: fecha,
          turno_id: turnoId,
          servicios: serviciosSeleccionados.map(s => s.servicio_id)
        })
      });

      const result = await res.json();
      if (res.ok) {
        mensaje.textContent = "Reserva confirmada con éxito!";
        mensaje.style.color = "green";
      } else {
        mensaje.textContent = "" + (result.message || "Error al realizar la reserva.");
        mensaje.style.color = "red";
      }
    } catch (err) {
      mensaje.textContent = "Error de conexión al servidor.";
      mensaje.style.color = "red";
    }
  });

  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/paginaPrincipal.html";
  });
});
