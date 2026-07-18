// ============================================================
// WebGIS Vegetasi Denpasar — Application Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initMap();
  animateMetrics();
});

// ── Tab Navigation ──
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');

      // Re-invalidate map size when switching to map tab
      if (target === 'tab-peta' && window.map) {
        setTimeout(() => window.map.invalidateSize(), 200);
      }
    });
  });
}

// ── Map Initialization ──
async function initMap() {
  const map = L.map('map', {
    center: [-8.65, 115.22],
    zoom: 12,
    zoomControl: false
  });

  window.map = map;

  // Add zoom control to top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // ── Basemap Layers ──
  const osmLight = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  });

  const osmDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  });

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  });

  osmLight.addTo(map);

  // ── Fetch real GeoJSON data (from data/ folder, see data.js DATA_FILES) ──
  const loadingEl = document.getElementById('map-loading');
  let batasData, veg2024Data, veg2025Data, gainData, lossData;
  try {
    [batasData, veg2024Data, veg2025Data, gainData, lossData] = await Promise.all([
      fetch(DATA_FILES.batas).then(r => r.json()),
      fetch(DATA_FILES.veg2024).then(r => r.json()),
      fetch(DATA_FILES.veg2025).then(r => r.json()),
      fetch(DATA_FILES.gain).then(r => r.json()),
      fetch(DATA_FILES.loss).then(r => r.json())
    ]);
  } catch (err) {
    console.error('Gagal memuat data GeoJSON:', err);
    if (loadingEl) loadingEl.textContent = '⚠ Gagal memuat data. Pastikan dibuka lewat server lokal (bukan file://).';
    return;
  }
  if (loadingEl) loadingEl.style.display = 'none';

  // ── Popup builder: batas kecamatan (properti asli GADM) ──
  function popupBatas(props) {
    return `
      <div class="popup-content">
        <h3>${props.NAME_3 || 'Kota Denpasar'}</h3>
        <div class="popup-row"><span class="popup-label">Kabupaten/Kota</span><span class="popup-value">${props.NAME_2 || 'Denpasar'}</span></div>
        <div class="popup-row"><span class="popup-label">Provinsi</span><span class="popup-value">${props.NAME_1 || 'Bali'}</span></div>
        <div class="popup-row"><span class="popup-label">Tipe</span><span class="popup-value">${props.TYPE_3 || 'Kecamatan'}</span></div>
      </div>`;
  }

  // ── Popup builder: patch vegetasi/gain/loss (properti asli: count, label) ──
  // Catatan: 1 unit "count" = 0.08842 ha (tervalidasi dari perbandingan luas geometry asli
  // vs properti count pada seluruh layer — kemungkinan skala vectorize ~29.7m, bukan 10m Sentinel-2 native)
  function popupPatch(props, tahun, tipe, badgeColor) {
    const pixelCount = props.count || 1;
    const HA_PER_COUNT = 0.08842;
    const luasHa = (pixelCount * HA_PER_COUNT).toFixed(3);
    return `
      <div class="popup-content">
        <h3>${tipe}</h3>
        <div class="popup-row"><span class="popup-label">Kota</span><span class="popup-value">Denpasar</span></div>
        <div class="popup-row"><span class="popup-label">Periode</span><span class="popup-value">${tahun}</span></div>
        <div class="popup-row"><span class="popup-label">Nilai Count</span><span class="popup-value">${pixelCount}</span></div>
        <div class="popup-row"><span class="popup-label">Estimasi Luas</span><span class="popup-value">${luasHa} ha</span></div>
        <div class="popup-row"><span class="popup-label">Kelas</span><span class="popup-badge" style="background:${badgeColor};">${props.label === 1 ? 'Vegetasi' : 'Non-Vegetasi'}</span></div>
      </div>`;
  }

  // ── GeoJSON Layers (data asli) ──
  const layerBatas = L.geoJSON(batasData, {
    style: {
      color: '#94a3c0',
      weight: 2.5,
      dashArray: '8, 6',
      fillColor: 'transparent',
      fillOpacity: 0
    },
    onEachFeature: (feature, layer) => layer.bindPopup(popupBatas(feature.properties))
  });

  const layerVeg2024 = L.geoJSON(veg2024Data, {
    style: { color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.35 },
    onEachFeature: (feature, layer) => layer.bindPopup(popupPatch(feature.properties, '2024', 'Vegetasi 2024', '#22c55e'))
  });

  const layerVeg2025 = L.geoJSON(veg2025Data, {
    style: { color: '#06b6d4', weight: 1, fillColor: '#06b6d4', fillOpacity: 0.35 },
    onEachFeature: (feature, layer) => layer.bindPopup(popupPatch(feature.properties, '2025', 'Vegetasi 2025', '#06b6d4'))
  });

  const layerGain = L.geoJSON(gainData, {
    style: { color: '#4ade80', weight: 1, fillColor: '#4ade80', fillOpacity: 0.55 },
    onEachFeature: (feature, layer) => layer.bindPopup(popupPatch(feature.properties, '2024–2025', 'Gain (Bertambah Hijau)', '#4ade80'))
  });

  const layerLoss = L.geoJSON(lossData, {
    style: { color: '#f87171', weight: 1, fillColor: '#f87171', fillOpacity: 0.55 },
    onEachFeature: (feature, layer) => layer.bindPopup(popupPatch(feature.properties, '2024–2025', 'Loss (Berkurang Hijau)', '#f87171'))
  });

  // Add default layers
  layerBatas.addTo(map);
  layerVeg2024.addTo(map);
  layerGain.addTo(map);
  layerLoss.addTo(map);

  // Fit map to boundary extent
  try { map.fitBounds(layerBatas.getBounds(), { padding: [20, 20] }); } catch (e) {}

  // ── Layer Control ──
  const baseMaps = {
    '🗺️ OpenStreetMap': osmLight,
    '🌑 Dark Mode': osmDark,
    '🛰️ Satelit': satellite
  };

  const overlayMaps = {
    '📍 Batas Kota Denpasar': layerBatas,
    '🌿 Vegetasi 2024': layerVeg2024,
    '🌊 Vegetasi 2025': layerVeg2025,
    '🟢 Gain (Bertambah Hijau)': layerGain,
    '🔴 Loss (Berkurang Hijau)': layerLoss
  };

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    position: 'topright'
  }).addTo(map);
}

// ── Animate Metric Bars ──
function animateMetrics() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.metric-bar-fill');
        fills.forEach(fill => {
          const width = fill.dataset.width;
          setTimeout(() => {
            fill.style.width = width + '%';
          }, 300);
        });
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.eval-card').forEach(card => {
    observer.observe(card);
  });
}
