// app/index.tsx — fallback if "/(tabs)" is still blank
import { router } from "expo-router";
import React, { useEffect } from "react";
import ShopScreen from "./(tabs)/index";

export default function Index() {
  useEffect(() => {
    // setTimeout(0) fires AFTER requestAnimationFrame, so the
    // logout's RAF push (now removed) won't race with this.
    // The shop content prevents blank screen during the single-frame delay.
    const t = setTimeout(() => router.replace("/(tabs)"), 0);
    return () => clearTimeout(t);
  }, []);

  // Render shop content immediately — prevents blank screen for the
  // single event loop tick before the redirect fires.
  return <ShopScreen />;
}
