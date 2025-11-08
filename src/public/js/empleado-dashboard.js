const API_BASE = '/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  setupEventListeners();
  cargarReservas();
  setupModalEvents();
});

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    window.location.href = '/login-staff.html';
    return;
  }

  currentUser = JSON.parse(user);
  
  if (currentUser.tipo_usuario !== 2) {
    alert('No tienes permisos para acceder a esta sección');
    window.location.href = '/login-staff.html';
    return;
  }

  document.getElementById('userName').textContent = currentUser.nombre;
}

function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      showSection(section);
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

  document.getElementById('formSalon').addEventListener('submit', guardarSalon);
  document.getElementById('formServicio').addEventListener('submit', guardarServicio);
  document.getElementById('formTurno').addEventListener('submit', guardarTurno);
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
    'reservas': 'Gestión de Reservas',
    'clientes': 'Listado de Clientes', 
    'salones': 'Gestión de Salones',
    'servicios': 'Gestión de Servicios',
    'turnos': 'Gestión de Turnos'
  };
  document.getElementById('sectionTitle').textContent = titles[sectionName];
  
  if (sectionName === 'reservas') cargarReservas();
  if (sectionName === 'clientes') cargarClientes();
  if (sectionName === 'salones') cargarSalones();
  if (sectionName === 'servicios') cargarServicios();
  if (sectionName === 'turnos') cargarTurnos();
}

async function cargarReservas() {
  try {
    const response = await fetch(`${API_BASE}/reservas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
      <td>${reserva.cliente_nombre}</td>
      <td>${reserva.salon_nombre}</td>
      <td>${new Date(reserva.fecha_reserva).toLocaleDateString()}</td>
      <td>${reserva.hora_desde} - ${reserva.hora_hasta}</td>
      <td>$${reserva.importe_total}</td>
      <td><span class="badge badge-success">Activa</span></td>
    `;
    tbody.appendChild(tr);
  });
}

async function cargarClientes() {
  try {
    const response = await fetch(`${API_BASE}/users?tipo_usuario=3`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status} al cargar clientes`);
    }
    
    const data = await response.json();
    mostrarClientes(data.users);
    
  } catch (error) {
    console.error('Error:', error);
    
    if (error.message.includes('403')) {
      mostrarMensajeSinPermisos();
    } else if (error.message.includes('404')) {
      await cargarTodosUsuariosYFiltrar();
    } else {
      alert('Error al cargar los clientes: ' + error.message);
    }
  }
}

async function cargarClientes() {
  try {
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const payload = JSON.parse(atob(token.split('.')[1]));

    const response = await fetch(`${API_BASE}/users?tipo_usuario=3`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 403) {
      const errorData = await response.json();
      
      // Mostrar información detallada
      mostrarMensajeError(`
        <strong>🔒 Permisos Insuficientes</strong>
        <br>Error: ${errorData.error || 'Desconocido'}
        <br>Tu rol: ${errorData.yourRole || 'No disponible'}
        <br>Roles requeridos: ${errorData.requiredRoles || 'No disponible'}
        <br><small>Revisa la consola para más detalles</small>
      `);
      return;
    }
    
    if (response.status === 401) {
      mostrarMensajeError('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      setTimeout(() => window.location.href = '/login.html', 2000);
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    
    const data = await response.json();
    mostrarClientes(data.users);
    
  } catch (error) {
    console.error('Error en cargarClientes:', error);
    mostrarMensajeError(`Error: ${error.message}`);
  }
}

function mostrarClientes(clientes) {
  const tbody = document.getElementById('clientesBody');
  tbody.innerHTML = '';

  if (!clientes || clientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          No hay clientes registrados en el sistema.
        </td>
      </tr>
    `;
    return;
  }

  clientes.forEach(cliente => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.usuario_id}</td>
      <td>${cliente.nombre} ${cliente.apellido || ''}</td>
      <td>${cliente.nombre_usuario}</td>
      <td>${cliente.celular || 'N/A'}</td>
      <td>
        <span class="badge badge-info">Cliente</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function mostrarMensajeSinPermisos() {
  const tbody = document.getElementById('clientesBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center">
        <div style="padding: 20px; color: #dc3545;">
          <h4>🔒 Permisos Insuficientes</h4>
          <p>No tienes acceso para ver la lista de clientes.</p>
          <p><small>Contacta al administrador del sistema.</small></p>
        </div>
      </td>
    </tr>
  `;
}

function mostrarMensajeError(mensaje) {
  const tbody = document.getElementById('clientesBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center">
        <div style="padding: 20px; color: #666;">
          <h4>⚠️ Error de Conexión</h4>
          <p>${mensaje}</p>
          <button class="btn btn-sm btn-primary" onclick="cargarClientes()">Reintentar</button>
        </div>
      </td>
    </tr>
  `;
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
        <button class="btn btn-sm btn-warning" onclick="editarSalon(${salon.salon_id})">✏️ Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarSalon(${salon.salon_id})">🗑️ Eliminar</button>
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(salonData)
    });

    if (!response.ok) throw new Error('Error al guardar el salón');

    const result = await response.json();
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
  if (!confirm('¿Estás seguro de que deseas eliminar este salón?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/salones/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
        <button class="btn btn-sm btn-warning" onclick="editarServicio(${servicio.servicio_id})">✏️ Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarServicio(${servicio.servicio_id})">🗑️ Eliminar</button>
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/servicios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
        <button class="btn btn-sm btn-warning" onclick="editarTurno(${turno.turno_id})">✏️ Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarTurno(${turno.turno_id})">🗑️ Eliminar</button>
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  if (!confirm('¿Estás seguro de que deseas eliminar este turno?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/turnos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Error al eliminar el turno');

    alert('Turno eliminado correctamente');
    cargarTurnos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el turno');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login-staff.html';
}