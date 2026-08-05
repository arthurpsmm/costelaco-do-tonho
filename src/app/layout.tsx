import type { Metadata } from "next";
import { Fraunces, Work_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsappFloatingButton } from "@/components/WhatsappFloatingButton";
import { restaurant } from "@/lib/data";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://costelacodotonho.com.br"),
  title: {
    default: "Costelaço do Tonho — Churrascaria em Meia Praia, Itapema",
    template: "%s · Costelaço do Tonho",
  },
  description:
    "Espeto corrido com mais de 15 cortes no almoço, buffet à vontade e rodízio de pizzas e carnes na brasa à noite. Meia Praia, Itapema - SC. Peça sua marmita pelo site.",
  keywords: [
    "churrascaria Itapema",
    "marmita Meia Praia",
    "rodízio Itapema",
    "espeto corrido Itapema",
    "restaurante Meia Praia",
    "Costelaço do Tonho",
  ],
  openGraph: {
    title: "Costelaço do Tonho — Churrascaria em Meia Praia, Itapema",
    description:
      "Espeto corrido no almoço, rodízio na brasa à noite. Peça sua marmita direto pelo site e pule a fila.",
    url: "https://costelacodotonho.com.br",
    siteName: restaurant.name,
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.fullName,
    image: "https://costelacodotonho.com.br/images/logo.png",
    telephone: restaurant.phoneDisplay,
    priceRange: restaurant.priceRange,
    servesCuisine: ["Churrascaria", "Brasileira", "Pizza"],
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.street,
      addressLocality: `${restaurant.address.neighborhood}, ${restaurant.address.city}`,
      addressRegion: restaurant.address.state,
      postalCode: restaurant.address.zip,
      addressCountry: "BR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: restaurant.rating,
      reviewCount: restaurant.reviewCount,
    },
    sameAs: [restaurant.instagram],
    url: "https://costelacodotonho.com.br",
  };

  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${workSans.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsappFloatingButton />
      </body>
    </html>
  );
}
