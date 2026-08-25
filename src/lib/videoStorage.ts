// IndexedDB helper for local video showcase storage

const DB_NAME = 'cokeboys_media_db';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalVideo(id: string, fileOrBlob: Blob | File): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, id);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB save failed:', e);
    return id;
  }
}

export async function getLocalVideo(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB get failed:', e);
    return null;
  }
}

export function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))/.test(url);
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?/\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
  } catch {
    return null;
  }
}
