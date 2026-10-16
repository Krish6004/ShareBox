/**
 * ShareBox Local Storage & Future Backend Sync Service
 *
 * Persists user uploads locally in the browser until an authenticated
 * user backend endpoint (/api/user/uploads) is introduced.
 * Designed to seamlessly swap storage adapters without breaking UI components.
 */

const STORAGE_KEY = 'sharebox_uploads_v1';
const UPDATE_EVENT = 'sharebox_uploads_updated';

// Helper to determine file category
export function getFileCategory(fileName = '', mimeType = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const type = mimeType.toLowerCase();

  if (
    type.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp'].includes(ext)
  ) {
    return 'image';
  }
  if (
    type.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'avi'].includes(ext)
  ) {
    return 'video';
  }
  if (type === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    ext === 'zip' ||
    ext === 'rar' ||
    ext === 'tar' ||
    ext === 'gz' ||
    ext === '7z' ||
    type.includes('zip') ||
    type.includes('compressed') ||
    type.includes('tar')
  ) {
    return 'zip';
  }
  return 'other';
}

// Format bytes into human-readable string
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0.00 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formatted = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${formatted} ${units[i] || 'MB'}`;
}

// Compute human relative time or countdown
export function getExpiryCountdown(expiresAt) {
  if (!expiresAt) return { isExpired: false, label: '24h remaining', progress: 100 };
  
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return { isExpired: true, label: 'Expired', progress: 0 };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // 24 hour total window (24 * 3600 * 1000 ms)
  const totalWindow = 24 * 60 * 60 * 1000;
  const progress = Math.max(0, Math.min(100, Math.round((diffMs / totalWindow) * 100)));

  if (hours > 0) {
    return { isExpired: false, label: `${hours}h ${minutes}m left`, progress, hours, minutes, seconds };
  }
  return { isExpired: false, label: `${minutes}m ${seconds}s left`, progress, hours, minutes, seconds };
}

// Format timestamp
export function formatUploadDate(isoString) {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recent';
  }
}

/**
 * Retrieve all stored uploads with active calculated fields
 */
export function getUploads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => {
      const countdown = getExpiryCountdown(item.expiresAt);
      return {
        ...item,
        status: countdown.isExpired ? 'expired' : 'active',
        isExpired: countdown.isExpired,
        remainingLabel: countdown.label,
        ttlProgress: countdown.progress,
      };
    });
  } catch (err) {
    console.error('Failed to read uploads from localStorage:', err);
    return [];
  }
}

/**
 * Save an uploaded file record
 */
export function saveUpload({
  fileLink,
  fileName,
  fileSize,
  fileType,
  uuid,
  cloudLink,
  downloadLink,
}) {
  try {
    const resolvedUuid =
      uuid ||
      (fileLink ? fileLink.split('/').filter(Boolean).pop() : Math.random().toString(36).slice(2, 10));

    const existing = getUploads();
    
    // Check if already saved (avoid duplicates)
    const existingIndex = existing.findIndex((item) => item.uuid === resolvedUuid);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const category = getFileCategory(fileName, fileType);

    const newRecord = {
      id: resolvedUuid,
      uuid: resolvedUuid,
      fileName: fileName || 'Uploaded File',
      fileSize: fileSize || 0,
      fileType: fileType || 'application/octet-stream',
      category,
      fileLink: fileLink || `${window.location.origin}/download/${resolvedUuid}`,
      cloudLink: cloudLink || '',
      downloadLink: downloadLink || '',
      uploadedAt: now.toISOString(),
      expiresAt,
      downloadCount: existingIndex >= 0 ? existing[existingIndex].downloadCount : 0,
      storageProvider: 'Cloudinary',
      database: 'MongoDB Atlas',
      qrGenerated: true,
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...existing];
      updatedList[existingIndex] = { ...existing[existingIndex], ...newRecord };
    } else {
      updatedList = [newRecord, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { action: 'save', item: newRecord } }));

    return newRecord;
  } catch (err) {
    console.error('Failed to save upload to localStorage:', err);
    return null;
  }
}

/**
 * Delete a specific upload record by UUID
 */
export function deleteUpload(uuid) {
  try {
    const existing = getUploads();
    const filtered = existing.filter((item) => item.uuid !== uuid);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { action: 'delete', uuid } }));
    return true;
  } catch (err) {
    console.error('Failed to delete upload from localStorage:', err);
    return false;
  }
}

/**
 * Increment download/open count for analytics
 */
export function incrementDownloadCount(uuid) {
  try {
    const existing = getUploads();
    const target = existing.find((item) => item.uuid === uuid);
    if (target) {
      target.downloadCount = (target.downloadCount || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { action: 'increment', uuid } }));
    }
  } catch (err) {
    console.error('Failed to increment download count:', err);
  }
}

/**
 * Clear all uploads from storage
 */
export function clearAllUploads() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { action: 'clear' } }));
    return true;
  } catch (err) {
    console.error('Failed to clear uploads:', err);
    return false;
  }
}

/**
 * Seed realistic starter uploads for demonstration/quick testing
 */
export function seedSampleUploads() {
  const samples = [
    {
      id: 'd9e8f7a1',
      uuid: 'd9e8f7a1',
      fileName: 'Quarterly_Brand_Identity_2026.pdf',
      fileSize: 4.8 * 1024 * 1024,
      fileType: 'application/pdf',
      category: 'pdf',
      fileLink: `${window.location.origin}/download/d9e8f7a1`,
      uploadedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
      downloadCount: 7,
      storageProvider: 'Cloudinary',
      database: 'MongoDB Atlas',
      qrGenerated: true,
    },
    {
      id: 'b4c3a210',
      uuid: 'b4c3a210',
      fileName: 'hero_product_showcase_4k.mp4',
      fileSize: 18.2 * 1024 * 1024,
      fileType: 'video/mp4',
      category: 'video',
      fileLink: `${window.location.origin}/download/b4c3a210`,
      uploadedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 19 * 3600 * 1000).toISOString(),
      downloadCount: 14,
      storageProvider: 'Cloudinary',
      database: 'MongoDB Atlas',
      qrGenerated: true,
    },
    {
      id: 'f1e2d3c4',
      uuid: 'f1e2d3c4',
      fileName: 'Figma_Design_Tokens_v2.zip',
      fileSize: 12.5 * 1024 * 1024,
      fileType: 'application/zip',
      category: 'zip',
      fileLink: `${window.location.origin}/download/f1e2d3c4`,
      uploadedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
      downloadCount: 3,
      storageProvider: 'Cloudinary',
      database: 'MongoDB Atlas',
      qrGenerated: true,
    },
    {
      id: '8a9b0c1d',
      uuid: '8a9b0c1d',
      fileName: 'avatar_isometric_vector.png',
      fileSize: 1.1 * 1024 * 1024,
      fileType: 'image/png',
      category: 'image',
      fileLink: `${window.location.origin}/download/8a9b0c1d`,
      uploadedAt: new Date(Date.now() - 23.5 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 0.5 * 3600 * 1000).toISOString(),
      downloadCount: 22,
      storageProvider: 'Cloudinary',
      database: 'MongoDB Atlas',
      qrGenerated: true,
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { action: 'seed' } }));
  return samples;
}

export { UPDATE_EVENT };
