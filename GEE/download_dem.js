//TERDAPAT 2 MACAM KODE
//1. Menggunakan DEM dari GEE dengan buffer (untuk gunung di Indonesia yang terpencil/gunung luar Indonesia)
//2. Menggunakan DEM dari Indonesia Geospasial yang menyediakan DEM per provinsi di Indonesia


// KODE 1
// Daftar gunung yang pakai DEM dari GEE dengan buffer
var volcanoesWithBuffer = [
  { name: "Anak_Krakatau", area: Anak_Krakatau, buffer: 1000 },
  { name: "Wurlali", area: Wurlali, buffer: 4000 },
  { name: "Banda_Api", area: Banda_Api, buffer: 3000 },
  { name: "Colo", area: Colo, buffer: 5000 }
];

// Proses tiap gunung
volcanoesWithBuffer.forEach(function(volcano) {
  // Ambil GeometryCollection
  var geomCollection = ee.Geometry(volcano.area);

  // Ambil semua geometri (Point dan Polygon)
  var geometries = ee.List(geomCollection.geometries());

  // Ambil Point untuk buffer
  var point = ee.Geometry(geometries.get(0));

  // Ambil Polygon untuk kliping akhir
  var polygon = ee.Geometry(geometries.get(1));

  // Buat buffer dari Point
  var bufferedArea = point.buffer(volcano.buffer);

  // Ambil DEM SRTM dan potong dengan buffer (supaya data cukup luas)
  var demBuffered = ee.Image("USGS/SRTMGL1_003").clip(bufferedArea);

  // Lalu potong lagi dengan kotak Polygon sesuai area Sentinel
  var demFinal = demBuffered.clip(polygon);

  // Ekspor hasil akhir ke Drive
  Export.image.toDrive({
    image: demFinal,
    description: "DEM_SRTM_" + volcano.name,
    folder: "DEM_Exports",
    region: polygon, // clip terakhir
    scale: 30,
    maxPixels: 1e13,
    fileFormat: "GeoTIFF",
    crs: "EPSG:4326"
  });
});


// KODE 2
// Mapping gunung ke DEM provinsi yang sesuai
var volcanoDEMList = [
  // Aceh
  { name: "Bur_Ni_Telong", area: Bur_Ni_Telong, dem: DEM_Aceh },
  { name: "Peut_Sague", area: Peut_Sague, dem: DEM_Aceh },
  { name: "Seulawah_Agam", area: Seulawah_Agam, dem: DEM_Aceh },

  // Bali
  { name: "Agung", area: Agung, dem: DEM_Bali },
  { name: "Batur", area: Batur, dem: DEM_Bali },

  // Bengkulu
  { name: "Kaba", area: Kaba, dem: DEM_Bengkulu },
  { name: "Dempo", area: Dempo, dem: DEM_Bengkulu },

  // Jawa Barat
  { name: "Ciremai", area: Ciremai, dem: DEM_Jawa_Barat },
  { name: "Galunggung", area: Galunggung, dem: DEM_Jawa_Barat },
  { name: "Gede", area: Gede, dem: DEM_Jawa_Barat },
  { name: "Guntur", area: Guntur, dem: DEM_Jawa_Barat },
  { name: "Papandayan", area: Papandayan, dem: DEM_Jawa_Barat },
  { name: "Salak", area: Salak, dem: DEM_Jawa_Barat },
  { name: "Tangkuban_Parahu", area: Tangkuban_Parahu, dem: DEM_Jawa_Barat },

  // Jawa Tengah
  { name: "Merapi", area: Merapi, dem: DEM_Jawa_Tengah },
  { name: "Dieng", area: Dieng_KRB, dem: DEM_Jawa_Tengah },
  { name: "Slamet", area: Slamet, dem: DEM_Jawa_Tengah },
  { name: "Sumbing", area: Sumbing, dem: DEM_Jawa_Tengah },
  { name: "Sundoro", area: Sundoro, dem: DEM_Jawa_Tengah },

  // Jawa Timur
  { name: "Arjuno_Welirang", area: Arjuno_Welirang, dem: DEM_Jawa_Timur },
  { name: "Bromo", area: Bromo, dem: DEM_Jawa_Timur },
  { name: "Ijen", area: Ijen, dem: DEM_Jawa_Timur },
  { name: "Kelud", area: Kelud, dem: DEM_Jawa_Timur },
  { name: "Lamongan", area: Lamongan, dem: DEM_Jawa_Timur },
  { name: "Raung", area: Raung, dem: DEM_Jawa_Timur },
  { name: "Semeru", area: Semeru, dem: DEM_Jawa_Timur },

  // Maluku Utara
  { name: "Dukono", area: Dukono, dem: DEM_Maluku_Utara },
  { name: "Gamalama", area: Gamalama, dem: DEM_Maluku_Utara },
  { name: "Gamkonora", area: Gamkonora, dem: DEM_Maluku_Utara },
  { name: "Ibu", area: Ibu, dem: DEM_Maluku_Utara },
  { name: "Kie_Besi", area: Kie_Besi, dem: DEM_Maluku_Utara },

  // NTB
  { name: "Rinjani", area: Rinjani, dem: DEM_NTB },
  { name: "Sangeangapi", area: Sangeangapi, dem: DEM_NTB },
  { name: "Tambora", area: Tambora, dem: DEM_NTB },

  // NTT
  { name: "Anak_Ranakah", area: Anak_Ranakah, dem: DEM_NTT },
  { name: "Batutara", area: Batutara, dem: DEM_NTT },
  { name: "Ebulobo", area: Ebulobo, dem: DEM_NTT },
  { name: "Egon", area: Egon, dem: DEM_NTT },
  { name: "Ile_Werung", area: Ile_Werung, dem: DEM_NTT },
  { name: "Ili_Boleng", area: Ili_Boleng, dem: DEM_NTT },
  { name: "Ili_Lewotolok", area: Ili_Lewotolok, dem: DEM_NTT },
  { name: "Inielika", area: Inielika, dem: DEM_NTT },
  { name: "Inierie", area: Inierie, dem: DEM_NTT },
  { name: "Iya", area: Iya, dem: DEM_NTT },
  { name: "Kelimutu", area: Kelimutu, dem: DEM_NTT },
  { name: "Lereboleng", area: Lereboleng, dem: DEM_NTT },
  { name: "Lewotobi_Laki_Laki", area: Lewotobi_Laki_laki, dem: DEM_NTT },
  { name: "Lewotobi_Perempuan", area: Lewotobi_Perempuan, dem: DEM_NTT },
  { name: "Rokatenda", area: Rokatenda, dem: DEM_NTT },
  { name: "Sirung", area: Sirung, dem: DEM_NTT },

  // Sulawesi Utara
  { name: "Ambang", area: Ambang, dem: DEM_Sulawesi_Utara },
  { name: "Awu", area: Awu, dem: DEM_Sulawesi_Utara },
  { name: "Karangetang", area: Karangetang, dem: DEM_Sulawesi_Utara },
  { name: "Lokon", area: Lokon, dem: DEM_Sulawesi_Utara },
  { name: "Mahawu", area: Mahawu, dem: DEM_Sulawesi_Utara },
  { name: "Ruang", area: Ruang, dem: DEM_Sulawesi_Utara },
  { name: "Soputan", area: Soputan, dem: DEM_Sulawesi_Utara },
  { name: "Tangkoko", area: Tangkoko_KRB, dem: DEM_Sulawesi_Utara },

  // Sumatera Barat
  { name: "Kerinci", area: Kerinci, dem: DEM_Sumatera_Barat },
  { name: "Marapi", area: Marapi, dem: DEM_Sumatera_Barat },
  { name: "Talang", area: Talang, dem: DEM_Sumatera_Barat },
  { name: "Tandikat", area: Tandikat_KRB, dem: DEM_Sumatera_Barat },

  // Sumatera Utara
  { name: "Sinabung", area: Sinabung, dem: DEM_Sumatera_Utara },
  { name: "Sorikmarapi", area: Sorikmarapi, dem: DEM_Sumatera_Utara }
];

volcanoDEMList.forEach(function(v) {
  // Pastikan area jadi Polygon valid
  var geomCollection = ee.Geometry(v.area);
  var geometries = ee.List(geomCollection.geometries());
  
  // Ambil Polygon (indeks 1, karena indeks 0 biasanya Point)
  var polygon = ee.Geometry(geometries.get(1));

  // Clip DEM dengan polygon
  var clippedDEM = v.dem.clip(polygon);

  // Ekspor
  Export.image.toDrive({
    image: clippedDEM,
    description: "DEM_" + v.name,
    folder: "DEM_Exports_ALL",
    region: polygon,
    scale: 30,
    maxPixels: 1e13,
    fileFormat: "GeoTIFF",
    crs: "EPSG:4326"
  });
});
