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
      dispatch(logoutAction());
      await AsyncStorage.removeItem("auth");
      await SecureStore.deleteItemAsync("access_token");
      // Navigate to "/" first so (tabs) is mounted in the stack,
      // then push login on top. This means router.back() from login
      // always reveals an already-rendered (tabs) — no fresh mount,
      // no white screen, for any role re-login.
      router.replace("/");
      setTimeout(() => router.push("/(auth)/login"), 50);
    }
  };

  return logout;
};
