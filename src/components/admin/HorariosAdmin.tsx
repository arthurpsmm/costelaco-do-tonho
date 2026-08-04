"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Window = Database["public"]["Tables"]["pickup_window_templates"]["Row"];

function emptyWindow(tenantId: string): Omit<Window, "id"> {
  return {
    tenant_id: tenantId,
    start_time: "11:00",
    end_time: "11:15",
    capacity: 6,
    is_peak: false,
    sort_order: 0,
    active: true,
  };
}

export function HorariosAdmin({ tenantId, initialWindows }: { tenantId: string; initialWindows: Window[] }) {
  const [windows, setWindows] = useState<Window[]>(initialWindows);
  const [draft, setDraft] = useState<Omit<Window, "id">>(emptyWindow(tenantId));

  function update(id: string, patch: Partial<Window>) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  async function save(id: string) {
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    const supabase = createClient();
    const { id: winId, ...patch } = win;
    void winId;
    await supabase.from("pickup_window_templates").update(patch).eq("id", id);
  }

  async function remove(id: string) {
    if (!window.confirm("Remover essa janela de horário?")) return;
    const supabase = createClient();
    await supabase.from("pickup_window_templates").delete().eq("id", id);
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }

  async function add() {
    const supabase = createClient();
    const { data, error } = await supabase.from("pickup_window_templates").insert(draft).select().single();
    if (error || !data) {
      window.alert("Não consegui adicionar: " + error?.message);
      return;
    }
    setWindows((prev) => [...prev, data].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    setDraft(emptyWindow(tenantId));
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-3 py-2">Início</th>
              <th className="px-3 py-2">Fim</th>
              <th className="px-3 py-2">Vagas</th>
              <th className="px-3 py-2">Pico</th>
              <th className="px-3 py-2">Ativo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {windows.map((w) => (
              <tr key={w.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <input
                    type="time"
                    value={w.start_time.slice(0, 5)}
                    onChange={(e) => update(w.id, { start_time: e.target.value })}
                    className="rounded-lg border border-line bg-background px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="time"
                    value={w.end_time.slice(0, 5)}
                    onChange={(e) => update(w.id, { end_time: e.target.value })}
                    className="rounded-lg border border-line bg-background px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    value={w.capacity}
                    onChange={(e) => update(w.id, { capacity: Number(e.target.value) })}
                    className="w-16 rounded-lg border border-line bg-background px-2 py-1 text-sm tabular-nums"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={w.is_peak} onChange={(e) => update(w.id, { is_peak: e.target.checked })} />
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={w.active} onChange={(e) => update(w.id, { active: e.target.checked })} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => save(w.id)} className="rounded-full bg-brasa px-3 py-1 text-xs font-semibold text-white hover:bg-brasa-deep">
                      Salvar
                    </button>
                    <button onClick={() => remove(w.id)} className="rounded-full border border-line px-3 py-1 text-xs text-foreground-soft hover:border-brasa hover:text-brasa">
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-line p-4">
        <div>
          <label className="block text-xs text-foreground-soft">Início</label>
          <input type="time" value={draft.start_time} onChange={(e) => setDraft((d) => ({ ...d, start_time: e.target.value }))} className="rounded-lg border border-line bg-background px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-foreground-soft">Fim</label>
          <input type="time" value={draft.end_time} onChange={(e) => setDraft((d) => ({ ...d, end_time: e.target.value }))} className="rounded-lg border border-line bg-background px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-foreground-soft">Vagas</label>
          <input type="number" min={1} value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: Number(e.target.value) }))} className="w-16 rounded-lg border border-line bg-background px-2 py-1 text-sm" />
        </div>
        <button onClick={add} className="rounded-full bg-brasa px-4 py-2 text-xs font-semibold text-white hover:bg-brasa-deep">
          + Adicionar janela
        </button>
      </div>
    </div>
  );
}
