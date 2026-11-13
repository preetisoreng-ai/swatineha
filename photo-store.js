// Shared photo storage for index.html and settings.html.
// Photos are kept in this browser's IndexedDB as Blobs, under two records:
//   "saved" — what the home page shows
//   "draft" — unsaved edits, used only by the full-page preview (index.html?preview)
(function () {
  const DB_NAME = "swati-neha-site";
  const STORE = "photos";

  const SLOTS = [
    "hero",
    "about",
    "bridal",
    "editorial",
    "event",
    "g1",
    "g2",
    "g3",
    "g4",
    "g5",
    "g6",
    "quote",
  ];

  let dbPromise = null;
  const open = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  };

  const tx = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req && req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  };

  // Returns { slot: Blob } for the record ("saved" | "draft").
  const get = async (record) => (await tx("readonly", (s) => s.get(record))) || {};
  const put = (record, photos) => {
    const clean = {};
    SLOTS.forEach((k) => {
      if (photos[k] instanceof Blob) clean[k] = photos[k];
    });
    return tx("readwrite", (s) => s.put(clean, record));
  };
  const remove = (record) => tx("readwrite", (s) => s.delete(record));

  // Page text lives beside the photos as "text-saved" / "text-draft".
  // Only fields that differ from the built-in defaults are stored.
  const getText = async (record) => (await tx("readonly", (s) => s.get(`text-${record}`))) || {};
  const putText = (record, text, defaults = {}) => {
    const clean = {};
    Object.keys(text || {}).forEach((k) => {
      if (typeof text[k] === "string" && text[k] !== defaults[k]) clean[k] = text[k];
    });
    return tx("readwrite", (s) => s.put(clean, `text-${record}`));
  };
  const removeText = (record) => tx("readwrite", (s) => s.delete(`text-${record}`));

  // Returns { slot: objectURL } ready to drop into <img src>.
  const urls = async (record) => {
    const photos = await get(record);
    const out = {};
    Object.keys(photos).forEach((k) => {
      if (photos[k] instanceof Blob) out[k] = URL.createObjectURL(photos[k]);
    });
    return out;
  };

  // Downscale + re-encode an uploaded file so storage stays small.
  const prepare = async (file, maxEdge = 2400, quality = 0.88) => {
    if (!file || !file.type.startsWith("image/")) throw new Error("That file isn’t an image.");
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("This image couldn’t be read. Try a JPG or PNG."));
        i.src = url;
      });
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
      if (!blob) throw new Error("This image couldn’t be processed.");
      return blob;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  window.PhotoStore = { SLOTS, get, put, remove, urls, prepare, getText, putText, removeText };
})();
