"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingDown } from "lucide-react";

export default function WeakestTopics() {
  const [items, setItems] = useState<{ topic: string; reason: string; fix: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/weakest")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.weakest ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="rounded-xl border border-grayline p-5">
      <div className="flex items-center gap-2 font-semibold mb-3">
        <TrendingDown className="w-4 h-4" />
        Weakest topics
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-graymute" />
      ) : items.length === 0 ? (
        <div className="text-sm text-graymute">Take a few mocks to see analysis.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((t, i) => (
            <li key={i}>
              <div className="font-medium">{t.topic}</div>
              <div className="text-sm text-graytext">{t.reason}</div>
              <div className="text-sm text-ink mt-1">→ {t.fix}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
