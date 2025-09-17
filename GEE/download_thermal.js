 // Daftar gunung berapi yang akan digunakan
  var volcanoes = [
    {name: "Agung", area: Agung},
    {name: "Ambang", area: Ambang},
    {name: "Anak_Krakatau", area: Anak_Krakatau},
    {name: "Anak_Ranakah", area: Anak_Ranakah},
    {name: "Arjuno_Welirang", area: Arjuno_Welirang},
    {name: "Awu", area: Awu},
    {name: "Banda_Api", area: Banda_Api},
    {name: "Batur", area: Batur},
    {name: "Batutara", area: Batutara},
    {name: "Bromo", area: Bromo},
    {name: "Bur_Ni_Telong", area: Bur_Ni_Telong},
    {name: "Ciremai", area: Ciremai},
    {name: "Colo", area: Colo},
    {name: "Dempo", area: Dempo},
    {name: "Dieng", area: Dieng_KRB},
    {name: "Dukono", area: Dukono},
    {name: "Ebulobo", area: Ebulobo},
    {name: "Egon", area: Egon},
    {name: "Galunggung", area: Galunggung},
    {name: "Gamalama", area: Gamalama},
    {name: "Gamkonora", area: Gamkonora},
    {name: "Gede", area: Gede},
    {name: "Guntur", area: Guntur},
    {name: "Ibu", area: Ibu},
    {name: "Ijen", area: Ijen},
    {name: "Ile_Werung", area: Ile_Werung},
    {name: "Ili_Boleng", area: Ili_Boleng},
    {name: "Ili_Lewotolok", area: Ili_Lewotolok},
    {name: "Inielika", area: Inielika},
    {name: "Inierie", area: Inierie},
    {name: "Iya", area: Iya},
    {name: "Kaba", area: Kaba},
    {name: "Karangetang", area: Karangetang},
    {name: "Kelimutu", area: Kelimutu},
    {name: "Kelud", area: Kelud},
    {name: "Kerinci", area: Kerinci},
    {name: "Kie_Besi", area: Kie_Besi},
    {name: "Lamongan", area: Lamongan},
    {name: "Lereboleng", area: Lereboleng},
    {name: "Lewotobi_Laki_Laki", area: Lewotobi_Laki_laki},
    {name: "Lewotobi_Perempuan", area: Lewotobi_Perempuan},
    {name: "Lokon", area: Lokon},
    {name: "Mahawu", area: Mahawu},
    {name: "Marapi", area: Marapi},
    {name: "Merapi", area: Merapi},
    {name: "Papandayan", area: Papandayan},
    {name: "Peut_Sague", area: Peut_Sague},
    {name: "Raung", area: Raung},
    {name: "Rinjani", area: Rinjani},
    {name: "Rokatenda", area: Rokatenda},
    {name: "Ruang", area: Ruang},
    {name: "Salak", area: Salak},
    {name: "Sangeangapi", area: Sangeangapi},
    {name: "Semeru", area: Semeru},
    {name: "Seulawah_Agam", area: Seulawah_Agam},
    {name: "Sinabung", area: Sinabung},
    {name: "Sirung", area: Sirung},
    {name: "Slamet", area: Slamet},
    {name: "Soputan", area: Soputan},
    {name: "Sorikmarapi", area: Sorikmarapi},
    {name: "Sumbing", area: Sumbing},
    {name: "Sundoro", area: Sundoro},
    {name: "Talang", area: Talang},
    {name: "Tambora", area: Tambora},
    {name: "Tandikat", area: Tandikat_KRB},
    {name: "Tangkoko", area: Tangkoko_KRB},
    {name: "Tangkuban_Parahu", area: Tangkuban_Parahu},
    {name: "Wurlali", area: Wurlali}
  ];


// // ==========================================================================================================
// // UTILITIES
// // =====================
// function addLST_Celsius(image) {
//   // Scale factor & offset resmi untuk ST_B10 (Collection 2 Level-2)
//   // LST(°C) = DN * 0.00341802 - 124.15
//   var lstC = image.select('ST_B10')
//                   .multiply(0.00341802)
//                   .add(-124.15)
//                   .rename('LST_C')
//                   .toDouble();
//   return image.addBands(lstC, null, true);
// }


// function loadLandsatL2(area, start, end) {
//   var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
//               .filterBounds(area).filterDate(start, end);
//   var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
//               .filterBounds(area).filterDate(start, end);
//   // Gabung
//   return l8.merge(l9)
//     // (opsional) filter awan global ringan pakai metadata, tetap mengandalkan mask pixel L2
//     // .filter(ee.Filter.lt('CLOUD_COVER', 70))
//     .map(addLST_Celsius)
//     // Clip per citra supaya reduce lebih cepat
//     .map(function(img){ return img.clip(area); });
// }

// function percentileComposite(ic, band, p) {
//   return ic.select(band).reduce(ee.Reducer.percentile([p])).rename(band + '_p' + p);
// }

// // Ladder fill: ambil P95, isi nodata dengan P90, lalu P80
// function ladderFillLST(ic) {
//   var p95 = percentileComposite(ic, 'LST_C', 95);
//   var p90 = percentileComposite(ic, 'LST_C', 90);
//   var p80 = percentileComposite(ic, 'LST_C', 80);
//   var filled = p95.where(p95.mask().not(), p90);
//   filled = filled.where(filled.mask().not(), p80)
//                 .rename('LST_C_filled');
//   return filled;
// }

// // =====================
// // PARAMS
// // =====================
// var START = '2022-01-01';
// var END   = '2025-03-01';

// // =====================
// // LOOP SEMUA GUNUNG
// // =====================
// var feats = volcanoes.map(function(v) {
//   var area = v.area;
//   var name = v.name;

//   var ic = loadLandsatL2(area, START, END);

//   // Komposit isian bertingkat (mengurangi bolong)
//   var lstFilled = ladderFillLST(ic);

//   // Ringkasan statistik (min/max/mean + persen area terisi)
//   var stats = lstFilled.reduceRegion({
//     reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
//     geometry: area,
//     scale: 30,
//     maxPixels: 1e13,
//     bestEffort: true
//   });

//   // Persentase piksel yang punya data (bukan masked)
//   var maskImg = lstFilled.mask().rename('mask');
//   var pix = ee.Image.pixelArea().divide(ee.Image.pixelArea()); // = 1 per piksel
//   var totalPix = pix.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('area'); // 'area' nama band default dari pixelArea/area? Kita pakai 'constant'
//   // Perbaiki perhitungan piksel:
//   var ones = ee.Image(1);
//   var totalCount = ones.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('constant');

//   var validCount = maskImg.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('mask');

//   var pctValid = ee.Number(validCount).divide(ee.Number(totalCount)).multiply(100);

//   return ee.Feature(null, {
//     nama: name,
//     min_C: stats.get('LST_C_filled_min'),
//     max_C: stats.get('LST_C_filled_max'),
//     mean_C: stats.get('LST_C_filled_mean'),
//     pct_valid: pctValid
//   });
// });

// var fc_results = ee.FeatureCollection(feats);

// // Tabel ringkas
// print('Ringkasan LST (filled) per gunung:', fc_results);

// // Print per-baris dengan format rapi
// fc_results.evaluate(function(fc) {
//   fc.features.forEach(function(f) {
//     var p = f.properties;
//     print(
//       'Gunung ' + p.nama +
//       '\n  Min:  ' + (p.min_C !== null ? p.min_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Max:  ' + (p.max_C !== null ? p.max_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Mean: ' + (p.mean_C !== null ? p.mean_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Data valid: ' + (p.pct_valid !== null ? p.pct_valid.toFixed(1) : 'NA') + ' %'
//     );
//   });
// });

// // Visual contoh (P95→P90→P80 filled) untuk satu gunung
// var contoh = volcanoes[1];
// var icC = loadLandsatL2(contoh.area, START, END);
// var lstFilledC = ladderFillLST(icC);
// Map.addLayer(lstFilledC, {min: 0, max: 70, palette: ['blue','cyan','yellow','orange','red']},
//             'LST filled ' + contoh.name);
// Map.centerObject(contoh.area, 10);


// // ==========================================================================================================
// // UTILITIES
// // =====================
// function addLST_Celsius(image) {
//   // Scale factor & offset resmi untuk ST_B10 (Collection 2 Level-2)
//   // LST(°C) = DN * 0.00341802 - 124.15
//   var lstC = image.select('ST_B10')
//                   .multiply(0.00341802)
//                   .add(-124.15)
//                   .rename('LST_C')
//                   .toDouble();
//   return image.addBands(lstC, null, true);
// }

// function loadLandsatL2(area, start, end) {
//   var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
//               .filterBounds(area).filterDate(start, end);
//   var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
//               .filterBounds(area).filterDate(start, end);
//   return l8.merge(l9)
//     .map(addLST_Celsius)
//     .map(function(img){ return img.clip(area); });
// }

// // =====================
// // PARAMS
// // =====================
// var START = '2013-04-01';
// var END   = '2025-01-01';

// // =====================
// // LOOP SEMUA GUNUNG
// // =====================
// var feats = volcanoes.map(function(v) {
//   var area = v.area;
//   var name = v.name;

//   var ic = loadLandsatL2(area, START, END);

//   // Ambil nilai maksimum dari semua citra
//   var lstMax = ic.select('LST_C').reduce(ee.Reducer.max()).rename('LST_C_max');

//   // Ringkasan statistik (min/max/mean + persen area terisi)
//   var stats = lstMax.reduceRegion({
//     reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
//     geometry: area,
//     scale: 30,
//     maxPixels: 1e13,
//     bestEffort: true
//   });

//   // Persentase piksel yang punya data (bukan masked)
//   var maskImg = lstMax.mask().rename('mask');
//   var ones = ee.Image(1);
//   var totalCount = ones.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('constant');

//   var validCount = maskImg.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('mask');

//   var pctValid = ee.Number(validCount).divide(ee.Number(totalCount)).multiply(100);

//   return ee.Feature(null, {
//     nama: name,
//     min_C: stats.get('LST_C_max_min'),
//     max_C: stats.get('LST_C_max_max'),
//     mean_C: stats.get('LST_C_max_mean'),
//     pct_valid: pctValid
//   });
// });

// var fc_results = ee.FeatureCollection(feats);

// // Tabel ringkas
// print('Ringkasan LST (pakai MAX) per gunung:', fc_results);

// // Print per-baris dengan format rapi
// fc_results.evaluate(function(fc) {
//   fc.features.forEach(function(f) {
//     var p = f.properties;
//     print(
//       'Gunung ' + p.nama +
//       '\n  Min:  ' + (p.min_C !== null ? p.min_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Max:  ' + (p.max_C !== null ? p.max_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Mean: ' + (p.mean_C !== null ? p.mean_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Data valid: ' + (p.pct_valid !== null ? p.pct_valid.toFixed(1) : 'NA') + ' %'
//     );
//   });
// });

// // Visual contoh pakai MAX
// var contoh = volcanoes[1];
// var icC = loadLandsatL2(contoh.area, START, END);
// var lstMaxC = icC.select('LST_C').reduce(ee.Reducer.max());
// Map.addLayer(lstMaxC, {min: 0, max: 70, palette: ['blue','cyan','yellow','orange','red']},
//             'LST max ' + contoh.name);
// Map.centerObject(contoh.area, 10);



// // ===================================================================================================
// // UTILITIES
// // ===================================================================


// function toaToBT(image) {
  
//   // Ambil sample kecil
//   var ic = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
//             .filterDate('2024-01-01', '2024-12-31')
//             .limit(1);
  
//   var img = ee.Image(ic.first());

//   var ML = ee.Image.constant(img.get('RADIANCE_MULT_BAND_10'));
//   var AL = ee.Image.constant(img.get('RADIANCE_ADD_BAND_10'));
//   var K1 = ee.Image.constant(img.get('K1_CONSTANT_BAND_10'));
//   var K2 = ee.Image.constant(img.get('K2_CONSTANT_BAND_10'));

//   // 1. Radiance = ML * DN + AL
//   var radiance = image.select('B10').multiply(ML).add(AL);

//   // 2. Brightness Temperature (Kelvin)
//   var BT_K = K2.divide(K1.divide(radiance).add(1).log());

//   // 3. Konversi ke Celcius
//   var BT_C = BT_K.subtract(ee.Image.constant(273.15))
//                 .rename('BT_C')
//                 .toFloat();

//   return image.addBands(BT_C);
// }


// function loadLandsatTOA(area, start, end) {
//   return ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
//           .filterBounds(area)
//           .filterDate(start, end)
//           .map(toaToBT)
//           .map(function(img){ return img.clip(area); });
// }


// // ===================================================================
// // PARAMS
// // ===================================================================
// var START = '2022-04-01';
// var END   = '2025-01-01';

// // ===================================================================
// // LOOP SEMUA GUNUNG
// // ===================================================================
// var feats = volcanoes.map(function(v) {
//   var area = v.area;
//   var name = v.name;

//   var ic = loadLandsatTOA(area, START, END);
//   var nImages = ic.size();

//   // Ambil nilai maksimum (untuk spatial summary)
//   var btMax = ic.select('BT_C').reduce(ee.Reducer.max()).rename('BT_C_max');

//   // Statistik per-area (min, max, mean)
//   var stats = btMax.reduceRegion({
//     reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
//     geometry: area,
//     scale: 30,
//     maxPixels: 1e13,
//     bestEffort: true
//   });

//   // Persentase area valid (pernah ada data 1x saja)
//   var maskImg = btMax.mask();
//   var totalCount = ee.Image(1).reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('constant');

//   var validCount = maskImg.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('BT_C_max');

//   var pctValid = ee.Number(validCount).divide(ee.Number(totalCount)).multiply(100);

//   // Persentase valid temporal rata-rata (per piksel rata-rata sepanjang waktu)
//   var countValidPerPixel = ic.select('BT_C').map(function(img){
//     return img.mask().rename('mask');
//   }).sum();

//   var temporalValid = countValidPerPixel.divide(ee.Number(nImages)).multiply(100);
//   var temporalMean = temporalValid.reduceRegion({
//     reducer: ee.Reducer.mean(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('mask');

//   return ee.Feature(null, {
//     nama: name,
//     min_C: stats.get('BT_C_max_min'),
//     max_C: stats.get('BT_C_max_max'),
//     mean_C: stats.get('BT_C_max_mean'),
//     pct_area_valid: pctValid,
//     pct_temporal_valid: temporalMean
//   });
// });

// var fc_results = ee.FeatureCollection(feats);

// // ===================================================================
// // OUTPUT
// // ===================================================================
// print('Ringkasan BT (pakai MAX) per gunung:', fc_results);

// // Format rapi
// fc_results.evaluate(function(fc) {
//   fc.features.forEach(function(f) {
//     var p = f.properties;
//     print(
//       'Gunung ' + p.nama +
//       '\n  Min:  ' + (p.min_C !== null ? p.min_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Max:  ' + (p.max_C !== null ? p.max_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Mean: ' + (p.mean_C !== null ? p.mean_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  % Area valid (pernah sekali saja): ' + (p.pct_area_valid !== null ? p.pct_area_valid.toFixed(1) : 'NA') + ' %' +
//       '\n  % Valid temporal rata-rata: ' + (p.pct_temporal_valid !== null ? p.pct_temporal_valid.toFixed(1) : 'NA') + ' %'
//     );
//   });
// });

// // ===================================================================
// // VISUALISASI CONTOH
// // ===================================================================
// var contoh = volcanoes[1];
// var icC = loadLandsatTOA(contoh.area, START, END);
// var btMaxC = icC.select('BT_C').reduce(ee.Reducer.max());

// Map.centerObject(contoh.area, 10);
// Map.addLayer(btMaxC, {min: 0, max: 70, palette: ['blue','cyan','yellow','orange','red']},
//             'BT max ' + contoh.name);



// ===================================================================================================
// UTILITIES
// ===================================================================


function toaToBT(image) {
  
  // Ambil sample kecil
  var ic = ee.ImageCollection('LANDSAT/LC09/C02/T1')
             .filterDate('2024-01-01', '2024-01-31')
             .limit(1);
  
  var img = ee.Image(ic.first());

  var ML = ee.Image.constant(img.get('RADIANCE_MULT_BAND_10'));
  var AL = ee.Image.constant(img.get('RADIANCE_ADD_BAND_10'));
  var K1 = ee.Image.constant(img.get('K1_CONSTANT_BAND_10'));
  var K2 = ee.Image.constant(img.get('K2_CONSTANT_BAND_10'));

  // 1. Radiance = ML * DN + AL
  var radiance = image.select('B10').multiply(ML).add(AL);

  // 2. Brightness Temperature (Kelvin)
    var BT_K = radiance.expression(
    'K2 / log((K1 / L) + 1)', {
      'K1': K1,
      'K2': K2,
      'L': radiance
    }
  );

  // 3. Konversi ke Celcius
  var BT_C = BT_K.subtract(ee.Image.constant(273.15))
                 .rename('BT_C')
                 .toFloat();

  return image.addBands(BT_C);
}


function loadLandsatTOA(area, start, end) {
  return ee.ImageCollection('LANDSAT/LC09/C02/T1')
           .filterBounds(area)
           .filterDate(start, end)
           .map(toaToBT)
           .map(function(img){ return img.clip(area); });
}


// ===================================================================
// PARAMS
// ===================================================================
var START = '2025-01-01';
var END   = '2025-06-01';

// ===================================================================
// LOOP SEMUA GUNUNG
// ===================================================================
var feats = volcanoes.map(function(v) {
  var area = v.area;
  var name = v.name;

  var ic = loadLandsatTOA(area, START, END);
  var nImages = ic.size();

  // Ambil nilai maksimum (untuk spatial summary)
  var btMax = ic.select('BT_C').reduce(ee.Reducer.max()).rename('BT_C_max');

  // Statistik per-area (min, max, mean)
  var stats = btMax.reduceRegion({
    reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
    geometry: area,
    scale: 30,
    maxPixels: 1e13,
    bestEffort: true
  });

  // Persentase area valid (pernah ada data 1x saja)
  var maskImg = btMax.mask();
  var totalCount = ee.Image(1).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
  }).get('constant');

  var validCount = maskImg.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
  }).get('BT_C_max');

  var pctValid = ee.Number(validCount).divide(ee.Number(totalCount)).multiply(100);
  
  var geomArea = ee.Feature(area).geometry();

  Export.image.toDrive({
    image: btMax,
    description: 'BT_max_' + name,
    folder: 'BT_Max_Images',
    scale: 30,
    region: geomArea,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    crs: 'EPSG:4326'
  });

  return ee.Feature(null, {
    nama: name,
    min_C: stats.get('BT_C_max_min'),
    max_C: stats.get('BT_C_max_max'),
    mean_C: stats.get('BT_C_max_mean'),
    pct_area_valid: pctValid
  });
  
  
});

var fc_results = ee.FeatureCollection(feats);

// ===================================================================
// OUTPUT
// ===================================================================
print('Ringkasan BT (pakai MAX) per gunung:');

// Format rapi
fc_results.evaluate(function(fc) {
  fc.features.forEach(function(f) {
    var p = f.properties;
    print(
      'Gunung ' + p.nama +
      '\n  Min:  ' + (p.min_C !== null ? p.min_C.toFixed(2) : 'NA') + ' °C' +
      '\n  Max:  ' + (p.max_C !== null ? p.max_C.toFixed(2) : 'NA') + ' °C' +
      '\n  Mean: ' + (p.mean_C !== null ? p.mean_C.toFixed(2) : 'NA') + ' °C' +
      '\n  % Area valid: ' + (p.pct_area_valid !== null ? p.pct_area_valid.toFixed(1) : 'NA') + ' %'
    );
  });
});

// ===================================================================
// LOOP VISUALISASI TIAP GUNUNG
// ===================================================================
// fc_results.evaluate(function(fc) {
//   fc.features.forEach(function(f, i) {
//     var p = f.properties;
//     var volcano = volcanoes[i];
    
//     // Ambil koleksi BT per gunung
//     var ic = loadLandsatTOA(volcano.area, START, END);
//     var btMax = ic.select('BT_C').reduce(ee.Reducer.max());
    
//     // Set min/max untuk color scale sesuai statistik
//     var minVal = p.min_C !== null ? p.min_C : 0;
//     var maxVal = p.max_C !== null ? p.max_C : 40;
    
//     // Tambahkan layer ke Map
//     Map.addLayer(btMax, 
//                 {min: minVal, max: maxVal, palette: ['blue','cyan','yellow','orange','red']}, 
//                 'BT max ' + p.nama);
//   });
// });

// Contoh visualisasi Gunung Merapi
var contoh = volcanoes[44]; 
var icC = loadLandsatTOA(contoh.area, START, END); 
var btMaxC = icC.select('BT_C').reduce(ee.Reducer.max()); 
Map.centerObject(contoh.area, 10); 
Map.addLayer(btMaxC, {min: 0, max: 40, palette: ['blue','cyan','yellow','orange','red']}, 'BT max ' + contoh.name);

// Expor ke gdrive
Export.table.toDrive({
  collection: fc_results,          // FeatureCollection yang mau diexport
  description: 'BT_summary_volcanoes', // Nama task di GEE
  fileFormat: 'CSV',               // Bisa juga 'GeoJSON' kalau mau
  selectors: ['nama','min_C','max_C','mean_C','pct_area_valid'] // Kolom yang mau diexport
});



// // ===================================================================
// // PARAMS
// // ===================================================================
// var START = '2025-01-01';
// var END   = '2025-06-01';

// // ===================================================================
// // LOOP SEMUA GUNUNG
// // ===================================================================
// var feats = volcanoes.map(function(v) {
//   var area = v.area;
//   var name = v.name;

//   var ic = loadLandsatTOA(area, START, END);
//   var nImages = ic.size();

//   // Ambil nilai maksimum (untuk spatial summary)
//   var btMax = ic.select('BT_C').reduce(ee.Reducer.max()).rename('BT_C_max');

//   // Statistik per-area (min, max, mean)
//   var stats = btMax.reduceRegion({
//     reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
//     geometry: area,
//     scale: 30,
//     maxPixels: 1e13,
//     bestEffort: true
//   });

//   // Persentase area valid (pernah ada data 1x saja)
//   var maskImg = btMax.mask();
//   var totalCount = ee.Image(1).reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('constant');

//   var validCount = maskImg.reduceRegion({
//     reducer: ee.Reducer.sum(),
//     geometry: area, scale: 30, maxPixels: 1e13, bestEffort: true
//   }).get('BT_C_max');

//   var pctValid = ee.Number(validCount).divide(ee.Number(totalCount)).multiply(100);
  
//   var geomArea = ee.Feature(area).geometry();

//   Export.image.toDrive({
//     image: btMax,
//     description: 'BT_max_' + name,
//     folder: 'BT_Max_Images',
//     scale: 30,
//     region: geomArea,
//     maxPixels: 1e13,
//     fileFormat: 'GeoTIFF',
//     crs: 'EPSG:4326'
//   });

//   return ee.Feature(null, {
//     nama: name,
//     min_C: stats.get('BT_C_max_min'),
//     max_C: stats.get('BT_C_max_max'),
//     mean_C: stats.get('BT_C_max_mean'),
//     pct_area_valid: pctValid
//   });
  
  
// });

// var fc_results = ee.FeatureCollection(feats);

// // ===================================================================
// // OUTPUT
// // ===================================================================
// print('Ringkasan BT (pakai MAX) per gunung:');

// // Format rapi
// fc_results.evaluate(function(fc) {
//   fc.features.forEach(function(f) {
//     var p = f.properties;
//     print(
//       'Gunung ' + p.nama +
//       '\n  Min:  ' + (p.min_C !== null ? p.min_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Max:  ' + (p.max_C !== null ? p.max_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  Mean: ' + (p.mean_C !== null ? p.mean_C.toFixed(2) : 'NA') + ' °C' +
//       '\n  % Area valid: ' + (p.pct_area_valid !== null ? p.pct_area_valid.toFixed(1) : 'NA') + ' %'
//     );
//   });
// });


// // Contoh visualisasi Gunung Merapi
// var contoh = volcanoes[44]; 
// var icC = loadLandsatTOA(contoh.area, START, END); 
// var btMaxC = icC.select('BT_C').reduce(ee.Reducer.max()); 
// Map.centerObject(contoh.area, 10); 
// Map.addLayer(btMaxC, {min: 0, max: 40, palette: ['blue','cyan','yellow','orange','red']}, 'BT max ' + contoh.name);

// // Expor ke gdrive
// Export.table.toDrive({
//   collection: fc_results,          // FeatureCollection yang mau diexport
//   description: 'BT_summary_volcanoes', // Nama task di GEE
//   fileFormat: 'CSV',               // Bisa juga 'GeoJSON' kalau mau
//   selectors: ['nama','min_C','max_C','mean_C','pct_area_valid'] // Kolom yang mau diexport
// });



//FOR ONE VOLCANO

// ===================================================================
// PARAMS
// ===================================================================
var START = '2023-06-01';
var END   = '2025-06-01';

var targetName = "Agung";   // ganti sesuai nama
var target = volcanoes.filter(function(v) {
  return v.name === targetName;
})[0];

// print('Gunung target:', target);

// ===================================================================
// UTILITIES
// ===================================================================
function toaToBT(image) {
  var ML = ee.Image.constant(image.get('RADIANCE_MULT_BAND_10'));
  var AL = ee.Image.constant(image.get('RADIANCE_ADD_BAND_10'));
  var K1 = ee.Image.constant(image.get('K1_CONSTANT_BAND_10'));
  var K2 = ee.Image.constant(image.get('K2_CONSTANT_BAND_10'));

  var radiance = image.select('B10').multiply(ML).add(AL);

  var BT_K = radiance.expression(
    'K2 / log((K1 / L) + 1)', {
      'K1': K1,
      'K2': K2,
      'L': radiance
    }
  );

  var BT_C = BT_K.subtract(273.15).rename('BT_C').toFloat();

  return image.addBands(BT_C);
}

function maskL8sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloud = qa.bitwiseAnd(1 << 3).neq(0);
  var shadow = qa.bitwiseAnd(1 << 4).neq(0);
  var mask = cloud.or(shadow).not();
  return image.updateMask(mask);
}

// ===================================================================
// AMBIL DATA
// ===================================================================
var geometryCollection = target.area;
var geometries = geometryCollection.geometries();
var volcanoArea = ee.Geometry(geometries.get(1));

var ic = ee.ImageCollection('LANDSAT/LC09/C02/T1')
          .filterBounds(volcanoArea)
          .filterDate(START, END)
          .map(maskL8sr)   
          .map(toaToBT);

// Agregasi thermal pakai median (persentil 50)
var bt = ic.select('BT_C')
           .reduce(ee.Reducer.percentile([60]))
           .rename('BT_C_p50')
           .toFloat();

// Ambil median RGB untuk true color
var rgb = ic.select(['B4','B3','B2'])
            .reduce(ee.Reducer.percentile([60]))
            .toFloat();

// Gabung jadi 1 image multi-band
var exportImg = bt.addBands(rgb).clip(volcanoArea);


// Gabung jadi 1 image multi-band
var exportImg = bt.addBands(rgb).clip(volcanoArea);

// // ===================================================================
// // STATISTIK
// // ===================================================================
// var stats = bt.reduceRegion({
//   reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
//   geometry: volcanoArea,
//   scale: 30,
//   maxPixels: 1e13,
//   bestEffort: true
// });

// print('Statistik BT (persentil 50) untuk ' + targetName, stats);

// ===================================================================
// EXPORT
// ===================================================================
Export.image.toDrive({
  image: exportImg,
  description: 'Thermal_RGB_' + targetName,
  folder: 'BT_Max_Images',
  scale: 30,
  region: volcanoArea,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326'
});



// // VISUALIZATION
// // ===============================================================
// // Hitung min & max dari band BT_C_max
// // ===============================================================
// var stats = btMax.reduceRegion({
//   reducer: ee.Reducer.minMax(),
//   geometry: volcanoArea,   // area studi
//   scale: 30,               // resolusi Landsat
//   bestEffort: true
// });

// // Ambil nilai min & max
// var minBT = ee.Number(stats.get('BT_C_max_min'));
// var maxBT = ee.Number(stats.get('BT_C_max_max'));

// // Tampilkan di console biar cek
// print('BT Min (°C):', minBT);
// print('BT Max (°C):', maxBT);

// // ===============================================================
// // VISUALISASI
// // ===============================================================
// var visParams = {
//   min: minBT.getInfo(),
//   max: maxBT.getInfo(),
//   palette: [
//     "040274", "2c7bb6", "abd9e9", "ffffbf", "fdae61", "d7191c"
//   ]
// };

// Map.centerObject(volcanoArea, 10);
// Map.addLayer(btMax, visParams, 'BT Max (°C)');


// ALL VOLCANOES (THERMAL + TRUE COLOR)

 // Daftar gunung berapi yang akan digunakan
var volcanoes = [
  {name: "Agung", area: Agung},
  {name: "Ambang", area: Ambang},
  {name: "Anak_Krakatau", area: Anak_Krakatau},
  {name: "Anak_Ranakah", area: Anak_Ranakah},
  {name: "Arjuno_Welirang", area: Arjuno_Welirang},
  {name: "Awu", area: Awu},
  {name: "Banda_Api", area: Banda_Api},
  {name: "Batur", area: Batur},
  {name: "Batutara", area: Batutara},
  {name: "Bromo", area: Bromo},
  {name: "Bur_Ni_Telong", area: Bur_Ni_Telong},
  {name: "Ciremai", area: Ciremai},
  {name: "Colo", area: Colo},
  {name: "Dempo", area: Dempo},
  {name: "Dieng", area: Dieng_KRB},
  {name: "Dukono", area: Dukono},
  {name: "Ebulobo", area: Ebulobo},
  {name: "Egon", area: Egon},
  {name: "Galunggung", area: Galunggung},
  {name: "Gamalama", area: Gamalama},
  {name: "Gamkonora", area: Gamkonora},
  {name: "Gede", area: Gede},
  {name: "Guntur", area: Guntur},
  {name: "Ibu", area: Ibu},
  {name: "Ijen", area: Ijen},
  {name: "Ile_Werung", area: Ile_Werung},
  {name: "Ili_Boleng", area: Ili_Boleng},
  {name: "Ili_Lewotolok", area: Ili_Lewotolok},
  {name: "Inielika", area: Inielika},
  {name: "Inierie", area: Inierie},
  {name: "Iya", area: Iya},
  {name: "Kaba", area: Kaba},
  {name: "Karangetang", area: Karangetang},
  {name: "Kelimutu", area: Kelimutu},
  {name: "Kelud", area: Kelud},
  {name: "Kerinci", area: Kerinci},
  {name: "Kie_Besi", area: Kie_Besi},
  {name: "Lamongan", area: Lamongan},
  {name: "Lereboleng", area: Lereboleng},
  {name: "Lewotobi_Laki_Laki", area: Lewotobi_Laki_laki},
  {name: "Lewotobi_Perempuan", area: Lewotobi_Perempuan},
  {name: "Lokon", area: Lokon},
  {name: "Mahawu", area: Mahawu},
  {name: "Marapi", area: Marapi},
  {name: "Merapi", area: Merapi},
  {name: "Papandayan", area: Papandayan},
  {name: "Peut_Sague", area: Peut_Sague},
  {name: "Raung", area: Raung},
  {name: "Rinjani", area: Rinjani},
  {name: "Rokatenda", area: Rokatenda},
  {name: "Ruang", area: Ruang},
  {name: "Salak", area: Salak},
  {name: "Sangeangapi", area: Sangeangapi},
  {name: "Semeru", area: Semeru},
  {name: "Seulawah_Agam", area: Seulawah_Agam},
  {name: "Sinabung", area: Sinabung},
  {name: "Sirung", area: Sirung},
  {name: "Slamet", area: Slamet},
  {name: "Soputan", area: Soputan},
  {name: "Sorikmarapi", area: Sorikmarapi},
  {name: "Sumbing", area: Sumbing},
  {name: "Sundoro", area: Sundoro},
  {name: "Talang", area: Talang},
  {name: "Tambora", area: Tambora},
  {name: "Tandikat", area: Tandikat_KRB},
  {name: "Tangkoko", area: Tangkoko_KRB},
  {name: "Tangkuban_Parahu", area: Tangkuban_Parahu},
  {name: "Wurlali", area: Wurlali}
];


// ===================================================================
// PARAMS
// ===================================================================
// pakai data selama 2 tahun
var START = '2023-06-01';
var END   = '2025-06-01';

// ===================================================================
// UTILITIES
// ===================================================================
function toaToBT(image) {
  var ML = ee.Image.constant(image.get('RADIANCE_MULT_BAND_10'));
  var AL = ee.Image.constant(image.get('RADIANCE_ADD_BAND_10'));
  var K1 = ee.Image.constant(image.get('K1_CONSTANT_BAND_10'));
  var K2 = ee.Image.constant(image.get('K2_CONSTANT_BAND_10'));

  var radiance = image.select('B10').multiply(ML).add(AL);

  var BT_K = radiance.expression(
    'K2 / log((K1 / L) + 1)', {
      'K1': K1,
      'K2': K2,
      'L': radiance
    }
  );

  var BT_C = BT_K.subtract(273.15).rename('BT_C').toFloat();

  return image.addBands(BT_C);
}

function maskL8sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloud = qa.bitwiseAnd(1 << 3).neq(0);
  var shadow = qa.bitwiseAnd(1 << 4).neq(0);
  var mask = cloud.or(shadow).not();
  return image.updateMask(mask);
}

// ===================================================================
// LOOPING SEMUA GUNUNG
// ===================================================================
volcanoes.forEach(function(target) {
  var name = target.name;
  print('Processing:', name);

  var geometryCollection = target.area;
  var geometries = geometryCollection.geometries();
  var volcanoArea = ee.Geometry(geometries.get(1));

  // Koleksi Landsat
  var ic = ee.ImageCollection('LANDSAT/LC09/C02/T1')
              .filterBounds(volcanoArea)
              .filterDate(START, END)
              .map(maskL8sr)   
              .map(toaToBT);

  // Agregasi thermal
  var bt = ic.select('BT_C')
             .reduce(ee.Reducer.percentile([60]))
             .rename('BT_C_p60')
             .toFloat();

  // Ambil percentile RGB
  var rgb = ic.select(['B4','B3','B2'])
              .reduce(ee.Reducer.percentile([60]))
              .toFloat();

  // Gabung
  var exportImg = bt.addBands(rgb).clip(volcanoArea);

  // Export task
  Export.image.toDrive({
    image: exportImg,
    description: 'Thermal_RGB_' + name,
    folder: 'BT_Max_Images',
    scale: 30,
    region: volcanoArea,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    crs: 'EPSG:4326'
  });
});



// ===================================================================
// PARAMS
// ===================================================================
// pakai data selama 2 tahun
var START = '2022-06-01';
var END   = '2025-06-01';

// ===================================================================
// UTILITIES
// ===================================================================
function toaToBT(image) {
  // var ML = ee.Image.constant(image.get('RADIANCE_MULT_BAND_10'));
  // var AL = ee.Image.constant(image.get('RADIANCE_ADD_BAND_10'));
  // var K1 = ee.Image.constant(image.get('K1_CONSTANT_BAND_10'));
  // var K2 = ee.Image.constant(image.get('K2_CONSTANT_BAND_10'));
  
  var ML = 0.00038;
  var AL = 0.1;
  var K1 = 799.0284;
  var K2 = 1329.2405;

  var radiance = image.select('B10').multiply(ML).add(AL);

  var BT_K = radiance.expression(
    'K2 / log((K1 / L) + 1)', {
      'K1': K1,
      'K2': K2,
      'L': radiance
    }
  );

  var BT_C = BT_K.subtract(273.15).rename('BT_C').toFloat();

  return image.addBands(BT_C);
}

function maskL8sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloud = qa.bitwiseAnd(1 << 3).neq(0);
  var shadow = qa.bitwiseAnd(1 << 4).neq(0);
  var mask = cloud.or(shadow).not();
  return image.updateMask(mask);
}

// ===================================================================
// LOOPING SEMUA GUNUNG
// ===================================================================
volcanoes.forEach(function(target) {
  var name = target.name;

  var geometryCollection = target.area;
  var geometries = geometryCollection.geometries();
  var volcanoArea = ee.Geometry(geometries.get(1));

  // Koleksi Landsat
  var ic = ee.ImageCollection('LANDSAT/LC09/C02/T1')
              .filterBounds(volcanoArea)
              .filterDate(START, END)
              .map(maskL8sr)   
              .map(toaToBT);

  // Agregasi thermal
  var bt = ic.select('BT_C')
            .reduce(ee.Reducer.percentile([30]))
            .rename('BT_C_p30')
            .toFloat();

  // Ambil percentile RGB
  var rgb = ic.select(['B4','B3','B2'])
              .reduce(ee.Reducer.percentile([30]))
              .toFloat();

  // Gabung
  var exportImg = bt.addBands(rgb).clip(volcanoArea);

  // Export task
  Export.image.toDrive({
    image: exportImg,
    description: 'Thermal_RGB_' + name,
    folder: 'BT_Max_Images',
    scale: 30,
    region: volcanoArea,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    crs: 'EPSG:4326'
  });
});




// // VIZ ONE VOLCANO ===================================================================
// // PARAMS
// // ===================================================================
// // YYYY-MM-DD
// var START = '2023-06-01';
// var END   = '2025-06-01';

// var targetName = "Kelimutu";   // ganti sesuai nama
// var target = volcanoes.filter(function(v) {
//   return v.name === targetName;
// })[0];

// // print('Gunung target:', target);

// // ===================================================================
// // UTILITIES
// // ===================================================================
// function toaToBT(image) {
//   var ML = ee.Image.constant(image.get('RADIANCE_MULT_BAND_10'));
//   var AL = ee.Image.constant(image.get('RADIANCE_ADD_BAND_10'));
//   var K1 = ee.Image.constant(image.get('K1_CONSTANT_BAND_10'));
//   var K2 = ee.Image.constant(image.get('K2_CONSTANT_BAND_10'));

//   var radiance = image.select('B10').multiply(ML).add(AL);

//   var BT_K = radiance.expression(
//     'K2 / log((K1 / L) + 1)', {
//       'K1': K1,
//       'K2': K2,
//       'L': radiance
//     }
//   );

//   var BT_C = BT_K.subtract(273.15).rename('BT_C').toFloat();

//   return image.addBands(BT_C);
// }

// function maskL8sr(image) {
//   var qa = image.select('QA_PIXEL');
//   var cloud = qa.bitwiseAnd(1 << 3).neq(0);
//   var shadow = qa.bitwiseAnd(1 << 4).neq(0);
//   var mask = cloud.or(shadow).not();
//   return image.updateMask(mask);
// }

// // ===================================================================
// // AMBIL DATA
// // ===================================================================
// var geometryCollection = target.area;
// var geometries = geometryCollection.geometries();
// var volcanoArea = ee.Geometry(geometries.get(1));

// var ic = ee.ImageCollection('LANDSAT/LC09/C02/T1')
//           .filterBounds(volcanoArea)
//           .filterDate(START, END)
//           .map(maskL8sr)   
//           .map(toaToBT);

// // Agregasi thermal pakai median (persentil 50)
// var bt = ic.select('BT_C')
//           .reduce(ee.Reducer.percentile([70]))
//           .rename('BT_C')
//           .toFloat();

// // Ambil median RGB untuk true color
// var rgb = ic.select(['B4','B3','B2'])
//             .reduce(ee.Reducer.percentile([70]))
//             .toFloat();

// // Gabung jadi 1 image multi-band
// var exportImg = bt.addBands(rgb).clip(volcanoArea);


// // Gabung jadi 1 image multi-band
// var exportImg = bt.addBands(rgb).clip(volcanoArea);

// // ===================================================================
// // STATISTIK
// // ===================================================================
// var stats = bt.reduceRegion({
//   reducer: ee.Reducer.minMax().combine({reducer2: ee.Reducer.mean(), sharedInputs:true}),
//   geometry: volcanoArea,
//   scale: 30,
//   maxPixels: 1e13,
//   bestEffort: true
// });

// print('Statistik BT (persentil 50) untuk ' + targetName, stats);



// // VISUALIZATION
// // ===============================================================
// // Hitung min & max dari band BT_C_max
// // ===============================================================
// var stats = bt.reduceRegion({
//   reducer: ee.Reducer.minMax(),
//   geometry: volcanoArea,   // area studi
//   scale: 30,               // resolusi Landsat
//   bestEffort: true
// });

// // Ambil nilai min & max
// var minBT = ee.Number(stats.get('BT_C_min'));
// var maxBT = ee.Number(stats.get('BT_C_max'));

// // Tampilkan di console biar cek
// print('BT Min (°C):', minBT);
// print('BT Max (°C):', maxBT);

// // ===============================================================
// // VISUALISASI
// // ===============================================================
// var visParams = {
//   min: minBT.getInfo(),
//   max: maxBT.getInfo(),
//   palette: [
//     "040274", "2c7bb6", "abd9e9", "ffffbf", "fdae61", "d7191c"
//   ]
// };

// // clip hasil BT ke volcanoArea
// var bt_clipped = bt.clip(volcanoArea);

// // tampilkan hasil clip
// // Map.centerObject(volcanoArea, 10);
// Map.addLayer(bt_clipped, visParams, 'BT p60 (clipped)');
