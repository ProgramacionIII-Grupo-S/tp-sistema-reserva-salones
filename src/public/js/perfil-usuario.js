class PerfilUsuarioManager {
  constructor() {
    this.usuario = null;
    this.avatarFile = null;
    this.eliminarAvatar = false;
    this.init();
  }

  async init() {
    await this.verificarAutenticacion();
    this.actualizarNavbar();
    this.cargarDatosUsuario();
    this.configurarEventListeners();
  }

  verificarAutenticacion() {
    return new Promise((resolve) => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");

      if (!token || parseInt(userType) !== 3) {
        alert("Debes iniciar sesión como cliente para acceder a tu perfil.");
        window.location.href = "/loginUsuario.html";
        return;
      }
      resolve();
    });
  }

  actualizarNavbar() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    const misReservasLink = document.getElementById("mis-reservas-link");
    const perfilLink = document.getElementById("perfil-link");
    const logoutLink = document.getElementById("logout-link");
    const userWelcome = document.getElementById("user-welcome");

    if (token && userData) {
      const user = JSON.parse(userData);

      misReservasLink.style.display = "inline";
      perfilLink.style.display = "inline";
      logoutLink.style.display = "inline";
      userWelcome.style.display = "inline";
      userWelcome.textContent = `Hola, ${user.nombre}`;

      logoutLink.onclick = (e) => {
        e.preventDefault();
        this.cerrarSesion();
      };
    }
  }

  cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    window.location.href = "/paginaPrincipal.html";
  }

  async cargarDatosUsuario() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!userData) {
      this.mostrarError("No se pudieron cargar los datos del usuario");
      return;
    }

    try {
      const user = JSON.parse(userData);
      this.usuario = user;
      this.mostrarDatosUsuario(user);
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      this.mostrarError("Error al cargar los datos del perfil");
    }
  }

  mostrarDatosUsuario(usuario) {
    document.getElementById("nombre").value = usuario.nombre || "";
    document.getElementById("apellido").value = usuario.apellido || "";
    document.getElementById("usuario").value = usuario.nombre_usuario || "";
    document.getElementById("celular").value = usuario.celular || "";

    if (usuario.foto) {
      this.mostrarAvatar(usuario.foto);
    } else {
      this.mostrarAvatarPorDefecto();
    }
  }

  mostrarAvatar(url) {
    const avatarPreview = document.getElementById("avatar-preview");
    const sinFoto = document.getElementById("sin-foto");
    const btnEliminar = document.getElementById("btn-eliminar-foto");

    avatarPreview.src = url;
    avatarPreview.style.display = "block";
    sinFoto.style.display = "none";
    btnEliminar.style.display = "block";
  }

  mostrarAvatarPorDefecto() {
    const avatarPreview = document.getElementById("avatar-preview");
    const sinFoto = document.getElementById("sin-foto");
    const btnEliminar = document.getElementById("btn-eliminar-foto");

    avatarPreview.style.display = "none";
    sinFoto.style.display = "flex";
    btnEliminar.style.display = "none";
  }

  configurarEventListeners() {
    document
      .getElementById("btn-cambiar-foto")
      .addEventListener("click", () => {
        document.getElementById("avatar-input").click();
      });

    document
      .getElementById("btn-eliminar-foto")
      .addEventListener("click", () => {
        this.eliminarAvatar = true;
        this.mostrarAvatarPorDefecto();
      });

    document.getElementById("avatar-input").addEventListener("change", (e) => {
      this.manejarSeleccionArchivo(e);
    });

    document.getElementById("form-perfil").addEventListener("submit", (e) => {
      e.preventDefault();
      this.validarYGuardar();
    });

    document.getElementById("btn-cancelar").addEventListener("click", () => {
      this.cancelarCambios();
    });

    document
      .getElementById("btn-cerrar-modal")
      .addEventListener("click", () => {
        this.cerrarModal();
      });

    document.getElementById("usuario").addEventListener("blur", () => {
      this.validarEmail();
    });
  }

  validarEmail() {
    const email = document.getElementById("usuario").value;
    const errorElement = document.getElementById("error-usuario");

    if (!email) {
      errorElement.textContent = "El email es obligatorio";
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorElement.textContent = "Por favor, ingresa un email válido";
      return false;
    }

    errorElement.textContent = "";
    return true;
  }

  validarContraseñas() {
    const contraseniaActual =
      document.getElementById("contrasenia_actual").value;
    const nuevaContrasenia = document.getElementById("nueva_contrasenia").value;
    const confirmarContrasenia = document.getElementById(
      "confirmar_contrasenia"
    ).value;

    const errorNueva = document.getElementById("error-nueva_contrasenia");
    const errorConfirmar = document.getElementById(
      "error-confirmar_contrasenia"
    );

    if (contraseniaActual || nuevaContrasenia || confirmarContrasenia) {
      if (!contraseniaActual) {
        document.getElementById("error-contrasenia_actual").textContent =
          "La contraseña actual es requerida para cambiar la contraseña";
        return false;
      }

      if (!nuevaContrasenia) {
        errorNueva.textContent = "La nueva contraseña es requerida";
        return false;
      }

      if (nuevaContrasenia.length < 6) {
        errorNueva.textContent =
          "La contraseña debe tener al menos 6 caracteres";
        return false;
      }

      if (nuevaContrasenia !== confirmarContrasenia) {
        errorConfirmar.textContent = "Las contraseñas no coinciden";
        return false;
      }
    }

    errorNueva.textContent = "";
    errorConfirmar.textContent = "";
    document.getElementById("error-contrasenia_actual").textContent = "";
    return true;
  }

  validarFormulario() {
    let esValido = true;

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;

    if (!nombre) {
      document.getElementById("error-nombre").textContent =
        "El nombre es obligatorio";
      esValido = false;
    } else {
      document.getElementById("error-nombre").textContent = "";
    }

    if (!apellido) {
      document.getElementById("error-apellido").textContent =
        "El apellido es obligatorio";
      esValido = false;
    } else {
      document.getElementById("error-apellido").textContent = "";
    }

    if (!this.validarEmail()) {
      esValido = false;
    }

    if (!this.validarContraseñas()) {
      esValido = false;
    }

    return esValido;
  }

  manejarSeleccionArchivo(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB.");
      return;
    }

    this.avatarFile = file;
    this.eliminarAvatar = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.mostrarAvatar(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  async validarYGuardar() {
    if (!this.validarFormulario()) {
      return;
    }

    await this.guardarCambios();
  }

  async guardarCambios() {
    const token = localStorage.getItem("token");
    const userId = this.usuario.usuario_id;

    try {
      this.mostrarLoading(true);

      const formData = new FormData();

      const formDataFields = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        nombre_usuario: document.getElementById("usuario").value,
        celular: document.getElementById("celular").value || "",
      };

      const contraseniaActual =
        document.getElementById("contrasenia_actual").value;
      const nuevaContrasenia =
        document.getElementById("nueva_contrasenia").value;

      if (contraseniaActual) {
        formDataFields.contrasenia_actual = contraseniaActual;
      }
      if (nuevaContrasenia) {
        formDataFields.nueva_contrasenia = nuevaContrasenia;
      }

      Object.keys(formDataFields).forEach((key) => {
        formData.append(key, formDataFields[key]);
      });

      if (this.avatarFile) {
        formData.append("avatar", this.avatarFile);
      }

      console.log("Enviando datos a:", `/api/users/${userId}`);
      console.log("Datos:", formDataFields);

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log(
        "Respuesta del servidor:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Resultado exitoso:", result);

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
        this.usuario = result.user;
        this.actualizarNavbar();
      }

      this.mostrarModalExito();
      this.limpiarEstado();
    } catch (error) {
      console.error("Error completo al guardar cambios:", error);

      if (error.message.includes("404")) {
        this.mostrarError("Endpoint no encontrado. Contacta al administrador.");
      } else if (error.message.includes("403")) {
        this.mostrarError("No tienes permisos para actualizar este perfil.");
      } else if (error.message.includes("401")) {
        this.mostrarError(
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
        this.cerrarSesion();
      } else {
        this.mostrarError(error.message);
      }
    } finally {
      this.mostrarLoading(false);
    }
  }

  cancelarCambios() {
    if (confirm("¿Estás seguro de que deseas descartar los cambios?")) {
      this.cargarDatosUsuario();
      this.limpiarEstado();
    }
  }

  limpiarEstado() {
    this.avatarFile = null;
    this.eliminarAvatar = false;
    document.getElementById("avatar-input").value = "";

    document.getElementById("contrasenia_actual").value = "";
    document.getElementById("nueva_contrasenia").value = "";
    document.getElementById("confirmar_contrasenia").value = "";

    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
    });
  }

  mostrarLoading(mostrar) {
    const btnGuardar = document.getElementById("btn-guardar");
    const btnText = document.getElementById("btn-text");
    const btnLoading = document.getElementById("btn-loading");

    if (mostrar) {
      btnGuardar.disabled = true;
      btnText.textContent = "Guardando...";
      btnLoading.style.display = "block";
    } else {
      btnGuardar.disabled = false;
      btnText.textContent = "Guardar Cambios";
      btnLoading.style.display = "none";
    }
  }

  mostrarModalExito() {
    document.getElementById("modal-confirmacion").style.display = "flex";
  }

  cerrarModal() {
    document.getElementById("modal-confirmacion").style.display = "none";
  }

  mostrarError(mensaje) {
    alert(`Error: ${mensaje}`);
  }
}

let perfilManager;

document.addEventListener("DOMContentLoaded", () => {
  perfilManager = new PerfilUsuarioManager();
});
