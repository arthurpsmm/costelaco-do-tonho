export const restaurant = {
  name: "Costelaço do Tonho",
  fullName: "Costelaço do Tonho & Restaurante Blumenauense",
  tagline: "Espeto corrido no almoço. Rodízio na brasa à noite.",
  phoneDisplay: "(47) 3368-7699",
  phoneHref: "tel:+554733687699",
  whatsappNumber: "5547991785297",
  address: {
    street: "Av. Nereu Ramos, 5494",
    neighborhood: "Meia Praia",
    city: "Itapema",
    state: "SC",
    zip: "88220-000",
  },
  addressFull: "Av. Nereu Ramos, 5494 - Meia Praia, Itapema - SC, 88220-000",
  mapsQuery:
    "Av. Nereu Ramos, 5494, Meia Praia, Itapema - SC, 88220-000",
  instagram: "https://www.instagram.com/costelacodotonho/",
  instagramHandle: "@costelacodotonho",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJQ82HKsqv2JQRXfdrzEZNszk",
  rating: 4.7,
  reviewCount: 4182,
  priceRange: "R$ 80–100 por pessoa",
  hours: {
    lunch: "11:00 – 14:00",
    dinner: "19:00 – 22:00",
    days: "Terça a domingo",
  },
} as const;

export const aboutParagraphs: string[] = [
  "O Costelaço do Tonho nasceu da mesma brasa que nunca apaga: um espeto corrido farto, servido sem pressa, e um rodízio de carnes e pizzas que virou programa fixo de quem mora e de quem visita Itapema.",
  "Somos o Restaurante Blumenauense também — a casa carrega influência da tradição gastronômica de Blumenau, unida ao tempero e ao ritmo de uma cidade de praia. Mais de 15 cortes de carne no espeto corrido, rodízio de pizzas com sabores exclusivos e marmitas fartas fazem parte da rotina de quem escolhe almoçar ou jantar com a gente.",
  "Hoje somos acompanhados por mais de 22 mil pessoas no Instagram e seguimos sendo, dia após dia, o lugar onde trabalhador e turista se encontram na mesma brasa — cada um no seu horário, cada um do seu jeito.",
];

// Marmitas para viagem — cardápio real, ver public/images/galeria e menu do estabelecimento
export type ProteinChoice = {
  options: string[];
  pickCount: 1 | 2;
};

export type MarmitaKind = {
  id: string;
  label: string;
  shortLabel: string;
  volume: string;
  price: number;
  base: string;
  fixedProteins?: string;
  proteinChoice?: ProteinChoice;
};

export const marmitaKinds: MarmitaKind[] = [
  {
    id: "mista",
    label: "Tipo 01 — Carne Mista",
    shortLabel: "Carne Mista",
    volume: "1.100ml",
    price: 32,
    base: "Arroz, feijão e polenta frita",
    fixedProteins: "Frango, linguiça, porco e gado",
  },
  {
    id: "so-gado",
    label: "Tipo 02 — Só Gado",
    shortLabel: "Só Gado",
    volume: "1.100ml",
    price: 39,
    base: "Arroz, feijão e polenta frita",
    proteinChoice: { options: ["Maminha", "Cupim", "Fraldinha"], pickCount: 1 },
  },
  {
    id: "duas-proteinas",
    label: "Tipo 03 — 2 Proteínas",
    shortLabel: "2 Proteínas",
    volume: "750ml",
    price: 23,
    base: "Arroz, feijão e polenta frita",
    proteinChoice: { options: ["Frango", "Gado", "Porco"], pickCount: 2 },
  },
];

export const marmitaExtra = { label: "Talheres descartáveis", price: 1 };

export const marmitaDrinks: { id: string; label: string }[] = [
  { id: "nenhuma", label: "Sem bebida" },
  { id: "coca-lata", label: "Coca-Cola lata" },
  { id: "guarana-lata", label: "Guaraná lata" },
  { id: "suco", label: "Suco natural" },
  { id: "agua", label: "Água mineral" },
];

function buildWindows(start: string, end: string, peak?: string[]) {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const windows: { id: string; label: string; peak: boolean }[] = [];

  for (let m = startMinutes; m < endMinutes; m += 15) {
    const from = formatMinutes(m);
    const to = formatMinutes(m + 15);
    windows.push({
      id: `${from}-${to}`,
      label: `${from} – ${to}`,
      peak: peak?.includes(from) ?? false,
    });
  }
  return windows;
}

function formatMinutes(total: number) {
  const h = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export const pickupWindows = buildWindows("11:00", "14:00", [
  "11:45",
  "12:00",
  "12:15",
  "12:30",
]);

export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
};

export type MenuCategory = {
  title: string;
  items: MenuItem[];
  note?: string;
};

export const lunchMenu: MenuCategory[] = [
  {
    title: "Espeto corrido",
    items: [
      { name: "15 variedades de carnes na brasa" },
      {
        name: "Guarnições à vontade",
        description: "Arroz, feijão, maionese, salada, polenta frita, banana à milanesa",
      },
      { name: "Sobremesas" },
      { name: "Segunda a sexta", price: "R$ 90,00 /pessoa" },
      { name: "Sábado, domingo e feriado", price: "R$ 110,00 /pessoa" },
    ],
    note: "Crianças de 6 a 10 anos pagam metade do valor.",
  },
  {
    title: "Marmitas para viagem",
    items: [
      {
        name: "Tipo 01 · Carne Mista",
        description: "1.100ml — frango, linguiça, porco e gado, com arroz, feijão e polenta frita",
        price: "R$ 32,00",
      },
      {
        name: "Tipo 02 · Só Gado",
        description: "1.100ml — maminha, cupim ou fraldinha, com arroz, feijão e polenta frita",
        price: "R$ 39,00",
      },
      {
        name: "Tipo 03 · 2 Proteínas",
        description: "750ml — escolha 2: frango, gado ou porco, com arroz, feijão e polenta frita",
        price: "R$ 23,00",
      },
      { name: "Talheres descartáveis", price: "R$ 1,00" },
    ],
    note: "Salada verde e maionese sempre servidas à parte.",
  },
];

export const dinnerMenu: MenuCategory[] = [
  {
    title: "Rodízio de pizzas",
    items: [
      {
        name: "Sabores tradicionais e exclusivos",
        description: "Camarão, frutos do mar, Nutella e salmão",
      },
      {
        name: "5 variedades de carnes",
        description: "Costela de gado, carne suína, maminha, frango e linguicinha",
      },
      {
        name: "Guarnições à vontade",
        description: "Arroz, feijão, maionese, fritas, salada, polenta frita",
      },
      { name: "Domingo a sexta", price: "R$ 64,90 /pessoa" },
      { name: "Sábado e feriados", price: "R$ 79,90 /pessoa" },
    ],
    note: "Crianças de 6 a 10 anos pagam metade do valor.",
  },
];
