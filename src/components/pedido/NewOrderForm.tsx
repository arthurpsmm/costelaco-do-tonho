"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/tapronto/format";
import { restaurant } from "@/lib/data";
import type { Database } from "@/lib/supabase/types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type PickupWindow = Database["public"]["Tables"]["pickup_window_templates"]["Row"] & {
  taken: number;
  remaining: number;
};

function OptionButton({
  active,
  disabled,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left font-sans text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed border-line bg-background-raised text-foreground-soft opacity-50"
          : active
            ? "border-brasa bg-brasa text-white"
            : "border-line bg-card hover:border-brasa/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function formatWindowTime(time: string) {
  return time.slice(0, 5);
}

export function NewOrderForm({
  tenantSlug,
  marmitas,
  cutlery,
  drinks,
  windows,
  pickupDate,
}: {
  tenantSlug: string;
  marmitas: MenuItem[];
  cutlery: MenuItem | null;
  drinks: MenuItem[];
  windows: PickupWindow[];
  pickupDate: string;
}) {
  const router = useRouter();
  const [marmitaId, setMarmitaId] = useState<string>(marmitas[0]?.id ?? "");
  const [proteins, setProteins] = useState<string[]>([]);
  const [wantsCutlery, setWantsCutlery] = useState(false);
  const [drinkId, setDrinkId] = useState<string | null>(drinks[0]?.id ?? null);
  const [windowId, setWindowId] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const marmita = marmitas.find((m) => m.id === marmitaId);
  const drink = drinks.find((d) => d.id === drinkId) ?? null;
  const win = windows.find((w) => w.id === windowId);

  const total = (marmita?.price_cents ?? 0) + (wantsCutlery ? (cutlery?.price_cents ?? 0) : 0);

  const needsProteinChoice = Boolean(marmita?.protein_pick_count);
  const proteinReady = !needsProteinChoice || proteins.length === marmita?.protein_pick_count;
  const isReady = Boolean(name.trim() && phone.trim() && windowId && proteinReady && marmita);

  function selectMarmita(id: string) {
    setMarmitaId(id);
    setProteins([]);
  }

  function toggleProtein(option: string) {
    if (!marmita?.protein_pick_count) return;
    const pickCount = marmita.protein_pick_count;
    setProteins((prev) => {
      if (prev.includes(option)) return prev.filter((p) => p !== option);
      if (pickCount === 1) return [option];
      if (prev.length >= pickCount) return prev;
      return [...prev, option];
    });
  }

  const proteinsLabel = marmita?.description && !needsProteinChoice
    ? marmita.description
    : proteins.length
      ? proteins.join(" + ")
      : "—";

  const canRetry = useMemo(() => !submitting, [submitting]);

  async function handleSubmit() {
    if (!isReady || !marmita) return;
    setSubmitting(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_order", {
      p_tenant_slug: tenantSlug,
      p_customer_name: name.trim(),
      p_customer_phone: phone.trim(),
      p_pickup_date: pickupDate,
      p_pickup_window_id: windowId,
      p_marmita_item_id: marmita.id,
      p_protein_choice: proteins,
      p_cutlery: wantsCutlery,
      p_drink_item_id: drink?.id ?? null,
      p_notes: notes.trim() || null,
    });

    if (error || !data || data.length === 0) {
      setErrorMsg(
        error?.message.includes("lotar")
          ? "Esse horário acabou de lotar — escolha outro."
          : "Não deu pra confirmar o pedido agora. Tenta de novo em alguns segundos."
      );
      setSubmitting(false);
      return;
    }

    const orderId = data[0].order_id;
    router.push(`/pedido/${orderId}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <section>
          <h2 className="font-display text-xl">1. Tipo de marmita</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {marmitas.map((m) => (
              <OptionButton key={m.id} active={marmitaId === m.id} onClick={() => selectMarmita(m.id)}>
                <span className="block font-semibold">{m.name}</span>
                <span className={`mt-1 block text-xs ${marmitaId === m.id ? "text-white/80" : "text-foreground-soft"}`}>
                  {m.volume_label} · {m.protein_pick_count ? `Escolha ${m.protein_pick_count}` : m.description}
                </span>
                <span className="mt-2 block tabular-nums font-medium">{formatCents(m.price_cents)}</span>
              </OptionButton>
            ))}
          </div>
        </section>

        {needsProteinChoice && marmita?.protein_options && (
          <section>
            <h2 className="font-display text-xl">
              2. Proteína{marmita.protein_pick_count === 2 ? "s" : ""}
            </h2>
            <p className="mt-1 text-sm text-foreground-soft">
              {marmita.protein_pick_count === 1 ? "Escolha um corte." : "Escolha 2 — não pode ser 2 vezes gado."}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {marmita.protein_options.map((option) => (
                <OptionButton key={option} active={proteins.includes(option)} onClick={() => toggleProtein(option)}>
                  {option}
                </OptionButton>
              ))}
            </div>
          </section>
        )}

        {cutlery && (
          <section>
            <h2 className="font-display text-xl">3. Talheres descartáveis</h2>
            <div className="mt-4 flex gap-3">
              <OptionButton active={!wantsCutlery} onClick={() => setWantsCutlery(false)} className="flex-1 text-center">
                Não preciso
              </OptionButton>
              <OptionButton active={wantsCutlery} onClick={() => setWantsCutlery(true)} className="flex-1 text-center">
                Quero (+ {formatCents(cutlery.price_cents)})
              </OptionButton>
            </div>
          </section>
        )}

        {drinks.length > 0 && (
          <section>
            <h2 className="font-display text-xl">4. Bebida</h2>
            <p className="mt-1 text-sm text-foreground-soft">Opcional — valor informado na retirada.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {drinks.map((d) => (
                <OptionButton key={d.id} active={drinkId === d.id} onClick={() => setDrinkId(d.id)}>
                  {d.name}
                </OptionButton>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl">5. Horário de retirada</h2>
          <p className="mt-1 text-sm text-foreground-soft">
            Cada horário tem vagas limitadas de verdade — quando lota, desaparece daqui.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {windows.map((w) => {
              const full = w.remaining <= 0;
              return (
                <OptionButton
                  key={w.id}
                  active={windowId === w.id}
                  disabled={full}
                  onClick={() => setWindowId(w.id)}
                  className="text-center"
                >
                  <span className="tabular-nums">
                    {formatWindowTime(w.start_time)} – {formatWindowTime(w.end_time)}
                  </span>
                  <span className={`mt-0.5 block text-[10px] uppercase tracking-wide ${windowId === w.id ? "text-white/70" : full ? "" : w.is_peak ? "text-ember" : "text-foreground-soft"}`}>
                    {full ? "lotado" : w.is_peak ? "horário de pico" : `${w.remaining} vaga${w.remaining === 1 ? "" : "s"}`}
                  </span>
                </OptionButton>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl">6. Seus dados</h2>
          <div className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-line bg-card px-4 py-3 font-sans text-sm outline-none focus:border-brasa"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Seu WhatsApp (com DDD)"
              inputMode="tel"
              className="w-full rounded-xl border border-line bg-card px-4 py-3 font-sans text-sm outline-none focus:border-brasa"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observação (opcional) — ex: sem cebola"
              rows={2}
              className="w-full resize-none rounded-xl border border-line bg-card px-4 py-3 font-sans text-sm outline-none focus:border-brasa"
            />
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-24">
        <h3 className="font-display text-lg">Resumo do pedido</h3>
        <dl className="space-y-2 font-sans text-sm text-foreground-soft">
          <div className="flex justify-between"><dt>Tipo</dt><dd className="text-foreground">{marmita?.short_name ?? "—"}</dd></div>
          <div className="flex justify-between"><dt>Proteínas</dt><dd className="text-right text-foreground">{proteinsLabel}</dd></div>
          <div className="flex justify-between"><dt>Retirada</dt><dd className="text-foreground">{win ? `${formatWindowTime(win.start_time)} – ${formatWindowTime(win.end_time)}` : "—"}</dd></div>
          {cutlery && <div className="flex justify-between"><dt>Talheres</dt><dd className="text-foreground">{wantsCutlery ? "Sim" : "Não"}</dd></div>}
          {drink && <div className="flex justify-between"><dt>Bebida</dt><dd className="text-foreground">{drink.name}</dd></div>}
        </dl>
        <div className="flex items-baseline justify-between border-t border-line pt-3 font-sans">
          <span className="text-sm font-medium">Total estimado</span>
          <span className="text-xl font-semibold tabular-nums">{formatCents(total)}</span>
        </div>

        {errorMsg && <p className="text-center text-xs text-brasa">{errorMsg}</p>}

        <button
          type="button"
          disabled={!isReady || !canRetry}
          onClick={handleSubmit}
          className={`block w-full rounded-full px-6 py-4 text-center font-sans text-base font-semibold transition-transform ${
            isReady && canRetry
              ? "bg-brasa text-white hover:scale-[1.02] hover:bg-brasa-deep"
              : "cursor-not-allowed bg-background-raised text-foreground-soft"
          }`}
        >
          {submitting ? "Confirmando..." : "Confirmar pedido"}
        </button>
        {!isReady && !errorMsg && (
          <p className="text-center text-xs text-foreground-soft">
            {!proteinReady
              ? `Escolha ${marmita?.protein_pick_count} proteína${marmita?.protein_pick_count === 2 ? "s" : ""} para continuar.`
              : "Preencha nome, WhatsApp e horário para continuar."}
          </p>
        )}
        <p className="text-center text-xs text-foreground-soft">
          Ou ligue: <a href={restaurant.phoneHref} className="font-medium text-brasa">{restaurant.phoneDisplay}</a>
        </p>
      </aside>
    </div>
  );
}
