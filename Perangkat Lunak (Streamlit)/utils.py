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

    return lat, lon, ndvi, ndvi_mask, labels.reshape(ndvi.shape), create_true_color_image(image_path), (cx, cy)

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

    return lat, lon, ndvi, ndvi_mask, largest_blob_mask, create_true_color_image(image_path), (cx, cy)

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

    return lat, lon, ndvi, ndvi_mask, closest_blob_mask, create_true_color_image(image_path), (cx, cy)
