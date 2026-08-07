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
import { useUnregisterPushTokenMutation } from "./api/notificationApi";
import { logout as logoutAction } from "./features/auth/authSlice";
import { setPushToken } from "./features/notification/notificationSlice";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [unregisterPushToken] = useUnregisterPushTokenMutation();
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const pushToken = useAppSelector((state) => state.notification.pushToken);

  const logout = async () => {
    try {
      // Unregister the push token first, while the access token is still valid -
      // once logoutAction() clears auth below, any request (including this one)
      // would be sent unauthenticated and 401. This used to happen.
      if (pushToken) {
        await unregisterPushToken({ token: pushToken }).unwrap();
      }
    } catch (err) {
      console.warn("Push token unregister failed:", err);
    }

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
      dispatch(setPushToken(null));
      AsyncStorage.removeItem("auth").catch(() => {});
      SecureStore.deleteItemAsync("access_token").catch(() => {});
    }
  };

  return logout;
};
