import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string, user: User) => void;
  logout: () => void;
}

const cookieStorage: StateStorage = {
  getItem: (name: string) => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string) => {
    Cookies.set(name, value, { expires: 7, path: "/" });
  },
  removeItem: (name: string) => {
    Cookies.remove(name, { path: "/" });
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token: string, user: User) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
