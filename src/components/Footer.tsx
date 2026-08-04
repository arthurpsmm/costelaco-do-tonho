import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-line bg-background-raised">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <Image
            src="/images/logo.png"
            alt="Costelaço do Tonho"
            width={150}
            height={150}
            className="h-16 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-foreground-soft">
            {restaurant.tagline}
          </p>
        </div>

        <div className="font-sans text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-foreground-soft">
            Navegue
          </p>
          <ul className="space-y-2">
            <li><Link href="/cardapio" className="hover:text-brasa">Cardápio</Link></li>
            <li><Link href="/pedido/novo" className="hover:text-brasa">Pedir marmita</Link></li>
            <li><Link href="/#sobre" className="hover:text-brasa">Sobre</Link></li>
            <li><Link href="/contato" className="hover:text-brasa">Contato</Link></li>
          </ul>
        </div>

        <div className="font-sans text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-foreground-soft">
            Visite
          </p>
          <p className="text-foreground-soft">{restaurant.addressFull}</p>
          <p className="mt-2 text-foreground-soft">{restaurant.phoneDisplay}</p>
          <a
            href={restaurant.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block hover:text-brasa"
          >
            {restaurant.instagramHandle}
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-line px-5 py-5 text-center font-sans text-xs text-foreground-soft sm:flex-row sm:px-8">
        <span>© {new Date().getFullYear()} {restaurant.fullName}. Todos os direitos reservados.</span>
        <Link href="/admin/login" className="hover:text-brasa">
          Área do restaurante
        </Link>
      </div>
    </footer>
  );
}
