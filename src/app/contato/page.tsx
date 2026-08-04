import type { Metadata } from "next";
import { MapEmbed } from "@/components/MapEmbed";
import { restaurant } from "@/lib/data";
import { genericWhatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato e localização",
  description:
    "Endereço, telefone, horários e mapa do Costelaço do Tonho em Meia Praia, Itapema - SC.",
};

export default function ContatoPage() {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    restaurant.mapsQuery
  )}`;

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
        Fale com a gente
      </p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Contato e localização</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground-soft">Endereço</h2>
            <p className="mt-2 text-lg">{restaurant.addressFull}</p>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-sans text-sm font-semibold text-brasa hover:underline">
              Ver rotas no Google Maps →
            </a>
          </div>

          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground-soft">Horários</h2>
            <dl className="mt-2 space-y-1 text-lg">
              <div className="flex gap-3"><dt className="w-20 text-foreground-soft">Almoço</dt><dd>{restaurant.hours.lunch}</dd></div>
              <div className="flex gap-3"><dt className="w-20 text-foreground-soft">Jantar</dt><dd>{restaurant.hours.dinner}</dd></div>
              <div className="flex gap-3"><dt className="w-20 text-foreground-soft">Dias</dt><dd>{restaurant.hours.days}</dd></div>
            </dl>
          </div>

          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground-soft">Fale conosco</h2>
            <div className="mt-2 flex flex-col gap-2 text-lg">
              <a href={restaurant.phoneHref} className="hover:text-brasa">{restaurant.phoneDisplay}</a>
              <a href={genericWhatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brasa">
                WhatsApp
              </a>
              <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brasa">
                {restaurant.instagramHandle}
              </a>
            </div>
          </div>
        </div>

        <MapEmbed className="h-full min-h-[360px]" />
      </div>
    </div>
  );
}
