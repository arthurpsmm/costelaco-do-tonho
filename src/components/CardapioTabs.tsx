"use client";

import { useState } from "react";
import type { MenuCategory } from "@/lib/data";

export function CardapioTabs({
  lunch,
  dinner,
}: {
  lunch: MenuCategory[];
  dinner: MenuCategory[];
}) {
  const [tab, setTab] = useState<"almoco" | "jantar">("almoco");
  const categories = tab === "almoco" ? lunch : dinner;

  return (
    <div>
      <div className="flex gap-2 rounded-full border border-line bg-card p-1 w-fit">
        <button
          onClick={() => setTab("almoco")}
          className={`rounded-full px-5 py-2 font-sans text-sm font-medium transition-colors ${
            tab === "almoco" ? "bg-brasa text-white" : "text-foreground-soft"
          }`}
        >
          Almoço
        </button>
        <button
          onClick={() => setTab("jantar")}
          className={`rounded-full px-5 py-2 font-sans text-sm font-medium transition-colors ${
            tab === "jantar" ? "bg-brasa text-white" : "text-foreground-soft"
          }`}
        >
          Jantar
        </button>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.title} className="rounded-2xl border border-brasa/25 bg-card p-6">
            <h2 className="font-display text-xl italic text-brasa">{cat.title}</h2>
            <ul className="mt-4">
              {cat.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-baseline justify-between gap-4 border-b border-dotted border-brasa/30 py-3 font-sans text-sm last:border-0"
                >
                  <span>
                    {item.name}
                    {item.description && (
                      <span className="block text-xs text-foreground-soft">{item.description}</span>
                    )}
                  </span>
                  {item.price && <span className="shrink-0 font-semibold tabular-nums text-brasa">{item.price}</span>}
                </li>
              ))}
            </ul>
            {cat.note && (
              <p className="mt-3 text-xs text-foreground-soft">{cat.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
