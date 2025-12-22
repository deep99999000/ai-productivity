import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  user: string;
  setUser: (id: string) => void;
  logout: () => void;
};

const useUser = create<UserStore>()(
  persist(
    (set) => ({
      user: "",
      setUser: (id) => set({ user: id }),
      logout: () => set({ user: "" }),
    }),
    {
      name: "user-store", // Key in localStorage
      partialize: (state) => ({ user: state.user }), // Save only user
    }
  )
);

export default useUser;
