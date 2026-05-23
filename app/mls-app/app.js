/* ============================================================
   MOBILITÉ LITTORAL & SAM — app.js
   Avec système d'authentification et gestion des rôles
   ============================================================ */
'use strict';

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
// SUPABASE + AUTH STATE
// ============================================================
let SB         = null;
let currentUser = null;   // session Supabase
let currentRole = null;   // 'admin' | 'benevole'
let currentProfile = null; // row dans profiles

function initSupabase() {
  SB = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

// ============================================================
// AUTH — LOGIN
// ============================================================
async function login(email, password) {
  const { data, error } = await SB.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function logout() {
  await SB.auth.signOut();
  currentUser = null;
  currentRole = null;
  currentProfile = null;
  showLoginScreen();
}

async function loadProfile(userId) {
  const { data, error } = await SB.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

// ============================================================
// AUTH — LOGIN SCREEN
// ============================================================
function showLoginScreen() {
  qs('#loginScreen').style.display = 'flex';
  qs('#appMain').style.display     = 'none';
  qs('#loginEmail').value    = '';
  qs('#loginPassword').value = '';
  qs('#loginError').style.display = 'none';
}

function showApp() {
  qs('#loginScreen').style.display = 'none';
  qs('#appMain').style.display     = 'block';
}

function applyRoleUI() {
  const isAdmin = currentRole === 'admin';

  // Éléments admin-only : visibles pour admin, cachés pour bénévole
  qsa('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  // Role badge
  const badge = qs('#roleBadge');
  if (!isAdmin) {
    badge.textContent = '🙋 Bénévole';
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }

  // Profil panel
  const nom   = currentProfile?.nom || currentUser?.email || '—';
  const seed  = nom.toLowerCase().replace(/\s+/g, '');
  qs('#profileName').textContent  = nom;
  qs('#profileRole').textContent  = isAdmin ? '⭐ Administrateur' : '🙋 Bénévole';
  qs('#profileAvatar').src        = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=2563eb`;
  qs('#profilePanelAvatar').src   = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=2563eb`;

  // Bénévole : on préassigne sa propre entrée dans le select de course
  if (!isAdmin && currentProfile?.benevole_id) {
    // sera géré dans populateBenevoleSelect
  }
}

// ============================================================
// EVENTS — LOGIN FORM
// ============================================================
qs('#btnLogin').addEventListener('click', async () => {
  const email    = qs('#loginEmail').value.trim();
  const password = qs('#loginPassword').value;
  const errEl    = qs('#loginError');

  if (!email || !password) {
    errEl.textContent = '⚠️ Email et mot de passe requis.';
    errEl.style.display = 'block';
    return;
  }

  qs('#btnLogin').textContent = 'Connexion…';
  qs('#btnLogin').disabled    = true;
  errEl.style.display = 'none';

  try {
    currentUser    = await login(email, password);
    currentProfile = await loadProfile(currentUser.id);
    currentRole    = currentProfile?.role || 'benevole';

    showApp();
    applyRoleUI();
    await bootApp();

  } catch (err) {
    console.error(err);
    errEl.textContent   = '❌ ' + (err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message);
    errEl.style.display = 'block';
  } finally {
    qs('#btnLogin').textContent = 'Se connecter';
    qs('#btnLogin').disabled    = false;
  }
});

qs('#loginPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') qs('#btnLogin').click();
});

qs('#pwdToggle').addEventListener('click', () => {
  const inp = qs('#loginPassword');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

// ============================================================
// GESTION DES COMPTES (admin)
// ============================================================
async function openGererComptes() {
  qs('#profilePanel').style.display = 'none';
  qs('#comptesList').innerHTML = '<div class="loading-msg">Chargement…</div>';
  qs('#modalComptes').style.display = 'flex';

  try {
    const { data, error } = await SB.from('profiles').select('*').order('nom');
    if (error) throw error;

    if (!data.length) {
      qs('#comptesList').innerHTML = '<div class="empty-msg">Aucun compte enregistré.</div>';
      return;
    }

    qs('#comptesList').innerHTML = data.map(p => `
      <div class="compte-item">
        <div class="compte-info">
          <strong>${p.nom || '—'}</strong>
          <span class="compte-email">${p.email || ''}</span>
        </div>
        <span class="compte-role ${p.role}">${p.role === 'admin' ? '⭐ Admin' : '🙋 Bénévole'}</span>
      </div>
    `).join('');
  } catch (err) {
    qs('#comptesList').innerHTML = '<div class="empty-msg">Erreur chargement.</div>';
  }
}

qs('#btnGererComptes').addEventListener('click', openGererComptes);

qs('#btnCreerCompte').addEventListener('click', async () => {
  const nom   = qs('#newUserNom').value.trim();
  const email = qs('#newUserEmail').value.trim();
  const pwd   = qs('#newUserPwd').value;
  const role  = qs('#newUserRole').value;

  if (!nom || !email || !pwd) { showToast('⚠️ Tous les champs sont requis.'); return; }
  if (pwd.length < 6)         { showToast('⚠️ Mot de passe : 6 caractères minimum.'); return; }

  qs('#btnCreerCompte').textContent = 'Création…';
  qs('#btnCreerCompte').disabled    = true;

  try {
    // Crée le compte Auth Supabase via Admin (service role nécessaire)
    // On utilise signUp en mode anon puis on force le profil
    const { data: signData, error: signErr } = await SB.auth.admin.createUser({
      email,
      password: pwd,
      email_confirm: true,
      user_metadata: { nom, role },
    });
    if (signErr) throw signErr;

    // Insère dans profiles
    const { error: profErr } = await SB.from('profiles').insert([{
      id:    signData.user.id,
      email, nom, role,
    }]);
    if (profErr) throw profErr;

    showToast('✅ Compte créé pour ' + nom + ' !');
    qs('#newUserNom').value   = '';
    qs('#newUserEmail').value = '';
    qs('#newUserPwd').value   = '';
    openGererComptes(); // refresh liste

  } catch (err) {
    console.error(err);
    // Fallback si pas de service role : on utilise signUp classique
    if (err.message?.includes('not allowed') || err.message?.includes('admin')) {
      try {
        const { data: s2, error: e2 } = await SB.auth.signUp({ email, password: pwd });
        if (e2) throw e2;
        await SB.from('profiles').insert([{ id: s2.user.id, email, nom, role }]);
        showToast('✅ Compte créé — ' + nom + ' doit confirmer son email.');
        qs('#newUserNom').value = ''; qs('#newUserEmail').value = ''; qs('#newUserPwd').value = '';
        openGererComptes();
      } catch (e3) {
        showToast('❌ Erreur : ' + e3.message);
      }
    } else {
      showToast('❌ Erreur : ' + err.message);
    }
  } finally {
    qs('#btnCreerCompte').textContent = 'Créer le compte';
    qs('#btnCreerCompte').disabled    = false;
  }
});

qs('#newPwdToggle').addEventListener('click', () => {
  const inp = qs('#newUserPwd');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

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
}

function clearMarkers() { markers.forEach(m => m.remove()); markers = []; }
function clearRoute() {
  if (map.getLayer('route')) map.removeLayer('route');
  if (map.getSource('route')) map.removeSource('route');
}

async function geocodeAddress(addr) {
  const res  = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?country=fr&access_token=${CONFIG.mapboxToken}`);
  const data = await res.json();
  return data.features?.[0]?.center || null;
}

async function calculateRoute(depAddr, arrAddr) {
  showProgress(true);
  try {
    const [dep, arr] = await Promise.all([geocodeAddress(depAddr), geocodeAddress(arrAddr)]);
    if (!dep || !arr) { showToast('❌ Adresse introuvable.'); showProgress(false); return null; }

    const data = await (await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${dep[0]},${dep[1]};${arr[0]},${arr[1]}?geometries=geojson&overview=full&access_token=${CONFIG.mapboxToken}`)).json();
    if (!data.routes?.length) { showToast('❌ Trajet introuvable.'); showProgress(false); return null; }

    const route = data.routes[0];
    const km  = parseFloat((route.distance / 1000).toFixed(1));
    const min = Math.round(route.duration / 60);

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
    console.error(err); showToast('❌ Erreur calcul trajet.'); showProgress(false); return null;
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
  qs('#rcKm').textContent        = km;
  qs('#rcTemps').textContent     = min;
  qs('#rcPrixBenef').textContent = prixBenef + ' €';
  qs('#rcEssence').textContent   = prixEss + ' €';
  qs('#tarifDetail').innerHTML   = `<strong>Détail :</strong> ${CONFIG.tarifBase.toFixed(2)} + ${CONFIG.tarifSuppl.toFixed(2)} = <strong>${tarifTotal.toFixed(2)} €/km</strong>`;
  qs('#routeResult').style.display = 'block';
  currentRoute = { km, min, prixBenef, prixEss };
}

// ============================================================
// TICKET PDF
// ============================================================
function generateTicket() {
  if (!currentRoute) { showToast('Calculez d\'abord un trajet.'); return; }
  const { jsPDF } = window.jspdf;
  const doc  = new jsPDF({ unit: 'mm', format: 'a5' });
  const nom  = qs('#beneficiaireName').value || '—';
  const dep  = qs('#addrDepart').value  || '—';
  const arr  = qs('#addrArrivee').value || '—';
  const date = qs('#dateHeure').value   || new Date().toLocaleString('fr-FR');
  const benv = currentRole === 'admin'
    ? (qs('#benevoleSelect').selectedOptions[0]?.text || '—')
    : (currentProfile?.nom || '—');
  const type = qs('.pill.active[data-type]')?.dataset.type || 'course';
  const { km, min, prixBenef, prixEss } = currentRoute;

  doc.setFillColor(0,113,227); doc.rect(0,0,148,28,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text('Mobilité Littoral & SAM', 10, 12);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.text('Ticket de course', 10, 20);
  doc.text(`N° ${Date.now().toString().slice(-6)}`, 118, 12);

  doc.setTextColor(28,28,30); let y = 36;
  const rows = [
    ['Personne transportée', nom],
    ['Type', type.charAt(0).toUpperCase() + type.slice(1)],
    ['Bénévole', benv],
    ['Date / Heure', date],
    ['Départ', dep],
    ['Arrivée', arr],
  ];
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('Informations', 10, y); y += 8;
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  rows.forEach(([label, val]) => {
    doc.setTextColor(100,100,100); doc.text(label + ' :', 10, y);
    doc.setTextColor(28,28,30);   doc.text(String(val), 55, y, { maxWidth: 85 });
    y += String(val).length > 40 ? 10 : 8;
  });
  y += 4; doc.setDrawColor(200,200,200); doc.line(10, y, 138, y); y += 8;
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('Résumé', 10, y); y += 10;

  [[`${km} km`,'Distance'],[`${min} min`,'Durée'],[`${prixBenef} €`,'Tarif'],[`${prixEss} €`,'Essence']].forEach((c,i) => {
    const x = 10 + (i%2)*65, yy = y + Math.floor(i/2)*24;
    doc.setFillColor(245,247,250); doc.roundedRect(x, yy-6, 58, 20, 3, 3, 'F');
    doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.text(c[1], x+5, yy+1);
    doc.setTextColor(0,113,227);   doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text(c[0], x+5, yy+10);
  });
  doc.save(`ticket-${nom.replace(/ /g,'_')}-${Date.now().toString().slice(-6)}.pdf`);
  showToast('🎫 Ticket PDF généré !');
}

// ============================================================
// SUPABASE — COURSES
// ============================================================
async function loadCourses(filtre = 'actives') {
  if (!SB) return [];
  try {
    let query = SB.from('courses').select('*').order('created_at', { ascending: false });

    // Bénévole : voit toutes les courses (comme demandé)
    if (filtre === 'actives')   query = query.in('statut', ['attente','en-cours']);
    if (filtre === 'semaine')   { const d = new Date(); d.setDate(d.getDate()-7); query = query.gte('created_at', d.toISOString()); }
    if (filtre === 'mois')      { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); query = query.gte('created_at', d.toISOString()); }
    if (filtre === 'sam')       query = query.eq('type', 'sam');
    if (filtre === 'mescourses' && currentProfile?.id) query = query.eq('benevole_id', currentProfile.benevole_id);

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data || [];
  } catch (err) { console.error(err); return []; }
}

async function saveCourse(courseData) {
  if (!SB) return false;
  try {
    const { error } = await SB.from('courses').insert([courseData]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(err);
    if (err?.message?.includes('relation') || err?.message?.includes('schema')) {
      qs('#sqlContent').textContent = SQL_SETUP;
      qs('#modalSQL').style.display = 'flex';
      showToast('⚠️ Table manquante — SQL prêt à copier !', 4000);
    } else {
      showToast('❌ Erreur : ' + (err.message || 'inconnue'));
    }
    return false;
  }
}

async function updateCourseStatut(id, statut) {
  if (!SB) return;
  await SB.from('courses').update({ statut }).eq('id', id);
}

// ============================================================
// SUPABASE — BÉNÉVOLES
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
  // Si bénévole connecté → préselectionne sa propre fiche
  if (currentRole === 'benevole' && currentProfile?.benevole_id) {
    sel.value = currentProfile.benevole_id;
  }
}

// ============================================================
// STATS
// ============================================================
async function loadStats() {
  if (!SB) return;
  try {
    const debut = new Date(); debut.setDate(1); debut.setHours(0,0,0,0);
    const { data } = await SB.from('courses').select('*').gte('created_at', debut.toISOString());
    if (!data) return;
    const kmTotal  = data.reduce((s,c) => s + (parseFloat(c.km)||0), 0);
    const recettes = data.reduce((s,c) => s + (parseFloat(c.prix_benef)||0), 0);
    const essence  = data.reduce((s,c) => s + (parseFloat(c.cout_essence)||0), 0);
    qs('#statTotalCourses').textContent = data.length;
    qs('#statTotalKm').textContent      = Math.round(kmTotal).toLocaleString('fr-FR');
    qs('#statTotalBenef').textContent   = new Set(data.map(c => c.nom)).size;
    qs('#statSAM').textContent          = data.filter(c => c.type==='sam').length;
    qs('#statRecettes').textContent     = recettes.toFixed(2) + ' €';
    qs('#statEssence').textContent      = '−' + essence.toFixed(2) + ' €';
  } catch (err) { console.error(err); }
}

// ============================================================
// RENDER — HELPERS
// ============================================================
function typeIcon(t)  { return {courses:'🛒',medical:'🏥',vacances:'🌴',sam:'🍺',beneficiaire:'🚗'}[t]||'🚗'; }
function typeLabel(t) { return {courses:'Courses',medical:'Médical',vacances:'Vacances',sam:'SAM',beneficiaire:'Privé'}[t]||t; }
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ============================================================
// RENDER — COURSES
// ============================================================
async function renderCourses() {
  const list = qs('#courseList');
  list.innerHTML = '<div class="loading-msg">Chargement…</div>';
  const courses = await loadCourses('actives');

  qs('.count-badge').textContent = courses.length;
  const bb = qs('.bubble-badge');
  bb.textContent = courses.length;
  bb.style.display = courses.length ? 'flex' : 'none';

  if (!courses.length) { list.innerHTML = '<div class="empty-msg">🚗 Aucune course en cours</div>'; return; }

  list.innerHTML = courses.map(c => `
    <div class="course-item" data-id="${c.id}">
      <div class="ci-icon ${c.type}">${typeIcon(c.type)}</div>
      <div class="ci-content">
        <div class="ci-name"><span class="status-dot ${c.statut}"></span>${c.nom}</div>
        <div class="ci-route">${c.depart||'—'} → ${c.arrivee||'—'}</div>
        <div class="ci-route">${c.benevole_nom ? '👤 ' + c.benevole_nom : ''}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${fmtDate(c.date_heure)}</div>
        <div class="ci-price">${parseFloat(c.prix_benef||0).toFixed(2)} €</div>
        <div class="ci-actions">
          <button class="btn-statut" data-id="${c.id}" data-statut="en-cours" title="Démarrer">▶</button>
          <button class="btn-statut done" data-id="${c.id}" data-statut="termine" title="Terminer">✓</button>
        </div>
      </div>
    </div>
  `).join('');

  qsa('.btn-statut', list).forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await updateCourseStatut(parseInt(btn.dataset.id), btn.dataset.statut);
      showToast(btn.dataset.statut === 'termine' ? '✅ Course terminée !' : '▶ Course démarrée');
      renderCourses();
    });
  });
}

// ============================================================
// RENDER — BÉNÉVOLES
// ============================================================
async function renderBenevoles() {
  const list = qs('#benevolesList');
  list.innerHTML = '<div class="loading-msg">Chargement…</div>';
  const benevoles = await loadBenevoles();

  if (!benevoles.length) { list.innerHTML = '<div class="empty-msg">👥 Aucun bénévole</div>'; return; }

  const seeds = ['marie','jean','sophie','pierre','alice','bob','claire','david'];
  list.innerHTML = benevoles.map((b,i) => `
    <div class="bv-card">
      <div class="bv-avatar"><img src="https://api.dicebear.com/7.x/thumbs/svg?seed=${seeds[i%seeds.length]}&backgroundColor=2563eb" alt="${b.nom}" /></div>
      <div class="bv-name">${b.nom}</div>
      ${b.telephone ? `<div class="bv-phone">${b.telephone}</div>` : ''}
      <div class="bv-status ${b.statut}">${b.statut==='dispo'?'● Disponible':'● En course'}</div>
      <div class="bv-toggle-row">
        <button class="btn-bv-statut" data-id="${b.id}" data-statut="${b.statut==='dispo'?'occupe':'dispo'}">
          ${b.statut==='dispo'?'Marquer en course':'Marquer disponible'}
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

// ============================================================
// RENDER — HISTORIQUE
// ============================================================
async function renderHistorique(filtre = 'tout') {
  const list = qs('#histoList');
  list.innerHTML = '<div class="loading-msg">Chargement…</div>';
  const courses = await loadCourses(filtre);

  if (!courses.length) { list.innerHTML = '<div class="empty-msg">📋 Aucune course</div>'; return; }

  list.innerHTML = courses.map(c => `
    <div class="course-item">
      <div class="ci-icon ${c.type}">${typeIcon(c.type)}</div>
      <div class="ci-content">
        <div class="ci-name">${c.nom}</div>
        <div class="ci-route">${parseFloat(c.km||0).toFixed(1)} km • ${fmtDate(c.created_at)}</div>
        <div class="ci-route">${c.benevole_nom ? '👤 ' + c.benevole_nom : ''}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${typeLabel(c.type)}</div>
        <div class="ci-price">${parseFloat(c.prix_benef||0).toFixed(2)} €</div>
        <div class="ci-actions">
          ${c.statut !== 'termine' ? `<button class="btn-statut done" data-id="${c.id}" data-statut="termine" title="Terminer">✓</button>` : '<span class="statut-done">✓ Terminée</span>'}
        </div>
      </div>
    </div>
  `).join('');

  qsa('.btn-statut', list).forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await updateCourseStatut(parseInt(btn.dataset.id), btn.dataset.statut);
      showToast('✅ Course terminée !');
      renderHistorique(filtre);
    });
  });
}

// ============================================================
// AJOUT BÉNÉVOLE
// ============================================================
function openAddBenevole() {
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
      <div class="field-group"><label>Nom complet</label><input type="text" class="input-field" id="bvNom" placeholder="Prénom Nom" /></div>
      <div class="field-group"><label>Téléphone</label><input type="tel" class="input-field" id="bvTel" placeholder="06 xx xx xx xx" /></div>
      <div class="field-group"><label>Email (optionnel)</label><input type="email" class="input-field" id="bvEmail" placeholder="email@exemple.fr" /></div>
      <button class="btn-primary" id="btnSaveBv">Ajouter</button>
    </div>`;
  document.body.appendChild(modal);

  qs('#closeAddBv').addEventListener('click', () => modal.style.display = 'none');
  qs('#btnSaveBv').addEventListener('click', async () => {
    const nom = qs('#bvNom').value.trim();
    if (!nom) { showToast('⚠️ Nom requis'); return; }
    const { error } = await SB.from('benevoles').insert([{ nom, telephone: qs('#bvTel').value.trim()||null, email: qs('#bvEmail').value.trim()||null, statut:'dispo' }]);
    if (error) { showToast('❌ Erreur : ' + error.message); return; }
    showToast('✅ Bénévole ajouté !');
    modal.style.display = 'none';
    renderBenevoles();
    populateBenevoleSelect();
  });
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
  if (SB) { try { await SB.from('notifications').insert([{ icon, titre, body, unread: true }]); } catch(e) {} }
  NOTIFICATIONS.unshift({ icon, titre, body, unread: true, id: Date.now(), created_at: new Date().toISOString() });
  renderNotifications();
}

function renderNotifications() {
  const list  = qs('#notifList');
  const empty = qs('#notifEmpty');
  const badge = qs('#notifBadge');
  const unread = NOTIFICATIONS.filter(n => n.unread);
  badge.textContent   = unread.length;
  badge.style.display = unread.length ? 'flex' : 'none';

  if (!NOTIFICATIONS.length) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  list.innerHTML = NOTIFICATIONS.map(n => `
    <div class="notif-item ${n.unread?'unread':''}" data-id="${n.id}">
      <span class="ni-icon">${n.icon}</span>
      <div class="ni-content">
        <div class="ni-title">${n.titre}</div>
        <div class="ni-body">${n.body}</div>
        <div class="ni-time">${fmtDate(n.created_at)}</div>
      </div>
    </div>`).join('');

  qsa('.notif-item', list).forEach(item => {
    item.addEventListener('click', async () => {
      const n = NOTIFICATIONS.find(x => String(x.id) === item.dataset.id);
      if (n) { n.unread = false; if (SB) { try { await SB.from('notifications').update({ unread:false }).eq('id', item.dataset.id); } catch(e){} } }
      item.classList.remove('unread');
      renderNotifications();
    });
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
        const data = await (await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=fr&types=address,place,poi,locality&access_token=${CONFIG.mapboxToken}&limit=6`)).json();
        const features = data.features || [];
        if (!features.length) { results.style.display = 'none'; return; }
        results.innerHTML = features.map(f => {
          const parts = f.place_name.split(', ');
          const icon  = f.place_type?.[0]==='poi'?'📍':f.place_type?.[0]==='address'?'🏠':'🏙️';
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
            searchMarker = new mapboxgl.Marker({ color: '#0071E3' }).setLngLat([lon,lat]).setPopup(new mapboxgl.Popup({offset:25}).setText(item.dataset.name)).addTo(map);
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
    if (!qs('#searchBar')?.contains(e.target)) results.style.display = 'none';
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
      try {
        const data = await (await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=fr&types=address,place,poi&access_token=${CONFIG.mapboxToken}&limit=5`)).json();
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
      item.onmousedown = e => { e.preventDefault(); inp.value = f.place_name; removeDropdown(); };
      dropdown.appendChild(item);
    });
    const rect = inp.getBoundingClientRect();
    dropdown.style.cssText = `top:${rect.bottom+window.scrollY+4}px;left:${rect.left}px;width:${rect.width}px`;
    document.body.appendChild(dropdown);
  }
  function removeDropdown() { if (dropdown) { dropdown.remove(); dropdown = null; } }
  input.addEventListener('blur', () => setTimeout(removeDropdown, 150));
}

// ============================================================
// TARIFS
// ============================================================
function updateTarifPreview() {
  const base  = parseFloat(qs('#tarifBase').value)     || 0.55;
  const suppl = parseFloat(qs('#tarifSuppl').value)    || 0.20;
  const prix  = parseFloat(qs('#prixCarburant').value) || 2.30;
  const conso = parseFloat(qs('#consommation').value)  || 7.5;
  qs('#tpTotal').textContent   = (base+suppl).toFixed(2) + ' €/km';
  qs('#tpEssence').textContent = ((conso/100)*prix*100).toFixed(2) + ' €';
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
  if (!bar) { bar = document.createElement('div'); bar.className = 'route-progress-bar'; document.body.prepend(bar); }
  bar.style.display = show ? 'block' : 'none';
}

// ============================================================
// SQL SETUP STRING
// ============================================================
const SQL_SETUP = `-- Mobilité Littoral & SAM — Supabase SQL Setup

CREATE TABLE IF NOT EXISTS public.profiles (
  id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nom   text,
  role  text DEFAULT 'benevole',
  benevole_id bigint,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benevoles (
  id         bigserial PRIMARY KEY,
  nom        text NOT NULL,
  telephone  text,
  email      text,
  statut     text DEFAULT 'dispo',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id           bigserial PRIMARY KEY,
  nom          text NOT NULL,
  type         text DEFAULT 'beneficiaire',
  depart       text,
  arrivee      text,
  km           numeric(8,2),
  duree_min    integer,
  prix_benef   numeric(8,2),
  cout_essence numeric(8,2),
  benevole_id  bigint,
  benevole_nom text,
  date_heure   timestamptz,
  notes        text,
  statut       text DEFAULT 'attente',
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         bigserial PRIMARY KEY,
  icon       text DEFAULT '🔔',
  titre      text NOT NULL,
  body       text,
  unread     boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benevoles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own"  ON public.profiles      FOR ALL USING (auth.uid() = id);
CREATE POLICY "benevoles_all" ON public.benevoles     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "courses_all"   ON public.courses       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifs_all"    ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Trigger: crée automatiquement un profil à chaque inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nom', split_part(new.email,'@',1)),
    COALESCE(new.raw_user_meta_data->>'role', 'benevole')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

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
// EVENTS — CLOSE
// ============================================================
qsa('[data-close]').forEach(btn => btn.addEventListener('click', () => closeSheet(btn.dataset.close)));
qsa('[data-modal]').forEach(btn => btn.addEventListener('click', () => { qs('#'+btn.dataset.modal).style.display='none'; }));

// ============================================================
// EVENTS — PILLS
// ============================================================
qsa('.pill[data-type]').forEach(p => {
  p.addEventListener('click', () => {
    qsa('.pill[data-type]').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
  });
});

qsa('.pill[data-histo]').forEach(p => {
  p.addEventListener('click', () => {
    qsa('.pill[data-histo]').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    renderHistorique(p.dataset.histo);
  });
});

// ============================================================
// EVENTS — CALCULER ROUTE
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
  if (result) { displayRouteResult(result.km, result.min); showToast(`✅ ${result.km} km — ~${result.min} min`); }
});

// ============================================================
// EVENTS — LOCALISER
// ============================================================
qs('#locateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) { showToast('⚠️ Géolocalisation indisponible.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${CONFIG.mapboxToken}`)
      .then(r => r.json()).then(data => {
        if (data.features?.length) { qs('#addrDepart').value = data.features[0].place_name; showToast('📍 Position récupérée'); }
      });
  }, () => showToast('❌ Position indisponible.'));
});

// ============================================================
// EVENTS — NOTIFICATIONS & PROFIL
// ============================================================
qs('#notifBtn').addEventListener('click', e => {
  e.stopPropagation();
  qs('#profilePanel').style.display = 'none';
  const np = qs('#notifPanel');
  np.style.display = np.style.display === 'none' ? 'block' : 'none';
  if (np.style.display === 'block') renderNotifications();
});

qs('#notifClearAll').addEventListener('click', async () => {
  NOTIFICATIONS = [];
  if (SB) { try { await SB.from('notifications').delete().neq('id',0); } catch(e){} }
  renderNotifications();
  showToast('🔕 Notifications effacées');
});

qs('#profileToggle').addEventListener('click', e => {
  e.stopPropagation();
  qs('#notifPanel').style.display = 'none';
  const pp = qs('#profilePanel');
  pp.style.display = pp.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', e => {
  const pp = qs('#profilePanel'), np = qs('#notifPanel');
  if (pp && !qs('#profileToggle').contains(e.target) && !pp.contains(e.target)) pp.style.display = 'none';
  if (np && !qs('#notifBtn').contains(e.target)      && !np.contains(e.target)) np.style.display = 'none';
});

qs('#btnDeconnexion').addEventListener('click', () => logout());

// ============================================================
// EVENTS — ADMIN MENUS
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

qsa('#tarifBase, #tarifSuppl, #prixCarburant, #consommation').forEach(el => el.addEventListener('input', updateTarifPreview));

// ============================================================
// EVENTS — TICKET & SAVE COURSE
// ============================================================
qs('#btnTicket').addEventListener('click', generateTicket);

qs('#btnSauvegarder').addEventListener('click', async () => {
  const nom = qs('#beneficiaireName').value.trim();
  const dep = qs('#addrDepart').value.trim();
  const arr = qs('#addrArrivee').value.trim();
  if (!nom || !dep || !arr) { showToast('⚠️ Nom et adresses requis.'); return; }
  if (!currentRoute)        { showToast('⚠️ Calculez d\'abord le trajet.'); return; }

  const type  = qs('.pill.active[data-type]')?.dataset.type || 'beneficiaire';
  const bvSel = qs('#benevoleSelect');

  // Si bénévole connecté → s'assigne automatiquement
  let bvId  = bvSel.value ? parseInt(bvSel.value) : null;
  let bvNom = bvSel.value ? bvSel.selectedOptions[0]?.text.replace(' (en course)','') : null;
  if (currentRole === 'benevole' && currentProfile) {
    bvId  = currentProfile.benevole_id || bvId;
    bvNom = currentProfile.nom || bvNom;
  }

  const ok = await saveCourse({
    nom, type, depart: dep, arrivee: arr,
    km: currentRoute.km, duree_min: currentRoute.min,
    prix_benef:   parseFloat(currentRoute.prixBenef),
    cout_essence: parseFloat(currentRoute.prixEss),
    benevole_id: bvId, benevole_nom: bvNom,
    date_heure:  qs('#dateHeure').value || new Date().toISOString(),
    notes:       qs('#courseNotes').value.trim() || null,
    statut:      'attente',
    created_at:  new Date().toISOString(),
  });
  if (!ok) return;

  await addNotification('🚗', 'Course enregistrée', `${nom} — ${dep.split(',')[0]} → ${arr.split(',')[0]}`);
  showToast('✅ Course enregistrée !');
  closeSheet('sheetNewCourse');
  clearRoute(); clearMarkers(); currentRoute = null;

  // Reset form
  ['#beneficiaireName','#addrDepart','#addrArrivee','#courseNotes'].forEach(s => qs(s).value = '');
  qs('#routeResult').style.display = 'none';
  qsa('.pill[data-type]').forEach(p => p.classList.remove('active'));
  qs('.pill[data-type="beneficiaire"]').classList.add('active');

  setTimeout(() => { renderHistorique('tout'); openSheet('sheetHistorique'); }, 500);
});

qs('#btnAddBenevole').addEventListener('click', openAddBenevole);

qs('#btnCopySQL').addEventListener('click', () => {
  navigator.clipboard.writeText(SQL_SETUP)
    .then(() => showToast('📋 SQL copié !'))
    .catch(() => showToast('Copie manuelle nécessaire.'));
});

// ============================================================
// BOOT APP (après login)
// ============================================================
async function bootApp() {
  // Init carte si pas encore fait
  if (!map) {
    initMap();
    initSearchBar();
    setupAutocomplete('addrDepart');
    setupAutocomplete('addrArrivee');
  }

  // Date par défaut
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes()/15)*15, 0, 0);
  qs('#dateHeure').value = now.toISOString().slice(0,16);

  await loadNotifications();
  renderNotifications();

  console.log(`🌊 Connecté en tant que ${currentRole} : ${currentProfile?.nom}`);
}


// ============================================================
// RESET MOT DE PASSE
// ============================================================

// Écran reset — toggles visibilité mdp
function setupResetScreen() {
  qs('#resetPwdToggle1').addEventListener('click', () => {
    const i = qs('#resetPwd1');
    i.type = i.type === 'password' ? 'text' : 'password';
  });
  qs('#resetPwdToggle2').addEventListener('click', () => {
    const i = qs('#resetPwd2');
    i.type = i.type === 'password' ? 'text' : 'password';
  });

  qs('#btnResetPwd').addEventListener('click', async () => {
    const pwd1  = qs('#resetPwd1').value;
    const pwd2  = qs('#resetPwd2').value;
    const errEl = qs('#resetError');

    errEl.style.display = 'none';

    if (!pwd1 || !pwd2) {
      errEl.textContent = '⚠️ Remplis les deux champs.';
      errEl.style.display = 'block'; return;
    }
    if (pwd1.length < 6) {
      errEl.textContent = '⚠️ Minimum 6 caractères.';
      errEl.style.display = 'block'; return;
    }
    if (pwd1 !== pwd2) {
      errEl.textContent = '❌ Les mots de passe ne correspondent pas.';
      errEl.style.display = 'block'; return;
    }

    qs('#btnResetPwd').textContent = 'Enregistrement…';
    qs('#btnResetPwd').disabled    = true;

    try {
      const { error } = await SB.auth.updateUser({ password: pwd1 });
      if (error) throw error;

      // Succès — redirige vers login
      qs('#resetScreen').style.display  = 'none';
      qs('#loginScreen').style.display  = 'flex';
      qs('#loginError').textContent     = '✅ Mot de passe mis à jour ! Connecte-toi.';
      qs('#loginError').style.display   = 'block';
      qs('#loginError').style.background = 'rgba(52,199,89,0.1)';
      qs('#loginError').style.borderColor = 'rgba(52,199,89,0.3)';
      qs('#loginError').style.color      = 'var(--green)';

    } catch(err) {
      errEl.textContent   = '❌ ' + (err.message || 'Erreur inconnue');
      errEl.style.display = 'block';
    } finally {
      qs('#btnResetPwd').textContent = 'Enregistrer le mot de passe';
      qs('#btnResetPwd').disabled    = false;
    }
  });
}

// Mot de passe oublié — envoie l'email de reset
qs('#btnForgot').addEventListener('click', async () => {
  const email = qs('#loginEmail').value.trim();
  const errEl = qs('#loginError');

  if (!email) {
    errEl.textContent   = '⚠️ Entre d'abord ton email ci-dessus.';
    errEl.style.display = 'block';
    errEl.style.background  = '';
    errEl.style.borderColor = '';
    errEl.style.color       = '';
    return;
  }

  qs('#btnForgot').textContent = 'Envoi…';
  qs('#btnForgot').disabled    = true;

  try {
    const { error } = await SB.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://lansweg.github.io/app/mls-app/',
    });
    if (error) throw error;

    errEl.textContent       = '📧 Email envoyé à ' + email + ' !';
    errEl.style.display     = 'block';
    errEl.style.background  = 'rgba(52,199,89,0.1)';
    errEl.style.borderColor = 'rgba(52,199,89,0.3)';
    errEl.style.color       = 'var(--green)';

  } catch(err) {
    errEl.textContent       = '❌ ' + (err.message || 'Erreur envoi email');
    errEl.style.display     = 'block';
    errEl.style.background  = '';
    errEl.style.borderColor = '';
    errEl.style.color       = '';
  } finally {
    qs('#btnForgot').textContent = 'Mot de passe oublié ?';
    qs('#btnForgot').disabled    = false;
  }
});

// Changer mdp depuis le menu profil (utilisateur connecté)
qs('#btnChangerMdp').addEventListener('click', async () => {
  qs('#profilePanel').style.display = 'none';

  const email = currentUser?.email;
  if (!email) { showToast('❌ Utilisateur non identifié.'); return; }

  try {
    const { error } = await SB.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://lansweg.github.io/app/mls-app/',
    });
    if (error) throw error;
    showToast('📧 Email de reset envoyé à ' + email + ' !', 4000);
  } catch(err) {
    showToast('❌ ' + (err.message || 'Erreur envoi email'));
  }
});

// ============================================================
// INIT — vérifie session existante
// ============================================================
async function init() {
  initSupabase();
  setupResetScreen();

  // Détecte si Supabase a redirigé avec un token de reset dans le hash
  const hash   = window.location.hash;
  const params = new URLSearchParams(hash.replace('#', ''));
  const type   = params.get('type');

  if (type === 'recovery') {
    // L'utilisateur arrive depuis un email de reset
    // Supabase a déjà établi une session temporaire via le hash
    const { data: { session } } = await SB.auth.getSession();
    if (session) {
      // Nettoie l'URL sans recharger
      history.replaceState(null, '', window.location.pathname);
      // Affiche l'écran de nouveau mot de passe
      qs('#loginScreen').style.display = 'none';
      qs('#resetScreen').style.display = 'flex';
      return;
    }
  }

  // Supabase v2 : écoute aussi l'event PASSWORD_RECOVERY
  SB.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      history.replaceState(null, '', window.location.pathname);
      qs('#loginScreen').style.display = 'none';
      qs('#appMain').style.display     = 'none';
      qs('#resetScreen').style.display = 'flex';
    }
  });

  // Vérifie si une session est déjà active (rechargement de page)
  const { data: { session } } = await SB.auth.getSession();

  if (session?.user && type !== 'recovery') {
    try {
      currentUser    = session.user;
      currentProfile = await loadProfile(currentUser.id);
      currentRole    = currentProfile?.role || 'benevole';
      showApp();
      applyRoleUI();
      await bootApp();
    } catch(err) {
      console.error('Session invalide', err);
      showLoginScreen();
    }
  } else if (!type) {
    showLoginScreen();
  }
}

init();
