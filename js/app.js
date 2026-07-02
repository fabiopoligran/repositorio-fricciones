const list = document.getElementById('friction-list');
const emptyState = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');
const activeFilters = document.getElementById('active-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const impactRank = { Alta: 3, Media: 2, Baja: 1 };
const statusRank = { 'Sin iniciar': 1, 'En curso': 2, Resuelta: 3 };
const impactLabels = { Alta: 'Alto', Media: 'Medio', Baja: 'Bajo' };
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



function nivelImpactoClass(s) {
  return s === 'Alta' ? 'error' : s === 'Media' ? 'warning' : 'success';
}
function nivelImpactoIcon(s) {
  return s === 'Alta' ? 'error' : s === 'Media' ? 'warning' : 'check_circle';
}
function estadoClass(e) {
  if (e === 'Sin iniciar') return 'neutral';
  if (e === 'En curso') return 'warning';
  return 'success';
}
function estadoIcon(e) {
  if (e === 'Sin iniciar') return 'radio_button_unchecked';
  if (e === 'En curso') return 'timelapse';
  return 'check_circle';
}
function esfuerzoClass(e) {
  return e === 'Alto' ? 'error' : e === 'Medio' ? 'warning' : 'success';
}
function compareById(a, b) {
  return Number(a.id.replace('F-', '')) - Number(b.id.replace('F-', ''));
}
function shortPlatform(platform) {
  return platform.length > 35 ? platform.substring(0, 35) + '...' : platform;
}

function buildCard(f) {
  const card = document.createElement('article');
  card.className = 'friction-card';
  card.setAttribute('role', 'listitem');
  card.dataset.id = f.id;
  card.dataset.severidad = f.severidad;
  card.dataset.momento = f.momento;
  card.dataset.estado = f.estado;
  card.dataset.search = (f.nombre + ' ' + f.plataforma + ' ' + f.momento + ' ' + f.descripcion + ' ' + f.propietario).toLowerCase();

  const sources = f.fuentes.map(function(s) {
    return '<div class="source-item"><span class="material-icons-round">check</span>' + s + '</div>';
  }).join('');

  const insightTypes = {
  friccion: {
    label: 'Fricción',
    icon: 'warning',
    class: 'type-friccion'
  },
  fortaleza: {
    label: 'Fortaleza',
    icon: 'verified'
  },
  oportunidad: {
    label: 'Oportunidad',
    icon: 'lightbulb'
  },
  riesgo: {
    label: 'Riesgo',
    icon: 'priority_high'
  },
  tendencia: {
    label: 'Tendencia',
    icon: 'trending_up'
  }
};

const type = insightTypes[f.tipo] || insightTypes.friccion;

  card.innerHTML = '' +
    '<div class="friction-header" tabindex="0" role="button" aria-expanded="false">' +
      
      '<div class="friction-meta">' +
        '<div class="friction-top">' +

          '<div class="insight-category ' + type.class + '">' +
              '<span class="material-icons-round">' + type.icon + '</span>' +
              type.label +
          '</div>' +

          '<h3 class="friction-name">' + f.nombre + '</h3>' +

          '<span class="friction-id">' +
              f.id + ' · ' + f.momento +
          '</span>' +


        '</div>' +

        '<div class="friction-tags">' +
          '<span class="badge ' + nivelImpactoClass(f.severidad) + '">' +
            '<span class="material-icons-round">' + nivelImpactoIcon(f.severidad) + '</span>' +
            'Impacto ' + impactLabels[f.severidad].toLowerCase() +
          '</span>' +
          '<span class="badge brand"><span class="material-icons-round">route</span>' + f.momento + '</span>' +
          
          '<span class="badge ' + estadoClass(f.estado) + ' status-badge">' +
            '<span class="material-icons-round">' + estadoIcon(f.estado) + '</span>' +
            'Solución: ' + f.estado +
          '</span>' +
        '</div>' +
      '</div>' +
      '<button class="friction-expand-btn" tabindex="-1" aria-hidden="true"><span class="material-icons-round">expand_more</span></button>' +
    '</div>' +
    '<div class="friction-detail" role="region" aria-label="Detalle de ' + f.nombre + '">' +
      '<div class="detail-grid">' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">description</span>Qué ocurre</div><div class="detail-value">' + f.descripcion + '</div></div>' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">person_alert</span>Impacto en el estudiante</div><div class="detail-value">' + f.impacto + '</div></div>' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">lightbulb</span>Alternativa de solución</div><div class="detail-value">' + f.solucion + '</div></div>' +
        '<div class="detail-section"><div class="detail-label"><span class="material-icons-round">source</span>Fuentes de evidencia</div><div class="sources-list">' + sources + '</div></div>' +
      '</div>' +
      '<div class="detail-footer">' +
        '<div class="footer-item"><span class="footer-item-label">Responsable</span><span class="badge neutral"><span class="material-icons-round" style="font-size:12px">business</span>' + f.propietario + '</span></div>' +
        '<div class="footer-item"><span class="footer-item-label">Esfuerzo estimado</span><span class="badge ' + esfuerzoClass(f.esfuerzo) + '">' + f.esfuerzo + '</span></div>' +
        '<div class="footer-item status-control"><span class="footer-item-label">Estado de la iniciativa</span>' +
          '<button class="estado-btn active-' + (f.estado === 'Sin iniciar' ? 'sin' : f.estado === 'En curso' ? 'curso' : 'resuelta') + '" data-friction-id="' + f.id + '" aria-label="Cambiar avance de solución de ' + f.nombre + '">' +
            '<span class="material-icons-round" style="font-size:14px">' + estadoIcon(f.estado) + '</span>' + f.estado +
          '</button>' +
        '</div>' +
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

  const estadoBtn = card.querySelector('.estado-btn');
  const estados = ['Sin iniciar', 'En curso', 'Resuelta'];
  estadoBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const fr = frictions.find(function(x) { return x.id === estadoBtn.dataset.frictionId; });
    const idx = estados.indexOf(fr.estado);
    fr.estado = estados[(idx + 1) % estados.length];
    updateCardStatus(card, fr, estadoBtn);
    updateStats();
    applyFilters();
  });

  return card;
}

function updateCardStatus(card, fr, estadoBtn) {
  card.dataset.estado = fr.estado;
  estadoBtn.className = 'estado-btn active-' + (fr.estado === 'Sin iniciar' ? 'sin' : fr.estado === 'En curso' ? 'curso' : 'resuelta');
  estadoBtn.innerHTML = '<span class="material-icons-round" style="font-size:14px">' + estadoIcon(fr.estado) + '</span>' + fr.estado;
  const statusBadge = card.querySelector('.status-badge');
  statusBadge.className = 'badge ' + estadoClass(fr.estado) + ' status-badge';
  statusBadge.innerHTML = '<span class="material-icons-round">' + estadoIcon(fr.estado) + '</span>Solución: ' + fr.estado;
}

function toggleCard(card) {
  const isOpen = card.classList.toggle('open');
  card.querySelector('.friction-header').setAttribute('aria-expanded', isOpen);
}

function getSortedFrictions() {
  const sortBy = document.getElementById('sort-by').value;
  const sorted = frictions.slice();
  sorted.sort(function(a, b) {
    if (sortBy === 'impacto') return impactRank[b.severidad] - impactRank[a.severidad] || compareById(a, b);
    if (sortBy === 'etapa') return a.momento.localeCompare(b.momento, 'es') || compareById(a, b);
    if (sortBy === 'avance') return statusRank[a.estado] - statusRank[b.estado] || compareById(a, b);
    return compareById(a, b);
  });
  return sorted;
}

function renderCards() {
  list.innerHTML = '';
  getSortedFrictions().forEach(function(f) { list.appendChild(buildCard(f)); });
}

function updateActiveFilters() {
  const activeFilters = document.getElementById('active-filters');

  const q = document.getElementById('search').value.trim();
  const sev = document.getElementById('filter-severidad').value;
  const mom = document.getElementById('filter-momento').value;
  const est = document.getElementById('filter-estado').value;

  const chips = [];

  if (q) chips.push({ type: 'search', label: 'Búsqueda: "' + q + '"' });
  if (sev) chips.push({ type: 'severidad', label: 'Impacto: ' + impactLabels[sev] });
  if (mom) chips.push({ type: 'momento', label: 'Etapa: ' + mom });
  if (est) chips.push({ type: 'estado', label: 'Solución: ' + est });

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
  if (type === 'severidad') document.getElementById('filter-severidad').value = '';
  if (type === 'momento') document.getElementById('filter-momento').value = '';
  if (type === 'estado') document.getElementById('filter-estado').value = '';
  applyFilters();
}



function applyFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const sev = document.getElementById('filter-severidad').value;
  const mom = document.getElementById('filter-momento').value;
  const est = document.getElementById('filter-estado').value;

  let visible = 0;
  document.querySelectorAll('.friction-card').forEach(function(card) {
    const matchQ = !q || card.dataset.search.includes(q);
    const matchS = !sev || card.dataset.severidad === sev;
    const matchM = !mom || card.dataset.momento === mom;
    const matchE = !est || card.dataset.estado === est;
    const show = matchQ && matchS && matchM && matchE;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  resultsCount.textContent = 'Mostrando ' + visible + ' de ' + frictions.length + ' insight' + (frictions.length !== 1 ? 's' : '');
  emptyState.classList.toggle('visible', visible === 0);
  updateActiveFilters();
}

function updateStats() {
  const alta = frictions.filter(function(f) { return f.severidad === 'Alta'; }).length;
  const sinIniciar = frictions.filter(function(f) { return f.estado === 'Sin iniciar'; }).length;
  const enCurso = frictions.filter(function(f) { return f.estado === 'En curso'; }).length;
  document.getElementById('stat-total').textContent = frictions.length;
  document.getElementById('stat-alta').textContent = alta;
  document.getElementById('stat-sin-iniciar').textContent = sinIniciar;
  document.getElementById('stat-en-curso').textContent = enCurso;
}

function clearFilters() {
  document.getElementById('search').value = '';
  document.getElementById('filter-severidad').value = '';
  document.getElementById('filter-momento').value = '';
  document.getElementById('filter-estado').value = '';
  sizeAllSelects();
  applyFilters();
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('filter-severidad').addEventListener('change', function() {
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
    clearFilters();
    const quickFilter = card.dataset.quickFilter;
    if (quickFilter === 'impacto-alto') document.getElementById('filter-severidad').value = 'Alta';
    if (quickFilter === 'sin-iniciar') document.getElementById('filter-estado').value = 'Sin iniciar';
    if (quickFilter === 'en-curso') document.getElementById('filter-estado').value = 'En curso';
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

renderCards();
applyFilters();
updateStats();
sizeAllSelects();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(sizeAllSelects);
}
