document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("lista-salones");

  try {
    const token = localStorage.getItem("token"); // obtenemos el token guardado

    // agregamos el encabezado Authorization si hay token
    const respuesta = await fetch("/api/salones", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!respuesta.ok) throw new Error("Error al obtener los salones");

    const salonesJSON = await respuesta.json();

    if (!salonesJSON.ok || salonesJSON.data.length === 0) {
      contenedor.innerHTML = "<p>No hay salones disponibles en este momento 👻</p>";
      return;
    }

    const salones = salonesJSON.data;

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

    contenedor.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-alquilar")) {
        const idSalon = e.target.dataset.id;
        const token = localStorage.getItem("token");
        const rol = localStorage.getItem("rol")?.trim().toLowerCase();

        if (!token) {
          window.location.href = "/loginUsuario.html?salon=" + idSalon;
        } else if (rol !== "cliente") {
          alert("Solo los clientes pueden reservar salones.");
        } else {
          window.location.href = "/reservar.html?salon=" + idSalon;
        }
      }
    });

  } catch (error) {
    console.error("Error fetch:", error);
    contenedor.innerHTML = "<p>Ocurrio un error al cargar los salones </p>";
  }
});
