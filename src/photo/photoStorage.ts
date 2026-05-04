export type FaceId = "U" | "D" | "F" | "B" | "L" | "R";

const STORAGE_PREFIX = "rubiksh.photo.";

function storageKey(face: FaceId): string {
  return `${STORAGE_PREFIX}${face}`;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getPhoto(face: FaceId): string | null {
  return getStorage()?.getItem(storageKey(face)) ?? null;
}

export function setPhoto(face: FaceId, dataUrl: string): void {
  getStorage()?.setItem(storageKey(face), dataUrl);
}

export function clearPhoto(face: FaceId): void {
  getStorage()?.removeItem(storageKey(face));
}

export function clearAllPhotos(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  for (const face of ["U", "D", "F", "B", "L", "R"] satisfies FaceId[]) {
    storage.removeItem(storageKey(face));
  }
}
