/**
 * DataStudio Calendario — Community Visualization
 * Looker Studio (Google Data Studio) custom calendar viz
 * Muestra tasks por fecha con vista mensual y semanal.
 */

'use strict';

/* global dscc */
// dscc es inyectado por Looker Studio como variable global en el iframe

// ─── Datos de ejemplo (solo para dev local) ──────────────────────────────────
const today = new Date();
function fmtDate(d) {
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}
const SAMPLE_DATA = {
  tables: {
    DEFAULT: [
      { fecha: [fmtDate(today)],               tarea: ['Reunión de equipo'],     estado: ['Pendiente'],   metrica: [2] },
      { fecha: [fmtDate(today)],               tarea: ['Revisión de código'],    estado: ['En progreso'], metrica: [3] },
      { fecha: [fmtDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()+1))], tarea: ['Deploy a producción'],   estado: ['Pendiente'],   metrica: [5] },
      { fecha: [fmtDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()+2))], tarea: ['Pruebas QA'],           estado: ['Completado'],  metrica: [8] },
      { fecha: [fmtDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()+2))], tarea: ['Documentación API'],    estado: ['En progreso'], metrica: [4] },
      { fecha: [fmtDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()-1))], tarea: ['Estimación sprint'],    estado: ['Completado'],  metrica: [1] },
      { fecha: [fmtDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()+5))], tarea: ['Presentación cliente'], estado: ['Pendiente'],   metrica: [3] },
    ]
  },
  style: { vistaDefault: { value: 'month' }, primeraFila: { value: '0' }, mostrarMetrica: { value: 'true' } }
};

// ─── Paleta de colores (estilo Looker Studio) ────────────────────────────────
const PALETTE = [
  '#1A73E8', // azul Google
  '#34A853', // verde
  '#FBBC04', // amarillo
  '#EA4335', // rojo
  '#9334E6', // morado
  '#00ACC1', // cyan
  '#FB8C00', // naranja
  '#43A047', // verde oscuro
  '#E91E63', // rosa
  '#00897B', // teal
];

// ─── Estado global ───────────────────────────────────────────────────────────
let currentView   = 'month';
let currentDate   = new Date();
let tasks         = [];
let statusColors  = {};
let colorIdx      = 0;
let firstDayOfWeek = 0; // 0=domingo, 1=lunes
let showMetric    = true;
let initialized   = false;

// ─── Utilidades de color ─────────────────────────────────────────────────────
function getStatusColor(status) {
  if (!status || status === '') return PALETTE[0];
  if (!statusColors[status]) {
    statusColors[status] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return statusColors[status];
}

// ─── Utilidades de fecha ─────────────────────────────────────────────────────
function parseDate(val) {
  if (!val && val !== 0) return null;
  const s = String(val).trim();
  // Formato Looker Studio: 'YYYYMMDD'
  if (/^\d{8}$/.test(s)) {
    return new Date(
      parseInt(s.slice(0, 4), 10),
      parseInt(s.slice(4, 6), 10) - 1,
      parseInt(s.slice(6, 8), 10)
    );
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDayOfWeek + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const DAYS_SHORT_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function getDayNames() {
  const names = [];
  for (let i = 0; i < 7; i++) {
    names.push(DAYS_SHORT_ES[(firstDayOfWeek + i) % 7]);
  }
  return names;
}

// ─── Callback principal de dscc ──────────────────────────────────────────────
function drawViz(data) {
  // Leer estilos
  const style = data.style || {};
  if (!initialized) {
    currentView = (style.vistaDefault && style.vistaDefault.value) || 'month';
    initialized = true;
  }
  firstDayOfWeek = parseInt((style.primeraFila && style.primeraFila.value) || '0', 10);
  showMetric = (style.mostrarMetrica && style.mostrarMetrica.value) !== false &&
               (style.mostrarMetrica && style.mostrarMetrica.value) !== 'false';

  // Reset colores
  statusColors = {};
  colorIdx = 0;

  // Parsear filas
  const rows = (data.tables && data.tables.DEFAULT) || [];
  tasks = rows
    .map(row => ({
      date:   parseDate(row.fecha   && row.fecha[0]),
      name:   (row.tarea  && row.tarea[0])  || '(sin nombre)',
      status: (row.estado && row.estado[0]) || '',
      metric: (row.metrica && row.metrica[0] !== undefined) ? row.metrica[0] : null,
    }))
    .filter(t => t.date !== null);

  // Pre-cargar colores en orden consistente
  [...new Set(tasks.map(t => t.status).filter(Boolean))].forEach(s => getStatusColor(s));

  render();
}

// ─── Render principal ────────────────────────────────────────────────────────
function render() {
  const root = document.getElementById('cal-root');
  root.innerHTML = '';

  root.appendChild(buildHeader());
  root.appendChild(currentView === 'month' ? buildMonthView() : buildWeekView());
  root.appendChild(buildLegend());
}

// ─── Header con controles ─────────────────────────────────────────────────────
function buildHeader() {
  const header = el('div', 'cal-header');

  // Izquierda: prev / hoy / next
  const left = el('div', 'cal-header-left');

  const prevBtn = el('button', 'cal-nav-btn');
  prevBtn.innerHTML = '&#8249;';
  prevBtn.title = 'Anterior';
  prevBtn.onclick = () => navigate(-1);

  const todayBtn = el('button', 'cal-today-btn');
  todayBtn.textContent = 'Hoy';
  todayBtn.onclick = () => { currentDate = new Date(); render(); };

  const nextBtn = el('button', 'cal-nav-btn');
  nextBtn.innerHTML = '&#8250;';
  nextBtn.title = 'Siguiente';
  nextBtn.onclick = () => navigate(1);

  left.appendChild(prevBtn);
  left.appendChild(todayBtn);
  left.appendChild(nextBtn);

  // Centro: título
  const center = el('div', 'cal-header-center');
  const title  = el('h2', 'cal-title');
  title.textContent = getTitle();
  center.appendChild(title);

  // Derecha: toggle mes/semana
  const toggle = el('div', 'cal-toggle');

  const monthBtn = el('button', 'cal-toggle-btn' + (currentView === 'month' ? ' active' : ''));
  monthBtn.textContent = 'Mes';
  monthBtn.onclick = () => { currentView = 'month'; render(); };

  const weekBtn = el('button', 'cal-toggle-btn' + (currentView === 'week' ? ' active' : ''));
  weekBtn.textContent = 'Semana';
  weekBtn.onclick = () => { currentView = 'week'; render(); };

  toggle.appendChild(monthBtn);
  toggle.appendChild(weekBtn);

  header.appendChild(left);
  header.appendChild(center);
  header.appendChild(toggle);

  return header;
}

function getTitle() {
  if (currentView === 'month') {
    return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }
  const ws = startOfWeek(currentDate);
  const we = addDays(ws, 6);
  const fmtOpts = { day: 'numeric', month: 'short' };
  return `${ws.toLocaleDateString('es-CO', fmtOpts)} — ${we.toLocaleDateString('es-CO', { ...fmtOpts, year: 'numeric' })}`;
}

function navigate(dir) {
  if (currentView === 'month') {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1);
  } else {
    currentDate = addDays(currentDate, dir * 7);
  }
  render();
}

// ─── Vista mensual ───────────────────────────────────────────────────────────
function buildMonthView() {
  const grid  = el('div', 'cal-month-grid');
  const today = new Date();
  const dayNames = getDayNames();

  // Cabecera de días
  dayNames.forEach(name => {
    const cell = el('div', 'cal-day-header');
    cell.textContent = name;
    grid.appendChild(cell);
  });

  // Calcular rango
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);

  let cursor = startOfWeek(monthStart);
  // Asegurar que cubra toda la cuadrícula (6 semanas máx)
  const gridEnd = addDays(startOfWeek(addDays(monthEnd, 6)), 6);

  while (cursor <= gridEnd) {
    const cell     = el('div', 'cal-day-cell');
    const isToday  = sameDay(cursor, today);
    const isOther  = cursor.getMonth() !== currentDate.getMonth();

    if (isOther)  cell.classList.add('other-month');
    if (isToday)  cell.classList.add('today');

    // Número de día
    const numEl = el('span', 'cal-day-num');
    numEl.textContent = cursor.getDate();
    cell.appendChild(numEl);

    // Tasks del día
    const dayTasks = tasksForDay(cursor);
    const MAX_VISIBLE = 3;
    dayTasks.slice(0, MAX_VISIBLE).forEach(t => {
      cell.appendChild(buildChip(t, false));
    });
    if (dayTasks.length > MAX_VISIBLE) {
      const more = el('span', 'cal-more');
      more.textContent = `+${dayTasks.length - MAX_VISIBLE} más`;
      cell.appendChild(more);
    }

    grid.appendChild(cell);
    cursor = addDays(cursor, 1);
  }

  return grid;
}

// ─── Vista semanal ───────────────────────────────────────────────────────────
function buildWeekView() {
  const container = el('div', 'cal-week-container');
  const today     = new Date();
  const ws        = startOfWeek(currentDate);
  const dayNames  = getDayNames();

  // Fila de cabeceras
  const headerRow = el('div', 'cal-week-header-row');
  for (let i = 0; i < 7; i++) {
    const day  = addDays(ws, i);
    const cell = el('div', 'cal-week-header-cell' + (sameDay(day, today) ? ' today' : ''));

    const nameEl = el('span', 'cal-week-day-name');
    nameEl.textContent = dayNames[i];

    const numEl  = el('span', 'cal-week-day-num' + (sameDay(day, today) ? ' today-circle' : ''));
    numEl.textContent = day.getDate();

    cell.appendChild(nameEl);
    cell.appendChild(numEl);
    headerRow.appendChild(cell);
  }

  // Fila de contenido
  const bodyRow = el('div', 'cal-week-body-row');
  for (let i = 0; i < 7; i++) {
    const day  = addDays(ws, i);
    const cell = el('div', 'cal-week-body-cell' + (sameDay(day, today) ? ' today' : ''));

    tasksForDay(day).forEach(t => {
      cell.appendChild(buildChip(t, true));
    });

    bodyRow.appendChild(cell);
  }

  container.appendChild(headerRow);
  container.appendChild(bodyRow);
  return container;
}

// ─── Chip de task ─────────────────────────────────────────────────────────────
function buildChip(task, full) {
  const color = getStatusColor(task.status);
  const chip  = el('div', 'cal-task-chip' + (full ? ' full' : ''));

  chip.style.borderLeftColor   = color;
  chip.style.backgroundColor   = color + '20'; // 12% opacity

  const nameEl = el('span', 'cal-task-name');
  nameEl.textContent = task.name;
  chip.appendChild(nameEl);

  if (full && task.status) {
    const badge = el('span', 'cal-task-badge');
    badge.style.backgroundColor = color;
    badge.textContent = task.status;
    chip.appendChild(badge);
  }

  if (full && showMetric && task.metric !== null && task.metric !== undefined) {
    const metEl = el('span', 'cal-task-metric');
    metEl.textContent = typeof task.metric === 'number'
      ? task.metric.toLocaleString('es-CO')
      : task.metric;
    chip.appendChild(metEl);
  }

  return chip;
}

// ─── Leyenda de estados ──────────────────────────────────────────────────────
function buildLegend() {
  const statuses = Object.keys(statusColors);
  if (statuses.length === 0) return el('div', '');

  const legend = el('div', 'cal-legend');

  statuses.forEach(status => {
    const item  = el('div', 'cal-legend-item');
    const dot   = el('span', 'cal-legend-dot');
    dot.style.backgroundColor = statusColors[status];

    const label = el('span', 'cal-legend-label');
    label.textContent = status;

    item.appendChild(dot);
    item.appendChild(label);
    legend.appendChild(item);
  });

  return legend;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function el(tag, cls) {
  const node = document.createElement(tag);
  if (cls) node.className = cls.trim();
  return node;
}

function tasksForDay(date) {
  return tasks.filter(t => sameDay(t.date, date));
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
(function init() {
  // Crear root si no existe
  if (!document.getElementById('cal-root')) {
    const root = document.createElement('div');
    root.id = 'cal-root';
    document.body.appendChild(root);
  }

  // dscc lo provee Looker Studio como global en el iframe
  if (typeof dscc !== 'undefined') {
    dscc.subscribeToData(drawViz, { transform: dscc.tableTransform });
  } else {
    // Modo dev local: renderizar con datos de ejemplo
    drawViz(SAMPLE_DATA);
  }
})();
