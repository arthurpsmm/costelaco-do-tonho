"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, MenuCategory } from "@/lib/supabase/types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

const categoryLabel: Record<MenuCategory, string> = {
  marmita: "Marmitas",
  addon_cutlery: "Talheres",
  addon_drink: "Bebidas",
};

const categories: MenuCategory[] = ["marmita", "addon_cutlery", "addon_drink"];

function emptyItem(tenantId: string, category: MenuCategory): Omit<MenuItem, "id" | "created_at"> {
  return {
    tenant_id: tenantId,
    category,
    name: "",
    short_name: "",
    description: null,
    volume_label: null,
    price_cents: 0,
    protein_options: null,
    protein_pick_count: null,
    sort_order: 0,
    active: true,
  };
}

function Row({
  item,
  onChange,
  onSave,
  onDelete,
}: {
  item: MenuItem;
  onChange: (patch: Partial<MenuItem>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-line last:border-0 align-top">
      <td className="px-3 py-2">
        <input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-40 rounded-lg border border-line bg-background px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={item.short_name}
          onChange={(e) => onChange({ short_name: e.target.value })}
          className="w-28 rounded-lg border border-line bg-background px-2 py-1 text-sm"
        />
      </td>
      {item.category === "marmita" && (
        <>
          <td className="px-3 py-2">
            <input
              value={item.volume_label ?? ""}
              onChange={(e) => onChange({ volume_label: e.target.value || null })}
              className="w-20 rounded-lg border border-line bg-background px-2 py-1 text-sm"
            />
          </td>
          <td className="px-3 py-2">
            <input
              value={item.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value || null })}
              placeholder="descrição / proteínas fixas"
              className="w-44 rounded-lg border border-line bg-background px-2 py-1 text-sm"
            />
          </td>
          <td className="px-3 py-2">
            <input
              value={item.protein_options?.join(", ") ?? ""}
              onChange={(e) =>
                onChange({
                  protein_options: e.target.value.trim()
                    ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    : null,
                })
              }
              placeholder="ex: Maminha, Cupim"
              className="w-40 rounded-lg border border-line bg-background px-2 py-1 text-sm"
            />
          </td>
          <td className="px-3 py-2">
            <input
              type="number"
              min={1}
              max={2}
              value={item.protein_pick_count ?? ""}
              onChange={(e) =>
                onChange({ protein_pick_count: e.target.value ? Number(e.target.value) : null })
              }
              className="w-16 rounded-lg border border-line bg-background px-2 py-1 text-sm"
            />
          </td>
        </>
      )}
      <td className="px-3 py-2">
        <input
          type="number"
          step="0.01"
          value={(item.price_cents / 100).toFixed(2)}
          onChange={(e) => onChange({ price_cents: Math.round(Number(e.target.value) * 100) })}
          className="w-24 rounded-lg border border-line bg-background px-2 py-1 text-sm tabular-nums"
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={item.active}
          onChange={(e) => onChange({ active: e.target.checked })}
        />
      </td>
      <td className="sticky right-0 bg-card px-3 py-2 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]">
        <div className="flex gap-2">
          <button onClick={onSave} className="rounded-full bg-brasa px-3 py-1 text-xs font-semibold text-white hover:bg-brasa-deep">
            Salvar
          </button>
          <button onClick={onDelete} className="rounded-full border border-line px-3 py-1 text-xs text-foreground-soft hover:border-brasa hover:text-brasa">
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CardapioAdmin({ tenantId, initialItems }: { tenantId: string; initialItems: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [drafts, setDrafts] = useState<Record<MenuCategory, Omit<MenuItem, "id" | "created_at">>>({
    marmita: emptyItem(tenantId, "marmita"),
    addon_cutlery: emptyItem(tenantId, "addon_cutlery"),
    addon_drink: emptyItem(tenantId, "addon_drink"),
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  function updateItem(id: string, patch: Partial<MenuItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function saveItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setSavingId(id);
    const supabase = createClient();
    const { id: itemId, created_at, ...patch } = item;
    void itemId;
    void created_at;
    await supabase.from("menu_items").update(patch).eq("id", id);
    setSavingId(null);
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Excluir este item do cardápio?")) return;
    const supabase = createClient();
    await supabase.from("menu_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function addItem(category: MenuCategory) {
    const draft = drafts[category];
    if (!draft.name.trim() || !draft.short_name.trim()) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("menu_items").insert(draft).select().single();
    if (error || !data) {
      window.alert("Não consegui adicionar: " + error?.message);
      return;
    }
    setItems((prev) => [...prev, data]);
    setDrafts((prev) => ({ ...prev, [category]: emptyItem(tenantId, category) }));
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const rows = items.filter((i) => i.category === category);
        const draft = drafts[category];

        return (
          <section key={category}>
            <h2 className="font-display text-xl">{categoryLabel[category]}</h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-card">
              <table className="w-full font-sans text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground-soft">
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Nome curto</th>
                    {category === "marmita" && (
                      <>
                        <th className="px-3 py-2">Volume</th>
                        <th className="px-3 py-2">Descrição</th>
                        <th className="px-3 py-2">Opções de proteína</th>
                        <th className="px-3 py-2">Escolhe</th>
                      </>
                    )}
                    <th className="px-3 py-2">Preço (R$)</th>
                    <th className="px-3 py-2">Ativo</th>
                    <th className="sticky right-0 bg-card px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <Row
                      key={item.id}
                      item={item}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onSave={() => saveItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-line p-4">
              <div>
                <label className="block text-xs text-foreground-soft">Nome</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDrafts((p) => ({ ...p, [category]: { ...draft, name: e.target.value } }))}
                  className="w-40 rounded-lg border border-line bg-background px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-soft">Nome curto</label>
                <input
                  value={draft.short_name}
                  onChange={(e) => setDrafts((p) => ({ ...p, [category]: { ...draft, short_name: e.target.value } }))}
                  className="w-32 rounded-lg border border-line bg-background px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-soft">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={(draft.price_cents / 100).toFixed(2)}
                  onChange={(e) =>
                    setDrafts((p) => ({ ...p, [category]: { ...draft, price_cents: Math.round(Number(e.target.value) * 100) } }))
                  }
                  className="w-24 rounded-lg border border-line bg-background px-2 py-1 text-sm"
                />
              </div>
              {savingId && <span className="text-xs text-foreground-soft">Salvando...</span>}
              <button
                onClick={() => addItem(category)}
                className="rounded-full bg-brasa px-4 py-2 text-xs font-semibold text-white hover:bg-brasa-deep"
              >
                + Adicionar
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
