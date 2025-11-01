const API_BASE = 'http://localhost:3000/api';
let jwtToken = localStorage.getItem('token') || '';

if (!jwtToken) {
    window.location.href = 'login.html';
}

// Helper para fetch con autenticación
async function fetchConAuth(url, options = {}) {
    options.headers = { ...(options.headers || {}), ...getAuthHeaders() };
    const res = await fetch(url, options);

    if (res.status === 401) {
        redirigirLogin();
        throw new Error('No autorizado');
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
        console.log(jwtToken)
        cargarTodo();
    }
});

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
    };
}

function redirigirLogin() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
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

async function cargarTodo() {
    mostrarLoading(true);
    ocultarError();

    const tareas = [
        { fn: cargarReservasPorMes, id: 'chartReservasMes' },
        { fn: cargarIngresosPeriodo, id: 'ingresosTotalesPeriodo' },
        { fn: cargarReservasPorSalon, id: 'chartReservasSalon' },
        { fn: cargarReservasPorCliente, id: 'chartTopClientes' }
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
    new Chart(ctx, {
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
    new Chart(ctx, {
        type: 'doughnut',
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

    new Chart(ctx, {
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
    if (!jwtToken) return redirigirLogin();

    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;

    if (!fechaDesde || !fechaHasta) return mostrarNotificacion('Selecciona un período de fechas', 'error');

    try {
        mostrarNotificacion('Generando PDF...', 'info');

        const response = await fetchConAuth(
            `${API_BASE}/reportes/pdf?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}&titulo=Reporte Dashboard`
        );

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-reservas-${fechaDesde}-a-${fechaHasta}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacion('PDF descargado exitosamente', 'success');
    } catch (error) {
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


