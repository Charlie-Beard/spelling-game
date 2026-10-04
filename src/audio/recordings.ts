/**
 * A grown-up's own recordings of the phonics sounds, kept in IndexedDB on
 * this iPad. A familiar voice saying pure sounds ("mmm", not "muh") beats
 * any synthetic voice.
 */
import { audio } from './engine';

const DB = 'wizard-words';
const STORE = 'recordings';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const decoded = new Map<string, AudioBuffer | null>();
let known: Set<string> | null = null;

export async function listRecordings(): Promise<Set<string>> {
  if (known) return known;
  try {
    const keys = await tx('readonly', (s) => s.getAllKeys());
    known = new Set(keys.map(String));
  } catch {
    known = new Set();
  }
  return known;
}

export async function getRecording(ph: string): Promise<AudioBuffer | null> {
  if (decoded.has(ph)) return decoded.get(ph)!;
  const keys = await listRecordings();
  if (!keys.has(ph)) return null;
  try {
    const blob = await tx<Blob | undefined>('readonly', (s) => s.get(ph));
    const buf = blob ? await audio().decodeAudioData(await blob.arrayBuffer()) : null;
    decoded.set(ph, buf);
    return buf;
  } catch {
    decoded.set(ph, null);
    return null;
  }
}

export async function saveRecording(ph: string, blob: Blob): Promise<void> {
  await tx('readwrite', (s) => s.put(blob, ph));
  decoded.delete(ph);
  (await listRecordings()).add(ph);
}

export async function deleteRecording(ph: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(ph));
  decoded.delete(ph);
  (await listRecordings()).delete(ph);
}
