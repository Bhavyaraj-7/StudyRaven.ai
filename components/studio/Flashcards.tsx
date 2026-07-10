"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Flashcards({
  cards,
}: {
  cards: { front: string; back: string }[];
}) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards?.length) return null;
  const card = cards[i];

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-graymute mb-3">
        {i + 1} / {cards.length}
      </div>
      <div
        onClick={() => setFlipped((f) => !f)}
        className="w-full max-w-lg h-64 cursor-pointer perspective"
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${i}-${flipped}`}
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
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => {
            setFlipped(false);
            setI((x) => Math.max(0, x - 1));
          }}
          className="p-2 rounded-lg border border-grayline hover:bg-graylite"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="text-sm text-graytext underline"
        >
          Tap to flip
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setI((x) => Math.min(cards.length - 1, x + 1));
          }}
          className="p-2 rounded-lg border border-grayline hover:bg-graylite"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
