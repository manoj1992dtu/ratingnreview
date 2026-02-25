import { create } from 'zustand';

interface AuthModalStore {
  isOpen: boolean;
  pendingCallback?: () => void;
  openModal: (callback?: () => void) => void;
  closeModal: () => void;
  triggerCallback: () => void;
}

export const useAuthModal = create<AuthModalStore>((set, get) => ({
  isOpen: false,
  pendingCallback: undefined,

  openModal: (callback) =>
    set({ isOpen: true, pendingCallback: callback }),

  closeModal: () => set({ isOpen: false, pendingCallback: undefined }),

  triggerCallback: () => {
    const cb = get().pendingCallback;
    if (cb) cb();
    set({ pendingCallback: undefined });
  },
}));
