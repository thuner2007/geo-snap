import { Photo } from "@/types/photo";

// Simple global store for navigation state between tabs
class NavigationStore {
  private focusedPhoto: Photo | null = null;
  private listeners: Set<(photo: Photo | null) => void> = new Set();

  setFocusedPhoto(photo: Photo | null) {
    this.focusedPhoto = photo;
    this.notifyListeners();
  }

  getFocusedPhoto(): Photo | null {
    return this.focusedPhoto;
  }

  clearFocusedPhoto() {
    this.focusedPhoto = null;
    this.notifyListeners();
  }

  subscribe(listener: (photo: Photo | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.focusedPhoto));
  }
}

export const navigationStore = new NavigationStore();
