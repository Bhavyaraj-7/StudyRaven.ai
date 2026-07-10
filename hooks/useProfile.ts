"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Profile, Subscription } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      const [{ data: p }, { data: s }] = await Promise.all([
        sb.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
        sb.from("subscriptions").select("*").eq("user_id", auth.user.id).maybeSingle(),
      ]);
      setProfile(p);
      setSubscription(s);
      setLoading(false);
    })();
  }, []);

  return { profile, subscription, loading, isPro: subscription?.plan === "pro" && subscription?.status === "active" };
}
