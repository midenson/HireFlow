import { create } from "zustand";

interface User {
    $id: string; // Appwrite ID for the user
    email: string;
    name?: string | null; // Name might be optional or null
    emailVerification?: boolean;
    phoneVerification?: boolean;
    // Add any other properties you actually use from the Appwrite user object,
    // such as:
    // $createdAt: string;
    // $updatedAt: string;
    // prefs: { [key: string]: any }; // If you interact with user preferences
}

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