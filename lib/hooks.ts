import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "./api/authApi";
import { logout as logoutAction } from "./features/auth/authSlice";
import type { AppDispatch, RootState } from "./store";

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
      await AsyncStorage.removeItem("auth");
      await SecureStore.deleteItemAsync("access_token");
      router.replace("/(auth)/login");
    }
  };

  return logout;
};
