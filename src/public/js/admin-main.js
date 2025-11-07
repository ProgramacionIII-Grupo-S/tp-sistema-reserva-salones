const API_BASE = '/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  setupEventListeners();
  cargarDashboard();
  setupModalEvents();
});

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    window.location.href = '/login.html';
    return;
  }

  currentUser = JSON.parse(user);
  
  if (currentUser.tipo_usuario !== 1) {
    alert('No tienes permisos de administrador para acceder a esta sección');
    window.location.href = '/login.html';
    return;
  }

  document.getElementById('userName').textContent = currentUser.nombre || 'Administrador';
}

function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      if (this.getAttribute('data-section')) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        showSection(section);
      }
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function setupModalEvents() {
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });

  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });

  document.getElementById('formUsuario').addEventListener('submit', guardarUsuario);
  document.getElementById('formSalon').addEventListener('submit', guardarSalon);
  document.getElementById('formServicio').addEventListener('submit', guardarServicio);
  document.getElementById('formTurno').addEventListener('submit', guardarTurno);
  document.getElementById('formReserva').addEventListener('submit', guardarReserva);
  document.getElementById('reservaSalon').addEventListener('change', actualizarResumenPrecios);
}

function showSection(sectionName) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.getElementById(sectionName).classList.add('active');
  document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
  
  const titles = {
    'dashboard': 'Dashboard Principal',
    'reservas': 'Gestión de Reservas',
    'usuarios': 'Gestión de Usuarios',
    'clientes': 'Listado de Clientes',
    'salones': 'Gestión de Salones',
    'servicios': 'Gestión de Servicios',
    'turnos': 'Gestión de Turnos'
  };
  document.getElementById('sectionTitle').textContent = titles[sectionName];
  
  if (sectionName === 'dashboard') cargarDashboard();
  if (sectionName === 'reservas') cargarReservas();
  if (sectionName === 'usuarios') cargarUsuarios();
  if (sectionName === 'clientes') cargarClientes();
  if (sectionName === 'salones') cargarSalones();
  if (sectionName === 'servicios') cargarServicios();
  if (sectionName === 'turnos') cargarTurnos();
}

async function cargarDashboard() {
  try {
    const [reservasRes, usuariosRes, salonesRes] = await Promise.all([
      fetch(`${API_BASE}/reservas`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/salones`, { headers: getAuthHeaders() })
    ]);

    if (reservasRes.ok && usuariosRes.ok && salonesRes.ok) {
      const reservasData = await reservasRes.json();
      const usuariosData = await usuariosRes.json();
      const salonesData = await salonesRes.json();

      document.getElementById('totalReservas').textContent = reservasData.data?.length || 0;
      document.getElementById('totalUsuarios').textContent = usuariosData.users?.length || 0;
      document.getElementById('totalSalones').textContent = salonesData.data?.length || 0;
      
      const hoy = new Date().toISOString().split('T')[0];
      const ingresosHoy = reservasData.data
        ?.filter(r => r.fecha_reserva === hoy)
        ?.reduce((sum, r) => sum + (r.importe_total || 0), 0) || 0;
      document.getElementById('ingresosHoy').textContent = `$${ingresosHoy}`;

      mostrarReservasRecientes(reservasData.data?.slice(0, 5) || []);
    }
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  }
}

function mostrarReservasRecientes(reservas) {
  const tbody = document.getElementById('reservasRecientes');
  tbody.innerHTML = '';

  if (reservas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay reservas recientes</td></tr>';
    return;
  }

  reservas.forEach(reserva => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${reserva.reserva_id}</td>
      <td>${reserva.cliente_nombre || 'N/A'}</td>
      <td>${reserva.salon_nombre || 'N/A'}</td>
      <td>${new Date(reserva.fecha_reserva).toLocaleDateString()}</td>
      <td>$${reserva.importe_total || 0}</td>
      <td><span class="badge badge-success">Activa</span></td>
    `;
    tbody.appendChild(tr);
  });
}

let clientesList = [];
let salonesList = [];
let turnosList = [];
let serviciosList = [];

async function cargarReservas() {
  try {
    const response = await fetch(`${API_BASE}/reservas`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar reservas');
    
    const data = await response.json();
    mostrarReservas(data.data);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar las reservas');
  }
}

function mostrarReservas(reservas) {
  const tbody = document.getElementById('reservasBody');
  tbody.innerHTML = '';

  reservas.forEach(reserva => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${reserva.reserva_id}</td>
      <td>${reserva.cliente_nombre || 'N/A'}</td>
      <td>${reserva.salon_nombre || 'N/A'}</td>
      <td>${new Date(reserva.fecha_reserva).toLocaleDateString()}</td>
      <td>${reserva.hora_desde} - ${reserva.hora_hasta}</td>
      <td>$${reserva.importe_total || 0}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarReserva(${reserva.reserva_id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="cancelarReserva(${reserva.reserva_id})">❌</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function editarReserva(id) {
  try {
    // Cargar datos de la reserva
    const response = await fetch(`${API_BASE}/reservas/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar reserva');
    
    const data = await response.json();
    const reserva = data.data;
    
    // Cargar datos necesarios para el formulario
    await cargarDatosParaFormulario();
    
    // Abrir modal con los datos de la reserva
    abrirModalReserva(reserva);
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar la reserva para editar');
  }
}

async function cargarDatosParaFormulario() {
  try {
    // Cargar todos los datos necesarios en paralelo
    const [clientesRes, salonesRes, turnosRes, serviciosRes] = await Promise.all([
      fetch(`${API_BASE}/users?tipo_usuario=3`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/salones`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/turnos`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/servicios`, { headers: getAuthHeaders() })
    ]);

    if (!clientesRes.ok || !salonesRes.ok || !turnosRes.ok || !serviciosRes.ok) {
      throw new Error('Error al cargar datos del formulario');
    }

    clientesList = await clientesRes.json().then(data => data.users || data);
    salonesList = await salonesRes.json().then(data => data.data || data);
    turnosList = await turnosRes.json().then(data => data.data || data);
    serviciosList = await serviciosRes.json().then(data => data.data || data);

    // Llenar selects
    llenarSelectClientes();
    llenarSelectSalones();
    llenarSelectTurnos();
    llenarCheckboxServicios();

  } catch (error) {
    console.error('Error cargando datos del formulario:', error);
    alert('Error al cargar los datos necesarios para el formulario');
  }
}

function llenarSelectClientes() {
  const select = document.getElementById('reservaCliente');
  select.innerHTML = '<option value="">Seleccionar cliente...</option>';
  
  clientesList.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente.usuario_id;
    option.textContent = `${cliente.nombre} ${cliente.apellido || ''} (${cliente.nombre_usuario})`;
    select.appendChild(option);
  });
}

function llenarSelectSalones() {
  const select = document.getElementById('reservaSalon');
  select.innerHTML = '<option value="">Seleccionar salón...</option>';
  
  salonesList.forEach(salon => {
    const option = document.createElement('option');
    option.value = salon.salon_id;
    option.textContent = `${salon.titulo} - $${salon.importe}`;
    option.setAttribute('data-precio', salon.importe);
    select.appendChild(option);
  });
}

function llenarSelectTurnos() {
  const select = document.getElementById('reservaTurno');
  select.innerHTML = '<option value="">Seleccionar turno...</option>';
  
  turnosList.forEach(turno => {
    const option = document.createElement('option');
    option.value = turno.turno_id;
    option.textContent = `${turno.hora_desde} - ${turno.hora_hasta}`;
    select.appendChild(option);
  });
}

function llenarCheckboxServicios() {
  const container = document.getElementById('serviciosContainer');
  container.innerHTML = '';
  
  serviciosList.forEach(servicio => {
    const servicioDiv = document.createElement('div');
    servicioDiv.className = 'servicio-checkbox-item';
    servicioDiv.innerHTML = `
      <input type="checkbox" id="servicio_${servicio.servicio_id}" 
             value="${servicio.servicio_id}" data-precio="${servicio.importe}">
      <div class="servicio-info">
        <div class="servicio-descripcion">${servicio.descripcion}</div>
        <div class="servicio-precio">$${servicio.importe}</div>
      </div>
    `;
    container.appendChild(servicioDiv);
  });
}

function abrirModalReserva(reserva = null) {
  const modal = document.getElementById('modalReserva');
  const title = document.getElementById('modalReservaTitle');
  const form = document.getElementById('formReserva');
  
  if (reserva) {
    title.textContent = 'Editar Reserva';
    cargarDatosReserva(reserva);
  } else {
    title.textContent = 'Nueva Reserva';
    form.reset();
    document.getElementById('reservaId').value = '';
    actualizarResumenPrecios();
  }
  
  modal.style.display = 'block';
}

function cargarDatosReserva(reserva) {
  document.getElementById('reservaId').value = reserva.reserva_id;
  document.getElementById('reservaCliente').value = reserva.usuario_id;
  document.getElementById('reservaSalon').value = reserva.salon_id;
  document.getElementById('reservaFecha').value = reserva.fecha_reserva;
  document.getElementById('reservaTurno').value = reserva.turno_id;
  document.getElementById('reservaTematica').value = reserva.tematica || '';

  // Marcar servicios seleccionados
  if (reserva.servicios && Array.isArray(reserva.servicios)) {
    reserva.servicios.forEach(servicio => {
      const servicioId = servicio.servicio_id || servicio;
      const checkbox = document.getElementById(`servicio_${servicioId}`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  actualizarResumenPrecios();
}

function actualizarResumenPrecios() {
  const salonSelect = document.getElementById('reservaSalon');
  const salonPrecio = parseFloat(salonSelect.selectedOptions[0]?.getAttribute('data-precio') || 0);
  
  let serviciosPrecio = 0;
  const serviciosCheckboxes = document.querySelectorAll('#serviciosContainer input[type="checkbox"]:checked');
  serviciosCheckboxes.forEach(checkbox => {
    serviciosPrecio += parseFloat(checkbox.getAttribute('data-precio') || 0);
  });

  const total = salonPrecio + serviciosPrecio;

  document.getElementById('previewImporteSalon').textContent = `$${salonPrecio}`;
  document.getElementById('previewServicios').textContent = `$${serviciosPrecio}`;
  document.getElementById('previewTotal').textContent = `$${total}`;
}

function cerrarModalReserva() {
  document.getElementById('modalReserva').style.display = 'none';
}

async function guardarReserva(e) {
  e.preventDefault();
  
  const reservaId = document.getElementById('reservaId').value;
  const reservaData = {
    usuario_id: parseInt(document.getElementById('reservaCliente').value),
    salon_id: parseInt(document.getElementById('reservaSalon').value),
    turno_id: parseInt(document.getElementById('reservaTurno').value),
    fecha_reserva: document.getElementById('reservaFecha').value,
    tematica: document.getElementById('reservaTematica').value,
    servicios: Array.from(document.querySelectorAll('#serviciosContainer input[type="checkbox"]:checked'))
      .map(checkbox => parseInt(checkbox.value))
  };

  // Validaciones básicas
  if (!reservaData.usuario_id) {
    alert('Por favor selecciona un cliente');
    return;
  }
  
  if (!reservaData.salon_id) {
    alert('Por favor selecciona un salón');
    return;
  }
  
  if (!reservaData.turno_id) {
    alert('Por favor selecciona un turno');
    return;
  }
  
  if (!reservaData.fecha_reserva) {
    alert('Por favor selecciona una fecha');
    return;
  }

  try {
    const url = `${API_BASE}/reservas/${reservaId}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(reservaData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || `Error ${response.status} al actualizar la reserva`);
    }

    const result = await response.json();
    
    alert('Reserva actualizada correctamente');
    
    cerrarModalReserva();
    cargarReservas(); // Recargar la lista
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar la reserva: ' + error.message);
  }
}

async function cancelarReserva(id) {
  if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/reservas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al cancelar reserva');

    alert('Reserva cancelada correctamente');
    cargarReservas();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cancelar la reserva');
  }
}

function nuevaReserva() {
  abrirModalReserva();
}

async function cargarUsuarios() {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar usuarios');
    
    const data = await response.json();
    mostrarUsuarios(data.users);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los usuarios');
  }
}

function mostrarUsuarios(usuarios) {
  const tbody = document.getElementById('usuariosBody');
  tbody.innerHTML = '';

  usuarios.forEach(usuario => {
    const tipoTexto = usuario.tipo_usuario === 1 ? 'Administrador' : 
                     usuario.tipo_usuario === 2 ? 'Empleado' : 'Cliente';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.usuario_id}</td>
      <td>${usuario.nombre} ${usuario.apellido || ''}</td>
      <td>${usuario.nombre_usuario}</td>
      <td>${tipoTexto}</td>
      <td><span class="badge ${usuario.activo ? 'badge-success' : 'badge-danger'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarUsuario(${usuario.usuario_id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.usuario_id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalUsuario(usuarioId = null) {
  const modal = document.getElementById('modalUsuario');
  const title = document.getElementById('modalUsuarioTitle');
  const form = document.getElementById('formUsuario');
  
  if (usuarioId) {
    title.textContent = 'Editar Usuario';
    cargarDatosUsuario(usuarioId);
  } else {
    title.textContent = 'Nuevo Usuario';
    form.reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('usuarioPassword').required = true;
  }
  
  modal.style.display = 'block';
}

async function cargarDatosUsuario(usuarioId) {
  try {
    const response = await fetch(`${API_BASE}/users/${usuarioId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar datos del usuario');
    
    const data = await response.json();
    const usuario = data.user || data;
    
    document.getElementById('usuarioId').value = usuario.usuario_id;
    document.getElementById('usuarioNombre').value = usuario.nombre;
    document.getElementById('usuarioEmail').value = usuario.nombre_usuario;
    document.getElementById('usuarioTipo').value = usuario.tipo_usuario;
    document.getElementById('usuarioPassword').required = false;
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del usuario');
  }
}

async function guardarUsuario(e) {
  e.preventDefault();
  
  const usuarioId = document.getElementById('usuarioId').value;
  const usuarioData = {
    nombre: document.getElementById('usuarioNombre').value,
    nombre_usuario: document.getElementById('usuarioEmail').value,
    tipo_usuario: parseInt(document.getElementById('usuarioTipo').value)
  };

  const password = document.getElementById('usuarioPassword').value;
  if (password) {
    usuarioData.contrasenia = password;
  }

  try {
    const url = usuarioId ? `${API_BASE}/users/${usuarioId}` : `${API_BASE}/auth/register`;
    const method = usuarioId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(usuarioData)
    });

    if (!response.ok) throw new Error('Error al guardar el usuario');

    alert(usuarioId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
    
    document.getElementById('modalUsuario').style.display = 'none';
    cargarUsuarios();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar el usuario');
  }
}

function editarUsuario(id) {
  abrirModalUsuario(id);
}

async function eliminarUsuario(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al eliminar el usuario');

    alert('Usuario eliminado correctamente');
    cargarUsuarios();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el usuario');
  }
}

async function cargarClientes() {
  try {
    const response = await fetch(`${API_BASE}/users?tipo_usuario=3`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar clientes');
    
    const data = await response.json();
    mostrarClientes(data.users);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los clientes');
  }
}

function mostrarClientes(clientes) {
  const tbody = document.getElementById('clientesBody');
  tbody.innerHTML = '';

  clientes.forEach(cliente => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.usuario_id}</td>
      <td>${cliente.nombre} ${cliente.apellido || ''}</td>
      <td>${cliente.nombre_usuario}</td>
      <td>${cliente.celular || 'N/A'}</td>
      <td><span class="badge badge-info">Cliente</span></td>
    `;
    tbody.appendChild(tr);
  });
}

async function cargarSalones() {
  try {
    const response = await fetch(`${API_BASE}/salones`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar salones');
    
    const data = await response.json();
    mostrarSalones(data.data);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los salones');
  }
}

function mostrarSalones(salones) {
  const tbody = document.getElementById('salonesBody');
  tbody.innerHTML = '';

  salones.forEach(salon => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${salon.salon_id}</td>
      <td>${salon.titulo}</td>
      <td>${salon.direccion}</td>
      <td>${salon.capacidad} personas</td>
      <td>$${salon.importe}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarSalon(${salon.salon_id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarSalon(${salon.salon_id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalSalon(salonId = null) {
  const modal = document.getElementById('modalSalon');
  const title = document.getElementById('modalSalonTitle');
  const form = document.getElementById('formSalon');
  
  if (salonId) {
    title.textContent = 'Editar Salón';
    cargarDatosSalon(salonId);
  } else {
    title.textContent = 'Nuevo Salón';
    form.reset();
    document.getElementById('salonId').value = '';
  }
  
  modal.style.display = 'block';
}

async function cargarDatosSalon(salonId) {
  try {
    const response = await fetch(`${API_BASE}/salones/${salonId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar datos del salón');
    
    const data = await response.json();
    const salon = data.data;
    
    document.getElementById('salonId').value = salon.salon_id;
    document.getElementById('salonTitulo').value = salon.titulo;
    document.getElementById('salonDireccion').value = salon.direccion;
    document.getElementById('salonCapacidad').value = salon.capacidad;
    document.getElementById('salonImporte').value = salon.importe;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del salón');
  }
}

async function guardarSalon(e) {
  e.preventDefault();
  
  const salonId = document.getElementById('salonId').value;
  const salonData = {
    titulo: document.getElementById('salonTitulo').value,
    direccion: document.getElementById('salonDireccion').value,
    capacidad: parseInt(document.getElementById('salonCapacidad').value),
    importe: parseFloat(document.getElementById('salonImporte').value)
  };

  try {
    const url = salonId ? `${API_BASE}/salones/${salonId}` : `${API_BASE}/salones`;
    const method = salonId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(salonData)
    });

    if (!response.ok) throw new Error('Error al guardar el salón');

    alert(salonId ? 'Salón actualizado correctamente' : 'Salón creado correctamente');
    
    document.getElementById('modalSalon').style.display = 'none';
    cargarSalones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar el salón');
  }
}

function editarSalon(id) {
  abrirModalSalon(id);
}

async function eliminarSalon(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este salón?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/salones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al eliminar el salón');

    alert('Salón eliminado correctamente');
    cargarSalones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el salón');
  }
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_BASE}/servicios`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar servicios');
    
    const data = await response.json();
    mostrarServicios(data.data || data);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los servicios');
  }
}

function mostrarServicios(servicios) {
  const tbody = document.getElementById('serviciosBody');
  tbody.innerHTML = '';

  servicios.forEach(servicio => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${servicio.servicio_id}</td>
      <td>${servicio.descripcion}</td>
      <td>$${servicio.importe}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarServicio(${servicio.servicio_id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarServicio(${servicio.servicio_id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalServicio(servicioId = null) {
  const modal = document.getElementById('modalServicio');
  const title = document.getElementById('modalServicioTitle');
  const form = document.getElementById('formServicio');
  
  if (servicioId) {
    title.textContent = 'Editar Servicio';
    cargarDatosServicio(servicioId);
  } else {
    title.textContent = 'Nuevo Servicio';
    form.reset();
    document.getElementById('servicioId').value = '';
  }
  
  modal.style.display = 'block';
}

async function cargarDatosServicio(servicioId) {
  try {
    const response = await fetch(`${API_BASE}/servicios`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar datos del servicio');
    
    const data = await response.json();
    const servicios = data.data || data;
    const servicio = servicios.find(s => s.servicio_id == servicioId);
    
    if (servicio) {
      document.getElementById('servicioId').value = servicio.servicio_id;
      document.getElementById('servicioDescripcion').value = servicio.descripcion;
      document.getElementById('servicioImporte').value = servicio.importe;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del servicio');
  }
}

async function guardarServicio(e) {
  e.preventDefault();
  
  const servicioId = document.getElementById('servicioId').value;
  const servicioData = {
    descripcion: document.getElementById('servicioDescripcion').value,
    importe: parseFloat(document.getElementById('servicioImporte').value)
  };

  try {
    const url = servicioId ? `${API_BASE}/servicios/${servicioId}` : `${API_BASE}/servicios`;
    const method = servicioId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(servicioData)
    });

    if (!response.ok) throw new Error('Error al guardar el servicio');

    alert(servicioId ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
    
    document.getElementById('modalServicio').style.display = 'none';
    cargarServicios();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar el servicio');
  }
}

function editarServicio(id) {
  abrirModalServicio(id);
}

async function eliminarServicio(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/servicios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al eliminar el servicio');

    alert('Servicio eliminado correctamente');
    cargarServicios();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el servicio');
  }
}

async function cargarTurnos() {
  try {
    const response = await fetch(`${API_BASE}/turnos`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar turnos');
    
    const data = await response.json();
    mostrarTurnos(data.data || data);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar los turnos');
  }
}

function mostrarTurnos(turnos) {
  const tbody = document.getElementById('turnosBody');
  tbody.innerHTML = '';

  turnos.forEach(turno => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${turno.turno_id}</td>
      <td>${turno.orden}</td>
      <td>${turno.hora_desde}</td>
      <td>${turno.hora_hasta}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editarTurno(${turno.turno_id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarTurno(${turno.turno_id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalTurno(turnoId = null) {
  const modal = document.getElementById('modalTurno');
  const title = document.getElementById('modalTurnoTitle');
  const form = document.getElementById('formTurno');
  
  if (turnoId) {
    title.textContent = 'Editar Turno';
    cargarDatosTurno(turnoId);
  } else {
    title.textContent = 'Nuevo Turno';
    form.reset();
    document.getElementById('turnoId').value = '';
  }
  
  modal.style.display = 'block';
}

async function cargarDatosTurno(turnoId) {
  try {
    const response = await fetch(`${API_BASE}/turnos`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar datos del turno');
    
    const data = await response.json();
    const turnos = data.data || data;
    const turno = turnos.find(t => t.turno_id == turnoId);
    
    if (turno) {
      document.getElementById('turnoId').value = turno.turno_id;
      document.getElementById('turnoOrden').value = turno.orden;
      document.getElementById('turnoHoraDesde').value = turno.hora_desde;
      document.getElementById('turnoHoraHasta').value = turno.hora_hasta;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar datos del turno');
  }
}

async function guardarTurno(e) {
  e.preventDefault();
  
  const turnoId = document.getElementById('turnoId').value;
  const turnoData = {
    orden: parseInt(document.getElementById('turnoOrden').value),
    hora_desde: document.getElementById('turnoHoraDesde').value,
    hora_hasta: document.getElementById('turnoHoraHasta').value
  };

  try {
    const url = turnoId ? `${API_BASE}/turnos/${turnoId}` : `${API_BASE}/turnos`;
    const method = turnoId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(turnoData)
    });

    if (!response.ok) throw new Error('Error al guardar el turno');

    alert(turnoId ? 'Turno actualizado correctamente' : 'Turno creado correctamente');
    
    document.getElementById('modalTurno').style.display = 'none';
    cargarTurnos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar el turno');
  }
}

function editarTurno(id) {
  abrirModalTurno(id);
}

async function eliminarTurno(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este turno?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/turnos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al eliminar el turno');

    alert('Turno eliminado correctamente');
    cargarTurnos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el turno');
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('change', function(event) {
    if (event.target.matches('#serviciosContainer input[type="checkbox"]')) {
      actualizarResumenPrecios();
    }
  });
});