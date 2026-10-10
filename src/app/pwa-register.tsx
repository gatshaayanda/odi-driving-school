"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __odiInstallPrompt?: InstallPromptEvent;
  }
}

type PwaRegisterProps = { initialEmbedded: boolean; initialAndroid: boolean };

function getBrowserEnvironment() {
  if (typeof window === "undefined") return { standalone: false, android: false, embedded: false, ios: false };
  const ua = navigator.userAgent || "";
  const standalone = window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const android = /Android/i.test(ua);
  const ios = /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const embedded = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line[/]|Twitter|TikTok|Snapchat/i.test(ua) ||
    (android && /;\s*wv\)/i.test(ua));
  return { standalone, android, embedded, ios };
}

export default function PwaRegister({ initialEmbedded, initialAndroid }: PwaRegisterProps) {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [promptAvailable, setPromptAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [embedded, setEmbedded] = useState(initialEmbedded);
  const [androidEmbedded, setAndroidEmbedded] = useState(initialEmbedded && initialAndroid);
  const [iosDevice, setIosDevice] = useState(false);
  const [androidDevice, setAndroidDevice] = useState(initialAndroid);
  const [standalone, setStandalone] = useState(false);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [handoffHelpOpen, setHandoffHelpOpen] = useState(false);
  const installPrompt = useRef<InstallPromptEvent | null>(null);
  const embeddedActionRef = useRef<HTMLButtonElement | null>(null);
  const reloadForUpdate = useRef(false);

  const privateRoute = pathname === "/learner" || pathname.startsWith("/learner/") ||
    pathname === "/instructor" || pathname.startsWith("/instructor/") ||
    pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    const env = getBrowserEnvironment();
    setOffline(!navigator.onLine);
    setEmbedded((initialEmbedded || env.embedded) && !env.standalone);
    setAndroidEmbedded((initialEmbedded || env.embedded) && env.android && !env.standalone);
    setIosDevice(env.ios);
    setAndroidDevice(env.android);
    setStandalone(env.standalone);
    setInstalled(env.standalone);

    // Adopt the event captured before React hydration, if the browser emitted it early.
    if (window.__odiInstallPrompt && !env.standalone) {
      installPrompt.current = window.__odiInstallPrompt;
      setPromptAvailable(true);
    }

    let registration: ServiceWorkerRegistration | null = null;
    const online = () => { setOffline(false); setReconnecting(true); window.setTimeout(() => setReconnecting(false), 1200); };
    const offline = () => { setOffline(true); setReconnecting(false); };
    const beforeInstallPrompt = (event: Event) => {
      if (getBrowserEnvironment().standalone) return;
      event.preventDefault();
      installPrompt.current = event as InstallPromptEvent;
      window.__odiInstallPrompt = event as InstallPromptEvent;
      setPromptAvailable(true);
    };
    const appInstalled = () => {
      installPrompt.current = null;
      delete window.__odiInstallPrompt;
      setPromptAvailable(false);
      setInstalled(true);
      setStandalone(true);
      setInstallHelpOpen(false);
    };
    const inspectUpdate = () => {
      if (registration?.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting);
    };
    const controllerChanged = () => { if (reloadForUpdate.current) window.location.reload(); };
    const registerServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        registration.addEventListener("updatefound", () => {
          registration?.installing?.addEventListener("statechange", inspectUpdate);
        });
        await registration.update();
        inspectUpdate();
      } catch {
        // The public site remains usable if service-worker registration fails.
      }
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    window.addEventListener("beforeinstallprompt", beforeInstallPrompt);
    window.addEventListener("appinstalled", appInstalled);
    navigator.serviceWorker?.addEventListener("controllerchange", controllerChanged);
    void registerServiceWorker();

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.removeEventListener("beforeinstallprompt", beforeInstallPrompt);
      window.removeEventListener("appinstalled", appInstalled);
      navigator.serviceWorker?.removeEventListener("controllerchange", controllerChanged);
    };
  }, [initialAndroid, initialEmbedded]);

  useEffect(() => {
    document.body.style.overflow = embedded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [embedded]);

  useEffect(() => {
    if (!embedded) return;
    embeddedActionRef.current?.focus();
    const keepGateAccessible = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }
      if (event.key !== "Tab") return;
      const gate = document.querySelector(".pwaBrowserGate:not(.pwaInstallHelpGate)");
      if (!(gate instanceof HTMLElement)) return;
      const focusable = Array.from(gate.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepGateAccessible, true);
    return () => document.removeEventListener("keydown", keepGateAccessible, true);
  }, [embedded]);

  async function installApp() {
    const savedPrompt = installPrompt.current;
    if (!savedPrompt) {
      setInstallHelpOpen(true);
      return;
    }
    // The retained native prompt is the immediate next action from the user's click.
    try {
      await savedPrompt.prompt();
      await savedPrompt.userChoice;
    } catch {
      // If the browser rejects the prompt, explain the supported manual route instead of failing silently.
      setInstallHelpOpen(true);
    } finally {
      installPrompt.current = null;
      delete window.__odiInstallPrompt;
      setPromptAvailable(false);
    }
  }

  function openInBrowser() {
    if (androidEmbedded) {
      const url = new URL(window.location.href);
      const path = url.pathname + url.search + url.hash;
      window.location.href = "intent://" + url.host + path + "#Intent;scheme=" +
        url.protocol.replace(":", "") + ";package=com.android.chrome;end";
      return;
    }
    // iOS and other hosts provide no universal website API to force an external browser.
    setHandoffHelpOpen(true);
  }

  function applyUpdate() {
    if (!waiting) return;
    reloadForUpdate.current = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => { if (reloadForUpdate.current) window.location.reload(); }, 1800);
  }

  return (
    <>
      {embedded && !standalone && !installed && (
        <div className="pwaBrowserGate" role="dialog" aria-modal="true" aria-labelledby="odi-browser-title" aria-describedby="odi-browser-message">
          <section className="pwaBrowserCard">
            <div className="pwaBrowserIcon" aria-hidden="true">↗</div>
            <p className="pwaBrowserEyebrow">ODI DRIVING SCHOOL · BOTSWANA</p>
            <h2 id="odi-browser-title">Open Odi in your browser</h2>
            <p id="odi-browser-message">For the best way to save Odi to your home screen, open this same page in your phone&apos;s normal browser.</p>
            {androidEmbedded ? (
              <>
                <button ref={embeddedActionRef} className="pwaBrowserPrimary" type="button" onClick={openInBrowser}>OPEN IN CHROME ↗</button>
                <p className="pwaBrowserHint">We&apos;ll ask Android to open this exact Odi page in Chrome, including the page you came to.</p>
              </>
            ) : (
              <>
                <button ref={embeddedActionRef} className="pwaBrowserPrimary" type="button" onClick={openInBrowser}>OPEN IN BROWSER ↗</button>
                {handoffHelpOpen && <div className="pwaBrowserSteps" role="status" aria-live="polite">
                  <strong>Use this app&apos;s browser menu</strong>
                  <p>Tap this app&apos;s <b>⋯</b> menu or <b>Share</b>, then choose <b>Open in browser</b>, <b>Open in Safari</b>, or <b>Open in Chrome</b>. Some apps do not allow a website to launch the external browser directly.</p>
                </div>}
              </>
            )}
          </section>
        </div>
      )}

      {offline && <div className="offlineBanner" role="status" aria-live="polite">Offline: previously loaded public Odi pages may remain available.</div>}
      {!offline && reconnecting && <div className="offlineBanner" role="status" aria-live="polite">Connection restored.</div>}

      {!privateRoute && !standalone && !installed && !embedded && (
        <button className="pwaInstall" type="button" onClick={() => void installApp()}>Install Odi Driving School ↓</button>
      )}

      {installHelpOpen && !embedded && !standalone && !installed && !privateRoute && (
        <div className="pwaBrowserGate pwaInstallHelpGate" role="dialog" aria-modal="true" aria-labelledby="odi-install-title" aria-describedby="odi-install-message">
          <section className="pwaBrowserCard">
            <button className="pwaClose" type="button" onClick={() => setInstallHelpOpen(false)} aria-label="Close install instructions">×</button>
            <div className="pwaBrowserIcon" aria-hidden="true">⌂</div>
            <p className="pwaBrowserEyebrow">YOUR SHORTCUT TO ODI</p>
            <h2 id="odi-install-title">Add Odi to your home screen</h2>
            <p id="odi-install-message">Installing keeps Odi one tap away when you want to return to your driving lessons or send an enquiry. Your browser controls whether one-tap installation is available.</p>
            {iosDevice ? (
              <div className="pwaBrowserSteps"><strong>On iPhone or iPad</strong><p>Open this page in Safari, tap <b>Share</b>, then choose <b>Add to Home Screen</b> and confirm <b>Add</b>.</p></div>
            ) : androidDevice ? (
              <div className="pwaBrowserSteps"><strong>On Android</strong><p>In Chrome, tap the <b>⋮</b> menu and choose <b>Install app</b> or <b>Add to Home screen</b>. The wording depends on your Chrome version and whether installation is available.</p></div>
            ) : (
              <div className="pwaBrowserSteps"><strong>On a computer</strong><p>In Chrome or Edge, open the browser menu and look for <b>Install Odi Driving School</b> or <b>Install page as app</b>, if offered.</p></div>
            )}
            <button className="pwaBrowserSecondary" type="button" onClick={() => setInstallHelpOpen(false)}>Continue using the website</button>
          </section>
        </div>
      )}

      {waiting && <div className="pwaUpdate" role="status" aria-live="polite"><div><strong>Odi update ready</strong><span>Refresh to use the latest version.</span></div><button type="button" onClick={applyUpdate}>Refresh</button></div>}
    </>
  );
}
