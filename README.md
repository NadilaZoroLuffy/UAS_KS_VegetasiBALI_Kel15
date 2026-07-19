# 🌿 WebGIS Analisis Perubahan Vegetasi Kota Denpasar 2024–2025

[![WebGIS](https://img.shields.io/badge/WebGIS-Live%20Demo-brightgreen)](https://vegetasi-ks-denpasar.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Proyek UAS Kapita Selekta Sistem Informasi — analisis perubahan tutupan vegetasi Kota Denpasar, Bali, periode 2024–2025 menggunakan citra Sentinel-2, klasifikasi Random Forest, dan visualisasi WebGIS interaktif.

## 👥 Anggota Kelompok

**Divisi Kapita Selekta GIS** (Konteks Spasial, WebGIS, Narasi, Presentasi)
- Sanzio Gawini `1232002044` — GIS & Spatial Analyst
- Nadila Aprilla `12420020` — WebGIS Developer
- Rania Dwi Arianti`1242002084` — Project Lead & Documentation

**Divisi Maha Data** (Data Pipeline, Machine Learning, Evaluasi Statistik)
- Akhmad Khalam Fauzi `1232002073` — Geospatial Data Engineer
- Zovanka Chatricia `1232002051` — Machine Learning Specialist
- Muhamad Azriel Saputra Irawan `1232002052` — Data Analyst & Evaluator

## 📊 Tentang Proyek

- **Lokasi**: Kota Denpasar, Bali
- **Objek Target**: Vegetasi (klasifikasi biner: Vegetasi vs Non-Vegetasi)
- **Periode**: 1 Juni – 30 September 2024 vs 1 Juni – 30 September 2025 *(musim kemarau untuk konsistensi data)*
- **Sumber Data**: Sentinel-2 Surface Reflectance Harmonized (`COPERNICUS/S2_SR_HARMONIZED`)
- **Model**: Random Forest (100 trees, seed 42), split data 60% training / 40% testing
- **Hasil Utama**:
  - Luas vegetasi 2024: **4.137,71 ha** (32,93% dari luas kota)
  - Luas vegetasi 2025: **4.066,79 ha** (32,37% dari luas kota)
  - Perubahan bersih: **-70,92 ha (-1,71%)** ⬇️
  - Overall Accuracy model: **95,87%** | Recall (Vegetasi): **98,44%**

## 📈 Dinamika Perubahan per Kecamatan
| Kecamatan | Luas Loss (ha) | Luas Gain (ha) | Keterangan |
| :--- | :---: | :---: | :--- |
| **Denpasar Selatan** | 151,15 | 193,07 | Area paling dinamis (perubahan tertinggi) |
| **Denpasar Timur** | 134,59 | 142,13 | Perubahan tinggi |
| **Denpasar Utara** | 91,95 | 110,86 | Perubahan sedang |
| **Denpasar Barat** | 75,49 | 91,38 | Perubahan relatif rendah |

## 💡 Fitur WebGIS
Tab Peta Hasil — Peta interaktif (batas kota, vegetasi 2024/2025, gain, loss), layer control (OSM, Dark, Satellite), dan popup info luas per polygon.
Tab Data & Proses — Transparansi metodologi: sumber data, preprocessing, ground truth, parameter model, dan diagram alur.
Tab Evaluasi Model — Visualisasi confusion matrix, metrik APRF (Accuracy, Precision, Recall, F1-Score), dan interpretasi kesalahan model.
Tab Insight Hasil — Ringkasan luas & perubahan, lokasi perubahan terbesar per kecamatan, pola distribusi, dan rekomendasi kebijakan.

##📄 Laporan
Laporan akhir (PDF 5-8 halaman) berisi metodologi lengkap, pembahasan, dan kesimpulan dapat diunduh di:
📥 Download Laporan UAS (Update link ini setelah file diupload ke GitHub)

## 🚀 Cara Membuka WebGIS

**Live demo**: [https://vegetasi-ks-denpasar.vercel.app/](https://vegetasi-ks-denpasar.vercel.app/)

**Menjalankan secara lokal** *(wajib pakai local server, tidak bisa double-klik langsung karena WebGIS memuat data GeoJSON via `fetch()`)*:
```bash
cd webgis
python -m http.server 8000
# lalu buka http://localhost:8000 di browser

## 📁 Struktur Folder
repository-kelompok/
├── gee/
│   └── 02_modeling.js              # Script utama Google Earth Engine
├── data/                           # File GeoJSON untuk WebGIS
│   ├── Batas_Kota_Denpasar.geojson
│   ├── Target_Veg_2024.geojson
│   ├── Target_Veg_2025.geojson
│   ├── Gain_Veg.geojson
│   └── Loss_Veg.geojson
├── results/                        # Hasil export & analisis
│   ├── Raster_Classified_2024.tif
│   ├── Raster_Classified_2025.tif
│   ├── Raster_Change_Map.tif
│   ├── Testing_Data_Denpasar_Vegetasi.csv
│   ├── gain_tiap_kecamatan.csv
│   ├── loss_tiap_kecamatan.csv
│   ├── confusion_matrix.png
│   ├── aprf_chart.png
│   └── classification_report.txt
├── report/                         # Dokumen Laporan
│   └── Laporan_UAS_Vegetasi_Denpasar.pdf
├── webgis/                         # Source code WebGIS
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── js/data.js
│   └── data/                       # Salinan file GeoJSON untuk local hosting
└── README.md

## 🔬 Metodologi Singkat
Sentinel-2 → Preprocessing (Cloud Mask QA60+SCL + Median Composite) 
→ Feature Stack (B2, B3, B4, B8, B11, B12, NDVI, NDWI, NDBI)
→ Ground Truth (300 titik) → Split Data 60:40 
→ Random Forest (100 trees) → Evaluasi (Confusion Matrix, APRF) 
→ Klasifikasi Raster 2024 & 2025 → Change Analysis (Gain/Loss)
→ Vectorize (Simplify 2m, filter >1 Ha) → WebGIS

© 2026 Kelompok 15 - Kapita Selekta Sistem Informasi, Universitas Bakrie
