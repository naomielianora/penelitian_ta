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
