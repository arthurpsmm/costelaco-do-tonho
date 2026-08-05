"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/cardapio", label: "Cardápio" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 sm:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="Costelaço do Tonho"
            width={150}
            height={150}
            className="h-[6.8rem] w-auto sm:h-[8.5rem]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-sans text-sm font-medium tracking-wide transition-colors hover:text-brasa ${
                pathname === link.href ? "text-brasa" : "text-foreground-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/pedido/novo"
            className="rounded-full bg-brasa px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-brasa-deep"
          >
            Pedir marmita
          </Link>
        </nav>

        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-line md:hidden"
        >
          <span
            className={`h-[1.5px] w-5 bg-foreground transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-[1.5px] w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-[1.5px] w-5 bg-foreground transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-5 pb-4 pt-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 font-sans text-base text-foreground-soft hover:bg-background-raised"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/pedido/novo"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-brasa px-5 py-3 text-center font-sans text-base font-semibold text-white"
          >
            Pedir marmita
          </Link>
        </nav>
      )}
    </header>
  );
}
