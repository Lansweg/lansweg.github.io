/* ============================================================
   MOBILITÉ LITTORAL & SAM — Application JS
   Version production — Supabase intégré
   ============================================================ */
'use strict';

// ============================================================
// HELPER
// ============================================================
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  mapboxToken:   'pk.eyJ1IjoibGFuc3dlZyIsImEiOiJjbXBkaHJ6ZTYwMzQ2MnRzZTBtb25nYXl5In0._V1wF9WwBfZnxdemWuWbUQ',
  supabaseUrl:   'https://rixsenvshgconhvgevix.supabase.co',
  supabaseKey:   'sb_publishable_9DbMPtt6ZwzQ21-ADtyB2w_V0VKAw9N',
  tarifBase:     parseFloat(localStorage.getItem('ml_tarif_base'))  || 0.55,
  tarifSuppl:    parseFloat(localStorage.getItem('ml_tarif_suppl')) || 0.20,
  prixCarburant: parseFloat(localStorage.getItem('ml_carburant'))   || 2.30,
  consommation:  parseFloat(localStorage.getItem('ml_conso'))       || 7.5,
};

// ============================================================
// SUPABASE
// ============================================================
let SB = null;

function initSupabase() {
  if (window.supabase && CONFIG.supabaseUrl && CONFIG.supabaseKey) {
    SB = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    console.log('✅ Supabase connecté');
  }
}

// ============================================================
// MAP
// ============================================================
let map, markers = [], routeAdded = false;

function initMap() {
  mapboxgl.accessToken = CONFIG.mapboxToken;
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-1.1511, 46.1603],
    zoom: 12,
    attributionControl: false,
  });
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true,
  }), 'bottom-right');
  map.on('load', () => console.log('🗺️ Carte chargée'));
}

function clearMarkers() { markers.forEach(m => m.remove()); markers = []; }

function clearRoute() {
  if (map.getLayer('route')) map.removeLayer('route');
  if (map.getSource('route')) map.removeSource('route');
}

async function geocodeAddress(addr) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?country=fr&access_token=${CONFIG.mapboxToken}`;
  const res  = await fetch(url);
  const data = await res.json();
  return data.features?.[0]?.center || null;
}

async function calculateRoute(depAddr, arrAddr) {
  showProgress(true);
  try {
    const [dep, arr] = await Promise.all([geocodeAddress(depAddr), geocodeAddress(arrAddr)]);
    if (!dep || !arr) { showToast('❌ Adresse introuvable.'); showProgress(false); return null; }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${dep[0]},${dep[1]};${arr[0]},${arr[1]}?geometries=geojson&overview=full&access_token=${CONFIG.mapboxToken}`;
    const data = await (await fetch(url)).json();

    if (!data.routes?.length) { showToast('❌ Trajet introuvable.'); showProgress(false); return null; }

    const route = data.routes[0];
    const km    = parseFloat((route.distance / 1000).toFixed(1));
    const min   = Math.round(route.duration / 60);

    clearMarkers(); clearRoute();
    markers.push(
      new mapboxgl.Marker({ color: '#34C759' }).setLngLat(dep).addTo(map),
      new mapboxgl.Marker({ color: '#FF3B30' }).setLngLat(arr).addTo(map)
    );

    map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: route.geometry } });
    map.addLayer({ id: 'route', type: 'line', source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#0071E3', 'line-width': 5, 'line-opacity': 0.85 }
    });

    const bounds = new mapboxgl.LngLatBounds();
    route.geometry.coordinates.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: { top: 80, bottom: 200, left: 40, right: 40 }, duration: 1000 });

    showProgress(false);
    return { km, min };
  } catch (err) {
    console.error(err);
    showToast('❌ Erreur calcul trajet.');
    showProgress(false);
    return null;
  }
}

// ============================================================
// PRIX
// ============================================================
let currentRoute = null;

function calcPrix(km) {
  const tarifTotal = CONFIG.tarifBase + CONFIG.tarifSuppl;
  return {
    tarifTotal,
    prixBenef: (km * tarifTotal).toFixed(2),
    prixEss:   ((km * CONFIG.consommation / 100) * CONFIG.prixCarburant).toFixed(2),
  };
}

function displayRouteResult(km, min) {
  const { tarifTotal, prixBenef, prixEss } = calcPrix(km);
  qs('#rcKm').textContent       = km;
  qs('#rcTemps').textContent    = min;
  qs('#rcPrixBenef').textContent = prixBenef + ' €';
  qs('#rcEssence').textContent   = prixEss   + ' €';
  qs('#tarifDetail').innerHTML   = `
    <strong>Détail :</strong> ${CONFIG.tarifBase.toFixed(2)} €/km + ${CONFIG.tarifSuppl.toFixed(2)} €/km suppl.
    = <strong>${tarifTotal.toFixed(2)} €/km</strong><br>
    Essence : ${CONFIG.prixCarburant.toFixed(2)} €/L × ${CONFIG.consommation} L/100km × ${km} km
  `;
  qs('#routeResult').style.display = 'block';
  currentRoute = { km, min, prixBenef, prixEss };
}

// ============================================================
// TICKET PDF
// ============================================================
function generateTicket() {
  if (!currentRoute) { showToast('Calculez d\'abord un trajet.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });

  const nom   = qs('#beneficiaireName').value || 'Bénéficiaire';
  const dep   = qs('#addrDepart').value  || '—';
  const arr   = qs('#addrArrivee').value || '—';
  const date  = qs('#dateHeure').value   || new Date().toLocaleString('fr-FR');
  const notes = qs('#courseNotes').value || '';
  const benv  = qs('#benevoleSelect').selectedOptions[0]?.text || '—';
  const type  = qs('.pill.active[data-type]')?.dataset.type || 'course';
  const { km, min, prixBenef, prixEss } = currentRoute;

  doc.setFillColor(0, 113, 227);
  doc.rect(0, 0, 148, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('Mobilité Littoral & SAM', 10, 12);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Ticket de course', 10, 20);
  doc.text(`N° ${Date.now().toString().slice(-6)}`, 118, 12);

  doc.setTextColor(28,28,30); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Informations', 10, 36);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);

  const rows = [
    ['Personne transportée', nom],
    ['Type', type.charAt(0).toUpperCase() + type.slice(1)],
    ['Bénévole', benv],
    ['Date / Heure', date],
    ['Départ', dep],
    ['Arrivée', arr],
  ];
  if (notes) rows.push(['Notes', notes]);

  let y = 44;
  rows.forEach(([label, val]) => {
    doc.setTextColor(100,100,100); doc.text(label + ' :', 10, y);
    doc.setTextColor(28,28,30);   doc.text(String(val), 55, y, { maxWidth: 85 });
    y += String(val).length > 40 ? 10 : 8;
  });

  y += 4; doc.setDrawColor(200,200,200); doc.line(10, y, 138, y); y += 8;
  doc.setFont('helvetica','bold'); doc.setFontSize(11);
  doc.text('Résumé du trajet', 10, y); y += 10;

  const cards = [
    { label:'Distance', val: km + ' km' },
    { label:'Durée',    val: min + ' min' },
    { label:'Tarif bénéficiaire', val: prixBenef + ' €' },
    { label:'Coût essence estimé', val: prixEss + ' €' },
  ];
  cards.forEach((c, i) => {
    const x = 10 + (i % 2) * 65, yy = y + Math.floor(i / 2) * 24;
    doc.setFillColor(245,247,250); doc.roundedRect(x, yy - 6, 58, 20, 3, 3, 'F');
    doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(c.label, x + 5, yy + 1);
    doc.setTextColor(0,113,227); doc.setFont('helvetica','bold'); doc.setFontSize(13);
    doc.text(c.val, x + 5, yy + 10);
  });
  y += 56;
  doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text(`Tarif : ${CONFIG.tarifBase}€/km + ${CONFIG.tarifSuppl}€/km = ${(CONFIG.tarifBase+CONFIG.tarifSuppl).toFixed(2)}€/km`, 10, y);
  y += 6; doc.text(`Carburant : ${CONFIG.prixCarburant}€/L × ${CONFIG.consommation}L/100km`, 10, y);
  doc.setFillColor(245,247,250); doc.rect(0, 195, 148, 15, 'F');
  doc.setTextColor(150,150,150); doc.setFontSize(8);
  doc.text('Mobilité Littoral & SAM — Association loi 1901', 10, 203);
  doc.text(new Date().toLocaleDateString('fr-FR'), 120, 203);
  doc.save(`ticket-${nom.replace(/ /g,'_')}-${Date.now().toString().slice(-6)}.pdf`);
  showToast('🎫 Ticket PDF généré !');
}

// ============================================================
// COURSES — CRUD Supabase
// ============================================================
async function loadCourses(filtre = 'actives') {
  if (!SB) return [];
  try {
    let query = SB.from('courses').select('*').order('created_at', { ascending: false });
    if (filtre === 'actives') query = query.in('statut', ['attente', 'en-cours']);
    if (filtre === 'semaine') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      query = query.gte('created_at', d.toISOString());
    }
    if (filtre === 'mois') {
      const d = new Date(); d.setDate(1); d.setHours(0,0,0,0);
      query = query.gte('created_at', d.toISOString());
    }
    if (filtre === 'sam') query = query.eq('type', 'sam');
    if (filtre === 'tout') {}
    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data || [];
  } catch (err) { console.error(err); return []; }
}

async function saveCourse(courseData) {
  if (!SB) { showToast('⚠️ Supabase non connecté.'); return false; }
  try {
    const { error } = await SB.from('courses').insert([courseData]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(err);
    if (err?.code === 'PGRST205' || err?.message?.includes('schema cache') || err?.message?.includes('relation')) {
      qs('#sqlContent').textContent = SQL_SETUP;
      qs('#modalSQL').style.display = 'flex';
      showToast('⚠️ Table manquante — SQL prêt à copier !', 4000);
    } else {
      showToast('❌ Erreur Supabase : ' + (err.message || 'inconnue'));
    }
    return false;
  }
}

async function updateCourseStatut(id, statut) {
  if (!SB) return;
  await SB.from('courses').update({ statut }).eq('id', id);
}

// ============================================================
// BÉNÉVOLES — CRUD Supabase
// ============================================================
async function loadBenevoles() {
  if (!SB) return [];
  try {
    const { data, error } = await SB.from('benevoles').select('*').order('nom');
    if (error) throw error;
    return data || [];
  } catch (err) { console.error(err); return []; }
}

async function populateBenevoleSelect() {
  const benevoles = await loadBenevoles();
  const sel = qs('#benevoleSelect');
  sel.innerHTML = '<option value="">— Choisir un bénévole —</option>';
  benevoles.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.nom + (b.statut === 'occupe' ? ' (en course)' : '');
    sel.appendChild(opt);
  });
}

// ============================================================
// STATS — Supabase
// ============================================================
async function loadStats() {
  if (!SB) return;
  try {
    const debut = new Date(); debut.setDate(1); debut.setHours(0,0,0,0);

    const { data } = await SB.from('courses')
      .select('*')
      .gte('created_at', debut.toISOString());

    if (!data) return;

    const total   = data.length;
    const kmTotal = data.reduce((s, c) => s + (parseFloat(c.km) || 0), 0);
    const benefs  = new Set(data.map(c => c.nom)).size;
    const sam     = data.filter(c => c.type === 'sam').length;
    const recettes = data.reduce((s, c) => s + (parseFloat(c.prix_benef) || 0), 0);
    const essence  = data.reduce((s, c) => s + (parseFloat(c.cout_essence) || 0), 0);

    qs('#statTotalCourses').textContent = total;
    qs('#statTotalKm').textContent      = Math.round(kmTotal).toLocaleString('fr-FR');
    qs('#statTotalBenef').textContent   = benefs;
    qs('#statSAM').textContent          = sam;
    qs('#statRecettes').textContent     = recettes.toFixed(2) + ' €';
    qs('#statEssence').textContent      = '−' + essence.toFixed(2) + ' €';
  } catch (err) { console.error(err); }
}

// ============================================================
// RENDER
// ============================================================
function typeIcon(t) {
  return { courses:'🛒', medical:'🏥', vacances:'🌴', sam:'🍺', beneficiaire:'🚗', prive:'🚗' }[t] || '🚗';
}
function typeLabel(t) {
  return { courses:'Courses', medical:'Médical', vacances:'Vacances', sam:'SAM', beneficiaire:'Privé' }[t] || t;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

async function renderCourses() {
  const list = qs('#courseList');
  list.innerHTML = '<div class="loading-msg">Chargement…</div>';
  const courses = await loadCourses('actives');

  if (!courses.length) {
    list.innerHTML = '<div class="empty-msg">🚗 Aucune course en cours</div>';
    qs('.count-badge').textContent = '0';
    qs('.bubble-badge').textContent = '0';
    return;
  }

  qs('.count-badge').textContent = courses.length;
  qs('.bubble-badge').textContent = courses.length;

  list.innerHTML = courses.map(c => `
    <div class="course-item" data-id="${c.id}">
      <div class="ci-icon ${c.type}">${typeIcon(c.type)}</div>
      <div class="ci-content">
        <div class="ci-name">
          <span class="status-dot ${c.statut}"></span>${c.nom}
        </div>
        <div class="ci-route">${c.depart || '—'} → ${c.arrivee || '—'}</div>
        <div class="ci-route">${c.benevole_nom ? '👤 ' + c.benevole_nom : ''}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${fmtDate(c.date_heure)}</div>
        <div class="ci-price">${parseFloat(c.prix_benef || 0).toFixed(2)} €</div>
        <div class="ci-actions">
          <button class="btn-statut" data-id="${c.id}" data-statut="en-cours" title="En cours">▶</button>
          <button class="btn-statut done" data-id="${c.id}" data-statut="termine" title="Terminée">✓</button>
        </div>
      </div>
    </div>
  `).join('');

  qsa('.btn-statut', list).forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await updateCourseStatut(parseInt(btn.dataset.id), btn.dataset.statut);
      showToast(btn.dataset.statut === 'termine' ? '✅ Course terminée !' : '▶ Course en cours');
      renderCourses();
    });
  });
}

async function renderBenevoles() {
  const list = qs('#benevolesList');
  list.innerHTML = '<div class="loading-msg">Chargement…</div>';
  const benevoles = await loadBenevoles();

  if (!benevoles.length) {
    list.innerHTML = '<div class="empty-msg">👥 Aucun bénévole enregistré</div>';
    return;
  }

  const seeds = ['marie','jean','sophie','pierre','alice','bob','claire','david'];
  list.innerHTML = benevoles.map((b, i) => `
    <div class="bv-card" data-id="${b.id}">
      <div class="bv-avatar">
        <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=${seeds[i % seeds.length]}&backgroundColor=2563eb" alt="${b.nom}" />
      </div>
      <div class="bv-name">${b.nom}</div>
      ${b.telephone ? `<div class="bv-phone">${b.telephone}</div>` : ''}
      <div class="bv-status ${b.statut}">${b.statut === 'dispo' ? '● Disponible' : '● En course'}</div>
      <div class="bv-toggle-row">
        <button class="btn-bv-statut" data-id="${b.id}" data-statut="${b.statut === 'dispo' ? 'occupe' : 'dispo'}">
          ${b.statut === 'dispo' ? 'Marquer en course' : 'Marquer disponible'}
        </button>
      </div>
    </div>
  `).join('');

  qsa('.btn-bv-statut', list).forEach(btn => {
    btn.addEventListener('click', async () => {
      await SB.from('benevoles').update({ statut: btn.dataset.statut }).eq('id', btn.dataset.id);
      showToast('✅ Statut mis à jour');
      renderBenevoles();
    });
  });
}

async function renderHistorique(filtre = 'tout') {
  const list = qs('#histoList');
  list.innerHTML = '<div class="loading-msg">Chargement…</div>';
  const courses = await loadCourses(filtre);

  if (!courses.length) {
    list.innerHTML = '<div class="empty-msg">📋 Aucune course dans l\'historique</div>';
    return;
  }

  list.innerHTML = courses.map(c => `
    <div class="course-item">
      <div class="ci-icon ${c.type}">${typeIcon(c.type)}</div>
      <div class="ci-content">
        <div class="ci-name">${c.nom}</div>
        <div class="ci-route">${parseFloat(c.km || 0).toFixed(1)} km • ${fmtDate(c.created_at)}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${typeLabel(c.type)}</div>
        <div class="ci-price">${parseFloat(c.prix_benef || 0).toFixed(2)} €</div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// AJOUT BÉNÉVOLE
// ============================================================
function openAddBenevole() {
  // Crée un mini modal inline
  const existing = qs('#modalAddBenevole');
  if (existing) { existing.style.display = 'flex'; return; }

  const modal = document.createElement('div');
  modal.id = 'modalAddBenevole';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal glass">
      <div class="modal-header">
        <h3>👤 Nouveau bénévole</h3>
        <button class="sheet-close" id="closeAddBv">✕</button>
      </div>
      <div class="field-group">
        <label>Nom complet</label>
        <input type="text" class="input-field" id="bvNom" placeholder="Prénom Nom" />
      </div>
      <div class="field-group">
        <label>Téléphone</label>
        <input type="tel" class="input-field" id="bvTel" placeholder="06 xx xx xx xx" />
      </div>
      <div class="field-group">
        <label>Email (optionnel)</label>
        <input type="email" class="input-field" id="bvEmail" placeholder="email@exemple.fr" />
      </div>
      <button class="btn-primary" id="btnSaveBv">Ajouter le bénévole</button>
    </div>
  `;
  document.body.appendChild(modal);

  qs('#closeAddBv').addEventListener('click', () => modal.style.display = 'none');
  qs('#btnSaveBv').addEventListener('click', async () => {
    const nom = qs('#bvNom').value.trim();
    if (!nom) { showToast('⚠️ Nom requis'); return; }
    if (!SB) { showToast('⚠️ Supabase non connecté'); return; }
    const { error } = await SB.from('benevoles').insert([{
      nom,
      telephone: qs('#bvTel').value.trim() || null,
      email: qs('#bvEmail').value.trim() || null,
      statut: 'dispo',
    }]);
    if (error) { showToast('❌ Erreur : ' + error.message); return; }
    showToast('✅ Bénévole ajouté !');
    modal.style.display = 'none';
    renderBenevoles();
    populateBenevoleSelect();
  });
}

// ============================================================
// SHEETS
// ============================================================
let currentSheet = null;

function openSheet(id) {
  if (currentSheet && currentSheet !== id) closeSheet(currentSheet);
  const sheet = qs('#' + id);
  if (!sheet) return;
  sheet.classList.add('open');
  currentSheet = id;

  let overlay = qs('#sheetOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sheetOverlay';
    overlay.className = 'sheet-overlay';
    overlay.onclick = () => closeSheet(currentSheet);
    document.body.appendChild(overlay);
  }
  overlay.classList.add('visible');

  // Ferme panels flottants
  qs('#profilePanel').style.display = 'none';
  qs('#notifPanel').style.display   = 'none';
}

function closeSheet(id) {
  const sheet = qs('#' + id);
  if (sheet) sheet.classList.remove('open');
  currentSheet = null;
  const overlay = qs('#sheetOverlay');
  if (overlay) overlay.classList.remove('visible');
}

// ============================================================
// PROFILE PANEL
// ============================================================
function toggleProfile() {
  const panel = qs('#profilePanel');
  const notif  = qs('#notifPanel');
  notif.style.display = 'none';
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// ============================================================
// TOAST & PROGRESS
// ============================================================
function showToast(msg, duration = 2800) {
  const t = qs('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function showProgress(show) {
  let bar = qs('.route-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'route-progress-bar';
    document.body.prepend(bar);
  }
  bar.style.display = show ? 'block' : 'none';
}

// ============================================================
// SEARCH BAR
// ============================================================
function initSearchBar() {
  const input    = qs('#searchInput');
  const results  = qs('#searchResults');
  const clearBtn = qs('#searchClear');
  let debounce, searchMarker = null;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'flex' : 'none';
    clearTimeout(debounce);
    if (q.length < 2) { results.style.display = 'none'; return; }
    debounce = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=fr&types=address,place,poi,locality&access_token=${CONFIG.mapboxToken}&limit=6`;
        const data = await (await fetch(url)).json();
        const features = data.features || [];
        if (!features.length) { results.style.display = 'none'; return; }
        results.innerHTML = features.map(f => {
          const parts = f.place_name.split(', ');
          const icon  = f.place_type?.[0] === 'poi' ? '📍' : f.place_type?.[0] === 'address' ? '🏠' : '🏙️';
          return `<div class="search-result-item" data-lon="${f.center[0]}" data-lat="${f.center[1]}" data-name="${f.place_name.replace(/"/g,'')}">
            <span class="sri-icon">${icon}</span>
            <div><div class="sri-main">${parts[0]}</div><div class="sri-sub">${parts.slice(1).join(', ')}</div></div>
          </div>`;
        }).join('');
        results.style.display = 'block';
        qsa('.search-result-item', results).forEach(item => {
          item.addEventListener('click', () => {
            const lon = parseFloat(item.dataset.lon), lat = parseFloat(item.dataset.lat);
            map.flyTo({ center: [lon, lat], zoom: 15, duration: 1200 });
            if (searchMarker) searchMarker.remove();
            searchMarker = new mapboxgl.Marker({ color: '#0071E3' })
              .setLngLat([lon, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(item.dataset.name))
              .addTo(map);
            searchMarker.togglePopup();
            input.value = item.dataset.name;
            clearBtn.style.display = 'flex';
            results.style.display  = 'none';
          });
        });
      } catch(e) { results.style.display = 'none'; }
    }, 280);
  });

  clearBtn.addEventListener('click', () => {
    input.value = ''; clearBtn.style.display = 'none'; results.style.display = 'none';
    if (searchMarker) { searchMarker.remove(); searchMarker = null; }
    input.focus();
  });
  document.addEventListener('click', (e) => {
    if (!qs('#searchBar').contains(e.target)) results.style.display = 'none';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { results.style.display = 'none'; input.blur(); }
  });
}

// ============================================================
// AUTOCOMPLETE ADRESSES
// ============================================================
function setupAutocomplete(inputId) {
  const input = qs('#' + inputId);
  if (!input) return;
  let dropdown = null, timer;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 3) { removeDropdown(); return; }
    timer = setTimeout(async () => {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=fr&types=address,place,poi&access_token=${CONFIG.mapboxToken}&limit=5`;
      try {
        const data = await (await fetch(url)).json();
        showDropdown(input, data.features || []);
      } catch(e) {}
    }, 300);
  });

  function showDropdown(inp, features) {
    removeDropdown();
    if (!features.length) return;
    dropdown = document.createElement('div');
    dropdown.className = 'addr-dropdown';
    features.forEach(f => {
      const parts = f.place_name.split(', ');
      const item  = document.createElement('div');
      item.className = 'addr-dropdown-item';
      item.innerHTML = `<strong>${parts[0]}</strong><br><span>${parts.slice(1).join(', ')}</span>`;
      item.onmousedown = (e) => { e.preventDefault(); inp.value = f.place_name; removeDropdown(); };
      dropdown.appendChild(item);
    });
    const rect = inp.getBoundingClientRect();
    dropdown.style.cssText = `top:${rect.bottom + window.scrollY + 4}px;left:${rect.left}px;width:${rect.width}px`;
    document.body.appendChild(dropdown);
  }

  function removeDropdown() { if (dropdown) { dropdown.remove(); dropdown = null; } }
  input.addEventListener('blur', () => setTimeout(removeDropdown, 150));
}

// ============================================================
// NOTIFICATIONS
// ============================================================
let NOTIFICATIONS = [];

async function loadNotifications() {
  if (!SB) return;
  try {
    const { data } = await SB.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) NOTIFICATIONS = data;
  } catch(e) {}
}

async function addNotification(icon, titre, body) {
  const notif = { icon, titre, body, unread: true, created_at: new Date().toISOString() };
  if (SB) {
    try { await SB.from('notifications').insert([{ icon, titre, body, unread: true }]); } catch(e) {}
  }
  NOTIFICATIONS.unshift({ ...notif, id: Date.now() });
  renderNotifications();
}

function renderNotifications() {
  const list  = qs('#notifList');
  const empty = qs('#notifEmpty');
  const badge = qs('#notifBadge');
  const unread = NOTIFICATIONS.filter(n => n.unread);
  badge.textContent = unread.length;
  badge.style.display = unread.length ? 'flex' : 'none';

  if (!NOTIFICATIONS.length) {
    list.innerHTML = ''; empty.style.display = 'flex'; return;
  }
  empty.style.display = 'none';
  list.innerHTML = NOTIFICATIONS.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
      <span class="ni-icon">${n.icon}</span>
      <div class="ni-content">
        <div class="ni-title">${n.titre}</div>
        <div class="ni-body">${n.body}</div>
        <div class="ni-time">${fmtDate(n.created_at)}</div>
      </div>
    </div>
  `).join('');
  qsa('.notif-item', list).forEach(item => {
    item.addEventListener('click', async () => {
      const id = item.dataset.id;
      item.classList.remove('unread');
      const n = NOTIFICATIONS.find(x => String(x.id) === id);
      if (n) {
        n.unread = false;
        if (SB) { try { await SB.from('notifications').update({ unread: false }).eq('id', id); } catch(e) {} }
      }
      renderNotifications();
    });
  });
}

function toggleNotifPanel() {
  const panel = qs('#notifPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  if (panel.style.display === 'block') renderNotifications();
}

// ============================================================
// TARIFS MODAL
// ============================================================
function updateTarifPreview() {
  const base  = parseFloat(qs('#tarifBase').value)    || 0.55;
  const suppl = parseFloat(qs('#tarifSuppl').value)   || 0.20;
  const prix  = parseFloat(qs('#prixCarburant').value)|| 2.30;
  const conso = parseFloat(qs('#consommation').value) || 7.5;
  qs('#tpTotal').textContent   = (base + suppl).toFixed(2) + ' €/km';
  qs('#tpEssence').textContent = ((conso / 100) * prix * 100).toFixed(2) + ' €';
}

// ============================================================
// SQL SETUP
// ============================================================
const SQL_SETUP = `-- Exécute dans Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS public.courses (
  id            bigserial PRIMARY KEY,
  nom           text NOT NULL,
  type          text DEFAULT 'beneficiaire',
  depart        text,
  arrivee       text,
  km            numeric(8,2),
  duree_min     integer,
  prix_benef    numeric(8,2),
  cout_essence  numeric(8,2),
  benevole_id   bigint,
  date_heure    timestamptz,
  notes         text,
  statut        text DEFAULT 'attente',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benevoles (
  id          bigserial PRIMARY KEY,
  nom         text NOT NULL,
  telephone   text,
  email       text,
  statut      text DEFAULT 'dispo',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id          bigserial PRIMARY KEY,
  icon        text DEFAULT '🔔',
  titre       text NOT NULL,
  body        text,
  unread      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benevoles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès total courses"       ON public.courses       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès total benevoles"     ON public.benevoles     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès total notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);`;

// ============================================================
// EVENTS — BUBBLES
// ============================================================
qs('#bubbleNew').addEventListener('click', () => {
  openSheet('sheetNewCourse');
  qs('#sheetNewCourse').scrollTop = 0;
  qs('#routeResult').style.display = 'none';
  currentRoute = null;
  populateBenevoleSelect();
});

qs('#bubbleCourses').addEventListener('click', () => {
  renderCourses();
  openSheet('sheetCourses');
});

qs('#bubbleBenevoles').addEventListener('click', () => {
  renderBenevoles();
  openSheet('sheetBenevoles');
});

qs('#bubbleHistorique').addEventListener('click', () => {
  renderHistorique('tout');
  openSheet('sheetHistorique');
});

qs('#bubbleStats').addEventListener('click', () => {
  loadStats();
  openSheet('sheetStats');
});

qs('#bubbleSam').addEventListener('click', () => {
  openSheet('sheetNewCourse');
  qs('#routeResult').style.display = 'none';
  currentRoute = null;
  qsa('.pill[data-type]').forEach(p => p.classList.remove('active'));
  qs('.pill[data-type="sam"]').classList.add('active');
  showToast('🍺 Mode SAM activé !');
  populateBenevoleSelect();
});

// ============================================================
// EVENTS — CLOSE BUTTONS
// ============================================================
qsa('[data-close]').forEach(btn => btn.addEventListener('click', () => closeSheet(btn.dataset.close)));
qsa('[data-modal]').forEach(btn => btn.addEventListener('click', () => { qs('#' + btn.dataset.modal).style.display = 'none'; }));

// ============================================================
// EVENTS — TYPE PILLS
// ============================================================
qsa('.pill[data-type]').forEach(p => {
  p.addEventListener('click', () => {
    qsa('.pill[data-type]').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
  });
});

// ============================================================
// EVENTS — HISTO FILTERS
// ============================================================
qsa('.pill[data-histo]').forEach(p => {
  p.addEventListener('click', () => {
    qsa('.pill[data-histo]').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    renderHistorique(p.dataset.histo);
  });
});

// ============================================================
// EVENTS — CALCULATE ROUTE
// ============================================================
qs('#btnCalculer').addEventListener('click', async () => {
  const dep = qs('#addrDepart').value.trim();
  const arr = qs('#addrArrivee').value.trim();
  if (!dep || !arr) { showToast('⚠️ Renseignez les deux adresses.'); return; }

  qs('#btnCalculer').textContent = 'Calcul en cours…';
  qs('#btnCalculer').disabled = true;
  const result = await calculateRoute(dep, arr);
  qs('#btnCalculer').textContent = 'Calculer le trajet →';
  qs('#btnCalculer').disabled = false;

  if (result) {
    displayRouteResult(result.km, result.min);
    showToast(`✅ ${result.km} km — ~${result.min} min`);
  }
});

// ============================================================
// EVENTS — LOCALIZE
// ============================================================
qs('#locateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) { showToast('⚠️ Géolocalisation indisponible.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${CONFIG.mapboxToken}`)
      .then(r => r.json())
      .then(data => {
        if (data.features?.length) {
          qs('#addrDepart').value = data.features[0].place_name;
          showToast('📍 Position récupérée');
        }
      });
  }, () => showToast('❌ Position indisponible.'));
});

// ============================================================
// EVENTS — PROFILE / NOTIFICATIONS
// ============================================================
qs('#notifBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  qs('#profilePanel').style.display = 'none';
  toggleNotifPanel();
});

qs('#notifClearAll').addEventListener('click', async () => {
  NOTIFICATIONS = [];
  if (SB) { try { await SB.from('notifications').delete().neq('id', 0); } catch(e) {} }
  renderNotifications();
  showToast('🔕 Notifications effacées');
});

qs('#profileToggle').addEventListener('click', (e) => {
  e.stopPropagation();
  qs('#notifPanel').style.display = 'none';
  toggleProfile();
});

document.addEventListener('click', (e) => {
  const pp = qs('#profilePanel'), np = qs('#notifPanel');
  if (!qs('#profileToggle').contains(e.target) && !pp.contains(e.target)) pp.style.display = 'none';
  if (!qs('#notifBtn').contains(e.target)      && !np.contains(e.target)) np.style.display = 'none';
});

// ============================================================
// EVENTS — CONFIG & TARIFS
// ============================================================
qs('#btnConfig').addEventListener('click', () => {
  qs('#profilePanel').style.display = 'none';
  qs('#mapboxToken').value  = CONFIG.mapboxToken;
  qs('#supabaseUrl').value  = CONFIG.supabaseUrl;
  qs('#supabaseKey').value  = CONFIG.supabaseKey;
  qs('#modalConfig').style.display = 'flex';
});

qs('#btnTarifs').addEventListener('click', () => {
  qs('#profilePanel').style.display = 'none';
  qs('#tarifBase').value     = CONFIG.tarifBase;
  qs('#tarifSuppl').value    = CONFIG.tarifSuppl;
  qs('#prixCarburant').value = CONFIG.prixCarburant;
  qs('#consommation').value  = CONFIG.consommation;
  updateTarifPreview();
  qs('#modalTarifs').style.display = 'flex';
});

qs('#btnSaveConfig').addEventListener('click', () => {
  const token = qs('#mapboxToken').value.trim();
  const url   = qs('#supabaseUrl').value.trim();
  const key   = qs('#supabaseKey').value.trim();
  if (token) { CONFIG.mapboxToken = token; localStorage.setItem('ml_mapbox', token); mapboxgl.accessToken = token; }
  if (url)   { CONFIG.supabaseUrl = url;   localStorage.setItem('ml_sb_url', url); }
  if (key)   { CONFIG.supabaseKey = key;   localStorage.setItem('ml_sb_key', key); }
  qs('#modalConfig').style.display = 'none';
  showToast('✅ Config sauvegardée. Rechargez la page.');
  initSupabase();
});

qs('#btnSaveTarifs').addEventListener('click', () => {
  CONFIG.tarifBase     = parseFloat(qs('#tarifBase').value);
  CONFIG.tarifSuppl    = parseFloat(qs('#tarifSuppl').value);
  CONFIG.prixCarburant = parseFloat(qs('#prixCarburant').value);
  CONFIG.consommation  = parseFloat(qs('#consommation').value);
  localStorage.setItem('ml_tarif_base',  CONFIG.tarifBase);
  localStorage.setItem('ml_tarif_suppl', CONFIG.tarifSuppl);
  localStorage.setItem('ml_carburant',   CONFIG.prixCarburant);
  localStorage.setItem('ml_conso',       CONFIG.consommation);
  qs('#modalTarifs').style.display = 'none';
  showToast('✅ Tarifs mis à jour !');
});

qsa('#tarifBase, #tarifSuppl, #prixCarburant, #consommation').forEach(el => {
  el.addEventListener('input', updateTarifPreview);
});

// ============================================================
// EVENTS — TICKET & SAVE COURSE
// ============================================================
qs('#btnTicket').addEventListener('click', generateTicket);

qs('#btnSauvegarder').addEventListener('click', async () => {
  const nom  = qs('#beneficiaireName').value.trim();
  const dep  = qs('#addrDepart').value.trim();
  const arr  = qs('#addrArrivee').value.trim();

  if (!nom || !dep || !arr) { showToast('⚠️ Nom de la personne et adresses requis.'); return; }
  if (!currentRoute) { showToast('⚠️ Calculez d\'abord le trajet.'); return; }

  const type = qs('.pill.active[data-type]')?.dataset.type || 'beneficiaire';
  const bvSel = qs('#benevoleSelect');
  const bvId  = bvSel.value ? parseInt(bvSel.value) : null;
  const bvNom = bvSel.value ? bvSel.selectedOptions[0]?.text.replace(' (en course)', '') : null;

  const courseData = {
    nom, type, depart: dep, arrivee: arr,
    km: currentRoute.km, duree_min: currentRoute.min,
    prix_benef:   parseFloat(currentRoute.prixBenef),
    cout_essence: parseFloat(currentRoute.prixEss),
    benevole_id:  bvId,
    benevole_nom: bvNom,
    date_heure:   qs('#dateHeure').value || new Date().toISOString(),
    notes:        qs('#courseNotes').value.trim() || null,
    statut:       'attente',
    created_at:   new Date().toISOString(),
  };

  const ok = await saveCourse(courseData);
  if (!ok) return;

  await addNotification('🚗', 'Course enregistrée', `${nom} — ${dep.split(',')[0]} → ${arr.split(',')[0]}`);
  showToast('✅ Course enregistrée !');

  closeSheet('sheetNewCourse');
  clearRoute(); clearMarkers(); currentRoute = null;

  // Reset form
  qs('#beneficiaireName').value = '';
  qs('#addrDepart').value = '';
  qs('#addrArrivee').value = '';
  qs('#courseNotes').value = '';
  qs('#routeResult').style.display = 'none';
  qsa('.pill[data-type]').forEach(p => p.classList.remove('active'));
  qs('.pill[data-type="beneficiaire"]').classList.add('active');

  setTimeout(() => { renderHistorique('tout'); openSheet('sheetHistorique'); }, 500);
});

// ============================================================
// EVENTS — ADD BENEVOLE
// ============================================================
qs('#btnAddBenevole').addEventListener('click', openAddBenevole);

// ============================================================
// EVENTS — COPY SQL
// ============================================================
qs('#btnCopySQL').addEventListener('click', () => {
  navigator.clipboard.writeText(SQL_SETUP)
    .then(() => showToast('📋 SQL copié !'))
    .catch(() => showToast('Sélectionne et copie le SQL manuellement.'));
});

// ============================================================
// INIT
// ============================================================
async function init() {
  initMap();
  initSupabase();
  initSearchBar();
  setupAutocomplete('addrDepart');
  setupAutocomplete('addrArrivee');

  // Date par défaut
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  qs('#dateHeure').value = now.toISOString().slice(0, 16);

  // Charge notifications
  await loadNotifications();
  renderNotifications();

  console.log('🌊 Mobilité Littoral & SAM démarré');
}

init();
