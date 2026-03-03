'use client';

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { logout as logoutAction } from "./features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "./api/authApi";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutMutation] = useLogoutMutation();
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const logout = async () => {
    try {
      if (refreshToken) {
        await logoutMutation({ refresh_token: refreshToken }).unwrap();
      }
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      dispatch(logoutAction());
      // Clear cookies by setting an expiry date in the past
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      // Redirect to login page after logout
      router.replace('/login');
    }
  };

  return logout;
};
