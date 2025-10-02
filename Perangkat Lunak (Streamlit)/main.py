import streamlit as st
import os
import tempfile
import matplotlib.pyplot as plt

from utils import (
    metode_1_center_of_mass,
    metode_2_largest_blob,
    metode_4_ndvi_dem,
    metode_8_dem_ndvi,
    metode_9_dem_ndvi_thermal
)

# --- Language dictionary ---
labels = {
    "id": {
        "language": "Bahasa",
        "title": "Deteksi Pusat Gunung Berapi",
        "next": "Lanjut",
        "back": "⬅ Kembali ke Halaman Info",
        "select_method": "Pilih Metode:",
        "methods": [
            "Cluster NDVI Rendah",
            "Blob Terbesar pada Cluster NDVI Rendah",
            "Cluster NDVI rendah + DEM (2D clustering)",
            "Clustering Bertahap (DEM Tinggi → NDVI Rendah)",
            "Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)"
        ],
        "upload_sentinel": "Unggah Sentinel-2 GeoTIFF",
        "upload_dem": "Unggah DEM GeoTIFF",
        "upload_thermal": "Unggah Thermal GeoTIFF",
        "run": "Jalankan Deteksi",
        "error_sentinel": "Harap unggah file Sentinel-2 GeoTIFF.",
        "error_dem": "Harap unggah file DEM GeoTIFF.",
        "error_thermal": "Harap unggah file Thermal GeoTIFF.",
        "result": "Hasil Deteksi: Latitude={lat}, Longitude={lon}",
        "result_title": "Hasil Deteksi"
    },
    "en": {
        "language": "Language",
        "title": "Volcano Center Detection",
        "next": "Next",
        "back": "⬅ Back to Info Page",
        "select_method": "Select Method:",
        "methods": [
            "Low NDVI Cluster",
            "Largest Blob in Low NDVI Cluster",
            "Low NDVI Cluster + DEM (2D clustering)",
            "Stepwise Clustering (High DEM → Low NDVI)",
            "Stepwise Clustering (High DEM → Low NDVI → High Thermal)"
        ],
        "upload_sentinel": "Upload Sentinel-2 GeoTIFF",
        "upload_dem": "Upload DEM GeoTIFF",
        "upload_thermal": "Upload Thermal GeoTIFF",
        "run": "Run Detection",
        "error_sentinel": "Please upload Sentinel-2 GeoTIFF file.",
        "error_dem": "Please upload DEM GeoTIFF file.",
        "error_thermal": "Please upload Thermal GeoTIFF file.",
        "result": "Detection Result: Latitude={lat}, Longitude={lon}",
        "result_title": "Detection Result"
    }
}

# --- Info text (tetep pakai yang udah ada) ---
# --- Language dictionary ---
info_text = {
    "id": """
    <div style="text-align: justify">
    Perangkat lunak ini dirancang untuk membantu mendeteksi pusat dari sebuah gunung berapi
    menggunakan data citra satelit dan topografi. Data yang digunakan adalah nilai NDVI dari satelit Sentinel-2, data ketinggian dari DEM, dan data Brightness Temperature dari satelit Landsat 9. Dari hasil analisis dari 68 gunung berapi aktif di Indonesia, dibentuklah metode yang dapat digunakan untuk gunung berapi dengan karakteristik yang berbeda-beda.

    ****  
    
    **Metode yang tersedia:**  
    1. **Cluster NDVI Rendah**  
    Input: NDVI dari Sentinel-2  
    Proses: K-Means (k=2) pada NDVI → pilih cluster NDVI rendah  
    Output: Center of mass dari semua piksel cluster NDVI rendah

    2. **Blob Terbesar pada Cluster NDVI Rendah**  
    Sama dengan metode sebelumnya, tapi titik pusat = center of mass blob terbesar dari cluster NDVI rendah

    3. **Cluster NDVI rendah + DEM (2D clustering)**  
    Input: NDVI + DEM  
    Proses: K-Means (k=2) dengan fitur NDVI + DEM → pilih cluster NDVI rendah  
    Output: Titik pusat berdasarkan center of mass hasil masking NDVI rendah

    4. **Clustering Bertahap (DEM Tinggi → NDVI Rendah)**  
    Input: NDVI + DEM  
    Proses:  
    Step 1 (DEM): K-Means (k=2) pada DEM → pilih cluster DEM tinggi  
    Step 2 (NDVI): K-Means (k=2) pada NDVI di area DEM tinggi → pilih cluster NDVI rendah  
    Output: Titik pusat berdasarkan center of mass hasil step 2

    5. **Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)**  
    Input: NDVI + DEM + Thermal  
    Proses:  
    Step 1 (DEM): K-Means (k=2) pada DEM → pilih cluster DEM tinggi  
    Step 2 (NDVI): K-Means (k=2) pada NDVI di area DEM tinggi → pilih cluster NDVI rendah  
    Step 3 (Thermal): K-Means (k=2) pada thermal di area NDVI rendah → pilih cluster suhu tinggi  
    Output: Titik pusat berdasarkan center of mass hasil step 3

    **Catatan:**  
    - Center of mass = rata-rata posisi kumpulan piksel  
    - Blob = area berisi piksel yang saling terhubung  
    - NDVI (Normalized Difference Vegetation Index) = indeks vegetasi untuk mengukur tingkat kehijauan (vegetasi hidup) di suatu area
    - DEM (Digital Elevation Model) = data ketinggian permukaan bumi  
    - Thermal/BT (Brightness Temperature) = suhu kecerahan dari citra satelit  

    **Fitur Utama:**  
    - Pengguna dapat mengunggah data citra yang diperlukan sesuai metode, baik itu Sentinel-2 (NDVI), DEM, maupun Thermal  
    - Pilihan metode deteksi pusat menyesuaikan kombinasi data yang diunggah  
    - Sistem menampilkan visualisasi interaktif hasil deteksi pusat pada citra yang diunggah

    </div>
    """,
    "en": """
    <div style="text-align: justify">
    This software is designed to help detect the center of a volcano  
    using satellite imagery and topographic data. The data used include NDVI values from Sentinel-2, elevation data from DEM, and Brightness Temperature data from Landsat 9. Based on the analysis of 68 active volcanoes in Indonesia, a set of methods was developed that can be applied to volcanoes with different characteristics.  

    ****  

    **Available Methods:**  
    1. **Low NDVI Cluster**  
    Input: NDVI from Sentinel-2  
    Process: K-Means (k=2) on NDVI → select low NDVI cluster  
    Output: Center of mass of all pixels in the low NDVI cluster  

    2. **Largest Blob in Low NDVI Cluster**  
    Same as the previous method, but the center point = center of mass of the largest blob in the low NDVI cluster  

    3. **Low NDVI Cluster + DEM (2D clustering)**  
    Input: NDVI + DEM  
    Process: K-Means (k=2) using NDVI + DEM features → select low NDVI cluster  
    Output: Center of mass of the masked low NDVI area  

    4. **Stepwise Clustering (High DEM → Low NDVI)**  
    Input: NDVI + DEM  
    Process:  
    Step 1 (DEM): K-Means (k=2) on DEM → select high DEM cluster  
    Step 2 (NDVI): K-Means (k=2) on NDVI within the high DEM area → select low NDVI cluster  
    Output: Center of mass of the step 2 result  

    5. **Stepwise Clustering (High DEM → Low NDVI → High Thermal)**  
    Input: NDVI + DEM + Thermal  
    Process:  
    Step 1 (DEM): K-Means (k=2) on DEM → select high DEM cluster  
    Step 2 (NDVI): K-Means (k=2) on NDVI within the high DEM area → select low NDVI cluster  
    Step 3 (Thermal): K-Means (k=2) on thermal within the low NDVI area → select high thermal cluster  
    Output: Center of mass of the step 3 result  

    **Notes:**  
    - Center of mass = average position of a group of pixels  
    - Blob = connected area of pixels  
    - NDVI (Normalized Difference Vegetation Index) = a vegetation index used to measure the greenness (live vegetation) in an area  
    - DEM (Digital Elevation Model) = elevation data of the Earth’s surface  
    - Thermal/BT (Brightness Temperature) = surface brightness temperature from satellite imagery  

    **Key Features:**  
    - Users can upload the required imagery depending on the chosen method, such as Sentinel-2 (NDVI), DEM, or Thermal  
    - The available detection methods adapt to the combination of uploaded data  
    - The system provides an interactive visualization of the detected center point on the uploaded imagery

    </div>
    """
}

# --- Session state ---
if "page" not in st.session_state:
    st.session_state.page = "info"
if "lang" not in st.session_state:
    st.session_state.lang = "id"

# --- Language switch ---
st.sidebar.title("Language / Bahasa")
lang_choice = st.sidebar.radio("Choose:", ("Indonesia", "English"))
st.session_state.lang = "id" if lang_choice == "Indonesia" else "en"

# --- Helper functions ---
def go_to_main():
    st.session_state.page = "main"

def back_to_info():
    st.session_state.page = "info"

# --- Info Page ---
if st.session_state.page == "info":
    st.title(labels[st.session_state.lang]["title"])
    st.markdown(info_text[st.session_state.lang], unsafe_allow_html=True)
    st.button(labels[st.session_state.lang]["next"], on_click=go_to_main)

# --- Main Page ---
elif st.session_state.page == "main":
    st.button(labels[st.session_state.lang]["back"], on_click=back_to_info)

    st.title(labels[st.session_state.lang]["title"])

    # Pilih metode
    metode = st.selectbox(
        labels[st.session_state.lang]["select_method"],
        labels[st.session_state.lang]["methods"]
    )

    # File uploaders
    sentinel_file = st.file_uploader(labels[st.session_state.lang]["upload_sentinel"], type=["tif", "tiff"])
    dem_file = None
    thermal_file = None

    if metode in [labels[st.session_state.lang]["methods"][2],
                  labels[st.session_state.lang]["methods"][3],
                  labels[st.session_state.lang]["methods"][4]]:
        dem_file = st.file_uploader(labels[st.session_state.lang]["upload_dem"], type=["tif", "tiff"])

    if metode == labels[st.session_state.lang]["methods"][4]:
        thermal_file = st.file_uploader(labels[st.session_state.lang]["upload_thermal"], type=["tif", "tiff"])

    # Jalankan analisis
    if st.button(labels[st.session_state.lang]["run"]):
        if not sentinel_file:
            st.error(labels[st.session_state.lang]["error_sentinel"])
        elif metode in [labels[st.session_state.lang]["methods"][2],
                        labels[st.session_state.lang]["methods"][3],
                        labels[st.session_state.lang]["methods"][4]] and not dem_file:
            st.error(labels[st.session_state.lang]["error_dem"])
        elif metode == labels[st.session_state.lang]["methods"][4] and not thermal_file:
            st.error(labels[st.session_state.lang]["error_thermal"])
        else:
            # Simpan file sementara
            with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as tmp_sentinel:
                tmp_sentinel.write(sentinel_file.read())
                tmp_sentinel_path = tmp_sentinel.name

            tmp_dem_path, tmp_thermal_path = None, None
            if dem_file:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as tmp_dem:
                    tmp_dem.write(dem_file.read())
                    tmp_dem_path = tmp_dem.name
            if thermal_file:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".tif") as tmp_thermal:
                    tmp_thermal.write(thermal_file.read())
                    tmp_thermal_path = tmp_thermal.name

            # Panggil metode
            if metode == labels[st.session_state.lang]["methods"][0]:
                lat, lon, (cx, cy), true_color = metode_1_center_of_mass(tmp_sentinel_path)
            elif metode == labels[st.session_state.lang]["methods"][1]:
                lat, lon, (cx, cy), true_color = metode_2_largest_blob(tmp_sentinel_path)
            elif metode == labels[st.session_state.lang]["methods"][2]:
                lat, lon, (cx, cy), true_color = metode_4_ndvi_dem(tmp_sentinel_path, tmp_dem_path)
            elif metode == labels[st.session_state.lang]["methods"][3]:
                lat, lon, (cx, cy), true_color = metode_8_dem_ndvi(tmp_sentinel_path, tmp_dem_path)
            elif metode == labels[st.session_state.lang]["methods"][4]:
                lat, lon, (cx, cy), true_color = metode_9_dem_ndvi_thermal(tmp_sentinel_path, tmp_dem_path, tmp_thermal_path)

           # Tampilkan hasil
            st.success(labels[st.session_state.lang]["result"].format(lat=lat, lon=lon))

            fig, ax = plt.subplots()
            ax.imshow(true_color)
            ax.scatter(cx, cy, c="red", s=50, marker="x")
            ax.axis("off") 
            st.pyplot(fig)


            # Hapus file sementara
            os.remove(tmp_sentinel_path)
            if tmp_dem_path: os.remove(tmp_dem_path)
            if tmp_thermal_path: os.remove(tmp_thermal_path)
