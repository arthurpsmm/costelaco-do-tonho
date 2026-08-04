import Image from "next/image";
import Link from "next/link";
import { RatingBadge } from "@/components/RatingBadge";
import { GalleryGrid } from "@/components/GalleryGrid";
import { MapEmbed } from "@/components/MapEmbed";
import { Reveal } from "@/components/Reveal";
import { restaurant, lunchMenu, dinnerMenu, aboutParagraphs } from "@/lib/data";

function MenuCard({
  category,
}: {
  category: { title: string; note?: string; items: { name: string; description?: string; price?: string }[] };
}) {
  return (
    <div className="rounded-2xl border border-brasa/25 bg-card p-6">
      <h3 className="font-display text-xl italic text-brasa">{category.title}</h3>
      <ul className="mt-4">
        {category.items.map((item) => (
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
      {category.note && <p className="mt-3 text-xs text-foreground-soft">{category.note}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1b1512] text-[#f1e8db]">
        <Image
          src="/images/galeria/costela-espeto.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-center opacity-50 blur-[2px]"
        />
        <div className="ember-texture grain absolute inset-0 bg-gradient-to-t from-[#1b1512] via-[#1b1512]/75 to-[#1b1512]/50" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-24 sm:px-8 sm:py-32">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#e2604f]">
            Meia Praia · Itapema — SC
          </p>
          <h1 className="max-w-2xl font-display text-4xl leading-[1.05] sm:text-6xl">
            Espeto corrido de dia.{" "}
            <span className="italic text-[#e2604f]">Rodízio na brasa</span> à
            noite.
          </h1>
          <p className="max-w-lg font-sans text-lg text-[#c9baa8]">
            A mesma brasa que nunca apaga — farta no almoço, generosa à noite.
            Essa é a tradição de Meia Praia.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pedido/novo"
              className="rounded-full bg-[#e2604f] px-7 py-4 text-center font-sans text-base font-semibold text-[#1b1512] transition-transform hover:scale-[1.02]"
            >
              Pedir marmita agora →
            </Link>
            <Link
              href="#sobre"
              className="rounded-full border border-white/25 px-7 py-4 text-center font-sans text-base font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              Conhecer o restaurante
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <Reveal>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
              Nossa história
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">
              A casa que virou parada certa em Meia Praia
            </h2>
            <div className="mt-5 space-y-4 text-foreground-soft">
              {aboutParagraphs.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
            <div className="mt-6">
              <RatingBadge />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/galeria/corte-picanha.png"
                alt="Corte de carne servido no Costelaço do Tonho"
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* BIFURCAÇÃO ALMOÇO / JANTAR */}
      <section className="bg-background-raised">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Reveal>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
              Duas experiências, uma casa
            </p>
            <h2 className="max-w-xl font-display text-3xl sm:text-4xl">
              Aqui do jeito que você precisar
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Reveal delay={0.05}>
              <Link
                href="/pedido/novo"
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-card p-8 transition-colors hover:border-brasa"
              >
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground-soft">
                    Está com pressa no almoço?
                  </p>
                  <h3 className="mt-3 font-display text-2xl">
                    Peça sua marmita e pule a fila
                  </h3>
                  <p className="mt-3 max-w-sm text-sm text-foreground-soft">
                    Monte seu pedido em menos de um minuto, escolha o horário
                    de retirada e receba uma senha na hora — sem fila.
                  </p>
                </div>
                <span className="mt-6 font-sans text-sm font-semibold text-brasa group-hover:underline">
                  Pedir marmita →
                </span>
              </Link>
            </Reveal>

            <Reveal delay={0.15}>
              <Link
                href="/cardapio"
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-card p-8 transition-colors hover:border-brasa"
              >
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wide text-foreground-soft">
                    Vindo curtir a noite em Itapema?
                  </p>
                  <h3 className="mt-3 font-display text-2xl">
                    Rodízio de pizzas e carnes na brasa
                  </h3>
                  <p className="mt-3 max-w-sm text-sm text-foreground-soft">
                    Sabores exclusivos de pizza, cinco variedades de carne e
                    guarnições à vontade. Veja o cardápio e planeje sua noite.
                  </p>
                </div>
                <span className="mt-6 font-sans text-sm font-semibold text-brasa group-hover:underline">
                  Ver cardápio →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRÉVIA CARDÁPIO */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
            O que sai da brasa
          </p>
          <h2 className="font-display text-3xl sm:text-4xl">Cardápio</h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {lunchMenu.map((cat, i) => (
            <Reveal key={cat.title} delay={0.05 * (i + 1)}>
              <MenuCard category={cat} />
            </Reveal>
          ))}
          {dinnerMenu.map((cat, i) => (
            <Reveal key={cat.title} delay={0.05 * (i + 3)}>
              <MenuCard category={cat} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <Link
            href="/cardapio"
            className="mt-8 inline-block font-sans text-sm font-semibold text-brasa hover:underline"
          >
            Ver cardápio completo →
          </Link>
        </Reveal>
      </section>

      {/* GALERIA */}
      <section className="bg-background-raised">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Reveal>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
              Direto da brasa
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">Galeria</h2>
            <p className="mt-2 max-w-md text-sm text-foreground-soft">
              Acompanhe o dia a dia da casa no{" "}
              <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-brasa hover:underline">
                Instagram {restaurant.instagramHandle}
              </a>.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <GalleryGrid />
          </Reveal>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brasa">
              Onde estamos
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">Meia Praia, Itapema</h2>
            <p className="mt-4 max-w-sm text-foreground-soft">{restaurant.addressFull}</p>
            <dl className="mt-6 space-y-2 font-sans text-sm">
              <div className="flex gap-2">
                <dt className="font-semibold">Almoço</dt>
                <dd className="text-foreground-soft">{restaurant.hours.lunch}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Jantar</dt>
                <dd className="text-foreground-soft">{restaurant.hours.dinner}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Dias</dt>
                <dd className="text-foreground-soft">{restaurant.hours.days}</dd>
              </div>
            </dl>
            <a
              href={restaurant.phoneHref}
              className="mt-6 inline-block font-sans text-sm font-semibold text-brasa hover:underline"
            >
              {restaurant.phoneDisplay}
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <MapEmbed className="h-full min-h-[320px]" />
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-background-raised">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-xl font-display text-3xl sm:text-4xl">
              Bateu a fome? A brasa já está acesa.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pedido/novo"
                className="rounded-full bg-brasa px-7 py-4 font-sans text-base font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brasa-deep"
              >
                Pedir marmita
              </Link>
              <Link
                href="/contato"
                className="rounded-full border border-line px-7 py-4 font-sans text-base font-medium hover:bg-background-raised"
              >
                Como chegar
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
