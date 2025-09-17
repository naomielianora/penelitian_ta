@echo off
REM Cek apakah Python terpasang
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python tidak ditemukan. Pastikan Python sudah terinstal dan ditambahkan ke PATH.
    pause
    exit /b
)

REM Cek apakah Streamlit terpasang
streamlit --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Streamlit tidak ditemukan. Menginstal Streamlit...
    pip install streamlit
)

REM Jalankan aplikasi
echo Menjalankan aplikasi Streamlit...
python -m streamlit run main.py
pause
