const API_BASE = 'http://localhost:3000/api';

function obtenerToken() {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');
    
    if (!token) {
        token = localStorage.getItem('token');
    }
    
    return token;
}

let jwtToken = obtenerToken();

if (!jwtToken) {
    console.error('No se encontró token de autenticación');
    window.location.href = 'login-staff.html';
} else {
    localStorage.setItem('token', jwtToken);
    console.log('Token obtenido correctamente');
}

let chartReservasMes = null;
let chartReservasSalon = null;
let chartTopClientes = null;

async function fetchConAuth(url, options = {}) {
    jwtToken = obtenerToken();
    
    options.headers = { ...(options.headers || {}), ...getAuthHeaders() };
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        console.warn('Token expirado o inválido. Cerrando sesión...');
        mostrarNotificacion('Tu sesión ha expirado. Iniciá sesión nuevamente.', 'error');
        redirigirLogin();
        throw new Error('Token expirado o no autorizado');
    }   
    return res;
}

document.addEventListener('DOMContentLoaded', function () {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    document.getElementById('fechaDesde').value = hace30Dias.toISOString().split('T')[0];
    document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];

    if (jwtToken) {
        cargarTodo();
    }
    
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
    };
}

function redirigirLogin() {
    localStorage.removeItem('token');
    if (window.location.search.includes('token=')) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    window.location.href = 'login-staff.html';
}

function cerrarSesion() {
    localStorage.removeItem('token');
    if (window.location.search.includes('token=')) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    window.location.href = 'login-staff.html';
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

    if (tipo === 'success') notificacion.style.background = '#27ae60';
    else if (tipo === 'error') notificacion.style.background = '#e74c3c';
    else notificacion.style.background = '#3498db';

    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notificacion), 300);
    }, 3000);
}

function mostrarLoading(mostrar) {
    const loadingDiv = document.getElementById('loading');
    const appDiv = document.getElementById('app');
    if (mostrar) {
        loadingDiv.style.display = 'block';
        appDiv.style.display = 'none';
    } else {
        loadingDiv.style.display = 'none';
        appDiv.style.display = 'block';
    }
}

function mostrarError(mensaje) {
    document.getElementById('error').textContent = mensaje;
    document.getElementById('error').style.display = 'block';
}

function ocultarError() {
    document.getElementById('error').style.display = 'none';
}

async function cargarEstadisticasGenerales() {
    const response = await fetchConAuth(`${API_BASE}/reportes/estadisticas-generales`);
    const data = await response.json();

    document.getElementById('totalServicios').textContent = data.total_servicios;
    document.getElementById('totalEmpleados').textContent = data.total_empleados;
    document.getElementById('totalClientes').textContent = data.total_clientes;
    document.getElementById('totalSalones').textContent = data.total_salones;
    document.getElementById('ingresosMesActual').textContent = `$${parseFloat(data.ingresos_mes_actual).toLocaleString()}`;
}

async function cargarListaEmpleados() {
    const response = await fetchConAuth(`${API_BASE}/reportes/lista-empleados`);
    const empleados = await response.json();

    const empleadosHTML = empleados.map(emp => `
        <div class="empleado-card">
            <div class="empleado-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="empleado-info">
                <h4>${emp.nombre} ${emp.apellido}</h4>
                <p><i class="fas fa-envelope"></i> ${emp.nombre_usuario}</p>
                <p><i class="fas fa-phone"></i> ${emp.celular || 'No especificado'}</p>
                <small>Ingresó: ${new Date(emp.creado).toLocaleDateString('es-AR')}</small>
            </div>
        </div>
    `).join('');

    document.getElementById('listaEmpleados').innerHTML = empleadosHTML;
}

async function cargarServiciosPopulares() {
    const response = await fetchConAuth(`${API_BASE}/reportes/servicios-populares`);
    const servicios = await response.json();

    const serviciosHTML = servicios.map(serv => `
        <div class="servicio-card">
            <div class="servicio-header">
                <h4>${serv.descripcion}</h4>
                <span class="precio">$${parseFloat(serv.importe).toLocaleString()}</span>
            </div>
            <div class="servicio-stats">
                <div class="stat">
                    <i class="fas fa-shopping-cart"></i>
                    <span>${serv.total_contrataciones} contrataciones</span>
                </div>
                <div class="stat">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>$${parseFloat(serv.ingresos_totales || 0).toLocaleString()} recaudado</span>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('serviciosPopulares').innerHTML = serviciosHTML;
}

async function cargarTodo() {
    mostrarLoading(true);
    ocultarError();

    const tareas = [
        { fn: cargarReservasPorMes, id:'chartReservasMes' },
        { fn: cargarIngresosPeriodo, id:'ingresosTotalesPeriodo' },
        { fn: cargarReservasPorSalon, id:'chartReservasSalon' },
        { fn: cargarReservasPorCliente, id:'chartTopClientes' },
          { fn: cargarEstadisticasGenerales, id:'statsGrid' },
        { fn: cargarListaEmpleados, id:'listaEmpleados' },
        { fn: cargarServiciosPopulares, id:'serviciosPopulares' }
    ];

    try {
        await Promise.all(tareas.map(async (tarea) => {
            try {
                await tarea.fn();
            } catch (error) {
                if (error.message.includes('403')) {
                    const contenedor = document.getElementById(tarea.id);
                    if (contenedor) {
                        contenedor.innerHTML = '<p style="color: #e74c3c; font-weight: bold;">Sin permisos para ver esta sección</p>';
                    }
                } else {
                    console.error('Error interno en sección', tarea.id, error);
                    mostrarError('Error al cargar los datos de ' + tarea.id);
                }
            }
        }));
    } catch (error) {
        console.error('Error crítico al cargar el dashboard', error);
        mostrarError('Error crítico al cargar el dashboard');
    } finally {
        mostrarLoading(false);
    }
}

// Funciones de carga 
async function cargarReservasPorMes() {
    const anio = document.getElementById('selectAnio').value;
    const response = await fetchConAuth(`${API_BASE}/reportes/reservas-por-mes?anio=${anio}`);
    const data = await response.json();

    document.getElementById('totalReservasAnio').textContent = data.total_reservas;
    document.getElementById('ingresosTotalesAnio').textContent = `$${parseFloat(data.ingresos_totales).toLocaleString()}`;

    crearChartReservasMes(data.datos);
}

async function cargarIngresosPeriodo() {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;

    const response = await fetchConAuth(`${API_BASE}/reportes/ingresos-periodo?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
    const data = await response.json();

    document.getElementById('totalReservasPeriodo').textContent = data.total_reservas;
    document.getElementById('ingresosTotalesPeriodo').textContent = `$${parseFloat(data.ingresos_totales).toLocaleString()}`;
}

async function cargarReservasPorSalon() {
    const response = await fetchConAuth(`${API_BASE}/reportes/reservas-por-salon`);
    const data = await response.json();

    crearChartReservasSalon(data.datos);
    crearTablaSalones(data.datos);
}

async function cargarReservasPorCliente() {
    const response = await fetchConAuth(`${API_BASE}/reportes/reservas-por-cliente`);
    const data = await response.json();

    crearChartTopClientes(data.datos);
}

// Funciones de gráficos y tablas
function crearChartReservasMes(datos) {
    const ctx = document.getElementById('chartReservasMes').getContext('2d');
    if (chartReservasMes) {
        chartReservasMes.destroy();
    }
    chartReservasMes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.map(item => item.mes_nombre),
            datasets: [{
                label: 'Reservas por Mes',
                data: datos.map(item => item.total_reservas),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function crearChartReservasSalon(datos) {
    const ctx = document.getElementById('chartReservasSalon').getContext('2d');
    if (chartReservasSalon) {
        chartReservasSalon.destroy();
    }
    chartReservasSalon = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: datos.map(item => item.salon),
            datasets: [{
                data: datos.map(item => item.total_reservas),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function crearChartTopClientes(datos) {
    const topClientes = datos.slice(0, 5);
    const ctx = document.getElementById('chartTopClientes').getContext('2d');
    if (chartTopClientes) {
        chartTopClientes.destroy();
    }
    chartTopClientes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topClientes.map(item => item.cliente),
            datasets: [{
                label: 'Total Gastado ($)',
                data: topClientes.map(item => parseFloat(item.total_gastado)),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
            }]
        },
        options: { indexAxis: 'y', responsive: true }
    });
}

function crearTablaSalones(datos) {
    const tabla = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left;">Salón</th>
                    <th style="padding: 10px; text-align: right;">Reservas</th>
                    <th style="padding: 10px; text-align: right;">Ingresos</th>
                </tr>
            </thead>
            <tbody>
                ${datos.map(s => `
                    <tr>
                        <td style="padding: 8px;">${s.salon}</td>
                        <td style="padding: 8px; text-align: right;">${s.total_reservas}</td>
                        <td style="padding: 8px; text-align: right;">$${parseFloat(s.ingresos_salon || 0).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('tablaSalones').innerHTML = tabla;
}

// Funciones de descarga
async function descargarReportePDF() {
    try {
        const fechaDesde = document.getElementById('fechaDesde').value;
        const fechaHasta = document.getElementById('fechaHasta').value;

        if (!fechaDesde || !fechaHasta) {
            mostrarNotificacion('Selecciona un período de fechas', 'error');
            return;
        }

        // Codificar correctamente los parámetros
        const params = new URLSearchParams({
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
            titulo: 'Reporte Dashboard'
        });

        const url = `${API_BASE}/reportes/pdf?${params.toString()}`;
        console.log('🔗 URL completa:', url);
        console.log('🔑 Token:', jwtToken ? 'Presente' : 'Ausente');

        mostrarNotificacion('Generando PDF...', 'info');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Verificar que sea un PDF
        const contentType = response.headers.get('content-type');
        console.log('📄 Content-Type:', contentType);

        if (contentType && contentType.includes('application/pdf')) {
            const blob = await response.blob();
            console.log('📦 Blob size:', blob.size);
            
            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = `reporte-${fechaDesde}-a-${fechaHasta}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(urlBlob);
            
            mostrarNotificacion('PDF descargado exitosamente', 'success');
        } else {
            const text = await response.text();
            console.error('❌ No es PDF, respuesta:', text);
            throw new Error('El servidor no devolvió un PDF válido');
        }

    } catch (error) {
        console.error('💥 Error completo al descargar PDF:', error);
        mostrarNotificacion('Error descargando PDF: ' + error.message, 'error');
    }
}

async function descargarReporteCSV() {
    if (!jwtToken) return redirigirLogin();

    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;

    if (!fechaDesde || !fechaHasta) return mostrarNotificacion('Selecciona un período de fechas', 'error');

    try {
        mostrarNotificacion('Generando CSV...', 'info');

        const response = await fetchConAuth(
            `${API_BASE}/reportes/csv?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`
        );

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-reservas-${fechaDesde}-a-${fechaHasta}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacion('CSV descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error descargando CSV: ' + error.message, 'error');
    }
}

async function descargarEstadisticasMensualPDF() {
    if (!jwtToken) return redirigirLogin();

    const anio = document.getElementById('selectAnio').value;

    try {
        mostrarNotificacion('Generando estadísticas mensuales...', 'info');

        const response = await fetchConAuth(
            `${API_BASE}/reportes/estadisticas-mensual-pdf?anio=${anio}`
        );

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estadisticas-mensual-${anio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacion('PDF de estadísticas descargado', 'success');
    } catch (error) {
        mostrarNotificacion('Error descargando PDF: ' + error.message, 'error');
    }
}

async function descargarEstadisticasSalonPDF() {
    if (!jwtToken) return redirigirLogin();

    try {
        mostrarNotificacion('Generando estadísticas por salón...', 'info');

        const response = await fetchConAuth(`${API_BASE}/reportes/estadisticas-salon-pdf`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estadisticas-salones.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacion('PDF de salones descargado', 'success');
    } catch (error) {
        mostrarNotificacion('Error descargando PDF: ' + error.message, 'error');
    }
}

function exportarChartComoPNG(chartId) {
    const chartCanvas = document.getElementById(chartId);
    const link = document.createElement('a');
    link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = chartCanvas.toDataURL();
    link.click();

    mostrarNotificacion('Gráfico exportado como PNG', 'success');
}


