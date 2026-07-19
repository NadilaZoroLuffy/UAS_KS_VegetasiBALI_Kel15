// ==========================================
// MASTER SCRIPT FINAL: VEGETASI KOTA DENPASAR 2024-2025
// (Data Engineer + ML Specialist + Data Analyst + GIS Analyst)
// ==========================================

// 1. SETUP AOI (Batas Administrasi Kota Denpasar)
var gaul = ee.FeatureCollection("FAO/GAUL/2015/level2");
var aoi_raw = gaul.filter(ee.Filter.stringContains('ADM2_NAME', 'Denpasar'));
var aoi = aoi_raw.first().geometry(); 

Map.centerObject(aoi, 11);
Map.addLayer(aoi, {color: 'red', fillColor: 'FF000000'}, 'Batas Kota Denpasar');

// 2. KUNCI PARAMETER WAKTU (1 Juni - 30 September)
var startDate_2024 = '2024-06-01';
var endDate_2024 = '2024-10-01'; 
var startDate_2025 = '2025-06-01';
var endDate_2025 = '2025-10-01'; 

// 3. FUNGSI CLOUD MASKING
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  
  var scl = image.select('SCL');
  var sclMask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10)).and(scl.neq(11));
  
  return image.updateMask(mask).updateMask(sclMask);
}

// 4. AKUISISI CITRA 2024 & 2025
var s2_2024 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi).filterDate(startDate_2024, endDate_2024)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)).map(maskS2clouds);
var composite_2024 = s2_2024.median().clip(aoi);

var s2_2025 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi).filterDate(startDate_2025, endDate_2025)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)).map(maskS2clouds);
var composite_2025 = s2_2025.median().clip(aoi);

// 5. PEMBUATAN FEATURE STACK (Band Dasar + Indeks)
function createFeatureStack(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
  var ndbi = image.normalizedDifference(['B11', 'B8']).rename('NDBI');
  var bands = image.select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12']);
  return bands.addBands([ndvi, ndwi, ndbi]).select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12', 'NDVI', 'NDWI', 'NDBI']);
}

var stack_2024 = createFeatureStack(composite_2024);
var stack_2025 = createFeatureStack(composite_2025);

print('=== 1. VERIFIKASI DATA ENGINEER ===');
print('Jumlah Citra 2024:', s2_2024.size(), '| 2025:', s2_2025.size());
print('Band Names:', stack_2024.bandNames());

// =====================================================
// PERBAIKAN LAYER VISUALISASI SESUAI KRITERIA
// =====================================================

// 1. Komposit Sentinel-2 2024 & 2025 (Visible by default)
Map.addLayer(composite_2024, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Komposit Sentinel-2 2024');
Map.addLayer(composite_2025, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Komposit Sentinel-2 2025');

// 2. RGB & NDVI (Hidden by default, untuk cek kualitas data)
Map.addLayer(composite_2024, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'RGB 2024 (Cek)', false);
Map.addLayer(stack_2024, {bands: 'NDVI', min: -0.2, max: 0.8, palette: ['red', 'yellow', 'green']}, 'NDVI 2024 (Cek)', false);

// =====================================================
// MACHINE LEARNING SPECIALIST
// =====================================================
Map.setOptions('SATELLITE');

var veg24_fc = veg24.map(function(f) { return f.set({'class': 1, 'year': 2024}); });
var nonveg24_fc = nonveg24.map(function(f) { return f.set({'class': 0, 'year': 2024}); });
var veg25_fc = veg25.map(function(f) { return f.set({'class': 1, 'year': 2025}); });
var nonveg25_fc = nonveg25.map(function(f) { return f.set({'class': 0, 'year': 2025}); });

var GT = veg24_fc.merge(nonveg24_fc).merge(veg25_fc).merge(nonveg25_fc);
print('=== 2. TOTAL GROUND TRUTH ===', GT.size());

// SPLIT 60:40
var seed = 42;
var trainVeg24 = veg24_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.lt('random', 0.6));
var testVeg24 = veg24_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.gte('random', 0.6));
var trainNon24 = nonveg24_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.lt('random', 0.6));
var testNon24 = nonveg24_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.gte('random', 0.6));
var trainVeg25 = veg25_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.lt('random', 0.6));
var testVeg25 = veg25_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.gte('random', 0.6));
var trainNon25 = nonveg25_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.lt('random', 0.6));
var testNon25 = nonveg25_fc.randomColumn({columnName: 'random', seed: seed}).filter(ee.Filter.gte('random', 0.6));

var trainingGT = trainVeg24.merge(trainNon24).merge(trainVeg25).merge(trainNon25);
var testingGT = testVeg24.merge(testNon24).merge(testVeg25).merge(testNon25);
print('Training GT (60%):', trainingGT.size(), '| Testing GT (40%):', testingGT.size());

// Training RF
var bands = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12', 'NDVI', 'NDWI', 'NDBI'];
var trainSample = stack_2024.sampleRegions({collection: trainVeg24.merge(trainNon24), properties: ['class'], scale: 10})
  .merge(stack_2025.sampleRegions({collection: trainVeg25.merge(trainNon25), properties: ['class'], scale: 10}));

var rf = ee.Classifier.smileRandomForest({numberOfTrees: 100, seed: 42}).train({
  features: trainSample, classProperty: 'class', inputProperties: bands
});

// Klasifikasi
var classified2024 = stack_2024.classify(rf);
var classified2025 = stack_2025.classify(rf);

// 3. Raster Klasifikasi 2024 & 2025 (Visible by default)
Map.addLayer(classified2024, {min:0, max:1, palette:['#FF0000','#228B22']}, "Raster Klasifikasi 2024");
Map.addLayer(classified2025, {min:0, max:1, palette:['#FF0000','#228B22']}, "Raster Klasifikasi 2025");

// =====================================================
// DATA ANALYST: EVALUASI
// =====================================================
var testSample = stack_2024.sampleRegions({collection: testVeg24.merge(testNon24), properties: ['class'], scale: 10})
  .merge(stack_2025.sampleRegions({collection: testVeg25.merge(testNon25), properties: ['class'], scale: 10}));

var testResults = testSample.classify(rf);
var errorMatrix = testResults.errorMatrix('class', 'classification');
var matrixArray = errorMatrix.array();

var TP = ee.Number(matrixArray.get([1, 1]));
var TN = ee.Number(matrixArray.get([0, 0]));
var FP = ee.Number(matrixArray.get([0, 1]));
var FN = ee.Number(matrixArray.get([1, 0]));

print('=== 3. EVALUASI MODEL (APRF) - Split 60:40 ===');
print('Confusion Matrix:', errorMatrix);
print('Accuracy:', errorMatrix.accuracy());
print('Precision (Veg):', TP.divide(TP.add(FP)));
print('Recall (Veg):', TP.divide(TP.add(FN)));
print('F1-Score (Veg):', ee.Number(2).multiply(TP.divide(TP.add(FP)).multiply(TP.divide(TP.add(FN)))).divide(TP.divide(TP.add(FP)).add(TP.divide(TP.add(FN)))));

// Hitung Luas & Persentase
var pixelToHectares = ee.Image.pixelArea().divide(10000);
var luasKota = ee.Number(aoi.area().divide(10000));
var luas2024 = ee.Number(classified2024.eq(1).multiply(pixelToHectares).reduceRegion({reducer: ee.Reducer.sum(), geometry: aoi, scale: 10, maxPixels: 1e13}).get('classification'));
var luas2025 = ee.Number(classified2025.eq(1).multiply(pixelToHectares).reduceRegion({reducer: ee.Reducer.sum(), geometry: aoi, scale: 10, maxPixels: 1e13}).get('classification'));
var selisihLuas = luas2025.subtract(luas2024);
var persenPerubahan = selisihLuas.divide(luas2024).multiply(100);
var persenVeg2024 = luas2024.divide(luasKota).multiply(100);
var persenVeg2025 = luas2025.divide(luasKota).multiply(100);

print('=== 4. STATISTIK LUASAN ===');
print('Luas Kota Denpasar (Ha):', luasKota);
print('Luas Vegetasi 2024 (Ha):', luas2024);
print('Persentase Vegetasi 2024 terhadap Kota (%):', persenVeg2024);
print('Luas Vegetasi 2025 (Ha):', luas2025);
print('Persentase Vegetasi 2025 terhadap Kota (%):', persenVeg2025);
print('Perubahan Bersih (Ha):', selisihLuas);
print('Persentase Perubahan (%):', persenPerubahan);

// 4. Change Map (Visible by default)
var changeMap = classified2024.multiply(2).add(classified2025);
Map.addLayer(changeMap, {min: 0, max: 3, palette: ['#E0E0E0', '#FF0000', '#0000FF', '#228B22']}, 'Peta Perubahan (Change Map)');

// =====================================================
// GIS ANALYST: VECTORIZATION (SKALA 10M)
// =====================================================
print('--- 5. MEMULAI VECTORIZATION (SKALA 10M) ---');

// Fungsi cleaning: Simplify 2 meter (jaga detail)
function cleanPolygonProper(fc, kategoriName) {
  return fc.map(function(f) { 
    return f.set({
      geometry: f.geometry().simplify(2),
      kategori: kategoriName
    }); 
  });
}

// Fungsi untuk menambah atribut luas
function addArea(f) { 
  return f.set({
    'luas_ha': ee.Number(f.area({maxError: 10})).divide(10000)
  }); 
}

var vec2024 = cleanPolygonProper(classified2024.eq(1).selfMask().reduceToVectors({
  geometry: aoi, scale: 10, maxPixels: 1e13, eightConnected: false
}), 'Target_Vegetasi_2024').map(addArea);

var vec2025 = cleanPolygonProper(classified2025.eq(1).selfMask().reduceToVectors({
  geometry: aoi, scale: 10, maxPixels: 1e13, eightConnected: false
}), 'Target_Vegetasi_2025').map(addArea);

var vecGain = cleanPolygonProper(changeMap.eq(2).selfMask().reduceToVectors({
  geometry: aoi, scale: 10, maxPixels: 1e13, eightConnected: false
}), 'Gain_Vegetasi').map(addArea);

var vecLoss = cleanPolygonProper(changeMap.eq(1).selfMask().reduceToVectors({
  geometry: aoi, scale: 10, maxPixels: 1e13, eightConnected: false
}), 'Loss_Vegetasi').map(addArea);

print('Jumlah Polygon Target 2024:', vec2024.size());
print('Jumlah Polygon Target 2025:', vec2025.size());
print('Jumlah Polygon Gain:', vecGain.size());
print('Jumlah Polygon Loss:', vecLoss.size());

// Export
Export.table.toDrive({collection: vec2024, description: 'WebGIS_Target_Veg_2024', fileFormat: 'GeoJSON'});
Export.table.toDrive({collection: vec2025, description: 'WebGIS_Target_Veg_2025', fileFormat: 'GeoJSON'});
Export.table.toDrive({collection: vecGain, description: 'WebGIS_Gain_Veg', fileFormat: 'GeoJSON'});
Export.table.toDrive({collection: vecLoss, description: 'WebGIS_Loss_Veg', fileFormat: 'GeoJSON'});

// Raster untuk results/
Export.image.toDrive({
  image: classified2024.rename('classification').toInt(),
  description: 'Raster_Classified_2024',
  region: aoi,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326'
});

Export.image.toDrive({
  image: classified2025.rename('classification').toInt(),
  description: 'Raster_Classified_2025',
  region: aoi,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326'
});

Export.image.toDrive({
  image: changeMap.rename('change').uint8(),  // PERBAIKAN DI SINI
  description: 'Raster_Change_Map',
  region: aoi,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326'
});

// CSV untuk Colab
var testingWithPred = testSample.classify(rf).map(function(f) {
  return f.set({'actual_class': f.get('class'), 'predicted_class': f.get('classification')});
});
Export.table.toDrive({collection: testingWithPred, description: 'Testing_Data_Final', fileFormat: 'CSV', selectors: ['system:index', 'actual_class', 'predicted_class', 'NDVI', 'NDWI', 'NDBI']});

print('✅ SELESAI! Buka tab "Tasks" di kanan, lalu klik RUN untuk semua task.');
print('Pastikan nama task sesuai: WebGIS_*, Raster_*, dan Testing_Data_Final');
