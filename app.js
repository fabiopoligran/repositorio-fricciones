// ── RENDER ──
const list = document.getElementById('friction-list');
const emptyState = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');

function severidadClass(s) {
  return s === 'Alta' ? 'error' : s === 'Media' ? 'warning' : 'success';
}
function severidadIcon(s) {
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
function momentoClass() { return 'brand'; }
function momentoIcon() { return 'route'; }

function buildCard(f) {
  const card = document.createElement('div');
  card.className = 'friction-card';
  card.setAttribute('role', 'listitem');
  card.dataset.id = f.id;
  card.dataset.severidad = f.severidad;
  card.dataset.momento = f.momento;
  card.dataset.estado = f.estado;
  card.dataset.search = (f.nombre + ' ' + f.plataforma + ' ' + f.momento + ' ' + f.descripcion + ' ' + f.propietario).toLowerCase();

  card.innerHTML = `
    <div class="friction-header" tabindex="0" role="button" aria-expanded="false">
      <div class="severity-bar ${f.severidad.toLowerCase()}" aria-hidden="true"></div>
      <div class="friction-meta">
        <div class="friction-top">
          <span class="friction-id">${f.id}</span>
          <span class="friction-name">${f.nombre}</span>
        </div>
        <div class="friction-tags">
          <span class="badge ${severidadClass(f.severidad)}">
            <span class="material-icons-round">${severidadIcon(f.severidad)}</span>
            ${f.severidad}
          </span>
          <span class="badge ${momentoClass()}">
            <span class="material-icons-round">${momentoIcon()}</span>
            ${f.momento}
          </span>
          <span class="badge neutral">
            <span class="material-icons-round">devices</span>
            ${f.plataforma.length > 35 ? f.plataforma.substring(0,35)+'…' : f.plataforma}
          </span>
          <span class="badge ${estadoClass(f.estado)}">
            <span class="material-icons-round">${estadoIcon(f.estado)}</span>
            ${f.estado}
          </span>
        </div>
      </div>
      <button class="friction-expand-btn" tabindex="-1" aria-hidden="true">
        <span class="material-icons-round">expand_more</span>
      </button>
    </div>
    <div class="friction-detail" role="region" aria-label="Detalle de ${f.nombre}">
      <div class="detail-grid">
        <div class="detail-section">
          <div class="detail-label"><span class="material-icons-round">description</span>Descripción</div>
          <div class="detail-value">${f.descripcion}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label"><span class="material-icons-round">person_alert</span>Impacto en el estudiante</div>
          <div class="detail-value">${f.impacto}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label"><span class="material-icons-round">lightbulb</span>Alternativa de solución</div>
          <div class="detail-value">${f.solucion}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label"><span class="material-icons-round">source</span>Fuentes que la confirman</div>
          <div class="sources-list">
            ${f.fuentes.map(s => `<div class="source-item"><span class="material-icons-round">check</span>${s}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="detail-footer">
        <div class="footer-item">
          <span class="footer-item-label">Propietario</span>
          <span class="badge neutral"><span class="material-icons-round" style="font-size:12px">manage_accounts</span>${f.propietario}</span>
        </div>
        <div class="footer-item">
          <span class="footer-item-label">Esfuerzo</span>
          <span class="badge ${esfuerzoClass(f.esfuerzo)}">${f.esfuerzo}</span>
        </div>
        <div class="footer-item" style="margin-left:auto;">
          <span class="footer-item-label">Estado</span>
          <button class="estado-btn active-${f.estado === 'Sin iniciar' ? 'sin' : f.estado === 'En curso' ? 'curso' : 'resuelta'}" data-friction-id="${f.id}" aria-label="Cambiar estado de ${f.nombre}">
            <span class="material-icons-round" style="font-size:14px">${estadoIcon(f.estado)}</span>
            ${f.estado}
          </button>
        </div>
      </div>
    </div>
  `;

  // Toggle
  const header = card.querySelector('.friction-header');
  header.addEventListener('click', () => toggleCard(card));
  header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(card); } });

  // Estado cycle
  const estadoBtn = card.querySelector('.estado-btn');
  const estados = ['Sin iniciar', 'En curso', 'Resuelta'];
  estadoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const fid = estadoBtn.dataset.frictionId;
    const fr = frictions.find(x => x.id === fid);
    const idx = estados.indexOf(fr.estado);
    fr.estado = estados[(idx + 1) % estados.length];
    card.dataset.estado = fr.estado;
    estadoBtn.className = `estado-btn active-${fr.estado === 'Sin iniciar' ? 'sin' : fr.estado === 'En curso' ? 'curso' : 'resuelta'}`;
    estadoBtn.innerHTML = `<span class="material-icons-round" style="font-size:14px">${estadoIcon(fr.estado)}</span>${fr.estado}`;
    // Update badge in header
    const badges = card.querySelectorAll('.friction-tags .badge');
    badges.forEach(b => {
      if (['Sin iniciar','En curso','Resuelta'].some(s => b.textContent.trim().includes(s))) {
        b.className = `badge ${estadoClass(fr.estado)}`;
        b.innerHTML = `<span class="material-icons-round">${estadoIcon(fr.estado)}</span>${fr.estado}`;
      }
    });
    updateStats();
  });

  return card;
}

function toggleCard(card) {
  const isOpen = card.classList.toggle('open');
  const header = card.querySelector('.friction-header');
  header.setAttribute('aria-expanded', isOpen);
}

// ── RENDER ALL ──
frictions.forEach(f => list.appendChild(buildCard(f)));

// ── FILTER ──
function applyFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const sev = document.getElementById('filter-severidad').value;
  const mom = document.getElementById('filter-momento').value;
  const est = document.getElementById('filter-estado').value;

  let visible = 0;
  document.querySelectorAll('.friction-card').forEach(card => {
    const matchQ = !q || card.dataset.search.includes(q);
    const matchS = !sev || card.dataset.severidad === sev;
    const matchM = !mom || card.dataset.momento === mom;
    const matchE = !est || card.dataset.estado === est;
    const show = matchQ && matchS && matchM && matchE;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  resultsCount.textContent = `${visible} fricción${visible !== 1 ? 'es' : ''}`;
  emptyState.classList.toggle('visible', visible === 0);
}

function updateStats() {
  const alta = frictions.filter(f => f.severidad === 'Alta').length;
  const sinIniciar = frictions.filter(f => f.estado === 'Sin iniciar').length;
  const enCurso = frictions.filter(f => f.estado === 'En curso').length;
  document.getElementById('stat-total').textContent = frictions.length;
  document.getElementById('stat-alta').textContent = alta;
  document.getElementById('stat-sin-iniciar').textContent = sinIniciar;
  document.getElementById('stat-en-curso').textContent = enCurso;
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('filter-severidad').addEventListener('change', applyFilters);
document.getElementById('filter-momento').addEventListener('change', applyFilters);
document.getElementById('filter-estado').addEventListener('change', applyFilters);

applyFilters();
updateStats();
