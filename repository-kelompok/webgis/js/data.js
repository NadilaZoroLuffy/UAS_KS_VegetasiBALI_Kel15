// ============================================================
// Konfigurasi Data — WebGIS Vegetasi Denpasar
// Data GeoJSON asli dimuat dari folder data/ (lihat app.js: loadAllData)
// Statistik di bawah adalah hasil perhitungan dari data asli tim
// ============================================================

// Path file GeoJSON asli (dimuat via fetch() saat halaman dibuka)
const DATA_FILES = {
  batas: 'data/batas_kota_denpasar.geojson',
  veg2024: 'data/target_veg_2024.geojson',
  veg2025: 'data/target_veg_2025.geojson',
  gain: 'data/gain_veg_2024_2025.geojson',
  loss: 'data/loss_veg_2024_2025.geojson'
};

// Statistik luasan resmi (dari hasil GEE tim Mahadata)
const STATS = {
  luas2024: 4137.71,
  luas2025: 4066.79,
  netChange: -70.92,
  netChangePercent: -1.71,
  // Total gain/loss — dihitung langsung dari GeoJSON hasil vectorize (Anggota 1)
  totalGain: 536.816,  // 4032 polygon
  totalLoss: 453.529,  // 3745 polygon
  // Ground truth & training
  totalGT: 300,
  trainingGT: 179,
  testingGT: 121,
  splitRatio: '60:40'
};

// Distribusi gain/loss per kecamatan (hasil spatial join polygon Gain/Loss × Batas Kecamatan)
const KECAMATAN_STATS = {
  gain: [
    { nama: 'Denpasar Selatan', luas_ha: 191.58 },
    { nama: 'Denpasar Timur',   luas_ha: 140.15 },
    { nama: 'Denpasar Utara',   luas_ha: 107.97 },
    { nama: 'Denpasar Barat',   luas_ha: 88.16 }
  ],
  loss: [
    { nama: 'Denpasar Selatan', luas_ha: 149.32 },
    { nama: 'Denpasar Timur',   luas_ha: 132.81 },
    { nama: 'Denpasar Utara',   luas_ha: 89.58 },
    { nama: 'Denpasar Barat',   luas_ha: 73.39 }
  ]
};

// Titik perubahan (gain/loss) terbesar hasil analisis spasial nyata
const TOP_CHANGES = {
  gain: [
    { luas_ha: 3.01, kecamatan: 'Denpasar Selatan', lat: -8.7208, lon: 115.1981 },
    { luas_ha: 2.12, kecamatan: 'Denpasar Selatan', lat: -8.7214, lon: 115.2215 },
    { luas_ha: 1.94, kecamatan: 'Denpasar Selatan', lat: -8.6974, lon: 115.2365 }
  ],
  loss: [
    { luas_ha: 2.92, kecamatan: 'Denpasar Barat', lat: -8.6893, lon: 115.1811 },
    { luas_ha: 2.30, kecamatan: 'Denpasar Timur',  lat: -8.6243, lon: 115.2463 },
    { luas_ha: 2.12, kecamatan: 'Denpasar Timur',  lat: -8.6702, lon: 115.2335 }
  ]
};
