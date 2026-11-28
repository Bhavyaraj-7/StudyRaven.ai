"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import WelcomeOverlay, { type WelcomeMode } from "./WelcomeOverlay";

const SEEN_KEY = "sr-welcome-film";

/** Reduced motion, Save-Data or celebrations off: show the still card. */
export function preferStill(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  try {
    return window.localStorage.getItem("sr-celebrations") === "off";
  } catch {
    return false;
  }
}

/**
 * Onboarding finishes on "?welcome=1". This tiny gate (in every app page's
 * layout) notices it, clears it from the address bar so a refresh never
 * replays, and plays the film once per device. Nothing loads otherwise.
 */
export default function WelcomeGate() {
  const [state, setState] = useState<{ name: string; subjects: string[]; mode: WelcomeMode } | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("welcome") !== "1") return;
    url.searchParams.delete("welcome");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);

    try {
      if (window.localStorage.getItem(SEEN_KEY) === "seen") return;
      window.localStorage.setItem(SEEN_KEY, "seen");
    } catch {
      // storage blocked: play it this once anyway
    }

    const mode: WelcomeMode = preferStill() ? "still" : "film";
    let cancelled = false;
    (async () => {
      const sb = supabaseBrowser();
      const {
        data: { user },
      } = await sb.auth.getUser();
      let name = "";
      let subjects: string[] = [];
      if (user) {
        const [{ data: profile }, { data: rows }] = await Promise.all([
          sb.from("profiles").select("name").eq("id", user.id).maybeSingle(),
          sb.from("subjects").select("name").eq("user_id", user.id),
        ]);
        name = profile?.name ?? "";
        subjects = (rows ?? []).map((r) => r.name as string);
      }
      if (!cancelled) setState({ name, subjects, mode });
    })().catch(() => !cancelled && setState({ name: "", subjects: [], mode }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) return null;
  return <WelcomeOverlay {...state} onClose={() => setState(null)} />;
}
