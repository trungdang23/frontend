import { createContext } from "react";
import {
  AuthNoticeTone,
  AuthStatus,
} from "@/features/auth/session/session-types";
import { User } from "@/shared/types/user";

export type AuthContextValue = {
  status: AuthStatus;
  notice: string | null;
  noticeTone: AuthNoticeTone;
  user: User | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: {
    avatarFile?: File;
    displayName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  updateProfile: (payload: { displayName: string }) => Promise<User>;
  uploadAvatar: (file: File) => Promise<User>;
  deleteAvatar: () => Promise<User>;
  clearNotice: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
