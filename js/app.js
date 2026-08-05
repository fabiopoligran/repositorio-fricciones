const list = document.getElementById('friction-list');
const emptyState = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');
const activeFilters = document.getElementById('active-filters');
const clearFiltersBtn = document.getElementById('clear-filters');

// Bucket de esfuerzo usado para agrupar valores similares en filtros/orden.
const esfuerzoBucketRank = { 'Bajo': 1, 'Medio': 2, 'Alto': 3, 'Por definir': 0 };
const esfuerzoSortRank = { 'Bajo': 1, 'Medio': 2, 'Medio - Alto': 2.5, 'Alto': 3, 'Muy alto': 4 };

// Filtro rápido activo desde las tarjetas de estadísticas (no está ligado a un <select>).
let quickFilter = null; // null | 'esfuerzo-alto' | 'sin-fuentes' | 'sin-prioridad'

function esfuerzoGroup(e) {
  if (e === 'Alto' || e === 'Muy alto') return 'Alto';
  if (e === 'Medio' || e === 'Medio - Alto') return 'Medio';
  if (e === 'Bajo') return 'Bajo';
  return 'Por definir';
}
function esfuerzoClass(e) {
  const grupo = esfuerzoGroup(e);
  return grupo === 'Alto' ? 'error' : grupo === 'Medio' ? 'warning' : grupo === 'Bajo' ? 'success' : 'neutral';
}
// Agrupa el índice de prioridad (1 = más urgente, 24 = menos urgente) en 4 bloques,
// espejo del "Bloque de prioridad" (Crítico/Alto/Medio/Bajo) usado en el análisis fuente.
function prioridadGroup(p) {
  const n = Number(p);
  if (!p || Number.isNaN(n)) return 'Por definir';
  if (n <= 6) return 'Crítico';
  if (n <= 12) return 'Alto';
  if (n <= 18) return 'Medio';
  return 'Bajo';
}
function prioridadClass(p) {
  const grupo = prioridadGroup(p);
  return grupo === 'Crítico' ? 'error' : grupo === 'Alto' ? 'warning' : grupo === 'Medio' ? 'brand' : grupo === 'Bajo' ? 'success' : 'neutral';
}
function momentoGroup(m) {
  return m.split(' (')[0];
}
function estadoClass(e) {
  if (e === 'Confirmado') return 'success';
  if (e === 'En validación' || e === 'Por confirmar') return 'warning';
  if (e === 'Descartado') return 'neutral';
  return 'brand';
}
function estadoIcon(e) {
  if (e === 'Confirmado') return 'verified';
  if (e === 'En validación' || e === 'Por confirmar') return 'timelapse';
  if (e === 'Descartado') return 'block';
  return 'info';
}
function compareById(a, b) {
  return Number(a.id.replace('INS-', '')) - Number(b.id.replace('INS-', ''));
}

function sizeSelectToContent(select) {
  if (!sizeSelectToContent.canvas) sizeSelectToContent.canvas = document.createElement('canvas');
  const ctx = sizeSelectToContent.canvas.getContext('2d');
  const style = getComputedStyle(select);
  ctx.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
  const text = select.options[select.selectedIndex].text;
  const textWidth = ctx.measureText(text).width;
  const rightSpace = 26; // debe coincidir con el padding-right de .filter-select-plain
  const safetyMargin = 4; // evita recortes si la fuente aún no cargó al medir
  select.style.width = Math.ceil(textWidth) + rightSpace + safetyMargin + 'px';
}

function sizeAllSelects() {
  document.querySelectorAll('.filter-select-plain').forEach(sizeSelectToContent);
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(function(a, b) { return a.localeCompare(b, 'es'); });
}

function populateFilterOptions() {
  const temaSelect = document.getElementById('filter-tema');
  const momentoSelect = document.getElementById('filter-momento');
  const estadoSelect = document.getElementById('filter-estado');

  uniqueSorted(insights.map(function(f) { return f.tema; })).forEach(function(v) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    temaSelect.appendChild(opt);
  });

  uniqueSorted(insights.map(function(f) { return momentoGroup(f.momento); })).forEach(function(v) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    momentoSelect.appendChild(opt);
  });

  uniqueSorted(insights.map(function(f) { return f.estado; })).forEach(function(v) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    estadoSelect.appendChild(opt);
  });
}

function buildCard(f) {
  const card = document.createElement('article');
  card.className = 'friction-card';
  card.setAttribute('role', 'listitem');
  card.dataset.id = f.id;
  card.dataset.tema = f.tema;
  card.dataset.momentoGroup = momentoGroup(f.momento);
  card.dataset.estado = f.estado;
  card.dataset.esfuerzoGroup = esfuerzoGroup(f.esfuerzo);
  card.dataset.fuentes = f.fuentes ? 'con' : 'sin';
  card.dataset.prioridad = f.prioridad ? 'con' : 'sin';
  card.dataset.search = (f.nombre + ' ' + f.tema + ' ' + f.momento + ' ' + f.descripcion + ' ' + f.propietario).toLowerCase();

  const fuentesHtml = f.fuentes
    ? '<div class="detail-value">' + f.fuentes + '</div>'
    : '<div class="detail-value" style="color:var(--pds-color-neutral-500);font-style:italic;">Fuentes de evidencia por documentar.</div>';

  card.innerHTML = '' +
    '<div class="friction-header" tabindex="0" role="button" aria-expanded="false">' +
      '<div class="friction-meta">' +
        '<div class="friction-top">' +
          '<div class="insight-category">' +
              '<span class="material-icons-round">insights</span>' +
              f.tipo +
          '</div>' +
          '<h3 class="friction-name">' + f.nombre + '</h3>' +
          '<span class="friction-id">' +
              f.id + ' · ' + f.momento +
          '</span>' +
        '</div>' +
        '<div class="friction-tags">' +
          '<span class="badge ' + prioridadClass(f.prioridad) + '"><span class="material-icons-round">flag</span>Prioridad ' + (f.prioridad ? '#' + f.prioridad : 'por definir') + '</span>' +
          '<span class="badge brand"><span class="material-icons-round">sell</span>' + f.tema + '</span>' +
          '<span class="badge neutral"><span class="material-icons-round">route</span>' + momentoGroup(f.momento) + '</span>' +
          '<span class="badge ' + estadoClass(f.estado) + '">' +
            '<span class="material-icons-round">' + estadoIcon(f.estado) + '</span>' +
            f.estado +
          '</span>' +
        '</div>' +
      '</div>' +
      '<button class="friction-expand-btn" tabindex="-1" aria-hidden="true"><span class="material-icons-round">expand_more</span></button>' +
    '</div>' +
    '<div class="friction-detail" role="region" aria-label="Detalle de ' + f.nombre + '">' +
      '<div class="detail-grid">' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">description</span>Qué ocurre</div><div class="detail-value">' + f.descripcion + '</div></div>' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">person_alert</span>Impacto en el estudiante</div><div class="detail-value">' + f.impacto + '</div></div>' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">lightbulb</span>Alternativas de solución</div><div class="detail-value">' + f.solucion + '</div></div>' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">source</span>Fuentes de evidencia</div>' + fuentesHtml + '</div>' +
      '</div>' +
      '<div class="detail-footer">' +
        '<div class="footer-item"><span class="footer-item-label">Responsable</span><span class="badge neutral"><span class="material-icons-round" style="font-size:12px">business</span>' + f.propietario + '</span></div>' +
        '<div class="footer-item"><span class="footer-item-label">Esfuerzo estimado</span><span class="badge ' + esfuerzoClass(f.esfuerzo) + '">' + f.esfuerzo + '</span></div>' +
      '</div>' +
    '</div>';

  const header = card.querySelector('.friction-header');
  header.addEventListener('click', function() { toggleCard(card); });
  header.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard(card);
    }
  });

  return card;
}

function toggleCard(card) {
  const isOpen = card.classList.toggle('open');
  card.querySelector('.friction-header').setAttribute('aria-expanded', isOpen);
}

function getSortedFrictions() {
  const sortBy = document.getElementById('sort-by').value;
  const sorted = insights.slice();
  sorted.sort(function(a, b) {
    if (sortBy === 'tema') return a.tema.localeCompare(b.tema, 'es') || compareById(a, b);
    if (sortBy === 'momento') return a.momento.localeCompare(b.momento, 'es') || compareById(a, b);
    if (sortBy === 'esfuerzo') return (esfuerzoSortRank[b.esfuerzo] || 0) - (esfuerzoSortRank[a.esfuerzo] || 0) || compareById(a, b);
    if (sortBy === 'prioridad') return (Number(a.prioridad) || 999) - (Number(b.prioridad) || 999) || compareById(a, b);
    return compareById(a, b);
  });
  return sorted;
}

function renderCards() {
  list.innerHTML = '';
  getSortedFrictions().forEach(function(f) { list.appendChild(buildCard(f)); });
}

function quickFilterLabel() {
  if (quickFilter === 'esfuerzo-alto') return 'Esfuerzo: Alto';
  if (quickFilter === 'sin-fuentes') return 'Fuentes: pendientes de documentar';
  if (quickFilter === 'sin-prioridad') return 'Prioridad: pendiente de asignar';
  return '';
}

function updateActiveFilters() {
  const activeFilters = document.getElementById('active-filters');

  const q = document.getElementById('search').value.trim();
  const tema = document.getElementById('filter-tema').value;
  const mom = document.getElementById('filter-momento').value;
  const est = document.getElementById('filter-estado').value;

  const chips = [];

  if (q) chips.push({ type: 'search', label: 'Búsqueda: "' + q + '"' });
  if (tema) chips.push({ type: 'tema', label: 'Tema: ' + tema });
  if (mom) chips.push({ type: 'momento', label: 'Momento: ' + mom });
  if (est) chips.push({ type: 'estado', label: 'Estado: ' + est });
  if (quickFilter) chips.push({ type: 'quick', label: quickFilterLabel() });

  activeFilters.innerHTML = chips.length
    ? '<span class="filter-group-title">Filtrando por:</span>' + chips.map(function(chip) {
        return '<span class="filter-chip">' +
          chip.label +
          '<button type="button" class="filter-chip-remove" data-filter-type="' + chip.type + '" aria-label="Quitar filtro">' +
            '<span class="material-icons-round">close</span>' +
          '</button>' +
        '</span>';
      }).join('')
    : '<span class="filter-empty">Sin filtros aplicados</span>';

  clearFiltersBtn.disabled = chips.length === 0;

  activeFilters.querySelectorAll('.filter-chip-remove').forEach(function(btn) {
    btn.addEventListener('click', function() {
      removeFilter(btn.dataset.filterType);
    });
  });
}

function removeFilter(type) {
  if (type === 'search') document.getElementById('search').value = '';
  if (type === 'tema') document.getElementById('filter-tema').value = '';
  if (type === 'momento') document.getElementById('filter-momento').value = '';
  if (type === 'estado') document.getElementById('filter-estado').value = '';
  if (type === 'quick') quickFilter = null;
  applyFilters();
}

function applyFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const tema = document.getElementById('filter-tema').value;
  const mom = document.getElementById('filter-momento').value;
  const est = document.getElementById('filter-estado').value;

  let visible = 0;
  document.querySelectorAll('.friction-card').forEach(function(card) {
    const matchQ = !q || card.dataset.search.includes(q);
    const matchTema = !tema || card.dataset.tema === tema;
    const matchMom = !mom || card.dataset.momentoGroup === mom;
    const matchEst = !est || card.dataset.estado === est;
    const matchQuick = !quickFilter ||
      (quickFilter === 'esfuerzo-alto' && card.dataset.esfuerzoGroup === 'Alto') ||
      (quickFilter === 'sin-fuentes' && card.dataset.fuentes === 'sin') ||
      (quickFilter === 'sin-prioridad' && card.dataset.prioridad === 'sin');
    const show = matchQ && matchTema && matchMom && matchEst && matchQuick;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  resultsCount.textContent = 'Mostrando ' + visible + ' de ' + insights.length + ' insight' + (insights.length !== 1 ? 's' : '');
  emptyState.classList.toggle('visible', visible === 0);
  updateActiveFilters();
}

function updateStats() {
  const esfuerzoAlto = insights.filter(function(f) { return esfuerzoGroup(f.esfuerzo) === 'Alto'; }).length;
  const sinFuentes = insights.filter(function(f) { return !f.fuentes; }).length;
  const sinPrioridad = insights.filter(function(f) { return !f.prioridad; }).length;
  document.getElementById('stat-total').textContent = insights.length;
  document.getElementById('stat-esfuerzo-alto').textContent = esfuerzoAlto;
  document.getElementById('stat-sin-fuentes').textContent = sinFuentes;
  document.getElementById('stat-sin-prioridad').textContent = sinPrioridad;
}

function clearFilters() {
  document.getElementById('search').value = '';
  document.getElementById('filter-tema').value = '';
  document.getElementById('filter-momento').value = '';
  document.getElementById('filter-estado').value = '';
  quickFilter = null;
  sizeAllSelects();
  applyFilters();
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('filter-tema').addEventListener('change', function() {
  sizeSelectToContent(this);
  applyFilters();
});
document.getElementById('filter-momento').addEventListener('change', function() {
  sizeSelectToContent(this);
  applyFilters();
});
document.getElementById('filter-estado').addEventListener('change', function() {
  sizeSelectToContent(this);
  applyFilters();
});
document.getElementById('sort-by').addEventListener('change', function() {
  sizeSelectToContent(this);
  renderCards();
  applyFilters();
});
clearFiltersBtn.addEventListener('click', clearFilters);

document.querySelectorAll('[data-quick-filter]').forEach(function(card) {
  card.addEventListener('click', function() {
    const filter = card.dataset.quickFilter;
    clearFilters();
    if (filter !== 'all') quickFilter = filter;
    applyFilters();
    document.getElementById('repository').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const aboutTrigger = document.getElementById("aboutTrigger");
const aboutModal = document.getElementById("aboutModal");
const closeModal = document.getElementById("closeModal");

aboutTrigger.addEventListener("click", () => {
    aboutModal.classList.add("open");
});

closeModal.addEventListener("click", () => {
    aboutModal.classList.remove("open");
});

aboutModal.addEventListener("click", (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.remove("open");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        aboutModal.classList.remove("open");
    }
});

populateFilterOptions();
renderCards();
applyFilters();
updateStats();
sizeAllSelects();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(sizeAllSelects);
}
