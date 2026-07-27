import AsyncStorage from "@react-native-async-storage/async-storage";
// Use the imperative router API instead of the useRouter() hook.
// useRouter() is a React hook that requires an active navigation context.
// When customer (tabs) screens remain mounted in the background while admin/vendor
// screens are active, calling useRouter() inside useLogout() fails with:
//   "Couldn't find a navigation context"
// The imperative `router` works anywhere without requiring a context.
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "./api/authApi";
import { logout as logoutAction } from "./features/auth/authSlice";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useLogout = () => {
  const dispatch = useAppDispatch();
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
      // Navigate while the current layout tree is still valid. Clearing auth first
      // makes the vendor/admin layout return null mid-flight, and the replace then
      // dispatches into a navigator that is being torn down.
      router.replace("/(auth)/login");

      // Search history is cleared by the auth-transition subscriber in
      // lib/store.ts, which also covers expiry-driven logout. Don't duplicate
      // it here.
      dispatch(logoutAction());
      AsyncStorage.removeItem("auth").catch(() => {});
      SecureStore.deleteItemAsync("access_token").catch(() => {});
    }
  };

  return logout;
};
