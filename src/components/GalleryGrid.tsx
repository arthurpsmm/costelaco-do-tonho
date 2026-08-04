import Image from "next/image";

const shots = [
  { src: "/images/galeria/costela-espeto.png", caption: "Costela no espeto" },
  { src: "/images/galeria/corte-picanha.png", caption: "Corte na hora" },
  { src: "/images/galeria/pizza.png", caption: "Rodízio de pizzas" },
  { src: "/images/galeria/frango-espeto.png", caption: "Espeto corrido" },
];

export function GalleryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {shots.map((shot) => (
        <div
          key={shot.src}
          className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-background-raised"
        >
          <Image
            src={shot.src}
            alt={shot.caption}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          <div className="absolute inset-0 flex items-end p-4">
            <span className="font-sans text-sm font-medium text-white drop-shadow-sm">
              {shot.caption}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
