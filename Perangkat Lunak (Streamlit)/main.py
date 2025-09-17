import streamlit as st
import os
import tempfile
from utils import metode_1_center_of_mass, metode_2_largest_blob, metode_3_closest_blob
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
    Perangkat lunak ini adalah hasil akhir dari Tugas Akhir dengan topik Analisis Citra Satelit untuk Mendeteksi Pusat Gunung Berapi.
    Perangkat lunak ini dirancang untuk membantu mendeteksi pusat dari sebuah gunung berapi berdasarkan data citra satelit Sentinel-2, yang dianalisis dari 68 gunung berapi aktif di Indonesia dengan karakteristik yang berbeda-beda.
                
    Proses deteksi dalam perangkat lunak ini dilakukan dengan beberapa tahapan, yaitu:
    - Menghitung nilai NDVI (Normalized Difference Vegetation Index) untuk mengidentifikasi area dengan vegetasi rendah
    - Melakukan segmentasi menggunakan algoritma clustering K-Means
    - Menggunakan salah satu dari tiga metode untuk mendeteksi pusat:
        1. Center of Mass: Metode ini menghitung titik tengah geometris dari seluruh piksel yang termasuk dalam cluster dengan nilai NDVI terendah.
        2. Blob Terbesar + Center of Mass: Metode ini mencari komponen terhubung (blob) terbesar dalam cluster dengan NDVI rendah, lalu menghitung pusat massanya.
        3. Blob Terdekat dari Tengah Gambar + Center of Mass: Metode ini mengidentifikasi semua blob dalam cluster NDVI rendah, lalu mencari blob yang paling dekat dengan titik tengah gambar.

    

    **Fitur Utama:**
    - Pengguna dapat mengunggah gambar citra satelit Sentinel-2 yang diperoleh dari Google Earth Engine
    - Pengguna dapat memilih metode deteksi pusat yang diinginkan
    - Sistem dapat menghasilkan visualisasi hasil deteksi pusat dari citra yang diunggah
    """)

    st.image("proses_deteksi.png", caption="Diagram Proses Deteksi Gunung Berapi", use_container_width=True)

    st.button("Next", on_click=go_to_main)

# --- Main Page ---
elif st.session_state.page == 'main':
    st.title("Deteksi Pusat Gunung Berapi dari Citra Sentinel-2")

    uploaded_file = st.file_uploader("Upload File .tif", type=["tif"])

    if uploaded_file is not None:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tif') as tmp:
            tmp.write(uploaded_file.read())
            tmp_path = tmp.name

        metode = st.selectbox("Pilih Metode Deteksi:", [
            "Metode 1 (Center of Mass)", 
            "Metode 2 (Blob Terbesar + Center of Mass)", 
            "Metode 3 (Blob Terdekat dari Tengah Gambar + Center of Mass)"
        ])

        if st.button("Proses"):
            if metode == "Metode 1 (Center of Mass)":
                lat, lon, ndvi, mask, clustering, true_color, (cx, cy) = metode_1_center_of_mass(tmp_path)
            elif metode == "Metode 2 (Blob Terbesar + Center of Mass)":
                lat, lon, ndvi, mask, clustering, true_color, (cx, cy) = metode_2_largest_blob(tmp_path)
            else:
                lat, lon, ndvi, mask, clustering, true_color, (cx, cy) = metode_3_closest_blob(tmp_path)

            st.success(f"Koordinat Deteksi (Latitude, Longitude): ({lat}, {lon})")

            # Visualisasi hanya True Color + Titik Pusat
            fig, ax = plt.subplots(figsize=(8, 8))
            ax.imshow(true_color)
            ax.scatter(cx, cy, c='red', s=60, label='Pusat Gunung')
            ax.set_title('True Color + Titik Pusat')
            ax.axis('off')
            ax.legend()

            st.pyplot(fig)
