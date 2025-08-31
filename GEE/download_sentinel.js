//Referensi: https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED#code-editor-javascript
/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */

function maskS2clouds(image) {
    //Band QA60: menyimpan informasi tentang kualitas citra, terutama terkait dengan awan dan cirrus
    var qa = image.select('QA60');
    
    //Setiap piksel dalam band QA60 memiliki nilai dalam bentuk biner
    //Jika nilai desimal QA60 = 0, berarti piksel benar-benar bersih dari awan dan cirrus. (ini yang dicari)
    //Jika nilai QA60 ≥ 1024, berarti ada awan atau cirrus yang perlu dihapus.
    
    //Bit 10 = awan & Bit 11 = cirrus/kabut tipis (0 = tidak ada)
    
    //Mengecek apakah bit ke-10 dan bit ke-11 aktif atau tidak.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
  
    //Mengecek apakah bit ke-10 (awan) bernilai 0 (tidak ada awan)
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    //Mengecek apakah bit ke-11 (cirrus) bernilai 0 (tidak ada cirrus)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    
    //Sentinel-2 memiliki nilai reflektansi dalam skala 0 - 10000
    //Mengonversinya ke skala 0-1 (untuk kemudahan analisis)
    return image.updateMask(mask).multiply(0.0001);
  }
  
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
    {name: "Dieng", area: Dieng},
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
    {name: "Tandikat", area: Tandikat},
    {name: "Tangkoko", area: Tangkoko},
    {name: "Tangkuban_Parahu", area: Tangkuban_Parahu},
    {name: "Wurlali", area: Wurlali}
  ];
  
  
  // Fungsi untuk memproses setiap gunung dan mendapatkan citra Sentinel-2
  volcanoes.forEach(function(volcano) {
    var geometryCollection = volcano.area; // Ambil GeometryCollection langsung dari area
  
    // Ambil daftar geometri sebagai ee.List
    var geometries = geometryCollection.geometries();
  
    // Pilih Polygon jika ada, jika tidak gunakan geometri pertama
    var volcanoArea = ee.Geometry(geometries.get(1)); // Ambil Polygon (elemen ke-1)
  
    //Menggunakan data dari Sentinel 2
    var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
      //Memfilter hanya citra yang mencakup area gunung berapi
      .filterBounds(volcanoArea)
      //Memilih citra terbaru dalam rentang waktu 1 tahun
      .filterDate('2024-03-01', '2025-03-01')
      //Menerapkan masking untuk menghilangkan awan dan cirrus
      .map(maskS2clouds)
      //Mengambil nilai min dari semua citra dalam periode yang dipilih
      .reduce(ee.Reducer.percentile([20]))
      //Memotong gambar sesuai dengan area gunung berapi
      .clip(volcanoArea);
      
    // Ekspor citra ke Google Drive
    Export.image.toDrive({
      image: sentinel2, // Citra yang akan diekspor
      description: "Sentinel2_" + volcano.name, // Nama file output
      folder: "Satellite_Images", // Folder penyimpanan di Google Drive
      scale: 10, // Resolusi output dalam meter
      region: volcanoArea, // Area ekspor mengikuti area gunung berapi
      maxPixels: 1e13, // Hindari error karena terlalu banyak piksel
      fileFormat: "GeoTIFF", // Format output sebagai TIFF
      crs: "EPSG:4326" // Sistem koordinat
    });
    
    // // Ekspor citra ke Google Drive dengan hanya mengambil band B2, B3, dan B4
    // Export.image.toDrive({
    //   image: sentinel2.select(['B2_p25', 'B3_p25', 'B4_p25', 'B8_p25']), // Pilih hanya Band 2, Band 3, dan Band 4 (RGB)
    //   description: "Sentinel2_" + volcano.name, // Nama file output
    //   folder: "Satellite_Images", // Folder penyimpanan di Google Drive
    //   scale: 10, // Resolusi output dalam meter
    //   region: volcanoArea, // Area ekspor mengikuti area gunung berapi
    //   maxPixels: 1e13, // Hindari error karena terlalu banyak piksel
    //   fileFormat: "GeoTIFF", // Format output sebagai TIFF
    //   crs: "EPSG:4326" // Sistem koordinat
    // });
  
  
  
  
    
  });
  
  
  
  