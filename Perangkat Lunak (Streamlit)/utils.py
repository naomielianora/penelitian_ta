import rasterio
import numpy as np
from sklearn.cluster import KMeans
from scipy.ndimage import center_of_mass
from skimage.measure import label, regionprops
import matplotlib.pyplot as plt
from matplotlib.patches import Patch

def create_true_color_image(image_path):
    with rasterio.open(image_path) as src:
        band4 = src.read(4).astype('float32')
        band3 = src.read(3).astype('float32')
        band2 = src.read(2).astype('float32')
        true_color = np.dstack((band4, band3, band2))
        true_color = np.nan_to_num(true_color, nan=0)
        if true_color.max() > 0:
            true_color = true_color / true_color.max()
        return true_color

def calculate_ndvi(B4, B8):
    with np.errstate(divide='ignore', invalid='ignore'):
        ndvi = (B8 - B4) / (B8 + B4)
        ndvi[(B8 + B4) == 0] = np.nan
    ndvi = np.clip(ndvi, -1, 1)
    return ndvi

def metode_1_center_of_mass(image_path):
    with rasterio.open(image_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform
    
    ndvi = calculate_ndvi(B4, B8)
    flat_ndvi = ndvi.reshape(-1, 1)
    mask_valid = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi = flat_ndvi[mask_valid]

    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    labels = np.zeros_like(flat_ndvi[:, 0], dtype=np.uint8)
    labels[mask_valid] = kmeans.fit_predict(valid_ndvi)

    cluster_means = [valid_ndvi[labels[mask_valid] == i].mean() for i in range(2)]
    low_ndvi_cluster = np.argmin(cluster_means)
    ndvi_mask = labels.reshape(ndvi.shape) == low_ndvi_cluster

    cy, cx = center_of_mass(ndvi_mask)
    cy, cx = int(cy), int(cx)

    lon, lat = rasterio.transform.xy(transform, cy, cx)
    true_color = create_true_color_image(image_path)

    return lat, lon, true_color, (cx, cy)

def metode_2_largest_blob(image_path):
    with rasterio.open(image_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform

    ndvi = calculate_ndvi(B4, B8)
    flat_ndvi = ndvi.reshape(-1, 1)
    mask_valid = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi = flat_ndvi[mask_valid]

    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    labels = np.zeros_like(flat_ndvi[:, 0], dtype=np.uint8)
    labels[mask_valid] = kmeans.fit_predict(valid_ndvi)

    cluster_means = [valid_ndvi[labels[mask_valid] == i].mean() for i in range(2)]
    low_ndvi_cluster = np.argmin(cluster_means)
    ndvi_mask = labels.reshape(ndvi.shape) == low_ndvi_cluster

    labeled_mask = label(ndvi_mask)
    regions = regionprops(labeled_mask)
    largest_region = max(regions, key=lambda r: r.area)
    largest_blob_mask = labeled_mask == largest_region.label

    cy, cx = center_of_mass(largest_blob_mask)
    cy, cx = int(cy), int(cx)

    lon, lat = rasterio.transform.xy(transform, cy, cx)

    return lat, lon, ndvi, create_true_color_image(image_path), (cx, cy)

def metode_3_closest_blob(image_path):
    with rasterio.open(image_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform

    ndvi = calculate_ndvi(B4, B8)
    flat_ndvi = ndvi.reshape(-1, 1)
    mask_valid = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi = flat_ndvi[mask_valid]

    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    labels = np.zeros_like(flat_ndvi[:, 0], dtype=np.uint8)
    labels[mask_valid] = kmeans.fit_predict(valid_ndvi)

    cluster_means = [valid_ndvi[labels[mask_valid] == i].mean() for i in range(2)]
    low_ndvi_cluster = np.argmin(cluster_means)
    ndvi_mask = labels.reshape(ndvi.shape) == low_ndvi_cluster

    labeled_mask = label(ndvi_mask)
    regions = regionprops(labeled_mask)
    center_image = np.array(ndvi.shape) / 2

    closest_region = min(regions, key=lambda r: np.linalg.norm(np.array(r.centroid) - center_image))
    closest_blob_mask = labeled_mask == closest_region.label

    cy, cx = center_of_mass(closest_blob_mask)
    cy, cx = int(cy), int(cx)

    lon, lat = rasterio.transform.xy(transform, cy, cx)

    return lat, lon, create_true_color_image(image_path), (cx, cy)



def metode_4_ndvi_dem(sentinel_path, dem_path):
    """Deteksi pusat gunung menggunakan NDVI + DEM (2D clustering)"""
    # Baca Sentinel-2
    with rasterio.open(sentinel_path) as src:
        B4 = src.read(4).astype('float32')  # Red
        B8 = src.read(8).astype('float32')  # NIR
        transform = src.transform
        crs = src.crs

    # Hitung NDVI
    with np.errstate(divide='ignore', invalid='ignore'):
        ndvi = (B8 - B4) / (B8 + B4)
        ndvi[(B8 + B4) == 0] = np.nan
    ndvi = np.clip(ndvi, -1, 1)

    # Baca DEM & resample jika ukuran beda
    with rasterio.open(dem_path) as dem_src:
        dem_data = dem_src.read(1).astype('float32')
        if dem_data.shape != ndvi.shape:
            from rasterio.warp import reproject, Resampling
            dem_resampled = np.empty_like(ndvi)
            reproject(
                source=dem_data,
                destination=dem_resampled,
                src_transform=dem_src.transform,
                src_crs=dem_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            dem_resampled = dem_data

    # Flatten untuk clustering
    flat_ndvi = ndvi.reshape(-1)
    flat_dem = dem_resampled.reshape(-1)
    mask_valid = ~np.isnan(flat_ndvi) & ~np.isnan(flat_dem)
    features = np.stack([flat_ndvi[mask_valid], flat_dem[mask_valid]], axis=1)

    # K-Means clustering
    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    labels = np.zeros_like(flat_ndvi, dtype=np.uint8)
    labels[mask_valid] = kmeans.fit_predict(features)

    # Pilih cluster dengan NDVI terendah
    cluster_means = [features[labels[mask_valid] == i][:, 0].mean() for i in range(2)]
    low_ndvi_cluster = np.argmin(cluster_means)
    ndvi_mask = labels.reshape(ndvi.shape) == low_ndvi_cluster

    # Titik pusat (center of mass)
    cy, cx = center_of_mass(ndvi_mask)
    cy, cx = int(cy), int(cx)
    lon, lat = rasterio.transform.xy(transform, cy, cx)

    # Visualisasi True Color
    true_color = create_true_color_image(sentinel_path)

    return lat, lon, true_color, (cx, cy)



def metode_5_ndvi_dem(sentinel_path, dem_path):
    """Deteksi pusat gunung menggunakan Clustering Bertahap (NDVI Rendah → DEM Tinggi)"""
    # ---------- Baca Sentinel (NDVI) ----------
    with rasterio.open(sentinel_path) as src:
        B4 = src.read(4).astype('float32')  # Red
        B8 = src.read(8).astype('float32')  # NIR
        transform = src.transform
        crs = src.crs

    ndvi = calculate_ndvi(B4, B8)

    # ---------- Baca DEM & samakan grid ----------
    with rasterio.open(dem_path) as dem_src:
        dem_data = dem_src.read(1).astype('float32')

        if dem_data.shape != ndvi.shape or dem_src.transform != transform or dem_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            dem_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=dem_data,
                destination=dem_resampled,
                src_transform=dem_src.transform,
                src_crs=dem_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            dem_resampled = dem_data

    # ==========================
    # 1) K-MEANS NDVI (2 cluster)
    # ==========================
    flat_ndvi = ndvi.reshape(-1, 1)
    valid_ndvi_mask = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi_vals = flat_ndvi[valid_ndvi_mask]

    if valid_ndvi_vals.size == 0:
        raise ValueError("Semua NDVI NaN")

    kmeans_ndvi = KMeans(n_clusters=2, random_state=42, n_init=10)
    ndvi_labels_flat = np.full_like(flat_ndvi[:, 0], np.nan, dtype=float)
    ndvi_labels_flat[valid_ndvi_mask] = kmeans_ndvi.fit_predict(valid_ndvi_vals)

    # pilih cluster NDVI terendah
    ndvi_means = [valid_ndvi_vals[ndvi_labels_flat[valid_ndvi_mask] == i].mean() if np.any(ndvi_labels_flat[valid_ndvi_mask] == i) else np.inf for i in range(2)]
    low_ndvi_cluster = int(np.argmin(ndvi_means))
    ndvi_low_mask = (ndvi_labels_flat.reshape(ndvi.shape) == low_ndvi_cluster)

    # ==========================
    # 2) K-MEANS DEM dalam area NDVI rendah
    # ==========================
    dem_on_low_ndvi = np.where(ndvi_low_mask, dem_resampled, np.nan)
    flat_dem = dem_on_low_ndvi.reshape(-1, 1)
    valid_dem_mask = ~np.isnan(flat_dem[:, 0])
    valid_dem_vals = flat_dem[valid_dem_mask]

    if valid_dem_vals.size == 0:
        raise ValueError("Tidak ada piksel valid untuk DEM di area NDVI rendah")

    kmeans_dem = KMeans(n_clusters=2, random_state=42, n_init=10)
    dem_labels_flat = np.full_like(flat_dem[:, 0], np.nan, dtype=float)
    dem_labels_flat[valid_dem_mask] = kmeans_dem.fit_predict(valid_dem_vals)

    # pilih cluster DEM tertinggi
    dem_means = [valid_dem_vals[dem_labels_flat[valid_dem_mask] == i].mean() if np.any(dem_labels_flat[valid_dem_mask] == i) else -np.inf for i in range(2)]
    high_dem_cluster = int(np.argmax(dem_means))
    dem_high_mask = (dem_labels_flat.reshape(ndvi.shape) == high_dem_cluster)

    if not np.any(dem_high_mask):
        raise ValueError("Mask DEM tinggi kosong")

    # ==========================
    # 3) Center of mass
    # ==========================
    cy, cx = center_of_mass(dem_high_mask.astype(np.uint8))
    if np.isnan(cy) or np.isnan(cx):
        raise ValueError("Center of mass tidak valid")
    cy_i, cx_i = int(round(cy)), int(round(cx))
    lon, lat = rasterio.transform.xy(transform, cy_i, cx_i)

    true_color = create_true_color_image(sentinel_path)

    return lat, lon, true_color, (cx, cy)


def metode_6_ndvi_dem_thermal(sentinel_path, dem_path, thermal_path):
    """Deteksi pusat gunung menggunakan Clustering Bertahap NDVI Rendah → Thermal Tinggi → DEM Tinggi"""
    # ---------- Baca Sentinel (NDVI) ----------
    with rasterio.open(sentinel_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform
        crs = src.crs

    ndvi = calculate_ndvi(B4, B8)

    # ---------- Baca DEM ----------
    with rasterio.open(dem_path) as dem_src:
        dem_data = dem_src.read(1).astype('float32')
        if dem_data.shape != ndvi.shape or dem_src.transform != transform or dem_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            dem_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=dem_data,
                destination=dem_resampled,
                src_transform=dem_src.transform,
                src_crs=dem_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            dem_resampled = dem_data

    # ---------- Baca Thermal ----------
    with rasterio.open(thermal_path) as th_src:
        thermal_data = th_src.read(1).astype('float32')
        if thermal_data.shape != ndvi.shape or th_src.transform != transform or th_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            thermal_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=thermal_data,
                destination=thermal_resampled,
                src_transform=th_src.transform,
                src_crs=th_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            thermal_resampled = thermal_data

    # ==========================
    # 1) K-MEANS NDVI
    # ==========================
    flat_ndvi = ndvi.reshape(-1, 1)
    valid_ndvi_mask = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi_vals = flat_ndvi[valid_ndvi_mask]

    if valid_ndvi_vals.size == 0:
        raise ValueError("Semua NDVI NaN")

    kmeans_ndvi = KMeans(n_clusters=2, random_state=42, n_init=10)
    ndvi_labels_flat = np.zeros_like(flat_ndvi[:, 0], dtype=np.uint8)
    ndvi_labels_flat[valid_ndvi_mask] = kmeans_ndvi.fit_predict(valid_ndvi_vals)

    ndvi_means = [valid_ndvi_vals[ndvi_labels_flat[valid_ndvi_mask] == i].mean() if np.any(ndvi_labels_flat[valid_ndvi_mask] == i) else np.inf for i in range(2)]
    low_ndvi_cluster = int(np.argmin(ndvi_means))
    ndvi_low_mask = (ndvi_labels_flat.reshape(ndvi.shape) == low_ndvi_cluster)

    # ==========================
    # 2) K-MEANS Thermal
    # ==========================
    flat_th = thermal_resampled.reshape(-1, 1)
    valid_th_mask = ~np.isnan(flat_th[:, 0])
    valid_th_vals = flat_th[valid_th_mask]

    if valid_th_vals.size == 0:
        raise ValueError("Semua Thermal NaN")

    kmeans_th = KMeans(n_clusters=2, random_state=42, n_init=10)
    th_labels_flat = np.zeros_like(flat_th[:, 0], dtype=np.uint8)
    th_labels_flat[valid_th_mask] = kmeans_th.fit_predict(valid_th_vals)

    th_means = [valid_th_vals[th_labels_flat[valid_th_mask] == i].mean() if np.any(th_labels_flat[valid_th_mask] == i) else -np.inf for i in range(2)]
    high_th_cluster = int(np.argmax(th_means))
    th_high_mask = (th_labels_flat.reshape(ndvi.shape) == high_th_cluster)

    # ==========================
    # 3) K-MEANS DEM pada area NDVI rendah & Thermal tinggi
    # ==========================
    combined_mask = ndvi_low_mask & th_high_mask
    dem_on_combined = np.where(combined_mask, dem_resampled, np.nan)

    flat_dem = dem_on_combined.reshape(-1, 1)
    valid_dem_mask = ~np.isnan(flat_dem[:, 0])
    valid_dem_vals = flat_dem[valid_dem_mask]

    if valid_dem_vals.size == 0:
        raise ValueError("Tidak ada piksel valid untuk DEM di area NDVI rendah & Thermal tinggi")

    kmeans_dem = KMeans(n_clusters=2, random_state=42, n_init=10)
    dem_labels_flat = np.zeros_like(flat_dem[:, 0], dtype=np.uint8)
    dem_labels_flat[valid_dem_mask] = kmeans_dem.fit_predict(valid_dem_vals)

    dem_means = [valid_dem_vals[dem_labels_flat[valid_dem_mask] == i].mean() if np.any(dem_labels_flat[valid_dem_mask] == i) else -np.inf for i in range(2)]
    high_dem_cluster = int(np.argmax(dem_means))
    dem_high_mask = (dem_labels_flat.reshape(ndvi.shape) == high_dem_cluster)
    final_mask = combined_mask & dem_high_mask

    if not np.any(final_mask):
        raise ValueError("Final mask kosong")

    # ==========================
    # 4) Center of Mass
    # ==========================
    cy, cx = center_of_mass(final_mask.astype(np.uint8))
    if np.isnan(cy) or np.isnan(cx):
        raise ValueError("Center of mass tidak valid")
    cy_i, cx_i = int(round(cy)), int(round(cx))
    lon, lat = rasterio.transform.xy(transform, cy_i, cx_i)

    true_color = create_true_color_image(sentinel_path)

    return lat, lon, true_color, (cx, cy)

def metode_7_ndvi_dem_thermal(sentinel_path, dem_path, thermal_path):
    """
    Deteksi pusat gunung menggunakan Clustering Bertahap:
    NDVI Rendah -> DEM Tinggi -> Thermal Tinggi
    Return: lat, lon, ndvi, ndvi_low_mask, dem_resampled, dem_high_mask,
            thermal_resampled, th_high_mask, true_color, (cx, cy)
    """
    import rasterio
    import numpy as np
    from sklearn.cluster import KMeans
    from scipy.ndimage import center_of_mass

    # ---------- Baca Sentinel (NDVI) ----------
    with rasterio.open(sentinel_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform
        crs = src.crs

    ndvi = (B8 - B4) / (B8 + B4)
    ndvi[(B8 + B4) == 0] = np.nan
    ndvi = np.clip(ndvi, -1, 1)

    # ---------- Baca DEM ----------
    with rasterio.open(dem_path) as dem_src:
        dem_data = dem_src.read(1).astype('float32')
        if dem_data.shape != ndvi.shape or dem_src.transform != transform or dem_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            dem_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=dem_data,
                destination=dem_resampled,
                src_transform=dem_src.transform,
                src_crs=dem_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            dem_resampled = dem_data

    # ---------- Baca Thermal ----------
    with rasterio.open(thermal_path) as th_src:
        thermal_resampled = th_src.read(1).astype('float32')
        if thermal_resampled.shape != ndvi.shape or th_src.transform != transform or th_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            temp = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=thermal_resampled,
                destination=temp,
                src_transform=th_src.transform,
                src_crs=th_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
            thermal_resampled = temp

    # ==========================
    # Step 1: K-MEANS NDVI
    # ==========================
    flat_ndvi = ndvi.reshape(-1, 1)
    mask_ndvi = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi = flat_ndvi[mask_ndvi]
    ndvi_labels = np.zeros_like(flat_ndvi[:, 0], dtype=int)
    if valid_ndvi.size > 0:
        from sklearn.exceptions import ConvergenceWarning
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", ConvergenceWarning)
            if np.unique(valid_ndvi).size < 2:
                ndvi_labels[mask_ndvi] = 0
            else:
                ndvi_labels[mask_ndvi] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_ndvi)
    ndvi_labels_img = ndvi_labels.reshape(ndvi.shape)
    low_ndvi_cluster = np.nanargmin([valid_ndvi[ndvi_labels[mask_ndvi] == i].mean() if np.any(ndvi_labels[mask_ndvi] == i) else np.inf for i in range(2)])
    ndvi_low_mask = (ndvi_labels_img == low_ndvi_cluster)

    # ==========================
    # Step 2: K-MEANS DEM (hanya di NDVI rendah)
    # ==========================
    dem_masked = np.where(ndvi_low_mask, dem_resampled, np.nan)
    flat_dem = dem_masked.reshape(-1, 1)
    mask_dem = ~np.isnan(flat_dem[:, 0])
    valid_dem = flat_dem[mask_dem]
    dem_labels = np.zeros_like(flat_dem[:, 0], dtype=int)
    if valid_dem.size > 0:
        if np.unique(valid_dem).size < 2:
            dem_labels[mask_dem] = 0
        else:
            dem_labels[mask_dem] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_dem)
    dem_labels_img = dem_labels.reshape(ndvi.shape)
    high_dem_cluster = np.nanargmax([valid_dem[dem_labels[mask_dem] == i].mean() if np.any(dem_labels[mask_dem] == i) else -np.inf for i in range(2)])
    dem_high_mask = (dem_labels_img == high_dem_cluster)

    # ==========================
    # Step 3: K-MEANS Thermal (hanya di DEM tinggi & NDVI rendah)
    # ==========================
    combined_mask = ndvi_low_mask & dem_high_mask
    th_masked = np.where(combined_mask, thermal_resampled, np.nan)
    flat_th = th_masked.reshape(-1, 1)
    mask_th = ~np.isnan(flat_th[:, 0])
    valid_th = flat_th[mask_th]
    th_labels = np.zeros_like(flat_th[:, 0], dtype=int)
    if valid_th.size > 0:
        if np.unique(valid_th).size < 2:
            th_labels[mask_th] = 0
        else:
            th_labels[mask_th] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_th)
    th_labels_img = th_labels.reshape(ndvi.shape)
    high_th_cluster = np.nanargmax([valid_th[th_labels[mask_th] == i].mean() if np.any(th_labels[mask_th] == i) else -np.inf for i in range(2)])
    th_high_mask = (th_labels_img == high_th_cluster)

    # ==========================
    # Center of Mass
    # ==========================
    final_mask = th_high_mask
    cy, cx = center_of_mass(final_mask.astype(np.uint8))
    cy_i, cx_i = int(round(cy)), int(round(cx))
    lon, lat = rasterio.transform.xy(transform, cy_i, cx_i)

    true_color = create_true_color_image(sentinel_path)

    return lat, lon, true_color, (cx, cy)


def metode_8_dem_ndvi(sentinel_path, dem_path):
    """
    Deteksi pusat gunung menggunakan Clustering Bertahap:
    DEM Tinggi -> NDVI Rendah
    Return: lat, lon, ndvi, dem_resampled, dem_high_mask, ndvi_labels_img,
            final_mask, true_color, (cx, cy)
    """
    import rasterio
    import numpy as np
    from sklearn.cluster import KMeans
    from scipy.ndimage import center_of_mass

    # ---------- Baca Sentinel (NDVI) ----------
    with rasterio.open(sentinel_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform
        crs = src.crs

    ndvi = (B8 - B4) / (B8 + B4)
    ndvi[(B8 + B4) == 0] = np.nan
    ndvi = np.clip(ndvi, -1, 1)

    # ---------- Baca DEM & samakan grid ----------
    with rasterio.open(dem_path) as dem_src:
        dem_data = dem_src.read(1).astype('float32')
        if dem_data.shape != ndvi.shape or dem_src.transform != transform or dem_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            dem_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=dem_data,
                destination=dem_resampled,
                src_transform=dem_src.transform,
                src_crs=dem_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            dem_resampled = dem_data

    # ==========================
    # Step 1: K-MEANS DEM
    # ==========================
    flat_dem = dem_resampled.reshape(-1, 1)
    mask_dem = ~np.isnan(flat_dem[:, 0])
    valid_dem = flat_dem[mask_dem]

    dem_labels = np.zeros_like(flat_dem[:, 0], dtype=int)
    if valid_dem.size > 0:
        if np.unique(valid_dem).size < 2:
            dem_labels[mask_dem] = 0
        else:
            dem_labels[mask_dem] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_dem)
    dem_labels_img = dem_labels.reshape(ndvi.shape)
    high_dem_cluster = np.nanargmax([valid_dem[dem_labels[mask_dem] == i].mean() if np.any(dem_labels[mask_dem] == i) else -np.inf for i in range(2)])
    dem_high_mask = (dem_labels_img == high_dem_cluster)

    # ==========================
    # Step 2: K-MEANS NDVI dalam area DEM tinggi
    # ==========================
    ndvi_masked = np.where(dem_high_mask, ndvi, np.nan)
    flat_ndvi = ndvi_masked.reshape(-1, 1)
    mask_ndvi = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi = flat_ndvi[mask_ndvi]

    ndvi_labels = np.zeros_like(flat_ndvi[:, 0], dtype=int)
    if valid_ndvi.size > 0:
        if np.unique(valid_ndvi).size < 2:
            ndvi_labels[mask_ndvi] = 0
        else:
            ndvi_labels[mask_ndvi] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_ndvi)
    ndvi_labels_img = np.full(ndvi.shape, np.nan, dtype=float)
    ndvi_labels_img_flat = ndvi_labels_img.reshape(-1)
    ndvi_labels_img_flat[mask_ndvi] = ndvi_labels[mask_ndvi]
    ndvi_labels_img = ndvi_labels_img_flat.reshape(ndvi.shape)

    low_ndvi_cluster = np.nanargmin([valid_ndvi[ndvi_labels[mask_ndvi] == i].mean() if np.any(ndvi_labels[mask_ndvi] == i) else np.inf for i in range(2)])
    final_mask = (ndvi_labels_img == low_ndvi_cluster)

    # ==========================
    # Step 3: Center of Mass
    # ==========================
    cy, cx = center_of_mass(final_mask.astype(np.uint8))
    cy_i, cx_i = int(round(cy)), int(round(cx))
    lon, lat = rasterio.transform.xy(transform, cy_i, cx_i)

    # True color
    true_color = create_true_color_image(sentinel_path)

    return lat, lon, true_color, (cx, cy)

def metode_9_dem_ndvi_thermal(sentinel_path, dem_path, thermal_path):
    """
    Deteksi pusat gunung menggunakan Clustering Bertahap:
    DEM Tinggi -> NDVI Rendah -> Thermal Tinggi
    Return: lat, lon, ndvi, dem_resampled, dem_high_mask, ndvi_labels_img,
            ndvi_low_mask, th_labels_img, th_high_mask, true_color, (cx, cy)
    """
    import rasterio
    import numpy as np
    from sklearn.cluster import KMeans
    from scipy.ndimage import center_of_mass

    # ---------- Baca Sentinel (NDVI) ----------
    with rasterio.open(sentinel_path) as src:
        B4 = src.read(4).astype('float32')
        B8 = src.read(8).astype('float32')
        transform = src.transform
        crs = src.crs

    ndvi = (B8 - B4) / (B8 + B4)
    ndvi[(B8 + B4) == 0] = np.nan
    ndvi = np.clip(ndvi, -1, 1)

    # ---------- Baca DEM & resample ----------
    with rasterio.open(dem_path) as dem_src:
        dem_data = dem_src.read(1).astype('float32')
        if dem_data.shape != ndvi.shape or dem_src.transform != transform or dem_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            dem_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=dem_data,
                destination=dem_resampled,
                src_transform=dem_src.transform,
                src_crs=dem_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            dem_resampled = dem_data

    # ---------- Baca Thermal & resample ----------
    with rasterio.open(thermal_path) as th_src:
        th_data = th_src.read(1).astype('float32')
        if th_data.shape != ndvi.shape or th_src.transform != transform or th_src.crs != crs:
            from rasterio.warp import reproject, Resampling
            th_resampled = np.full_like(ndvi, np.nan, dtype='float32')
            reproject(
                source=th_data,
                destination=th_resampled,
                src_transform=th_src.transform,
                src_crs=th_src.crs,
                dst_transform=transform,
                dst_crs=crs,
                resampling=Resampling.bilinear
            )
        else:
            th_resampled = th_data

    # ---------- Step 1: K-MEANS DEM ----------
    flat_dem = dem_resampled.reshape(-1, 1)
    mask_dem = ~np.isnan(flat_dem[:, 0])
    valid_dem = flat_dem[mask_dem]
    dem_labels = np.zeros_like(flat_dem[:, 0], dtype=int)
    if valid_dem.size > 0:
        if np.unique(valid_dem).size < 2:
            dem_labels[mask_dem] = 0
        else:
            dem_labels[mask_dem] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_dem)
    dem_labels_img = dem_labels.reshape(ndvi.shape)
    high_dem_cluster = np.nanargmax([valid_dem[dem_labels[mask_dem] == i].mean() if np.any(dem_labels[mask_dem] == i) else -np.inf for i in range(2)])
    dem_high_mask = (dem_labels_img == high_dem_cluster)

    # ---------- Step 2: K-MEANS NDVI ----------
    ndvi_masked = np.where(dem_high_mask, ndvi, np.nan)
    flat_ndvi = ndvi_masked.reshape(-1, 1)
    mask_ndvi = ~np.isnan(flat_ndvi[:, 0])
    valid_ndvi = flat_ndvi[mask_ndvi]
    ndvi_labels = np.zeros_like(flat_ndvi[:, 0], dtype=int)
    if valid_ndvi.size > 0:
        if np.unique(valid_ndvi).size < 2:
            ndvi_labels[mask_ndvi] = 0
        else:
            ndvi_labels[mask_ndvi] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_ndvi)
    ndvi_labels_img = np.full(ndvi.shape, np.nan, dtype=float)
    ndvi_labels_img_flat = ndvi_labels_img.reshape(-1)
    ndvi_labels_img_flat[mask_ndvi] = ndvi_labels[mask_ndvi]
    ndvi_labels_img = ndvi_labels_img_flat.reshape(ndvi.shape)
    low_ndvi_cluster = np.nanargmin([valid_ndvi[ndvi_labels[mask_ndvi] == i].mean() if np.any(ndvi_labels[mask_ndvi] == i) else np.inf for i in range(2)])
    ndvi_low_mask = (ndvi_labels_img == low_ndvi_cluster)

    # ---------- Step 3: K-MEANS Thermal ----------
    th_masked = np.where(ndvi_low_mask, th_resampled, np.nan)
    flat_th = th_masked.reshape(-1, 1)
    mask_th = ~np.isnan(flat_th[:, 0])
    valid_th = flat_th[mask_th]
    th_labels = np.zeros_like(flat_th[:, 0], dtype=int)
    if valid_th.size > 0:
        if np.unique(valid_th).size < 2:
            th_labels[mask_th] = 0
        else:
            th_labels[mask_th] = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(valid_th)
    th_labels_img = np.full(ndvi.shape, np.nan, dtype=float)
    th_labels_img_flat = th_labels_img.reshape(-1)
    th_labels_img_flat[mask_th] = th_labels[mask_th]
    th_labels_img = th_labels_img_flat.reshape(ndvi.shape)
    high_th_cluster = np.nanargmax([valid_th[th_labels[mask_th] == i].mean() if np.any(th_labels[mask_th] == i) else -np.inf for i in range(2)])
    th_high_mask = (th_labels_img == high_th_cluster)

    # ---------- Center of Mass ----------
    cy, cx = center_of_mass(th_high_mask.astype(np.uint8))
    cy_i, cx_i = int(round(cy)), int(round(cx))
    lon, lat = rasterio.transform.xy(transform, cy_i, cx_i)

    # True color
    true_color = create_true_color_image(sentinel_path)

    return lat, lon, true_color, (cx, cy)




