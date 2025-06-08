import { create } from "zustand";

type User = any;

interface AuthStore {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    isLoggedIn: boolean
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: true }),
  clearUser: () => set({ user: null, isLoggedIn: false }),
}));