# WebGIS Analisis Perubahan Vegetasi Kota Denpasar 2024–2025

Proyek UAS Kapita Selekta Sistem Informasi — analisis perubahan tutupan vegetasi Kota Denpasar, Bali, periode 2024–2025 menggunakan citra Sentinel-2, klasifikasi Random Forest, dan visualisasi WebGIS interaktif.

## Anggota Kelompok

**Divisi Kapita Selekta GIS** (Konteks Spasial, WebGIS, Narasi, Presentasi)
- Sanzio  — GIS & Spatial Analyst
- Nadila Aprilla — WebGIS Developer
- Rania  — Project Lead & Documentation

**Divisi Maha Data** (Data Pipeline, Machine Learning, Evaluasi Statistik)
- Khalam — Geospatial Data Engineer
- Zova — Machine Learning Specialist
- Jiel — Data Analyst & Evaluator

> Catatan: lengkapi nama asli seluruh anggota sebelum submit.

## Tentang Proyek

- **Kota**: Denpasar, Bali
- **Objek target**: Vegetasi (klasifikasi biner: Vegetasi vs Non-Vegetasi)
- **Periode**: 1 Juni – 30 September 2024 vs 1 Juni – 30 September 2025 (musim kemarau, untuk keadilan perbandingan)
- **Sumber data**: Sentinel-2 Surface Reflectance Harmonized (`COPERNICUS/S2_SR_HARMONIZED`)
- **Model**: Random Forest (100 trees, seed 42), split data 60% training / 40% testing
- **Hasil utama**:
  - Luas vegetasi 2024: **4.137,71 ha** (32,93% dari luas kota)
  - Luas vegetasi 2025: **4.066,79 ha** (32,37% dari luas kota)
  - Perubahan bersih: **-70,92 ha (-1,71%)**
  - Overall Accuracy model: **95,87%** | Recall (Vegetasi): **98,44%**

## Cara Membuka WebGIS

**Live demo**: `https://vegetasi-ks-denpasar.vercel.app/`

**Menjalankan secara lokal** (wajib pakai local server, tidak bisa dobel-klik langsung karena WebGIS memuat data GeoJSON via `fetch()`):
```bash
cd webgis
python -m http.server 8000
# lalu buka http://localhost:8000 di browser
```
Atau gunakan ekstensi **Live Server** di VS Code.

## Struktur Folder

repository-kelompok/
├── gee/
│   └── 02_modeling.js          
├── data/                       
│   ├── Batas_Kota_Denpasar.geojson
│   ├── Target_Veg_2024.geojson
│   ├── Target_Veg_2025.geojson
│   ├── Gain_Veg.geojson
│   └── Loss_Veg.geojson
├── results/                    
│   ├── Raster_Classified_2024.tif
│   ├── Raster_Classified_2025.tif
│   ├── Raster_Change_Map.tif
│   ├── Testing_Data_Denpasar_Vegetasi.csv
│   ├── gain_tiap_kecamatan.csv
│   ├── loss_tiap_kecamatan.csv
│   ├── confusion_matrix.png
│   ├── aprf_chart.png
│   └── classification_report.txt
├── webgis/                     
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── js/data.js
│   └── data/                   
└── README.md
```

## Fitur WebGIS

1. **Tab Peta Hasil** — peta interaktif (batas kota, vegetasi 2024/2025, gain, loss), layer control, popup info per polygon
2. **Tab Data & Proses** — transparansi metodologi: sumber data, preprocessing, ground truth, parameter model, diagram alur
3. **Tab Evaluasi Model** — confusion matrix, metrik APRF, interpretasi kesalahan model
4. **Tab Insight Hasil** — ringkasan luas & perubahan, lokasi perubahan terbesar per kecamatan, rekomendasi

## Laporan

Laporan akhir (PDF): `[TODO: isi link/nama file laporan setelah dibuat, taruh di folder report/]`

## Metodologi Singkat

```
Sentinel-2 → Preprocessing (cloud mask + composite) → Feature Stack (9 band)
→ Ground Truth (300 titik) → Split 60:40 → Random Forest (100 trees)
→ Evaluasi (Confusion Matrix, APRF) → Klasifikasi 2024 & 2025 → Change Analysis (Gain/Loss)
→ Vectorize → WebGIS
```
