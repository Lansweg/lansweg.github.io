'use strict';

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  mapboxToken: 'pk.eyJ1IjoibGFuc3dlZyIsImEiOiJjbXBkaHJ6ZTYwMzQ2MnRzZTBtb25nYXl5In0._V1wF9WwBfZnxdemWuWbUQ',
  supabaseUrl: 'https://rixsenvshgconhvgevix.supabase.co',
  supabaseKey: 'sb_publishable_9DbMPtt6ZwzQ21-ADtyB2w_V0VKAw9N',

  tarifBase: 0.55,
  tarifSuppl: 0.20,
  prixCarburant: 2.30,
  consommation: 7.5,
};

// ============================================================
// SUPABASE
// ============================================================
let supabaseClient = null;

function initSupabase() {
  if (
    CONFIG.supabaseUrl &&
    CONFIG.supabaseKey &&
    window.supabase
  ) {
    supabaseClient = window.supabase.createClient(
      CONFIG.supabaseUrl,
      CONFIG.supabaseKey
    );

    console.log('✅ Supabase connecté');
  }
}

// ============================================================
// SAMPLE DATA
// ============================================================
const SAMPLE_COURSES = [
  {
    id: 1,
    nom: 'Mme Leclerc',
    type: 'courses',
    dep: '12 rue de la Plage, La Rochelle',
    arr: 'Carrefour Lagord',
    km: 4.2,
    min: 12,
    prix: 3.15,
    statut: 'en-cours',
    date: 'Aujourd’hui 10:30',
  },
];

const SAMPLE_HISTORIQUE = [];

const NOTIFICATIONS = [];

// ============================================================
// MAP
// ============================================================
let map;
let currentRoute = null;
let markers = [];

function initMap() {
  mapboxgl.accessToken = CONFIG.mapboxToken;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-1.1511, 46.1603],
    zoom: 12,
  });

  map.addControl(
    new mapboxgl.NavigationControl({
      showCompass: false,
    }),
    'bottom-right'
  );

  map.on('load', () => {
    console.log('🗺️ Carte chargée');
  });
}

// ============================================================
// ROUTING
// ============================================================
function clearMarkers() {
  markers.forEach((m) => m.remove());
  markers = [];
}

function clearRoute() {
  if (map.getLayer('route')) {
    map.removeLayer('route');
  }

  if (map.getSource('route')) {
    map.removeSource('route');
  }
}

async function geocodeAddress(addr) {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
    `${encodeURIComponent(addr)}.json` +
    `?country=fr&access_token=${CONFIG.mapboxToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.features?.length) {
    return data.features[0].center;
  }

  return null;
}

async function calculateRoute(depAddr, arrAddr) {
  showProgress(true);

  try {
    const [depCoords, arrCoords] = await Promise.all([
      geocodeAddress(depAddr),
      geocodeAddress(arrAddr),
    ]);

    if (!depCoords || !arrCoords) {
      showToast('❌ Adresse introuvable');
      showProgress(false);
      return null;
    }

    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${depCoords[0]},${depCoords[1]};` +
      `${arrCoords[0]},${arrCoords[1]}` +
      `?geometries=geojson&overview=full&access_token=${CONFIG.mapboxToken}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes?.length) {
      showToast('❌ Itinéraire impossible');
      showProgress(false);
      return null;
    }

    const route = data.routes[0];

    const km = (route.distance / 1000).toFixed(1);
    const min = Math.round(route.duration / 60);

    clearMarkers();
    clearRoute();

    const m1 = new mapboxgl.Marker({
      color: '#34C759',
    })
      .setLngLat(depCoords)
      .addTo(map);

    const m2 = new mapboxgl.Marker({
      color: '#FF3B30',
    })
      .setLngLat(arrCoords)
      .addTo(map);

    markers.push(m1, m2);

    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route.geometry,
      },
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#0071E3',
        'line-width': 5,
      },
    });

    const bounds = new mapboxgl.LngLatBounds();

    route.geometry.coordinates.forEach((c) => {
      bounds.extend(c);
    });

    map.fitBounds(bounds, {
      padding: 80,
      duration: 1000,
    });

    showProgress(false);

    return {
      km: parseFloat(km),
      min,
    };
  } catch (err) {
    console.error(err);

    showToast('❌ Erreur trajet');
    showProgress(false);

    return null;
  }
}

// ============================================================
// TARIFS
// ============================================================
function calcPrix(km) {
  const tarifTotal =
    CONFIG.tarifBase + CONFIG.tarifSuppl;

  const prixBenef =
    (km * tarifTotal).toFixed(2);

  const prixEss =
    (
      (km * CONFIG.consommation / 100) *
      CONFIG.prixCarburant
    ).toFixed(2);

  return {
    tarifTotal,
    prixBenef,
    prixEss,
  };
}

function displayRouteResult(km, min) {
  const {
    prixBenef,
    prixEss,
  } = calcPrix(km);

  qs('#rcKm').textContent = km;
  qs('#rcTemps').textContent = min;

  qs('#rcPrixBenef').textContent =
    prixBenef + ' €';

  qs('#rcEssence').textContent =
    prixEss + ' €';

  qs('#routeResult').style.display = 'block';

  currentRoute = {
    km,
    min,
    prixBenef,
    prixEss,
  };
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, duration = 2500) {
  const t = qs('#toast');

  t.textContent = msg;
  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
  }, duration);
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
// RENDER
// ============================================================
function typeIcon(t) {
  return {
    courses: '🛒',
    medical: '🏥',
    vacances: '🌴',
    sam: '🍺',
  }[t] || '🚗';
}

function renderCourses() {
  const list = qs('#courseList');

  list.innerHTML = SAMPLE_COURSES.map((c) => `
    <div class="course-item">
      <div class="ci-icon ${c.type}">
        ${typeIcon(c.type)}
      </div>

      <div class="ci-content">
        <div class="ci-name">${c.nom}</div>

        <div class="ci-route">
          ${c.dep} → ${c.arr}
        </div>
      </div>

      <div class="ci-meta">
        <div class="ci-time">${c.date}</div>
        <div class="ci-price">${c.prix} €</div>
      </div>
    </div>
  `).join('');
}

function renderHistorique() {
  const list = qs('#histoList');

  list.innerHTML = SAMPLE_HISTORIQUE.map((c) => `
    <div class="course-item">
      <div class="ci-content">
        <div class="ci-name">${c.nom}</div>

        <div class="ci-route">
          ${c.km} km
        </div>
      </div>

      <div class="ci-meta">
        <div class="ci-price">${c.prix} €</div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// SHEETS
// ============================================================
let currentSheet = null;

function openSheet(id) {
  if (currentSheet && currentSheet !== id) {
    closeSheet(currentSheet);
  }

  const sheet = qs('#' + id);

  if (!sheet) return;

  sheet.classList.add('open');

  currentSheet = id;
}

function closeSheet(id) {
  const sheet = qs('#' + id);

  if (sheet) {
    sheet.classList.remove('open');
  }

  currentSheet = null;
}

// ============================================================
// SEARCH BAR
// ============================================================
function initSearchBar() {
  const input = qs('#searchInput');

  if (!input) return;

  input.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;

    const q = input.value.trim();

    if (!q) return;

    const coords = await geocodeAddress(q);

    if (!coords) {
      showToast('❌ Lieu introuvable');
      return;
    }

    map.flyTo({
      center: coords,
      zoom: 15,
      duration: 1200,
    });

    new mapboxgl.Marker({
      color: '#0071E3',
    })
      .setLngLat(coords)
      .addTo(map);
  });
}

// ============================================================
// AUTOCOMPLETE
// ============================================================
function setupAutocomplete(inputId) {
  const input = qs('#' + inputId);

  if (!input) return;

  let dropdown = null;
  let debounce;

  input.addEventListener('input', () => {
    clearTimeout(debounce);

    const q = input.value.trim();

    if (q.length < 3) {
      removeDropdown();
      return;
    }

    debounce = setTimeout(async () => {
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
        `${encodeURIComponent(q)}.json` +
        `?country=fr&limit=5&access_token=${CONFIG.mapboxToken}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        showDropdown(data.features || []);
      } catch (e) {
        console.error(e);
      }
    }, 300);
  });

  function showDropdown(features) {
    removeDropdown();

    if (!features.length) return;

    dropdown = document.createElement('div');
    dropdown.className = 'addr-dropdown';

    features.forEach((f) => {
      const item = document.createElement('div');

      item.className = 'addr-item';
      item.textContent = f.place_name;

      item.onmousedown = (e) => {
        e.preventDefault();

        input.value = f.place_name;

        removeDropdown();
      };

      dropdown.appendChild(item);
    });

    document.body.appendChild(dropdown);

    const rect = input.getBoundingClientRect();

    dropdown.style.position = 'fixed';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 4 + 'px';
    dropdown.style.width = rect.width + 'px';
  }

  function removeDropdown() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
  }

  input.addEventListener('blur', () => {
    setTimeout(removeDropdown, 150);
  });
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function renderNotifications() {
  const badge = qs('#notifBadge');

  if (!badge) return;

  badge.textContent = NOTIFICATIONS.length;

  badge.style.display =
    NOTIFICATIONS.length ? 'flex' : 'none';
}

// ============================================================
// EVENTS
// ============================================================

// NEW COURSE
qs('#bubbleNew')?.addEventListener('click', () => {
  openSheet('sheetNewCourse');

  qs('#sheetNewCourse').scrollTop = 0;

  qs('#routeResult').style.display = 'none';

  currentRoute = null;
});

// COURSES
qs('#bubbleCourses')?.addEventListener('click', () => {
  renderCourses();
  openSheet('sheetCourses');
});

// HISTORIQUE
qs('#bubbleHistorique')?.addEventListener('click', () => {
  renderHistorique();
  openSheet('sheetHistorique');
});

// SAM
qs('#bubbleSam')?.addEventListener('click', () => {
  openSheet('sheetNewCourse');

  qsa('.pill[data-type]').forEach((p) => {
    p.classList.remove('active');
  });

  qs('.pill[data-type="sam"]')?.classList.add('active');

  showToast('🍺 Mode SAM activé');
});

// CLOSE SHEETS
qsa('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => {
    closeSheet(btn.dataset.close);
  });
});

// TYPE PILLS
qsa('.pill[data-type]').forEach((p) => {
  p.addEventListener('click', () => {
    qsa('.pill[data-type]').forEach((x) => {
      x.classList.remove('active');
    });

    p.classList.add('active');
  });
});

// CALCULATE ROUTE
qs('#btnCalculer')?.addEventListener('click', async () => {
  const dep =
    qs('#addrDepart').value.trim();

  const arr =
    qs('#addrArrivee').value.trim();

  if (!dep || !arr) {
    showToast('⚠️ Adresses manquantes');
    return;
  }

  const btn = qs('#btnCalculer');

  btn.disabled = true;
  btn.textContent = 'Calcul...';

  const result = await calculateRoute(dep, arr);

  btn.disabled = false;
  btn.textContent = 'Calculer le trajet →';

  if (result) {
    displayRouteResult(
      result.km,
      result.min
    );

    showToast(
      `✅ ${result.km} km • ${result.min} min`
    );
  }
});

// SAVE COURSE
qs('#btnSauvegarder')?.addEventListener('click', async () => {
  const nom =
    qs('#beneficiaireName').value.trim();

  const dep =
    qs('#addrDepart').value.trim();

  const arr =
    qs('#addrArrivee').value.trim();

  if (!nom || !dep || !arr) {
    showToast('⚠️ Champs manquants');
    return;
  }

  if (!currentRoute) {
    showToast('⚠️ Calcule le trajet');
    return;
  }

  const type =
    qs('.pill.active')?.dataset.type || 'course';

  const data = {
    nom,
    type,
    depart: dep,
    arrivee: arr,
    km: currentRoute.km,
    duree_min: currentRoute.min,
    prix_benef: parseFloat(currentRoute.prixBenef),
    cout_essence: parseFloat(currentRoute.prixEss),
    created_at: new Date().toISOString(),
  };

  if (supabaseClient) {
    try {
      const { error } =
        await supabaseClient
          .from('courses')
          .insert([data]);

      if (error) throw error;

      showToast('✅ Sauvegardé');
    } catch (e) {
      console.error(e);

      showToast('❌ Erreur Supabase');
    }
  } else {
    SAMPLE_HISTORIQUE.unshift({
      ...data,
      id: Date.now(),
      prix: currentRoute.prixBenef,
    });

    showToast('✅ Course enregistrée');
  }

  closeSheet('sheetNewCourse');

  renderHistorique();

  clearMarkers();
  clearRoute();

  currentRoute = null;
});

// LOCALIZE
qs('#locateBtn')?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showToast('❌ GPS indisponible');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const {
        latitude,
        longitude,
      } = pos.coords;

      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
        `${longitude},${latitude}.json` +
        `?access_token=${CONFIG.mapboxToken}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.features?.length) {
        qs('#addrDepart').value =
          data.features[0].place_name;

        showToast('📍 Position récupérée');
      }
    },
    () => {
      showToast('❌ GPS refusé');
    }
  );
});

// ============================================================
// INIT
// ============================================================
function init() {
  initMap();

  initSupabase();

  initSearchBar();

  setupAutocomplete('addrDepart');
  setupAutocomplete('addrArrivee');

  renderNotifications();

  console.log('🌊 Application démarrée');
}

init();
