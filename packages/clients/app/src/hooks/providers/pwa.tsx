import { useEffect, useState } from "react";

import { useApp } from "./app";

// TODO: Debug why event listeners not working
// TODO: Cleanup functions

export type InstallState =
  | "idle"
  | "prompt"
  | "dismissed"
  | "installed"
  | "unsupported";

export const usePWA = () => {
  const { isHandheld } = useApp();

  const [deferredPrompt, setDeferredPrompt] = useState<null | boolean>(null);
  const [installState, setInstalledState] = useState<InstallState>(
    isHandheld ? "idle" : "unsupported",
  );
  const [displayMode, setDisplayMode] = useState<
    "standalone" | "browser" | "twa"
  >(getPWADisplayMode());

  function getPWADisplayMode() {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (document.referrer.startsWith("android-app://")) {
      return "twa";
    } else if ((navigator as any).standalone || isStandalone) {
      return "standalone";
    }
    return "browser";
  }

  async function handleInstallCheck(e: any) {
    console.log("Related apps:", e);

    if ("getInstalledRelatedApps" in navigator) {
      // @ts-ignore
      const relatedApps: [{ id: string }] = navigator.getInstalledRelatedApps();
      const psApp = relatedApps.find((app) => app.id === "com.example.myapp");

      console.log("Related apps:", relatedApps);

      if (psApp) {
        setInstalledState("installed");
        // Update UI as appropriate
      } else {
        setInstalledState("prompt");
      }

      //   hideInstallPromotion();
      //   // Clear the deferredPrompt so it can be garbage collected
      //   deferredPrompt = null;
      //   // Optionally, send analytics event to indicate successful install
      //   console.log('PWA was installed');
      // if (navigator.userAgent.indexOf('Mobile') === -1) {
      //     document.querySelector('link[rel="manifest"]').remove();
      //   }
    }

    return false;
  }

  function handlePromptAction(e: any) {
    setDeferredPrompt(true);

    console.log("PWA was installed", e);
  }

  useEffect(() => {
    function handleInstallPrompt(e: any) {
      e.preventDefault();

      // Activate install prompt dialog
    }

    function handleDisplayMode(e: any) {
      e.preventDefault();

      const displayMode = getPWADisplayMode();

      setDisplayMode(displayMode);
    }

    handleInstallCheck(null);

    isHandheld &&
      window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    isHandheld && window.addEventListener("appinstalled", handleInstallCheck);
    isHandheld &&
      window.addEventListener("displaymodechange", handleDisplayMode);

    return () => {
      isHandheld &&
        window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      isHandheld &&
        window.removeEventListener("appinstalled", handleInstallCheck);
      isHandheld &&
        window.removeEventListener("displaymodechange", handleDisplayMode);
    };
  }, []);

  return {
    deferredPrompt,
    installState,
    displayMode,
    handleInstallCheck,
    handlePromptAction,
  };
};

// PROMPT TO INSTALL PWA

// buttonInstall.addEventListener('click', async () => {
//   // Hide the app provided install promotion
//   hideInstallPromotion();
//   // Show the install prompt
//   deferredPrompt.prompt();
//   // Wait for the user to respond to the prompt
//   const { outcome } = await deferredPrompt.userChoice;
//   // Optionally, send analytics event with outcome of user choice
//   console.log(`User response to the install prompt: ${outcome}`);
//   // We've used the prompt, and can't use it again, throw it away
//   deferredPrompt = null;
// });

// CHECK IF PWA IS INSTALLED

// @media all and (display-mode: standalone) {
//   body {
//     background-color: yellow;
//   }
// }
