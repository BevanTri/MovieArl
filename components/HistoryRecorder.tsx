"use client";

import { useEffect } from "react";
import { saveHistory, type HistoryItem } from "@/lib/local-store";

export default function HistoryRecorder({ item }: { item: HistoryItem }) {
  useEffect(() => {
    saveHistory(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.slug, item.se, item.ep]);

  return null;
}
