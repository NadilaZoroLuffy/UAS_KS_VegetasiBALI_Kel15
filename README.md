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

### 📈 Dinamika Perubahan per Kecamatan
| Kecamatan | Luas Loss (ha) | Luas Gain (ha) | Keterangan |
| :--- | :---: | :---: | :--- |
| **Denpasar Selatan** | 151,15 | 193,07 | Area paling dinamis (perubahan tertinggi) |
| **Denpasar Timur** | 134,59 | 142,13 | Perubahan tinggi |
| **Denpasar Utara** | 91,95 | 110,86 | Perubahan sedang |
| **Denpasar Barat** | 75,49 | 91,38 | Perubahan relatif rendah |

## 🚀 Cara Membuka WebGIS

**Live demo**: [https://vegetasi-ks-denpasar.vercel.app/](https://vegetasi-ks-denpasar.vercel.app/)

**Menjalankan secara lokal** *(wajib pakai local server, tidak bisa double-klik langsung karena WebGIS memuat data GeoJSON via `fetch()`)*:
```bash
cd webgis
python -m http.server 8000
# lalu buka http://localhost:8000 di browser
