/* ============================================================
   MOBILITÉ LITTORAL & SAM — Application JS
   ============================================================ */

'use strict';

// ============================================================
// CONFIG — remplace par tes vraies clés
// ============================================================
const CONFIG = {
  mapboxToken:   localStorage.getItem('ml_mapbox')    || 'VOTRE_TOKEN_MAPBOX_ICI',
  supabaseUrl:   localStorage.getItem('ml_sb_url')    || '',
  supabaseKey:   localStorage.getItem('ml_sb_key')    || '',
  tarifBase:     parseFloat(localStorage.getItem('ml_tarif_base'))  || 0.55,
  tarifSuppl:    parseFloat(localStorage.getItem('ml_tarif_suppl')) || 0.20,
  prixCarburant: parseFloat(localStorage.getItem('ml_carburant'))   || 2.30,
  consommation:  parseFloat(localStorage.getItem('ml_conso'))       || 7.5,
};

// ============================================================
// SUPABASE (optionnel — fonctionne sans)
// ============================================================
let supabaseClient = null;
function initSupabase() {
  if (CONFIG.supabaseUrl && CONFIG.supabaseKey && window.supabase) {
    supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    console.log('✅ Supabase connecté');
  }
}

// ============================================================
// SAMPLE DATA
// ============================================================
const SAMPLE_COURSES = [
  { id:1, nom:'Mme Leclerc',    type:'courses',  dep:'12 rue de la Plage, La Rochelle',         arr:'Carrefour Lagord',        km:4.2,  min:12, prix:3.15, benevole:'Marie D.', statut:'en-cours',  date:'Aujourd\'hui 10:30' },
  { id:2, nom:'M. Bertrand',    type:'medical',  dep:'8 av. des Acacias, Rochefort',            arr:'CHU de Rochefort',        km:6.8,  min:18, prix:5.10, benevole:'Jean M.',  statut:'attente',   date:'Aujourd\'hui 14:00' },
  { id:3, nom:'Famille Morin',  type:'sam',      dep:'Bar Le Phare, Fouras',                    arr:'15 rue des Mouettes',     km:3.1,  min:9,  prix:2.33, benevole:'Sophie B.',statut:'en-cours',  date:'Hier 23:45'         },
];

const SAMPLE_BENEVOLES = [
  { id:1, nom:'Marie Dupont',   seed:'marie',    statut:'dispo',  courses:12 },
  { id:2, nom:'Jean Martin',    seed:'jean',     statut:'occupe', courses:8  },
  { id:3, nom:'Sophie Bernard', seed:'sophie',   statut:'dispo',  courses:15 },
  { id:4, nom:'Pierre Aubert',  seed:'pierre',   statut:'dispo',  courses:5  },
];

const SAMPLE_HISTORIQUE = [
  { id:10, nom:'Mme Leclerc',   type:'courses',  km:4.2,  prix:3.15, date:'21/05/2026', statut:'termine' },
  { id:9,  nom:'M. Bertrand',   type:'medical',  km:12.5, prix:9.38, date:'20/05/2026', statut:'termine' },
  { id:8,  nom:'Famille Klein', type:'vacances', km:87.0, prix:65.25,date:'19/05/2026', statut:'termine' },
  { id:7,  nom:'Groupe amis',   type:'sam',      km:5.3,  prix:3.98, date:'18/05/2026', statut:'termine' },
  { id:6,  nom:'Mme Aubert',    type:'medical',  km:9.1,  prix:6.83, date:'17/05/2026', statut:'termine' },
];

// ============================================================
// MAP INIT
// ============================================================
let map, routeLayerAdded = false;

function initMap() {
  mapboxgl.accessToken = CONFIG.mapboxToken;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-1.1511, 46.1603], // La Rochelle par défaut
    zoom: 12,
    attributionControl: false,
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true,
  }), 'bottom-right');

  map.on('load', () => {
    console.log('🗺️ Carte chargée');
  });
}

// ============================================================
// ROUTING
// ============================================================
let currentRoute = null;
let markers = [];

function clearMarkers() {
  markers.forEach(m => m.remove());
  markers = [];
}

function clearRoute() {
  if (map.getLayer('route')) map.removeLayer('route');
  if (map.getSource('route')) map.removeSource('route');
}

async function calculateRoute(depAddr, arrAddr) {
  showProgress(true);

  try {
    // Géocode les 2 adresses
    const [depCoords, arrCoords] = await Promise.all([
      geocodeAddress(depAddr),
      geocodeAddress(arrAddr),
    ]);

    if (!depCoords || !arrCoords) {
      showToast('❌ Adresse introuvable. Vérifiez les adresses.');
      showProgress(false);
      return null;
    }

    // Appel API directions Mapbox
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${depCoords[0]},${depCoords[1]};${arrCoords[0]},${arrCoords[1]}?geometries=geojson&overview=full&access_token=${CONFIG.mapboxToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      showToast('❌ Impossible de calculer l\'itinéraire.');
      showProgress(false);
      return null;
    }

    const route = data.routes[0];
    const km    = (route.distance / 1000).toFixed(1);
    const min   = Math.round(route.duration / 60);

    // Affiche sur la carte
    clearMarkers();
    clearRoute();

    // Marqueurs
    const m1 = new mapboxgl.Marker({ color: '#34C759' }).setLngLat(depCoords).addTo(map);
    const m2 = new mapboxgl.Marker({ color: '#FF3B30' }).setLngLat(arrCoords).addTo(map);
    markers.push(m1, m2);

    // Tracé
    map.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: route.geometry },
    });
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#0071E3', 'line-width': 5, 'line-opacity': 0.85 },
    });

    // Zoom sur le trajet
    const bounds = new mapboxgl.LngLatBounds();
    route.geometry.coordinates.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: { top: 80, bottom: 180, left: 40, right: 40 }, duration: 1000 });

    showProgress(false);
    return { km: parseFloat(km), min };

  } catch (err) {
    console.error(err);
    showToast('❌ Erreur lors du calcul du trajet.');
    showProgress(false);
    return null;
  }
}

async function geocodeAddress(addr) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?country=fr&access_token=${CONFIG.mapboxToken}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].center;
  }
  return null;
}

// ============================================================
// PRIX / TARIFS
// ============================================================
function calcPrix(km) {
  const tarifTotal = CONFIG.tarifBase + CONFIG.tarifSuppl;
  const prixBenef  = (km * tarifTotal).toFixed(2);
  const prixEss    = ((km * CONFIG.consommation / 100) * CONFIG.prixCarburant).toFixed(2);
  return { tarifTotal, prixBenef, prixEss };
}

function displayRouteResult(km, min) {
  const { tarifTotal, prixBenef, prixEss } = calcPrix(km);

  qs('#rcKm').textContent     = km;
  qs('#rcTemps').textContent  = min;
  qs('#rcPrixBenef').textContent = prixBenef + ' €';
  qs('#rcEssence').textContent   = prixEss   + ' €';

  qs('#tarifDetail').innerHTML = `
    <strong>Détail tarif :</strong> ${CONFIG.tarifBase.toFixed(2)} €/km (base)
    + ${CONFIG.tarifSuppl.toFixed(2)} €/km (suppl. carburant)
    = <strong>${tarifTotal.toFixed(2)} €/km</strong><br>
    Coût essence : ${CONFIG.prixCarburant.toFixed(2)} €/L × ${CONFIG.consommation} L/100km × ${km} km
  `;

  qs('#routeResult').style.display = 'block';
  currentRoute = { km, min, prixBenef, prixEss };
}

// ============================================================
// TICKET PDF
// ============================================================
function generateTicket() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });

  const nom    = qs('#beneficiaireName').value || 'Bénéficiaire';
  const dep    = qs('#addrDepart').value  || '—';
  const arr    = qs('#addrArrivee').value || '—';
  const date   = qs('#dateHeure').value   || new Date().toLocaleString('fr-FR');
  const notes  = qs('#courseNotes').value || '';
  const benv   = qs('#benevoleSelect').selectedOptions[0]?.text || '—';

  if (!currentRoute) { showToast('Calculez d\'abord un trajet.'); return; }

  const { km, min, prixBenef, prixEss } = currentRoute;
  const typeEl = qs('.pill.active[data-type]');
  const type   = typeEl ? typeEl.dataset.type : 'course';

  // En-tête
  doc.setFillColor(0, 113, 227);
  doc.rect(0, 0, 148, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('🌊 Mobilité Littoral & SAM', 10, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ticket de course — Association', 10, 20);
  doc.text(`N° ${Date.now().toString().slice(-6)}`, 118, 12);

  // Infos principales
  doc.setTextColor(28, 28, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations', 10, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const rows = [
    ['Bénéficiaire', nom],
    ['Type de course', type.charAt(0).toUpperCase() + type.slice(1)],
    ['Bénévole', benv],
    ['Date / Heure', date],
    ['Départ', dep],
    ['Arrivée', arr],
  ];
  if (notes) rows.push(['Notes', notes]);

  let y = 44;
  rows.forEach(([label, val]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label + ' :', 10, y);
    doc.setTextColor(28, 28, 30);
    doc.text(val, 55, y, { maxWidth: 85 });
    y += val.length > 40 ? 10 : 8;
  });

  // Ligne séparatrice
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(10, y, 138, y);
  y += 8;

  // Résumé trajet
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Résumé du trajet', 10, y); y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Petits cards
  const cards = [
    { label: 'Distance', val: km + ' km' },
    { label: 'Durée', val: min + ' min' },
    { label: 'Tarif bénéficiaire', val: prixBenef + ' €' },
    { label: 'Coût essence estimé', val: prixEss + ' €' },
  ];

  cards.forEach((c, i) => {
    const x = 10 + (i % 2) * 65;
    const yy = y + Math.floor(i / 2) * 24;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, yy - 6, 58, 20, 3, 3, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(c.label, x + 5, yy + 1);
    doc.setTextColor(0, 113, 227);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(c.val, x + 5, yy + 10);
    doc.setFont('helvetica', 'normal');
  });

  y += 56;

  // Tarif détail
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Tarif : ${CONFIG.tarifBase}€/km + ${CONFIG.tarifSuppl}€/km suppl. carburant = ${(CONFIG.tarifBase + CONFIG.tarifSuppl).toFixed(2)}€/km`, 10, y);
  y += 6;
  doc.text(`Carburant : ${CONFIG.prixCarburant}€/L × ${CONFIG.consommation}L/100km`, 10, y);
  y += 10;

  // Pied de page
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 195, 148, 15, 'F');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Mobilité Littoral & SAM — Association loi 1901', 10, 203);
  doc.text(new Date().toLocaleDateString('fr-FR'), 120, 203);

  doc.save(`ticket-course-${nom.replace(/ /g, '_')}-${Date.now().toString().slice(-6)}.pdf`);
  showToast('🎫 Ticket PDF généré !');
}

// ============================================================
// RENDER LISTS
// ============================================================
function renderCourses() {
  const list = qs('#courseList');
  list.innerHTML = SAMPLE_COURSES.map(c => `
    <div class="course-item" onclick="focusCourse(${c.id})">
      <div class="ci-icon ${c.type}">${typeIcon(c.type)}</div>
      <div class="ci-content">
        <div class="ci-name">
          <span class="status-dot ${c.statut}"></span>${c.nom}
        </div>
        <div class="ci-route">${c.dep} → ${c.arr}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${c.date}</div>
        <div class="ci-price">${c.prix} €</div>
      </div>
    </div>
  `).join('');
}

function renderBenevoles() {
  const list = qs('#benevolesList');
  list.innerHTML = SAMPLE_BENEVOLES.map(b => `
    <div class="bv-card">
      <div class="bv-avatar">
        <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=${b.seed}&backgroundColor=2563eb" alt="${b.nom}" />
      </div>
      <div class="bv-name">${b.nom}</div>
      <div class="bv-status ${b.statut}">${b.statut === 'dispo' ? '● Disponible' : '● En course'}</div>
    </div>
  `).join('');
}

function renderHistorique() {
  const list = qs('#histoList');
  list.innerHTML = SAMPLE_HISTORIQUE.map(c => `
    <div class="course-item">
      <div class="ci-icon ${c.type}">${typeIcon(c.type)}</div>
      <div class="ci-content">
        <div class="ci-name">${c.nom}</div>
        <div class="ci-route">${c.km} km • ${c.date}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${typeLabel(c.type)}</div>
        <div class="ci-price">${c.prix} €</div>
      </div>
    </div>
  `).join('');
}

function typeIcon(t) {
  return { courses:'🛒', medical:'🏥', vacances:'🌴', sam:'🍺', beneficiaire:'🚗' }[t] || '🚗';
}
function typeLabel(t) {
  return { courses:'Courses', medical:'Médical', vacances:'Vacances', sam:'SAM', beneficiaire:'Divers' }[t] || t;
}

// ============================================================
// SHEETS (bottom drawers)
// ============================================================
let currentSheet = null;

function openSheet(id) {
  // Ferme l'actuel
  if (currentSheet && currentSheet !== id) closeSheet(currentSheet);

  const sheet = qs('#' + id);
  if (!sheet) return;

  sheet.classList.add('open');
  currentSheet = id;

  // Overlay
  let overlay = qs('#sheetOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sheetOverlay';
    overlay.className = 'sheet-overlay';
    overlay.onclick = () => closeSheet(currentSheet);
    document.body.appendChild(overlay);
  }
  overlay.classList.add('visible');
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
// TOAST & PROGRESS
// ============================================================
qs('#bubbleNew').addEventListener('click', () => {
  openSheet('sheetNewCourse');
  qs('#sheetNewCourse').scrollTop = 0;
  qs('#routeResult').style.display = 'none';
  currentRoute = null;
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
  renderHistorique();
  openSheet('sheetHistorique');
});

qs('#bubbleStats').addEventListener('click', () => {
  openSheet('sheetStats');
});

qs('#bubbleSam').addEventListener('click', () => {
  // Ouvre nouvelle course avec SAM préselectionné
  openSheet('sheetNewCourse');
  qs('#routeResult').style.display = 'none';
  currentRoute = null;
  // Active la pill SAM
  qsa('.pill[data-type]').forEach(p => p.classList.remove('active'));
  qs('.pill[data-type="sam"]').classList.add('active');
  showToast('🍺 Mode SAM activé !');
});

// ============================================================
// EVENTS — SHEET CLOSE BUTTONS
// ============================================================
qsa('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeSheet(btn.dataset.close));
});

qsa('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    qs('#' + btn.dataset.modal).style.display = 'none';
  });
});

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
// EVENTS — CALCULATE ROUTE
// ============================================================
qs('#btnCalculer').addEventListener('click', async () => {
  const dep = qs('#addrDepart').value.trim();
  const arr = qs('#addrArrivee').value.trim();

  if (!dep || !arr) {
    showToast('⚠️ Veuillez renseigner les deux adresses.');
    return;
  }

  qs('#btnCalculer').textContent = 'Calcul en cours…';
  qs('#btnCalculer').disabled = true;

  const result = await calculateRoute(dep, arr);

  qs('#btnCalculer').textContent = 'Calculer le trajet →';
  qs('#btnCalculer').disabled = false;

  if (result) {
    displayRouteResult(result.km, result.min);
    showToast(`✅ Trajet calculé : ${result.km} km en ~${result.min} min`);
  }
});

// ============================================================
// EVENTS — LOCALIZE
// ============================================================
qs('#locateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) { showToast('⚠️ Géolocalisation indisponible.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    // Reverse geocode
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${CONFIG.mapboxToken}`)
      .then(r => r.json())
      .then(data => {
        if (data.features?.length) {
          qs('#addrDepart').value = data.features[0].place_name;
          showToast('📍 Position actuelle récupérée');
        }
      });
  }, () => showToast('❌ Impossible de récupérer la position.'));
});

// ============================================================
// EVENTS — PROFILE / MENUS
// ============================================================
qs('#profileToggle').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleProfile();
});

document.addEventListener('click', (e) => {
  const panel = qs('#profilePanel');
  if (!qs('#profileToggle').contains(e.target) && !panel.contains(e.target)) {
    panel.style.display = 'none';
  }
});

qs('#btnConfig').addEventListener('click', () => {
  qs('#profilePanel').style.display = 'none';
  qs('#mapboxToken').value  = CONFIG.mapboxToken !== 'VOTRE_TOKEN_MAPBOX_ICI' ? CONFIG.mapboxToken : '';
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

// ============================================================
// SAVE CONFIG
// ============================================================
qs('#btnSaveConfig').addEventListener('click', () => {
  const token = qs('#mapboxToken').value.trim();
  const url   = qs('#supabaseUrl').value.trim();
  const key   = qs('#supabaseKey').value.trim();

  if (token) { CONFIG.mapboxToken = token; localStorage.setItem('ml_mapbox', token); }
  if (url)   { CONFIG.supabaseUrl = url;   localStorage.setItem('ml_sb_url', url); }
  if (key)   { CONFIG.supabaseKey = key;   localStorage.setItem('ml_sb_key', key); }

  qs('#modalConfig').style.display = 'none';
  showToast('✅ Configuration sauvegardée. Rechargez la page.');

  // Réinit si tokens dispos
  initSupabase();
  if (token) { mapboxgl.accessToken = token; }
});

// SAVE TARIFS
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
// TICKET PDF
// ============================================================
qs('#btnTicket').addEventListener('click', generateTicket);

// ============================================================
// SAVE COURSE (demo — save to Supabase if configured)
// ============================================================
qs('#btnSauvegarder').addEventListener('click', async () => {
  const nom  = qs('#beneficiaireName').value.trim();
  const dep  = qs('#addrDepart').value.trim();
  const arr  = qs('#addrArrivee').value.trim();

  if (!nom || !dep || !arr) {
    showToast('⚠️ Remplissez au moins le bénéficiaire et les adresses.');
    return;
  }
  if (!currentRoute) {
    showToast('⚠️ Calculez d\'abord le trajet.');
    return;
  }

  const typeEl = qs('.pill.active[data-type]');
  const type   = typeEl?.dataset.type || 'course';

  const courseData = {
    nom,
    type,
    depart: dep,
    arrivee: arr,
    km:           currentRoute.km,
    duree_min:    currentRoute.min,
    prix_benef:   parseFloat(currentRoute.prixBenef),
    cout_essence: parseFloat(currentRoute.prixEss),
    benevole_id:  qs('#benevoleSelect').value,
    date_heure:   qs('#dateHeure').value,
    notes:        qs('#courseNotes').value,
    created_at:   new Date().toISOString(),
  };

  // Supabase
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('courses').insert([courseData]);
      if (error) throw error;
      showToast('✅ Course enregistrée en base !');
    } catch (err) {
      showToast('⚠️ Erreur Supabase — sauvegarde locale.');
      console.error(err);
    }
  } else {
    // Local (demo)
    SAMPLE_HISTORIQUE.unshift({ ...courseData, id: Date.now(), statut: 'attente', prix: currentRoute.prixBenef, date: new Date().toLocaleDateString('fr-FR') });
    showToast('✅ Course enregistrée !');
  }

  // Reset
  closeSheet('sheetNewCourse');
  clearRoute();
  clearMarkers();
  currentRoute = null;

  // Petit délai puis montre historique
  setTimeout(() => {
    renderHistorique();
    openSheet('sheetHistorique');
  }, 500);
});

// ============================================================
// SEARCH BAR (topbar — chercher un lieu sur la carte)
// ============================================================
const SQL_SETUP = `-- Exécute ce script dans Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS public.courses (
  id            bigserial PRIMARY KEY,
  nom           text NOT NULL,
  type          text DEFAULT 'course',
  depart        text,
  arrivee       text,
  km            numeric(8,2),
  duree_min     integer,
  prix_benef    numeric(8,2),
  cout_essence  numeric(8,2),
  benevole_id   text,
  date_heure    timestamptz,
  notes         text,
  statut        text DEFAULT 'attente',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benevoles (
  id          bigserial PRIMARY KEY,
  nom         text NOT NULL,
  telephone   text,
  statut      text DEFAULT 'dispo',
  created_at  timestamptz DEFAULT now()
);

-- Active Row Level Security (recommandé)
ALTER TABLE public.courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benevoles ENABLE ROW LEVEL SECURITY;

-- Policies permissives (à affiner selon tes besoins)
CREATE POLICY "Accès total" ON public.courses  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès total" ON public.benevoles FOR ALL USING (true) WITH CHECK (true);`;

function initSearchBar() {
  const input   = qs('#searchInput');
  const results = qs('#searchResults');
  const clearBtn = qs('#searchClear');
  let debounce;
  let searchMarker = null;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'flex' : 'none';

    clearTimeout(debounce);
    if (q.length < 2) { results.style.display = 'none'; return; }

    debounce = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=fr&types=address,place,poi,locality&access_token=${CONFIG.mapboxToken}&limit=6`;
        const res  = await fetch(url);
        const data = await res.json();
        const features = data.features || [];

        if (!features.length) { results.style.display = 'none'; return; }

        results.innerHTML = features.map(f => {
          const parts  = f.place_name.split(', ');
          const main   = parts[0];
          const sub    = parts.slice(1).join(', ');
          const icon   = f.place_type?.[0] === 'poi' ? '📍' : f.place_type?.[0] === 'address' ? '🏠' : '🏙️';
          return `<div class="search-result-item" data-lon="${f.center[0]}" data-lat="${f.center[1]}" data-name="${f.place_name.replace(/"/g,'')}">
            <span class="sri-icon">${icon}</span>
            <div><div class="sri-main">${main}</div><div class="sri-sub">${sub}</div></div>
          </div>`;
        }).join('');

        results.style.display = 'block';

        qsa('.search-result-item', results).forEach(item => {
          item.addEventListener('click', () => {
            const lon  = parseFloat(item.dataset.lon);
            const lat  = parseFloat(item.dataset.lat);
            const name = item.dataset.name;

            // Fly to
            map.flyTo({ center: [lon, lat], zoom: 15, duration: 1200 });

            // Marqueur de recherche
            if (searchMarker) searchMarker.remove();
            searchMarker = new mapboxgl.Marker({ color: '#0071E3' })
              .setLngLat([lon, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(name))
              .addTo(map);
            searchMarker.togglePopup();

            input.value = name;
            clearBtn.style.display = 'flex';
            results.style.display  = 'none';
          });
        });
      } catch(e) { results.style.display = 'none'; }
    }, 280);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    results.style.display  = 'none';
    if (searchMarker) { searchMarker.remove(); searchMarker = null; }
    input.focus();
  });

  // Ferme si clic dehors
  document.addEventListener('click', (e) => {
    if (!qs('#searchBar').contains(e.target)) results.style.display = 'none';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { results.style.display = 'none'; input.blur(); }
  });
}

// ============================================================
// NOTIFICATIONS
// ============================================================
const NOTIFICATIONS = [
  { id:1, icon:'🚗', title:'Course en attente',    body:'M. Bertrand — CHU Rochefort — 14h00',       time:'Il y a 5 min',  unread:true  },
  { id:2, icon:'🍺', title:'SAM demandé',           body:'Fouras, Bar Le Phare — 23h30',              time:'Il y a 1h',     unread:true  },
  { id:3, icon:'✅', title:'Course terminée',       body:'Mme Leclerc — Carrefour Lagord',            time:'Hier 11:02',    unread:false },
  { id:4, icon:'⛽', title:'Alerte carburant',      body:'Prix estimé dépassé ce mois (+8%)',         time:'Hier 08:15',    unread:false },
];

function renderNotifications() {
  const list  = qs('#notifList');
  const empty = qs('#notifEmpty');
  const badge = qs('#notifBadge');

  const unread = NOTIFICATIONS.filter(n => n.unread);
  badge.textContent = unread.length;
  badge.style.display = unread.length ? 'flex' : 'none';

  if (!NOTIFICATIONS.length) {
    list.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = NOTIFICATIONS.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
      <span class="ni-icon">${n.icon}</span>
      <div class="ni-content">
        <div class="ni-title">${n.title}</div>
        <div class="ni-body">${n.body}</div>
        <div class="ni-time">${n.time}</div>
      </div>
    </div>
  `).join('');

  qsa('.notif-item', list).forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const n  = NOTIFICATIONS.find(x => x.id === id);
      if (n) { n.unread = false; item.classList.remove('unread'); }
      renderNotifications();
    });
  });
}

function toggleNotifPanel() {
  const panel = qs('#notifPanel');
  const profilePanel = qs('#profilePanel');
  profilePanel.style.display = 'none';
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  if (panel.style.display === 'block') renderNotifications();
}

// ============================================================
// SUPABASE ERROR → propose SQL setup
// ============================================================
function handleSupabaseError(err) {
  console.error(err);
  if (err?.code === 'PGRST205' || (err?.message && err.message.includes('schema cache'))) {
    // Table manquante — propose le SQL
    qs('#sqlContent').textContent = SQL_SETUP;
    qs('#modalSQL').style.display = 'flex';
    showToast('⚠️ Table manquante — SQL prêt à copier !', 4000);
  } else {
    showToast('⚠️ Erreur Supabase — sauvegarde locale.');
  }
}

// ============================================================
// AUTOCOMPLETE SETUP
// ============================================================
function setupAutocomplete(inputId) {
  const input = qs('#' + inputId);
  if (!input) return;

  let dropdown = null;
  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 3) { removeDropdown(); return; }

    debounceTimer = setTimeout(async () => {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=fr&types=address,place,poi&access_token=${CONFIG.mapboxToken}&limit=5`;
      try {
        const res  = await fetch(url);
        const data = await res.json();
        showDropdown(input, data.features || []);
      } catch (e) {}
    }, 300);
  });

  function showDropdown(inp, features) {
    removeDropdown();
    if (!features.length) return;

    dropdown = document.createElement('div');
    dropdown.className = 'addr-dropdown glass';
    dropdown.style.cssText = `
      position:fixed; z-index:9999;
      background:white; border-radius:12px; overflow:hidden;
      box-shadow:0 8px 32px rgba(0,0,0,0.15); min-width:260px;
      border:1px solid rgba(0,0,0,0.08);
    `;

    features.forEach(f => {
      const parts = f.place_name.split(', ');
      const item  = document.createElement('div');
      item.style.cssText = 'padding:10px 14px; cursor:pointer; font-size:13px; border-bottom:1px solid rgba(0,0,0,0.05); line-height:1.4;';
      item.innerHTML = `<strong>${parts[0]}</strong><br><span style="color:#636366;font-size:11px">${parts.slice(1).join(', ')}</span>`;
      item.onmousedown = (e) => {
        e.preventDefault();
        inp.value = f.place_name;
        removeDropdown();
      };
      item.onmouseenter = () => item.style.background = 'rgba(0,113,227,0.06)';
      item.onmouseleave = () => item.style.background = '';
      dropdown.appendChild(item);
    });

    const rect = inp.getBoundingClientRect();
    dropdown.style.top   = (rect.bottom + 4) + 'px';
    dropdown.style.left  = rect.left + 'px';
    dropdown.style.width = rect.width + 'px';
    document.body.appendChild(dropdown);
  }

  function removeDropdown() {
    if (dropdown) { dropdown.remove(); dropdown = null; }
  }

  input.addEventListener('blur', () => setTimeout(removeDropdown, 150));
}

// ============================================================
// TARIFS MODAL
// ============================================================
function updateTarifPreview() {
  const base  = parseFloat(qs('#tarifBase').value)  || 0.55;
  const suppl = parseFloat(qs('#tarifSuppl').value) || 0.20;
  const prix  = parseFloat(qs('#prixCarburant').value) || 2.30;
  const conso = parseFloat(qs('#consommation').value)  || 7.5;

  qs('#tpTotal').textContent   = (base + suppl).toFixed(2) + ' €/km';
  qs('#tpEssence').textContent = ((conso / 100) * prix * 100).toFixed(2) + ' €';
}

// ============================================================
// HELPER
// ============================================================
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// EVENTS — BUBBLES
// ============================================================
qs('#bubbleNew').addEventListener('click', () => {
  openSheet('sheetNewCourse');
  qs('#sheetNewCourse').scrollTop = 0;
  qs('#routeResult').style.display = 'none';
  currentRoute = null;
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
  renderHistorique();
  openSheet('sheetHistorique');
});

qs('#bubbleStats').addEventListener('click', () => {
  openSheet('sheetStats');
});

qs('#bubbleSam').addEventListener('click', () => {
  openSheet('sheetNewCourse');
  qs('#routeResult').style.display = 'none';
  currentRoute = null;
  qsa('.pill[data-type]').forEach(p => p.classList.remove('active'));
  qs('.pill[data-type="sam"]').classList.add('active');
  showToast('🍺 Mode SAM activé !');
});

// ============================================================
// EVENTS — SHEET CLOSE BUTTONS
// ============================================================
qsa('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeSheet(btn.dataset.close));
});

qsa('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    qs('#' + btn.dataset.modal).style.display = 'none';
  });
});

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
// EVENTS — CALCULATE ROUTE
// ============================================================
qs('#btnCalculer').addEventListener('click', async () => {
  const dep = qs('#addrDepart').value.trim();
  const arr = qs('#addrArrivee').value.trim();

  if (!dep || !arr) {
    showToast('⚠️ Veuillez renseigner les deux adresses.');
    return;
  }

  qs('#btnCalculer').textContent = 'Calcul en cours…';
  qs('#btnCalculer').disabled = true;

  const result = await calculateRoute(dep, arr);

  qs('#btnCalculer').textContent = 'Calculer le trajet →';
  qs('#btnCalculer').disabled = false;

  if (result) {
    displayRouteResult(result.km, result.min);
    showToast(`✅ Trajet calculé : ${result.km} km en ~${result.min} min`);
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
          showToast('📍 Position actuelle récupérée');
        }
      });
  }, () => showToast('❌ Impossible de récupérer la position.'));
});

// ============================================================
// EVENTS — NOTIFICATIONS
// ============================================================
qs('#notifBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  qs('#profilePanel').style.display = 'none';
  toggleNotifPanel();
});

qs('#notifClearAll').addEventListener('click', () => {
  NOTIFICATIONS.length = 0;
  renderNotifications();
  showToast('🔕 Notifications effacées');
});

// ============================================================
// EVENTS — PROFILE / MENUS
// ============================================================
qs('#profileToggle').addEventListener('click', (e) => {
  e.stopPropagation();
  qs('#notifPanel').style.display = 'none';
  toggleProfile();
});

document.addEventListener('click', (e) => {
  const profilePanel = qs('#profilePanel');
  const notifPanel   = qs('#notifPanel');
  if (!qs('#profileToggle').contains(e.target) && !profilePanel.contains(e.target)) {
    profilePanel.style.display = 'none';
  }
  if (!qs('#notifBtn').contains(e.target) && !notifPanel.contains(e.target)) {
    notifPanel.style.display = 'none';
  }
});

qs('#btnConfig').addEventListener('click', () => {
  qs('#profilePanel').style.display = 'none';
  qs('#mapboxToken').value  = CONFIG.mapboxToken !== 'VOTRE_TOKEN_MAPBOX_ICI' ? CONFIG.mapboxToken : '';
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

// ============================================================
// SAVE CONFIG
// ============================================================
qs('#btnSaveConfig').addEventListener('click', () => {
  const token = qs('#mapboxToken').value.trim();
  const url   = qs('#supabaseUrl').value.trim();
  const key   = qs('#supabaseKey').value.trim();

  if (token) { CONFIG.mapboxToken = token; localStorage.setItem('ml_mapbox', token); }
  if (url)   { CONFIG.supabaseUrl = url;   localStorage.setItem('ml_sb_url', url); }
  if (key)   { CONFIG.supabaseKey = key;   localStorage.setItem('ml_sb_key', key); }

  qs('#modalConfig').style.display = 'none';
  showToast('✅ Configuration sauvegardée. Rechargez la page.');
  initSupabase();
  if (token) mapboxgl.accessToken = token;
});

// SAVE TARIFS
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
// COPY SQL
// ============================================================
qs('#btnCopySQL').addEventListener('click', () => {
  navigator.clipboard.writeText(SQL_SETUP)
    .then(() => showToast('📋 SQL copié dans le presse-papier !'))
    .catch(() => showToast('Sélectionne et copie manuellement le SQL'));
});

// ============================================================
// TICKET PDF
// ============================================================
qs('#btnTicket').addEventListener('click', generateTicket);

// ============================================================
// SAVE COURSE
// ============================================================
qs('#btnSauvegarder').addEventListener('click', async () => {
  const nom  = qs('#beneficiaireName').value.trim();
  const dep  = qs('#addrDepart').value.trim();
  const arr  = qs('#addrArrivee').value.trim();

  if (!nom || !dep || !arr) {
    showToast('⚠️ Remplissez au moins le bénéficiaire et les adresses.');
    return;
  }
  if (!currentRoute) {
    showToast('⚠️ Calculez d\'abord le trajet.');
    return;
  }

  const typeEl = qs('.pill.active[data-type]');
  const type   = typeEl?.dataset.type || 'course';

  const courseData = {
    nom, type,
    depart: dep, arrivee: arr,
    km: currentRoute.km, duree_min: currentRoute.min,
    prix_benef: parseFloat(currentRoute.prixBenef),
    cout_essence: parseFloat(currentRoute.prixEss),
    benevole_id: qs('#benevoleSelect').value || null,
    date_heure: qs('#dateHeure').value || new Date().toISOString(),
    notes: qs('#courseNotes').value,
    statut: 'attente',
    created_at: new Date().toISOString(),
  };

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('courses').insert([courseData]);
      if (error) throw error;
      showToast('✅ Course enregistrée en base !');
    } catch (err) {
      handleSupabaseError(err);
      return;
    }
  } else {
    SAMPLE_HISTORIQUE.unshift({ ...courseData, id: Date.now(), prix: currentRoute.prixBenef, date: new Date().toLocaleDateString('fr-FR') });
    showToast('✅ Course enregistrée !');
  }

  // Notif
  NOTIFICATIONS.unshift({ id: Date.now(), icon:'🚗', title:'Course enregistrée', body:`${nom} — ${dep.split(',')[0]} → ${arr.split(',')[0]}`, time:'À l\'instant', unread:true });
  renderNotifications();

  closeSheet('sheetNewCourse');
  clearRoute();
  clearMarkers();
  currentRoute = null;

  setTimeout(() => { renderHistorique(); openSheet('sheetHistorique'); }, 500);
});

// ============================================================
// AUTOCOMPLETE SETUP
// ============================================================
setupAutocomplete('addrDepart');
setupAutocomplete('addrArrivee');

// ============================================================
// INIT
// ============================================================
function init() {
  initMap();
  initSupabase();
  initSearchBar();
  renderNotifications();

  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  qs('#dateHeure').value = now.toISOString().slice(0, 16);

  if (CONFIG.mapboxToken === 'VOTRE_TOKEN_MAPBOX_ICI') {
    setTimeout(() => {
      qs('#modalConfig').style.display = 'flex';
      showToast('👋 Bienvenue ! Configurez votre token Mapbox pour commencer.');
    }, 800);
  }

  console.log('🌊 Mobilité Littoral & SAM démarré');
}

init();
