import streamlit as st
import os
import tempfile
from utils import (
    metode_1_center_of_mass,
    metode_2_largest_blob,
    metode_3_closest_blob,
    metode_4_ndvi_dem,
    metode_5_ndvi_dem,
    metode_6_ndvi_dem_thermal,
    metode_7_ndvi_dem_thermal,
    metode_8_dem_ndvi,
    metode_9_dem_ndvi_thermal
)
import matplotlib.pyplot as plt

# Inisialisasi session state untuk navigasi halaman
if 'page' not in st.session_state:
    st.session_state.page = 'info'

def go_to_main():
    st.session_state.page = 'main'

# --- Info Page ---
if st.session_state.page == 'info':
    st.title("Deteksi Pusat Gunung dari Citra Sentinel-2")

    st.markdown("""
    ### Selamat Datang!
    Perangkat lunak ini dirancang untuk membantu mendeteksi pusat dari sebuah gunung berapi menggunakan berbagai jenis data citra satelit dan topografi, termasuk Sentinel-2 (NDVI), Digital Elevation Model (DEM), dan data Thermal (Brightness Temperature). Data ini dianalisis dari 68 gunung berapi aktif di Indonesia dengan karakteristik berbeda-beda.

    Semua metode deteksi pusat menggunakan konsep **center of mass**, yaitu perhitungan titik rata-rata posisi kumpulan piksel yang termasuk dalam area yang dianalisis. Area ini bisa berupa cluster NDVI rendah, blob tertentu, atau hasil irisan cluster dengan data DEM atau Thermal, tergantung metode yang dipilih.

    Berikut penjelasan metode yang tersedia:

    1. **Cluster NDVI Rendah**  
    Input: NDVI dari Sentinel-2  
    Proses: K-Means (k=2) pada NDVI → pilih cluster NDVI rendah  
    Output: Center of mass dari semua piksel cluster NDVI rendah

    2. **Blob Terbesar pada Cluster NDVI Rendah**  
    Sama dengan metode sebelumnya, tapi titik pusat = center of mass blob terbesar dari cluster NDVI rendah

    3. **Blob Terdekat dengan Tengah Gambar pada Cluster NDVI Rendah**  
    Sama dengan metode pertama, tapi titik pusat = center of mass blob yang paling dekat dengan tengah gambar

    4. **Cluster NDVI rendah + DEM (2D clustering)**  
    Input: NDVI + DEM  
    Proses: K-Means (k=2) dengan fitur NDVI + DEM → pilih cluster NDVI rendah  
    Output: Titik pusat berdasarkan center of mass hasil masking NDVI rendah

    5. **Clustering Bertahap (NDVI Rendah → DEM Tinggi)**  
    Input: NDVI + DEM  
    Proses:  
    Step 1 (NDVI): K-Means (k=2) pada NDVI → pilih cluster NDVI rendah → hasilkan mask NDVI rendah  
    Step 2 (DEM): Di dalam area mask NDVI rendah, lakukan K-Means (k=2) pada DEM → pilih cluster DEM tinggi  
    Output: Titik pusat berdasarkan center of mass hasil step 2

    6. **Clustering DEM Tinggi pada Irisan NDVI Rendah + Thermal Tinggi**  
    Input: NDVI + DEM + Thermal  
    Proses:  
    Step 1 (NDVI): K-Means (k=2) pada NDVI → ambil mask NDVI rendah  
    Step 2 (Thermal): K-Means (k=2) pada thermal → ambil mask thermal tinggi  
    Step 3 (DEM): Dari irisan NDVI rendah dan thermal tinggi → cluster DEM → pilih cluster DEM tinggi  
    Output: Titik pusat berdasarkan center of mass hasil step 3

    7. **Clustering Bertahap (NDVI Rendah → DEM Tinggi → Thermal Tinggi)**  
    Input: NDVI + DEM + Thermal  
    Proses:  
    Step 1 (NDVI): K-Means (k=2) pada NDVI → pilih cluster NDVI rendah  
    Step 2 (DEM): K-Means (k=2) pada DEM di area NDVI rendah → pilih cluster DEM tinggi  
    Step 3 (Thermal): K-Means (k=2) pada thermal di area DEM tinggi → pilih cluster suhu tinggi  
    Output: Titik pusat berdasarkan center of mass hasil step 3

    8. **Clustering Bertahap (DEM Tinggi → NDVI Rendah)**  
    Input: NDVI + DEM  
    Proses:  
    Step 1 (DEM): K-Means (k=2) pada DEM → pilih cluster DEM tinggi  
    Step 2 (NDVI): K-Means (k=2) pada NDVI di area DEM tinggi → pilih cluster NDVI rendah  
    Output: Titik pusat berdasarkan center of mass hasil step 2

    9. **Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)**  
    Input: NDVI + DEM + Thermal  
    Proses:  
    Step 1 (DEM): K-Means (k=2) pada DEM → pilih cluster DEM tinggi  
    Step 2 (NDVI): K-Means (k=2) pada NDVI di area DEM tinggi → pilih cluster NDVI rendah  
    Step 3 (Thermal): K-Means (k=2) pada thermal di area NDVI rendah → pilih cluster suhu tinggi  
    Output: Titik pusat berdasarkan center of mass hasil step 3

    **Fitur Utama:**  
    - Pengguna dapat mengunggah data citra yang diperlukan sesuai metode, baik itu Sentinel-2 (NDVI), DEM, maupun Thermal  
    - Pilihan metode deteksi pusat menyesuaikan kombinasi data yang diunggah  
    - Sistem menampilkan visualisasi interaktif hasil deteksi pusat pada citra yang diunggah
    """)

    st.button("Next", on_click=go_to_main)


# --- Main Page ---
elif st.session_state.page == 'main':
    def back_to_info():
        st.session_state.page = 'info'

    st.button("Kembali ke Info Page", on_click=back_to_info)

    st.title("Deteksi Pusat Gunung Berapi dari Citra Satelit")

    # Pilih metode
    metode = st.selectbox("Pilih Metode Deteksi:", [
        "Cluster NDVI Rendah",
        "Blob Terbesar pada Cluster NDVI Rendah",
        "Blob Terdekat dengan Tengah Gambar pada Cluster NDVI Rendah",
        "Cluster NDVI rendah + DEM (2D clustering)",
        "Clustering Bertahap (NDVI Rendah → DEM Tinggi)",
        "Clustering DEM Tinggi pada Irisan NDVI Rendah + Thermal Tinggi",
        "Clustering Bertahap (NDVI Rendah → DEM Tinggi → Thermal Tinggi)",
        "Clustering Bertahap (DEM Tinggi → NDVI Rendah)",
        "Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)"
    ])

    # Tentukan file uploader sesuai kebutuhan metode
    st.markdown("Unggah data yang diperlukan sesuai metode yang dipilih:")
    uploaded_sentinel = st.file_uploader("Upload File Sentinel-2 (.tif)", type=["tif"])
    uploaded_dem = None
    uploaded_thermal = None

    if metode in [
        "Cluster NDVI rendah + DEM (2D clustering)",
        "Clustering Bertahap (NDVI Rendah → DEM Tinggi)",
        "Clustering DEM Tinggi → NDVI Rendah"
    ]:
        uploaded_dem = st.file_uploader("Upload File DEM (.tif)", type=["tif"])

    if metode in [
        "Clustering DEM Tinggi pada Irisan NDVI Rendah + Thermal Tinggi",
        "Clustering Bertahap (NDVI Rendah → DEM Tinggi → Thermal Tinggi)",
        "Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)"
    ]:
        uploaded_dem = st.file_uploader("Upload File DEM (.tif)", type=["tif"])
        uploaded_thermal = st.file_uploader("Upload File Thermal (.tif)", type=["tif"])

    if st.button("Proses"):
        if uploaded_sentinel is None or (metode in ["Cluster NDVI rendah + DEM (2D clustering)", 
                                                    "Clustering Bertahap (NDVI Rendah → DEM Tinggi)",
                                                    "Clustering DEM Tinggi → NDVI Rendah",
                                                    "Clustering DEM Tinggi pada Irisan NDVI Rendah + Thermal Tinggi",
                                                    "Clustering Bertahap (NDVI Rendah → DEM Tinggi → Thermal Tinggi)",
                                                    "Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)"] and uploaded_dem is None) \
           or (metode in ["Clustering DEM Tinggi pada Irisan NDVI Rendah + Thermal Tinggi",
                          "Clustering Bertahap (NDVI Rendah → DEM Tinggi → Thermal Tinggi)",
                          "Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)"] and uploaded_thermal is None):
            st.warning("Harap unggah semua file yang diperlukan untuk metode ini")
        else:
            # Simpan sementara file yang diunggah
            tmp_sentinel = tempfile.NamedTemporaryFile(delete=False, suffix='.tif')
            tmp_sentinel.write(uploaded_sentinel.read())
            tmp_sentinel_path = tmp_sentinel.name

            tmp_dem_path = None
            tmp_thermal_path = None
            if uploaded_dem:
                tmp_dem = tempfile.NamedTemporaryFile(delete=False, suffix='.tif')
                tmp_dem.write(uploaded_dem.read())
                tmp_dem_path = tmp_dem.name
            if uploaded_thermal:
                tmp_thermal = tempfile.NamedTemporaryFile(delete=False, suffix='.tif')
                tmp_thermal.write(uploaded_thermal.read())
                tmp_thermal_path = tmp_thermal.name

            # Panggil fungsi sesuai metode
            if metode == "Cluster NDVI Rendah":
                lat, lon, true_color, (cx, cy) = metode_1_center_of_mass(tmp_sentinel_path)
            elif metode == "Blob Terbesar pada Cluster NDVI Rendah":
                lat, lon, true_color, (cx, cy) = metode_2_largest_blob(tmp_sentinel_path)
            elif metode == "Blob Terdekat dengan Tengah Gambar pada Cluster NDVI Rendah":
                lat, lon, true_color, (cx, cy) = metode_3_closest_blob(tmp_sentinel_path)
            elif metode == "Cluster NDVI rendah + DEM (2D clustering)":
                lat, lon, true_color, (cx, cy) = metode_4_ndvi_dem(tmp_sentinel_path, tmp_dem_path)
            elif metode == "Clustering Bertahap (NDVI Rendah → DEM Tinggi)":
                lat, lon, true_color, (cx, cy) = metode_5_ndvi_dem(tmp_sentinel_path, tmp_dem_path)
            elif metode == "Clustering DEM Tinggi pada Irisan NDVI Rendah + Thermal Tinggi":
                lat, lon, true_color, (cx, cy) = metode_6_ndvi_dem_thermal(tmp_sentinel_path, tmp_dem_path, tmp_thermal_path)
            elif metode == "Clustering Bertahap (NDVI Rendah → DEM Tinggi → Thermal Tinggi)":
                lat, lon, true_color, (cx, cy) = metode_7_ndvi_dem_thermal(tmp_sentinel_path, tmp_dem_path, tmp_thermal_path)
            elif metode == "Clustering Bertahap (DEM Tinggi → NDVI Rendah)":
                lat, lon, true_color, (cx, cy) = metode_8_dem_ndvi(tmp_sentinel_path, tmp_dem_path)
            elif metode == "Clustering Bertahap (DEM Tinggi → NDVI Rendah → Thermal Tinggi)":
                lat, lon, true_color, (cx, cy) = metode_9_dem_ndvi_thermal(tmp_sentinel_path, tmp_dem_path, tmp_thermal_path)

            st.success(f"Koordinat Deteksi (Latitude, Longitude): ({lat}, {lon})")

            # Visualisasi True Color + Titik Pusat
            fig, ax = plt.subplots(figsize=(8, 8))
            ax.imshow(true_color)
            ax.scatter(cx, cy, c='red', s=60, label='Pusat Gunung')
            ax.set_title('True Color + Titik Pusat')
            ax.axis('off')
            ax.legend()
            st.pyplot(fig)
