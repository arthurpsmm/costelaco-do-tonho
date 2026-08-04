import type { Metadata } from "next";
import Link from "next/link";
import { CardapioTabs } from "@/components/CardapioTabs";
import { lunchMenu, dinnerMenu, restaurant } from "@/lib/data";

export const metadata: Metadata = {
  title: "Cardápio",
  description:
    "Espeto corrido com mais de 15 cortes e buffet à vontade no almoço. Rodízio de pizzas e carnes na brasa no jantar. Veja o cardápio completo.",
};

export default function CardapioPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        O que sai da brasa
      </p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Cardápio</h1>
      <p className="mt-3 max-w-lg text-foreground-soft">
        {restaurant.priceRange}. Valores podem variar conforme a temporada —
        confirme pelo WhatsApp em caso de dúvida.
      </p>

      <div className="mt-10">
        <CardapioTabs lunch={lunchMenu} dinner={dinnerMenu} />
      </div>

      <div className="mt-16 rounded-2xl border border-line bg-card p-8 text-center">
        <h2 className="font-display text-2xl">Almoço com pressa?</h2>
        <p className="mt-2 text-foreground-soft">Peça sua marmita pelo site e retire no seu horário.</p>
        <Link
          href="/pedido/novo"
          className="mt-5 inline-block rounded-full bg-brasa px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-brasa-deep"
        >
          Pedir marmita
        </Link>
      </div>
    </div>
  );
}
