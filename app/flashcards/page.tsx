"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Layers, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";

interface Card {
  id: string;
  front: string;
  back: string;
  mastery_level: number;
}

const MASTERED_AT = 5;

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [masteredTotal, setMasteredTotal] = useState(0);

  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      const { data } = await sb
        .from("flashcards")
        .select("id, front, back, mastery_level")
        .eq("user_id", auth.user.id)
        .order("mastery_level", { ascending: true })
        .order("created_at", { ascending: false });
      const all = data ?? [];
      setMasteredTotal(all.filter((c) => c.mastery_level >= MASTERED_AT).length);
      // Review the weakest cards first; mastered cards sit out.
      setCards(all.filter((c) => c.mastery_level < MASTERED_AT));
      setLoading(false);
    })();
  }, []);

  async function grade(knewIt: boolean) {
    const card = cards[i];
    if (!card) return;
    const next = knewIt ? Math.min(MASTERED_AT, card.mastery_level + 1) : 0;
    const sb = supabaseBrowser();
    await sb.from("flashcards").update({ mastery_level: next }).eq("id", card.id);
    if (next >= MASTERED_AT) setMasteredTotal((m) => m + 1);
    setSessionDone((n) => n + 1);
    setFlipped(false);
    if (i + 1 >= cards.length) {
      setCards([]);
    } else {
      setI(i + 1);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Flashcards">
        <div className="flex items-center gap-2 text-graymute">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your cards...
        </div>
      </AppLayout>
    );
  }

  const card = cards[i];

  return (
    <AppLayout title="Flashcards">
      <div className="flex items-center justify-between">
        <p className="text-graytext">
          Review your saved decks. Cards you miss come back until you master them.
        </p>
        <div className="text-sm text-graymute whitespace-nowrap ml-4">
          {masteredTotal} mastered
        </div>
      </div>

      {!card ? (
        <div className="mt-16 text-center max-w-md mx-auto">
          <Layers className="w-10 h-10 mx-auto text-graymute" />
          {sessionDone > 0 ? (
            <>
              <h2 className="text-xl font-semibold mt-4">Session complete</h2>
              <p className="text-graytext mt-2">
                You reviewed {sessionDone} card{sessionDone === 1 ? "" : "s"}. Come back
                tomorrow — missed cards will be waiting.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mt-4">No cards to review</h2>
              <p className="text-graytext mt-2">
                Generate flashcards in the studio and hit &quot;Save deck for
                review&quot; to build your collection.
              </p>
            </>
          )}
          <Link
            href="/studio"
            className="inline-block mt-6 rounded-lg bg-ink text-paper px-4 py-2 text-sm"
          >
            Open studio
          </Link>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center">
          <div className="text-sm text-graymute mb-3">
            {i + 1} / {cards.length} · mastery {card.mastery_level}/{MASTERED_AT}
          </div>
          <div
            onClick={() => setFlipped((f) => !f)}
            className="w-full max-w-lg h-64 cursor-pointer"
            style={{ perspective: "1000px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${card.id}-${flipped}`}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full rounded-2xl border border-grayline bg-paper flex items-center justify-center p-8 text-center"
              >
                <p className="text-lg">{flipped ? card.back : card.front}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="mt-6 rounded-lg border border-grayline px-6 py-2.5 text-sm hover:border-ink"
            >
              Show answer
            </button>
          ) : (
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => grade(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-grayline px-5 py-2.5 text-sm hover:bg-graylite"
              >
                <RotateCcw className="w-4 h-4" /> Again
              </button>
              <button
                onClick={() => grade(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-5 py-2.5 text-sm hover:opacity-90"
              >
                <Check className="w-4 h-4" /> Knew it
              </button>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
